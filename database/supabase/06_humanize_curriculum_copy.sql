-- ==============================================================================
-- Qurio: Actualización completa de textos humanizados en Supabase
-- Actualiza learning_paths, modules, exercises y exercise_hints
-- ==============================================================================

BEGIN;

-- 1. Rutas de aprendizaje
UPDATE public.learning_paths
SET title = 'Fundamentos de SQL',
    description = 'Aprende a consultar bases de datos desde cero: columnas con SELECT, cálculos, filtros con WHERE y fechas, ordenamiento y agregaciones.',
    badge_reward = 'Primera consulta'
WHERE id = 'sql-foundations';
UPDATE public.learning_paths
SET title = 'SQL relacional',
    description = 'Cruza tablas relacionadas usando llaves foráneas, INNER JOIN, LEFT JOIN con COALESCE, consultas de varias tablas y operaciones de conjunto.',
    badge_reward = 'Cruce de tablas'
WHERE id = 'relational-sql';
UPDATE public.learning_paths
SET title = 'Consultas avanzadas',
    description = 'Trabaja con subconsultas correlacionadas (EXISTS/NOT EXISTS), condiciones con CASE, consultas temporales con WITH (CTEs) y funciones de ventana.',
    badge_reward = 'Funciones de ventana'
WHERE id = 'advanced-queries';
UPDATE public.learning_paths
SET title = 'Ingeniería y manipulación de datos',
    description = 'Inserta, actualiza y borra datos en transacciones, crea y modifica tablas, y acelera consultas con INSERT, UPDATE, DELETE, RETURNING, CREATE/ALTER/DROP TABLE e índices B-Tree.',
    badge_reward = 'Diseño de esquemas'
WHERE id = 'data-manipulation-ddl';

-- 2. Módulos
UPDATE public.modules
SET title = 'SELECT y columnas calculadas',
    description = 'Elige columnas específicas, usa alias claros y haz cálculos aritméticos simples.'
WHERE id = 'a0000000-0000-0000-0000-000000000001';
UPDATE public.modules
SET title = 'Filtrado con WHERE y operadores lógicos',
    description = 'Filtra filas con operadores de comparación, patrones de texto, paréntesis, valores nulos (IS NULL), fechas y rangos con BETWEEN.'
WHERE id = 'a0000000-0000-0000-0000-000000000002';
UPDATE public.modules
SET title = 'Ordenamiento y paginación',
    description = 'Ordena resultados con ORDER BY (ASC/DESC) y limita las filas devueltas con LIMIT y OFFSET.'
WHERE id = 'a0000000-0000-0000-0000-000000000003';
UPDATE public.modules
SET title = 'Agregación y agrupamiento',
    description = 'Resume datos con COUNT, COUNT(DISTINCT), SUM, AVG, filtros previos con WHERE y filtros de grupos con HAVING.'
WHERE id = 'a0000000-0000-0000-0000-000000000004';
UPDATE public.modules
SET title = 'Uniones básicas (INNER JOIN)',
    description = 'Cruza tablas relacionadas con llaves foráneas antes de pasar a agregaciones entre varias tablas.'
WHERE id = 'b0000000-0000-0000-0000-000000000005';
UPDATE public.modules
SET title = 'Ausencias y ceros (LEFT JOIN y NULL)',
    description = 'Encuentra filas sin coincidencias o sin actividad usando LEFT JOIN, IS NULL y COALESCE.'
WHERE id = 'b0000000-0000-0000-0000-000000000006';
UPDATE public.modules
SET title = 'Consultas de varias tablas',
    description = 'Conecta 3 o más tablas para analizar información del negocio en cascada.'
WHERE id = 'b0000000-0000-0000-0000-000000000007';
UPDATE public.modules
SET title = 'Conjuntos y uniones especiales',
    description = 'Combina consultas con UNION, INTERSECT, EXCEPT, CROSS JOIN y uniones sobre la misma tabla (SELF JOIN).'
WHERE id = 'b0000000-0000-0000-0000-000000000008';
UPDATE public.modules
SET title = 'Subconsultas',
    description = 'Usa subconsultas escalares, listas IN y pruebas de existencia (EXISTS / NOT EXISTS) en WHERE.'
WHERE id = 'c0000000-0000-0000-0000-000000000009';
UPDATE public.modules
SET title = 'Expresiones condicionales (CASE)',
    description = 'Clasifica filas y calcula conteos condicionales sobre la marcha con CASE WHEN.'
WHERE id = 'c0000000-0000-0000-0000-000000000010';
UPDATE public.modules
SET title = 'Consultas temporales con WITH (CTEs)',
    description = 'Divide consultas largas en pasos claros y legibles con la cláusula WITH.'
WHERE id = 'c0000000-0000-0000-0000-000000000011';
UPDATE public.modules
SET title = 'Funciones de ventana',
    description = 'Calcula rankings, máximos por grupo, acumulados y comparaciones entre filas (ROW_NUMBER, DENSE_RANK, SUM OVER, LAG).'
WHERE id = 'c0000000-0000-0000-0000-000000000012';
UPDATE public.modules
SET title = 'Inserción de filas (INSERT)',
    description = 'Inserta filas individuales o por lotes, devuelve los datos guardados con RETURNING, copia filas con INSERT INTO ... SELECT y resuelve colisiones con ON CONFLICT (UPSERT).'
WHERE id = 'd0000000-0000-0000-0000-000000000013';
UPDATE public.modules
SET title = 'Actualización y borrado (UPDATE y DELETE)',
    description = 'Modifica y borra filas de forma segura usando UPDATE ... WHERE, RETURNING, cruces UPDATE ... FROM y DELETE.'
WHERE id = 'd0000000-0000-0000-0000-000000000014';
UPDATE public.modules
SET title = 'Creación y cambios de tablas (CREATE, ALTER y DROP)',
    description = 'Crea tablas con llaves primarias, foráneas y reglas CHECK, modifica columnas con ALTER TABLE y borra tablas con DROP TABLE CASCADE.'
WHERE id = 'd0000000-0000-0000-0000-000000000015';
UPDATE public.modules
SET title = 'Índices y rendimiento (CREATE INDEX)',
    description = 'Crea índices B-Tree simples, índices únicos compuestos, índices parciales con WHERE y elimina índices con DROP INDEX.'
WHERE id = 'd0000000-0000-0000-0000-000000000016';

-- 3. Ejercicios y pistas (80 Retos Sincronizados)
-- Reto #1: Catálogo básico de productos
UPDATE public.exercises
SET title = 'Catálogo básico de productos',
    prompt = 'Imagina que necesitas armar un catálogo sencillo para la tienda. Muestra únicamente el nombre de cada producto (`nombre_producto`) y su precio (`precio`) desde la tabla `productos`.',
    initial_code = '-- Escribe tu consulta aquí
SELECT ',
    solution_query = 'SELECT nombre_producto, precio FROM productos;',
    sort_order = 1
WHERE id = 'e0000000-0000-0000-0000-000000000001';
UPDATE public.exercise_hints
SET content = 'Identifica la tabla que guarda el catálogo de artículos y qué dos columnas contienen el nombre y el precio.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000001' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa SELECT seguido de las columnas separadas por coma y FROM para indicar la tabla.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000001' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ??? FROM productos;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000001' AND hint_order = 3;

-- Reto #2: Cálculo de precios con IVA
UPDATE public.exercises
SET title = 'Cálculo de precios con IVA',
    prompt = 'Calcula el precio final con impuestos para cada producto. Muestra el `nombre_producto`, el `precio` original y calcula el precio con el 21% de IVA (`precio * 1.21`) redondeado a 2 decimales, llamando a esa nueva columna `precio_con_iva`.',
    initial_code = '-- Muestra columnas y calcula el precio con IVA
SELECT ',
    solution_query = 'SELECT nombre_producto, precio, ROUND(precio * 1.21, 2) AS precio_con_iva FROM productos;',
    sort_order = 2
WHERE id = 'e0000000-0000-0000-0000-000000000008';
UPDATE public.exercise_hints
SET content = 'Puedes calcular valores nuevos al vuelo multiplicando la columna numérica por 1.21.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000008' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Combina la multiplicación con ROUND(..., 2) para dejar dos decimales y AS para nombrar la columna.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000008' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ???, ROUND(??? * 1.21, 2) AS precio_con_iva FROM productos;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000008' AND hint_order = 3;

-- Reto #3: Concatenación de nombre completo
UPDATE public.exercises
SET title = 'Concatenación de nombre completo',
    prompt = 'Prepara un directorio para el equipo de atención al cliente. Une el `nombre` y el `apellido` de cada cliente separados por un espacio, nómbralo `cliente_completo`, y muestra también su `email` desde la tabla `clientes`.',
    initial_code = '-- Concatena nombre y apellido con un espacio
SELECT ',
    solution_query = 'SELECT nombre || '' '' || apellido AS cliente_completo, email FROM clientes;',
    sort_order = 3
WHERE id = 'e0000000-0000-0000-0000-000000000019';
UPDATE public.exercise_hints
SET content = 'Necesitas unir dos columnas de texto intercalando un espacio en blanco entre ellas.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000019' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Utiliza el operador || junto con un espacio literal '' '' y asigna el alias cliente_completo con AS.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000019' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ??? || '' '' || ??? AS cliente_completo, ??? FROM clientes;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000019' AND hint_order = 3;

-- Reto #4: Catálogo de ciudades únicas (DISTINCT)
UPDATE public.exercises
SET title = 'Catálogo de ciudades únicas (DISTINCT)',
    prompt = 'Logística necesita saber en qué ciudades tenemos clientes sin que los nombres se repitan. Obtén la lista de ciudades únicas (`ciudad`) de la tabla `clientes`.',
    initial_code = '-- Obtén valores únicos de ciudad
SELECT ',
    solution_query = 'SELECT DISTINCT ciudad FROM clientes;',
    sort_order = 4
WHERE id = 'e0000000-0000-0000-0000-000000000020';
UPDATE public.exercise_hints
SET content = 'Para evitar que una ciudad aparezca varias veces, debes eliminar filas repetidas en el resultado.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000020' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Coloca la palabra clave DISTINCT inmediatamente después de SELECT antes de nombrar la columna.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000020' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT DISTINCT ??? FROM clientes;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000020' AND hint_order = 3;

-- Reto #5: Productos premium (> 500€)
UPDATE public.exercises
SET title = 'Productos premium (> 500€)',
    prompt = 'El equipo de marketing prepara una campaña especial de productos exclusivos. Muestra el `nombre_producto`, el `precio` y el `stock` de aquellos productos cuyo precio sea mayor a 500€.',
    initial_code = '-- Filtra los productos de alto valor
SELECT ',
    solution_query = 'SELECT nombre_producto, precio, stock FROM productos WHERE precio > 500;',
    sort_order = 5
WHERE id = 'e0000000-0000-0000-0000-000000000002';
UPDATE public.exercise_hints
SET content = 'Debes mostrar tres columnas del catálogo y conservar solo los artículos cuyo precio supera el umbral.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000002' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Añade la cláusula WHERE después de FROM y compara la columna numérica con el operador >.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000002' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ???, ??? FROM productos WHERE ??? > 500;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000002' AND hint_order = 3;

-- Reto #6: Productos en rango medio (BETWEEN)
UPDATE public.exercises
SET title = 'Productos en rango medio (BETWEEN)',
    prompt = 'Encuentra los productos de gama media para una promoción especial. Muestra el `nombre_producto` y el `precio` de todos los artículos cuyo precio esté entre 100€ y 800€ (ambos inclusive).',
    initial_code = '-- Filtra productos en el rango de 100 a 800
SELECT ',
    solution_query = 'SELECT nombre_producto, precio FROM productos WHERE precio BETWEEN 100 AND 800;',
    sort_order = 6
WHERE id = 'e0000000-0000-0000-0000-000000000009';
UPDATE public.exercise_hints
SET content = 'Necesitas filtrar artículos que caigan dentro de un rango numérico incluyendo ambos extremos.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000009' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa WHERE con el operador BETWEEN conectando el límite inferior y superior con AND.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000009' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ??? FROM productos WHERE ??? BETWEEN 100 AND 800;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000009' AND hint_order = 3;

-- Reto #7: Búsqueda por patrón de correo (LIKE)
UPDATE public.exercises
SET title = 'Búsqueda por patrón de correo (LIKE)',
    prompt = 'Marketing quiere enviar un aviso a los usuarios registrados con correos corporativos estándar `@email.com`. Muestra el `nombre`, `apellido` y `email` de aquellos clientes cuyo correo termine exactamente en `@email.com`.',
    initial_code = '-- Filtra clientes con comodín LIKE
SELECT ',
    solution_query = 'SELECT nombre, apellido, email FROM clientes WHERE email LIKE ''%@email.com'';',
    sort_order = 7
WHERE id = 'e0000000-0000-0000-0000-000000000021';
UPDATE public.exercise_hints
SET content = 'Debes buscar coincidencias parciales al final de la cadena de correo electrónico.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000021' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa WHERE con LIKE y el comodín % al principio del patrón entre comillas simples.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000021' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ???, ??? FROM clientes WHERE ??? LIKE ''%@email.com'';'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000021' AND hint_order = 3;

-- Reto #8: Filtro de ciudades específicas (IN)
UPDATE public.exercises
SET title = 'Filtro de ciudades específicas (IN)',
    prompt = 'Operaciones lanzó envíos express para tres ciudades clave: Madrid, Barcelona y Valencia. Muestra el `cliente_id`, `nombre`, `apellido` y `ciudad` de los clientes que vivan en cualquiera de estas tres ciudades.',
    initial_code = '-- Filtra con el operador IN
SELECT ',
    solution_query = 'SELECT cliente_id, nombre, apellido, ciudad FROM clientes WHERE ciudad IN (''Madrid'', ''Barcelona'', ''Valencia'');',
    sort_order = 8
WHERE id = 'e0000000-0000-0000-0000-000000000022';
UPDATE public.exercise_hints
SET content = 'En lugar de escribir varios OR seguidos, conviene comprobar pertenencia a una lista cerrada de valores.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000022' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Emplea WHERE con el operador IN (...) encerrando cada ciudad entre comillas simples.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000022' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ???, ???, ??? FROM clientes WHERE ??? IN (''Madrid'', ''Barcelona'', ''Valencia'');'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000022' AND hint_order = 3;

-- Reto #9: Productos en riesgo de stock (OR)
UPDATE public.exercises
SET title = 'Productos en riesgo de stock (OR)',
    prompt = 'El almacén necesita ubicar productos en situación crítica de inventario: artículos con muy poco stock (15 o menos unidades) o artículos con sobrestock (75 o más unidades). Muestra el `producto_id`, `nombre_producto` y `stock` que cumplan cualquiera de estas dos condiciones.',
    initial_code = '-- Combina condiciones con OR
SELECT ',
    solution_query = 'SELECT producto_id, nombre_producto, stock FROM productos WHERE stock <= 15 OR stock >= 75;',
    sort_order = 9
WHERE id = 'e0000000-0000-0000-0000-000000000023';
UPDATE public.exercise_hints
SET content = 'Un artículo cumple si se encuentra en cualquiera de los dos extremos de existencias (bajo o exceso).'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000023' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Combina las dos comparaciones (<= 15 y >= 75) en WHERE usando el operador lógico OR.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000023' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ???, ??? FROM productos WHERE ??? <= 15 OR ??? >= 75;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000023' AND hint_order = 3;

