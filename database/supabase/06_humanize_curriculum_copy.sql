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
    description = 'Filtra filas con operadores de comparación, patrones de texto, fechas y rangos con BETWEEN.'
WHERE id = 'a0000000-0000-0000-0000-000000000002';
UPDATE public.modules
SET title = 'Ordenamiento y paginación',
    description = 'Ordena resultados con ORDER BY (ASC/DESC) y limita las filas devueltas con LIMIT y OFFSET.'
WHERE id = 'a0000000-0000-0000-0000-000000000003';
UPDATE public.modules
SET title = 'Agregación y agrupamiento',
    description = 'Resume datos con COUNT, SUM, AVG, filtros previos con WHERE y filtros de grupos con HAVING.'
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
    description = 'Inserta filas individuales o por lotes, devuelve los datos guardados con RETURNING y copia filas entre tablas con INSERT INTO ... SELECT.'
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

-- 3. Ejercicios y pistas
-- Reto #1: Catálogo básico de productos
UPDATE public.exercises
SET title = 'Catálogo básico de productos',
    prompt = 'Imagina que necesitas armar un catálogo sencillo para la tienda. Muestra únicamente el nombre de cada producto (`nombre_producto`) y su precio (`precio`) desde la tabla `productos`.',
    initial_code = '-- Escribe tu consulta aquí
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000001';

-- Reto #2: Cálculo de precios con IVA
UPDATE public.exercises
SET title = 'Cálculo de precios con IVA',
    prompt = 'Calcula el precio final con impuestos para cada producto. Muestra el `nombre_producto`, el `precio` original y calcula el precio con el 21% de IVA (`precio * 1.21`) redondeado a 2 decimales, llamando a esa nueva columna `precio_con_iva`.',
    initial_code = '-- Muestra columnas y calcula el precio con IVA
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000008';

-- Reto #3: Concatenación de nombre completo
UPDATE public.exercises
SET title = 'Concatenación de nombre completo',
    prompt = 'Prepara un directorio para el equipo de atención al cliente. Une el `nombre` y el `apellido` de cada cliente separados por un espacio, nómbralo `cliente_completo`, y muestra también su `email` desde la tabla `clientes`.',
    initial_code = '-- Concatena nombre y apellido con un espacio
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000019';

-- Reto #4: Catálogo de ciudades únicas (DISTINCT)
UPDATE public.exercises
SET title = 'Catálogo de ciudades únicas (DISTINCT)',
    prompt = 'Logística necesita saber en qué ciudades tenemos clientes sin que los nombres se repitan. Obtén la lista de ciudades únicas (`ciudad`) de la tabla `clientes`.',
    initial_code = '-- Obtén valores únicos de ciudad
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000020';

-- Reto #5: Productos premium (> 500€)
UPDATE public.exercises
SET title = 'Productos premium (> 500€)',
    prompt = 'El equipo de marketing prepara una campaña especial de productos exclusivos. Muestra el `nombre_producto`, el `precio` y el `stock` de aquellos productos cuyo precio sea mayor a 500€.',
    initial_code = '-- Filtra los productos de alto valor
SELECT '
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
SELECT '
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
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000021';

-- Reto #8: Filtro de ciudades específicas (IN)
UPDATE public.exercises
SET title = 'Filtro de ciudades específicas (IN)',
    prompt = 'Operaciones lanzó envíos express para tres ciudades clave: Madrid, Barcelona y Valencia. Muestra el `cliente_id`, `nombre`, `apellido` y `ciudad` de los clientes que vivan en cualquiera de estas tres ciudades.',
    initial_code = '-- Filtra con el operador IN
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000022';

-- Reto #9: Productos en riesgo de stock (OR)
UPDATE public.exercises
SET title = 'Productos en riesgo de stock (OR)',
    prompt = 'El almacén necesita ubicar productos en situación crítica de inventario: artículos con muy poco stock (15 o menos unidades) o artículos con sobrestock (75 o más unidades). Muestra el `producto_id`, `nombre_producto` y `stock` que cumplan cualquiera de estas dos condiciones.',
    initial_code = '-- Combina condiciones con OR
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000023';

-- Reto #10: Facturas de alto valor no pagadas (AND + NOT)
UPDATE public.exercises
SET title = 'Facturas de alto valor no pagadas (AND + NOT)',
    prompt = 'Contabilidad necesita revisar facturas importantes pendientes de cobro. Muestra el `factura_id`, `monto_total` y `estado_factura` de aquellas facturas con un monto de 400€ o más y cuyo estado sea distinto de `''pagada''`.',
    initial_code = '-- Combina AND con el operador de desigualdad
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000024';

-- Reto #12: Clientes españoles ordenados por apellido
UPDATE public.exercises
SET title = 'Clientes españoles ordenados por apellido',
    prompt = 'Organiza la lista de clientes que viven en España por orden alfabético. Muestra su `nombre`, `apellido` y `ciudad` de la tabla `clientes`, ordenando los resultados alfabéticamente por su `apellido` (de la A a la Z) y, en caso de empate, por `cliente_id` ascendente.',
    initial_code = '-- Filtra y ordena los clientes
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000003';

-- Reto #13: Los 5 productos con menor stock
UPDATE public.exercises
SET title = 'Los 5 productos con menor stock',
    prompt = 'El almacén necesita reponer con urgencia los artículos que están por agotarse. Muestra el `nombre_producto` y el `stock` de los 5 productos con menor cantidad disponible, ordenando por `stock` ascendente y desempatando por `producto_id` ascendente.',
    initial_code = '-- Ordena y limita a los 5 productos con menos stock
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000010';

-- Reto #15: Paginación de clientes (OFFSET)
UPDATE public.exercises
SET title = 'Paginación de clientes (OFFSET)',
    prompt = 'Simula la paginación de un panel web que muestra 5 clientes por página. Obtén los clientes de la segunda página mostrando `cliente_id`, `nombre` y `email`, ordenados por `cliente_id ASC`, saltando los primeros 5 registros y mostrando los siguientes 5.',
    initial_code = '-- Usa LIMIT y OFFSET para paginar
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000026';

