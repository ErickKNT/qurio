import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Check, X } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { AdminBadge } from '@/components/atoms/AdminBadge/AdminBadge';
import { cn } from '@/lib/utils';

export interface KillswitchToggleProps {
  title: string;
  description: string;
  isActive: boolean;
  confirmPrompt?: string;
  actionLabelActivate?: string;
  actionLabelDeactivate?: string;
  isBusy?: boolean;
  onConfirmToggle: (nextState: boolean) => Promise<void> | void;
  className?: string;
}

export const KillswitchToggle: React.FC<KillswitchToggleProps> = ({
  title,
  description,
  isActive,
  confirmPrompt = 'Confirmar cambio de estado operativo en caliente. Las consultas nuevas se verán afectadas de inmediato.',
  actionLabelActivate = 'Activar Interruptor',
  actionLabelDeactivate = 'Restaurar Operación',
  isBusy = false,
  onConfirmToggle,
  className,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleRequestToggle = () => {
    if (isBusy) return;
    setIsConfirming(true);
  };

  const handleConfirm = async () => {
    await onConfirmToggle(!isActive);
    setIsConfirming(false);
  };

  const handleCancel = () => {
    setIsConfirming(false);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-4 rounded-xl border transition-all duration-200',
        isActive
          ? 'bg-error/5 border-error/40 shadow-[0_0_20px_-6px_rgba(239,68,68,0.25)]'
          : 'bg-surface border-border-subtle/80',
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <ShieldAlert className={cn('w-4 h-4 shrink-0', isActive ? 'text-error' : 'text-amber-streak')} />
            <h4 className="text-sm font-semibold text-content-primary">{title}</h4>
            <AdminBadge
              status={isActive ? 'killswitch_active' : 'healthy'}
              label={isActive ? 'KILLSWITCH ACTIVO' : 'OPERATIVO'}
            />
          </div>
          <p className="text-xs text-content-secondary leading-relaxed">{description}</p>
        </div>

        {!isConfirming && (
          <Button
            type="button"
            variant={isActive ? 'secondary' : 'danger'}
            size="sm"
            isLoading={isBusy}
            onClick={handleRequestToggle}
          >
            {isActive ? actionLabelDeactivate : actionLabelActivate}
          </Button>
        )}
      </div>

      {isConfirming && (
        <div
          role="region"
          aria-label={`Confirmación técnica para ${title}`}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-surface-dim border border-amber-streak/40"
        >
          <div className="flex items-start gap-2 text-xs text-content-primary">
            <AlertTriangle className="w-4 h-4 text-amber-streak shrink-0 mt-0.5" />
            <span className="font-mono leading-relaxed">{confirmPrompt}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={handleCancel}
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant={isActive ? 'primary' : 'danger'}
              size="sm"
              isLoading={isBusy}
              onClick={handleConfirm}
              leftIcon={<Check className="w-3.5 h-3.5" />}
            >
              Confirmar {isActive ? 'Desactivación' : 'Activación'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
