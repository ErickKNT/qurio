import React from 'react';
import { Award, CheckCircle2, Flame, Shield, Terminal, Zap, Lock } from 'lucide-react';
import { Achievement } from '@/types';
import { cn } from '@/lib/utils';

export interface ProfileBadgesShowcaseProps {
  achievements: Achievement[];
  onViewAll?: () => void;
}

const CATEGORY_META: Record<
  Achievement['category'],
  { label: string; gradient: string; accentClass: string }
> = {
  progreso: {
    label: 'Progreso',
    gradient: 'from-primary to-cyan-accent',
    accentClass: 'text-primary-light',
  },
  habilidad: {
    label: 'Habilidad',
    gradient: 'from-cyan-accent to-emerald',
    accentClass: 'text-cyan-accent',
  },
  constancia: {
    label: 'Constancia',
    gradient: 'from-emerald to-amber-streak',
    accentClass: 'text-emerald',
  },
};

function renderBadgeIcon(iconName: string) {
  switch (iconName) {
    case 'flame':
      return <Flame className="w-5 h-5" />;
    case 'zap':
      return <Zap className="w-5 h-5" />;
    case 'shield':
      return <Shield className="w-5 h-5" />;
    case 'check':
      return <CheckCircle2 className="w-5 h-5" />;
    case 'terminal':
      return <Terminal className="w-5 h-5" />;
    default:
      return <Award className="w-5 h-5" />;
  }
}

export const ProfileBadgesShowcase: React.FC<ProfileBadgesShowcaseProps> = ({
  achievements,
  onViewAll,
}) => {
  const unlockedCount = achievements.filter((a) => Boolean(a.unlocked_at)).length;
  const totalCount = achievements.length;

  // Priorizar insignias desbloqueadas primero, completando hasta 6 espacios
  const featured = [...achievements]
    .sort((a, b) => {
      const aUnlocked = a.unlocked_at ? 1 : 0;
      const bUnlocked = b.unlocked_at ? 1 : 0;
      if (aUnlocked !== bUnlocked) return bUnlocked - aUnlocked;
      return b.progress - a.progress;
    })
    .slice(0, 6);

  return (
    <section className="rounded-2xl bg-surface/70 border border-border-subtle/60 p-5 shadow-md flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-accent" />
          <h2 className="text-base font-semibold text-content-primary">Insignias</h2>
        </div>
        <span className="font-mono text-xs text-cyan-accent font-semibold">
          {unlockedCount} / {totalCount}
        </span>
      </div>

      {featured.length === 0 ? (
        <div className="p-4 rounded-xl bg-surface-dim/50 border border-border-subtle/40 text-xs font-mono text-content-muted text-center">
          Resuelve tu primer reto para comenzar a desbloquear medallas técnicas.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {featured.map((ach) => {
            const unlocked = Boolean(ach.unlocked_at);
            const meta = CATEGORY_META[ach.category] || CATEGORY_META.progreso;
            return (
              <div
                key={ach.id}
                title={`${ach.title}: ${ach.description}`}
                className={cn(
                  'flex flex-col items-center text-center p-2.5 rounded-xl border transition-all',
                  unlocked
                    ? 'bg-surface-card/70 border-border-subtle hover:border-cyan-accent/40'
                    : 'bg-surface-dim/40 border-border-subtle/40 opacity-65'
                )}
              >
                <div
                  className={cn(
                    'w-11 h-11 rounded-full flex items-center justify-center mb-2 transition-transform',
                    unlocked
                      ? `bg-gradient-to-tr ${meta.gradient} text-white shadow-sm`
                      : 'bg-surface-card text-content-muted border border-border-subtle'
                  )}
                >
                  {unlocked ? renderBadgeIcon(ach.icon) : <Lock className="w-4 h-4" />}
                </div>
                <span className="font-mono text-[11px] font-semibold text-content-primary line-clamp-1">
                  {ach.title}
                </span>
                <span className={cn('font-mono text-[10px]', unlocked ? meta.accentClass : 'text-content-muted')}>
                  {unlocked ? meta.label : `${Math.round(ach.progress)}%`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="w-full py-2 px-3 rounded-xl bg-surface-dim hover:bg-surface-card border border-border-subtle/60 text-content-secondary hover:text-content-primary font-mono text-[11px] uppercase tracking-wider font-semibold transition-colors text-center"
        >
          Ver Vitrina Completa ({Math.max(0, totalCount - unlockedCount)} por desbloquear)
        </button>
      )}
    </section>
  );
};
