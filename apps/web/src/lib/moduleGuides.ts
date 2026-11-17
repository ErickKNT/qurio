import { SqlTransformDiagramData } from '@/components/molecules/SqlTransformDiagram/SqlTransformDiagram';

export interface WorkedExample {
  title: string;
  sql: string;
  explanation: string;
}

export interface ModuleGuide {
  moduleId: string;
  moduleNumber: number;
  title: string;
  trackTitle: string;
  summary: string;
  executionOrder: string;
  transformDiagram: SqlTransformDiagramData;
  workedExamples: WorkedExample[];
  commonMistakes: string[];
  productionTip: string;
}

export const MODULE_GUIDES: ModuleGuide[] = [
  {
    moduleId: 'a0000000-0000-0000-0000-000000000001',
    moduleNumber: 1,
    title: 'Proyecciones y Expresiones',
    trackTitle: '1. Fundamentos de SQL',
    summary:
      'Aprenderás a elegir exactamente qué columnas mostrar con SELECT, renombrar encabezados con AS, calcular expresiones al vuelo (aritmética, ROUND, concatenación ||) y eliminar valores duplicados con DISTINCT.',
    executionOrder: 'FROM (ubica la tabla) → SELECT (calcula expresiones y proyecta columnas) → DISTINCT (descarta filas repetidas)',
    transformDiagram: {
      title: 'Proyección selectiva y cálculo al vuelo',
      clauseBadge: 'SELECT · AS · DISTINCT',
      inputs: [
        {
          title: 'articulos',
          accent: 'indigo',
          columns: ['id', 'titulo', 'precio', 'iva_pct'],
          rows: [
            [1, 'Monitor 24"', 200.0, 0.21],
            [2, 'Teclado', 50.0, 0.21],
          ],
        },
      ],
      operationLabel: 'SELECT titulo, ROUND(precio * 1.21, 2) AS total',
      output: {
        title: 'Resultado proyectado',
        accent: 'emerald',
        columns: ['titulo', 'total'],
        rows: [
          ['Monitor 24"', 242.0],
          ['Teclado', 60.5],
        ],
      },
      caption: 'Las columnas calculadas con AS no modifican la tabla original; existen únicamente en el conjunto devuelto.',
    },
    workedExamples: [
      {
        title: 'Cálculo con redondeo y alias claro',
        sql: "SELECT titulo,\n       ROUND(precio * 0.90, 2) AS precio_descuento\nFROM articulos;",
        explanation: 'Aplica un 10% de descuento al vuelo, redondea a 2 decimales con ROUND() y nombra la columna resultante.',
      },
      {
        title: 'Concatenación de texto y valores únicos',
        sql: "SELECT DISTINCT ciudad || ', ' || pais AS ubicacion\nFROM sucursales;",
        explanation: 'El operador || une textos literales entre comillas simples y DISTINCT colapsa ubicaciones repetidas.',
      },
    ],
    commonMistakes: [
      'Usar comillas dobles ("texto") para cadenas literales en lugar de comillas simples (\'texto\'). En PostgreSQL, las comillas dobles representan identificadores de columnas o tablas.',
      'Olvidar que concatenar un valor NULL con || convierte toda la cadena resultante en NULL.',
    ],
    productionTip:
      'Evita SELECT * en consultas de producción: proyectar solo las columnas necesarias reduce tráfico de red, memoria y permite aprovechar índices de cobertura.',
  },
  {
    moduleId: 'a0000000-0000-0000-0000-000000000002',
    moduleNumber: 2,
    title: 'Filtrado Lógico',
    trackTitle: '1. Fundamentos de SQL',
    summary:
      'Filtrarás registros específicos mediante WHERE combinando operadores de comparación (=, <>, >, <, >=, <=), lógica booleana (AND, OR, NOT), rangos con BETWEEN, listas con IN, patrones con LIKE/ILIKE y detección de nulos con IS NULL.',
    executionOrder: 'FROM → WHERE (evalúa condición fila por fila) → SELECT',
    transformDiagram: {
      title: 'Filtrado de filas por condición booleana',
      clauseBadge: 'WHERE · BETWEEN · IN · LIKE',
      inputs: [
        {
          title: 'envios',
          accent: 'indigo',
          columns: ['envio_id', 'pais', 'costo', 'entregado'],
          rows: [
            [10, 'España', 12.0, 'si'],
            [11, 'Francia', 45.0, 'no'],
            [12, 'España', 8.5, 'si'],
          ],
        },
      ],
      operationLabel: "WHERE pais = 'España' AND costo <= 15",
      output: {
        title: 'Filas que cumplen',
        accent: 'emerald',
        columns: ['envio_id', 'pais', 'costo'],
        rows: [
          [10, 'España', 12.0],
          [12, 'España', 8.5],
        ],
      },
      caption: 'WHERE descarta las filas que devuelven FALSE o UNKNOWN (NULL) antes de construir las columnas del SELECT.',
    },
    workedExamples: [
      {
        title: 'Precedencia de AND sobre OR con paréntesis',
        sql: "SELECT nombre, departamento, salario\nFROM empleados\nWHERE (departamento = 'Datos' OR departamento = 'Backend')\n  AND salario >= 3000;",
        explanation: 'AND tiene mayor precedencia que OR; usar paréntesis garantiza que el filtro de salario aplique a ambos departamentos.',
      },
      {
        title: 'Rangos inclusivos y patrones de texto',
        sql: "SELECT codigo, fecha_alta\nFROM cupones\nWHERE fecha_alta BETWEEN '2024-01-01' AND '2024-06-30'\n  AND codigo LIKE 'PROMO_%';",
        explanation: 'BETWEEN incluye ambos extremos y LIKE usa % para cero o más caracteres.',
      },
    ],
    commonMistakes: [
      'Escribir WHERE columna = NULL en lugar de WHERE columna IS NULL. En lógica de tres valores, cualquier comparación con = NULL devuelve UNKNOWN, nunca TRUE.',
      'Mezclar AND y OR sin paréntesis y obtener filas inesperadas por prioridad de operadores.',
    ],
    productionTip:
      'En PostgreSQL, LIKE distingue mayúsculas de minúsculas; si buscas texto ingresado por usuarios sin importar mayúsculas, usa ILIKE o normaliza con LOWER().',
  },
  {
    moduleId: 'a0000000-0000-0000-0000-000000000003',
    moduleNumber: 3,
    title: 'Ordenamiento y Paginación',
    trackTitle: '1. Fundamentos de SQL',
    summary:
      'Controlarás el orden determinista de salida con ORDER BY (ASC/DESC), aprenderás a desempatar empates mediante múltiples criterios y paginarás resultados con LIMIT y OFFSET.',
    executionOrder: 'FROM → WHERE → SELECT → ORDER BY → LIMIT / OFFSET',
    transformDiagram: {
      title: 'Ordenamiento descendente con desempate y límite',
      clauseBadge: 'ORDER BY · LIMIT · OFFSET',
      inputs: [
        {
          title: 'puntajes',
          accent: 'indigo',
          columns: ['usuario_id', 'puntos'],
          rows: [
            [1, 80],
            [2, 95],
            [3, 95],
          ],
        },
      ],
      operationLabel: 'ORDER BY puntos DESC, usuario_id ASC LIMIT 2',
      output: {
        title: 'Top 2 determinista',
        accent: 'emerald',
        columns: ['usuario_id', 'puntos'],
        rows: [
          [2, 95],
          [3, 95],
        ],
      },
      caption: 'Agregar un criterio único de desempate (usuario_id ASC) evita que el motor devuelva filas distintas entre ejecuciones.',
    },
    workedExamples: [
      {
        title: 'Paginación por bloques (Página 2 de 5 registros)',
        sql: "SELECT ticket_id, prioridad, creado_en\nFROM soporte\nORDER BY prioridad DESC, ticket_id ASC\nLIMIT 5 OFFSET 5;",
        explanation: 'OFFSET 5 salta los primeros 5 resultados ya ordenados y LIMIT 5 devuelve los siguientes 5.',
      },
    ],
    commonMistakes: [
      'Usar LIMIT sin ORDER BY: las tablas relacionales son conjuntos sin orden garantizado.',
      'Ordenar por una columna con empates sin añadir una clave primaria como desempate secundario.',
    ],
    productionTip:
      'Para tablas grandes en producción, combina ORDER BY con índices en la columna de ordenamiento; para paginación profunda prefiere keyset pagination (WHERE id > ultimo_id) sobre OFFSET altos.',
  },
  {
    moduleId: 'a0000000-0000-0000-0000-000000000004',
    moduleNumber: 4,
    title: 'Agregación y Agrupación',
    trackTitle: '1. Fundamentos de SQL',
    summary:
      'Resumirás conjuntos completos o grupos lógicos con COUNT, SUM, AVG, MIN y MAX, consolidarás filas mediante GROUP BY y aplicarás filtros posteriores sobre métricas agregadas usando HAVING.',
    executionOrder: 'FROM → WHERE (filtra filas) → GROUP BY (forma grupos) → Agregaciones → HAVING (filtra grupos) → SELECT → ORDER BY',
    transformDiagram: {
      title: 'Colapso de filas en grupos y filtro HAVING',
      clauseBadge: 'GROUP BY · HAVING · COUNT · SUM',
      inputs: [
        {
          title: 'ventas',
          accent: 'indigo',
          columns: ['region', 'monto'],
          rows: [
            ['Norte', 100],
            ['Norte', 150],
            ['Sur', 40],
          ],
        },
      ],
      operationLabel: 'GROUP BY region HAVING SUM(monto) > 100',
      output: {
        title: 'Grupos que superan umbral',
        accent: 'emerald',
        columns: ['region', 'total'],
        rows: [['Norte', 250]],
      },
      caption: 'WHERE filtra filas individuales antes de agrupar; HAVING filtra grupos completos después de calcular SUM/COUNT.',
    },
    workedExamples: [
      {
        title: 'Conteo y promedio por categoría filtrando con HAVING',
        sql: "SELECT categoria,\n       COUNT(*) AS total_items,\n       ROUND(AVG(importe), 2) AS promedio\nFROM movimientos\nWHERE estado = 'valido'\nGROUP BY categoria\nHAVING COUNT(*) >= 3;",
        explanation: 'Primero WHERE descarta movimientos inválidos, luego GROUP BY agrupa por categoría y finalmente HAVING conserva solo grupos con al menos 3 registros.',
      },
    ],
    commonMistakes: [
      'Intentar filtrar una función agregada dentro de WHERE (ej. WHERE COUNT(*) > 2), lo cual produce error de sintaxis/ejecución en PostgreSQL.',
      'Incluir una columna en el SELECT que no está ni dentro de una función agregada ni listada en GROUP BY.',
    ],
    productionTip:
      'Recuerda la diferencia entre COUNT(*) (cuenta todas las filas, incluyendo nulos) y COUNT(columna) (ignora los NULL de esa columna).',
  },
  {
    moduleId: 'b0000000-0000-0000-0000-000000000005',
    moduleNumber: 5,
    title: 'Uniones Base (INNER JOIN)',
    trackTitle: '2. SQL Relacional',
    summary:
      'Cruzarás información normalizada entre dos tablas relacionadas mediante claves primarias y foráneas usando INNER JOIN ... ON y alias de tabla para mantener consultas limpias.',
    executionOrder: 'FROM tabla_a → INNER JOIN tabla_b ON condición → WHERE → SELECT',
    transformDiagram: {
      title: 'Intersección por clave foránea',
      clauseBadge: 'INNER JOIN · ON',
      inputs: [
        {
          title: 'autores',
          accent: 'indigo',
          columns: ['autor_id', 'nombre'],
          rows: [
            [1, 'Ada'],
            [2, 'Alan'],
          ],
        },
        {
          title: 'libros',
          accent: 'cyan',
          columns: ['libro_id', 'autor_id', 'titulo'],
          rows: [[10, 1, 'Notas analíticas']],
        },
      ],
      operationLabel: 'INNER JOIN libros ON autores.autor_id = libros.autor_id',
      output: {
        title: 'Coincidencias exactas',
        accent: 'emerald',
        columns: ['nombre', 'titulo'],
        rows: [['Ada', 'Notas analíticas']],
      },
      caption: 'Alan no tiene libros asociados, por lo que queda excluido en un INNER JOIN.',
    },
    workedExamples: [
      {
        title: 'Unión explícita con alias de tabla',
        sql: "SELECT e.nombre, d.nombre_depto\nFROM empleados e\nINNER JOIN departamentos d ON e.depto_id = d.depto_id;",
        explanation: 'Calificar las columnas con alias (e., d.) evita errores de ambigüedad cuando ambas tablas tienen columnas con igual nombre.',
      },
    ],
    commonMistakes: [
      'Omitir la cláusula ON o unir por columnas que no corresponden (producto cartesiano accidental).',
      'Referenciar una columna existente en ambas tablas sin prefijo de alias (column reference is ambiguous).',
    ],
    productionTip:
      'Usa siempre la sintaxis explícita JOIN ... ON en lugar de listar tablas separadas por coma en FROM; hace evidente la condición de unión y evita cruces cartesianos accidentales.',
  },
  {
    moduleId: 'b0000000-0000-0000-0000-000000000006',
    moduleNumber: 6,
    title: 'Ausencias y Ceros (LEFT JOIN & COALESCE)',
    trackTitle: '2. SQL Relacional',
    summary:
      'Conservarás todas las entidades de la tabla principal aunque no tengan registros relacionados usando LEFT JOIN, detectarás registros huérfanos con IS NULL y sustituirás nulos por ceros o textos legibles con COALESCE.',
    executionOrder: 'FROM tabla_izq → LEFT JOIN tabla_der ON condición (rellena con NULL si no hay match) → WHERE → SELECT',
    transformDiagram: {
      title: 'Preservación izquierda y detección de ausencias',
      clauseBadge: 'LEFT JOIN · IS NULL · COALESCE',
      inputs: [
        {
          title: 'cursos',
          accent: 'indigo',
          columns: ['curso_id', 'nombre'],
          rows: [
            [1, 'SQL'],
            [2, 'Python'],
          ],
        },
        {
          title: 'inscripciones',
          accent: 'cyan',
          columns: ['curso_id', 'alumno_id'],
          rows: [[1, 99]],
        },
      ],
      operationLabel: 'LEFT JOIN inscripciones ON ...',
      output: {
        title: 'Cursos sin alumnos preservados',
        accent: 'emerald',
        columns: ['nombre', 'alumno_id'],
        rows: [
          ['SQL', 99],
          ['Python', null],
        ],
      },
      caption: 'Las filas sin coincidencia en la tabla derecha aparecen con NULL; si luego agregas, usa COALESCE(..., 0) o COUNT(col_der).',
    },
    workedExamples: [
      {
        title: 'Encontrar entidades sin actividad relacionada',
        sql: "SELECT u.usuario_id, u.email\nFROM usuarios u\nLEFT JOIN sesiones s ON u.usuario_id = s.usuario_id\nWHERE s.sesion_id IS NULL;",
        explanation: 'Conserva todos los usuarios y filtra aquellos cuya clave en la tabla derecha resultó NULL.',
      },
    ],
    commonMistakes: [
      'Colocar un filtro de la tabla derecha en WHERE (ej. WHERE s.estado = \'activa\') tras un LEFT JOIN: eso descarta los NULL y convierte el LEFT JOIN en un INNER JOIN encubierto. El filtro de la tabla opcional debe ir dentro del ON.',
      'Usar COUNT(*) tras un LEFT JOIN: COUNT(*) cuenta la fila con NULL como 1; usa COUNT(tabla_der.id) para obtener 0 cuando no hay coincidencias.',
    ],
    productionTip:
      'Para métricas financieras o inventarios, envuelve los resultados de SUM() sobre tablas unidas por la izquierda con COALESCE(SUM(monto), 0) para no devolver NULL en reportes.',
  },
  {
    moduleId: 'b0000000-0000-0000-0000-000000000007',
    moduleNumber: 7,
    title: 'Cadenas Multi-Tabla',
    trackTitle: '2. SQL Relacional',
    summary:
      'Encadenarás de 3 a 5 tablas siguiendo la ruta de claves foráneas en cascada (por ejemplo, entidad raíz → cabecera → detalle → catálogo) vigilando la cardinalidad para evitar inflar sumatorias.',
    executionOrder: 'FROM A → JOIN B ON A=B → JOIN C ON B=C → JOIN D ON C=D → GROUP BY → SELECT',
    transformDiagram: {
      title: 'Navegación relacional en cascada (3+ tablas)',
      clauseBadge: 'MULTI-JOIN · CARDINALIDAD 1:N',
      inputs: [
        {
          title: 'orden (1) → detalle (N) → item (1)',
          accent: 'indigo',
          columns: ['tabla_a', 'clave_puente', 'tabla_c'],
          rows: [['orden #4', 'detalle #12', 'item Laptop']],
        },
      ],
      operationLabel: 'JOIN puente ON ... JOIN destino ON ...',
      output: {
        title: 'Vista consolidada',
        accent: 'emerald',
        columns: ['orden_id', 'item', 'subtotal'],
        rows: [[4, 'Laptop', 1299.99]],
      },
      caption: 'Apóyate en el Diagrama ER para trazar el camino exacto de claves sin duplicar filas de cabeceras.',
    },
    workedExamples: [
      {
        title: 'Encadenamiento seguro desde el detalle hacia las dimensiones',
        sql: "SELECT o.orden_id, c.nombre, p.titulo, d.cantidad\nFROM ordenes o\nINNER JOIN clientes c ON o.cliente_id = c.cliente_id\nINNER JOIN detalle d ON o.orden_id = d.orden_id\nINNER JOIN productos p ON d.producto_id = p.producto_id;",
        explanation: 'Cada JOIN avanza un eslabón válido del modelo ER conectando clave foránea con clave primaria.',
      },
    ],
    commonMistakes: [
      'Unir dos ramas 1:N independientes al mismo nivel (ej. detalle_pedidos y pagos directamente sobre pedidos sin agrupar primero), lo que multiplica las filas y duplica totales.',
    ],
    productionTip:
      'Si necesitas sumar valores que viven en dos ramas 1:N distintas de una misma entidad, agrega cada rama en una subconsulta o CTE por separado antes de unirlas.',
  },
  {
    moduleId: 'b0000000-0000-0000-0000-000000000008',
    moduleNumber: 8,
    title: 'Operadores de Conjuntos',
    trackTitle: '2. SQL Relacional',
    summary:
      'Combinarás verticalmente resultados de múltiples consultas con estructura compatible usando UNION (sin duplicados), UNION ALL (conservando todo), INTERSECT (elementos comunes) y EXCEPT (diferencia entre conjuntos).',
    executionOrder: 'Consulta A → [UNION | UNION ALL | INTERSECT | EXCEPT] → Consulta B → ORDER BY final',
    transformDiagram: {
      title: 'Álgebra de conjuntos entre dos consultas',
      clauseBadge: 'UNION · INTERSECT · EXCEPT',
      inputs: [
        {
          title: 'Conjunto A (enero)',
          accent: 'indigo',
          columns: ['ciudad'],
          rows: [['Madrid'], ['Lima']],
        },
        {
          title: 'Conjunto B (febrero)',
          accent: 'cyan',
          columns: ['ciudad'],
          rows: [['Lima'], ['Bogotá']],
        },
      ],
      operationLabel: 'EXCEPT (A - B)',
      output: {
        title: 'Solo en A, no en B',
        accent: 'emerald',
        columns: ['ciudad'],
        rows: [['Madrid']],
      },
      caption: 'Ambas consultas deben devolver exactamente el mismo número de columnas y tipos compatibles.',
    },
    workedExamples: [
      {
        title: 'Diferencia limpia con EXCEPT',
        sql: "SELECT email FROM suscriptores_web\nEXCEPT\nSELECT email FROM usuarios_baja;",
        explanation: 'Devuelve correos presentes en la primera consulta que no existen en la segunda.',
      },
    ],
    commonMistakes: [
      'Intentar unir consultas con distinta cantidad de columnas o tipos incompatibles (ej. texto con fecha).',
      'Poner ORDER BY antes del operador de conjunto en vez de colocarlo al final de toda la expresión.',
    ],
    productionTip:
      'Cuando sepas que no hay duplicados o necesites conservar cada fila sin costo extra de deduplicación, usa UNION ALL: es considerablemente más rápido que UNION.',
  },
  {
    moduleId: 'c0000000-0000-0000-0000-000000000009',
    moduleNumber: 9,
    title: 'Subconsultas',
    trackTitle: '3. Consultas Avanzadas',
    summary:
      'Anidarás consultas dentro de WHERE, SELECT o FROM usando subconsultas escalares (comparación contra un promedio o máximo global), listas con IN y pruebas de existencia eficientes con EXISTS / NOT EXISTS.',
    executionOrder: 'Subconsulta interna (independiente o correlacionada por fila externa) → Evaluación en consulta externa',
    transformDiagram: {
      title: 'Comparación dinámica contra umbral calculado',
      clauseBadge: 'Escalar · IN · EXISTS',
      inputs: [
        {
          title: 'salarios',
          accent: 'indigo',
          columns: ['id', 'sueldo'],
          rows: [
            [1, 1000],
            [2, 2000],
            [3, 3000],
          ],
        },
      ],
      operationLabel: 'WHERE sueldo > (SELECT AVG(sueldo) FROM salarios)',
      output: {
        title: 'Superan promedio (2000)',
        accent: 'emerald',
        columns: ['id', 'sueldo'],
        rows: [[3, 3000]],
      },
      caption: 'La subconsulta interna calcula 2000 dinámicamente sin escribir valores fijos a mano.',
    },
    workedExamples: [
      {
        title: 'Verificación de existencia segura ante NULLs con EXISTS',
        sql: "SELECT p.proyecto_id, p.nombre\nFROM proyectos p\nWHERE NOT EXISTS (\n  SELECT 1 FROM tareas t WHERE t.proyecto_id = p.proyecto_id\n);",
        explanation: 'NOT EXISTS no sufre la trampa de NOT IN cuando existen valores NULL en la subconsulta.',
      },
    ],
    commonMistakes: [
      'Usar NOT IN (SELECT col FROM ...) cuando la subconsulta puede contener un NULL: en SQL, cualquier comparación con NULL dentro de NOT IN hace que la consulta entera devuelva 0 filas.',
      'Devolver más de una fila en una subconsulta escalar usada con = o >.',
    ],
    productionTip:
      'Para comprobar si existen o no registros relacionados, prefiere EXISTS / NOT EXISTS: se detienen en la primera coincidencia y son inmunes a valores NULL.',
  },
  {
    moduleId: 'c0000000-0000-0000-0000-000000000010',
    moduleNumber: 10,
    title: 'Lógica Condicional (CASE WHEN)',
    trackTitle: '3. Consultas Avanzadas',
    summary:
      'Clasificarás registros dinámicamente con expresiones CASE WHEN ... THEN ... ELSE ... END y construirás tablas resumen (pivoteo condicional) combinando SUM(CASE WHEN ... THEN 1 ELSE 0 END) o FILTER en PostgreSQL.',
    executionOrder: 'Evalúa cada rama WHEN en orden estricto → retorna el primer THEN verdadero → cae en ELSE si ninguno aplica',
    transformDiagram: {
      title: 'Segmentación y pivoteo condicional',
      clauseBadge: 'CASE WHEN · PIVOTEO',
      inputs: [
        {
          title: 'envios',
          accent: 'indigo',
          columns: ['id', 'dias'],
          rows: [
            [1, 1],
            [2, 5],
          ],
        },
      ],
      operationLabel: "CASE WHEN dias <= 2 THEN 'Express' ELSE 'Estándar' END",
      output: {
        title: 'Etiqueta calculada',
        accent: 'emerald',
        columns: ['id', 'nivel'],
        rows: [
          [1, 'Express'],
          [2, 'Estándar'],
        ],
      },
      caption: 'El orden de los WHEN importa: coloca primero las condiciones más restrictivas.',
    },
    workedExamples: [
      {
        title: 'Conteo por estado en columnas separadas',
        sql: "SELECT COUNT(*) AS total,\n       SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) AS cerrados,\n       SUM(CASE WHEN estado = 'abierto' THEN 1 ELSE 0 END) AS abiertos\nFROM tickets;",
        explanation: 'Convierte valores de fila en columnas comparables dentro de un mismo resumen.',
      },
    ],
    commonMistakes: [
      'Olvidar la palabra clave END al cerrar el bloque CASE.',
      'Poner primero la condición más amplia (ej. WHEN precio > 100 antes que WHEN precio > 500), haciendo inalcanzables las ramas posteriores.',
    ],
    productionTip:
      'Si omites ELSE en un CASE, el motor devuelve NULL cuando ninguna condición coincide; escribe siempre un ELSE explícito para evitar nulos inesperados.',
  },
  {
    moduleId: 'c0000000-0000-0000-0000-000000000011',
    moduleNumber: 11,
    title: 'CTEs Modulares (WITH)',
    trackTitle: '3. Consultas Avanzadas',
    summary:
      'Dividirás consultas analíticas complejas en pasos legibles y reutilizables usando Common Table Expressions (WITH nombre AS (...)), encadenando agregaciones previas antes de unir o comparar contra promedios.',
    executionOrder: 'CTE 1 → CTE 2 (puede leer CTE 1) → Consulta SELECT principal',
    transformDiagram: {
      title: 'Descomposición modular en etapas',
      clauseBadge: 'WITH · CTEs ENCADENADAS',
      inputs: [
        {
          title: 'CTE paso_1 (resumen)',
          accent: 'indigo',
          columns: ['cliente_id', 'gasto'],
          rows: [
            [1, 500],
            [2, 120],
          ],
        },
      ],
      operationLabel: 'WITH resumen AS (...) SELECT * FROM resumen',
      output: {
        title: 'Consulta final limpia',
        accent: 'emerald',
        columns: ['cliente_id', 'gasto', 'tier'],
        rows: [[1, 500, 'VIP']],
      },
      caption: 'Las CTEs funcionan como tablas temporales nombradas únicamente durante la ejecución de esa consulta.',
    },
    workedExamples: [
      {
        title: 'Dos CTEs encadenadas separadas por coma',
        sql: "WITH totales_mes AS (\n  SELECT vendedor_id, SUM(venta) AS total_vendedor\n  FROM operaciones\n  GROUP BY vendedor_id\n),\npromedio_equipo AS (\n  SELECT AVG(total_vendedor) AS media FROM totales_mes\n)\nSELECT t.vendedor_id, t.total_vendedor\nFROM totales_mes t\nCROSS JOIN promedio_equipo p\nWHERE t.total_vendedor > p.media;",
        explanation: 'Observa que WITH se escribe una sola vez al inicio; las CTEs siguientes se separan por coma.',
      },
    ],
    commonMistakes: [
      'Repetir la palabra clave WITH antes de la segunda CTE (WITH cte1 AS (...), WITH cte2 AS (...)) en lugar de usar solo una coma.',
    ],
    productionTip:
      'En PostgreSQL 12+, las CTEs no materializadas se optimizan junto con la consulta principal; úsalas como estándar de legibilidad en reportes complejos.',
  },
  {
    moduleId: 'c0000000-0000-0000-0000-000000000012',
    moduleNumber: 12,
    title: 'Funciones de Ventana',
    trackTitle: '3. Consultas Avanzadas',
    summary:
      'Calcularás rankings (ROW_NUMBER, RANK, DENSE_RANK), acumulados (SUM() OVER) y comparaciones con filas anteriores o siguientes (LAG, LEAD) sin colapsar las filas originales de la tabla.',
    executionOrder: 'FROM → WHERE → GROUP BY → Funciones de Ventana (OVER) → SELECT → ORDER BY → LIMIT',
    transformDiagram: {
      title: 'Cálculo por ventana sin colapsar filas',
      clauseBadge: 'OVER · PARTITION BY · ROW_NUMBER · LAG',
      inputs: [
        {
          title: 'ventas_diarias',
          accent: 'indigo',
          columns: ['area', 'dia', 'monto'],
          rows: [
            ['A', '01', 100],
            ['A', '02', 140],
            ['B', '01', 90],
          ],
        },
      ],
      operationLabel: 'ROW_NUMBER() OVER (PARTITION BY area ORDER BY monto DESC)',
      output: {
        title: 'Cada fila conserva su detalle + ranking',
        accent: 'emerald',
        columns: ['area', 'monto', 'ranking'],
        rows: [
          ['A', 140, 1],
          ['A', 100, 2],
          ['B', 90, 1],
        ],
      },
      caption: 'A diferencia de GROUP BY, OVER() mantiene todas las filas individuales visibles mientras calcula métricas por partición.',
    },
    workedExamples: [
      {
        title: 'Top-N por grupo usando CTE + ROW_NUMBER()',
        sql: "WITH ranked AS (\n  SELECT area, empleado, sueldo,\n         ROW_NUMBER() OVER (PARTITION BY area ORDER BY sueldo DESC, id ASC) AS pos\n  FROM nomina\n)\nSELECT area, empleado, sueldo\nFROM ranked\nWHERE pos <= 2;",
        explanation: 'Como las funciones de ventana se evalúan después de WHERE, se envuelven en una CTE para filtrar luego por WHERE pos <= 2.',
      },
    ],
    commonMistakes: [
      'Intentar filtrar una función de ventana directamente en WHERE (WHERE ROW_NUMBER() OVER (...) = 1): PostgreSQL exige hacerlo en una consulta externa o CTE.',
      'Confundir ROW_NUMBER() (siempre 1,2,3 sin empates) con DENSE_RANK() (empates comparten número sin saltos: 1,1,2).',
    ],
    productionTip:
      'Combina PARTITION BY + ORDER BY en OVER() con un desempate único cuando uses ROW_NUMBER() o LAG() para que el resultado sea 100% reproducible.',
  },
];

export function getModuleGuide(moduleId: string): ModuleGuide | undefined {
  return MODULE_GUIDES.find((g) => g.moduleId === moduleId);
}
