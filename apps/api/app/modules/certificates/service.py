from datetime import datetime, timezone
import hashlib
import logging
from typing import Dict, List, Optional, Set
from urllib.parse import quote_plus
import uuid

from fastapi import HTTPException, status
import httpx

from app.core.auth import AuthenticatedUser
from app.core.config import settings
from app.modules.curriculum.seed_data import SEED_EXERCISES
from app.modules.certificates.schemas import CertificateDTO, CertificateIssueRequest

logger = logging.getLogger(__name__)

# Respaldo en memoria para entornos locales sin Supabase Cloud o sin migración 05 ejecutada
_LOCAL_CERT_BY_KEY: Dict[str, dict] = {}
_LOCAL_CERT_BY_CODE: Dict[str, dict] = {}


def build_linkedin_add_url(cert_name: str, issued_at: datetime, verify_url: str, cert_id: str) -> str:
    """Construye la URL oficial de LinkedIn 'Add to profile' para Licencias y certificaciones."""
    return (
        "https://www.linkedin.com/profile/add"
        "?startTask=CERTIFICATION_NAME"
        f"&name={quote_plus(cert_name)}"
        f"&organizationName={quote_plus('Qurio')}"
        f"&issueYear={issued_at.year}"
        f"&issueMonth={issued_at.month}"
        f"&certUrl={quote_plus(verify_url)}"
        f"&certId={quote_plus(cert_id)}"
    )


def _generate_verification_code(user_id: str, track_id: str, is_qa_preview: bool) -> str:
    prefix = "QURIO-QA" if is_qa_preview else "QURIO"
    year = datetime.now(timezone.utc).year
    digest = hashlib.sha256(f"{user_id}:{track_id}:{is_qa_preview}".encode("utf-8")).hexdigest()[:6].upper()
    return f"{prefix}-{year}-{digest}"


_TRACK_MODULES_COUNT: Dict[str, int] = {
    "sql-foundations": 4,
    "relational-sql": 4,
    "advanced-queries": 4,
    "data-manipulation-ddl": 4,
    "global-curriculum": 16,
}

_TRACK_SKILLS_MAP: Dict[str, List[str]] = {
    "sql-foundations": [
        "Sintaxis ANSI SQL",
        "Proyección SELECT & Alias",
        "Filtros WHERE, BETWEEN & IN",
        "Ordenamiento ORDER BY & LIMIT",
        "Funciones Escalares de Texto y Fecha",
        "Agregación GROUP BY & HAVING",
    ],
    "relational-sql": [
        "Modelo Relacional & Claves FK",
        "INNER JOIN Multi-Tabla",
        "Detección de Ausencias (LEFT JOIN + NULL)",
        "COALESCE & Normalización 3NF",
        "Operaciones de Conjunto (UNION / EXCEPT)",
        "CROSS JOIN & Auto-uniones (SELF JOIN)",
    ],
    "advanced-queries": [
        "Subconsultas Correlacionadas",
        "Predicados EXISTS & NOT EXISTS",
        "Lógica Condicional CASE WHEN",
        "CTEs Temporales (WITH)",
        "Funciones de Ventana (OVER, PARTITION BY)",
        "Ranking & Análisis Temporal (LAG / SUM OVER)",
    ],
    "data-manipulation-ddl": [
        "Inserción Transaccional (INSERT & RETURNING)",
        "Poblamiento Analítico (INSERT INTO ... SELECT)",
        "Actualización Cruzada (UPDATE ... FROM)",
        "Depuración Segura (DELETE & Integridad FK)",
        "Diseño de Esquemas (CREATE/ALTER/DROP & CHECK)",
        "Indexación B-Tree, Compuesta y Parcial (WHERE)",
    ],
    "global-curriculum": [
        "Sintaxis ANSI SQL & DQL",
        "INNER, LEFT & SELF JOINS",
        "Agrupación GROUP BY & HAVING",
        "Subconsultas, CTEs & Window Functions",
        "Manipulación DML (INSERT, UPDATE, DELETE, RETURNING)",
        "Diseño DDL, Restricciones & Índices B-Tree",
        "Evaluación PostgreSQL 16 Sandbox",
    ],
}


