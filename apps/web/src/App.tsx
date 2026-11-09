import React, { useState, useEffect, useCallback } from 'react';
import {
  Terminal,
  Zap,
  Award,
  Play,
  CheckCircle2,
  Code2,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Flame,
  Sun,
  Moon,
} from 'lucide-react';
import { DashboardLayout, WorkspaceLayout } from '@/components/templates';
import { Button, Badge, KbdShortcut, RadioTab } from '@/components/atoms';
import { MetricTile, FormField, SuccessModal } from '@/components/molecules';
import { AuthModal } from '@/components/molecules/AuthModal/AuthModal';
import {
  MonacoEditorPanel,
  DataGridResults,
  ExerciseSpecPanel,
  TracksView,
  SqlPlaygroundView,
  AchievementsView,
  UserProfileView,
  NotFoundView,
} from '@/components/organisms';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { persistence } from '@/lib/persistence';
import {
  api,
  FALLBACK_EXERCISES,
  FALLBACK_TRACKS,
  ECOMMERCE_TABLES_SCHEMA,
  ACHIEVEMENTS_CATALOG,
} from '@/lib/api';
import {
  Exercise,
  EvaluationResponse,
  DiffResult,
  ColumnInfo,
  Track,
  TableSchemaInfo,
  Achievement,
  QueryHistoryItem,
} from '@/types';

