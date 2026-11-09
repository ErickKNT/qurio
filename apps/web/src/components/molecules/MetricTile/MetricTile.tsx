import React from 'react';
import { cn } from '@/lib/utils';

export type MetricAccent = 'purple' | 'indigo' | 'amber' | 'cyan' | 'emerald';

export interface MetricTileProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  accent?: MetricAccent;
  className?: string;
}

const ACCENT_CONFIG: Record<
  MetricAccent,
  { iconBg: string; hoverBorder: string; glow: string }
> = {
  purple: {
    iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
    hoverBorder: 'hover:border-purple-500/40',
    glow: 'group-hover:shadow-[0_0_15px_-3px_rgba(168,85,247,0.15)]',
  },
  indigo: {
    iconBg: 'bg-primary/10 text-primary dark:text-primary-light border-primary/25',
    hoverBorder: 'hover:border-primary/40',
    glow: 'group-hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.15)]',
  },
  amber: {
    iconBg: 'bg-amber-streak/10 text-amber-streak border-amber-streak/25',
    hoverBorder: 'hover:border-amber-streak/40',
    glow: 'group-hover:shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)]',
  },
  cyan: {
    iconBg: 'bg-cyan-accent/10 text-cyan-600 dark:text-cyan-accent border-cyan-accent/25',
    hoverBorder: 'hover:border-cyan-accent/40',
    glow: 'group-hover:shadow-[0_0_15px_-3px_rgba(2,132,199,0.15)]',
  },
  emerald: {
    iconBg: 'bg-emerald/10 text-emerald-600 dark:text-emerald border-emerald/25',
    hoverBorder: 'hover:border-emerald/40',
    glow: 'group-hover:shadow-[0_0_15px_-3px_rgba(34,197,94,0.15)]',
  },
};

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  subValue,
  icon,
  accent,
  className,
}) => {
  const accentStyle = accent ? ACCENT_CONFIG[accent] : null;

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between p-4 rounded-xl transition-all duration-200 select-none overflow-hidden',
        'bg-surface/60 hover:bg-surface border border-border-subtle/60 shadow-sm',
        accentStyle ? `${accentStyle.hoverBorder} ${accentStyle.glow}` : 'hover:border-border-subtle',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider font-medium">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              'p-1.5 rounded-lg border flex items-center justify-center transition-all duration-200 group-hover:scale-105',
              accentStyle
                ? accentStyle.iconBg
                : 'bg-surface-card text-content-muted border-border-subtle/50 group-hover:text-content-secondary'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-xl font-bold tracking-tight text-content-primary">
          {value}
        </span>
        {subValue && (
          <span className="text-[10px] font-mono text-content-muted">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};
