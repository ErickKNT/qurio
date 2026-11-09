import React from 'react';
import { Zap, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { Badge } from '@/components/atoms/Badge/Badge';

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextExercise?: () => void;
  xpAwarded: number;
  exerciseTitle: string;
  executionTimeMs: number;
  hintsUsed?: number;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  onNextExercise,
  xpAwarded,
  exerciseTitle,
  executionTimeMs,
  hintsUsed = 0,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-surface border border-emerald/50 p-6 shadow-glow-emerald flex flex-col items-center text-center animate-scaleUp">
        {/* Glow de fondo */}
        <div className="absolute -top-12 w-48 h-48 rounded-full bg-emerald/20 blur-3xl pointer-events-none" />

        {/* Isotipo / Medalla de Éxito */}
        <div className="relative w-16 h-16 rounded-2xl bg-emerald/10 border border-emerald/40 flex items-center justify-center mb-4 shadow-sm">
          <CheckCircle2 className="w-9 h-9 text-emerald animate-pulse" />
        </div>

        <Badge variant="emerald" dot size="md" className="mb-2">
          SOLUCIÓN SEMÁNTICAMENTE VÁLIDA
        </Badge>

        <h2 className="text-xl font-extrabold text-content-primary tracking-tight">
          ¡Reto Superado!
        </h2>

        <p className="text-xs text-content-secondary mt-1 max-w-sm">
          Tu consulta sobre <span className="text-content-primary font-medium font-mono">"{exerciseTitle}"</span> devolvió la proyección, tipos y cardinalidad exactos.
        </p>

        {/* Panel de Recompensa XP & Métricas */}
        <div className="grid grid-cols-2 gap-3 w-full my-5 p-4 rounded-xl bg-surface-card border border-border-subtle">
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-dim border border-border-subtle/50">
            <span className="text-[10px] font-mono text-content-muted uppercase">Experiencia Ganada</span>
            <div className="flex items-center gap-1.5 mt-0.5 text-amber-streak">
              <Zap className="w-4 h-4 fill-amber-streak" />
              <span className="text-xl font-mono font-extrabold">+{xpAwarded} XP</span>
            </div>
            {hintsUsed > 0 && (
              <span className="text-[9px] font-mono text-content-muted mt-0.5">
                ({hintsUsed} pista{hintsUsed > 1 ? 's' : ''} usada{hintsUsed > 1 ? 's' : ''})
              </span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-dim border border-border-subtle/50">
            <span className="text-[10px] font-mono text-content-muted uppercase">Tiempo en Sandbox</span>
            <span className="text-xl font-mono font-extrabold text-cyan-accent mt-0.5">
              {executionTimeMs.toFixed(1)}ms
            </span>
            <span className="text-[9px] font-mono text-emerald mt-0.5">statement_timeout ok</span>
          </div>
        </div>

        {/* Botones de Acción Inmediata (Anti-AI Slop) */}
        <div className="flex items-center gap-3 w-full">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            Revisar Query
          </Button>

          {onNextExercise && (
            <Button
              variant="emerald"
              size="md"
              className="flex-1"
              onClick={onNextExercise}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Siguiente Reto
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