-- Reto #22: Conteo de productos por categoría
UPDATE public.exercises
SET title = 'Conteo de productos por categoría',
    prompt = '¿Cuántos productos tenemos en cada categoría? Muestra el `categoria_id` y el número total de productos bajo el nombre `total_productos`, mostrando únicamente aquellas categorías que tengan más de 2 productos.',
    initial_code = '-- Utiliza GROUP BY y HAVING
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000004';

-- Reto #16: Métricas globales de ventas
UPDATE public.exercises
SET title = 'Métricas globales de ventas',
    prompt = 'Genera un resumen ejecutivo de las ventas completadas. Calcula el número de pedidos bajo el nombre `total_pedidos`, la suma total de dinero bajo `ingresos_totales` y el promedio de compra redondeado a 2 decimales bajo `ticket_promedio`, tomando solo los pedidos con estado `''completado''`.',
    initial_code = '-- Agrega las métricas globales para pedidos completados
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000011';

-- Reto #17: Rango de precios por categoría (MAX/MIN)
UPDATE public.exercises
SET title = 'Rango de precios por categoría (MAX/MIN)',
    prompt = 'Analiza la diferencia de precios en cada departamento. Muestra el `categoria_id`, el precio más bajo bajo el nombre `precio_minimo` y el precio más alto bajo `precio_maximo` para cada categoría de productos.',
    initial_code = '-- Calcula precios extremos por categoría
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000027';

-- Reto #18: Distribución de clientes por país
UPDATE public.exercises
SET title = 'Distribución de clientes por país',
    prompt = '¿De qué países son nuestros clientes? Muestra la columna `pais` y el número total de clientes en cada país bajo el nombre `total_clientes`, ordenando la lista de mayor a menor número de clientes y, en caso de empate, alfabéticamente por `pais`.',
    initial_code = '-- Agrupa clientes por país
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000028';

-- Reto #19: Stock total por proveedor
UPDATE public.exercises
SET title = 'Stock total por proveedor',
    prompt = 'Calcula el volumen total de productos que nos suministra cada fabricante. Muestra el `proveedor_id` y la suma de unidades disponibles en stock bajo el nombre `stock_total` desde la tabla `productos`.',
    initial_code = '-- Suma el stock por proveedor
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000029';

-- Reto #23: Proveedores de alto volumen (HAVING SUM)
UPDATE public.exercises
SET title = 'Proveedores de alto volumen (HAVING SUM)',
    prompt = 'Identifica a nuestros proveedores más importantes en volumen. Muestra el `proveedor_id` y su stock total bajo el nombre `stock_total`, mostrando únicamente a aquellos proveedores cuyo stock total acumulado supere las 100 unidades.',
    initial_code = '-- Filtra grupos con HAVING
SELECT '
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

-- Reto #24: Clientes con compra promedio alta (HAVING AVG)
UPDATE public.exercises
SET title = 'Clientes con compra promedio alta (HAVING AVG)',
    prompt = 'Encuentra a los clientes que hacen compras de alto valor promedio. Muestra el `cliente_id` y su importe promedio de compra redondeado a 2 decimales bajo el nombre `ticket_promedio`, mostrando solo a aquellos clientes cuyo promedio de compras supere los 500€.',
    initial_code = '-- Filtra clientes por compra promedio
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000031';

-- Reto #21: Resumen de pedidos por estado
UPDATE public.exercises
SET title = 'Resumen de pedidos por estado',
    prompt = 'Construye un resumen de pedidos por estado. Muestra el `estado_pedido`, la cantidad de pedidos bajo el nombre `total_pedidos` y la suma acumulada de dinero bajo `monto_acumulado`, agrupando por estado y ordenando del estado con mayor dinero al de menor dinero (desempatando por `estado_pedido` ascendente).',
    initial_code = '-- Resumen consolidado por estado de pedido
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000032';

-- Reto #25: Pedidos con identidad del cliente
UPDATE public.exercises
SET title = 'Pedidos con identidad del cliente',
    prompt = 'Descubre qué cliente realizó cada pedido. Cruza las tablas `pedidos` y `clientes` por su identificador común y muestra el `pedido_id`, el `nombre` del cliente, su `apellido` y el `total` del pedido.',
    initial_code = '-- Cruza clientes con sus respectivos pedidos
SELECT '
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

-- Reto #29: Gasto acumulado por cliente
UPDATE public.exercises
SET title = 'Gasto acumulado por cliente',
    prompt = 'Calcula cuánto dinero ha gastado en total cada uno de nuestros clientes. Cruza `clientes` y `pedidos`, y muestra el `cliente_id`, `nombre`, `apellido` y la suma de todas sus compras bajo el nombre `total_gastado`, ordenando de mayor a menor gasto y, en caso de empate, por `cliente_id` ascendente.',
    initial_code = '-- Cruza clientes y pedidos y agrupa para sumar el gasto
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000012';

-- Reto #26: Catálogo con nombre de categoría
UPDATE public.exercises
SET title = 'Catálogo con nombre de categoría',
    prompt = 'Haz que el catálogo de productos sea legible mostrando el nombre de la categoría en lugar de su código numérico. Cruza `productos` con `categorias` y muestra `producto_id`, `nombre_producto`, `nombre_categoria` y `precio`. Ordena primero por categoría (A-Z) y luego por producto (A-Z).',
    initial_code = '-- Cruza productos con categorias
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000033';

-- Reto #27: Productos y sus proveedores directos
UPDATE public.exercises
SET title = 'Productos y sus proveedores directos',
    prompt = 'Compras necesita saber de qué país proviene cada producto. Cruza `productos` con `proveedores` y muestra `producto_id`, `nombre_producto`, `nombre_proveedor` y el país del proveedor bajo el nombre `pais_proveedor`. Ordena los productos alfabéticamente y, en caso de empate, por `producto_id` ascendente.',
    initial_code = '-- Relaciona productos con sus proveedores
