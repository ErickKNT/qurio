import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.auth import AuthenticatedUser, get_optional_current_user
from app.core.rate_limit import check_rate_limit, concurrency_semaphore
from app.core.supabase import record_verified_progress
from app.modules.curriculum.repository import exercise_repository
from app.modules.curriculum.seed_data import ExerciseDetail, ExercisePublicDTO
from app.modules.runner.evaluator import evaluate_solution
from app.modules.runner.schemas import (
    EvaluationResponse,
    EvaluationStatus,
    ExecutionResult,
    ExerciseSubmitRequest,
    QueryExecuteRequest,
    RevealSolutionRequest,
    RevealSolutionResponse,
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


GUEST_TRIAL_EXERCISE_IDS = {
    # Retos 1, 2 y 3 oficiales del Módulo 1 (sort_order 1, 2, 3)
    "e0000000-0000-0000-0000-000000000001",  # Catálogo Básico de Productos (Reto 1, +30 XP)
    "e0000000-0000-0000-0000-000000000008",  # Cálculo de Precios con IVA (Reto 2, +35 XP)
    "e0000000-0000-0000-0000-000000000019",  # Concatenación de Nombre Completo (Reto 3, +35 XP)
    "ex-m01-01",
    "ex-m01-02",
    "ex-m01-03",
}


@router.get(
    "/exercises",
    response_model=List[ExercisePublicDTO],
    tags=["Ejercicios"],
    summary="Listar ejercicios disponibles",
)
async def list_exercises():
    """Obtiene el catálogo de ejercicios activos protegidos sin solution_query."""
    return await exercise_repository.list_public()


@router.get(
    "/exercises/{exercise_id}",
    response_model=ExercisePublicDTO,
    tags=["Ejercicios"],
    summary="Obtener detalle de un ejercicio",
)
async def get_exercise(exercise_id: str):
    """Devuelve la consigna, pistas y código inicial de un reto sin solution_query."""
    exercise = await exercise_repository.get_public_by_id(exercise_id)
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ejercicio '{exercise_id}' no encontrado.",
        )
    return exercise


@router.post(
    "/exercises/{exercise_id}/reveal-solution",
    response_model=RevealSolutionResponse,
    tags=["Ejercicios"],
    summary="Revelar la solución oficial tras al menos 2 intentos fallidos",
)
async def reveal_exercise_solution(
    exercise_id: str,
    request: RevealSolutionRequest,
    http_request: Request,
    user: AuthenticatedUser = Depends(get_optional_current_user),
):
    """
    Revela la consulta de solución oficial de referencia bajo las siguientes reglas:
    1. Aplica Rate Limiting.
    2. Exige estrictamente que el usuario haya acumulado al menos 2 intentos fallidos (failed_attempts >= 2).
    3. Registra telemetría para auditar cuellos de botella y oportunidades pedagógicas en el currículum.
    """
    await check_rate_limit(http_request, user)

    if request.failed_attempts < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se requieren al menos 2 intentos fallidos previos para poder desbloquear la solución oficial.",
        )

    exercise = await exercise_repository.get_internal_for_evaluation(exercise_id)
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ejercicio '{exercise_id}' no encontrado.",
        )

    logger.info(
        f"[Telemetría] Solución revelada para '{exercise.title}' ({exercise_id}) por usuario "
        f"{user.id if not user.is_guest else 'invitado'} tras {request.failed_attempts} intentos fallidos."
    )

    if not user.is_guest:
        try:
            await record_verified_progress(
                user_id=user.id,
                exercise_id=exercise_id,
                submitted_sql="-- SOLUTION REVEALED",
                status="FAILED",
                execution_time_ms=0,
                error_message="User revealed solution after failed attempts",
                hints_used=0,
                xp_to_award=0,
            )
        except Exception as e:
            logger.warning(f"No se pudo registrar telemetría en Supabase: {e}")

    return RevealSolutionResponse(
        exercise_id=exercise.id,
        solution_query=exercise.solution_query,
        title=exercise.title,
        explanation=exercise.concept.summary if exercise.concept else "Solución oficial de referencia de Qurio.",
        telemetry_recorded=True,
    )


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
    2. En modo invitado, comprueba el límite de 3 ejercicios de prueba.
    3. Ejecuta la consulta del estudiante en el sandbox Docker.
    4. Ejecuta la solución de referencia oficial (oculta para el cliente).
    5. Compara columnas, cardinalidad, nulos, tolerancia numérica y multiconjuntos/orden.
    6. Si el usuario está autenticado y aprueba, el backend certifica el intento vía Supabase RPC con idempotencia.
    """
    # 1. Rate Limiting diferenciado
    await check_rate_limit(http_request, user)

    # 2. Control estricto de límite de prueba para invitados (3 ejercicios)
    if user.is_guest and exercise_id not in GUEST_TRIAL_EXERCISE_IDS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="REGISTRATION_REQUIRED_AFTER_TRIAL: Debes crear una cuenta o iniciar sesión para continuar practicando después de los 3 ejercicios de prueba.",
        )

    exercise = await exercise_repository.get_internal_for_evaluation(exercise_id)
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

    # 3. Evaluación semántica profunda (Capa 1: Datos Decimal + Capa 2: AST Pedagógico)
    evaluation = evaluate_solution(
        student_result=student_result,
        expected_result=expected_result,
        check_order=exercise.check_order,
        base_xp=exercise.xp_reward,
        hints_used=request.hints_revealed,
        student_sql=request.query,
        expected_sql=exercise.solution_query,
    )

    # 4. Autoridad central del backend para otorgar XP y registrar progreso
    if evaluation.status == EvaluationStatus.PASSED:
        if request.solution_viewed:
            evaluation.xp_awarded = 0
            evaluation.message = (
                "¡Reto resuelto con la solución de apoyo! (0 XP acreditados por haber consultado la solución oficial)."
            )
            if not user.is_guest:
                await record_verified_progress(
                    user_id=user.id,
                    exercise_id=exercise_id,
                    submitted_sql=request.query,
                    status="PASSED",
                    execution_time_ms=int(evaluation.execution_time_ms),
                    hints_used=request.hints_revealed,
                    xp_to_award=0,
                )
        elif user.is_guest:
            # Modo invitado: no persiste en Supabase ni otorga XP oficial (D-05)
            evaluation.xp_awarded = 0
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
            if rpc_res.get("success") is True:
                # Certificación exitosa en Supabase Cloud vía RPC
                evaluation.xp_awarded = rpc_res.get("xp_awarded", 0)
                if evaluation.xp_awarded > 0:
                    evaluation.message = f"¡Reto Superado con Éxito! +{evaluation.xp_awarded} XP acreditados."
                elif rpc_res.get("already_awarded") or rpc_res.get("already_passed"):
                    evaluation.message = (
                        "¡Reto resuelto correctamente! (Ya habías completado este reto previamente, ¡gran práctica!)"
                    )
                else:
                    evaluation.message = "¡Reto Superado con Éxito!"
            else:
                # Alternativa B: Modo de contingencia técnica (RPC inexistente tras rollback, falla de red o service_role ausente)
                # Regla de oro: No adjudicar XP no certificado ni engañar al cliente con falso progreso oficial
                evaluation.xp_awarded = 0
                evaluation.message = (
                    "¡Reto resuelto correctamente! Modo de contingencia: tu consulta es válida, "
                    "pero la certificación oficial de XP no está disponible temporalmente."
                )
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
