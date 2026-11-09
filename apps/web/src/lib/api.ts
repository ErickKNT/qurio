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

export const SAMPLE_TABLE_DETALLE_PEDIDOS: SampleTableData = {
  tableName: 'detalle_pedidos',
  columns: ['detalle_id', 'pedido_id', 'producto_id', 'cantidad', 'precio_unitario'],
  rows: [
    [1, 101, 1, 1, 1299.99],
    [2, 101, 3, 1, 199.99],
    [3, 102, 2, 1, 799.50],
    [4, 103, 5, 1, 89.90],
  ],
};

export const FALLBACK_EXERCISES: Exercise[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    module_id: 'a0000000-0000-0000-0000-000000000001',
    title: "Catálogo Básico de Productos",
    prompt: "El departamento de ventas necesita listar los nombres de los productos junto con su precio de venta unitario. Escribe una consulta que obtenga únicamente las columnas nombre_producto y precio de la tabla productos.",
    initial_code: "-- Escribe tu consulta aquí\nSELECT ",
    solution_query: "SELECT nombre_producto, precio FROM productos;",
    xp_reward: 30,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 1,
    hints: [
      "Usa la sentencia SELECT seguida de las columnas solicitadas separadas por coma.",
      "La cláusula FROM indica la tabla productos."
],
    concept: {
      summary: "La sentencia SELECT es la instrucción fundamental en SQL para recuperar datos de una base de datos relacional. Te permite proyectar únicamente las columnas necesarias.",
      syntax: "SELECT columna_1, columna_2\nFROM nombre_tabla;",
      key_points: [
        "SELECT especifica qué atributos deseas proyectar en el conjunto final.",
        "FROM indica la entidad o tabla de origen donde residen los datos.",
        "En PostgreSQL las columnas y tablas no distinguen mayúsculas salvo que lleven comillas dobles."
],
      execution_order_note: "⚡ Orden de procesamiento interno: FROM se ejecuta antes que SELECT para cargar primero la relación en el buffer.",
    },
    objectives: [
      "1. Identificar la tabla de origen: 'productos'.",
      "2. Proyectar exactamente las columnas 'nombre_producto' y 'precio'.",
      "3. Finalizar la instrucción con punto y coma (;)."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000008',
    module_id: 'a0000000-0000-0000-0000-000000000001',
    title: "Cálculo de Precios con IVA",
    prompt: "El área contable requiere proyectar el precio final de cada producto aplicando el 21% de IVA (multiplicando el precio por 1.21). Escribe una consulta que devuelva el nombre_producto, el precio original y el precio calculado redondeado a 2 decimales bajo el alias precio_con_iva.",
    initial_code: "-- Proyecta columnas y calcula el precio con IVA\nSELECT ",
    solution_query: "SELECT nombre_producto, precio, ROUND(precio * 1.21, 2) AS precio_con_iva FROM productos;",
    xp_reward: 35,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 2,
    hints: [
      "Puedes realizar operaciones matemáticas directamente en SELECT, ej: precio * 1.21",
      "Usa ROUND(expresion, 2) AS precio_con_iva para limitar a 2 decimales y asignar el alias."
],
    concept: {
      summary: "En SQL las expresiones aritméticas (+, -, *, /) se evalúan en la cláusula SELECT para derivar métricas en tiempo de consulta. La palabra clave AS asigna un nombre limpio y legible al atributo calculado.",
      syntax: "SELECT columna, ROUND(columna * factor, 2) AS nuevo_nombre\nFROM nombre_tabla;",
      key_points: [
        "Las operaciones aritméticas respetan la precedencia estándar de las matemáticas.",
        "ROUND(valor, decimales) ajusta la precisión numérica para evitar artefactos de punto flotante.",
        "Los alias de columna renombran los campos en la proyección final sin modificar la tabla física."
],
      execution_order_note: "⚡ Las expresiones aritméticas se calculan en la fase de proyección SELECT una vez leídas las filas.",
    },
    objectives: [
      "1. Proyectar 'nombre_producto' y 'precio'.",
      "2. Calcular 'precio * 1.21' redondeado con ROUND(..., 2).",
      "3. Asignar el alias 'precio_con_iva'."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    module_id: 'a0000000-0000-0000-0000-000000000002',
    title: "Productos Premium (> 500€)",
    prompt: "Para una campaña exclusiva, marketing solicita todos los productos cuyo precio supere los 500 euros. Devuelve el nombre del producto, el precio y el stock actual para aquellos productos con precio estrictamente mayor a 500.",
    initial_code: "-- Filtra los productos de alto valor\nSELECT ",
    solution_query: "SELECT nombre_producto, precio, stock FROM productos WHERE precio > 500;",
    xp_reward: 35,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 3,
    hints: [
      "Agrega una cláusula WHERE después de FROM productos.",
      "Utiliza el operador de comparación mayor que (>)."
],
    concept: {
      summary: "La cláusula WHERE restringe los resultados evaluando una condición booleana fila por fila. Solo las filas donde la expresión resulte TRUE son devueltas.",
      syntax: "SELECT col1, col2, col3\nFROM tabla\nWHERE condicion_comparacion;",
      key_points: [
        "Operadores estándar: >, <, >=, <=, =, <> (o !=).",
        "WHERE evalúa tuplas individuales antes de cualquier agregación o agrupamiento."
],
      execution_order_note: "⚡ Orden de procesamiento: FROM → WHERE → SELECT. El filtro se evalúa ANTES de proyectar las columnas.",
    },
    objectives: [
      "1. Seleccionar 'nombre_producto', 'precio' y 'stock' de 'productos'.",
      "2. Añadir la cláusula WHERE con la condición 'precio > 500'.",
      "3. Verificar que no se incluyan productos de 500€ exactos o menores."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000009',
    module_id: 'a0000000-0000-0000-0000-000000000002',
    title: "Productos en Rango Medio (BETWEEN)",
    prompt: "El equipo de catálogo desea identificar productos de gama media con precios entre 100€ y 800€ (inclusive). Escribe una consulta que liste el nombre_producto y el precio de los productos que cumplan con dicho rango.",
    initial_code: "-- Filtra productos en el rango de 100 a 800\nSELECT ",
    solution_query: "SELECT nombre_producto, precio FROM productos WHERE precio BETWEEN 100 AND 800;",
    xp_reward: 35,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 4,
    hints: [
      "El operador BETWEEN valor_min AND valor_max incluye ambos extremos del intervalo.",
      "Equivale lógicamente a 'WHERE precio >= 100 AND precio <= 800'."
],
    concept: {
      summary: "El operador BETWEEN evalúa si una expresión se encuentra dentro de un rango cerrado inclusivo [min, max]. Es más conciso y legible que combinar dos condiciones con AND.",
      syntax: "SELECT columna_1, columna_2\nFROM tabla\nWHERE columna BETWEEN valor_min AND valor_max;",
      key_points: [
        "BETWEEN es inclusivo: incluye los valores frontera min y max.",
        "Funciona tanto con números como con fechas y cadenas de texto alfabéticas."
],
      execution_order_note: "⚡ WHERE BETWEEN filtra las tuplas durante la etapa de restricción en el escaneo de tabla.",
    },
    objectives: [
      "1. Consultar 'nombre_producto' y 'precio' de la tabla 'productos'.",
      "2. Aplicar 'WHERE precio BETWEEN 100 AND 800'.",
      "3. Comprobar que los límites de 100 y 800 queden incluidos."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    module_id: 'a0000000-0000-0000-0000-000000000003',
    title: "Clientes Españoles Ordenados por Apellido",
    prompt: "Obtén el nombre, apellido y ciudad de todos los clientes cuyo país sea 'España'. Los resultados deben venir ordenados alfabéticamente de forma ascendente por su apellido.",
    initial_code: "-- Filtra y ordena los clientes\nSELECT ",
    solution_query: "SELECT nombre, apellido, ciudad FROM clientes WHERE pais = 'España' ORDER BY apellido ASC;",
    xp_reward: 40,
    difficulty: 'Principiante',
    check_order: true,
    sort_order: 5,
    hints: [
      "Usa WHERE pais = 'España'.",
      "Para ordenar utiliza ORDER BY apellido ASC."
],
    concept: {
      summary: "La cláusula ORDER BY ordena el conjunto de tuplas resultante por una o más columnas. ASC ordena de menor a mayor (A-Z) y DESC de mayor a menor (Z-A).",
      syntax: "SELECT col1, col2\nFROM tabla\nWHERE condicion\nORDER BY columna_orden [ASC | DESC];",
      key_points: [
        "Los literales de texto en SQL siempre se encierran entre comillas simples ('España').",
        "Por defecto, si omites la dirección, PostgreSQL asume orden ascendente (ASC)."
],
      execution_order_note: "⚡ Orden de procesamiento: FROM → WHERE → SELECT → ORDER BY.",
    },
    objectives: [
      "1. Filtrar los clientes con 'pais = \\'España\\' '.",
      "2. Proyectar 'nombre', 'apellido' y 'ciudad'.",
      "3. Ordenar alfabéticamente por 'apellido' en orden ascendente (ASC)."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000010',
    module_id: 'a0000000-0000-0000-0000-000000000003',
    title: "Top 5 Productos Críticos por Stock",
    prompt: "El almacén necesita reponer con urgencia los artículos con menores existencias. Escribe una consulta que devuelva el nombre_producto y el stock de los 5 productos con menor cantidad disponible en inventario, ordenados de menor a mayor stock.",
    initial_code: "-- Ordena y limita a los 5 productos con menos stock\nSELECT ",
    solution_query: "SELECT nombre_producto, stock FROM productos ORDER BY stock ASC LIMIT 5;",
    xp_reward: 40,
    difficulty: 'Principiante',
    check_order: true,
    sort_order: 6,
    hints: [
      "Ordena por la columna stock en dirección ascendente: ORDER BY stock ASC.",
      "Agrega la cláusula LIMIT 5 al final para acotar el resultado a 5 filas."
],
    concept: {
      summary: "La cláusula LIMIT restringe el número máximo de tuplas retornadas por el motor. Cuando se combina con ORDER BY, permite construir rankings o consultas de tipo 'Top N' de forma muy eficiente.",
      syntax: "SELECT columna_1, columna_2\nFROM tabla\nORDER BY columna_criterio ASC\nLIMIT cantidad;",
      key_points: [
        "LIMIT siempre debe acompañarse de ORDER BY para garantizar resultados deterministas.",
        "En PostgreSQL LIMIT se procesa en el último paso antes de emitir la respuesta al cliente."
],
      execution_order_note: "⚡ Orden de procesamiento: FROM → WHERE → SELECT → ORDER BY → LIMIT.",
    },
    objectives: [
      "1. Seleccionar 'nombre_producto' y 'stock' de 'productos'.",
      "2. Ordenar por 'stock ASC' (menor a mayor).",
      "3. Limitar el resultado a exactamente 5 registros con 'LIMIT 5'."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000004',
    module_id: 'a0000000-0000-0000-0000-000000000004',
    title: "Conteo de Productos por Categoría",
    prompt: "El equipo de inventario desea saber cuántos productos existen en cada categoría. Escribe una consulta que devuelva el categoria_id y el total de productos bajo el alias total_productos para aquellas categorías que tengan más de 2 productos registrados.",
    initial_code: "-- Utiliza GROUP BY y HAVING\nSELECT ",
    solution_query: "SELECT categoria_id, COUNT(*) AS total_productos FROM productos GROUP BY categoria_id HAVING COUNT(*) > 2;",
    xp_reward: 45,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 7,
    hints: [
      "Agrupa por categoria_id con GROUP BY.",
      "Para filtrar grupos agregados usa HAVING COUNT(*) > 2."
],
    concept: {
      summary: "GROUP BY agrupa filas que comparten valores comunes en columnas específicas. HAVING funciona como un WHERE especializado que filtra exclusivamente sobre los grupos agregados.",
      syntax: "SELECT categoria_id, COUNT(*) AS total_productos\nFROM productos\nGROUP BY categoria_id\nHAVING COUNT(*) > 2;",
      key_points: [
        "WHERE filtra filas individuales ANTES de agrupar.",
        "HAVING filtra grupos calculados DESPUÉS de ejecutar GROUP BY.",
        "Toda columna en el SELECT que no esté envuelta en una función de agregación debe estar en el GROUP BY."
],
      execution_order_note: "⚡ Orden de procesamiento: FROM → WHERE → GROUP BY → HAVING → SELECT.",
    },
    objectives: [
      "1. Agrupar las filas de 'productos' por 'categoria_id'.",
      "2. Calcular el conteo con COUNT(*) y asignarle el alias 'total_productos'.",
      "3. Filtrar los grupos que tengan más de 2 productos con 'HAVING COUNT(*) > 2'."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000011',
    module_id: 'a0000000-0000-0000-0000-000000000004',
    title: "Métricas Globales de Ventas",
    prompt: "La dirección comercial solicita un resumen ejecutivo de las ventas completadas. Escribe una consulta que calcule el total de pedidos completados bajo el alias total_pedidos, la suma acumulada de ingresos bajo ingresos_totales y el ticket promedio redondeado a 2 decimales bajo ticket_promedio, considerando únicamente pedidos con estado_pedido = 'completado'.",
    initial_code: "-- Agrega las métricas globales para pedidos completados\nSELECT ",
    solution_query: "SELECT COUNT(*) AS total_pedidos, SUM(total) AS ingresos_totales, ROUND(AVG(total), 2) AS ticket_promedio FROM pedidos WHERE estado_pedido = 'completado';",
    xp_reward: 45,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 8,
    hints: [
      "Filtra primero con WHERE estado_pedido = 'completado'.",
      "Aplica COUNT(*), SUM(total) y ROUND(AVG(total), 2) con sus respectivos alias."
],
    concept: {
      summary: "Las funciones de agregación global (COUNT, SUM, AVG, MIN, MAX) procesan el conjunto completo de tuplas filtradas sin necesidad de GROUP BY, devolviendo un único registro de resumen ejecutivo.",
      syntax: "SELECT COUNT(*) AS total, SUM(monto) AS acumulado, ROUND(AVG(monto), 2) AS promedio\nFROM pedidos\nWHERE estado = 'completado';",
      key_points: [
        "Al no haber GROUP BY, el resultado colapsa siempre en una única tupla resumen.",
        "ROUND(AVG(campo), 2) formatea el promedio con precisión monetaria estándar."
],
      execution_order_note: "⚡ Orden de procesamiento: FROM → WHERE → Funciones de agregación → SELECT.",
    },
    objectives: [
      "1. Filtrar los pedidos con 'estado_pedido = \\'completado\\' '.",
      "2. Calcular 'COUNT(*)' con alias 'total_pedidos'.",
      "3. Calcular 'SUM(total)' como 'ingresos_totales' y 'ROUND(AVG(total), 2)' como 'ticket_promedio'."
],
    sample_tables: [SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000005',
    module_id: 'b0000000-0000-0000-0000-000000000005',
    title: "Pedidos con Identidad del Cliente",
    prompt: "Genera un reporte que muestre el pedido_id, el nombre del cliente, su apellido y el total del pedido. Relaciona las tablas pedidos y clientes mediante su clave compartida.",
    initial_code: "-- Cruza clientes con sus respectivos pedidos\nSELECT ",
    solution_query: "SELECT p.pedido_id, c.nombre, c.apellido, p.total FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id;",
    xp_reward: 45,
    difficulty: 'Intermedio',
    check_order: false,
    sort_order: 9,
    hints: [
      "Usa INNER JOIN clientes c ON p.cliente_id = c.cliente_id.",
      "Proyecta p.pedido_id, c.nombre, c.apellido, p.total."
],
    concept: {
      summary: "INNER JOIN combina tuplas de dos tablas basándose en una condición de coincidencia entre claves (PK y FK). Solo incluye registros que tengan correspondencia exacta en ambos lados.",
      syntax: "SELECT p.pedido_id, c.nombre, c.apellido, p.total\nFROM pedidos p\nINNER JOIN clientes c ON p.cliente_id = c.cliente_id;",
      key_points: [
        "Los alias de tabla (como 'p' o 'c') son obligatorios en consultas profesionales para evitar ambigüedades.",
        "El predicado ON define cómo se intersecan los dos conjuntos de datos relacionales."
],
      execution_order_note: "⚡ El cruce relacional (JOIN) se evalúa dentro de la cláusula FROM antes de aplicar filtros.",
    },
    objectives: [
      "1. Relacionar 'pedidos' con 'clientes' usando 'cliente_id'.",
      "2. Proyectar 'p.pedido_id', 'c.nombre', 'c.apellido' y 'p.total'.",
      "3. Desambiguar los atributos con alias de tabla."
],
    sample_tables: [SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_CLIENTES],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000012',
    module_id: 'b0000000-0000-0000-0000-000000000005',
    title: "Gasto Acumulado por Cliente",
    prompt: "El departamento de fidelización necesita saber cuánto ha gastado en total cada cliente. Escribe una consulta que relacione clientes y pedidos, y devuelva cliente_id, nombre, apellido y la suma total de sus compras bajo el alias total_gastado, ordenando a los clientes de mayor a menor gasto total.",
    initial_code: "-- Cruza clientes y pedidos y agrupa para sumar el gasto\nSELECT ",
    solution_query: "SELECT c.cliente_id, c.nombre, c.apellido, SUM(p.total) AS total_gastado FROM clientes c INNER JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_gastado DESC;",
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 10,
    hints: [
      "Usa INNER JOIN clientes c ON c.cliente_id = p.cliente_id.",
      "Agrupa por c.cliente_id, c.nombre, c.apellido en la cláusula GROUP BY.",
      "Ordena el resultado con ORDER BY total_gastado DESC."
],
    concept: {
      summary: "La combinación de JOIN con GROUP BY es uno de los patrones más recurrentes en SQL analítico: se enriquecen los datos mediante relaciones y luego se condensan por entidad usando funciones de agregación.",
      syntax: "SELECT c.cliente_id, c.nombre, SUM(p.total) AS total_gastado\nFROM clientes c\nINNER JOIN pedidos p ON c.cliente_id = p.cliente_id\nGROUP BY c.cliente_id, c.nombre\nORDER BY total_gastado DESC;",
      key_points: [
        "Todas las columnas de 'clientes' en el SELECT deben aparecer en la cláusula GROUP BY.",
        "ORDER BY sobre un alias de agregación permite ordenar directamente por la métrica calculada."
],
      execution_order_note: "⚡ Orden de procesamiento: FROM (JOIN) → GROUP BY → Agregación SUM → SELECT → ORDER BY.",
    },
    objectives: [
      "1. Realizar INNER JOIN entre 'clientes c' y 'pedidos p'.",
      "2. Agrupar por 'c.cliente_id', 'c.nombre' y 'c.apellido'.",
      "3. Sumar 'p.total' como 'total_gastado' y ordenar en sentido DESC."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000006',
    module_id: 'b0000000-0000-0000-0000-000000000006',
    title: "Clientes sin Compras Registradas (LEFT JOIN & IS NULL)",
    prompt: "El equipo de marketing necesita reactivar a usuarios registrados que nunca han realizado un pedido en la plataforma. Escribe una consulta que devuelva el ID del cliente, su nombre y su apellido para todos los clientes que no tienen registros en la tabla de compras.",
    initial_code: "-- Identifica clientes inactivos sin pedidos asociados\nSELECT ",
    solution_query: "SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id WHERE p.pedido_id IS NULL;",
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: false,
    sort_order: 11,
    hints: [
      "Inicia realizando un LEFT JOIN desde la tabla clientes hacia la tabla pedidos usando la relación c.cliente_id = p.cliente_id.",
      "Cuando un cliente no tiene pedidos, las columnas provenientes de la tabla pedidos resultarán con valores NULL. Filtra usando WHERE p.pedido_id IS NULL.",
      "Asegúrate de proyectar exactamente tres columnas: cliente_id, nombre y apellido."
],
    concept: {
      summary: "LEFT JOIN preserva todas las filas de la tabla izquierda ('clientes'), rellenando con NULL los campos de la tabla derecha ('pedidos') cuando no existe coincidencia. El filtro 'WHERE p.id IS NULL' aísla las tuplas huérfanas.",
      syntax: "SELECT c.cliente_id, c.nombre, c.apellido\nFROM clientes c\nLEFT JOIN pedidos p ON c.cliente_id = p.cliente_id\nWHERE p.pedido_id IS NULL;",
      key_points: [
        "Para evaluar valores nulos siempre se usa 'IS NULL' o 'IS NOT NULL', nunca '= NULL'.",
        "Es el patrón canónico para auditoría de integridad referencial y detección de inactividad."
],
      execution_order_note: "⚡ Orden de procesamiento: FROM (LEFT JOIN) → WHERE (filtra solo registros con clave foránea NULL) → SELECT.",
    },
    objectives: [
      "1. Realizar un LEFT JOIN de 'clientes c' hacia 'pedidos p' por 'cliente_id'.",
      "2. Filtrar únicamente las filas donde 'p.pedido_id IS NULL'.",
      "3. Proyectar 'cliente_id', 'nombre' y 'apellido'."
],
    sample_tables: [SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000013',
    module_id: 'b0000000-0000-0000-0000-000000000006',
    title: "Productos sin Movimiento de Venta",
    prompt: "Auditoría de catálogo necesita detectar productos que nunca han sido incluidos en ninguna orden de compra. Escribe una consulta que devuelva el producto_id y el nombre_producto de los artículos que no tienen ninguna línea registrada en detalle_pedidos.",
    initial_code: "-- Localiza productos sin ventas cruzando con detalle_pedidos\nSELECT ",
    solution_query: "SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN detalle_pedidos dp ON p.producto_id = dp.producto_id WHERE dp.detalle_id IS NULL;",
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: false,
    sort_order: 12,
    hints: [
      "Une productos p con detalle_pedidos dp mediante LEFT JOIN usando producto_id.",
      "Filtra las filas donde la clave foránea o primaria de la tabla derecha sea nula: WHERE dp.detalle_id IS NULL."
],
    concept: {
      summary: "El patrón Anti-Join mediante LEFT JOIN ... WHERE right.pk IS NULL permite encontrar registros huérfanos o entidades inactivas con un rendimiento óptimo en motores relacionales.",
      syntax: "SELECT p.producto_id, p.nombre_producto\nFROM productos p\nLEFT JOIN detalle_pedidos dp ON p.producto_id = dp.producto_id\nWHERE dp.detalle_id IS NULL;",
      key_points: [
        "Preserva todos los productos de la tabla izquierda.",
        "Los productos sin ventas tendrán 'dp.detalle_id' con valor NULL."
],
      execution_order_note: "⚡ Orden de procesamiento: FROM (LEFT JOIN) → WHERE (dp.detalle_id IS NULL) → SELECT.",
    },
    objectives: [
      "1. Realizar LEFT JOIN entre 'productos p' y 'detalle_pedidos dp'.",
      "2. Filtrar con 'WHERE dp.detalle_id IS NULL'.",
      "3. Proyectar 'producto_id' y 'nombre_producto'."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_DETALLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000014',
    module_id: 'b0000000-0000-0000-0000-000000000007',
    title: "Desglose Completo de Líneas de Pedido",
    prompt: "Operaciones necesita auditar las transacciones vinculando todas sus dimensiones relacionales. Escribe una consulta que conecte pedidos, clientes, detalle_pedidos, productos y categorias, y devuelva pedido_id, el nombre del cliente bajo el alias cliente_nombre, nombre_producto, nombre_categoria, cantidad y precio_unitario. Ordena los resultados por pedido_id ASC y nombre_producto ASC, limitando a 10 registros.",
    initial_code: "-- Conecta en cascada pedidos, clientes, detalle, productos y categorias\nSELECT ",
    solution_query: "SELECT p.pedido_id, c.nombre AS cliente_nombre, pr.nombre_producto, cat.nombre_categoria, dp.cantidad, dp.precio_unitario FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id INNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id INNER JOIN productos pr ON dp.producto_id = pr.producto_id INNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id ORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10;",
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 13,
    hints: [
      "Encadena 4 cláusulas INNER JOIN siguiendo las claves foráneas correspondientes.",
      "Usa alias de tabla concisos: p, c, dp, pr, cat.",
      "Añade ORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10; al final."
],
    concept: {
      summary: "Las consultas multi-tabla permiten recorrer esquemas en estrella o copo de nieve conectando tablas de hechos (como pedidos y detalle_pedidos) con tablas de dimensiones (clientes, productos, categorías).",
      syntax: "SELECT p.pedido_id, c.nombre AS cliente_nombre, pr.nombre_producto, cat.nombre_categoria, dp.cantidad, dp.precio_unitario\nFROM pedidos p\nINNER JOIN clientes c ON p.cliente_id = c.cliente_id\nINNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id\nINNER JOIN productos pr ON dp.producto_id = pr.producto_id\nINNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id\nORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10;",
      key_points: [
        "Cada JOIN agrega una dimensión al árbol de relaciones relacional.",
        "El optimizador de PostgreSQL reordena los joins basándose en estadísticas de cardinalidad."
],
      execution_order_note: "⚡ Se evalúan todos los joins dentro de FROM construyendo el producto cartesiano restringido.",
    },
    objectives: [
      "1. Conectar las 5 tablas con 4 INNER JOINs correctos.",
      "2. Proyectar las 6 columnas especificadas con el alias 'cliente_nombre'.",
      "3. Aplicar 'ORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10'."
],
    sample_tables: [SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_DETALLE_PEDIDOS, SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000015',
    module_id: 'c0000000-0000-0000-0000-000000000008',
    title: "Productos sobre el Promedio de Precio",
    prompt: "Estrategia de precios necesita listar los productos que se venden por encima de la media del catálogo completo. Escribe una consulta que devuelva el nombre_producto y su precio para aquellos artículos cuyo precio sea estrictamente superior al promedio global de precios de la tabla productos. Ordena por precio de mayor a menor.",
    initial_code: "-- Usa una subconsulta para comparar con el promedio global\nSELECT ",
    solution_query: "SELECT nombre_producto, precio FROM productos WHERE precio > (SELECT AVG(precio) FROM productos) ORDER BY precio DESC;",
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 14,
    hints: [
      "En la cláusula WHERE, escribe precio > (SELECT AVG(precio) FROM productos).",
      "No olvides ordenar con ORDER BY precio DESC."
],
    concept: {
      summary: "Una subconsulta escalar retorna un único valor (una fila, una columna) que puede utilizarse en cualquier lugar donde se admita un literal o expresión, como operandos en condiciones WHERE.",
      syntax: "SELECT columna_1, columna_2\nFROM tabla\nWHERE columna > (SELECT AVG(columna) FROM tabla)\nORDER BY columna DESC;",
      key_points: [
        "La subconsulta se ejecuta primero y su valor resultante se compara contra cada tupla externa.",
        "Permite filtros dinámicos que no dependen de constantes hardcodeadas."
],
      execution_order_note: "⚡ PostgreSQL calcula la subconsulta una sola vez (o la optimiza como constante) antes de evaluar el filtro WHERE.",
    },
    objectives: [
      "1. Calcular el promedio de precio en una subconsulta escalar con AVG(precio).",
      "2. Filtrar en WHERE con 'precio > (subconsulta)'.",
      "3. Ordenar por 'precio DESC'."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000016',
    module_id: 'c0000000-0000-0000-0000-000000000009',
    title: "Segmentación de Pedidos por Monto",
    prompt: "Finanzas desea clasificar los pedidos según su cuantía para priorizar la logística. Escribe una consulta que devuelva el pedido_id, el total del pedido y una columna llamada segmento calculada de la siguiente forma: si total >= 1000 asigna 'Alto Valor', si total >= 300 asigna 'Medio Valor', y en cualquier otro caso 'Bajo Valor'. Ordena por total descendente.",
    initial_code: "-- Clasifica los pedidos en tres segmentos según su monto\nSELECT ",
    solution_query: "SELECT pedido_id, total, CASE WHEN total >= 1000 THEN 'Alto Valor' WHEN total >= 300 THEN 'Medio Valor' ELSE 'Bajo Valor' END AS segmento FROM pedidos ORDER BY total DESC;",
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 15,
    hints: [
      "Usa la sintaxis: CASE WHEN condicion1 THEN valor1 WHEN condicion2 THEN valor2 ELSE valor_defecto END AS segmento.",
      "Recuerda ordenar con ORDER BY total DESC."
],
    concept: {
      summary: "La expresión CASE permite incorporar bifurcaciones condicionales 'if-then-else' directamente dentro de una consulta SQL, categorizando tuplas dinámicamente sin alterar la base de datos.",
      syntax: "SELECT col1, col2,\n       CASE\n         WHEN valor >= lim1 THEN 'Cat A'\n         WHEN valor >= lim2 THEN 'Cat B'\n         ELSE 'Cat C'\n       END AS clasificacion\nFROM tabla;",
      key_points: [
        "Las ramas WHEN se evalúan en orden secuencial; la primera que cumple detiene la evaluación.",
        "La cláusula ELSE es opcional pero recomendada para evitar valores nulos inesperados."
],
      execution_order_note: "⚡ CASE se evalúa para cada fila durante la fase de proyección SELECT.",
    },
    objectives: [
      "1. Proyectar 'pedido_id' y 'total'.",
      "2. Construir la expresión CASE con las condiciones >= 1000, >= 300 y ELSE.",
      "3. Nombrar la columna resultante como 'segmento' y ordenar por 'total DESC'."
],
    sample_tables: [SAMPLE_TABLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000017',
    module_id: 'c0000000-0000-0000-0000-000000000010',
    title: "Facturación por Categoría mediante CTE",
    prompt: "Para la junta directiva, prepara un informe de facturación por categoría usando una Common Table Expression (CTE). Define una expresión WITH llamada ventas_por_categoria que sume (cantidad * precio_unitario) agrupando por el nombre_categoria, y luego selecciona nombre_categoria y facturacion ordenados de mayor a menor facturación.",
    initial_code: "-- Estructura la consulta analítica usando WITH ... AS\nWITH ",
    solution_query: "WITH ventas_por_categoria AS (SELECT c.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS facturacion FROM categorias c INNER JOIN productos pr ON c.categoria_id = pr.categoria_id INNER JOIN detalle_pedidos dp ON pr.producto_id = dp.producto_id GROUP BY c.nombre_categoria) SELECT nombre_categoria, facturacion FROM ventas_por_categoria ORDER BY facturacion DESC;",
    xp_reward: 60,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 16,
    hints: [
      "Inicia con WITH ventas_por_categoria AS ( ... )",
      "Dentro del CTE, cruza categorias, productos y detalle_pedidos y agrupa por c.nombre_categoria.",
      "En la consulta principal, haz SELECT nombre_categoria, facturacion FROM ventas_por_categoria ORDER BY facturacion DESC;"
],
    concept: {
      summary: "Las Common Table Expressions (CTEs) crean tablas de resultados temporales nombradas dentro del alcance de una única consulta, mejorando drásticamente la legibilidad y modularidad de queries complejas.",
      syntax: "WITH nombre_cte AS (\n    SELECT clave, SUM(monto) AS total\n    FROM tabla\n    GROUP BY clave\n)\nSELECT clave, total\nFROM nombre_cte\nORDER BY total DESC;",
      key_points: [
        "Reemplazan subconsultas anidadas difíciles de leer por pasos analíticos secuenciales.",
        "En PostgreSQL moderno, los CTEs pueden ser optimizados e inlined de forma transparente."
],
      execution_order_note: "⚡ El CTE se evalúa y su conjunto intermedio queda disponible para la consulta principal que le sigue.",
    },
    objectives: [
      "1. Declarar 'WITH ventas_por_categoria AS (...)' con la agregación de facturación.",
      "2. Cruzar 'categorias', 'productos' y 'detalle_pedidos' agrupando por 'nombre_categoria'.",
      "3. Consumir el CTE en la consulta final ordenando por 'facturacion DESC'."
],
    sample_tables: [SAMPLE_TABLE_CATEGORIAS, SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_DETALLE_PEDIDOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000007',
    module_id: 'c0000000-0000-0000-0000-000000000011',
    title: "Ranking de Productos por Precio (ROW_NUMBER)",
    prompt: "El área de pricing desea clasificar los productos del más caro al más económico. Devuelve el producto_id, nombre_producto, precio y una columna llamada ranking con la posición de cada producto del más caro al más barato.",
    initial_code: "-- Emplea ROW_NUMBER() OVER (...)\nSELECT ",
    solution_query: "SELECT producto_id, nombre_producto, precio, ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking FROM productos;",
    xp_reward: 55,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 17,
    hints: [
      "Usa la función ventana ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking."
],
    concept: {
      summary: "Las funciones ventana (Window Functions) realizan cálculos a través de particiones de tuplas sin colapsar el resultado en una sola fila. ROW_NUMBER() numera secuencialmente cada registro según la cláusula OVER (ORDER BY ...).",
      syntax: "SELECT producto_id, nombre_producto, precio,\n       ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking\nFROM productos;",
      key_points: [
        "La cláusula OVER() determina el marco de la ventana analítica.",
        "Permite calcular clasificaciones, acumulados y diferencias entre filas consecutivas."
],
      execution_order_note: "⚡ Las funciones ventana se evalúan después de WHERE, GROUP BY y HAVING, pero antes del ORDER BY de salida final.",
    },
    objectives: [
      "1. Proyectar 'producto_id', 'nombre_producto' y 'precio'.",
      "2. Utilizar 'ROW_NUMBER() OVER (ORDER BY precio DESC)' con alias 'ranking'.",
      "3. Comprobar que el producto más costoso ocupe la posición 1."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000018',
    module_id: 'c0000000-0000-0000-0000-000000000011',
    title: "Ranking Relativo por Categoría (DENSE_RANK)",
    prompt: "Análisis de surtido necesita clasificar los artículos dentro de cada categoría según su precio. Escribe una consulta que devuelva categoria_id, nombre_producto, precio y una columna analítica llamada ranking_categoria usando DENSE_RANK() con partición por categoria_id y orden descendente de precio. Ordena el resultado final por categoria_id ASC y ranking_categoria ASC.",
    initial_code: "-- Usa DENSE_RANK() particionado por categoria_id\nSELECT ",
    solution_query: "SELECT categoria_id, nombre_producto, precio, DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria FROM productos ORDER BY categoria_id ASC, ranking_categoria ASC;",
    xp_reward: 65,
    difficulty: 'Intermedio',
    check_order: true,
    sort_order: 18,
    hints: [
      "Usa DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria.",
      "Ordena al final por categoria_id ASC, ranking_categoria ASC."
],
    concept: {
      summary: "La cláusula PARTITION BY dentro de OVER() divide las tuplas en particiones independientes antes de aplicar la función de ventana. A diferencia de ROW_NUMBER(), DENSE_RANK() asigna el mismo rango a valores iguales sin dejar huecos en la numeración.",
      syntax: "SELECT categoria_id, nombre_producto, precio,\n       DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria\nFROM productos\nORDER BY categoria_id ASC, ranking_categoria ASC;",
      key_points: [
        "PARTITION BY restablece el cálculo analítico para cada categoría de producto de forma aislada.",
        "DENSE_RANK() maneja empates elegantemente (1, 2, 2, 3...) sin saltar posiciones numéricas."
],
      execution_order_note: "⚡ Se particionan los datos en memoria antes de evaluar la ordenación interna de la ventana.",
    },
    objectives: [
      "1. Proyectar 'categoria_id', 'nombre_producto' y 'precio'.",
      "2. Construir 'DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC)' con alias 'ranking_categoria'.",
      "3. Ordenar la salida final por 'categoria_id ASC, ranking_categoria ASC'."
],
    sample_tables: [SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
  }
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
    total_exercises: 8,
    completed_exercises: 0,
    modules: [
      {
        id: 'a0000000-0000-0000-0000-000000000001',
        track_id: 'sql-foundations',
        title: 'SELECT & Proyecciones de Datos',
        slug: 'select-proyecciones',
        description: 'Aprende a solicitar columnas específicas y utilizar alias y cálculos aritméticos limpios.',
        sort_order: 1,
        exercises_count: 2,
        completed_count: 0,
      },
      {
        id: 'a0000000-0000-0000-0000-000000000002',
        track_id: 'sql-foundations',
        title: 'Filtrado con WHERE y Operadores Lógicos',
        slug: 'filtrado-where',
        description: 'Aplica filtros condicionales exactos mediante operadores de comparación y rangos con BETWEEN.',
        sort_order: 2,
        exercises_count: 2,
        completed_count: 0,
      },
      {
        id: 'a0000000-0000-0000-0000-000000000003',
        track_id: 'sql-foundations',
        title: 'Ordenamiento y Paginación',
        slug: 'ordenamiento-paginacion',
        description: 'Ordena resultados con ORDER BY (ASC/DESC) y limita registros devueltos con LIMIT.',
        sort_order: 3,
        exercises_count: 2,
        completed_count: 0,
      },
      {
        id: 'a0000000-0000-0000-0000-000000000004',
        track_id: 'sql-foundations',
        title: 'Agregación y Agrupamiento',
        slug: 'agregacion-agrupamiento',
        description: 'Resume datos con COUNT, SUM, AVG y filtra agrupaciones agregadas con HAVING.',
        sort_order: 4,
        exercises_count: 2,
        completed_count: 0,
      },
    ],
  },
  {
    id: 'relational-sql',
    title: 'Relational SQL',
    slug: 'relational-sql',
    description:
      'Domina el cruce de tablas relacionales. Claves foráneas, uniones con INNER JOIN, agregación relacional, detección de ausencias con LEFT JOIN y queries multi-tabla.',
    badge_name: 'Join Master',
    color_accent: '#818CF8',
    sort_order: 2,
    total_exercises: 5,
    completed_exercises: 0,
    modules: [
      {
        id: 'b0000000-0000-0000-0000-000000000005',
        track_id: 'relational-sql',
        title: 'Uniones Fundamentales (INNER JOIN)',
        slug: 'inner-join',
        description: 'Cruza tablas relacionales mediante claves foráneas y calcula agregaciones por entidad cruzada.',
        sort_order: 5,
        exercises_count: 2,
        completed_count: 0,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000006',
        track_id: 'relational-sql',
        title: 'Detección de Ausencias (LEFT JOIN & NULL)',
        slug: 'left-join-null',
        description: 'Identifica registros huérfanos o entidades sin actividad asociada mediante LEFT JOIN e IS NULL.',
        sort_order: 6,
        exercises_count: 2,
        completed_count: 0,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000007',
        track_id: 'relational-sql',
        title: 'Consultas Multi-Tabla en Cascada',
        slug: 'multi-tabla',
        description: 'Conecta 3 o más tablas para análisis integral del negocio en cascada relacional.',
        sort_order: 7,
        exercises_count: 1,
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
    total_exercises: 5,
    completed_exercises: 0,
    modules: [
      {
        id: 'c0000000-0000-0000-0000-000000000008',
        track_id: 'advanced-queries',
        title: 'Subconsultas Analíticas',
        slug: 'subconsultas',
        description: 'Integra subconsultas en cláusulas WHERE y proyecciones escalares.',
        sort_order: 8,
        exercises_count: 1,
        completed_count: 0,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000009',
        track_id: 'advanced-queries',
        title: 'Expresiones Condicionales (CASE)',
        slug: 'case-when',
        description: 'Transforma y categoriza métricas en vuelo con lógica condicional.',
        sort_order: 9,
        exercises_count: 1,
        completed_count: 0,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000010',
        track_id: 'advanced-queries',
        title: 'Common Table Expressions (CTEs)',
        slug: 'ctes-with',
        description: 'Estructura consultas analíticas complejas y legibles con la cláusula WITH.',
        sort_order: 10,
        exercises_count: 1,
        completed_count: 0,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000011',
        track_id: 'advanced-queries',
        title: 'Funciones de Ventana (Window Functions)',
        slug: 'window-functions',
        description: 'Aplica cálculos de partición y ranking sin colapsar las filas devueltas (ROW_NUMBER, DENSE_RANK).',
        sort_order: 11,
        exercises_count: 2,
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
