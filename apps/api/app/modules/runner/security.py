import re
from typing import Tuple


FORBIDDEN_KEYWORDS = [
    r"\bALTER\b",
    r"\bDROP\b",
    r"\bTRUNCATE\b",
    r"\bGRANT\b",
    r"\bREVOKE\b",
    r"\bCOPY\b",
    r"\bVACUUM\b",
    r"\bCREATE\b",
    r"\bINSERT\b",
    r"\bUPDATE\b",
    r"\bDELETE\b",
    r"\bCALL\b",
    r"\bDO\b",
]

FORBIDDEN_FUNCTIONS = [
    r"\bpg_sleep\b",
    r"\bpg_terminate_backend\b",
    r"\bpg_cancel_backend\b",
    r"\bpg_read_file\b",
    r"\bpg_write_file\b",
    r"\bdblink\b",
]


def strip_sql_comments(sql: str) -> str:
    """Elimina comentarios de una línea (-- ...) y de bloque (/* ... */)"""
    # Eliminar comentarios de bloque
    sql = re.sub(r"/\*.*?\*/", "", sql, flags=re.DOTALL)
    # Eliminar comentarios de una línea
    lines = [re.sub(r"--.*$", "", line) for line in sql.split("\n")]
    return "\n".join(lines).strip()


def validate_sql_security(sql: str) -> Tuple[bool, str]:
    """
    Valida que la consulta SQL enviada sea segura y apta para ejecución en el sandbox.
    Retorna (is_valid, error_message).
    """
    clean_sql = strip_sql_comments(sql).strip()
    if not clean_sql:
        return False, "La consulta SQL no puede estar vacía."

    # 1. Verificar sentencias múltiples
    # Permitir punto y coma únicamente al final de la consulta
    statements = [s.strip() for s in clean_sql.split(";") if s.strip()]
    if len(statements) > 1:
        return False, "No está permitido ejecutar múltiples consultas en una sola transacción."

    # 2. Bloquear palabras clave no permitidas en el modo de solo lectura del MVP
    for pattern in FORBIDDEN_KEYWORDS:
        if re.search(pattern, clean_sql, re.IGNORECASE):
            match = re.search(pattern, clean_sql, re.IGNORECASE)
            keyword = match.group(0).upper() if match else "operación prohibida"
            return False, f"La instrucción '{keyword}' no está permitida en este entorno de práctica."

    # 3. Bloquear funciones del sistema peligrosas
    for pattern in FORBIDDEN_FUNCTIONS:
        if re.search(pattern, clean_sql, re.IGNORECASE):
            match = re.search(pattern, clean_sql, re.IGNORECASE)
            func_name = match.group(0) if match else "función del sistema"
            return False, f"El uso de la función '{func_name}' está estrictamente restringido."

    # 4. Asegurar que inicie con una operación de lectura permitida (SELECT, WITH, EXPLAIN)
    if not re.match(r"^\s*(SELECT|WITH|EXPLAIN)\b", clean_sql, re.IGNORECASE):
        return False, "Solo se permiten consultas de lectura (SELECT o CTEs con WITH)."

    return True, ""


def enforce_row_limit(sql: str, max_rows: int = 1000) -> str:
    """
    Si la consulta no contiene una cláusula LIMIT, o su límite excede max_rows,
    se asegura de envolverla para proteger el consumo de memoria.
    """
    clean = strip_sql_comments(sql).rstrip(";").strip()
    # Si ya tiene LIMIT, lo dejamos tal cual a menos que sea excesivo
    limit_match = re.search(r"\bLIMIT\s+(\d+)\b", clean, re.IGNORECASE)
    if limit_match:
        current_limit = int(limit_match.group(1))
        if current_limit > max_rows:
            clean = re.sub(r"\bLIMIT\s+\d+\b", f"LIMIT {max_rows}", clean, flags=re.IGNORECASE)
        return clean

    return f"{clean} LIMIT {max_rows}"
