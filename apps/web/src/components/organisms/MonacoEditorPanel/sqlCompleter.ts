import { ECOMMERCE_TABLES_SCHEMA } from '@/lib/api';

// Palabras clave principales de SQL / PostgreSQL
const SQL_KEYWORDS = [
  { label: 'SELECT', detail: 'Proyección de columnas', insertText: 'SELECT ' },
  { label: 'FROM', detail: 'Tabla de origen', insertText: 'FROM ' },
  { label: 'WHERE', detail: 'Filtro condicional', insertText: 'WHERE ' },
  { label: 'INNER JOIN', detail: 'Cruce interno relacional', insertText: 'INNER JOIN ${1:tabla} ON ${2:condicion}' },
  { label: 'LEFT JOIN', detail: 'Cruce externo izquierdo (preserva registros huérfanos)', insertText: 'LEFT JOIN ${1:tabla} ON ${2:condicion}' },
  { label: 'CROSS JOIN', detail: 'Producto cartesiano o cruce con CTE escalar', insertText: 'CROSS JOIN ${1:tabla}' },
  { label: 'RIGHT JOIN', detail: 'Cruce externo derecho', insertText: 'RIGHT JOIN ${1:tabla} ON ${2:condicion}' },
  { label: 'FULL JOIN', detail: 'Cruce externo completo', insertText: 'FULL JOIN ${1:tabla} ON ${2:condicion}' },
  { label: 'ON', detail: 'Predicado de cruce JOIN', insertText: 'ON ' },
  { label: 'AS', detail: 'Alias de columna o tabla', insertText: 'AS ' },
  { label: 'ORDER BY', detail: 'Ordenamiento de resultados', insertText: 'ORDER BY ' },
  { label: 'ASC', detail: 'Orden ascendente', insertText: 'ASC' },
  { label: 'DESC', detail: 'Orden descendente', insertText: 'DESC' },
  { label: 'GROUP BY', detail: 'Agrupamiento de filas', insertText: 'GROUP BY ' },
  { label: 'HAVING', detail: 'Filtro sobre grupos agregados', insertText: 'HAVING ' },
  { label: 'LIMIT', detail: 'Límite de filas devueltas', insertText: 'LIMIT ' },
  { label: 'OFFSET', detail: 'Desplazamiento de filas', insertText: 'OFFSET ' },
  { label: 'DISTINCT', detail: 'Valores únicos sin duplicados', insertText: 'DISTINCT ' },
  { label: 'WITH', detail: 'Expresión de tabla común (CTE)', insertText: 'WITH ${1:cte} AS (\n  SELECT ${2:*}\n  FROM ${3:tabla}\n)\n' },
  { label: 'AND', detail: 'Operador lógico Y', insertText: 'AND ' },
  { label: 'OR', detail: 'Operador lógico O', insertText: 'OR ' },
  { label: 'NOT', detail: 'Negación lógica', insertText: 'NOT ' },
  { label: 'IN', detail: 'Pertenencia en conjunto', insertText: 'IN (${1:valores})' },
  { label: 'NOT IN', detail: 'Exclusión de conjunto', insertText: 'NOT IN (${1:valores})' },
  { label: 'EXISTS', detail: 'Existencia en subconsulta', insertText: 'EXISTS (${1:SELECT 1 FROM ...})' },
  { label: 'BETWEEN', detail: 'Rango de valores inclusivo', insertText: 'BETWEEN ${1:min} AND ${2:max}' },
  { label: 'LIKE', detail: 'Coincidencia de patrón sensible a mayúsculas', insertText: "LIKE '${1:%patron%}'" },
  { label: 'ILIKE', detail: 'Coincidencia insensible a mayúsculas (PostgreSQL)', insertText: "ILIKE '${1:%patron%}'" },
  { label: 'IS NULL', detail: 'Comprobación de valor nulo', insertText: 'IS NULL' },
  { label: 'IS NOT NULL', detail: 'Comprobación de valor no nulo', insertText: 'IS NOT NULL' },
  { label: 'COUNT', detail: 'Función agregada: contar registros', insertText: 'COUNT(${1:*})' },
  { label: 'COUNT(DISTINCT)', detail: 'Función agregada: contar valores únicos no nulos', insertText: 'COUNT(DISTINCT ${1:columna})' },
  { label: 'SUM', detail: 'Función agregada: sumatoria numérica', insertText: 'SUM(${1:columna})' },
  { label: 'AVG', detail: 'Función agregada: promedio', insertText: 'AVG(${1:columna})' },
  { label: 'MIN', detail: 'Función agregada: valor mínimo', insertText: 'MIN(${1:columna})' },
  { label: 'MAX', detail: 'Función agregada: valor máximo', insertText: 'MAX(${1:columna})' },
  { label: 'ROUND', detail: 'Redondeo decimal', insertText: 'ROUND(${1:valor}, ${2:decimales})' },
  { label: 'ROW_NUMBER', detail: 'Función ventana: posición ordinal', insertText: 'ROW_NUMBER() OVER (ORDER BY ${1:columna} DESC)' },
  { label: 'RANK', detail: 'Función ventana: ranking con saltos ante empates', insertText: 'RANK() OVER (ORDER BY ${1:columna} DESC)' },
  { label: 'DENSE_RANK', detail: 'Función ventana: ranking denso', insertText: 'DENSE_RANK() OVER (ORDER BY ${1:columna} DESC)' },
  { label: 'LAG', detail: 'Función ventana: valor de fila anterior', insertText: 'LAG(${1:columna}) OVER (PARTITION BY ${2:grupo} ORDER BY ${3:orden})' },
  { label: 'LEAD', detail: 'Función ventana: valor de fila siguiente', insertText: 'LEAD(${1:columna}) OVER (PARTITION BY ${2:grupo} ORDER BY ${3:orden})' },
  { label: 'OVER', detail: 'Cláusula de ventana analítica', insertText: 'OVER (${1:ORDER BY ...})' },
  { label: 'PARTITION BY', detail: 'Particionamiento de ventana', insertText: 'PARTITION BY ${1:columna}' },
  { label: 'CASE WHEN', detail: 'Estructura condicional', insertText: 'CASE WHEN ${1:condicion} THEN ${2:resultado} ELSE ${3:defecto} END' },
  { label: 'UNION', detail: 'Unión de consultas sin duplicados', insertText: 'UNION ' },
  { label: 'UNION ALL', detail: 'Unión de consultas con duplicados', insertText: 'UNION ALL ' },
  { label: 'INTERSECT', detail: 'Intersección de conjuntos', insertText: 'INTERSECT ' },
  { label: 'EXCEPT', detail: 'Diferencia de conjuntos', insertText: 'EXCEPT ' },
  { label: 'COALESCE', detail: 'Devuelve el primer valor no nulo', insertText: 'COALESCE(${1:columna}, ${2:valor_defecto})' },
  { label: 'INSERT INTO', detail: 'Inserción de nuevas filas (DML)', insertText: 'INSERT INTO ${1:tabla} (${2:columnas})\nVALUES (${3:valores});' },
  { label: 'ON CONFLICT DO UPDATE', detail: 'UPSERT atómico ante clave duplicada (PostgreSQL)', insertText: 'ON CONFLICT (${1:clave})\nDO UPDATE SET ${2:col} = ${3:EXCLUDED.col}' },
  { label: 'ON CONFLICT DO NOTHING', detail: 'Ignora colisiones de clave duplicada (PostgreSQL)', insertText: 'ON CONFLICT (${1:clave}) DO NOTHING' },
  { label: 'EXCLUDED', detail: 'Fila propuesta rechazada por conflicto en UPSERT', insertText: 'EXCLUDED.' },
  { label: 'VALUES', detail: 'Tuplas de valores a insertar', insertText: 'VALUES (${1:valores})' },
  { label: 'UPDATE', detail: 'Actualización de registros (DML)', insertText: 'UPDATE ${1:tabla}\nSET ${2:columna} = ${3:valor}\nWHERE ${4:condicion};' },
  { label: 'SET', detail: 'Asignación de columnas en UPDATE', insertText: 'SET ' },
  { label: 'DELETE FROM', detail: 'Eliminación de filas filtradas (DML)', insertText: 'DELETE FROM ${1:tabla}\nWHERE ${2:condicion};' },
  { label: 'RETURNING', detail: 'Proyecta columnas de las filas afectadas (PostgreSQL)', insertText: 'RETURNING ' },
  { label: 'CREATE TABLE', detail: 'Define una nueva tabla relacional (DDL)', insertText: 'CREATE TABLE ${1:nombre_tabla} (\n  ${2:id} SERIAL PRIMARY KEY,\n  ${3:columna} VARCHAR(50) NOT NULL\n);' },
  { label: 'ALTER TABLE', detail: 'Modifica la estructura de una tabla (DDL)', insertText: 'ALTER TABLE ${1:tabla} ADD COLUMN ${2:columna} ${3:BOOLEAN NOT NULL DEFAULT FALSE};' },
  { label: 'ADD COLUMN', detail: 'Agrega una nueva columna a la tabla', insertText: 'ADD COLUMN ' },
  { label: 'DROP TABLE IF EXISTS', detail: 'Elimina una tabla de forma idempotente (DDL)', insertText: 'DROP TABLE IF EXISTS ${1:tabla} CASCADE;' },
  { label: 'CREATE INDEX', detail: 'Crea un índice B-Tree de optimización (DDL)', insertText: 'CREATE INDEX ${1:idx_tabla_col} ON ${2:tabla} (${3:columna});' },
  { label: 'CREATE UNIQUE INDEX', detail: 'Crea un índice único simple o compuesto (DDL)', insertText: 'CREATE UNIQUE INDEX ${1:idx_unico} ON ${2:tabla} (${3:col1}, ${4:col2});' },
  { label: 'DROP INDEX IF EXISTS', detail: 'Elimina un índice del catálogo (DDL)', insertText: 'DROP INDEX IF EXISTS ${1:nombre_indice};' },
  { label: 'SERIAL PRIMARY KEY', detail: 'Clave primaria entera autoincremental', insertText: 'SERIAL PRIMARY KEY' },
  { label: 'REFERENCES', detail: 'Restricción de clave foránea (FOREIGN KEY)', insertText: 'REFERENCES ${1:tabla_padre}(${2:id})' },
  { label: 'CHECK', detail: 'Restricción de validación de dominio', insertText: 'CHECK (${1:condicion})' },
  { label: 'DEFAULT', detail: 'Valor por defecto de columna', insertText: 'DEFAULT ' },
  { label: 'CASCADE', detail: 'Propagación en cascada a objetos dependientes', insertText: 'CASCADE' },
];

