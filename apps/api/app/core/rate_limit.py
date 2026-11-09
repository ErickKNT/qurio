import time
import asyncio
from typing import Dict, Tuple, Optional
import logging
from fastapi import Request, HTTPException, status

from app.core.config import settings
from app.core.auth import AuthenticatedUser

logger = logging.getLogger(__name__)


class InMemoryRateLimiter:
    """
    Controlador de tasa en memoria (Sliding Window Log) para desarrollo local y single-instance.
    Estructurado con interfaz desacoplada para admitir Redis en producción multi-nodo.
    """
    def __init__(self):
        # key -> list of timestamp floats
        self._history: Dict[str, list] = {}
        self._lock = asyncio.Lock()

    async def check_and_increment(
        self, key: str, max_requests: int, window_seconds: int = 60
    ) -> Tuple[bool, int, int]:
        """
        Retorna (is_allowed, remaining_requests, retry_after_seconds).
        """
        now = time.time()
        cutoff = now - window_seconds

        async with self._lock:
            timestamps = self._history.get(key, [])
            # Limpiar marcas de tiempo fuera de la ventana
            timestamps = [t for t in timestamps if t > cutoff]

            if len(timestamps) >= max_requests:
                earliest = timestamps[0]
                retry_after = max(1, int(earliest + window_seconds - now))
                self._history[key] = timestamps
                return False, 0, retry_after

            timestamps.append(now)
            self._history[key] = timestamps
            remaining = max_requests - len(timestamps)
            return True, remaining, 0

    async def cleanup_expired(self, max_idle_seconds: int = 300):
        """Limpia periódicamente claves obsoletas para no acumular memoria."""
        now = time.time()
        cutoff = now - max_idle_seconds
        async with self._lock:
            expired_keys = [
                k for k, v in self._history.items() if not v or v[-1] < cutoff
            ]
            for k in expired_keys:
                del self._history[k]


# Instancia singleton del rate limiter en memoria
rate_limiter = InMemoryRateLimiter()

# Semáforo global para protección del pool de conexiones ante avalanchas de concurrencia
concurrency_semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_QUERIES)


def get_client_ip(request: Request) -> str:
    """Extrae la IP real del cliente considerando cabeceras de proxy (X-Forwarded-For)."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # Tomar la primera IP de la lista
        return forwarded.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"


async def check_rate_limit(request: Request, user: AuthenticatedUser):
    """
    Aplica límites diferenciados según el tipo de sesión:
    - Invitado (Guest): Identificado por IP, límite estricto (ej. 20 peticiones/min).
    - Autenticado: Identificado por User ID, cuota ampliada (ej. 120 peticiones/min).
    """
    if user.is_guest:
        ip = get_client_ip(request)
        key = f"rl:guest:ip:{ip}"
        limit = settings.RATE_LIMIT_GUEST_PER_MINUTE
    else:
        key = f"rl:auth:uid:{user.id}"
        limit = settings.RATE_LIMIT_AUTH_PER_MINUTE

    is_allowed, remaining, retry_after = await rate_limiter.check_and_increment(
        key=key,
        max_requests=limit,
        window_seconds=60,
    )

    if not is_allowed:
        user_type = "invitado" if user.is_guest else "usuario"
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Límite de solicitudes excedido para {user_type}. Por favor espera {retry_after} segundos.",
            headers={"Retry-After": str(retry_after)},
        )
