import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Clock,
  AlertOctagon,
  HelpCircle,
  CheckCircle2,
  Zap,
  ArrowRight,
  Table as TableIcon,
  GitCompare,
  Unlock,
  Lock,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ColumnInfo, DiffResult } from '@/types';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Button } from '@/components/atoms/Button/Button';
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
  xpAwarded?: number;
  onNextExercise?: () => void;
  isPlayground?: boolean;
  failedAttemptsCount?: number;
  isSolutionRevealed?: boolean;
  onOpenRevealModal?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
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
  xpAwarded,
  onNextExercise,
  isPlayground = false,
  failedAttemptsCount = 0,
  isSolutionRevealed = false,
  onOpenRevealModal,
  isExpanded = false,
  onToggleExpand,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'diff'>('table');

  // Si no hay discrepancia (diff es undefined) o el resultado fue exitoso, la pestaña debe resolverse a 'table'
  const effectiveTab = !diff || status === 'SUCCESS' ? 'table' : activeTab;

  useEffect(() => {
    if (!diff || status === 'SUCCESS') {
      setActiveTab('table');
    }
  }, [diff, status]);

  // Normalizar columnas a objetos { name, type }
  const normalizedColumns = columns.map((c) => {
    if (typeof c === 'string') {
      return { name: c, type: 'column' };
    }
    return c;
  });

  return (
    <div className={cn('flex flex-col h-full w-full bg-surface select-none overflow-hidden', className)}>
      {/* 1. BARRA SUPERIOR DE HERRAMIENTAS Y PESTAÑAS */}
      <div className="h-9 px-4 bg-surface-dim border-b border-border-subtle flex items-center justify-between shrink-0 font-mono text-xs">
        <div className="flex items-center gap-2">
          {/* Pestaña: Tabla de Datos Devueltos */}
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors',
              effectiveTab === 'table'
                ? 'bg-surface-card text-content-primary border border-border-subtle shadow-sm'
                : 'text-content-muted hover:text-content-primary hover:bg-surface-card/50'
            )}
          >
            <TableIcon className="w-3.5 h-3.5 text-cyan-accent" />
            <span>Resultados de tu Consulta</span>
            {status !== 'IDLE' && status !== 'LOADING' && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-surface-hover text-content-secondary">
                {rowCount} {rowCount === 1 ? 'fila' : 'filas'}
              </span>
            )}
          </button>

          {/* Pestaña: Comparativa Semántica (disponible si hay diff) */}
          {diff && (
            <button
              type="button"
              onClick={() => setActiveTab('diff')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors',
                effectiveTab === 'diff'
                  ? 'bg-amber-streak/15 text-amber-streak border border-amber-streak/30 shadow-sm'
                  : 'text-amber-streak/80 hover:text-amber-streak hover:bg-surface-card/50'
              )}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Comparativa Semántica</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-streak animate-pulse" />
            </button>
          )}
        </div>

        {/* Métricas y Estado */}
        <div className="flex items-center gap-3 text-[11px]">
          {status === 'SUCCESS' && (
            <div className="flex items-center gap-2">
              <Badge variant="emerald" size="sm" dot>
                {isPlayground ? 'EJECUTADO' : 'SOLUCIÓN VÁLIDA'}
              </Badge>
              <span className="flex items-center gap-1 text-emerald">
                <Clock className="w-3 h-3" />
                {executionTimeMs.toFixed(1)}ms
              </span>
            </div>
          )}

          {status === 'FAILED' && (
            <div className="flex items-center gap-2">
              <Badge variant="amber" size="sm" dot>
                DISCREPANCIA
              </Badge>
              <span className="flex items-center gap-1 text-content-muted">
                <Clock className="w-3 h-3" />
                {executionTimeMs.toFixed(1)}ms
              </span>
            </div>
          )}

          {status === 'ERROR' && (
            <Badge variant="error" size="sm" dot>
              ERROR DE EJECUCIÓN
            </Badge>
          )}

          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              title={isExpanded ? 'Restaurar tamaño del panel' : 'Expandir tabla de resultados'}
              aria-label={isExpanded ? 'Restaurar tamaño del panel' : 'Expandir tabla de resultados'}
              className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border-subtle/70 bg-surface-card/60 text-content-muted hover:text-content-primary hover:border-primary/40 transition-colors"
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3 h-3" />
                  <span>Restaurar</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3" />
                  <span>Expandir</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. BANNER DE RETO SUPERADO (SOLO EN MODO RETO/EJERCICIO, NUNCA EN PLAYGROUND) */}
      {status === 'SUCCESS' && !isPlayground && (
        <div className="px-4 py-1.5 bg-emerald/10 border-b border-emerald/30 flex items-center justify-between shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold font-mono text-content-primary">
                ¡Reto Superado con Éxito!
              </span>
              {xpAwarded !== undefined && xpAwarded > 0 && (
                <span className="text-xs font-mono font-bold text-amber-streak flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-amber-streak" />
                  +{xpAwarded} XP
                </span>
              )}
              <span className="hidden md:inline text-[11px] text-content-secondary">
                Tu consulta arrojó el resultado exacto en el Sandbox.
              </span>
            </div>
          </div>

          {onNextExercise && (
            <Button
              variant="emerald"
              size="sm"
              onClick={onNextExercise}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Siguiente Reto
            </Button>
          )}
        </div>
      )}

      {/* 3. CONTENIDO PRINCIPAL: TABLA O COMPARATIVA */}
      <div className="flex-1 overflow-auto bg-canvas relative">
        {status === 'IDLE' && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-content-muted">
            <Terminal className="w-8 h-8 mb-2 text-content-muted/60" />
            <p className="text-sm font-medium text-content-secondary">
              Listo para ejecutar en el Sandbox de PostgreSQL
            </p>
            <p className="text-xs text-content-muted mt-1 max-w-sm">
              Escribe tu consulta SQL arriba y presiona <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-subtle text-content-primary font-mono text-[11px]">⌘↵</kbd> para compilar y ver los resultados en esta tabla.
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
              💡 Revisa la sintaxis de las palabras reservadas, comas y nombres exactos de las columnas en el esquema.
            </span>

            {/* Asistente pedagógico tras intentos fallidos */}
            {!isPlayground && !isSolutionRevealed && (
              <div className="pt-2 border-t border-border-subtle/40 flex items-center justify-between text-xs mt-1">
                {failedAttemptsCount >= 2 ? (
                  <div className="flex items-center justify-between w-full gap-2 flex-wrap">
                    <span className="text-[11px] text-amber-streak">
                      Acumulaste {failedAttemptsCount} intentos fallidos. Ya tienes disponible la solución oficial.
                    </span>
                    {onOpenRevealModal && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={onOpenRevealModal}
                        leftIcon={<Unlock className="w-3 h-3" />}
                        className="text-[11px] bg-amber-streak text-canvas font-bold hover:bg-amber-streak/90 border-transparent shrink-0"
                      >
                        Ver Solución Oficial
                      </Button>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-content-muted flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-content-muted" />
                    Intento {failedAttemptsCount}/2 fallido (solución disponible al 2° intento fallido).
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA DIFF (COMPARATIVA SEMÁNTICA) */}
        {effectiveTab === 'diff' && diff && (
          <div className="p-4 m-4 rounded-xl bg-surface-card border border-amber-streak/40 flex flex-col gap-3 animate-fadeIn font-mono">
            <div className="flex items-center gap-2 text-amber-streak text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Detalle de la Discrepancia Semántica</span>
            </div>

            <p className="text-xs text-content-primary leading-relaxed">
              {diff.reason}
            </p>

            {message && (
              <p className="text-[11px] text-content-secondary italic">
                {message}
              </p>
            )}

            {/* Asistente pedagógico tras discrepancias reiteradas */}
            {!isPlayground && !isSolutionRevealed && failedAttemptsCount >= 2 && onOpenRevealModal && (
              <div className="p-2.5 rounded-lg bg-amber-streak/10 border border-amber-streak/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-streak">
                  <Unlock className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] font-sans">
                    ¿Te resulta difícil ajustar la discrepancia? Puedes consultar la solución oficial para aprenderla (otorgará 0 XP).
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onOpenRevealModal}
                  leftIcon={<Unlock className="w-3 h-3" />}
                  className="text-xs bg-amber-streak text-canvas font-bold hover:bg-amber-streak/90 border-transparent shrink-0"
                >
                  Ver Solución
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 text-xs">
              <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
                <span className="text-[10px] text-content-muted uppercase">Columnas esperadas por la consigna:</span>
                <div className="text-emerald font-semibold mt-1">{diff.expected_columns.join(', ') || 'N/A'}</div>
                <div className="text-[10px] text-content-muted mt-2">Filas esperadas: {diff.expected_row_count}</div>
              </div>

              <div className="p-3 rounded-lg bg-canvas border border-border-subtle">
                <span className="text-[10px] text-content-muted uppercase">Columnas devueltas por tu consulta:</span>
                <div className="text-amber-streak font-semibold mt-1">{diff.actual_columns.join(', ') || 'N/A'}</div>
                <div className="text-[10px] text-content-muted mt-2">Tus filas devueltas: {diff.actual_row_count}</div>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('table')}
                leftIcon={<TableIcon className="w-3.5 h-3.5" />}
              >
                Ver Filas que Devolvió tu Query
              </Button>
            </div>
          </div>
        )}

        {/* PESTAÑA TABLA: RENDERIZADO TABULAR COMPLETO DE FILAS Y COLUMNAS */}
        {effectiveTab === 'table' && (status === 'SUCCESS' || status === 'FAILED') && (
          <div>
            {/* Aviso de discrepancia sutil cuando está en modo tabla con fallo */}
            {status === 'FAILED' && diff && (
              <div className="px-4 py-2 bg-amber-streak/10 border-b border-amber-streak/20 flex items-center justify-between text-xs font-mono text-amber-streak">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{diff.reason}</span>
                </div>
                <button
                  onClick={() => setActiveTab('diff')}
                  className="text-[11px] underline font-bold shrink-0 hover:text-white"
                >
                  Ver Comparativa
                </button>
              </div>
            )}

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
                      className="py-2 px-3.5 text-content-primary font-semibold border-r border-border-subtle/50 last:border-r-0 whitespace-nowrap"
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
                      (0 filas devueltas por tu consulta)
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
                          className="py-2 px-3.5 text-content-primary border-r border-border-subtle/30 last:border-r-0 whitespace-nowrap"
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
          </div>
        )}
      </div>
    </div>
  );
};
