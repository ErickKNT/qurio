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

        # E. Ejecutar 03_security_hardening.sql (v3.0)
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
# 1. PRUEBAS DE PRIVILEGIOS EFECTIVOS (has_table_privilege, has_column_privilege)
# ==============================================================================

@pytest.mark.asyncio
async def test_effective_privileges_matrix(db_conn):
    """
    Audita los privilegios reales en el catálogo de PostgreSQL demostrando que:
    - authenticated NO tiene UPDATE sobre la tabla user_profiles.
    - authenticated NO tiene UPDATE sobre las columnas xp ni level.
    - authenticated TIENE UPDATE sobre display_name y avatar_url.
    - authenticated NO tiene INSERT sobre exercise_attempts.
    - anon y authenticated NO tienen EXECUTE sobre record_verified_attempt.
    - service_role TIENE EXECUTE sobre record_verified_attempt.
    """
    # 1. Privilegios de tabla user_profiles
    can_update_table = await db_conn.fetchval(
        "SELECT has_table_privilege('authenticated', 'public.user_profiles', 'UPDATE');"
    )
    assert can_update_table is False, "authenticated no debe tener UPDATE general sobre user_profiles"

    # 2. Privilegios de columna (CLS) en user_profiles
    can_update_xp = await db_conn.fetchval(
        "SELECT has_column_privilege('authenticated', 'public.user_profiles', 'xp', 'UPDATE');"
    )
    assert can_update_xp is False, "authenticated no debe tener UPDATE sobre columna xp"

    can_update_level = await db_conn.fetchval(
        "SELECT has_column_privilege('authenticated', 'public.user_profiles', 'level', 'UPDATE');"
    )
    assert can_update_level is False, "authenticated no debe tener UPDATE sobre columna level"

    can_update_name = await db_conn.fetchval(
        "SELECT has_column_privilege('authenticated', 'public.user_profiles', 'display_name', 'UPDATE');"
    )
    assert can_update_name is True, "authenticated debe poder actualizar display_name"

    # 3. Privilegios de inserción en exercise_attempts
    can_insert_attempts = await db_conn.fetchval(
        "SELECT has_table_privilege('authenticated', 'public.exercise_attempts', 'INSERT');"
    )
    assert can_insert_attempts is False, "authenticated no debe tener INSERT directo en exercise_attempts"

    # 4. Privilegios de ejecución en record_verified_attempt
    rpc_sig = "public.record_verified_attempt(UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT)"

    can_exec_anon = await db_conn.fetchval(
        f"SELECT has_function_privilege('anon', '{rpc_sig}', 'EXECUTE');"
    )
    assert can_exec_anon is False, "anon no debe poder ejecutar record_verified_attempt"

    can_exec_auth = await db_conn.fetchval(
        f"SELECT has_function_privilege('authenticated', '{rpc_sig}', 'EXECUTE');"
    )
    assert can_exec_auth is False, "authenticated no debe poder ejecutar record_verified_attempt"

    can_exec_service = await db_conn.fetchval(
        f"SELECT has_function_privilege('service_role', '{rpc_sig}', 'EXECUTE');"
    )
    assert can_exec_service is True, "service_role debe ser el único rol con EXECUTE"


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
        assert "exceeds maximum allowable XP" in str(exc_info.value)


# ==============================================================================
# 3. PRUEBAS DE CONCURRENCIA REAL CON CONEXIONES INDEPENDIENTES
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
                        $1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10, NULL, 0, 30
                    ) AS result;
                    """,
                    user_id,
                    exercise_id,
                )
                return json.loads(row["result"])
        finally:
            await conn.close()

    results = await asyncio.gather(execute_in_conn(), execute_in_conn())

    awarded = sorted([r["xp_awarded"] for r in results])
    passed = sorted([r["already_passed"] for r in results])

    assert awarded == [0, 30]
    assert passed == [False, True]

    # Verificar saldo de XP en la base de datos
    check_conn = await asyncpg.connect(**DB_CONFIG, database=TEST_DB_NAME)
    try:
        total_xp = await check_conn.fetchval(
            "SELECT xp FROM public.user_profiles WHERE id = $1::UUID;", user_id
        )
        assert total_xp == 30
    finally:
        await check_conn.close()


@pytest.mark.asyncio
async def test_concurrent_different_exercises_no_lost_updates(create_test_user):
    """
    Dos conexiones físicas independientes aprobando DIFERENTES ejercicios al mismo tiempo:
    - Ejercicio 1 (30 XP) y Ejercicio 8 (35 XP).
    - Gracias al bloqueo FOR UPDATE sobre user_profiles, no hay 'lost updates'.
    - El saldo final de XP es exactamente 65 (30 + 35).
    - Ambos ejercicios quedan registrados y el módulo queda completado (2/2).
    """
    user_id = await create_test_user("concur_diff_user")
    ex1 = "e0000000-0000-0000-0000-000000000001"  # 30 XP
    ex8 = "e0000000-0000-0000-0000-000000000008"  # 35 XP

    async def solve_exercise(ex_id, xp):
        conn = await asyncpg.connect(**DB_CONFIG, database=TEST_DB_NAME)
        try:
            async with conn.transaction():
                await conn.execute("SET LOCAL ROLE service_role;")
                row = await conn.fetchrow(
                    """
                    SELECT public.record_verified_attempt(
                        $1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10, NULL, 0, $3
                    ) AS result;
                    """,
                    user_id,
                    ex_id,
                    xp,
                )
                return json.loads(row["result"])
        finally:
            await conn.close()

    results = await asyncio.gather(
        solve_exercise(ex1, 30),
        solve_exercise(ex8, 35),
    )

    # Ambos deben ser exitosos y otorgar su respectivo XP
    xp_awarded = {r["xp_awarded"] for r in results}
    assert xp_awarded == {30, 35}

    # Verificar que el XP final en el perfil es exactamente la suma (65)
    check_conn = await asyncpg.connect(**DB_CONFIG, database=TEST_DB_NAME)
    try:
        final_xp = await check_conn.fetchval(
            "SELECT xp FROM public.user_profiles WHERE id = $1::UUID;", user_id
        )
        assert final_xp == 65, f"Esperado 65 XP sin lost updates, obtenido: {final_xp}"

        # Verificar progreso del Módulo 1 (2 de 2 completados)
        progress = await check_conn.fetchrow(
            """
            SELECT p.exercises_completed_count, p.is_completed
            FROM public.user_progress p
            JOIN public.exercises e ON p.module_id = e.module_id
            WHERE p.user_id = $1::UUID AND e.id = $2::UUID;
            """,
            user_id, ex1
        )
        assert progress["exercises_completed_count"] == 2
        assert progress["is_completed"] is True
    finally:
        await check_conn.close()


# ==============================================================================
# 4. PRUEBAS DE CONSISTENCIA DE user_progress EN INTENTOS FAILED Y ERROR
# ==============================================================================

@pytest.mark.asyncio
async def test_user_progress_consistency_on_failed_and_error(db_conn, create_test_user):
    """
    Demuestra que ante un intento FAILED o ERROR:
    - No se corrompe ni se resetea a 0/false el progreso previamente alcanzado.
    - Se devuelve en el JSON el estado real actual del módulo.
    """
    user_id = await create_test_user("progress_consistency_user")
    ex1 = "e0000000-0000-0000-0000-000000000001"  # Módulo 1
    ex8 = "e0000000-0000-0000-0000-000000000008"  # Módulo 1

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
# 5. REGLAS FUNCIONALES DE XP: APROBACIÓN CON 0 XP
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
