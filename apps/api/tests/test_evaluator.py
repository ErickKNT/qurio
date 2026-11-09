import pytest
from app.modules.runner.schemas import ColumnInfo, ExecutionResult, EvaluationStatus
from app.modules.runner.evaluator import evaluate_solution


def make_result(columns, rows, status="SUCCESS", error=None):
    col_infos = [ColumnInfo(name=c, type="varchar") for c in columns]
    return ExecutionResult(
        status=status,
        execution_time_ms=12.5,
        row_count=len(rows),
        columns=col_infos,
        rows=rows,
        error=error,
    )


def test_evaluator_exact_match():
    cols = ["nombre", "precio"]
    rows = [["Laptop Pro", 1200.0], ["Mouse", 25.0]]
    student = make_result(cols, rows)
    expected = make_result(cols, rows)

    res = evaluate_solution(student, expected, check_order=False, base_xp=40, hints_used=0)
    assert res.status == EvaluationStatus.PASSED
    assert res.xp_awarded == 40
    assert res.diff is None


def test_evaluator_unordered_match_passes_when_order_not_required():
    cols = ["nombre", "precio"]
    student_rows = [["Mouse", 25.0], ["Laptop Pro", 1200.0]]
    expected_rows = [["Laptop Pro", 1200.0], ["Mouse", 25.0]]
    student = make_result(cols, student_rows)
    expected = make_result(cols, expected_rows)

    res = evaluate_solution(student, expected, check_order=False, base_xp=50, hints_used=0)
    assert res.status == EvaluationStatus.PASSED
    assert res.xp_awarded == 50


def test_evaluator_unordered_match_fails_when_order_required():
    cols = ["nombre", "precio"]
    student_rows = [["Mouse", 25.0], ["Laptop Pro", 1200.0]]
    expected_rows = [["Laptop Pro", 1200.0], ["Mouse", 25.0]]
    student = make_result(cols, student_rows)
    expected = make_result(cols, expected_rows)

    res = evaluate_solution(student, expected, check_order=True, base_xp=50, hints_used=0)
    assert res.status == EvaluationStatus.FAILED
    assert res.xp_awarded == 0
    assert res.diff is not None
    assert "Discrepancia en la fila" in res.diff.reason


def test_evaluator_column_count_mismatch():
    student = make_result(["nombre"], [["Laptop Pro"], ["Mouse"]])
    expected = make_result(["nombre", "precio"], [["Laptop Pro", 1200.0], ["Mouse", 25.0]])

    res = evaluate_solution(student, expected, check_order=False, base_xp=50)
    assert res.status == EvaluationStatus.FAILED
    assert "Se esperaban 2 columnas" in res.diff.reason


def test_evaluator_column_name_mismatch():
    student = make_result(["name", "precio"], [["Laptop Pro", 1200.0]])
    expected = make_result(["nombre", "precio"], [["Laptop Pro", 1200.0]])

    res = evaluate_solution(student, expected, check_order=False, base_xp=50)
    assert res.status == EvaluationStatus.FAILED
    assert "Nombres de columnas devueltos no coinciden" in res.diff.reason


def test_evaluator_row_count_mismatch():
    cols = ["nombre", "precio"]
    student = make_result(cols, [["Laptop Pro", 1200.0]])
    expected = make_result(cols, [["Laptop Pro", 1200.0], ["Mouse", 25.0]])

    res = evaluate_solution(student, expected, check_order=False, base_xp=50)
    assert res.status == EvaluationStatus.FAILED
    assert "Tu consulta devolvió 1 filas, pero se esperaban 2" in res.diff.reason


def test_evaluator_hint_penalties():
    cols = ["nombre"]
    rows = [["Producto A"]]
    student = make_result(cols, rows)
    expected = make_result(cols, rows)

    # 1 pista: -15% -> 50 * 0.85 = 42
    res1 = evaluate_solution(student, expected, base_xp=50, hints_used=1)
    assert res1.xp_awarded == 42

    # 2 pistas: -30% -> 50 * 0.70 = 35
    res2 = evaluate_solution(student, expected, base_xp=50, hints_used=2)
    assert res2.xp_awarded == 35

    # 3 pistas: -45% -> 50 * 0.55 = 27
    res3 = evaluate_solution(student, expected, base_xp=50, hints_used=3)
    assert res3.xp_awarded == 27


