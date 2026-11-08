import sys
from pathlib import Path
import pytest
from httpx import AsyncClient, ASGITransport

api_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(api_dir))

from app.main import app
from app.modules.runner.service import sandbox_runner


@pytest.fixture(scope="session", autouse=True)
async def init_sandbox_pool():
    """Inicializa y cierra el pool de asyncpg una sola vez para toda la sesión de pruebas."""
    await sandbox_runner.initialize()
    yield
    await sandbox_runner.close()


@pytest.fixture(scope="session")
async def client():
    """Cliente HTTP asíncrono compartido durante la sesión."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
