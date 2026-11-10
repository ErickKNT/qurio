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
('b0000000-0000-0000-0000-000000000007', 'relational-sql', 7, 'Consultas Multi-Tabla en Cascada', 'Conecta tres o más tablas en cascada para análisis integral del negocio.'),
('b0000000-0000-0000-0000-000000000008', 'relational-sql', 8, 'Operaciones de Conjunto y Joins Especiales', 'Combina consultas mediante UNION, EXCEPT, CROSS JOIN y SELF JOIN.'),
('c0000000-0000-0000-0000-000000000009', 'advanced-queries', 9, 'Subconsultas Analíticas', 'Integra subconsultas en cláusulas WHERE y proyecciones escalares.'),
('c0000000-0000-0000-0000-000000000010', 'advanced-queries', 10, 'Expresiones Condicionales (CASE)', 'Transforma y categoriza datos en vuelo con lógica condicional.'),
('c0000000-0000-0000-0000-000000000011', 'advanced-queries', 11, 'Common Table Expressions (CTEs)', 'Estructura consultas complejas y legibles con la cláusula WITH.'),
('c0000000-0000-0000-0000-000000000012', 'advanced-queries', 12, 'Funciones de Ventana (Window Functions)', 'Aplica cálculos de partición y ranking sin colapsar las filas devueltas.')
ON CONFLICT (path_id, module_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- 3. Currículum de 45 Ejercicios (Ruta 1 y 2 completas + Ruta 3)
INSERT INTO public.exercises (id, module_id, title, prompt, initial_code, solution_query, xp_reward, difficulty, check_order, sort_order) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Catálogo Básico de Productos', 'El departamento de ventas necesita listar los nombres de los productos junto con su precio de venta unitario. Escribe una consulta que obtenga únicamente las columnas nombre_producto y precio de la tabla productos.', '-- Escribe tu consulta aquí
SELECT ', 'SELECT nombre_producto, precio FROM productos;', 30, 'Principiante', FALSE, 1),
('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Cálculo de Precios con IVA', 'El área contable requiere proyectar el precio final de cada producto aplicando el 21% de IVA (multiplicando el precio por 1.21). Escribe una consulta que devuelva el nombre_producto, el precio original y el precio calculado redondeado a 2 decimales bajo el alias precio_con_iva.', '-- Proyecta columnas y calcula el precio con IVA
SELECT ', 'SELECT nombre_producto, precio, ROUND(precio * 1.21, 2) AS precio_con_iva FROM productos;', 35, 'Principiante', FALSE, 2),
('e0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001', 'Concatenación de Nombre Completo', 'El departamento de soporte requiere un directorio de clientes con su nombre completo unificado y su correo electrónico. Escribe una consulta que combine las columnas nombre y apellido separadas por un espacio bajo el alias cliente_completo, junto con la columna email de la tabla clientes.', '-- Concatena nombre y apellido con un espacio
SELECT ', 'SELECT nombre || '' '' || apellido AS cliente_completo, email FROM clientes;', 35, 'Principiante', FALSE, 3),
('e0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000001', 'Catálogo de Ciudades Únicas (DISTINCT)', 'El equipo de logística necesita conocer todas las ciudades únicas donde residen clientes para planificar nuevas rutas de entrega. Escribe una consulta que obtenga la lista de ciudades sin repeticiones de la tabla clientes, bajo la columna ciudad.', '-- Obtén valores únicos de ciudad
SELECT ', 'SELECT DISTINCT ciudad FROM clientes;', 35, 'Principiante', FALSE, 4),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Productos Premium (> 500€)', 'Para una campaña exclusiva, marketing solicita todos los productos cuyo precio supere los 500 euros. Devuelve el nombre del producto, el precio y el stock actual para aquellos productos con precio estrictamente mayor a 500.', '-- Filtra los productos de alto valor
SELECT ', 'SELECT nombre_producto, precio, stock FROM productos WHERE precio > 500;', 35, 'Principiante', FALSE, 5),
('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002', 'Productos en Rango Medio (BETWEEN)', 'El equipo de catálogo desea identificar productos de gama media con precios entre 100€ y 800€ (inclusive). Escribe una consulta que liste el nombre_producto y el precio de los productos que cumplan con dicho rango.', '-- Filtra productos en el rango de 100 a 800
SELECT ', 'SELECT nombre_producto, precio FROM productos WHERE precio BETWEEN 100 AND 800;', 35, 'Principiante', FALSE, 6),
('e0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000002', 'Búsqueda por Patrón de Correo (LIKE)', 'El equipo de marketing desea enviar un comunicado a los usuarios registrados con cuentas corporativas estándar que utilicen el dominio genérico ''@email.com''. Escribe una consulta que devuelva el nombre, apellido y email de todos los clientes cuyo correo electrónico termine exactamente en ''@email.com''.', '-- Filtra clientes con comodín LIKE
SELECT ', 'SELECT nombre, apellido, email FROM clientes WHERE email LIKE ''%@email.com'';', 40, 'Principiante', FALSE, 7),
('e0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000002', 'Filtro de Ciudades Específicas (IN)', 'Operaciones ha lanzado una promoción especial de envíos exprés para los centros urbanos principales: Madrid, Barcelona y Valencia. Escribe una consulta que devuelva cliente_id, nombre, apellido y ciudad para los clientes que residan en cualquiera de estas tres ciudades.', '-- Filtra mediante el operador IN
SELECT ', 'SELECT cliente_id, nombre, apellido, ciudad FROM clientes WHERE ciudad IN (''Madrid'', ''Barcelona'', ''Valencia'');', 40, 'Principiante', FALSE, 8),
('e0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000002', 'Productos en Riesgo de Stock (OR)', 'Almacén necesita identificar con urgencia los artículos que están en extremos de inventario (aquellos con existencias críticas menores o iguales a 15 unidades, o artículos con sobrestock igual o mayor a 75 unidades). Escribe una consulta que devuelva producto_id, nombre_producto y stock para los productos que cumplan alguna de estas dos condiciones.', '-- Combina condiciones con OR
SELECT ', 'SELECT producto_id, nombre_producto, stock FROM productos WHERE stock <= 15 OR stock >= 75;', 40, 'Principiante', FALSE, 9),
('e0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000002', 'Facturas de Alto Valor No Pagadas (AND + NOT)', 'El departamento de cobranzas necesita auditar las facturas pendientes o en litigio de importe relevante. Escribe una consulta que devuelva factura_id, monto_total y estado_factura de todas las facturas cuyo monto_total sea mayor o igual a 400 y cuyo estado_factura sea diferente de ''pagada''.', '-- Combina AND con el operador de desigualdad
SELECT ', 'SELECT factura_id, monto_total, estado_factura FROM facturas WHERE monto_total >= 400 AND estado_factura <> ''pagada'';', 45, 'Principiante', FALSE, 10),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Clientes Españoles Ordenados por Apellido', 'Obtén el nombre, apellido y ciudad de todos los clientes cuyo país sea ''España''. Los resultados deben venir ordenados alfabéticamente de forma ascendente por su apellido.', '-- Filtra y ordena los clientes
SELECT ', 'SELECT nombre, apellido, ciudad FROM clientes WHERE pais = ''España'' ORDER BY apellido ASC;', 40, 'Principiante', TRUE, 11),
('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', 'Top 5 Productos Críticos por Stock', 'El almacén necesita reponer con urgencia los artículos con menores existencias. Escribe una consulta que devuelva el nombre_producto y el stock de los 5 productos con menor cantidad disponible en inventario, ordenados de menor a mayor stock.', '-- Ordena y limita a los 5 productos con menos stock
SELECT ', 'SELECT nombre_producto, stock FROM productos ORDER BY stock ASC LIMIT 5;', 40, 'Principiante', TRUE, 12),
('e0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000003', 'Ordenamiento Multi-Criterio', 'Catalogación requiere listar los productos organizados por su categoría y valor comercial. Escribe una consulta que devuelva producto_id, categoria_id, nombre_producto y precio, ordenados primero por categoria_id en orden ascendente (ASC) y, para productos dentro de la misma categoría, por precio en orden descendente (DESC).', '-- Ordena por múltiples columnas
SELECT ', 'SELECT producto_id, categoria_id, nombre_producto, precio FROM productos ORDER BY categoria_id ASC, precio DESC;', 45, 'Principiante', TRUE, 13),
('e0000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000003', 'Paginación de Clientes (OFFSET)', 'Para implementar paginación en el panel administrativo con 5 registros por página, obtén los clientes correspondientes a la segunda página. Escribe una consulta que devuelva cliente_id, nombre y email, ordenados por cliente_id ASC, omitiendo los primeros 5 clientes y limitando el resultado a los siguientes 5 registros.', '-- Usa LIMIT y OFFSET para paginar
SELECT ', 'SELECT cliente_id, nombre, email FROM clientes ORDER BY cliente_id ASC LIMIT 5 OFFSET 5;', 45, 'Principiante', TRUE, 14),
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'Conteo de Productos por Categoría', 'El equipo de inventario desea saber cuántos productos existen en cada categoría. Escribe una consulta que devuelva el categoria_id y el total de productos bajo el alias total_productos para aquellas categorías que tengan más de 2 productos registrados.', '-- Utiliza GROUP BY y HAVING
SELECT ', 'SELECT categoria_id, COUNT(*) AS total_productos FROM productos GROUP BY categoria_id HAVING COUNT(*) > 2;', 45, 'Principiante', FALSE, 15),
('e0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000004', 'Métricas Globales de Ventas', 'La dirección comercial solicita un resumen ejecutivo de las ventas completadas. Escribe una consulta que calcule el total de pedidos completados bajo el alias total_pedidos, la suma acumulada de ingresos bajo ingresos_totales y el ticket promedio redondeado a 2 decimales bajo ticket_promedio, considerando únicamente pedidos con estado_pedido = ''completado''.', '-- Agrega las métricas globales para pedidos completados
SELECT ', 'SELECT COUNT(*) AS total_pedidos, SUM(total) AS ingresos_totales, ROUND(AVG(total), 2) AS ticket_promedio FROM pedidos WHERE estado_pedido = ''completado'';', 45, 'Principiante', FALSE, 16),
('e0000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000004', 'Rango de Precios por Categoría (MAX/MIN)', 'El departamento de pricing necesita analizar la dispersión de precios en cada departamento comercial. Escribe una consulta que devuelva el categoria_id, el precio más bajo bajo el alias precio_minimo y el precio más alto bajo el alias precio_maximo para cada categoría de productos.', '-- Calcula precios extremos por categoría
SELECT ', 'SELECT categoria_id, MIN(precio) AS precio_minimo, MAX(precio) AS precio_maximo FROM productos GROUP BY categoria_id;', 45, 'Principiante', FALSE, 17),
('e0000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000004', 'Distribución de Clientes por País', 'Expansión internacional requiere un censo de clientes por país de residencia. Escribe una consulta que devuelva la columna pais y el número total de clientes bajo el alias total_clientes, agrupando por país y ordenando el resultado de mayor a menor número de clientes.', '-- Agrupa clientes por país
SELECT ', 'SELECT pais, COUNT(*) AS total_clientes FROM clientes GROUP BY pais ORDER BY total_clientes DESC;', 45, 'Principiante', TRUE, 18),
('e0000000-0000-0000-0000-000000000029', 'a0000000-0000-0000-0000-000000000004', 'Stock Total por Proveedor', 'Gestión de proveedores necesita conocer el volumen total de inventario que suministra cada fabricante. Escribe una consulta que devuelva el proveedor_id y la suma de unidades disponibles bajo el alias stock_total para cada proveedor en la tabla productos.', '-- Suma el stock por proveedor
SELECT ', 'SELECT proveedor_id, SUM(stock) AS stock_total FROM productos GROUP BY proveedor_id;', 45, 'Principiante', FALSE, 19),
('e0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000004', 'Proveedores de Alto Volumen (HAVING SUM)', 'Compras desea clasificar a sus proveedores estratégicos. Escribe una consulta que obtenga el proveedor_id y el total de existencias bajo el alias stock_total, mostrando únicamente aquellos proveedores cuyo stock total acumulado supere estrictamente las 100 unidades.', '-- Filtra grupos con HAVING
SELECT ', 'SELECT proveedor_id, SUM(stock) AS stock_total FROM productos GROUP BY proveedor_id HAVING SUM(stock) > 100;', 50, 'Principiante', FALSE, 20),
('e0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000004', 'Clientes con Ticket Promedio Alto (HAVING AVG)', 'Fidelización busca identificar a los compradores con mayor poder adquisitivo por compra. Escribe una consulta sobre la tabla pedidos que devuelva el cliente_id y el importe promedio de sus compras redondeado a 2 decimales bajo el alias ticket_promedio, considerando únicamente a los clientes cuyo promedio de compras supere los 500 euros.', '-- Filtra clientes por ticket promedio
SELECT ', 'SELECT cliente_id, ROUND(AVG(total), 2) AS ticket_promedio FROM pedidos GROUP BY cliente_id HAVING AVG(total) > 500;', 50, 'Principiante', FALSE, 21),
('e0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000004', 'Resumen de Pedidos por Estado', 'Operaciones comerciales solicita un cuadro de control de pedidos. Escribe una consulta que devuelva estado_pedido, la cantidad de pedidos bajo el alias total_pedidos y la suma acumulada de dinero bajo el alias monto_acumulado, agrupando por el estado del pedido y ordenando por monto_acumulado en orden descendente.', '-- Resumen consolidado por estado de pedido
SELECT ', 'SELECT estado_pedido, COUNT(*) AS total_pedidos, SUM(total) AS monto_acumulado FROM pedidos GROUP BY estado_pedido ORDER BY monto_acumulado DESC;', 50, 'Principiante', TRUE, 22),
('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'Pedidos con Identidad del Cliente', 'Genera un reporte que muestre el pedido_id, el nombre del cliente, su apellido y el total del pedido. Relaciona las tablas pedidos y clientes mediante su clave compartida.', '-- Cruza clientes con sus respectivos pedidos
SELECT ', 'SELECT p.pedido_id, c.nombre, c.apellido, p.total FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id;', 45, 'Intermedio', FALSE, 23),
('e0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000005', 'Gasto Acumulado por Cliente', 'El departamento de fidelización necesita saber cuánto ha gastado en total cada cliente. Escribe una consulta que relacione clientes y pedidos, y devuelva cliente_id, nombre, apellido y la suma total de sus compras bajo el alias total_gastado, ordenando a los clientes de mayor a menor gasto total.', '-- Cruza clientes y pedidos y agrupa para sumar el gasto
SELECT ', 'SELECT c.cliente_id, c.nombre, c.apellido, SUM(p.total) AS total_gastado FROM clientes c INNER JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_gastado DESC;', 50, 'Intermedio', TRUE, 24),
('e0000000-0000-0000-0000-000000000033', 'b0000000-0000-0000-0000-000000000005', 'Catálogo con Nombre de Categoría', 'Catalogación necesita presentar el catálogo con el nombre de su categoría descriptiva en vez del código numérico. Escribe una consulta que devuelva el producto_id, nombre_producto, nombre_categoria y precio, relacionando las tablas productos y categorias mediante categoria_id. Ordena los resultados por nombre_categoria ASC y luego por nombre_producto ASC.', '-- Cruza productos con categorias
SELECT ', 'SELECT p.producto_id, p.nombre_producto, c.nombre_categoria, p.precio FROM productos p INNER JOIN categorias c ON p.categoria_id = c.categoria_id ORDER BY c.nombre_categoria ASC, p.nombre_producto ASC;', 45, 'Intermedio', TRUE, 25),
('e0000000-0000-0000-0000-000000000034', 'b0000000-0000-0000-0000-000000000005', 'Productos y sus Proveedores Directos', 'El área de compras requiere auditar el origen geográfico de cada artículo del catálogo. Escribe una consulta que relacione las tablas productos y proveedores, devolviendo producto_id, nombre_producto, nombre_proveedor y el país del proveedor bajo el alias pais_proveedor. Ordena alfabéticamente por nombre_producto ASC.', '-- Relaciona productos con sus proveedores
SELECT ', 'SELECT pr.producto_id, pr.nombre_producto, pv.nombre_proveedor, pv.pais AS pais_proveedor FROM productos pr INNER JOIN proveedores pv ON pr.proveedor_id = pv.proveedor_id ORDER BY pr.nombre_producto ASC;', 45, 'Intermedio', TRUE, 26),
('e0000000-0000-0000-0000-000000000035', 'b0000000-0000-0000-0000-000000000005', 'Facturación Detallada con Pagos Aprobados', 'Contabilidad solicita una conciliación de facturas con sus pagos exitosos. Escribe una consulta que una facturas con pagos mediante factura_id, proyectando factura_id, monto_total de la factura, metodo_pago y fecha_pago, considerando únicamente aquellos registros donde estado_pago = ''aprobado''. Ordena por factura_id ASC.', '-- Concilia facturas con pagos aprobados
SELECT ', 'SELECT f.factura_id, f.monto_total, pg.metodo_pago, pg.fecha_pago FROM facturas f INNER JOIN pagos pg ON f.factura_id = pg.factura_id WHERE pg.estado_pago = ''aprobado'' ORDER BY f.factura_id ASC;', 50, 'Intermedio', TRUE, 27),
('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'Clientes sin Compras Registradas (LEFT JOIN & IS NULL)', 'El equipo de marketing necesita reactivar a usuarios registrados que nunca han realizado un pedido en la plataforma. Escribe una consulta que devuelva el ID del cliente, su nombre y su apellido para todos los clientes que no tienen registros en la tabla de compras.', '-- Identifica clientes inactivos sin pedidos asociados
SELECT ', 'SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id WHERE p.pedido_id IS NULL;', 50, 'Intermedio', FALSE, 28),
('e0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000006', 'Productos sin Movimiento de Venta', 'Auditoría de catálogo necesita detectar productos que nunca han sido incluidos en ninguna orden de compra. Escribe una consulta que devuelva el producto_id y el nombre_producto de los artículos que no tienen ninguna línea registrada en detalle_pedidos.', '-- Localiza productos sin ventas cruzando con detalle_pedidos
SELECT ', 'SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN detalle_pedidos dp ON p.producto_id = dp.producto_id WHERE dp.detalle_id IS NULL;', 50, 'Intermedio', FALSE, 29),
('e0000000-0000-0000-0000-000000000036', 'b0000000-0000-0000-0000-000000000006', 'Facturas Pendientes de Cobro (Anti-Join)', 'Tesorería necesita listar las facturas emitidas para las cuales todavía no se ha registrado ningún abono en la tabla de pagos (patrón Anti-Join). Escribe una consulta mediante LEFT JOIN entre facturas y pagos que obtenga factura_id, pedido_id, fecha_emision y monto_total de aquellas facturas sin ningún pago asociado. Ordena por factura_id ASC.', '-- Identifica facturas sin pagos registrados
SELECT ', 'SELECT f.factura_id, f.pedido_id, f.fecha_emision, f.monto_total FROM facturas f LEFT JOIN pagos p ON f.factura_id = p.factura_id WHERE p.pago_id IS NULL ORDER BY f.factura_id ASC;', 50, 'Intermedio', TRUE, 30),
('e0000000-0000-0000-0000-000000000037', 'b0000000-0000-0000-0000-000000000006', 'Productos Fuera del Almacén Central (Anti-Join Condicional)', 'El responsable del Hub Logístico Central Madrid (almacen_id = 1) desea identificar qué productos del catálogo no disponen de existencias ubicadas en sus instalaciones. Escribe una consulta que relacione la tabla productos con inventario mediante un LEFT JOIN acotado al almacén 1 (ON p.producto_id = i.producto_id AND i.almacen_id = 1) y devuelva producto_id y nombre_producto de los artículos ausentes en dicho almacén. Ordena por producto_id ASC.', '-- Detecta productos no inventariados en el almacén 1
SELECT ', 'SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN inventario i ON p.producto_id = i.producto_id AND i.almacen_id = 1 WHERE i.almacen_id IS NULL ORDER BY p.producto_id ASC;', 50, 'Intermedio', TRUE, 31),
('e0000000-0000-0000-0000-000000000038', 'b0000000-0000-0000-0000-000000000006', 'Censo Completo de Pedidos por Cliente (Preservando Ceros)', 'CRM requiere un censo íntegro de la cartera de clientes, visualizando cuántos pedidos ha efectuado cada usuario sin omitir a aquellos que nunca han comprado. Escribe una consulta mediante LEFT JOIN de clientes con pedidos que devuelva cliente_id, nombre, apellido y el recuento total de compras bajo el alias total_pedidos (usando COUNT(p.pedido_id)). Ordena los resultados por total_pedidos DESC y, en caso de empate, por cliente_id ASC.', '-- Agrupa preservando clientes sin compras con COUNT(columna)
SELECT ', 'SELECT c.cliente_id, c.nombre, c.apellido, COUNT(p.pedido_id) AS total_pedidos FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_pedidos DESC, c.cliente_id ASC;', 50, 'Intermedio', TRUE, 32),
('e0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000007', 'Desglose Completo de Líneas de Pedido', 'Operaciones necesita auditar las transacciones vinculando todas sus dimensiones relacionales. Escribe una consulta que conecte pedidos, clientes, detalle_pedidos, productos y categorias, y devuelva pedido_id, el nombre del cliente bajo el alias cliente_nombre, nombre_producto, nombre_categoria, cantidad y precio_unitario. Ordena los resultados por pedido_id ASC y nombre_producto ASC, limitando a 10 registros.', '-- Conecta en cascada pedidos, clientes, detalle, productos y categorias
SELECT ', 'SELECT p.pedido_id, c.nombre AS cliente_nombre, pr.nombre_producto, cat.nombre_categoria, dp.cantidad, dp.precio_unitario FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id INNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id INNER JOIN productos pr ON dp.producto_id = pr.producto_id INNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id ORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10;', 55, 'Intermedio', TRUE, 33),
('e0000000-0000-0000-0000-000000000039', 'b0000000-0000-0000-0000-000000000007', 'Historial de Ventas por Ciudad y Categoría', 'Dirección estratégica solicita un desglose de facturación territorial por categoría de producto. Conecta clientes, pedidos, detalle_pedidos, productos y categorias para calcular la suma de ventas (SUM(dp.cantidad * dp.precio_unitario)) bajo el alias monto_vendido, agrupada por la ciudad del cliente y el nombre_categoria. Ordena por ciudad ASC y luego por monto_vendido DESC.', '-- Conecta 5 tablas y calcula ventas por ciudad y categoria
SELECT ', 'SELECT c.ciudad, cat.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS monto_vendido FROM clientes c INNER JOIN pedidos p ON c.cliente_id = p.cliente_id INNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id INNER JOIN productos pr ON dp.producto_id = pr.producto_id INNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id GROUP BY c.ciudad, cat.nombre_categoria ORDER BY c.ciudad ASC, monto_vendido DESC;', 55, 'Intermedio', TRUE, 34),
('e0000000-0000-0000-0000-000000000040', 'b0000000-0000-0000-0000-000000000007', 'Conciliación de Pedidos, Facturación y Pagos', 'Auditoría financiera requiere verificar la trazabilidad íntegra entre órdenes de compra, facturación emitida y pagos liquidados. Escribe una consulta que una pedidos con facturas y pagos, proyectando pedido_id, cliente_id, monto_total de la factura como monto_factura, el monto del pago como monto_pago y el metodo_pago. Ordena por pedido_id ASC.', '-- Cruza pedidos con facturas y pagos
SELECT ', 'SELECT p.pedido_id, p.cliente_id, f.monto_total AS monto_factura, pg.monto AS monto_pago, pg.metodo_pago FROM pedidos p INNER JOIN facturas f ON p.pedido_id = f.pedido_id INNER JOIN pagos pg ON f.factura_id = pg.factura_id ORDER BY p.pedido_id ASC;', 55, 'Intermedio', TRUE, 35),
('e0000000-0000-0000-0000-000000000041', 'b0000000-0000-0000-0000-000000000007', 'Trazabilidad Física de Inventario por Almacén', 'Operaciones logísticas necesita un informe de existencias distribuidas por punto de almacenamiento. Conecta las tablas productos, inventario y almacenes, proyectando nombre_producto, nombre_almacen, la ciudad del almacén y cantidad_disponible, filtrando únicamente registros con existencias mayores a 10 unidades. Ordena por nombre_producto ASC y luego por nombre_almacen ASC.', '-- Conecta productos, inventario y almacenes
SELECT ', 'SELECT pr.nombre_producto, a.nombre_almacen, a.ciudad, i.cantidad_disponible FROM productos pr INNER JOIN inventario i ON pr.producto_id = i.producto_id INNER JOIN almacenes a ON i.almacen_id = a.almacen_id WHERE i.cantidad_disponible > 10 ORDER BY pr.nombre_producto ASC, a.nombre_almacen ASC;', 55, 'Intermedio', TRUE, 36),
('e0000000-0000-0000-0000-000000000042', 'b0000000-0000-0000-0000-000000000008', 'Directorio Operativo Unificado (UNION)', 'Planificación territorial necesita construir un censo consolidado de todas las ciudades con presencia de la empresa, distinguiendo si la presencia es comercial (clientes) o logística (almacenes). Escribe una consulta mediante el operador UNION que combine ciudad y el literal ''cliente'' AS tipo_entidad de la tabla clientes, con ciudad y el literal ''almacen'' AS tipo_entidad de almacenes. Ordena por ciudad ASC y tipo_entidad ASC.', '-- Combina ciudades de clientes y almacenes con UNION
SELECT ', 'SELECT ciudad, ''cliente'' AS tipo_entidad FROM clientes UNION SELECT ciudad, ''almacen'' AS tipo_entidad FROM almacenes ORDER BY ciudad ASC, tipo_entidad ASC;', 50, 'Intermedio', TRUE, 37),
('e0000000-0000-0000-0000-000000000043', 'b0000000-0000-0000-0000-000000000008', 'Ciudades sin Presencia de Almacenes (EXCEPT)', 'Expansión comercial busca detectar mercados desabastecidos de infraestructura logística propia. Escribe una consulta utilizando el operador de diferencia de conjuntos EXCEPT que obtenga las ciudades de la tabla clientes que NO existan en la tabla almacenes. Ordena la lista alfabéticamente por ciudad ASC.', '-- Diferencia de conjuntos con EXCEPT
SELECT ', 'SELECT ciudad FROM clientes EXCEPT SELECT ciudad FROM almacenes ORDER BY ciudad ASC;', 50, 'Intermedio', TRUE, 38),
('e0000000-0000-0000-0000-000000000044', 'b0000000-0000-0000-0000-000000000008', 'Matriz de Cobertura Almacén-Categoría (CROSS JOIN)', 'Para la auditoría de cobertura de almacenamiento, el equipo directivo requiere generar la matriz completa de combinaciones posibles entre cada almacén y cada categoría de producto registrada. Escribe una consulta mediante un producto cartesiano explícito (CROSS JOIN) entre las tablas almacenes y categorias, devolviendo nombre_almacen y nombre_categoria. Ordena por nombre_almacen ASC y nombre_categoria ASC.', '-- Genera el producto cartesiano con CROSS JOIN
SELECT ', 'SELECT a.nombre_almacen, c.nombre_categoria FROM almacenes a CROSS JOIN categorias c ORDER BY a.nombre_almacen ASC, c.nombre_categoria ASC;', 50, 'Intermedio', TRUE, 39),
('e0000000-0000-0000-0000-000000000045', 'b0000000-0000-0000-0000-000000000008', 'Pares de Productos de la Misma Categoría (SELF JOIN)', 'El motor de recomendaciones busca sugerir productos alternativos de la misma categoría. Escribe una consulta mediante un auto-cruce (SELF JOIN) sobre la tabla productos (p1 y p2) que empareje artículos que compartan la misma categoria_id, asegurando que p1.producto_id < p2.producto_id (para evitar pares simétricos y descartar emparejamientos consigo mismo). Proyecta p1.categoria_id, p1.nombre_producto AS producto_a, p2.nombre_producto AS producto_b, p1.precio AS precio_a y p2.precio AS precio_b. Ordena por p1.categoria_id ASC, producto_a ASC y producto_b ASC.', '-- Auto-cruce de productos con condición de desigualdad
SELECT ', 'SELECT p1.categoria_id, p1.nombre_producto AS producto_a, p2.nombre_producto AS producto_b, p1.precio AS precio_a, p2.precio AS precio_b FROM productos p1 INNER JOIN productos p2 ON p1.categoria_id = p2.categoria_id AND p1.producto_id < p2.producto_id ORDER BY p1.categoria_id ASC, producto_a ASC, producto_b ASC;', 55, 'Intermedio', TRUE, 40),
('e0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000009', 'Productos sobre el Promedio de Precio', 'Estrategia de precios necesita listar los productos que se venden por encima de la media del catálogo completo. Escribe una consulta que devuelva el nombre_producto y su precio para aquellos artículos cuyo precio sea estrictamente superior al promedio global de precios de la tabla productos. Ordena por precio de mayor a menor.', '-- Usa una subconsulta para comparar con el promedio global
SELECT ', 'SELECT nombre_producto, precio FROM productos WHERE precio > (SELECT AVG(precio) FROM productos) ORDER BY precio DESC;', 55, 'Intermedio', TRUE, 41),
('e0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000010', 'Segmentación de Pedidos por Monto', 'Finanzas desea clasificar los pedidos según su cuantía para priorizar la logística. Escribe una consulta que devuelva el pedido_id, el total del pedido y una columna llamada segmento calculada de la siguiente forma: si total >= 1000 asigna ''Alto Valor'', si total >= 300 asigna ''Medio Valor'', y en cualquier otro caso ''Bajo Valor''. Ordena por total descendente.', '-- Clasifica los pedidos en tres segmentos según su monto
SELECT ', 'SELECT pedido_id, total, CASE WHEN total >= 1000 THEN ''Alto Valor'' WHEN total >= 300 THEN ''Medio Valor'' ELSE ''Bajo Valor'' END AS segmento FROM pedidos ORDER BY total DESC;', 55, 'Intermedio', TRUE, 44),
('e0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000012', 'Ranking Relativo por Categoría (DENSE_RANK)', 'Análisis de surtido necesita clasificar los artículos dentro de cada categoría según su precio. Escribe una consulta que devuelva categoria_id, nombre_producto, precio y una columna analítica llamada ranking_categoria usando DENSE_RANK() con partición por categoria_id y orden descendente de precio. Ordena el resultado final por categoria_id ASC y ranking_categoria ASC.', '-- Usa DENSE_RANK() particionado por categoria_id
SELECT ', 'SELECT categoria_id, nombre_producto, precio, DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria FROM productos ORDER BY categoria_id ASC, ranking_categoria ASC;', 65, 'Intermedio', TRUE, 45),
('e0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000011', 'Facturación por Categoría mediante CTE', 'Para la junta directiva, prepara un informe de facturación por categoría usando una Common Table Expression (CTE). Define una expresión WITH llamada ventas_por_categoria que sume (cantidad * precio_unitario) agrupando por el nombre_categoria, y luego selecciona nombre_categoria y facturacion ordenados de mayor a menor facturación.', '-- Estructura la consulta analítica usando WITH ... AS
WITH ', 'WITH ventas_por_categoria AS (SELECT c.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS facturacion FROM categorias c INNER JOIN productos pr ON c.categoria_id = pr.categoria_id INNER JOIN detalle_pedidos dp ON pr.producto_id = dp.producto_id GROUP BY c.nombre_categoria) SELECT nombre_categoria, facturacion FROM ventas_por_categoria ORDER BY facturacion DESC;', 60, 'Intermedio', TRUE, 46),
('e0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000012', 'Ranking de Productos por Precio (ROW_NUMBER)', 'El área de pricing desea clasificar los productos del más caro al más económico. Devuelve el producto_id, nombre_producto, precio y una columna llamada ranking con la posición de cada producto del más caro al más barato.', '-- Emplea ROW_NUMBER() OVER (...)
SELECT ', 'SELECT producto_id, nombre_producto, precio, ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking FROM productos;', 55, 'Intermedio', TRUE, 48)
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id,
  title = EXCLUDED.title,
  prompt = EXCLUDED.prompt,
  initial_code = EXCLUDED.initial_code,
  solution_query = EXCLUDED.solution_query,
  xp_reward = EXCLUDED.xp_reward,
  difficulty = EXCLUDED.difficulty,
  check_order = EXCLUDED.check_order,
  sort_order = EXCLUDED.sort_order;

-- 4. Pistas de Ejercicios
INSERT INTO public.exercise_hints (exercise_id, hint_order, content, xp_penalty_percent) VALUES
('e0000000-0000-0000-0000-000000000001', 1, 'Usa la sentencia SELECT seguida de las columnas solicitadas separadas por coma.', 15),
('e0000000-0000-0000-0000-000000000001', 2, 'La cláusula FROM indica la tabla productos.', 20),
('e0000000-0000-0000-0000-000000000008', 1, 'Puedes realizar operaciones matemáticas directamente en SELECT, ej: precio * 1.21', 15),
('e0000000-0000-0000-0000-000000000008', 2, 'Usa ROUND(expresion, 2) AS precio_con_iva para limitar a 2 decimales y asignar el alias.', 20),
('e0000000-0000-0000-0000-000000000019', 1, 'Usa el operador de concatenación de cadenas de texto en SQL: ''||''.', 15),
('e0000000-0000-0000-0000-000000000019', 2, 'Para insertar un espacio en medio escribe: nombre || '' '' || apellido AS cliente_completo.', 20),
('e0000000-0000-0000-0000-000000000020', 1, 'La palabra reservada DISTINCT se coloca inmediatamente después de SELECT.', 15),
('e0000000-0000-0000-0000-000000000020', 2, 'Escribe: SELECT DISTINCT ciudad FROM clientes;', 20),
('e0000000-0000-0000-0000-000000000002', 1, 'Agrega una cláusula WHERE después de FROM productos.', 15),
('e0000000-0000-0000-0000-000000000002', 2, 'Utiliza el operador de comparación mayor que (>).', 20),
('e0000000-0000-0000-0000-000000000009', 1, 'El operador BETWEEN valor_min AND valor_max incluye ambos extremos del intervalo.', 15),
('e0000000-0000-0000-0000-000000000009', 2, 'Equivale lógicamente a ''WHERE precio >= 100 AND precio <= 800''.', 20),
('e0000000-0000-0000-0000-000000000021', 1, 'Usa el operador LIKE en la cláusula WHERE.', 15),
('e0000000-0000-0000-0000-000000000021', 2, 'El comodín ''%'' representa cero o más caracteres arbitrarios: LIKE ''%@email.com''.', 20),
('e0000000-0000-0000-0000-000000000022', 1, 'El operador IN permite comprobar la pertenencia a una lista de valores discretos.', 15),
('e0000000-0000-0000-0000-000000000022', 2, 'Escribe WHERE ciudad IN (''Madrid'', ''Barcelona'', ''Valencia'').', 20),
('e0000000-0000-0000-0000-000000000023', 1, 'Usa el operador lógico OR para combinar dos predicados de comparación.', 15),
('e0000000-0000-0000-0000-000000000023', 2, 'Escribe WHERE stock <= 15 OR stock >= 75;', 20),
('e0000000-0000-0000-0000-000000000024', 1, 'En SQL estándar la desigualdad se expresa con ''<>'' o ''!=''.', 15),
('e0000000-0000-0000-0000-000000000024', 2, 'Combina ambas condiciones con AND: WHERE monto_total >= 400 AND estado_factura <> ''pagada''.', 20),
('e0000000-0000-0000-0000-000000000003', 1, 'Usa WHERE pais = ''España''.', 15),
('e0000000-0000-0000-0000-000000000003', 2, 'Para ordenar utiliza ORDER BY apellido ASC.', 20),
('e0000000-0000-0000-0000-000000000010', 1, 'Ordena por la columna stock en dirección ascendente: ORDER BY stock ASC.', 15),
('e0000000-0000-0000-0000-000000000010', 2, 'Agrega la cláusula LIMIT 5 al final para acotar el resultado a 5 filas.', 20),
('e0000000-0000-0000-0000-000000000025', 1, 'Puedes incluir múltiples columnas separadas por comas en ORDER BY.', 15),
('e0000000-0000-0000-0000-000000000025', 2, 'Especifica la dirección tras cada columna: ORDER BY categoria_id ASC, precio DESC.', 20),
('e0000000-0000-0000-0000-000000000026', 1, 'Combina LIMIT para el tamaño de página y OFFSET para la cantidad de filas a saltar.', 15),
('e0000000-0000-0000-0000-000000000026', 2, 'Escribe ORDER BY cliente_id ASC LIMIT 5 OFFSET 5;', 20),
('e0000000-0000-0000-0000-000000000004', 1, 'Agrupa por categoria_id con GROUP BY.', 15),
('e0000000-0000-0000-0000-000000000004', 2, 'Para filtrar grupos agregados usa HAVING COUNT(*) > 2.', 20),
('e0000000-0000-0000-0000-000000000011', 1, 'Filtra primero con WHERE estado_pedido = ''completado''.', 15),
('e0000000-0000-0000-0000-000000000011', 2, 'Aplica COUNT(*), SUM(total) y ROUND(AVG(total), 2) con sus respectivos alias.', 20),
('e0000000-0000-0000-0000-000000000027', 1, 'Utiliza las funciones de agregación MIN(precio) y MAX(precio).', 15),
('e0000000-0000-0000-0000-000000000027', 2, 'Agrupa las filas por categoria_id mediante GROUP BY categoria_id.', 20),
('e0000000-0000-0000-0000-000000000028', 1, 'Agrupa por pais usando GROUP BY pais.', 15),
('e0000000-0000-0000-0000-000000000028', 2, 'Cuenta las filas con COUNT(*) AS total_clientes y ordena con ORDER BY total_clientes DESC.', 20),
('e0000000-0000-0000-0000-000000000029', 1, 'Usa SUM(stock) AS stock_total para sumar las unidades.', 15),
('e0000000-0000-0000-0000-000000000029', 2, 'Agrupa por proveedor_id con GROUP BY proveedor_id.', 20),
('e0000000-0000-0000-0000-000000000030', 1, 'La cláusula HAVING se coloca después de GROUP BY.', 15),
('e0000000-0000-0000-0000-000000000030', 2, 'Escribe HAVING SUM(stock) > 100;', 20),
('e0000000-0000-0000-0000-000000000031', 1, 'Usa ROUND(AVG(total), 2) AS ticket_promedio en SELECT.', 15),
('e0000000-0000-0000-0000-000000000031', 2, 'Filtra en HAVING usando AVG(total) > 500.', 20),
('e0000000-0000-0000-0000-000000000032', 1, 'Proyecta estado_pedido, COUNT(*) AS total_pedidos, SUM(total) AS monto_acumulado.', 15),
('e0000000-0000-0000-0000-000000000032', 2, 'Agrupa por estado_pedido y ordena por monto_acumulado DESC.', 20),
('e0000000-0000-0000-0000-000000000005', 1, 'Usa INNER JOIN clientes c ON p.cliente_id = c.cliente_id.', 15),
('e0000000-0000-0000-0000-000000000005', 2, 'Proyecta p.pedido_id, c.nombre, c.apellido, p.total.', 20),
('e0000000-0000-0000-0000-000000000012', 1, 'Usa INNER JOIN clientes c ON c.cliente_id = p.cliente_id.', 15),
('e0000000-0000-0000-0000-000000000012', 2, 'Agrupa por c.cliente_id, c.nombre, c.apellido en la cláusula GROUP BY.', 20),
('e0000000-0000-0000-0000-000000000012', 3, 'Ordena el resultado con ORDER BY total_gastado DESC.', 25),
('e0000000-0000-0000-0000-000000000033', 1, 'Usa INNER JOIN categorias c ON p.categoria_id = c.categoria_id.', 15),
('e0000000-0000-0000-0000-000000000033', 2, 'Ordena con ORDER BY c.nombre_categoria ASC, p.nombre_producto ASC;', 20),
('e0000000-0000-0000-0000-000000000034', 1, 'Une productos pr con proveedores pv usando proveedor_id.', 15),
('e0000000-0000-0000-0000-000000000034', 2, 'Asigna el alias pais_proveedor a pv.pais y ordena con ORDER BY pr.nombre_producto ASC;', 20),
('e0000000-0000-0000-0000-000000000035', 1, 'Usa INNER JOIN pagos pg ON f.factura_id = pg.factura_id.', 15),
('e0000000-0000-0000-0000-000000000035', 2, 'Filtra en WHERE pg.estado_pago = ''aprobado'' y ordena por f.factura_id ASC.', 20),
('e0000000-0000-0000-0000-000000000006', 1, 'Inicia realizando un LEFT JOIN desde la tabla clientes hacia la tabla pedidos usando la relación c.cliente_id = p.cliente_id.', 15),
('e0000000-0000-0000-0000-000000000006', 2, 'Cuando un cliente no tiene pedidos, las columnas provenientes de la tabla pedidos resultarán con valores NULL. Filtra usando WHERE p.pedido_id IS NULL.', 20),
('e0000000-0000-0000-0000-000000000006', 3, 'Asegúrate de proyectar exactamente tres columnas: cliente_id, nombre y apellido.', 25),
('e0000000-0000-0000-0000-000000000013', 1, 'Une productos p con detalle_pedidos dp mediante LEFT JOIN usando producto_id.', 15),
('e0000000-0000-0000-0000-000000000013', 2, 'Filtra las filas donde la clave foránea o primaria de la tabla derecha sea nula: WHERE dp.detalle_id IS NULL.', 20),
('e0000000-0000-0000-0000-000000000036', 1, 'Haz un LEFT JOIN desde facturas f hacia pagos p por factura_id.', 15),
('e0000000-0000-0000-0000-000000000036', 2, 'Filtra con WHERE p.pago_id IS NULL para encontrar facturas sin ningún abono.', 20),
('e0000000-0000-0000-0000-000000000036', 3, 'Ordena por f.factura_id ASC.', 25),
('e0000000-0000-0000-0000-000000000037', 1, 'En el ON del LEFT JOIN incluye p.producto_id = i.producto_id AND i.almacen_id = 1.', 15),
('e0000000-0000-0000-0000-000000000037', 2, 'En WHERE comprueba WHERE i.almacen_id IS NULL para encontrar las ausencias.', 20),
('e0000000-0000-0000-0000-000000000038', 1, 'Usa COUNT(p.pedido_id) AS total_pedidos para contar únicamente pedidos existentes.', 15),
('e0000000-0000-0000-0000-000000000038', 2, 'Agrupa por c.cliente_id, c.nombre, c.apellido y ordena con ORDER BY total_pedidos DESC, c.cliente_id ASC;', 20),
('e0000000-0000-0000-0000-000000000014', 1, 'Encadena 4 cláusulas INNER JOIN siguiendo las claves foráneas correspondientes.', 15),
('e0000000-0000-0000-0000-000000000014', 2, 'Usa alias de tabla concisos: p, c, dp, pr, cat.', 20),
('e0000000-0000-0000-0000-000000000014', 3, 'Añade ORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10; al final.', 25),
('e0000000-0000-0000-0000-000000000039', 1, 'Encadena 4 INNER JOINs desde clientes hasta categorias.', 15),
('e0000000-0000-0000-0000-000000000039', 2, 'Agrupa por c.ciudad y cat.nombre_categoria, calculando SUM(dp.cantidad * dp.precio_unitario) AS monto_vendido.', 20),
('e0000000-0000-0000-0000-000000000039', 3, 'Ordena por c.ciudad ASC, monto_vendido DESC;', 25),
('e0000000-0000-0000-0000-000000000040', 1, 'Une pedidos p con facturas f por pedido_id, y facturas f con pagos pg por factura_id.', 15),
('e0000000-0000-0000-0000-000000000040', 2, 'Usa f.monto_total AS monto_factura y pg.monto AS monto_pago.', 20),
('e0000000-0000-0000-0000-000000000040', 3, 'Ordena por p.pedido_id ASC;', 25),
('e0000000-0000-0000-0000-000000000041', 1, 'Une productos pr con inventario i por producto_id, e inventario i con almacenes a por almacen_id.', 15),
('e0000000-0000-0000-0000-000000000041', 2, 'Filtra en WHERE i.cantidad_disponible > 10 y ordena con ORDER BY pr.nombre_producto ASC, a.nombre_almacen ASC;', 20),
('e0000000-0000-0000-0000-000000000042', 1, 'El primer bloque es SELECT ciudad, ''cliente'' AS tipo_entidad FROM clientes.', 15),
('e0000000-0000-0000-0000-000000000042', 2, 'Usa UNION con el segundo bloque: SELECT ciudad, ''almacen'' AS tipo_entidad FROM almacenes.', 20),
('e0000000-0000-0000-0000-000000000042', 3, 'Finaliza la instrucción con ORDER BY ciudad ASC, tipo_entidad ASC;', 25),
('e0000000-0000-0000-0000-000000000043', 1, 'Escribe SELECT ciudad FROM clientes seguido de EXCEPT SELECT ciudad FROM almacenes.', 15),
('e0000000-0000-0000-0000-000000000043', 2, 'Agrega ORDER BY ciudad ASC; al final.', 20),
('e0000000-0000-0000-0000-000000000044', 1, 'Usa CROSS JOIN entre almacenes a y categorias c.', 15),
('e0000000-0000-0000-0000-000000000044', 2, 'Ordena el resultado por a.nombre_almacen ASC, c.nombre_categoria ASC;', 20),
('e0000000-0000-0000-0000-000000000045', 1, 'Une productos p1 con productos p2 en ON p1.categoria_id = p2.categoria_id AND p1.producto_id < p2.producto_id.', 15),
('e0000000-0000-0000-0000-000000000045', 2, 'Ordena por p1.categoria_id ASC, producto_a ASC, producto_b ASC;', 20),
('e0000000-0000-0000-0000-000000000015', 1, 'En la cláusula WHERE, escribe precio > (SELECT AVG(precio) FROM productos).', 15),
('e0000000-0000-0000-0000-000000000015', 2, 'No olvides ordenar con ORDER BY precio DESC.', 20),
('e0000000-0000-0000-0000-000000000016', 1, 'Usa la sintaxis: CASE WHEN condicion1 THEN valor1 WHEN condicion2 THEN valor2 ELSE valor_defecto END AS segmento.', 15),
('e0000000-0000-0000-0000-000000000016', 2, 'Recuerda ordenar con ORDER BY total DESC.', 20),
('e0000000-0000-0000-0000-000000000018', 1, 'Usa DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria.', 15),
('e0000000-0000-0000-0000-000000000018', 2, 'Ordena al final por categoria_id ASC, ranking_categoria ASC.', 20),
('e0000000-0000-0000-0000-000000000017', 1, 'Inicia con WITH ventas_por_categoria AS ( ... )', 15),
('e0000000-0000-0000-0000-000000000017', 2, 'Dentro del CTE, cruza categorias, productos y detalle_pedidos y agrupa por c.nombre_categoria.', 20),
('e0000000-0000-0000-0000-000000000017', 3, 'En la consulta principal, haz SELECT nombre_categoria, facturacion FROM ventas_por_categoria ORDER BY facturacion DESC;', 25),
('e0000000-0000-0000-0000-000000000007', 1, 'Usa la función ventana ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking.', 15)
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
