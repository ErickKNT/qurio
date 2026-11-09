import logging
from typing import Optional, Dict, Any
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


async def record_verified_progress(
    user_id: str,
    exercise_id: str,
    submitted_sql: str,
    status: str,
    execution_time_ms: int,
    error_message: Optional[str] = None,
    hints_used: int = 0,
    xp_to_award: int = 0,
) -> Dict[str, Any]:
    """
    Invoca la función RPC protegida 'record_verified_attempt' en Supabase
    utilizando exclusivamente la credencial service_role desde el backend.
    
    Garantiza idempotencia y que el cliente frontend no pueda otorgarse XP.
    """
    if not settings.SUPABASE_SERVICE_ROLE_KEY or not settings.SUPABASE_URL:
        logger.warning(
            "SUPABASE_SERVICE_ROLE_KEY no configurado en backend. Omitiendo persistencia remota de intento verificado."
        )
        return {
            "success": False,
            "already_passed": False,
            "xp_awarded": xp_to_award,
            "reason": "service_role_key_not_configured",
        }

    rpc_url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/rpc/record_verified_attempt"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    payload = {
        "p_user_id": user_id,
        "p_exercise_id": exercise_id,
        "p_submitted_sql": submitted_sql,
        "p_status": status,
        "p_execution_time_ms": execution_time_ms,
        "p_error_message": error_message,
        "p_hints_used": hints_used,
        "p_xp_to_award": xp_to_award,
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(rpc_url, json=payload, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(
                    f"Fallo en Supabase RPC record_verified_attempt ({response.status_code}): {response.text}"
                )
                return {
                    "success": False,
                    "already_passed": False,
                    "xp_awarded": xp_to_award,
                    "error": response.text,
                }
    except Exception as e:
        logger.error(f"Error de red o comunicación al invocar Supabase RPC: {e}")
        return {
            "success": False,
            "already_passed": False,
            "xp_awarded": xp_to_award,
            "error": str(e),
        }
