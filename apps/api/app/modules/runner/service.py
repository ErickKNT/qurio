import asyncio
import time
import asyncpg
from decimal import Decimal
from datetime import date, datetime
import uuid
from typing import Any, Dict, List, Optional
import logging

from app.core.config import settings
from app.core.rate_limit import concurrency_semaphore
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
    MIN_POOL_SIZE = 2

    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
        self._pool_lock = asyncio.Lock()

    async def initialize(self):
        """Inicializa el pool de conexiones hacia el sandbox de PostgreSQL."""
        async with self._pool_lock:
            if not self.pool:
                try:
                    self.pool = await asyncpg.create_pool(
                        host=settings.SANDBOX_DB_HOST,
                        port=settings.SANDBOX_DB_PORT,
                        database=settings.SANDBOX_DB_NAME,
                        user=settings.SANDBOX_DB_USER,
                        password=settings.SANDBOX_DB_PASSWORD,
                        min_size=self.MIN_POOL_SIZE,
                        max_size=settings.SANDBOX_MAX_CONNECTIONS,
                        command_timeout=settings.SANDBOX_STATEMENT_TIMEOUT_MS / 1000.0,
                        timeout=3.0,
                    )
                    logger.info("Pool de conexiones con Sandbox PostgreSQL inicializado.")
                except Exception as e:
                    logger.error(f"Error al conectar con Sandbox PostgreSQL: {e}")
                    raise

    async def close(self):
        """Cierra el pool de conexiones."""
        async with self._pool_lock:
            if self.pool:
                await self.pool.close()
                self.pool = None
                logger.info("Pool de conexiones con Sandbox cerrado.")

    async def recycle_pool(self) -> Dict[str, Any]:
        """Cierra limpiamente y reconstruye el pool asyncpg sin reiniciar el contenedor."""
        await self.close()
        await self.initialize()
        return self.get_pool_metrics()

    def get_pool_metrics(self) -> Dict[str, Any]:
        """Devuelve métricas en vivo del pool asyncpg y cola de concurrencia."""
        waiters = getattr(concurrency_semaphore, "_waiters", None)
        queued = sum(1 for w in waiters if not w.done()) if waiters else 0
        if not self.pool:
            return {
                "initialized": False,
                "total_connections": 0,
                "idle_connections": 0,
                "active_connections": 0,
                "queued_requests": queued,
                "min_size": self.MIN_POOL_SIZE,
                "max_size": settings.SANDBOX_MAX_CONNECTIONS,
            }

        total = self.pool.get_size()
        idle = self.pool.get_idle_size()
        active = max(0, total - idle)
        return {
            "initialized": True,
            "total_connections": total,
            "idle_connections": idle,
            "active_connections": active,
            "queued_requests": queued,
            "min_size": self.pool.get_min_size(),
            "max_size": self.pool.get_max_size(),
        }

    async def _acquire_admin_connection(self) -> Optional[asyncpg.Connection]:
        """Abre una conexión directa de sistema si hay credenciales administrativas configuradas."""
        if settings.SANDBOX_ADMIN_DB_USER and settings.SANDBOX_ADMIN_DB_PASSWORD:
            return await asyncpg.connect(
                host=settings.SANDBOX_DB_HOST,
                port=settings.SANDBOX_DB_PORT,
                database=settings.SANDBOX_DB_NAME,
                user=settings.SANDBOX_ADMIN_DB_USER,
                password=settings.SANDBOX_ADMIN_DB_PASSWORD,
                timeout=3.0,
            )
        return None

    async def get_active_queries(self) -> List[Dict[str, Any]]:
        """Consulta pg_stat_activity en el Sandbox PostgreSQL para detectar consultas en vuelo."""
        query = """
            SELECT
                pid,
                usename,
                COALESCE(host(client_addr), 'local') AS client_addr,
                ROUND((EXTRACT(EPOCH FROM (now() - query_start)) * 1000)::numeric, 2) AS duration_ms,
                COALESCE(state, 'unknown') AS state,
                LEFT(query, 500) AS query
            FROM pg_catalog.pg_stat_activity
            WHERE datname = $1
              AND state != 'idle'
              AND pid != pg_backend_pid()
            ORDER BY query_start ASC NULLS LAST;
        """
        admin_conn = await self._acquire_admin_connection()
        if admin_conn is not None:
            try:
                rows = await admin_conn.fetch(query, settings.SANDBOX_DB_NAME)
            finally:
                await admin_conn.close()
        else:
            if not self.pool:
                await self.initialize()
            async with self.pool.acquire() as conn:
                rows = await conn.fetch(query, settings.SANDBOX_DB_NAME)

        return [
            {
                "pid": int(r["pid"]),
                "usename": str(r["usename"] or ""),
                "client_addr": str(r["client_addr"] or "local"),
                "duration_ms": float(r["duration_ms"] or 0.0),
                "state": str(r["state"] or ""),
                "query": str(r["query"] or ""),
            }
            for r in rows
        ]

    async def cancel_backend_pid(self, pid: int) -> bool:
        """Ejecuta pg_cancel_backend(pid) de forma parametrizada en el Sandbox."""
        admin_conn = await self._acquire_admin_connection()
        if admin_conn is not None:
            try:
                cancelled = await admin_conn.fetchval("SELECT pg_catalog.pg_cancel_backend($1::int);", pid)
                return bool(cancelled)
            finally:
                await admin_conn.close()

        if not self.pool:
            await self.initialize()
        async with self.pool.acquire() as conn:
            cancelled = await conn.fetchval("SELECT pg_catalog.pg_cancel_backend($1::int);", pid)
            return bool(cancelled)

    async def measure_rtt_ms(self) -> float:
        """Mide latencia de ida y vuelta (RTT) en ms contra el Sandbox con SELECT 1;."""
        if not self.pool:
            await self.initialize()
        start = time.perf_counter()
        async with self.pool.acquire() as conn:
            await conn.fetchval("SELECT 1;")
        return round((time.perf_counter() - start) * 1000.0, 2)

    async def execute_query(
        self,
        sql: str,
        client_ip: str = "unknown",
        user_id: str = "guest",
    ) -> ExecutionResult:
        """
        Ejecuta una consulta SQL segura en el sandbox y devuelve los datos tipados.
        """
        # 1. Validación de seguridad previa (con trazabilidad AST para auditoría)
        is_safe, error_msg = validate_sql_security(
            sql,
            client_ip=client_ip,
            user_id=user_id,
        )
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

        except (asyncpg.QueryCanceledError, asyncio.TimeoutError, TimeoutError):
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
