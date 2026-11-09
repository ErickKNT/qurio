from collections import Counter
from decimal import Decimal, InvalidOperation
from typing import Any, List, Optional, Tuple
import sqlglot
from sqlglot import exp

from app.modules.runner.schemas import (
    DiffResult,
    EvaluationResponse,
    EvaluationStatus,
    ExecutionResult,
)


def normalize_cell(val: Any, enforce_scale: bool = False) -> Any:
    """
    Normaliza un valor para comparación preservando la precisión Decimal exacta
    y evitando pérdidas de precisión inherentes al estándar IEEE 754 (float).
    
    - Si enforce_scale=False: compara equivalencia numérica pura (1754.5 == 1754.50).
    - Si enforce_scale=True: preserva escala exacta (1754.50 != 1754.5).
    """
    if val is None:
        return None
    if isinstance(val, (int, float, Decimal)):
        try:
            d = Decimal(str(val))
            if not enforce_scale:
                # Normaliza para que 1754.5 y 1754.50 tengan la misma tupla interna
                # pero sin truncar decimales significativos
                return d.normalize()
            return (d, d.as_tuple().exponent)
        except InvalidOperation:
            return val
    if isinstance(val, str):
        return val.strip()
    return val


def row_to_comparable_tuple(row: List[Any], enforce_scale: bool = False) -> Tuple[Any, ...]:
    """Convierte una fila en una tupla normalizada y comparable con exactitud Decimal."""
    return tuple(normalize_cell(cell, enforce_scale=enforce_scale) for cell in row)


def inspect_pedagogical_requirements(
    student_sql: str, expected_sql: str
) -> Tuple[bool, Optional[str]]:
    """
    Capa 2 de Evaluación: Inspección del AST para verificar el cumplimiento
    de requisitos didácticos esenciales (ej. uso explícito de ROUND, GROUP BY, JOIN)
    incluso si los datos numéricos coinciden por simple multiplicación.
    """
    try:
        expected_ast = sqlglot.parse_one(expected_sql, read="postgres")
        student_ast = sqlglot.parse_one(student_sql, read="postgres")
    except Exception:
        # Si no es parseable en este punto, el SQL runner ya lo habrá filtrado
        return True, None

    # 1. Comprobación de ROUND: Si la solución de referencia exige ROUND
    expected_has_round = any(
        isinstance(n, exp.Round)
        or (isinstance(n, exp.Anonymous) and (n.name or "").lower() == "round")
        for n in expected_ast.walk()
    )
    if expected_has_round:
        student_has_round = any(
            isinstance(n, exp.Round)
            or (isinstance(n, exp.Anonymous) and (n.name or "").lower() == "round")
            for n in student_ast.walk()
        )
        if not student_has_round:
            return (
                False,
                "Requisito pedagógico no cumplido: La consigna requiere utilizar la función ROUND() "
                "para asegurar el redondeo explícito de los valores calculados.",
            )

    return True, None


def evaluate_solution(
    student_result: ExecutionResult,
    expected_result: ExecutionResult,
    check_order: bool = False,
    base_xp: int = 45,
    hints_used: int = 0,
    student_sql: Optional[str] = None,
    expected_sql: Optional[str] = None,
    enforce_scale: bool = False,
) -> EvaluationResponse:
    """
    Evalúa semánticamente el resultado del estudiante comparándolo contra el esperado.
    Implementa arquitectura de dos capas:
    - Capa 1: Equivalencia de datos con precisión Decimal estricta.
    - Capa 2: Inspector pedagógico de AST para validar funciones requeridas por la consigna.
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

    # 5. Capa 1: Validación de contenido fila por fila con precisión Decimal
    norm_student_rows = [
        row_to_comparable_tuple(r, enforce_scale=enforce_scale)
        for r in student_result.rows
    ]
    norm_expected_rows = [
        row_to_comparable_tuple(r, enforce_scale=enforce_scale)
        for r in expected_result.rows
    ]

    if check_order:
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

    # 6. Capa 2: Inspección de Requisitos Pedagógicos en AST
    if student_sql and expected_sql:
        is_pedagogically_valid, reason = inspect_pedagogical_requirements(
            student_sql=student_sql, expected_sql=expected_sql
        )
        if not is_pedagogically_valid:
            return EvaluationResponse(
                status=EvaluationStatus.FAILED,
                execution_time_ms=student_result.execution_time_ms,
                xp_awarded=0,
                columns=[c.name for c in student_result.columns],
                rows=student_result.rows,
                diff=DiffResult(
                    reason=reason,
                    expected_columns=[c.name for c in expected_result.columns],
                    actual_columns=[c.name for c in student_result.columns],
                    expected_row_count=expected_result.row_count,
                    actual_row_count=student_result.row_count,
                    sample_expected_rows=expected_result.rows[:5],
                    sample_actual_rows=student_result.rows[:5],
                ),
                message=reason,
            )

    # 7. Cálculo de XP con penalización por pistas
    penalty_rate = min(0.45, hints_used * 0.15)
    calculated_xp = min(base_xp, max(0, int(base_xp * (1.0 - penalty_rate))))

    return EvaluationResponse(
        status=EvaluationStatus.PASSED,
        execution_time_ms=student_result.execution_time_ms,
        xp_awarded=calculated_xp,
        columns=[c.name for c in student_result.columns],
        rows=student_result.rows,
        message="¡Excelente trabajo! Tu consulta resolvió el problema correctamente con equivalencia semántica total.",
    )
