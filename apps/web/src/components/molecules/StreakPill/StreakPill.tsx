import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StreakPillProps {
  days: number;
  className?: string;
  isActive?: boolean;
}

export const StreakPill: React.FC<StreakPillProps> = ({
  days,
  className,
  isActive = true,
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full select-none transition-all duration-150',
        'bg-surface-card border border-border-subtle hover:border-amber-streak/40 shadow-sm',
        isActive ? 'shadow-glow-amber/20' : 'opacity-70',
        className
      )}
      title={`Racha activa: ${days} días seguidos resolviendo SQL`}
    >
      <Flame
        className={cn(
          'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
          isActive ? 'text-amber-streak fill-amber-streak animate-pulse' : 'text-content-muted'
        )}
      />
      <span className="font-mono text-xs font-bold text-amber-streak">
        {days}
      </span>
      <span className="text-[11px] font-medium text-content-secondary hidden sm:inline">
        {days === 1 ? 'día' : 'días'}
      </span>
    </div>
  );
};
