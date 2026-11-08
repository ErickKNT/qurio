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
