import React, { useState } from 'react';
import {
  Terminal,
  Zap,
  Award,
  Play,
  CheckCircle2,
  Code2,
  Sparkles,
  Flame,
  BookOpen,
} from 'lucide-react';
import { Button, Badge, KbdShortcut, RadioTab } from '@/components/atoms';
import { MetricTile, PedagogyPillarsCard } from '@/components/molecules';
import { formatSqlProse } from '@/lib/format';
import { ActiveLearningData } from '@/hooks/useCurriculumState';
import {
  Exercise,
  TableSchemaInfo,
  UserProfile,
  AppPath,
} from '@/types';

const DesignSystemShowcase = React.lazy(() =>
  import('@/components/organisms/DesignSystemShowcase/DesignSystemShowcase').then((m) => ({
    default: m.DesignSystemShowcase,
  }))
);

export interface DashboardHomeViewProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  profile: UserProfile | null;
  user?: {
    email?: string | null;
    user_metadata?: {
      username?: string;
    };
  } | null;
  activeLearningData: ActiveLearningData;
  recommendedExercise: Exercise;
  exercisesCount: number;
  completedCount: number;
  totalAttemptsCount: number;
  queryHistoryCount: number;
  tables: TableSchemaInfo[];
  onStartExerciseById: (exerciseId: string) => void;
  onNavigate: (path: AppPath) => void;
  onOpenAuth: () => void;
  onOpenMethodology: () => void;
}

