import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Play,
  GitFork,
  Route,
  ArrowRight,
  Zap,
  Sparkles,
  Circle,
  Lock,
} from 'lucide-react';
import { Track, Module, Exercise } from '@/types';
import { Badge, RadioTab } from '@/components/atoms';
import { cn } from '@/lib/utils';

export type RoadmapViewMode = 'tree' | 'stages';

export interface LearningRoadmapMapProps {
  tracks: Track[];
  exercises: Exercise[];
  completedExerciseIds?: Set<string>;
  selectedTrackId?: string;
  onSelectTrack?: (trackId: string) => void;
  onSelectExercise: (exercise: Exercise) => void;
  className?: string;
}

interface SkillNodeMeta {
  moduleNumber: number;
  title: string;
  sqlTags: string;
  prereqs: number[];
}

const SKILL_META: Record<number, SkillNodeMeta> = {
  1: { moduleNumber: 1, title: 'Proyecciones', sqlTags: 'SELECT • AS • DISTINCT', prereqs: [] },
  2: { moduleNumber: 2, title: 'Filtrado Lógico', sqlTags: 'WHERE • BETWEEN • LIKE', prereqs: [1] },
  3: { moduleNumber: 3, title: 'Orden y Límite', sqlTags: 'ORDER BY • LIMIT • OFFSET', prereqs: [1] },
  4: { moduleNumber: 4, title: 'Agregación y Grupos', sqlTags: 'COUNT • SUM • GROUP BY • HAVING', prereqs: [2, 3] },
  5: { moduleNumber: 5, title: 'Uniones Base', sqlTags: 'INNER JOIN • ON', prereqs: [4] },
  6: { moduleNumber: 6, title: 'Ausencias y Ceros', sqlTags: 'LEFT JOIN • IS NULL • COALESCE', prereqs: [5] },
  7: { moduleNumber: 7, title: 'Cadenas Multi-Tabla', sqlTags: '3–5 Tablas • Cascada', prereqs: [5] },
  8: { moduleNumber: 8, title: 'Conjuntos y Cruces', sqlTags: 'UNION • INTERSECT • EXCEPT', prereqs: [5] },
  9: { moduleNumber: 9, title: 'Subconsultas', sqlTags: 'Escalar • IN • EXISTS', prereqs: [6, 7] },
  10: { moduleNumber: 10, title: 'Lógica Condicional', sqlTags: 'CASE WHEN • Pivoteo', prereqs: [7, 8] },
  11: { moduleNumber: 11, title: 'CTEs Modulares', sqlTags: 'WITH • Encadenadas', prereqs: [9, 10] },
  12: { moduleNumber: 12, title: 'Funciones de Ventana', sqlTags: 'ROW_NUMBER • DENSE_RANK • LAG', prereqs: [11] },
  13: { moduleNumber: 13, title: 'Inserción DML', sqlTags: 'INSERT • VALUES • RETURNING', prereqs: [12] },
  14: { moduleNumber: 14, title: 'Mutación Segura', sqlTags: 'UPDATE • FROM • DELETE • WHERE', prereqs: [13] },
  15: { moduleNumber: 15, title: 'Diseño de Tablas', sqlTags: 'CREATE • ALTER • DROP • CHECK', prereqs: [13] },
  16: { moduleNumber: 16, title: 'Índices y Tuning', sqlTags: 'CREATE INDEX • UNIQUE • PARTIAL', prereqs: [14, 15] },
};

