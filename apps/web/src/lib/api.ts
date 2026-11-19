import {
  ExecutionResult,
  EvaluationResponse,
  RevealSolutionResponse,
  Exercise,
  Track,
  Achievement,
  TableSchemaInfo,
  QueryHistoryItem,
  UserProfile,
  CertificateRecord,
} from '@/types';
import { supabase } from '@/lib/supabase';
import { resolveApiBaseUrl } from '@/lib/apiBase';

const API_BASE_URL = resolveApiBaseUrl();

export const INITIAL_EXERCISE_STUB: Exercise = {
  id: 'e0000000-0000-0000-0000-000000000001',
  module_id: 'a0000000-0000-0000-0000-000000000001',
  title: 'Catálogo Básico de Productos',
  prompt: 'Muestra únicamente el nombre de cada producto (`nombre_producto`) y su precio (`precio`) desde la tabla `productos`.',
  initial_code: '-- Escribe tu consulta aquí\nSELECT ',
  xp_reward: 30,
  difficulty: 'Principiante',
  check_order: false,
  sort_order: 1,
};

let _fallbackCurriculumPromise: Promise<typeof import('@/lib/fallbackCurriculum')> | null = null;
function loadFallbackCurriculum() {
  if (!_fallbackCurriculumPromise) {
    _fallbackCurriculumPromise = import('@/lib/fallbackCurriculum');
  }
  return _fallbackCurriculumPromise;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const LOCAL_STORAGE_HISTORY_KEY = 'qurio_query_history';

/**
 * Obtiene los encabezados HTTP para la API, adjuntando el JWT de Supabase si hay sesión activa.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      headers['Authorization'] = `Bearer ${data.session.access_token}`;
    }
  } catch {
    // Modo offline o sin sesión
  }
  return headers;
}

/**
 * Cliente de integración con la API de FastAPI para ejecución y evaluación semántica.
 */
export const api = {
  /**
   * Diagnóstico de salud del servicio y del Sandbox Docker.
   */
  async checkHealth(): Promise<{ status: string; sandbox_database: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (!res.ok) throw new ApiError('Error al contactar servicio de salud', res.status);
      return await res.json();
    } catch (err: any) {
      console.warn('Backend API no disponible en /health, operando en modo local:', err.message);
      return { status: 'offline', sandbox_database: 'offline' };
    }
  },

  /**
   * Obtiene la lista completa de ejercicios del catálogo.
   */
  async getExercises(): Promise<Exercise[]> {
    const { FALLBACK_EXERCISES } = await loadFallbackCurriculum();
    try {
      const res = await fetch(`${API_BASE_URL}/exercises`);
      if (!res.ok) throw new ApiError('No se pudo cargar la lista de ejercicios', res.status);
      const apiExercises: Exercise[] = await res.json();
      // Enriquecer con metadatos pedagógicos del catálogo local y garantizar que ningún reto nuevo de FALLBACK_EXERCISES quede fuera si Supabase aún no fue sincronizado
      const mergedMap = new Map<string, Exercise>();
      for (const f of FALLBACK_EXERCISES) {
        mergedMap.set(f.id, f);
      }
      for (const apiEx of apiExercises) {
        const fallback = mergedMap.get(apiEx.id);
        if (!fallback) {
          mergedMap.set(apiEx.id, apiEx);
        } else {
          mergedMap.set(apiEx.id, {
            ...fallback,
            ...apiEx,
            prompt: fallback.prompt || apiEx.prompt,
            concept: apiEx.concept || fallback.concept,
            objectives: (apiEx.objectives && apiEx.objectives.length > 0) ? apiEx.objectives : fallback.objectives,
            sample_tables: (apiEx.sample_tables && apiEx.sample_tables.length > 0) ? apiEx.sample_tables : fallback.sample_tables,
            hints: (apiEx.hints && apiEx.hints.length > 0) ? apiEx.hints : fallback.hints,
          });
        }
      }
      return Array.from(mergedMap.values()).sort((a, b) => a.sort_order - b.sort_order);
    } catch (err: any) {
      console.warn('Usando catálogo fallback local:', err.message);
      return FALLBACK_EXERCISES;
    }
  },

  /**
   * Obtiene el detalle de un ejercicio por ID.
   */
  async getExercise(exerciseId: string): Promise<Exercise> {
    const { FALLBACK_EXERCISES } = await loadFallbackCurriculum();
    try {
      const res = await fetch(`${API_BASE_URL}/exercises/${exerciseId}`);
      if (!res.ok) throw new ApiError(`Ejercicio ${exerciseId} no encontrado`, res.status);
      const apiEx: Exercise = await res.json();
      const fallback = FALLBACK_EXERCISES.find((f) => f.id === exerciseId);
      if (!fallback) return apiEx;
      return {
        ...fallback,
        ...apiEx,
        prompt: fallback.prompt || apiEx.prompt,
        concept: apiEx.concept || fallback.concept,
        objectives: (apiEx.objectives && apiEx.objectives.length > 0) ? apiEx.objectives : fallback.objectives,
        sample_tables: (apiEx.sample_tables && apiEx.sample_tables.length > 0) ? apiEx.sample_tables : fallback.sample_tables,
        hints: (apiEx.hints && apiEx.hints.length > 0) ? apiEx.hints : fallback.hints,
      };
    } catch (err: any) {
      const fallback = FALLBACK_EXERCISES.find((e) => e.id === exerciseId);
      if (fallback) return fallback;
      throw new ApiError(`Ejercicio ${exerciseId} no disponible`);
    }
  },

  /**
   * Obtiene las rutas formativas con sus respectivos módulos y ejercicios.
   */
  async getTracks(): Promise<Track[]> {
    const { FALLBACK_TRACKS } = await loadFallbackCurriculum();
    return FALLBACK_TRACKS;
  },

  /**
   * Obtiene el catálogo de logros y medallas.
   */
  async getAchievements(): Promise<Achievement[]> {
    return ACHIEVEMENTS_CATALOG;
  },

  /**
   * Obtiene la introspección del esquema de tablas de Ecommerce_Production_DB.
   */
  async getSchemaTables(): Promise<TableSchemaInfo[]> {
    return ECOMMERCE_TABLES_SCHEMA;
  },

  /**
   * Recupera el historial de consultas ejecutadas por el estudiante.
   */
  getQueryHistory(): QueryHistoryItem[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Guarda una consulta en el historial local.
   */
  saveQueryHistory(item: QueryHistoryItem): void {
    try {
      const current = this.getQueryHistory();
      const updated = [item, ...current.slice(0, 49)];
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('No se pudo persistir el historial en localStorage:', e);
    }
  },

  /**
   * Ejecuta una consulta arbitraria en el Playground del Sandbox Docker (o prueba de un ejercicio si se pasa exerciseId).
   */
  async executePlayground(
    query: string,
    database = 'ecommerce_sandbox',
    exerciseId?: string
  ): Promise<ExecutionResult> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/playground/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          database,
          ...(exerciseId ? { exercise_id: exerciseId } : {}),
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(errorData.detail || 'Error al ejecutar consulta en sandbox', res.status);
      }
      return await res.json();
    } catch (err: any) {
      return {
        status: 'ERROR',
        execution_time_ms: 0,
        row_count: 0,
        columns: [],
        rows: [],
        error: err.message || 'Error de conexión con el motor de ejecución.',
      };
    }
  },

  /**
   * Envía y evalúa semánticamente la solución propuesta por el estudiante.
   */
  async submitSolution(
    exerciseId: string,
    query: string,
    hintsRevealed = 0,
    solutionViewed = false
  ): Promise<EvaluationResponse> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/exercises/${exerciseId}/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          hints_revealed: hintsRevealed,
          solution_viewed: solutionViewed,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401 && errorData.detail?.includes('REGISTRATION_REQUIRED_AFTER_TRIAL')) {
          return {
            status: 'AUTH_REQUIRED',
            execution_time_ms: 0,
            xp_awarded: 0,
            columns: [],
            rows: [],
            message: 'Has completado los 3 retos de prueba. Crea tu cuenta para continuar practicando.',
            error: errorData.detail,
          };
        }
        throw new ApiError(errorData.detail || 'Error al evaluar solución', res.status);
      }
      return await res.json();
    } catch (err: any) {
      return {
        status: 'ERROR',
        execution_time_ms: 0,
        xp_awarded: 0,
        columns: [],
        rows: [],
        message: 'No se pudo comunicar con el evaluador semántico en FastAPI.',
        error: err.message,
      };
    }
  },

  /**
   * Revela la consulta de solución oficial tras al menos 2 intentos fallidos.
   */
  async revealSolution(
    exerciseId: string,
    failedAttempts: number
  ): Promise<RevealSolutionResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/exercises/${exerciseId}/reveal-solution`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ failed_attempts: failedAttempts }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ApiError(
        errorData.detail || 'No se pudo desbloquear la solución oficial del ejercicio',
        res.status
      );
    }

    return await res.json();
  },

  /**
   * Emite o recupera de forma idempotente una constancia verificable en el backend FastAPI.
   */
  async issueCertificate(params: {
    track_id: string;
    track_title: string;
    recipient_name?: string;
    total_exercises: number;
    qa_preview?: boolean;
  }): Promise<CertificateRecord> {
    const headers = await getAuthHeaders();
    const verifyBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const res = await fetch(`${API_BASE_URL}/certificates/issue`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...params,
        verify_base_url: verifyBaseUrl,
      }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ApiError(errorData.detail || 'No se pudo emitir la constancia verificable.', res.status);
    }
    return await res.json();
  },

  /**
   * Lista las constancias emitidas del estudiante autenticado.
   */
  async getMyCertificates(): Promise<CertificateRecord[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/certificates/me`, { headers });
    if (!res.ok) return [];
    return await res.json();
  },

  /**
   * Consulta pública de verificación de constancia por código.
   */
  async verifyCertificate(verificationCode: string): Promise<CertificateRecord> {
    const res = await fetch(`${API_BASE_URL}/certificates/${encodeURIComponent(verificationCode)}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ApiError(errorData.detail || 'Constancia no encontrada.', res.status);
    }
    return await res.json();
  },

  /**
   * Devuelve la URL directa de descarga del PDF oficial en FastAPI.
   */
  getCertificatePdfUrl(verificationCode: string): string {
    return `${API_BASE_URL}/certificates/${encodeURIComponent(verificationCode)}/pdf`;
  },

  /**
   * Devuelve la URL del código QR SVG vectorial en FastAPI.
   */
  getCertificateQrSvgUrl(verificationCode: string): string {
    return `${API_BASE_URL}/certificates/${encodeURIComponent(verificationCode)}/qr.svg`;
  },
};


export const ECOMMERCE_TABLES_SCHEMA: TableSchemaInfo[] = [
  {
    tableName: 'clientes',
    schema: 'public',
    rowCount: 15,
    columns: [
      { name: 'cliente_id', type: 'SERIAL', isPrimary: true },
      { name: 'nombre', type: 'VARCHAR(50)' },
      { name: 'apellido', type: 'VARCHAR(50)' },
      { name: 'email', type: 'VARCHAR(100)' },
      { name: 'ciudad', type: 'VARCHAR(50)' },
      { name: 'pais', type: 'VARCHAR(50)' },
      { name: 'fecha_registro', type: 'DATE' },
    ],
  },
  {
    tableName: 'categorias',
    schema: 'public',
    rowCount: 5,
    columns: [
      { name: 'categoria_id', type: 'SERIAL', isPrimary: true },
      { name: 'nombre_categoria', type: 'VARCHAR(50)' },
      { name: 'descripcion', type: 'TEXT' },
    ],
  },
  {
    tableName: 'proveedores',
    schema: 'public',
    rowCount: 5,
    columns: [
      { name: 'proveedor_id', type: 'SERIAL', isPrimary: true },
      { name: 'nombre_proveedor', type: 'VARCHAR(80)' },
      { name: 'pais', type: 'VARCHAR(50)' },
      { name: 'telefono', type: 'VARCHAR(25)' },
    ],
  },
  {
    tableName: 'productos',
    schema: 'public',
    rowCount: 15,
    columns: [
      { name: 'producto_id', type: 'SERIAL', isPrimary: true },
      { name: 'categoria_id', type: 'INT', isForeign: true },
      { name: 'proveedor_id', type: 'INT', isForeign: true },
      { name: 'nombre_producto', type: 'VARCHAR(100)' },
      { name: 'precio', type: 'NUMERIC(10,2)' },
      { name: 'stock', type: 'INT' },
    ],
  },
  {
    tableName: 'pedidos',
    schema: 'public',
    rowCount: 15,
    columns: [
      { name: 'pedido_id', type: 'SERIAL', isPrimary: true },
      { name: 'cliente_id', type: 'INT', isForeign: true },
      { name: 'fecha_pedido', type: 'DATE' },
      { name: 'estado_pedido', type: 'VARCHAR(20)' },
      { name: 'total', type: 'NUMERIC(10,2)' },
    ],
  },
  {
    tableName: 'detalle_pedidos',
    schema: 'public',
    rowCount: 24,
    columns: [
      { name: 'detalle_id', type: 'SERIAL', isPrimary: true },
      { name: 'pedido_id', type: 'INT', isForeign: true },
      { name: 'producto_id', type: 'INT', isForeign: true },
      { name: 'cantidad', type: 'INT' },
      { name: 'precio_unitario', type: 'NUMERIC(10,2)' },
    ],
  },
  {
    tableName: 'almacenes',
    schema: 'public',
    rowCount: 3,
    columns: [
      { name: 'almacen_id', type: 'SERIAL', isPrimary: true },
      { name: 'nombre_almacen', type: 'VARCHAR(80)' },
      { name: 'ciudad', type: 'VARCHAR(50)' },
      { name: 'capacidad_m2', type: 'INT' },
    ],
  },
  {
    tableName: 'inventario',
    schema: 'public',
    rowCount: 19,
    columns: [
      { name: 'almacen_id', type: 'INT', isPrimary: true, isForeign: true },
      { name: 'producto_id', type: 'INT', isPrimary: true, isForeign: true },
      { name: 'cantidad_disponible', type: 'INT' },
      { name: 'ultima_actualizacion', type: 'TIMESTAMP' },
    ],
  },
  {
    tableName: 'facturas',
    schema: 'public',
    rowCount: 13,
    columns: [
      { name: 'factura_id', type: 'SERIAL', isPrimary: true },
      { name: 'pedido_id', type: 'INT', isForeign: true },
      { name: 'fecha_emision', type: 'DATE' },
      { name: 'monto_total', type: 'NUMERIC(10,2)' },
      { name: 'estado_factura', type: 'VARCHAR(20)' },
    ],
  },
  {
    tableName: 'pagos',
    schema: 'public',
    rowCount: 11,
    columns: [
      { name: 'pago_id', type: 'SERIAL', isPrimary: true },
      { name: 'factura_id', type: 'INT', isForeign: true },
      { name: 'metodo_pago', type: 'VARCHAR(30)' },
      { name: 'monto', type: 'NUMERIC(10,2)' },
      { name: 'fecha_pago', type: 'DATE' },
      { name: 'estado_pago', type: 'VARCHAR(20)' },
    ],
  },
];

export const ACHIEVEMENTS_CATALOG: Achievement[] = [
  {
    id: 'first-query',
    title: 'Primera consulta',
    description: 'Ejecutaste tu primera consulta SQL en Qurio.',
    icon: 'Terminal',
    category: 'progreso',
    xp_reward: 50,
    unlocked_at: null,
    progress: 0,
    required_threshold: 1,
    current_value: 0,
    unit: 'consulta',
  },
  {
    id: 'join-apprentice',
    title: 'Primer cruce con JOIN',
    description: 'Completaste tu primer reto cruzando tablas con INNER JOIN.',
    icon: 'GitBranch',
    category: 'habilidad',
    xp_reward: 75,
    unlocked_at: null,
    progress: 0,
    required_threshold: 1,
    current_value: 0,
    unit: 'ejercicio',
  },
  {
    id: 'null-detective',
    title: 'Detector de NULL',
    description: 'Encontraste filas sin coincidencias usando LEFT JOIN e IS NULL.',
    icon: 'Search',
    category: 'habilidad',
    xp_reward: 100,
    unlocked_at: null,
    progress: 0,
    required_threshold: 1,
    current_value: 0,
    unit: 'ejercicio',
  },
  {
    id: 'streak-3',
    title: 'Racha de 3 días',
    description: 'Mantén una racha de práctica durante 3 días seguidos.',
    icon: 'Flame',
    category: 'constancia',
    xp_reward: 100,
    unlocked_at: null,
    progress: 0,
    required_threshold: 3,
    current_value: 0,
    unit: 'días',
  },
  {
    id: 'streak-7',
    title: 'Semana completa',
    description: 'Mantén una racha de práctica durante 7 días seguidos.',
    icon: 'Award',
    category: 'constancia',
    xp_reward: 250,
    unlocked_at: null,
    progress: 0,
    required_threshold: 7,
    current_value: 0,
    unit: 'días',
  },
  {
    id: 'speed-runner',
    title: 'Baja latencia',
    description: 'Ejecuta una consulta evaluada en menos de 5 ms en PostgreSQL.',
    icon: 'Zap',
    category: 'habilidad',
    xp_reward: 120,
    unlocked_at: null,
    progress: 0,
    required_threshold: 1,
    current_value: 0,
    unit: 'consulta',
  },
  {
    id: 'window-wizard',
    title: 'Funciones de ventana',
    description: 'Resuelve un ejercicio usando funciones de ventana (ROW_NUMBER, RANK, LAG).',
    icon: 'Layers',
    category: 'habilidad',
    xp_reward: 150,
    unlocked_at: null,
    progress: 0,
    required_threshold: 1,
    current_value: 0,
    unit: 'ejercicio',
  },
  {
    id: 'cte-architect',
    title: 'Consultas con CTE',
    description: 'Divide una consulta compleja en pasos claros usando WITH.',
    icon: 'GitBranch',
    category: 'habilidad',
    xp_reward: 125,
    unlocked_at: null,
    progress: 0,
    required_threshold: 1,
    current_value: 0,
    unit: 'ejercicio',
  },
  {
    id: 'dml-operator',
    title: 'Cambios con DML',
    description: 'Ejecuta tu primer cambio de datos (INSERT, UPDATE, DELETE o RETURNING) en pg_temp.',
    icon: 'Wrench',
    category: 'habilidad',
    xp_reward: 150,
    unlocked_at: null,
    progress: 0,
    required_threshold: 1,
    current_value: 0,
    unit: 'ejercicio',
  },
  {
    id: 'ddl-designer',
    title: 'Diseño de esquemas',
    description: 'Crea o modifica tablas y restricciones CHECK/FK con DDL.',
    icon: 'Database',
    category: 'habilidad',
    xp_reward: 175,
    unlocked_at: null,
    progress: 0,
    required_threshold: 1,
    current_value: 0,
    unit: 'ejercicio',
  },
  {
    id: 'index-tuner',
    title: 'Índices en PostgreSQL',
    description: 'Crea o elimina índices B-Tree, UNIQUE o parciales.',
    icon: 'Gauge',
    category: 'habilidad',
    xp_reward: 200,
    unlocked_at: null,
    progress: 0,
    required_threshold: 1,
    current_value: 0,
    unit: 'ejercicio',
  },
  {
    id: 'quarter-master',
    title: '20 retos resueltos',
    description: 'Completa 20 retos del plan de estudios.',
    icon: 'ShieldCheck',
    category: 'progreso',
    xp_reward: 120,
    unlocked_at: null,
    progress: 0,
    required_threshold: 20,
    current_value: 0,
    unit: 'ejercicios',
  },
  {
    id: 'halfway-engineer',
    title: 'Mitad del camino',
    description: 'Supera los 40 retos resueltos en PostgreSQL 16.',
    icon: 'Trophy',
    category: 'progreso',
    xp_reward: 250,
    unlocked_at: null,
    progress: 0,
    required_threshold: 40,
    current_value: 0,
    unit: 'ejercicios',
  },
  {
    id: 'master-sql',
    title: 'Plan de estudios completo',
    description: 'Completa al 100% las 4 rutas del plan de estudios (DQL, DML y DDL).',
    icon: 'Sparkles',
    category: 'progreso',
    xp_reward: 500,
    unlocked_at: null,
    progress: 0,
    required_threshold: 80,
    current_value: 0,
    unit: 'ejercicios',
  },
];

function parseCanonicalExerciseNumber(id: string): number | null {
  const match = /^e0000000-0000-0000-0000-0000000000(\d{2})$/i.exec(id.trim());
  return match ? Number(match[1]) : null;
}

function hasCompletedInModuleRange(
  completedExerciseIds: Set<string>,
  minSortOrder: number,
  maxSortOrder: number,
  legacyTokens: string[] = []
): boolean {
  for (const id of completedExerciseIds) {
    const num = parseCanonicalExerciseNumber(id);
    if (num !== null && num >= minSortOrder && num <= maxSortOrder) {
      return true;
    }
    if (legacyTokens.some((token) => id.includes(token))) {
      return true;
    }
  }
  return false;
}

/**
 * Evalúa reactiva y autoritativamente las medallas del usuario en base a sus métricas reales.
 */
export function evaluateUserAchievements(
  catalog: Achievement[],
  userProfile: UserProfile | null,
  completedExerciseIds: Set<string>,
  totalAttemptsCount: number,
  bestExecutionTimeMs?: number
): Achievement[] {
  const completedCount = completedExerciseIds.size;
  const maxStreak = userProfile?.max_streak_days ?? 0;

  return catalog.map((ach) => {
    let currentValue = 0;
    let unlocked = false;

    switch (ach.id) {
      case 'first-query':
        currentValue = Math.min(1, Math.max(totalAttemptsCount, completedCount));
        unlocked = currentValue >= ach.required_threshold;
        break;

      case 'join-apprentice':
        unlocked = hasCompletedInModuleRange(completedExerciseIds, 25, 29, ['m05', 'join']);
        currentValue = unlocked ? 1 : 0;
        break;

      case 'null-detective':
        unlocked = hasCompletedInModuleRange(completedExerciseIds, 30, 35, ['m06', 'null']);
        currentValue = unlocked ? 1 : 0;
        break;

      case 'streak-3':
        currentValue = maxStreak;
        unlocked = maxStreak >= 3;
        break;

      case 'streak-7':
        currentValue = maxStreak;
        unlocked = maxStreak >= 7;
        break;

      case 'speed-runner':
        unlocked =
          completedCount > 0 &&
          bestExecutionTimeMs !== undefined &&
          bestExecutionTimeMs > 0 &&
          bestExecutionTimeMs <= 5.0;
        currentValue = unlocked ? 1 : 0;
        break;

      case 'window-wizard':
        unlocked = hasCompletedInModuleRange(completedExerciseIds, 56, 60, ['m09', 'm10', 'm12', 'window']);
        currentValue = unlocked ? 1 : 0;
        break;

      case 'cte-architect':
        unlocked = hasCompletedInModuleRange(completedExerciseIds, 52, 55, ['m11', 'cte']);
        currentValue = unlocked ? 1 : 0;
        break;

      case 'dml-operator':
        unlocked =
          hasCompletedInModuleRange(completedExerciseIds, 61, 68, ['m13', 'm14', 'dml']) ||
          hasCompletedInModuleRange(completedExerciseIds, 80, 80, []);
        currentValue = unlocked ? 1 : 0;
        break;

      case 'ddl-designer':
        unlocked = hasCompletedInModuleRange(completedExerciseIds, 69, 72, ['m15', 'ddl']);
        currentValue = unlocked ? 1 : 0;
        break;

      case 'index-tuner':
        unlocked = hasCompletedInModuleRange(completedExerciseIds, 73, 76, ['m16', 'index']);
        currentValue = unlocked ? 1 : 0;
        break;

      case 'quarter-master':
      case 'halfway-engineer':
      case 'master-sql':
        currentValue = completedCount;
        unlocked = completedCount >= ach.required_threshold;
        break;

      default:
        currentValue = ach.current_value;
        unlocked = !!ach.unlocked_at;
    }

    const progress = Math.min(
      100,
      Math.max(0, Math.round((currentValue / (ach.required_threshold || 1)) * 100))
    );

    return {
      ...ach,
      current_value: currentValue,
      progress,
      unlocked_at: unlocked ? (ach.unlocked_at || new Date().toISOString()) : null,
    };
  });
}

export const DEFAULT_QUERY_HISTORY: QueryHistoryItem[] = [
  {
    id: 'hist-1',
    query: 'SELECT nombre_producto, precio FROM productos WHERE precio > 500;',
    executed_at: 'Hace 5 minutos',
    status: 'SUCCESS',
    execution_time_ms: 3.4,
    row_count: 5,
  },
  {
    id: 'hist-2',
    query: 'SELECT cliente_id, nombre, apellido FROM clientes WHERE pais = \'España\' ORDER BY apellido ASC;',
    executed_at: 'Hace 22 minutos',
    status: 'SUCCESS',
    execution_time_ms: 4.1,
    row_count: 4,
  },
  {
    id: 'hist-3',
    query: 'SELECT categoria_id, COUNT(*) FROM productos GROUP BY categoria_id HAVING COUNT(*) > 2;',
    executed_at: 'Hace 1 hora',
    status: 'SUCCESS',
    execution_time_ms: 3.8,
    row_count: 3,
  },
  {
    id: 'hist-4',
    query: 'SELECT c.cliente_id, c.nombre, p.pedido_id FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id WHERE p.pedido_id IS NULL;',
    executed_at: 'Hace 3 horas',
    status: 'SUCCESS',
    execution_time_ms: 5.2,
    row_count: 3,
  },
];