-- Reto #10: Facturas de alto valor no pagadas (AND + NOT)
UPDATE public.exercises
SET title = 'Facturas de alto valor no pagadas (AND + NOT)',
    prompt = 'Contabilidad necesita revisar facturas importantes pendientes de cobro. Muestra el `factura_id`, `monto_total` y `estado_factura` de aquellas facturas con un monto de 400€ o más y cuyo estado sea distinto de `''pagada''`.',
    initial_code = '-- Combina AND con el operador de desigualdad
SELECT ',
    solution_query = 'SELECT factura_id, monto_total, estado_factura FROM facturas WHERE monto_total >= 400 AND estado_factura <> ''pagada'';',
    sort_order = 10
WHERE id = 'e0000000-0000-0000-0000-000000000024';
UPDATE public.exercise_hints
SET content = 'Deben cumplirse dos condiciones a la vez: un monto mínimo y un estado distinto a ''pagada''.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000024' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Une en WHERE la comparación >= 400 con el operador de desigualdad <> (o !=) usando AND.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000024' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ???, ??? FROM facturas WHERE ??? >= 400 AND ??? <> ''pagada'';'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000024' AND hint_order = 3;

-- Reto #11: Combinación de condiciones con paréntesis ((OR) + AND)
UPDATE public.exercises
SET title = 'Combinación de condiciones con paréntesis ((OR) + AND)',
    prompt = 'Marketing busca lanzar una oferta sobre equipos de cómputo y pantallas con precio accesible. Muestra `producto_id`, `categoria_id`, `nombre_producto`, `precio` y `stock` de los artículos de la tabla `productos` que pertenezcan a la categoría `1` o a la categoría `2`, y que además tengan un `precio` menor a `1000`€. Ordena por `producto_id` ascendente.',
    initial_code = '-- Agrupa la disyunción OR entre paréntesis antes de aplicar AND
SELECT ',
    solution_query = 'SELECT producto_id, categoria_id, nombre_producto, precio, stock FROM productos WHERE (categoria_id = 1 OR categoria_id = 2) AND precio < 1000 ORDER BY producto_id ASC;',
    sort_order = 11
WHERE id = 'e0000000-0000-0000-0000-000000000078';
UPDATE public.exercise_hints
SET content = 'En SQL el operador AND se evalúa antes que OR; si no usas paréntesis, el filtro de precio solo afectará a la segunda categoría.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000078' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Encierra (categoria_id = 1 OR categoria_id = 2) entre paréntesis, combínalo con AND precio < 1000 y ordena por producto_id ASC.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000078' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT producto_id, categoria_id, nombre_producto, precio, stock FROM productos WHERE (??? = 1 OR ??? = 2) AND precio < 1000 ORDER BY producto_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000078' AND hint_order = 3;

-- Reto #12: Proveedores sin teléfono registrado (IS NULL)
UPDATE public.exercises
SET title = 'Proveedores sin teléfono registrado (IS NULL)',
    prompt = 'Compras detectó que algunas fichas de fabricantes quedaron incompletas al darse de alta. Muestra el `proveedor_id`, `nombre_proveedor` y `pais` de aquellos registros de la tabla `proveedores` cuyo `telefono` no haya sido cargado (`NULL`).',
    initial_code = '-- Detecta valores ausentes en una columna con IS NULL
SELECT ',
    solution_query = 'SELECT proveedor_id, nombre_proveedor, pais FROM proveedores WHERE telefono IS NULL;',
    sort_order = 12
WHERE id = 'e0000000-0000-0000-0000-000000000077';
UPDATE public.exercise_hints
SET content = 'En SQL un valor ausente (NULL) no es igual a nada, ni siquiera a otro NULL; por eso no puedes usar el signo =.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000077' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Filtra en la cláusula WHERE usando el predicado IS NULL sobre la columna de contacto telefónico.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000077' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ???, ??? FROM proveedores WHERE ??? IS NULL;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000077' AND hint_order = 3;

-- Reto #13: Pedidos de febrero de 2024 (fechas con BETWEEN)
UPDATE public.exercises
SET title = 'Pedidos de febrero de 2024 (fechas con BETWEEN)',
    prompt = 'Auditoría quiere revisar todas las compras registradas durante febrero de 2024. Muestra el `pedido_id`, `cliente_id`, `fecha_pedido` y `total` de los pedidos realizados entre `''2024-02-01''` y `''2024-02-29''` (ambos inclusive), ordenados cronológicamente por `fecha_pedido ASC` y, en caso de empate, por `pedido_id ASC`.',
    initial_code = '-- Filtra por rango de fechas en WHERE
SELECT ',
    solution_query = 'SELECT pedido_id, cliente_id, fecha_pedido, total FROM pedidos WHERE fecha_pedido BETWEEN ''2024-02-01'' AND ''2024-02-29'' ORDER BY fecha_pedido ASC, pedido_id ASC;',
    sort_order = 13
WHERE id = 'e0000000-0000-0000-0000-000000000051';
UPDATE public.exercise_hints
SET content = 'Las fechas en formato estándar se comparan como texto delimitado entre comillas simples (''AAAA-MM-DD'') dentro de WHERE.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000051' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa BETWEEN ''2024-02-01'' AND ''2024-02-29'' sobre fecha_pedido y ordena con fecha_pedido ASC, pedido_id ASC.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000051' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ???, ???, ??? FROM pedidos WHERE ??? BETWEEN ''2024-02-01'' AND ''2024-02-29'' ORDER BY fecha_pedido ASC, pedido_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000051' AND hint_order = 3;

-- Reto #14: Clientes españoles ordenados por apellido
UPDATE public.exercises
SET title = 'Clientes españoles ordenados por apellido',
    prompt = 'Organiza la lista de clientes que viven en España por orden alfabético. Muestra su `nombre`, `apellido` y `ciudad` de la tabla `clientes`, ordenando los resultados alfabéticamente por su `apellido` (de la A a la Z) y, en caso de empate, por `cliente_id` ascendente.',
    initial_code = '-- Filtra y ordena los clientes
SELECT ',
    solution_query = 'SELECT nombre, apellido, ciudad FROM clientes WHERE pais = ''España'' ORDER BY apellido ASC, cliente_id ASC;',
    sort_order = 14
WHERE id = 'e0000000-0000-0000-0000-000000000003';
UPDATE public.exercise_hints
SET content = 'Primero filtra por el país solicitado y luego ordena las filas resultantes de forma alfabética con desempate único.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000003' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Aplica WHERE pais = ''España'' y añade ORDER BY apellido ASC, cliente_id ASC al final.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000003' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ???, ??? FROM clientes WHERE ??? = ''España'' ORDER BY ??? ASC, cliente_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000003' AND hint_order = 3;

-- Reto #15: Los 5 productos con menor stock
UPDATE public.exercises
SET title = 'Los 5 productos con menor stock',
    prompt = 'El almacén necesita reponer con urgencia los artículos que están por agotarse. Muestra el `nombre_producto` y el `stock` de los 5 productos con menor cantidad disponible, ordenando por `stock` ascendente y desempatando por `producto_id` ascendente.',
    initial_code = '-- Ordena y limita a los 5 productos con menos stock
SELECT ',
    solution_query = 'SELECT nombre_producto, stock FROM productos ORDER BY stock ASC, producto_id ASC LIMIT 5;',
    sort_order = 15
WHERE id = 'e0000000-0000-0000-0000-000000000010';
UPDATE public.exercise_hints
SET content = 'Para hallar los valores más pequeños primero ordena de menor a mayor con desempate único y luego recorta el resultado.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000010' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa ORDER BY stock ASC, producto_id ASC seguido de LIMIT 5.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000010' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ??? FROM productos ORDER BY ??? ASC, producto_id ASC LIMIT 5;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000010' AND hint_order = 3;

-- Reto #16: Ordenamiento Multi-Criterio
UPDATE public.exercises
SET title = 'Ordenamiento Multi-Criterio',
    prompt = 'Organiza los productos por su categoría y luego por su valor comercial. Muestra `producto_id`, `categoria_id`, `nombre_producto` y `precio`, ordenándolos primero por categoría de menor a mayor (`categoria_id ASC`), y dentro de cada categoría, del más caro al más barato (`precio DESC`).',
    initial_code = '-- Ordena por múltiples columnas
SELECT ',
    solution_query = 'SELECT producto_id, categoria_id, nombre_producto, precio FROM productos ORDER BY categoria_id ASC, precio DESC;',
    sort_order = 16
WHERE id = 'e0000000-0000-0000-0000-000000000025';
UPDATE public.exercise_hints
SET content = 'Primero agrupa visualmente ordenando por categoría y luego desempata los precios de mayor a menor.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000025' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Especifica dos criterios en ORDER BY separados por coma: primero ASC y el segundo DESC.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000025' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ???, ???, ??? FROM productos ORDER BY ??? ASC, ??? DESC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000025' AND hint_order = 3;

-- Reto #17: Paginación de clientes (OFFSET)
UPDATE public.exercises
SET title = 'Paginación de clientes (OFFSET)',
    prompt = 'Simula la paginación de un panel web que muestra 5 clientes por página. Obtén los clientes de la segunda página mostrando `cliente_id`, `nombre` y `email`, ordenados por `cliente_id ASC`, saltando los primeros 5 registros y mostrando los siguientes 5.',
    initial_code = '-- Usa LIMIT y OFFSET para paginar
SELECT ',
    solution_query = 'SELECT cliente_id, nombre, email FROM clientes ORDER BY cliente_id ASC LIMIT 5 OFFSET 5;',
    sort_order = 17
WHERE id = 'e0000000-0000-0000-0000-000000000026';
UPDATE public.exercise_hints
SET content = 'Para mostrar la segunda página de 5 elementos debes ordenar primero de forma estable, saltar 5 filas y tomar 5.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000026' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Combina ORDER BY cliente_id ASC con LIMIT 5 y OFFSET 5 al final de la consulta.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000026' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ???, ??? FROM clientes ORDER BY ??? ASC LIMIT 5 OFFSET 5;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000026' AND hint_order = 3;

-- Reto #18: Métricas globales de ventas
UPDATE public.exercises
SET title = 'Métricas globales de ventas',
    prompt = 'Genera un resumen ejecutivo de las ventas completadas. Calcula el número de pedidos bajo el nombre `total_pedidos`, la suma total de dinero bajo `ingresos_totales` y el promedio de compra redondeado a 2 decimales bajo `ticket_promedio`, tomando solo los pedidos con estado `''completado''`.',
    initial_code = '-- Agrega las métricas globales para pedidos completados
SELECT ',
    solution_query = 'SELECT COUNT(*) AS total_pedidos, SUM(total) AS ingresos_totales, ROUND(AVG(total), 2) AS ticket_promedio FROM pedidos WHERE estado_pedido = ''completado'';',
    sort_order = 18
WHERE id = 'e0000000-0000-0000-0000-000000000011';
UPDATE public.exercise_hints
SET content = 'Solo debes tomar pedidos completados y calcular tres métricas globales en una única fila resumen (sin GROUP BY).'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000011' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Combina WHERE estado_pedido = ''completado'' con las funciones COUNT(*), SUM(total) y ROUND(AVG(total), 2).'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000011' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT COUNT(*) AS total_pedidos, SUM(???) AS ingresos_totales, ROUND(AVG(???), 2) AS ticket_promedio FROM pedidos WHERE ??? = ''completado'';'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000011' AND hint_order = 3;

-- Reto #19: Rango de precios por categoría (MAX/MIN)
UPDATE public.exercises
SET title = 'Rango de precios por categoría (MAX/MIN)',
    prompt = 'Analiza la diferencia de precios en cada departamento. Muestra el `categoria_id`, el precio más bajo bajo el nombre `precio_minimo` y el precio más alto bajo `precio_maximo` para cada categoría de productos.',
    initial_code = '-- Calcula precios extremos por categoría
SELECT ',
    solution_query = 'SELECT categoria_id, MIN(precio) AS precio_minimo, MAX(precio) AS precio_maximo FROM productos GROUP BY categoria_id;',
    sort_order = 19
WHERE id = 'e0000000-0000-0000-0000-000000000027';
UPDATE public.exercise_hints
SET content = 'Agrupa el catálogo por categoría para calcular tanto el valor mínimo como el máximo dentro de cada grupo.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000027' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa MIN(precio), MAX(precio) en el SELECT y agrupa con GROUP BY categoria_id.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000027' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, MIN(???) AS precio_minimo, MAX(???) AS precio_maximo FROM productos GROUP BY ???;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000027' AND hint_order = 3;

-- Reto #20: Distribución de clientes por país
UPDATE public.exercises
SET title = 'Distribución de clientes por país',
    prompt = '¿De qué países son nuestros clientes? Muestra la columna `pais` y el número total de clientes en cada país bajo el nombre `total_clientes`, ordenando la lista de mayor a menor número de clientes y, en caso de empate, alfabéticamente por `pais`.',
    initial_code = '-- Agrupa clientes por país
SELECT ',
    solution_query = 'SELECT pais, COUNT(*) AS total_clientes FROM clientes GROUP BY pais ORDER BY total_clientes DESC, pais ASC;',
    sort_order = 20
WHERE id = 'e0000000-0000-0000-0000-000000000028';
UPDATE public.exercise_hints
SET content = 'Agrupa los clientes por país, cuenta los registros de cada grupo y ordena poniendo los más numerosos primero.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000028' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa GROUP BY pais junto a COUNT(*) AS total_clientes y ORDER BY total_clientes DESC, pais ASC.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000028' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, COUNT(*) AS total_clientes FROM clientes GROUP BY ??? ORDER BY total_clientes DESC, ??? ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000028' AND hint_order = 3;

-- Reto #21: Stock total por proveedor
UPDATE public.exercises
SET title = 'Stock total por proveedor',
    prompt = 'Calcula el volumen total de productos que nos suministra cada fabricante. Muestra el `proveedor_id` y la suma de unidades disponibles en stock bajo el nombre `stock_total` desde la tabla `productos`.',
    initial_code = '-- Suma el stock por proveedor
SELECT ',
    solution_query = 'SELECT proveedor_id, SUM(stock) AS stock_total FROM productos GROUP BY proveedor_id;',
    sort_order = 21
WHERE id = 'e0000000-0000-0000-0000-000000000029';
UPDATE public.exercise_hints
SET content = 'Debes sumar las unidades disponibles agrupando los productos por su identificador de proveedor.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000029' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa SUM(stock) AS stock_total en el SELECT y agrupa al final con GROUP BY proveedor_id.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000029' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, SUM(???) AS stock_total FROM productos GROUP BY ???;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000029' AND hint_order = 3;

-- Reto #22: Compras completadas por cliente (WHERE + GROUP BY)
UPDATE public.exercises
SET title = 'Compras completadas por cliente (WHERE + GROUP BY)',
    prompt = 'Analiza únicamente las compras efectivas por cliente sin mezclar pedidos cancelados ni pendientes. Filtra los pedidos con `estado_pedido = ''completado''`, agrupa por `cliente_id` y muestra el `cliente_id`, el número de compras como `compras_completadas` y su suma como `gasto_completado`. Ordena de mayor a menor `gasto_completado` y desempata por `cliente_id` ascendente.',
    initial_code = '-- Filtra filas individuales antes de agrupar
SELECT ',
    solution_query = 'SELECT cliente_id, COUNT(*) AS compras_completadas, SUM(total) AS gasto_completado FROM pedidos WHERE estado_pedido = ''completado'' GROUP BY cliente_id ORDER BY gasto_completado DESC, cliente_id ASC;',
    sort_order = 22