// Bandas verticales (arriba → abajo) con alineación natural por etapa formativa
const SKILL_ZONES: {
  trackId: string;
  zoneLabel: string;
  levelLabel: string;
  accentColor: string;
  borderTint: string;
  rows: number[][];
}[] = [
  {
    trackId: 'sql-foundations',
    zoneLabel: 'Etapa 1 • Fundamentos de SQL',
    levelLabel: 'Principiante',
    accentColor: '#38BDF8',
    borderTint: 'border-cyan-accent/25 bg-cyan-accent/[0.03]',
    rows: [[1], [2, 3], [4]],
  },
  {
    trackId: 'relational-sql',
    zoneLabel: 'Etapa 2 • SQL Relacional',
    levelLabel: 'Intermedio',
    accentColor: '#818CF8',
    borderTint: 'border-indigo-400/25 bg-indigo-400/[0.03]',
    rows: [[5], [6, 7, 8]],
  },
  {
    trackId: 'advanced-queries',
    zoneLabel: 'Etapa 3 • Consultas Avanzadas',
    levelLabel: 'Avanzado',
    accentColor: '#34D399',
    borderTint: 'border-emerald/25 bg-emerald/[0.03]',
    rows: [[9, 10], [11], [12]],
  },
  {
    trackId: 'data-manipulation-ddl',
    zoneLabel: 'Etapa 4 • Ingeniería y Manipulación de Datos',
    levelLabel: 'Intermedio → Avanzado',
    accentColor: '#F59E0B',
    borderTint: 'border-amber-streak/25 bg-amber-streak/[0.03]',
    rows: [[13], [14, 15], [16]],
  },
];

interface ComputedEdge {
  id: string;
  srcNum: number;
  dstNum: number;
  path: string;
}

function getAncestors(moduleNum: number): Set<number> {
  const visited = new Set<number>();
  const stack = [...(SKILL_META[moduleNum]?.prereqs || [])];
  while (stack.length > 0) {
    const curr = stack.pop()!;
    if (!visited.has(curr)) {
      visited.add(curr);
      stack.push(...(SKILL_META[curr]?.prereqs || []));
    }
  }
  return visited;
}

