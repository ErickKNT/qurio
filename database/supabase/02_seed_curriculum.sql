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

-- 3. Ejercicios Iniciales de Alto Impacto
INSERT INTO public.exercises (id, module_id, title, prompt, initial_code, solution_query, xp_reward, difficulty, check_order, sort_order) VALUES
-- Ejercicio 1 (Módulo 1)
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
'Catálogo Básico de Productos',
'El departamento de ventas necesita listar los nombres de los productos junto con su precio de venta unitario. Escribe una consulta que obtenga únicamente las columnas nombre_producto y precio de la tabla productos.',
'-- Escribe tu consulta aquí\nSELECT ',
'SELECT nombre_producto, precio FROM productos;',
30, 'Principiante', FALSE, 1),

-- Ejercicio 2 (Módulo 2)
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002',
'Productos Premium (> 500€)',
'Para una campaña exclusiva, marketing solicita todos los productos cuyo precio supere los 500 euros. Devuelve el nombre del producto, el precio y el stock actual para aquellos productos con precio estrictamente mayor a 500.',
'-- Filtra los productos de alto valor\nSELECT ',
'SELECT nombre_producto, precio, stock FROM productos WHERE precio > 500;',
35, 'Principiante', FALSE, 2),

-- Ejercicio 3 (Módulo 3)
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003',
'Clientes Españoles Ordenados por Apellido',
'Obtén el nombre, apellido y ciudad de todos los clientes cuyo país sea ''España''. Los resultados deben venir ordenados alfabéticamente de forma ascendente por su apellido.',
'-- Filtra y ordena los clientes\nSELECT ',
'SELECT nombre, apellido, ciudad FROM clientes WHERE pais = ''España'' ORDER BY apellido ASC;',
40, 'Principiante', TRUE, 3),

-- Ejercicio 4 (Módulo 4)
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004',
'Conteo de Productos por Categoría',
'El equipo de inventario desea saber cuántos productos existen en cada categoría. Escribe una consulta que devuelva el categoria_id y el total de productos bajo el alias total_productos para aquellas categorías que tengan más de 2 productos registrados.',
'-- Utiliza GROUP BY y HAVING\nSELECT ',
'SELECT categoria_id, COUNT(*) AS total_productos FROM productos GROUP BY categoria_id HAVING COUNT(*) > 2;',
45, 'Principiante', FALSE, 4),

-- Ejercicio 5 (Módulo 5)
('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005',
'Pedidos con Identidad del Cliente (INNER JOIN)',
'Genera un reporte que muestre el pedido_id, el nombre del cliente, su apellido y el total del pedido. Relaciona las tablas pedidos y clientes mediante su clave compartida.',
'-- Cruza clientes con sus respectivos pedidos\nSELECT ',
'SELECT p.pedido_id, c.nombre, c.apellido, p.total FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id;',
45, 'Intermedio', FALSE, 5),

-- Ejercicio 6 (Módulo 6 - Reto Estrella de los Mockups)
('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006',
'Clientes sin Compras Registradas (LEFT JOIN & IS NULL)',
'El equipo de marketing necesita reactivar a usuarios registrados que nunca han realizado un pedido en la plataforma. Escribe una consulta que devuelva el ID del cliente, su nombre y su apellido para todos los clientes que no tienen registros en la tabla de compras.',
'-- Identifica clientes inactivos sin pedidos asociados\nSELECT ',
'SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id WHERE p.pedido_id IS NULL;',
50, 'Intermedio', FALSE, 6),

-- Ejercicio 7 (Módulo 11)
('e0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000011',
'Ranking de Productos por Precio (ROW_NUMBER)',
'El área de pricing desea clasificar los productos del más caro al más económico. Devuelve el producto_id, nombre_producto, precio y una columna llamada ranking con la posición de cada producto del más caro al más barato.',
'-- Emplea ROW_NUMBER() OVER (...)\nSELECT ',
'SELECT producto_id, nombre_producto, precio, ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking FROM productos;',
55, 'Intermedio', TRUE, 7)
ON CONFLICT (id) DO NOTHING;

-- 4. Pistas para el Ejercicio Estrella (Clientes sin Compras)
INSERT INTO public.exercise_hints (exercise_id, hint_order, content, xp_penalty_percent) VALUES
('e0000000-0000-0000-0000-000000000006', 1, 'Inicia realizando un LEFT JOIN desde la tabla clientes hacia la tabla pedidos usando la relación c.cliente_id = p.cliente_id.', 15),
('e0000000-0000-0000-0000-000000000006', 2, 'Cuando un cliente no tiene pedidos, las columnas provenientes de la tabla pedidos resultarán con valores NULL. Filtra usando WHERE p.pedido_id IS NULL.', 20),
('e0000000-0000-0000-0000-000000000006', 3, 'Asegúrate de proyectar exactamente tres columnas: cliente_id, nombre y apellido.', 25)
ON CONFLICT (exercise_id, hint_order) DO NOTHING;

-- 5. Catálogo de Logros
INSERT INTO public.achievements (id, name, description, icon, category, xp_reward) VALUES
('first-query', 'Primer Query', 'Ejecutaste con éxito tu primera consulta en Qurio.', 'bolt', 'progreso', 50),
('join-apprentice', 'Aprendiz de Relaciones', 'Completaste tu primer reto cruzando tablas con INNER JOIN.', 'account_tree', 'habilidad', 75),
('null-detective', 'Detective de NULL', 'Identificaste registros huérfanos usando LEFT JOIN y verificación IS NULL.', 'search', 'habilidad', 100),
('streak-3', 'Cadencia Activa', 'Mantén una racha de práctica durante 3 días consecutivos.', 'local_fire_department', 'constancia', 100),
('streak-7', 'Semana de Producción', 'Mantén una racha de práctica durante 7 días consecutivos.', 'military_tech', 'constancia', 250)
ON CONFLICT (id) DO NOTHING;