SELECT '
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

-- Reto #28: Facturación detallada con pagos aprobados
UPDATE public.exercises
SET title = 'Facturación detallada con pagos aprobados',
    prompt = 'Concilia las facturas emitidas con sus pagos aprobados. Cruza `facturas` con `pagos` por `factura_id`, mostrando `factura_id`, el monto de la factura (`monto_total`), el `metodo_pago` y la `fecha_pago`, tomando únicamente los registros con `estado_pago = ''aprobado''`. Ordena por `factura_id` ascendente.',
    initial_code = '-- Concilia facturas con pagos aprobados
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000035';

-- Reto #30: Clientes sin compras registradas (LEFT JOIN & IS NULL)
UPDATE public.exercises
SET title = 'Clientes sin compras registradas (LEFT JOIN & IS NULL)',
    prompt = '¿Qué clientes se han registrado pero nunca han realizado una compra? Haz un `LEFT JOIN` entre `clientes` y `pedidos` para mostrar el `cliente_id`, `nombre` y `apellido` de todos los usuarios sin pedidos registrados.',
    initial_code = '-- Identifica clientes inactivos sin pedidos asociados
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000006';

-- Reto #31: Productos sin movimiento de venta
UPDATE public.exercises
SET title = 'Productos sin movimiento de venta',
    prompt = 'Detecta qué artículos del catálogo nunca han tenido ventas. Muestra el `producto_id` y `nombre_producto` de aquellos artículos que no tengan ninguna línea registrada en la tabla `detalle_pedidos`.',
    initial_code = '-- Localiza productos sin ventas cruzando con detalle_pedidos
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000013';

-- Reto #32: Facturas pendientes de cobro (LEFT JOIN)
UPDATE public.exercises
SET title = 'Facturas pendientes de cobro (LEFT JOIN)',
    prompt = 'Tesorería necesita una lista de facturas emitidas que todavía no tienen ningún pago registrado. Haz un `LEFT JOIN` entre `facturas` y `pagos` para obtener `factura_id`, `pedido_id`, `fecha_emision` y `monto_total` de aquellas facturas sin ningún abono. Ordena por `factura_id` ascendente.',
    initial_code = '-- Identifica facturas sin pagos registrados
SELECT '
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

-- Reto #33: Productos fuera del almacén central (LEFT JOIN condicional)
UPDATE public.exercises
SET title = 'Productos fuera del almacén central (LEFT JOIN condicional)',
    prompt = 'El responsable del almacén central de Madrid (`almacen_id = 1`) quiere saber qué productos del catálogo NO disponen de existencias en ese almacén en particular. Conecta `productos` con `inventario` con un `LEFT JOIN` acotado al almacén 1 y muestra el `producto_id` y `nombre_producto` de los artículos ausentes en ese almacén, ordenados por `producto_id` ascendente.',
    initial_code = '-- Detecta productos no inventariados en el almacén 1
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000037';

-- Reto #34: Censo completo de pedidos por cliente (preservando ceros)
UPDATE public.exercises
SET title = 'Censo completo de pedidos por cliente (preservando ceros)',
    prompt = 'Queremos una lista completa de todos los clientes y saber cuántos pedidos ha hecho cada uno, incluyendo con 0 a los que nunca han comprado. Muestra `cliente_id`, `nombre`, `apellido` y el total de compras bajo el nombre `total_pedidos` (usando `COUNT(p.pedido_id)`). Ordena por número de pedidos de mayor a menor y, en caso de empate, por `cliente_id` ascendente.',
    initial_code = '-- Agrupa preservando clientes sin compras con COUNT(columna)
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000038';

-- Reto #36: Desglose completo de líneas de pedido
UPDATE public.exercises
SET title = 'Desglose completo de líneas de pedido',
    prompt = 'Audita las compras mostrando toda la información conectada: pedido, cliente, producto y categoría. Conecta `pedidos`, `clientes`, `detalle_pedidos`, `productos` y `categorias`, y muestra `pedido_id`, el nombre del cliente como `cliente_nombre`, `nombre_producto`, `nombre_categoria`, `cantidad` y `precio_unitario`. Ordena por `pedido_id ASC` y `nombre_producto ASC`, limitando a los primeros 10 registros.',
    initial_code = '-- Conecta en cascada pedidos, clientes, detalle, productos y categorias
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000014';

-- Reto #37: Historial de ventas por ciudad y categoría
UPDATE public.exercises
SET title = 'Historial de ventas por ciudad y categoría',
    prompt = 'Descubre cuánto dinero se ha vendido en cada ciudad por cada tipo de producto. Conecta las tablas necesarias para calcular la suma de ventas (`SUM(dp.cantidad * dp.precio_unitario)`) bajo el nombre `monto_vendido`, agrupando por la `ciudad` del cliente y el `nombre_categoria`. Ordena alfabéticamente por ciudad y luego de mayor a menor venta.',
    initial_code = '-- Conecta 5 tablas y calcula ventas por ciudad y categoria
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000039';

-- Reto #38: Conciliación de pedidos, facturación y pagos
UPDATE public.exercises
SET title = 'Conciliación de pedidos, facturación y pagos',
    prompt = 'Verifica el flujo completo de una compra: el pedido, su factura y su cobro. Conecta `pedidos` con `facturas` y `pagos`, mostrando `pedido_id`, `cliente_id`, el monto de la factura bajo el nombre `monto_factura`, el monto del pago bajo `monto_pago` y el `metodo_pago`. Ordena por `pedido_id` ascendente.',
    initial_code = '-- Cruza pedidos con facturas y pagos
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000040';