const RESERVED_WORDS = new Set([
  'where', 'on', 'using', 'inner', 'left', 'right', 'full', 'cross', 'natural', 'outer', 'join',
  'group', 'order', 'by', 'limit', 'offset', 'fetch', 'for', 'having', 'select', 'distinct',
  'from', 'into', 'values', 'set', 'update', 'delete', 'insert', 'returning', 'with', 'recursive',
  'conflict', 'do', 'nothing', 'excluded',
  'and', 'or', 'not', 'as', 'in', 'exists', 'between', 'like', 'ilike', 'is', 'null',
  'union', 'intersect', 'except', 'window', 'over', 'partition', 'case', 'when', 'then', 'else', 'end',
  'true', 'false', 'asc', 'desc', 'all', 'any', 'some',
]);

export interface CteDefinition {
  name: string;
  columns: string[];
}

export interface StatementSpan {
  start: number;
  end: number;
  text: string;
  masked: string;
  relativeOffset: number;
}

/**
 * Enmascara cadenas ('...'), identificadores comillados ("...") y comentarios (-- y /* ... *\/)
 * reemplazando su interior por espacios para preservar exactamente los índices de carácter.
 */
export function maskSqlLiteralsAndComments(sql: string): string {
  const chars = sql.split('');
  const len = sql.length;
  let i = 0;

  while (i < len) {
    const ch = sql[i];
    const next = i + 1 < len ? sql[i + 1] : '';

    // Comentario de línea: -- ...
    if (ch === '-' && next === '-') {
      chars[i] = ' ';
      chars[i + 1] = ' ';
      i += 2;
      while (i < len && sql[i] !== '\n') {
        chars[i] = ' ';
        i++;
      }
      continue;
    }

    // Comentario de bloque: /* ... */
    if (ch === '/' && next === '*') {
      chars[i] = ' ';
      chars[i + 1] = ' ';
      i += 2;
      while (i < len) {
        if (sql[i] === '*' && i + 1 < len && sql[i + 1] === '/') {
          chars[i] = ' ';
          chars[i + 1] = ' ';
          i += 2;
          break;
        }
        chars[i] = sql[i] === '\n' ? '\n' : ' ';
        i++;
      }
      continue;
    }

    // Cadena literal: '...'
    if (ch === "'") {
      chars[i] = ' ';
      i++;
      while (i < len) {
        if (sql[i] === "'") {
          chars[i] = ' ';
          i++;
          if (i < len && sql[i] === "'") {
            chars[i] = ' ';
            i++;
            continue;
          }
          break;
        }
        chars[i] = sql[i] === '\n' ? '\n' : ' ';
        i++;
      }
      continue;
    }

    // Identificador entre comillas dobles: "..."
    if (ch === '"') {
      i++;
      while (i < len) {
        if (sql[i] === '"') {
          i++;
          if (i < len && sql[i] === '"') {
            i++;
            continue;
          }
          break;
        }
        i++;
      }
      continue;
    }

    i++;
  }

  return chars.join('');
}

