import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Exercise,
  Track,
  TableSchemaInfo,
  QueryHistoryItem,
  AttemptStats,
  UserProfile,
  Module,
} from '@/types';
import {
  api,
  INITIAL_EXERCISE_STUB,
  ECOMMERCE_TABLES_SCHEMA,
  ACHIEVEMENTS_CATALOG,
  evaluateUserAchievements,
} from '@/lib/api';
import { persistence } from '@/lib/persistence';
import { computeOfficialTracksProgress, computeGuestTrialTracksProgress } from '@/lib/progress';

export const GUEST_TRIAL_EXERCISE_IDS = new Set([
  'e0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000008',
  'e0000000-0000-0000-0000-000000000019',
]);

export interface ActiveLearningData {
  activeTrack?: Track;
  activeModule?: Module;
  nextExercise: Exercise;
  exerciseNumberInTrack: number;
  trackTotal: number;
  trackCompleted: number;
  trackPercent: number;
  moduleRemaining: number;
  isAllCompleted: boolean;
}

export interface UseCurriculumStateOptions {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  guestSyncCount?: number;
  refreshProfile: () => Promise<void> | void;
}

export function useCurriculumState({
  profile,
  isAuthenticated,
  guestSyncCount,
  refreshProfile,
}: UseCurriculumStateOptions) {
  const [exercises, setExercises] = useState<Exercise[]>([INITIAL_EXERCISE_STUB]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tables] = useState<TableSchemaInfo[]>(ECOMMERCE_TABLES_SCHEMA);
  const [authoritativeCompletedIds, setAuthoritativeCompletedIds] = useState<Set<string>>(new Set());
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [dailyActivity, setDailyActivity] = useState<
    { activity_date: string; exercises_solved: number; xp_earned: number }[]
  >([]);
  const [totalAttemptsCount, setTotalAttemptsCount] = useState<number>(0);
  const [attemptStats, setAttemptStats] = useState<AttemptStats>({
    totalAttempts: 0,
    passedAttempts: 0,
    fastAttemptsUnder50ms: 0,
    zeroHintPassedAttempts: 0,
  });

  const completedIdsRef = useRef<Set<string>>(authoritativeCompletedIds);
  completedIdsRef.current = authoritativeCompletedIds;

  // 1. Descarga única del catálogo curricular al montar la aplicación (H02, H03)
  useEffect(() => {
    let cancelled = false;

    api
      .getExercises()
      .then((data) => {
        if (cancelled || !data || data.length === 0) return;
        setExercises((prev) =>
          data.map((ex) => {
            const prevEx = prev.find((p) => p.id === ex.id);
            return {
              ...ex,
              is_completed:
                completedIdsRef.current.has(ex.id) || Boolean(prevEx?.is_completed),
            };
          })
        );
      })
      .catch((err) => {
        console.error('[useCurriculumState] Error cargando ejercicios:', err);
      });

    api
      .getTracks()
      .then((data) => {
        if (cancelled || !data || data.length === 0) return;
        setTracks(data);
      })
      .catch((err) => {
        console.error('[useCurriculumState] Error cargando rutas:', err);
      });

    setQueryHistory(api.getQueryHistory());

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Sincronización resiliente de ejercicios superados, actividad diaria e historial (H03)
  useEffect(() => {
    let cancelled = false;

    const syncUserProgress = async () => {
      setIsProgressLoading(true);
      try {
        const completedIds = await persistence.getCompletedExerciseIds(profile?.id);
        if (cancelled) return;

        const completedSet = new Set(completedIds);
        setAuthoritativeCompletedIds(completedSet);

        setExercises((prev) =>
          prev.map((ex) => ({ ...ex, is_completed: completedSet.has(ex.id) }))
        );

        const isAuth = Boolean(profile?.id && !profile.id.startsWith('demo-'));
        if (isAuth && profile?.id) {
          const [actRes, cntRes, statsRes, histRes] = await Promise.allSettled([
            persistence.getUserDailyActivity(profile.id),
            persistence.getUserTotalAttemptsCount(profile.id),
            persistence.getUserAttemptStats(profile.id),
            persistence.getUserAttemptsHistory(profile.id),
          ]);

          if (cancelled) return;
          if (actRes.status === 'fulfilled') setDailyActivity(actRes.value);
          if (cntRes.status === 'fulfilled') setTotalAttemptsCount(cntRes.value);
          if (statsRes.status === 'fulfilled') setAttemptStats(statsRes.value);
          if (histRes.status === 'fulfilled' && histRes.value && histRes.value.length > 0) {
            setQueryHistory(histRes.value);
          }
        } else {
          setDailyActivity([]);
          setTotalAttemptsCount(api.getQueryHistory().length);
          const stats = await persistence.getUserAttemptStats();
          if (!cancelled) {
            setAttemptStats(stats);
          }
        }
      } catch (err) {
        console.error('[useCurriculumState] Error sincronizando progreso:', err);
      } finally {
        if (!cancelled) {
          setIsProgressLoading(false);
        }
      }
    };

    syncUserProgress();

    return () => {
      cancelled = true;
    };
  }, [profile?.id, guestSyncCount, exercises.length]);

  // 3. Recomputar progreso por ruta de forma reactiva y pura (H05)
  useEffect(() => {
    if (!exercises || exercises.length === 0 || tracks.length === 0) return;
    const isAuth = Boolean(profile?.id && !profile.id.startsWith('demo-'));
    if (isAuth && profile?.id) {
      setTracks((currentTracks) =>
        computeOfficialTracksProgress(currentTracks, exercises, authoritativeCompletedIds, false)
      );
    } else {
      setTracks((currentTracks) =>
        computeGuestTrialTracksProgress(currentTracks, exercises, authoritativeCompletedIds)
      );
    }
  }, [authoritativeCompletedIds, exercises, tracks.length, profile?.id]);

  // Reto Recomendado Dinámico
  const recommendedExercise = useMemo(() => {
    if (!exercises || exercises.length === 0) return INITIAL_EXERCISE_STUB;
    const firstPending = exercises.find((ex) => !authoritativeCompletedIds.has(ex.id));
    return firstPending || exercises[exercises.length - 1] || INITIAL_EXERCISE_STUB;
  }, [exercises, authoritativeCompletedIds]);

  // Metadatos de la Ruta y Reto Activo para el Hero Banner del Dashboard
  const activeLearningData: ActiveLearningData = useMemo(() => {
    if (!exercises || exercises.length === 0) {
      return {
        activeTrack: tracks[0],
        activeModule: tracks[0]?.modules?.[0],
        nextExercise: INITIAL_EXERCISE_STUB,
        exerciseNumberInTrack: 1,
        trackTotal: 22,
        trackCompleted: 0,
        trackPercent: 0,
        moduleRemaining: 4,
        isAllCompleted: false,
      };
    }

    const nextExercise = exercises.find((ex) => !authoritativeCompletedIds.has(ex.id));
    const isAllCompleted = !nextExercise && authoritativeCompletedIds.size > 0;
    const targetExercise = nextExercise || exercises[exercises.length - 1];

    const activeTrack =
      tracks.find((t) => t.modules?.some((m) => m.id === targetExercise.module_id)) || tracks[0];
    const activeModule = activeTrack?.modules?.find((m) => m.id === targetExercise.module_id);

    const trackExercises = exercises.filter((e) =>
      activeTrack?.modules?.some((m) => m.id === e.module_id)
    );
    const trackCompleted = trackExercises.filter((e) =>
      authoritativeCompletedIds.has(e.id)
    ).length;
    const trackTotal = trackExercises.length || activeTrack?.total_exercises || 1;
    const trackPercent = Math.min(100, Math.round((trackCompleted / trackTotal) * 100));

    const exerciseIndexInTrack = trackExercises.findIndex((e) => e.id === targetExercise.id);
    const exerciseNumberInTrack = exerciseIndexInTrack >= 0 ? exerciseIndexInTrack + 1 : 1;

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
    const minLatency =
      queryHistory.length > 0
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

  // Registro determinista de solución superada sin efectos secundarios impuros ni condiciones de carrera (H05, H11)
  const recordPassedSubmission = useCallback(
    async (params: {
      exerciseId: string;
      submittedSql: string;
      executionTimeMs: number;
      rowCount: number;
      isAuth: boolean;
      onGuestTrialCompleted: () => void;
    }) => {
      const { exerciseId, submittedSql, executionTimeMs, rowCount, isAuth, onGuestTrialCompleted } =
        params;

      // 1. Marcar ejercicio como completado en el catálogo en memoria
      setExercises((prev) =>
        prev.map((ex) => (ex.id === exerciseId ? { ...ex, is_completed: true } : ex))
      );

      // 2. Guardar en historial local como respaldo inmediato
      const newHistoryEntry: QueryHistoryItem = {
        id: `sol-${Date.now()}`,
        query: submittedSql,
        executed_at: 'Hace un momento',
        status: 'SUCCESS',
        execution_time_ms: executionTimeMs,
        row_count: rowCount,
      };
      api.saveQueryHistory(newHistoryEntry);

      // 3. Actualizar progreso según modo de sesión (H05, H11)
      if (isAuth) {
        setAuthoritativeCompletedIds((prev) => {
          const next = new Set(prev);
          next.add(exerciseId);
          return next;
        });
        refreshProfile();

        if (profile?.id) {
          const [actRes, cntRes, statsRes, histRes] = await Promise.allSettled([
            persistence.getUserDailyActivity(profile.id),
            persistence.getUserTotalAttemptsCount(profile.id),
            persistence.getUserAttemptStats(profile.id),
            persistence.getUserAttemptsHistory(profile.id),
          ]);
          if (actRes.status === 'fulfilled') setDailyActivity(actRes.value);
          if (cntRes.status === 'fulfilled') setTotalAttemptsCount(cntRes.value);
          if (statsRes.status === 'fulfilled') setAttemptStats(statsRes.value);
          if (histRes.status === 'fulfilled' && histRes.value && histRes.value.length > 0) {
            setQueryHistory(histRes.value);
          } else {
            setQueryHistory((prev) => [newHistoryEntry, ...prev]);
          }
        }
      } else {
        setQueryHistory(api.getQueryHistory());
        try {
          const ids = await persistence.getCompletedExerciseIds();
          const guestSet = new Set(ids);
          guestSet.add(exerciseId);
          setAuthoritativeCompletedIds(guestSet);

          const trialPassedCount = Array.from(guestSet).filter((id) =>
            GUEST_TRIAL_EXERCISE_IDS.has(id)
          ).length;
          if (trialPassedCount >= 3) {
            onGuestTrialCompleted();
          }
        } catch (err) {
          console.error('[useCurriculumState] Error actualizando progreso invitado:', err);
        }
      }
    },
    [profile?.id, refreshProfile]
  );

  return {
    exercises,
    setExercises,
    tracks,
    tables,
    authoritativeCompletedIds,
    isProgressLoading,
    queryHistory,
    dailyActivity,
    totalAttemptsCount,
    attemptStats,
    recommendedExercise,
    activeLearningData,
    evaluatedAchievements,
    recordPassedSubmission,
  };
}
