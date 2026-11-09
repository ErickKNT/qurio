import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Database,
  Lightbulb,
  Zap,
  Table2,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  Layers,
} from 'lucide-react';
import { Exercise, SampleTableData } from '@/types';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Button } from '@/components/atoms/Button/Button';
import { SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CLIENTES } from '@/lib/api';
import { cn } from '@/lib/utils';

export interface ExerciseSpecPanelProps {
  exercise: Exercise;
  unlockedHintsCount: number;
  onUnlockHint: () => void;
  isCompleted?: boolean;
  className?: string;
}

type SpecTab = 'guide' | 'sample' | 'schema' | 'hints';

export const ExerciseSpecPanel: React.FC<ExerciseSpecPanelProps> = ({
  exercise,
  unlockedHintsCount,
  onUnlockHint,
  isCompleted,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<SpecTab>('guide');
  const [selectedTableIndex, setSelectedTableIndex] = useState(0);
  const [checkedObjectives, setCheckedObjectives] = useState<Record<number, boolean>>({});
  const [copiedCol, setCopiedCol] = useState<string | null>(null);

  // Sincronizar checklist automáticamente si el reto está completado o aprobado
  useEffect(() => {
    if ((isCompleted || exercise.is_completed) && exercise.objectives) {
      const allChecked: Record<number, boolean> = {};
      exercise.objectives.forEach((_, idx) => {
        allChecked[idx] = true;
      });
      setCheckedObjectives(allChecked);
    } else {
      setCheckedObjectives({});
    }
  }, [isCompleted, exercise.id, exercise.is_completed]);

  // Esquema de tablas del dataset relacional para consulta rápida
  const schemaTables = [
    {
      name: 'clientes',
      columns: ['cliente_id (PK, INT)', 'nombre (VARCHAR)', 'apellido (VARCHAR)', 'email (VARCHAR)', 'ciudad (VARCHAR)', 'pais (VARCHAR)'],
    },
    {
      name: 'pedidos',
      columns: ['pedido_id (PK, INT)', 'cliente_id (FK, INT)', 'fecha_pedido (DATE)', 'estado_pedido (VARCHAR)', 'total (NUMERIC)'],
    },
    {
      name: 'productos',
      columns: ['producto_id (PK, INT)', 'nombre_producto (VARCHAR)', 'categoria_id (FK)', 'precio (NUMERIC)', 'stock (INT)'],
    },
    {
      name: 'categorias',
      columns: ['categoria_id (PK, INT)', 'nombre_categoria (VARCHAR)', 'descripcion (TEXT)'],
    },
  ];

  const totalHints = exercise.hints ? exercise.hints.length : 0;
  const nextPenaltyPercent = (unlockedHintsCount + 1) * 15;

  const sampleTables: SampleTableData[] =
    exercise.sample_tables && exercise.sample_tables.length > 0
      ? exercise.sample_tables
      : [SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CLIENTES];

  const activeSampleTable = sampleTables[selectedTableIndex] || sampleTables[0];

  const toggleObjective = (index: number) => {
    setCheckedObjectives((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCopyColumn = (colName: string) => {
    navigator.clipboard.writeText(colName);
    setCopiedCol(colName);
    setTimeout(() => setCopiedCol(null), 1500);
  };

  return (
    <div className={cn('flex flex-col h-full bg-surface-dim select-none overflow-hidden', className)}>
      {/* Header del Reto: Módulo, Título y Recompensa */}
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

        <h1 className="text-sm sm:text-base font-bold text-content-primary tracking-tight leading-snug">
          {exercise.title}
        </h1>
      </div>

      {/* Barra de Pestañas de Navegación Didáctica (Estilo SQLBolt) */}
      <div className="flex items-center px-3 pt-2 border-b border-border-subtle/70 bg-surface/40 gap-1 shrink-0 overflow-x-auto text-[11px] font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-t-lg transition-all border-b-2',
            activeTab === 'guide'
              ? 'text-primary border-primary bg-surface/80 font-semibold'
              : 'text-content-muted border-transparent hover:text-content-primary hover:bg-surface/30'
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Guía & Reto</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sample')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-t-lg transition-all border-b-2',
            activeTab === 'sample'
              ? 'text-cyan-accent border-cyan-accent bg-surface/80 font-semibold'
              : 'text-content-muted border-transparent hover:text-content-primary hover:bg-surface/30'
          )}
          title="Ver datos reales de muestra en la tabla"
        >
          <Table2 className="w-3.5 h-3.5 text-cyan-accent" />
          <span>Muestra</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-accent animate-pulse" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schema')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-t-lg transition-all border-b-2',
            activeTab === 'schema'
              ? 'text-indigo-400 border-indigo-400 bg-surface/80 font-semibold'
              : 'text-content-muted border-transparent hover:text-content-primary hover:bg-surface/30'
          )}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Esquema</span>
        </button>

        {totalHints > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('hints')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-t-lg transition-all border-b-2 ml-auto',
              activeTab === 'hints'
                ? 'text-amber-streak border-amber-streak bg-surface/80 font-semibold'
                : 'text-content-muted border-transparent hover:text-content-primary hover:bg-surface/30'
            )}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-streak" />
            <span>Pistas ({unlockedHintsCount}/{totalHints})</span>
          </button>
        )}
      </div>

      {/* Contenido Dinámico de la Pestaña Activa */}
      <div className="p-4 flex flex-col gap-5 flex-1 overflow-y-auto">
        {/* ==================================================================== */}
        {/* PESTAÑA 1: GUÍA & RETO DIDÁCTICO */}
        {/* ==================================================================== */}
        {activeTab === 'guide' && (
          <div className="flex flex-col gap-5 animate-fadeIn">
            {/* Tarjeta de Concepto Clave y Sintaxis de Referencia (Micro-Learning) */}
            {exercise.concept && (
              <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-gradient-to-br from-surface to-primary/[0.04] border border-border-subtle/80 shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-mono font-semibold uppercase tracking-wider text-primary">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Concepto Clave & Sintaxis
                  </span>
                  <span className="text-[10px] text-content-muted font-normal">SQLBolt Didactics</span>
                </div>

                <p className="text-xs text-content-secondary leading-relaxed">
                  {exercise.concept.summary}
                </p>

                {/* Bloque de Sintaxis */}
                {exercise.concept.syntax && (
                  <div className="p-2.5 rounded-lg bg-surface-card border border-border-subtle font-mono text-[11px] text-primary-light overflow-x-auto leading-relaxed shadow-inner">
                    <pre className="m-0 font-mono">
                      <code>{exercise.concept.syntax}</code>
                    </pre>
                  </div>
                )}

                {/* Puntos Clave */}
                {exercise.concept.key_points && exercise.concept.key_points.length > 0 && (
                  <ul className="flex flex-col gap-1 pt-1 border-t border-border-subtle/40 text-[11px] text-content-secondary font-mono">
                    {exercise.concept.key_points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-primary font-bold shrink-0">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Nota de Orden de Ejecución */}
                {exercise.concept.execution_order_note && (
                  <div className="mt-1 p-2 rounded-lg bg-cyan-accent/10 border border-cyan-accent/25 text-[11px] font-mono text-cyan-600 dark:text-cyan-accent leading-relaxed flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 shrink-0 text-cyan-accent" />
                    <span>{exercise.concept.execution_order_note}</span>
                  </div>
                )}
              </div>
            )}

            {/* Consigna del Reto */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-accent flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Consigna del Negocio
              </span>
              <div className="text-xs text-content-secondary leading-relaxed bg-surface/50 p-3 rounded-xl border border-border-subtle/60 shadow-sm">
                <p>{exercise.prompt}</p>

                {/* Botón rápido para inspeccionar la tabla en la pestaña muestra */}
                <div className="mt-3 pt-2.5 border-t border-border-subtle/40 flex items-center justify-between text-[11px] font-mono text-content-muted">
                  <span>¿Deseas ver los valores reales?</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sample')}
                    className="text-cyan-accent hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Table2 className="w-3 h-3 text-cyan-accent" />
                    <span>Ver Muestra de Datos</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-Objetivos Progresivos (Checklist estilo SQLBolt) */}
            {exercise.objectives && exercise.objectives.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-mono font-semibold uppercase tracking-wider text-content-secondary">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className={cn("w-3.5 h-3.5", Object.values(checkedObjectives).filter(Boolean).length === exercise.objectives.length ? "text-emerald" : "text-cyan-accent")} />
                    <span>Objetivos ({Object.values(checkedObjectives).filter(Boolean).length}/{exercise.objectives.length})</span>
                    {Object.values(checkedObjectives).filter(Boolean).length === exercise.objectives.length && (
                      <span className="text-[10px] text-emerald bg-emerald/10 px-1.5 py-0.2 rounded border border-emerald/30 font-bold ml-1 animate-fadeIn">
                        ✓ Cumplidos
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-content-muted font-normal">Checklist interactivo</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {exercise.objectives.map((obj, idx) => {
                    const isChecked = !!checkedObjectives[idx];
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleObjective(idx)}
                        className={cn(
                          'flex items-center gap-2.5 p-2 rounded-lg border text-left text-xs font-mono transition-all',
                          isChecked
                            ? 'bg-emerald/10 border-emerald/30 text-content-primary line-through opacity-80'
                            : 'bg-surface-card border-border-subtle/70 text-content-secondary hover:text-content-primary hover:border-primary/40'
                        )}
                      >
                        <span
                          className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                            isChecked
                              ? 'bg-emerald border-emerald text-canvas'
                              : 'border-border-subtle bg-surface'
                          )}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <span className="leading-snug">{obj}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* PESTAÑA 2: DATOS DE MUESTRA REALES DE LA TABLA (Novedad SQLBolt) */}
        {/* ==================================================================== */}
        {activeTab === 'sample' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-accent flex items-center gap-1.5">
                <Table2 className="w-3.5 h-3.5 text-cyan-accent" />
                Previsualización de Filas de Muestra
              </span>
              <p className="text-xs text-content-secondary">
                Registros reales del Sandbox PostgreSQL para entender la estructura de datos antes de escribir tu consulta.
              </p>
            </div>

            {/* Selector de Tabla si hay múltiples tablas relacionadas */}
            {sampleTables.length > 1 && (
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface border border-border-subtle/80 overflow-x-auto">
                {sampleTables.map((tbl, idx) => (
                  <button
                    key={tbl.tableName}
                    type="button"
                    onClick={() => setSelectedTableIndex(idx)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors shrink-0',
                      selectedTableIndex === idx
                        ? 'bg-primary text-white font-semibold shadow-sm'
                        : 'text-content-muted hover:text-content-primary hover:bg-surface-dim'
                    )}
                  >
                    {tbl.tableName}
                  </button>
                ))}
              </div>
            )}

            {/* Grid Tabular de Muestra */}
            <div className="flex flex-col rounded-xl border border-border-subtle/80 bg-surface overflow-hidden shadow-sm">
              <div className="px-3 py-2 bg-surface-card border-b border-border-subtle/80 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-content-primary flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-cyan-accent" />
                  <span>Tabla: {activeSampleTable.tableName}</span>
                </span>
                <span className="text-[10px] text-content-muted">
                  {activeSampleTable.rows.length} filas de ejemplo
                </span>
              </div>

              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left font-mono text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-surface-dim/80 border-b border-border-subtle/70 text-content-muted uppercase tracking-wider text-[10px]">
                      {activeSampleTable.columns.map((col) => (
                        <th key={col} className="p-2 whitespace-nowrap font-medium">
                          <div className="flex items-center justify-between gap-1 group">
                            <span>{col}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyColumn(col)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-surface transition-opacity"
                              title={`Copiar nombre '${col}'`}
                            >
                              {copiedCol === col ? (
                                <Check className="w-3 h-3 text-emerald" />
                              ) : (
                                <Copy className="w-3 h-3 text-content-muted" />
                              )}
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/40">
                    {activeSampleTable.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-surface-hover/50 transition-colors">
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className="p-2 whitespace-nowrap text-content-secondary">
                            {val === null ? (
                              <span className="text-[10px] px-1 py-0.5 rounded bg-surface-card text-content-muted italic">
                                NULL
                              </span>
                            ) : typeof val === 'number' ? (
                              <span className="text-amber-streak font-medium">{val}</span>
                            ) : (
                              <span>{String(val)}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-[11px] text-content-muted font-mono italic">
              💡 Haz hover sobre el nombre de cualquier columna para copiar su identificador al portapapeles.
            </p>
          </div>
        )}

        {/* ==================================================================== */}
        {/* PESTAÑA 3: ESQUEMA RELACIONAL Y TIPOS POSTGRESQL */}
        {/* ==================================================================== */}
        {activeTab === 'schema' && (
          <div className="flex flex-col gap-3 font-mono text-[11px] animate-fadeIn">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Esquema Completo (Ecommerce DB)
            </span>

            {schemaTables.map((tbl) => (
              <div
                key={tbl.name}
                className="p-2.5 rounded-lg bg-surface-card border border-border-subtle/80 flex flex-col gap-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between text-content-primary font-bold">
                  <span className="flex items-center gap-1.5">
                    <Table2 className="w-3.5 h-3.5 text-indigo-400" />
                    {tbl.name}
                  </span>
                  <span className="text-[10px] text-content-muted font-normal">public</span>
                </div>
                <div className="flex flex-col gap-0.5 pt-1.5 border-t border-border-subtle/30">
                  {tbl.columns.map((col, idx) => {
                    const parts = col.split(' ');
                    const colName = parts[0];
                    const colType = parts.slice(1).join(' ');
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-[11px] py-0.5 px-1 rounded hover:bg-surface-hover/40"
                      >
                        <span className="text-content-secondary font-mono">{colName}</span>
                        <span className="text-[10px] text-content-muted font-mono">{colType}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================================================================== */}
        {/* PESTAÑA 4: PISTAS PROGRESIVAS */}
        {/* ==================================================================== */}
        {activeTab === 'hints' && totalHints > 0 && (
          <div className="flex flex-col gap-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-streak flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-streak" />
                Pistas Progresivas ({unlockedHintsCount}/{totalHints})
              </span>

              {unlockedHintsCount < totalHints && (
                <button
                  type="button"
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
                  className="p-3 rounded-lg bg-surface-card border border-amber-streak/30 text-xs text-content-secondary flex flex-col gap-1 animate-fadeIn shadow-sm"
                >
                  <span className="font-mono text-[10px] text-amber-streak font-semibold">
                    Pista #{index + 1}:
                  </span>
                  <p className="leading-relaxed">{hint}</p>
                </div>
              ))}

              {unlockedHintsCount === 0 && (
                <div className="p-4 rounded-xl bg-surface-card/40 border border-border-subtle/50 text-center flex flex-col items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-amber-streak opacity-80" />
                  <p className="text-xs text-content-muted">
                    ¿Te trabaste? Puedes desbloquear pistas, pero reducirán un porcentaje del XP otorgado por este ejercicio.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 text-cyan-accent"
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
