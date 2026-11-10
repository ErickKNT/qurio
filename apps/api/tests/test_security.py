import pytest
from app.modules.runner.security import validate_sql_security, enforce_row_limit
from app.modules.curriculum.seed_data import SEED_EXERCISES


# ==============================================================================
# 1. PRUEBAS DEL CURRÍCULO OFICIAL (18 CONSULTAS)
# ==============================================================================

def test_all_curriculum_queries_pass_security():
    """Valida que todas las consultas oficiales del currículo pasen la validación AST."""
    assert len(SEED_EXERCISES) >= 18, f"Se esperaban al menos 18 ejercicios en el currículo, encontrados {len(SEED_EXERCISES)}"
    for eid, exercise in SEED_EXERCISES.items():
        is_safe, error = validate_sql_security(exercise.solution_query)
        assert is_safe is True, f"Fallo en ejercicio '{exercise.title}' ({eid}): {error}"
        assert error == ""


# ==============================================================================
# 2. LITERALES DE TEXTO Y CASOS SINTÁCTICOS LÍMITE (ANTI-FALSOS POSITIVOS)
# ==============================================================================

def test_string_literal_with_semicolon_is_allowed():
    """El punto y coma dentro de una cadena de texto no debe tratarse como múltiples consultas."""
    sql = "SELECT id, 'Cable; HDMI 2.0; 2m' AS descripcion FROM productos WHERE id = 1;"
    is_safe, error = validate_sql_security(sql)
    assert is_safe is True
    assert error == ""


def test_string_literal_with_sql_keywords_is_allowed():
    """Palabras clave como DROP, CREATE, DELETE dentro de un string literal son seguras."""
    sql = "SELECT id, nombre FROM productos WHERE nombre = 'DROP TABLE estudiantes' OR categoria = 'DELETE';"
    is_safe, error = validate_sql_security(sql)
    assert is_safe is True
    assert error == ""


def test_comments_with_keywords_are_stripped_safely():
    """Comentarios que mencionan palabras reservadas no deben generar falsos positivos."""
    sql = """
    -- Este comentario menciona DROP TABLE y DELETE
    /* Comentario de bloque con ALTER TABLE */
    SELECT id, nombre, precio FROM productos;
    """
    is_safe, error = validate_sql_security(sql)
    assert is_safe is True
    assert error == ""


# ==============================================================================
# 3. CONSULTAS AVANZADAS PERMITIDAS (WITH RECURSIVE, SET OPERATIONS, CTEs)
# ==============================================================================

def test_allow_recursive_cte():
    """WITH RECURSIVE está permitido en el AST para soportar SQL avanzado."""
    sql = """
    WITH RECURSIVE conteo AS (
        SELECT 1 AS n
        UNION ALL
        SELECT n + 1 FROM conteo WHERE n < 5
    )
    SELECT * FROM conteo;
    """
    is_safe, error = validate_sql_security(sql)
    assert is_safe is True
    assert error == ""


def test_allow_set_operations_union_intersect_except():
    """Operaciones de conjuntos (UNION, UNION ALL, INTERSECT, EXCEPT) son válidas."""
    queries = [
        "SELECT id FROM clientes UNION SELECT id FROM proveedores;",
        "SELECT id FROM clientes UNION ALL SELECT id FROM proveedores;",
        "SELECT id FROM clientes INTERSECT SELECT id FROM proveedores;",
        "SELECT id FROM clientes EXCEPT SELECT id FROM proveedores;",
    ]
    for q in queries:
        is_safe, error = validate_sql_security(q)
        assert is_safe is True, f"Fallo en: {q} ({error})"


def test_allow_parenthesized_subqueries():
    """Consultas envueltas en paréntesis deben ser admitidas."""
    sql = "(SELECT id, nombre FROM clientes WHERE pais = 'España');"
    is_safe, error = validate_sql_security(sql)
    assert is_safe is True


# ==============================================================================
# 4. BLOQUEO DE INYECCIONES Y MUTACIONES PROFUNDAS (DEFENSA EN PROFUNDIDAD)
# ==============================================================================

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


def test_block_truncate_and_copy():
    for q in ["TRUNCATE TABLE clientes;", "COPY clientes TO '/tmp/dump';"]:
        is_safe, error = validate_sql_security(q)
        assert is_safe is False