WHERE id = 'e0000000-0000-0000-0000-000000000052';
UPDATE public.exercise_hints
SET content = 'Primero descarta con WHERE las filas que no están completadas y después agrupa por cliente para contar y sumar.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000052' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Coloca WHERE estado_pedido = ''completado'' antes de GROUP BY cliente_id, mostrando COUNT(*) y SUM(total).'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000052' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, COUNT(*) AS compras_completadas, SUM(???) AS gasto_completado FROM pedidos WHERE ??? = ''completado'' GROUP BY ??? ORDER BY gasto_completado DESC, ??? ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000052' AND hint_order = 3;

-- Reto #23: Resumen de pedidos por estado
UPDATE public.exercises
SET title = 'Resumen de pedidos por estado',
    prompt = 'Construye un resumen de pedidos por estado. Muestra el `estado_pedido`, la cantidad de pedidos bajo el nombre `total_pedidos` y la suma acumulada de dinero bajo `monto_acumulado`, agrupando por estado y ordenando del estado con mayor dinero al de menor dinero (desempatando por `estado_pedido` ascendente).',
    initial_code = '-- Resumen consolidado por estado de pedido
SELECT ',
    solution_query = 'SELECT estado_pedido, COUNT(*) AS total_pedidos, SUM(total) AS monto_acumulado FROM pedidos GROUP BY estado_pedido ORDER BY monto_acumulado DESC, estado_pedido ASC;',
    sort_order = 23
WHERE id = 'e0000000-0000-0000-0000-000000000032';
UPDATE public.exercise_hints
SET content = 'Agrupa todos los pedidos por estado para contar cuántos hay y sumar su importe en la misma consulta.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000032' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Combina COUNT(*), SUM(total) y GROUP BY estado_pedido, ordenando por monto_acumulado DESC, estado_pedido ASC.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000032' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, COUNT(*) AS total_pedidos, SUM(???) AS monto_acumulado FROM pedidos GROUP BY ??? ORDER BY monto_acumulado DESC, ??? ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000032' AND hint_order = 3;

-- Reto #24: Pedidos totales vs. compradores únicos (COUNT DISTINCT)
UPDATE public.exercises
SET title = 'Pedidos totales vs. compradores únicos (COUNT DISTINCT)',
    prompt = 'Un mismo cliente puede haber realizado varios pedidos, por lo que contar filas no equivale a contar personas. Para cada `estado_pedido` en la tabla `pedidos`, muestra el `estado_pedido`, la cantidad total de órdenes como `total_pedidos` (`COUNT(*)`) y cuántos clientes diferentes participaron como `clientes_unicos` (`COUNT(DISTINCT cliente_id)`). Ordena de mayor a menor `total_pedidos` y desempata por `estado_pedido` ascendente.',
    initial_code = '-- Compara el total de operaciones frente a sujetos únicos por estado
SELECT ',
    solution_query = 'SELECT estado_pedido, COUNT(*) AS total_pedidos, COUNT(DISTINCT cliente_id) AS clientes_unicos FROM pedidos GROUP BY estado_pedido ORDER BY total_pedidos DESC, estado_pedido ASC;',
    sort_order = 24
WHERE id = 'e0000000-0000-0000-0000-000000000079';
UPDATE public.exercise_hints
SET content = 'Mientras COUNT(*) cuenta todas las filas del grupo, COUNT(DISTINCT columna) descarta repeticiones y cuenta cuántos valores únicos existen.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000079' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Agrupa por estado_pedido, combina COUNT(*) AS total_pedidos con COUNT(DISTINCT cliente_id) AS clientes_unicos y ordena con desempate.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000079' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT estado_pedido, COUNT(*) AS total_pedidos, COUNT(DISTINCT ???) AS clientes_unicos FROM pedidos GROUP BY ??? ORDER BY total_pedidos DESC, estado_pedido ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000079' AND hint_order = 3;

-- Reto #25: Conteo de productos por categoría
UPDATE public.exercises
SET title = 'Conteo de productos por categoría',
    prompt = '¿Cuántos productos tenemos en cada categoría? Muestra el `categoria_id` y el número total de productos bajo el nombre `total_productos`, mostrando únicamente aquellas categorías que tengan más de 2 productos.',
    initial_code = '-- Utiliza GROUP BY y HAVING
SELECT ',
    solution_query = 'SELECT categoria_id, COUNT(*) AS total_productos FROM productos GROUP BY categoria_id HAVING COUNT(*) > 2;',
    sort_order = 25
WHERE id = 'e0000000-0000-0000-0000-000000000004';
UPDATE public.exercise_hints
SET content = 'Primero agrupa los productos por su categoría, cuenta cuántos hay en cada grupo y luego descarta los grupos pequeños.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000004' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa GROUP BY sobre la categoría y HAVING COUNT(*) > 2 después de agrupar.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000004' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, COUNT(*) AS total_productos FROM productos GROUP BY ??? HAVING COUNT(*) > 2;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000004' AND hint_order = 3;

-- Reto #26: Proveedores de alto volumen (HAVING SUM)
UPDATE public.exercises
SET title = 'Proveedores de alto volumen (HAVING SUM)',
    prompt = 'Identifica a nuestros proveedores más importantes en volumen. Muestra el `proveedor_id` y su stock total bajo el nombre `stock_total`, mostrando únicamente a aquellos proveedores cuyo stock total acumulado supere las 100 unidades.',
    initial_code = '-- Filtra grupos con HAVING
SELECT ',
    solution_query = 'SELECT proveedor_id, SUM(stock) AS stock_total FROM productos GROUP BY proveedor_id HAVING SUM(stock) > 100;',
    sort_order = 26
WHERE id = 'e0000000-0000-0000-0000-000000000030';
UPDATE public.exercise_hints
SET content = 'Primero agrupa y suma el stock por proveedor; después filtra los grupos ya agregados que superen las 100 unidades.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000030' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Las funciones agregadas como SUM(...) se filtran en HAVING, no en WHERE.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000030' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, SUM(???) AS stock_total FROM productos GROUP BY ??? HAVING SUM(???) > 100;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000030' AND hint_order = 3;

-- Reto #27: Clientes con compra promedio alta (HAVING AVG)
UPDATE public.exercises
SET title = 'Clientes con compra promedio alta (HAVING AVG)',
    prompt = 'Encuentra a los clientes que hacen compras de alto valor promedio. Muestra el `cliente_id` y su importe promedio de compra redondeado a 2 decimales bajo el nombre `ticket_promedio`, mostrando solo a aquellos clientes cuyo promedio de compras supere los 500€.',
    initial_code = '-- Filtra clientes por compra promedio
SELECT ',
    solution_query = 'SELECT cliente_id, ROUND(AVG(total), 2) AS ticket_promedio FROM pedidos GROUP BY cliente_id HAVING AVG(total) > 500;',
    sort_order = 27
WHERE id = 'e0000000-0000-0000-0000-000000000031';
UPDATE public.exercise_hints
SET content = 'Calcula el promedio por cliente agrupando sus pedidos y quédate solo con quienes superen 500€ de media.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000031' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa ROUND(AVG(total), 2) en SELECT, agrupa con GROUP BY cliente_id y filtra con HAVING AVG(total) > 500.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000031' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ???, ROUND(AVG(???), 2) AS ticket_promedio FROM pedidos GROUP BY ??? HAVING AVG(???) > 500;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000031' AND hint_order = 3;

-- Reto #28: Pedidos con identidad del cliente
UPDATE public.exercises
SET title = 'Pedidos con identidad del cliente',
    prompt = 'Descubre qué cliente realizó cada pedido. Cruza las tablas `pedidos` y `clientes` por su identificador común y muestra el `pedido_id`, el `nombre` del cliente, su `apellido` y el `total` del pedido.',
    initial_code = '-- Cruza clientes con sus respectivos pedidos
SELECT ',
    solution_query = 'SELECT p.pedido_id, c.nombre, c.apellido, p.total FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id;',
    sort_order = 28
WHERE id = 'e0000000-0000-0000-0000-000000000005';
UPDATE public.exercise_hints
SET content = 'Conecta ambas tablas por la clave que identifica al cliente en la tabla de pedidos y en el catálogo de clientes.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000005' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa INNER JOIN combinando pedidos y clientes con ON sobre cliente_id, asignando alias cortos para evitar ambigüedad.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000005' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT p.pedido_id, c.nombre, c.apellido, p.total FROM pedidos p INNER JOIN clientes c ON p.??? = c.???;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000005' AND hint_order = 3;

-- Reto #29: Catálogo con nombre de categoría
UPDATE public.exercises
SET title = 'Catálogo con nombre de categoría',
    prompt = 'Haz que el catálogo de productos sea legible mostrando el nombre de la categoría en lugar de su código numérico. Cruza `productos` con `categorias` y muestra `producto_id`, `nombre_producto`, `nombre_categoria` y `precio`. Ordena primero por categoría (A-Z) y luego por producto (A-Z).',
    initial_code = '-- Cruza productos con categorias
SELECT ',
    solution_query = 'SELECT p.producto_id, p.nombre_producto, c.nombre_categoria, p.precio FROM productos p INNER JOIN categorias c ON p.categoria_id = c.categoria_id ORDER BY c.nombre_categoria ASC, p.nombre_producto ASC;',
    sort_order = 29
WHERE id = 'e0000000-0000-0000-0000-000000000033';
UPDATE public.exercise_hints
SET content = 'Reemplaza el identificador numérico de categoría uniendo la tabla de productos con su tabla descriptiva de categorías.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000033' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa INNER JOIN categorias c ON p.categoria_id = c.categoria_id y ordena primero por nombre_categoria ASC y luego por nombre_producto ASC.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000033' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT p.producto_id, p.nombre_producto, c.nombre_categoria, p.precio FROM productos p INNER JOIN categorias c ON p.??? = c.??? ORDER BY c.nombre_categoria ASC, p.nombre_producto ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000033' AND hint_order = 3;

-- Reto #30: Productos y sus proveedores directos
UPDATE public.exercises
SET title = 'Productos y sus proveedores directos',
    prompt = 'Compras necesita saber de qué país proviene cada producto. Cruza `productos` con `proveedores` y muestra `producto_id`, `nombre_producto`, `nombre_proveedor` y el país del proveedor bajo el nombre `pais_proveedor`. Ordena los productos alfabéticamente y, en caso de empate, por `producto_id` ascendente.',
    initial_code = '-- Relaciona productos con sus proveedores
SELECT ',
    solution_query = 'SELECT pr.producto_id, pr.nombre_producto, pv.nombre_proveedor, pv.pais AS pais_proveedor FROM productos pr INNER JOIN proveedores pv ON pr.proveedor_id = pv.proveedor_id ORDER BY pr.nombre_producto ASC, pr.producto_id ASC;',
    sort_order = 30
WHERE id = 'e0000000-0000-0000-0000-000000000034';
UPDATE public.exercise_hints
SET content = 'Relaciona el catálogo de artículos con la tabla de fabricantes por la clave de proveedor.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000034' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa INNER JOIN proveedores pv sobre proveedor_id, renombra el país con AS pais_proveedor y ordena con desempate único.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000034' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT pr.producto_id, pr.nombre_producto, pv.nombre_proveedor, pv.pais AS pais_proveedor FROM productos pr INNER JOIN proveedores pv ON pr.??? = pv.??? ORDER BY pr.nombre_producto ASC, pr.producto_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000034' AND hint_order = 3;

-- Reto #31: Facturación detallada con pagos aprobados
UPDATE public.exercises
SET title = 'Facturación detallada con pagos aprobados',
    prompt = 'Concilia las facturas emitidas con sus pagos aprobados. Cruza `facturas` con `pagos` por `factura_id`, mostrando `factura_id`, el monto de la factura (`monto_total`), el `metodo_pago` y la `fecha_pago`, tomando únicamente los registros con `estado_pago = ''aprobado''`. Ordena por `factura_id` ascendente.',
    initial_code = '-- Concilia facturas con pagos aprobados
SELECT ',
    solution_query = 'SELECT f.factura_id, f.monto_total, pg.metodo_pago, pg.fecha_pago FROM facturas f INNER JOIN pagos pg ON f.factura_id = pg.factura_id WHERE pg.estado_pago = ''aprobado'' ORDER BY f.factura_id ASC;',
    sort_order = 31
WHERE id = 'e0000000-0000-0000-0000-000000000035';
UPDATE public.exercise_hints
SET content = 'Une facturas y pagos por su identificador de factura, y filtra únicamente los pagos con estado aprobado.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000035' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Combina INNER JOIN pagos pg ON f.factura_id = pg.factura_id con WHERE pg.estado_pago = ''aprobado'' y ordena por factura_id ascendente.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000035' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT f.factura_id, f.monto_total, pg.metodo_pago, pg.fecha_pago FROM facturas f INNER JOIN pagos pg ON f.??? = pg.??? WHERE pg.estado_pago = ''aprobado'' ORDER BY f.factura_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000035' AND hint_order = 3;

-- Reto #32: Gasto acumulado por cliente
UPDATE public.exercises
SET title = 'Gasto acumulado por cliente',
    prompt = 'Calcula cuánto dinero ha gastado en total cada uno de nuestros clientes. Cruza `clientes` y `pedidos`, y muestra el `cliente_id`, `nombre`, `apellido` y la suma de todas sus compras bajo el nombre `total_gastado`, ordenando de mayor a menor gasto y, en caso de empate, por `cliente_id` ascendente.',
    initial_code = '-- Cruza clientes y pedidos y agrupa para sumar el gasto
SELECT ',
    solution_query = 'SELECT c.cliente_id, c.nombre, c.apellido, SUM(p.total) AS total_gastado FROM clientes c INNER JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_gastado DESC, c.cliente_id ASC;',
    sort_order = 32
WHERE id = 'e0000000-0000-0000-0000-000000000012';
UPDATE public.exercise_hints
SET content = 'Une clientes y pedidos por su identificador común e incluye en GROUP BY todas las columnas no agregadas del SELECT.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000012' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Calcula SUM(p.total) AS total_gastado después de agrupar por c.cliente_id, c.nombre y c.apellido, y ordena con desempate único.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000012' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT c.cliente_id, c.nombre, c.apellido, SUM(p.total) AS total_gastado FROM clientes c INNER JOIN pedidos p ON c.??? = p.??? GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_gastado DESC, c.cliente_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000012' AND hint_order = 3;

-- Reto #33: Clientes sin compras registradas (LEFT JOIN & IS NULL)
UPDATE public.exercises
SET title = 'Clientes sin compras registradas (LEFT JOIN & IS NULL)',
    prompt = '¿Qué clientes se han registrado pero nunca han realizado una compra? Haz un `LEFT JOIN` entre `clientes` y `pedidos` para mostrar el `cliente_id`, `nombre` y `apellido` de todos los usuarios sin pedidos registrados.',
    initial_code = '-- Identifica clientes inactivos sin pedidos asociados
SELECT ',
    solution_query = 'SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id WHERE p.pedido_id IS NULL;',
    sort_order = 33
WHERE id = 'e0000000-0000-0000-0000-000000000006';
UPDATE public.exercise_hints
SET content = 'Para conservar a todos los clientes aunque no tengan pedidos, la tabla de clientes debe ir a la izquierda de un LEFT JOIN.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000006' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Cuando un cliente no tiene pedidos asociados, las columnas de pedidos quedan como NULL; filtra con WHERE ... IS NULL.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000006' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c LEFT JOIN pedidos p ON c.??? = p.??? WHERE p.pedido_id IS NULL;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000006' AND hint_order = 3;