/**
 * Obtiene únicamente la sentencia SQL activa delimitada por `;` alrededor de `cursorOffset`.
 */
export function getActiveStatementAtOffset(sql: string, cursorOffset: number): StatementSpan {
  const clampedOffset = Math.max(0, Math.min(cursorOffset, sql.length));
  const masked = maskSqlLiteralsAndComments(sql);

  let stmtStart = 0;
  for (let i = 0; i < clampedOffset; i++) {
    if (masked[i] === ';') {
      stmtStart = i + 1;
    }
  }

  let stmtEnd = sql.length;
  for (let i = clampedOffset; i < sql.length; i++) {
    if (masked[i] === ';') {
      stmtEnd = i;
      break;
    }
  }

  return {
    start: stmtStart,
    end: stmtEnd,
    text: sql.slice(stmtStart, stmtEnd),
    masked: masked.slice(stmtStart, stmtEnd),
    relativeOffset: clampedOffset - stmtStart,
  };
}

/**
 * Extrae la sentencia ejecutable bajo el cursor (si el usuario deja el cursor justo
 * después de un `;`, toma la sentencia inmediatamente anterior si no hay otra debajo).
 */
export function extractExecutableStatementAtOffset(sql: string, cursorOffset: number): string {
  const active = getActiveStatementAtOffset(sql, cursorOffset);
  if (active.text.trim()) {
    return active.text.trim();
  }
  if (active.start > 0) {
    const prev = getActiveStatementAtOffset(sql, Math.max(0, active.start - 1));
    if (prev.text.trim()) {
      return prev.text.trim();
    }
  }
  return sql.trim();
}

