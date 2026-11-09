-- ==============================================================================
-- Qurio: Catálogo Semilla de Rutas, Módulos, Ejercicios y Logros
-- ==============================================================================

-- 1. Rutas Formativas
INSERT INTO public.learning_paths (id, title, description, difficulty, estimated_hours, badge_reward, sort_order) VALUES
('sql-foundations', 'SQL Foundations', 'Aprende a consultar bases de datos desde cero. Proyecciones, filtrado con WHERE, ordenamiento y agregaciones esenciales.', 'Principiante', 6, 'Primer Query', 1),
('relational-sql', 'Relational SQL', 'Domina el cruce de tablas relacionales. INNER JOIN, LEFT JOIN con detección de ausencias, consultas multi-tabla y conjuntos.', 'Intermedio', 8, 'Join Master', 2),
('advanced-queries', 'Advanced Queries', 'Eleva tu nivel con subconsultas correlacionadas, expresiones condicionales CASE, CTEs y funciones de ventana analíticas.', 'Intermedio', 10, 'Window Wizard', 3)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- 2. Módulos
INSERT INTO public.modules (id, path_id, module_number, title, description) VALUES
('a0000000-0000-0000-0000-000000000001', 'sql-foundations', 1, 'SELECT & Proyecciones de Datos', 'Aprende a solicitar columnas específicas y utilizar alias limpios.'),
('a0000000-0000-0000-0000-000000000002', 'sql-foundations', 2, 'Filtrado con WHERE y Operadores Lógicos', 'Aplica filtros condicionales exactos mediante operadores de comparación y rangos.'),
('a0000000-0000-0000-0000-000000000003', 'sql-foundations', 3, 'Ordenamiento y Paginación', 'Ordena resultados con ORDER BY (ASC/DESC) y limita registros devueltos.'),
('a0000000-0000-0000-0000-000000000004', 'sql-foundations', 4, 'Agregación y Agrupamiento', 'Resume datos con COUNT, SUM, AVG y filtra agrupaciones con HAVING.'),
('b0000000-0000-0000-0000-000000000005', 'relational-sql', 5, 'Uniones Fundamentales (INNER JOIN)', 'Cruza dos tablas mediante claves foráneas emparejando registros existentes.'),
('b0000000-0000-0000-0000-000000000006', 'relational-sql', 6, 'Detección de Ausencias (LEFT JOIN & NULL)', 'Identifica registros huérfanos o entidades sin actividad asociada.'),
('b0000000-0000-0000-0000-000000000007', 'relational-sql', 7, 'Consultas Multi-Tabla', 'Conecta tres o más tablas en cascada para análisis integral del negocio.'),
('c0000000-0000-0000-0000-000000000008', 'advanced-queries', 8, 'Subconsultas Analíticas', 'Integra subconsultas en cláusulas WHERE y proyecciones escalares.'),
('c0000000-0000-0000-0000-000000000009', 'advanced-queries', 9, 'Expresiones Condicionales (CASE)', 'Transforma y categoriza datos en vuelo con lógica condicional.'),
('c0000000-0000-0000-0000-000000000010', 'advanced-queries', 10, 'Common Table Expressions (CTEs)', 'Estructura consultas complejas y legibles con la cláusula WITH.'),
('c0000000-0000-0000-0000-000000000011', 'advanced-queries', 11, 'Funciones de Ventana (Window Functions)', 'Aplica cálculos de partición y ranking sin colapsar las filas devueltas.')
ON CONFLICT (path_id, module_number) DO NOTHING;

