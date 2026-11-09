import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile, EvaluationStatus } from '@/types';

const COMPLETED_EXERCISES_STORAGE_KEY = 'qurio_completed_exercises';
const LOCAL_PROFILE_STORAGE_KEY = 'qurio_user_profile';
const ATTEMPTS_STORAGE_KEY = 'qurio_local_attempts';

export interface ExerciseAttemptData {
  userId?: string;
  exerciseId: string;
  submittedSql: string;
  status: EvaluationStatus; // 'PASSED' | 'FAILED' | 'ERROR'
  executionTimeMs: number;
  hintsUsed: number;
  xpAwarded: number;
  errorMessage?: string;
}

export const persistence = {
  /**
   * Guarda un intento de resolución en Supabase Cloud y en almacenamiento local.
   */
  async recordAttempt(data: ExerciseAttemptData): Promise<{ success: boolean; error?: string }> {
    const isPassed = data.status === 'PASSED';

    // 1. Siempre guardar en almacenamiento local para resiliencia offline
    try {
      const attempts = this.getLocalAttempts();
      attempts.unshift({
        id: `att-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts.slice(0, 100)));

      if (isPassed) {
        this.markExerciseCompletedLocally(data.exerciseId);
      }
    } catch (e) {
      console.warn('Error al guardar intento localmente:', e);
    }

    // 2. Si Supabase está configurado y hay usuario autenticado, persistir en la nube
    if (isSupabaseConfigured && data.userId && !data.userId.startsWith('demo-')) {
      try {
        // A. Insertar en exercise_attempts
        const { error: insertError } = await supabase.from('exercise_attempts').insert({
          user_id: data.userId,
          exercise_id: data.exerciseId,
          submitted_sql: data.submittedSql,
          status: data.status,
          execution_time_ms: Math.round(data.executionTimeMs),
          hints_used: data.hintsUsed,
          xp_awarded: data.xpAwarded,
          error_message: data.errorMessage || null,
        });

        if (insertError) {
          console.warn('No se pudo insertar en exercise_attempts de Supabase:', insertError.message);
        }

        // B. Si el reto fue superado, actualizar XP y nivel en user_profiles
        if (isPassed && data.xpAwarded > 0) {
          const { data: currentProfile } = await supabase
            .from('user_profiles')
            .select('xp, level, current_streak_days, max_streak_days')
            .eq('id', data.userId)
            .single();

          if (currentProfile) {
            const newXp = (currentProfile.xp || 0) + data.xpAwarded;
            const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);

            await supabase
              .from('user_profiles')
              .update({
                xp: newXp,
                level: newLevel,
                updated_at: new Date().toISOString(),
              })
              .eq('id', data.userId);
          }

          // C. Registrar actividad diaria
          const today = new Date().toISOString().split('T')[0];
          const { data: dailyActivity } = await supabase
            .from('user_daily_activity')
            .select('id, exercises_solved, xp_earned')
            .eq('user_id', data.userId)
            .eq('activity_date', today)
            .single();

          if (dailyActivity) {
            await supabase
              .from('user_daily_activity')
              .update({
                exercises_solved: (dailyActivity.exercises_solved || 0) + 1,
                xp_earned: (dailyActivity.xp_earned || 0) + data.xpAwarded,
              })
              .eq('id', dailyActivity.id);
          } else {
            await supabase.from('user_daily_activity').insert({
              user_id: data.userId,
              activity_date: today,
              exercises_solved: 1,
              xp_earned: data.xpAwarded,
            });
          }
        }

        return { success: true };
      } catch (err: any) {
        console.error('Error en persistence.recordAttempt:', err);
        return { success: false, error: err.message };
      }
    }

    return { success: true };
  },

  /**
   * Obtiene la lista de IDs de ejercicios superados por el estudiante.
   */
  async getCompletedExerciseIds(userId?: string): Promise<string[]> {
    const localCompleted = this.getLocalCompletedExerciseIds();

    if (isSupabaseConfigured && userId && !userId.startsWith('demo-')) {
      try {
        const { data, error } = await supabase
          .from('exercise_attempts')
          .select('exercise_id')
          .eq('user_id', userId)
          .eq('status', 'PASSED');

        if (error) {
          console.warn('Error al consultar ejercicios superados en Supabase:', error.message);
          return Array.from(localCompleted);
        }

        const cloudIds = (data || []).map((row) => row.exercise_id);
        const merged = new Set([...localCompleted, ...cloudIds]);
        return Array.from(merged);
      } catch (err) {
        console.error('Error al obtener ejercicios superados:', err);
        return Array.from(localCompleted);
      }
    }

    return Array.from(localCompleted);
  },

  /**
   * Recupera los ejercicios completados en localStorage.
   */
  getLocalCompletedExerciseIds(): Set<string> {
    try {
      const saved = localStorage.getItem(COMPLETED_EXERCISES_STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  },

  /**
   * Marca un ejercicio como completado en localStorage.
   */
  markExerciseCompletedLocally(exerciseId: string) {
    try {
      const set = this.getLocalCompletedExerciseIds();
      set.add(exerciseId);
      localStorage.setItem(COMPLETED_EXERCISES_STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch (e) {
      console.warn('Error guardando ejercicio completado local:', e);
    }
  },

  /**
   * Recupera los intentos guardados localmente.
   */
  getLocalAttempts(): any[] {
    try {
      const saved = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  /**
   * Sincroniza y actualiza los datos del perfil en Supabase y localmente.
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const current = this.getLocalProfile();
      const updated = { ...current, ...updates };
      localStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error al guardar perfil localmente:', e);
    }

    if (isSupabaseConfigured && userId && !userId.startsWith('demo-')) {
      try {
        const dbUpdates: Record<string, any> = {};
        if (updates.username) dbUpdates.username = updates.username;
        if (updates.full_name) dbUpdates.display_name = updates.full_name;
        if (updates.avatar_url) dbUpdates.avatar_url = updates.avatar_url;
        if (typeof updates.total_xp === 'number') dbUpdates.xp = updates.total_xp;
        if (typeof updates.current_level === 'number') dbUpdates.level = updates.current_level;
        if (typeof updates.current_streak_days === 'number') dbUpdates.current_streak_days = updates.current_streak_days;
        dbUpdates.updated_at = new Date().toISOString();

        await supabase.from('user_profiles').update(dbUpdates).eq('id', userId);
      } catch (err) {
        console.warn('Error al sincronizar perfil en Supabase:', err);
      }
    }
  },

  /**
   * Obtiene el perfil de usuario de respaldo local.
   */
  getLocalProfile(): Partial<UserProfile> {
    try {
      const saved = localStorage.getItem(LOCAL_PROFILE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  },
};
