import pytest
from httpx import AsyncClient

from app.main import app
from app.core.auth import AuthenticatedUser, get_optional_current_user


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
async def test_submit_exercise_success_authenticated(client: AsyncClient):
    # Ejercicio 1 evaluado como usuario autenticado: recibe XP oficial acreditado
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
async def test_submit_exercise_star_challenge_left_join_authenticated(client: AsyncClient):
    # Reto Estrella evaluado con usuario autenticado
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
        return {"success": True, "already_passed": False}

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


