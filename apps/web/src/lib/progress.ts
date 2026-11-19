import { Track, Module, Exercise } from '@/types';

export interface ModuleCompletionSummary {
  completedModule: Module;
  track?: Track;
  moduleTotalExercises: number;
  moduleTotalXp: number;
  trackCompletedCount: number;
  trackTotalCount: number;
  trackPercent: number;
  isTrackCompleted: boolean;
  nextModule?: Module;
  nextExercise?: Exercise;
}

export interface NextExerciseTransition {
  label: string;
  targetIndex: number | null;
  shouldNavigateToTracks: boolean;
}

/**
 * Computa el progreso oficial de las rutas para un usuario autenticado.
 * 
 * Reglas estrictas de integridad curricular:
 * 1. Únicamente authoritativeCompletedIds (provenientes de Supabase / backend) pueden certificar ejercicios superados.
 * 2. ex.is_completed o datos locales jamás pueden incrementar el progreso oficial.
 * 3. Si isLoading es true o los datos no están disponibles aún, devuelve estado de carga:
 *    completed_exercises = null, progress_percent = null, is_progress_loading = true.
 * 4. El progreso se calcula de forma aislada por ruta (track), sin contaminar otras rutas.
 */
export function computeOfficialTracksProgress(
  tracks: Track[],
  exercises: Exercise[],
  authoritativeCompletedIds: Set<string>,
  isLoading: boolean
): Track[] {
  if (isLoading) {
    return tracks.map((tr) => ({
      ...tr,
      completed_exercises: null,
      progress_percent: null,
      is_progress_loading: true,
      modules: tr.modules?.map((m) => ({
        ...m,
        completed_count: undefined,
      })),
    }));
  }

  return tracks.map((tr) => {
    const trackModuleIds = new Set((tr.modules || []).map((m) => m.id));
    const trackExercises = exercises.filter((ex) => trackModuleIds.has(ex.module_id));
    const total = trackExercises.length > 0 ? trackExercises.length : (tr.total_exercises || 1);
    
    // Contar únicamente los IDs contenidos en authoritativeCompletedIds
    const completed = trackExercises.filter((ex) => authoritativeCompletedIds.has(ex.id)).length;
    const percent = Math.min(100, Math.round((completed / total) * 100));

    // Desglose por módulo
    const updatedModules = tr.modules?.map((m) => {
      const moduleExercises = trackExercises.filter((ex) => ex.module_id === m.id);
      const modCompleted = moduleExercises.filter((ex) => authoritativeCompletedIds.has(ex.id)).length;
      return {
        ...m,
        exercises_count: moduleExercises.length || m.exercises_count,
        completed_count: modCompleted,
      };
    });

    return {
      ...tr,
      total_exercises: total,
      completed_exercises: completed,
      progress_percent: percent,
      is_progress_loading: false,
      modules: updatedModules,
    };
  });
}

/**
 * Computa el progreso temporal de prueba para visitantes / invitados.
 * 
 * Limitado a los 3 ejercicios del Módulo 1.
 * Claramente diferenciado del progreso oficial certificado.
 */
export function computeGuestTrialTracksProgress(
  tracks: Track[],
  exercises: Exercise[],
  guestCompletedIds: Set<string>
): Track[] {
  return tracks.map((tr) => {
    const trackModuleIds = new Set((tr.modules || []).map((m) => m.id));
    const trackExercises = exercises.filter((ex) => trackModuleIds.has(ex.module_id));
    const total = trackExercises.length > 0 ? trackExercises.length : (tr.total_exercises || 1);
    
    const completed = trackExercises.filter((ex) => guestCompletedIds.has(ex.id)).length;
    const percent = Math.min(100, Math.round((completed / total) * 100));

    const updatedModules = tr.modules?.map((m) => {
      const moduleExercises = trackExercises.filter((ex) => ex.module_id === m.id);
      const modCompleted = moduleExercises.filter((ex) => guestCompletedIds.has(ex.id)).length;
      return {
        ...m,
        exercises_count: moduleExercises.length || m.exercises_count,
        completed_count: modCompleted,
      };
    });

    return {
      ...tr,
      total_exercises: total,
      completed_exercises: completed,
      progress_percent: percent,
      is_progress_loading: false,
      modules: updatedModules,
    };
  });
}

