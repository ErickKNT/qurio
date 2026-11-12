import {
  ExecutionResult,
  EvaluationResponse,
  RevealSolutionResponse,
  Exercise,
  Track,
  Achievement,
  TableSchemaInfo,
  QueryHistoryItem,
  SampleTableData,
  UserProfile,
} from '@/types';
import { supabase } from '@/lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
    try {
      const res = await fetch(`${API_BASE_URL}/exercises`);
      if (!res.ok) throw new ApiError('No se pudo cargar la lista de ejercicios', res.status);
      const apiExercises: Exercise[] = await res.json();
      // Enriquecer con metadatos pedagógicos del catálogo local (concept, objectives, sample_tables, prompt actualizado)
      return apiExercises.map((apiEx) => {
        const fallback = FALLBACK_EXERCISES.find((f) => f.id === apiEx.id);
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
      });
    } catch (err: any) {
      console.warn('Usando catálogo fallback local:', err.message);
      return FALLBACK_EXERCISES;
    }
  },

  /**
   * Obtiene el detalle de un ejercicio por ID.
   */
  async getExercise(exerciseId: string): Promise<Exercise> {
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
      return data ? JSON.parse(data) : DEFAULT_QUERY_HISTORY;
    } catch {
      return DEFAULT_QUERY_HISTORY;
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
   * Ejecuta una consulta arbitraria en el Playground del Sandbox Docker.
   */
  async executePlayground(query: string, database = 'ecommerce_sandbox'): Promise<ExecutionResult> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/playground/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, database }),
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
};

export const SAMPLE_TABLE_PRODUCTOS: SampleTableData = {
  tableName: 'productos',
  columns: ["producto_id", "categoria_id", "nombre_producto", "precio", "stock"],
  rows: [
    [1, 1, "Laptop Pro 15", 1299.99, 15],
    [2, 1, "Smartphone X", 799.5, 30],
    [3, 1, "Auriculares Noise-Cancelling", 199.99, 50],
    [4, 1, "Monitor 4K 27\"", 450.0, 20],
    [5, 1, "Teclado Mecánico RGB", 89.9, 80],
  ],
};

export const SAMPLE_TABLE_CLIENTES: SampleTableData = {
  tableName: 'clientes',
  columns: ["cliente_id", "nombre", "apellido", "email", "ciudad", "pais"],
  rows: [
    [1, "Carlos", "Mendoza", "carlos.mendoza@email.com", "Madrid", "España"],
    [2, "Elena", "Gómez", "elena.gomez@email.com", "Barcelona", "España"],
    [3, "Mateo", "Silva", "mateo.silva@email.com", "Valencia", "España"],
    [4, "Sofía", "Torres", "sofia.torres@email.com", "Sevilla", "España"],
    [11, "Diego", "Hernández", "diego.hernandez@email.com", "Madrid", "España"],
  ],
};

export const SAMPLE_TABLE_PEDIDOS: SampleTableData = {
  tableName: 'pedidos',
  columns: ["pedido_id", "cliente_id", "fecha_pedido", "estado_pedido", "total"],
  rows: [
    [101, 1, "2024-01-10", "completado", 1499.98],
    [102, 2, "2024-01-12", "completado", 799.5],
    [103, 3, "2024-01-15", "pendiente", 89.9],
    [104, 1, "2024-02-01", "completado", 450.0],
  ],
};

export const SAMPLE_TABLE_CATEGORIAS: SampleTableData = {
  tableName: 'categorias',
  columns: ["categoria_id", "nombre_categoria", "descripcion"],
  rows: [
    [1, "Electrónica", "Dispositivos, gadgets y accesorios tecnológicos"],
    [2, "Hogar", "Muebles, decoración y cocina"],
    [3, "Deportes", "Equipamiento deportivo y fitness"],
    [4, "Moda", "Ropa y calzado"],
    [5, "Libros", "Lecturas y material educativo"],
  ],
};

export const SAMPLE_TABLE_DETALLE_PEDIDOS: SampleTableData = {
  tableName: 'detalle_pedidos',
  columns: ["detalle_id", "pedido_id", "producto_id", "cantidad", "precio_unitario"],
  rows: [
    [1, 101, 1, 1, 1299.99],
    [2, 101, 3, 1, 199.99],
    [3, 102, 2, 1, 799.5],
    [4, 103, 5, 1, 89.9],
  ],
};

export const SAMPLE_TABLE_FACTURAS: SampleTableData = {
  tableName: 'facturas',
  columns: ["factura_id", "pedido_id", "fecha_emision", "monto_total", "estado_factura"],
  rows: [
    [201, 101, "2024-01-10", 1590.0, "pagada"],
    [202, 102, "2024-01-12", 720.0, "pagada"],
    [205, 105, "2024-01-20", 580.0, "anulada"],
    [210, 110, "2024-02-05", 480.0, "pendiente"],
  ],
};

export const SAMPLE_TABLE_PROVEEDORES: SampleTableData = {
  tableName: 'proveedores',
  columns: ["proveedor_id", "nombre_proveedor", "pais", "telefono"],
  rows: [
    [1, "TechDistro España S.L.", "España", "+34 91 123 4567"],
    [2, "Nordic Peripherals AB", "Suecia", "+46 8 555 1234"],
    [3, "Silicon Logistics Asia", "Taiwán", "+886 2 8765 4321"],
  ],
};

export const SAMPLE_TABLE_ALMACENES: SampleTableData = {
  tableName: 'almacenes',
  columns: ["almacen_id", "nombre_almacen", "ciudad", "capacidad_m2"],
  rows: [
    [1, "Hub Logístico Central Madrid", "Madrid", 5000],
    [2, "Centro de Distribución Norte", "Bilbao", 2800],
    [3, "Almacén Mediterráneo", "Valencia", 3500],
  ],
};

export const SAMPLE_TABLE_INVENTARIO: SampleTableData = {
  tableName: 'inventario',
  columns: ["almacen_id", "producto_id", "cantidad_disponible"],
  rows: [
    [1, 1, 15],
    [1, 4, 8],
    [2, 2, 20],
    [3, 3, 25],
  ],
};

export const SAMPLE_TABLE_PAGOS: SampleTableData = {
  tableName: 'pagos',
  columns: ["pago_id", "factura_id", "metodo_pago", "monto", "fecha_pago", "estado_pago"],
  rows: [
    [1, 201, "tarjeta_credito", 1590.0, "2024-01-10", "aprobado"],
    [2, 202, "transferencia", 720.0, "2024-01-12", "aprobado"],
    [3, 203, "paypal", 215.0, "2024-01-15", "aprobado"],
  ],
};