def test_block_grant_and_revoke():
    for q in ["GRANT ALL ON clientes TO public;", "REVOKE SELECT ON clientes FROM public;"]:
        is_safe, error = validate_sql_security(q)
        assert is_safe is False


def test_block_cte_with_mutation():
    """Un CTE que intente ejecutar DELETE, INSERT o UPDATE dentro de un SELECT debe ser bloqueado."""
    queries = [
        "WITH hack AS (DELETE FROM clientes RETURNING *) SELECT * FROM hack;",
        "WITH hack AS (INSERT INTO clientes (nombre) VALUES ('x') RETURNING *) SELECT * FROM hack;",
        "WITH hack AS (UPDATE clientes SET saldo = 0 RETURNING *) SELECT * FROM hack;",
    ]
    for q in queries:
        is_safe, error = validate_sql_security(q)
        assert is_safe is False, f"Se debió bloquear: {q}"


def test_block_multiple_statements():
    """Múltiples consultas encadenadas están prohibidas."""
    queries = [
        "SELECT 1; SELECT 2;",
        "SELECT 1; DROP TABLE clientes;",
        "SELECT 1; /* comentario */ DELETE FROM productos;",
    ]
    for q in queries:
        is_safe, error = validate_sql_security(q)
        assert is_safe is False
        assert "múltiples consultas" in error


# ==============================================================================
# 5. BLOQUEO DE FUNCIONES DEL SISTEMA Y CATÁLOGOS SENSIBLES
# ==============================================================================

def test_block_dangerous_functions():
    """Funciones peligrosas de PostgreSQL para DoS, archivos o red deben bloquearse."""
    dangerous_queries = [
        "SELECT pg_sleep(10);",
        "SELECT pg_terminate_backend(1234);",
        "SELECT pg_cancel_backend(1234);",
        "SELECT dblink('host=remote.db', 'SELECT 1');",
        "SELECT pg_read_file('/etc/passwd');",
        "SELECT pg_write_file('/tmp/exploit', 'data');",
        "SELECT pg_ls_dir('.');",
    ]
    for q in dangerous_queries:
        is_safe, error = validate_sql_security(q)
        assert is_safe is False, f"Se debió bloquear la función en: {q}"
        assert "restringido" in error or "función" in error


def test_block_sensitive_catalogs_and_tables():
    """Consultas a tablas que contienen credenciales o hashes deben ser bloqueadas."""
    sensitive_queries = [
        "SELECT * FROM pg_shadow;",
        "SELECT * FROM pg_catalog.pg_shadow;",
        "SELECT * FROM pg_authid;",
        "SELECT * FROM pg_roles;",
    ]
    for q in sensitive_queries:
        is_safe, error = validate_sql_security(q)
        assert is_safe is False, f"Se debió bloquear la tabla sensible en: {q}"


# ==============================================================================
# 6. ENFORCE ROW LIMIT (MANIPULACIÓN AST)
# ==============================================================================

def test_enforce_row_limit_adds_limit():
    sql = "SELECT * FROM productos"
    limited = enforce_row_limit(sql, max_rows=500)
    assert "LIMIT 500" in limited


def test_enforce_row_limit_caps_excessive_limit():
    sql = "SELECT * FROM productos LIMIT 5000"
    limited = enforce_row_limit(sql, max_rows=1000)
    assert "LIMIT 1000" in limited


def test_enforce_row_limit_preserves_smaller_limit():
    sql = "SELECT * FROM productos LIMIT 50"
    limited = enforce_row_limit(sql, max_rows=1000)
    assert "LIMIT 50" in limited


def test_enforce_row_limit_with_cte():
    sql = "WITH t AS (SELECT * FROM clientes) SELECT * FROM t"
    limited = enforce_row_limit(sql, max_rows=200)
    assert "LIMIT 200" in limited


# ==============================================================================
# 7. ENTRADAS INVÁLIDAS Y VACÍAS
# ==============================================================================

def test_empty_and_whitespace_queries():
    assert validate_sql_security("")[0] is False
    assert validate_sql_security("   \n\t  ")[0] is False
    assert validate_sql_security("-- solo un comentario\n/* otro */")[0] is False