function findTrackForModule(tracks: Track[], moduleId: string): Track | undefined {
  return tracks.find((t) => t.modules?.some((m) => m.id === moduleId));
}

function findTargetExerciseInModule(
  exercises: Exercise[],
  moduleId: string,
  completedIds: Set<string>
): Exercise | undefined {
  const moduleExercises = exercises
    .filter((ex) => ex.module_id === moduleId)
    .sort((a, b) => a.sort_order - b.sort_order);
  return moduleExercises.find((ex) => !completedIds.has(ex.id)) ?? moduleExercises[0];
}

/**
 * Evalúa si aprobar `completedExercise` cierra por primera vez el módulo al que pertenece.
 * Devuelve `null` en modo invitado, si el reto ya estaba completado o si aún faltan retos en el módulo.
 */
export function evaluateModuleCompletion(params: {
  completedExercise: Exercise;
  exercises: Exercise[];
  tracks: Track[];
  previousCompletedIds: Set<string>;
  isGuest: boolean;
}): ModuleCompletionSummary | null {
  const { completedExercise, exercises, tracks, previousCompletedIds, isGuest } = params;

  if (isGuest || previousCompletedIds.has(completedExercise.id)) {
    return null;
  }

  const updatedCompletedIds = new Set(previousCompletedIds);
  updatedCompletedIds.add(completedExercise.id);

  const moduleExercises = exercises.filter((ex) => ex.module_id === completedExercise.module_id);
  if (moduleExercises.length === 0) {
    return null;
  }

  const allModuleDone = moduleExercises.every((ex) => updatedCompletedIds.has(ex.id));
  if (!allModuleDone) {
    return null;
  }

  const track = findTrackForModule(tracks, completedExercise.module_id);
  const completedModule = track?.modules?.find((m) => m.id === completedExercise.module_id);
  if (!completedModule) {
    return null;
  }

  const moduleTotalXp = moduleExercises.reduce((sum, ex) => sum + (ex.xp_reward || 0), 0);

  const trackModuleIds = new Set((track?.modules || []).map((m) => m.id));
  const trackExercises = exercises.filter((ex) => trackModuleIds.has(ex.module_id));
  const trackTotalCount = trackExercises.length || track?.total_exercises || moduleExercises.length;
  const trackCompletedCount = trackExercises.filter((ex) => updatedCompletedIds.has(ex.id)).length;
  const trackPercent = Math.min(100, Math.round((trackCompletedCount / trackTotalCount) * 100));
  const isTrackCompleted = trackExercises.length > 0 && trackCompletedCount >= trackExercises.length;

  let nextModule: Module | undefined;
  let nextExercise: Exercise | undefined;

  // Buscar primero el siguiente módulo con retos pendientes dentro de la misma ruta
  if (!isTrackCompleted && track?.modules) {
    const sortedModules = [...track.modules].sort((a, b) => a.sort_order - b.sort_order);
    const currentIdx = sortedModules.findIndex((m) => m.id === completedModule.id);
    const orderedCandidates = [
      ...sortedModules.slice(currentIdx + 1),
      ...sortedModules.slice(0, currentIdx),
    ];

    nextModule = orderedCandidates.find((m) =>
      exercises.some((ex) => ex.module_id === m.id && !updatedCompletedIds.has(ex.id))
    );
    if (nextModule) {
      nextExercise = findTargetExerciseInModule(exercises, nextModule.id, updatedCompletedIds);
    }
  }

  // Si la ruta actual quedó completa, buscar la siguiente ruta con módulos pendientes
  if (!nextModule) {
    const sortedTracks = [...tracks].sort((a, b) => a.sort_order - b.sort_order);
    const currentTrackIdx = track ? sortedTracks.findIndex((t) => t.id === track.id) : -1;
    const candidateTracks =
      currentTrackIdx >= 0
        ? [...sortedTracks.slice(currentTrackIdx + 1), ...sortedTracks.slice(0, currentTrackIdx)]
        : sortedTracks;

    for (const candidateTrack of candidateTracks) {
      const sortedMods = [...(candidateTrack.modules || [])].sort(
        (a, b) => a.sort_order - b.sort_order
      );
      const pendingMod = sortedMods.find((m) =>
        exercises.some((ex) => ex.module_id === m.id && !updatedCompletedIds.has(ex.id))
      );
      if (pendingMod) {
        nextModule = pendingMod;
        nextExercise = findTargetExerciseInModule(exercises, pendingMod.id, updatedCompletedIds);
        break;
      }
    }
  }

  return {
    completedModule,
    track,
    moduleTotalExercises: moduleExercises.length,
    moduleTotalXp,
    trackCompletedCount,
    trackTotalCount,
    trackPercent,
    isTrackCompleted,
    nextModule,
    nextExercise,
  };
}

