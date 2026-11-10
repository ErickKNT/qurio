import { Track, Exercise } from '@/types';

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
