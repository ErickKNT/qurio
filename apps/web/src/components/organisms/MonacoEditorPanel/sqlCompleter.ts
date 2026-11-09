import { ECOMMERCE_TABLES_SCHEMA } from '@/lib/api';

// Palabras clave principales de SQL / PostgreSQL
const SQL_KEYWORDS = [
  { label: 'SELECT', detail: 'Proyección de columnas', insertText: 'SELECT ' },
  { label: 'FROM', detail: 'Tabla de origen', insertText: 'FROM ' },
  { label: 'WHERE', detail: 'Filtro condicional', insertText: 'WHERE ' },
  { label: 'INNER JOIN', detail: 'Cruce interno relacional', insertText: 'INNER JOIN ${1:tabla} ON ${2:condicion}' },
  { label: 'LEFT JOIN', detail: 'Cruce externo izquierdo (preserva registros huérfanos)', insertText: 'LEFT JOIN ${1:tabla} ON ${2:condicion}' },
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
  { label: 'AND', detail: 'Operador lógico Y', insertText: 'AND ' },
  { label: 'OR', detail: 'Operador lógico O', insertText: 'OR ' },
  { label: 'NOT', detail: 'Negación lógica', insertText: 'NOT ' },
  { label: 'IN', detail: 'Pertenencia en conjunto', insertText: 'IN (${1:valores})' },
  { label: 'NOT IN', detail: 'Exclusión de conjunto', insertText: 'NOT IN (${1:valores})' },
  { label: 'BETWEEN', detail: 'Rango de valores inclusivo', insertText: 'BETWEEN ${1:min} AND ${2:max}' },
  { label: 'LIKE', detail: 'Coincidencia de patrón sensible a mayúsculas', insertText: "LIKE '${1:%patron%}'" },
  { label: 'ILIKE', detail: 'Coincidencia insensible a mayúsculas (PostgreSQL)', insertText: "ILIKE '${1:%patron%}'" },
  { label: 'IS NULL', detail: 'Comprobación de valor nulo', insertText: 'IS NULL' },
  { label: 'IS NOT NULL', detail: 'Comprobación de valor no nulo', insertText: 'IS NOT NULL' },
  { label: 'COUNT', detail: 'Función agregada: contar registros', insertText: 'COUNT(${1:*})' },
  { label: 'SUM', detail: 'Función agregada: sumatoria numérica', insertText: 'SUM(${1:columna})' },
  { label: 'AVG', detail: 'Función agregada: promedio', insertText: 'AVG(${1:columna})' },
  { label: 'MIN', detail: 'Función agregada: valor mínimo', insertText: 'MIN(${1:columna})' },
  { label: 'MAX', detail: 'Función agregada: valor máximo', insertText: 'MAX(${1:columna})' },
  { label: 'ROUND', detail: 'Redondeo decimal', insertText: 'ROUND(${1:valor}, ${2:decimales})' },
  { label: 'ROW_NUMBER', detail: 'Función ventana: posición ordinal', insertText: 'ROW_NUMBER() OVER (ORDER BY ${1:columna} DESC)' },
  { label: 'OVER', detail: 'Cláusula de ventana analítica', insertText: 'OVER (${1:ORDER BY ...})' },
  { label: 'PARTITION BY', detail: 'Particionamiento de ventana', insertText: 'PARTITION BY ${1:columna}' },
  { label: 'CASE WHEN', detail: 'Estructura condicional', insertText: 'CASE WHEN ${1:condicion} THEN ${2:resultado} ELSE ${3:defecto} END' },
  { label: 'UNION', detail: 'Unión de consultas sin duplicados', insertText: 'UNION ' },
  { label: 'UNION ALL', detail: 'Unión de consultas con duplicados', insertText: 'UNION ALL ' },
  { label: 'COALESCE', detail: 'Devuelve el primer valor no nulo', insertText: 'COALESCE(${1:columna}, ${2:valor_defecto})' },
];

