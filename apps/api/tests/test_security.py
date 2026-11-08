import pytest
from app.modules.runner.security import validate_sql_security, enforce_row_limit


def test_valid_select_query():
    sql = "SELECT id, nombre, email FROM clientes WHERE pais = 'España';"
    is_safe, error = validate_sql_security(sql)
    assert is_safe is True
    assert error == ""


def test_block_drop_table():
    sql = "DROP TABLE clientes;"
    is_safe, error = validate_sql_security(sql)
    assert is_safe is False
    assert "DROP" in error


def test_block_alter_table():
    sql = "ALTER TABLE productos ADD COLUMN descuento INT;"
    is_safe, error = validate_sql_security(sql)
    assert is_safe is False
    assert "ALTER" in error


def test_block_insert():
    sql = "INSERT INTO clientes (nombre) VALUES ('Hacker');"
    is_safe, error = validate_sql_security(sql)
    assert is_safe is False
    assert "INSERT" in error


def test_block_update():
    sql = "UPDATE clientes SET saldo = 999999 WHERE id = 1;"
    is_safe, error = validate_sql_security(sql)
    assert is_safe is False
    assert "UPDATE" in error


def test_block_delete():
    sql = "DELETE FROM pedidos WHERE 1 = 1;"
    is_safe, error = validate_sql_security(sql)
    assert is_safe is False
    assert "DELETE" in error


def test_block_multiple_statements():
    sql = "SELECT 1; SELECT 2;"
    is_safe, error = validate_sql_security(sql)
    assert is_safe is False
    assert "múltiples consultas" in error


def test_block_dangerous_functions():
    sql = "SELECT pg_sleep(10);"
    is_safe, error = validate_sql_security(sql)
    assert is_safe is False
    assert "pg_sleep" in error


def test_enforce_row_limit_adds_limit():
    sql = "SELECT * FROM productos"
    limited = enforce_row_limit(sql, max_rows=500)
    assert "LIMIT 500" in limited


def test_enforce_row_limit_caps_excessive_limit():
    sql = "SELECT * FROM productos LIMIT 5000"
    limited = enforce_row_limit(sql, max_rows=1000)
    assert "LIMIT 1000" in limited