def _row_to_dto(row: dict, base_url: str) -> CertificateDTO:
    code = row["verification_code"]
    issued_raw = row["issued_at"]
    if isinstance(issued_raw, str):
        issued_dt = datetime.fromisoformat(issued_raw.replace("Z", "+00:00"))
    else:
        issued_dt = issued_raw

    clean_base = (base_url or "http://localhost:5173").rstrip("/")
    verify_url = f"{clean_base}/verify/{code}"
    api_prefix = settings.API_V1_PREFIX.rstrip("/")
    pdf_url = f"{api_prefix}/certificates/{code}/pdf"
    qr_svg_url = f"{api_prefix}/certificates/{code}/qr.svg"
    linkedin_url = build_linkedin_add_url(
        cert_name=f"{row['track_title']} (SQL PostgreSQL 16)",
        issued_at=issued_dt,
        verify_url=verify_url,
        cert_id=code,
    )
    completed = int(row["completed_exercises"])
    total = int(row["total_exercises"])
    track_id = row["track_id"]
    sha256_hash = hashlib.sha256(
        f"{code}|{row['user_id']}|{track_id}|{completed}/{total}|{issued_dt.isoformat()}".encode("utf-8")
    ).hexdigest()

    return CertificateDTO(
        id=str(row["id"]),
        user_id=str(row["user_id"]),
        track_id=track_id,
        track_title=row["track_title"],
        recipient_name=row["recipient_name"],
        verification_code=code,
        completed_exercises=completed,
        total_exercises=total,
        is_qa_preview=bool(row.get("is_qa_preview", False)),
        issued_at=issued_dt,
        verify_url=verify_url,
        pdf_url=pdf_url,
        linkedin_url=linkedin_url,
        sha256_hash=sha256_hash,
        modules_count=_TRACK_MODULES_COUNT.get(track_id, 4),
        validated_skills=_TRACK_SKILLS_MAP.get(track_id, _TRACK_SKILLS_MAP["global-curriculum"]),
        qr_svg_url=qr_svg_url,
    )


def _supabase_headers() -> Dict[str, str]:
    return {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }


_TRACK_PREFIX_MAP = {
    "sql-foundations": "a0000000-",
    "relational-sql": "b0000000-",
    "advanced-queries": "c0000000-",
    "data-manipulation-ddl": "d0000000-",
}


def _expected_exercise_ids_for_track(track_id: str) -> Set[str]:
    all_exercises = list(SEED_EXERCISES.values()) if isinstance(SEED_EXERCISES, dict) else list(SEED_EXERCISES)
    prefix = _TRACK_PREFIX_MAP.get(track_id)
    if prefix:
        return {ex.id for ex in all_exercises if ex.module_id.startswith(prefix)}
    return {ex.id for ex in all_exercises}