-- Reto #39: Trazabilidad física de inventario por almacén
UPDATE public.exercises
SET title = 'Trazabilidad física de inventario por almacén',
    prompt = 'Consulta la disponibilidad física de inventario por almacén. Conecta `productos`, `inventario` y `almacenes`, mostrando `nombre_producto`, `nombre_almacen`, la `ciudad` del almacén y la `cantidad_disponible`, filtrando únicamente aquellos registros con más de 10 unidades. Ordena por nombre de producto y luego por almacén.',
    initial_code = '-- Conecta productos, inventario y almacenes
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000041';

-- Reto #40: Directorio operativo unificado (UNION)
UPDATE public.exercises
SET title = 'Directorio operativo unificado (UNION)',
    prompt = 'Crea una lista unificada de todas las ciudades donde tenemos presencia, indicando si la presencia es de clientes o de almacenes. Combina con `UNION` la ciudad y la etiqueta `''cliente''` como `tipo_entidad` de la tabla `clientes`, con la ciudad y la etiqueta `''almacen''` como `tipo_entidad` de la tabla `almacenes`. Ordena por ciudad y por tipo de entidad.',
    initial_code = '-- Combina ciudades de clientes y almacenes con UNION
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000042';

-- Reto #42: Ciudades sin presencia de almacenes (EXCEPT)
UPDATE public.exercises
SET title = 'Ciudades sin presencia de almacenes (EXCEPT)',
    prompt = 'Encuentra ciudades donde tengamos clientes pero todavía NO tengamos ningún almacén logístico. Usa el operador de diferencia `EXCEPT` para restar a las ciudades de `clientes` las ciudades de `almacenes`, ordenando la lista alfabéticamente.',
    initial_code = '-- Diferencia de conjuntos con EXCEPT
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000043';

-- Reto #43: Matriz de cobertura Almacén-Categoría (CROSS JOIN)
UPDATE public.exercises
SET title = 'Matriz de cobertura Almacén-Categoría (CROSS JOIN)',
    prompt = 'Genera todas las combinaciones posibles entre cada almacén y cada categoría de productos. Usa un `CROSS JOIN` entre `almacenes` y `categorias`, mostrando `nombre_almacen` y `nombre_categoria`, ordenando por almacén y por categoría.',
    initial_code = '-- Genera el producto cartesiano con CROSS JOIN
SELECT '
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

-- Reto #44: Pares de productos de la misma categoría (SELF JOIN)
UPDATE public.exercises
SET title = 'Pares de productos de la misma categoría (SELF JOIN)',
    prompt = 'Genera sugerencias de productos emparejados dentro de la misma categoría. Cruza la tabla `productos` consigo misma (`p1` y `p2`) para emparejar artículos con la misma `categoria_id`, pidiendo que `p1.producto_id < p2.producto_id` para no emparejar un producto consigo mismo ni repetir la pareja al revés. Muestra `categoria_id`, los nombres como `producto_a` y `producto_b`, y los precios como `precio_a` y `precio_b`. Ordena por categoría y nombres.',
    initial_code = '-- Auto-cruce de productos con condición de desigualdad
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000045';

-- Reto #45: Productos sobre el promedio de precio
UPDATE public.exercises
SET title = 'Productos sobre el promedio de precio',
    prompt = '¿Qué productos se venden por encima del precio promedio de toda la tienda? Muestra el `nombre_producto` y su `precio` para aquellos artículos cuyo precio sea mayor al promedio general de precios de la tabla `productos`. Ordena de mayor a menor precio y, en caso de empate, alfabéticamente por `nombre_producto`.',
    initial_code = '-- Usa una subconsulta para comparar con el promedio global
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000015';

-- Reto #46: Clientes con pedidos de alto monto (subconsulta con IN)
UPDATE public.exercises
SET title = 'Clientes con pedidos de alto monto (subconsulta con IN)',
    prompt = 'Identifica a nuestros clientes VIP: aquellos que han hecho al menos un pedido importante (de 1000€ o más). Consulta la tabla `clientes` y muestra `cliente_id`, `nombre`, `apellido` y `email`, filtrando con una subconsulta usando el operador `IN` sobre la tabla `pedidos`. Ordena por `cliente_id` ascendente.',
    initial_code = '-- Filtra clientes con una subconsulta en IN
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000046';

-- Reto #47: Comprobación de existencia eficiente (EXISTS)
UPDATE public.exercises
SET title = 'Comprobación de existencia eficiente (EXISTS)',
    prompt = 'Premia a los clientes activos que tengan al menos una compra completada. Muestra el `cliente_id`, `nombre` y `apellido` de aquellos clientes para los que exista al menos un pedido con `estado_pedido = ''completado''`, usando una subconsulta con `EXISTS`. Ordena por `cliente_id` ascendente.',
    initial_code = '-- Subconsulta correlacionada con EXISTS
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000047';

-- Reto #49: Segmentación de pedidos por monto
UPDATE public.exercises
SET title = 'Segmentación de pedidos por monto',
    prompt = 'Clasifica los pedidos según su valor para organizar la entrega. Muestra el `pedido_id`, el `total` y una nueva columna llamada `segmento` que diga: si el total es de 1000€ o más asigna `''Alto Valor''`, si es de 300€ o más asigna `''Medio Valor''`, y para el resto `''Bajo Valor''`. Ordena de mayor a menor total y, en caso de empate, por `pedido_id` ascendente.',
    initial_code = '-- Clasifica los pedidos en tres segmentos según su monto
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000016';

-- Reto #57: Ranking relativo por categoría (DENSE_RANK)
UPDATE public.exercises
SET title = 'Ranking relativo por categoría (DENSE_RANK)',
    prompt = 'Clasifica los productos dentro de cada categoría del más caro al más barato. Muestra `categoria_id`, `nombre_producto`, `precio` y una columna con el puesto que ocupa llamada `ranking_categoria` usando `DENSE_RANK()`, dividiendo por categoría y ordenando de mayor a menor precio. Ordena por `categoria_id ASC`, `ranking_categoria ASC` y `nombre_producto ASC`.',
    initial_code = '-- Usa DENSE_RANK() particionado por categoria_id
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000018';

