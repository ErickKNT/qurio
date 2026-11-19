import React from 'react';
import { X, CheckCircle2, Zap, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Button, Badge } from '@/components/atoms';
import { cn } from '@/lib/utils';

export interface GuestTrialCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignUp: () => void;
  onOpenSignIn: () => void;
  solvedCount?: number;
  remainingCount?: number;
  earnedXp?: number;
  className?: string;
}

export const GuestTrialCompleteModal: React.FC<GuestTrialCompleteModalProps> = ({
  isOpen,
  onClose,
  onOpenSignUp,
  onOpenSignIn,
  solvedCount = 3,
  remainingCount = 57,
  earnedXp = 100,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trial-complete-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'relative w-full max-w-md p-6 sm:p-7 rounded-2xl bg-surface-card border border-border-subtle shadow-glow-emerald flex flex-col gap-5 overflow-hidden',
          className
        )}
      >
        {/* Resplandor decorativo sutil en la esquina */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-44 h-44 bg-emerald/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-44 h-44 bg-cyan-accent/10 rounded-full blur-3xl" />

        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" dot size="sm">
                Prueba superada
              </Badge>
              <Badge variant="mono" size="sm">
                Modo invitado
              </Badge>
            </div>
            <h2
              id="trial-complete-title"
              className="text-xl font-bold tracking-tight text-content-primary flex items-center gap-2"
            >
              <span>Completaste la prueba inicial</span>
              <Sparkles className="w-5 h-5 text-amber-streak shrink-0" />
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface transition-colors"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bento Micro-Tiles de Métricas Obtenidas */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="p-3 rounded-xl bg-surface/70 border border-border-subtle/80 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-emerald text-xs font-mono font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" />
              <span>{solvedCount} / {solvedCount} Retos</span>
            </div>
            <span className="text-[11px] text-content-muted font-mono">
              Fundamentos SELECT
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface/70 border border-border-subtle/80 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-amber-streak text-xs font-mono font-semibold">
              <Zap className="w-4 h-4 fill-current shrink-0" />
              <span>+{earnedXp} XP ganados</span>
            </div>
            <span className="text-[11px] text-content-muted font-mono">
              Guardados en sesión
            </span>
          </div>
        </div>

        {/* Tarjeta Explicativa de Valor */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-surface to-emerald/[0.04] border border-border-subtle/80 text-xs text-content-secondary leading-relaxed flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-1.5 text-content-primary font-semibold text-[11px] uppercase tracking-wider font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald" />
            <span>Progreso listo para guardar</span>
          </div>
          <p>
            Ya resolviste los primeros retos con proyecciones, alias y cálculos. Tus <strong className="text-content-primary font-mono">+{earnedXp} XP</strong> están guardados en este navegador.
          </p>
          <p className="text-content-muted text-[11px]">
            Crea una cuenta gratis para guardar tu XP en la nube, llevar tu racha diaria y abrir los <strong className="text-cyan-accent">{remainingCount} retos restantes</strong> del temario.
          </p>
        </div>

        {/* Acciones de Conversión */}
        <div className="flex flex-col gap-3 pt-1 relative z-10">
          <Button
            variant="emerald"
            onClick={onOpenSignUp}
            className="w-full justify-center text-xs sm:text-sm font-semibold shadow-glow-emerald"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Crear cuenta gratis
          </Button>

          <div className="flex items-center justify-between text-xs font-mono text-content-muted px-1">
            <span>¿Ya tienes cuenta?</span>
            <button
              type="button"
              onClick={onOpenSignIn}
              className="text-cyan-accent hover:underline font-semibold transition-colors"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
