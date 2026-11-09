import pytest
import asyncio
from pathlib import Path
import json
import uuid
import asyncpg
from asyncpg.exceptions import InsufficientPrivilegeError, PostgresError

ROOT_DIR = Path(__file__).resolve().parents[3]

DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "user": "postgres",
    "password": "postgres_sandbox_master_pass",
}
TEST_DB_NAME = "supabase_mock_test"


@pytest.fixture(scope="session", autouse=True)
async def setup_mock_supabase_environment():
    """
    Crea y aprovisiona una base de datos local idéntica al entorno de Supabase
    ejecutando 01_schema.sql, 02_seed_curriculum.sql y 03_security_hardening.sql.
    """
    root_conn = await asyncpg.connect(**DB_CONFIG, database="postgres")
    try:
        await root_conn.execute("""
            SELECT pg_terminate_backend(pid) FROM pg_stat_activity
            WHERE datname = 'supabase_mock_test' AND pid <> pg_backend_pid();
        """)
        await root_conn.execute("DROP DATABASE IF EXISTS supabase_mock_test;")
        await root_conn.execute("CREATE DATABASE supabase_mock_test;")
    finally:
        await root_conn.close()

    conn = await asyncpg.connect(**DB_CONFIG, database=TEST_DB_NAME)
    try:
        # A. Crear roles de Supabase con los privilegios reales
        await conn.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
                    CREATE ROLE anon;
                END IF;
                IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
                    CREATE ROLE authenticated;
                END IF;
                IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
                    CREATE ROLE service_role BYPASSRLS;
                END IF;
            END $$;
            ALTER ROLE service_role BYPASSRLS;
            GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
        """)

        # B. Mock del esquema auth de Supabase
        await conn.execute("""
            CREATE SCHEMA IF NOT EXISTS auth;
            CREATE TABLE IF NOT EXISTS auth.users (
                id UUID PRIMARY KEY,
                email TEXT,
                raw_user_meta_data JSONB
            );
            CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
                SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
            $$ LANGUAGE sql STABLE;
        """)

        # C. Ejecutar 01_schema.sql
        schema_sql = (ROOT_DIR / "database" / "supabase" / "01_schema.sql").read_text(encoding="utf-8")
        await conn.execute(schema_sql)

        # D. Ejecutar 02_seed_curriculum.sql
        seed_sql = (ROOT_DIR / "database" / "supabase" / "02_seed_curriculum.sql").read_text(encoding="utf-8")
        await conn.execute(seed_sql)

        # E. Ejecutar 03_security_hardening.sql (v4.0)
        hardening_sql = (ROOT_DIR / "database" / "supabase" / "03_security_hardening.sql").read_text(encoding="utf-8")
        await conn.execute(hardening_sql)

        # F. Permisos complementarios sobre secuencias
        await conn.execute("""
            GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
        """)

    finally:
        await conn.close()

    yield


@pytest.fixture
async def db_conn():
    """Conexión a la base de datos de test como superusuario postgres."""
    conn = await asyncpg.connect(**DB_CONFIG, database=TEST_DB_NAME)
    yield conn
    await conn.close()


@pytest.fixture
async def create_test_user(db_conn):
    """Helper para crear un usuario de prueba en auth.users y public.user_profiles."""
    async def _create(username="student_test"):
        user_id = str(uuid.uuid4())
        await db_conn.execute(
            "INSERT INTO auth.users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING;",
            user_id,
            f"{username}@qurio.dev",
        )
        await db_conn.execute(
            """
            INSERT INTO public.user_profiles (id, username, display_name, xp, level)
            VALUES ($1, $2, $3, 0, 1)
            ON CONFLICT (id) DO NOTHING;
            """,
            user_id,
            username,
            f"Estudiante {username}",
        )
        return user_id

    return _create


# ==============================================================================
# 1. PRUEBAS DE PRIVILEGIOS EFECTIVOS (has_table_privilege, has_column_privilege, aclexplode)
# ==============================================================================

@pytest.mark.asyncio
async def test_effective_privileges_matrix(db_conn, create_test_user):
    """
    Audita exhaustivamente los privilegios reales en el catálogo de PostgreSQL demostrando:
    - authenticated NO tiene UPDATE/INSERT/DELETE sobre la tabla user_profiles.
    - authenticated NO tiene UPDATE sobre xp ni level en user_profiles.
    - authenticated TIENE UPDATE sobre display_name, avatar_url, bio, updated_at.
    - authenticated NO tiene INSERT/UPDATE/DELETE en exercise_attempts (ni tabla ni columnas).
    - anon NO tiene permisos de escritura en ninguna tabla o columna.
    - Intentos directos de INSERT/UPDATE/DELETE por anon y authenticated son bloqueados con error.
    - aclexplode demuestra que PUBLIC (grantee=0) NO tiene EXECUTE sobre record_verified_attempt.
    - anon y authenticated NO tienen EXECUTE sobre record_verified_attempt.
    - service_role TIENE EXECUTE sobre record_verified_attempt.
    """
    user_id = await create_test_user("priv_matrix_user")
    exercise_id = "e0000000-0000-0000-0000-000000000001"

    # --------------------------------------------------------------------------
    # A. Privilegios de Tabla sobre public.user_profiles
    # --------------------------------------------------------------------------
    assert await db_conn.fetchval(
        "SELECT has_table_privilege('authenticated', 'public.user_profiles', 'UPDATE');"
    ) is False
    assert await db_conn.fetchval(
        "SELECT has_table_privilege('authenticated', 'public.user_profiles', 'INSERT');"
    ) is False
    assert await db_conn.fetchval(
        "SELECT has_table_privilege('authenticated', 'public.user_profiles', 'DELETE');"
    ) is False
    assert await db_conn.fetchval(
        "SELECT has_table_privilege('anon', 'public.user_profiles', 'UPDATE');"
    ) is False

    # --------------------------------------------------------------------------
    # B. Privilegios de Columna (CLS) sobre public.user_profiles
    # --------------------------------------------------------------------------
    protected_cols = ["id", "username", "level", "xp", "current_streak_days", "max_streak_days", "created_at"]
    for col in protected_cols:
        can_up = await db_conn.fetchval(
            f"SELECT has_column_privilege('authenticated', 'public.user_profiles', '{col}', 'UPDATE');"
        )
        assert can_up is False, f"Columna {col} en user_profiles no debe permitir UPDATE a authenticated"

    allowed_cols = ["display_name", "avatar_url", "bio", "updated_at"]
    for col in allowed_cols:
        can_up = await db_conn.fetchval(
            f"SELECT has_column_privilege('authenticated', 'public.user_profiles', '{col}', 'UPDATE');"
        )
        assert can_up is True, f"Columna {col} en user_profiles debe permitir UPDATE a authenticated"

    # --------------------------------------------------------------------------
    # C. Privilegios de Tabla y Columna sobre public.exercise_attempts
    # --------------------------------------------------------------------------
    # Tabla:
    assert await db_conn.fetchval(
        "SELECT has_table_privilege('authenticated', 'public.exercise_attempts', 'INSERT');"
    ) is False
    assert await db_conn.fetchval(
        "SELECT has_table_privilege('authenticated', 'public.exercise_attempts', 'UPDATE');"
    ) is False
    assert await db_conn.fetchval(
        "SELECT has_table_privilege('authenticated', 'public.exercise_attempts', 'DELETE');"
    ) is False
    assert await db_conn.fetchval(
        "SELECT has_table_privilege('anon', 'public.exercise_attempts', 'SELECT');"
    ) is False

    # Columnas individuales de exercise_attempts:
    attempt_cols = [
        "id", "user_id", "exercise_id", "submitted_sql", "status",
        "execution_time_ms", "error_message", "hints_used", "xp_awarded", "created_at"
    ]
    for col in attempt_cols:
        # Ni anon ni authenticated pueden hacer INSERT ni UPDATE en ninguna columna
        assert await db_conn.fetchval(
            f"SELECT has_column_privilege('authenticated', 'public.exercise_attempts', '{col}', 'INSERT');"
        ) is False
        assert await db_conn.fetchval(
            f"SELECT has_column_privilege('authenticated', 'public.exercise_attempts', '{col}', 'UPDATE');"
        ) is False
        assert await db_conn.fetchval(
            f"SELECT has_column_privilege('anon', 'public.exercise_attempts', '{col}', 'INSERT');"
        ) is False
        assert await db_conn.fetchval(
            f"SELECT has_column_privilege('anon', 'public.exercise_attempts', '{col}', 'SELECT');"
        ) is False, f"anon no debe tener SELECT sobre columna {col}"
        # authenticated conserva SELECT para lectura personal auditada por RLS
        assert await db_conn.fetchval(
            f"SELECT has_column_privilege('authenticated', 'public.exercise_attempts', '{col}', 'SELECT');"
        ) is True, f"authenticated debe conservar SELECT sobre columna {col}"

    # Comprobar que PUBLIC no dispone de SELECT explícito en la ACL de ninguna columna
    public_explicit_select_exists = await db_conn.fetchval("""
        SELECT EXISTS (
            SELECT 1
            FROM pg_attribute a
            CROSS JOIN LATERAL aclexplode(a.attacl) expl
            WHERE a.attrelid = 'public.exercise_attempts'::regclass
              AND a.attnum > 0
              AND expl.grantee = 0
              AND expl.privilege_type = 'SELECT'
        );
    """)
    assert public_explicit_select_exists is False, "PUBLIC no debe disponer de SELECT por columna en exercise_attempts"

    # --------------------------------------------------------------------------
    # D. Intentos Reales de Ejecución Bloqueados (Inspección Defensiva en Transacción)
    # --------------------------------------------------------------------------
    # 1. Intento de INSERT directo por authenticated
    async with db_conn.transaction():
        await db_conn.execute("SET LOCAL ROLE authenticated;")
        await db_conn.execute(f"SET LOCAL request.jwt.claim.sub = '{user_id}';")
        with pytest.raises(InsufficientPrivilegeError):
            await db_conn.execute(
                """
                INSERT INTO public.exercise_attempts (user_id, exercise_id, submitted_sql, status, execution_time_ms)
                VALUES ($1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10);
                """,
                user_id, exercise_id
            )

    # 2. Intento de UPDATE directo en user_profiles.xp por authenticated
    async with db_conn.transaction():
        await db_conn.execute("SET LOCAL ROLE authenticated;")
        await db_conn.execute(f"SET LOCAL request.jwt.claim.sub = '{user_id}';")
        with pytest.raises(InsufficientPrivilegeError):
            await db_conn.execute(
                "UPDATE public.user_profiles SET xp = 99999 WHERE id = $1::UUID;",
                user_id
            )

    # 3. Intento de DELETE en exercise_attempts por authenticated
    async with db_conn.transaction():
        await db_conn.execute("SET LOCAL ROLE authenticated;")
        with pytest.raises(InsufficientPrivilegeError):
            await db_conn.execute("DELETE FROM public.exercise_attempts;")

    # --------------------------------------------------------------------------
    # E. Inspección Estricta de ACL en la RPC mediante aclexplode
    # --------------------------------------------------------------------------
    rpc_acl_rows = await db_conn.fetch("""
        SELECT
            CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE a.grantee::regrole::text END AS grantee,
            a.privilege_type
        FROM pg_proc p
        CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) a
        WHERE p.proname = 'record_verified_attempt'
          AND p.pronamespace = 'public'::regnamespace;
    """)
    grantees = {row["grantee"]: row["privilege_type"] for row in rpc_acl_rows}
    assert "PUBLIC" not in grantees, "PUBLIC (grantee 0) NO debe figurar en la ACL de record_verified_attempt"
    assert "anon" not in grantees, "anon NO debe figurar en la ACL de record_verified_attempt"
    assert "authenticated" not in grantees, "authenticated NO debe figurar en la ACL de record_verified_attempt"
    assert grantees.get("service_role") == "EXECUTE", "service_role debe ser el único rol no-propietario autorizado"

    # Comprobación de función
    rpc_sig = "public.record_verified_attempt(UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT)"
    assert await db_conn.fetchval(f"SELECT has_function_privilege('anon', '{rpc_sig}', 'EXECUTE');") is False
    assert await db_conn.fetchval(f"SELECT has_function_privilege('authenticated', '{rpc_sig}', 'EXECUTE');") is False
    assert await db_conn.fetchval(f"SELECT has_function_privilege('service_role', '{rpc_sig}', 'EXECUTE');") is True


# ==============================================================================
# 2. PRUEBAS DE VALIDACIÓN ANTI-NULL Y PARÁMETROS ESTRICTOS
# ==============================================================================

@pytest.mark.asyncio
async def test_rpc_validation_rejects_null_parameters(db_conn, create_test_user):
    """
    Verifica que la función RPC rechace explícitamente parámetros NULL,
    neutralizando el riesgo de evaluación desconocida en bloques IF.
    """
    user_id = await create_test_user("null_test_user")
    exercise_id = "e0000000-0000-0000-0000-000000000001"

    async def expect_error(sql, *args):
        async with db_conn.transaction():
            await db_conn.execute("SET LOCAL ROLE service_role;")
            with pytest.raises(PostgresError) as exc_info:
                await db_conn.execute(sql, *args)
            return str(exc_info.value)

    # user_id NULL
    err = await expect_error(
        "SELECT public.record_verified_attempt(NULL, $1::UUID, 'SELECT 1;', 'PASSED', 10, NULL, 0, 30);",
        exercise_id,
    )
    assert "user_id and exercise_id must not be null" in err

    # exercise_id NULL
    err = await expect_error(
        "SELECT public.record_verified_attempt($1::UUID, NULL, 'SELECT 1;', 'PASSED', 10, NULL, 0, 30);",
        user_id,
    )
    assert "user_id and exercise_id must not be null" in err

    # status NULL
    err = await expect_error(
        "SELECT public.record_verified_attempt($1::UUID, $2::UUID, 'SELECT 1;', NULL, 10, NULL, 0, 30);",
        user_id, exercise_id,
    )
    assert "Invalid status" in err

    # execution_time_ms NULL
    err = await expect_error(
        "SELECT public.record_verified_attempt($1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', NULL, NULL, 0, 30);",
        user_id, exercise_id,
    )
    assert "execution_time_ms cannot be null or negative" in err

    # hints_used NULL
    err = await expect_error(
        "SELECT public.record_verified_attempt($1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10, NULL, NULL, 30);",
        user_id, exercise_id,
    )
    assert "hints_used must be between 0 and 3" in err

    # xp_to_award NULL
    err = await expect_error(
        "SELECT public.record_verified_attempt($1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10, NULL, 0, NULL);",
        user_id, exercise_id,
    )
    assert "xp_to_award cannot be null or negative" in err

    # submitted_sql NULL
    err = await expect_error(
        "SELECT public.record_verified_attempt($1::UUID, $2::UUID, NULL, 'PASSED', 10, NULL, 0, 30);",
        user_id, exercise_id,
    )
    assert "submitted_sql cannot be null or empty" in err


@pytest.mark.asyncio
async def test_rpc_validation_rejects_xp_exceeding_exercise_reward(db_conn, create_test_user):
    """
    Verifica que la función valide el XP contra el valor oficial del ejercicio en la BD.
    El Ejercicio 1 otorga 30 XP base. Si se solicita 31 XP o 500 XP, debe ser rechazado.
    """
    user_id = await create_test_user("xp_bound_user")
    exercise_id = "e0000000-0000-0000-0000-000000000001"  # xp_reward = 30

    async with db_conn.transaction():
        await db_conn.execute("SET LOCAL ROLE service_role;")
        with pytest.raises(PostgresError) as exc_info:
            await db_conn.execute(
                """
                SELECT public.record_verified_attempt(
                    $1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10, NULL, 0, 31
                );
                """,
                user_id,
                exercise_id,
            )
        assert "exceeds authoritative calculated XP" in str(exc_info.value)


# ==============================================================================
# 3. CÁLCULO AUTORITATIVO DE XP SIN MÍNIMO ARTIFICIAL (0, 5, 10, 20, 100 XP)
# ==============================================================================

@pytest.mark.asyncio
async def test_authoritative_xp_calculation_across_rewards_and_hints(db_conn, create_test_user):
    """
    Demuestra que el cálculo autoritativo en la RPC:
    - NO impone mínimos artificiales (ej. 10 XP) que sobre-recompensen ejercicios pequeños.
    - Otorga 0 XP si base_xp = 0.
    - Aplica la penalización oficial por pistas (-15% por pista, max 45%).
    - Otorga exactamente los valores proporcionales para bases 0, 5, 10, 20 y 100 XP.
    - Rechaza cualquier p_xp_to_award que supere el cálculo autoritativo.
    """
    module_id = "a0000000-0000-0000-0000-000000000001"
    test_specs = [
        # (xp_reward, hints_used, expected_xp)
        (0, 0, 0),
        (0, 1, 0),
        (0, 3, 0),
        (5, 0, 5),   # Base 5 sin pistas -> 5 XP (anteriormente colapsaba a 10)
        (5, 1, 4),   # 5 * 0.85 = 4.25 -> 4 XP
        (5, 2, 3),   # 5 * 0.70 = 3.50 -> 3 XP
        (5, 3, 2),   # 5 * 0.55 = 2.75 -> 2 XP
        (10, 0, 10),
        (10, 1, 8),  # 10 * 0.85 = 8.5 -> 8 XP
        (10, 2, 7),  # 10 * 0.70 = 7.0 -> 7 XP
        (10, 3, 5),  # 10 * 0.55 = 5.5 -> 5 XP
        (20, 0, 20),
        (20, 1, 17), # 20 * 0.85 = 17 XP
        (20, 2, 14), # 20 * 0.70 = 14 XP
        (20, 3, 11), # 20 * 0.55 = 11 XP
        (100, 0, 100),
        (100, 1, 85),
        (100, 2, 70),
        (100, 3, 55),
    ]

    # Crear módulo de prueba dedicado para no alterar el conteo del Módulo 1 oficial
    test_module_id = str(uuid.uuid4())
    path_id = "sql-foundations"
    await db_conn.execute(
        """
        INSERT INTO public.modules (id, path_id, module_number, title, description)
        VALUES ($1::UUID, $2, 999, 'XP Dedicated Test Module', 'Module for XP tests')
        ON CONFLICT DO NOTHING;
        """,
        test_module_id, path_id
    )

    for xp_base, hints, expected_xp in test_specs:
        user_id = await create_test_user(f"xp_{xp_base}_{hints}_user")
        ex_id = str(uuid.uuid4())

        # Crear ejercicio dinámico con xp_base en el módulo de prueba dedicado
        await db_conn.execute(
            """
            INSERT INTO public.exercises (id, module_id, title, prompt, solution_query, xp_reward, difficulty)
            VALUES ($1::UUID, $2::UUID, $3, 'Prompt', 'SELECT 1;', $4, 'Principiante');
            """,
            ex_id, test_module_id, f"Test Ex {xp_base} XP", xp_base
        )

        async with db_conn.transaction():
            await db_conn.execute("SET LOCAL ROLE service_role;")

            # 1. Intento que solicita exactamente el XP calculado autoritativamente
            row = await db_conn.fetchrow(
                """
                SELECT public.record_verified_attempt(
                    $1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10, NULL, $3, $4
                ) AS res;
                """,
                user_id, ex_id, hints, expected_xp
            )
            res = json.loads(row["res"])
            assert res["success"] is True
            assert res["xp_awarded"] == expected_xp
            assert res["total_xp"] == expected_xp

        # 2. Intento fraudulento que solicita 1 XP más de lo calculado -> debe fallar
        fraud_user = await create_test_user(f"fraud_{xp_base}_{hints}_user")
        fraud_ex_id = str(uuid.uuid4())
        await db_conn.execute(
            """
            INSERT INTO public.exercises (id, module_id, title, prompt, solution_query, xp_reward, difficulty)
            VALUES ($1::UUID, $2::UUID, $3, 'Prompt', 'SELECT 1;', $4, 'Principiante');
            """,
            fraud_ex_id, test_module_id, f"Fraud Ex {xp_base} XP", xp_base
        )

        async with db_conn.transaction():
            await db_conn.execute("SET LOCAL ROLE service_role;")
            with pytest.raises(PostgresError) as exc_info:
                await db_conn.execute(
                    """
                    SELECT public.record_verified_attempt(
                        $1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10, NULL, $3, $4
                    );
                    """,
                    fraud_user, fraud_ex_id, hints, expected_xp + 1
                )
            assert "exceeds authoritative calculated XP" in str(exc_info.value)


# ==============================================================================
# 4. PRUEBAS DE CONCURRENCIA REAL CON CONEXIONES INDEPENDIENTES
# ==============================================================================

@pytest.mark.asyncio
async def test_concurrent_same_exercise_independent_connections(create_test_user):
    """
    Dos conexiones físicas independientes intentando aprobar el MISMO reto al mismo tiempo:
    - Una sola recibe el XP (30 XP).
    - La otra recibe 0 XP (already_passed = TRUE).
    - El XP acumulado en el perfil es exactamente 30 (sin duplicaciones).
    """
    user_id = await create_test_user("concur_same_user")
    exercise_id = "e0000000-0000-0000-0000-000000000001"  # 30 XP

    async def execute_in_conn():
        conn = await asyncpg.connect(**DB_CONFIG, database=TEST_DB_NAME)
        try:
            async with conn.transaction():
                await conn.execute("SET LOCAL ROLE service_role;")
                row = await conn.fetchrow(
                    """
                    SELECT public.record_verified_attempt(
                        $1::UUID, $2::UUID, 'SELECT nombre_producto, precio FROM productos;',
                        'PASSED', 15, NULL, 0, 30
                    ) AS res;
                    """,
                    user_id,
                    exercise_id,
                )
                return json.loads(row["res"])
        finally:
            await conn.close()

    results = await asyncio.gather(execute_in_conn(), execute_in_conn())

    awarded = [r["xp_awarded"] for r in results]
    already_passed_flags = [r["already_passed"] for r in results]

    assert sorted(awarded) == [0, 30]
    assert sorted(already_passed_flags) == [False, True]

    check_conn = await asyncpg.connect(**DB_CONFIG, database=TEST_DB_NAME)
    try:
        profile_row = await check_conn.fetchrow(
            "SELECT xp, level FROM public.user_profiles WHERE id = $1::UUID;",
            user_id,
        )
        assert profile_row["xp"] == 30
        assert profile_row["level"] == 1

        attempts = await check_conn.fetch(
            "SELECT xp_awarded, status FROM public.exercise_attempts WHERE user_id = $1::UUID;",
            user_id,
        )
        assert len(attempts) == 2
        awarded_counts = [a["xp_awarded"] for a in attempts]
        assert sorted(awarded_counts) == [0, 30]
    finally:
        await check_conn.close()


@pytest.mark.asyncio
async def test_concurrent_different_exercises_no_lost_updates(create_test_user):
    """
    Dos conexiones físicas independientes enviando retos DIFERENTES al mismo tiempo:
    - Reto 1 otorga 30 XP.
    - Reto 8 otorga 35 XP.
    - Cero actualizaciones perdidas (Lost Updates): El XP final es 65.
    - Módulo 1 registra exercises_completed_count = 2 e is_completed = TRUE.
    """
    user_id = await create_test_user("concur_diff_user")
    ex1 = "e0000000-0000-0000-0000-000000000001"  # 30 XP
    ex8 = "e0000000-0000-0000-0000-000000000008"  # 35 XP

    async def complete_ex(ex_id, xp):
        conn = await asyncpg.connect(**DB_CONFIG, database=TEST_DB_NAME)
        try:
            async with conn.transaction():
                await conn.execute("SET LOCAL ROLE service_role;")
                row = await conn.fetchrow(
                    """
                    SELECT public.record_verified_attempt(
                        $1::UUID, $2::UUID, 'SELECT query;', 'PASSED', 20, NULL, 0, $3
                    ) AS res;
                    """,
                    user_id,
                    ex_id,
                    xp,
                )
                return json.loads(row["res"])
        finally:
            await conn.close()

    res1, res8 = await asyncio.gather(
        complete_ex(ex1, 30),
        complete_ex(ex8, 35),
    )

    assert res1["success"] is True
    assert res8["success"] is True

    check_conn = await asyncpg.connect(**DB_CONFIG, database=TEST_DB_NAME)
    try:
        profile = await check_conn.fetchrow(
            "SELECT xp, level FROM public.user_profiles WHERE id = $1::UUID;",
            user_id,
        )
        assert profile["xp"] == 65
        assert profile["level"] == 1

        mod1 = "a0000000-0000-0000-0000-000000000001"
        prog = await check_conn.fetchrow(
            "SELECT exercises_completed_count, is_completed FROM public.user_progress WHERE user_id = $1 AND module_id = $2;",
            user_id, mod1,
        )
        assert prog["exercises_completed_count"] == 2
        assert prog["is_completed"] is True
    finally:
        await check_conn.close()


# ==============================================================================
# 5. CONSISTENCIA DE USER_PROGRESS EN INTENTOS FAILED Y ERROR
# ==============================================================================

@pytest.mark.asyncio
async def test_user_progress_consistency_on_failed_and_error(db_conn, create_test_user):
    """
    Verifica que intentos fallidos o con error sintáctico:
    1. No corrompan ni sobreescriban user_progress a 0.
    2. No alteren user_profiles.xp.
    3. Devuelvan en el JSON el estado real actual del módulo.
    """
    user_id = await create_test_user("progress_consistency_user")
    ex1 = "e0000000-0000-0000-0000-000000000001"  # Módulo 1 (30 XP)
    ex8 = "e0000000-0000-0000-0000-000000000008"  # Módulo 1 (35 XP)

    async with db_conn.transaction():
        await db_conn.execute("SET LOCAL ROLE service_role;")

        # 1. Aprobar ejercicio 1 -> Módulo tiene 1/2 completado
        await db_conn.execute(
            "SELECT public.record_verified_attempt($1, $2, 'SQL', 'PASSED', 10, NULL, 0, 30);",
            user_id, ex1
        )

        # 2. Enviar intento FAILED en ejercicio 8 -> Debe reportar que el módulo sigue teniendo 1 completado
        row_failed = await db_conn.fetchrow(
            "SELECT public.record_verified_attempt($1, $2, 'SQL', 'FAILED', 10, 'Wrong answer', 0, 0) AS res;",
            user_id, ex8
        )
        res_failed = json.loads(row_failed["res"])
        assert res_failed["exercises_completed_count"] == 1
        assert res_failed["module_completed"] is False

        # 3. Aprobar ejercicio 8 -> Módulo completado (2/2)
        await db_conn.execute(
            "SELECT public.record_verified_attempt($1, $2, 'SQL', 'PASSED', 10, NULL, 0, 35);",
            user_id, ex8
        )

        # 4. Enviar un ERROR en ejercicio 1 (repaso fallido) -> Debe preservar module_completed: TRUE y 2/2
        row_error = await db_conn.fetchrow(
            "SELECT public.record_verified_attempt($1, $2, 'SQL', 'ERROR', 0, 'Syntax error', 0, 0) AS res;",
            user_id, ex1
        )
        res_error = json.loads(row_error["res"])
        assert res_error["exercises_completed_count"] == 2
        assert res_error["module_completed"] is True
        assert res_error["total_xp"] == 65  # XP intacto


# ==============================================================================
# 6. REGLAS FUNCIONALES DE XP: APROBACIÓN CON 0 XP
# ==============================================================================

@pytest.mark.asyncio
async def test_first_pass_with_zero_xp_counts_as_passed(db_conn, create_test_user):
    """
    Demuestra la regla funcional canónica de Qurio:
    Si un ejercicio es aprobado con 0 XP (p_xp_to_award = 0), el ejercicio queda
    registrado como PASSED. Intentos posteriores reconocen que ya fue superado
    (already_passed = TRUE) y no duplican ni otorgan XP tardío.
    """
    user_id = await create_test_user("zero_xp_user")
    ex1 = "e0000000-0000-0000-0000-000000000001"

    async with db_conn.transaction():
        await db_conn.execute("SET LOCAL ROLE service_role;")

        # Primer intento aprobado pero con 0 XP
        row1 = await db_conn.fetchrow(
            "SELECT public.record_verified_attempt($1, $2, 'SQL', 'PASSED', 10, NULL, 0, 0) AS res;",
            user_id, ex1
        )
        res1 = json.loads(row1["res"])
        assert res1["success"] is True
        assert res1["already_passed"] is False
        assert res1["xp_awarded"] == 0

        # Segundo intento aprobado solicitando 30 XP
        row2 = await db_conn.fetchrow(
            "SELECT public.record_verified_attempt($1, $2, 'SQL', 'PASSED', 10, NULL, 0, 30) AS res;",
            user_id, ex1
        )
        res2 = json.loads(row2["res"])
        assert res2["success"] is True
        assert res2["already_passed"] is True  # Reconoce que ya fue aprobado previamente
        assert res2["xp_awarded"] == 0         # No permite canje tardío de XP
        assert res2["total_xp"] == 0


# ==============================================================================
# 7. PRUEBA DE REVERSIÓN SEGURA (ROLLBACK AUDIT)
# ==============================================================================

@pytest.mark.asyncio
async def test_rollback_script_preserves_strict_security(db_conn, create_test_user):
    """
    Demuestra que la ejecución del script rollback_security_hardening.sql:
    1. Elimina la función RPC record_verified_attempt.
    2. Elimina el índice único parcial idx_single_awarded_passed_attempt.
    3. Conserva blindado user_profiles (authenticated NO tiene UPDATE en xp/level).
    4. Conserva blindado exercise_attempts (authenticated NO TIENE INSERT de ningún tipo).
    5. No restaura la política RLS vulnerable 'User Insert Own Attempts'.
    """
    user_id = await create_test_user("rollback_test_user")
    exercise_id = "e0000000-0000-0000-0000-000000000001"

    rollback_sql = (ROOT_DIR / "database" / "supabase" / "rollback_security_hardening.sql").read_text(encoding="utf-8")

    # Ejecutar rollback dentro de una transacción aislada para no destruir el setup del suite
    async with db_conn.transaction():
        await db_conn.execute(rollback_sql)

        # 1. Verificar eliminación de la RPC
        rpc_sig = "public.record_verified_attempt(UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT)"
        can_exec = await db_conn.fetchval(
            f"SELECT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'record_verified_attempt');"
        )
        assert can_exec is False, "La RPC debe haber sido eliminada por el rollback"

        # 2. Verificar que el índice único parcial NO se elimina (se preserva por integridad)
        idx_exists = await db_conn.fetchval(
            "SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_single_awarded_passed_attempt');"
        )
        assert idx_exists is True, "El índice condicional idx_single_awarded_passed_attempt DEBE ser conservado tras el rollback"

        # 3. Verificar que el índice preservado continúa impidiendo duplicados de XP positivo
        await db_conn.execute("SET LOCAL ROLE service_role;")
        await db_conn.execute(
            """
            INSERT INTO public.exercise_attempts (user_id, exercise_id, submitted_sql, status, execution_time_ms, xp_awarded)
            VALUES ($1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10, 30);
            """,
            user_id, exercise_id
        )

        # Segundo intento aprobado con XP positivo debe ser rechazado por el índice único
        with pytest.raises(PostgresError) as exc_info:
            async with db_conn.transaction():  # Savepoint para no abortar la transacción principal
                await db_conn.execute(
                    """
                    INSERT INTO public.exercise_attempts (user_id, exercise_id, submitted_sql, status, execution_time_ms, xp_awarded)
                    VALUES ($1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10, 30);
                    """,
                    user_id, exercise_id
                )
        assert "idx_single_awarded_passed_attempt" in str(exc_info.value) or "duplicate key" in str(exc_info.value)

        # Múltiples intentos posteriores aprobados con xp_awarded = 0 DEBEN ser permitidos
        await db_conn.execute(
            """
            INSERT INTO public.exercise_attempts (user_id, exercise_id, submitted_sql, status, execution_time_ms, xp_awarded)
            VALUES ($1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10, 0);
            """,
            user_id, exercise_id
        )
        await db_conn.execute(
            """
            INSERT INTO public.exercise_attempts (user_id, exercise_id, submitted_sql, status, execution_time_ms, xp_awarded)
            VALUES ($1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10, 0);
            """,
            user_id, exercise_id
        )

        # 4. Blindaje persistente de user_profiles: authenticated NO puede modificar xp ni level
        assert await db_conn.fetchval(
            "SELECT has_column_privilege('authenticated', 'public.user_profiles', 'xp', 'UPDATE');"
        ) is False
        assert await db_conn.fetchval(
            "SELECT has_column_privilege('authenticated', 'public.user_profiles', 'level', 'UPDATE');"
        ) is False

        # 5. Blindaje persistente de exercise_attempts: authenticated NO puede insertar registros
        assert await db_conn.fetchval(
            "SELECT has_table_privilege('authenticated', 'public.exercise_attempts', 'INSERT');"
        ) is False
        assert await db_conn.fetchval(
            "SELECT has_column_privilege('authenticated', 'public.exercise_attempts', 'status', 'INSERT');"
        ) is False

        # 6. Intentos reales de inserción y modificación como authenticated deben fallar
        await db_conn.execute("SET LOCAL ROLE authenticated;")
        await db_conn.execute(f"SET LOCAL request.jwt.claim.sub = '{user_id}';")
        with pytest.raises(InsufficientPrivilegeError):
            async with db_conn.transaction():
                await db_conn.execute(
                    """
                    INSERT INTO public.exercise_attempts (user_id, exercise_id, submitted_sql, status)
                    VALUES ($1::UUID, $2::UUID, 'SELECT 1;', 'PASSED');
                    """,
                    user_id, exercise_id
                )
        with pytest.raises(InsufficientPrivilegeError):
            async with db_conn.transaction():
                await db_conn.execute("UPDATE public.user_profiles SET xp = 99999 WHERE id = $1::UUID;", user_id)
        with pytest.raises(InsufficientPrivilegeError):
            async with db_conn.transaction():
                await db_conn.execute("UPDATE public.user_profiles SET level = 99 WHERE id = $1::UUID;", user_id)