export type AppPath = 'dashboard' | 'playground' | 'tracks' | 'achievements' | 'profile' | 'exercise' | 'not-found';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<AppPath>('dashboard');
  const [activeTab, setActiveTab] = useState<'overview' | 'components'>('overview');
  const [formEmail, setFormEmail] = useState('');
  const [formError, setFormError] = useState('');
  const { profile, updateProfile, isCloudAuth } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Estados del Currículum, Tablas y Gamificación
  const [tracks, setTracks] = useState<Track[]>(FALLBACK_TRACKS);
  const [tables] = useState<TableSchemaInfo[]>(ECOMMERCE_TABLES_SCHEMA);
  const [achievements] = useState<Achievement[]>(ACHIEVEMENTS_CATALOG);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);

  // Estados del Ejercicio Activo y del IDE
  const [exercises, setExercises] = useState<Exercise[]>(FALLBACK_EXERCISES);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sqlCode, setSqlCode] = useState(FALLBACK_EXERCISES[0].initial_code);
  const [hintsUnlocked, setHintsUnlocked] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  // Estados de Resultados
  const [executionStatus, setExecutionStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR' | 'FAILED'>('IDLE');
  const [executionTime, setExecutionTime] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [resultColumns, setResultColumns] = useState<ColumnInfo[]>([]);
  const [resultRows, setResultRows] = useState<any[][]>([]);
  const [resultError, setResultError] = useState<string | undefined>();
  const [resultDiff, setResultDiff] = useState<DiffResult | undefined>();
  const [resultMessage, setResultMessage] = useState<string | undefined>();

  // Modal de Victoria
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [awardedXp, setAwardedXp] = useState(0);

  const activeExercise = exercises[currentExerciseIndex] || FALLBACK_EXERCISES[0];

  // Cargar ejercicios e historial al inicio
  useEffect(() => {
    api.getExercises().then((data) => {
      if (data && data.length > 0) {
        setExercises(data);
      }
    });
    api.getTracks().then((data) => {
      if (data && data.length > 0) {
        setTracks(data);
      }
    });
    setQueryHistory(api.getQueryHistory());
  }, []);

  // Sincronizar ejercicios superados desde Supabase Cloud o persistencia local
  useEffect(() => {
    persistence.getCompletedExerciseIds(profile?.id).then((completedIds) => {
      if (completedIds.length > 0) {
        const completedSet = new Set(completedIds);
        setExercises((prev) =>
          prev.map((ex) => (completedSet.has(ex.id) ? { ...ex, is_completed: true } : ex))
        );

        setTracks((prev) =>
          prev.map((tr) => ({
            ...tr,
            completed_exercises: completedIds.length,
          }))
        );
      }
    });
  }, [profile?.id]);

  // Actualización dinámica del título de la pestaña (Anti-AI Slop Regla 1.1)
  useEffect(() => {
    if (currentPath === 'exercise') {
      document.title = `${activeExercise.title} — SQL Foundations | Qurio`;
    } else {
      const titles: Record<string, string> = {
        dashboard: 'Dashboard | Qurio',
        tracks: 'Rutas de Aprendizaje | Qurio',
        playground: 'SQL Playground | Qurio',
        achievements: 'Logros & Rangos | Qurio',
        profile: 'Mi Perfil | Qurio',
        'not-found': 'ERROR 404: Relation Not Found | Qurio',
      };
      document.title = titles[currentPath] || 'Qurio | Aprende SQL. Piensa en queries.';
    }
  }, [currentPath, activeExercise]);

  // Cambiar de ejercicio activo
  const handleSelectExercise = (index: number) => {
    const ex = exercises[index];
    if (ex) {
      setCurrentExerciseIndex(index);
      setSqlCode(ex.initial_code);
      setHintsUnlocked(0);
      setExecutionStatus('IDLE');
      setResultError(undefined);
      setResultDiff(undefined);
    }
  };

  const handleOpenExerciseFromCatalog = (ex: Exercise) => {
    const idx = exercises.findIndex((e) => e.id === ex.id);
    if (idx !== -1) {
      handleSelectExercise(idx);
    } else {
      setExercises((prev) => [ex, ...prev]);
      setCurrentExerciseIndex(0);
      setSqlCode(ex.initial_code);
    }
    setCurrentPath('exercise');
  };

  // Desbloquear siguiente pista
  const handleUnlockHint = () => {
    const totalHints = activeExercise.hints ? activeExercise.hints.length : 0;
    if (hintsUnlocked < totalHints) {
      setHintsUnlocked((prev) => prev + 1);
    }
  };

  // Ejecución / Evaluación Semántica End-to-End
  const handleExecuteSolution = useCallback(async () => {
    if (!sqlCode.trim()) return;

    setIsExecuting(true);
    setExecutionStatus('LOADING');
    setResultError(undefined);
    setResultDiff(undefined);

    try {
      const evalResponse: EvaluationResponse = await api.submitSolution(
        activeExercise.id,
        sqlCode,
        hintsUnlocked
      );

      setExecutionTime(evalResponse.execution_time_ms);

      if (evalResponse.status === 'PASSED') {
        setExecutionStatus('SUCCESS');
        setRowCount(evalResponse.rows.length);
        setResultColumns(evalResponse.columns.map((name) => ({ name, type: 'column' })));
        setResultRows(evalResponse.rows);
        setAwardedXp(evalResponse.xp_awarded);
        setSuccessModalOpen(false); // Mantener en false: los resultados y el botón de éxito se muestran inline en DataGridResults sin tapar la tabla

        // Persistir intento exitoso (Supabase Cloud + LocalStorage)
        await persistence.recordAttempt({
          userId: profile?.id,
          exerciseId: activeExercise.id,
          submittedSql: sqlCode.trim(),
          status: 'PASSED',
          executionTimeMs: evalResponse.execution_time_ms,
          hintsUsed: hintsUnlocked,
          xpAwarded: evalResponse.xp_awarded,
        });

        // Actualizar perfil local y XP
        const nextXp = (profile?.total_xp || 0) + evalResponse.xp_awarded;
        const nextLevel = Math.max(1, Math.floor(nextXp / 500) + 1);
        await updateProfile({
          total_xp: nextXp,
          current_level: nextLevel,
        });

        // Marcar ejercicio como completado en el estado
        setExercises((prev) =>
          prev.map((ex) => (ex.id === activeExercise.id ? { ...ex, is_completed: true } : ex))
        );

        // Actualizar contador en tracks
        setTracks((prev) =>
          prev.map((tr) => ({
            ...tr,
            completed_exercises: Math.min(tr.total_exercises || 0, (tr.completed_exercises || 0) + 1),
          }))
        );

        // Guardar en historial
        api.saveQueryHistory({
          id: `sol-${Date.now()}`,
          query: sqlCode.trim(),
          executed_at: 'Hace un momento',
          status: 'SUCCESS',
          execution_time_ms: evalResponse.execution_time_ms,
          row_count: evalResponse.rows.length,
        });
        setQueryHistory(api.getQueryHistory());
      } else if (evalResponse.status === 'FAILED') {
        setExecutionStatus('FAILED');
        setRowCount(evalResponse.rows ? evalResponse.rows.length : 0);
        setResultColumns(evalResponse.columns ? evalResponse.columns.map((name) => ({ name, type: 'column' })) : []);
        setResultRows(evalResponse.rows || []);
        setResultDiff(evalResponse.diff);
        setResultMessage(evalResponse.message);

        // Registrar intento fallido en persistencia
        await persistence.recordAttempt({
          userId: profile?.id,
          exerciseId: activeExercise.id,
          submittedSql: sqlCode.trim(),
          status: 'FAILED',
          executionTimeMs: evalResponse.execution_time_ms || 0,
          hintsUsed: hintsUnlocked,
          xpAwarded: 0,
          errorMessage: evalResponse.message,
        });
      } else {
        setExecutionStatus('ERROR');
        setResultError(evalResponse.error || evalResponse.message);

        // Registrar intento con error en persistencia
        await persistence.recordAttempt({
          userId: profile?.id,
          exerciseId: activeExercise.id,
          submittedSql: sqlCode.trim(),
          status: 'ERROR',
          executionTimeMs: evalResponse.execution_time_ms || 0,
          hintsUsed: hintsUnlocked,
          xpAwarded: 0,
          errorMessage: evalResponse.error || evalResponse.message,
        });
      }
    } catch (err: any) {
      setExecutionStatus('ERROR');
      setResultError(err.message || 'Error de conexión con el evaluador semántico en FastAPI.');
    } finally {
      setIsExecuting(false);
    }
  }, [activeExercise, sqlCode, hintsUnlocked, profile, updateProfile]);

  // Avanzar al siguiente reto
  const handleNextExercise = () => {
    setSuccessModalOpen(false);
    const nextIndex = (currentExerciseIndex + 1) % exercises.length;
    handleSelectExercise(nextIndex);
  };

  const handleValidateEmail = (val: string) => {
    setFormEmail(val);
    if (!val) {
      setFormError('El correo electrónico es obligatorio para guardar tu progreso.');
    } else if (!val.includes('@') || !val.includes('.')) {
      setFormError('Introduce un formato de correo electrónico válido (ej. usuario@dominio.com).');
    } else {
      setFormError('');
    }
  };

  // ============================================================================
  // VISTA 1: ESPACIO DE TRABAJO DEL EJERCICIO (IDE INTERACTIVO CON MONACO)
  // ============================================================================
  if (currentPath === 'exercise') {
    return (
      <>
        <WorkspaceLayout
          headerBar={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  onClick={() => setCurrentPath('tracks')}
                >
                  Rutas
                </Button>

                <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-content-muted">
                  <span>SQL Foundations</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-content-primary font-medium">{activeExercise.title}</span>
                </div>
              </div>

              {/* Selector Rápido de Ejercicios */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-content-muted hidden md:inline">Reto:</span>
                <select
                  value={currentExerciseIndex}
                  onChange={(e) => handleSelectExercise(Number(e.target.value))}
                  className="bg-surface-card text-content-primary border border-border-subtle text-xs rounded-lg px-2.5 py-1 font-mono outline-none focus:border-primary"
                >
                  {exercises.map((ex, idx) => (
                    <option key={ex.id} value={idx}>
                      #{idx + 1} {ex.title}
                    </option>
                  ))}
                </select>

                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-dim border border-border-subtle text-[11px] font-mono text-emerald">
                  <span className="w-2 h-2 rounded-full bg-emerald" />
                  <span>Sandbox Online</span>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-card transition-colors"
                  title={isDark ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
                  aria-label="Alternar tema visual"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-streak" /> : <Moon className="w-3.5 h-3.5 text-primary" />}
                </button>

                {/* Avatar y Gatillo de Autenticación */}
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1.5 pl-2 border-l border-border-subtle/50 text-xs font-mono text-content-muted hover:text-content-primary transition-colors"
                  title="Gestionar sesión / Cuenta Supabase"
                >
                  <img
                    src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                    alt={`Avatar de ${profile?.username || 'Usuario'}`}
                    className="w-5 h-5 rounded-full object-cover border border-border-subtle"
                  />
                  <span className="hidden md:inline">{profile?.username || 'Estudiante'}</span>
                </button>
              </div>
            </div>
          }
          sidebarContent={
            <ExerciseSpecPanel
              exercise={activeExercise}
              unlockedHintsCount={hintsUnlocked}
              onUnlockHint={handleUnlockHint}
            />
          }
          editorContent={
            <MonacoEditorPanel
              value={sqlCode}
              onChange={setSqlCode}
              onExecute={handleExecuteSolution}
              onReset={() => setSqlCode(activeExercise.initial_code)}
              isLoading={isExecuting}
              isSubmitMode={true}
            />
          }
          resultsContent={
            <DataGridResults
              status={executionStatus}
              executionTimeMs={executionTime}
              rowCount={rowCount}
              columns={resultColumns}
              rows={resultRows}
              error={resultError}
              diff={resultDiff}
              message={resultMessage}
              xpAwarded={awardedXp}
              onNextExercise={handleNextExercise}
            />
          }
          statusBar={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <span>PostgreSQL 16.3 (Sandbox Docker)</span>
                <span>DB: ecommerce_sandbox</span>
                <span>User: readonly_student</span>
              </div>
              <div className="flex items-center gap-3">
                <KbdShortcut keys={['⌘', '↵']} />
                <span>para compilar y evaluar</span>
              </div>
            </div>
          }
        />

        {/* Modal de Reto Superado con XP y Avance Directo */}
        <SuccessModal
          isOpen={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          onNextExercise={handleNextExercise}
          xpAwarded={awardedXp}
          exerciseTitle={activeExercise.title}
          executionTimeMs={executionTime}
          hintsUsed={hintsUnlocked}
        />

        {/* Modal de Autenticación Supabase */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </>
    );
  }

  // Título para la barra superior
  const getHeaderTitle = () => {
    switch (currentPath) {
      case 'dashboard':
        return 'Dashboard';
      case 'tracks':
        return 'Rutas de Aprendizaje';
      case 'playground':
        return 'SQL Playground';
      case 'achievements':
        return 'Logros & Rangos';
      case 'profile':
        return 'Mi Perfil';
      case 'not-found':
        return '404 Relation Not Found';
      default:
        return 'Dashboard';
    }
  };

  // ============================================================================
  // VISTA 2: DASHBOARD LAYOUT (DASHBOARD, TRACKS, PLAYGROUND, ACHIEVEMENTS, PROFILE)
  // ============================================================================
  return (
    <>
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path as AppPath)}
        title={getHeaderTitle()}
        onOpenAuth={() => setAuthModalOpen(true)}
      >
        {/* VISTA A: RUTAS DE APRENDIZAJE */}
        {currentPath === 'tracks' && (
          <TracksView
            tracks={tracks}
            exercises={exercises}
            onSelectExercise={handleOpenExerciseFromCatalog}
          />
        )}

        {/* VISTA B: SQL PLAYGROUND LIBRE */}
        {currentPath === 'playground' && (
          <SqlPlaygroundView tables={tables} />
        )}

        {/* VISTA C: LOGROS & MEDALLAS */}
        {currentPath === 'achievements' && (
          <AchievementsView
            achievements={achievements}
            totalXp={profile?.total_xp || 480}
          />
        )}

        {/* VISTA D: MI PERFIL */}
        {currentPath === 'profile' && (
          <UserProfileView
            profile={profile}
            history={queryHistory}
            onOpenPlayground={() => setCurrentPath('playground')}
            onOpenAuth={() => setAuthModalOpen(true)}
            isCloudAuth={isCloudAuth}
          />
        )}

      {/* VISTA E: ERROR 404 (RELATION NOT FOUND) */}
      {currentPath === 'not-found' && (
        <NotFoundView
          missingPath="v_reporte_anual"
          onNavigate={(path) => setCurrentPath(path as AppPath)}
        />
      )}

      {/* VISTA E: DASHBOARD PRINCIPAL */}
      {currentPath === 'dashboard' && (
        <div className="flex flex-col gap-8 pb-12">
          {/* Banner de Bienvenida y Rendimiento del Sandbox */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface to-primary/[0.04] p-6 sm:p-7 border border-border-subtle/80 shadow-md">
            <div className="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-primary/[0.07] dark:bg-primary/[0.12] blur-3xl pointer-events-none" />
            <div className="absolute right-72 -bottom-20 w-64 h-64 rounded-full bg-cyan-accent/[0.05] dark:bg-cyan-accent/[0.08] blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald/10 border border-emerald/25 w-fit text-[11px] font-mono text-emerald-600 dark:text-emerald font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                  <span>Ruta Activa • SQL Foundations</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
                  ¡Hola, {profile?.username || 'Erick'}!{' '}
                  <span className="text-content-secondary font-normal">¿Listo para compilar hoy?</span>
                </h1>

                <p className="text-xs text-content-secondary leading-relaxed">
                  Sandbox PostgreSQL aislado en Docker activo. Resuelve ejercicios relacionales con evaluación semántica instantánea.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex flex-col items-start sm:items-end pr-2 font-mono">
                  <span className="text-[10px] text-content-muted uppercase tracking-wider">Latencia Sandbox</span>
                  <span className="text-xs text-content-secondary font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald" /> 3.6ms (pg_stat_ready)
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  kbdShortcut="⌘↵"
                  leftIcon={<Play className="w-4 h-4 fill-white" />}
                  onClick={() => {
                    handleSelectExercise(0);
                    setCurrentPath('exercise');
                  }}
                  className="shadow-glow-primary hover:shadow-primary"
                >
                  Continuar Reto Activo
                </Button>
              </div>
            </div>
          </section>

          {/* Bento Grid de Métricas */}
          <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <MetricTile
              label="Rango Actual"
              value="Nivel 2"
              subValue="Junior Query Builder"
              icon={<Award className="w-4 h-4" />}
              accent="purple"
            />
            <MetricTile
              label="XP Acumulado"
              value={`${profile?.total_xp || 480} XP`}
              subValue="Meta: 1,000 XP"
              icon={<Zap className="w-4 h-4" />}
              accent="indigo"
            />
            <MetricTile
              label="Racha Activa"
              value={`${profile?.current_streak_days || 2} días`}
              subValue="Récord: 5 días"
              icon={<Flame className="w-4 h-4" />}
              accent="amber"
            />
            <MetricTile
              label="Queries Evaluados"
              value="142"
              subValue="+18 en sesión"
              icon={<Terminal className="w-4 h-4" />}
              accent="cyan"
            />
            <MetricTile
              label="Tasa de Éxito"
              value="94.2%"
              subValue="Evaluación semántica"
              icon={<CheckCircle2 className="w-4 h-4" />}
              accent="emerald"
              className="col-span-2 sm:col-span-1"
            />
          </section>

          {/* Selector de Pestañas para el Dashboard / Atomic Showcase */}
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
              badge="Atomic"
            />
          </div>

          {activeTab === 'overview' ? (
            /* Vista de Retos Destacados */
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Reto Estrella en Proceso */}
              <div className="lg:col-span-2 flex flex-col justify-between p-6 rounded-2xl bg-surface/70 border border-border-subtle/60 shadow-lg">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="cyan" size="sm">Reto Recomendado</Badge>
                    <span className="text-xs font-mono text-content-muted">Módulo 6 • Intermedio</span>
                  </div>

                  <h3 className="text-lg font-bold text-content-primary">
                    {exercises[3]?.title || 'Clientes sin Compras Registradas (LEFT JOIN & IS NULL)'}
                  </h3>

                  <p className="text-xs text-content-secondary leading-relaxed">
                    {exercises[3]?.prompt || 'El equipo de marketing necesita reactivar a usuarios registrados que nunca han realizado un pedido en la plataforma.'}
                  </p>

                  <div className="mt-2 p-3 rounded-lg bg-surface-dim/80 border border-border-subtle/50 border-l-2 border-l-cyan-accent font-mono text-xs text-content-secondary flex items-center justify-between">
                    <code>SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c...</code>
                    <KbdShortcut keys={['⌘', '↵']} />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border-subtle/40 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-streak font-medium bg-amber-streak/10 px-2.5 py-1 rounded-md border border-amber-streak/20">
                    <Zap className="w-3.5 h-3.5 fill-amber-streak" />
                    <span>Recompensa: +{exercises[3]?.xp_reward || 50} XP</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPath('tracks')}
                      className="text-xs"
                    >
                      Ver Rutas
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        handleSelectExercise(3 < exercises.length ? 3 : 0);
                        setCurrentPath('exercise');
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
                    Ecommerce DB
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
                      <span className="text-[10px] text-content-muted">public</span>
                    </div>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPath('playground')}
                  className="mt-2 text-xs border-cyan-accent/30 text-cyan-accent hover:bg-cyan-accent/10"
                >
                  <Terminal className="w-3.5 h-3.5 mr-1 text-cyan-accent" />
                  <span>Explorar en Playground</span>
                </Button>
              </div>
            </section>
          ) : (
            /* Showcase del Árbol de Atomic Design Pragmático */
            <section className="flex flex-col gap-6 p-6 rounded-2xl bg-surface border border-border-subtle">
              <div>
                <h3 className="text-base font-bold text-content-primary">
                  Verificación del Sistema de Diseño (Atomic Design Pragmático)
                </h3>
                <p className="text-xs text-content-secondary mt-1">
                  Todos los componentes pertenecen estrictamente a Átomos, Moléculas u Organismos bajo la especificación Terminal Glow Minimal.
                </p>
              </div>

              {/* Átomos: Botones */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-mono font-semibold text-cyan-accent uppercase tracking-wider">
                  1. Átomos — Variantes de Button
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" kbdShortcut="⌘↵">Primario (Ejecutar)</Button>
                  <Button variant="secondary">Secundario (Formatear)</Button>
                  <Button variant="emerald">Éxito Semántico</Button>
                  <Button variant="ghost">Ghost (Copiar)</Button>
                  <Button variant="outline">Contorno</Button>
                  <Button variant="danger">Peligro</Button>
                  <Button variant="primary" isLoading>Cargando</Button>
                </div>
              </div>

              {/* Átomos: Badges */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-mono font-semibold text-cyan-accent uppercase tracking-wider">
                  2. Átomos — Badges con Opacidad 10% y Borde
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="default">DEFAULT</Badge>
                  <Badge variant="cyan" dot>CYAN ACCENT</Badge>
                  <Badge variant="emerald" dot>TEST PASSED</Badge>
                  <Badge variant="amber" dot>STREAK x2</Badge>
                  <Badge variant="error" dot>ERROR 404</Badge>
                  <Badge variant="mono">VARCHAR(255)</Badge>
                </div>
              </div>

              {/* Molécula: Manejo Riguroso de Errores Inline (Anti-AI Slop) */}
              <div className="flex flex-col gap-3 max-w-md">
                <span className="text-xs font-mono font-semibold text-cyan-accent uppercase tracking-wider">
                  3. Molécula — FormField con Error Inline Riguroso (Anti-AI Slop)
                </span>
                <FormField
                  label="Correo Electrónico de Registro"
                  placeholder="tu_correo@ejemplo.com"
                  value={formEmail}
                  onChange={(e) => handleValidateEmail(e.target.value)}
                  errorMessage={formError}
                  helperText="Escribe un correo inválido para probar la validación inline estricta."
                  required
                />
              </div>

              {/* Organismo: Error 404 Tematizado SQL (Anti-AI Slop Regla 1.1) */}
              <div className="flex flex-col gap-3 max-w-md pt-2 border-t border-border-subtle/40">
                <span className="text-xs font-mono font-semibold text-cyan-accent uppercase tracking-wider">
                  4. Organismo — 404 Temática SQL (Anti-AI Slop Regla 1.1)
                </span>
                <p className="text-xs text-content-secondary">
                  Metáfora técnica relacional: captura rutas inexistentes con mensaje de error SQLSTATE 42P01.
                </p>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPath('not-found')}
                  >
                    Simular Error 404 (Relation Not Found)
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </DashboardLayout>

    {/* Modal de Autenticación Supabase (Login / Registro / JWT) */}
    <AuthModal
      isOpen={authModalOpen}
      onClose={() => setAuthModalOpen(false)}
    />
  </>
  );
};

export default App;

