from fastapi import APIRouter, HTTPException, status
from typing import List

from app.modules.runner.schemas import (
    QueryExecuteRequest,
    ExecutionResult,
    ExerciseSubmitRequest,
    EvaluationResponse,
)
from app.modules.runner.service import sandbox_runner
from app.modules.runner.evaluator import evaluate_solution
from app.modules.curriculum.repository import exercise_repository
from app.modules.curriculum.seed_data import ExerciseDetail

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
async def execute_playground_query(request: QueryExecuteRequest):
    """
    Ejecuta una consulta SQL arbitraria en el sandbox aislado de solo lectura.
    Aplica análisis de seguridad (bloquea DDL/DML y sentencias múltiples) y límites de filas/tiempo.
    """
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
):
    """
    Evalúa semánticamente la consulta del estudiante:
    1. Ejecuta la consulta del estudiante en el sandbox Docker.
    2. Ejecuta la solución de referencia oficial.
    3. Compara columnas, cardinalidad, nulos, tolerancia numérica y multiconjuntos/orden.
    4. Calcula los puntos de experiencia (XP) ajustando penalización por pistas.
    """
    exercise = await exercise_repository.get_by_id(exercise_id)
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ejercicio '{exercise_id}' no encontrado.",
        )

    # 1. Ejecutar query del estudiante
    student_result = await sandbox_runner.execute_query(request.query)

    # 2. Ejecutar query de referencia
    expected_result = await sandbox_runner.execute_query(exercise.solution_query)

    if expected_result.status != "SUCCESS":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al ejecutar la solución de referencia del ejercicio: {expected_result.error}",
        )

    # 3. Evaluación semántica
    evaluation = evaluate_solution(
        student_result=student_result,
        expected_result=expected_result,
        check_order=exercise.check_order,
        base_xp=exercise.xp_reward,
        hints_used=request.hints_revealed,
    )

    return evaluation
