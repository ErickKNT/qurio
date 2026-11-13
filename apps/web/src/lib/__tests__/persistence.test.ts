import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  persistence,
  GUEST_PROGRESS_STORAGE_KEY,
  GuestProgressItem,
  DRAFT_SQL_PREFIX,
} from '../persistence';

// Mock de localStorage para entorno Node/Vitest
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = new LocalStorageMock() as any;
}

describe('persistence — Recuperación de migraciones interrumpidas (D-05)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('debe restaurar a pending elementos en syncing con más de 30 segundos de antigüedad', () => {
    const now = Date.now();
    const staleTime = now - 35000; // 35 segundos atrás (> 30s)
    const freshTime = now - 5000; // 5 segundos atrás (< 30s)

    const items: GuestProgressItem[] = [
      {
        exercise_id: 'ex-stale',
        submitted_sql: 'SELECT 1;',
        hints_used: 0,
        passed_at: new Date(staleTime).toISOString(),
        sync_status: 'syncing',
        sync_started_at: staleTime,
      },
      {
        exercise_id: 'ex-fresh',
        submitted_sql: 'SELECT 2;',
        hints_used: 0,
        passed_at: new Date(freshTime).toISOString(),
        sync_status: 'syncing',
        sync_started_at: freshTime,
      },
      {
        exercise_id: 'ex-pending',
        submitted_sql: 'SELECT 3;',
        hints_used: 0,
        passed_at: new Date(freshTime).toISOString(),
        sync_status: 'pending',
      },
    ];

    localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(items));

    // Ejecutar recuperación
    persistence.recoverInterruptedGuestSync();

    const recovered = persistence.getGuestProgress();
    const staleItem = recovered.find((i) => i.exercise_id === 'ex-stale');
    const freshItem = recovered.find((i) => i.exercise_id === 'ex-fresh');
    const pendingItem = recovered.find((i) => i.exercise_id === 'ex-pending');

    expect(staleItem?.sync_status).toBe('pending');
    expect(staleItem?.sync_started_at).toBeUndefined();

    expect(freshItem?.sync_status).toBe('syncing');
    expect(freshItem?.sync_started_at).toBe(freshTime);

    expect(pendingItem?.sync_status).toBe('pending');
  });

  it('debe sincronizar de forma idempotente ignorando ejercicios ya completados en la nube', async () => {
    const items: GuestProgressItem[] = [
      {
        exercise_id: 'ex-already-in-cloud',
        submitted_sql: 'SELECT 1;',
        hints_used: 0,
        passed_at: new Date().toISOString(),
        sync_status: 'pending',
      },
      {
        exercise_id: 'ex-to-sync',
        submitted_sql: 'SELECT 2;',
        hints_used: 1,
        passed_at: new Date().toISOString(),
        sync_status: 'pending',
      },
    ];
    localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(items));

    // Simular que getCompletedExerciseIds devuelve 'ex-already-in-cloud'
    vi.spyOn(persistence, 'getCompletedExerciseIds').mockResolvedValue(['ex-already-in-cloud']);

    const mockSubmit = vi.fn().mockResolvedValue({ status: 'PASSED' });

    const result = await persistence.syncGuestProgress('usr-test-123', mockSubmit);

    expect(result.syncedCount).toBe(2);
    // Solo debe invocar submitSolution para el reto no presente en la nube
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith('ex-to-sync', 'SELECT 2;', 1);
  });

  it('debe recuperarse limpiamente de una respuesta HTTP perdida sin duplicar peticiones (Escenarios 6 y 8 de D-05)', async () => {
    // Escenario 6: El backend registró el reto en la base de datos, pero la respuesta HTTP
    // se perdió por desconexión de red, dejando el item en localStorage
    const items: GuestProgressItem[] = [
      {
        exercise_id: 'ex-lost-http-response',
        submitted_sql: 'SELECT * FROM clientes;',
        hints_used: 0,
        passed_at: new Date().toISOString(),
        sync_status: 'pending',
      },
    ];
    localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(items));

    // Escenario 8: El usuario inicia sesión nuevamente o se reintenta la sincronización.
    // La nube ya tiene registrado 'ex-lost-http-response' (porque el backend sí lo procesó antes de que cayera la red).
    vi.spyOn(persistence, 'getCompletedExerciseIds').mockResolvedValue(['ex-lost-http-response']);

    const mockSubmit = vi.fn();

    const result = await persistence.syncGuestProgress('usr-reconnected-123', mockSubmit);

    // Debe marcarlo como sincronizado exitosamente
    expect(result.syncedCount).toBe(1);
    expect(result.errors).toBe(0);
    // CERO llamadas a la API: evita otorgar XP duplicado o generar carga redundante
    expect(mockSubmit).not.toHaveBeenCalled();

    // El almacén local de invitados debe quedar limpio
    const remaining = persistence.getGuestProgress();
    expect(remaining).toHaveLength(0);
  });

  it('debe prevenir ejecuciones concurrentes solapadas mediante el mutex de sincronización (D-05)', async () => {
    const items: GuestProgressItem[] = [
      {
        exercise_id: 'ex-concurrent',
        submitted_sql: 'SELECT id FROM productos;',
        hints_used: 0,
        passed_at: new Date().toISOString(),
        sync_status: 'pending',
      },
    ];
    localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(items));

    vi.spyOn(persistence, 'getCompletedExerciseIds').mockResolvedValue([]);

    // Mock con retardo para simular tiempo de red
    const mockSubmit = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ status: 'PASSED' }), 50))
    );

    // Iniciar dos sincronizaciones concurrentes idénticas
    const sync1 = persistence.syncGuestProgress('usr-concurrent-1', mockSubmit);
    const sync2 = persistence.syncGuestProgress('usr-concurrent-1', mockSubmit);

    const [res1, res2] = await Promise.all([sync1, sync2]);

    // Una sincronización toma el bloqueo y procesa el elemento; la segunda detecta el bloqueo y no duplica
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(res1.syncedCount + res2.syncedCount).toBe(1);
  });
});