/**
 * Devuelve la porción del statement correspondiente al nivel de paréntesis del cursor,
 * enmascarando bloques de subconsultas hermanas o anidadas que no contienen al cursor.
 */
function maskUnrelatedParentheses(maskedSql: string, relativeOffset: number): {
  currentScope: string;
  outerScopes: string[];
} {
  const stack: number[] = [];
  const pairs: Array<{ open: number; close: number }> = [];

  for (let i = 0; i < maskedSql.length; i++) {
    if (maskedSql[i] === '(') {
      stack.push(i);
    } else if (maskedSql[i] === ')' && stack.length > 0) {
      const open = stack.pop()!;
      pairs.push({ open, close: i });
    }
  }

  // Pares que contienen al cursor, del más interno al más externo
  const enclosing = pairs
    .filter((p) => p.open < relativeOffset && relativeOffset <= p.close)
    .sort((a, b) => (a.close - a.open) - (b.close - b.open));

  const maskChildParens = (sliceStart: number, sliceEnd: number, targetOffset: number): string => {
    const chars = maskedSql.slice(sliceStart, sliceEnd).split('');
    for (const p of pairs) {
      if (p.open >= sliceStart && p.close < sliceEnd) {
        const containsCursor = p.open < targetOffset && targetOffset <= p.close;
        if (!containsCursor) {
          for (let k = p.open + 1; k < p.close; k++) {
            chars[k - sliceStart] = chars[k - sliceStart] === '\n' ? '\n' : ' ';
          }
        }
      }
    }
    return chars.join('');
  };

  if (enclosing.length === 0) {
    return {
      currentScope: maskChildParens(0, maskedSql.length, relativeOffset),
      outerScopes: [],
    };
  }

  const innermost = enclosing[0];
  const currentScope = maskChildParens(innermost.open + 1, innermost.close, relativeOffset);
  const outerScopes = enclosing.slice(1).map((p) => maskChildParens(p.open + 1, p.close, relativeOffset));
  outerScopes.push(maskChildParens(0, maskedSql.length, relativeOffset));

  return { currentScope, outerScopes };
}

