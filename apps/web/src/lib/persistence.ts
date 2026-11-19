import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AVATAR_BUCKET_NAME } from '@/lib/avatar';
import { UserProfile, EvaluationStatus, QueryHistoryItem, AttemptStats } from '@/types';

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
   * Sube una imagen procesada de avatar al bucket 'avatars' de Supabase Storage
   * bajo la ruta determinista `${userId}/avatar.{webp|png}` para evitar huérfanos.
   */
  async uploadUserAvatar(
    userId: string,
    blob: Blob
  ): Promise<{ publicUrl?: string; error?: string }> {
    if (!isSupabaseConfigured || !userId || userId.startsWith('demo-')) {
      return {
        error: 'Inicia sesión en la nube para subir una foto de perfil personalizada.',
      };
    }

    try {
      const ext = blob.type === 'image/png' ? 'png' : 'webp';
      const storagePath = `${userId}/avatar.${ext}`;
      const contentType = blob.type || `image/${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET_NAME)
        .upload(storagePath, blob, {
          upsert: true,
          contentType,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.warn('Error al subir avatar a Supabase Storage:', uploadError.message);
        return { error: uploadError.message || 'No se pudo subir la imagen de perfil.' };
      }

      const { data } = supabase.storage.from(AVATAR_BUCKET_NAME).getPublicUrl(storagePath);
      const basePublicUrl = data?.publicUrl;
      if (!basePublicUrl) {
        return { error: 'No se pudo obtener la URL pública del avatar.' };
      }

      const separator = basePublicUrl.includes('?') ? '&' : '?';
      return { publicUrl: `${basePublicUrl}${separator}v=${Date.now()}` };
    } catch (err: any) {
      console.warn('Error inesperado al subir avatar:', err);
      return { error: err?.message || 'Error de conexión al subir el avatar.' };
    }
  },

  /**
   * Elimina el archivo de avatar personalizado del usuario en Supabase Storage.
   */
  async removeUserAvatar(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !userId || userId.startsWith('demo-')) {
      return { success: true };
    }

    try {
      const { error } = await supabase.storage
        .from(AVATAR_BUCKET_NAME)
        .remove([`${userId}/avatar.webp`, `${userId}/avatar.png`]);

      if (error) {
        console.warn('Error al eliminar avatar de Supabase Storage:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Error inesperado al eliminar avatar:', err);
      return { success: false, error: err?.message || 'Error de conexión al eliminar el avatar.' };
    }
  },

  /**
   * Sincroniza y actualiza los datos del perfil en Supabase y localmente.
   *
   * SEGURIDAD (C-02 + CLS 03_security_hardening.sql):
   * Restringe dbUpdates estrictamente a las columnas con permiso UPDATE para 'authenticated'
   * (display_name, avatar_url, bio, updated_at). Jamás envía 'username', 'xp' o 'level'.
   */
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>,
    syncCloud = true
  ): Promise<{ success: boolean; error?: string }> {
    if (syncCloud && isSupabaseConfigured && userId && !userId.startsWith('demo-')) {
      try {
        const dbUpdates: Record<string, any> = {};
        if (updates.full_name !== undefined) dbUpdates.display_name = updates.full_name;
        if (updates.avatar_url !== undefined) dbUpdates.avatar_url = updates.avatar_url;
        if (updates.bio !== undefined) dbUpdates.bio = updates.bio;

        if (Object.keys(dbUpdates).length > 0) {
          dbUpdates.updated_at = new Date().toISOString();
          const { error } = await supabase.from('user_profiles').update(dbUpdates).eq('id', userId);
          if (error) {
            console.warn('Error al sincronizar perfil en Supabase:', error.message);
            return { success: false, error: error.message };
          }
        }
      } catch (err: any) {
        console.warn('Error al sincronizar perfil en Supabase:', err);
        return { success: false, error: err?.message || 'Error de conexión con Supabase.' };
      }
    }

    try {
      const current = this.getLocalProfile();
      const updated = { ...current, ...updates };
      localStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error al guardar perfil localmente:', e);
    }

    return { success: true };
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

  /**
   * Obtiene la actividad diaria registrada para el usuario (hasta 365 días para el heatmap anual).
   */
  async getUserDailyActivity(
    userId: string,
    daysWindow = 365
  ): Promise<{ activity_date: string; exercises_solved: number; xp_earned: number }[]> {
    if (!userId || userId.startsWith('demo-') || !isSupabaseConfigured) {
      return [];
    }

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysWindow);
      const startDateStr = startDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('user_daily_activity')
        .select('activity_date, exercises_solved, xp_earned')
        .eq('user_id', userId)
        .gte('activity_date', startDateStr)
        .order('activity_date', { ascending: true });

      if (error) {
        console.warn('Error al consultar user_daily_activity:', error.message);
        return [];
      }

      return data || [];
    } catch (err) {
      console.warn('Error de red al consultar user_daily_activity:', err);
      return [];
    }
  },

  /**
   * Obtiene métricas agregadas de precisión y rendimiento sobre intentos reales evaluados.
   */
  async getUserAttemptStats(userId?: string): Promise<AttemptStats> {
    if (!userId || userId.startsWith('demo-') || !isSupabaseConfigured) {
      const local = this.getLocalAttempts();
      let passedAttempts = 0;
      let fastAttemptsUnder50ms = 0;
      let zeroHintPassedAttempts = 0;
      for (const att of local) {
        if ((att.executionTimeMs ?? 0) > 0 && (att.executionTimeMs ?? 0) < 50) {
          fastAttemptsUnder50ms++;
        }
        if (att.status === 'PASSED') {
          passedAttempts++;
          if ((att.hintsUsed ?? 0) === 0) {
            zeroHintPassedAttempts++;
          }
        }
      }
      return {
        totalAttempts: local.length,
        passedAttempts,
        fastAttemptsUnder50ms,
        zeroHintPassedAttempts,
      };
    }

    try {
      const { data, error } = await supabase
        .from('exercise_attempts')
        .select('status, execution_time_ms, hints_used')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error || !data) {
        return { totalAttempts: 0, passedAttempts: 0, fastAttemptsUnder50ms: 0, zeroHintPassedAttempts: 0 };
      }

      let passedAttempts = 0;
      let fastAttemptsUnder50ms = 0;
      let zeroHintPassedAttempts = 0;

      for (const row of data) {
        if ((row.execution_time_ms ?? 0) < 50) {
          fastAttemptsUnder50ms++;
        }
        if (row.status === 'PASSED') {
          passedAttempts++;
          if ((row.hints_used ?? 0) === 0) {
            zeroHintPassedAttempts++;
          }
        }
      }

      return {
        totalAttempts: data.length,
        passedAttempts,
        fastAttemptsUnder50ms,
        zeroHintPassedAttempts,
      };
    } catch {
      return { totalAttempts: 0, passedAttempts: 0, fastAttemptsUnder50ms: 0, zeroHintPassedAttempts: 0 };
    }
  },

  /**
   * Obtiene el historial real de consultas evaluadas del usuario desde Supabase.
   */
  async getUserAttemptsHistory(userId: string, limit = 20): Promise<QueryHistoryItem[]> {
    if (!userId || userId.startsWith('demo-') || !isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('exercise_attempts')
        .select('id, submitted_sql, status, execution_time_ms, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('Error al consultar exercise_attempts en Supabase:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        query: row.submitted_sql,
        executed_at: row.created_at,
        status: row.status === 'PASSED' ? ('SUCCESS' as const) : ('ERROR' as const),
        execution_time_ms: row.execution_time_ms || 0,
      }));
    } catch (err) {
      console.warn('Error al obtener historial de intentos de Supabase:', err);
      return [];
    }
  },

  /**
   * Obtiene una página real de consultas evaluadas desde Supabase con filtro y búsqueda SQL.
   */
  async getUserAttemptsPage(params: {
    userId: string;
    page?: number;
    pageSize?: number;
    statusFilter?: 'all' | 'SUCCESS';
    search?: string;
  }): Promise<{ items: QueryHistoryItem[]; total: number }> {
    const page = Math.max(0, params.page ?? 0);
    const pageSize = Math.max(1, Math.min(50, params.pageSize ?? 10));
    const searchClean = (params.search ?? '').trim();

    if (!params.userId || params.userId.startsWith('demo-') || !isSupabaseConfigured) {
      return { items: [], total: 0 };
    }

    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('exercise_attempts')
        .select('id, submitted_sql, status, execution_time_ms, created_at', { count: 'exact' })
        .eq('user_id', params.userId);

      if (params.statusFilter === 'SUCCESS') {
        query = query.eq('status', 'PASSED');
      }
      if (searchClean) {
        query = query.ilike('submitted_sql', `%${searchClean}%`);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.warn('Error al paginar exercise_attempts en Supabase:', error.message);
        return { items: [], total: 0 };
      }

      const items: QueryHistoryItem[] = (data || []).map((row) => ({
        id: row.id,
        query: row.submitted_sql,
        executed_at: row.created_at,
        status: row.status === 'PASSED' ? ('SUCCESS' as const) : ('ERROR' as const),
        execution_time_ms: row.execution_time_ms || 0,
      }));

      return { items, total: count ?? items.length };
    } catch (err) {
      console.warn('Error de red al paginar historial:', err);
      return { items: [], total: 0 };
    }
  },

  /**
   * Obtiene el total histórico de consultas evaluadas registradas para el usuario.
   */
  async getUserTotalAttemptsCount(userId: string): Promise<number> {
    if (!userId || userId.startsWith('demo-') || !isSupabaseConfigured) {
      return 0;
    }

    try {
      const { count, error } = await supabase
        .from('exercise_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.warn('Error al contar intentos en Supabase:', error.message);
        return 0;
      }

      return count ?? 0;
    } catch (err) {
      console.warn('Error al consultar conteo de intentos:', err);
      return 0;
    }
  },
};
