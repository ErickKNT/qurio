import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'cyan' | 'emerald' | 'amber' | 'error' | 'mono';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-mono font-medium rounded-full select-none tracking-wider';

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    default: 'bg-surface-card text-content-secondary border border-border-subtle',
    cyan: 'bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/30',
    emerald: 'bg-emerald/10 text-emerald border border-emerald/30',
    amber: 'bg-amber-streak/10 text-amber-streak border border-amber-streak/30',
    error: 'bg-error-container/30 text-error border border-error/30',
    mono: 'bg-surface-dim text-content-primary border border-white/10 font-mono',
  };

  const dotColors = {
    default: 'bg-content-muted',
    cyan: 'bg-cyan-accent shadow-glow-cyan',
    emerald: 'bg-emerald shadow-glow-emerald',
    amber: 'bg-amber-streak shadow-glow-amber',
    error: 'bg-error',
    mono: 'bg-white',
  };

  return (
    <span className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)} {...props}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
};
