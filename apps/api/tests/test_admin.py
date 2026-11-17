import asyncio
import json
import time
from pathlib import Path
from unittest.mock import MagicMock, patch
import asyncpg
from cryptography.hazmat.primitives.asymmetric import ec
from httpx import AsyncClient
import jwt
import pytest

from app.core.config import settings
from app.core.system_state import system_state
from app.modules.admin.service import admin_service
from app.modules.runner.security import clear_security_audit_logs
from app.modules.runner.service import sandbox_runner

ROOT_DIR = Path(__file__).resolve().parents[3]


@pytest.fixture(scope="module")
def admin_ec_keys():
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()
    return private_key, public_key


def _build_es256_token(
    private_key,
    sub: str = "00000000-0000-0000-0000-00000000a001",
    email: str = "admin@qurio.dev",
    app_metadata: dict | None = None,
    user_metadata: dict | None = None,
):
    payload = {
        "sub": sub,
        "email": email,
        "role": "authenticated",
        "aud": settings.SUPABASE_JWT_AUDIENCE,
        "iss": settings.SUPABASE_JWT_ISSUER,
        "exp": int(time.time()) + 3600,
        "app_metadata": app_metadata or {},
        "user_metadata": user_metadata or {},
    }
    return jwt.encode(payload, private_key, algorithm="ES256", headers={"kid": "admin-test-kid", "alg": "ES256"})


@pytest.fixture
def mock_jwks(admin_ec_keys):
    _, public_key = admin_ec_keys
    mock_signing_key = MagicMock()
    mock_signing_key.key = public_key
    mock_client = MagicMock()
    mock_client.get_signing_key_from_jwt.return_value = mock_signing_key
    with patch("app.core.auth.get_jwk_client", return_value=mock_client):
        yield


@pytest.fixture(autouse=True)
def reset_system_and_audit_state():
    system_state.reset()
    yield
    system_state.reset()


@pytest.mark.asyncio
async def test_admin_endpoint_rejects_unauthenticated_request(client: AsyncClient):
    resp = await client.get("/api/v1/admin/live-ops")
    assert resp.status_code == 401
    assert resp.json()["detail"] == "AUTHENTICATION_REQUIRED"


