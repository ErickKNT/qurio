import React, { useMemo } from 'react';
import { GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SqlDiffViewerProps {
  studentSql: string;
  expectedSql: string;
  studentLabel?: string;
  expectedLabel?: string;
  className?: string;
}

export interface SqlDiffLine {
  lineNumber: number;
  studentLine: string;
  expectedLine: string;
  kind: 'same' | 'modified' | 'added' | 'removed';
}

const SQL_KEYWORDS = new Set([
  'SELECT',
  'FROM',
  'WHERE',
  'JOIN',
  'INNER',
  'LEFT',
  'RIGHT',
  'FULL',
  'OUTER',
  'CROSS',
  'ON',
  'AS',
  'GROUP',
  'BY',
  'HAVING',
  'ORDER',
  'ASC',
  'DESC',
  'LIMIT',
  'OFFSET',
  'WITH',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'AND',
  'OR',
  'NOT',
  'IN',
  'IS',
  'NULL',
  'DISTINCT',
  'UNION',
  'ALL',
  'OVER',
  'PARTITION',
]);

export function computeSqlLineDiff(studentSql: string, expectedSql: string): SqlDiffLine[] {
  const sLines = studentSql.replace(/\r\n/g, '\n').split('\n');
  const eLines = expectedSql.replace(/\r\n/g, '\n').split('\n');
  const maxLen = Math.max(sLines.length, eLines.length);
  const diff: SqlDiffLine[] = [];

  for (let i = 0; i < maxLen; i += 1) {
    const s = sLines[i];
    const e = eLines[i];
    if (s !== undefined && e !== undefined) {
      const same = s.trim() === e.trim();
      diff.push({
        lineNumber: i + 1,
        studentLine: s,
        expectedLine: e,
        kind: same ? 'same' : 'modified',
      });
    } else if (s !== undefined) {
      diff.push({
        lineNumber: i + 1,
        studentLine: s,
        expectedLine: '',
        kind: 'added',
      });
    } else if (e !== undefined) {
      diff.push({
        lineNumber: i + 1,
        studentLine: '',
        expectedLine: e,
        kind: 'removed',
      });
    }
  }

  return diff;
}

function renderHighlightedSql(line: string): React.ReactNode {
  if (!line) return <span className="text-content-muted/40 italic">—</span>;
  const tokens = line.split(/(\s+|[,();])/);
  return tokens.map((token, idx) => {
    if (!token) return null;
    if (SQL_KEYWORDS.has(token.toUpperCase())) {
      return (
        <span key={idx} className="text-cyan-accent font-semibold">
          {token}
        </span>
      );
    }
    if (/^'.*'$/.test(token)) {
      return (
        <span key={idx} className="text-amber-streak">
          {token}
        </span>
      );
    }
    if (/^\d+(\.\d+)?$/.test(token)) {
      return (
        <span key={idx} className="text-primary-light">
          {token}
        </span>
      );
    }
    return <span key={idx}>{token}</span>;
  });
}

export const SqlDiffViewer: React.FC<SqlDiffViewerProps> = ({
  studentSql,
  expectedSql,
  studentLabel = 'SQL del Estudiante',
  expectedLabel = 'Solución Oficial de Referencia',
  className,
}) => {
  const lines = useMemo(() => computeSqlLineDiff(studentSql, expectedSql), [studentSql, expectedSql]);
  const changedCount = useMemo(() => lines.filter((l) => l.kind !== 'same').length, [lines]);

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-border-subtle/80 bg-surface overflow-hidden',
        className
      )}
    >
      <div className="px-4 py-2.5 bg-surface-dim/80 border-b border-border-subtle/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-content-primary font-semibold">
          <GitCompare className="w-4 h-4 text-cyan-accent" />
          <span>Comparativa Sintáctica SQL</span>
        </div>
        <span className="text-[11px] font-mono text-content-muted tabular-nums">
          {changedCount === 0
            ? 'Sin diferencias de línea'
            : `${changedCount} ${changedCount === 1 ? 'línea discrepante' : 'líneas discrepantes'}`}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle/70">
        {/* Columna Estudiante */}
        <div className="flex flex-col">
          <div className="px-3 py-1.5 bg-surface-card/50 border-b border-border-subtle/50 text-[10px] font-mono uppercase tracking-wider text-content-muted">
            {studentLabel}
          </div>
          <div className="p-2 font-mono text-xs overflow-x-auto bg-canvas/70">
            {lines.map((row) => (
              <div
                key={`stu-${row.lineNumber}`}
                data-diff-kind={row.kind}
                className={cn(
                  'flex items-start gap-2.5 px-2 py-0.5 rounded',
                  row.kind === 'modified' && 'bg-amber-streak/10 border-l-2 border-amber-streak',
                  row.kind === 'added' && 'bg-error/10 border-l-2 border-error',
                  row.kind === 'removed' && 'opacity-50'
                )}
              >
                <span className="w-6 text-right text-content-muted/60 select-none tabular-nums shrink-0">
                  {row.lineNumber}
                </span>
                <pre className="whitespace-pre-wrap break-all text-content-primary flex-1">
                  {renderHighlightedSql(row.studentLine)}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Columna Oficial */}
        <div className="flex flex-col">
          <div className="px-3 py-1.5 bg-surface-card/50 border-b border-border-subtle/50 text-[10px] font-mono uppercase tracking-wider text-emerald">
            {expectedLabel}
          </div>
          <div className="p-2 font-mono text-xs overflow-x-auto bg-canvas/70">
            {lines.map((row) => (
              <div
                key={`exp-${row.lineNumber}`}
                data-diff-kind={row.kind}
                className={cn(
                  'flex items-start gap-2.5 px-2 py-0.5 rounded',
                  (row.kind === 'modified' || row.kind === 'removed') &&
                    'bg-emerald/10 border-l-2 border-emerald'
                )}
              >
                <span className="w-6 text-right text-content-muted/60 select-none tabular-nums shrink-0">
                  {row.lineNumber}
                </span>
                <pre className="whitespace-pre-wrap break-all text-content-primary flex-1">
                  {renderHighlightedSql(row.expectedLine)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
