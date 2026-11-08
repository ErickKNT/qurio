import pytest
from httpx import AsyncClient


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
async def test_submit_exercise_success(client: AsyncClient):
    # Ejercicio 1: Catálogo Básico de Productos (SELECT nombre_producto, precio FROM productos)
    exercise_id = "e0000000-0000-0000-0000-000000000001"
    payload = {
        "query": "SELECT nombre_producto, precio FROM productos;",
        "hints_revealed": 0
    }
    response = await client.post(f"/api/v1/exercises/{exercise_id}/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PASSED"
    assert data["xp_awarded"] == 30
    assert data["diff"] is None


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
async def test_submit_exercise_star_challenge_left_join(client: AsyncClient):
    # Reto Estrella: Clientes inactivos sin compras
    exercise_id = "e0000000-0000-0000-0000-000000000006"
    payload = {
        "query": "SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id WHERE p.pedido_id IS NULL;",
        "hints_revealed": 1  # Usó 1 pista -> penalización
    }
    response = await client.post(f"/api/v1/exercises/{exercise_id}/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PASSED"
    # Base 50 XP con 1 pista (-15%) -> 42 XP
    assert data["xp_awarded"] == 42
