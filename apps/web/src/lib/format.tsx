import React from 'react';

const SQL_PROSE_KEYWORDS_RE =
  /\b(IS NOT NULL|IS NULL|NOT EXISTS|NOT IN|IF NOT EXISTS|IF EXISTS|ON CONFLICT|DO UPDATE|DO NOTHING|UNION ALL|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|GROUP BY|ORDER BY|PARTITION BY|INSERT INTO|CREATE UNIQUE INDEX|CREATE TABLE|ALTER TABLE|DROP TABLE|CREATE VIEW|CREATE INDEX|DROP INDEX|DELETE FROM|PRIMARY KEY|FOREIGN KEY|ADD COLUMN|DROP COLUMN|ALTER COLUMN|RENAME TO|NOT NULL|SELECT|FROM|WHERE|HAVING|LIMIT|OFFSET|DISTINCT|BETWEEN|ILIKE|LIKE|EXISTS|COALESCE|ROUND|COUNT|SUM|AVG|MIN|MAX|ROW_NUMBER|DENSE_RANK|RANK|LAG|LEAD|OVER|CASE|WHEN|THEN|ELSE|END|WITH|JOIN|ON|UNION|INTERSECT|EXCEPT|FILTER|NULL|TRUE|FALSE|ASC|DESC|AND|OR|NOT|IN|AS|INSERT|INTO|UPDATE|SET|VALUES|DELETE|RETURNING|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|UNIQUE|CHECK|DEFAULT|CONSTRAINT|REFERENCES|CASCADE|USING|SERIAL|INTEGER|INT|VARCHAR|NUMERIC|DECIMAL|BOOLEAN|DATE|TIMESTAMP|TEXT)\b/g;

const SQL_BLOCK_TOKEN_RE =
  /(--[^\n]*|'(?:''|[^'])*'|\b(?:IS NOT NULL|IS NULL|NOT EXISTS|NOT IN|IF NOT EXISTS|IF EXISTS|ON CONFLICT|DO UPDATE|DO NOTHING|UNION ALL|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|GROUP BY|ORDER BY|PARTITION BY|INSERT INTO|CREATE UNIQUE INDEX|CREATE TABLE|ALTER TABLE|DROP TABLE|CREATE VIEW|CREATE INDEX|DROP INDEX|DELETE FROM|PRIMARY KEY|FOREIGN KEY|ADD COLUMN|DROP COLUMN|ALTER COLUMN|RENAME TO|NOT NULL|SELECT|FROM|WHERE|HAVING|LIMIT|OFFSET|DISTINCT|BETWEEN|ILIKE|LIKE|EXISTS|COALESCE|ROUND|COUNT|SUM|AVG|MIN|MAX|ROW_NUMBER|DENSE_RANK|RANK|LAG|LEAD|OVER|CASE|WHEN|THEN|ELSE|END|WITH|JOIN|ON|UNION|INTERSECT|EXCEPT|FILTER|NULL|TRUE|FALSE|ASC|DESC|AND|OR|NOT|IN|AS|INSERT|INTO|UPDATE|SET|VALUES|DELETE|RETURNING|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|UNIQUE|CHECK|DEFAULT|CONSTRAINT|REFERENCES|CASCADE|USING|ADD|COLUMN|RENAME|TO|DO|NOTHING|SERIAL|INTEGER|INT|VARCHAR|NUMERIC|DECIMAL|BOOLEAN|DATE|TIMESTAMP|TEXT)\b|\b\d+(?:\.\d+)?\b|\|\||>=|<=|<>|!=|[=<>+\-*/])/g;

