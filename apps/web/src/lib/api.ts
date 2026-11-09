import {
  ExecutionResult,
  EvaluationResponse,
  Exercise,
  Track,
  Achievement,
  TableSchemaInfo,
  QueryHistoryItem,
  SampleTableData,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const LOCAL_STORAGE_HISTORY_KEY = 'qurio_query_history';

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
      return await res.json();
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
      return await res.json();
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
      const res = await fetch(`${API_BASE_URL}/playground/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    hintsRevealed = 0
  ): Promise<EvaluationResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/exercises/${exerciseId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, hints_revealed: hintsRevealed }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
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
};

export const SAMPLE_TABLE_PRODUCTOS: SampleTableData = {
  tableName: 'productos',
  columns: ['producto_id', 'nombre_producto', 'precio', 'stock', 'categoria_id'],
  rows: [
    [1, 'Laptop Pro 15', 1299.99, 15, 1],
    [2, 'Smartphone X', 799.50, 30, 1],
    [3, 'Auriculares Noise-Cancelling', 199.99, 50, 1],
    [4, 'Monitor 4K 27"', 450.00, 20, 1],
    [5, 'Teclado Mecánico RGB', 89.90, 80, 1],
  ],
};

export const SAMPLE_TABLE_CLIENTES: SampleTableData = {
  tableName: 'clientes',
  columns: ['cliente_id', 'nombre', 'apellido', 'email', 'ciudad', 'pais'],
  rows: [
    [1, 'Carlos', 'Mendoza', 'carlos.mendoza@email.com', 'Madrid', 'España'],
    [2, 'Elena', 'Gómez', 'elena.gomez@email.com', 'Barcelona', 'España'],
    [3, 'Mateo', 'Silva', 'mateo.silva@email.com', 'Valencia', 'España'],
    [4, 'Sofía', 'Torres', 'sofia.torres@email.com', 'Sevilla', 'España'],
    [11, 'Diego', 'Hernández', 'diego.hernandez@email.com', 'Madrid', 'España'],
  ],
};

export const SAMPLE_TABLE_PEDIDOS: SampleTableData = {
  tableName: 'pedidos',
  columns: ['pedido_id', 'cliente_id', 'fecha_pedido', 'estado_pedido', 'total'],
  rows: [
    [101, 1, '2024-01-10', 'completado', 1499.98],
    [102, 2, '2024-01-12', 'completado', 799.50],
    [103, 3, '2024-01-15', 'pendiente', 89.90],
    [104, 1, '2024-02-01', 'completado', 450.00],
  ],
};

export const SAMPLE_TABLE_CATEGORIAS: SampleTableData = {
  tableName: 'categorias',
  columns: ['categoria_id', 'nombre_categoria', 'descripcion'],
  rows: [
    [1, 'Electrónica', 'Dispositivos, gadgets y accesorios tecnológicos'],
    [2, 'Hogar', 'Muebles, decoración y cocina'],
    [3, 'Deportes', 'Equipamiento deportivo y fitness'],
  ],
};

export const FALLBACK_EXERCISES: Exercise[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    module_id: 'a0000000-0000-0000-0000-000000000001',
    title: 'Catálogo Básico de Productos',
    prompt:
      'El departamento de ventas necesita listar los nombres de los productos junto con su precio de venta unitario. Escribe una consulta que obtenga únicamente las columnas nombre_producto y precio de la tabla productos.',
    initial_code: '-- Escribe tu consulta aquí\nSELECT ',
    solution_query: 'SELECT nombre_producto, precio FROM productos;',
    xp_reward: 30,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 1,
    is_completed: true,
    hints: [
      'Usa la sentencia SELECT seguida de las columnas solicitadas separadas por coma.',
      'La cláusula FROM indica la tabla productos.',
    ],
    concept: {
      summary:
        'La sentencia SELECT es la instrucción fundamental en SQL para recuperar datos de una base de datos relacional. Te permite proyectar únicamente las columnas necesarias.',
      syntax: 'SELECT columna_1, columna_2\nFROM nombre_tabla;',
      key_points: [
        'SELECT especifica qué atributos deseas proyectar en el conjunto final.',
        'FROM indica la entidad o tabla de origen donde residen los datos.',
        'En PostgreSQL las columnas y tablas no distinguen mayúsculas salvo que lleven comillas dobles.',
      ],
      execution_order_note:
        '⚡ Orden de procesamiento interno: FROM se ejecuta antes que SELECT para cargar primero la relación en el buffer.',
    },
    objectives: [
      '1. Identificar la tabla de origen: productos.',
      '2. Proyectar exactamente las columnas nombre_producto y precio.',
      '3. Finalizar la instrucción con punto y coma (;).',
    ],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    module_id: 'a0000000-0000-0000-0000-000000000002',
    title: 'Productos Premium (> 500€)',
    prompt:
      'Para una campaña exclusiva, marketing solicita todos los productos cuyo precio supere los 500 euros. Devuelve el nombre del producto, el precio y el stock actual para aquellos productos con precio estrictamente mayor a 500.',
    initial_code: '-- Filtra los productos de alto valor\nSELECT ',
    solution_query: 'SELECT nombre_producto, precio, stock FROM productos WHERE precio > 500;',
    xp_reward: 35,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 2,
    is_completed: true,
    hints: [
      'Agrega una cláusula WHERE después de FROM productos.',
      'Utiliza el operador de comparación mayor que (>).',
    ],
    concept: {
      summary:
        'La cláusula WHERE restringe los resultados evaluando una condición booleana fila por fila. Solo las filas donde la expresión resulte TRUE son devueltas.',
      syntax: 'SELECT col1, col2, col3\nFROM tabla\nWHERE condicion_comparacion;',
      key_points: [
        'Operadores estándar: >, <, >=, <=, =, <> (o !=).',
        'WHERE evalúa tuplas individuales antes de cualquier agregación o agrupamiento.',
      ],
      execution_order_note:
        '⚡ Orden de procesamiento: FROM → WHERE → SELECT. El filtro se evalúa ANTES de proyectar las columnas.',
    },
    objectives: [
      '1. Seleccionar nombre_producto, precio y stock de productos.',
      '2. Añadir la cláusula WHERE con la condición precio > 500.',
      '3. Verificar que no se incluyan productos de 500€ exactos o menores.',
    ],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    module_id: 'a0000000-0000-0000-0000-000000000003',
    title: 'Clientes Españoles Ordenados por Apellido',
    prompt:
      'Obtén el nombre, apellido y ciudad de todos los clientes cuyo país sea \'España\'. Los resultados deben venir ordenados alfabéticamente de forma ascendente por su apellido.',
    initial_code: '-- Filtra y ordena los clientes\nSELECT ',
    solution_query: 'SELECT nombre, apellido, ciudad FROM clientes WHERE pais = \'España\' ORDER BY apellido ASC;',
    xp_reward: 40,
    difficulty: 'Principiante',
    check_order: true,
    sort_order: 3,
    is_completed: false,
    hints: [
      'Usa WHERE pais = \'España\'.',
      'Para ordenar utiliza ORDER BY apellido ASC.',
    ],
    concept: {
      summary:
        'La cláusula ORDER BY ordena el conjunto de tuplas resultante por una o más columnas. ASC ordena de menor a mayor (A-Z) y DESC de mayor a menor (Z-A).',
      syntax: 'SELECT col1, col2\nFROM tabla\nWHERE condicion\nORDER BY columna_orden [ASC | DESC];',
      key_points: [
        'Los literales de texto en SQL siempre se encierran entre comillas simples (\'España\').',
        'Por defecto, si omites la dirección, PostgreSQL asume orden ascendente (ASC).',
      ],
      execution_order_note: '⚡ Orden de procesamiento: FROM → WHERE → SELECT → ORDER BY.',
    },
    objectives: [
      '1. Filtrar los clientes con pais = \'España\'.',
      '2. Proyectar nombre, apellido y ciudad.',
      '3. Ordenar alfabéticamente por apellido en orden ascendente (ASC).',
    ],
    sample_tables: [SAMPLE_TABLE_CLIENTES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000004',
    module_id: 'a0000000-0000-0000-0000-000000000004',
    title: 'Conteo de Productos por Categoría',
    prompt:
      'El equipo de inventario desea saber cuántos productos existen en cada categoría. Escribe una consulta que devuelva el categoria_id y el total de productos bajo el alias total_productos para aquellas categorías con más de 2 productos registrados.',
    initial_code: '-- Utiliza GROUP BY y HAVING\nSELECT ',
    solution_query:
      'SELECT categoria_id, COUNT(*) AS total_productos FROM productos GROUP BY categoria_id HAVING COUNT(*) > 2;',
    xp_reward: 45,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 4,
    is_completed: false,
    hints: [
      'Agrupa con GROUP BY categoria_id.',
      'Filtra la agregación con HAVING COUNT(*) > 2.',
    ],
    concept: {
      summary:
        'GROUP BY agrupa filas que comparten valores comunes en columnas específicas. HAVING funciona como un WHERE especializado que filtra exclusivamente sobre los grupos agregados.',
      syntax: 'SELECT categoria_id, COUNT(*) AS total_productos\nFROM productos\nGROUP BY categoria_id\nHAVING COUNT(*) > 2;',
      key_points: [
        'WHERE filtra filas individuales ANTES de agrupar.',
        'HAVING filtra grupos calculados DESPUÉS de ejecutar GROUP BY.',
        'Toda columna en el SELECT que no esté envuelta en una función de agregación debe estar en el GROUP BY.',
      ],
      execution_order_note: '⚡ Orden de procesamiento: FROM → WHERE → GROUP BY → HAVING → SELECT.',
    },
    objectives: [
      '1. Agrupar las filas de productos por categoria_id.',
      '2. Calcular el conteo con COUNT(*) y asignarle el alias total_productos.',
      '3. Filtrar los grupos que tengan más de 2 productos con HAVING COUNT(*) > 2.',
    ],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000005',
    module_id: 'b0000000-0000-0000-0000-000000000005',
    title: 'Pedidos con Identidad del Cliente (INNER JOIN)',
    prompt:
      'Genera un reporte que muestre el pedido_id, el nombre del cliente, su apellido y el total del pedido. Relaciona las tablas pedidos y clientes mediante su clave compartida.',
    initial_code: '-- Cruza clientes con sus respectivos pedidos\nSELECT ',
    solution_query:
      'SELECT p.pedido_id, c.nombre, c.apellido, p.total FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id;',
    xp_reward: 45,
    difficulty: 'Intermedio',
    check_order: false,
    sort_order: 5,
    is_completed: false,
    hints: [
      'Une pedidos p con clientes c mediante ON p.cliente_id = c.cliente_id.',
    ],
    concept: {
      summary:
        'INNER JOIN combina tuplas de dos tablas basándose en una condición de coincidencia entre claves (PK y FK). Solo incluye registros que tengan correspondencia exacta en ambos lados.',
      syntax: 'SELECT p.pedido_id, c.nombre, c.apellido, p.total\nFROM pedidos p\nINNER JOIN clientes c ON p.cliente_id = c.cliente_id;',
      key_points: [
        'Los alias de tabla (como p o c) son obligatorios en consultas profesionales para evitar ambigüedades.',
        'El predicado ON define cómo se intersecan los dos conjuntos de datos relacionales.',
      ],
      execution_order_note: '⚡ El cruce relacional (JOIN) se evalúa dentro de la cláusula FROM antes de aplicar filtros.',
    },
    objectives: [
      '1. Relacionar pedidos con clientes usando cliente_id.',
      '2. Proyectar p.pedido_id, c.nombre, c.apellido y p.total.',
      '3. Desambiguar los atributos con alias de tabla claros.',
    ],
    sample_tables: [SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_CLIENTES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000006',
    module_id: 'b0000000-0000-0000-0000-000000000006',
    title: 'Clientes sin Compras Registradas (LEFT JOIN & IS NULL)',
    prompt:
      'El equipo de marketing necesita reactivar a usuarios registrados que nunca han realizado un pedido en la plataforma. Escribe una consulta que devuelva el ID del cliente, su nombre y su apellido para todos los clientes que no tienen registros en la tabla de compras.',
    initial_code: '-- Identifica clientes inactivos sin pedidos asociados\nSELECT ',
    solution_query:
      'SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id WHERE p.pedido_id IS NULL;',
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: false,
    sort_order: 6,
    is_completed: false,
    hints: [
      'Inicia realizando un LEFT JOIN desde la tabla clientes hacia la tabla pedidos usando la relación c.cliente_id = p.cliente_id.',
      'Cuando un cliente no tiene pedidos, las columnas provenientes de la tabla pedidos resultarán con valores NULL. Filtra usando WHERE p.pedido_id IS NULL.',
      'Asegúrate de proyectar exactamente tres columnas: cliente_id, nombre y apellido.',
    ],
    concept: {
      summary:
        'LEFT JOIN preserva todas las filas de la tabla izquierda (clientes), rellenando con NULL los campos de la tabla derecha (pedidos) cuando no existe coincidencia. El filtro WHERE p.id IS NULL aísla las tuplas huérfanas.',
      syntax: 'SELECT c.cliente_id, c.nombre, c.apellido\nFROM clientes c\nLEFT JOIN pedidos p ON c.cliente_id = p.cliente_id\nWHERE p.pedido_id IS NULL;',
      key_points: [
        'Para evaluar valores nulos siempre se usa IS NULL o IS NOT NULL, nunca = NULL.',
        'Es el patrón canónico para auditoría de integridad referencial y detección de inactividad.',
      ],
      execution_order_note: '⚡ Orden de procesamiento: FROM (LEFT JOIN) → WHERE (filtra solo registros con clave foránea NULL) → SELECT.',
    },
    objectives: [
      '1. Realizar un LEFT JOIN de clientes c hacia pedidos p por cliente_id.',
      '2. Filtrar únicamente las filas donde p.pedido_id IS NULL.',
      '3. Proyectar cliente_id, nombre y apellido.',
    ],
    sample_tables: [SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000007',
    module_id: 'c0000000-0000-0000-0000-000000000011',
    title: 'Ranking de Productos por Precio (ROW_NUMBER)',
    prompt:
      'El área de pricing desea clasificar los productos del más caro al más económico. Devuelve el producto_id, nombre_producto, precio y una columna llamada ranking con la posición ordinal de cada producto del más caro al más barato.',
    initial_code: '-- Emplea ROW_NUMBER() OVER (...)\nSELECT ',
    solution_query:
      'SELECT producto_id, nombre_producto, precio, ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking FROM productos;',
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 7,
    is_completed: false,
    hints: [
      'Utiliza la función analítica ROW_NUMBER().',
      'Define la ventana con OVER (ORDER BY precio DESC).',
    ],
    concept: {
      summary:
        'Las funciones ventana (Window Functions) realizan cálculos a través de particiones de tuplas sin colapsar el resultado en una sola fila. ROW_NUMBER() numera secuencialmente cada registro según la cláusula OVER (ORDER BY ...).',
      syntax: 'SELECT producto_id, nombre_producto, precio,\n       ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking\nFROM productos;',
      key_points: [
        'La cláusula OVER() determina el marco de la ventana analítica.',
        'Permite calcular clasificaciones, acumulados y diferencias entre filas consecutivas.',
      ],
      execution_order_note: '⚡ Las funciones ventana se evalúan después de WHERE, GROUP BY y HAVING, pero antes del ORDER BY de salida final.',
    },
    objectives: [
      '1. Proyectar producto_id, nombre_producto y precio.',
      '2. Utilizar ROW_NUMBER() OVER (ORDER BY precio DESC) con alias ranking.',
      '3. Comprobar que el producto más costoso ocupe la posición 1.',
    ],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
];

export const FALLBACK_TRACKS: Track[] = [
  {
    id: 'sql-foundations',
    title: 'SQL Foundations',
    slug: 'sql-foundations',
    description:
      'Aprende a consultar bases de datos desde cero. Proyecciones con SELECT, filtrado con WHERE, operadores lógicos, ordenamiento y agregaciones esenciales.',
    badge_name: 'Primer Query',
    color_accent: '#38BDF8',
    sort_order: 1,
    total_exercises: 22,
    completed_exercises: 8,
    modules: [
      {
        id: 'a0000000-0000-0000-0000-000000000001',
        track_id: 'sql-foundations',
        title: 'SELECT & Proyecciones de Datos',
        slug: 'select-proyecciones',
        description: 'Aprende a solicitar columnas específicas y utilizar alias limpios.',
        sort_order: 1,
        exercises_count: 5,
        completed_count: 5,
      },
      {
        id: 'a0000000-0000-0000-0000-000000000002',
        track_id: 'sql-foundations',
        title: 'Filtrado con WHERE y Operadores Lógicos',
        slug: 'filtrado-where',
        description: 'Aplica filtros condicionales exactos mediante operadores de comparación y rangos.',
        sort_order: 2,
        exercises_count: 6,
        completed_count: 3,
      },
      {
        id: 'a0000000-0000-0000-0000-000000000003',
        track_id: 'sql-foundations',
        title: 'Ordenamiento y Paginación',
        slug: 'ordenamiento-paginacion',
        description: 'Ordena resultados con ORDER BY (ASC/DESC) y limita registros devueltos con LIMIT y OFFSET.',
        sort_order: 3,
        exercises_count: 5,
        completed_count: 0,
      },
      {
        id: 'a0000000-0000-0000-0000-000000000004',
        track_id: 'sql-foundations',
        title: 'Agregación y Agrupamiento',
        slug: 'agregacion-agrupamiento',
        description: 'Resume datos con COUNT, SUM, AVG, MIN, MAX y filtra agregaciones con HAVING.',
        sort_order: 4,
        exercises_count: 6,
        completed_count: 0,
      },
    ],
  },
  {
    id: 'relational-sql',
    title: 'Relational SQL',
    slug: 'relational-sql',
    description:
      'Domina el cruce de tablas relacionales. Claves foráneas, uniones con INNER JOIN, detección de ausencias con LEFT JOIN, consultas multi-tabla y operaciones de conjunto.',
    badge_name: 'Join Master',
    color_accent: '#818CF8',
    sort_order: 2,
    total_exercises: 18,
    completed_exercises: 3,
    modules: [
      {
        id: 'b0000000-0000-0000-0000-000000000005',
        track_id: 'relational-sql',
        title: 'Uniones Fundamentales (INNER JOIN)',
        slug: 'inner-join',
        description: 'Cruza tablas relacionales mediante claves foráneas emparejando registros existentes.',
        sort_order: 5,
        exercises_count: 6,
        completed_count: 2,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000006',
        track_id: 'relational-sql',
        title: 'Detección de Ausencias (LEFT JOIN & NULL)',
        slug: 'left-join-null',
        description: 'Identifica registros huérfanos o entidades sin actividad asociada mediante LEFT JOIN e IS NULL.',
        sort_order: 6,
        exercises_count: 6,
        completed_count: 1,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000007',
        track_id: 'relational-sql',
        title: 'Consultas Multi-Tabla en Cascada',
        slug: 'multi-tabla',
        description: 'Conecta 3 o más tablas para análisis integral del negocio en cascada relacional.',
        sort_order: 7,
        exercises_count: 6,
        completed_count: 0,
      },
    ],
  },
  {
    id: 'advanced-queries',
    title: 'Advanced Queries',
    slug: 'advanced-queries',
    description:
      'Eleva tu nivel con subconsultas correlacionadas, expresiones condicionales CASE, CTEs (WITH) y funciones analíticas de ventana con partición.',
    badge_name: 'Window Wizard',
    color_accent: '#34D399',
    sort_order: 3,
    total_exercises: 10,
    completed_exercises: 1,
    modules: [
      {
        id: 'c0000000-0000-0000-0000-000000000008',
        track_id: 'advanced-queries',
        title: 'Subconsultas Analíticas',
        slug: 'subconsultas',
        description: 'Integra subconsultas en cláusulas WHERE y proyecciones escalares.',
        sort_order: 8,
        exercises_count: 3,
        completed_count: 0,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000009',
        track_id: 'advanced-queries',
        title: 'Expresiones Condicionales (CASE)',
        slug: 'case-when',
        description: 'Transforma y categoriza métricas en vuelo con lógica condicional.',
        sort_order: 9,
        exercises_count: 2,
        completed_count: 1,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000010',
        track_id: 'advanced-queries',
        title: 'Common Table Expressions (CTEs)',
        slug: 'ctes-with',
        description: 'Estructura consultas analíticas complejas y legibles con la cláusula WITH.',
        sort_order: 10,
        exercises_count: 2,
        completed_count: 0,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000011',
        track_id: 'advanced-queries',
        title: 'Funciones de Ventana (Window Functions)',
        slug: 'window-functions',
        description: 'Aplica cálculos de partición y ranking sin colapsar las filas devueltas (ROW_NUMBER, RANK, DENSE_RANK).',
        sort_order: 11,
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
    rowCount: 6,
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
    rowCount: 20,
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
    rowCount: 30,
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
    rowCount: 60,
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
    rowCount: 4,
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
    rowCount: 25,
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
    rowCount: 30,
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
    rowCount: 30,
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
    unlocked_at: '2026-11-08T18:24:00Z',
    progress: 100,
    required_threshold: 1,
    current_value: 1,
    unit: 'query',
  },
  {
    id: 'join-apprentice',
    title: 'Aprendiz de Relaciones',
    description: 'Completaste tu primer reto cruzando tablas relacionales con INNER JOIN.',
    icon: 'GitBranch',
    category: 'habilidad',
    xp_reward: 75,
    unlocked_at: '2026-11-08T19:15:00Z',
    progress: 100,
    required_threshold: 1,
    current_value: 1,
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
    progress: 60,
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
    progress: 66,
    required_threshold: 3,
    current_value: 2,
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
    progress: 28,
    required_threshold: 7,
    current_value: 2,
    unit: 'días',
  },
  {
    id: 'speed-runner',
    title: 'Baja Latencia',
    description: 'Ejecuta una consulta evaluada en menos de 5ms en el sandbox.',
    icon: 'Zap',
    category: 'habilidad',
    xp_reward: 120,
    unlocked_at: '2026-11-09T09:30:00Z',
    progress: 100,
    required_threshold: 1,
    current_value: 1,
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
    progress: 24,
    required_threshold: 50,
    current_value: 12,
    unit: 'ejercicios',
  },
];

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