/**
 * Calcula la etiqueta y el destino del botón de avance en el banner de resultados
 * para evitar saltos silenciosos entre módulos o reinicios al principio del temario.
 */
export function getNextExerciseTransition(
  currentExerciseIndex: number,
  exercises: Exercise[],
  tracks: Track[]
): NextExerciseTransition {
  if (exercises.length === 0 || currentExerciseIndex < 0) {
    return {
      label: 'Siguiente Reto',
      targetIndex: exercises.length > 0 ? 0 : null,
      shouldNavigateToTracks: false,
    };
  }

  if (currentExerciseIndex >= exercises.length - 1) {
    return {
      label: 'Ver rutas',
      targetIndex: null,
      shouldNavigateToTracks: true,
    };
  }

  const nextIndex = currentExerciseIndex + 1;
  const currentExercise = exercises[currentExerciseIndex];
  const nextExercise = exercises[nextIndex];

  if (!currentExercise || !nextExercise || currentExercise.module_id === nextExercise.module_id) {
    return {
      label: 'Siguiente Reto',
      targetIndex: nextIndex,
      shouldNavigateToTracks: false,
    };
  }

  const currentTrack = findTrackForModule(tracks, currentExercise.module_id);
  const nextTrack = findTrackForModule(tracks, nextExercise.module_id);
  const isDifferentTrack = currentTrack && nextTrack && currentTrack.id !== nextTrack.id;

  return {
    label: isDifferentTrack ? 'Siguiente Ruta' : 'Siguiente Módulo',
    targetIndex: nextIndex,
    shouldNavigateToTracks: false,
  };
}

/**
 * Construye un resumen sintético para previsualizar `ModuleCompletedModal` en modo QA Admin
 * reutilizando exactamente `evaluateModuleCompletion` para garantizar paridad total.
 */
export function buildAdminModuleCompletionPreview(
  track: Track,
  exercises: Exercise[],
  tracks: Track[]
): ModuleCompletionSummary | null {
  const sortedModules = [...(track.modules || [])].sort((a, b) => a.sort_order - b.sort_order);
  if (sortedModules.length === 0) return null;

  const isTrackDone =
    typeof track.total_exercises === 'number' &&
    track.total_exercises > 0 &&
    track.completed_exercises === track.total_exercises;

  const targetModule = isTrackDone
    ? sortedModules[sortedModules.length - 1]
    : sortedModules[0];

  const moduleExercises = exercises
    .filter((ex) => ex.module_id === targetModule.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  if (moduleExercises.length === 0) return null;

  const lastExercise = moduleExercises[moduleExercises.length - 1];
  const syntheticPreviousIds = new Set<string>(
    moduleExercises.slice(0, -1).map((ex) => ex.id)
  );

  if (isTrackDone) {
    for (const mod of sortedModules) {
      if (mod.id === targetModule.id) continue;
      for (const ex of exercises) {
        if (ex.module_id === mod.id) syntheticPreviousIds.add(ex.id);
      }
    }
  }

  return evaluateModuleCompletion({
    completedExercise: lastExercise,
    exercises,
    tracks,
    previousCompletedIds: syntheticPreviousIds,
    isGuest: false,
  });
}
