import React from 'react';
import { Activity, Info } from 'lucide-react';
import { AttemptStats } from '@/types';

export interface ProfilePrecisionCardProps {
  stats: AttemptStats;
}

export const ProfilePrecisionCard: React.FC<ProfilePrecisionCardProps> = ({ stats }) => {
  const hasData = stats.totalAttempts > 0;
  const passRate = hasData ? Math.round((stats.passedAttempts / stats.totalAttempts) * 100) : 0;
  const speedRate = hasData ? Math.round((stats.fastAttemptsUnder50ms / stats.totalAttempts) * 100) : 0;
  const autonomyRate =
    stats.passedAttempts > 0
      ? Math.round((stats.zeroHintPassedAttempts / stats.passedAttempts) * 100)
      : 0;

  let gradeLabel = 'Sin datos';
  if (hasData) {
    if (passRate >= 90 && autonomyRate >= 80) gradeLabel = 'Grado A+';
    else if (passRate >= 75) gradeLabel = 'Grado A';
    else if (passRate >= 50) gradeLabel = 'Grado B';
    else gradeLabel = 'En progreso';
  }

  const bars = [
    {
      label: 'Consultas aprobadas',
      value: passRate,
      dotClass: 'bg-emerald',
      textClass: 'text-emerald',
      barClass: 'bg-emerald',
    },
    {
      label: 'Consultas rápidas (<50 ms)',
      value: speedRate,
      dotClass: 'bg-cyan-accent',
      textClass: 'text-cyan-accent',
      barClass: 'bg-cyan-accent',
    },
    {
      label: 'Resueltos sin pistas',
      value: autonomyRate,
      dotClass: 'bg-primary',
      textClass: 'text-primary-light',
      barClass: 'bg-primary',
    },
  ];

  return (
    <section className="rounded-2xl bg-surface/70 border border-border-subtle/60 p-5 shadow-md flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald" />
          <h2 className="text-base font-semibold text-content-primary">Precisión SQL</h2>
        </div>
        <span className="font-mono text-xs text-emerald font-semibold uppercase">{gradeLabel}</span>
      </div>

      <div className="flex flex-col gap-3.5">
        {bars.map((item) => (
          <div key={item.label} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-content-primary font-medium flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.dotClass}`} />
                <span>{item.label}</span>
              </span>
              <span className={`font-mono font-semibold ${item.textClass}`}>{item.value}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-dim overflow-hidden border border-border-subtle/40">
              <div
                className={`h-full rounded-full ${item.barClass} transition-all duration-500`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 rounded-xl bg-surface-dim/60 border border-border-subtle/40 flex items-center gap-2 text-[11px] font-mono text-content-muted">
        <Info className="w-3.5 h-3.5 text-cyan-accent shrink-0" />
        <span>
          {hasData
            ? `Basado en ${stats.totalAttempts} ${stats.totalAttempts === 1 ? 'consulta evaluada' : 'consultas evaluadas'}.`
            : 'Envía consultas en cualquier reto para medir tu precisión real.'}
        </span>
      </div>
    </section>
  );
};
