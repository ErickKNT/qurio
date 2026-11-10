import pytest
import httpx
from httpx import AsyncClient

from app.main import app
from app.core.config import settings
from app.core.auth import AuthenticatedUser, get_optional_current_user
from app.core.supabase import record_verified_progress


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["sandbox_database"] == "connected"


@pytest.mark.asyncio
async def test_playground_execute_valid_query(client: AsyncClient):
    payload = {
        "query": "SELECT nombre_producto, precio FROM productos ORDER BY precio DESC LIMIT 3;",
        "database": "ecommerce_sandbox"
    }
    response = await client.post("/api/v1/playground/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["row_count"] == 3
    assert len(data["columns"]) == 2
    assert data["columns"][0]["name"] == "nombre_producto"
    assert data["columns"][1]["name"] == "precio"
    assert len(data["rows"]) == 3


@pytest.mark.asyncio
async def test_playground_execute_security_block(client: AsyncClient):
    payload = {
        "query": "DROP TABLE clientes;",
        "database": "ecommerce_sandbox"
    }
    response = await client.post("/api/v1/playground/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ERROR"
    assert "DROP" in data["error"]


@pytest.mark.asyncio
async def test_playground_execute_syntax_error(client: AsyncClient):
    payload = {
        "query": "SELECT FROM FROM WHERE;",
        "database": "ecommerce_sandbox"
    }
    response = await client.post("/api/v1/playground/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ERROR"
    assert "Error de base de datos" in data["error"]


@pytest.mark.asyncio
async def test_list_and_get_exercises(client: AsyncClient):
    # Listar
    list_resp = await client.get("/api/v1/exercises")
    assert list_resp.status_code == 200
    exercises = list_resp.json()
    assert len(exercises) >= 7

    # Obtener reto estrella (e0000000-0000-0000-0000-000000000006)
    detail_resp = await client.get("/api/v1/exercises/e0000000-0000-0000-0000-000000000006")
    assert detail_resp.status_code == 200
    item = detail_resp.json()
    assert item["title"] == "Clientes sin Compras Registradas (LEFT JOIN & IS NULL)"
    assert len(item["hints"]) == 3


@pytest.mark.asyncio
async def test_submit_exercise_success_guest(client: AsyncClient):
    # Ejercicio 1 evaluado como invitado (Trial): aprueba pero NO recibe XP oficial (D-05)
    exercise_id = "e0000000-0000-0000-0000-000000000001"
    payload = {
        "query": "SELECT nombre_producto, precio FROM productos;",
        "hints_revealed": 0
    }
    response = await client.post(f"/api/v1/exercises/{exercise_id}/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PASSED"
    assert data["xp_awarded"] == 0
    assert "modo invitado" in data["message"].lower()
    assert data["diff"] is None


@pytest.mark.asyncio
async def test_submit_exercise_success_authenticated(client: AsyncClient, monkeypatch):
    # Ejercicio 1 evaluado como usuario autenticado con certificación RPC exitosa
    async def fake_record_verified_progress(**kwargs):
        return {
            "success": True,
            "already_passed": False,
            "already_awarded": False,
            "xp_awarded": kwargs.get("xp_to_award", 30),
        }

    monkeypatch.setattr("app.modules.runner.router.record_verified_progress", fake_record_verified_progress)

    exercise_id = "e0000000-0000-0000-0000-000000000001"
    payload = {
        "query": "SELECT nombre_producto, precio FROM productos;",
        "hints_revealed": 0
    }
    app.dependency_overrides[get_optional_current_user] = lambda: AuthenticatedUser(
        id="usr_auth_test_123", email="student@qurio.dev", role="authenticated", is_guest=False
    )
    try:
        response = await client.post(f"/api/v1/exercises/{exercise_id}/submit", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "PASSED"
        assert data["xp_awarded"] == 30
        assert "acreditados" in data["message"].lower() or "éxito" in data["message"].lower()
        assert data["diff"] is None
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_submit_exercise_partial_or_wrong_columns(client: AsyncClient):
    # Ejercicio 1 con columnas incorrectas
    exercise_id = "e0000000-0000-0000-0000-000000000001"
    payload = {
        "query": "SELECT nombre_producto, stock FROM productos;",
        "hints_revealed": 0
    }
    response = await client.post(f"/api/v1/exercises/{exercise_id}/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "FAILED"
    assert data["xp_awarded"] == 0
    assert data["diff"] is not None


@pytest.mark.asyncio
async def test_guest_trial_limit_enforced(client: AsyncClient):
    """Verifica que un invitado no pueda evaluar retos fuera del trial de 3 ejercicios."""
    exercise_id = "e0000000-0000-0000-0000-000000000006"
    payload = {
        "query": "SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id WHERE p.pedido_id IS NULL;",
        "hints_revealed": 0,
    }
    response = await client.post(f"/api/v1/exercises/{exercise_id}/submit", json=payload)
    assert response.status_code == 401
    assert "REGISTRATION_REQUIRED_AFTER_TRIAL" in response.json()["detail"]


@pytest.mark.asyncio
async def test_submit_exercise_star_challenge_left_join_authenticated(client: AsyncClient, monkeypatch):
    # Reto Estrella evaluado con usuario autenticado y certificación RPC exitosa
    async def fake_record_verified_progress(**kwargs):
        return {
            "success": True,
            "already_passed": False,
            "already_awarded": False,
            "xp_awarded": kwargs.get("xp_to_award", 42),
        }

    monkeypatch.setattr("app.modules.runner.router.record_verified_progress", fake_record_verified_progress)

    exercise_id = "e0000000-0000-0000-0000-000000000006"
    payload = {
        "query": "SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id WHERE p.pedido_id IS NULL;",
        "hints_revealed": 1  # Usó 1 pista -> penalización
    }
    app.dependency_overrides[get_optional_current_user] = lambda: AuthenticatedUser(
        id="usr_auth_test_123", email="student@qurio.dev", role="authenticated", is_guest=False
    )
    try:
        response = await client.post(f"/api/v1/exercises/{exercise_id}/submit", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "PASSED"
        # Base 50 XP con 1 pista (-15%) -> 42 XP
        assert data["xp_awarded"] == 42
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_public_exercises_never_expose_solution_query(client: AsyncClient):
    """Comprueba que los endpoints públicos de catálogo y detalle jamás expongan solution_query."""
    res = await client.get("/api/v1/exercises")
    assert res.status_code == 200
    exercises = res.json()
    assert len(exercises) > 0
    for ex in exercises:
        assert "solution_query" not in ex

    res_single = await client.get(f"/api/v1/exercises/{exercises[0]['id']}")
    assert res_single.status_code == 200
    single_ex = res_single.json()
    assert "solution_query" not in single_ex


@pytest.mark.asyncio
async def test_playground_string_with_semicolon(client: AsyncClient):
    payload = {
        "query": "SELECT 'item; 1' AS item, 'status; ok' AS status;",
        "database": "ecommerce_sandbox"
    }
    response = await client.post("/api/v1/playground/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert len(data["rows"]) == 1
    assert data["rows"][0][0] == "item; 1"


@pytest.mark.asyncio
async def test_playground_blocked_cte_delete(client: AsyncClient):
    payload = {
        "query": "WITH hack AS (DELETE FROM clientes RETURNING *) SELECT * FROM hack;",
        "database": "ecommerce_sandbox"
    }
    response = await client.post("/api/v1/playground/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ERROR"
    assert "DELETE" in data["error"]


@pytest.mark.asyncio
async def test_playground_recursive_cte_timeout(client: AsyncClient):
    payload = {
        "query": "WITH RECURSIVE inf AS (SELECT 1 AS n UNION ALL SELECT n + 1 FROM inf) SELECT MAX(n) FROM inf;",
        "database": "ecommerce_sandbox"
    }
    response = await client.post("/api/v1/playground/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ERROR"
    assert "Tiempo de ejecución excedido" in data["error"]


@pytest.mark.asyncio
async def test_regression_guest_xp_strictly_zero_and_no_rpc_called(client: AsyncClient, monkeypatch):
    """
    Regresión Crítica Fase 11.1 (D-05 / C-03):
    Garantiza que un usuario invitado que resuelve un ejercicio aprobado:
    1. Recibe 'xp_awarded' estrictamente igual a 0.
    2. Recibe el mensaje formativo invitando a registrarse.
    3. Jamás invoca la RPC 'record_verified_progress' (0 escrituras en Supabase).
    """
    rpc_invocations = []

    async def fake_record_verified_progress(**kwargs):
        rpc_invocations.append(kwargs)
        return {"success": True}

    monkeypatch.setattr("app.modules.runner.router.record_verified_progress", fake_record_verified_progress)

    exercise_id = "e0000000-0000-0000-0000-000000000001"
    payload = {
        "query": "SELECT nombre_producto, precio FROM productos;",
        "hints_revealed": 0
    }
    response = await client.post(f"/api/v1/exercises/{exercise_id}/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PASSED"
    assert data["xp_awarded"] == 0, "Un invitado NUNCA debe recibir XP oficial"
    assert "modo invitado" in data["message"].lower()
    assert len(rpc_invocations) == 0, "Un invitado NUNCA debe invocar record_verified_progress"


@pytest.mark.asyncio
async def test_regression_authenticated_user_passes_exercise_4_and_receives_xp(client: AsyncClient, monkeypatch):
    """
    Regresión Crítica Fase 11.1:
    Garantiza que un usuario autenticado puede resolver ejercicios fuera del trial (ej. Ejercicio 4),
    recibe XP oficial mayor a 0 y certifica el intento en la RPC de Supabase.
    """
    rpc_invocations = []

    async def fake_record_verified_progress(**kwargs):
        rpc_invocations.append(kwargs)
        return {
            "success": True,
            "already_passed": False,
            "already_awarded": False,
            "xp_awarded": kwargs.get("xp_to_award", 35),
        }

    monkeypatch.setattr("app.modules.runner.router.record_verified_progress", fake_record_verified_progress)

    exercise_id = "e0000000-0000-0000-0000-000000000002"
    payload = {
        "query": "SELECT nombre_producto, precio, stock FROM productos WHERE precio > 500;",
        "hints_revealed": 0
    }
    app.dependency_overrides[get_optional_current_user] = lambda: AuthenticatedUser(
        id="usr_auth_verified_42", email="verified@qurio.dev", role="authenticated", is_guest=False
    )
    try:
        response = await client.post(f"/api/v1/exercises/{exercise_id}/submit", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "PASSED"
        assert data["xp_awarded"] == 35
        assert len(rpc_invocations) == 1
        assert rpc_invocations[0]["user_id"] == "usr_auth_verified_42"
        assert rpc_invocations[0]["xp_to_award"] == 35
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_contingency_mode_when_rpc_unavailable_awards_zero_xp_and_informs_user(client: AsyncClient, monkeypatch):
    """
    Fase 11.3 — Continuidad Operativa (Alternativa B):
    Cuando la RPC record_verified_attempt no está disponible (ej. tras rollback o falla de red):
    1. La práctica en sandbox tiene éxito (status = 'PASSED').
    2. El backend NO adjudica XP (+0 XP oficial).
    3. El mensaje informa explícitamente el modo de contingencia sin prometer falso XP.
    """
    async def fake_failed_rpc(**kwargs):
        return {
            "success": False,
            "already_passed": False,
            "already_awarded": False,
            "xp_awarded": 0,
            "error": "PGRST202: Could not find function record_verified_attempt",
            "contingency_mode": True,
        }

    monkeypatch.setattr("app.modules.runner.router.record_verified_progress", fake_failed_rpc)

    exercise_id = "e0000000-0000-0000-0000-000000000002"
    payload = {
        "query": "SELECT nombre_producto, precio, stock FROM productos WHERE precio > 500;",
        "hints_revealed": 0
    }
    app.dependency_overrides[get_optional_current_user] = lambda: AuthenticatedUser(
        id="usr_contingency_test_1", email="student@qurio.dev", role="authenticated", is_guest=False
    )
    try:
        response = await client.post(f"/api/v1/exercises/{exercise_id}/submit", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "PASSED"
        assert data["xp_awarded"] == 0, "En modo contingencia NUNCA se debe adjudicar XP no certificado"
        assert "contingencia" in data["message"].lower()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_contingency_mode_preserves_practice_and_allows_subsequent_reward_when_rpc_restored(client: AsyncClient, monkeypatch):
    """
    Fase 11.3 — No Pérdida Silenciosa de Progreso:
    Un usuario que aprueba en modo contingencia (0 XP) puede volver a enviar su reto
    cuando la RPC se restablezca y recibir su XP legítimo (+35 XP).
    """
    # 1. Primer intento durante contingencia
    async def fake_failed_rpc(**kwargs):
        return {"success": False, "already_passed": False, "xp_awarded": 0, "contingency_mode": True}

    monkeypatch.setattr("app.modules.runner.router.record_verified_progress", fake_failed_rpc)

    exercise_id = "e0000000-0000-0000-0000-000000000002"
    payload = {
        "query": "SELECT nombre_producto, precio, stock FROM productos WHERE precio > 500;",
        "hints_revealed": 0
    }
    app.dependency_overrides[get_optional_current_user] = lambda: AuthenticatedUser(
        id="usr_contingency_test_2", email="student2@qurio.dev", role="authenticated", is_guest=False
    )
    try:
        res1 = await client.post(f"/api/v1/exercises/{exercise_id}/submit", json=payload)
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1["status"] == "PASSED"
        assert data1["xp_awarded"] == 0

        # 2. Restablecimiento de la RPC: ahora responde exitosamente
        async def fake_restored_rpc(**kwargs):
            return {
                "success": True,
                "already_passed": True,  # Ya había pasado en práctica
                "already_awarded": False,  # Pero NUNCA se le había otorgado XP oficial
                "xp_awarded": kwargs.get("xp_to_award", 35),
            }

        monkeypatch.setattr("app.modules.runner.router.record_verified_progress", fake_restored_rpc)

        res2 = await client.post(f"/api/v1/exercises/{exercise_id}/submit", json=payload)
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2["status"] == "PASSED"
        assert data2["xp_awarded"] == 35, "Al restaurar la RPC debe otorgarse el XP legítimo no acreditado previamente"
        assert "35 xp acreditados" in data2["message"].lower()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_contingency_mode_with_realistic_pgrst202_postgrest_error(client: AsyncClient, monkeypatch):
    """
    Fase 11.3: Simulación realista del error PostgREST PGRST202 (función no encontrada en caché de esquema),
    típico ante rollback o desincronización de PostgREST, verificado sin tocar Supabase Cloud:
    1. Invoca directamente record_verified_progress con transporte mock HTTP 404 (PGRST202).
    2. Invoca el endpoint /api/v1/exercises/{exercise_id}/submit con un usuario autenticado.
    3. Verifica que la práctica en Sandbox devuelve status='PASSED', no arroja HTTP 500,
       establece estrictamente xp_awarded=0 e informa la advertencia de contingencia.
    """
    postgrest_pgrst202_payload = {
        "code": "PGRST202",
        "details": None,
        "hint": "If a new function was created in the database with this name and parameters, try reloading the schema cache.",
        "message": "Could not find the function public.record_verified_attempt(execution_time_ms, hints_used, p_error_message, p_exercise_id, p_hints_used, p_status, p_submitted_sql, p_user_id, p_xp_to_award, status, submitted_sql) in the schema cache",
    }

    # Asegurar que las variables de entorno de Supabase simulan estar configuradas
    monkeypatch.setattr(settings, "SUPABASE_URL", "https://mock-test-project.supabase.co")
    monkeypatch.setattr(settings, "SUPABASE_SERVICE_ROLE_KEY", "mock_service_role_secret_token_12345")

    # Mockear httpx.AsyncClient.post para interceptar exclusivamente la llamada a Supabase RPC
    original_post = httpx.AsyncClient.post

    async def mock_post(self, url, *args, **kwargs):
        if "record_verified_attempt" in str(url):
            return httpx.Response(
                status_code=404,
                json=postgrest_pgrst202_payload,
                request=httpx.Request("POST", str(url)),
            )
        return await original_post(self, url, *args, **kwargs)

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    # 1. Invocación directa a record_verified_progress
    direct_res = await record_verified_progress(
        user_id="usr_mock_pgrst202",
        exercise_id="e0000000-0000-0000-0000-000000000001",
        submitted_sql="SELECT 1;",
        status="PASSED",
        execution_time_ms=12,
        xp_to_award=30,
    )
    assert direct_res["success"] is False
    assert direct_res["contingency_mode"] is True
    assert direct_res["xp_awarded"] == 0
    assert "PGRST202" in direct_res["error"]

    # 2. Invocación a través del endpoint FastAPI /submit con usuario autenticado
    exercise_id = "e0000000-0000-0000-0000-000000000002"
    payload = {
        "query": "SELECT nombre_producto, precio, stock FROM productos WHERE precio > 500;",
        "hints_revealed": 0,
    }
    app.dependency_overrides[get_optional_current_user] = lambda: AuthenticatedUser(
        id="usr_mock_pgrst202", email="student_pgrst@qurio.dev", role="authenticated", is_guest=False
    )
    try:
        response = await client.post(f"/api/v1/exercises/{exercise_id}/submit", json=payload)
        # Comprobar que no hay 500 y que la consulta en sandbox fue evaluada exitosamente
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "PASSED"
        assert data["xp_awarded"] == 0, "No se debe conceder XP cuando PostgREST reporta PGRST202"
        assert "contingencia" in data["message"].lower()
        assert "no está disponible temporalmente" in data["message"].lower()
    finally:
        app.dependency_overrides.clear()


