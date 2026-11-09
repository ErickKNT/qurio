import pytest
from httpx import AsyncClient
from app.core.config import settings
from app.core.rate_limit import rate_limiter


@pytest.mark.asyncio
async def test_guest_rate_limit(client: AsyncClient):
    """Verifica que el límite de tasa por IP bloquee peticiones excesivas."""
    # Reset del rate limiter
    rate_limiter._history.clear()

    payload = {"query": "SELECT 1;", "database": "ecommerce_sandbox"}
    limit = settings.RATE_LIMIT_GUEST_PER_MINUTE

    # Realizar solicitudes hasta el límite
    for i in range(limit):
        res = await client.post("/api/v1/playground/execute", json=payload)
        assert res.status_code == 200, f"Petición {i+1} debió ser aceptada"

    # La siguiente petición debe ser rechazada con HTTP 429
    res = await client.post("/api/v1/playground/execute", json=payload)
    assert res.status_code == 429
    data = res.json()
    assert "Límite de solicitudes excedido" in data["detail"]
    assert "Retry-After" in res.headers

    # Limpiar para no afectar otras pruebas
    rate_limiter._history.clear()