-- Reto #34: Productos sin movimiento de venta
UPDATE public.exercises
SET title = 'Productos sin movimiento de venta',
    prompt = 'Detecta qué artículos del catálogo nunca han tenido ventas. Muestra el `producto_id` y `nombre_producto` de aquellos artículos que no tengan ninguna línea registrada en la tabla `detalle_pedidos`.',
    initial_code = '-- Localiza productos sin ventas cruzando con detalle_pedidos
SELECT ',
    solution_query = 'SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN detalle_pedidos dp ON p.producto_id = dp.producto_id WHERE dp.detalle_id IS NULL;',
    sort_order = 34
WHERE id = 'e0000000-0000-0000-0000-000000000013';
UPDATE public.exercise_hints
SET content = 'Mantén todos los productos en el resultado usando LEFT JOIN hacia la tabla donde se registran las líneas de venta.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000013' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Si un artículo nunca se vendió, la clave primaria de la tabla derecha valdrá NULL; evalúa esa ausencia en WHERE.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000013' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN detalle_pedidos dp ON p.??? = dp.??? WHERE dp.detalle_id IS NULL;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000013' AND hint_order = 3;

-- Reto #35: Facturas pendientes de cobro (LEFT JOIN)
UPDATE public.exercises
SET title = 'Facturas pendientes de cobro (LEFT JOIN)',
    prompt = 'Tesorería necesita una lista de facturas emitidas que todavía no tienen ningún pago registrado. Haz un `LEFT JOIN` entre `facturas` y `pagos` para obtener `factura_id`, `pedido_id`, `fecha_emision` y `monto_total` de aquellas facturas sin ningún abono. Ordena por `factura_id` ascendente.',
    initial_code = '-- Identifica facturas sin pagos registrados
SELECT ',
    solution_query = 'SELECT f.factura_id, f.pedido_id, f.fecha_emision, f.monto_total FROM facturas f LEFT JOIN pagos p ON f.factura_id = p.factura_id WHERE p.pago_id IS NULL ORDER BY f.factura_id ASC;',
    sort_order = 35
WHERE id = 'e0000000-0000-0000-0000-000000000036';
UPDATE public.exercise_hints
SET content = 'Une todas las facturas emitidas con sus posibles abonos con LEFT JOIN para no perder las que no tienen cobro.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000036' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Filtra en WHERE las facturas cuya clave de pago derecha sea IS NULL y ordena de forma ascendente por factura_id.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000036' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT f.factura_id, f.pedido_id, f.fecha_emision, f.monto_total FROM facturas f LEFT JOIN pagos p ON f.??? = p.??? WHERE p.pago_id IS NULL ORDER BY f.factura_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000036' AND hint_order = 3;

-- Reto #36: Productos fuera del almacén central (LEFT JOIN condicional)
UPDATE public.exercises
SET title = 'Productos fuera del almacén central (LEFT JOIN condicional)',
    prompt = 'El responsable del almacén central de Madrid (`almacen_id = 1`) quiere saber qué productos del catálogo NO disponen de existencias en ese almacén en particular. Conecta `productos` con `inventario` con un `LEFT JOIN` acotado al almacén 1 y muestra el `producto_id` y `nombre_producto` de los artículos ausentes en ese almacén, ordenados por `producto_id` ascendente.',
    initial_code = '-- Detecta productos no inventariados en el almacén 1
SELECT ',
    solution_query = 'SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN inventario i ON p.producto_id = i.producto_id AND i.almacen_id = 1 WHERE i.almacen_id IS NULL ORDER BY p.producto_id ASC;',
    sort_order = 36
WHERE id = 'e0000000-0000-0000-0000-000000000037';
UPDATE public.exercise_hints
SET content = 'Si filtras el almacén 1 en el WHERE perderás los productos sin inventario; coloca esa restricción dentro de la cláusula ON.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000037' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'En el ON del LEFT JOIN combina producto_id con i.almacen_id = 1, y después conserva los ausentes con WHERE i.almacen_id IS NULL.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000037' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN inventario i ON p.??? = i.??? AND i.almacen_id = 1 WHERE i.almacen_id IS NULL ORDER BY p.producto_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000037' AND hint_order = 3;

-- Reto #37: Censo completo de pedidos por cliente (preservando ceros)
UPDATE public.exercises
SET title = 'Censo completo de pedidos por cliente (preservando ceros)',
    prompt = 'Queremos una lista completa de todos los clientes y saber cuántos pedidos ha hecho cada uno, incluyendo con 0 a los que nunca han comprado. Muestra `cliente_id`, `nombre`, `apellido` y el total de compras bajo el nombre `total_pedidos` (usando `COUNT(p.pedido_id)`). Ordena por número de pedidos de mayor a menor y, en caso de empate, por `cliente_id` ascendente.',
    initial_code = '-- Agrupa preservando clientes sin compras con COUNT(columna)
SELECT ',
    solution_query = 'SELECT c.cliente_id, c.nombre, c.apellido, COUNT(p.pedido_id) AS total_pedidos FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_pedidos DESC, c.cliente_id ASC;',
    sort_order = 37
WHERE id = 'e0000000-0000-0000-0000-000000000038';
UPDATE public.exercise_hints
SET content = 'Para que los clientes sin compras aparezcan con 0 en lugar de desaparecer, usa LEFT JOIN y evita COUNT(*).'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000038' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Cuenta explícitamente p.pedido_id con COUNT(p.pedido_id) AS total_pedidos y agrupa por las columnas del cliente.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000038' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT c.cliente_id, c.nombre, c.apellido, COUNT(p.pedido_id) AS total_pedidos FROM clientes c LEFT JOIN pedidos p ON c.??? = p.??? GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_pedidos DESC, c.cliente_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000038' AND hint_order = 3;

-- Reto #38: Gasto total de clientes incluyendo 0€ (COALESCE)
UPDATE public.exercises
SET title = 'Gasto total de clientes incluyendo 0€ (COALESCE)',
    prompt = 'Genera un reporte financiero con TODOS los clientes registrados y su gasto total acumulado, de modo que quienes nunca han comprado muestren `0` en lugar de `NULL`. Haz un `LEFT JOIN` entre `clientes` y `pedidos`, muestra `cliente_id`, `nombre`, `apellido` y `COALESCE(SUM(p.total), 0)` como `gasto_total`. Ordena de mayor a menor `gasto_total` y desempata por `cliente_id` ascendente.',
    initial_code = '-- Reemplaza valores NULL de la suma con COALESCE
SELECT ',
    solution_query = 'SELECT c.cliente_id, c.nombre, c.apellido, COALESCE(SUM(p.total), 0) AS gasto_total FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY gasto_total DESC, c.cliente_id ASC;',
    sort_order = 38
WHERE id = 'e0000000-0000-0000-0000-000000000053';
UPDATE public.exercise_hints
SET content = 'Al unir con LEFT JOIN, SUM() sobre filas sin pedidos devuelve NULL en lugar de cero; envuélvelo en una función de respaldo.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000053' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa COALESCE(SUM(p.total), 0) AS gasto_total agrupando por las columnas del cliente y ordenando con desempate único.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000053' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT c.cliente_id, c.nombre, c.apellido, COALESCE(SUM(p.???), 0) AS gasto_total FROM clientes c LEFT JOIN pedidos p ON c.??? = p.??? GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY gasto_total DESC, c.cliente_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000053' AND hint_order = 3;

-- Reto #39: Desglose completo de líneas de pedido
UPDATE public.exercises
SET title = 'Desglose completo de líneas de pedido',
    prompt = 'Audita las compras mostrando toda la información conectada: pedido, cliente, producto y categoría. Conecta `pedidos`, `clientes`, `detalle_pedidos`, `productos` y `categorias`, y muestra `pedido_id`, el nombre del cliente como `cliente_nombre`, `nombre_producto`, `nombre_categoria`, `cantidad` y `precio_unitario`. Ordena por `pedido_id ASC` y `nombre_producto ASC`, limitando a los primeros 10 registros.',
    initial_code = '-- Conecta en cascada pedidos, clientes, detalle, productos y categorias
SELECT ',
    solution_query = 'SELECT p.pedido_id, c.nombre AS cliente_nombre, pr.nombre_producto, cat.nombre_categoria, dp.cantidad, dp.precio_unitario FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id INNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id INNER JOIN productos pr ON dp.producto_id = pr.producto_id INNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id ORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10;',
    sort_order = 39
WHERE id = 'e0000000-0000-0000-0000-000000000014';
UPDATE public.exercise_hints
SET content = 'Traza el camino relacional paso a paso: desde el pedido hacia el cliente por un lado, y hacia sus líneas, productos y categorías por otro.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000014' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Encadena los 4 INNER JOIN con alias cortos, renombra c.nombre AS cliente_nombre y termina con ORDER BY y LIMIT 10.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000014' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT p.pedido_id, c.nombre AS cliente_nombre, pr.nombre_producto, cat.nombre_categoria, dp.cantidad, dp.precio_unitario FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id INNER JOIN detalle_pedidos dp ON p.??? = dp.??? INNER JOIN productos pr ON dp.??? = pr.??? INNER JOIN categorias cat ON pr.??? = cat.??? ORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000014' AND hint_order = 3;

-- Reto #40: Historial de ventas por ciudad y categoría
UPDATE public.exercises
SET title = 'Historial de ventas por ciudad y categoría',
    prompt = 'Descubre cuánto dinero se ha vendido en cada ciudad por cada tipo de producto. Conecta las tablas necesarias para calcular la suma de ventas (`SUM(dp.cantidad * dp.precio_unitario)`) bajo el nombre `monto_vendido`, agrupando por la `ciudad` del cliente y el `nombre_categoria`. Ordena alfabéticamente por `ciudad` ascendente, luego de mayor a menor `monto_vendido` y, en caso de empate, por `nombre_categoria` ascendente.',
    initial_code = '-- Conecta 5 tablas y calcula ventas por ciudad y categoria
SELECT ',
    solution_query = 'SELECT c.ciudad, cat.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS monto_vendido FROM clientes c INNER JOIN pedidos p ON c.cliente_id = p.cliente_id INNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id INNER JOIN productos pr ON dp.producto_id = pr.producto_id INNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id GROUP BY c.ciudad, cat.nombre_categoria ORDER BY c.ciudad ASC, monto_vendido DESC, cat.nombre_categoria ASC;',
    sort_order = 40
WHERE id = 'e0000000-0000-0000-0000-000000000039';
UPDATE public.exercise_hints
SET content = 'Necesitas recorrer la cadena completa desde clientes hasta categorías pasando por pedidos, detalle de pedidos y productos.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000039' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Agrupa por c.ciudad y cat.nombre_categoria, suma dp.cantidad * dp.precio_unitario como monto_vendido y ordena por ciudad ASC, monto_vendido DESC y nombre_categoria ASC.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000039' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT c.ciudad, cat.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS monto_vendido FROM clientes c INNER JOIN pedidos p ON c.cliente_id = p.cliente_id INNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id INNER JOIN productos pr ON dp.producto_id = pr.producto_id INNER JOIN categorias cat ON pr.??? = cat.??? GROUP BY c.ciudad, cat.nombre_categoria ORDER BY c.ciudad ASC, monto_vendido DESC, cat.nombre_categoria ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000039' AND hint_order = 3;

-- Reto #41: Conciliación de pedidos, facturación y pagos
UPDATE public.exercises
SET title = 'Conciliación de pedidos, facturación y pagos',
    prompt = 'Verifica el flujo completo de una compra: el pedido, su factura y su cobro. Conecta `pedidos` con `facturas` y `pagos`, mostrando `pedido_id`, `cliente_id`, el monto de la factura bajo el nombre `monto_factura`, el monto del pago bajo `monto_pago` y el `metodo_pago`. Ordena por `pedido_id` ascendente.',
    initial_code = '-- Cruza pedidos con facturas y pagos
SELECT ',
    solution_query = 'SELECT p.pedido_id, p.cliente_id, f.monto_total AS monto_factura, pg.monto AS monto_pago, pg.metodo_pago FROM pedidos p INNER JOIN facturas f ON p.pedido_id = f.pedido_id INNER JOIN pagos pg ON f.factura_id = pg.factura_id ORDER BY p.pedido_id ASC;',
    sort_order = 41
WHERE id = 'e0000000-0000-0000-0000-000000000040';
UPDATE public.exercise_hints
SET content = 'Enlaza tres tablas en secuencia: la orden conecta con su factura y la factura conecta con su pago.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000040' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Asigna los alias monto_factura a f.monto_total y monto_pago a pg.monto, y ordena por p.pedido_id ascendente.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000040' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT p.pedido_id, p.cliente_id, f.monto_total AS monto_factura, pg.monto AS monto_pago, pg.metodo_pago FROM pedidos p INNER JOIN facturas f ON p.??? = f.??? INNER JOIN pagos pg ON f.??? = pg.??? ORDER BY p.pedido_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000040' AND hint_order = 3;

-- Reto #42: Trazabilidad física de inventario por almacén
UPDATE public.exercises
SET title = 'Trazabilidad física de inventario por almacén',
    prompt = 'Consulta la disponibilidad física de inventario por almacén. Conecta `productos`, `inventario` y `almacenes`, mostrando `nombre_producto`, `nombre_almacen`, la `ciudad` del almacén y la `cantidad_disponible`, filtrando únicamente aquellos registros con más de 10 unidades. Ordena por nombre de producto y luego por almacén.',
    initial_code = '-- Conecta productos, inventario y almacenes
SELECT ',
    solution_query = 'SELECT pr.nombre_producto, a.nombre_almacen, a.ciudad, i.cantidad_disponible FROM productos pr INNER JOIN inventario i ON pr.producto_id = i.producto_id INNER JOIN almacenes a ON i.almacen_id = a.almacen_id WHERE i.cantidad_disponible > 10 ORDER BY pr.nombre_producto ASC, a.nombre_almacen ASC;',
    sort_order = 42
WHERE id = 'e0000000-0000-0000-0000-000000000041';
UPDATE public.exercise_hints
SET content = 'Conecta productos con almacenes usando la tabla puente de existencias físicas y aplica el filtro de mayor a 10 unidades.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000041' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Filtra con WHERE i.cantidad_disponible > 10 y ordena alfabéticamente por nombre_producto ASC y luego nombre_almacen ASC.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000041' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT pr.nombre_producto, a.nombre_almacen, a.ciudad, i.cantidad_disponible FROM productos pr INNER JOIN inventario i ON pr.??? = i.??? INNER JOIN almacenes a ON i.??? = a.??? WHERE i.cantidad_disponible > 10 ORDER BY pr.nombre_producto ASC, a.nombre_almacen ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000041' AND hint_order = 3;

-- Reto #43: Directorio operativo unificado (UNION)
UPDATE public.exercises
SET title = 'Directorio operativo unificado (UNION)',
    prompt = 'Crea una lista unificada de todas las ciudades donde tenemos presencia, indicando si la presencia es de clientes o de almacenes. Combina con `UNION` la ciudad y la etiqueta `''cliente''` como `tipo_entidad` de la tabla `clientes`, con la ciudad y la etiqueta `''almacen''` como `tipo_entidad` de la tabla `almacenes`. Ordena por ciudad y por tipo de entidad.',
    initial_code = '-- Combina ciudades de clientes y almacenes con UNION