-- Reto #50: Resumen de ventas por estado (agregación condicional)
UPDATE public.exercises
SET title = 'Resumen de ventas por estado (agregación condicional)',
    prompt = 'Crea una tabla resumen que muestre cuánto dinero tiene cada cliente en compras completadas y cuánto en compras pendientes. Muestra el `cliente_id`, la suma de compras completadas bajo el nombre `ventas_completadas` (sumando el total cuando el estado sea `''completado''` y 0 si no) y la suma de compras pendientes bajo `ventas_pendientes` (sumando el total cuando sea `''pendiente''` y 0 si no). Agrupa y ordena por `cliente_id` ascendente.',
    initial_code = '-- Agregación condicional con CASE dentro de SUM
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000048';

-- Reto #52: Facturación por categoría con CTE
UPDATE public.exercises
SET title = 'Facturación por categoría con CTE',
    prompt = 'Prepara un reporte ordenado de facturación por categoría usando una expresión `WITH` (CTE). Crea una tabla temporal llamada `ventas_por_categoria` que sume las ventas (`SUM(dp.cantidad * dp.precio_unitario)`) como `facturacion` agrupando por `nombre_categoria`. Luego, consulta esa tabla temporal para mostrar `nombre_categoria` y `facturacion` ordenados de mayor a menor facturación y, en caso de empate, alfabéticamente por `nombre_categoria`.',
    initial_code = '-- Estructura la consulta analítica usando WITH ... AS
WITH '
WHERE id = 'e0000000-0000-0000-0000-000000000017';

-- Reto #53: CTEs múltiples encadenadas (análisis por etapas)
UPDATE public.exercises
SET title = 'CTEs múltiples encadenadas (análisis por etapas)',
    prompt = 'Construye un análisis por pasos usando dos CTEs encadenadas para encontrar a los clientes que gastan más que el promedio de todos los clientes. Primero crea `gasto_clientes` con el `cliente_id` y su gasto total (`SUM(total) AS total_gastado`). Luego crea `promedio_general` que calcule el promedio (`AVG(total_gastado) AS gasto_medio`) a partir de la primera. Finalmente, muestra `cliente_id` y `total_gastado` de aquellos clientes cuyo gasto supere el promedio general, ordenados de mayor a menor gasto y, en caso de empate, por `cliente_id` ascendente.',
    initial_code = '-- Encadena dos CTEs separadas por coma
WITH '
WHERE id = 'e0000000-0000-0000-0000-000000000049';

-- Reto #56: Ranking de productos por precio (ROW_NUMBER)
UPDATE public.exercises
SET title = 'Ranking de productos por precio (ROW_NUMBER)',
    prompt = 'Crea una lista clasificada de productos del más caro al más económico. Muestra `producto_id`, `nombre_producto`, `precio` y una columna llamada `ranking` con la posición consecutiva (1, 2, 3...) de cada producto usando `ROW_NUMBER()` ordenado por precio descendente (desempatando por `producto_id` ascendente), y ordena el resultado final por `ranking` ascendente.',
    initial_code = '-- Emplea ROW_NUMBER() OVER (...)
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000007';

-- Reto #60: Análisis de intervalo temporal entre pedidos (LAG)
UPDATE public.exercises
SET title = 'Análisis de intervalo temporal entre pedidos (LAG)',
    prompt = 'Analiza cuánto tiempo pasa entre una compra y otra para cada cliente. Muestra el `pedido_id`, `cliente_id`, la `fecha_pedido` y el valor de la fecha del pedido inmediatamente anterior bajo el nombre `fecha_pedido_anterior`, usando la función de ventana `LAG(fecha_pedido)` dividiendo por cliente y ordenando cronológicamente (`fecha_pedido ASC, pedido_id ASC`). Ordena los resultados finales por `cliente_id ASC`, `fecha_pedido ASC` y `pedido_id ASC`.',
    initial_code = '-- Emplea LAG() OVER (PARTITION BY ... ORDER BY ...)
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000050';

-- Reto #11: Pedidos de febrero de 2024 (fechas con BETWEEN)
UPDATE public.exercises
SET title = 'Pedidos de febrero de 2024 (fechas con BETWEEN)',
    prompt = 'Auditoría quiere revisar todas las compras registradas durante febrero de 2024. Muestra el `pedido_id`, `cliente_id`, `fecha_pedido` y `total` de los pedidos realizados entre `''2024-02-01''` y `''2024-02-29''` (ambos inclusive), ordenados cronológicamente por `fecha_pedido ASC` y, en caso de empate, por `pedido_id ASC`.',
    initial_code = '-- Filtra por rango de fechas en WHERE
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000051';

-- Reto #20: Compras completadas por cliente (WHERE + GROUP BY)
UPDATE public.exercises
SET title = 'Compras completadas por cliente (WHERE + GROUP BY)',
    prompt = 'Analiza únicamente las compras efectivas por cliente sin mezclar pedidos cancelados ni pendientes. Filtra los pedidos con `estado_pedido = ''completado''`, agrupa por `cliente_id` y muestra el `cliente_id`, el número de compras como `compras_completadas` y su suma como `gasto_completado`. Ordena de mayor a menor `gasto_completado` y desempata por `cliente_id` ascendente.',
    initial_code = '-- Filtra filas individuales antes de agrupar
SELECT '
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

-- Reto #35: Gasto total de clientes incluyendo 0€ (COALESCE)
UPDATE public.exercises
SET title = 'Gasto total de clientes incluyendo 0€ (COALESCE)',
    prompt = 'Genera un reporte financiero con TODOS los clientes registrados y su gasto total acumulado, de modo que quienes nunca han comprado muestren `0` en lugar de `NULL`. Haz un `LEFT JOIN` entre `clientes` y `pedidos`, muestra `cliente_id`, `nombre`, `apellido` y `COALESCE(SUM(p.total), 0)` como `gasto_total`. Ordena de mayor a menor `gasto_total` y desempata por `cliente_id` ascendente.',
    initial_code = '-- Reemplaza valores NULL de la suma con COALESCE
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000053';

