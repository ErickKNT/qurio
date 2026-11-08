import React from 'react';
import { cn } from '@/lib/utils';

export interface MetricTileProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  accentColor?: 'primary' | 'cyan' | 'emerald' | 'amber';
  className?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  subValue,
  icon,
  accentColor = 'primary',
  className,
}) => {
  const accentBorderStyles = {
    primary: 'hover:border-primary/50 group-hover:text-primary-light',
    cyan: 'hover:border-cyan-accent/50 group-hover:text-cyan-accent',
    emerald: 'hover:border-emerald/50 group-hover:text-emerald',
    amber: 'hover:border-amber-streak/50 group-hover:text-amber-streak',
  };

  const accentTextStyles = {
    primary: 'text-primary-light',
    cyan: 'text-cyan-accent',
    emerald: 'text-emerald',
    amber: 'text-amber-streak',
  };

  return (
    <div
      className={cn(
        'group flex flex-col justify-between p-4 rounded-xl transition-all duration-200 select-none',
        'bg-surface-card border border-border-subtle shadow-sm',
        accentBorderStyles[accentColor],
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-content-secondary uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className={cn('text-content-muted transition-colors', accentTextStyles[accentColor])}>{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn('font-mono text-2xl font-bold tracking-tight text-content-primary', accentTextStyles[accentColor])}>
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-mono text-content-muted">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};
