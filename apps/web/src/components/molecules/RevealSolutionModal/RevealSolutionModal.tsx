import React from 'react';
import { X, Unlock, AlertTriangle } from 'lucide-react';
import { Button, Badge } from '@/components/atoms';
import { cn } from '@/lib/utils';

export interface RevealSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReveal: () => void;
  exerciseTitle: string;
  failedAttempts: number;
  isLoading?: boolean;
  className?: string;
}

export const RevealSolutionModal: React.FC<RevealSolutionModalProps> = ({
  isOpen,
  onClose,
  onConfirmReveal,
  exerciseTitle,
  failedAttempts,
  isLoading = false,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reveal-solution-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        className={cn(
          'relative w-full max-w-md p-6 sm:p-7 rounded-2xl bg-surface-card border border-amber-streak/40 shadow-glow-amber flex flex-col gap-5 overflow-hidden',
          className
        )}
      >
        {/* Resplandor decorativo sutil en la esquina */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-44 h-44 bg-amber-streak/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-44 h-44 bg-primary/10 rounded-full blur-3xl" />

        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="amber" dot size="sm">
                Apoyo Pedagógico
              </Badge>
              <Badge variant="mono" size="sm">
                {failedAttempts} {failedAttempts === 1 ? 'intento fallido' : 'intentos fallidos'}
              </Badge>
            </div>
            <h2
              id="reveal-solution-title"
              className="text-lg sm:text-xl font-bold tracking-tight text-content-primary flex items-center gap-2"
            >
              <span>Desbloquear Solución Oficial</span>
              <Unlock className="w-5 h-5 text-amber-streak shrink-0" />
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface transition-colors disabled:opacity-50"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reto Afectado */}
        <div className="p-3 rounded-xl bg-surface/70 border border-border-subtle/80 flex flex-col gap-1 relative z-10">
          <span className="text-[11px] font-mono text-content-muted uppercase">Reto en curso:</span>
          <span className="text-xs sm:text-sm font-semibold text-content-primary">
            {exerciseTitle}
          </span>
        </div>

        {/* Advertencias y Condiciones */}
        <div className="flex flex-col gap-3 relative z-10 text-xs text-content-secondary leading-relaxed">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-streak/10 border border-amber-streak/25 text-amber-streak">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-xs text-content-primary">
                Condiciones de desbloqueo:
              </span>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-content-secondary">
                <li>
                  Este reto otorgará <strong className="text-amber-streak font-mono">0 XP</strong> oficiales en tu perfil.
                </li>
                <li>
                  La acción se registrará en la telemetría docente de Qurio para analizar qué retos presentan mayor dificultad y mejorarlos.
                </li>
                <li>
                  Podrás examinar la consulta SQL completa y cargarla directamente en el editor para comprender su lógica.
                </li>
              </ul>
            </div>
          </div>

          <p className="text-[11px] text-content-muted">
            Nuestro objetivo no es frustrarte, sino ayudarte a comprender cómo se estructura la consulta cuando te atascas.
          </p>
        </div>

        {/* Acciones del Modal */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-border-subtle/40 relative z-10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto text-xs"
          >
            Seguir intentando solo
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirmReveal}
            isLoading={isLoading}
            leftIcon={<Unlock className="w-3.5 h-3.5" />}
            className="w-full sm:w-auto text-xs bg-amber-streak text-canvas font-bold hover:bg-amber-streak/90 shadow-glow-amber border-transparent"
          >
            Revelar Solución Oficial
          </Button>
        </div>
      </div>
    </div>
  );
};