-- Reto #41: Ciudades con clientes y almacenes (INTERSECT)
UPDATE public.exercises
SET title = 'Ciudades con clientes y almacenes (INTERSECT)',
    prompt = 'Logística quiere identificar en qué ciudades coincidimos teniendo tanto clientes registrados como al menos un almacén físico. Usa el operador de conjuntos `INTERSECT` entre las ciudades de `clientes` y las ciudades de `almacenes`, ordenando el resultado alfabéticamente por `ciudad` ascendente.',
    initial_code = '-- Intersección de conjuntos con INTERSECT
SELECT '
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

-- Reto #48: Clientes sin pedidos completados (NOT EXISTS)
UPDATE public.exercises
SET title = 'Clientes sin pedidos completados (NOT EXISTS)',
    prompt = 'Fidelización busca contactar a los clientes que aún no cuentan con ninguna compra completada (ya sea porque nunca compraron o porque sus órdenes fueron canceladas o están pendientes). Muestra `cliente_id`, `nombre` y `apellido` de `clientes` usando una subconsulta correlacionada con `NOT EXISTS` sobre `pedidos` filtrando por `estado_pedido = ''completado''`. Ordena por `cliente_id` ascendente.',
    initial_code = '-- Subconsulta correlacionada negativa con NOT EXISTS
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000055';

-- Reto #51: Conteo de productos por nivel de precio (COUNT + CASE)
UPDATE public.exercises
SET title = 'Conteo de productos por nivel de precio (COUNT + CASE)',
    prompt = 'Clasifica la composición del catálogo por categoría contando cuántos artículos de cada una pertenecen al rango premium (`precio >= 500`) y cuántos al rango estándar (`precio < 500`). Une `categorias` y `productos` con `LEFT JOIN`, muestra `nombre_categoria`, `productos_premium` y `productos_estandar` usando `COUNT(CASE WHEN ... THEN 1 END)`. Agrupa por categoría y ordena por `categoria_id` ascendente.',
    initial_code = '-- Conteo condicional combinando COUNT y CASE
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000056';

-- Reto #54: Evolución mensual de ventas con CTE (TO_CHAR)
UPDATE public.exercises
SET title = 'Evolución mensual de ventas con CTE (TO_CHAR)',
    prompt = 'Dirección necesita una serie mensual de ingresos de pedidos completados. Define una CTE llamada `pedidos_mensuales` que transforme la fecha al formato año-mes con `TO_CHAR(fecha_pedido, ''YYYY-MM'') AS mes`, cuente los pedidos como `total_pedidos` y sume el total como `ingresos_mensuales` filtrando `estado_pedido = ''completado''`. Luego consulta esa CTE mostrando `mes`, `total_pedidos` e `ingresos_mensuales`, ordenados cronológicamente por `mes ASC`.',
    initial_code = '-- Agrupación temporal por mes estructurada en una CTE
WITH '
WHERE id = 'e0000000-0000-0000-0000-000000000057';

-- Reto #55: Categorías sobre el promedio de facturación (CTE + subconsulta)
UPDATE public.exercises
SET title = 'Categorías sobre el promedio de facturación (CTE + subconsulta)',
    prompt = 'Identifica qué categorías facturan por encima del promedio de todas las categorías. Crea una CTE llamada `facturacion_categoria` que sume las líneas de venta (`SUM(dp.cantidad * dp.precio_unitario) AS facturacion`) agrupando por `c.categoria_id` y `c.nombre_categoria`. En la consulta final, muestra `nombre_categoria` y `facturacion` filtrando aquellas cuyo valor supere `(SELECT AVG(facturacion) FROM facturacion_categoria)`. Ordena de mayor a menor `facturacion` y desempata por `nombre_categoria` ascendente.',
    initial_code = '-- Reutiliza la misma CTE en una subconsulta escalar
WITH '
WHERE id = 'e0000000-0000-0000-0000-000000000058';

-- Reto #58: Producto más caro por categoría (CTE + ROW_NUMBER)
UPDATE public.exercises
SET title = 'Producto más caro por categoría (CTE + ROW_NUMBER)',
    prompt = 'Encuentra el artículo líder en precio dentro de cada categoría. Crea una CTE `ranking_productos` que proyecte `categoria_id`, `nombre_producto`, `precio` y `ROW_NUMBER() OVER (PARTITION BY categoria_id ORDER BY precio DESC, producto_id ASC) AS posicion` desde `productos`. Luego selecciona `categoria_id`, `nombre_producto` y `precio` filtrando únicamente `WHERE posicion = 1` y ordenando por `categoria_id ASC`.',
    initial_code = '-- Patrón de artículo líder por categoría combinando CTE y ROW_NUMBER()
WITH '
WHERE id = 'e0000000-0000-0000-0000-000000000059';

-- Reto #59: Ingresos acumulados progresivos (SUM OVER)
UPDATE public.exercises
SET title = 'Ingresos acumulados progresivos (SUM OVER)',
    prompt = 'Calcula la curva acumulada de facturación pedido a pedido. Para los pedidos con `estado_pedido = ''completado''`, muestra `pedido_id`, `fecha_pedido`, `total` y una columna llamada `ingresos_acumulados` usando `SUM(total) OVER (ORDER BY fecha_pedido ASC, pedido_id ASC)`. Ordena la salida por `fecha_pedido ASC` y `pedido_id ASC`.',
    initial_code = '-- Total acumulado progresivo con SUM() OVER
SELECT '
WHERE id = 'e0000000-0000-0000-0000-000000000060';