export const LearningRoadmapMap: React.FC<LearningRoadmapMapProps> = ({
  tracks,
  exercises,
  completedExerciseIds,
  selectedTrackId,
  onSelectTrack,
  onSelectExercise,
  className,
}) => {
  const [viewMode, setViewMode] = useState<RoadmapViewMode>('tree');
  const [hoveredModuleNum, setHoveredModuleNum] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');

  const treeContainerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const [edges, setEdges] = useState<ComputedEdge[]>([]);
  const [svgBounds, setSvgBounds] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const isExerciseDone = useCallback(
    (ex: Exercise) =>
      completedExerciseIds ? completedExerciseIds.has(ex.id) : Boolean(ex.is_completed),
    [completedExerciseIds]
  );

  // Construir mapa indexado por module_number (1..12)
  const moduleEntries = useMemo(() => {
    const entries: {
      module: Module;
      track: Track;
      moduleNumber: number;
      exercises: Exercise[];
      completedCount: number;
      totalCount: number;
      status: 'completed' | 'active' | 'pending';
    }[] = [];

    let foundFirstActive = false;

    for (const track of tracks) {
      for (const mod of track.modules || []) {
        const modExs = exercises
          .filter((e) => e.module_id === mod.id)
          .sort((a, b) => a.sort_order - b.sort_order);
        const total = modExs.length || mod.exercises_count || 0;
        const completed = modExs.filter(isExerciseDone).length;

        let status: 'completed' | 'active' | 'pending' = 'pending';
        if (total > 0 && completed >= total) {
          status = 'completed';
        } else if (!foundFirstActive && (completed > 0 || total > 0)) {
          status = 'active';
          foundFirstActive = true;
        }

        entries.push({
          module: mod,
          track,
          moduleNumber: mod.sort_order,
          exercises: modExs,
          completedCount: completed,
          totalCount: total,
          status,
        });
      }
    }
    return entries.sort((a, b) => a.moduleNumber - b.moduleNumber);
  }, [tracks, exercises, isExerciseDone]);

  const defaultSelectedModId = useMemo(() => {
    const activeInTrack = moduleEntries.find(
      (e) => e.track.id === selectedTrackId && e.status !== 'completed'
    );
    if (activeInTrack) return activeInTrack.module.id;
    const firstInTrack = moduleEntries.find((e) => e.track.id === selectedTrackId);
    if (firstInTrack) return firstInTrack.module.id;
    return moduleEntries[0]?.module.id || '';
  }, [moduleEntries, selectedTrackId]);

  const activeEntry = useMemo(() => {
    const chosen = moduleEntries.find((e) => e.module.id === selectedModuleId);
    if (chosen && (!selectedTrackId || chosen.track.id === selectedTrackId)) {
      return chosen;
    }
    return moduleEntries.find((e) => e.module.id === defaultSelectedModId) || moduleEntries[0];
  }, [moduleEntries, selectedModuleId, defaultSelectedModId, selectedTrackId]);

  const entryByNumber = useMemo(() => {
    const map = new Map<number, (typeof moduleEntries)[number]>();
    for (const entry of moduleEntries) {
      map.set(entry.moduleNumber, entry);
    }
    return map;
  }, [moduleEntries]);

  // Calcular rutas SVG exactas entre puertos inferior (padre) y superior (hijo)
  const recomputeEdges = useCallback(() => {
    const container = treeContainerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    if (cRect.width === 0 || cRect.height === 0) return;

    const nextEdges: ComputedEdge[] = [];
    for (const meta of Object.values(SKILL_META)) {
      const dstEl = nodeRefs.current[meta.moduleNumber];
      if (!dstEl) continue;
      const dRect = dstEl.getBoundingClientRect();
      const x2 = dRect.left - cRect.left + dRect.width / 2;
      const y2 = dRect.top - cRect.top;

      for (const srcNum of meta.prereqs) {
        const srcEl = nodeRefs.current[srcNum];
        if (!srcEl) continue;
        const sRect = srcEl.getBoundingClientRect();
        const x1 = sRect.left - cRect.left + sRect.width / 2;
        const y1 = sRect.top - cRect.top + sRect.height;

        const midY = y1 + (y2 - y1) * 0.5;
        const path = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${x1.toFixed(1)} ${midY.toFixed(1)}, ${x2.toFixed(1)} ${midY.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
        nextEdges.push({
          id: `${srcNum}-${meta.moduleNumber}`,
          srcNum,
          dstNum: meta.moduleNumber,
          path,
        });
      }
    }

    setSvgBounds({ width: cRect.width, height: cRect.height });
    setEdges(nextEdges);
  }, []);

  useLayoutEffect(() => {
    if (viewMode !== 'tree') return;
    const rafId = requestAnimationFrame(recomputeEdges);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && treeContainerRef.current) {
      observer = new ResizeObserver(() => recomputeEdges());
      observer.observe(treeContainerRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [viewMode, recomputeEdges, moduleEntries.length]);

  const handleSelectModule = (entry: (typeof moduleEntries)[number]) => {
    setSelectedModuleId(entry.module.id);
    if (onSelectTrack && entry.track.id !== selectedTrackId) {
      onSelectTrack(entry.track.id);
    }
  };

  if (tracks.length === 0 || moduleEntries.length === 0) return null;

  const focusedNum = hoveredModuleNum ?? activeEntry?.moduleNumber ?? null;
  const causalAncestors = useMemo(
    () => (focusedNum ? getAncestors(focusedNum) : new Set<number>()),
    [focusedNum]
  );

  return (
    <section
      aria-label="Mapa Visual Curricular"
      className={cn(
        'flex flex-col gap-5 p-5 sm:p-6 rounded-2xl bg-surface/65 border border-border-subtle/70 shadow-lg',
        className
      )}
    >
      {/* Header + Selector de Vista Dual */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border-subtle/40">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm">
              Mapa Curricular Interactivo
            </Badge>
            <span className="text-[11px] font-mono text-content-muted">
              {moduleEntries.length} Módulos • {exercises.length} Retos
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-content-primary tracking-tight">
            Recorrido Visual y Dependencias SQL
          </h2>
          <p className="text-xs text-content-secondary">
            Selecciona cualquier módulo en el árbol para ver su cadena de prerrequisitos y acceder directo a sus retos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <RadioTab
            label="Árbol de Habilidades"
            active={viewMode === 'tree'}
            onClick={() => setViewMode('tree')}
            icon={<GitFork className="w-3.5 h-3.5" />}
          />
          <RadioTab
            label="Camino por Etapas"
            active={viewMode === 'stages'}
            onClick={() => setViewMode('stages')}
            icon={<Route className="w-3.5 h-3.5" />}
          />
        </div>
      </div>

      {/* Leyenda de Estado */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-content-muted">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            Completado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-accent shadow-[0_0_8px_rgba(123,208,255,0.7)]" />
            En curso / Seleccionado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-card border border-border-subtle" />
            Por explorar
          </span>
        </div>

        {viewMode === 'tree' && focusedNum && (
          <span className="text-[10px] text-cyan-accent hidden sm:inline">
            Cadena resaltada hasta Módulo {focusedNum}
          </span>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODO PRINCIPAL: ÁRBOL DE HABILIDADES TOP-DOWN (BLUEPRINT DE CIRCUITO)*/}
      {/* ==================================================================== */}
      {viewMode === 'tree' && (
        <div
          ref={treeContainerRef}
          className="relative flex flex-col gap-5 p-4 sm:p-6 rounded-xl bg-surface-dim/75 border border-border-subtle/50 overflow-hidden animate-fadeIn"
        >
          {/* Patrón de puntos estilo tablero técnico */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
              backgroundSize: '22px 22px',
            }}
          />

          {/* Capa SVG dinámica con conectores Bezier de puerto a puerto */}
          {svgBounds.width > 0 && edges.length > 0 && (
            <svg
              className="absolute inset-0 pointer-events-none z-0"
              width={svgBounds.width}
              height={svgBounds.height}
              viewBox={`0 0 ${svgBounds.width} ${svgBounds.height}`}
            >
              <defs>
                <marker
                  id="arrow-cyan"
                  viewBox="0 0 8 8"
                  refX="6"
                  refY="4"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 7 4 L 0 7 z" fill="#7BD0FF" />
                </marker>
                <marker
                  id="arrow-emerald"
                  viewBox="0 0 8 8"
                  refX="6"
                  refY="4"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 7 4 L 0 7 z" fill="#22C55E" />
                </marker>
              </defs>
              {edges.map((edge) => {
                const srcEntry = entryByNumber.get(edge.srcNum);
                const isSourceDone = srcEntry?.status === 'completed';
                const inFocusedChain =
                  focusedNum !== null &&
                  (edge.dstNum === focusedNum || causalAncestors.has(edge.dstNum)) &&
                  (edge.srcNum === focusedNum || causalAncestors.has(edge.srcNum));

                const stroke = inFocusedChain
                  ? '#7BD0FF'
                  : isSourceDone
                  ? '#22C55E'
                  : '#334155';

                return (
                  <path
                    key={edge.id}
                    d={edge.path}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={inFocusedChain ? 2.4 : 1.6}
                    strokeOpacity={inFocusedChain ? 0.95 : isSourceDone ? 0.75 : 0.55}
                    strokeDasharray={inFocusedChain || isSourceDone ? undefined : '4 4'}
                    markerEnd={
                      inFocusedChain
                        ? 'url(#arrow-cyan)'
                        : isSourceDone
                        ? 'url(#arrow-emerald)'
                        : undefined
                    }
                  />
                );
              })}
            </svg>
          )}

          {/* Zonas Verticales (Etapa 1 -> Etapa 2 -> Etapa 3) */}
          <div className="relative z-10 flex flex-col gap-5">
            {SKILL_ZONES.map((zone) => (
              <div
                key={zone.trackId}
                className={cn(
                  'rounded-xl border p-3.5 sm:p-4 flex flex-col gap-5',
                  zone.borderTint
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: zone.accentColor }}
                    />
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-content-primary">
                      {zone.zoneLabel}
                    </span>
                  </div>
                  <Badge variant="mono" size="sm">
                    {zone.levelLabel}
                  </Badge>
                </div>

                {/* Filas jerárquicas dentro de la zona */}
                <div className="flex flex-col gap-7">
                  {zone.rows.map((rowNums, rowIdx) => (
                    <div
                      key={rowIdx}
                      className={cn(
                        'grid gap-4 items-stretch justify-items-center',
                        rowNums.length === 1
                          ? 'grid-cols-1 max-w-xs w-full mx-auto'
                          : rowNums.length === 2
                          ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl w-full mx-auto'
                          : 'grid-cols-1 sm:grid-cols-3 w-full'
                      )}
                    >
                      {rowNums.map((num) => {
                        const entry = entryByNumber.get(num);
                        const meta = SKILL_META[num];
                        if (!entry || !meta) return null;

                        const isSelected = activeEntry?.module.id === entry.module.id;
                        const isInChain =
                          focusedNum === num || causalAncestors.has(num);
                        const isDimmed =
                          hoveredModuleNum !== null && !isInChain;
                        const pct =
                          entry.totalCount > 0
                            ? Math.round((entry.completedCount / entry.totalCount) * 100)
                            : 0;

                        return (
                          <button
                            key={num}
                            ref={(el) => {
                              nodeRefs.current[num] = el;
                            }}
                            type="button"
                            onClick={() => handleSelectModule(entry)}
                            onMouseEnter={() => setHoveredModuleNum(num)}
                            onMouseLeave={() => setHoveredModuleNum(null)}
                            title={`${entry.module.title} (${entry.completedCount}/${entry.totalCount})`}
                            className={cn(
                              'group relative w-full p-3 rounded-xl border text-left transition-all duration-200 flex flex-col gap-2 bg-surface/95 backdrop-blur-sm',
                              isSelected
                                ? 'border-cyan-accent ring-1 ring-cyan-accent/40 shadow-[0_0_20px_rgba(123,208,255,0.25)]'
                                : isInChain && hoveredModuleNum !== null
                                ? 'border-cyan-accent/70 shadow-sm'
                                : entry.status === 'completed'
                                ? 'border-emerald/60 hover:border-emerald'
                                : entry.status === 'active'
                                ? 'border-primary/60 hover:border-cyan-accent'
                                : 'border-border-subtle/70 hover:border-border-subtle',
                              isDimmed && 'opacity-55'
                            )}
                          >
                            {/* Puerto visual superior / inferior */}
                            {meta.prereqs.length > 0 && (
                              <span className="hidden sm:block absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-surface border border-border-subtle" />
                            )}
                            {num < 16 && (
                              <span className="hidden sm:block absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-surface border border-border-subtle" />
                            )}

                            {/* Fila superior: M# + Estado + Progreso */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    'px-1.5 py-0.5 rounded font-mono text-[10px] font-bold border',
                                    entry.status === 'completed'
                                      ? 'bg-emerald/15 border-emerald/40 text-emerald'
                                      : isSelected || entry.status === 'active'
                                      ? 'bg-cyan-accent/15 border-cyan-accent/40 text-cyan-accent'
                                      : 'bg-surface-card border-border-subtle text-content-muted'
                                  )}
                                >
                                  M{String(num).padStart(2, '0')}
                                </span>
                                <span className="text-[11px] font-bold text-content-primary leading-tight">
                                  {meta.title}
                                </span>
                              </div>

                              <span className="text-[10px] font-mono text-content-muted shrink-0 flex items-center gap-1">
                                {entry.status === 'completed' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                                ) : entry.status === 'active' ? (
                                  <Play className="w-3 h-3 text-cyan-accent fill-cyan-accent" />
                                ) : (
                                  <Lock className="w-3 h-3 text-content-muted/60 hidden" />
                                )}
                                {entry.completedCount}/{entry.totalCount}
                              </span>
                            </div>

                            {/* Título oficial completo del módulo */}
                            <p className="text-[11px] text-content-secondary leading-snug line-clamp-1">
                              {entry.module.title}
                            </p>

                            {/* Etiquetas SQL + barra de progreso */}
                            <div className="flex flex-col gap-1.5 pt-1 border-t border-border-subtle/30">
                              <span className="font-mono text-[10px] text-primary-light truncate">
                                {meta.sqlTags}
                              </span>
                              <div className="w-full h-1 rounded-full bg-surface-dim overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all duration-300',
                                    entry.status === 'completed' ? 'bg-emerald' : 'bg-cyan-accent'
                                  )}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODO ALTERNATIVO: CAMINO POR ETAPAS (SECUENCIAL CONECTADO)           */}
      {/* ==================================================================== */}
      {viewMode === 'stages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-fadeIn">
          {tracks.map((track, trackIdx) => {
            const trackEntries = moduleEntries.filter((e) => e.track.id === track.id);
            const trackCompleted = trackEntries.reduce((acc, e) => acc + e.completedCount, 0);
            const trackTotal = trackEntries.reduce((acc, e) => acc + e.totalCount, 0);

            return (
              <div
                key={track.id}
                className={cn(
                  'relative flex flex-col gap-3 p-4 rounded-xl border transition-all',
                  selectedTrackId === track.id
                    ? 'bg-surface-card/70 border-primary/40 shadow-sm'
                    : 'bg-surface-dim/55 border-border-subtle/50'
                )}
              >
                {trackIdx < tracks.length - 1 && (
                  <div className="hidden xl:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-surface border border-border-subtle items-center justify-center text-cyan-accent shadow-sm">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pb-2 border-b border-border-subtle/40">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: track.color_accent }}
                    />
                    <span className="text-xs font-bold text-content-primary truncate">
                      Etapa {trackIdx + 1}: {track.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-content-muted shrink-0">
                    {trackCompleted}/{trackTotal}
                  </span>
                </div>

                <div className="relative flex flex-col gap-2.5 pl-3">
                  <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-border-subtle/60 pointer-events-none" />

                  {trackEntries.map((entry) => {
                    const isSelected = activeEntry?.module.id === entry.module.id;
                    return (
                      <button
                        key={entry.module.id}
                        type="button"
                        onClick={() => handleSelectModule(entry)}
                        className={cn(
                          'relative flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all',
                          isSelected
                            ? 'bg-primary/10 border-cyan-accent/50 shadow-sm'
                            : 'bg-surface/60 hover:bg-surface-card border-border-subtle/40 hover:border-border-subtle'
                        )}
                      >
                        <div
                          className={cn(
                            'relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border text-[10px] font-mono font-bold transition-all',
                            entry.status === 'completed'
                              ? 'bg-emerald/20 border-emerald text-emerald shadow-[0_0_10px_rgba(34,197,94,0.35)]'
                              : entry.status === 'active'
                              ? 'bg-cyan-accent/20 border-cyan-accent text-cyan-accent shadow-[0_0_10px_rgba(123,208,255,0.4)]'
                              : 'bg-surface-card border-border-subtle text-content-muted'
                          )}
                        >
                          {entry.status === 'completed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : entry.status === 'active' ? (
                            <Play className="w-2.5 h-2.5 fill-current" />
                          ) : (
                            <span>M{entry.moduleNumber}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-content-primary truncate">
                              {entry.module.title}
                            </span>
                            <span className="text-[10px] font-mono text-content-muted shrink-0">
                              {entry.completedCount}/{entry.totalCount}
                            </span>
                          </div>
                          <div className="mt-1 w-full h-1 rounded-full bg-surface-dim overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-300',
                                entry.status === 'completed' ? 'bg-emerald' : 'bg-cyan-accent'
                              )}
                              style={{
                                width: `${
                                  entry.totalCount > 0
                                    ? Math.round((entry.completedCount / entry.totalCount) * 100)
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* PANEL DE ESTACIONES DEL MÓDULO SELECCIONADO (#Retos del Nodo)        */}
      {/* ==================================================================== */}
      {activeEntry && (
        <div className="p-4 rounded-xl bg-surface-dim/80 border border-border-subtle/60 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-mono text-cyan-accent font-semibold shrink-0">
                Módulo {activeEntry.moduleNumber}:
              </span>
              <span className="text-xs sm:text-sm font-bold text-content-primary truncate">
                {activeEntry.module.title}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="mono" size="sm">
                {activeEntry.track.title}
              </Badge>
              <Badge
                variant={activeEntry.status === 'completed' ? 'emerald' : 'cyan'}
                size="sm"
              >
                {activeEntry.completedCount}/{activeEntry.totalCount} completados
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeEntry.exercises.map((ex) => {
              const done = isExerciseDone(ex);
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => onSelectExercise(ex)}
                  className={cn(
                    'group flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all text-xs',
                    done
                      ? 'bg-emerald/10 border-emerald/35 text-content-primary hover:border-emerald'
                      : 'bg-surface/80 border-border-subtle/60 hover:border-cyan-accent/60 hover:bg-surface-card'
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-content-muted group-hover:text-cyan-accent shrink-0" />
                  )}
                  <span className="font-mono text-[11px] text-content-muted">
                    #{String(ex.sort_order).padStart(2, '0')}
                  </span>
                  <span className="font-medium text-content-primary group-hover:text-cyan-accent transition-colors max-w-[210px] truncate">
                    {ex.title}
                  </span>
                  <span className="text-[10px] font-mono text-amber-streak flex items-center gap-0.5 ml-1">
                    <Zap className="w-3 h-3 fill-amber-streak" />+{ex.xp_reward}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
