from collections import deque
from datetime import datetime, timezone
from enum import Enum
import logging
import re
import threading
from typing import Deque, Dict, List, Tuple, Union

import sqlglot
from sqlglot import exp
from sqlglot.errors import ParseError
from app.modules.runner.schemas import ExecutionMode

logger = logging.getLogger(__name__)

# Buffer circular de alta velocidad en memoria para trazabilidad forense de bloqueos AST
_SECURITY_AUDIT_LOCK = threading.Lock()
_SECURITY_AUDIT_BUFFER: Deque[Dict[str, str]] = deque(maxlen=500)


def record_security_violation(
    rule_violated: str,
    submitted_sql: str,
    blocked_node: str,
    client_ip: str = "unknown",
    user_id: str = "guest",
) -> None:
    """Registra una violación detectada por el analizador AST en el buffer circular."""
    snippet = " ".join((submitted_sql or "").strip().split())[:240]
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "client_ip": client_ip or "unknown",
        "user_id": user_id or "guest",
        "rule_violated": rule_violated,
        "submitted_sql_snippet": snippet,
        "blocked_node": blocked_node,
    }
    with _SECURITY_AUDIT_LOCK:
        _SECURITY_AUDIT_BUFFER.appendleft(event)


def get_security_audit_logs(limit: int = 100) -> List[Dict[str, str]]:
    """Devuelve las últimas violaciones de seguridad AST en orden cronológico inverso."""
    bounded = max(1, min(limit, 500))
    with _SECURITY_AUDIT_LOCK:
        return list(_SECURITY_AUDIT_BUFFER)[:bounded]


def clear_security_audit_logs() -> None:
    """Limpia el buffer circular de auditoría (útil para aislamiento en pruebas)."""
    with _SECURITY_AUDIT_LOCK:
        _SECURITY_AUDIT_BUFFER.clear()

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

# Nodos prohibidos siempre en CUALQUIER modo (RCE, escalada de privilegios, manipulación de sesión/archivos)
ALWAYS_FORBIDDEN_NODES = (
    exp.Command,
    exp.Grant,
    exp.Revoke,
    exp.TruncateTable,
    exp.Transaction,
    exp.Merge,
    exp.Copy,
)

# Raíces válidas permitidas según el modo de ejecución del ejercicio
ALLOWED_ROOTS = (
    exp.Query,
    exp.Subquery,
)

DML_ALLOWED_ROOTS = (
    exp.Insert,
    exp.Update,
    exp.Delete,
)

DDL_ALLOWED_ROOTS = (
    exp.Create,
    exp.Alter,
    exp.Drop,
)

ALLOWED_DDL_KINDS = {"TABLE", "INDEX", "VIEW"}

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


