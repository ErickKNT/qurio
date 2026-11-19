import asyncio
import time
import asyncpg
from decimal import Decimal
from datetime import date, datetime
import uuid
from typing import Any, Dict, List, Optional, Union
import logging

from app.core.config import settings
from app.core.rate_limit import concurrency_semaphore
from app.modules.runner.schemas import ColumnInfo, ExecutionMode, ExecutionResult
from app.modules.runner.security import validate_sql_security, enforce_row_limit

logger = logging.getLogger(__name__)

# Script determinista de inicialización efímera en pg_temp para retos DML/DDL (Ruta 4).
# Clona las 10 tablas canónicas de public.* dentro del esquema temporal de la sesión (pg_temp)
# con secuencias propias reiniciadas y restricciones de integridad, de modo que toda operación
# INSERT/UPDATE/DELETE/CREATE/ALTER/DROP se ejecute en memoria sin bloquear ni tocar public.*.
EPHEMERAL_PG_TEMP_SEED_SQL = """
SET LOCAL search_path TO pg_temp, public;

CREATE TEMP TABLE clientes (
    cliente_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    pais VARCHAR(50) NOT NULL,
    fecha_registro DATE NOT NULL
) ON COMMIT DROP;
INSERT INTO pg_temp.clientes SELECT * FROM public.clientes;
SELECT setval(pg_get_serial_sequence('pg_temp.clientes', 'cliente_id'), 15, true);

CREATE TEMP TABLE categorias (
    categoria_id SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL,
    descripcion TEXT
) ON COMMIT DROP;
INSERT INTO pg_temp.categorias SELECT * FROM public.categorias;
SELECT setval(pg_get_serial_sequence('pg_temp.categorias', 'categoria_id'), 5, true);

CREATE TEMP TABLE proveedores (
    proveedor_id SERIAL PRIMARY KEY,
    nombre_proveedor VARCHAR(80) NOT NULL,
    pais VARCHAR(50) NOT NULL,
    telefono VARCHAR(25)
) ON COMMIT DROP;
INSERT INTO pg_temp.proveedores SELECT * FROM public.proveedores;
SELECT setval(pg_get_serial_sequence('pg_temp.proveedores', 'proveedor_id'), 5, true);

CREATE TEMP TABLE productos (
    producto_id SERIAL PRIMARY KEY,
    categoria_id INT REFERENCES pg_temp.categorias(categoria_id),
    proveedor_id INT REFERENCES pg_temp.proveedores(proveedor_id),
    nombre_producto VARCHAR(100) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0
) ON COMMIT DROP;
INSERT INTO pg_temp.productos SELECT * FROM public.productos;
SELECT setval(pg_get_serial_sequence('pg_temp.productos', 'producto_id'), 15, true);

CREATE TEMP TABLE almacenes (
    almacen_id SERIAL PRIMARY KEY,
    nombre_almacen VARCHAR(80) NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    capacidad_m2 INT NOT NULL
) ON COMMIT DROP;
INSERT INTO pg_temp.almacenes SELECT * FROM public.almacenes;
SELECT setval(pg_get_serial_sequence('pg_temp.almacenes', 'almacen_id'), 3, true);

CREATE TEMP TABLE inventario (
    almacen_id INT REFERENCES pg_temp.almacenes(almacen_id),
    producto_id INT REFERENCES pg_temp.productos(producto_id),
    cantidad_disponible INT NOT NULL,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (almacen_id, producto_id)
) ON COMMIT DROP;
INSERT INTO pg_temp.inventario SELECT * FROM public.inventario;

CREATE TEMP TABLE pedidos (
    pedido_id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES pg_temp.clientes(cliente_id),
    fecha_pedido DATE NOT NULL,
    estado_pedido VARCHAR(20) NOT NULL CHECK (estado_pedido IN ('completado', 'pendiente', 'cancelado', 'procesando')),
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00
) ON COMMIT DROP;
INSERT INTO pg_temp.pedidos SELECT * FROM public.pedidos;
SELECT setval(pg_get_serial_sequence('pg_temp.pedidos', 'pedido_id'), 115, true);

CREATE TEMP TABLE detalle_pedidos (
    detalle_id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pg_temp.pedidos(pedido_id) ON DELETE CASCADE,
    producto_id INT REFERENCES pg_temp.productos(producto_id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL
) ON COMMIT DROP;
INSERT INTO pg_temp.detalle_pedidos SELECT * FROM public.detalle_pedidos;
SELECT setval(pg_get_serial_sequence('pg_temp.detalle_pedidos', 'detalle_id'), 24, true);

CREATE TEMP TABLE facturas (
    factura_id SERIAL PRIMARY KEY,
    pedido_id INT UNIQUE REFERENCES pg_temp.pedidos(pedido_id),
    fecha_emision DATE NOT NULL,
    monto_total NUMERIC(10, 2) NOT NULL,
    estado_factura VARCHAR(20) NOT NULL CHECK (estado_factura IN ('pagada', 'pendiente', 'anulada'))
) ON COMMIT DROP;
INSERT INTO pg_temp.facturas SELECT * FROM public.facturas;
SELECT setval(pg_get_serial_sequence('pg_temp.facturas', 'factura_id'), 213, true);

CREATE TEMP TABLE pagos (
    pago_id SERIAL PRIMARY KEY,
    factura_id INT REFERENCES pg_temp.facturas(factura_id),
    metodo_pago VARCHAR(30) NOT NULL CHECK (metodo_pago IN ('tarjeta_credito', 'transferencia', 'paypal', 'efectivo')),
    monto NUMERIC(10, 2) NOT NULL,
    fecha_pago DATE NOT NULL,
    estado_pago VARCHAR(20) NOT NULL CHECK (estado_pago IN ('aprobado', 'rechazado', 'procesando'))
) ON COMMIT DROP;
INSERT INTO pg_temp.pagos SELECT * FROM public.pagos;
SELECT setval(pg_get_serial_sequence('pg_temp.pagos', 'pago_id'), 11, true);
"""