SELECT ',
    solution_query = 'SELECT ciudad, ''cliente'' AS tipo_entidad FROM clientes UNION SELECT ciudad, ''almacen'' AS tipo_entidad FROM almacenes ORDER BY ciudad ASC, tipo_entidad ASC;',
    sort_order = 43
WHERE id = 'e0000000-0000-0000-0000-000000000042';
UPDATE public.exercise_hints
SET content = 'Construye dos consultas SELECT independientes con la misma estructura de columnas y combínalas verticalmente con UNION.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000042' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'En cada SELECT incluye una etiqueta de texto literal con el alias tipo_entidad (''cliente'' y ''almacen'') y coloca un único ORDER BY al final.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000042' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ciudad, ''cliente'' AS tipo_entidad FROM clientes UNION SELECT ???, ''almacen'' AS tipo_entidad FROM almacenes ORDER BY ciudad ASC, tipo_entidad ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000042' AND hint_order = 3;

-- Reto #44: Ciudades con clientes y almacenes (INTERSECT)
UPDATE public.exercises
SET title = 'Ciudades con clientes y almacenes (INTERSECT)',
    prompt = 'Logística quiere identificar en qué ciudades coincidimos teniendo tanto clientes registrados como al menos un almacén físico. Usa el operador de conjuntos `INTERSECT` entre las ciudades de `clientes` y las ciudades de `almacenes`, ordenando el resultado alfabéticamente por `ciudad` ascendente.',
    initial_code = '-- Intersección de conjuntos con INTERSECT
SELECT ',
    solution_query = 'SELECT ciudad FROM clientes INTERSECT SELECT ciudad FROM almacenes ORDER BY ciudad ASC;',
    sort_order = 44
WHERE id = 'e0000000-0000-0000-0000-000000000054';
UPDATE public.exercise_hints
SET content = 'Para hallar elementos presentes en ambos conjuntos a la vez, separa dos consultas SELECT simples con INTERSECT.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000054' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Muestra ciudad desde la primera tabla, escribe INTERSECT, muestra ciudad desde la segunda y coloca ORDER BY ciudad ASC al final.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000054' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ??? FROM clientes INTERSECT SELECT ??? FROM almacenes ORDER BY ciudad ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000054' AND hint_order = 3;

-- Reto #45: Ciudades sin presencia de almacenes (EXCEPT)
UPDATE public.exercises
SET title = 'Ciudades sin presencia de almacenes (EXCEPT)',
    prompt = 'Encuentra ciudades donde tengamos clientes pero todavía NO tengamos ningún almacén logístico. Usa el operador de diferencia `EXCEPT` para restar a las ciudades de `clientes` las ciudades de `almacenes`, ordenando la lista alfabéticamente.',
    initial_code = '-- Diferencia de conjuntos con EXCEPT
SELECT ',
    solution_query = 'SELECT ciudad FROM clientes EXCEPT SELECT ciudad FROM almacenes ORDER BY ciudad ASC;',
    sort_order = 45
WHERE id = 'e0000000-0000-0000-0000-000000000043';
UPDATE public.exercise_hints
SET content = 'Para restar un conjunto de resultados de otro sin usar uniones, coloca el operador EXCEPT entre dos consultas SELECT equivalentes.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000043' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Pon primero las ciudades de clientes, luego EXCEPT, luego las ciudades de almacenes y ordena el resultado alfabéticamente.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000043' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT ciudad FROM clientes EXCEPT SELECT ??? FROM almacenes ORDER BY ciudad ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000043' AND hint_order = 3;

-- Reto #46: Matriz de cobertura Almacén-Categoría (CROSS JOIN)
UPDATE public.exercises
SET title = 'Matriz de cobertura Almacén-Categoría (CROSS JOIN)',
    prompt = 'Genera todas las combinaciones posibles entre cada almacén y cada categoría de productos. Usa un `CROSS JOIN` entre `almacenes` y `categorias`, mostrando `nombre_almacen` y `nombre_categoria`, ordenando por almacén y por categoría.',
    initial_code = '-- Genera el producto cartesiano con CROSS JOIN
SELECT ',
    solution_query = 'SELECT a.nombre_almacen, c.nombre_categoria FROM almacenes a CROSS JOIN categorias c ORDER BY a.nombre_almacen ASC, c.nombre_categoria ASC;',
    sort_order = 46
WHERE id = 'e0000000-0000-0000-0000-000000000044';
UPDATE public.exercise_hints
SET content = 'Para obtener todas las combinaciones posibles entre dos catálogos independientes, CROSS JOIN no lleva condición ON.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000044' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Conecta almacenes y categorias con CROSS JOIN y ordena por nombre_almacen ASC y nombre_categoria ASC.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000044' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT a.nombre_almacen, c.nombre_categoria FROM almacenes a CROSS JOIN categorias c ORDER BY ??? ASC, ??? ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000044' AND hint_order = 3;

-- Reto #47: Pares de productos de la misma categoría (SELF JOIN)
UPDATE public.exercises
SET title = 'Pares de productos de la misma categoría (SELF JOIN)',
    prompt = 'Genera sugerencias de productos emparejados dentro de la misma categoría. Cruza la tabla `productos` consigo misma (`p1` y `p2`) para emparejar artículos con la misma `categoria_id`, pidiendo que `p1.producto_id < p2.producto_id` para no emparejar un producto consigo mismo ni repetir la pareja al revés. Muestra `categoria_id`, los nombres como `producto_a` y `producto_b`, y los precios como `precio_a` y `precio_b`. Ordena por categoría y nombres.',
    initial_code = '-- Auto-cruce de productos con condición de desigualdad
SELECT ',
    solution_query = 'SELECT p1.categoria_id, p1.nombre_producto AS producto_a, p2.nombre_producto AS producto_b, p1.precio AS precio_a, p2.precio AS precio_b FROM productos p1 INNER JOIN productos p2 ON p1.categoria_id = p2.categoria_id AND p1.producto_id < p2.producto_id ORDER BY p1.categoria_id ASC, producto_a ASC, producto_b ASC;',
    sort_order = 47
WHERE id = 'e0000000-0000-0000-0000-000000000045';
UPDATE public.exercise_hints
SET content = 'Une la tabla de productos consigo misma usando dos alias distintos (p1 y p2) para comparar parejas de la misma categoría.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000045' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Además de igualar categoria_id, agrega p1.producto_id < p2.producto_id en el ON para evitar pares repetidos o consigo mismo.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000045' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT p1.categoria_id, p1.nombre_producto AS producto_a, p2.nombre_producto AS producto_b, p1.precio AS precio_a, p2.precio AS precio_b FROM productos p1 INNER JOIN productos p2 ON p1.categoria_id = p2.categoria_id AND p1.??? < p2.??? ORDER BY p1.categoria_id ASC, producto_a ASC, producto_b ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000045' AND hint_order = 3;

-- Reto #48: Productos sobre el promedio de precio
UPDATE public.exercises
SET title = 'Productos sobre el promedio de precio',
    prompt = '¿Qué productos se venden por encima del precio promedio de toda la tienda? Muestra el `nombre_producto` y su `precio` para aquellos artículos cuyo precio sea mayor al promedio general de precios de la tabla `productos`. Ordena de mayor a menor precio y, en caso de empate, alfabéticamente por `nombre_producto`.',
    initial_code = '-- Usa una subconsulta para comparar con el promedio global
SELECT ',
    solution_query = 'SELECT nombre_producto, precio FROM productos WHERE precio > (SELECT AVG(precio) FROM productos) ORDER BY precio DESC, nombre_producto ASC;',
    sort_order = 48
WHERE id = 'e0000000-0000-0000-0000-000000000015';
UPDATE public.exercise_hints
SET content = 'Calcula primero el promedio global de precios dentro de una subconsulta entre paréntesis en la cláusula WHERE.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000015' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Compara precio > (SELECT AVG(precio) FROM productos) y ordena del más caro al más barato desempatando por nombre_producto.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000015' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT nombre_producto, precio FROM productos WHERE precio > (SELECT AVG(???) FROM productos) ORDER BY precio DESC, nombre_producto ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000015' AND hint_order = 3;

-- Reto #49: Clientes con pedidos de alto monto (subconsulta con IN)
UPDATE public.exercises
SET title = 'Clientes con pedidos de alto monto (subconsulta con IN)',
    prompt = 'Identifica a nuestros clientes VIP: aquellos que han hecho al menos un pedido importante (de 1000€ o más). Consulta la tabla `clientes` y muestra `cliente_id`, `nombre`, `apellido` y `email`, filtrando con una subconsulta usando el operador `IN` sobre la tabla `pedidos`. Ordena por `cliente_id` ascendente.',
    initial_code = '-- Filtra clientes con una subconsulta en IN
SELECT ',
    solution_query = 'SELECT cliente_id, nombre, apellido, email FROM clientes WHERE cliente_id IN (SELECT cliente_id FROM pedidos WHERE total >= 1000) ORDER BY cliente_id ASC;',
    sort_order = 49
WHERE id = 'e0000000-0000-0000-0000-000000000046';
UPDATE public.exercise_hints
SET content = 'Genera en una subconsulta la lista de identificadores de clientes que tienen al menos un pedido de 1000€ o más.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000046' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa WHERE cliente_id IN (...) sobre la subconsulta de pedidos filtrada por total >= 1000 y ordena por cliente_id ascendente.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000046' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT cliente_id, nombre, apellido, email FROM clientes WHERE cliente_id IN (SELECT ??? FROM pedidos WHERE total >= 1000) ORDER BY cliente_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000046' AND hint_order = 3;

-- Reto #50: Comprobación de existencia eficiente (EXISTS)
UPDATE public.exercises
SET title = 'Comprobación de existencia eficiente (EXISTS)',
    prompt = 'Premia a los clientes activos que tengan al menos una compra completada. Muestra el `cliente_id`, `nombre` y `apellido` de aquellos clientes para los que exista al menos un pedido con `estado_pedido = ''completado''`, usando una subconsulta con `EXISTS`. Ordena por `cliente_id` ascendente.',
    initial_code = '-- Subconsulta correlacionada con EXISTS
SELECT ',
    solution_query = 'SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c WHERE EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.cliente_id AND p.estado_pedido = ''completado'') ORDER BY c.cliente_id ASC;',
    sort_order = 50
WHERE id = 'e0000000-0000-0000-0000-000000000047';
UPDATE public.exercise_hints
SET content = 'Para verificar si existe al menos un pedido completado por cada cliente sin duplicar filas, usa una subconsulta correlacionada con EXISTS.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000047' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Dentro de EXISTS (SELECT 1 FROM pedidos p ...), conecta p.cliente_id = c.cliente_id junto con estado_pedido = ''completado''.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000047' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c WHERE EXISTS (SELECT 1 FROM pedidos p WHERE p.??? = c.??? AND p.estado_pedido = ''completado'') ORDER BY c.cliente_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000047' AND hint_order = 3;

-- Reto #51: Clientes sin pedidos completados (NOT EXISTS)
UPDATE public.exercises
SET title = 'Clientes sin pedidos completados (NOT EXISTS)',
    prompt = 'Fidelización busca contactar a los clientes que aún no cuentan con ninguna compra completada (ya sea porque nunca compraron o porque sus órdenes fueron canceladas o están pendientes). Muestra `cliente_id`, `nombre` y `apellido` de `clientes` usando una subconsulta correlacionada con `NOT EXISTS` sobre `pedidos` filtrando por `estado_pedido = ''completado''`. Ordena por `cliente_id` ascendente.',
    initial_code = '-- Subconsulta correlacionada negativa con NOT EXISTS
SELECT ',
    solution_query = 'SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.cliente_id AND p.estado_pedido = ''completado'') ORDER BY c.cliente_id ASC;',
    sort_order = 51
WHERE id = 'e0000000-0000-0000-0000-000000000055';
UPDATE public.exercise_hints
SET content = 'Utiliza WHERE NOT EXISTS (...) para conservar únicamente las filas de la consulta externa que no encuentren ninguna coincidencia interna.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000055' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Dentro de la subconsulta correlaciona p.cliente_id = c.cliente_id y exige p.estado_pedido = ''completado''.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000055' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.??? = c.??? AND p.estado_pedido = ''completado'') ORDER BY c.cliente_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000055' AND hint_order = 3;

-- Reto #52: Segmentación de pedidos por monto
UPDATE public.exercises
SET title = 'Segmentación de pedidos por monto',
    prompt = 'Clasifica los pedidos según su valor para organizar la entrega. Muestra el `pedido_id`, el `total` y una nueva columna llamada `segmento` que diga: si el total es de 1000€ o más asigna `''Alto Valor''`, si es de 300€ o más asigna `''Medio Valor''`, y para el resto `''Bajo Valor''`. Ordena de mayor a menor total y, en caso de empate, por `pedido_id` ascendente.',
    initial_code = '-- Clasifica los pedidos en tres segmentos según su monto
SELECT ',
    solution_query = 'SELECT pedido_id, total, CASE WHEN total >= 1000 THEN ''Alto Valor'' WHEN total >= 300 THEN ''Medio Valor'' ELSE ''Bajo Valor'' END AS segmento FROM pedidos ORDER BY total DESC, pedido_id ASC;',
    sort_order = 52
WHERE id = 'e0000000-0000-0000-0000-000000000016';
UPDATE public.exercise_hints
SET content = 'Evalúa los rangos de mayor a menor usando una expresión condicional CASE WHEN ... THEN ... ELSE ... END.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000016' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Recuerda poner primero el umbral más alto (>= 1000), luego el intermedio (>= 300) y cerrar con ELSE ''Bajo Valor'' END AS segmento.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000016' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT pedido_id, total, CASE WHEN total >= 1000 THEN ''Alto Valor'' WHEN total >= 300 THEN ''Medio Valor'' ELSE ''Bajo Valor'' END AS segmento FROM pedidos ORDER BY total DESC, ??? ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000016' AND hint_order = 3;

-- Reto #53: Resumen de ventas por estado (agregación condicional)
UPDATE public.exercises
SET title = 'Resumen de ventas por estado (agregación condicional)',
    prompt = 'Crea una tabla resumen que muestre cuánto dinero tiene cada cliente en compras completadas y cuánto en compras pendientes. Muestra el `cliente_id`, la suma de compras completadas bajo el nombre `ventas_completadas` (sumando el total cuando el estado sea `''completado''` y 0 si no) y la suma de compras pendientes bajo `ventas_pendientes` (sumando el total cuando sea `''pendiente''` y 0 si no). Agrupa y ordena por `cliente_id` ascendente.',
    initial_code = '-- Agregación condicional con CASE dentro de SUM
SELECT ',
    solution_query = 'SELECT cliente_id, SUM(CASE WHEN estado_pedido = ''completado'' THEN total ELSE 0 END) AS ventas_completadas, SUM(CASE WHEN estado_pedido = ''pendiente'' THEN total ELSE 0 END) AS ventas_pendientes FROM pedidos GROUP BY cliente_id ORDER BY cliente_id ASC;',
    sort_order = 53
WHERE id = 'e0000000-0000-0000-0000-000000000048';
UPDATE public.exercise_hints
SET content = 'Coloca una expresión CASE dentro de cada función SUM() para acumular solo los importes que correspondan a cada estado.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000048' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Cuando el estado no coincida devuelve 0 en el ELSE, agrupa por cliente_id y ordena de forma ascendente.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000048' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT cliente_id, SUM(CASE WHEN estado_pedido = ''completado'' THEN ??? ELSE 0 END) AS ventas_completadas, SUM(CASE WHEN estado_pedido = ''pendiente'' THEN ??? ELSE 0 END) AS ventas_pendientes FROM pedidos GROUP BY cliente_id ORDER BY cliente_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000048' AND hint_order = 3;

