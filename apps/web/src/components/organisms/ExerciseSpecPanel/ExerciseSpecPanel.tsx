import React, { useState } from 'react';
import {
  BookOpen,
  Database,
  Lightbulb,
  Zap,
  ChevronDown,
  ChevronRight,
  Table2,
} from 'lucide-react';
import { Exercise } from '@/types';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Button } from '@/components/atoms/Button/Button';
import { cn } from '@/lib/utils';

export interface ExerciseSpecPanelProps {
  exercise: Exercise;
  unlockedHintsCount: number;
  onUnlockHint: () => void;
  className?: string;
}

export const ExerciseSpecPanel: React.FC<ExerciseSpecPanelProps> = ({
  exercise,
  unlockedHintsCount,
  onUnlockHint,
  className,
}) => {
  const [schemaOpen, setSchemaOpen] = useState(true);

  // Esquema de tablas del dataset relacional para consulta rápida
  const schemaTables = [
    {
      name: 'clientes',
      columns: ['cliente_id (PK, UUID)', 'nombre (VARCHAR)', 'apellido (VARCHAR)', 'email (VARCHAR)', 'pais (VARCHAR)'],
    },
    {
      name: 'pedidos',
      columns: ['pedido_id (PK, UUID)', 'cliente_id (FK, UUID)', 'fecha_pedido (TIMESTAMP)', 'total (DECIMAL)', 'estado (VARCHAR)'],
    },
    {
      name: 'productos',
      columns: ['producto_id (PK, UUID)', 'nombre_producto (VARCHAR)', 'categoria_id (FK)', 'precio (DECIMAL)', 'stock (INT)'],
    },
    {
      name: 'categorias',
      columns: ['categoria_id (PK, INT)', 'nombre_categoria (VARCHAR)'],
    },
  ];

  const totalHints = exercise.hints ? exercise.hints.length : 0;
  const nextPenaltyPercent = (unlockedHintsCount + 1) * 15;

  return (
    <div className={cn('flex flex-col h-full bg-surface-dim select-none overflow-y-auto', className)}>
      {/* Header del Reto: Módulo y Recompensa */}
      <div className="p-4 border-b border-border-subtle bg-surface-card/40 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <Badge
            variant={
              exercise.difficulty === 'Principiante'
                ? 'emerald'
                : exercise.difficulty === 'Intermedio'
                ? 'cyan'
                : 'amber'
            }
            size="sm"
          >
            {exercise.difficulty}
          </Badge>

          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-streak">
            <Zap className="w-3.5 h-3.5 fill-amber-streak" />
            <span>+{exercise.xp_reward} XP</span>
          </div>
        </div>

        <h1 className="text-base font-bold text-content-primary tracking-tight leading-snug">
          {exercise.title}
        </h1>
      </div>

      <div className="p-4 flex flex-col gap-5 flex-1">
        {/* Sección: Consigna / Objetivo del Negocio */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-accent flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Consigna del Reto
          </span>
          <p className="text-xs text-content-secondary leading-relaxed bg-surface/50 p-3 rounded-xl border border-border-subtle/60">
            {exercise.prompt}
          </p>
        </div>

        {/* Sección: Esquema Relacional Involucrado */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setSchemaOpen((prev) => !prev)}
            className="flex items-center justify-between text-[11px] font-mono font-semibold uppercase tracking-wider text-content-secondary hover:text-content-primary transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-primary-light" />
              Esquema Relacional (Ecommerce DB)
            </span>
            {schemaOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {schemaOpen && (
            <div className="flex flex-col gap-2 font-mono text-[11px] animate-fadeIn">
              {schemaTables.map((tbl) => (
                <div
                  key={tbl.name}
                  className="p-2.5 rounded-lg bg-surface-card border border-border-subtle/80 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-content-primary font-bold">
                    <span className="flex items-center gap-1.5">
                      <Table2 className="w-3.5 h-3.5 text-cyan-accent" />
                      {tbl.name}
                    </span>
                    <span className="text-[10px] text-content-muted font-normal">public</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px] text-content-muted">
                    {tbl.columns.map((col, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-canvas border border-border-subtle/50 text-content-secondary"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección: Pistas Progresivas con Penalización de XP */}
        {totalHints > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-streak flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-streak" />
                Pistas ({unlockedHintsCount}/{totalHints})
              </span>

              {unlockedHintsCount < totalHints && (
                <button
                  onClick={onUnlockHint}
                  className="text-[11px] font-mono text-cyan-accent hover:underline flex items-center gap-1"
                >
                  <span>Revelar siguiente (-{nextPenaltyPercent}%)</span>
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {exercise.hints?.slice(0, unlockedHintsCount).map((hint, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-surface-card border border-amber-streak/30 text-xs text-content-secondary flex flex-col gap-1 animate-fadeIn"
                >
                  <span className="font-mono text-[10px] text-amber-streak font-semibold">
                    Pista {index + 1}:
                  </span>
                  <p className="leading-relaxed">{hint}</p>
                </div>
              ))}

              {unlockedHintsCount === 0 && (
                <div className="p-3 rounded-lg bg-surface-card/40 border border-border-subtle/50 text-center">
                  <p className="text-xs text-content-muted">
                    ¿Te trabaste? Puedes desbloquear pistas, pero reducirán un porcentaje del XP otorgado.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-cyan-accent"
                    onClick={onUnlockHint}
                  >
                    Desbloquear Pista 1 (-15% XP)
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
