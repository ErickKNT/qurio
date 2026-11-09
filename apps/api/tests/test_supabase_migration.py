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
    # 1. Conectar a postgres para resetear la base de datos de test limpia
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

    # 2. Conectar a supabase_mock_test como superusuario postgres
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

        # E. Ejecutar 03_security_hardening.sql
        hardening_sql = (ROOT_DIR / "database" / "supabase" / "03_security_hardening.sql").read_text(encoding="utf-8")
        await conn.execute(hardening_sql)

        # F. Otorgar permisos SELECT sobre las tablas para que los roles autenticados puedan operar con RLS
        await conn.execute("""
            GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
            GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
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
# PRUEBAS DE SEGURIDAD, PERMISOS Y PRIVILEGIOS
# ==============================================================================

@pytest.mark.asyncio
async def test_rpc_permissions_denied_for_anon_and_authenticated(db_conn, create_test_user):
    """
    Demuestra que roles no autorizados (anon, authenticated) NO pueden invocar
    record_verified_attempt() directamente (InsufficientPrivilegeError).
    """
    user_id = await create_test_user("perm_test_user")
    exercise_id = "e0000000-0000-0000-0000-000000000001"

    # Intento como anon
    async with db_conn.transaction():
        await db_conn.execute("SET LOCAL ROLE anon;")
        with pytest.raises(InsufficientPrivilegeError) as exc:
            await db_conn.execute(
                """
                SELECT public.record_verified_attempt(
                    $1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10, NULL, 0, 45
                );
                """,
                user_id,
                exercise_id,
            )
        assert "permission denied" in str(exc.value).lower()

    # Intento como authenticated
    async with db_conn.transaction():
        await db_conn.execute("SET LOCAL ROLE authenticated;")
        with pytest.raises(InsufficientPrivilegeError) as exc:
            await db_conn.execute(
                """
                SELECT public.record_verified_attempt(
                    $1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10, NULL, 0, 45
                );
                """,
                user_id,
                exercise_id,
            )
        assert "permission denied" in str(exc.value).lower()


@pytest.mark.asyncio
async def test_cls_prevents_client_modifying_xp_directly(db_conn, create_test_user):
    """
    Demuestra que Column-Level Security (CLS) impide que un usuario authenticated
    actualice las columnas xp o level directamente en user_profiles.
    """
    user_id = await create_test_user("cls_test_user")

    # 1. Intentar subir XP directamente debe ser RECHAZADO por CLS
    async with db_conn.transaction():
        await db_conn.execute("SET LOCAL ROLE authenticated;")
        await db_conn.execute(f"SET LOCAL request.jwt.claim.sub = '{user_id}';")
        with pytest.raises(InsufficientPrivilegeError) as exc:
            await db_conn.execute(
                f"UPDATE public.user_profiles SET xp = 99999 WHERE id = '{user_id}';"
            )
        assert "permission denied" in str(exc.value).lower()

    # 2. En una nueva transacción, actualizar campos visuales permitidos (display_name) es ADMITIDO
    async with db_conn.transaction():
        await db_conn.execute("SET LOCAL ROLE authenticated;")
        await db_conn.execute(f"SET LOCAL request.jwt.claim.sub = '{user_id}';")
        await db_conn.execute(
            f"UPDATE public.user_profiles SET display_name = 'Nombre Actualizado' WHERE id = '{user_id}';"
        )


@pytest.mark.asyncio
async def test_client_cannot_insert_exercise_attempts_directly(db_conn, create_test_user):
    """
    Demuestra que se revocó el permiso de INSERT directo en exercise_attempts
    a clientes authenticated (SEC-04 neutralizado).
    """
    user_id = await create_test_user("insert_test_user")
    exercise_id = "e0000000-0000-0000-0000-000000000001"

    async with db_conn.transaction():
        await db_conn.execute("SET LOCAL ROLE authenticated;")
        await db_conn.execute(f"SET LOCAL request.jwt.claim.sub = '{user_id}';")

        with pytest.raises(InsufficientPrivilegeError) as exc:
            await db_conn.execute(
                """
                INSERT INTO public.exercise_attempts (
                    user_id, exercise_id, submitted_sql, status, xp_awarded
                ) VALUES ($1, $2, 'HACK', 'PASSED', 500);
                """,
                user_id,
                exercise_id,
            )
        assert "permission denied" in str(exc.value).lower()


# ==============================================================================
# PRUEBAS DE IDEMPOTENCIA, RECOMPENSA Y CONCURRENCIA
# ==============================================================================

@pytest.mark.asyncio
async def test_idempotency_prevents_duplicate_xp_reward(db_conn, create_test_user):
    """
    Demuestra que resolver un ejercicio por segunda vez:
    1. Registra el nuevo intento en el historial (para analítica y auditoría).
    2. Otorga exactamente 0 XP adicional.
    3. Retorna already_passed = TRUE.
    """
    user_id = await create_test_user("idempotent_user")
    exercise_id = "e0000000-0000-0000-0000-000000000001"

    async with db_conn.transaction():
        await db_conn.execute("SET LOCAL ROLE service_role;")

        # Primer intento aprobado: otorga 45 XP
        row1 = await db_conn.fetchrow(
            """
            SELECT public.record_verified_attempt(
                $1::UUID, $2::UUID, 'SELECT nombre_producto, precio FROM productos;', 'PASSED', 15, NULL, 0, 45
            ) AS result;
            """,
            user_id,
            exercise_id,
        )
        res1 = json.loads(row1["result"])
        assert res1["success"] is True
        assert res1["already_passed"] is False
        assert res1["xp_awarded"] == 45
        assert res1["total_xp"] == 45

        # Segundo intento aprobado: 0 XP adicional
        row2 = await db_conn.fetchrow(
            """
            SELECT public.record_verified_attempt(
                $1::UUID, $2::UUID, 'SELECT nombre_producto, precio FROM productos;', 'PASSED', 12, NULL, 0, 45
            ) AS result;
            """,
            user_id,
            exercise_id,
        )
        res2 = json.loads(row2["result"])
        assert res2["success"] is True
        assert res2["already_passed"] is True
        assert res2["xp_awarded"] == 0
        assert res2["total_xp"] == 45  # Mismo XP total

        # Verificar que existen 2 intentos en exercise_attempts (historial preservado)
        count = await db_conn.fetchval(
            "SELECT COUNT(*) FROM public.exercise_attempts WHERE user_id = $1::UUID;",
            user_id,
        )
        assert count == 2


@pytest.mark.asyncio
async def test_concurrent_requests_do_not_duplicate_xp(create_test_user):
    """
    Demuestra que dos solicitudes simultáneas (concurrencia real) compitiendo por
    el mismo reto no duplican XP gracias al bloqueo transaccional 'FOR UPDATE'
    y la restricción de unicidad condicional en PostgreSQL.
    """
    user_id = await create_test_user("concurrency_user")
    exercise_id = "e0000000-0000-0000-0000-000000000002"

    async def call_attempt():
        c = await asyncpg.connect(**DB_CONFIG, database=TEST_DB_NAME)
        try:
            async with c.transaction():
                await c.execute("SET LOCAL ROLE service_role;")
                row = await c.fetchrow(
                    """
                    SELECT public.record_verified_attempt(
                        $1::UUID, $2::UUID, 'SELECT 1;', 'PASSED', 10, NULL, 0, 35
                    ) AS result;
                    """,
                    user_id,
                    exercise_id,
                )
                return json.loads(row["result"])
        finally:
            await c.close()

    # Ejecutar dos transacciones concurrentes
    results = await asyncio.gather(call_attempt(), call_attempt())

    xp_awarded_list = [r["xp_awarded"] for r in results]
    already_passed_list = [r["already_passed"] for r in results]

    # Exactamente una transacción debe haber recibido los 35 XP y la otra 0 XP
    assert sorted(xp_awarded_list) == [0, 35]
    assert sorted(already_passed_list) == [False, True]

    # Verificar XP final del usuario en la base de datos
    check_conn = await asyncpg.connect(**DB_CONFIG, database=TEST_DB_NAME)
    try:
        final_xp = await check_conn.fetchval(
            "SELECT xp FROM public.user_profiles WHERE id = $1::UUID;", user_id
        )
        assert final_xp == 35  # Nunca 70
    finally:
        await check_conn.close()


# ==============================================================================
# PRUEBAS DE VALIDACIÓN DE ENTRADA Y PARÁMETROS
# ==============================================================================

@pytest.mark.asyncio
async def test_rpc_validation_rejects_invalid_parameters(db_conn, create_test_user):
    """Verifica que record_verified_attempt rechace estados y valores fuera de límites."""
    user_id = await create_test_user("validation_user")
    exercise_id = "e0000000-0000-0000-0000-000000000001"

    # Helper para ejecutar llamadas aisladas que esperan error
    async def expect_error(sql, *args):
        async with db_conn.transaction():
            await db_conn.execute("SET LOCAL ROLE service_role;")
            with pytest.raises(PostgresError) as exc_info:
                await db_conn.execute(sql, *args)
            return str(exc_info.value)

    # 1. Estado inválido
    err = await expect_error(
        "SELECT public.record_verified_attempt($1, $2, 'SQL', 'HACKED', 10, NULL, 0, 50);",
        user_id, exercise_id
    )
    assert "Invalid status: HACKED" in err

    # 2. execution_time negativo
    err = await expect_error(
        "SELECT public.record_verified_attempt($1, $2, 'SQL', 'PASSED', -10, NULL, 0, 50);",
        user_id, exercise_id
    )
    assert "cannot be negative" in err

    # 3. Pistas negativas o mayores a 3
    err = await expect_error(
        "SELECT public.record_verified_attempt($1, $2, 'SQL', 'PASSED', 10, NULL, -1, 50);",
        user_id, exercise_id
    )
    assert "hints_used must be between 0 and 3" in err

    err = await expect_error(
        "SELECT public.record_verified_attempt($1, $2, 'SQL', 'PASSED', 10, NULL, 5, 50);",
        user_id, exercise_id
    )
    assert "hints_used must be between 0 and 3" in err

    # 4. XP fuera de rango (ej. > 500)
    err = await expect_error(
        "SELECT public.record_verified_attempt($1, $2, 'SQL', 'PASSED', 10, NULL, 0, 99999);",
        user_id, exercise_id
    )
    assert "xp_to_award out of bounds" in err

    # 5. Usuario no existente
    err = await expect_error(
        "SELECT public.record_verified_attempt('00000000-0000-0000-0000-000000000000'::UUID, $1, 'SQL', 'PASSED', 10, NULL, 0, 45);",
        exercise_id
    )
    assert "does not exist" in err


# ==============================================================================
# PRUEBAS DE CÁLCULO DE PROGRESO DE MÓDULOS
# ==============================================================================

@pytest.mark.asyncio
async def test_module_progress_calculation(db_conn, create_test_user):
    """
    Demuestra que exercises_completed_count e is_completed se calculan
    estrictamente según el número real de ejercicios aprobados del módulo.
    """
    user_id = await create_test_user("module_prog_user")

    # Módulo 1 (a0000000-0000-0000-0000-000000000001) tiene 2 ejercicios:
    # Ex 1: e0000000-0000-0000-0000-000000000001
    # Ex 8: e0000000-0000-0000-0000-000000000008
    ex1 = "e0000000-0000-0000-0000-000000000001"
    ex8 = "e0000000-0000-0000-0000-000000000008"

    async with db_conn.transaction():
        await db_conn.execute("SET LOCAL ROLE service_role;")

        # Aprobar Ejercicio 1 (1 de 2 completados)
        row1 = await db_conn.fetchrow(
            "SELECT public.record_verified_attempt($1, $2, 'SQL', 'PASSED', 10, NULL, 0, 30) AS res;",
            user_id, ex1
        )
        res1 = json.loads(row1["res"])
        assert res1["exercises_completed_count"] == 1
        assert res1["module_completed"] is False

        # Aprobar Ejercicio 8 (2 de 2 completados -> módulo finalizado!)
        row2 = await db_conn.fetchrow(
            "SELECT public.record_verified_attempt($1, $2, 'SQL', 'PASSED', 10, NULL, 0, 35) AS res;",
            user_id, ex8
        )
        res2 = json.loads(row2["res"])
        assert res2["exercises_completed_count"] == 2
        assert res2["module_completed"] is True

        # Verificar registro persistido en public.user_progress
        progress_row = await db_conn.fetchrow(
            """
            SELECT p.exercises_completed_count, p.is_completed
            FROM public.user_progress p
            JOIN public.exercises e ON p.module_id = e.module_id
            WHERE p.user_id = $1::UUID AND e.id = $2::UUID;
            """,
            user_id, ex1
        )
        assert progress_row["exercises_completed_count"] == 2
        assert progress_row["is_completed"] is True