const SQL_KEYWORD_SET = new Set([
  'IS NOT NULL', 'IS NULL', 'NOT EXISTS', 'NOT IN', 'IF NOT EXISTS', 'IF EXISTS',
  'ON CONFLICT', 'DO UPDATE', 'DO NOTHING', 'UNION ALL',
  'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN',
  'GROUP BY', 'ORDER BY', 'PARTITION BY', 'INSERT INTO', 'CREATE UNIQUE INDEX',
  'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'CREATE VIEW', 'CREATE INDEX',
  'DROP INDEX', 'DELETE FROM', 'PRIMARY KEY', 'FOREIGN KEY', 'ADD COLUMN',
  'DROP COLUMN', 'ALTER COLUMN', 'RENAME TO', 'NOT NULL', 'REFERENCES',
  'SELECT', 'FROM', 'WHERE', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT',
  'BETWEEN', 'ILIKE', 'LIKE', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE',
  'END', 'WITH', 'JOIN', 'ON', 'UNION', 'INTERSECT', 'EXCEPT', 'FILTER',
  'NULL', 'TRUE', 'FALSE', 'ASC', 'DESC', 'AND', 'OR', 'NOT', 'IN', 'AS',
  'INSERT', 'INTO', 'UPDATE', 'SET', 'VALUES', 'DELETE', 'RETURNING',
  'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'UNIQUE',
  'CHECK', 'DEFAULT', 'CONSTRAINT', 'CASCADE', 'USING', 'ADD', 'COLUMN',
  'RENAME', 'TO', 'DO', 'NOTHING',
  'SERIAL', 'INTEGER', 'INT', 'VARCHAR', 'NUMERIC', 'DECIMAL', 'BOOLEAN',
  'DATE', 'TIMESTAMP', 'TEXT',
]);

const SQL_FUNCTION_SET = new Set([
  'COALESCE', 'ROUND', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  'ROW_NUMBER', 'DENSE_RANK', 'RANK', 'LAG', 'LEAD', 'OVER',
]);

function renderInlinePill(code: string, key: string | number): React.ReactNode {
  return (
    <code
      key={key}
      className="px-1.5 py-0.5 mx-0.5 rounded bg-surface-card border border-border-subtle font-mono text-[11px] text-cyan-accent font-semibold inline-block align-baseline shadow-xs [font-variant-ligatures:none]"
    >
      {code}
    </code>
  );
}

/**
 * Renderiza texto interpretando sintaxis de código (`código`) como badges interactivos
 * con tipografía JetBrains Mono y resplandor sutil, eliminando los caracteres literales de acento/backtick.
 */
export function formatInlineCode(text?: string | null): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`)/g);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return renderInlinePill(part.slice(1, -1), i);
    }
    return part;
  });
}

/**
 * Resalta automáticamente palabras reservadas SQL en mayúsculas y bloques `código`
 * dentro de prosa pedagógica (guías teóricas, errores frecuentes, consejos).
 */
export function formatSqlProse(text?: string | null): React.ReactNode {
  if (!text) return null;
  const backtickParts = text.split(/(`[^`]+`)/g);

  return backtickParts.map((segment, segIdx) => {
    if (segment.startsWith('`') && segment.endsWith('`') && segment.length > 2) {
      return renderInlinePill(segment.slice(1, -1), `bt-${segIdx}`);
    }

    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    SQL_PROSE_KEYWORDS_RE.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = SQL_PROSE_KEYWORDS_RE.exec(segment)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(segment.slice(lastIndex, match.index));
      }
      nodes.push(renderInlinePill(match[0], `kw-${segIdx}-${match.index}`));
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < segment.length) {
      nodes.push(segment.slice(lastIndex));
    }

    return <React.Fragment key={`seg-${segIdx}`}>{nodes}</React.Fragment>;
  });
}

/**
 * Colorea un bloque SQL en JSX siguiendo los tokens cromáticos de Monaco (`qurio-dark` / `qurio-light`).
 */
export function highlightSqlBlock(sql: string): React.ReactNode {
  if (!sql) return null;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  SQL_BLOCK_TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = SQL_BLOCK_TOKEN_RE.exec(sql)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`txt-${lastIndex}`} className="text-content-primary">
          {sql.slice(lastIndex, match.index)}
        </span>
      );
    }

    const token = match[0];
    let tokenClass = 'text-content-primary';
    if (token.startsWith('--')) {
      tokenClass = 'text-content-muted italic';
    } else if (token.startsWith("'")) {
      tokenClass = 'text-emerald';
    } else if (/^\d/.test(token)) {
      tokenClass = 'text-amber-streak';
    } else if (SQL_KEYWORD_SET.has(token)) {
      tokenClass = 'text-cyan-accent font-bold';
    } else if (SQL_FUNCTION_SET.has(token)) {
      tokenClass = 'text-primary-light font-semibold';
    } else {
      tokenClass = 'text-primary-light';
    }

    nodes.push(
      <span key={`tok-${match.index}`} className={tokenClass}>
        {token}
      </span>
    );
    lastIndex = match.index + token.length;
  }

  if (lastIndex < sql.length) {
    nodes.push(
      <span key={`tail-${lastIndex}`} className="text-content-primary">
        {sql.slice(lastIndex)}
      </span>
    );
  }

  return nodes;
}
