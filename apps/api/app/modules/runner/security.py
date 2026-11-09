import logging
import re
from typing import Tuple

import sqlglot
from sqlglot import exp
from sqlglot.errors import ParseError

logger = logging.getLogger(__name__)

# Tipos de nodos del AST que representan operaciones de mutación, DDL o control transaccional
MUTATION_NODES = (
    exp.Insert,
    exp.Update,
    exp.Delete,
    exp.Drop,
    exp.Alter,
    exp.Create,
    exp.Command,
    exp.Grant,
    exp.Revoke,
    exp.TruncateTable,
    exp.Transaction,
    exp.Merge,
    exp.Copy,
)

# Raíces válidas permitidas para consultas de solo lectura
ALLOWED_ROOTS = (
    exp.Query,
    exp.Subquery,
)

# Funciones del sistema con potencial de DoS, acceso al sistema de archivos o escape de red
DANGEROUS_FUNCTIONS = {
    "pg_sleep",
    "pg_terminate_backend",
    "pg_cancel_backend",
    "pg_read_file",
    "pg_read_binary_file",
    "pg_write_file",
    "pg_write_binary_file",
    "dblink",
    "dblink_exec",
    "dblink_connect",
    "pg_ls_dir",
    "pg_stat_file",
    "lo_export",
    "lo_import",
    "set_config",
}

# Tablas y catálogos internos sensibles con información de seguridad o credenciales
SENSITIVE_TABLES = {
    "pg_shadow",
    "pg_authid",
    "pg_user",
    "pg_roles",
}

# Nombres legibles de palabras clave para mensajes de error
KEYWORD_NAMES = {
    exp.Drop: "DROP",
    exp.Alter: "ALTER",
    exp.Insert: "INSERT",
    exp.Update: "UPDATE",
    exp.Delete: "DELETE",
    exp.Create: "CREATE",
    exp.Grant: "GRANT",
    exp.Revoke: "REVOKE",
    exp.TruncateTable: "TRUNCATE",
    exp.Copy: "COPY",
    exp.Transaction: "TRANSACTION",
}


def strip_sql_comments(sql: str) -> str:
    """Elimina comentarios de una línea (-- ...) y de bloque (/* ... */)."""
    sql = re.sub(r"/\*.*?\*/", "", sql, flags=re.DOTALL)
    lines = [re.sub(r"--.*$", "", line) for line in sql.split("\n")]
    return "\n".join(lines).strip()


def validate_sql_security(sql: str) -> Tuple[bool, str]:
    """
    Valida que la consulta SQL enviada sea segura y apta para ejecución en el sandbox
    mediante análisis sintáctico de AST con SQLGlot (dialecto PostgreSQL).
    
    Aplica defensa en profundidad:
    1. Comprobación de consulta no vacía.
    2. Parseo sintáctico y control de sentencias múltiples (permite punto y coma en literales).
    3. Allowlist de nodos raíz (SELECT, UNION, INTERSECT, EXCEPT, WITH ...).
    4. Denylist de operaciones de mutación / DDL en cualquier parte del AST (incluyendo CTEs).
    5. Restricción de funciones peligrosas del sistema (pg_sleep, dblink, pg_read_file, etc.).
    6. Restricción de acceso a catálogos internos sensibles (pg_shadow, pg_authid).
    
    Retorna (is_valid, error_message).
    """
    if not sql or not sql.strip():
        return False, "La consulta SQL no puede estar vacía."

    clean_raw = strip_sql_comments(sql).strip()
    if not clean_raw:
        return False, "La consulta SQL no puede estar vacía."

    # 1. Parseo de la consulta con SQLGlot dialecto PostgreSQL
    try:
        statements = [s for s in sqlglot.parse(sql, read="postgres") if s is not None]
    except ParseError as e:
        logger.warning(f"Error de parseo AST en consulta: {e}")
        return False, f"Error de base de datos (SyntaxError): {str(e)}"
    except Exception as e:
        logger.warning(f"Error inesperado al parsear AST: {e}")
        return False, f"Error de base de datos (ParseError): {str(e)}"

    if not statements:
        return False, "La consulta SQL no contiene ninguna instrucción ejecutable."

    # 2. Control de sentencias múltiples (previene inyección de queries encadenadas)
    if len(statements) > 1:
        return False, "No está permitido ejecutar múltiples consultas en una sola transacción."

    root = statements[0]

    # 3. Allowlist de nodos raíz permitidos (lectura)
    if not isinstance(root, ALLOWED_ROOTS):
        for node_type, name in KEYWORD_NAMES.items():
            if isinstance(root, node_type):
                return False, f"La instrucción '{name}' no está permitida en este entorno de práctica."
        return False, "Solo se permiten consultas de lectura (SELECT o CTEs con WITH)."

    # 4. Denylist profunda: inspección de TODO el árbol AST (previene mutaciones en CTEs recursivas o subconsultas)
    for node in root.walk():
        if isinstance(node, MUTATION_NODES):
            keyword = "operación no permitida"
            for node_type, name in KEYWORD_NAMES.items():
                if isinstance(node, node_type):
                    keyword = name
                    break
            else:
                keyword = node.key.upper() if getattr(node, "key", None) else type(node).__name__.upper()
            return False, f"La instrucción '{keyword}' no está permitida en este entorno de práctica."

    # 5. Detección de funciones peligrosas del sistema
    for func in root.find_all(exp.Func):
        if isinstance(func, exp.Anonymous):
            func_name = (func.name or "").lower()
        else:
            func_name = (func.key or "").lower()

        if func_name in DANGEROUS_FUNCTIONS:
            return False, f"El uso de la función '{func_name}' está estrictamente restringido."

    # 6. Detección de acceso a catálogos o tablas internas sensibles
    for table in root.find_all(exp.Table):
        t_name = (table.name or "").lower()
        if t_name in SENSITIVE_TABLES:
            return False, f"El acceso a la tabla interna del sistema '{t_name}' no está permitido."

    return True, ""


def enforce_row_limit(sql: str, max_rows: int = 1000) -> str:
    """
    Asegura mediante manipulación del AST que la consulta tenga una cláusula LIMIT
    que no supere max_rows, protegiendo el consumo de memoria del sandbox.
    """
    try:
        tree = sqlglot.parse_one(sql, read="postgres")
        limit_node = tree.args.get("limit")
        if limit_node and limit_node.expression:
            try:
                current_limit = int(limit_node.expression.this)
                if current_limit > max_rows:
                    tree.set("limit", exp.Limit(expression=exp.Literal.number(max_rows)))
            except (ValueError, TypeError, AttributeError):
                tree.set("limit", exp.Limit(expression=exp.Literal.number(max_rows)))
        else:
            tree = tree.limit(max_rows)
        return tree.sql(dialect="postgres")
    except Exception:
        clean = strip_sql_comments(sql).rstrip(";").strip()
        limit_match = re.search(r"\bLIMIT\s+(\d+)\b", clean, re.IGNORECASE)
        if limit_match:
            current_limit = int(limit_match.group(1))
            if current_limit > max_rows:
                return re.sub(r"\bLIMIT\s+\d+\b", f"LIMIT {max_rows}", clean, flags=re.IGNORECASE)
            return clean
        return f"{clean} LIMIT {max_rows}"
