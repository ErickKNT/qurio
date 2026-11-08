import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  badge?: string | number;
  className?: string;
}

export const RadioTab: React.FC<RadioTabProps> = ({
  label,
  active,
  onClick,
  icon,
  badge,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 select-none outline-none',
        active
          ? 'bg-surface-card text-content-primary shadow-sm border border-border-subtle text-glow-cyan'
          : 'text-content-secondary hover:text-content-primary hover:bg-surface-card/40 border border-transparent',
        className
      )}
    >
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-accent shadow-glow-cyan shrink-0" />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            'px-1.5 py-0.2 text-[10px] font-mono rounded-full',
            active ? 'bg-primary/20 text-primary-light' : 'bg-surface-hover text-content-muted'
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
};