export const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({
  isAuthenticated,
  isAdmin,
  profile,
  user,
  activeLearningData,
  recommendedExercise,
  exercisesCount,
  completedCount,
  totalAttemptsCount,
  queryHistoryCount,
  tables,
  onStartExerciseById,
  onNavigate,
  onOpenAuth,
  onOpenMethodology,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'components'>('overview');

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Banner de Bienvenida y Rendimiento del Sandbox */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface to-primary/[0.04] p-6 sm:p-7 border border-border-subtle/80 shadow-md">
        <div className="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-primary/[0.07] dark:bg-primary/[0.12] blur-3xl pointer-events-none" />
        <div className="absolute right-72 -bottom-20 w-64 h-64 rounded-full bg-cyan-accent/[0.05] dark:bg-cyan-accent/[0.08] blur-3xl pointer-events-none" />

        {isAuthenticated ? (
          /* ESTADO AUTENTICADO: CENTRO DE AVANCE CONTINUO */
          <div className="relative z-10 flex flex-col gap-5">
            {/* Fila Superior: Píldora de Ruta/Módulo y Latencia del Sandbox */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald/10 border border-emerald/25 text-[11px] font-mono text-emerald font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                <span>Ruta Activa • {activeLearningData.activeTrack?.title || 'Fundamentos de SQL'}</span>
                {activeLearningData.activeModule && (
                  <>
                    <span className="text-content-muted">•</span>
                    <span className="text-content-secondary font-normal">
                      Módulo {activeLearningData.activeModule.sort_order}: {activeLearningData.activeModule.title}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-content-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                <span>PostgreSQL 16 • Entorno Activo</span>
              </div>
            </div>

            {/* Saludo y Reto Pendiente */}
            <div className="flex flex-col gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
                ¡Hola de nuevo, {profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Estudiante'}!{' '}
                <span className="text-content-secondary font-normal">Tu siguiente reto te espera:</span>
              </h1>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span className="text-base sm:text-lg font-bold font-mono text-cyan-accent">
                  Reto #{activeLearningData.exerciseNumberInTrack}:
                </span>
                <span className="text-base sm:text-lg font-bold text-content-primary font-sans">
                  {activeLearningData.nextExercise?.title}
                </span>
                <Badge variant="amber" size="sm" className="font-mono">
                  +{activeLearningData.nextExercise?.xp_reward || 35} XP
                </Badge>
                <Badge variant="mono" size="sm">
                  {activeLearningData.nextExercise?.difficulty || 'Principiante'}
                </Badge>
              </div>

              <p className="text-xs text-content-secondary leading-relaxed max-w-3xl line-clamp-2">
                {formatSqlProse(activeLearningData.nextExercise?.prompt)}
              </p>
            </div>

            {/* Barra de Progreso Dinámica de la Ruta */}
            <div className="flex flex-col gap-2 pt-1 max-w-3xl">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-content-secondary flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-accent" />
                  <span>
                    Progreso en {activeLearningData.activeTrack?.title}:{' '}
                    <strong className="text-content-primary">
                      {activeLearningData.trackCompleted} de {activeLearningData.trackTotal} retos superados
                    </strong>
                  </span>
                </span>
                <span className="text-emerald font-bold font-mono">
                  {activeLearningData.trackPercent}%
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-surface-dim overflow-hidden border border-border-subtle/50 relative">
                <div
                  className="h-full bg-gradient-to-r from-cyan-accent via-primary to-emerald transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                  style={{ width: `${Math.max(activeLearningData.trackPercent, 2)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-content-muted">
                <span>
                  {activeLearningData.isAllCompleted
                    ? '🎉 ¡Has completado todos los ejercicios del currículum oficial!'
                    : activeLearningData.moduleRemaining === 1
                    ? '🔥 ¡Último reto para culminar este módulo!'
                    : `Faltan ${activeLearningData.moduleRemaining} retos para culminar este módulo.`}
                </span>
                <span>
                  Global: {completedCount} / {exercisesCount} ({Math.round((completedCount / (exercisesCount || 1)) * 100)}%)
                </span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                kbdShortcut="⌘↵"
                leftIcon={<Play className="w-4 h-4 fill-white shrink-0" />}
                onClick={() => {
                  if (activeLearningData.nextExercise) {
                    onStartExerciseById(activeLearningData.nextExercise.id);
                  }
                }}
                className="shadow-glow-primary hover:shadow-primary px-5 shrink-0 whitespace-nowrap text-xs sm:text-sm font-semibold"
              >
                Continuar Reto #{activeLearningData.exerciseNumberInTrack}
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => onNavigate('tracks')}
                className="px-4 shrink-0 whitespace-nowrap text-xs hover:border-cyan-accent/50"
              >
                Ver Temario Completo
              </Button>
            </div>
          </div>
        ) : (
          /* ESTADO INVITADO: BIENVENIDA Y PRUEBA INICIAL */
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex flex-col gap-2.5 max-w-xl xl:max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald/10 border border-emerald/25 w-fit text-[11px] font-mono text-emerald font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                <span>MODO INVITADO • PRUEBA ACTIVA (3 RETOS GRATUITOS)</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
                ¡Bienvenido a Qurio! <span className="text-content-secondary font-normal">Aprende SQL escribiendo consultas reales.</span>
              </h1>

              <p className="text-xs text-content-secondary leading-relaxed">
                Practicas directamente contra una base de datos PostgreSQL 16 real. Resuelve hasta 3 retos iniciales gratis y verifica tus resultados al instante, sin necesidad de crear cuenta.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0">
              <div className="flex flex-col items-start sm:items-end pr-2 font-mono shrink-0 whitespace-nowrap">
                <span className="text-[10px] text-content-muted uppercase tracking-wider">Motor de Práctica</span>
                <span className="text-xs text-content-secondary font-semibold flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald shrink-0" /> PostgreSQL 16 Listo
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                <Button
                  variant="primary"
                  size="md"
                  kbdShortcut="⌘↵"
                  leftIcon={<Play className="w-4 h-4 fill-white shrink-0" />}
                  onClick={() => {
                    if (recommendedExercise?.id) {
                      onStartExerciseById(recommendedExercise.id);
                    }
                  }}
                  className="shadow-glow-primary hover:shadow-primary px-5 shrink-0 whitespace-nowrap"
                >
                  Comenzar Reto 1
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={onOpenAuth}
                  className="px-4 shrink-0 whitespace-nowrap"
                >
                  Iniciar Sesión
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Bento Grid de Métricas */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <MetricTile
          label="Rango Actual"
          value={isAuthenticated ? `Nivel ${profile?.current_level || 1}` : 'Invitado'}
          subValue={isAuthenticated ? 'Estudiante Oficial' : 'Modo Explorador'}
          icon={<Award className="w-4 h-4" />}
          accent="purple"
        />
        <MetricTile
          label="XP Acumulado"
          value={isAuthenticated ? `${profile?.total_xp ?? 0} XP` : '0 XP'}
          subValue={isAuthenticated ? 'Progreso certificado' : 'Crea tu cuenta para acumular'}
          icon={<Zap className="w-4 h-4" />}
          accent="indigo"
        />
        <MetricTile
          label="Racha Activa"
          value={isAuthenticated ? `${profile?.current_streak_days ?? 0} días` : '0 días'}
          subValue={isAuthenticated ? `Récord: ${profile?.max_streak_days ?? 0} días` : 'Disponible con cuenta'}
          icon={<Flame className="w-4 h-4" />}
          accent="amber"
        />
        <MetricTile
          label="Consultas Evaluadas"
          value={`${isAuthenticated ? totalAttemptsCount : queryHistoryCount}`}
          subValue={isAuthenticated ? 'Total histórico evaluado' : 'En sesión local'}
          icon={<Terminal className="w-4 h-4" />}
          accent="cyan"
        />
        <MetricTile
          label={isAuthenticated ? 'Retos Superados' : 'Retos de Prueba'}
          value={
            isAuthenticated
              ? `${completedCount} / ${exercisesCount}`
              : `${Math.min(completedCount, 3)} / 3`
          }
          subValue={isAuthenticated ? 'Progreso oficial verificado' : 'Prueba libre sin registro'}
          icon={<CheckCircle2 className="w-4 h-4" />}
          accent="emerald"
          className="col-span-2 sm:col-span-1"
        />
      </section>

      {/* Selector de Pestañas para el Inicio (el showcase técnico solo se muestra a administradores) */}
      {isAdmin && (
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <RadioTab
            label="Visión General"
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<Terminal className="w-3.5 h-3.5" />}
          />
          <RadioTab
            label="Sistema de Diseño & Átomos"
            active={activeTab === 'components'}
            onClick={() => setActiveTab('components')}
            icon={<Sparkles className="w-3.5 h-3.5" />}
            badge="UI"
          />
        </div>
      )}

      {!isAdmin || activeTab === 'overview' ? (
        <div className="flex flex-col gap-6">
          {/* Vista de Retos Destacados */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reto Estrella en Proceso */}
            <div className="lg:col-span-2 flex flex-col justify-between p-6 rounded-2xl bg-surface/70 border border-border-subtle/60 shadow-lg">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Badge variant="cyan" size="sm">Reto Recomendado</Badge>
                  <span className="text-xs font-mono text-content-muted">
                    {recommendedExercise?.difficulty || 'Principiante'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-content-primary">
                  {recommendedExercise?.title || 'Reto SQL'}
                </h3>

                <p className="text-xs text-content-secondary leading-relaxed">
                  {formatSqlProse(recommendedExercise?.prompt || 'Consulta la base de datos relacional con SQL.')}
                </p>

                <div className="mt-2 p-3 rounded-lg bg-surface-dim/80 border border-border-subtle/50 border-l-2 border-l-cyan-accent font-mono text-xs text-content-secondary flex items-center justify-between">
                  <code className="truncate max-w-md">{recommendedExercise?.initial_code || 'SELECT ...'}</code>
                  <KbdShortcut keys={['⌘', '↵']} />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border-subtle/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-streak font-medium bg-amber-streak/10 px-2.5 py-1 rounded-md border border-amber-streak/20">
                  <Zap className="w-3.5 h-3.5 fill-amber-streak" />
                  <span>Recompensa: +{recommendedExercise?.xp_reward || 50} XP</span>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('tracks')}
                    className="text-xs"
                  >
                    Ver Rutas
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (recommendedExercise?.id) {
                        onStartExerciseById(recommendedExercise.id);
                      }
                    }}
                    className="shadow-sm hover:shadow-primary"
                  >
                    Resolver Reto
                  </Button>
                </div>
              </div>
            </div>

            {/* Panel Lateral de Esquema Activo */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl bg-surface/70 border border-border-subtle/60 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-content-primary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-accent" />
                  <span>Esquema Activo</span>
                </span>
                <span className="text-[10px] font-mono text-primary font-medium px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                  Tienda Online
                </span>
              </div>

              <div className="flex flex-col gap-1.5 font-mono text-xs">
                {tables.slice(0, 5).map((tbl) => (
                  <div
                    key={tbl.tableName}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-surface/40 hover:bg-surface/80 border border-border-subtle/40 text-content-secondary hover:text-content-primary transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-cyan-accent" />
                      {tbl.tableName} ({tbl.rowCount} filas)
                    </span>
                    <span className="text-[10px] text-content-muted">tabla</span>
                  </div>
                ))}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigate('playground')}
                className="mt-2 text-xs border-cyan-accent/30 text-cyan-accent hover:bg-cyan-accent/10"
              >
                <Terminal className="w-3.5 h-3.5 mr-1 text-cyan-accent" />
                <span>Abrir en Laboratorio SQL</span>
              </Button>
            </div>
          </section>

          {/* Respaldo Pedagógico y Técnico */}
          <PedagogyPillarsCard
            compact
            onOpenMethodology={onOpenMethodology}
          />
        </div>
      ) : (
        <React.Suspense fallback={null}>
          <DesignSystemShowcase onNavigate={onNavigate} />
        </React.Suspense>
      )}
    </div>
  );
};
