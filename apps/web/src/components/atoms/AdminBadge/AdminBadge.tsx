import React from 'react';
import { cn } from '@/lib/utils';
import { AdminStatusVariant } from '@/types/admin';

export interface AdminBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: AdminStatusVariant;
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const STATUS_MAP: Record<
  AdminStatusVariant,
  { defaultLabel: string; container: string; dot: string }
> = {
  healthy: {
    defaultLabel: 'HEALTHY',
    container: 'bg-emerald/10 text-emerald border border-emerald/35',
    dot: 'bg-emerald shadow-glow-emerald',
  },
  warning: {
    defaultLabel: 'WARNING',
    container: 'bg-amber-streak/10 text-amber-streak border border-amber-streak/35',
    dot: 'bg-amber-streak shadow-glow-amber',
  },
  critical: {
    defaultLabel: 'CRITICAL',
    container: 'bg-error/10 text-error border border-error/40',
    dot: 'bg-error',
  },
  killswitch_active: {
    defaultLabel: 'KILLSWITCH ACTIVE',
    container: 'bg-error-container/35 text-error border border-error/50 shadow-[0_0_12px_-3px_rgba(239,68,68,0.45)]',
    dot: 'bg-error animate-pulse',
  },
};

export const AdminBadge: React.FC<AdminBadgeProps> = ({
  status,
  label,
  size = 'sm',
  pulse = false,
  className,
  children,
  ...props
}) => {
  const cfg = STATUS_MAP[status];
  const sizeStyles = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1.5' : 'text-xs px-2.5 py-1 gap-2';

  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center font-mono font-semibold uppercase tracking-wider rounded-full select-none',
        sizeStyles,
        cfg.container,
        className
      )}
      {...props}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot, pulse && 'animate-pulse')} />
      {children ?? label ?? cfg.defaultLabel}
    </span>
  );
};
