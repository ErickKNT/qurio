import pytest
from app.modules.runner.security import validate_sql_security, enforce_row_limit, ExecutionMode
from app.modules.curriculum.seed_data import SEED_EXERCISES


# ==============================================================================
# 0. PRUEBAS DE MODOS CONTEXTUALES (READ_ONLY vs DML vs DDL) — RUTA 4
# ==============================================================================

def test_dml_mode_allows_insert_update_delete_but_blocks_ddl_and_escalation():
    """En modo DML se permiten INSERT, UPDATE y DELETE individuales, pero se bloquean DDL y comandos de sistema."""
    allowed_dml = [
        "INSERT INTO categorias (nombre_categoria, descripcion) VALUES ('Audio Profesional', 'Micrófonos y consolas');",
        "UPDATE productos SET precio = ROUND(precio * 1.05, 2) WHERE categoria_id = 1 RETURNING producto_id, precio;",
        "DELETE FROM pagos WHERE estado_pago = 'rechazado';",
        "INSERT INTO inventario (almacen_id, producto_id, cantidad_disponible) SELECT 2, producto_id, 10 FROM productos WHERE categoria_id = 3;",
    ]
    for q in allowed_dml:
        is_safe, error = validate_sql_security(q, mode=ExecutionMode.DML)
        assert is_safe is True, f"Se debió permitir en modo DML: {q} ({error})"
        assert error == ""

    blocked_in_dml = [
        "DROP TABLE clientes;",
        "ALTER TABLE productos ADD COLUMN descuento INT;",
        "CREATE TABLE test (id INT);",
        "TRUNCATE TABLE clientes;",
        "COPY clientes TO '/tmp/dump';",
        "GRANT ALL ON clientes TO public;",
        "INSERT INTO categorias (nombre_categoria) VALUES ('A'); DROP TABLE clientes;",
        "UPDATE productos SET precio = 10 WHERE pg_sleep(5) IS NOT NULL;",
    ]
    for q in blocked_in_dml:
        is_safe, error = validate_sql_security(q, mode=ExecutionMode.DML)
        assert is_safe is False, f"Se debió bloquear en modo DML: {q}"


def test_ddl_mode_allows_table_and_index_ddl_but_blocks_functions_roles_and_dml():
    """En modo DDL se permiten CREATE/ALTER/DROP sobre TABLE e INDEX, pero se bloquean FUNCTION, EXTENSION, ROLE, COPY y multi-sentencia."""
    allowed_ddl = [
        "CREATE TABLE cupones_descuento (cupon_id SERIAL PRIMARY KEY, codigo VARCHAR(20) UNIQUE NOT NULL, descuento_pct NUMERIC(5, 2) NOT NULL);",
        "ALTER TABLE almacenes ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;",
        "DROP TABLE IF EXISTS auditoria_temporal CASCADE;",
        "CREATE INDEX idx_clientes_ciudad ON clientes (ciudad);",
        "CREATE UNIQUE INDEX idx_pedidos_cliente_fecha ON pedidos (cliente_id, fecha_pedido);",
        "CREATE INDEX idx_pedidos_pendientes ON pedidos (fecha_pedido) WHERE estado_pedido = 'pendiente';",
        "DROP INDEX IF EXISTS idx_clientes_pais_antiguo;",
    ]
    for q in allowed_ddl:
        is_safe, error = validate_sql_security(q, mode=ExecutionMode.DDL)
        assert is_safe is True, f"Se debió permitir en modo DDL: {q} ({error})"
        assert error == ""

    blocked_in_ddl = [
        "CREATE FUNCTION hack() RETURNS INT AS $$ SELECT 1; $$ LANGUAGE sql;",
        "CREATE EXTENSION dblink;",
        "CREATE ROLE super_hacker WITH SUPERUSER;",
        "CREATE DATABASE pwned;",
        "COPY clientes TO '/tmp/out';",
        "GRANT ALL ON clientes TO public;",
        "CREATE TABLE t1 (id INT); DROP TABLE clientes;",
        "INSERT INTO clientes (nombre) VALUES ('x');",
    ]
    for q in blocked_in_ddl:
        is_safe, error = validate_sql_security(q, mode=ExecutionMode.DDL)
        assert is_safe is False, f"Se debió bloquear en modo DDL: {q}"


def test_enforce_row_limit_leaves_dml_and_ddl_unchanged():
    """enforce_row_limit no debe inyectar LIMIT en sentencias INSERT, UPDATE, DELETE o CREATE TABLE."""
    dml_sql = "INSERT INTO categorias (nombre_categoria) VALUES ('Audio')"
    assert "LIMIT" not in enforce_row_limit(dml_sql, max_rows=500).upper()

    ddl_sql = "CREATE TABLE cupones (id SERIAL PRIMARY KEY)"
    assert "LIMIT" not in enforce_row_limit(ddl_sql, max_rows=500).upper()


# ==============================================================================
# 1. PRUEBAS DEL CURRÍCULO OFICIAL (18 CONSULTAS)
# ==============================================================================

def test_all_curriculum_queries_pass_security():
    """Valida que todas las consultas oficiales del currículo pasen la validación AST según su execution_mode."""
    assert len(SEED_EXERCISES) >= 76, f"Se esperaban al menos 76 ejercicios en el currículo, encontrados {len(SEED_EXERCISES)}"
    for eid, exercise in SEED_EXERCISES.items():
        is_safe, error = validate_sql_security(exercise.solution_query, mode=exercise.execution_mode)
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