export const FALLBACK_EXERCISES: Exercise[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    module_id: 'a0000000-0000-0000-0000-000000000001',
    title: "Catálogo Básico de Productos",
    prompt: "Imagina que necesitas armar un catálogo sencillo para la tienda. Muestra únicamente el nombre de cada producto (`nombre_producto`) y su precio (`precio`) desde la tabla `productos`.",
    initial_code: "-- Escribe tu consulta aquí\nSELECT ",
    xp_reward: 30,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 1,
    hints: [
      "Usa la sentencia SELECT seguida de las columnas solicitadas separadas por coma: nombre_producto, precio",
      "La cláusula FROM indica la tabla: FROM productos;"
],
    concept: {
      summary: "Con `SELECT` eliges exactamente qué columnas quieres ver de una tabla, como si seleccionaras qué columnas mantener a la vista en una hoja de cálculo.",
      syntax: "SELECT columna_1, columna_2\nFROM nombre_tabla;",
      key_points: [
        "`SELECT` va seguido de las columnas que quieres mostrar, separadas por coma `,`.",
        "`FROM` indica el nombre de la tabla de donde se obtendrán los datos.",
        "Toda instrucción en SQL finaliza con un punto y coma `;`."
      ],
      execution_order_note: "💡 ¿Cómo lo lee la base de datos? Primero busca la tabla con `FROM` y luego extrae solo las columnas que pediste en `SELECT`.",
    },
    objectives: [
      "1. Identificar la tabla de productos dentro del esquema.",
      "2. Seleccionar únicamente el nombre y el costo unitario de cada artículo.",
      "3. Ejecutar y verificar los registros devueltos en la cuadrícula."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000008',
    module_id: 'a0000000-0000-0000-0000-000000000001',
    title: "Cálculo de Precios con IVA",
    prompt: "Calcula el precio final con impuestos para cada producto. Muestra el `nombre_producto`, el `precio` original y calcula el precio con el 21% de IVA (`precio * 1.21`) redondeado a 2 decimales, llamando a esa nueva columna `precio_con_iva`.",
    initial_code: "-- Proyecta columnas y calcula el precio con IVA\nSELECT ",
    xp_reward: 35,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 2,
    hints: [
      "Puedes realizar operaciones matemáticas directamente en SELECT, ej: precio * 1.21",
      "Usa ROUND(precio * 1.21, 2) AS precio_con_iva para limitar a 2 decimales y asignar el alias."
],
    concept: {
      summary: "En SQL puedes realizar cálculos aritméticos directamente en la cláusula `SELECT` (+, -, *, /) y renombrar el resultado con `AS`.",
      syntax: "SELECT columna,\n       ROUND(columna * factor, 2) AS nuevo_nombre\nFROM nombre_tabla;",
      key_points: [
        "Puedes operar con columnas numéricas directamente en el `SELECT`: `columna * multiplicador` o `col_a + col_b`.",
        "`ROUND(expresion, N)` redondea el número resultante a `N` decimales de precisión.",
        "`AS alias_deseado` asigna un encabezado limpio y descriptivo a la columna calculada en la cuadrícula final."
      ],
      execution_order_note: "💡 El cálculo se hace al vuelo en la consulta; no altera los valores originales guardados en la tabla.",
    },
    objectives: [
      "1. Mostrar las columnas descriptivas y de precio base del artículo.",
      "2. Aplicar el cálculo de la tasa del 21% de impuesto con 2 decimales.",
      "3. Asignar un nombre claro y representativo a la columna calculada."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000019',
    module_id: 'a0000000-0000-0000-0000-000000000001',
    title: "Concatenación de Nombre Completo",
    prompt: "Prepara un directorio para el equipo de atención al cliente. Une el `nombre` y el `apellido` de cada cliente separados por un espacio, nómbralo `cliente_completo`, y muestra también su `email` desde la tabla `clientes`.",
    initial_code: "-- Concatena nombre y apellido con un espacio\nSELECT ",
    xp_reward: 35,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 3,
    hints: [
      "Usa el operador de combinación de textos en SQL: '||'.",
      "Para insertar un espacio en medio escribe: nombre || ' ' || apellido AS cliente_completo."
],
    concept: {
      summary: "El operador de concatenación `||` permite unir dos o más valores de texto en una sola columna combinada.",
      syntax: "SELECT columna_a || ' ' || columna_b AS texto_completo\nFROM nombre_tabla;",
      key_points: [
        "Para intercalar un espacio entre dos textos, se encadenan tres elementos con `||`: `col1 || ' ' || col2`.",
        "En SQL, las cadenas de texto literales siempre deben encerrarse entre comillas simples: `' '`.",
        "Usa `AS nombre_columna` para darle un nombre representativo a la columna resultante."
      ],
      execution_order_note: "💡 Si cualquiera de los dos lados concatenados fuera `NULL`, el resultado total de `||` sería `NULL`.",
    },
    objectives: [
      "1. Obtener los registros de la tabla de clientes.",
      "2. Combinar el nombre y el apellido en una sola columna con separación legible.",
      "3. Presentar la columna unificada junto con la dirección de correo electrónico."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000020',
    module_id: 'a0000000-0000-0000-0000-000000000001',
    title: "Catálogo de Ciudades Únicas (DISTINCT)",
    prompt: "Logística necesita saber en qué ciudades tenemos clientes sin que los nombres se repitan. Obtén la lista de ciudades únicas (`ciudad`) de la tabla `clientes`.",
    initial_code: "-- Obtén valores únicos de ciudad\nSELECT ",
    xp_reward: 35,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 4,
    hints: [
      "La palabra reservada DISTINCT se coloca inmediatamente después de SELECT.",
      "Escribe: SELECT DISTINCT ciudad FROM clientes;"
],
    concept: {
      summary: "`DISTINCT` filtra y elimina filas duplicadas, devolviendo únicamente valores únicos en el resultado.",
      syntax: "SELECT DISTINCT columna\nFROM nombre_tabla;",
      key_points: [
        "`DISTINCT` se escribe inmediatamente después de la palabra clave `SELECT`.",
        "Si un valor se repite en cientos de registros, `DISTINCT` colapsa los duplicados en una única aparición.",
        "Se aplica sobre el conjunto de columnas proyectadas; si proyectas una columna, garantiza valores únicos de esa columna."
      ],
      execution_order_note: "💡 El motor primero reúne las filas y luego ejecuta una ordenación interna para descartar duplicados.",
    },
    objectives: [
      "1. Consultar la ubicación de residencia de los clientes.",
      "2. Filtrar el listado para suprimir todas las ciudades repetidas.",
      "3. Presentar una lista de ubicaciones geográficas únicas."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    module_id: 'a0000000-0000-0000-0000-000000000002',
    title: "Productos Premium (> 500€)",
    prompt: "El equipo de marketing prepara una campaña especial de productos exclusivos. Muestra el `nombre_producto`, el `precio` y el `stock` de aquellos productos cuyo precio sea mayor a 500€.",
    initial_code: "-- Filtra los productos de alto valor\nSELECT ",
    xp_reward: 35,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 5,
    hints: [
      "Agrega una cláusula WHERE después de FROM productos.",
      "Utiliza el operador de comparación mayor que (>): WHERE precio > 500;"
],
    concept: {
      summary: "`WHERE` es la cláusula de filtrado de SQL: instruye a la base de datos a retornar únicamente aquellas filas que cumplan una condición lógica.",
      syntax: "SELECT columna_1, columna_2\nFROM nombre_tabla\nWHERE columna_numerica > valor_umbral;",
      key_points: [
        "`WHERE` se ubica después de `FROM nombre_tabla` y antes de cualquier ordenamiento.",
        "Operadores numéricos de teclado: mayor que `>`, menor que `<`, igual `=`, mayor o igual `>=` y menor o igual `<=`.",
        "Los operadores `>=` y `<=` se escriben combinando dos caracteres seguidos en el teclado sin espacios (`>` luego `=`, `<` luego `=`)."
      ],
      execution_order_note: "💡 El motor filtra con `WHERE` antes de armar las columnas del `SELECT` para no procesar datos innecesarios.",
    },
    objectives: [
      "1. Seleccionar la descripción, precio y existencias del inventario.",
      "2. Establecer una condición para aislar exclusivamente los artículos de alto valor.",
      "3. Asegurar que los productos que no alcancen el umbral queden excluidos."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000009',
    module_id: 'a0000000-0000-0000-0000-000000000002',
    title: "Productos en Rango Medio (BETWEEN)",
    prompt: "Encuentra los productos de gama media para una promoción especial. Muestra el `nombre_producto` y el `precio` de todos los artículos cuyo precio esté entre 100€ y 800€ (ambos inclusive).",
    initial_code: "-- Filtra productos en el rango de 100 a 800\nSELECT ",
    xp_reward: 35,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 6,
    hints: [
      "Usa la cláusula WHERE con el operador BETWEEN: WHERE precio BETWEEN 100 AND 800;",
      "Recuerda que BETWEEN siempre conecta el rango con la palabra AND."
],
    concept: {
      summary: "`BETWEEN` evalúa si un valor se encuentra dentro de un intervalo cerrado (entre un límite inferior y un límite superior).",
      syntax: "SELECT columna_1, columna_2\nFROM nombre_tabla\nWHERE columna BETWEEN limite_min AND limite_max;",
      key_points: [
        "`BETWEEN min AND max` es inclusivo: incluye tanto el límite inferior como el superior.",
        "Escribir `col BETWEEN a AND b` equivale lógicamente a `col >= a AND col <= b`.",
        "Funciona de manera óptima tanto con números como con fechas y cadenas alfanuméricas."
      ],
      execution_order_note: "💡 El motor evalúa el rango directamente sobre los datos de la columna de forma optimizada.",
    },
    objectives: [
      "1. Consultar el catálogo de artículos de gama media.",
      "2. Delimitar los resultados mediante un operador de rango continuo.",
      "3. Comprobar que los límites superior e inferior queden incluidos."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000021',
    module_id: 'a0000000-0000-0000-0000-000000000002',
    title: "Búsqueda por Patrón de Correo (LIKE)",
    prompt: "Marketing quiere enviar un aviso a los usuarios registrados con correos corporativos estándar `@email.com`. Muestra el `nombre`, `apellido` y `email` de aquellos clientes cuyo correo termine exactamente en `@email.com`.",
    initial_code: "-- Filtra clientes con comodín LIKE\nSELECT ",
    xp_reward: 40,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 7,
    hints: [
      "El comodín % colocado al inicio indica que puede haber cualquier texto antes del dominio.",
      "Escribe: WHERE email LIKE '%@email.com';"
],
    concept: {
      summary: "`LIKE` busca coincidencias en cadenas de texto mediante caracteres comodín como `%` (cualquier secuencia de caracteres).",
      syntax: "SELECT columna_1, columna_2\nFROM nombre_tabla\nWHERE columna_texto LIKE '%terminacion';",
      key_points: [
        "El comodín `%` representa cero, uno o múltiples caracteres arbitrarios.",
        "`'%texto'` busca textos que terminen exactamente en esa palabra; `'texto%'` busca que comiencen con ella; y `'%texto%'` busca que la contenga en cualquier parte.",
        "El patrón de búsqueda siempre debe encerrarse entre comillas simples: `'...%'`."
      ],
      execution_order_note: "💡 `LIKE` distingue mayúsculas de minúsculas. Si necesitas ignorar mayúsculas en PostgreSQL se usa `ILIKE`.",
    },
    objectives: [
      "1. Consultar los datos de contacto de los clientes registrados.",
      "2. Aplicar un filtro de patrón para identificar la terminación del correo corporativo.",
      "3. Verificar que solo aparezcan cuentas con el dominio especificado."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000022',
    module_id: 'a0000000-0000-0000-0000-000000000002',
    title: "Filtro de Ciudades Específicas (IN)",
    prompt: "Operaciones lanzó envíos express para tres ciudades clave: Madrid, Barcelona y Valencia. Muestra el `cliente_id`, `nombre`, `apellido` y `ciudad` de los clientes que vivan en cualquiera de estas tres ciudades.",
    initial_code: "-- Filtra mediante el operador IN\nSELECT ",
    xp_reward: 40,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 8,
    hints: [
      "Usa el operador IN seguido de la lista entre paréntesis: IN ('Madrid', 'Barcelona', 'Valencia').",
      "No olvides las comillas simples en cada ciudad dentro de la lista."
],
    concept: {
      summary: "`IN` comprueba si el valor de una columna coincide con cualquiera de los elementos listados dentro de un conjunto cerrado.",
      syntax: "SELECT columna_1, columna_2\nFROM nombre_tabla\nWHERE columna IN ('valor_1', 'valor_2', 'valor_3');",
      key_points: [
        "La lista de opciones válidas se delimita entre paréntesis `(...)` y cada elemento se separa por comas.",
        "`col IN (a, b)` es la alternativa limpia y recomendada para evitar múltiples `OR` encadenados (`col = a OR col = b`).",
        "Cada valor de texto dentro de la lista debe llevar sus propias comillas simples individuales: `'valor'`."
      ],
      execution_order_note: "💡 `IN` suele ejecutarse de forma mucho más rápida que múltiples `OR` gracias a la búsqueda por tabla hash en el motor.",
    },
    objectives: [
      "1. Consultar la lista de clientes y sus ciudades de residencia.",
      "2. Filtrar los usuarios pertenecientes al listado de centros urbanos clave.",
      "3. Resolver el filtro sin encadenar comparaciones individuales repetidas."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000023',
    module_id: 'a0000000-0000-0000-0000-000000000002',
    title: "Productos en Riesgo de Stock (OR)",
    prompt: "El almacén necesita ubicar productos en situación crítica de inventario: artículos con muy poco stock (15 o menos unidades) o artículos con sobrestock (75 o más unidades). Muestra el `producto_id`, `nombre_producto` y `stock` que cumplan cualquiera de estas dos condiciones.",
    initial_code: "-- Combina condiciones con OR\nSELECT ",
    xp_reward: 40,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 9,
    hints: [
      "Usa OR para unir las dos reglas: stock <= 15 OR stock >= 75.",
      "Asegúrate de incluir los símbolos de igual (=) junto a < y >."
],
    concept: {
      summary: "El operador lógico `OR` permite incluir una fila si satisface al menos una de las condiciones especificadas (o ambas).",
      syntax: "SELECT columna_1, columna_2\nFROM nombre_tabla\nWHERE condicion_1 OR condicion_2;",
      key_points: [
        "`cond1 OR cond2` devolverá la fila si la condición 1 es verdadera, si la condición 2 es verdadera, o si ambas lo son.",
        "Para operadores compuestos de teclado: menor o igual se escribe `<=` y mayor o igual se escribe `>=` (sin espacios entre los dos símbolos).",
        "Puedes combinar rangos extremos uniendo dos predicados con `OR` en la cláusula `WHERE`."
      ],
      execution_order_note: "💡 En lógica booleana de SQL, `AND` tiene mayor precedencia que `OR`; si mezclas ambos operadores, usa paréntesis `()`.",
    },
    objectives: [
      "1. Consultar los artículos en los extremos de disponibilidad.",
      "2. Establecer una doble condición donde baste cumplir cualquiera de los dos extremos.",
      "3. Incluir productos en escasez crítica o con exceso de inventario."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000024',
    module_id: 'a0000000-0000-0000-0000-000000000002',
    title: "Facturas de Alto Valor No Pagadas (AND + NOT)",
    prompt: "Contabilidad necesita revisar facturas importantes pendientes de cobro. Muestra el `factura_id`, `monto_total` y `estado_factura` de aquellas facturas con un monto de 400€ o más y cuyo estado sea distinto de `'pagada'`.",
    initial_code: "-- Combina AND con el operador de desigualdad\nSELECT ",
    xp_reward: 45,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 10,
    hints: [
      "Combina las condiciones con AND: WHERE monto_total >= 400 AND estado_factura <> 'pagada';",
      "Recuerda que 'pagada' va entre comillas simples."
],
    concept: {
      summary: "`AND` exige el cumplimiento simultáneo de dos reglas. Para evaluar desigualdad ('distinto de'), SQL utiliza `<>` o `!=`.",
      syntax: "SELECT columna_1, columna_2\nFROM nombre_tabla\nWHERE condicion_1 AND columna_estado <> 'valor_excluido';",
      key_points: [
        "`AND` requiere que ambas expresiones sean verdaderas para que el registro aparezca en el resultado.",
        "En SQL, la desigualdad se expresa con `<>` (estándar ISO) o con `!=` (signo de admiración `!` seguido de `=`). Ambos son reconocidos por PostgreSQL.",
        "Mayor o igual se escribe `>=` con los dos caracteres de teclado consecutivos (`>` y `=`)."
      ],
      execution_order_note: "💡 PostgreSQL evalúa primero la condición que descarte más filas rápidamente para ahorrar trabajo.",
    },
    objectives: [
      "1. Consultar la información contable de las facturas.",
      "2. Exigir simultáneamente un importe relevante y un estado pendiente de cobro.",
      "3. Excluir explícitamente los comprobantes que ya fueron liquidados."
],
    sample_tables: [SAMPLE_TABLE_FACTURAS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    module_id: 'a0000000-0000-0000-0000-000000000003',
    title: "Clientes Españoles Ordenados por Apellido",
    prompt: "Organiza la lista de clientes que viven en España por orden alfabético. Muestra su `nombre`, `apellido` y `ciudad` de la tabla `clientes`, ordenando los resultados alfabéticamente por su `apellido` (de la A a la Z).",
    initial_code: "-- Filtra y ordena los clientes\nSELECT ",
    xp_reward: 40,
    difficulty: 'Principiante',
    check_order: true,
    sort_order: 11,
    hints: [
      "Primero filtra el país en el WHERE y luego añade la cláusula ORDER BY al final.",
      "Escribe: ORDER BY apellido ASC;"
],
    concept: {
      summary: "`ORDER BY` controla la ordenación de las filas devueltas, permitiendo clasificar de forma ascendente (`ASC`) o descendente (`DESC`).",
      syntax: "SELECT columna_1, columna_2\nFROM nombre_tabla\nWHERE condicion_filtro\nORDER BY columna_criterio [ASC | DESC];",
      key_points: [
        "`ORDER BY col ASC` ordena de menor a mayor (A-Z o numérico creciente); es el modo por defecto si se omite.",
        "`ORDER BY col DESC` ordena de mayor a menor (Z-A o numérico decreciente).",
        "La cláusula `ORDER BY` se escribe al final de la consulta (después de `FROM` y `WHERE`)."
      ],
      execution_order_note: "💡 `ORDER BY` se ejecuta casi al final de todo el proceso de consulta, justo antes de enviar los datos al cliente.",
    },
    objectives: [
      "1. Acotar el conjunto de clientes al país solicitado.",
      "2. Seleccionar los campos de identidad y residencia.",
      "3. Ordenar alfabéticamente el listado de la A a la Z por el apellido."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000010',
    module_id: 'a0000000-0000-0000-0000-000000000003',
    title: "Top 5 Productos Críticos por Stock",
    prompt: "El almacén necesita reponer con urgencia los artículos que están por agotarse. Muestra el `nombre_producto` y el `stock` de los 5 productos con menor cantidad disponible en inventario.",
    initial_code: "-- Ordena y limita a los 5 productos con menos stock\nSELECT ",
    xp_reward: 40,
    difficulty: 'Principiante',
    check_order: true,
    sort_order: 12,
    hints: [
      "Ordena por stock en orden ascendente para poner los más bajos primero: ORDER BY stock ASC.",
      "Agrega LIMIT 5 al final para quedarte solo con los primeros 5."
],
    concept: {
      summary: "`LIMIT` restringe la cantidad máxima de filas retornadas, permitiendo obtener los primeros `N` registros clasificados.",
      syntax: "SELECT columna_1, columna_2\nFROM nombre_tabla\nORDER BY columna_criterio ASC\nLIMIT cantidad_filas;",
      key_points: [
        "`LIMIT N` corta el conjunto de datos y entrega únicamente las primeras `N` filas.",
        "El orden es determinante: primero se ordenan los datos con `ORDER BY` y luego `LIMIT` toma los primeros puestos del ranking.",
        "Si buscas los menores valores, ordena con `ASC`; si buscas los mayores, ordena con `DESC`."
      ],
      execution_order_note: "💡 Usar `LIMIT` evita transferir gigabytes de datos cuando solo te interesan las muestras principales.",
    },
    objectives: [
      "1. Consultar los artículos de menor disponibilidad en almacén.",
      "2. Clasificar el inventario de menor a mayor existencia.",
      "3. Acotar el resultado para mostrar exactamente los 5 artículos más urgentes."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000025',
    module_id: 'a0000000-0000-0000-0000-000000000003',
    title: "Ordenamiento Multi-Criterio",
    prompt: "Organiza los productos por su categoría y luego por su valor comercial. Muestra `producto_id`, `categoria_id`, `nombre_producto` y `precio`, ordenándolos primero por categoría de menor a mayor (`categoria_id ASC`), y dentro de cada categoría, del más caro al más barato (`precio DESC`).",
    initial_code: "-- Ordena por múltiples columnas\nSELECT ",
    xp_reward: 45,
    difficulty: 'Principiante',
    check_order: true,
    sort_order: 13,
    hints: [
      "Separa las dos columnas en ORDER BY con una coma: ORDER BY categoria_id ASC, precio DESC;",
      "Asegúrate de que categoria_id sea ASC y precio sea DESC."
],
    concept: {
      summary: "Puedes ordenar por múltiples columnas separándolas por coma en el `ORDER BY`, estableciendo prioridades de desempate.",
      syntax: "SELECT columna_1, columna_2, columna_3\nFROM nombre_tabla\nORDER BY columna_prioritaria ASC, columna_desempate DESC;",
      key_points: [
        "El motor ordena primero por la columna inicial; si existen valores idénticos (empates), recurre a la segunda columna para desempatar.",
        "Cada columna en la lista puede tener su propia dirección independiente (`ASC` o `DESC`).",
        "Separa cada criterio de ordenación mediante una coma `,`."
      ],
      execution_order_note: "💡 Los índices compuestos en la base de datos aceleran drásticamente los ordenamientos multi-columna.",
    },
    objectives: [
      "1. Consultar los artículos asociando su familia comercial y precio.",
      "2. Ordenar las categorías en sentido ascendente.",
      "3. Desempatar los artículos de una misma familia del más caro al más barato."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000026',
    module_id: 'a0000000-0000-0000-0000-000000000003',
    title: "Paginación de Clientes (OFFSET)",
    prompt: "Simula la paginación de un panel web que muestra 5 clientes por página. Obtén los clientes de la segunda página mostrando `cliente_id`, `nombre` y `email`, ordenados por `cliente_id ASC`, saltando los primeros 5 registros y mostrando los siguientes 5.",
    initial_code: "-- Usa LIMIT y OFFSET para paginar\nSELECT ",
    xp_reward: 45,
    difficulty: 'Principiante',
    check_order: true,
    sort_order: 14,
    hints: [
      "El orden es: ORDER BY cliente_id ASC LIMIT 5 OFFSET 5;",
      "OFFSET 5 salta los primeros 5, y LIMIT 5 toma los 5 siguientes."
],
    concept: {
      summary: "`OFFSET` salta un número determinado de filas antes de empezar a devolver resultados, permitiendo implementar paginación junto a `LIMIT`.",
      syntax: "SELECT columna_1, columna_2\nFROM nombre_tabla\nORDER BY columna_identificador ASC\nLIMIT tamano_pagina OFFSET filas_a_saltar;",
      key_points: [
        "`LIMIT` define el tamaño de la página (cuántas filas ver) y `OFFSET` define el salto (cuántas filas ignorar al inicio).",
        "Para una paginación determinista y reproducible, siempre se debe incluir un `ORDER BY` con una clave única.",
        "La fórmula clásica de salto es: `OFFSET (numero_pagina - 1) * tamano_pagina`."
      ],
      execution_order_note: "💡 Aunque `OFFSET` salte filas, el motor debe leerlas internamente; para millones de registros se recomienda paginación por cursor.",
    },
    objectives: [
      "1. Establecer el orden de visualización de los clientes.",
      "2. Omitir el bloque de registros correspondiente a la primera página.",
      "3. Acotar el lote devuelto al tamaño de página requerido."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000004',
    module_id: 'a0000000-0000-0000-0000-000000000004',
    title: "Conteo de Productos por Categoría",
    prompt: "¿Cuántos productos tenemos en cada categoría? Muestra el `categoria_id` y el número total de productos bajo el nombre `total_productos`, mostrando únicamente aquellas categorías que tengan más de 2 productos.",
    initial_code: "-- Utiliza GROUP BY y HAVING\nSELECT ",
    xp_reward: 45,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 15,
    hints: [
      "Usa GROUP BY categoria_id para agrupar los artículos.",
      "Usa HAVING COUNT(*) > 2 después de GROUP BY para quedarte solo con categorías con más de 2 productos."
],
    concept: {
      summary: "`GROUP BY` agrupa filas que comparten el mismo valor en una o más columnas, permitiendo calcular agregaciones como `COUNT(*)` por cada grupo.",
      syntax: "SELECT columna_grupo,\n       COUNT(*) AS total_registros\nFROM nombre_tabla\nGROUP BY columna_grupo;",
      key_points: [
        "`GROUP BY columna` condensa todas las filas que tienen el mismo valor en una sola fila representativa.",
        "Toda columna en el `SELECT` que no esté dentro de una función de agregación (`COUNT`, `SUM`, etc.) debe estar presente en la cláusula `GROUP BY`.",
        "`COUNT(*)` contabiliza el número total de filas pertenecientes a cada grupo formado."
      ],
      execution_order_note: "💡 `GROUP BY` se ejecuta inmediatamente después de `WHERE` y antes de evaluar las funciones del `SELECT`.",
    },
    objectives: [
      "1. Condensar los artículos agrupándolos por su familia comercial.",
      "2. Contar el volumen total de productos asociados a cada familia.",
      "3. Descartar los grupos que no superen el volumen mínimo establecido."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000011',
    module_id: 'a0000000-0000-0000-0000-000000000004',
    title: "Métricas Globales de Ventas",
    prompt: "Genera un resumen ejecutivo de las ventas completadas. Calcula el número de pedidos bajo el nombre `total_pedidos`, la suma total de dinero bajo `ingresos_totales` y el promedio de compra redondeado a 2 decimales bajo `ticket_promedio`, tomando solo los pedidos con estado `'completado'`.",
    initial_code: "-- Agrega las métricas globales para pedidos completados\nSELECT ",
    xp_reward: 45,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 16,
    hints: [
      "Escribe las tres funciones en el SELECT separadas por coma.",
      "No necesitas GROUP BY porque quieres un solo resultado global."
],
    concept: {
      summary: "Las funciones de agregación (`COUNT`, `SUM`, `AVG`) condensan todo el conjunto de filas en una sola fila resumen de métricas clave.",
      syntax: "SELECT COUNT(*) AS total_filas,\n       SUM(columna_monto) AS suma_total,\n       ROUND(AVG(columna_monto), 2) AS promedio\nFROM nombre_tabla\nWHERE condicion_filtro;",
      key_points: [
        "`COUNT(*)` cuenta el total de registros, `SUM(col)` acumula el total numérico y `AVG(col)` calcula la media aritmética.",
        "Al aplicar filtros con `WHERE`, las funciones de agregación operan únicamente sobre las filas que cumplan la condición.",
        "`ROUND(expresion, 2)` evita decimales flotantes interminables y garantiza precisión comercial."
      ],
      execution_order_note: "💡 Si no usas `GROUP BY`, las funciones de agregación reducen toda la tabla a una sola fila de resultados globales.",
    },
    objectives: [
      "1. Filtrar las transacciones considerando únicamente las compras exitosas.",
      "2. Calcular simultáneamente el recuento, la suma total de ingresos y el promedio.",
      "3. Asegurar que los promedios monetarios tengan el formato decimal requerido."
],
    sample_tables: [SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000027',
    module_id: 'a0000000-0000-0000-0000-000000000004',
    title: "Rango de Precios por Categoría (MAX/MIN)",
    prompt: "Analiza la diferencia de precios en cada departamento. Muestra el `categoria_id`, el precio más bajo bajo el nombre `precio_minimo` y el precio más alto bajo `precio_maximo` para cada categoría de productos.",
    initial_code: "-- Calcula precios extremos por categoría\nSELECT ",
    xp_reward: 45,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 17,
    hints: [
      "Selecciona: categoria_id, MIN(precio) AS precio_minimo, MAX(precio) AS precio_maximo.",
      "No olvides agrupar al final: GROUP BY categoria_id;"
],
    concept: {
      summary: "`MIN()` y `MAX()` obtienen el valor más bajo y el valor más alto de una columna dentro de cada grupo o en toda la tabla.",
      syntax: "SELECT columna_grupo,\n       MIN(columna_valor) AS valor_minimo,\n       MAX(columna_valor) AS valor_maximo\nFROM nombre_tabla\nGROUP BY columna_grupo;",
      key_points: [
        "`MIN(col)` localiza el valor mínimo del grupo y `MAX(col)` el valor máximo.",
        "`GROUP BY columna_grupo` permite obtener estos extremos de forma segmentada para cada grupo independiente.",
        "Tanto `MIN` como `MAX` ignoran automáticamente valores nulos (`NULL`) en su cálculo."
      ],
      execution_order_note: "💡 En columnas indexadas, `MIN` y `MAX` son operaciones casi instantáneas (O(log N)).",
    },
    objectives: [
      "1. Agrupar el catálogo por familia comercial.",
      "2. Detectar el artículo más económico de cada grupo.",
      "3. Detectar el artículo de mayor valor de cada grupo y nombrar las columnas."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000028',
    module_id: 'a0000000-0000-0000-0000-000000000004',
    title: "Distribución de Clientes por País",
    prompt: "¿De qué países son nuestros clientes? Muestra la columna `pais` y el número total de clientes en cada país bajo el nombre `total_clientes`, ordenando la lista de mayor a menor número de clientes.",
    initial_code: "-- Agrupa clientes por país\nSELECT ",
    xp_reward: 45,
    difficulty: 'Principiante',
    check_order: true,
    sort_order: 18,
    hints: [
      "Usa COUNT(*) AS total_clientes para contar a los clientes de cada país.",
      "Agrupa por pais y ordena por total_clientes DESC."
],
    concept: {
      summary: "Combinar `GROUP BY`, `COUNT(*)` y `ORDER BY` permite crear tablas de distribución de frecuencias ordenadas por volumen.",
      syntax: "SELECT columna_segmento,\n       COUNT(*) AS total_filas\nFROM nombre_tabla\nGROUP BY columna_segmento\nORDER BY total_filas DESC;",
      key_points: [
        "El `GROUP BY` agrupa por el criterio demográfico o de categorización deseado.",
        "Para ver los grupos más numerosos arriba de todo, ordena por el alias de la función de conteo con `DESC`.",
        "El orden de ejecución del motor procesa primero `GROUP BY`, luego la proyección del `SELECT` y finalmente `ORDER BY`."
      ],
      execution_order_note: "💡 Puedes referenciar el alias de la columna agregada directamente en el `ORDER BY` final.",
    },
    objectives: [
      "1. Agrupar la base de usuarios por su país de origen.",
      "2. Contar el volumen de clientes registrados en cada territorio.",
      "3. Presentar los países en un ranking ordenado de mayor a menor presencia."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000029',
    module_id: 'a0000000-0000-0000-0000-000000000004',
    title: "Stock Total por Proveedor",
    prompt: "Calcula el volumen total de productos que nos suministra cada fabricante. Muestra el `proveedor_id` y la suma de unidades disponibles en stock bajo el nombre `stock_total` desde la tabla `productos`.",
    initial_code: "-- Suma el stock por proveedor\nSELECT ",
    xp_reward: 45,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 19,
    hints: [
      "Escribe: SELECT proveedor_id, SUM(stock) AS stock_total FROM productos GROUP BY proveedor_id;"
],
    concept: {
      summary: "`SUM()` suma todos los valores de una columna numérica dentro de cada grupo formado por `GROUP BY`.",
      syntax: "SELECT columna_identificador,\n       SUM(columna_cantidad) AS total_acumulado\nFROM nombre_tabla\nGROUP BY columna_identificador;",
      key_points: [
        "`SUM(col)` totaliza los valores cuantitativos de todas las filas agrupadas.",
        "Debes incluir en el `GROUP BY` la clave o columna que identifica al grupo.",
        "Si una fila contiene `NULL` en la columna sumada, `SUM` la ignora sin alterar el acumulado."
      ],
      execution_order_note: "💡 `SUM()` sobre columnas vacías o solo con nulos devuelve `NULL`, no 0. Para forzar cero se suele usar `COALESCE(SUM(col), 0)`.",
    },
    objectives: [
      "1. Agrupar el inventario en función del fabricante o distribuidor.",
      "2. Acumular las unidades totales en almacén provistas por cada entidad.",
      "3. Asignar un alias descriptivo al total acumulado."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_PROVEEDORES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000030',
    module_id: 'a0000000-0000-0000-0000-000000000004',
    title: "Proveedores de Alto Volumen (HAVING SUM)",
    prompt: "Identifica a nuestros proveedores más importantes en volumen. Muestra el `proveedor_id` y su stock total bajo el nombre `stock_total`, mostrando únicamente a aquellos proveedores cuyo stock total acumulado supere las 100 unidades.",
    initial_code: "-- Filtra grupos con HAVING\nSELECT ",
    xp_reward: 50,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 20,
    hints: [
      "Agrega HAVING SUM(stock) > 100 después de tu GROUP BY proveedor_id.",
      "Recuerda que no puedes usar WHERE con funciones como SUM o COUNT."
],
    concept: {
      summary: "`HAVING` es el filtro de los grupos: se aplica sobre los resultados calculados por funciones de agregación, donde `WHERE` no tiene alcance.",
      syntax: "SELECT columna_grupo,\n       SUM(columna_metrica) AS acumulado\nFROM nombre_tabla\nGROUP BY columna_grupo\nHAVING SUM(columna_metrica) > valor_corte;",
      key_points: [
        "Regla de oro: `WHERE` filtra filas individuales *antes* de agrupar; `HAVING` filtra grupos *después* de agrupar.",
        "En la cláusula `HAVING` se escriben directamente funciones agregadas como `SUM(...) > umbral` o `COUNT(...) >= N`.",
        "La cláusula `HAVING` siempre se posiciona inmediatamente después de `GROUP BY`."
      ],
      execution_order_note: "💡 Nunca coloques funciones de agregación en el `WHERE`; el motor lanzará error de sintaxis.",
    },
    objectives: [
      "1. Calcular el inventario acumulado por cada fabricante.",
      "2. Aplicar un filtro posterior a la agregación para evaluar el volumen conjunto.",
      "3. Conservar únicamente los proveedores estratégicos de gran volumen."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000031',
    module_id: 'a0000000-0000-0000-0000-000000000004',
    title: "Clientes con Ticket Promedio Alto (HAVING AVG)",
    prompt: "Encuentra a los clientes que hacen compras de alto valor promedio. Muestra el `cliente_id` y su importe promedio de compra redondeado a 2 decimales bajo el nombre `ticket_promedio`, mostrando solo a aquellos clientes cuyo promedio de compras supere los 500€.",
    initial_code: "-- Filtra clientes por ticket promedio\nSELECT ",
    xp_reward: 50,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 21,
    hints: [
      "Usa HAVING AVG(total) > 500 después del GROUP BY cliente_id.",
      "Redondea el promedio con ROUND(AVG(total), 2) en el SELECT."
],
    concept: {
      summary: "`HAVING` con `AVG()` filtra aquellos grupos cuya media aritmética supera o no alcanza un determinado umbral de negocio.",
      syntax: "SELECT columna_grupo,\n       ROUND(AVG(columna_monto), 2) AS promedio_grupo\nFROM nombre_tabla\nGROUP BY columna_grupo\nHAVING AVG(columna_monto) > umbral_promedio;",
      key_points: [
        "`HAVING AVG(columna) > umbral` descarta grupos cuyo promedio no cumpla con la regla mínima.",
        "Para operadores de teclado: mayor o igual se escribe `>=` y menor o igual se escribe `<=` (caracteres contiguos sin espacios).",
        "`AVG` solo puede aplicarse a tipos de datos numéricos (enteros, decimales, flotantes)."
      ],
      execution_order_note: "💡 Puedes usar `ROUND()` en el `SELECT` para presentar la media limpia y mantener la comparación pura en el `HAVING`.",
    },
    objectives: [
      "1. Calcular el gasto medio por transacción de cada comprador.",
      "2. Filtrar a los clientes cuyo promedio supere el umbral de alto poder adquisitivo.",
      "3. Asegurar el redondeo monetario adecuado en la columna final."
],
    sample_tables: [SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000032',
    module_id: 'a0000000-0000-0000-0000-000000000004',
    title: "Resumen de Pedidos por Estado",
    prompt: "Construye un panel de control de pedidos. Muestra el `estado_pedido`, la cantidad de pedidos bajo el nombre `total_pedidos` y la suma acumulada de dinero bajo `monto_acumulado`, agrupando por estado y ordenando del estado con mayor dinero al de menor dinero.",
    initial_code: "-- Resumen consolidado por estado de pedido\nSELECT ",
    xp_reward: 50,
    difficulty: 'Principiante',
    check_order: true,
    sort_order: 22,
    hints: [
      "En el SELECT coloca: estado_pedido, COUNT(*) AS total_pedidos, SUM(total) AS monto_acumulado.",
      "Agrupa por estado_pedido y ordena por monto_acumulado DESC."
],
    concept: {
      summary: "Puedes calcular múltiples agregaciones simultáneas (`COUNT`, `SUM`, `AVG`) en un solo `GROUP BY` para construir dashboards analíticos.",
      syntax: "SELECT columna_estado,\n       COUNT(*) AS total_operaciones,\n       SUM(columna_monto) AS monto_total\nFROM nombre_tabla\nGROUP BY columna_estado\nORDER BY monto_total DESC;",
      key_points: [
        "Un solo `GROUP BY` puede alimentar tantas métricas agregadas en el `SELECT` como requiera el análisis.",
        "Puedes ordenar la salida final por cualquiera de las métricas agregadas utilizando su alias o la función con `DESC`.",
        "Asegúrate de que la columna categórica no agregada esté presente en la cláusula `GROUP BY`."
      ],
      execution_order_note: "💡 Cada estado diferente formará una fila con sus totales correspondientes calculados en un solo pase de datos.",
    },
    objectives: [
      "1. Agrupar el histórico de pedidos según su estado operativo.",
      "2. Contar el número de operaciones y calcular el dinero asociado a cada estado.",
      "3. Ordenar el tablero de mayor a menor recaudación económica."
],
    sample_tables: [SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000005',
    module_id: 'b0000000-0000-0000-0000-000000000005',
    title: "Pedidos con Identidad del Cliente",
    prompt: "Descubre qué cliente realizó cada pedido. Cruza las tablas `pedidos` y `clientes` mediante su identificador común y muestra el `pedido_id`, el `nombre` del cliente, su `apellido` y el `total` del pedido.",
    initial_code: "-- Cruza clientes con sus respectivos pedidos\nSELECT ",
    xp_reward: 45,
    difficulty: 'Intermedio',
    check_order: false,
    sort_order: 23,
    hints: [
      "Usa alias: FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id.",
      "Indica las columnas deseadas en el SELECT."
],
    concept: {
      summary: "`INNER JOIN` combina filas de dos tablas basándose en una condición de coincidencia común (`ON`), preservando solo los registros que existen en ambas.",
      syntax: "SELECT t1.columna_a, t2.columna_b\nFROM tabla_1 t1\nINNER JOIN tabla_2 t2 ON t1.clave_foranea = t2.clave_primaria;",
      key_points: [
        "La cláusula `ON` especifica la igualdad entre la clave primaria de una tabla y la clave foránea de la otra.",
        "Los alias cortos de tabla (como `t1` y `t2`) simplifican la consulta y evitan ambigüedad al referenciar columnas homónimas.",
        "Si un registro en una tabla no tiene correspondencia en la otra, `INNER JOIN` lo omite del resultado final."
      ],
      execution_order_note: "💡 Los optimizadores eligen algoritmos como Hash Join o Nested Loop según el tamaño de las tablas unidas.",
    },
    objectives: [
      "1. Conectar las transacciones con el directorio de usuarios mediante su clave compartida.",
      "2. Extraer los datos personales del comprador y el total de la orden.",
      "3. Verificar que solo aparezcan órdenes con compradores válidos."
],
    sample_tables: [SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_CLIENTES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000012',
    module_id: 'b0000000-0000-0000-0000-000000000005',
    title: "Gasto Acumulado por Cliente",
    prompt: "Calcula cuánto dinero ha gastado en total cada uno de nuestros clientes. Cruza `clientes` y `pedidos`, y muestra el `cliente_id`, `nombre`, `apellido` y la suma de todas sus compras bajo el nombre `total_gastado`, ordenando de mayor a menor gasto.",
    initial_code: "-- Cruza clientes y pedidos y agrupa para sumar el gasto\nSELECT ",
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 24,
    hints: [
      "Recuerda incluir todas las columnas que no son funciones en el GROUP BY: GROUP BY c.cliente_id, c.nombre, c.apellido.",
      "Ordena al final por total_gastado DESC."
],
    concept: {
      summary: "Combinar `INNER JOIN` con `GROUP BY` permite cruzar datos de transacciones con entidades maestras y agregar totales por entidad.",
      syntax: "SELECT t1.id, t1.nombre_entidad,\n       SUM(t2.columna_monto) AS total_agregado\nFROM tabla_entidades t1\nINNER JOIN tabla_transacciones t2 ON t1.id = t2.entidad_id\nGROUP BY t1.id, t1.nombre_entidad\nORDER BY total_agregado DESC;",
      key_points: [
        "Primero se establece la unión relacional mediante `INNER JOIN ... ON ...`.",
        "En el `GROUP BY` deben incluirse todas las columnas de la entidad maestra seleccionadas en el `SELECT` que no sean funciones agregadas.",
        "`ORDER BY total_agregado DESC` clasifica de mayor a menor según el acumulado obtenido."
      ],
      execution_order_note: "💡 El motor primero ejecuta el cruce `JOIN`, filtra filas si hay `WHERE`, agrupa con `GROUP BY` y finalmente calcula el `SUM`.",
    },
    objectives: [
      "1. Cruzar las órdenes de compra con la información de los clientes.",
      "2. Acumular el monto total pagado por cada persona en su historial.",
      "3. Ordenar el resultado destacando a los clientes con mayor volumen de compras."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000033',
    module_id: 'b0000000-0000-0000-0000-000000000005',
    title: "Catálogo con Nombre de Categoría",
    prompt: "Haz que el catálogo de productos sea legible mostrando el nombre de la categoría en lugar de su código numérico. Cruza `productos` con `categorias` y muestra `producto_id`, `nombre_producto`, `nombre_categoria` y `precio`. Ordena primero por categoría (A-Z) y luego por producto (A-Z).",
    initial_code: "-- Cruza productos con categorias\nSELECT ",
    xp_reward: 45,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 25,
    hints: [
      "FROM productos p INNER JOIN categorias c ON p.categoria_id = c.categoria_id.",
      "Ordena con ORDER BY c.nombre_categoria ASC, p.nombre_producto ASC."
],
    concept: {
      summary: "`INNER JOIN` permite sustituir códigos numéricos de clasificación (IDs) por nombres descriptivos presentes en tablas maestras.",
      syntax: "SELECT t1.id, t1.nombre_item, t2.nombre_clasificacion, t1.precio\nFROM tabla_items t1\nINNER JOIN tabla_clasificaciones t2 ON t1.clasificacion_id = t2.clasificacion_id\nORDER BY t2.nombre_clasificacion ASC, t1.nombre_item ASC;",
      key_points: [
        "La condición `ON t1.id_relacional = t2.id_relacional` enlaza el detalle con su catálogo descriptivo.",
        "Prefijar cada columna con su alias (`t1.columna`, `t2.columna`) evita errores de columna ambigua.",
        "Puedes ordenar jerárquicamente por la descripción de la categoría y luego por el nombre del artículo."
      ],
      execution_order_note: "💡 Los índices de clave foránea aceleran el proceso de emparejamiento entre las tablas maestras y de detalle.",
    },
    objectives: [
      "1. Cruzar los artículos con la tabla maestra de familias comerciales.",
      "2. Sustituir el identificador numérico por el nombre legible de la categoría.",
      "3. Organizar alfabéticamente por categoría y luego por nombre de producto."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000034',
    module_id: 'b0000000-0000-0000-0000-000000000005',
    title: "Productos y sus Proveedores Directos",
    prompt: "Compras necesita saber de qué país proviene cada producto. Cruza `productos` con `proveedores` y muestra `producto_id`, `nombre_producto`, `nombre_proveedor` y el país del proveedor bajo el nombre `pais_proveedor`. Ordena los productos alfabéticamente.",
    initial_code: "-- Relaciona productos con sus proveedores\nSELECT ",
    xp_reward: 45,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 26,
    hints: [
      "Usa INNER JOIN entre productos y proveedores conectando proveedor_id.",
      "No olvides asignar el alias pais_proveedor a la columna pais."
],
    concept: {
      summary: "Puedes aplicar filtros con `WHERE` sobre cualquiera de las tablas unidas en un `INNER JOIN` para refinar el resultado conjunto.",
      syntax: "SELECT t1.columna_a, t2.columna_b\nFROM tabla_1 t1\nINNER JOIN tabla_2 t2 ON t1.fk_id = t2.pk_id\nWHERE t2.columna_filtro = 'criterio'\nORDER BY t1.columna_a ASC;",
      key_points: [
        "El `WHERE` se evalúa después de que el motor ha resuelto el `JOIN`, filtrando las filas ya combinadas.",
        "Puedes filtrar por columnas de la tabla principal, de la tabla unida o de ambas a la vez.",
        "Recuerda que los valores alfanuméricos en el `WHERE` van entre comillas simples: `'criterio'`."
      ],
      execution_order_note: "💡 El optimizador suele aplicar 'pushdown de predicados', filtrando las tablas antes del JOIN para reducir filas.",
    },
    objectives: [
      "1. Vincular los artículos del catálogo con su empresa suministradora.",
      "2. Extraer el nombre del proveedor y su país de origen con alias claros.",
      "3. Ordenar los artículos alfabéticamente."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_PROVEEDORES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000035',
    module_id: 'b0000000-0000-0000-0000-000000000005',
    title: "Facturación Detallada con Pagos Aprobados",
    prompt: "Concilia las facturas emitidas con sus pagos aprobados. Cruza `facturas` con `pagos` mediante `factura_id`, mostrando `factura_id`, el monto de la factura (`monto_total`), el `metodo_pago` y la `fecha_pago`, tomando únicamente los registros con `estado_pago = 'aprobado'`. Ordena por `factura_id` ascendente.",
    initial_code: "-- Concilia facturas con pagos aprobados\nSELECT ",
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 27,
    hints: [
      "Cruza mediante factura_id y añade la condición WHERE pg.estado_pago = 'aprobado'.",
      "Ordena con ORDER BY f.factura_id ASC."
],
    concept: {
      summary: "Encadenar múltiples cláusulas `INNER JOIN` permite trazar relaciones a lo largo de tres o más tablas conectadas en cadena.",
      syntax: "SELECT t1.id, t2.col_b, t3.col_c\nFROM tabla_1 t1\nINNER JOIN tabla_2 t2 ON t1.t2_id = t2.id\nINNER JOIN tabla_3 t3 ON t2.t3_id = t3.id\nWHERE t3.estado = 'aprobado';",
      key_points: [
        "Cada nuevo `INNER JOIN` requiere su propia cláusula `ON` que defina la llave de conexión con alguna tabla previa.",
        "La consulta se ejecuta como una cadena relacional: `T1` conecta con `T2`, y `T2` a su vez conecta con `T3`.",
        "Los filtros `WHERE` pueden evaluar condiciones sobre cualquiera de las tres tablas participantes."
      ],
      execution_order_note: "💡 El planificador de PostgreSQL reorganiza el orden de unión para procesar primero las tablas más pequeñas.",
    },
    objectives: [
      "1. Cruzar los comprobantes fiscales con sus comprobantes de pago bancarios.",
      "2. Restringir la consulta a las transacciones con estado liquidado y aprobado.",
      "3. Proyectar los identificadores, fechas y montos en orden secuencial."
],
    sample_tables: [SAMPLE_TABLE_FACTURAS, SAMPLE_TABLE_PAGOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000006',
    module_id: 'b0000000-0000-0000-0000-000000000006',
    title: "Clientes sin Compras Registradas (LEFT JOIN & IS NULL)",
    prompt: "¿Qué clientes se han registrado pero nunca han realizado una compra? Haz un `LEFT JOIN` entre `clientes` y `pedidos` para mostrar el `cliente_id`, `nombre` y `apellido` de todos los usuarios sin pedidos registrados.",
    initial_code: "-- Identifica clientes inactivos sin pedidos asociados\nSELECT ",
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: false,
    sort_order: 28,
    hints: [
      "Usa LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id.",
      "Filtra los que no tienen compra con WHERE p.pedido_id IS NULL;"
],
    concept: {
      summary: "`LEFT JOIN` preserva todas las filas de la tabla izquierda; al combinarse con `WHERE clave_derecha IS NULL`, crea un patrón Anti-Join.",
      syntax: "SELECT t1.id, t1.nombre\nFROM tabla_izquierda t1\nLEFT JOIN tabla_derecha t2 ON t1.id = t2.entidad_id\nWHERE t2.entidad_id IS NULL;",
      key_points: [
        "`LEFT JOIN` incluye todos los registros de la tabla izquierda, rellenando con `NULL` las columnas de la derecha si no hay coincidencia.",
        "El filtro `WHERE t2.clave IS NULL` descarta las filas que sí hicieron match, aislando exclusivamente a los registros sin actividad.",
        "En SQL la comprobación de nulos se escribe siempre `IS NULL` (nunca `= NULL`)."
      ],
      execution_order_note: "💡 Esta técnica es más eficiente que subconsultas `NOT IN` cuando las tablas contienen valores nulos.",
    },
    objectives: [
      "1. Relacionar clientes y compras conservando a la totalidad de usuarios registrados.",
      "2. Identificar a aquellos que no registran ningún pedido en la plataforma.",
      "3. Mostrar los datos de contacto de los usuarios inactivos."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000013',
    module_id: 'b0000000-0000-0000-0000-000000000006',
    title: "Productos sin Movimiento de Venta",
    prompt: "Detecta qué artículos del catálogo nunca han tenido ventas. Muestra el `producto_id` y `nombre_producto` de aquellos artículos que no tengan ninguna línea registrada en la tabla `detalle_pedidos`.",
    initial_code: "-- Localiza productos sin ventas cruzando con detalle_pedidos\nSELECT ",
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: false,
    sort_order: 29,
    hints: [
      "Escribe: FROM productos p LEFT JOIN detalle_pedidos dp ON p.producto_id = dp.producto_id WHERE dp.detalle_id IS NULL;"
],
    concept: {
      summary: "El patrón Anti-Join (`LEFT JOIN ... WHERE ... IS NULL`) es fundamental para detectar inventario huérfano o elementos sin transacciones.",
      syntax: "SELECT t1.id, t1.nombre\nFROM tabla_catalogo t1\nLEFT JOIN tabla_movimientos t2 ON t1.id = t2.item_id\nWHERE t2.item_id IS NULL\nORDER BY t1.id ASC;",
      key_points: [
        "La tabla del catálogo va a la izquierda (`FROM`) y la tabla transaccional va a la derecha (`LEFT JOIN`).",
        "Si un artículo jamás fue vendido o movido, sus columnas asociadas en la tabla derecha tendrán valor `NULL`.",
        "Utiliza `WHERE t2.clave_primaria IS NULL` para capturar únicamente los elementos sin registros en la tabla derecha."
      ],
      execution_order_note: "💡 Al elegir la columna a verificar en el `WHERE ... IS NULL`, opta siempre por la clave primaria de la tabla derecha.",
    },
    objectives: [
      "1. Cruzar el catálogo con las líneas de compra conservando todos los artículos.",
      "2. Aislar los productos que no registran ningún movimiento de salida.",
      "3. Proyectar el identificador y nombre de los artículos desatendidos."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_DETALLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000036',
    module_id: 'b0000000-0000-0000-0000-000000000006',
    title: "Facturas Pendientes de Cobro (Anti-Join)",
    prompt: "Tesorería necesita una lista de facturas emitidas que todavía no tienen ningún pago registrado. Haz un `LEFT JOIN` entre `facturas` y `pagos` para obtener `factura_id`, `pedido_id`, `fecha_emision` y `monto_total` de aquellas facturas sin ningún abono. Ordena por `factura_id` ascendente.",
    initial_code: "-- Identifica facturas sin pagos registrados\nSELECT ",
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 30,
    hints: [
      "Asegúrate de unir sobre factura_id y filtrar con WHERE p.pago_id IS NULL.",
      "Ordena al final con ORDER BY f.factura_id ASC."
],
    concept: {
      summary: "Localiza documentos o comprobantes maestros que no registran ningún pago asociado en la tabla de transacciones de pago.",
      syntax: "SELECT t1.documento_id, t1.monto\nFROM tabla_documentos t1\nLEFT JOIN tabla_pagos t2 ON t1.documento_id = t2.documento_id\nWHERE t2.pago_id IS NULL;",
      key_points: [
        "Conecta el encabezado con el detalle mediante `LEFT JOIN ... ON t1.id = t2.fk_id`.",
        "Aplica `IS NULL` sobre la clave primaria de la tabla de pagos para identificar comprobantes sin abonos.",
        "El operador de desigualdad para exclusiones explícitas de estado es `<>` o `!=`."
      ],
      execution_order_note: "💡 PostgreSQL puede convertir internamente este patrón en un Hash Anti Join de alto rendimiento.",
    },
    objectives: [
      "1. Relacionar las facturas emitidas con la tabla de cobros.",
      "2. Filtrar aquellos comprobantes que carecen de registro de abono.",
      "3. Presentar los datos de las facturas pendientes de cobro ordenadas por ID."
],
    sample_tables: [SAMPLE_TABLE_FACTURAS, SAMPLE_TABLE_PAGOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000037',
    module_id: 'b0000000-0000-0000-0000-000000000006',
    title: "Productos Fuera del Almacén Central (Anti-Join Condicional)",
    prompt: "El responsable del almacén central de Madrid (`almacen_id = 1`) quiere saber qué productos del catálogo NO disponen de existencias en ese almacén en particular. Conecta `productos` con `inventario` mediante un `LEFT JOIN` acotado al almacén 1 y muestra el `producto_id` y `nombre_producto` de los artículos ausentes en ese almacén, ordenados por `producto_id` ascendente.",
    initial_code: "-- Detecta productos no inventariados en el almacén 1\nSELECT ",
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 31,
    hints: [
      "Coloca AND i.almacen_id = 1 dentro de la cláusula ON del LEFT JOIN.",
      "En el WHERE usa: WHERE i.almacen_id IS NULL."
],
    concept: {
      summary: "Puedes incorporar condiciones adicionales en la cláusula `ON` del `LEFT JOIN` antes de aplicar la exclusión de nulos en `WHERE`.",
      syntax: "SELECT t1.id, t1.descripcion\nFROM tabla_items t1\nLEFT JOIN tabla_asignaciones t2\n  ON t1.id = t2.item_id AND t2.ubicacion_id = valor_especifico\nWHERE t2.item_id IS NULL;",
      key_points: [
        "Colocar una condición en el `ON` del `LEFT JOIN` restringe el cruce a esa condición antes de generar los nulos.",
        "El `WHERE ... IS NULL` posterior filtra a los elementos que no tuvieron coincidencia bajo esa regla específica.",
        "Es una técnica eficiente para auditar ausencias en ubicaciones o estados determinados."
      ],
      execution_order_note: "💡 Las condiciones en `ON` afectan a qué filas se emparejan; las condiciones en `WHERE` descartan filas después de la unión.",
    },
    objectives: [
      "1. Vincular los productos con el inventario acotando la búsqueda a la instalación central.",
      "2. Aislar los artículos que no cuentan con existencias en dicha instalación.",
      "3. Proyectar el catálogo de productos ausentes en dicho centro."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_INVENTARIO],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000038',
    module_id: 'b0000000-0000-0000-0000-000000000006',
    title: "Censo Completo de Pedidos por Cliente (Preservando Ceros)",
    prompt: "Queremos una lista completa de todos los clientes y saber cuántos pedidos ha hecho cada uno, incluyendo con 0 a los que nunca han comprado. Muestra `cliente_id`, `nombre`, `apellido` y el total de compras bajo el nombre `total_pedidos` (usando `COUNT(p.pedido_id)`). Ordena por número de pedidos de mayor a menor y, en caso de empate, por `cliente_id` ascendente.",
    initial_code: "-- Agrupa preservando clientes sin compras con COUNT(columna)\nSELECT ",
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 32,
    hints: [
      "No uses COUNT(*); usa COUNT(p.pedido_id) para que a los que no han comprado les salga 0.",
      "Ordena con ORDER BY total_pedidos DESC, c.cliente_id ASC."
],
    concept: {
      summary: "`LEFT JOIN` con `COUNT(columna_derecha)` permite contabilizar ocurrencias preservando en 0 a las entidades sin actividad.",
      syntax: "SELECT t1.id, t1.nombre,\n       COUNT(t2.transaccion_id) AS total_ocurrencias\nFROM tabla_maestra t1\nLEFT JOIN tabla_movimientos t2 ON t1.id = t2.entidad_id\nGROUP BY t1.id, t1.nombre\nORDER BY total_ocurrencias DESC;",
      key_points: [
        "Cuidado con `COUNT`: `COUNT(*)` contaría 1 para los registros con nulos; debes usar `COUNT(t2.id)` para que los nulos sumen 0.",
        "`LEFT JOIN` asegura que ninguna entidad de la tabla izquierda sea omitida, aunque tenga cero movimientos.",
        "Agrupa por los campos de la tabla maestra incluidos en el `SELECT`."
      ],
      execution_order_note: "💡 `COUNT(columna)` ignora nulos automáticamente, garantizando que clientes o productos sin eventos tengan conteo 0.",
    },
    objectives: [
      "1. Conectar usuarios y pedidos garantizando que nadie quede fuera de la lista.",
      "2. Contabilizar los pedidos garantizando que los usuarios sin compras muestren 0.",
      "3. Ordenar el censo de mayor a menor número de compras y desempatar por ID."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000014',
    module_id: 'b0000000-0000-0000-0000-000000000007',
    title: "Desglose Completo de Líneas de Pedido",
    prompt: "Audita las compras mostrando toda la información conectada: pedido, cliente, producto y categoría. Conecta `pedidos`, `clientes`, `detalle_pedidos`, `productos` y `categorias`, y muestra `pedido_id`, el nombre del cliente como `cliente_nombre`, `nombre_producto`, `nombre_categoria`, `cantidad` y `precio_unitario`. Ordena por `pedido_id ASC` y `nombre_producto ASC`, limitando a los primeros 10 registros.",
    initial_code: "-- Conecta en cascada pedidos, clientes, detalle, productos y categorias\nSELECT ",
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 33,
    hints: [
      "Encadena los JOINs: pedidos -> clientes, pedidos -> detalle_pedidos -> productos -> categorias.",
      "Usa c.nombre AS cliente_nombre y aplica LIMIT 10 al final."
],
    concept: {
      summary: "Las relaciones maestro-detalle complejas suelen requerir unir la cabecera, las líneas de detalle y los catálogos descriptivos.",
      syntax: "SELECT c.id, d.linea_id, i.nombre, d.cantidad, d.precio_unitario\nFROM cabecera c\nINNER JOIN detalle d ON c.id = d.cabecera_id\nINNER JOIN catalogo i ON d.item_id = i.id\nORDER BY c.id ASC, d.linea_id ASC;",
      key_points: [
        "La cabecera se une con las líneas de detalle (`cabecera_id`), y cada línea se une con su artículo (`item_id`).",
        "Los alias de una letra (`c`, `d`, `i`) mantienen la consulta legible y compacta.",
        "Puedes calcular valores de línea multiplicando columnas: `d.cantidad * d.precio_unitario`."
      ],
      execution_order_note: "💡 Cada línea de pedido generará una fila en el resultado; un pedido con 3 artículos devolverá 3 filas.",
    },
    objectives: [
      "1. Conectar en cadena las 5 entidades del circuito comercial.",
      "2. Extraer las dimensiones del comprador, artículo, categoría y transacción.",
      "3. Ordenar secuencialmente y acotar el lote a 10 líneas de muestra."
],
    sample_tables: [SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_DETALLE_PEDIDOS, SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000039',
    module_id: 'b0000000-0000-0000-0000-000000000007',
    title: "Historial de Ventas por Ciudad y Categoría",
    prompt: "Descubre cuánto dinero se ha vendido en cada ciudad por cada tipo de producto. Conecta las tablas necesarias para calcular la suma de ventas (`SUM(dp.cantidad * dp.precio_unitario)`) bajo el nombre `monto_vendido`, agrupando por la `ciudad` del cliente y el `nombre_categoria`. Ordena alfabéticamente por ciudad y luego de mayor a menor venta.",
    initial_code: "-- Conecta 5 tablas y calcula ventas por ciudad y categoria\nSELECT ",
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 34,
    hints: [
      "Cruza las tablas necesarias para llegar de clientes a categorías pasando por pedidos y detalle.",
      "Agrupa por c.ciudad y cat.nombre_categoria."
],
    concept: {
      summary: "Unir múltiples tablas antes de agrupar permite construir cubos multidimensionales de agregación geográfica y comercial.",
      syntax: "SELECT t_geo.ciudad, t_cat.categoria,\n       SUM(t_mov.monto) AS volumen_total\nFROM transacciones t_mov\nINNER JOIN entidades t_ent ON t_mov.entidad_id = t_ent.id\nINNER JOIN clasificaciones t_cat ON t_mov.clasificacion_id = t_cat.id\nGROUP BY t_geo.ciudad, t_cat.categoria\nORDER BY volumen_total DESC;",
      key_points: [
        "El `GROUP BY` multidimensional agrupa por cada combinación única de ciudad y categoría.",
        "Asegúrate de que todas las columnas no agregadas del `SELECT` figuren en el `GROUP BY`.",
        "El cruce previo con `INNER JOIN` conecta la transacción con la entidad geográfica y el catálogo."
      ],
      execution_order_note: "💡 Si tienes N ciudades y M categorías activas, el resultado tendrá un máximo de N * M filas agrupadas.",
    },
    objectives: [
      "1. Cruzar clientes, compras y catálogo para enlazar territorio y producto.",
      "2. Calcular la recaudación multiplicando volumen por precio unitario.",
      "3. Agrupar por ciudad y familia comercial ordenando de mayor a menor venta."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_DETALLE_PEDIDOS, SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000040',
    module_id: 'b0000000-0000-0000-0000-000000000007',
    title: "Conciliación de Pedidos, Facturación y Pagos",
    prompt: "Verifica el flujo completo de una compra: el pedido, su factura y su cobro. Conecta `pedidos` con `facturas` y `pagos`, mostrando `pedido_id`, `cliente_id`, el monto de la factura bajo el nombre `monto_factura`, el monto del pago bajo `monto_pago` y el `metodo_pago`. Ordena por `pedido_id` ascendente.",
    initial_code: "-- Cruza pedidos con facturas y pagos\nSELECT ",
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 35,
    hints: [
      "pedidos p INNER JOIN facturas f ON p.pedido_id = f.pedido_id INNER JOIN pagos pg ON f.factura_id = pg.factura_id.",
      "Renombra los montos con AS monto_factura y AS monto_pago."
],
    concept: {
      summary: "La conciliación transaccional conecta el ciclo de vida comercial completo: orden de pedido, factura emitida y cobro acreditado.",
      syntax: "SELECT p.id, f.numero_factura, pag.metodo_pago, pag.monto\nFROM ordenes p\nINNER JOIN facturas f ON p.id = f.orden_id\nINNER JOIN pagos pag ON f.id = pag.factura_id\nWHERE pag.estado = 'aprobado';",
      key_points: [
        "Encadena cada relación con su llave natural: la orden vincula a la factura, y la factura vincula al pago.",
        "Filtra en el `WHERE` para restringir el análisis a transacciones con estado validado.",
        "La proyección debe incluir los identificadores necesarios de cada etapa para garantizar trazabilidad."
      ],
      execution_order_note: "💡 `INNER JOIN` descarta pedidos que no tengan factura o facturas sin pago registrado.",
    },
    objectives: [
      "1. Enlazar los tres eslabones comerciales: pedido, comprobante fiscal y pago.",
      "2. Distinguir con alias transparentes el monto facturado frente al cobrado.",
      "3. Mostrar el método de pago y ordenar por número de orden."
],
    sample_tables: [SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_FACTURAS, SAMPLE_TABLE_PAGOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000041',
    module_id: 'b0000000-0000-0000-0000-000000000007',
    title: "Trazabilidad Física de Inventario por Almacén",
    prompt: "Consulta la disponibilidad física de inventario por almacén. Conecta `productos`, `inventario` y `almacenes`, mostrando `nombre_producto`, `nombre_almacen`, la `ciudad` del almacén y la `cantidad_disponible`, filtrando únicamente aquellos registros con más de 10 unidades. Ordena por nombre de producto y luego por almacén.",
    initial_code: "-- Conecta productos, inventario y almacenes\nSELECT ",
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 36,
    hints: [
      "Une productos a inventario y luego inventario a almacenes.",
      "Filtra con WHERE i.cantidad_disponible > 10."
],
    concept: {
      summary: "Conectar tablas de existencias físicas, artículos y almacenes permite rastrear la distribución geográfica del stock.",
      syntax: "SELECT a.nombre_almacen, p.nombre_item, inv.cantidad_stock\nFROM inventarios inv\nINNER JOIN almacenes a ON inv.almacen_id = a.id\nINNER JOIN productos p ON inv.producto_id = p.id\nWHERE inv.cantidad_stock > 0\nORDER BY a.nombre_almacen ASC, inv.cantidad_stock DESC;",
      key_points: [
        "La tabla puente de inventario conecta las entidades de almacén y de producto.",
        "Operadores numéricos de teclado: mayor que `>`, menor que `<`, mayor o igual `>=` y menor o igual `<=`.",
        "El ordenamiento múltiple permite agrupar visualmente por instalación y jerarquizar por volumen de existencias."
      ],
      execution_order_note: "💡 Las claves foráneas compuestas garantizan que no existan registros duplicados para un mismo par producto-almacén.",
    },
    objectives: [
      "1. Conectar el catálogo con las instalaciones a través de la tabla de existencias.",
      "2. Filtrar únicamente las ubicaciones con existencias superiores a 10 unidades.",
      "3. Presentar el producto, almacén, ciudad y stock ordenados con prolijidad."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_INVENTARIO, SAMPLE_TABLE_ALMACENES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000042',
    module_id: 'b0000000-0000-0000-0000-000000000008',
    title: "Directorio Operativo Unificado (UNION)",
    prompt: "Crea una lista unificada de todas las ciudades donde tenemos presencia, indicando si la presencia es de clientes o de almacenes. Combina con `UNION` la ciudad y la etiqueta `'cliente'` como `tipo_entidad` de la tabla `clientes`, con la ciudad y la etiqueta `'almacen'` como `tipo_entidad` de la tabla `almacenes`. Ordena por ciudad y por tipo de entidad.",
    initial_code: "-- Combina ciudades de clientes y almacenes con UNION\nSELECT ",
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 37,
    hints: [
      "SELECT ciudad, 'cliente' AS tipo_entidad FROM clientes UNION SELECT ciudad, 'almacen' AS tipo_entidad FROM almacenes...",
      "Coloca el ORDER BY al final de la instrucción."
],
    concept: {
      summary: "`UNION` combina verticalmente los resultados de dos consultas `SELECT` independientes en una única lista de filas.",
      syntax: "SELECT nombre, correo, 'Rol A' AS tipo_entidad FROM tabla_a\nUNION\nSELECT nombre, correo, 'Rol B' AS tipo_entidad FROM tabla_b\nORDER BY nombre ASC;",
      key_points: [
        "Ambas consultas deben tener exactamente la misma cantidad de columnas y en el mismo orden de tipos de datos.",
        "`UNION` elimina duplicados automáticamente; si deseas conservar duplicados, utiliza `UNION ALL`.",
        "La cláusula `ORDER BY` solo se escribe una vez al final de toda la sentencia compuesta."
      ],
      execution_order_note: "💡 `UNION` ejecuta un sort interno para deduplicar filas; `UNION ALL` es más rápido porque concatena directamente.",
    },
    objectives: [
      "1. Obtener la presencia geográfica tanto de clientes como de instalaciones.",
      "2. Unificar verticalmente ambos listados en una sola colección consolidada.",
      "3. Eliminar duplicidades y ordenar alfabéticamente por ciudad y tipo."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_ALMACENES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000043',
    module_id: 'b0000000-0000-0000-0000-000000000008',
    title: "Ciudades sin Presencia de Almacenes (EXCEPT)",
    prompt: "Encuentra ciudades donde tengamos clientes pero todavía NO tengamos ningún almacén logístico. Usa el operador de diferencia `EXCEPT` para restar a las ciudades de `clientes` las ciudades de `almacenes`, ordenando la lista alfabéticamente.",
    initial_code: "-- Diferencia de conjuntos con EXCEPT\nSELECT ",
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 38,
    hints: [
      "Escribe: SELECT ciudad FROM clientes EXCEPT SELECT ciudad FROM almacenes ORDER BY ciudad ASC;"
],
    concept: {
      summary: "`EXCEPT` (o `MINUS`) devuelve los registros de la primera consulta que no existen en el resultado de la segunda consulta.",
      syntax: "SELECT columna_a FROM tabla_origen\nEXCEPT\nSELECT columna_b FROM tabla_exclusion\nORDER BY columna_a ASC;",
      key_points: [
        "Resta el segundo conjunto al primero, eliminando cualquier valor presente en la segunda consulta.",
        "Ambas consultas deben proyectar el mismo número de columnas y de tipos compatibles.",
        "Es una alternativa limpia y matemática a los anti-joins basados en `NOT IN` o `IS NULL`."
      ],
      execution_order_note: "💡 `EXCEPT` elimina duplicados en el conjunto resultante por definición del estándar relacional.",
    },
    objectives: [
      "1. Obtener el conjunto de ciudades residenciales de los clientes.",
      "2. Restar las ciudades que ya disponen de almacén logístico propio.",
      "3. Generar la lista de territorios con clientes desprovistos de centro logístico."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_ALMACENES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000044',
    module_id: 'b0000000-0000-0000-0000-000000000008',
    title: "Matriz de Cobertura Almacén-Categoría (CROSS JOIN)",
    prompt: "Genera todas las combinaciones posibles entre cada almacén y cada categoría de productos. Usa un `CROSS JOIN` entre `almacenes` y `categorias`, mostrando `nombre_almacen` y `nombre_categoria`, ordenando por almacén y por categoría.",
    initial_code: "-- Genera el producto cartesiano con CROSS JOIN\nSELECT ",
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 39,
    hints: [
      "FROM almacenes a CROSS JOIN categorias c (sin ON).",
      "Ordena por a.nombre_almacen ASC, c.nombre_categoria ASC."
],
    concept: {
      summary: "`CROSS JOIN` calcula el producto cartesiano: combina cada fila de la primera tabla con cada fila de la segunda tabla.",
      syntax: "SELECT t1.nombre_a, t2.nombre_b\nFROM tabla_1 t1\nCROSS JOIN tabla_2 t2\nORDER BY t1.nombre_a ASC, t2.nombre_b ASC;",
      key_points: [
        "No utiliza cláusula `ON`: el resultado tendrá `M * N` filas (filas de tabla 1 multiplicadas por filas de tabla 2).",
        "Es la herramienta clásica para generar matrices completas de cobertura, combinaciones o calendarios base.",
        "Debe usarse con cautela sobre tablas grandes para evitar explosión volumétrica de filas."
      ],
      execution_order_note: "💡 No requiere índices al no haber condición de emparejamiento; simplemente genera todas las combinaciones posibles.",
    },
    objectives: [
      "1. Cruzar todas las instalaciones logísticas contra todas las familias comerciales.",
      "2. Generar la matriz completa de combinaciones posibles sin condiciones de enlace.",
      "3. Presentar la cuadrícula de cobertura ordenada por almacén y familia."
],
    sample_tables: [SAMPLE_TABLE_ALMACENES, SAMPLE_TABLE_CATEGORIAS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000045',
    module_id: 'b0000000-0000-0000-0000-000000000008',
    title: "Pares de Productos de la Misma Categoría (SELF JOIN)",
    prompt: "Genera sugerencias de productos emparejados dentro de la misma categoría. Cruza la tabla `productos` consigo misma (`p1` y `p2`) para emparejar artículos con la misma `categoria_id`, asegurando que `p1.producto_id < p2.producto_id` para no emparejar un producto consigo mismo ni repetir la pareja al revés. Muestra `categoria_id`, los nombres como `producto_a` y `producto_b`, y los precios como `precio_a` y `precio_b`. Ordena por categoría y nombres.",
    initial_code: "-- Auto-cruce de productos con condición de desigualdad\nSELECT ",
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 40,
    hints: [
      "ON p1.categoria_id = p2.categoria_id AND p1.producto_id < p2.producto_id.",
      "Ordena con ORDER BY p1.categoria_id ASC, producto_a ASC, producto_b ASC."
],
    concept: {
      summary: "Un `SELF JOIN` une una tabla consigo misma usando alias diferenciados, permitiendo comparar o emparejar filas del mismo conjunto.",
      syntax: "SELECT a.nombre AS item_1, b.nombre AS item_2, a.clasificacion_id\nFROM tabla a\nINNER JOIN tabla b\n  ON a.clasificacion_id = b.clasificacion_id AND a.id < b.id\nORDER BY a.id ASC, b.id ASC;",
      key_points: [
        "Es obligatorio asignar alias distintos (ej. `a` y `b`) a cada instancia de la misma tabla.",
        "La condición `a.id < b.id` es un patrón clave para evitar que un elemento se empareje consigo mismo (`a.id = b.id`) y descartar pares duplicados invertidos.",
        "La igualdad en la clave de clasificación (`a.cat_id = b.cat_id`) garantiza que pertenezcan al mismo grupo."
      ],
      execution_order_note: "💡 `a.id < b.id` reduce el espacio de búsqueda a la mitad de combinaciones respecto a `a.id <> b.id`.",
    },
    objectives: [
      "1. Cruzar la tabla de artículos consigo misma para comparar productos hermanos.",
      "2. Emparejar artículos pertenecientes a la misma familia comercial.",
      "3. Evitar emparejamientos con el mismo producto y suprimir duplicados simétricos."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000015',
    module_id: 'c0000000-0000-0000-0000-000000000009',
    title: "Productos sobre el Promedio de Precio",
    prompt: "¿Qué productos se venden por encima del precio promedio de toda la tienda? Muestra el `nombre_producto` y su `precio` para aquellos artículos cuyo precio sea mayor al promedio general de precios de la tabla `productos`. Ordena de mayor a menor precio.",
    initial_code: "-- Usa una subconsulta para comparar con el promedio global\nSELECT ",
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 41,
    hints: [
      "WHERE precio > (SELECT AVG(precio) FROM productos).",
      "Ordena al final con ORDER BY precio DESC."
],
    concept: {
      summary: "Una subconsulta escalar retorna un único valor (1 fila y 1 columna) que puede usarse como comparador dinámico en el `WHERE`.",
      syntax: "SELECT columna_1, columna_precio\nFROM nombre_tabla\nWHERE columna_precio > (SELECT AVG(columna_precio) FROM nombre_tabla)\nORDER BY columna_precio DESC;",
      key_points: [
        "La subconsulta se encierra obligatoriamente entre paréntesis `(...)`.",
        "Al retornar un único valor escalar, puedes compararlo con operadores estándar como `>`, `<`, `=`, `>=` o `<=`.",
        "Se evalúa primero la subconsulta interna y su valor resultante se inyecta como filtro en la consulta externa."
      ],
      execution_order_note: "💡 El motor calcula la subconsulta una sola vez al inicio y reutiliza la constante para evaluar cada fila de la tabla externa.",
    },
    objectives: [
      "1. Calcular dinámicamente el precio de referencia promedio del catálogo completo.",
      "2. Comparar el precio de cada artículo contra dicho valor medio en el filtro.",
      "3. Proyectar los artículos de precio superior ordenados del más caro al más barato."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000046',
    module_id: 'c0000000-0000-0000-0000-000000000009',
    title: "Clientes con Pedidos de Alto Monto (IN Subquery)",
    prompt: "Identifica a nuestros clientes VIP: aquellos que han hecho al menos un pedido importante (de 1000€ o más). Consulta la tabla `clientes` y muestra `cliente_id`, `nombre`, `apellido` y `email`, filtrando con una subconsulta usando el operador `IN` sobre la tabla `pedidos`. Ordena por `cliente_id` ascendente.",
    initial_code: "-- Filtra clientes con una subconsulta en IN\nSELECT ",
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 42,
    hints: [
      "Usa WHERE cliente_id IN (SELECT cliente_id FROM pedidos WHERE total >= 1000).",
      "Ordena con ORDER BY cliente_id ASC."
],
    concept: {
      summary: "Una subconsulta en la cláusula `IN` retorna una lista dinámica de IDs sobre la cual la consulta principal aplica el filtrado.",
      syntax: "SELECT id, nombre, email\nFROM tabla_maestra\nWHERE id IN (\n    SELECT clave_foranea\n    FROM tabla_transaccional\n    WHERE monto > umbral_valor\n);",
      key_points: [
        "La subconsulta interna debe proyectar exactamente una sola columna, coincidente con la columna evaluada en el `IN`.",
        "Filtra en la consulta interna para generar únicamente el subconjunto de IDs de interés.",
        "Es una alternativa declarativa a los joins cuando no necesitas proyectar columnas de la tabla transaccional."
      ],
      execution_order_note: "💡 PostgreSQL optimiza consultas `IN (SELECT ...)` convirtiéndolas internamente en un Semi-Join indexado.",
    },
    objectives: [
      "1. Obtener el conjunto de compradores con compras de gran volumen mediante una consulta interna.",
      "2. Utilizar dicho conjunto como criterio de pertenencia para filtrar la tabla de clientes.",
      "3. Proyectar los datos de contacto de los clientes clasificados en orden."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000047',
    module_id: 'c0000000-0000-0000-0000-000000000009',
    title: "Comprobación de Existencia Eficiente (EXISTS)",
    prompt: "Premia a los clientes activos que tengan al menos una compra completada. Muestra el `cliente_id`, `nombre` y `apellido` de aquellos clientes para los que exista al menos un pedido con `estado_pedido = 'completado'`, usando una subconsulta con `EXISTS`. Ordena por `cliente_id` ascendente.",
    initial_code: "-- Subconsulta correlacionada con EXISTS\nSELECT ",
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 43,
    hints: [
      "WHERE EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.cliente_id AND p.estado_pedido = 'completado').",
      "Ordena con ORDER BY c.cliente_id ASC."
],
    concept: {
      summary: "`EXISTS` comprueba si una subconsulta correlacionada devuelve al menos una fila; en cuanto encuentra una coincidencia, detiene la búsqueda.",
      syntax: "SELECT t1.id, t1.nombre\nFROM tabla_a t1\nWHERE EXISTS (\n    SELECT 1\n    FROM tabla_b t2\n    WHERE t2.a_id = t1.id AND t2.condicion = 'valor'\n);",
      key_points: [
        "Dentro del `SELECT` de `EXISTS` se acostumbra colocar `SELECT 1`, ya que al motor solo le interesa la existencia de filas, no sus valores.",
        "La subconsulta está correlacionada: hace referencia a la clave de la fila actual de la consulta externa (`t2.a_id = t1.id`).",
        "`NOT EXISTS` realiza la operación inversa, comprobando la no existencia de registros subordinados."
      ],
      execution_order_note: "💡 `EXISTS` se detiene tan pronto como encuentra la primera fila coincidente, siendo muy eficiente.",
    },
    objectives: [
      "1. Evaluar de forma conectada si existe al menos una compra confirmada por cliente.",
      "2. Detener la búsqueda en cuanto se encuentre la primera coincidencia por usuario.",
      "3. Listar a los clientes activos ordenados secuencialmente."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000016',
    module_id: 'c0000000-0000-0000-0000-000000000010',
    title: "Segmentación de Pedidos por Monto",
    prompt: "Clasifica los pedidos según su valor para organizar la entrega. Muestra el `pedido_id`, el `total` y una nueva columna llamada `segmento` que diga: si el total es de 1000€ o más asigna `'Alto Valor'`, si es de 300€ o más asigna `'Medio Valor'`, y para el resto `'Bajo Valor'`. Ordena de mayor a menor total.",
    initial_code: "-- Clasifica los pedidos en tres segmentos según su monto\nSELECT ",
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 44,
    hints: [
      "CASE WHEN total >= 1000 THEN 'Alto Valor' WHEN total >= 300 THEN 'Medio Valor' ELSE 'Bajo Valor' END AS segmento.",
      "Ordena al final por total DESC."
],
    concept: {
      summary: "La estructura `CASE WHEN ... THEN ... ELSE ... END` implementa lógica condicional (if-else) para transformar o clasificar valores.",
      syntax: "SELECT columna_id, columna_monto,\n       CASE\n         WHEN columna_monto >= lim_alto THEN 'Segmento A'\n         WHEN columna_monto >= lim_medio THEN 'Segmento B'\n         ELSE 'Segmento Base'\n       END AS nivel_clasificacion\nFROM nombre_tabla;",
      key_points: [
        "Se evalúa secuencialmente de arriba hacia abajo; la primera cláusula `WHEN` que resulte verdadera asigna el valor y sale del `CASE`.",
        "El operador mayor o igual se escribe `>=` en el teclado con los símbolos `>` e `=` consecutivos.",
        "La estructura siempre se abre con `CASE` y se cierra con `END` (generalmente acompañada de un alias con `AS`)."
      ],
      execution_order_note: "💡 Si ninguna regla `WHEN` coincide y no existe cláusula `ELSE`, el resultado asignado será `NULL`.",
    },
    objectives: [
      "1. Evaluar las reglas de cuantía económica para cada orden individual.",
      "2. Asignar la etiqueta correspondiente según los umbrales de valor comercial.",
      "3. Bautizar la nueva dimensión calculada y ordenar por importe descendente."
],
    sample_tables: [SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000018',
    module_id: 'c0000000-0000-0000-0000-000000000012',
    title: "Ranking Relativo por Categoría (DENSE_RANK)",
    prompt: "Clasifica los productos dentro de cada categoría del más caro al más barato. Muestra `categoria_id`, `nombre_producto`, `precio` y una columna con el puesto que ocupa llamada `ranking_categoria` usando `DENSE_RANK()`, dividiendo por categoría y ordenando de mayor a menor precio. Ordena por `categoria_id ASC` y `ranking_categoria ASC`.",
    initial_code: "-- Usa DENSE_RANK() particionado por categoria_id\nSELECT ",
    xp_reward: 65,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 45,
    hints: [
      "Usa DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria.",
      "Ordena por categoria_id ASC, ranking_categoria ASC al final."
],
    concept: {
      summary: "`DENSE_RANK()` numera filas en orden de clasificación sin dejar huecos en la secuencia numérica en caso de empates.",
      syntax: "SELECT grupo_id, item_nombre, columna_metrica,\n       DENSE_RANK() OVER (PARTITION BY grupo_id ORDER BY columna_metrica DESC) AS posicion_ranking\nFROM nombre_tabla\nORDER BY grupo_id ASC, posicion_ranking ASC;",
      key_points: [
        "`PARTITION BY columna_grupo` reinicia la numeración ordinal del ranking para cada partición independiente.",
        "`ORDER BY columna DESC` define el criterio de clasificación (del mayor al menor valor).",
        "A diferencia de `GROUP BY`, las funciones de ventana preservan todas las filas individuales sin colapsarlas."
      ],
      execution_order_note: "💡 En empates, `DENSE_RANK()` asigna el mismo número y continúa inmediatamente con el siguiente (ej. 1, 2, 2, 3), a diferencia de `RANK()` (1, 2, 2, 4).",
    },
    objectives: [
      "1. Segmentar los artículos por familia comercial sin colapsar el listado.",
      "2. Calcular la posición relativa de cada artículo según su precio descendente.",
      "3. Garantizar que valores idénticos compartan posición sin saltos en la correlación."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000048',
    module_id: 'c0000000-0000-0000-0000-000000000010',
    title: "Pivoteo Manual de Ventas por Estado (Conditional Aggregation)",
    prompt: "Crea una tabla resumen que muestre cuánto dinero tiene cada cliente en compras completadas y cuánto en compras pendientes. Muestra el `cliente_id`, la suma de compras completadas bajo el nombre `ventas_completadas` (sumando el total cuando el estado sea `'completado'` y 0 si no) y la suma de compras pendientes bajo `ventas_pendientes` (sumando el total cuando sea `'pendiente'` y 0 si no). Agrupa y ordena por `cliente_id` ascendente.",
    initial_code: "-- Agregación condicional con CASE dentro de SUM\nSELECT ",
    xp_reward: 60,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 45,
    hints: [
      "Usa SUM(CASE WHEN estado_pedido = 'completado' THEN total ELSE 0 END) AS ventas_completadas.",
      "Haz lo mismo para pendientes y agrupa por cliente_id."
],
    concept: {
      summary: "Combinar `SUM(CASE WHEN ... THEN monto ELSE 0 END)` permite transformar valores de filas en columnas métricas independientes (pivoteo).",
      syntax: "SELECT entidad_id,\n       SUM(CASE WHEN estado = 'tipo_a' THEN monto ELSE 0 END) AS total_a,\n       SUM(CASE WHEN estado = 'tipo_b' THEN monto ELSE 0 END) AS total_b\nFROM nombre_tabla\nGROUP BY entidad_id\nORDER BY entidad_id ASC;",
      key_points: [
        "El `CASE` evalúa el estado fila por fila; si coincide devuelve el monto, y si no, devuelve 0 para no alterar la suma.",
        "Cada expresión agregada genera una columna horizontal diferenciada en el reporte.",
        "El `GROUP BY entidad_id` agrupa las transacciones condensándolas por cada entidad."
      ],
      execution_order_note: "💡 Esta técnica es el estándar SQL portátil para pivotar datos sin depender de extensiones propietarias.",
    },
    objectives: [
      "1. Evaluar condicionalmente el monto transaccionado según el estado del pedido.",
      "2. Acumular las ventas confirmadas y las pendientes en columnas independientes.",
      "3. Condensar los importes por cada cliente y ordenar por ID."
],
    sample_tables: [SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000017',
    module_id: 'c0000000-0000-0000-0000-000000000011',
    title: "Facturación por Categoría mediante CTE",
    prompt: "Prepara un reporte ordenado de facturación por categoría usando una expresión `WITH` (CTE). Crea una tabla temporal llamada `ventas_por_categoria` que sume las ventas (`SUM(dp.cantidad * dp.precio_unitario)`) como `facturacion` agrupando por `nombre_categoria`. Luego, consulta esa tabla temporal para mostrar `nombre_categoria` y `facturacion` ordenados de mayor a menor facturación.",
    initial_code: "-- Estructura la consulta analítica usando WITH ... AS\nWITH ",
    xp_reward: 60,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 46,
    hints: [
      "WITH ventas_por_categoria AS (SELECT c.nombre_categoria, SUM(...) AS facturacion FROM ... GROUP BY c.nombre_categoria) SELECT ...",
      "Ordena por facturacion DESC."
],
    concept: {
      summary: "Una CTE (`WITH ... AS (...)`) define una tabla temporal con nombre dentro de la consulta, organizando análisis complejos por fases.",
      syntax: "WITH cte_resumen AS (\n    SELECT columna_clave,\n           SUM(columna_monto) AS monto_total\n    FROM nombre_tabla\n    GROUP BY columna_clave\n)\nSELECT columna_clave, monto_total\nFROM cte_resumen\nORDER BY monto_total DESC;",
      key_points: [
        "Se declara al inicio con `WITH nombre_cte AS (...)` conteniendo una subconsulta completa entre paréntesis.",
        "La consulta principal posterior puede consultar la CTE como si fuera una tabla física real del esquema.",
        "Aumenta significativamente la legibilidad, mantenimiento y modularidad de consultas extensas."
      ],
      execution_order_note: "💡 En PostgreSQL moderno, las CTEs no recursivas se integran directamente en el optimizador sin penalización de rendimiento.",
    },
    objectives: [
      "1. Estructurar el cálculo de facturación por familia en una tabla temporal nombrada.",
      "2. Consultar la tabla temporal como origen para la selección final de datos.",
      "3. Ordenar el resultado final de mayor a menor recaudación."
],
    sample_tables: [SAMPLE_TABLE_CATEGORIAS, SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_DETALLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000049',
    module_id: 'c0000000-0000-0000-0000-000000000011',
    title: "CTEs Múltiples Encadenadas (Pipeline de Datos)",
    prompt: "Construye un análisis por pasos usando dos CTEs encadenadas para encontrar a los clientes que gastan más que el promedio de todos los clientes. Primero crea `gasto_clientes` con el `cliente_id` y su gasto total (`SUM(total) AS total_gastado`). Luego crea `promedio_general` que calcule el promedio (`AVG(total_gastado) AS gasto_medio`) a partir de la primera. Finalmente, muestra `cliente_id` y `total_gastado` de aquellos clientes cuyo gasto supere el promedio general, ordenados de mayor a menor gasto.",
    initial_code: "-- Encadena dos CTEs separadas por coma\nWITH ",
    xp_reward: 60,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 47,
    hints: [
      "Separa las dos CTEs con una coma: WITH gasto_clientes AS (...), promedio_general AS (...).",
      "En la consulta final filtra WHERE g.total_gastado > p.gasto_medio ORDER BY g.total_gastado DESC."
],
    concept: {
      summary: "Puedes encadenar múltiples CTEs separándolas por coma bajo una sola cláusula `WITH` para crear pipelines analíticos por etapas.",
      syntax: "WITH etapa_1 AS (\n    SELECT entidad_id, SUM(monto) AS acumulado\n    FROM tabla_transacciones\n    GROUP BY entidad_id\n),\netapa_2 AS (\n    SELECT AVG(acumulado) AS umbral_medio\n    FROM etapa_1\n)\nSELECT e1.entidad_id, e1.acumulado\nFROM etapa_1 e1, etapa_2 e2\nWHERE e1.acumulado > e2.umbral_medio\nORDER BY e1.acumulado DESC;",
      key_points: [
        "Las CTEs subsiguientes se separan por comas `,` sin repetir la palabra clave `WITH`.",
        "Cada CTE puede hacer referencia a cualquiera de las CTEs definidas previamente en la secuencia.",
        "La consulta final combina o filtra los resultados de las etapas anteriores mediante condiciones lógicas."
      ],
      execution_order_note: "💡 Estructurar consultas en pasos CTE permite depurar cada etapa de forma aislada antes de ensamblar la consulta final.",
    },
    objectives: [
      "1. Encadenar la primera etapa de acumulación de gasto por cliente.",
      "2. Calcular el promedio general tomando como entrada la etapa previa.",
      "3. Filtrar en la consulta final a los clientes que superen dicho promedio general."
],
    sample_tables: [SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000007',
    module_id: 'c0000000-0000-0000-0000-000000000012',
    title: "Ranking de Productos por Precio (ROW_NUMBER)",
    prompt: "Crea una lista clasificada de productos del más caro al más económico. Muestra `producto_id`, `nombre_producto`, `precio` y una columna llamada `ranking` con la posición consecutiva (1, 2, 3...) de cada producto usando `ROW_NUMBER()` ordenado por precio descendente.",
    initial_code: "-- Emplea ROW_NUMBER() OVER (...)\nSELECT ",
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 48,
    hints: [
      "Escribe: ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking en tu lista de columnas."
],
    concept: {
      summary: "`ROW_NUMBER()` numera correlativamente cada fila (1, 2, 3...) según el orden estricto indicado en su cláusula `OVER`.",
      syntax: "SELECT columna_id, columna_nombre, columna_criterio,\n       ROW_NUMBER() OVER (ORDER BY columna_criterio DESC) AS posicion\nFROM nombre_tabla;",
      key_points: [
        "`ROW_NUMBER()` garantiza una numeración secuencial estricta y única sin duplicar posiciones, incluso ante valores idénticos.",
        "`OVER (ORDER BY columna DESC)` define la dirección y prioridad con la que se asignan los números de posición.",
        "No reduce ni colapsa filas; conserva la totalidad de los registros de la tabla original."
      ],
      execution_order_note: "💡 Las funciones de ventana se ejecutan después de `WHERE`, `GROUP BY` y `HAVING`, sobre el conjunto ya filtrado.",
    },
    objectives: [
      "1. Enumerar correlativamente cada producto según su valor comercial.",
      "2. Distribuir las posiciones del artículo más costoso al más económico.",
      "3. Mantener todas las filas del catálogo sin agrupar."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000050',
    module_id: 'c0000000-0000-0000-0000-000000000012',
    title: "Análisis de Intervalo Temporal entre Pedidos (LAG)",
    prompt: "Analiza cuánto tiempo pasa entre una compra y otra para cada cliente. Muestra el `pedido_id`, `cliente_id`, la `fecha_pedido` y el valor de la fecha del pedido inmediatamente anterior bajo el nombre `fecha_pedido_anterior`, usando la función de ventana `LAG(fecha_pedido)` dividiendo por cliente y ordenando cronológicamente. Ordena los resultados finales por `cliente_id ASC` y `fecha_pedido ASC`.",
    initial_code: "-- Emplea LAG() OVER (PARTITION BY ... ORDER BY ...)\nSELECT ",
    xp_reward: 60,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 50,
    hints: [
      "Usa LAG(fecha_pedido) OVER (PARTITION BY cliente_id ORDER BY fecha_pedido ASC) AS fecha_pedido_anterior.",
      "Ordena al final por cliente_id ASC, fecha_pedido ASC."
],
    concept: {
      summary: "`LAG()` accede a los datos de una fila anterior dentro de la misma partición sin necesidad de recurrir a auto-uniones (`SELF JOIN`).",
      syntax: "SELECT entidad_id, fecha_evento,\n       LAG(fecha_evento) OVER (PARTITION BY entidad_id ORDER BY fecha_evento ASC) AS fecha_evento_anterior\nFROM nombre_tabla\nORDER BY entidad_id ASC, fecha_evento ASC;",
      key_points: [
        "`LAG(columna)` obtiene el valor de la fila inmediatamente precedente en el orden especificado.",
        "`PARTITION BY entidad_id` reinicia la ventana para cada entidad, evitando mezclar fechas o eventos de diferentes sujetos.",
        "Para el primer registro de cada partición, al no existir fila previa, `LAG()` retorna naturalmente `NULL`."
      ],
      execution_order_note: "💡 `LAG(columna, N, valor_default)` permite especificar cuántas filas mirar hacia atrás y qué valor devolver si es nulo.",
    },
    objectives: [
      "1. Dividir las transacciones por cliente ordenándolas en secuencia temporal.",
      "2. Recuperar el valor cronológico de la compra inmediatamente anterior.",
      "3. Proyectar la fecha previa y ordenar adecuadamente."
],
    sample_tables: [SAMPLE_TABLE_PEDIDOS],
  },
];

export const FALLBACK_TRACKS: Track[] = [
  {
    id: 'sql-foundations',
    title: 'SQL Foundations',
    slug: 'sql-foundations',
    description:
      'Aprende a consultar bases de datos desde cero. Proyecciones con SELECT, cálculos derivados, filtrado con WHERE y BETWEEN, ordenamiento y agregaciones globales.',
    badge_name: 'Primer Query',
    color_accent: '#38BDF8',
    sort_order: 1,
    total_exercises: 22,
    completed_exercises: 0,
    modules: [
      {
        id: 'a0000000-0000-0000-0000-000000000001',
        track_id: 'sql-foundations',
        title: 'SELECT & Proyecciones de Datos',
        slug: 'select-proyecciones',
        description: 'Aprende a solicitar columnas específicas y utilizar alias y cálculos aritméticos limpios.',
        sort_order: 1,
        exercises_count: 4,
        completed_count: 0,
      },
      {
        id: 'a0000000-0000-0000-0000-000000000002',
        track_id: 'sql-foundations',
        title: 'Filtrado con WHERE y Operadores Lógicos',
        slug: 'filtrado-where',
        description: 'Aplica filtros condicionales exactos mediante operadores de comparación y rangos con BETWEEN.',
        sort_order: 2,
        exercises_count: 6,
        completed_count: 0,
      },
      {
        id: 'a0000000-0000-0000-0000-000000000003',
        track_id: 'sql-foundations',
        title: 'Ordenamiento y Paginación',
        slug: 'ordenamiento-paginacion',
        description: 'Ordena resultados con ORDER BY (ASC/DESC) y limita registros devueltos con LIMIT y OFFSET.',
        sort_order: 3,
        exercises_count: 4,
        completed_count: 0,
      },
      {
        id: 'a0000000-0000-0000-0000-000000000004',
        track_id: 'sql-foundations',
        title: 'Agregación y Agrupamiento',
        slug: 'agregacion-agrupamiento',
        description: 'Resume datos con COUNT, SUM, AVG y filtra agrupaciones agregadas con HAVING.',
        sort_order: 4,
        exercises_count: 8,
        completed_count: 0,
      },
    ],
  },
  {
    id: 'relational-sql',
    title: 'Relational SQL',
    slug: 'relational-sql',
    description:
      'Domina el cruce de tablas relacionales. Claves foráneas, uniones con INNER JOIN, agregación relacional, detección de ausencias con LEFT JOIN, queries multi-tabla y operaciones de conjunto.',
    badge_name: 'Join Master',
    color_accent: '#818CF8',
    sort_order: 2,
    total_exercises: 18,
    completed_exercises: 0,
    modules: [
      {
        id: 'b0000000-0000-0000-0000-000000000005',
        track_id: 'relational-sql',
        title: 'Uniones Fundamentales (INNER JOIN)',
        slug: 'inner-join',
        description: 'Cruza tablas relacionales mediante claves foráneas y calcula agregaciones por entidad cruzada.',
        sort_order: 5,
        exercises_count: 5,
        completed_count: 0,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000006',
        track_id: 'relational-sql',
        title: 'Detección de Ausencias (LEFT JOIN & NULL)',
        slug: 'left-join-null',
        description: 'Identifica registros huérfanos o entidades sin actividad asociada mediante LEFT JOIN e IS NULL.',
        sort_order: 6,
        exercises_count: 5,
        completed_count: 0,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000007',
        track_id: 'relational-sql',
        title: 'Consultas Multi-Tabla en Cascada',
        slug: 'multi-tabla',
        description: 'Conecta 3 o más tablas para análisis integral del negocio en cascada relacional.',
        sort_order: 7,
        exercises_count: 4,
        completed_count: 0,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000008',
        track_id: 'relational-sql',
        title: 'Operaciones de Conjunto y Joins Especiales',
        slug: 'conjuntos-joins-especiales',
        description: 'Combina consultas mediante UNION, EXCEPT, CROSS JOIN y auto-uniones con SELF JOIN.',
        sort_order: 8,
        exercises_count: 4,
        completed_count: 0,
      },
    ],
  },
  {
    id: 'advanced-queries',
    title: 'Advanced Queries',
    slug: 'advanced-queries',
    description:
      'Eleva tu nivel con subconsultas analíticas, expresiones condicionales CASE, CTEs (WITH) y funciones analíticas de ventana con partición.',
    badge_name: 'Window Wizard',
    color_accent: '#34D399',
    sort_order: 3,
    total_exercises: 10,
    completed_exercises: 0,
    modules: [
      {
        id: 'c0000000-0000-0000-0000-000000000009',
        track_id: 'advanced-queries',
        title: 'Subconsultas Analíticas',
        slug: 'subconsultas',
        description: 'Integra subconsultas en cláusulas WHERE y proyecciones escalares.',
        sort_order: 9,
        exercises_count: 3,
        completed_count: 0,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000010',
        track_id: 'advanced-queries',
        title: 'Expresiones Condicionales (CASE)',
        slug: 'case-when',
        description: 'Transforma y categoriza métricas en vuelo con lógica condicional.',
        sort_order: 10,
        exercises_count: 2,
        completed_count: 0,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000011',
        track_id: 'advanced-queries',
        title: 'Common Table Expressions (CTEs)',
        slug: 'ctes-with',
        description: 'Estructura consultas analíticas complejas y legibles con la cláusula WITH.',
        sort_order: 11,
        exercises_count: 2,
        completed_count: 0,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000012',
        track_id: 'advanced-queries',
        title: 'Funciones de Ventana (Window Functions)',
        slug: 'window-functions',
        description: 'Aplica cálculos de partición y ranking sin colapsar las filas devueltas (ROW_NUMBER, DENSE_RANK, LAG).',
        sort_order: 12,
        exercises_count: 3,
        completed_count: 0,
      },
    ],
  },
];

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
    title: 'Primer Query',
    description: 'Ejecutaste con éxito tu primera consulta SQL en Qurio.',
    icon: 'Terminal',
    category: 'progreso',
    xp_reward: 50,
    unlocked_at: null,
    progress: 0,
    required_threshold: 1,
    current_value: 0,
    unit: 'query',
  },
  {
    id: 'join-apprentice',
    title: 'Aprendiz de Relaciones',
    description: 'Completaste tu primer reto cruzando tablas relacionales con INNER JOIN.',
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
    title: 'Detective de NULL',
    description: 'Identificaste registros huérfanos usando LEFT JOIN y verificación IS NULL.',
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
    title: 'Cadencia Activa',
    description: 'Mantén una racha de práctica durante 3 días consecutivos.',
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
    title: 'Semana de Producción',
    description: 'Mantén una racha de práctica continua durante 7 días seguidos.',
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
    title: 'Baja Latencia',
    description: 'Ejecuta una consulta evaluada en menos de 5ms en el sandbox.',
    icon: 'Zap',
    category: 'habilidad',
    xp_reward: 120,
    unlocked_at: null,
    progress: 0,
    required_threshold: 1,
    current_value: 0,
    unit: 'query',
  },
  {
    id: 'window-wizard',
    title: 'Window Wizard',
    description: 'Resuelve un ejercicio analítico utilizando funciones de ventana (ROW_NUMBER).',
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
    id: 'master-sql',
    title: 'Ingeniero Relacional',
    description: 'Completa al 100% las 3 rutas formativas del currículum.',
    icon: 'Sparkles',
    category: 'progreso',
    xp_reward: 500,
    unlocked_at: null,
    progress: 0,
    required_threshold: 50,
    current_value: 0,
    unit: 'ejercicios',
  },
];

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
        unlocked = Array.from(completedExerciseIds).some(
          (id) => id.includes('m05') || id.includes('join')
        );
        currentValue = unlocked ? 1 : 0;
        break;

      case 'null-detective':
        unlocked = Array.from(completedExerciseIds).some(
          (id) => id.includes('m06') || id.includes('null')
        );
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
        unlocked = Array.from(completedExerciseIds).some(
          (id) => id.includes('m09') || id.includes('m10') || id.includes('window')
        );
        currentValue = unlocked ? 1 : 0;
        break;

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