/**
 * Analiza el código SQL del editor y extrae un mapa de alias a nombres reales de tabla.
 * Soporta patrones como:
 * - FROM clientes c
 * - FROM clientes AS c
 * - JOIN pedidos p ON ...
 * - LEFT JOIN detalle_pedidos dp ON ...
 */
export function extractTableAliases(sql: string): Map<string, string> {
  const aliasMap = new Map<string, string>();
  const reservedWords = new Set([
    'where', 'on', 'inner', 'left', 'right', 'full', 'cross', 'join',
    'group', 'order', 'limit', 'offset', 'having', 'select', 'set',
    'values', 'into', 'and', 'or', 'as', 'by'
  ]);

  // Regex para capturar: (FROM|JOIN|INTO|UPDATE) <tabla> [AS] <alias>
  const regex = /\b(?:FROM|JOIN|INTO|UPDATE)\s+([a-zA-Z0-9_]+)(?:\s+(?:AS\s+)?([a-zA-Z0-9_]+))?\b/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(sql)) !== null) {
    const tableName = match[1].toLowerCase();
    const potentialAlias = match[2] ? match[2].toLowerCase() : null;

    // Si tiene alias y no es una palabra reservada SQL
    if (potentialAlias && !reservedWords.has(potentialAlias)) {
      aliasMap.set(potentialAlias, tableName);
    }

    // Mapear también el nombre de la tabla hacia sí misma (ej. 'clientes.' -> 'clientes')
    aliasMap.set(tableName, tableName);
  }

  return aliasMap;
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
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const aliasMap = extractTableAliases(fullSql);

      // CASO 1: El usuario acaba de escribir un punto '.' precedido de un identificador
      // Ejemplo: "c." o "c.nom" o "clientes."
      const dotMatch = /(?:^|\s|\()([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]*)$/.exec(lineText);

      if (dotMatch) {
        const prefixIdentifier = dotMatch[1].toLowerCase();
        const targetTableName = aliasMap.get(prefixIdentifier) || prefixIdentifier;

        const tableInfo = ECOMMERCE_TABLES_SCHEMA.find(
          (t) => t.tableName.toLowerCase() === targetTableName
        );

        if (tableInfo) {
          const columnItems = tableInfo.columns.map((col) => {
            const isPk = col.isPrimary ? ' [PK]' : '';
            const isFk = col.isForeign ? ' [FK]' : '';

            return {
              label: col.name,
              kind: monaco.languages.CompletionItemKind.Field,
              detail: `${col.type}${isPk}${isFk} • ${tableInfo.tableName}`,
              documentation: `Columna '${col.name}' de tipo ${col.type} en la tabla '${tableInfo.tableName}' (alias: ${prefixIdentifier}).`,
              insertText: col.name,
              range,
              sortText: '0_' + col.name, // Máxima prioridad tras el punto
            };
          });

          return { suggestions: columnItems };
        }
      }

      // CASO 2: Autocompletado general mientras escribe palabras (keywords, tablas, columnas)
      const suggestions: any[] = [];

      // A. Palabras Clave SQL
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
          sortText: '1_' + kw.label,
        });
      });

      // B. Nombres de Tablas de Ecommerce_Production_DB
      ECOMMERCE_TABLES_SCHEMA.forEach((tbl) => {
        suggestions.push({
          label: tbl.tableName,
          kind: monaco.languages.CompletionItemKind.Struct,
          detail: `Tabla (${tbl.rowCount} filas) • public`,
          documentation: `Tabla relacional '${tbl.tableName}' con ${tbl.columns.length} columnas en Ecommerce_Production_DB.`,
          insertText: tbl.tableName,
          range,
          sortText: '2_' + tbl.tableName,
        });
      });

      // C. Todas las Columnas del Esquema Relacional
      // Si la tabla ya está mencionada en la consulta, priorizamos sus columnas
      const mentionedTables = new Set(Array.from(aliasMap.values()));

      ECOMMERCE_TABLES_SCHEMA.forEach((tbl) => {
        const isMentioned = mentionedTables.has(tbl.tableName.toLowerCase());
        const priorityPrefix = isMentioned ? '3_' : '4_';

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

      return { suggestions };
    },
  });
}