async def _get_user_passed_exercise_ids(user_id: str) -> Set[str]:
    """Consulta en Supabase Cloud los IDs de ejercicios únicos aprobados por el usuario."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return set()

    url = (
        f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/exercise_attempts"
        f"?user_id=eq.{user_id}&status=eq.PASSED&select=exercise_id"
    )
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(url, headers=_supabase_headers())
            if res.status_code == 200:
                rows = res.json()
                return {r["exercise_id"] for r in rows if r.get("exercise_id")}
    except Exception as e:
        logger.warning(f"No se pudo consultar exercise_attempts en Supabase: {e}")
    return set()


async def issue_certificate_for_user(
    user: AuthenticatedUser,
    payload: CertificateIssueRequest,
    default_base_url: str = "http://localhost:5173",
) -> CertificateDTO:
    is_admin = (user.app_metadata or {}).get("role") == "admin"
    if payload.qa_preview and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden emitir constancias en modo QA.",
        )

    expected_ids = _expected_exercise_ids_for_track(payload.track_id)
    target_total = len(expected_ids) if expected_ids else payload.total_exercises
    passed_ids = await _get_user_passed_exercise_ids(user.id)
    track_passed_count = len(passed_ids & expected_ids) if expected_ids else len(passed_ids)

    if not (is_admin and payload.qa_preview):
        if track_passed_count < target_total:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Aún no completas esta ruta ({track_passed_count}/{target_total} retos aprobados)."
                ),
            )

    completed_val = target_total if (is_admin and payload.qa_preview) else track_passed_count
    effective_total = target_total
    recipient = (payload.recipient_name or "").strip() or (
        user.email.split("@")[0] if user.email else "Estudiante Qurio"
    )
    base_url = (payload.verify_base_url or default_base_url).rstrip("/")
    cert_key = f"{user.id}:{payload.track_id}"
    code = _generate_verification_code(user.id, payload.track_id, payload.qa_preview)

    # 1. Intentar leer/emitir de forma idempotente en Supabase Cloud
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        rest_url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/user_certificates"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                existing_res = await client.get(
                    f"{rest_url}?user_id=eq.{user.id}&track_id=eq.{payload.track_id}&select=*",
                    headers=_supabase_headers(),
                )
                if existing_res.status_code == 200 and existing_res.json():
                    row = existing_res.json()[0]
                    _LOCAL_CERT_BY_KEY[cert_key] = row
                    _LOCAL_CERT_BY_CODE[row["verification_code"]] = row
                    return _row_to_dto(row, base_url)

                insert_body = {
                    "user_id": user.id,
                    "track_id": payload.track_id,
                    "track_title": payload.track_title,
                    "recipient_name": recipient,
                    "verification_code": code,
                    "completed_exercises": completed_val,
                    "total_exercises": effective_total,
                    "is_qa_preview": bool(payload.qa_preview and is_admin),
                }
                headers = {**_supabase_headers(), "Prefer": "return=representation"}
                ins_res = await client.post(rest_url, json=insert_body, headers=headers)
                if ins_res.status_code in (200, 201) and ins_res.json():
                    row = ins_res.json()[0]
                    _LOCAL_CERT_BY_KEY[cert_key] = row
                    _LOCAL_CERT_BY_CODE[row["verification_code"]] = row
                    return _row_to_dto(row, base_url)
                logger.warning(
                    f"Supabase user_certificates no disponible ({ins_res.status_code}); usando almacén local: {ins_res.text}"
                )
        except Exception as e:
            logger.warning(f"Error al persistir constancia en Supabase, usando respaldo local: {e}")

    # 2. Respaldo en memoria (idempotente por usuario + ruta)
    if cert_key in _LOCAL_CERT_BY_KEY:
        existing = _LOCAL_CERT_BY_KEY[cert_key]
        return _row_to_dto(existing, base_url)

    local_row = {
        "id": str(uuid.uuid4()),
        "user_id": user.id,
        "track_id": payload.track_id,
        "track_title": payload.track_title,
        "recipient_name": recipient,
        "verification_code": code,
        "completed_exercises": completed_val,
        "total_exercises": effective_total,
        "is_qa_preview": bool(payload.qa_preview and is_admin),
        "issued_at": datetime.now(timezone.utc).isoformat(),
    }
    _LOCAL_CERT_BY_KEY[cert_key] = local_row
    _LOCAL_CERT_BY_CODE[code] = local_row
    return _row_to_dto(local_row, base_url)


async def list_user_certificates(
    user_id: str,
    default_base_url: str = "http://localhost:5173",
) -> List[CertificateDTO]:
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        rest_url = (
            f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/user_certificates"
            f"?user_id=eq.{user_id}&order=issued_at.desc&select=*"
        )
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(rest_url, headers=_supabase_headers())
                if res.status_code == 200:
                    return [_row_to_dto(r, default_base_url) for r in res.json()]
        except Exception as e:
            logger.warning(f"No se pudo listar user_certificates en Supabase: {e}")

    local_rows = [r for r in _LOCAL_CERT_BY_KEY.values() if r["user_id"] == user_id]
    return [_row_to_dto(r, default_base_url) for r in local_rows]


async def get_certificate_by_code(
    verification_code: str,
    default_base_url: str = "http://localhost:5173",
) -> Optional[CertificateDTO]:
    clean_code = verification_code.strip()
    if clean_code in _LOCAL_CERT_BY_CODE:
        return _row_to_dto(_LOCAL_CERT_BY_CODE[clean_code], default_base_url)

    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        rest_url = (
            f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/user_certificates"
            f"?verification_code=eq.{clean_code}&select=*"
        )
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(rest_url, headers=_supabase_headers())
                if res.status_code == 200 and res.json():
                    row = res.json()[0]
                    _LOCAL_CERT_BY_CODE[clean_code] = row
                    return _row_to_dto(row, default_base_url)
        except Exception as e:
            logger.warning(f"No se pudo verificar código '{clean_code}' en Supabase: {e}")

    return None
