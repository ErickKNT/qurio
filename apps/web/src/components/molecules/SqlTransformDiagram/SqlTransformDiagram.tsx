import React from 'react';
import { ArrowRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MiniTablePreview {
  title: string;
  columns: string[];
  rows: (string | number | null)[][];
  accent?: 'cyan' | 'indigo' | 'emerald' | 'amber';
}

export interface SqlTransformDiagramData {
  title: string;
  clauseBadge: string;
  inputs: MiniTablePreview[];
  operationLabel: string;
  output: MiniTablePreview;
  caption?: string;
}

export interface SqlTransformDiagramProps {
  diagram: SqlTransformDiagramData;
  className?: string;
}

const ACCENT_STYLES: Record<string, string> = {
  cyan: 'border-cyan-accent/35 text-cyan-accent',
  indigo: 'border-primary/35 text-primary',
  emerald: 'border-emerald/35 text-emerald',
  amber: 'border-amber-streak/35 text-amber-streak',
};

const MiniTableCard: React.FC<{ table: MiniTablePreview }> = ({ table }) => {
  const accentClass = ACCENT_STYLES[table.accent || 'cyan'];
  return (
    <div className={cn('rounded-xl border bg-surface-card/90 overflow-hidden shadow-sm font-mono', accentClass)}>
      <div className="px-2.5 py-1.5 bg-surface-dim border-b border-border-subtle/60 flex items-center justify-between text-[10px] font-bold">
        <span>{table.title}</span>
        <span className="text-content-muted font-normal">{table.rows.length}f</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="border-b border-border-subtle/50 bg-surface/60 text-content-muted">
              {table.columns.map((col, idx) => (
                <th key={idx} className="px-2 py-1 font-semibold whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/30">
            {table.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-surface-hover/30">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-2 py-1 text-content-primary whitespace-nowrap">
                    {cell === null ? (
                      <span className="italic text-content-muted/80 bg-surface-dim px-1 rounded text-[9px]">
                        NULL
                      </span>
                    ) : (
                      String(cell)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SqlTransformDiagram: React.FC<SqlTransformDiagramProps> = ({ diagram, className }) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-border-subtle/80 bg-canvas/70 p-3.5 sm:p-4 flex flex-col gap-3',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-semibold text-content-primary flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-accent" />
          <span>{diagram.title}</span>
        </span>
        <span className="px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-mono font-semibold text-primary-light">
          {diagram.clauseBadge}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Entrada(s) */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {diagram.inputs.map((tbl, idx) => (
            <MiniTableCard key={idx} table={tbl} />
          ))}
        </div>

        {/* Operación SQL */}
        <div className="flex md:flex-col items-center justify-center gap-1.5 py-1 px-2 shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-surface-card border border-cyan-accent/35 text-[10px] font-mono font-bold text-cyan-accent text-center whitespace-nowrap">
            {diagram.operationLabel}
          </span>
          <ArrowRight className="w-4 h-4 text-cyan-accent rotate-90 md:rotate-0 shrink-0" />
        </div>

        {/* Salida */}
        <div className="flex-1 min-w-0">
          <MiniTableCard table={diagram.output} />
        </div>
      </div>

      {diagram.caption && (
        <p className="text-[11px] text-content-muted font-sans leading-relaxed pt-1 border-t border-border-subtle/40">
          {diagram.caption}
        </p>
      )}
    </div>
  );
};
