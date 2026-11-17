import React from 'react';
import { cn } from '@/lib/utils';

export type AdminMetricAccent = 'cyan' | 'emerald' | 'amber' | 'error' | 'indigo';

export interface AdminMetricTileProps {
  label: string;
  value: string | number;
  unit?: string;
  subLabel?: string;
  icon?: React.ReactNode;
  accent?: AdminMetricAccent;
  className?: string;
}

const ACCENT_STYLES: Record<AdminMetricAccent, { border: string; iconBox: string; valueText: string }> = {
  cyan: {
    border: 'hover:border-cyan-accent/50 hover:shadow-glow-cyan',
    iconBox: 'bg-cyan-accent/10 text-cyan-accent border-cyan-accent/30',
    valueText: 'text-content-primary',
  },
  emerald: {
    border: 'hover:border-emerald/50 hover:shadow-glow-emerald',
    iconBox: 'bg-emerald/10 text-emerald border-emerald/30',
    valueText: 'text-emerald',
  },
  amber: {
    border: 'hover:border-amber-streak/50 hover:shadow-glow-amber',
    iconBox: 'bg-amber-streak/10 text-amber-streak border-amber-streak/30',
    valueText: 'text-amber-streak',
  },
  error: {
    border: 'hover:border-error/50 hover:shadow-[0_0_16px_-4px_rgba(239,68,68,0.25)]',
    iconBox: 'bg-error/10 text-error border-error/30',
    valueText: 'text-error',
  },
  indigo: {
    border: 'hover:border-primary/50 hover:shadow-glow-primary',
    iconBox: 'bg-primary/10 text-primary dark:text-primary-light border-primary/30',
    valueText: 'text-content-primary',
  },
};

export const AdminMetricTile: React.FC<AdminMetricTileProps> = ({
  label,
  value,
  unit,
  subLabel,
  icon,
  accent = 'cyan',
  className,
}) => {
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      className={cn(
        'flex flex-col justify-between p-4 rounded-xl bg-surface border border-border-subtle/80 transition-all duration-200',
        styles.border,
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-content-muted font-medium">
          {label}
        </span>
        {icon && (
          <div className={cn('p-1.5 rounded-lg border flex items-center justify-center', styles.iconBox)}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className={cn('text-2xl font-mono font-bold tabular-nums tracking-tight', styles.valueText)}>
          {value}
        </span>
        {unit && <span className="text-xs font-mono text-content-muted">{unit}</span>}
      </div>

      {subLabel && (
        <span className="mt-1.5 text-[11px] font-mono text-content-secondary truncate">
          {subLabel}
        </span>
      )}
    </div>
  );
};