-- Reto #61: Alta de nueva categoría en catálogo (INSERT VALUES)
UPDATE public.exercises
SET title = 'Alta de nueva categoría en catálogo (INSERT VALUES)',
    prompt = 'La tienda abrirá una línea especializada en sonido. Inserta una nueva fila en la tabla `categorias` especificando únicamente las columnas `nombre_categoria` con el valor `''Audio Profesional''` y `descripcion` con el valor `''Micrófonos de estudio, interfaces y monitores de audio''`, dejando que la clave primaria `categoria_id` se asigne automáticamente.',
    initial_code = '-- Inserta la nueva categoría especificando sus dos columnas de texto
INSERT INTO '
WHERE id = 'e0000000-0000-0000-0000-000000000061';

-- Reto #62: Registro múltiple de almacenes regionales (INSERT Multi-Fila)
UPDATE public.exercises
SET title = 'Registro múltiple de almacenes regionales (INSERT Multi-Fila)',
    prompt = 'Expande la red logística registrando dos centros en una sola sentencia sobre la tabla `almacenes` (columnas `nombre_almacen`, `ciudad`, `capacidad_m2`): el primero con `''Centro Logístico Sur''`, `''Sevilla''` y `3200`; y el segundo con `''Hub Atlántico''`, `''Vigo''` y `2400`.',
    initial_code = '-- Inserta ambos almacenes en una única instrucción INSERT
INSERT INTO '
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

-- Reto #63: Alta de producto con confirmación inmediata (INSERT RETURNING)
UPDATE public.exercises
SET title = 'Alta de producto con confirmación inmediata (INSERT RETURNING)',
    prompt = 'Registra un nuevo artículo en `productos` con `categoria_id = 3`, `proveedor_id = 5`, `nombre_producto = ''Webcam 4K Studio''`, `precio = 125.00` y `stock = 30`. En la misma sentencia, utiliza la cláusula `RETURNING` para devolver únicamente `producto_id`, `nombre_producto`, `precio` y `stock`.',
    initial_code = '-- Inserta el producto y devuelve las 4 columnas solicitadas con RETURNING
INSERT INTO '
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

-- Reto #64: Abastecimiento de inventario desde catálogo (INSERT INTO ... SELECT)
UPDATE public.exercises
SET title = 'Abastecimiento de inventario desde catálogo (INSERT INTO ... SELECT)',
    prompt = 'El almacén con `almacen_id = 3` va a incorporar un lote inicial de `12` unidades para todos los productos de la categoría `5` (`Mobiliario Ergonómico`) que aún no están registrados en ningún lote de ese almacén. Inserta en `inventario` las columnas `(almacen_id, producto_id, cantidad_disponible)` usando una consulta `SELECT 3, producto_id, 12 FROM productos WHERE categoria_id = 5 AND producto_id <> 15`.',
    initial_code = '-- Usa INSERT INTO ... SELECT para poblar inventario a partir de productos
INSERT INTO '
WHERE id = 'e0000000-0000-0000-0000-000000000064';

-- Reto #65: Actualización de contacto de proveedor (UPDATE WHERE)
UPDATE public.exercises
SET title = 'Actualización de contacto de proveedor (UPDATE WHERE)',
    prompt = 'El proveedor con `proveedor_id = 2` (`Silicon Logistics`) actualizó su línea telefónica internacional. Modifica la tabla `proveedores` asignando `telefono = ''+886-2-999888''` exclusivamente para el registro con `proveedor_id = 2`.',
    initial_code = '-- Actualiza el teléfono filtrando por clave primaria
UPDATE '
WHERE id = 'e0000000-0000-0000-0000-000000000065';

-- Reto #66: Ajuste de precios por categoría con confirmación (UPDATE RETURNING)
UPDATE public.exercises
SET title = 'Ajuste de precios por categoría con confirmación (UPDATE RETURNING)',
    prompt = 'Aplica un incremento del 10% al precio de todos los productos de la categoría `4` (`Almacenamiento`). Actualiza la tabla `productos` asignando `precio = ROUND(precio * 1.10, 2)` donde `categoria_id = 4`, y utiliza `RETURNING` para mostrar `producto_id`, `nombre_producto` y el nuevo `precio`.',
    initial_code = '-- Incrementa el precio un 10% con ROUND y muestra los cambios con RETURNING
UPDATE '
WHERE id = 'e0000000-0000-0000-0000-000000000066';

-- Reto #67: Actualización cruzada de inventario por ciudad (UPDATE ... FROM)
UPDATE public.exercises
SET title = 'Actualización cruzada de inventario por ciudad (UPDATE ... FROM)',
    prompt = 'Suma `5` unidades de reserva (`cantidad_disponible = cantidad_disponible + 5`) en la tabla `inventario` únicamente para los registros pertenecientes a almacenes ubicados en la ciudad de `''Bilbao''`. Utiliza la sintaxis `UPDATE inventario i SET ... FROM almacenes a WHERE i.almacen_id = a.almacen_id AND a.ciudad = ''Bilbao''`.',
    initial_code = '-- Usa UPDATE ... FROM para actualizar inventario filtrando por una columna de almacenes
UPDATE '
WHERE id = 'e0000000-0000-0000-0000-000000000067';

-- Reto #68: Depuración segura de líneas de pedido cancelado (DELETE WHERE)
UPDATE public.exercises
SET title = 'Depuración segura de líneas de pedido cancelado (DELETE WHERE)',
    prompt = 'El pedido con `pedido_id = 105` fue cancelado definitivamente y Finanzas solicita limpiar sus líneas de detalle antes de archivar. Elimina de la tabla `detalle_pedidos` únicamente el registro que pertenece a `pedido_id = 105`.',
    initial_code = '-- Elimina exclusivamente las líneas del pedido 105 en detalle_pedidos
DELETE FROM '
WHERE id = 'e0000000-0000-0000-0000-000000000068';

-- Reto #69: Diseño de tabla de cupones promocionales (CREATE TABLE)
UPDATE public.exercises
SET title = 'Diseño de tabla de cupones promocionales (CREATE TABLE)',
    prompt = 'Diseña una nueva tabla llamada `cupones_descuento` para gestionar campañas promocionales con exactamente estas 4 columnas en orden:
