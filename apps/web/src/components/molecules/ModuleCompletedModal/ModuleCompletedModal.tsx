import React, { useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Zap,
  ArrowRight,
  Award,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { Button, Badge } from '@/components/atoms';
import { ModuleCompletionSummary } from '@/lib/progress';
import { cn } from '@/lib/utils';

export interface ModuleCompletedModalProps {
  isOpen: boolean;
  summary: ModuleCompletionSummary | null;
  lastXpAwarded?: number;
  onClose: () => void;
  onContinueNextModule: () => void;
  onViewTracks: () => void;
  className?: string;
}

/**
 * Modal de cierre de módulo (y de ruta cuando aplica) dentro del workspace del IDE.
 * Mantiene al usuario en contexto y evita transiciones silenciosas entre módulos.
 */
export const ModuleCompletedModal: React.FC<ModuleCompletedModalProps> = ({
  isOpen,
  summary,
  lastXpAwarded = 0,
  onClose,
  onContinueNextModule,
  onViewTracks,
  className,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !summary) return null;

  const {
    completedModule,
    track,
    moduleTotalExercises,
    moduleTotalXp,
    trackCompletedCount,
    trackTotalCount,
    trackPercent,
    isTrackCompleted,
    nextModule,
    nextExercise,
  } = summary;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="module-completed-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'relative w-full max-w-md p-6 sm:p-7 rounded-2xl bg-surface-card border border-emerald/40 shadow-glow-emerald flex flex-col gap-5 overflow-hidden animate-scaleUp',
          className
        )}
      >
        <div className="pointer-events-none absolute -top-20 -left-20 w-44 h-44 bg-emerald/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-44 h-44 bg-cyan-accent/10 rounded-full blur-3xl" />

        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald" dot size="sm">
                {isTrackCompleted ? 'Ruta completada' : 'Módulo completado'}
              </Badge>
              {track && (
                <Badge variant="mono" size="sm">
                  {track.title}
                </Badge>
              )}
            </div>
            <h2
              id="module-completed-title"
              className="text-xl font-bold tracking-tight text-content-primary flex items-center gap-2"
            >
              {isTrackCompleted ? (
                <Award className="w-5 h-5 text-amber-streak shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald shrink-0" />
              )}
              <span>
                {isTrackCompleted
                  ? `Terminaste ${track?.title || completedModule.title}`
                  : `Cerraste ${completedModule.title}`}
              </span>
            </h2>
            <p className="text-xs text-content-secondary leading-relaxed">
              {isTrackCompleted
                ? `Con "${completedModule.title}" completaste los ${trackTotalCount} retos de esta ruta. Ya puedes revisar tu constancia o seguir con el siguiente bloque.`
                : `Resolviste los ${moduleTotalExercises} retos de este módulo. Tu base en este tema quedó cubierta.`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bento Micro-Tiles de Progreso */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="p-3 rounded-xl bg-surface/70 border border-border-subtle/80 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-emerald text-xs font-mono font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" />
              <span>
                {moduleTotalExercises} / {moduleTotalExercises} retos
              </span>
            </div>
            <span className="text-[11px] text-content-muted font-mono">
              {trackCompletedCount} / {trackTotalCount} en la ruta ({trackPercent}%)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface/70 border border-border-subtle/80 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-amber-streak text-xs font-mono font-semibold">
              <Zap className="w-4 h-4 fill-current shrink-0" />
              <span>{moduleTotalXp} XP del módulo</span>
            </div>
            <span className="text-[11px] text-content-muted font-mono">
              {lastXpAwarded > 0 ? `+${lastXpAwarded} XP en este reto` : 'Progreso guardado'}
            </span>
          </div>
        </div>

        {/* Vista previa del siguiente módulo */}
        {nextModule && nextExercise && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-surface to-emerald/[0.04] border border-border-subtle/80 text-xs flex flex-col gap-1.5 relative z-10">
            <div className="flex items-center gap-1.5 text-cyan-accent font-semibold text-[11px] uppercase tracking-wider font-mono">
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>{isTrackCompleted ? 'Siguiente ruta disponible' : 'Siguiente módulo'}</span>
            </div>
            <p className="text-sm font-semibold text-content-primary">{nextModule.title}</p>
            {nextModule.description && (
              <p className="text-[11px] text-content-secondary leading-relaxed">
                {nextModule.description}
              </p>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 pt-1 relative z-10">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            className="sm:flex-1"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Revisar consulta
          </Button>

          {isTrackCompleted ? (
            <Button
              variant="emerald"
              size="md"
              onClick={onViewTracks}
              className="sm:flex-1"
              rightIcon={<Award className="w-4 h-4" />}
            >
              Ver rutas y constancia
            </Button>
          ) : nextModule && nextExercise ? (
            <Button
              variant="emerald"
              size="md"
              onClick={onContinueNextModule}
              className="sm:flex-1"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continuar al siguiente módulo
            </Button>
          ) : (
            <Button
              variant="emerald"
              size="md"
              onClick={onViewTracks}
              className="sm:flex-1"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Ver rutas
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
