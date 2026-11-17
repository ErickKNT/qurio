import React, { useEffect, useMemo, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Database, Key, Copy, Check, ArrowUpRight } from 'lucide-react';
import {
  ER_CANVAS_HEIGHT,
  ER_CANVAS_WIDTH,
  ER_CARD_WIDTH,
  ER_RELATIONS,
  ER_TABLES,
  ErTableNode,
  getRelatedTableNames,
} from '@/lib/schemaGraph';
import { cn } from '@/lib/utils';

export interface ErDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTableQuery?: (tableName: string, query: string) => void;
}

function getColumnAnchor(table: ErTableNode, columnName: string, side: 'left' | 'right'): { x: number; y: number } {
  const colIdx = Math.max(
    0,
    table.columns.findIndex((c) => c.name === columnName)
  );
  // Header (~34px) + vertical padding (6px) + row height (~24px) * index + half row
  const y = table.y + 36 + colIdx * 24 + 12;
  const x = side === 'left' ? table.x : table.x + ER_CARD_WIDTH;
  return { x, y };
}

export const ErDiagramModal: React.FC<ErDiagramModalProps> = ({
  isOpen,
  onClose,
  onSelectTableQuery,
}) => {
  const [zoom, setZoom] = useState(0.92);
  const [focusedTable, setFocusedTable] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const tableMap = useMemo(() => {
    const map = new Map<string, ErTableNode>();
    ER_TABLES.forEach((t) => map.set(t.name, t));
    return map;
  }, []);

  const relatedTables = useMemo(() => getRelatedTableNames(focusedTable), [focusedTable]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="er-diagram-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-canvas/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-6xl h-[90vh] rounded-2xl bg-surface border border-border-subtle shadow-2xl flex flex-col overflow-hidden">
        {/* Cabecera */}
        <div className="px-4 sm:px-5 py-3 bg-surface-dim border-b border-border-subtle flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-accent/15 border border-cyan-accent/30 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 text-cyan-accent" />
            </div>
            <div className="min-w-0">
              <h2 id="er-diagram-title" className="text-sm font-bold text-content-primary truncate font-mono">
                Diagrama Entidad-Relación • Ecommerce_Production_DB
              </h2>
              <p className="text-[11px] text-content-muted font-mono truncate">
                10 tablas · 9 relaciones FK · Pasa el cursor o haz clic en una tabla para resaltar sus uniones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Leyenda */}
            <div className="hidden md:flex items-center gap-2.5 mr-2 px-2.5 py-1 rounded-lg bg-surface border border-border-subtle/60 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-amber-streak font-semibold">
                <Key className="w-3 h-3" /> PK
              </span>
              <span className="text-border-subtle">|</span>
              <span className="text-cyan-accent font-semibold">FK</span>
              <span className="text-border-subtle">|</span>
              <span className="text-content-muted">1:1 / N:1</span>
            </div>

            {/* Controles de Zoom */}
            <div className="flex items-center rounded-lg border border-border-subtle bg-surface p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.55, Number((z - 0.1).toFixed(2))))}
                className="p-1.5 rounded hover:bg-surface-card text-content-secondary hover:text-content-primary transition-colors"
                title="Alejar"
                aria-label="Alejar diagrama"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] text-content-primary min-w-[44px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
                className="p-1.5 rounded hover:bg-surface-card text-content-secondary hover:text-content-primary transition-colors"
                title="Acercar"
                aria-label="Acercar diagrama"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(0.92);
                  setFocusedTable(null);
                }}
                className="p-1.5 rounded hover:bg-surface-card text-content-secondary hover:text-cyan-accent transition-colors"
                title="Restablecer vista"
                aria-label="Restablecer vista"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-border-subtle bg-surface text-content-muted hover:text-content-primary hover:bg-surface-card transition-colors"
              aria-label="Cerrar diagrama ER"
              title="Cerrar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lienzo ER Desplazable */}
        <div className="flex-1 overflow-auto bg-canvas relative p-4">
          <div
            style={{
              width: `${ER_CANVAS_WIDTH * zoom}px`,
              height: `${ER_CANVAS_HEIGHT * zoom}px`,
            }}
            className="relative mx-auto"
          >
            <div
              style={{
                width: `${ER_CANVAS_WIDTH}px`,
                height: `${ER_CANVAS_HEIGHT}px`,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
              }}
              className="relative"
            >
              {/* Capa SVG de Conectores FK → PK */}
              <svg
                width={ER_CANVAS_WIDTH}
                height={ER_CANVAS_HEIGHT}
                className="absolute inset-0 pointer-events-none"
              >
                <defs>
                  <marker
                    id="er-arrow-muted"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748B" />
                  </marker>
                  <marker
                    id="er-arrow-active"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38BDF8" />
                  </marker>
                </defs>

                {ER_RELATIONS.map((rel) => {
                  const fromTbl = tableMap.get(rel.fromTable);
                  const toTbl = tableMap.get(rel.toTable);
                  if (!fromTbl || !toTbl) return null;

                  const fromIsLeft = fromTbl.x + ER_CARD_WIDTH < toTbl.x;
                  const toIsLeft = toTbl.x + ER_CARD_WIDTH < fromTbl.x;

                  const start = getColumnAnchor(
                    fromTbl,
                    rel.fromColumn,
                    fromIsLeft ? 'right' : toIsLeft ? 'left' : 'right'
                  );
                  const end = getColumnAnchor(
                    toTbl,
                    rel.toColumn,
                    fromIsLeft ? 'left' : toIsLeft ? 'right' : 'right'
                  );

                  const dx = Math.max(48, Math.abs(end.x - start.x) * 0.45);
                  const c1x = fromIsLeft ? start.x + dx : toIsLeft ? start.x - dx : start.x + 56;
                  const c2x = fromIsLeft ? end.x - dx : toIsLeft ? end.x + dx : end.x + 56;
                  const pathD = `M ${start.x} ${start.y} C ${c1x} ${start.y}, ${c2x} ${end.y}, ${end.x} ${end.y}`;

                  const isHighlighted =
                    focusedTable !== null &&
                    (rel.fromTable === focusedTable || rel.toTable === focusedTable);
                  const isDimmed = focusedTable !== null && !isHighlighted;
                  const midX = (start.x + end.x) / 2;
                  const midY = (start.y + end.y) / 2;

                  return (
                    <g key={rel.id} className={isDimmed ? 'opacity-20' : 'opacity-100'}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isHighlighted ? '#38BDF8' : '#475569'}
                        strokeWidth={isHighlighted ? 2.2 : 1.4}
                        strokeDasharray={rel.cardinality === '1:1' ? '5 3' : undefined}
                        markerEnd={isHighlighted ? 'url(#er-arrow-active)' : 'url(#er-arrow-muted)'}
                      />
                      <rect
                        x={midX - 14}
                        y={midY - 9}
                        width={28}
                        height={18}
                        rx={5}
                        fill={isHighlighted ? '#0E1323' : '#111827'}
                        stroke={isHighlighted ? '#38BDF8' : '#334155'}
                        strokeWidth={1}
                      />
                      <text
                        x={midX}
                        y={midY + 3.5}
                        textAnchor="middle"
                        fontSize={9}
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight={600}
                        fill={isHighlighted ? '#7bd0ff' : '#94A3B8'}
                      >
                        {rel.cardinality}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Tarjetas de Tablas */}
              {ER_TABLES.map((tbl) => {
                const isFocused = focusedTable === tbl.name;
                const isRelated = relatedTables.has(tbl.name);
                const isDimmed = focusedTable !== null && !isRelated;

                return (
                  <div
                    key={tbl.name}
                    style={{
                      left: `${tbl.x}px`,
                      top: `${tbl.y}px`,
                      width: `${ER_CARD_WIDTH}px`,
                    }}
                    onMouseEnter={() => setFocusedTable(tbl.name)}
                    onMouseLeave={() => setFocusedTable((curr) => (curr === tbl.name ? null : curr))}
                    onClick={() => setFocusedTable((curr) => (curr === tbl.name ? null : tbl.name))}
                    className={cn(
                      'absolute rounded-xl border bg-surface-card transition-all duration-150 overflow-hidden shadow-md font-mono cursor-pointer',
                      isFocused
                        ? 'border-cyan-accent shadow-glow-cyan z-20'
                        : isRelated && focusedTable
                        ? 'border-primary/60 z-10'
                        : 'border-border-subtle/80',
                      isDimmed && 'opacity-35'
                    )}
                  >
                    {/* Header Tabla */}
                    <div className="px-3 py-2 bg-surface-dim border-b border-border-subtle/70 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-content-primary truncate">
                        {tbl.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(tbl.name);
                          }}
                          title={`Copiar nombre '${tbl.name}'`}
                          className="p-1 rounded text-content-muted hover:text-content-primary hover:bg-surface-card transition-colors"
                        >
                          {copiedToken === tbl.name ? (
                            <Check className="w-3 h-3 text-emerald" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        {onSelectTableQuery && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTableQuery(tbl.name, `SELECT * FROM ${tbl.name} LIMIT 50;`);
                              onClose();
                            }}
                            title={`Consultar ${tbl.name} en Playground`}
                            className="p-1 rounded text-content-muted hover:text-cyan-accent hover:bg-surface-card transition-colors"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Columnas */}
                    <div className="divide-y divide-border-subtle/30">
                      {tbl.columns.map((col) => (
                        <div
                          key={col.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(col.name);
                          }}
                          title="Clic para copiar columna"
                          className="px-2.5 h-6 flex items-center justify-between gap-2 text-[11px] hover:bg-surface-hover/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {col.isPrimary && (
                              <span className="px-1 rounded bg-amber-streak/15 text-amber-streak text-[9px] font-bold shrink-0">
                                PK
                              </span>
                            )}
                            {col.isForeign && (
                              <span className="px-1 rounded bg-cyan-accent/15 text-cyan-accent text-[9px] font-bold shrink-0">
                                FK
                              </span>
                            )}
                            <span className="text-content-primary truncate">{col.name}</span>
                          </div>
                          <span className="text-[10px] text-content-muted shrink-0">
                            {col.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
