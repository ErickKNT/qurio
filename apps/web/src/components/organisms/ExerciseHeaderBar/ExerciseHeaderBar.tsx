import React from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Sun,
  Moon,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Button, Select } from '@/components/atoms';
import { StreakPill } from '@/components/molecules';
import { Exercise, Track, UserProfile } from '@/types';

export interface ExerciseHeaderBarProps {
  activeExercise: Exercise;
  exercises: Exercise[];
  currentExerciseIndex: number;
  tracks: Track[];
  isAuthenticated: boolean;
  profile: UserProfile | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onSelectExercise: (index: number, replace?: boolean) => void;
  onNavigateTracks: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const ExerciseHeaderBar: React.FC<ExerciseHeaderBarProps> = ({
  activeExercise,
  exercises,
  currentExerciseIndex,
  tracks,
  isAuthenticated,
  profile,
  isDark,
  onToggleTheme,
  onSelectExercise,
  onNavigateTracks,
  onOpenAuth,
  onSignOut,
}) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          onClick={onNavigateTracks}
        >
          Rutas
        </Button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-content-muted">
          <span>
            {tracks.find((t) => t.modules?.some((m) => m.id === activeExercise.module_id))
              ?.title || 'Fundamentos de SQL'}
          </span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-content-primary font-medium">{activeExercise.title}</span>
        </div>
      </div>

      {/* Selector Rápido de Ejercicios */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-content-muted hidden md:inline">Reto:</span>
        <Select<number>
          value={currentExerciseIndex}
          onChange={(idx) => onSelectExercise(idx, true)}
          aria-label="Seleccionar reto"
          className="min-w-[180px] max-w-[260px]"
          menuClassName="right-0 left-auto w-72"
          options={exercises.map((ex, idx) => ({
            value: idx,
            label: `#${idx + 1} ${ex.title}`,
          }))}
        />

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-dim border border-border-subtle text-[11px] font-mono text-emerald">
          <span className="w-2 h-2 rounded-full bg-emerald" />
          <span>Sandbox Online</span>
        </div>

        {/* Contador de Racha Activa del Estudiante */}
        {isAuthenticated && (
          <StreakPill
            days={profile?.current_streak_days ?? 0}
            isActive={(profile?.current_streak_days ?? 0) > 0}
            className="py-1 px-2.5 text-xs"
          />
        )}

        <button
          type="button"
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-card transition-colors"
          title={isDark ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
          aria-label="Alternar tema visual"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-streak" /> : <Moon className="w-3.5 h-3.5 text-primary" />}
        </button>

        {/* Gestión de Sesión: Invitado vs Autenticado */}
        {!isAuthenticated ? (
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAuth}
            leftIcon={<LogIn className="w-3.5 h-3.5" />}
            className="text-xs py-1 px-3 ml-1 shadow-glow-primary"
          >
            Iniciar Sesión
          </Button>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-border-subtle/50">
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-2 text-xs font-mono text-content-primary hover:text-cyan-accent transition-colors"
              title="Mi Cuenta Supabase"
            >
              <div className="relative">
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'user'}`}
                  alt={`Avatar de ${profile?.username || 'Usuario'}`}
                  className="w-6 h-6 rounded-full object-cover border border-emerald/50"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald" />
              </div>
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="font-bold text-[11px] truncate max-w-[110px]">{profile?.username || 'Usuario'}</span>
                <span className="text-[10px] text-amber-streak font-mono font-medium">{profile?.total_xp ?? 0} XP</span>
              </div>
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="p-1 rounded text-content-muted hover:text-error hover:bg-surface-card transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
