import time
import asyncpg
from decimal import Decimal
from datetime import date, datetime
import uuid
from typing import Any, List, Optional
import logging

from app.core.config import settings
from app.modules.runner.schemas import ColumnInfo, ExecutionResult
from app.modules.runner.security import validate_sql_security, enforce_row_limit

logger = logging.getLogger(__name__)


def serialize_value(val: Any) -> Any:
    """Convierte tipos de PostgreSQL/asyncpg en tipos serializables JSON."""
    if val is None:
        return None
    if isinstance(val, (int, float, str, bool)):
        return val
    if isinstance(val, Decimal):
        return float(val)
    if isinstance(val, (datetime, date)):
        return val.isoformat()
    if isinstance(val, uuid.UUID):
        return str(val)
    return str(val)


class SandboxRunner:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None

    async def initialize(self):
        """Inicializa el pool de conexiones hacia el sandbox de PostgreSQL."""
        if not self.pool:
            try:
                self.pool = await asyncpg.create_pool(
                    host=settings.SANDBOX_DB_HOST,
                    port=settings.SANDBOX_DB_PORT,
                    database=settings.SANDBOX_DB_NAME,
                    user=settings.SANDBOX_DB_USER,
                    password=settings.SANDBOX_DB_PASSWORD,
                    min_size=2,
                    max_size=settings.SANDBOX_MAX_CONNECTIONS,
                    command_timeout=settings.SANDBOX_STATEMENT_TIMEOUT_MS / 1000.0,
                )
                logger.info("Pool de conexiones con Sandbox PostgreSQL inicializado.")
            except Exception as e:
                logger.error(f"Error al conectar con Sandbox PostgreSQL: {e}")
                raise

    async def close(self):
        """Cierra el pool de conexiones."""
        if self.pool:
            await self.pool.close()
            logger.info("Pool de conexiones con Sandbox cerrado.")

    async def execute_query(self, sql: str) -> ExecutionResult:
        """
        Ejecuta una consulta SQL segura en el sandbox y devuelve los datos tipados.
        """
        # 1. Validación de seguridad previa
        is_safe, error_msg = validate_sql_security(sql)
        if not is_safe:
            return ExecutionResult(
                status="ERROR",
                execution_time_ms=0.0,
                error=error_msg,
            )

        # 2. Forzar límite de filas
        sanitized_sql = enforce_row_limit(sql, max_rows=settings.SANDBOX_MAX_ROWS)

        if not self.pool:
            await self.initialize()

        start_time = time.perf_counter()
        try:
            async with self.pool.acquire() as conn:
                # Abrir transacción de solo lectura con timeout forzado
                async with conn.transaction(readonly=True):
                    # Timeout forzado por sentencia en milisegundos
                    await conn.execute(f"SET LOCAL statement_timeout = '{settings.SANDBOX_STATEMENT_TIMEOUT_MS}ms';")
                    
                    # Preparar y ejecutar la sentencia
                    statement = await conn.prepare(sanitized_sql)
                    columns: List[ColumnInfo] = [
                        ColumnInfo(name=attr.name, type=attr.type.name)
                        for attr in statement.get_attributes()
                    ]
                    
                    records = await statement.fetch()
                    execution_time = (time.perf_counter() - start_time) * 1000.0

                    rows = [
                        [serialize_value(rec[col.name]) for col in columns]
                        for rec in records
                    ]

                    return ExecutionResult(
                        status="SUCCESS",
                        execution_time_ms=round(execution_time, 2),
                        row_count=len(rows),
                        columns=columns,
                        rows=rows,
                    )

        except asyncpg.QueryCanceledError:
            execution_time = (time.perf_counter() - start_time) * 1000.0
            return ExecutionResult(
                status="ERROR",
                execution_time_ms=round(execution_time, 2),
                error=f"Tiempo de ejecución excedido (Límite: {settings.SANDBOX_STATEMENT_TIMEOUT_MS}ms). Optimiza tu consulta.",
            )
        except asyncpg.PostgresError as e:
            execution_time = (time.perf_counter() - start_time) * 1000.0
            return ExecutionResult(
                status="ERROR",
                execution_time_ms=round(execution_time, 2),
                error=f"Error de base de datos ({e.__class__.__name__}): {e.message}",
            )
        except Exception as e:
            execution_time = (time.perf_counter() - start_time) * 1000.0
            return ExecutionResult(
                status="ERROR",
                execution_time_ms=round(execution_time, 2),
                error=f"Error inesperado al ejecutar consulta: {str(e)}",
            )


sandbox_runner = SandboxRunner()
