import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  LogIn,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { DashboardLayout, WorkspaceLayout } from '@/components/templates';
import { Button, Badge, KbdShortcut, RadioTab } from '@/components/atoms';
import { MetricTile, FormField, StreakPill, GuestTrialCompleteModal } from '@/components/molecules';
import { AuthModal, AuthMode } from '@/components/molecules/AuthModal/AuthModal';
import {
  MonacoEditorPanel,
  DataGridResults,
  ExerciseSpecPanel,
  TracksView,
} from '@/components/organisms';

// Lazy loading de vistas secundarias para optimización y code splitting del bundle
const SqlPlaygroundView = React.lazy(() =>
  import('@/components/organisms/SqlPlaygroundView/SqlPlaygroundView').then((m) => ({ default: m.SqlPlaygroundView }))
);
const AchievementsView = React.lazy(() =>
  import('@/components/organisms/AchievementsView/AchievementsView').then((m) => ({ default: m.AchievementsView }))
);
const UserProfileView = React.lazy(() =>
  import('@/components/organisms/UserProfileView/UserProfileView').then((m) => ({ default: m.UserProfileView }))
);
const NotFoundView = React.lazy(() =>
  import('@/components/organisms/NotFoundView/NotFoundView').then((m) => ({ default: m.NotFoundView }))
);
const AuthConfirmView = React.lazy(() =>
  import('@/components/organisms/AuthConfirmView/AuthConfirmView').then((m) => ({ default: m.AuthConfirmView }))
);
const ResetPasswordView = React.lazy(() =>
  import('@/components/organisms/ResetPasswordView/ResetPasswordView').then((m) => ({ default: m.ResetPasswordView }))
);

const ViewLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[360px] gap-3 text-content-muted">
    <div className="w-6 h-6 border-2 border-cyan-accent border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-mono text-cyan-accent/80">Cargando módulo de la aplicación...</span>
  </div>
);
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { persistence } from '@/lib/persistence';
import { computeOfficialTracksProgress, computeGuestTrialTracksProgress } from '@/lib/progress';
import { pathToUrl, parseLocation } from '@/lib/routing';
import {
  api,
  FALLBACK_EXERCISES,
  FALLBACK_TRACKS,
  ECOMMERCE_TABLES_SCHEMA,
  ACHIEVEMENTS_CATALOG,
  evaluateUserAchievements,
} from '@/lib/api';
import {
  Exercise,
  EvaluationResponse,
  DiffResult,
  ColumnInfo,
  Track,
  TableSchemaInfo,
  QueryHistoryItem,
  AppPath,
} from '@/types';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<AppPath>('dashboard');
  const [pendingExerciseId, setPendingExerciseId] = useState<string | null>(null);
  const [authoritativeCompletedIds, setAuthoritativeCompletedIds] = useState<Set<string>>(new Set());
  const [isProgressLoading, setIsProgressLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'components'>('overview');
  const [formEmail, setFormEmail] = useState('');
  const [formError, setFormError] = useState('');
  const { profile, user, isCloudAuth, isAuthenticated, signOut, refreshProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<AuthMode>('signin');
  const [guestTrialModalOpen, setGuestTrialModalOpen] = useState(false);

  // Identificadores oficiales de los 3 retos de prueba en Módulo 1 para invitados
  const GUEST_TRIAL_EXERCISE_IDS = useMemo(
    () =>
      new Set([
        'e0000000-0000-0000-0000-000000000001',
        'e0000000-0000-0000-0000-000000000008',
        'e0000000-0000-0000-0000-000000000019',
      ]),
    []
  );

  // Estados del Currículum, Tablas y Gamificación
  const [tracks, setTracks] = useState<Track[]>(FALLBACK_TRACKS);
  const [tables] = useState<TableSchemaInfo[]>(ECOMMERCE_TABLES_SCHEMA);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [dailyActivity, setDailyActivity] = useState<{ activity_date: string; exercises_solved: number; xp_earned: number }[]>([]);
  const [totalAttemptsCount, setTotalAttemptsCount] = useState<number>(0);
  const [playgroundInitialQuery, setPlaygroundInitialQuery] = useState<string | undefined>(undefined);

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

  const [awardedXp, setAwardedXp] = useState(0);

  const activeExercise = exercises[currentExerciseIndex] || FALLBACK_EXERCISES[0];

  // Navegación con History API
  const navigate = useCallback(
    (newPath: AppPath, params?: { exerciseId?: string; trackSlug?: string }, replace = false) => {
      setCurrentPath(newPath);
      const targetUrl = pathToUrl(newPath, params);
      if (window.location.pathname !== targetUrl) {
        if (replace) {
          window.history.replaceState({ path: newPath, ...params }, '', targetUrl);
        } else {
          window.history.pushState({ path: newPath, ...params }, '', targetUrl);
        }
      }
    },
    []
  );

  // Sincronización de enrutamiento web y detección de tokens de Supabase Auth
  useEffect(() => {
    const handleLocationChange = () => {
      const search = window.location.search;
      const hash = window.location.hash;

      // 1. Detección segura de parámetros Supabase Auth (PKCE code, token_hash, recuperación)
      if (hash.includes('type=recovery') || search.includes('type=recovery') || hash.includes('reset-password')) {
        setCurrentPath('reset-password');
        return;
      }
      if (
        hash.includes('type=signup') ||
        hash.includes('auth-confirm') ||
        hash.includes('type=email_change') ||
        search.includes('type=signup') ||
        search.includes('code=')
      ) {
        setCurrentPath('auth-confirm');
        return;
      }

      // 2. Enrutamiento estándar con History API
      const parsed = parseLocation(window.location.pathname);
      setCurrentPath(parsed.path);

      if (parsed.path === 'exercise' && parsed.exerciseId) {
        const idx = exercises.findIndex((e) => e.id === parsed.exerciseId);
        if (idx !== -1) {
          // Solo resetear estado y borrador si el usuario navegó a un ejercicio distinto
          if (idx !== currentExerciseIndex) {
            setCurrentExerciseIndex(idx);
            const draft = persistence.getExerciseDraft(exercises[idx].id);
            setSqlCode(draft !== null ? draft : exercises[idx].initial_code);
            setExecutionStatus('IDLE');
            setResultError(undefined);
            setResultDiff(undefined);
          }
        } else {
          setPendingExerciseId(parsed.exerciseId);
        }
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [exercises]);

  // Cargar ejercicios e historial al inicio
  useEffect(() => {
    api.getExercises().then((data) => {
      if (data && data.length > 0) {
        setExercises(data);
        if (pendingExerciseId) {
          const idx = data.findIndex((e) => e.id === pendingExerciseId);
          if (idx !== -1) {
            setCurrentExerciseIndex(idx);
            const draft = persistence.getExerciseDraft(data[idx].id);
            setSqlCode(draft !== null ? draft : data[idx].initial_code);
            setExecutionStatus('IDLE');
            setResultError(undefined);
            setResultDiff(undefined);
            setPendingExerciseId(null);
          }
        }
      }
    });
    api.getTracks().then((data) => {
      if (data && data.length > 0) {
        setTracks(data);
      }
    });
    setQueryHistory(api.getQueryHistory());
  }, [pendingExerciseId]);

  // Sincronizar ejercicios superados, actividad diaria y consultas evaluadas
  useEffect(() => {
    setIsProgressLoading(true);
    persistence.getCompletedExerciseIds(profile?.id).then((completedIds) => {
      const completedSet = new Set(completedIds);
      setAuthoritativeCompletedIds(completedSet);

      setExercises((prev) =>
        prev.map((ex) => ({ ...ex, is_completed: completedSet.has(ex.id) }))
      );

      const isAuth = Boolean(profile?.id && !profile.id.startsWith('demo-'));
      if (isAuth && profile?.id) {
        const computed = computeOfficialTracksProgress(tracks, exercises, completedSet, false);
        setTracks(computed);

        // Carga de métricas reales del estudiante autenticado
        persistence.getUserDailyActivity(profile.id).then((act) => {
          setDailyActivity(act);
        });
        persistence.getUserTotalAttemptsCount(profile.id).then((cnt) => {
          setTotalAttemptsCount(cnt);
        });
        persistence.getUserAttemptsHistory(profile.id).then((hist) => {
          if (hist && hist.length > 0) {
            setQueryHistory(hist);
          }
        });
      } else {
        const computed = computeGuestTrialTracksProgress(tracks, exercises, completedSet);
        setTracks(computed);
        setDailyActivity([]);
        setTotalAttemptsCount(api.getQueryHistory().length);
      }
      setIsProgressLoading(false);
    });
  }, [profile?.id, exercises.length]);

  // Reto Recomendado Dinámico (Anti-Hardcode)
  const recommendedExercise = useMemo(() => {
    if (!exercises || exercises.length === 0) return FALLBACK_EXERCISES[0];
    const firstPending = exercises.find((ex) => !authoritativeCompletedIds.has(ex.id));
    return firstPending || exercises[exercises.length - 1] || FALLBACK_EXERCISES[0];
  }, [exercises, authoritativeCompletedIds]);

  // Metadatos de la Ruta y Reto Activo para el Hero Banner del Dashboard (Opción 1)
  const activeLearningData = useMemo(() => {
    if (!exercises || exercises.length === 0) {
      return {
        activeTrack: tracks[0],
        activeModule: tracks[0]?.modules?.[0],
        nextExercise: FALLBACK_EXERCISES[0],
        exerciseNumberInTrack: 1,
        trackTotal: 22,
        trackCompleted: 0,
        trackPercent: 0,
        moduleRemaining: 4,
        isAllCompleted: false,
      };
    }

    // 1. Identificar el siguiente ejercicio pendiente (o el último si completó todos)
    const nextExercise = exercises.find((ex) => !authoritativeCompletedIds.has(ex.id));
    const isAllCompleted = !nextExercise && authoritativeCompletedIds.size > 0;
    const targetExercise = nextExercise || exercises[exercises.length - 1];

    // 2. Determinar la ruta activa a la que pertenece targetExercise
    const activeTrack =
      tracks.find((t) => t.modules?.some((m) => m.id === targetExercise.module_id)) || tracks[0];

    // 3. Determinar el módulo activo
    const activeModule = activeTrack?.modules?.find((m) => m.id === targetExercise.module_id);

    // 4. Calcular métricas dentro de la ruta activa
    const trackExercises = exercises.filter((e) =>
      activeTrack?.modules?.some((m) => m.id === e.module_id)
    );
    const trackCompleted = trackExercises.filter((e) =>
      authoritativeCompletedIds.has(e.id)
    ).length;
    const trackTotal = trackExercises.length || activeTrack?.total_exercises || 1;
    const trackPercent = Math.min(100, Math.round((trackCompleted / trackTotal) * 100));

    // 5. Número del ejercicio dentro de la ruta (1-based)
    const exerciseIndexInTrack = trackExercises.findIndex((e) => e.id === targetExercise.id);
    const exerciseNumberInTrack = exerciseIndexInTrack >= 0 ? exerciseIndexInTrack + 1 : 1;

    // 6. Restantes en el módulo actual
    const moduleExercises = exercises.filter((e) => e.module_id === activeModule?.id);
    const moduleCompleted = moduleExercises.filter((e) =>
      authoritativeCompletedIds.has(e.id)
    ).length;
    const moduleRemaining = Math.max(0, moduleExercises.length - moduleCompleted);

    return {
      activeTrack,
      activeModule,
      nextExercise: targetExercise,
      exerciseNumberInTrack,
      trackTotal,
      trackCompleted,
      trackPercent,
      moduleRemaining,
      isAllCompleted,
    };
  }, [exercises, tracks, authoritativeCompletedIds]);

  // Evaluación Dinámica y Reactiva de Medallas / Logros
  const evaluatedAchievements = useMemo(() => {
    const minLatency = queryHistory.length > 0
      ? Math.min(...queryHistory.map((h) => h.execution_time_ms || 999))
      : undefined;

    return evaluateUserAchievements(
      ACHIEVEMENTS_CATALOG,
      profile,
      authoritativeCompletedIds,
      isAuthenticated ? totalAttemptsCount : queryHistory.length,
      minLatency
    );
  }, [profile, authoritativeCompletedIds, totalAttemptsCount, queryHistory, isAuthenticated]);

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
        'auth-confirm': 'Verificación de Cuenta | Qurio',
        'reset-password': 'Restablecer Contraseña | Qurio',
      };
      document.title = titles[currentPath] || 'Qurio | Aprende SQL. Piensa en queries.';
    }
  }, [currentPath, activeExercise]);

  // Cambiar de ejercicio activo
  const handleSelectExercise = (index: number) => {
    const ex = exercises[index];
    if (ex) {
      setCurrentExerciseIndex(index);
      const draft = persistence.getExerciseDraft(ex.id);
      setSqlCode(draft !== null ? draft : ex.initial_code);
      setHintsUnlocked(0);
      setExecutionStatus('IDLE');
      setResultError(undefined);
      setResultDiff(undefined);
      navigate('exercise', { exerciseId: ex.id }, true);
    }
  };

  const handleOpenExerciseFromCatalog = (ex: Exercise) => {
    const idx = exercises.findIndex((e) => e.id === ex.id);
    if (idx !== -1) {
      handleSelectExercise(idx);
    } else {
      setExercises((prev) => [ex, ...prev]);
      setCurrentExerciseIndex(0);
      const draft = persistence.getExerciseDraft(ex.id);
      setSqlCode(draft !== null ? draft : ex.initial_code);
      setExecutionStatus('IDLE');
      setResultError(undefined);
      setResultDiff(undefined);
    }
    navigate('exercise', { exerciseId: ex.id });
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

    const isAuth = Boolean(profile?.id && !profile.id.startsWith('demo-'));

    // Modo Invitado: si intenta ejecutar un reto fuera de los 3 de prueba, abrir modal de registro sin error
    if (!isAuth && !GUEST_TRIAL_EXERCISE_IDS.has(activeExercise.id)) {
      setExecutionStatus('IDLE');
      setGuestTrialModalOpen(true);
      return;
    }

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

      // Si el backend requiere autenticación tras la prueba, abrir modal preventivo sin pintar error
      if (evalResponse.status === 'AUTH_REQUIRED') {
        setExecutionStatus('IDLE');
        setGuestTrialModalOpen(true);
        return;
      }

      setExecutionTime(evalResponse.execution_time_ms);

      if (evalResponse.status === 'PASSED') {
        setExecutionStatus('SUCCESS');
        setRowCount(evalResponse.rows.length);
        setResultColumns(evalResponse.columns.map((name) => ({ name, type: 'column' })));
        setResultRows(evalResponse.rows);
        setAwardedXp(evalResponse.xp_awarded);

        // Persistir intento (para invitado guarda en qurio_guest_progress_v1; para autenticado el backend ya certificó vía RPC)
        await persistence.recordAttempt({
          userId: profile?.id,
          exerciseId: activeExercise.id,
          submittedSql: sqlCode.trim(),
          status: 'PASSED',
          executionTimeMs: evalResponse.execution_time_ms,
          hintsUsed: hintsUnlocked,
          xpAwarded: evalResponse.xp_awarded,
        });

        // Limpiar el borrador local al resolver exitosamente
        persistence.clearExerciseDraft(activeExercise.id);

        // Marcar ejercicio como completado en el estado
        setExercises((prev) =>
          prev.map((ex) => (ex.id === activeExercise.id ? { ...ex, is_completed: true } : ex))
        );

        // Actualizar progreso por ruta de forma aislada y estricta
        if (isAuth) {
          setAuthoritativeCompletedIds((prev) => {
            const next = new Set(prev);
            next.add(activeExercise.id);
            setTracks((currentTracks) =>
              computeOfficialTracksProgress(currentTracks, exercises, next, false)
            );
            return next;
          });
          refreshProfile();
          if (profile?.id) {
            persistence.getUserDailyActivity(profile.id).then(setDailyActivity);
            persistence.getUserTotalAttemptsCount(profile.id).then(setTotalAttemptsCount);
            persistence.getUserAttemptsHistory(profile.id).then((hist) => {
              if (hist && hist.length > 0) setQueryHistory(hist);
            });
          }
        } else {
          persistence.getCompletedExerciseIds().then((ids) => {
            const guestSet = new Set(ids);
            guestSet.add(activeExercise.id);
            setTracks((currentTracks) =>
              computeGuestTrialTracksProgress(currentTracks, exercises, guestSet)
            );
            // Comprobar si el invitado completó los 3 retos del trial para celebrar su avance
            const trialPassedCount = Array.from(guestSet).filter((id) =>
              GUEST_TRIAL_EXERCISE_IDS.has(id)
            ).length;
            if (trialPassedCount >= 3) {
              setGuestTrialModalOpen(true);
            }
          });
        }

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
  }, [activeExercise, sqlCode, hintsUnlocked, profile, exercises, isAuthenticated, refreshProfile]);

  // Avanzar al siguiente reto
  const handleNextExercise = () => {
    const nextIndex = (currentExerciseIndex + 1) % exercises.length;
    const isAuth = Boolean(profile?.id && !profile.id.startsWith('demo-'));
    const nextExercise = exercises[nextIndex];
    if (!isAuth && nextExercise && !GUEST_TRIAL_EXERCISE_IDS.has(nextExercise.id)) {
      setGuestTrialModalOpen(true);
      return;
    }
    handleSelectExercise(nextIndex);
  };

  // Manejo reactivo de cambios en el editor con preservación de borrador local (C-05)
  const handleSqlCodeChange = (newCode: string) => {
    setSqlCode(newCode);
    if (activeExercise?.id) {
      persistence.saveExerciseDraft(activeExercise.id, newCode, activeExercise.initial_code);
    }
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
                  onClick={() => navigate('tracks')}
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
                  onClick={toggleTheme}
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
                    onClick={() => setAuthModalOpen(true)}
                    leftIcon={<LogIn className="w-3.5 h-3.5" />}
                    className="text-xs py-1 px-3 ml-1 shadow-glow-primary"
                  >
                    Iniciar Sesión
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 pl-2 border-l border-border-subtle/50">
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
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
                      onClick={signOut}
                      className="p-1 rounded text-content-muted hover:text-error hover:bg-surface-card transition-colors"
                      title="Cerrar sesión"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          }
          sidebarContent={
            <ExerciseSpecPanel
              exercise={activeExercise}
              unlockedHintsCount={hintsUnlocked}
              onUnlockHint={handleUnlockHint}
              isCompleted={activeExercise.is_completed || executionStatus === 'SUCCESS'}
            />
          }
          editorContent={
            <MonacoEditorPanel
              value={sqlCode}
              onChange={handleSqlCodeChange}
              onExecute={handleExecuteSolution}
              onReset={() => {
                if (activeExercise?.id) {
                  persistence.clearExerciseDraft(activeExercise.id);
                }
                setSqlCode(activeExercise.initial_code);
                setExecutionStatus('IDLE');
                setResultError(undefined);
                setResultDiff(undefined);
              }}
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

        {/* Modal de Prueba de Invitado Superada */}
        <GuestTrialCompleteModal
          isOpen={guestTrialModalOpen}
          onClose={() => setGuestTrialModalOpen(false)}
          onOpenSignUp={() => {
            setGuestTrialModalOpen(false);
            setAuthModalInitialMode('signup');
            setAuthModalOpen(true);
          }}
          onOpenSignIn={() => {
            setGuestTrialModalOpen(false);
            setAuthModalInitialMode('signin');
            setAuthModalOpen(true);
          }}
          solvedCount={3}
          earnedXp={100}
        />

        {/* Modal de Autenticación Supabase */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalInitialMode}
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
      case 'auth-confirm':
        return 'Verificación de Cuenta';
      case 'reset-password':
        return 'Restablecer Contraseña';
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
        onNavigate={(path) => navigate(path as AppPath)}
        title={getHeaderTitle()}
        onOpenAuth={() => setAuthModalOpen(true)}
      >
        {/* VISTA A: RUTAS DE APRENDIZAJE */}
        {currentPath === 'tracks' && (
          <TracksView
            tracks={tracks}
            exercises={exercises}
            onSelectExercise={handleOpenExerciseFromCatalog}
            isLoading={isProgressLoading}
          />
        )}

        {/* VISTA B: SQL PLAYGROUND LIBRE */}
        {currentPath === 'playground' && (
          <React.Suspense fallback={<ViewLoadingFallback />}>
            <SqlPlaygroundView tables={tables} initialQuery={playgroundInitialQuery} />
          </React.Suspense>
        )}

        {/* VISTA C: LOGROS & MEDALLAS */}
        {currentPath === 'achievements' && (
          <React.Suspense fallback={<ViewLoadingFallback />}>
            <AchievementsView
              achievements={evaluatedAchievements}
              totalXp={profile?.total_xp ?? 0}
              level={profile?.current_level ?? 1}
            />
          </React.Suspense>
        )}

        {/* VISTA D: MI PERFIL */}
        {currentPath === 'profile' && (
          <React.Suspense fallback={<ViewLoadingFallback />}>
            <UserProfileView
              profile={profile}
              history={queryHistory}
              completedCount={authoritativeCompletedIds.size}
              totalExercises={exercises.length}
              dailyActivity={dailyActivity}
              onOpenPlayground={(query?: string) => {
                if (query) {
                  setPlaygroundInitialQuery(query);
                }
                navigate('playground');
              }}
              onOpenAuth={() => setAuthModalOpen(true)}
              isCloudAuth={isCloudAuth}
            />
          </React.Suspense>
        )}

        {/* VISTA E: ERROR 404 (RELATION NOT FOUND) */}
        {currentPath === 'not-found' && (
          <React.Suspense fallback={<ViewLoadingFallback />}>
            <NotFoundView
              missingPath="v_reporte_anual"
              onNavigate={(path) => navigate(path as AppPath)}
            />
          </React.Suspense>
        )}

        {/* VISTA F: CONFIRMACIÓN DE CUENTA SUPABASE (EMAIL VERIFICATION) */}
        {currentPath === 'auth-confirm' && (
          <React.Suspense fallback={<ViewLoadingFallback />}>
            <AuthConfirmView
              onNavigate={(path) => navigate(path as AppPath)}
              userEmail={profile?.username ? `${profile.username}@qurio.dev` : undefined}
            />
          </React.Suspense>
        )}

        {/* VISTA G: RESTABLECER CONTRASEÑA */}
        {currentPath === 'reset-password' && (
          <React.Suspense fallback={<ViewLoadingFallback />}>
            <ResetPasswordView
              onNavigate={(path) => navigate(path as AppPath)}
            />
          </React.Suspense>
        )}

      {/* VISTA E: DASHBOARD PRINCIPAL */}
      {currentPath === 'dashboard' && (
        <div className="flex flex-col gap-8 pb-12">
          {/* Banner de Bienvenida y Rendimiento del Sandbox */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface to-primary/[0.04] p-6 sm:p-7 border border-border-subtle/80 shadow-md">
            <div className="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-primary/[0.07] dark:bg-primary/[0.12] blur-3xl pointer-events-none" />
            <div className="absolute right-72 -bottom-20 w-64 h-64 rounded-full bg-cyan-accent/[0.05] dark:bg-cyan-accent/[0.08] blur-3xl pointer-events-none" />

            {isAuthenticated ? (
              /* ESTADO AUTENTICADO: CENTRO DE AVANCE CONTINUO (OPCIÓN 1) */
              <div className="relative z-10 flex flex-col gap-5">
                {/* Fila Superior: Píldora de Ruta/Módulo y Latencia del Sandbox */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald/10 border border-emerald/25 text-[11px] font-mono text-emerald font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                    <span>Ruta Activa • {activeLearningData.activeTrack?.title || 'SQL Foundations'}</span>
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
                    <span>PostgreSQL 16 Sandbox • 3.6ms (pg_stat_ready)</span>
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
                    {activeLearningData.nextExercise?.prompt}
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
                      Global: {authoritativeCompletedIds.size} / {exercises.length} ({Math.round((authoritativeCompletedIds.size / (exercises.length || 1)) * 100)}%)
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
                        const targetIdx = exercises.findIndex((e) => e.id === activeLearningData.nextExercise.id);
                        handleSelectExercise(targetIdx >= 0 ? targetIdx : 0);
                        navigate('exercise', { exerciseId: activeLearningData.nextExercise.id });
                      }
                    }}
                    className="shadow-glow-primary hover:shadow-primary px-5 shrink-0 whitespace-nowrap text-xs sm:text-sm font-semibold"
                  >
                    Continuar Reto #{activeLearningData.exerciseNumberInTrack}
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => navigate('tracks')}
                    className="px-4 shrink-0 whitespace-nowrap text-xs hover:border-cyan-accent/50"
                  >
                    Ver Syllabus Completo
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
                    ¡Bienvenido a Qurio! <span className="text-content-secondary font-normal">Aprende SQL pensando en queries.</span>
                  </h1>

                  <p className="text-xs text-content-secondary leading-relaxed">
                    Estás conectado a un motor PostgreSQL 16 real en Docker. Resuelve hasta 3 retos prácticos de SQL Foundations con evaluación semántica de inmediato, sin necesidad de crear cuenta.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0">
                  <div className="flex flex-col items-start sm:items-end pr-2 font-mono shrink-0 whitespace-nowrap">
                    <span className="text-[10px] text-content-muted uppercase tracking-wider">Latencia Sandbox</span>
                    <span className="text-xs text-content-secondary font-semibold flex items-center gap-1.5 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald shrink-0" /> 3.6ms (pg_stat_ready)
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                    <Button
                      variant="primary"
                      size="md"
                      kbdShortcut="⌘↵"
                      leftIcon={<Play className="w-4 h-4 fill-white shrink-0" />}
                      onClick={() => {
                        const targetIdx = exercises.findIndex((e) => e.id === recommendedExercise?.id);
                        handleSelectExercise(targetIdx >= 0 ? targetIdx : 0);
                        navigate('exercise', { exerciseId: recommendedExercise?.id });
                      }}
                      className="shadow-glow-primary hover:shadow-primary px-5 shrink-0 whitespace-nowrap"
                    >
                      Comenzar Reto 1
                    </Button>

                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setAuthModalOpen(true)}
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
              value={`${isAuthenticated ? totalAttemptsCount : queryHistory.length}`}
              subValue={isAuthenticated ? 'Total histórico evaluado' : 'En sesión local'}
              icon={<Terminal className="w-4 h-4" />}
              accent="cyan"
            />
            <MetricTile
              label={isAuthenticated ? 'Retos Superados' : 'Retos de Prueba'}
              value={
                isAuthenticated
                  ? `${authoritativeCompletedIds.size} / ${exercises.length}`
                  : `${Math.min(authoritativeCompletedIds.size, 3)} / 3`
              }
              subValue={isAuthenticated ? 'Progreso oficial verificado' : 'Prueba libre sin registro'}
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
                    <span className="text-xs font-mono text-content-muted">
                      {recommendedExercise?.difficulty || 'Principiante'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-content-primary">
                    {recommendedExercise?.title || 'Reto SQL'}
                  </h3>

                  <p className="text-xs text-content-secondary leading-relaxed">
                    {recommendedExercise?.prompt || 'Consulta la base de datos relacional con SQL.'}
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
                      onClick={() => setCurrentPath('tracks')}
                      className="text-xs"
                    >
                      Ver Rutas
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const targetIdx = exercises.findIndex((e) => e.id === recommendedExercise?.id);
                        handleSelectExercise(targetIdx >= 0 ? targetIdx : 0);
                        navigate('exercise', { exerciseId: recommendedExercise?.id });
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

    {/* Modal de Prueba de Invitado Superada */}
    <GuestTrialCompleteModal
      isOpen={guestTrialModalOpen}
      onClose={() => setGuestTrialModalOpen(false)}
      onOpenSignUp={() => {
        setGuestTrialModalOpen(false);
        setAuthModalInitialMode('signup');
        setAuthModalOpen(true);
      }}
      onOpenSignIn={() => {
        setGuestTrialModalOpen(false);
        setAuthModalInitialMode('signin');
        setAuthModalOpen(true);
      }}
      solvedCount={3}
      earnedXp={100}
    />

    {/* Modal de Autenticación Supabase (Login / Registro / JWT) */}
    <AuthModal
      isOpen={authModalOpen}
      onClose={() => setAuthModalOpen(false)}
      initialMode={authModalInitialMode}
    />
  </>
  );
};

export default App;

