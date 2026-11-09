import React from 'react';
import { Terminal, Clock, AlertOctagon, HelpCircle, Columns } from 'lucide-react';
import { ColumnInfo, DiffResult } from '@/types';
import { Badge } from '@/components/atoms/Badge/Badge';
import { cn } from '@/lib/utils';

export interface DataGridResultsProps {
  status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR' | 'FAILED';
  executionTimeMs?: number;
  rowCount?: number;
  columns?: ColumnInfo[] | string[];
  rows?: any[][];
  error?: string;
  diff?: DiffResult;
  message?: string;
  className?: string;
}

export const DataGridResults: React.FC<DataGridResultsProps> = ({
  status,
  executionTimeMs = 0,
  rowCount = 0,
  columns = [],
  rows = [],
  error,
  diff,
  message,
  className,
}) => {
  // Normalizar columnas a objetos { name, type }
  const normalizedColumns = columns.map((c) => {
    if (typeof c === 'string') {
      return { name: c, type: 'text' };
    }
    return c;
  });

  return (
    <div className={cn('flex flex-col h-full w-full bg-surface select-none overflow-hidden', className)}>
      {/* Barra de Estado y Métricas Superiores */}
      <div className="h-10 px-4 bg-surface-dim border-b border-border-subtle flex items-center justify-between shrink-0 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="text-content-secondary font-medium uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-content-muted" />
            Resultados de Ejecución
          </span>

          {status === 'SUCCESS' && (
            <Badge variant="emerald" size="sm" dot>
              ÉXITO
            </Badge>
          )}

          {status === 'FAILED' && (
            <Badge variant="amber" size="sm" dot>
              REVISIÓN SEMÁNTICA
            </Badge>
          )}

          {status === 'ERROR' && (
            <Badge variant="error" size="sm" dot>
              ERROR DE MOTOR
            </Badge>
          )}
        </div>

        {status === 'SUCCESS' && (
          <div className="flex items-center gap-4 text-[11px] text-content-muted">
            <span className="flex items-center gap-1 text-emerald">
              <Clock className="w-3 h-3" />
              {executionTimeMs.toFixed(1)}ms
            </span>
            <span className="flex items-center gap-1">
              <Columns className="w-3 h-3 text-cyan-accent" />
              {rowCount} {rowCount === 1 ? 'fila' : 'filas'}
            </span>
          </div>
        )}
      </div>

      {/* Contenido Dinámico según Estado */}
      <div className="flex-1 overflow-auto bg-canvas relative">
        {status === 'IDLE' && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-content-muted">
            <Terminal className="w-8 h-8 mb-2 text-content-muted/60" />
            <p className="text-sm font-medium text-content-secondary">
              Listo para ejecutar en el Sandbox aislado
            </p>
            <p className="text-xs text-content-muted mt-1 max-w-sm">
              Escribe tu consulta SQL arriba y presiona <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-subtle text-content-primary font-mono text-[11px]">⌘↵</kbd> o pulsa el botón para evaluar.
            </p>
          </div>
        )}

        {status === 'LOADING' && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-content-muted">
            <div className="w-7 h-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
            <span className="text-xs font-mono text-content-secondary">
              Ejecutando en PostgreSQL Sandbox (timeout: 2,000ms)...
            </span>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="p-4 m-4 rounded-xl bg-surface-card border border-error/40 flex flex-col gap-2 animate-fadeIn font-mono">
            <div className="flex items-center gap-2 text-error text-xs font-bold uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>Fallo en la ejecución de la consulta</span>
            </div>
            <pre className="text-xs text-error/90 bg-canvas/70 p-3 rounded-lg border border-border-subtle whitespace-pre-wrap break-words leading-relaxed">
              {error || 'Error desconocido al procesar la sentencia en el motor SQL.'}
            </pre>
            <span className="text-[11px] text-content-muted">
              💡 Revisa la sintaxis de las palabras reservadas, comas y nombres exactos de las columnas.
            </span>
          </div>
        )}

        {status === 'FAILED' && diff && (
          <div className="p-4 m-4 rounded-xl bg-surface-card border border-amber-streak/40 flex flex-col gap-3 animate-fadeIn font-mono">
            <div className="flex items-center gap-2 text-amber-streak text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Discrepancia Semántica Detectada</span>
            </div>

            <p className="text-xs text-content-primary">
              {diff.reason}
            </p>

            {message && (
              <p className="text-[11px] text-content-secondary italic">
                {message}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-canvas border border-border-subtle">
                <span className="text-[10px] text-content-muted uppercase">Columnas esperadas:</span>
                <div className="text-emerald mt-1">{diff.expected_columns.join(', ') || 'N/A'}</div>
                <div className="text-[10px] text-content-muted mt-2">Filas esperadas: {diff.expected_row_count}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-canvas border border-border-subtle">
                <span className="text-[10px] text-content-muted uppercase">Tus columnas devueltas:</span>
                <div className="text-amber-streak mt-1">{diff.actual_columns.join(', ') || 'N/A'}</div>
                <div className="text-[10px] text-content-muted mt-2">Tus filas: {diff.actual_row_count}</div>
              </div>
            </div>
          </div>
        )}

        {status === 'SUCCESS' && (
          <table className="w-full text-left border-collapse font-mono text-xs">
            {/* Cabeceras de columnas */}
            <thead className="bg-surface sticky top-0 z-10 border-b border-border-subtle">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center text-content-muted border-r border-border-subtle text-[10px]">
                  #
                </th>
                {normalizedColumns.map((col, idx) => (
                  <th
                    key={idx}
                    className="py-2.5 px-3 text-content-primary font-semibold border-r border-border-subtle/50 last:border-r-0 whitespace-nowrap"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{col.name}</span>
                      <span className="text-[10px] text-cyan-accent font-normal font-mono opacity-80">
                        {col.type}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Celdas de datos */}
            <tbody className="divide-y divide-border-subtle/40">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={normalizedColumns.length + 1}
                    className="py-8 text-center text-content-muted italic text-xs"
                  >
                    (0 filas devueltas)
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="hover:bg-surface-card/60 transition-colors group"
                  >
                    {/* Número de fila */}
                    <td className="py-2 px-3 text-center text-content-muted border-r border-border-subtle text-[11px] bg-surface-dim/40 group-hover:text-content-primary">
                      {rowIdx + 1}
                    </td>

                    {/* Valores de celda */}
                    {row.map((val, colIdx) => (
                      <td
                        key={colIdx}
                        className="py-2 px-3 text-content-primary border-r border-border-subtle/30 last:border-r-0 whitespace-nowrap"
                      >
                        {val === null ? (
                          <span className="inline-block px-1.5 py-0.2 rounded bg-surface-hover text-content-muted italic text-[10px]">
                            NULL
                          </span>
                        ) : typeof val === 'boolean' ? (
                          <span className={val ? 'text-emerald' : 'text-error'}>
                            {String(val)}
                          </span>
                        ) : typeof val === 'number' ? (
                          <span className="text-amber-streak">{val}</span>
                        ) : (
                          <span>{String(val)}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
