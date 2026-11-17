from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.core.auth import AuthenticatedUser, require_admin
from app.modules.admin.schemas import (
    AdminUsersPageResponse,
    AttemptsPageResponse,
    CancelQueryResponse,
    CurriculumMetricsResponse,
    KillswitchesRequest,
    KillswitchesResponse,
    LiveOpsResponse,
    PoolRecycleResponse,
    ReplayAttemptRequest,
    ReplayAttemptResponse,
    SecurityAuditResponse,
    UpdateUserBanRequest,
    UpdateUserRoleRequest,
    UserModerationResponse,
)
from app.modules.admin.service import admin_service

router = APIRouter(
    prefix="/admin",
    tags=["Admin & Live Ops"],
    dependencies=[Depends(require_admin)],
)


@router.get("/live-ops", response_model=LiveOpsResponse)
async def get_live_ops():
    """Métricas del pool asyncpg, pg_stat_activity en vivo, RTT y memoria RSS."""
    return await admin_service.get_live_ops()


@router.post("/sandbox/cancel-query/{pid}", response_model=CancelQueryResponse)
async def cancel_sandbox_query(pid: int):
    """Ejecuta pg_cancel_backend(pid) sobre una consulta en vuelo en el Sandbox."""
    return await admin_service.cancel_sandbox_query(pid)


@router.get("/curriculum/metrics", response_model=CurriculumMetricsResponse)
async def get_curriculum_metrics():
    """Observabilidad pedagógica agregada por reto y conversión de invitados M01."""
    return await admin_service.get_curriculum_metrics()


@router.get("/attempts", response_model=AttemptsPageResponse)
async def list_attempts(
    exercise_id: Optional[str] = Query(default=None),
    user_id: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    date_from: Optional[str] = Query(default=None),
    date_to: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
):
    """Listado paginado y filtrable de intentos de estudiantes para auditoría forense."""
    return await admin_service.list_attempts(
        exercise_id=exercise_id,
        user_id=user_id,
        attempt_status=status,
        date_from=date_from,
        date_to=date_to,
        page=page,
        page_size=page_size,
    )


@router.post("/attempts/replay", response_model=ReplayAttemptResponse)
async def replay_attempt(payload: ReplayAttemptRequest):
    """Ejecuta replay forense concurrente y comparativa semántica de un intento."""
    return await admin_service.replay_attempt(payload.attempt_id)


@router.get("/security/audit-log", response_model=SecurityAuditResponse)
async def get_security_audit_log(limit: int = Query(default=100, ge=1, le=500)):
    """Buffer circular de bloqueos AST SQLGlot y estado del limitador de tasa."""
    return await admin_service.get_security_audit_log(limit=limit)


@router.post("/system/killswitches", response_model=KillswitchesResponse)
async def update_killswitches(
    payload: KillswitchesRequest,
    admin_user: AuthenticatedUser = Depends(require_admin),
):
    """Control global de modo mantenimiento y estado operativo de retos."""
    return await admin_service.update_killswitches(payload, admin_id=admin_user.id)


@router.post("/system/pool/recycle", response_model=PoolRecycleResponse)
async def recycle_pool():
    """Cierra limpiamente y reconstruye el pool asyncpg hacia el Sandbox."""
    return await admin_service.recycle_pool()


@router.get("/users", response_model=AdminUsersPageResponse)
async def list_users(
    search: Optional[str] = Query(default=None),
    role: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    """Lista consolidada de usuarios (Supabase Auth + perfiles + progreso + actividad)."""
    return await admin_service.list_users(
        search=search,
        role=role,
        account_status=status,
        limit=limit,
        offset=offset,
    )


@router.post("/users/{user_id}/role", response_model=UserModerationResponse)
async def update_user_role(
    user_id: str,
    payload: UpdateUserRoleRequest,
    admin_user: AuthenticatedUser = Depends(require_admin),
):
    """Promueve o degrada el rol administrativo (app_metadata.role) de un usuario."""
    return await admin_service.update_user_role(
        target_user_id=user_id,
        role=payload.role,
        admin_id=admin_user.id,
    )


@router.post("/users/{user_id}/ban", response_model=UserModerationResponse)
async def update_user_ban(
    user_id: str,
    payload: UpdateUserBanRequest,
    admin_user: AuthenticatedUser = Depends(require_admin),
):
    """Suspende o reactiva una cuenta de usuario mediante Supabase Auth Admin API."""
    return await admin_service.update_user_ban(
        target_user_id=user_id,
        banned=payload.banned,
        admin_id=admin_user.id,
        reason=payload.reason,
    )
