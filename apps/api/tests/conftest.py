import sys
from pathlib import Path
import pytest
from httpx import AsyncClient, ASGITransport

api_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(api_dir))

from app.main import app
from app.modules.runner.service import sandbox_runner


@pytest.fixture(scope="session")
async def sandbox_db():
    """
    Inicializa y verifica explícitamente el pool de conexiones de asyncpg para pruebas de integración.
    Si PostgreSQL Sandbox no está accesible, falla claramente en lugar de enmascarar el error.
    """
    try:
        await sandbox_runner.initialize()
    except Exception as exc:
        pytest.fail(
            f"Fallo de infraestructura: PostgreSQL Sandbox no disponible en localhost:5433 ({exc}). "
            "Inicia Docker con 'docker compose up -d' para ejecutar las pruebas de integración."
        )
    yield sandbox_runner
    if sandbox_runner.pool:
        await sandbox_runner.close()


@pytest.fixture(scope="session")
async def client(sandbox_db):
    """Cliente HTTP asíncrono para pruebas de integración con el Sandbox PostgreSQL verificado."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
