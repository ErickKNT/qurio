import React, { useState } from 'react';
import { Award, Zap } from 'lucide-react';
import { Achievement, AchievementCategory } from '@/types';
import { AchievementCard } from '@/components/molecules/AchievementCard/AchievementCard';
import { RadioTab } from '@/components/atoms';

export interface AchievementsViewProps {
  achievements: Achievement[];
  totalXp?: number;
  level?: number;
  className?: string;
}

const CATEGORIES: { id: AchievementCategory; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'progreso', label: 'Progreso' },
  { id: 'habilidad', label: 'Habilidad SQL' },
  { id: 'constancia', label: 'Constancia & Racha' },
];

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  achievements,
  totalXp = 0,
  level = 1,
}) => {
  const [activeCategory, setActiveCategory] = useState<AchievementCategory>('todos');

  const unlockedCount = achievements.filter((a) => !!a.unlocked_at || a.progress >= 100).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const filteredAchievements = achievements.filter((a) => {
    if (activeCategory === 'todos') return true;
    return a.category === activeCategory;
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Top Banner / Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-7 rounded-2xl bg-surface/70 border border-border-subtle/60 shadow-lg">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-surface-card/60 border border-border-subtle/50 w-fit text-[11px] font-mono text-cyan-accent">
            <Award className="w-3 h-3" />
            <span>Sistema de Reconocimiento Técnico</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Logros & Rangos de Ingeniería
          </h1>

          <p className="text-xs text-content-secondary leading-relaxed">
            Desbloquea insignias especializadas resolviendo retos relacionales, optimizando consultas y manteniendo tu cadencia diaria.
          </p>
        </div>

        {/* Gamification Stats Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-dim/70 border border-border-subtle/40 shrink-0 font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-content-muted">
              Medallas Obtenidas
            </span>
            <span className="text-xl font-bold text-content-primary">
              {unlockedCount} / {totalCount}
            </span>
            <span className="text-[11px] text-cyan-accent">
              {progressPercent}% completado
            </span>
          </div>

          <div className="w-px h-10 bg-border-subtle/40" />

          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-content-muted">
              XP Acumulado
            </span>
            <span className="text-xl font-bold text-amber-accent flex items-center gap-1">
              <Zap className="w-4 h-4 fill-amber-accent/30" />
              +{totalXp}
            </span>
            <span className="text-[11px] text-content-secondary">
              Nivel {level} Activo
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {CATEGORIES.map((cat) => (
            <RadioTab
              key={cat.id}
              label={cat.label}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>

        <span className="text-xs font-mono text-content-muted">
          Mostrando {filteredAchievements.length} de {totalCount} logros
        </span>
      </div>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredAchievements.map((ach) => (
          <AchievementCard key={ach.id} achievement={ach} />
        ))}
      </div>
    </div>
  );
};