-- Reto #54: Conteo de productos por nivel de precio (COUNT + CASE)
UPDATE public.exercises
SET title = 'Conteo de productos por nivel de precio (COUNT + CASE)',
    prompt = 'Clasifica la composición del catálogo por categoría contando cuántos artículos de cada una pertenecen al rango premium (`precio >= 500`) y cuántos al rango estándar (`precio < 500`). Une `categorias` y `productos` con `LEFT JOIN`, muestra `nombre_categoria`, `productos_premium` y `productos_estandar` usando `COUNT(CASE WHEN ... THEN 1 END)`. Agrupa por categoría y ordena por `categoria_id` ascendente.',
    initial_code = '-- Conteo condicional combinando COUNT y CASE
SELECT ',
    solution_query = 'SELECT c.nombre_categoria, COUNT(CASE WHEN p.precio >= 500 THEN 1 END) AS productos_premium, COUNT(CASE WHEN p.precio < 500 THEN 1 END) AS productos_estandar FROM categorias c LEFT JOIN productos p ON c.categoria_id = p.categoria_id GROUP BY c.categoria_id, c.nombre_categoria ORDER BY c.categoria_id ASC;',
    sort_order = 54
WHERE id = 'e0000000-0000-0000-0000-000000000056';
UPDATE public.exercise_hints
SET content = 'Como COUNT() ignora los valores NULL, puedes devolver 1 en THEN cuando la condición se cumpla y omitir el ELSE (que queda NULL).'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000056' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Combina LEFT JOIN productos p, agrupa por c.categoria_id y c.nombre_categoria, y usa COUNT(CASE WHEN p.precio >= 500 THEN 1 END).'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000056' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT c.nombre_categoria, COUNT(CASE WHEN p.??? >= 500 THEN 1 END) AS productos_premium, COUNT(CASE WHEN p.??? < 500 THEN 1 END) AS productos_estandar FROM categorias c LEFT JOIN productos p ON c.??? = p.??? GROUP BY c.categoria_id, c.nombre_categoria ORDER BY c.categoria_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000056' AND hint_order = 3;

-- Reto #55: Facturación por categoría con CTE
UPDATE public.exercises
SET title = 'Facturación por categoría con CTE',
    prompt = 'Prepara un reporte ordenado de facturación por categoría usando una expresión `WITH` (CTE). Crea una tabla temporal llamada `ventas_por_categoria` que sume las ventas (`SUM(dp.cantidad * dp.precio_unitario)`) como `facturacion` agrupando por `nombre_categoria`. Luego, consulta esa tabla temporal para mostrar `nombre_categoria` y `facturacion` ordenados de mayor a menor facturación y, en caso de empate, alfabéticamente por `nombre_categoria`.',
    initial_code = '-- Estructura la consulta analítica usando WITH ... AS
WITH ',
    solution_query = 'WITH ventas_por_categoria AS (SELECT c.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS facturacion FROM categorias c INNER JOIN productos pr ON c.categoria_id = pr.categoria_id INNER JOIN detalle_pedidos dp ON pr.producto_id = dp.producto_id GROUP BY c.nombre_categoria) SELECT nombre_categoria, facturacion FROM ventas_por_categoria ORDER BY facturacion DESC, nombre_categoria ASC;',
    sort_order = 55
WHERE id = 'e0000000-0000-0000-0000-000000000017';
UPDATE public.exercise_hints
SET content = 'Define primero el bloque temporal WITH ventas_por_categoria AS (...) cruzando categorias, productos y detalle_pedidos.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000017' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Dentro de la CTE agrupa por c.nombre_categoria calculando SUM(dp.cantidad * dp.precio_unitario) AS facturacion, y luego consulta esa CTE.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000017' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'WITH ventas_por_categoria AS (SELECT c.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS facturacion FROM categorias c INNER JOIN productos pr ON c.categoria_id = pr.categoria_id INNER JOIN detalle_pedidos dp ON pr.producto_id = dp.producto_id GROUP BY c.nombre_categoria) SELECT nombre_categoria, facturacion FROM ventas_por_categoria ORDER BY facturacion DESC, ??? ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000017' AND hint_order = 3;

-- Reto #56: CTEs múltiples encadenadas (análisis por etapas)
UPDATE public.exercises
SET title = 'CTEs múltiples encadenadas (análisis por etapas)',
    prompt = 'Construye un análisis por pasos usando dos CTEs encadenadas para encontrar a los clientes que gastan más que el promedio de todos los clientes. Primero crea `gasto_clientes` con el `cliente_id` y su gasto total (`SUM(total) AS total_gastado`). Luego crea `promedio_general` que calcule el promedio (`AVG(total_gastado) AS gasto_medio`) a partir de la primera. Finalmente, muestra `cliente_id` y `total_gastado` de aquellos clientes cuyo gasto supere el promedio general, ordenados de mayor a menor gasto y, en caso de empate, por `cliente_id` ascendente.',
    initial_code = '-- Encadena dos CTEs separadas por coma
WITH ',
    solution_query = 'WITH gasto_clientes AS (SELECT cliente_id, SUM(total) AS total_gastado FROM pedidos GROUP BY cliente_id), promedio_general AS (SELECT AVG(total_gastado) AS gasto_medio FROM gasto_clientes) SELECT g.cliente_id, g.total_gastado FROM gasto_clientes g CROSS JOIN promedio_general p WHERE g.total_gastado > p.gasto_medio ORDER BY g.total_gastado DESC, g.cliente_id ASC;',
    sort_order = 56
WHERE id = 'e0000000-0000-0000-0000-000000000049';
UPDATE public.exercise_hints
SET content = 'Declara dos tablas temporales en una sola cláusula WITH separándolas por una coma (sin repetir WITH), donde la segunda calcule el AVG() leyendo de la primera.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000049' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Une gasto_clientes g con la CTE escalar promedio_general p mediante CROSS JOIN (o compárala en WHERE) filtrando WHERE g.total_gastado > p.gasto_medio y ordena con desempate.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000049' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'WITH gasto_clientes AS (SELECT cliente_id, SUM(total) AS total_gastado FROM pedidos GROUP BY cliente_id), promedio_general AS (SELECT AVG(total_gastado) AS gasto_medio FROM gasto_clientes) SELECT g.cliente_id, g.total_gastado FROM gasto_clientes g CROSS JOIN promedio_general p WHERE g.total_gastado > p.??? ORDER BY g.total_gastado DESC, g.cliente_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000049' AND hint_order = 3;

-- Reto #57: Evolución mensual de ventas con CTE (TO_CHAR)
UPDATE public.exercises
SET title = 'Evolución mensual de ventas con CTE (TO_CHAR)',
    prompt = 'Dirección necesita una serie mensual de ingresos de pedidos completados. Define una CTE llamada `pedidos_mensuales` que transforme la fecha al formato año-mes con `TO_CHAR(fecha_pedido, ''YYYY-MM'') AS mes`, cuente los pedidos como `total_pedidos` y sume el total como `ingresos_mensuales` filtrando `estado_pedido = ''completado''`. Luego consulta esa CTE mostrando `mes`, `total_pedidos` e `ingresos_mensuales`, ordenados cronológicamente por `mes ASC`.',
    initial_code = '-- Agrupación temporal por mes estructurada en una CTE
WITH ',
    solution_query = 'WITH pedidos_mensuales AS (SELECT TO_CHAR(fecha_pedido, ''YYYY-MM'') AS mes, COUNT(*) AS total_pedidos, SUM(total) AS ingresos_mensuales FROM pedidos WHERE estado_pedido = ''completado'' GROUP BY TO_CHAR(fecha_pedido, ''YYYY-MM'')) SELECT mes, total_pedidos, ingresos_mensuales FROM pedidos_mensuales ORDER BY mes ASC;',
    sort_order = 57
WHERE id = 'e0000000-0000-0000-0000-000000000057';
UPDATE public.exercise_hints
SET content = 'Extrae el periodo mensual con TO_CHAR(fecha_pedido, ''YYYY-MM'') tanto en el SELECT como en el GROUP BY dentro de la CTE.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000057' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Filtra primero estado_pedido = ''completado'' dentro de pedidos_mensuales y ordena la selección final por mes ASC.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000057' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'WITH pedidos_mensuales AS (SELECT TO_CHAR(fecha_pedido, ''YYYY-MM'') AS mes, COUNT(*) AS total_pedidos, SUM(???) AS ingresos_mensuales FROM pedidos WHERE ??? = ''completado'' GROUP BY TO_CHAR(fecha_pedido, ''YYYY-MM'')) SELECT mes, total_pedidos, ingresos_mensuales FROM pedidos_mensuales ORDER BY mes ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000057' AND hint_order = 3;

-- Reto #58: Categorías sobre el promedio de facturación (CTE + subconsulta)
UPDATE public.exercises
SET title = 'Categorías sobre el promedio de facturación (CTE + subconsulta)',
    prompt = 'Identifica qué categorías facturan por encima del promedio de todas las categorías. Crea una CTE llamada `facturacion_categoria` que sume las líneas de venta (`SUM(dp.cantidad * dp.precio_unitario) AS facturacion`) agrupando por `c.categoria_id` y `c.nombre_categoria`. En la consulta final, muestra `nombre_categoria` y `facturacion` filtrando aquellas cuyo valor supere `(SELECT AVG(facturacion) FROM facturacion_categoria)`. Ordena de mayor a menor `facturacion` y desempata por `nombre_categoria` ascendente.',
    initial_code = '-- Reutiliza la misma CTE en una subconsulta escalar
WITH ',
    solution_query = 'WITH facturacion_categoria AS (SELECT c.categoria_id, c.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS facturacion FROM categorias c INNER JOIN productos pr ON c.categoria_id = pr.categoria_id INNER JOIN detalle_pedidos dp ON pr.producto_id = dp.producto_id GROUP BY c.categoria_id, c.nombre_categoria) SELECT nombre_categoria, facturacion FROM facturacion_categoria WHERE facturacion > (SELECT AVG(facturacion) FROM facturacion_categoria) ORDER BY facturacion DESC, nombre_categoria ASC;',
    sort_order = 58
WHERE id = 'e0000000-0000-0000-0000-000000000058';
UPDATE public.exercise_hints
SET content = 'Una CTE puede referenciarse varias veces en la consulta principal: úsala tanto en el FROM como dentro de una subconsulta escalar en el WHERE.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000058' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Compara WHERE facturacion > (SELECT AVG(facturacion) FROM facturacion_categoria) y ordena por facturacion DESC, nombre_categoria ASC.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000058' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'WITH facturacion_categoria AS (SELECT c.categoria_id, c.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS facturacion FROM categorias c INNER JOIN productos pr ON c.categoria_id = pr.categoria_id INNER JOIN detalle_pedidos dp ON pr.producto_id = dp.producto_id GROUP BY c.categoria_id, c.nombre_categoria) SELECT nombre_categoria, facturacion FROM facturacion_categoria WHERE facturacion > (SELECT AVG(???) FROM facturacion_categoria) ORDER BY facturacion DESC, ??? ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000058' AND hint_order = 3;

-- Reto #59: Ranking de productos por precio (ROW_NUMBER)
UPDATE public.exercises
SET title = 'Ranking de productos por precio (ROW_NUMBER)',
    prompt = 'Crea una lista clasificada de productos del más caro al más económico. Muestra `producto_id`, `nombre_producto`, `precio` y una columna llamada `ranking` con la posición consecutiva (1, 2, 3...) de cada producto usando `ROW_NUMBER()` ordenado por precio descendente (desempatando por `producto_id` ascendente), y ordena el resultado final por `ranking` ascendente.',
    initial_code = '-- Emplea ROW_NUMBER() OVER (...)
SELECT ',
    solution_query = 'SELECT producto_id, nombre_producto, precio, ROW_NUMBER() OVER (ORDER BY precio DESC, producto_id ASC) AS ranking FROM productos ORDER BY ranking ASC;',
    sort_order = 59
WHERE id = 'e0000000-0000-0000-0000-000000000007';
UPDATE public.exercise_hints
SET content = 'Utiliza la función de ventana ROW_NUMBER() acompañada de OVER (...) para numerar cada producto sin colapsar las filas.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000007' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Dentro de OVER define ORDER BY precio DESC, producto_id ASC para desempatar precios iguales, y ordena la consulta final por ranking ASC.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000007' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT producto_id, nombre_producto, precio, ROW_NUMBER() OVER (ORDER BY precio DESC, ??? ASC) AS ranking FROM productos ORDER BY ranking ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000007' AND hint_order = 3;

-- Reto #60: Ranking relativo por categoría (DENSE_RANK)
UPDATE public.exercises
SET title = 'Ranking relativo por categoría (DENSE_RANK)',
    prompt = 'Clasifica los productos dentro de cada categoría del más caro al más barato. Muestra `categoria_id`, `nombre_producto`, `precio` y una columna con el puesto que ocupa llamada `ranking_categoria` usando `DENSE_RANK()`, dividiendo por categoría y ordenando de mayor a menor precio. Ordena por `categoria_id ASC`, `ranking_categoria ASC` y `nombre_producto ASC`.',
    initial_code = '-- Usa DENSE_RANK() particionado por categoria_id
SELECT ',
    solution_query = 'SELECT categoria_id, nombre_producto, precio, DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria FROM productos ORDER BY categoria_id ASC, ranking_categoria ASC, nombre_producto ASC;',
    sort_order = 60
WHERE id = 'e0000000-0000-0000-0000-000000000018';
UPDATE public.exercise_hints
SET content = 'Usa DENSE_RANK() con PARTITION BY dentro de OVER (...) para reiniciar el ranking en cada categoría sin dejar huecos ante empates.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000018' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Particiona por categoria_id y ordena internamente por precio DESC; al final ordena por categoria_id, ranking_categoria y nombre_producto.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000018' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT categoria_id, nombre_producto, precio, DENSE_RANK() OVER (PARTITION BY ??? ORDER BY precio DESC) AS ranking_categoria FROM productos ORDER BY categoria_id ASC, ranking_categoria ASC, nombre_producto ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000018' AND hint_order = 3;

-- Reto #61: Producto más caro por categoría (CTE + ROW_NUMBER)
UPDATE public.exercises
SET title = 'Producto más caro por categoría (CTE + ROW_NUMBER)',
    prompt = 'Encuentra el artículo líder en precio dentro de cada categoría. Crea una CTE `ranking_productos` que proyecte `categoria_id`, `nombre_producto`, `precio` y `ROW_NUMBER() OVER (PARTITION BY categoria_id ORDER BY precio DESC, producto_id ASC) AS posicion` desde `productos`. Luego selecciona `categoria_id`, `nombre_producto` y `precio` filtrando únicamente `WHERE posicion = 1` y ordenando por `categoria_id ASC`.',
    initial_code = '-- Patrón de artículo líder por categoría combinando CTE y ROW_NUMBER()
WITH ',
    solution_query = 'WITH ranking_productos AS (SELECT categoria_id, nombre_producto, precio, ROW_NUMBER() OVER (PARTITION BY categoria_id ORDER BY precio DESC, producto_id ASC) AS posicion FROM productos) SELECT categoria_id, nombre_producto, precio FROM ranking_productos WHERE posicion = 1 ORDER BY categoria_id ASC;',
    sort_order = 61
