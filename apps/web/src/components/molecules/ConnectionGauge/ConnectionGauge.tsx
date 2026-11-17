import React from 'react';
import { Database } from 'lucide-react';
import { AdminPoolMetrics } from '@/types/admin';
import { AdminBadge } from '@/components/atoms/AdminBadge/AdminBadge';
import { cn } from '@/lib/utils';

export interface ConnectionGaugeProps {
  pool: AdminPoolMetrics;
  className?: string;
}

export const ConnectionGauge: React.FC<ConnectionGaugeProps> = ({ pool, className }) => {
  const max = Math.max(1, pool.max_size);
  const activePct = Math.min(100, Math.round((pool.active_connections / max) * 100));
  const idlePct = Math.min(100 - activePct, Math.round((pool.idle_connections / max) * 100));

  const status = !pool.initialized
    ? 'critical'
    : activePct >= 80 || pool.queued_requests > 0
    ? 'warning'
    : 'healthy';

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-4 rounded-xl bg-surface border border-border-subtle/80',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-accent" />
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-content-primary">
            Pool asyncpg (PostgreSQL Sandbox)
          </span>
        </div>
        <AdminBadge
          status={status}
          label={pool.initialized ? `${pool.total_connections}/${pool.max_size} CONEXIONES` : 'NO INICIALIZADO'}
        />
      </div>

      {/* Barra segmentada: Activas vs Inactivas vs Capacidad libre */}
      <div
        role="progressbar"
        aria-valuenow={pool.active_connections}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label="Uso de conexiones del pool asyncpg"
        className="w-full h-3 rounded-full bg-surface-dim border border-border-subtle/60 overflow-hidden flex"
      >
        <div
          className="h-full bg-cyan-accent transition-all duration-300"
          style={{ width: `${activePct}%` }}
          title={`Activas: ${pool.active_connections}`}
        />
        <div
          className="h-full bg-emerald/60 transition-all duration-300"
          style={{ width: `${idlePct}%` }}
          title={`Inactivas (Idle): ${pool.idle_connections}`}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-content-secondary">
          <span className="w-2 h-2 rounded-full bg-cyan-accent shrink-0" />
          <span>Activas:</span>
          <strong className="text-content-primary tabular-nums">{pool.active_connections}</strong>
        </div>
        <div className="flex items-center gap-1.5 text-content-secondary">
          <span className="w-2 h-2 rounded-full bg-emerald/70 shrink-0" />
          <span>Idle:</span>
          <strong className="text-content-primary tabular-nums">{pool.idle_connections}</strong>
        </div>
        <div className="flex items-center gap-1.5 text-content-secondary">
          <span>Cola:</span>
          <strong className={cn('tabular-nums', pool.queued_requests > 0 ? 'text-amber-streak' : 'text-content-primary')}>
            {pool.queued_requests}
          </strong>
        </div>
        <div className="flex items-center gap-1.5 text-content-secondary">
          <span>Rango:</span>
          <strong className="text-content-primary tabular-nums">
            {pool.min_size}–{pool.max_size}
          </strong>
        </div>
      </div>
    </div>
  );
};
