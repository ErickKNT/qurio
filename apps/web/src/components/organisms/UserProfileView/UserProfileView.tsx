import React from 'react';
import {
  Zap,
  Flame,
  Award,
  Terminal,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Code2,
  UserCheck,
} from 'lucide-react';
import { UserProfile, QueryHistoryItem } from '@/types';
import { Badge, Button } from '@/components/atoms';
import { MetricTile } from '@/components/molecules/MetricTile/MetricTile';

export interface UserProfileViewProps {
  profile: UserProfile | null;
  history: QueryHistoryItem[];
  onOpenPlayground?: () => void;
  onOpenAuth?: () => void;
  isCloudAuth?: boolean;
  className?: string;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  profile,
  history,
  onOpenPlayground,
  onOpenAuth,
  isCloudAuth = false,
}) => {
  const currentXp = profile?.total_xp || 480;
  const currentLevel = profile?.current_level || 2;
  const nextLevelXp = 1000;
  const levelProgress = Math.min(Math.round((currentXp / nextLevelXp) * 100), 100);

  // 30 days dummy heatmap data (some active days, some empty)
  const heatmapDays = Array.from({ length: 30 }, (_, i) => {
    // Generate some activity dots
    const dayNumber = i + 1;
    const isToday = dayNumber === 30;
    const isYesterday = dayNumber === 29;
    const isActive = isToday || isYesterday || [3, 4, 8, 12, 15, 19, 22, 25].includes(dayNumber);
    const count = isToday ? 5 : isYesterday ? 3 : isActive ? Math.floor((dayNumber % 4) + 1) : 0;
    return { day: dayNumber, count };
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Profile Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-7 rounded-2xl bg-surface/70 border border-border-subtle/60 shadow-lg">
        <div className="flex items-center gap-5">
          <img
            src={
              profile?.avatar_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop'
            }
            alt={`Avatar de ${profile?.username || 'Usuario'}`}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-border-subtle shadow-md"
          />

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-content-primary">
                {profile?.username || 'Erick KNT'}
              </h1>
              <Badge variant="cyan" dot size="sm">
                Nivel {currentLevel}
              </Badge>
              {isCloudAuth ? (
                <Badge variant="emerald" dot size="sm">
                  Supabase Cloud
                </Badge>
              ) : (
                <Badge variant="amber" size="sm">
                  Local / Offline
                </Badge>
              )}
            </div>

            <p className="text-xs text-content-secondary font-mono">
              {profile?.full_name || profile?.username || 'Estudiante'} • {isCloudAuth ? 'Sesión JWT Autenticada' : 'Modo Demostración'}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] font-mono text-content-muted">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-content-muted" />
                Miembro desde Nov 2026
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sandbox Aislado Conectado
              </span>
            </div>

            {onOpenAuth && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenAuth}
                  className="text-xs"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  <span>{isCloudAuth ? 'Gestionar Cuenta / Sesión' : 'Iniciar Sesión en Supabase'}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Level & XP Progression Card */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-dim/70 border border-border-subtle/50 min-w-[240px] font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-content-muted uppercase tracking-wider">
              Nivel {currentLevel} • Junior Query Builder
            </span>
            <span className="font-bold text-amber-streak flex items-center gap-1">
              <Zap className="w-3 h-3 fill-amber-streak" />
              {currentXp} / {nextLevelXp} XP
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-surface overflow-hidden border border-border-subtle/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-500 to-cyan-accent transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>

          <span className="text-[10px] text-content-muted text-right">
            Faltan {nextLevelXp - currentXp} XP para Nivel 3 (Relational Specialist)
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Retos Completados"
          value="12 / 50"
          subValue="24% del currículum"
          icon={<Award className="w-4 h-4" />}
          accent="purple"
        />
        <MetricTile
          label="Racha Actual"
          value={`${profile?.current_streak_days || 2} días`}
          subValue="Objetivo: 7 días"
          icon={<Flame className="w-4 h-4" />}
          accent="amber"
        />
        <MetricTile
          label="Racha Récord"
          value={`${profile?.max_streak_days || 5} días`}
          subValue="Máxima histórica"
          icon={<Zap className="w-4 h-4" />}
          accent="indigo"
        />
        <MetricTile
          label="Latencia Sandbox"
          value="3.8 ms"
          subValue="pg_stat_statements"
          icon={<Clock className="w-4 h-4" />}
          accent="cyan"
        />
      </div>

      {/* Activity Heatmap Grid */}
      <section className="flex flex-col gap-4 p-6 rounded-2xl bg-surface/60 border border-border-subtle/60">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-content-primary">
              Cadencia de Práctica (Últimos 30 días)
            </h3>
            <p className="text-xs text-content-secondary mt-0.5">
              Consistencia de consultas ejecutadas en el entorno PostgreSQL.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-content-muted">
            <span>Menos</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-surface-dim border border-border-subtle/40" />
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-accent/25 border border-cyan-accent/30" />
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-accent/60" />
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-accent shadow-glow-cyan" />
            <span>Más</span>
          </div>
        </div>

        {/* Heatmap Blocks */}
        <div className="grid grid-cols-10 sm:grid-cols-15 gap-2 pt-2">
          {heatmapDays.map((d) => {
            const intensityClass =
              d.count === 0
                ? 'bg-surface-dim border-border-subtle/30 text-content-muted'
                : d.count === 1
                ? 'bg-cyan-accent/25 border-cyan-accent/40 text-cyan-accent'
                : d.count <= 3
                ? 'bg-cyan-accent/60 border-cyan-accent/70 text-content-primary'
                : 'bg-cyan-accent border-cyan-accent text-canvas font-bold shadow-glow-cyan';

            return (
              <div
                key={d.day}
                title={`Día ${d.day}: ${d.count} consultas ejecutadas`}
                className={`h-8 rounded-lg border flex items-center justify-center font-mono text-[10px] transition-all cursor-pointer hover:scale-105 ${intensityClass}`}
              >
                {d.day}
              </div>
            );
          })}
        </div>
      </section>

      {/* Query Execution History Log */}
      <section className="flex flex-col gap-4 p-6 rounded-2xl bg-surface/60 border border-border-subtle/60">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-accent" />
              Historial Reciente de Consultas
            </h3>
            <p className="text-xs text-content-secondary mt-0.5">
              Registro auditado de ejecuciones enviadas al Sandbox Docker.
            </p>
          </div>

          {onOpenPlayground && (
            <Button size="sm" variant="outline" onClick={onOpenPlayground} className="text-xs">
              <span>Abrir Playground</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2 font-mono text-xs">
          {history.length === 0 ? (
            <div className="p-4 rounded-xl bg-surface-dim/40 border border-border-subtle/30 text-center text-content-muted">
              Aún no has ejecutado consultas. ¡Abre el Playground o resuelve un reto para ver tu historial!
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-surface/40 hover:bg-surface/70 border border-border-subtle/40 gap-2 transition-colors"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Code2 className="w-3.5 h-3.5 text-content-muted shrink-0" />
                  <span className="text-content-primary truncate font-mono text-[11px]">
                    {item.query}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[10px] text-content-muted">
                  <span className="text-emerald font-semibold">
                    {item.row_count} filas
                  </span>
                  <span>{item.execution_time_ms} ms</span>
                  <span>{item.executed_at}</span>
                  <Badge variant={item.status === 'SUCCESS' ? 'emerald' : 'error'} size="sm">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