-- 3. Currículum Completo de 18 Ejercicios
INSERT INTO public.exercises (id, module_id, title, prompt, initial_code, solution_query, xp_reward, difficulty, check_order, sort_order) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Catálogo Básico de Productos', 'El departamento de ventas necesita listar los nombres de los productos junto con su precio de venta unitario. Escribe una consulta que obtenga únicamente las columnas nombre_producto y precio de la tabla productos.', '-- Escribe tu consulta aquí
SELECT ', 'SELECT nombre_producto, precio FROM productos;', 30, 'Principiante', FALSE, 1),
('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Cálculo de Precios con IVA', 'El área contable requiere proyectar el precio final de cada producto aplicando el 21% de IVA (multiplicando el precio por 1.21). Escribe una consulta que devuelva el nombre_producto, el precio original y el precio calculado redondeado a 2 decimales bajo el alias precio_con_iva.', '-- Proyecta columnas y calcula el precio con IVA
SELECT ', 'SELECT nombre_producto, precio, ROUND(precio * 1.21, 2) AS precio_con_iva FROM productos;', 35, 'Principiante', FALSE, 2),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Productos Premium (> 500€)', 'Para una campaña exclusiva, marketing solicita todos los productos cuyo precio supere los 500 euros. Devuelve el nombre del producto, el precio y el stock actual para aquellos productos con precio estrictamente mayor a 500.', '-- Filtra los productos de alto valor
SELECT ', 'SELECT nombre_producto, precio, stock FROM productos WHERE precio > 500;', 35, 'Principiante', FALSE, 3),
('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002', 'Productos en Rango Medio (BETWEEN)', 'El equipo de catálogo desea identificar productos de gama media con precios entre 100€ y 800€ (inclusive). Escribe una consulta que liste el nombre_producto y el precio de los productos que cumplan con dicho rango.', '-- Filtra productos en el rango de 100 a 800
SELECT ', 'SELECT nombre_producto, precio FROM productos WHERE precio BETWEEN 100 AND 800;', 35, 'Principiante', FALSE, 4),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Clientes Españoles Ordenados por Apellido', 'Obtén el nombre, apellido y ciudad de todos los clientes cuyo país sea ''España''. Los resultados deben venir ordenados alfabéticamente de forma ascendente por su apellido.', '-- Filtra y ordena los clientes
SELECT ', 'SELECT nombre, apellido, ciudad FROM clientes WHERE pais = ''España'' ORDER BY apellido ASC;', 40, 'Principiante', TRUE, 5),
('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', 'Top 5 Productos Críticos por Stock', 'El almacén necesita reponer con urgencia los artículos con menores existencias. Escribe una consulta que devuelva el nombre_producto y el stock de los 5 productos con menor cantidad disponible en inventario, ordenados de menor a mayor stock.', '-- Ordena y limita a los 5 productos con menos stock
SELECT ', 'SELECT nombre_producto, stock FROM productos ORDER BY stock ASC LIMIT 5;', 40, 'Principiante', TRUE, 6),
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'Conteo de Productos por Categoría', 'El equipo de inventario desea saber cuántos productos existen en cada categoría. Escribe una consulta que devuelva el categoria_id y el total de productos bajo el alias total_productos para aquellas categorías que tengan más de 2 productos registrados.', '-- Utiliza GROUP BY y HAVING
SELECT ', 'SELECT categoria_id, COUNT(*) AS total_productos FROM productos GROUP BY categoria_id HAVING COUNT(*) > 2;', 45, 'Principiante', FALSE, 7),
('e0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000004', 'Métricas Globales de Ventas', 'La dirección comercial solicita un resumen ejecutivo de las ventas completadas. Escribe una consulta que calcule el total de pedidos completados bajo el alias total_pedidos, la suma acumulada de ingresos bajo ingresos_totales y el ticket promedio redondeado a 2 decimales bajo ticket_promedio, considerando únicamente pedidos con estado_pedido = ''completado''.', '-- Agrega las métricas globales para pedidos completados
SELECT ', 'SELECT COUNT(*) AS total_pedidos, SUM(total) AS ingresos_totales, ROUND(AVG(total), 2) AS ticket_promedio FROM pedidos WHERE estado_pedido = ''completado'';', 45, 'Principiante', FALSE, 8),
('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'Pedidos con Identidad del Cliente', 'Genera un reporte que muestre el pedido_id, el nombre del cliente, su apellido y el total del pedido. Relaciona las tablas pedidos y clientes mediante su clave compartida.', '-- Cruza clientes con sus respectivos pedidos
SELECT ', 'SELECT p.pedido_id, c.nombre, c.apellido, p.total FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id;', 45, 'Intermedio', FALSE, 9),
('e0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000005', 'Gasto Acumulado por Cliente', 'El departamento de fidelización necesita saber cuánto ha gastado en total cada cliente. Escribe una consulta que relacione clientes y pedidos, y devuelva cliente_id, nombre, apellido y la suma total de sus compras bajo el alias total_gastado, ordenando a los clientes de mayor a menor gasto total.', '-- Cruza clientes y pedidos y agrupa para sumar el gasto
SELECT ', 'SELECT c.cliente_id, c.nombre, c.apellido, SUM(p.total) AS total_gastado FROM clientes c INNER JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_gastado DESC;', 50, 'Intermedio', TRUE, 10),
('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'Clientes sin Compras Registradas (LEFT JOIN & IS NULL)', 'El equipo de marketing necesita reactivar a usuarios registrados que nunca han realizado un pedido en la plataforma. Escribe una consulta que devuelva el ID del cliente, su nombre y su apellido para todos los clientes que no tienen registros en la tabla de compras.', '-- Identifica clientes inactivos sin pedidos asociados
SELECT ', 'SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id WHERE p.pedido_id IS NULL;', 50, 'Intermedio', FALSE, 11),
('e0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000006', 'Productos sin Movimiento de Venta', 'Auditoría de catálogo necesita detectar productos que nunca han sido incluidos en ninguna orden de compra. Escribe una consulta que devuelva el producto_id y el nombre_producto de los artículos que no tienen ninguna línea registrada en detalle_pedidos.', '-- Localiza productos sin ventas cruzando con detalle_pedidos
SELECT ', 'SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN detalle_pedidos dp ON p.producto_id = dp.producto_id WHERE dp.detalle_id IS NULL;', 50, 'Intermedio', FALSE, 12),
('e0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000007', 'Desglose Completo de Líneas de Pedido', 'Operaciones necesita auditar las transacciones vinculando todas sus dimensiones relacionales. Escribe una consulta que conecte pedidos, clientes, detalle_pedidos, productos y categorias, y devuelva pedido_id, el nombre del cliente bajo el alias cliente_nombre, nombre_producto, nombre_categoria, cantidad y precio_unitario. Ordena los resultados por pedido_id ASC y nombre_producto ASC, limitando a 10 registros.', '-- Conecta en cascada pedidos, clientes, detalle, productos y categorias
SELECT ', 'SELECT p.pedido_id, c.nombre AS cliente_nombre, pr.nombre_producto, cat.nombre_categoria, dp.cantidad, dp.precio_unitario FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id INNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id INNER JOIN productos pr ON dp.producto_id = pr.producto_id INNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id ORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10;', 55, 'Intermedio', TRUE, 13),
('e0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000008', 'Productos sobre el Promedio de Precio', 'Estrategia de precios necesita listar los productos que se venden por encima de la media del catálogo completo. Escribe una consulta que devuelva el nombre_producto y su precio para aquellos artículos cuyo precio sea estrictamente superior al promedio global de precios de la tabla productos. Ordena por precio de mayor a menor.', '-- Usa una subconsulta para comparar con el promedio global
SELECT ', 'SELECT nombre_producto, precio FROM productos WHERE precio > (SELECT AVG(precio) FROM productos) ORDER BY precio DESC;', 55, 'Intermedio', TRUE, 14),
('e0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000009', 'Segmentación de Pedidos por Monto', 'Finanzas desea clasificar los pedidos según su cuantía para priorizar la logística. Escribe una consulta que devuelva el pedido_id, el total del pedido y una columna llamada segmento calculada de la siguiente forma: si total >= 1000 asigna ''Alto Valor'', si total >= 300 asigna ''Medio Valor'', y en cualquier otro caso ''Bajo Valor''. Ordena por total descendente.', '-- Clasifica los pedidos en tres segmentos según su monto
SELECT ', 'SELECT pedido_id, total, CASE WHEN total >= 1000 THEN ''Alto Valor'' WHEN total >= 300 THEN ''Medio Valor'' ELSE ''Bajo Valor'' END AS segmento FROM pedidos ORDER BY total DESC;', 55, 'Intermedio', TRUE, 15),
('e0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000010', 'Facturación por Categoría mediante CTE', 'Para la junta directiva, prepara un informe de facturación por categoría usando una Common Table Expression (CTE). Define una expresión WITH llamada ventas_por_categoria que sume (cantidad * precio_unitario) agrupando por el nombre_categoria, y luego selecciona nombre_categoria y facturacion ordenados de mayor a menor facturación.', '-- Estructura la consulta analítica usando WITH ... AS
WITH ', 'WITH ventas_por_categoria AS (SELECT c.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS facturacion FROM categorias c INNER JOIN productos pr ON c.categoria_id = pr.categoria_id INNER JOIN detalle_pedidos dp ON pr.producto_id = dp.producto_id GROUP BY c.nombre_categoria) SELECT nombre_categoria, facturacion FROM ventas_por_categoria ORDER BY facturacion DESC;', 60, 'Intermedio', TRUE, 16),
('e0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000011', 'Ranking de Productos por Precio (ROW_NUMBER)', 'El área de pricing desea clasificar los productos del más caro al más económico. Devuelve el producto_id, nombre_producto, precio y una columna llamada ranking con la posición de cada producto del más caro al más barato.', '-- Emplea ROW_NUMBER() OVER (...)
SELECT ', 'SELECT producto_id, nombre_producto, precio, ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking FROM productos;', 55, 'Intermedio', TRUE, 17),
('e0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000011', 'Ranking Relativo por Categoría (DENSE_RANK)', 'Análisis de surtido necesita clasificar los artículos dentro de cada categoría según su precio. Escribe una consulta que devuelva categoria_id, nombre_producto, precio y una columna analítica llamada ranking_categoria usando DENSE_RANK() con partición por categoria_id y orden descendente de precio. Ordena el resultado final por categoria_id ASC y ranking_categoria ASC.', '-- Usa DENSE_RANK() particionado por categoria_id
SELECT ', 'SELECT categoria_id, nombre_producto, precio, DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria FROM productos ORDER BY categoria_id ASC, ranking_categoria ASC;', 65, 'Intermedio', TRUE, 18)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  prompt = EXCLUDED.prompt,
  initial_code = EXCLUDED.initial_code,
  solution_query = EXCLUDED.solution_query,
  xp_reward = EXCLUDED.xp_reward,
  difficulty = EXCLUDED.difficulty,
  check_order = EXCLUDED.check_order,
  sort_order = EXCLUDED.sort_order;

-- 4. Pistas Didácticas Progresivas
INSERT INTO public.exercise_hints (exercise_id, hint_order, content, xp_penalty_percent) VALUES
('e0000000-0000-0000-0000-000000000001', 1, 'Usa la sentencia SELECT seguida de las columnas solicitadas separadas por coma.', 15),
('e0000000-0000-0000-0000-000000000001', 2, 'La cláusula FROM indica la tabla productos.', 20),
('e0000000-0000-0000-0000-000000000008', 1, 'Puedes realizar operaciones matemáticas directamente en SELECT, ej: precio * 1.21', 15),
('e0000000-0000-0000-0000-000000000008', 2, 'Usa ROUND(expresion, 2) AS precio_con_iva para limitar a 2 decimales y asignar el alias.', 20),
('e0000000-0000-0000-0000-000000000002', 1, 'Agrega una cláusula WHERE después de FROM productos.', 15),
('e0000000-0000-0000-0000-000000000002', 2, 'Utiliza el operador de comparación mayor que (>).', 20),
('e0000000-0000-0000-0000-000000000009', 1, 'El operador BETWEEN valor_min AND valor_max incluye ambos extremos del intervalo.', 15),
('e0000000-0000-0000-0000-000000000009', 2, 'Equivale lógicamente a ''WHERE precio >= 100 AND precio <= 800''.', 20),
('e0000000-0000-0000-0000-000000000003', 1, 'Usa WHERE pais = ''España''.', 15),
('e0000000-0000-0000-0000-000000000003', 2, 'Para ordenar utiliza ORDER BY apellido ASC.', 20),
('e0000000-0000-0000-0000-000000000010', 1, 'Ordena por la columna stock en dirección ascendente: ORDER BY stock ASC.', 15),
('e0000000-0000-0000-0000-000000000010', 2, 'Agrega la cláusula LIMIT 5 al final para acotar el resultado a 5 filas.', 20),
('e0000000-0000-0000-0000-000000000004', 1, 'Agrupa por categoria_id con GROUP BY.', 15),
('e0000000-0000-0000-0000-000000000004', 2, 'Para filtrar grupos agregados usa HAVING COUNT(*) > 2.', 20),
('e0000000-0000-0000-0000-000000000011', 1, 'Filtra primero con WHERE estado_pedido = ''completado''.', 15),
('e0000000-0000-0000-0000-000000000011', 2, 'Aplica COUNT(*), SUM(total) y ROUND(AVG(total), 2) con sus respectivos alias.', 20),
('e0000000-0000-0000-0000-000000000005', 1, 'Usa INNER JOIN clientes c ON p.cliente_id = c.cliente_id.', 15),
('e0000000-0000-0000-0000-000000000005', 2, 'Proyecta p.pedido_id, c.nombre, c.apellido, p.total.', 20),
('e0000000-0000-0000-0000-000000000012', 1, 'Usa INNER JOIN clientes c ON c.cliente_id = p.cliente_id.', 15),
('e0000000-0000-0000-0000-000000000012', 2, 'Agrupa por c.cliente_id, c.nombre, c.apellido en la cláusula GROUP BY.', 20),
('e0000000-0000-0000-0000-000000000012', 3, 'Ordena el resultado con ORDER BY total_gastado DESC.', 25),
('e0000000-0000-0000-0000-000000000006', 1, 'Inicia realizando un LEFT JOIN desde la tabla clientes hacia la tabla pedidos usando la relación c.cliente_id = p.cliente_id.', 15),
('e0000000-0000-0000-0000-000000000006', 2, 'Cuando un cliente no tiene pedidos, las columnas provenientes de la tabla pedidos resultarán con valores NULL. Filtra usando WHERE p.pedido_id IS NULL.', 20),
('e0000000-0000-0000-0000-000000000006', 3, 'Asegúrate de proyectar exactamente tres columnas: cliente_id, nombre y apellido.', 25),
('e0000000-0000-0000-0000-000000000013', 1, 'Une productos p con detalle_pedidos dp mediante LEFT JOIN usando producto_id.', 15),
('e0000000-0000-0000-0000-000000000013', 2, 'Filtra las filas donde la clave foránea o primaria de la tabla derecha sea nula: WHERE dp.detalle_id IS NULL.', 20),
('e0000000-0000-0000-0000-000000000014', 1, 'Encadena 4 cláusulas INNER JOIN siguiendo las claves foráneas correspondientes.', 15),
('e0000000-0000-0000-0000-000000000014', 2, 'Usa alias de tabla concisos: p, c, dp, pr, cat.', 20),
('e0000000-0000-0000-0000-000000000014', 3, 'Añade ORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10; al final.', 25),
('e0000000-0000-0000-0000-000000000015', 1, 'En la cláusula WHERE, escribe precio > (SELECT AVG(precio) FROM productos).', 15),
('e0000000-0000-0000-0000-000000000015', 2, 'No olvides ordenar con ORDER BY precio DESC.', 20),
('e0000000-0000-0000-0000-000000000016', 1, 'Usa la sintaxis: CASE WHEN condicion1 THEN valor1 WHEN condicion2 THEN valor2 ELSE valor_defecto END AS segmento.', 15),
('e0000000-0000-0000-0000-000000000016', 2, 'Recuerda ordenar con ORDER BY total DESC.', 20),
('e0000000-0000-0000-0000-000000000017', 1, 'Inicia con WITH ventas_por_categoria AS ( ... )', 15),
('e0000000-0000-0000-0000-000000000017', 2, 'Dentro del CTE, cruza categorias, productos y detalle_pedidos y agrupa por c.nombre_categoria.', 20),
('e0000000-0000-0000-0000-000000000017', 3, 'En la consulta principal, haz SELECT nombre_categoria, facturacion FROM ventas_por_categoria ORDER BY facturacion DESC;', 25),
('e0000000-0000-0000-0000-000000000007', 1, 'Usa la función ventana ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking.', 15),
('e0000000-0000-0000-0000-000000000018', 1, 'Usa DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria.', 15),
('e0000000-0000-0000-0000-000000000018', 2, 'Ordena al final por categoria_id ASC, ranking_categoria ASC.', 20)
ON CONFLICT (exercise_id, hint_order) DO UPDATE SET
  content = EXCLUDED.content,
  xp_penalty_percent = EXCLUDED.xp_penalty_percent;

-- 5. Catálogo de Logros
INSERT INTO public.achievements (id, name, description, icon, category, xp_reward) VALUES
('first-query', 'Primer Query', 'Ejecutaste con éxito tu primera consulta en Qurio.', 'bolt', 'progreso', 50),
('join-apprentice', 'Aprendiz de Relaciones', 'Completaste tu primer reto cruzando tablas con INNER JOIN.', 'account_tree', 'habilidad', 75),
('window-wizard', 'Mago de Ventanas', 'Dominaste cálculos particionados con Window Functions.', 'auto_awesome', 'maestria', 100),
('streak-3', 'Constancia Relacional', 'Completaste ejercicios 3 días consecutivos.', 'local_fire_department', 'racha', 60)
ON CONFLICT (id) DO NOTHING;