class _IntentionalSandboxRollback(Exception):
    """Excepción interna utilizada para forzar ROLLBACK limpio de toda transacción efímera en pg_temp."""

    def __init__(self, result: ExecutionResult):
        self.result = result


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
        mode: Union[ExecutionMode, str] = ExecutionMode.READ_ONLY,
        verification_query: Optional[str] = None,
        setup_sql: Optional[str] = None,
    ) -> ExecutionResult:
        """
        Ejecuta una consulta SQL segura en el sandbox y devuelve los datos tipados.
        - En modo READ_ONLY: abre una transacción readonly=True directa.
        - En modo DML o DDL: abre una transacción efímera READ WRITE aislada en pg_temp,
          ejecuta setup_sql (si existe), ejecuta la sentencia del estudiante, proyecta
          su RETURNING o verification_query, y fuerza ROLLBACK incondicional.
        """
        exec_mode = ExecutionMode(mode) if isinstance(mode, str) else mode

        # 1. Validación de seguridad previa (con trazabilidad AST para auditoría)
        is_safe, error_msg = validate_sql_security(
            sql,
            client_ip=client_ip,
            user_id=user_id,
            mode=exec_mode,
        )
        if not is_safe:
            return ExecutionResult(
                status="ERROR",
                execution_time_ms=0.0,
                error=error_msg,
            )

        if not self.pool:
            await self.initialize()

        # Flujo A: Modo de Solo Lectura (Rutas 1, 2, 3 y SQL Playground libre)
        if exec_mode == ExecutionMode.READ_ONLY:
            sanitized_sql = enforce_row_limit(sql, max_rows=settings.SANDBOX_MAX_ROWS)
            start_time = time.perf_counter()
            try:
                async with self.pool.acquire() as conn:
                    async with conn.transaction(readonly=True):
                        await conn.execute(f"SET LOCAL statement_timeout = '{settings.SANDBOX_STATEMENT_TIMEOUT_MS}ms';")
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

        # Flujo B: Modo Transaccional Efímero en pg_temp para DML y DDL (Ruta 4)
        start_time = time.perf_counter()
        try:
            async with self.pool.acquire() as conn:
                try:
                    async with conn.transaction(readonly=False):
                        await conn.execute("SET LOCAL transaction_read_only = off;")
                        await conn.execute(f"SET LOCAL statement_timeout = '{settings.SANDBOX_STATEMENT_TIMEOUT_MS}ms';")
                        await conn.execute("SET LOCAL lock_timeout = '500ms';")
                        await conn.execute("SET LOCAL work_mem = '16MB';")

                        # Clonar las 10 tablas canónicas y secuencias en pg_temp
                        await conn.execute(EPHEMERAL_PG_TEMP_SEED_SQL)
                        if setup_sql and setup_sql.strip():
                            await conn.execute(setup_sql)

                        query_start = time.perf_counter()

                        if verification_query and verification_query.strip():
                            await conn.execute(sql)
                            sanitized_verify = enforce_row_limit(
                                verification_query, max_rows=settings.SANDBOX_MAX_ROWS
                            )
                            verify_stmt = await conn.prepare(sanitized_verify)
                            columns = [
                                ColumnInfo(name=attr.name, type=attr.type.name)
                                for attr in verify_stmt.get_attributes()
                            ]
                            records = await verify_stmt.fetch()
                        else:
                            # El reto evalúa directamente la proyección devuelta por la sentencia (ej. RETURNING)
                            stmt = await conn.prepare(sql)
                            attrs = stmt.get_attributes()
                            if attrs:
                                columns = [
                                    ColumnInfo(name=attr.name, type=attr.type.name)
                                    for attr in attrs
                                ]
                                records = await stmt.fetch()
                            else:
                                await conn.execute(sql)
                                columns = []
                                records = []

                        execution_time = (time.perf_counter() - query_start) * 1000.0
                        rows = [
                            [serialize_value(rec[col.name]) for col in columns]
                            for rec in records
                        ]

                        raise _IntentionalSandboxRollback(
                            ExecutionResult(
                                status="SUCCESS",
                                execution_time_ms=round(execution_time, 2),
                                row_count=len(rows),
                                columns=columns,
                                rows=rows,
                            )
                        )
                except _IntentionalSandboxRollback as rb:
                    return rb.result

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