WHERE id = 'e0000000-0000-0000-0000-000000000059';
UPDATE public.exercise_hints
SET content = 'Las funciones de ventana no pueden filtrarse directamente en el WHERE de la misma consulta; envuélvelas primero en una CTE.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000059' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Dentro de OVER particiona por categoria_id y ordena por precio DESC, producto_id ASC; en el SELECT externo filtra WHERE posicion = 1.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000059' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'WITH ranking_productos AS (SELECT categoria_id, nombre_producto, precio, ROW_NUMBER() OVER (PARTITION BY ??? ORDER BY precio DESC, ??? ASC) AS posicion FROM productos) SELECT categoria_id, nombre_producto, precio FROM ranking_productos WHERE posicion = 1 ORDER BY categoria_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000059' AND hint_order = 3;

-- Reto #62: Ingresos acumulados progresivos (SUM OVER)
UPDATE public.exercises
SET title = 'Ingresos acumulados progresivos (SUM OVER)',
    prompt = 'Calcula la curva acumulada de facturación pedido a pedido. Para los pedidos con `estado_pedido = ''completado''`, muestra `pedido_id`, `fecha_pedido`, `total` y una columna llamada `ingresos_acumulados` usando `SUM(total) OVER (ORDER BY fecha_pedido ASC, pedido_id ASC)`. Ordena la salida por `fecha_pedido ASC` y `pedido_id ASC`.',
    initial_code = '-- Total acumulado progresivo con SUM() OVER
SELECT ',
    solution_query = 'SELECT pedido_id, fecha_pedido, total, SUM(total) OVER (ORDER BY fecha_pedido ASC, pedido_id ASC) AS ingresos_acumulados FROM pedidos WHERE estado_pedido = ''completado'' ORDER BY fecha_pedido ASC, pedido_id ASC;',
    sort_order = 62
WHERE id = 'e0000000-0000-0000-0000-000000000060';
UPDATE public.exercise_hints
SET content = 'Cuando SUM() lleva OVER (ORDER BY ...) se comporta como función de ventana y va sumando fila tras fila en vez de colapsar toda la tabla.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000060' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Filtra estado_pedido = ''completado'' en WHERE y usa SUM(total) OVER (ORDER BY fecha_pedido ASC, pedido_id ASC) AS ingresos_acumulados.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000060' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT pedido_id, fecha_pedido, total, SUM(???) OVER (ORDER BY fecha_pedido ASC, ??? ASC) AS ingresos_acumulados FROM pedidos WHERE ??? = ''completado'' ORDER BY fecha_pedido ASC, pedido_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000060' AND hint_order = 3;

-- Reto #63: Análisis de intervalo temporal entre pedidos (LAG)
UPDATE public.exercises
SET title = 'Análisis de intervalo temporal entre pedidos (LAG)',
    prompt = 'Analiza cuánto tiempo pasa entre una compra y otra para cada cliente. Muestra el `pedido_id`, `cliente_id`, la `fecha_pedido` y el valor de la fecha del pedido inmediatamente anterior bajo el nombre `fecha_pedido_anterior`, usando la función de ventana `LAG(fecha_pedido)` dividiendo por cliente y ordenando cronológicamente (`fecha_pedido ASC, pedido_id ASC`). Ordena los resultados finales por `cliente_id ASC`, `fecha_pedido ASC` y `pedido_id ASC`.',
    initial_code = '-- Emplea LAG() OVER (PARTITION BY ... ORDER BY ...)
SELECT ',
    solution_query = 'SELECT pedido_id, cliente_id, fecha_pedido, LAG(fecha_pedido) OVER (PARTITION BY cliente_id ORDER BY fecha_pedido ASC, pedido_id ASC) AS fecha_pedido_anterior FROM pedidos ORDER BY cliente_id ASC, fecha_pedido ASC, pedido_id ASC;',
    sort_order = 63
WHERE id = 'e0000000-0000-0000-0000-000000000050';
UPDATE public.exercise_hints
SET content = 'La función de ventana LAG() te permite leer la fecha de la fila anterior dentro de la partición de cada cliente.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000050' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa PARTITION BY cliente_id y ORDER BY fecha_pedido ASC, pedido_id ASC tanto en la ventana OVER como al final de la consulta.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000050' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'SELECT pedido_id, cliente_id, fecha_pedido, LAG(fecha_pedido) OVER (PARTITION BY ??? ORDER BY fecha_pedido ASC, pedido_id ASC) AS fecha_pedido_anterior FROM pedidos ORDER BY cliente_id ASC, fecha_pedido ASC, pedido_id ASC;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000050' AND hint_order = 3;

-- Reto #64: Alta de nueva categoría en catálogo (INSERT VALUES)
UPDATE public.exercises
SET title = 'Alta de nueva categoría en catálogo (INSERT VALUES)',
    prompt = 'La tienda abrirá una línea especializada en sonido. Inserta una nueva fila en la tabla `categorias` especificando únicamente las columnas `nombre_categoria` con el valor `''Audio Profesional''` y `descripcion` con el valor `''Micrófonos de estudio, interfaces y monitores de audio''`, dejando que la clave primaria `categoria_id` se asigne automáticamente.',
    initial_code = '-- Inserta la nueva categoría especificando sus dos columnas de texto
INSERT INTO ',
    solution_query = 'INSERT INTO categorias (nombre_categoria, descripcion) VALUES (''Audio Profesional'', ''Micrófonos de estudio, interfaces y monitores de audio'');',
    sort_order = 64
WHERE id = 'e0000000-0000-0000-0000-000000000061';
UPDATE public.exercise_hints
SET content = 'Al insertar en una tabla con clave primaria SERIAL autogenerada, enumera entre paréntesis solo las columnas de negocio y pasa sus valores en el mismo orden dentro de VALUES.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000061' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa INSERT INTO categorias con las columnas (nombre_categoria, descripcion) y asigna en VALUES la nueva categoría y su detalle.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000061' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'INSERT INTO categorias (???, ???) VALUES (''Audio Profesional'', ''???'');'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000061' AND hint_order = 3;

-- Reto #65: Registro múltiple de almacenes regionales (INSERT Multi-Fila)
UPDATE public.exercises
SET title = 'Registro múltiple de almacenes regionales (INSERT Multi-Fila)',
    prompt = 'Expande la red logística registrando dos centros en una sola sentencia sobre la tabla `almacenes` (columnas `nombre_almacen`, `ciudad`, `capacidad_m2`): el primero con `''Centro Logístico Sur''`, `''Sevilla''` y `3200`; y el segundo con `''Hub Atlántico''`, `''Vigo''` y `2400`.',
    initial_code = '-- Inserta ambos almacenes en una única instrucción INSERT
INSERT INTO ',
    solution_query = 'INSERT INTO almacenes (nombre_almacen, ciudad, capacidad_m2) VALUES (''Centro Logístico Sur'', ''Sevilla'', 3200), (''Hub Atlántico'', ''Vigo'', 2400);',
    sort_order = 65
WHERE id = 'e0000000-0000-0000-0000-000000000062';
UPDATE public.exercise_hints
SET content = 'PostgreSQL permite insertar múltiples filas en un solo comando separando cada grupo de paréntesis con una coma dentro de la cláusula VALUES.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000062' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Declara INSERT INTO almacenes con las columnas (nombre_almacen, ciudad, capacidad_m2) y encadena las dos filas separadas por coma después de VALUES.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000062' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'INSERT INTO almacenes (nombre_almacen, ciudad, capacidad_m2) VALUES (''Centro Logístico Sur'', ''???'', ???), (''???'', ''Vigo'', 2400);'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000062' AND hint_order = 3;

-- Reto #66: Alta de producto con confirmación inmediata (INSERT RETURNING)
UPDATE public.exercises
SET title = 'Alta de producto con confirmación inmediata (INSERT RETURNING)',
    prompt = 'Registra un nuevo artículo en `productos` con `categoria_id = 3`, `proveedor_id = 5`, `nombre_producto = ''Webcam 4K Studio''`, `precio = 125.00` y `stock = 30`. En la misma sentencia, utiliza la cláusula `RETURNING` para devolver únicamente `producto_id`, `nombre_producto`, `precio` y `stock`.',
    initial_code = '-- Inserta el producto y devuelve las 4 columnas solicitadas con RETURNING
INSERT INTO ',
    solution_query = 'INSERT INTO productos (categoria_id, proveedor_id, nombre_producto, precio, stock) VALUES (3, 5, ''Webcam 4K Studio'', 125.00, 30) RETURNING producto_id, nombre_producto, precio, stock;',
    sort_order = 66
WHERE id = 'e0000000-0000-0000-0000-000000000063';
UPDATE public.exercise_hints
SET content = 'En PostgreSQL no necesitas hacer un SELECT posterior para conocer el ID asignado: añade RETURNING al final del INSERT con las columnas que deseas mostrar.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000063' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Después de VALUES (3, 5, ''Webcam 4K Studio'', 125.00, 30), agrega RETURNING producto_id, nombre_producto, precio, stock.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000063' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'INSERT INTO productos (categoria_id, proveedor_id, nombre_producto, precio, stock) VALUES (3, 5, ''Webcam 4K Studio'', 125.00, 30) RETURNING ???, nombre_producto, ???, stock;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000063' AND hint_order = 3;

-- Reto #67: Abastecimiento de inventario desde catálogo (INSERT INTO ... SELECT)
UPDATE public.exercises
SET title = 'Abastecimiento de inventario desde catálogo (INSERT INTO ... SELECT)',
    prompt = 'El almacén con `almacen_id = 3` va a incorporar un lote inicial de `12` unidades para los artículos de la categoría `5` (`Mobiliario Ergonómico`). Como el artículo con `producto_id = 15` ya tiene existencias registradas en ese almacén, debes excluirlo para no duplicar la clave primaria compuesta. Inserta en `inventario` las columnas `(almacen_id, producto_id, cantidad_disponible)` usando `INSERT INTO ... SELECT` para proyectar la constante `3`, el `producto_id` y la constante `12` desde la tabla `productos` filtrando `categoria_id = 5` y `producto_id <> 15`.',
    initial_code = '-- Usa INSERT INTO ... SELECT para poblar inventario a partir de productos
INSERT INTO ',
    solution_query = 'INSERT INTO inventario (almacen_id, producto_id, cantidad_disponible) SELECT 3, producto_id, 12 FROM productos WHERE categoria_id = 5 AND producto_id <> 15;',
    sort_order = 67
WHERE id = 'e0000000-0000-0000-0000-000000000064';
UPDATE public.exercise_hints
SET content = 'Cuando insertas datos provenientes de otra tabla, reemplazas la palabra VALUES por una consulta SELECT cuyas columnas coincidan en orden y tipo con las columnas destino.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000064' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Declara INSERT INTO inventario (almacen_id, producto_id, cantidad_disponible) y acompáñalo del SELECT sobre productos filtrando categoria_id = 5 AND producto_id <> 15.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000064' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'INSERT INTO inventario (almacen_id, producto_id, cantidad_disponible) SELECT 3, ???, 12 FROM productos WHERE categoria_id = ??? AND producto_id <> 15;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000064' AND hint_order = 3;

-- Reto #68: Reposición inteligente de stock (UPSERT con ON CONFLICT)
UPDATE public.exercises
SET title = 'Reposición inteligente de stock (UPSERT con ON CONFLICT)',
    prompt = 'Llegó al almacén `3` una reposición de `20` unidades del artículo `15` (`almacen_id = 3, producto_id = 15, cantidad_disponible = 20`). Como ese par ya existe en la tabla `inventario`, un `INSERT` convencional fallaría por colisión de clave primaria compuesta. Ejecuta un `INSERT INTO inventario (almacen_id, producto_id, cantidad_disponible) VALUES (3, 15, 20)` utilizando `ON CONFLICT (almacen_id, producto_id) DO UPDATE` para sumar la nueva cantidad al stock existente (`inventario.cantidad_disponible + EXCLUDED.cantidad_disponible`) y proyecta el resultado con `RETURNING almacen_id, producto_id, cantidad_disponible`.',
    initial_code = '-- Inserta o suma stock si la clave compuesta ya existe con ON CONFLICT
INSERT INTO ',
    solution_query = 'INSERT INTO inventario (almacen_id, producto_id, cantidad_disponible) VALUES (3, 15, 20) ON CONFLICT (almacen_id, producto_id) DO UPDATE SET cantidad_disponible = inventario.cantidad_disponible + EXCLUDED.cantidad_disponible RETURNING almacen_id, producto_id, cantidad_disponible;',
    sort_order = 68
WHERE id = 'e0000000-0000-0000-0000-000000000080';
UPDATE public.exercise_hints
SET content = 'En PostgreSQL, ON CONFLICT (col1, col2) DO UPDATE intercepta colisiones de clave primaria o única y transforma la inserción en una actualización atómica.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000080' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'La tabla especial EXCLUDED contiene los valores que intentabas insertar; suma inventario.cantidad_disponible + EXCLUDED.cantidad_disponible en el SET.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000080' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'INSERT INTO inventario (almacen_id, producto_id, cantidad_disponible) VALUES (3, 15, 20) ON CONFLICT (???, ???) DO UPDATE SET cantidad_disponible = inventario.cantidad_disponible + EXCLUDED.??? RETURNING almacen_id, producto_id, cantidad_disponible;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000080' AND hint_order = 3;

-- Reto #69: Actualización de contacto de proveedor (UPDATE WHERE)
UPDATE public.exercises
SET title = 'Actualización de contacto de proveedor (UPDATE WHERE)',
    prompt = 'El proveedor con `proveedor_id = 2` (`Silicon Logistics`) actualizó su línea telefónica internacional. Modifica la tabla `proveedores` asignando `telefono = ''+886-2-999888''` exclusivamente para el registro con `proveedor_id = 2`.',
    initial_code = '-- Actualiza el teléfono filtrando por clave primaria
UPDATE ',
    solution_query = 'UPDATE proveedores SET telefono = ''+886-2-999888'' WHERE proveedor_id = 2;',
    sort_order = 69
WHERE id = 'e0000000-0000-0000-0000-000000000065';
UPDATE public.exercise_hints
SET content = 'En toda sentencia UPDATE es indispensable incluir la cláusula WHERE para no sobrescribir todos los registros de la tabla.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000065' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa UPDATE sobre la tabla proveedores, asigna la columna telefono en SET y restringe la fila con WHERE proveedor_id = 2.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000065' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'UPDATE proveedores SET ??? = ''+886-2-999888'' WHERE ??? = 2;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000065' AND hint_order = 3;

-- Reto #70: Ajuste de precios por categoría con confirmación (UPDATE RETURNING)
UPDATE public.exercises
SET title = 'Ajuste de precios por categoría con confirmación (UPDATE RETURNING)',
    prompt = 'Aplica un incremento del 10% al precio de todos los productos de la categoría `4` (`Almacenamiento`). Actualiza la tabla `productos` asignando `precio = ROUND(precio * 1.10, 2)` donde `categoria_id = 4`, y utiliza `RETURNING` para mostrar `producto_id`, `nombre_producto` y el nuevo `precio`.',
    initial_code = '-- Incrementa el precio un 10% con ROUND y muestra los cambios con RETURNING
UPDATE ',
    solution_query = 'UPDATE productos SET precio = ROUND(precio * 1.10, 2) WHERE categoria_id = 4 RETURNING producto_id, nombre_producto, precio;',
    sort_order = 70
