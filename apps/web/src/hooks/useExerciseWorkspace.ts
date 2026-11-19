import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Exercise,
  EvaluationResponse,
  DiffResult,
  ColumnInfo,
  UserProfile,
  AppPath,
} from '@/types';
import { api, INITIAL_EXERCISE_STUB } from '@/lib/api';
import { persistence } from '@/lib/persistence';
import { RouteParams } from '@/lib/routing';
import { GUEST_TRIAL_EXERCISE_IDS } from './useCurriculumState';

export interface UseExerciseWorkspaceOptions {
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  profile: UserProfile | null;
  isAdmin: boolean;
  navigate: (newPath: AppPath, params?: RouteParams, replace?: boolean) => void;
  onOpenGuestTrialModal: () => void;
  recordPassedSubmission: (params: {
    exerciseId: string;
    submittedSql: string;
    executionTimeMs: number;
    rowCount: number;
    isAuth: boolean;
    onGuestTrialCompleted: () => void;
  }) => Promise<void>;
}

export function useExerciseWorkspace({
  exercises,
  setExercises,
  profile,
  isAdmin,
  navigate,
  onOpenGuestTrialModal,
  recordPassedSubmission,
}: UseExerciseWorkspaceOptions) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [pendingExerciseId, setPendingExerciseId] = useState<string | null>(null);
  const [sqlCode, setSqlCode] = useState(
    () =>
      persistence.getExerciseDraft(INITIAL_EXERCISE_STUB.id) ??
      INITIAL_EXERCISE_STUB.initial_code
  );
  const [hintsUnlocked, setHintsUnlocked] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isResultsExpanded, setIsResultsExpanded] = useState(false);

  // Estados de Resultados del IDE
  const [executionStatus, setExecutionStatus] = useState<
    'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR' | 'FAILED'
  >('IDLE');
  const [executionTime, setExecutionTime] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [resultColumns, setResultColumns] = useState<ColumnInfo[]>([]);
  const [resultRows, setResultRows] = useState<unknown[][]>([]);
  const [resultError, setResultError] = useState<string | undefined>();
  const [resultDiff, setResultDiff] = useState<DiffResult | undefined>();
  const [resultMessage, setResultMessage] = useState<string | undefined>();
  const [awardedXp, setAwardedXp] = useState(0);

  // Estados de Apoyo Pedagógico y Revelación de Solución Oficial
  const [failedAttemptsByExercise, setFailedAttemptsByExercise] = useState<Record<string, number>>(
    {}
  );
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, string>>({});
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isRevealingSolution, setIsRevealingSolution] = useState(false);
  const [isTrialResult, setIsTrialResult] = useState(false);

  const activeExercise = exercises[currentExerciseIndex] || INITIAL_EXERCISE_STUB;

  // Referencias mutables para evitar stale closures y recreación en cada pulsación (H04, H10)
  const sqlCodeRef = useRef(sqlCode);
  sqlCodeRef.current = sqlCode;

  const isExecutingRef = useRef(isExecuting);
  isExecutingRef.current = isExecuting;

  const currentExerciseIndexRef = useRef(currentExerciseIndex);
  currentExerciseIndexRef.current = currentExerciseIndex;

  const exercisesRef = useRef(exercises);
  exercisesRef.current = exercises;

  // Función centralizada para limpiar y cargar el estado de un reto (H04)
  const applyExerciseState = useCallback((ex: Exercise, index: number) => {
    setCurrentExerciseIndex(index);
    const draft = persistence.getExerciseDraft(ex.id);
    setSqlCode(draft !== null ? draft : ex.initial_code);
    setHintsUnlocked(0);
    setIsTrialResult(false);
    setExecutionStatus('IDLE');
    setRowCount(0);
    setResultColumns([]);
    setResultRows([]);
    setResultError(undefined);
    setResultDiff(undefined);
    setResultMessage(undefined);
  }, []);

  // Resolver pendingExerciseId en cuanto el catálogo de ejercicios termine de cargar (H02)
  useEffect(() => {
    if (!pendingExerciseId || exercises.length === 0) return;
    const idx = exercises.findIndex((e) => e.id === pendingExerciseId);
    if (idx !== -1) {
      applyExerciseState(exercises[idx], idx);
      setPendingExerciseId(null);
    }
  }, [exercises, pendingExerciseId, applyExerciseState]);

  // Callback invocado desde useAppRouter ante enlaces directos o eventos popstate (H04)
  const handleLocationExerciseId = useCallback(
    (exerciseId: string) => {
      const currentList = exercisesRef.current;
      const idx = currentList.findIndex((e) => e.id === exerciseId);
      if (idx !== -1) {
        if (idx !== currentExerciseIndexRef.current || currentList[idx].id !== activeExercise.id) {
          applyExerciseState(currentList[idx], idx);
        } else {
          // Asegurar que el borrador persista tras F5 en el reto inicial (T04 E2E)
          const draft = persistence.getExerciseDraft(currentList[idx].id);
          if (draft !== null) {
            setSqlCode(draft);
          }
        }
      } else {
        setPendingExerciseId(exerciseId);
      }
    },
    [activeExercise.id, applyExerciseState]
  );

  // Cambiar de ejercicio activo con control explícito de historial (H08)
  const handleSelectExercise = useCallback(
    (index: number, replace = false) => {
      const ex = exercises[index];
      if (ex) {
        applyExerciseState(ex, index);
        navigate('exercise', { exerciseId: ex.id }, replace);
      }
    },
    [exercises, applyExerciseState, navigate]
  );

  const handleOpenExerciseFromCatalog = useCallback(
    (ex: Exercise) => {
      const idx = exercises.findIndex((e) => e.id === ex.id);
      if (idx !== -1) {
        handleSelectExercise(idx, false);
      } else {
        setExercises((prev) => [ex, ...prev]);
        applyExerciseState(ex, 0);
        navigate('exercise', { exerciseId: ex.id }, false);
      }
    },
    [exercises, handleSelectExercise, setExercises, applyExerciseState, navigate]
  );

  const handleUnlockHint = useCallback(() => {
    const totalHints = activeExercise.hints ? activeExercise.hints.length : 0;
    setHintsUnlocked((prev) => (prev < totalHints ? prev + 1 : prev));
  }, [activeExercise.hints]);

  const handleLoadSolutionIntoEditor = useCallback(
    (solutionSql: string) => {
      setSqlCode(solutionSql);
      if (activeExercise?.id) {
        persistence.saveExerciseDraft(activeExercise.id, solutionSql, activeExercise.initial_code);
      }
    },
    [activeExercise]
  );

  const handleAdminUnlockAllHints = useCallback(() => {
    if (!isAdmin) return;
    const totalHints = activeExercise.hints ? activeExercise.hints.length : 0;
    setHintsUnlocked(totalHints);
  }, [isAdmin, activeExercise.hints]);

  const handleAdminInstantReveal = useCallback(async () => {
    if (!isAdmin) return;
    setIsRevealingSolution(true);
    try {
      const resp = await api.revealSolution(activeExercise.id, 0);
      setRevealedSolutions((prev) => ({
        ...prev,
        [activeExercise.id]: resp.solution_query,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'No se pudo obtener la solución oficial en modo QA.';
      setResultError(message);
    } finally {
      setIsRevealingSolution(false);
    }
  }, [isAdmin, activeExercise.id]);

  // Confirmar y solicitar al backend la solución oficial tras >= 2 intentos fallidos o Admin QA (H10)
  const handleConfirmRevealSolution = useCallback(async () => {
    const failedCount = failedAttemptsByExercise[activeExercise.id] || 0;
    if (failedCount < 2 && !isAdmin) return;

    setIsRevealingSolution(true);
    try {
      const resp = await api.revealSolution(activeExercise.id, failedCount);
      setRevealedSolutions((prev) => ({
        ...prev,
        [activeExercise.id]: resp.solution_query,
      }));
      setIsRevealModalOpen(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo obtener la solución oficial del ejercicio.';
      setResultError(message);
      setIsRevealModalOpen(false);
    } finally {
      setIsRevealingSolution(false);
    }
  }, [activeExercise.id, failedAttemptsByExercise, isAdmin]);

  // Ejecución exploratoria libre dentro de un reto estabilizada con ref (H10)
  const handleRunExerciseTrial = useCallback(async (trialSql?: string) => {
    const currentSql = trialSql && trialSql.trim() ? trialSql : sqlCodeRef.current;
    if (!currentSql.trim() || isExecutingRef.current) return;

    setIsExecuting(true);
    setIsTrialResult(true);
    setExecutionStatus('LOADING');
    setResultError(undefined);
    setResultDiff(undefined);
    setResultMessage(undefined);
    setAwardedXp(0);

    try {
      const res = await api.executePlayground(
        currentSql,
        'ecommerce_sandbox',
        activeExercise.id
      );
      setExecutionTime(res.execution_time_ms);

      if (res.status === 'SUCCESS') {
        setExecutionStatus('SUCCESS');
        setRowCount(res.row_count);
        setResultColumns(res.columns);
        setResultRows(res.rows);
        setResultMessage(
          'Ejecución exploratoria (sin evaluar). Pulsa "Enviar Solución" cuando estés listo.'
        );
      } else {
        setExecutionStatus('ERROR');
        setRowCount(0);
        setResultColumns([]);
        setResultRows([]);
        setResultError(res.error || 'No se pudo ejecutar la consulta exploratoria.');
      }
    } catch (err: unknown) {
      setExecutionStatus('ERROR');
      const message =
        err instanceof Error ? err.message : 'Error al probar consulta en el sandbox.';
      setResultError(message);
    } finally {
      setIsExecuting(false);
    }
  }, [activeExercise.id]);

  // Ejecución / Evaluación Semántica End-to-End estabilizada con ref (H10)
  const handleExecuteSolution = useCallback(async () => {
    const currentSql = sqlCodeRef.current;
    if (!currentSql.trim()) return;
    setIsTrialResult(false);

    const isAuth = Boolean(profile?.id && !profile.id.startsWith('demo-'));

    // Modo Invitado: si intenta ejecutar un reto fuera de los 3 de prueba, abrir modal de registro
    if (!isAuth && !GUEST_TRIAL_EXERCISE_IDS.has(activeExercise.id)) {
      setExecutionStatus('IDLE');
      onOpenGuestTrialModal();
      return;
    }

    setIsExecuting(true);
    setExecutionStatus('LOADING');
    setResultError(undefined);
    setResultDiff(undefined);

    try {
      const isSolutionViewed = Boolean(revealedSolutions[activeExercise.id]);
      const evalResponse: EvaluationResponse = await api.submitSolution(
        activeExercise.id,
        currentSql,
        hintsUnlocked,
        isSolutionViewed
      );

      if (evalResponse.status === 'AUTH_REQUIRED') {
        setExecutionStatus('IDLE');
        onOpenGuestTrialModal();
        return;
      }

      setExecutionTime(evalResponse.execution_time_ms);

      if (evalResponse.status === 'PASSED') {
        setExecutionStatus('SUCCESS');
        setRowCount(evalResponse.rows.length);
        setResultColumns(evalResponse.columns.map((name) => ({ name, type: 'column' })));
        setResultRows(evalResponse.rows);
        setAwardedXp(evalResponse.xp_awarded);

        await persistence.recordAttempt({
          userId: profile?.id,
          exerciseId: activeExercise.id,
          submittedSql: currentSql.trim(),
          status: 'PASSED',
          executionTimeMs: evalResponse.execution_time_ms,
          hintsUsed: hintsUnlocked,
          xpAwarded: evalResponse.xp_awarded,
        });

        persistence.clearExerciseDraft(activeExercise.id);

        await recordPassedSubmission({
          exerciseId: activeExercise.id,
          submittedSql: currentSql.trim(),
          executionTimeMs: evalResponse.execution_time_ms,
          rowCount: evalResponse.rows.length,
          isAuth,
          onGuestTrialCompleted: onOpenGuestTrialModal,
        });
      } else if (evalResponse.status === 'FAILED') {
        setExecutionStatus('FAILED');
        setRowCount(evalResponse.rows ? evalResponse.rows.length : 0);
        setResultColumns(
          evalResponse.columns
            ? evalResponse.columns.map((name) => ({ name, type: 'column' }))
            : []
        );
        setResultRows(evalResponse.rows || []);
        setResultDiff(evalResponse.diff);
        setResultMessage(evalResponse.message);

        setFailedAttemptsByExercise((prev) => ({
          ...prev,
          [activeExercise.id]: (prev[activeExercise.id] || 0) + 1,
        }));

        await persistence.recordAttempt({
          userId: profile?.id,
          exerciseId: activeExercise.id,
          submittedSql: currentSql.trim(),
          status: 'FAILED',
          executionTimeMs: evalResponse.execution_time_ms || 0,
          hintsUsed: hintsUnlocked,
          xpAwarded: 0,
          errorMessage: evalResponse.message,
        });
      } else {
        setExecutionStatus('ERROR');
        setResultError(evalResponse.error || evalResponse.message);

        setFailedAttemptsByExercise((prev) => ({
          ...prev,
          [activeExercise.id]: (prev[activeExercise.id] || 0) + 1,
        }));

        await persistence.recordAttempt({
          userId: profile?.id,
          exerciseId: activeExercise.id,
          submittedSql: currentSql.trim(),
          status: 'ERROR',
          executionTimeMs: evalResponse.execution_time_ms || 0,
          hintsUsed: hintsUnlocked,
          xpAwarded: 0,
          errorMessage: evalResponse.error || evalResponse.message,
        });
      }
    } catch (err: unknown) {
      setExecutionStatus('ERROR');
      const message =
        err instanceof Error
          ? err.message
          : 'Error de conexión con el evaluador semántico en FastAPI.';
      setResultError(message);
      setFailedAttemptsByExercise((prev) => ({
        ...prev,
        [activeExercise.id]: (prev[activeExercise.id] || 0) + 1,
      }));
    } finally {
      setIsExecuting(false);
    }
  }, [
    activeExercise.id,
    hintsUnlocked,
    profile?.id,
    revealedSolutions,
    onOpenGuestTrialModal,
    recordPassedSubmission,
  ]);

  const handleNextExercise = useCallback(() => {
    const nextIndex = (currentExerciseIndex + 1) % exercises.length;
    const isAuth = Boolean(profile?.id && !profile.id.startsWith('demo-'));
    const nextExercise = exercises[nextIndex];
    if (!isAuth && nextExercise && !GUEST_TRIAL_EXERCISE_IDS.has(nextExercise.id)) {
      onOpenGuestTrialModal();
      return;
    }
    handleSelectExercise(nextIndex, false);
  }, [currentExerciseIndex, exercises, profile?.id, onOpenGuestTrialModal, handleSelectExercise]);

  const handleSqlCodeChange = useCallback(
    (newCode: string) => {
      setSqlCode(newCode);
      if (activeExercise?.id) {
        persistence.saveExerciseDraft(activeExercise.id, newCode, activeExercise.initial_code);
      }
    },
    [activeExercise.id, activeExercise.initial_code]
  );

  const handleResetEditor = useCallback(() => {
    if (activeExercise?.id) {
      persistence.clearExerciseDraft(activeExercise.id);
    }
    setSqlCode(activeExercise.initial_code);
    setIsTrialResult(false);
    setExecutionStatus('IDLE');
    setResultError(undefined);
    setResultDiff(undefined);
    setResultMessage(undefined);
  }, [activeExercise.id, activeExercise.initial_code]);

  return {
    currentExerciseIndex,
    activeExercise,
    sqlCode,
    hintsUnlocked,
    isExecuting,
    isResultsExpanded,
    setIsResultsExpanded,
    executionStatus,
    executionTime,
    rowCount,
    resultColumns,
    resultRows,
    resultError,
    resultDiff,
    resultMessage,
    awardedXp,
    failedAttemptsByExercise,
    revealedSolutions,
    isRevealModalOpen,
    setIsRevealModalOpen,
    isRevealingSolution,
    isTrialResult,
    handleLocationExerciseId,
    handleSelectExercise,
    handleOpenExerciseFromCatalog,
    handleUnlockHint,
    handleLoadSolutionIntoEditor,
    handleAdminUnlockAllHints,
    handleAdminInstantReveal,
    handleConfirmRevealSolution,
    handleRunExerciseTrial,
    handleExecuteSolution,
    handleNextExercise,
    handleSqlCodeChange,
    handleResetEditor,
  };
}