1. `cupon_id` de tipo `SERIAL PRIMARY KEY`
2. `codigo` de tipo `VARCHAR(25) NOT NULL`
3. `descuento_pct` de tipo `NUMERIC(5, 2) NOT NULL`
4. `fecha_expiracion` de tipo `DATE NOT NULL`',
    initial_code = '-- Define la tabla cupones_descuento con sus 4 columnas y tipos exactos
CREATE TABLE '
WHERE id = 'e0000000-0000-0000-0000-000000000069';

-- Reto #70: Tabla de reseñas con reglas de integridad (CHECK & FOREIGN KEY)
UPDATE public.exercises
SET title = 'Tabla de reseñas con reglas de integridad (CHECK & FOREIGN KEY)',
    prompt = 'Crea la tabla `resenas_productos` para almacenar valoraciones verificadas con estas 5 columnas en orden:
1. `resena_id` de tipo `SERIAL PRIMARY KEY`
2. `producto_id` de tipo `INT NOT NULL REFERENCES productos(producto_id)`
3. `cliente_id` de tipo `INT NOT NULL REFERENCES clientes(cliente_id)`
4. `calificacion` de tipo `INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5)`
5. `comentario` de tipo `TEXT`',
    initial_code = '-- Crea la tabla resenas_productos con claves foráneas y restricción CHECK
CREATE TABLE '
WHERE id = 'e0000000-0000-0000-0000-000000000070';

-- Reto #71: Evolución de esquema en almacenes (ALTER TABLE ADD COLUMN)
UPDATE public.exercises
SET title = 'Evolución de esquema en almacenes (ALTER TABLE ADD COLUMN)',
    prompt = 'Operaciones necesita identificar qué centros logísticos cuentan con cámara refrigerada. Modifica la tabla `almacenes` con `ALTER TABLE` para agregar una nueva columna llamada `refrigerado` de tipo `BOOLEAN NOT NULL DEFAULT FALSE`.',
    initial_code = '-- Agrega la columna refrigerado con su valor por defecto a la tabla almacenes
ALTER TABLE '
WHERE id = 'e0000000-0000-0000-0000-000000000071';

-- Reto #72: Retiro controlado de tabla obsoleta (DROP TABLE IF EXISTS CASCADE)
UPDATE public.exercises
SET title = 'Retiro controlado de tabla obsoleta (DROP TABLE IF EXISTS CASCADE)',
    prompt = 'En el esquema de trabajo existe una tabla heredada llamada `auditoria_obsoleta` (junto con una vista dependiente) que debe retirarse limpiamente. Ejecuta la instrucción para eliminar la tabla `auditoria_obsoleta` utilizando `IF EXISTS` y `CASCADE` para remover también sus objetos dependientes.',
    initial_code = '-- Elimina la tabla auditoria_obsoleta de forma segura con IF EXISTS y CASCADE
DROP TABLE '
WHERE id = 'e0000000-0000-0000-0000-000000000072';

-- Reto #73: Índice B-Tree para búsqueda por ciudad (CREATE INDEX)
UPDATE public.exercises
SET title = 'Índice B-Tree para búsqueda por ciudad (CREATE INDEX)',
    prompt = 'Las consultas de marketing filtran constantemente la tabla `clientes` por la columna `ciudad`, provocando escaneos secuenciales (`Seq Scan`). Crea un índice B-Tree estándar llamado `idx_clientes_ciudad` sobre la tabla `clientes` indexando la columna `(ciudad)`.',
    initial_code = '-- Crea el índice idx_clientes_ciudad sobre la tabla clientes
CREATE INDEX '
WHERE id = 'e0000000-0000-0000-0000-000000000073';

-- Reto #74: Índice único compuesto de facturación (CREATE UNIQUE INDEX)
UPDATE public.exercises
SET title = 'Índice único compuesto de facturación (CREATE UNIQUE INDEX)',
    prompt = 'Para evitar que se duplique un pago con el mismo método en la misma fecha para la misma factura y acelerar las conciliaciones, crea un índice **único** y **compuesto** llamado `idx_pagos_factura_metodo_unico` sobre la tabla `pagos` con las columnas `(factura_id, metodo_pago)` en ese orden.',
    initial_code = '-- Crea un índice único compuesto sobre factura_id y metodo_pago
CREATE UNIQUE INDEX '
WHERE id = 'e0000000-0000-0000-0000-000000000074';

-- Reto #75: Índice parcial de pedidos pendientes (partial index WHERE)
UPDATE public.exercises
SET title = 'Índice parcial de pedidos pendientes (partial index WHERE)',
    prompt = 'En producción el 95% de los pedidos históricos están `''completado''`, pero el panel operativo consulta miles de veces por minuto solo los pedidos con `estado_pedido = ''pendiente''` ordenados por `fecha_pedido`. Crea un **índice parcial** llamado `idx_pedidos_pendientes_fecha` sobre `pedidos (fecha_pedido)` que indexe únicamente las filas `WHERE estado_pedido = ''pendiente''`.',
    initial_code = '-- Crea un índice parcial filtrando con WHERE al final de CREATE INDEX
CREATE INDEX '
WHERE id = 'e0000000-0000-0000-0000-000000000075';

-- Reto #76: Eliminación de índice redundante (DROP INDEX IF EXISTS)
UPDATE public.exercises
SET title = 'Eliminación de índice redundante (DROP INDEX IF EXISTS)',
    prompt = 'Durante una auditoría de rendimiento en la tabla `clientes` se detectó un índice duplicado y sin uso llamado `idx_clientes_pais_antiguo` que ralentiza las inserciones. Elimina dicho índice del catálogo de forma segura utilizando `DROP INDEX IF EXISTS`.',
    initial_code = '-- Elimina el índice idx_clientes_pais_antiguo con IF EXISTS
DROP INDEX '
WHERE id = 'e0000000-0000-0000-0000-000000000076';

COMMIT;