WHERE id = 'e0000000-0000-0000-0000-000000000066';
UPDATE public.exercise_hints
SET content = 'En la cláusula SET puedes referenciar el valor actual de la columna (precio * 1.10) envuelto en ROUND(..., 2) y cerrar con RETURNING.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000066' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Filtra WHERE categoria_id = 4 y añade RETURNING producto_id, nombre_producto, precio al final de la instrucción.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000066' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'UPDATE productos SET precio = ROUND(??? * 1.10, 2) WHERE categoria_id = 4 RETURNING producto_id, ???, precio;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000066' AND hint_order = 3;

-- Reto #71: Actualización cruzada de inventario por ciudad (UPDATE ... FROM)
UPDATE public.exercises
SET title = 'Actualización cruzada de inventario por ciudad (UPDATE ... FROM)',
    prompt = 'Suma `5` unidades de reserva (`cantidad_disponible = cantidad_disponible + 5`) en la tabla `inventario` únicamente para los registros pertenecientes a almacenes ubicados en la ciudad de `''Bilbao''`. Utiliza la sintaxis `UPDATE inventario i SET ... FROM almacenes a WHERE i.almacen_id = a.almacen_id AND a.ciudad = ''Bilbao''`.',
    initial_code = '-- Usa UPDATE ... FROM para actualizar inventario filtrando por una columna de almacenes
UPDATE ',
    solution_query = 'UPDATE inventario i SET cantidad_disponible = i.cantidad_disponible + 5 FROM almacenes a WHERE i.almacen_id = a.almacen_id AND a.ciudad = ''Bilbao'';',
    sort_order = 71
WHERE id = 'e0000000-0000-0000-0000-000000000067';
UPDATE public.exercise_hints
SET content = 'En PostgreSQL, cuando una actualización depende de columnas de otra tabla, se añade la cláusula FROM después de SET y se unen ambas tablas en el WHERE.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000067' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa UPDATE inventario i con SET cantidad_disponible = i.cantidad_disponible + 5, incorpora FROM almacenes a y une i.almacen_id = a.almacen_id en el WHERE.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000067' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'UPDATE inventario i SET cantidad_disponible = i.cantidad_disponible + 5 FROM almacenes a WHERE i.??? = a.??? AND a.ciudad = ''Bilbao'';'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000067' AND hint_order = 3;

-- Reto #72: Depuración segura de líneas de pedido cancelado (DELETE WHERE)
UPDATE public.exercises
SET title = 'Depuración segura de líneas de pedido cancelado (DELETE WHERE)',
    prompt = 'El pedido con `pedido_id = 105` fue cancelado definitivamente y Finanzas solicita limpiar sus líneas de detalle antes de archivar. Elimina de la tabla `detalle_pedidos` únicamente el registro que pertenece a `pedido_id = 105`.',
    initial_code = '-- Elimina exclusivamente las líneas del pedido 105 en detalle_pedidos
DELETE FROM ',
    solution_query = 'DELETE FROM detalle_pedidos WHERE pedido_id = 105;',
    sort_order = 72
WHERE id = 'e0000000-0000-0000-0000-000000000068';
UPDATE public.exercise_hints
SET content = 'DELETE FROM elimina filas completas de una tabla, por lo que no lleva lista de columnas entre DELETE y FROM; solo requiere un WHERE preciso.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000068' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Combina la cláusula DELETE FROM sobre detalle_pedidos con el filtro WHERE por la columna pedido_id.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000068' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'DELETE FROM ??? WHERE ??? = 105;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000068' AND hint_order = 3;

-- Reto #73: Diseño de tabla de cupones promocionales (CREATE TABLE)
UPDATE public.exercises
SET title = 'Diseño de tabla de cupones promocionales (CREATE TABLE)',
    prompt = 'Diseña una nueva tabla llamada `cupones_descuento` para gestionar campañas promocionales con exactamente estas 4 columnas en orden:
1. `cupon_id` de tipo `SERIAL PRIMARY KEY`
2. `codigo` de tipo `VARCHAR(25) NOT NULL`
3. `descuento_pct` de tipo `NUMERIC(5, 2) NOT NULL`
4. `fecha_expiracion` de tipo `DATE NOT NULL`',
    initial_code = '-- Define la tabla cupones_descuento con sus 4 columnas y tipos exactos
CREATE TABLE ',
    solution_query = 'CREATE TABLE cupones_descuento (cupon_id SERIAL PRIMARY KEY, codigo VARCHAR(25) NOT NULL, descuento_pct NUMERIC(5, 2) NOT NULL, fecha_expiracion DATE NOT NULL);',
    sort_order = 73
WHERE id = 'e0000000-0000-0000-0000-000000000069';
UPDATE public.exercise_hints
SET content = 'En CREATE TABLE defines cada columna con su nombre, tipo de dato (SERIAL, VARCHAR(25), NUMERIC(5, 2), DATE) y restricciones (PRIMARY KEY, NOT NULL) separadas por comas.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000069' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Asegúrate de respetar el orden: cupon_id SERIAL PRIMARY KEY, codigo VARCHAR(25) NOT NULL, descuento_pct NUMERIC(5, 2) NOT NULL, fecha_expiracion DATE NOT NULL.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000069' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'CREATE TABLE cupones_descuento (cupon_id SERIAL PRIMARY KEY, codigo VARCHAR(25) NOT NULL, descuento_pct ??? NOT NULL, fecha_expiracion ??? NOT NULL);'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000069' AND hint_order = 3;

-- Reto #74: Tabla de reseñas con reglas de integridad (CHECK & FOREIGN KEY)
UPDATE public.exercises
SET title = 'Tabla de reseñas con reglas de integridad (CHECK & FOREIGN KEY)',
    prompt = 'Crea la tabla `resenas_productos` para almacenar valoraciones verificadas con estas 5 columnas en orden:
1. `resena_id` de tipo `SERIAL PRIMARY KEY`
2. `producto_id` de tipo `INT NOT NULL REFERENCES productos(producto_id)`
3. `cliente_id` de tipo `INT NOT NULL REFERENCES clientes(cliente_id)`
4. `calificacion` de tipo `INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5)`
5. `comentario` de tipo `TEXT`',
    initial_code = '-- Crea la tabla resenas_productos con claves foráneas y restricción CHECK
CREATE TABLE ',
    solution_query = 'CREATE TABLE resenas_productos (resena_id SERIAL PRIMARY KEY, producto_id INT NOT NULL REFERENCES productos(producto_id), cliente_id INT NOT NULL REFERENCES clientes(cliente_id), calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5), comentario TEXT);',
    sort_order = 74
WHERE id = 'e0000000-0000-0000-0000-000000000070';
UPDATE public.exercise_hints
SET content = 'Usa REFERENCES tabla(columna) para definir cada clave foránea inline y CHECK (calificacion BETWEEN 1 AND 5) para validar el rango permitido.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000070' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Declara las 5 columnas: resena_id SERIAL PRIMARY KEY, producto_id INT NOT NULL REFERENCES productos(producto_id), cliente_id INT NOT NULL REFERENCES clientes(cliente_id), calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5), comentario TEXT.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000070' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'CREATE TABLE resenas_productos (resena_id SERIAL PRIMARY KEY, producto_id INT NOT NULL REFERENCES productos(???), cliente_id INT NOT NULL REFERENCES clientes(???), calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5), comentario TEXT);'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000070' AND hint_order = 3;

-- Reto #75: Evolución de esquema en almacenes (ALTER TABLE ADD COLUMN)
UPDATE public.exercises
SET title = 'Evolución de esquema en almacenes (ALTER TABLE ADD COLUMN)',
    prompt = 'Operaciones necesita identificar qué centros logísticos cuentan con cámara refrigerada. Modifica la tabla `almacenes` con `ALTER TABLE` para agregar una nueva columna llamada `refrigerado` de tipo `BOOLEAN NOT NULL DEFAULT FALSE`.',
    initial_code = '-- Agrega la columna refrigerado con su valor por defecto a la tabla almacenes
ALTER TABLE ',
    solution_query = 'ALTER TABLE almacenes ADD COLUMN refrigerado BOOLEAN NOT NULL DEFAULT FALSE;',
    sort_order = 75
WHERE id = 'e0000000-0000-0000-0000-000000000071';
UPDATE public.exercise_hints
SET content = 'Para añadir un campo obligatorio (NOT NULL) a una tabla que ya tiene filas, debes acompañarlo de DEFAULT para que PostgreSQL rellene automáticamente los registros existentes.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000071' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa ALTER TABLE sobre almacenes junto con la cláusula ADD COLUMN definiendo el tipo BOOLEAN, la restricción NOT NULL y el valor por defecto.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000071' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'ALTER TABLE almacenes ADD COLUMN ??? BOOLEAN NOT NULL DEFAULT ???;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000071' AND hint_order = 3;

-- Reto #76: Retiro controlado de tabla obsoleta (DROP TABLE IF EXISTS CASCADE)
UPDATE public.exercises
SET title = 'Retiro controlado de tabla obsoleta (DROP TABLE IF EXISTS CASCADE)',
    prompt = 'En el esquema de trabajo existe una tabla heredada llamada `auditoria_obsoleta` (junto con una vista dependiente) que debe retirarse limpiamente. Ejecuta la instrucción para eliminar la tabla `auditoria_obsoleta` utilizando `IF EXISTS` y `CASCADE` para remover también sus objetos dependientes.',
    initial_code = '-- Elimina la tabla auditoria_obsoleta de forma segura con IF EXISTS y CASCADE
DROP TABLE ',
    solution_query = 'DROP TABLE IF EXISTS auditoria_obsoleta CASCADE;',
    sort_order = 76
WHERE id = 'e0000000-0000-0000-0000-000000000072';
UPDATE public.exercise_hints
SET content = 'Cuando una tabla tiene vistas o claves foráneas que dependen de ella, DROP TABLE normal falla a menos que especifiques CASCADE al final.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000072' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Combina DROP TABLE IF EXISTS con el nombre de la tabla heredada y cierra la instrucción con la palabra clave CASCADE.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000072' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'DROP TABLE IF EXISTS ??? CASCADE;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000072' AND hint_order = 3;

-- Reto #77: Índice B-Tree para búsqueda por ciudad (CREATE INDEX)
UPDATE public.exercises
SET title = 'Índice B-Tree para búsqueda por ciudad (CREATE INDEX)',
    prompt = 'Las consultas de marketing filtran constantemente la tabla `clientes` por la columna `ciudad`, provocando escaneos secuenciales (`Seq Scan`). Crea un índice B-Tree estándar llamado `idx_clientes_ciudad` sobre la tabla `clientes` indexando la columna `(ciudad)`.',
    initial_code = '-- Crea el índice idx_clientes_ciudad sobre la tabla clientes
CREATE INDEX ',
    solution_query = 'CREATE INDEX idx_clientes_ciudad ON clientes (ciudad);',
    sort_order = 77
WHERE id = 'e0000000-0000-0000-0000-000000000073';
UPDATE public.exercise_hints
SET content = 'La sintaxis estándar para crear un índice en PostgreSQL es CREATE INDEX nombre_indice ON nombre_tabla (columna).'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000073' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Combina CREATE INDEX con el identificador solicitado, la cláusula ON apuntando a la tabla clientes y la columna entre paréntesis.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000073' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'CREATE INDEX ??? ON clientes (???);'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000073' AND hint_order = 3;

-- Reto #78: Índice único compuesto de facturación (CREATE UNIQUE INDEX)
UPDATE public.exercises
SET title = 'Índice único compuesto de facturación (CREATE UNIQUE INDEX)',
    prompt = 'Para evitar que se registre por error más de un pago con el mismo método para la misma factura y acelerar las conciliaciones, crea un índice **único** y **compuesto** llamado `idx_pagos_factura_metodo_unico` sobre la tabla `pagos` con las columnas `(factura_id, metodo_pago)` en ese orden.',
    initial_code = '-- Crea un índice único compuesto sobre factura_id y metodo_pago
CREATE UNIQUE INDEX ',
    solution_query = 'CREATE UNIQUE INDEX idx_pagos_factura_metodo_unico ON pagos (factura_id, metodo_pago);',
    sort_order = 78
WHERE id = 'e0000000-0000-0000-0000-000000000074';
UPDATE public.exercise_hints
SET content = 'Un índice único compuesto usa CREATE UNIQUE INDEX y enumera las columnas entre paréntesis en el orden de selectividad y consulta.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000074' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Usa CREATE UNIQUE INDEX con el nombre solicitado, la cláusula ON sobre la tabla pagos y las dos columnas separadas por coma.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000074' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'CREATE UNIQUE INDEX idx_pagos_factura_metodo_unico ON ??? (???, ???);'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000074' AND hint_order = 3;

-- Reto #79: Índice parcial de pedidos pendientes (partial index WHERE)
UPDATE public.exercises
SET title = 'Índice parcial de pedidos pendientes (partial index WHERE)',
    prompt = 'En producción el 95% de los pedidos históricos están `''completado''`, pero el panel operativo consulta miles de veces por minuto solo los pedidos con `estado_pedido = ''pendiente''` ordenados por `fecha_pedido`. Crea un **índice parcial** llamado `idx_pedidos_pendientes_fecha` sobre `pedidos (fecha_pedido)` que indexe únicamente las filas `WHERE estado_pedido = ''pendiente''`.',
    initial_code = '-- Crea un índice parcial filtrando con WHERE al final de CREATE INDEX
CREATE INDEX ',
    solution_query = 'CREATE INDEX idx_pedidos_pendientes_fecha ON pedidos (fecha_pedido) WHERE estado_pedido = ''pendiente'';',
    sort_order = 79
WHERE id = 'e0000000-0000-0000-0000-000000000075';
UPDATE public.exercise_hints
SET content = 'Un índice parcial en PostgreSQL añade una cláusula WHERE al final de la sentencia CREATE INDEX para indexar solo el subconjunto de filas activas.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000075' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Define CREATE INDEX sobre pedidos (fecha_pedido) y añade al cierre la condición WHERE filtrando por estado_pedido.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000075' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'CREATE INDEX idx_pedidos_pendientes_fecha ON pedidos (???) WHERE ??? = ''pendiente'';'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000075' AND hint_order = 3;

-- Reto #80: Eliminación de índice redundante (DROP INDEX IF EXISTS)
UPDATE public.exercises
SET title = 'Eliminación de índice redundante (DROP INDEX IF EXISTS)',
    prompt = 'Durante una auditoría de rendimiento en la tabla `clientes` se detectó un índice duplicado y sin uso llamado `idx_clientes_pais_antiguo` que ralentiza las inserciones. Elimina dicho índice del catálogo de forma segura utilizando `DROP INDEX IF EXISTS`.',
    initial_code = '-- Elimina el índice idx_clientes_pais_antiguo con IF EXISTS
DROP INDEX ',
    solution_query = 'DROP INDEX IF EXISTS idx_clientes_pais_antiguo;',
    sort_order = 80
WHERE id = 'e0000000-0000-0000-0000-000000000076';
UPDATE public.exercise_hints
SET content = 'A diferencia de otros motores, en PostgreSQL DROP INDEX no lleva ON nombre_tabla: solo requiere DROP INDEX IF EXISTS nombre_indice.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000076' AND hint_order = 1;
UPDATE public.exercise_hints
SET content = 'Combina la instrucción DROP INDEX con la cláusula IF EXISTS seguida del nombre del índice redundante.'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000076' AND hint_order = 2;
UPDATE public.exercise_hints
SET content = 'DROP INDEX IF EXISTS ???;'
WHERE exercise_id = 'e0000000-0000-0000-0000-000000000076' AND hint_order = 3;

COMMIT;