@pytest.mark.asyncio
async def test_admin_endpoint_rejects_regular_authenticated_user(client: AsyncClient, admin_ec_keys, mock_jwks):
    private_key, _ = admin_ec_keys
    # Incluso si alguien intenta falsificar role='admin' en user_metadata, debe ser rechazado
    token = _build_es256_token(
        private_key,
        sub="00000000-0000-0000-0000-00000000b002",
        email="student@qurio.dev",
        app_metadata={"provider": "email"},
        user_metadata={"role": "admin"},
    )
    resp = await client.get(
        "/api/v1/admin/live-ops",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403
    assert resp.json()["detail"] == "ADMIN_PRIVILEGES_REQUIRED"


@pytest.mark.asyncio
async def test_admin_endpoint_allows_valid_es256_admin_token(client: AsyncClient, admin_ec_keys, mock_jwks):
    private_key, _ = admin_ec_keys
    token = _build_es256_token(
        private_key,
        app_metadata={"role": "admin"},
    )
    resp = await client.get(
        "/api/v1/admin/live-ops",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["sandbox_healthy"] is True


@pytest.mark.asyncio
async def test_live_ops_returns_accurate_asyncpg_pool_metrics(client: AsyncClient, admin_ec_keys, mock_jwks):
    private_key, _ = admin_ec_keys
    token = _build_es256_token(private_key, app_metadata={"role": "admin"})

    resp = await client.get(
        "/api/v1/admin/live-ops",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    pool = data["pool"]
    assert pool["initialized"] is True
    assert pool["min_size"] == 2
    assert pool["max_size"] == settings.SANDBOX_MAX_CONNECTIONS
    assert pool["total_connections"] >= 2
    assert pool["active_connections"] + pool["idle_connections"] == pool["total_connections"]
    assert data["rtt_ms"] is not None and data["rtt_ms"] >= 0
    assert data["process_rss_mb"] >= 0


@pytest.mark.asyncio
async def test_live_ops_pg_stat_activity_reflects_active_sandbox_queries(client: AsyncClient, admin_ec_keys, mock_jwks):
    private_key, _ = admin_ec_keys
    token = _build_es256_token(private_key, app_metadata={"role": "admin"})

    # Lanzar una consulta directa en el pool del sandbox para observarla en pg_stat_activity
    async def run_slow_query():
        async with sandbox_runner.pool.acquire() as conn:
            try:
                await conn.fetch("SELECT pg_sleep(1.2), 'qurio_live_ops_probe' AS tag;")
            except Exception:
                pass

    task = asyncio.create_task(run_slow_query())
    await asyncio.sleep(0.2)

    try:
        resp = await client.get(
            "/api/v1/admin/live-ops",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        active_queries = resp.json()["active_queries"]
        matched = [q for q in active_queries if "qurio_live_ops_probe" in q["query"]]
        assert len(matched) >= 1
        target_pid = matched[0]["pid"]

        # Verificar cancelación quirúrgica vía pg_cancel_backend(pid)
        cancel_resp = await client.post(
            f"/api/v1/admin/sandbox/cancel-query/{target_pid}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert cancel_resp.status_code == 200
        assert cancel_resp.json()["pid"] == target_pid
        assert cancel_resp.json()["cancelled"] is True
    finally:
        await task


@pytest.mark.asyncio
async def test_forensic_replay_computes_exact_semantic_diff(
    client: AsyncClient, admin_ec_keys, mock_jwks, monkeypatch
):
    private_key, _ = admin_ec_keys
    token = _build_es256_token(private_key, app_metadata={"role": "admin"})

    fake_attempt = {
        "id": "att-forensic-001",
        "user_id": "usr-student-1",
        "exercise_id": "e0000000-0000-0000-0000-000000000001",
        "submitted_sql": "SELECT nombre_producto, precio FROM productos WHERE precio > 1000;",
        "status": "FAILED",
        "execution_time_ms": 12,
        "error_message": "Row count mismatch",
        "hints_used": 0,
        "xp_awarded": 0,
        "created_at": "2026-11-17T10:00:00Z",
    }

    async def fake_fetch_attempt(attempt_id: str):
        return fake_attempt if attempt_id == "att-forensic-001" else None

    monkeypatch.setattr(admin_service, "fetch_attempt_by_id", fake_fetch_attempt)

    resp = await client.post(
        "/api/v1/admin/attempts/replay",
        json={"attempt_id": "att-forensic-001"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["evaluation_status"] == "FAILED"
    assert data["expected_result"]["row_count"] == 15
    assert data["student_result"]["row_count"] < 15
    assert "nombre_producto" in data["student_result"]["inferred_types"]
    assert data["forensic_diff"]["cardinality_delta"] == (
        data["student_result"]["row_count"] - data["expected_result"]["row_count"]
    )
    assert len(data["forensic_diff"]["missing_rows"]) == (
        15 - data["student_result"]["row_count"]
    )


@pytest.mark.asyncio
async def test_security_audit_log_captures_ast_blocked_queries(client: AsyncClient, admin_ec_keys, mock_jwks):
    clear_security_audit_logs()
    private_key, _ = admin_ec_keys
    token = _build_es256_token(private_key, app_metadata={"role": "admin"})

    # 1. Enviar una consulta destructiva al endpoint público del playground
    attack_resp = await client.post(
        "/api/v1/playground/execute",
        json={"query": "DROP TABLE clientes;", "database": "ecommerce_sandbox"},
    )
    assert attack_resp.status_code == 200
    assert attack_resp.json()["status"] == "ERROR"

    # 2. Verificar que quedó registrada en el buffer circular AST
    audit_resp = await client.get(
        "/api/v1/admin/security/audit-log",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert audit_resp.status_code == 200
    body = audit_resp.json()
    assert len(body["audit_logs"]) >= 1
    latest = body["audit_logs"][0]
    assert latest["blocked_node"] == "DROP"
    assert latest["rule_violated"] == "DISALLOWED_ROOT_STATEMENT"
    assert "DROP TABLE clientes" in latest["submitted_sql_snippet"]
    assert isinstance(body["rate_limit_buckets"], list)


@pytest.mark.asyncio
async def test_maintenance_mode_killswitch_blocks_submissions_with_503(
    client: AsyncClient, admin_ec_keys, mock_jwks
):
    private_key, _ = admin_ec_keys
    token = _build_es256_token(private_key, app_metadata={"role": "admin"})

    # Activar modo mantenimiento
    ks_on = await client.post(
        "/api/v1/admin/system/killswitches",
        json={"is_maintenance_mode": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert ks_on.status_code == 200
    assert ks_on.json()["is_maintenance_mode"] is True

    # Playground y Submit deben responder 503
    pg_resp = await client.post(
        "/api/v1/playground/execute",
        json={"query": "SELECT 1;", "database": "ecommerce_sandbox"},
    )
    assert pg_resp.status_code == 503

    sub_resp = await client.post(
        "/api/v1/exercises/e0000000-0000-0000-0000-000000000001/submit",
        json={"query": "SELECT nombre_producto, precio FROM productos;"},
    )
    assert sub_resp.status_code == 503

    # Las lecturas curriculares permanecen abiertas
    ex_resp = await client.get("/api/v1/exercises")
    assert ex_resp.status_code == 200

    # Desactivar modo mantenimiento
    ks_off = await client.post(
        "/api/v1/admin/system/killswitches",
        json={"is_maintenance_mode": False},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert ks_off.status_code == 200
    assert ks_off.json()["is_maintenance_mode"] is False


@pytest.mark.asyncio
async def test_pool_recycle_reinitializes_asyncpg_connections_cleanly(
    client: AsyncClient, admin_ec_keys, mock_jwks
):
    private_key, _ = admin_ec_keys
    token = _build_es256_token(private_key, app_metadata={"role": "admin"})

    old_pool = sandbox_runner.pool
    resp = await client.post(
        "/api/v1/admin/system/pool/recycle",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["recycled"] is True
    assert data["pool"]["initialized"] is True
    assert sandbox_runner.pool is not old_pool

    health = await client.get("/api/v1/health")
    assert health.status_code == 200
    assert health.json()["sandbox_database"] == "connected"


@pytest.mark.asyncio
async def test_exercise_operational_status_killswitch_hides_public_exercise(
    client: AsyncClient, admin_ec_keys, mock_jwks
):
    private_key, _ = admin_ec_keys
    token = _build_es256_token(private_key, app_metadata={"role": "admin"})
    ex_id = "e0000000-0000-0000-0000-000000000001"

    hide_resp = await client.post(
        "/api/v1/admin/system/killswitches",
        json={"exercise_id": ex_id, "exercise_status": "hidden"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert hide_resp.status_code == 200
    assert hide_resp.json()["exercise_status_overrides"][ex_id] == "hidden"

    get_hidden = await client.get(f"/api/v1/exercises/{ex_id}")
    assert get_hidden.status_code == 404

    restore_resp = await client.post(
        "/api/v1/admin/system/killswitches",
        json={"exercise_id": ex_id, "exercise_status": "active"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert restore_resp.status_code == 200
    get_active = await client.get(f"/api/v1/exercises/{ex_id}")
    assert get_active.status_code == 200


@pytest.mark.asyncio
async def test_04_admin_rbac_sql_idempotent_and_enforces_app_metadata():
    """
    Aplica database/supabase/04_admin_rbac.sql dos veces sobre una BD de prueba local
    para garantizar idempotencia y validar public.is_admin() y admin_curriculum_metrics().
    """
    db_cfg = {
        "host": "localhost",
        "port": 5433,
        "user": "postgres",
        "password": "postgres_sandbox_master_pass",
    }
    test_db = "supabase_admin_rbac_test"
    root = await asyncpg.connect(**db_cfg, database="postgres")
    try:
        await root.execute(
            "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid();",
            test_db,
        )
        await root.execute(f"DROP DATABASE IF EXISTS {test_db};")
        await root.execute(f"CREATE DATABASE {test_db};")
    finally:
        await root.close()

    conn = await asyncpg.connect(**db_cfg, database=test_db)
    try:
        await conn.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF;
                IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated; END IF;
                IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role BYPASSRLS; END IF;
            END $$;
            GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
            CREATE SCHEMA IF NOT EXISTS auth;
            CREATE TABLE IF NOT EXISTS auth.users (id UUID PRIMARY KEY, email TEXT, raw_user_meta_data JSONB);
            CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
                SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
            $$ LANGUAGE sql STABLE;
        """)
        schema_sql = (ROOT_DIR / "database" / "supabase" / "01_schema.sql").read_text(encoding="utf-8")
        seed_sql = (ROOT_DIR / "database" / "supabase" / "02_seed_curriculum.sql").read_text(encoding="utf-8")
        admin_sql = (ROOT_DIR / "database" / "supabase" / "04_admin_rbac.sql").read_text(encoding="utf-8")

        await conn.execute(schema_sql)
        await conn.execute(seed_sql)
        # Aplicar 2 veces para comprobar idempotencia absoluta
        await conn.execute(admin_sql)
        await conn.execute(admin_sql)

        # 1. Usuario regular con user_metadata falsificado -> is_admin() = False
        async with conn.transaction():
            await conn.execute("SET LOCAL ROLE authenticated;")
            await conn.execute(
                "SELECT set_config('request.jwt.claims', $1, true);",
                json.dumps({"sub": "00000000-0000-0000-0000-000000000001", "user_metadata": {"role": "admin"}}),
            )
            assert await conn.fetchval("SELECT public.is_admin();") is False
            with pytest.raises(asyncpg.InsufficientPrivilegeError):
                await conn.fetch("SELECT * FROM public.admin_curriculum_metrics();")

        # 2. Usuario admin legítimo con app_metadata.role = 'admin' -> is_admin() = True
        async with conn.transaction():
            await conn.execute("SET LOCAL ROLE authenticated;")
            await conn.execute(
                "SELECT set_config('request.jwt.claims', $1, true);",
                json.dumps({"sub": "00000000-0000-0000-0000-000000000001", "app_metadata": {"role": "admin"}}),
            )
            assert await conn.fetchval("SELECT public.is_admin();") is True
            rows = await conn.fetch("SELECT * FROM public.admin_curriculum_metrics();")
            assert len(rows) >= 50
    finally:
        await conn.close()
        cleanup = await asyncpg.connect(**db_cfg, database="postgres")
        try:
            await cleanup.execute(
                "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid();",
                test_db,
            )
            await cleanup.execute(f"DROP DATABASE IF EXISTS {test_db};")
        finally:
            await cleanup.close()
