from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.modules.runner.service import sandbox_runner
from app.modules.runner.router import router as runner_router

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("qurio-api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manejo del ciclo de vida de la aplicación: inicialización y cierre de conexiones."""
    logger.info("Iniciando Qurio API...")
    try:
        await sandbox_runner.initialize()
        logger.info("Pool de PostgreSQL Sandbox listo.")
    except Exception as e:
        logger.warning(
            f"No se pudo conectar al sandbox PostgreSQL durante el arranque: {e}. "
            "Se reintentará en la primera ejecución de consulta."
        )

    yield

    logger.info("Cerrando Qurio API...")
    await sandbox_runner.close()
    logger.info("Conexiones de PostgreSQL cerradas correctamente.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Motor de ejecución y evaluación semántica SQL para Qurio.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers modulares
app.include_router(runner_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["General"])
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health",
    }