def validate_sql_security(
    sql: str,
    client_ip: str = "unknown",
    user_id: str = "guest",
    mode: Union[ExecutionMode, str] = ExecutionMode.READ_ONLY,
) -> Tuple[bool, str]:
    """
    Valida que la consulta SQL enviada sea segura y apta para ejecución en el sandbox
    mediante análisis sintáctico de AST con SQLGlot (dialecto PostgreSQL).
    
    Aplica defensa en profundidad según el modo de ejecución (`read_only`, `dml`, `ddl`):
    1. Comprobación de consulta no vacía.
    2. Parseo sintáctico y control de sentencias múltiples (permite punto y coma en literales).
    3. Allowlist contextual de nodos raíz según `mode`.
    4. Denylist profunda en todo el árbol AST (bloquea siempre COPY, GRANT, REVOKE, FUNCTION, EXTENSION, etc.).
    5. Restricción de funciones peligrosas del sistema (pg_sleep, dblink, pg_read_file, etc.).
    6. Restricción de acceso a catálogos internos sensibles (pg_shadow, pg_authid, pg_roles).
    
    Retorna (is_valid, error_message).
    """
    exec_mode = ExecutionMode(mode) if isinstance(mode, str) else mode

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
        record_security_violation(
            rule_violated="AST_PARSE_ERROR",
            submitted_sql=sql,
            blocked_node="ParseError",
            client_ip=client_ip,
            user_id=user_id,
        )
        return False, f"Error de base de datos (SyntaxError): {str(e)}"
    except Exception as e:
        logger.warning(f"Error inesperado al parsear AST: {e}")
        record_security_violation(
            rule_violated="AST_PARSE_UNEXPECTED",
            submitted_sql=sql,
            blocked_node=type(e).__name__,
            client_ip=client_ip,
            user_id=user_id,
        )
        return False, f"Error de base de datos (ParseError): {str(e)}"

    if not statements:
        return False, "La consulta SQL no contiene ninguna instrucción ejecutable."

    # 2. Control de sentencias múltiples (previene inyección de queries encadenadas)
    if len(statements) > 1:
        record_security_violation(
            rule_violated="MULTI_STATEMENT_BLOCKED",
            submitted_sql=sql,
            blocked_node=f"Statements[{len(statements)}]",
            client_ip=client_ip,
            user_id=user_id,
        )
        return False, "No está permitido ejecutar múltiples consultas en una sola transacción."

    root = statements[0]

    # 3. Allowlist contextual de nodos raíz permitidos
    if exec_mode == ExecutionMode.READ_ONLY:
        allowed_roots = ALLOWED_ROOTS
        mode_hint = "Solo se permiten consultas de lectura (SELECT o CTEs con WITH)."
    elif exec_mode == ExecutionMode.DML:
        allowed_roots = DML_ALLOWED_ROOTS
        mode_hint = "Este reto requiere una instrucción de manipulación de datos (INSERT, UPDATE o DELETE)."
    else:
        allowed_roots = DDL_ALLOWED_ROOTS
        mode_hint = "Este reto requiere una instrucción de definición de esquema o índices (CREATE, ALTER o DROP)."

    if not isinstance(root, allowed_roots):
        blocked_name = type(root).__name__
        for node_type, name in KEYWORD_NAMES.items():
            if isinstance(root, node_type):
                blocked_name = name
                record_security_violation(
                    rule_violated="DISALLOWED_ROOT_STATEMENT",
                    submitted_sql=sql,
                    blocked_node=blocked_name,
                    client_ip=client_ip,
                    user_id=user_id,
                )
                return False, f"La instrucción '{name}' no está permitida en este entorno de práctica."
        record_security_violation(
            rule_violated="DISALLOWED_ROOT_STATEMENT",
            submitted_sql=sql,
            blocked_node=blocked_name,
            client_ip=client_ip,
            user_id=user_id,
        )
        return False, mode_hint

    # En modo DDL, validar que el tipo de objeto sea exclusivamente TABLE, INDEX o VIEW
    if exec_mode == ExecutionMode.DDL:
        ddl_kind = str(root.args.get("kind") or "").upper()
        if not ddl_kind and isinstance(root, exp.Alter):
            ddl_kind = "TABLE"
        if ddl_kind not in ALLOWED_DDL_KINDS:
            record_security_violation(
                rule_violated="DISALLOWED_DDL_OBJECT_KIND",
                submitted_sql=sql,
                blocked_node=ddl_kind or type(root).__name__,
                client_ip=client_ip,
                user_id=user_id,
            )
            return False, f"No está permitido definir o modificar objetos de tipo '{ddl_kind or 'sistema'}' en el sandbox."

    # 4. Denylist profunda: inspección de TODO el árbol AST
    for node in root.walk():
        if isinstance(node, ALWAYS_FORBIDDEN_NODES):
            keyword = KEYWORD_NAMES.get(type(node), type(node).__name__.upper())
            record_security_violation(
                rule_violated="ALWAYS_FORBIDDEN_NODE_BLOCKED",
                submitted_sql=sql,
                blocked_node=keyword,
                client_ip=client_ip,
                user_id=user_id,
            )
            return False, f"La instrucción '{keyword}' no está permitida en este entorno de práctica."

        if exec_mode == ExecutionMode.READ_ONLY and isinstance(node, MUTATION_NODES):
            keyword = "operación no permitida"
            for node_type, name in KEYWORD_NAMES.items():
                if isinstance(node, node_type):
                    keyword = name
                    break
            else:
                keyword = node.key.upper() if getattr(node, "key", None) else type(node).__name__.upper()
            record_security_violation(
                rule_violated="NESTED_MUTATION_OR_DDL_BLOCKED",
                submitted_sql=sql,
                blocked_node=keyword,
                client_ip=client_ip,
                user_id=user_id,
            )
            return False, f"La instrucción '{keyword}' no está permitida en este entorno de práctica."

        if exec_mode == ExecutionMode.DML and isinstance(node, DDL_ALLOWED_ROOTS):
            keyword = KEYWORD_NAMES.get(type(node), type(node).__name__.upper())
            record_security_violation(
                rule_violated="DDL_IN_DML_MODE_BLOCKED",
                submitted_sql=sql,
                blocked_node=keyword,
                client_ip=client_ip,
                user_id=user_id,
            )
            return False, f"La instrucción '{keyword}' no está permitida en un ejercicio de manipulación DML."

        if exec_mode == ExecutionMode.DDL and isinstance(node, DML_ALLOWED_ROOTS):
            keyword = KEYWORD_NAMES.get(type(node), type(node).__name__.upper())
            record_security_violation(
                rule_violated="DML_IN_DDL_MODE_BLOCKED",
                submitted_sql=sql,
                blocked_node=keyword,
                client_ip=client_ip,
                user_id=user_id,
            )
            return False, f"La instrucción '{keyword}' no está permitida en un ejercicio de definición DDL."

    # 5. Detección de funciones peligrosas del sistema
    for func in root.find_all(exp.Func):
        if isinstance(func, exp.Anonymous):
            func_name = (func.name or "").lower()
        else:
            func_name = (func.key or "").lower()

        if func_name in DANGEROUS_FUNCTIONS:
            record_security_violation(
                rule_violated="DANGEROUS_SYSTEM_FUNCTION",
                submitted_sql=sql,
                blocked_node=func_name,
                client_ip=client_ip,
                user_id=user_id,
            )
            return False, f"El uso de la función '{func_name}' está estrictamente restringido."

    # 6. Detección de acceso a catálogos o tablas internas sensibles
    for table in root.find_all(exp.Table):
        t_name = (table.name or "").lower()
        if t_name in SENSITIVE_TABLES:
            record_security_violation(
                rule_violated="SENSITIVE_SYSTEM_TABLE_ACCESS",
                submitted_sql=sql,
                blocked_node=t_name,
                client_ip=client_ip,
                user_id=user_id,
            )
            return False, f"El acceso a la tabla interna del sistema '{t_name}' no está permitido."

    return True, ""


def enforce_row_limit(sql: str, max_rows: int = 1000) -> str:
    """
    Asegura mediante manipulación del AST que la consulta de lectura tenga una cláusula LIMIT
    que no supere max_rows. Si la raíz es una sentencia DML o DDL, la devuelve intacta.
    """
    try:
        tree = sqlglot.parse_one(sql, read="postgres")
        if not isinstance(tree, ALLOWED_ROOTS):
            return sql.strip()
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
        if not re.match(r"^\s*(SELECT|WITH|\()", clean, re.IGNORECASE):
            return sql.strip()
        limit_match = re.search(r"\bLIMIT\s+(\d+)\b", clean, re.IGNORECASE)
        if limit_match:
            current_limit = int(limit_match.group(1))
            if current_limit > max_rows:
                return re.sub(r"\bLIMIT\s+\d+\b", f"LIMIT {max_rows}", clean, flags=re.IGNORECASE)
            return clean
        return f"{clean} LIMIT {max_rows}"
