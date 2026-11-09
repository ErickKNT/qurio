import React from 'react';
import { cn } from '@/lib/utils';

export interface MetricTileProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  subValue,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        'group flex flex-col justify-between p-3.5 rounded-xl transition-all duration-150 select-none',
        'bg-surface/40 hover:bg-surface/70 border border-border-subtle/50 hover:border-border-subtle',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className="text-content-muted/60 group-hover:text-content-secondary transition-colors">
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
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