/**
 * Extrae las CTEs (`WITH nombre [(cols)] AS (...)`) definidas al inicio de la sentencia activa.
 */
export function extractCtesFromStatement(maskedStmt: string): CteDefinition[] {
  const ctes: CteDefinition[] = [];
  const withMatch = /^\s*WITH(?:\s+RECURSIVE)?\s+/i.exec(maskedStmt);
  if (!withMatch) return ctes;

  let idx = withMatch[0].length;
  const len = maskedStmt.length;

  while (idx < len) {
    // Leer nombre de la CTE y columnas opcionales: nombre [(c1, c2)] AS (
    const headerSlice = maskedStmt.slice(idx);
    const cteHeader = /^([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*\(([^)]*)\))?\s+AS\s*\(/i.exec(headerSlice);
    if (!cteHeader) break;

    const cteName = cteHeader[1].toLowerCase();
    const explicitColsRaw = cteHeader[2];
    const bodyStart = idx + cteHeader[0].length;

    let depth = 1;
    let cursor = bodyStart;
    while (cursor < len && depth > 0) {
      if (maskedStmt[cursor] === '(') depth++;
      else if (maskedStmt[cursor] === ')') depth--;
      cursor++;
    }

    const body = maskedStmt.slice(bodyStart, Math.max(bodyStart, cursor - 1));
    let columns: string[] = [];

    if (explicitColsRaw) {
      columns = explicitColsRaw
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
    } else {
      columns = extractProjectedColumns(body);
    }

    ctes.push({ name: cteName, columns });

    // Avanzar tras coma si hay otra CTE
    const afterParen = maskedStmt.slice(cursor);
    const commaMatch = /^\s*,\s*/.exec(afterParen);
    if (!commaMatch) break;
    idx = cursor + commaMatch[0].length;
  }

  return ctes;
}

function extractProjectedColumns(maskedSelectBody: string): string[] {
  const selectMatch = /\bSELECT\s+(?:DISTINCT\s+)?([\s\S]*?)\bFROM\b/i.exec(maskedSelectBody);
  if (!selectMatch) return [];

  const projection = selectMatch[1];
  const parts: string[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < projection.length; i++) {
    if (projection[i] === '(') depth++;
    else if (projection[i] === ')' && depth > 0) depth--;
    else if (projection[i] === ',' && depth === 0) {
      parts.push(projection.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(projection.slice(start));

  const cols: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed || trimmed === '*' || trimmed.endsWith('.*')) continue;
    const asMatch = /\bAS\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*$/i.exec(trimmed);
    if (asMatch) {
      cols.push(asMatch[1]);
      continue;
    }
    const idMatch = /(?:[a-zA-Z_][a-zA-Z0-9_]*\.)?([a-zA-Z_][a-zA-Z0-9_]*)\s*$/.exec(trimmed);
    if (idMatch && !RESERVED_WORDS.has(idMatch[1].toLowerCase())) {
      cols.push(idMatch[1]);
    }
  }
  return cols;
}

function extractAliasesFromScope(scopeSql: string): Map<string, string> {
  const aliasMap = new Map<string, string>();

  // 1. FROM / JOIN <schema.tabla | tabla> [AS] <alias>
  const fromJoinRegex =
    /\b(?:FROM|JOIN|INTO|UPDATE)\s+(?:[a-zA-Z_][a-zA-Z0-9_]*\.)?([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+(?:AS\s+)?([a-zA-Z_][a-zA-Z0-9_]*))?\b/gi;
  let match: RegExpExecArray | null;

  while ((match = fromJoinRegex.exec(scopeSql)) !== null) {
    const tableName = match[1].toLowerCase();
    if (RESERVED_WORDS.has(tableName)) continue;

    const potentialAlias = match[2] ? match[2].toLowerCase() : null;
    if (potentialAlias && !RESERVED_WORDS.has(potentialAlias)) {
      aliasMap.set(potentialAlias, tableName);
    }
    aliasMap.set(tableName, tableName);
  }

  // 2. Comas en cláusula FROM: FROM tabla1 a, tabla2 b
  const fromClauseRegex = /\bFROM\s+([\s\S]*?)(?:\b(?:WHERE|GROUP|HAVING|ORDER|LIMIT|OFFSET|UNION|INTERSECT|EXCEPT|JOIN|INNER|LEFT|RIGHT|FULL|CROSS|NATURAL)\b|$)/gi;
  let clauseMatch: RegExpExecArray | null;
  while ((clauseMatch = fromClauseRegex.exec(scopeSql)) !== null) {
    const items = clauseMatch[1].split(',');
    for (const item of items) {
      const pair = /^\s*(?:[a-zA-Z_][a-zA-Z0-9_]*\.)?([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+(?:AS\s+)?([a-zA-Z_][a-zA-Z0-9_]*))?\s*$/i.exec(
        item
      );
      if (!pair) continue;
      const tbl = pair[1].toLowerCase();
      if (RESERVED_WORDS.has(tbl)) continue;
      const al = pair[2] ? pair[2].toLowerCase() : null;
      if (al && !RESERVED_WORDS.has(al)) {
        aliasMap.set(al, tbl);
      }
      aliasMap.set(tbl, tbl);
    }
  }

  return aliasMap;
}

/**
 * Analiza únicamente la sentencia activa y el scope de paréntesis alrededor de `cursorOffset`.
 * Evita que sentencias separadas por `;` o subconsultas hermanas crucen sus alias.
 */
export function extractTableAliases(sql: string, cursorOffset?: number): Map<string, string> {
  const offset = cursorOffset ?? sql.length;
  const stmt = getActiveStatementAtOffset(sql, offset);
  const { currentScope, outerScopes } = maskUnrelatedParentheses(stmt.masked, stmt.relativeOffset);

  const merged = new Map<string, string>();
  // Cargar primero scopes externos (de más lejano a más cercano) para que el scope interno prevalezca
  for (let i = outerScopes.length - 1; i >= 0; i--) {
    for (const [k, v] of extractAliasesFromScope(outerScopes[i])) {
      merged.set(k, v);
    }
  }
  for (const [k, v] of extractAliasesFromScope(currentScope)) {
    merged.set(k, v);
  }

  return merged;
}

export type SqlClauseKind = 'FROM_JOIN' | 'EXPRESSION';

export function detectClauseContext(scopeSqlBeforeCursor: string): SqlClauseKind {
  // Buscar la última cláusula mayor antes del cursor
  const clauseRegex = /\b(SELECT|FROM|INNER\s+JOIN|LEFT\s+(?:OUTER\s+)?JOIN|RIGHT\s+(?:OUTER\s+)?JOIN|FULL\s+(?:OUTER\s+)?JOIN|CROSS\s+JOIN|NATURAL\s+JOIN|JOIN|ON|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|OFFSET|SET|VALUES|UNION|INTERSECT|EXCEPT)\b/gi;
  let lastClause = '';
  let m: RegExpExecArray | null;
  while ((m = clauseRegex.exec(scopeSqlBeforeCursor)) !== null) {
    lastClause = m[1].toUpperCase().replace(/\s+/g, ' ');
  }

  if (lastClause === 'FROM' || lastClause.endsWith('JOIN')) {
    return 'FROM_JOIN';
  }
  return 'EXPRESSION';
}

// Variable para evitar registrar el proveedor más de una vez en Monaco
let completionProviderDisposable: { dispose: () => void } | null = null;

/**
 * Registra el proveedor de autocompletado inteligente para PostgreSQL en Monaco.
 */
export function registerSqlCompletionProvider(monaco: any): void {
  if (completionProviderDisposable) {
    completionProviderDisposable.dispose();
    completionProviderDisposable = null;
  }

  completionProviderDisposable = monaco.languages.registerCompletionItemProvider('sql', {
    triggerCharacters: ['.', ' ', '('],

    provideCompletionItems: (model: any, position: any) => {
      const lineText = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const fullSql = model.getValue();
      const cursorOffset =
        typeof model.getOffsetAt === 'function' ? model.getOffsetAt(position) : fullSql.length;

      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const stmt = getActiveStatementAtOffset(fullSql, cursorOffset);
      const aliasMap = extractTableAliases(fullSql, cursorOffset);
      const ctes = extractCtesFromStatement(stmt.masked);
      const cteByName = new Map(ctes.map((c) => [c.name, c]));

      // CASO 1: El usuario acaba de escribir un punto '.' precedido de un identificador
      const dotMatch = /(?:^|[\s(,=<>!+\-*/])([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z0-9_]*)$/.exec(
        lineText
      );

      if (dotMatch) {
        const prefixIdentifier = dotMatch[1].toLowerCase();

        if (prefixIdentifier === 'public') {
          return {
            suggestions: ECOMMERCE_TABLES_SCHEMA.map((tbl) => ({
              label: tbl.tableName,
              kind: monaco.languages.CompletionItemKind.Struct,
              detail: `Tabla (${tbl.rowCount} filas) • public`,
              insertText: tbl.tableName,
              range,
              sortText: '0_' + tbl.tableName,
            })),
          };
        }

        const targetTableName = aliasMap.get(prefixIdentifier) || prefixIdentifier;

        const cteInfo = cteByName.get(targetTableName);
        if (cteInfo && cteInfo.columns.length > 0) {
          return {
            suggestions: cteInfo.columns.map((colName) => ({
              label: colName,
              kind: monaco.languages.CompletionItemKind.Field,
              detail: `Columna CTE • ${cteInfo.name}`,
              insertText: colName,
              range,
              sortText: '0_' + colName,
            })),
          };
        }

        const tableInfo = ECOMMERCE_TABLES_SCHEMA.find(
          (t) => t.tableName.toLowerCase() === targetTableName
        );

        if (tableInfo) {
          return {
            suggestions: tableInfo.columns.map((col) => {
              const isPk = col.isPrimary ? ' [PK]' : '';
              const isFk = col.isForeign ? ' [FK]' : '';
              return {
                label: col.name,
                kind: monaco.languages.CompletionItemKind.Field,
                detail: `${col.type}${isPk}${isFk} • ${tableInfo.tableName}`,
                documentation: `Columna '${col.name}' de tipo ${col.type} en la tabla '${tableInfo.tableName}' (alias: ${prefixIdentifier}).`,
                insertText: col.name,
                range,
                sortText: '0_' + col.name,
              };
            }),
          };
        }

        return { suggestions: [] };
      }

      // CASO 2: Autocompletado consciente de cláusula dentro de la sentencia activa
      const { currentScope } = maskUnrelatedParentheses(stmt.masked, stmt.relativeOffset);
      const scopeBeforeCursor = stmt.masked.slice(0, stmt.relativeOffset);
      const clauseKind = detectClauseContext(currentScope.slice(0, stmt.relativeOffset) || scopeBeforeCursor);

      const suggestions: any[] = [];
      const mentionedTables = new Set(Array.from(aliasMap.values()));

      // A. CTEs locales de la sentencia activa
      ctes.forEach((cte) => {
        suggestions.push({
          label: cte.name,
          kind: monaco.languages.CompletionItemKind.Struct,
          detail: 'CTE (WITH)',
          insertText: cte.name,
          range,
          sortText: (clauseKind === 'FROM_JOIN' ? '0_' : '2_') + cte.name,
        });
      });

      // B. Tablas de Ecommerce_Production_DB
      ECOMMERCE_TABLES_SCHEMA.forEach((tbl) => {
        suggestions.push({
          label: tbl.tableName,
          kind: monaco.languages.CompletionItemKind.Struct,
          detail: `Tabla (${tbl.rowCount} filas) • public`,
          documentation: `Tabla relacional '${tbl.tableName}' con ${tbl.columns.length} columnas en Ecommerce_Production_DB.`,
          insertText: tbl.tableName,
          range,
          sortText: (clauseKind === 'FROM_JOIN' ? '0_' : '3_') + tbl.tableName,
        });
      });

      // C. Alias declarados únicamente en el scope de la sentencia activa
      if (clauseKind === 'EXPRESSION') {
        aliasMap.forEach((tableName, aliasKey) => {
          if (aliasKey !== tableName) {
            suggestions.push({
              label: aliasKey,
              kind: monaco.languages.CompletionItemKind.Variable,
              detail: `Alias de ${tableName}`,
              insertText: aliasKey,
              range,
              sortText: '0_' + aliasKey,
            });
          }
        });
      }

      // D. Palabras Clave SQL
      SQL_KEYWORDS.forEach((kw) => {
        const hasSnippet = kw.insertText.includes('${');
        suggestions.push({
          label: kw.label,
          kind: monaco.languages.CompletionItemKind.Keyword,
          detail: kw.detail,
          insertText: kw.insertText,
          insertTextRules: hasSnippet
            ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            : undefined,
          range,
          sortText: (clauseKind === 'FROM_JOIN' ? '1_' : '2_') + kw.label,
        });
      });

      // E. Columnas (en FROM/JOIN se omiten las no relevantes para no contaminar la lista de tablas)
      if (clauseKind === 'EXPRESSION') {
        ECOMMERCE_TABLES_SCHEMA.forEach((tbl) => {
          const isMentioned = mentionedTables.has(tbl.tableName.toLowerCase());
          const priorityPrefix = isMentioned ? '1_' : '4_';

          tbl.columns.forEach((col) => {
            const isPk = col.isPrimary ? ' [PK]' : '';
            const isFk = col.isForeign ? ' [FK]' : '';
            suggestions.push({
              label: col.name,
              kind: monaco.languages.CompletionItemKind.Field,
              detail: `${col.type}${isPk}${isFk} • ${tbl.tableName}`,
              documentation: `Columna '${col.name}' (${col.type}) perteneciente a la tabla '${tbl.tableName}'.`,
              insertText: col.name,
              range,
              sortText: priorityPrefix + col.name,
            });
          });
        });

        ctes.forEach((cte) => {
          cte.columns.forEach((colName) => {
            suggestions.push({
              label: colName,
              kind: monaco.languages.CompletionItemKind.Field,
              detail: `Columna CTE • ${cte.name}`,
              insertText: colName,
              range,
              sortText: '1_' + colName,
            });
          });
        });
      }

      return { suggestions };
    },
  });
}
