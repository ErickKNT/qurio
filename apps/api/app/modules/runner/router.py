import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.auth import AuthenticatedUser, get_optional_current_user
from app.core.rate_limit import check_rate_limit, concurrency_semaphore
from app.core.supabase import record_verified_progress
from app.modules.curriculum.repository import exercise_repository
from app.modules.curriculum.seed_data import ExerciseDetail
from app.modules.runner.evaluator import evaluate_solution
from app.modules.runner.schemas import (
    EvaluationResponse,
    EvaluationStatus,
    ExecutionResult,
    ExerciseSubmitRequest,
    QueryExecuteRequest,
)
from app.modules.runner.service import sandbox_runner

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health", tags=["Salud"])
async def health_check():
    """
    Verifica el estado del servicio y la conectividad con el Sandbox PostgreSQL.
    """
    sandbox_healthy = False
    sandbox_error = None
    try:
        check = await sandbox_runner.execute_query("SELECT 1 AS health_check;")
        sandbox_healthy = check.status == "SUCCESS"
        if not sandbox_healthy:
            sandbox_error = check.error
    except Exception as e:
        sandbox_error = str(e)

    return {
        "status": "healthy" if sandbox_healthy else "degraded",
        "sandbox_database": "connected" if sandbox_healthy else "disconnected",
        "error": sandbox_error,
    }


@router.post(
    "/playground/execute",
    response_model=ExecutionResult,
    tags=["Playground"],
    summary="Ejecutar consulta en el Sandbox SQL",
)
async def execute_playground_query(
    request: QueryExecuteRequest,
    http_request: Request,
    user: AuthenticatedUser = Depends(get_optional_current_user),
):
    """
    Ejecuta una consulta SQL arbitraria en el sandbox aislado de solo lectura.
    Aplica rate limiting según el tipo de sesión (IP para invitados, User ID para autenticados),
    protección de concurrencia y validación sintáctica AST contra inyecciones y mutaciones.
    """
    # 1. Rate Limiting diferenciado
    await check_rate_limit(http_request, user)

    # 2. Protección de concurrencia sobre el pool
    async with concurrency_semaphore:
        result = await sandbox_runner.execute_query(request.query)

    return result


@router.get(
    "/exercises",
    response_model=List[ExerciseDetail],
    tags=["Ejercicios"],
    summary="Listar ejercicios disponibles",
)
async def list_exercises():
    """Obtiene el catálogo de ejercicios activos."""
    return await exercise_repository.list_all()


@router.get(
    "/exercises/{exercise_id}",
    response_model=ExerciseDetail,
    tags=["Ejercicios"],
    summary="Obtener detalle de un ejercicio",
)
async def get_exercise(exercise_id: str):
    """Devuelve la consigna, pistas y código inicial de un reto."""
    exercise = await exercise_repository.get_by_id(exercise_id)
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ejercicio '{exercise_id}' no encontrado.",
        )
    return exercise


@router.post(
    "/exercises/{exercise_id}/submit",
    response_model=EvaluationResponse,
    tags=["Ejercicios"],
    summary="Evaluar solución propuesta por el estudiante",
)
async def submit_exercise_solution(
    exercise_id: str,
    request: ExerciseSubmitRequest,
    http_request: Request,
    user: AuthenticatedUser = Depends(get_optional_current_user),
):
    """
    Evalúa semánticamente la consulta del estudiante:
    1. Aplica Rate Limiting diferenciado y guardia de concurrencia.
    2. Ejecuta la consulta del estudiante en el sandbox Docker.
    3. Ejecuta la solución de referencia oficial.
    4. Compara columnas, cardinalidad, nulos, tolerancia numérica y multiconjuntos/orden.
    5. Si el usuario está autenticado y aprueba, el backend certifica el intento vía Supabase RPC con idempotencia.
    """
    # 1. Rate Limiting diferenciado
    await check_rate_limit(http_request, user)

    exercise = await exercise_repository.get_by_id(exercise_id)
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ejercicio '{exercise_id}' no encontrado.",
        )

    # 2. Ejecutar consultas en sandbox protegido por semáforo de concurrencia
    async with concurrency_semaphore:
        student_result = await sandbox_runner.execute_query(request.query)
        expected_result = await sandbox_runner.execute_query(exercise.solution_query)

    if expected_result.status != "SUCCESS":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al ejecutar la solución de referencia del ejercicio: {expected_result.error}",
        )

    # 3. Evaluación semántica profunda
    evaluation = evaluate_solution(
        student_result=student_result,
        expected_result=expected_result,
        check_order=exercise.check_order,
        base_xp=exercise.xp_reward,
        hints_used=request.hints_revealed,
    )

    # 4. Autoridad central del backend para otorgar XP y registrar progreso
    if evaluation.status == EvaluationStatus.PASSED:
        if user.is_guest:
            # Modo invitado: no persiste en Supabase
            evaluation.message = (
                "¡Reto Superado con Éxito en modo invitado! Inicia sesión para guardar tu progreso y ganar XP."
            )
        else:
            # Usuario autenticado: certificar intento mediante RPC segura
            rpc_res = await record_verified_progress(
                user_id=user.id,
                exercise_id=exercise_id,
                submitted_sql=request.query,
                status="PASSED",
                execution_time_ms=int(evaluation.execution_time_ms),
                hints_used=request.hints_revealed,
                xp_to_award=evaluation.xp_awarded,
            )
            if rpc_res.get("already_passed"):
                evaluation.xp_awarded = 0
                evaluation.message = (
                    "¡Reto resuelto correctamente! (Ya habías completado este reto previamente, ¡gran práctica!)"
                )
            else:
                evaluation.message = f"¡Reto Superado con Éxito! +{evaluation.xp_awarded} XP acreditados."
    elif evaluation.status == EvaluationStatus.FAILED and not user.is_guest:
        # Registrar intento fallido para analítica sin otorgar XP
        await record_verified_progress(
            user_id=user.id,
            exercise_id=exercise_id,
            submitted_sql=request.query,
            status="FAILED",
            execution_time_ms=int(evaluation.execution_time_ms),
            error_message=evaluation.error or (evaluation.diff.reason if evaluation.diff else None),
            hints_used=request.hints_revealed,
            xp_to_award=0,
        )

    return evaluation
