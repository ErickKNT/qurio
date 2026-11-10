import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile, EvaluationStatus } from '@/types';

export const GUEST_PROGRESS_STORAGE_KEY = 'qurio_guest_progress_v1';
export const LOCAL_PROFILE_STORAGE_KEY = 'qurio_user_profile';
export const ATTEMPTS_STORAGE_KEY = 'qurio_local_attempts';
export const DRAFT_SQL_PREFIX = 'qurio_draft_sql_';

let isSyncInProgress = false;

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

export interface GuestProgressItem {
  exercise_id: string;
  submitted_sql: string;
  hints_used: number;
  passed_at: string;
  sync_status: 'pending' | 'syncing' | 'synced';
  sync_started_at?: number;
}

export const persistence = {
  /**
   * Guarda un intento de resolución.
   * 
   * SEGURIDAD Y PERMISOS:
   * El cliente frontend NUNCA inserta directamente en 'exercise_attempts', 'user_daily_activity'
   * ni modifica 'user_profiles.xp/level'. Esa autoridad pertenece exclusivamente al backend
   * FastAPI mediante la RPC segura 'record_verified_attempt' ejecutada con credenciales verificadas.
   */
  async recordAttempt(data: ExerciseAttemptData): Promise<{ success: boolean; error?: string }> {
    const isPassed = data.status === 'PASSED';
    const isGuest = !data.userId || data.userId.startsWith('demo-');

    // 1. Guardar en registro local para telemetría visual del cliente
    try {
      const attempts = this.getLocalAttempts();
      attempts.unshift({
        id: `att-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts.slice(0, 100)));
    } catch (e) {
      console.warn('Error al guardar intento localmente:', e);
    }

    // 2. Si es invitado y superó el reto, guardar en el almacén temporal de prueba
    if (isGuest && isPassed) {
      try {
        this.saveGuestCompletedExercise({
          exercise_id: data.exerciseId,
          submitted_sql: data.submittedSql,
          hints_used: data.hintsUsed,
          passed_at: new Date().toISOString(),
          sync_status: 'pending',
        });
      } catch (e) {
        console.warn('Error al guardar progreso temporal de invitado:', e);
      }
    }

    return { success: true };
  },

  /**
   * Obtiene la lista de IDs de ejercicios superados.
   * 
   * FUENTE AUTORITATIVA DEL PROGRESO (C-03):
   * Para usuarios autenticados, ÚNICAMENTE los registros verificados en Supabase Cloud
   * determinan los ejercicios superados. Jamás se mezclan datos locales de invitados con
   * el progreso oficial autenticado.
   */
  async getCompletedExerciseIds(userId?: string): Promise<string[]> {
    const isGuest = !userId || userId.startsWith('demo-');

    if (!isGuest && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('exercise_attempts')
          .select('exercise_id')
          .eq('user_id', userId)
          .eq('status', 'PASSED');

        if (error) {
          console.warn('Error al consultar ejercicios superados en Supabase:', error.message);
          return [];
        }

        // Fuente única autoritativa en la nube para autenticados
        const cloudIds = (data || []).map((row) => row.exercise_id);
        return Array.from(new Set(cloudIds));
      } catch (err) {
        console.error('Error al obtener ejercicios superados de Supabase:', err);
        return [];
      }
    }

    // Para visitantes / invitados: leer exclusivamente su progreso temporal local
    const guestItems = this.getGuestProgress();
    const guestIds = guestItems.map((item) => item.exercise_id);
    return Array.from(new Set(guestIds));
  },

  /**
   * Recupera los ejercicios de prueba completados en modo invitado.
   * Incluye recuperación de sincronizaciones interrumpidas (D-05).
   */
  getGuestProgress(): GuestProgressItem[] {
    try {
      this.recoverInterruptedGuestSync();
      const saved = localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  /**
   * Guarda o actualiza un ejercicio en el progreso de invitado.
   */
  saveGuestCompletedExercise(item: GuestProgressItem): void {
    try {
      const items = this.getGuestProgress();
      const existingIdx = items.findIndex((i) => i.exercise_id === item.exercise_id);
      if (existingIdx >= 0) {
        items[existingIdx] = item;
      } else {
        items.push(item);
      }
      localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Error al guardar en qurio_guest_progress_v1:', e);
    }
  },

  /**
   * Recuperación de migraciones interrumpidas (D-05):
   * Restaura elementos que permanecen en 'syncing' por más de 30 segundos
   * debido a recargas de página o cierres del navegador.
   */
  recoverInterruptedGuestSync(): void {
    try {
      const raw = localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY);
      if (!raw) return;
      const items: GuestProgressItem[] = JSON.parse(raw);
      const now = Date.now();
      let changed = false;

      const recovered = items.map((item) => {
        if (item.sync_status === 'syncing' && item.sync_started_at && now - item.sync_started_at > 30000) {
          changed = true;
          return {
            ...item,
            sync_status: 'pending' as const,
            sync_started_at: undefined,
          };
        }
        return item;
      });

      if (changed) {
        localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(recovered));
      }
    } catch (e) {
      console.warn('Error al recuperar sincronizaciones interrumpidas de invitado:', e);
    }
  },

  /**
   * Migración idempotente del progreso de invitado a la cuenta de usuario autenticado (D-05).
   * Protegida contra invocaciones concurrentes superpuestas mediante mutex de sincronización.
   */
  async syncGuestProgress(
    userId: string,
    submitSolutionCallback: (exerciseId: string, sql: string, hints: number) => Promise<any>
  ): Promise<{ syncedCount: number; errors: number }> {
    if (isSyncInProgress) {
      return { syncedCount: 0, errors: 0 };
    }
    isSyncInProgress = true;

    try {
      this.recoverInterruptedGuestSync();
      const items = this.getGuestProgress();
      const pendingItems = items.filter((i) => i.sync_status === 'pending');
      if (pendingItems.length === 0) return { syncedCount: 0, errors: 0 };

      // 1. Obtener los IDs ya aprobados en la nube para asegurar idempotencia estricta
      let cloudPassedSet = new Set<string>();
      try {
        const cloudIds = await this.getCompletedExerciseIds(userId);
        cloudPassedSet = new Set(cloudIds);
      } catch {
        // Continuar con precaución
      }

      let syncedCount = 0;
      let errors = 0;

      for (const item of pendingItems) {
        if (cloudPassedSet.has(item.exercise_id)) {
          // Ya completado en la nube: marcar como sincronizado en local y storage sin reenviar
          item.sync_status = 'synced';
          this.saveGuestCompletedExercise(item);
          syncedCount++;
          continue;
        }

        // Marcar en vuelo con timestamp de bloqueo (30s)
        item.sync_status = 'syncing';
        item.sync_started_at = Date.now();
        this.saveGuestCompletedExercise(item);

        try {
          await submitSolutionCallback(item.exercise_id, item.submitted_sql, item.hints_used);
          item.sync_status = 'synced';
          syncedCount++;
        } catch (err) {
          console.warn(`No se pudo sincronizar ejercicio ${item.exercise_id}:`, err);
          item.sync_status = 'pending';
          item.sync_started_at = undefined;
          errors++;
        }
        this.saveGuestCompletedExercise(item);
      }

      // Limpiar items confirmados y sincronizados
      try {
        const remaining = this.getGuestProgress().filter((i) => i.sync_status !== 'synced');
        localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(remaining));
      } catch (e) {
        console.warn('Error al limpiar ejercicios sincronizados:', e);
      }

      return { syncedCount, errors };
    } finally {
      isSyncInProgress = false;
    }
  },

  /**
   * Obtiene el borrador de código SQL no enviado para un ejercicio específico (C-05).
   */
  getExerciseDraft(exerciseId: string): string | null {
    try {
      if (!exerciseId) return null;
      return localStorage.getItem(`${DRAFT_SQL_PREFIX}${exerciseId}`);
    } catch {
      return null;
    }
  },

  /**
   * Guarda de forma persistente el borrador de código SQL del estudiante.
   * Si el código coincide con el código inicial o está vacío, elimina el borrador.
   */
  saveExerciseDraft(exerciseId: string, code: string, initialCode?: string): void {
    try {
      if (!exerciseId) return;
      if (initialCode !== undefined && code === initialCode) {
        localStorage.removeItem(`${DRAFT_SQL_PREFIX}${exerciseId}`);
        return;
      }
      if (!code || !code.trim()) {
        localStorage.removeItem(`${DRAFT_SQL_PREFIX}${exerciseId}`);
        return;
      }
      localStorage.setItem(`${DRAFT_SQL_PREFIX}${exerciseId}`, code);
    } catch (e) {
      console.warn('Error al guardar borrador de ejercicio:', e);
    }
  },

  /**
   * Elimina el borrador de un ejercicio (al resolverlo exitosamente o restablecer).
   */
  clearExerciseDraft(exerciseId: string): void {
    try {
      if (exerciseId) {
        localStorage.removeItem(`${DRAFT_SQL_PREFIX}${exerciseId}`);
      }
    } catch (e) {
      console.warn('Error al limpiar borrador de ejercicio:', e);
    }
  },

  /**
   * Elimina completamente el almacén de progreso de invitado.
   */
  clearGuestProgress(): void {
    try {
      localStorage.removeItem(GUEST_PROGRESS_STORAGE_KEY);
    } catch (e) {
      console.warn('Error al limpiar guest progress:', e);
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
   * 
   * SEGURIDAD (C-02):
   * Restringe dbUpdates estrictamente a campos visuales permitidos (display_name, avatar_url, username).
   * Jamás envía 'xp' o 'level' desde el cliente.
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
        if (updates.full_name) dbUpdates.display_name = updates.full_name;
        if (updates.avatar_url) dbUpdates.avatar_url = updates.avatar_url;
        if (updates.username) dbUpdates.username = updates.username;
        dbUpdates.updated_at = new Date().toISOString();

        if (Object.keys(dbUpdates).length > 1) {
          await supabase.from('user_profiles').update(dbUpdates).eq('id', userId);
        }
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

  /**
   * Elimina el perfil local al cerrar sesión.
   */
  clearLocalProfile(): void {
    try {
      localStorage.removeItem(LOCAL_PROFILE_STORAGE_KEY);
    } catch (e) {
      console.warn('Error al limpiar perfil local:', e);
    }
  },
};
