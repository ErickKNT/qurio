import React from 'react';
import {
  Terminal,
  GitBranch,
  Search,
  Flame,
  Award,
  Zap,
  Layers,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Achievement } from '@/types';
import { Badge } from '@/components/atoms';
import { cn } from '@/lib/utils';

export interface AchievementCardProps {
  achievement: Achievement;
  className?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal,
  GitBranch,
  Search,
  Flame,
  Award,
  Zap,
  Layers,
  Sparkles,
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  className,
}) => {
  const isUnlocked = !!achievement.unlocked_at || achievement.progress >= 100;
  const IconComponent = ICON_MAP[achievement.icon] || Award;

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200',
        isUnlocked
          ? 'bg-surface/80 border-border-subtle/80 hover:border-cyan-accent/50 shadow-md'
          : 'bg-surface/30 border-border-subtle/30 opacity-75 hover:opacity-90',
        className
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200',
              isUnlocked
                ? achievement.category === 'habilidad'
                  ? 'bg-primary/15 text-primary dark:text-primary-light border-primary/35 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                  : achievement.category === 'constancia'
                  ? 'bg-amber-streak/15 text-amber-streak border-amber-streak/35 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-cyan-accent/15 text-cyan-600 dark:text-cyan-accent border-cyan-accent/35 shadow-glow-cyan'
                : 'bg-surface-dim text-content-muted border-border-subtle/40'
            )}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-streak bg-amber-streak/10 px-2 py-0.5 rounded border border-amber-streak/20">
              +{achievement.xp_reward} XP
            </span>
            {isUnlocked ? (
              <Badge variant="emerald" dot size="sm">
                Desbloqueado
              </Badge>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-content-muted">
                <Lock className="w-3 h-3" />
                Bloqueado
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h4 className="text-sm font-bold text-content-primary">
            {achievement.title}
          </h4>
          <p className="text-xs text-content-secondary mt-1 leading-relaxed">
            {achievement.description}
          </p>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="mt-4 pt-3 border-t border-border-subtle/30 flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-content-muted capitalize">
            {achievement.category}
          </span>
          <span className="text-content-primary">
            {isUnlocked ? (
              <span className="text-emerald flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Completado
              </span>
            ) : (
              `${achievement.current_value}/${achievement.required_threshold} ${achievement.unit}`
            )}
          </span>
        </div>

        {!isUnlocked && (
          <div className="w-full h-1.5 rounded-full bg-surface-dim overflow-hidden border border-border-subtle/20">
            <div
              className="h-full rounded-full bg-cyan-accent transition-all duration-300"
              style={{ width: `${Math.min(achievement.progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