describe('persistence — Borrador de código SQL del editor (C-05)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('guarda, recupera y limpia el borrador de un ejercicio', () => {
    const exerciseId = 'e0000000-0000-0000-0000-000000000001';
    const draftSql = 'SELECT nombre, precio FROM productos WHERE precio > 500;';
    const initialSql = 'SELECT * FROM productos;';

    // 1. Sin borrador inicial debe devolver null
    expect(persistence.getExerciseDraft(exerciseId)).toBeNull();

    // 2. Guardar borrador editado por el estudiante
    persistence.saveExerciseDraft(exerciseId, draftSql, initialSql);
    expect(persistence.getExerciseDraft(exerciseId)).toBe(draftSql);

    // 3. Si el código coincide con el inicial, debe eliminar el borrador
    persistence.saveExerciseDraft(exerciseId, initialSql, initialSql);
    expect(persistence.getExerciseDraft(exerciseId)).toBeNull();

    // 4. Guardar de nuevo y limpiar explícitamente (ej. al resolver el reto)
    persistence.saveExerciseDraft(exerciseId, draftSql, initialSql);
    expect(persistence.getExerciseDraft(exerciseId)).toBe(draftSql);

    persistence.clearExerciseDraft(exerciseId);
    expect(persistence.getExerciseDraft(exerciseId)).toBeNull();
  });

  it('no almacena tokens, credenciales ni información sensible en las claves de borrador', () => {
    const exerciseId = 'ex-draft-test';
    persistence.saveExerciseDraft(exerciseId, 'SELECT 1;', 'SELECT 0;');

    const storedKey = `${DRAFT_SQL_PREFIX}${exerciseId}`;
    const rawValue = localStorage.getItem(storedKey);

    expect(rawValue).toBe('SELECT 1;');
    expect(rawValue).not.toContain('token');
    expect(rawValue).not.toContain('access_token');
    expect(rawValue).not.toContain('jwt');
  });
});

describe('persistence — Protección de perfil (C-02)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('actualiza el perfil localmente sin errores', async () => {
    await persistence.updateProfile('usr-test', {
      username: 'erick_dev',
      full_name: 'Erick Test',
      total_xp: 300,
      current_level: 2,
    });

    const local = persistence.getLocalProfile();
    expect(local.username).toBe('erick_dev');
    expect(local.full_name).toBe('Erick Test');
  });
});
