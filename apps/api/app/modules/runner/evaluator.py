from collections import Counter
from typing import Any, List, Tuple
from app.modules.runner.schemas import (
    DiffResult,
    EvaluationResponse,
    EvaluationStatus,
    ExecutionResult,
)


def normalize_cell(val: Any) -> Any:
    """Normaliza un valor para comparación tolerante a comas flotantes y strings."""
    if val is None:
        return None
    if isinstance(val, float):
        return round(val, 3)
    if isinstance(val, str):
        return val.strip()
    return val


def row_to_comparable_tuple(row: List[Any]) -> Tuple[Any, ...]:
    """Convierte una fila en una tupla normalizada y comparable."""
    return tuple(normalize_cell(cell) for cell in row)


def evaluate_solution(
    student_result: ExecutionResult,
    expected_result: ExecutionResult,
    check_order: bool = False,
    base_xp: int = 45,
    hints_used: int = 0,
) -> EvaluationResponse:
    """
    Evalúa semánticamente el resultado del estudiante comparándolo contra el esperado.
    """
    # 1. Si la consulta del estudiante arrojó un error de sintaxis o motor
    if student_result.status == "ERROR":
        return EvaluationResponse(
            status=EvaluationStatus.ERROR,
            execution_time_ms=student_result.execution_time_ms,
            xp_awarded=0,
            error=student_result.error,
            message="La consulta no pudo ejecutarse debido a un error de base de datos.",
        )

    # Nombres de columnas esperadas y devueltas (en minúsculas para tolerancia de alias)
    expected_col_names = [c.name.lower() for c in expected_result.columns]
    student_col_names = [c.name.lower() for c in student_result.columns]

    # 2. Validación de cantidad de columnas
    if len(student_col_names) != len(expected_col_names):
        return EvaluationResponse(
            status=EvaluationStatus.FAILED,
            execution_time_ms=student_result.execution_time_ms,
            xp_awarded=0,
            columns=[c.name for c in student_result.columns],
            rows=student_result.rows,
            diff=DiffResult(
                reason=f"Se esperaban {len(expected_col_names)} columnas, pero tu consulta devolvió {len(student_col_names)}.",
                expected_columns=[c.name for c in expected_result.columns],
                actual_columns=[c.name for c in student_result.columns],
                expected_row_count=expected_result.row_count,
                actual_row_count=student_result.row_count,
                sample_expected_rows=expected_result.rows[:5],
                sample_actual_rows=student_result.rows[:5],
            ),
            message="El número de columnas proyectadas no coincide con el requerimiento del ejercicio.",
        )

    # 3. Validación de nombres de columnas
    if student_col_names != expected_col_names:
        return EvaluationResponse(
            status=EvaluationStatus.FAILED,
            execution_time_ms=student_result.execution_time_ms,
            xp_awarded=0,
            columns=[c.name for c in student_result.columns],
            rows=student_result.rows,
            diff=DiffResult(
                reason=f"Nombres de columnas devueltos no coinciden. Esperados: {expected_col_names}, Recibidos: {student_col_names}",
                expected_columns=[c.name for c in expected_result.columns],
                actual_columns=[c.name for c in student_result.columns],
                expected_row_count=expected_result.row_count,
                actual_row_count=student_result.row_count,
                sample_expected_rows=expected_result.rows[:5],
                sample_actual_rows=student_result.rows[:5],
            ),
            message="Verifica los nombres o alias de las columnas solicitadas en la consigna.",
        )

    # 4. Validación de cantidad de registros devueltos
    if student_result.row_count != expected_result.row_count:
        return EvaluationResponse(
            status=EvaluationStatus.FAILED,
            execution_time_ms=student_result.execution_time_ms,
            xp_awarded=0,
            columns=[c.name for c in student_result.columns],
            rows=student_result.rows,
            diff=DiffResult(
                reason=f"Tu consulta devolvió {student_result.row_count} filas, pero se esperaban {expected_result.row_count}.",
                expected_columns=[c.name for c in expected_result.columns],
                actual_columns=[c.name for c in student_result.columns],
                expected_row_count=expected_result.row_count,
                actual_row_count=student_result.row_count,
                sample_expected_rows=expected_result.rows[:5],
                sample_actual_rows=student_result.rows[:5],
            ),
            message="El conjunto de datos devuelto tiene una cantidad de filas diferente a la esperada. Revisa los filtros WHERE o las condiciones de unión JOIN.",
        )

    # 5. Validación de contenido fila por fila
    norm_student_rows = [row_to_comparable_tuple(r) for r in student_result.rows]
    norm_expected_rows = [row_to_comparable_tuple(r) for r in expected_result.rows]

    if check_order:
        # Validación secuencial estricta
        for idx, (s_row, e_row) in enumerate(zip(norm_student_rows, norm_expected_rows)):
            if s_row != e_row:
                return EvaluationResponse(
                    status=EvaluationStatus.FAILED,
                    execution_time_ms=student_result.execution_time_ms,
                    xp_awarded=0,
                    columns=[c.name for c in student_result.columns],
                    rows=student_result.rows,
                    diff=DiffResult(
                        reason=f"Discrepancia en la fila {idx + 1}. Esperado: {list(e_row)}, Obtenido: {list(s_row)}",
                        expected_columns=[c.name for c in expected_result.columns],
                        actual_columns=[c.name for c in student_result.columns],
                        expected_row_count=expected_result.row_count,
                        actual_row_count=student_result.row_count,
                        sample_expected_rows=expected_result.rows[:5],
                        sample_actual_rows=student_result.rows[:5],
                    ),
                    message="El orden o los valores de los registros no coinciden con la solución esperada. Verifica tu cláusula ORDER BY.",
                )
    else:
        # Validación multiconjunto independiente del orden (frecuencias)
        student_counter = Counter(norm_student_rows)
        expected_counter = Counter(norm_expected_rows)

        if student_counter != expected_counter:
            return EvaluationResponse(
                status=EvaluationStatus.FAILED,
                execution_time_ms=student_result.execution_time_ms,
                xp_awarded=0,
                columns=[c.name for c in student_result.columns],
                rows=student_result.rows,
                diff=DiffResult(
                    reason="Los registros devueltos no coinciden con el conjunto esperado de datos.",
                    expected_columns=[c.name for c in expected_result.columns],
                    actual_columns=[c.name for c in student_result.columns],
                    expected_row_count=expected_result.row_count,
                    actual_row_count=student_result.row_count,
                    sample_expected_rows=expected_result.rows[:5],
                    sample_actual_rows=student_result.rows[:5],
                ),
                message="Algunos registros devueltos no corresponden con el resultado correcto. Revisa tus filtros condicionales.",
            )

    # 6. Cálculo de XP con penalización por pistas
    # Cada pista reduce un 15% del XP base, con un mínimo garantizado de 10 XP
    penalty_rate = min(0.45, hints_used * 0.15)
    calculated_xp = max(10, int(base_xp * (1.0 - penalty_rate)))

    return EvaluationResponse(
        status=EvaluationStatus.PASSED,
        execution_time_ms=student_result.execution_time_ms,
        xp_awarded=calculated_xp,
        columns=[c.name for c in student_result.columns],
        rows=student_result.rows,
        message="¡Excelente trabajo! Tu consulta resolvió el problema correctamente con equivalencia semántica total.",
    )