def test_evaluator_database_error():
    student = make_result([], [], status="ERROR", error="syntax error at or near 'FORM'")
    expected = make_result(["id"], [[1]])

    res = evaluate_solution(student, expected)
    assert res.status == EvaluationStatus.ERROR
    assert res.xp_awarded == 0
    assert "syntax error" in res.error


# ==============================================================================
# PRUEBAS DE PRECISIÓN DECIMAL Y REQUISITOS PEDAGÓGICOS (HALLAZGO SEC-07)
# ==============================================================================

def test_evaluator_decimal_exact_precision():
    """Demuestra que valores Decimal con alta precisión no sufren truncamiento por float."""
    from decimal import Decimal

    cols = ["id", "monto_preciso"]
    # Dos números que en float(IEEE 754) colapsarían por redondeo pero en Decimal son distintos
    val1 = Decimal("10000000000000.00000001")
    val2 = Decimal("10000000000000.00000002")

    student = make_result(cols, [[1, val1]])
    expected = make_result(cols, [[1, val2]])

    res = evaluate_solution(student, expected)
    assert res.status == EvaluationStatus.FAILED
    assert "no coinciden con el conjunto esperado" in res.diff.reason


def test_evaluator_decimal_scale_numerical_equivalence():
    """Valida que 1754.5 y 1754.50 sean numéricamente equivalentes en evaluación de valor."""
    from decimal import Decimal

    cols = ["id", "total"]
    student = make_result(cols, [[1, Decimal("1754.5")]])
    expected = make_result(cols, [[1, Decimal("1754.50")]])

    res = evaluate_solution(student, expected, enforce_scale=False)
    assert res.status == EvaluationStatus.PASSED


def test_evaluator_decimal_scale_strict_enforcement():
    """Demuestra que si enforce_scale=True, 1754.5 y 1754.50 son distinguidos por su escala."""
    from decimal import Decimal

    cols = ["id", "total"]
    student = make_result(cols, [[1, Decimal("1754.5")]])
    expected = make_result(cols, [[1, Decimal("1754.50")]])

    res = evaluate_solution(student, expected, enforce_scale=True)
    assert res.status == EvaluationStatus.FAILED


def test_evaluator_pedagogical_ast_check_fails_when_round_missing():
    """
    Demuestra la Capa 2: Si la consigna exige ROUND() y el estudiante multiplica directo
    sin usar ROUND (arrojando los mismos números), el evaluador rechaza con aviso didáctico.
    """
    cols = ["nombre_producto", "precio", "precio_con_iva"]
    rows = [["ProBook Ultra", 1450.0, 1754.5]]
    student_res = make_result(cols, rows)
    expected_res = make_result(cols, rows)

    expected_sql = "SELECT nombre_producto, precio, ROUND(precio * 1.21, 2) AS precio_con_iva FROM productos;"
    # Estudiante omitió ROUND()
    student_sql = "SELECT nombre_producto, precio, precio * 1.21 AS precio_con_iva FROM productos;"

    res = evaluate_solution(
        student_result=student_res,
        expected_result=expected_res,
        student_sql=student_sql,
        expected_sql=expected_sql,
    )
    assert res.status == EvaluationStatus.FAILED
    assert res.diff is not None
    assert "Requisito pedagógico no cumplido" in res.diff.reason
    assert "ROUND()" in res.diff.reason


def test_evaluator_pedagogical_ast_check_passes_when_round_present():
    """Si el estudiante sí incluye la función ROUND() requerida, la evaluación aprueba."""
    cols = ["nombre_producto", "precio", "precio_con_iva"]
    rows = [["ProBook Ultra", 1450.0, 1754.5]]
    student_res = make_result(cols, rows)
    expected_res = make_result(cols, rows)

    expected_sql = "SELECT nombre_producto, precio, ROUND(precio * 1.21, 2) AS precio_con_iva FROM productos;"
    student_sql = "SELECT nombre_producto, precio, ROUND(p.precio * 1.21, 2) AS precio_con_iva FROM productos p;"

    res = evaluate_solution(
        student_result=student_res,
        expected_result=expected_res,
        student_sql=student_sql,
        expected_sql=expected_sql,
    )
    assert res.status == EvaluationStatus.PASSED
    assert res.diff is None

