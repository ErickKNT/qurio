-- ==============================================================================
-- Qurio: Dataset Semilla de Práctica — Ecommerce_Production_DB
-- 10 tablas relacionales con datos de negocio realistas
-- ==============================================================================

-- 1. Estructura de Tablas
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS facturas CASCADE;
DROP TABLE IF EXISTS detalle_pedidos CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS inventario CASCADE;
DROP TABLE IF EXISTS almacenes CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;

CREATE TABLE clientes (
    cliente_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    pais VARCHAR(50) NOT NULL,
    fecha_registro DATE NOT NULL
);

CREATE TABLE categorias (
    categoria_id SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL,
    descripcion TEXT
);

CREATE TABLE proveedores (
    proveedor_id SERIAL PRIMARY KEY,
    nombre_proveedor VARCHAR(80) NOT NULL,
    pais VARCHAR(50) NOT NULL,
    telefono VARCHAR(25)
);

CREATE TABLE productos (
    producto_id SERIAL PRIMARY KEY,
    categoria_id INT REFERENCES categorias(categoria_id),
    proveedor_id INT REFERENCES proveedores(proveedor_id),
    nombre_producto VARCHAR(100) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0
);

CREATE TABLE almacenes (
    almacen_id SERIAL PRIMARY KEY,
    nombre_almacen VARCHAR(80) NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    capacidad_m2 INT NOT NULL
);

CREATE TABLE inventario (
    almacen_id INT REFERENCES almacenes(almacen_id),
    producto_id INT REFERENCES productos(producto_id),
    cantidad_disponible INT NOT NULL,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (almacen_id, producto_id)
);

CREATE TABLE pedidos (
    pedido_id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes(cliente_id),
    fecha_pedido DATE NOT NULL,
    estado_pedido VARCHAR(20) NOT NULL CHECK (estado_pedido IN ('completado', 'pendiente', 'cancelado', 'procesando')),
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE detalle_pedidos (
    detalle_id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(pedido_id) ON DELETE CASCADE,
    producto_id INT REFERENCES productos(producto_id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL
);

CREATE TABLE facturas (
    factura_id SERIAL PRIMARY KEY,
    pedido_id INT UNIQUE REFERENCES pedidos(pedido_id),
    fecha_emision DATE NOT NULL,
    monto_total NUMERIC(10, 2) NOT NULL,
    estado_factura VARCHAR(20) NOT NULL CHECK (estado_factura IN ('pagada', 'pendiente', 'anulada'))
);

CREATE TABLE pagos (
    pago_id SERIAL PRIMARY KEY,
    factura_id INT REFERENCES facturas(factura_id),
    metodo_pago VARCHAR(30) NOT NULL CHECK (metodo_pago IN ('tarjeta_credito', 'transferencia', 'paypal', 'efectivo')),
    monto NUMERIC(10, 2) NOT NULL,
    fecha_pago DATE NOT NULL,
    estado_pago VARCHAR(20) NOT NULL CHECK (estado_pago IN ('aprobado', 'rechazado', 'procesando'))
);

-- ==============================================================================
-- 2. Datos Semilla (Seed Data)
-- ==============================================================================

-- Clientes (Incluye clientes con compras y clientes SIN compras para LEFT JOINs)
INSERT INTO clientes (cliente_id, nombre, apellido, email, ciudad, pais, fecha_registro) VALUES
(1, 'Carlos', 'Mendoza', 'carlos.mendoza@email.com', 'Madrid', 'España', '2023-01-15'),
(2, 'Elena', 'Gómez', 'elena.gomez@email.com', 'Barcelona', 'España', '2023-02-20'),
(3, 'Mateo', 'Silva', 'mateo.silva@email.com', 'Valencia', 'España', '2023-03-10'),
(4, 'Sofía', 'Torres', 'sofia.torres@email.com', 'Sevilla', 'España', '2023-04-05'),
(5, 'Lucas', 'Ríos', 'lucas.rios@email.com', 'Bilbao', 'España', '2023-05-12'),
(6, 'Valentina', 'Paredes', 'valentina.p@email.com', 'Madrid', 'España', '2023-06-18'),
(7, 'Andrés', 'Castro', 'andres.castro@email.com', 'Bogotá', 'Colombia', '2023-07-22'),
(8, 'Camila', 'Vargas', 'camila.vargas@email.com', 'Medellín', 'Colombia', '2023-08-30'),
(9, 'Javier', 'Navarro', 'javier.navarro@email.com', 'Ciudad de México', 'México', '2023-09-14'),
(10, 'Lucía', 'Morales', 'lucia.morales@email.com', 'Guadalajara', 'México', '2023-10-01'),
-- Clientes SIN compras (para retos de 'LEFT JOIN ... IS NULL')
(11, 'Diego', 'Hernández', 'diego.hernandez@email.com', 'Madrid', 'España', '2023-11-11'),
(12, 'Mariana', 'Reyes', 'mariana.reyes@email.com', 'Santiago', 'Chile', '2023-11-25'),
(13, 'Fernando', 'Cruz', 'fernando.cruz@email.com', 'Lima', 'Perú', '2023-12-05'),
(14, 'Paula', 'Ortega', 'paula.ortega@email.com', 'Buenos Aires', 'Argentina', '2024-01-10'),
(15, 'Tomás', 'Ibáñez', 'tomas.ibanez@email.com', 'Montevideo', 'Uruguay', '2024-02-14');

ALTER SEQUENCE clientes_cliente_id_seq RESTART WITH 16;

-- Categorías
INSERT INTO categorias (categoria_id, nombre_categoria, descripcion) VALUES
(1, 'Laptops & Computación', 'Equipos portátiles, componentes y estaciones de trabajo'),
(2, 'Monitores & Pantallas', 'Monitores de alta tasa de refresco y resolución 4K'),
(3, 'Periféricos', 'Teclados mecánicos, ratones ergonómicos y auriculares'),
(4, 'Almacenamiento', 'Discos duros NVMe SSD y unidades externas de respaldo'),
(5, 'Mobiliario Ergonómico', 'Sillas ejecutivas, escritorios elevables y brazos articulados');

ALTER SEQUENCE categorias_categoria_id_seq RESTART WITH 6;

-- Proveedores
INSERT INTO proveedores (proveedor_id, nombre_proveedor, pais, telefono) VALUES
(1, 'TechNova Global', 'Alemania', '+49-89-123456'),
(2, 'Silicon Logistics', 'Taiwán', '+886-2-876543'),
(3, 'Apex Ergonomics', 'Suecia', '+46-8-555123'),
(4, 'StorageCore Inc', 'Estados Unidos', '+1-415-987654'),
(5, 'Peripheral Craft', 'Japón', '+81-3-333344');

ALTER SEQUENCE proveedores_proveedor_id_seq RESTART WITH 6;

-- Productos
INSERT INTO productos (producto_id, categoria_id, proveedor_id, nombre_producto, precio, stock) VALUES
(1, 1, 1, 'ProBook Ultra 16 M3', 1450.00, 25),
(2, 1, 1, 'DevStation Mini Ryzen 9', 1100.00, 18),
(3, 1, 2, 'AirBook Slim 13', 890.00, 40),
(4, 2, 2, 'UltraWide Curved 34" 144Hz', 580.00, 15),
(5, 2, 2, '4K ProArt 27" Color Accurate', 690.00, 12),
(6, 2, 2, 'FHD Gaming 24" 165Hz', 220.00, 50),
(7, 3, 5, 'Teclado Mecánico Custom 75%', 140.00, 60),
(8, 3, 5, 'Ratón Inalámbrico Vertical Ergo', 75.00, 85),
(9, 3, 5, 'Headset Hi-Res Noise Cancelling', 190.00, 30),
(10, 4, 4, 'SSD NVMe Gen4 2TB', 160.00, 75),
(11, 4, 4, 'SSD Externo Rugged 1TB', 110.00, 45),
(12, 4, 4, 'Disco Mecánico NAS 8TB', 210.00, 20),
(13, 5, 3, 'Silla Ergonómica Pro Mesh', 420.00, 14),
(14, 5, 3, 'Escritorio Elevable Motorizado 140cm', 480.00, 8),
(15, 5, 3, 'Brazo Articulado para Doble Monitor', 85.00, 35);

ALTER SEQUENCE productos_producto_id_seq RESTART WITH 16;

-- Almacenes
INSERT INTO almacenes (almacen_id, nombre_almacen, ciudad, capacidad_m2) VALUES
(1, 'Hub Logístico Central Madrid', 'Madrid', 5000),
(2, 'Centro de Distribución Norte', 'Bilbao', 2800),
(3, 'Almacén Mediterráneo', 'Valencia', 3500);

ALTER SEQUENCE almacenes_almacen_id_seq RESTART WITH 4;

-- Inventario
INSERT INTO inventario (almacen_id, producto_id, cantidad_disponible) VALUES
(1, 1, 15), (1, 4, 8), (1, 7, 30), (1, 10, 45), (1, 13, 8),
(2, 2, 10), (2, 5, 6), (2, 8, 40), (2, 11, 20), (2, 14, 4),
(3, 3, 25), (3, 6, 30), (3, 9, 15), (3, 12, 10), (3, 15, 20),
(1, 2, 8),  (1, 8, 45), (2, 1, 10), (3, 4, 7);

-- Pedidos
INSERT INTO pedidos (pedido_id, cliente_id, fecha_pedido, estado_pedido, total) VALUES
(101, 1, '2024-01-10', 'completado', 1590.00),
(102, 2, '2024-01-12', 'completado', 720.00),
(103, 3, '2024-01-15', 'completado', 215.00),
(104, 1, '2024-02-01', 'completado', 320.00),
(105, 4, '2024-02-05', 'cancelado', 580.00),
(106, 5, '2024-02-14', 'completado', 1450.00),
(107, 6, '2024-02-20', 'completado', 900.00),
(108, 7, '2024-03-01', 'completado', 1700.00),
(109, 2, '2024-03-10', 'completado', 160.00),
(110, 8, '2024-03-15', 'pendiente', 480.00),
(111, 9, '2024-03-22', 'completado', 690.00),
(112, 10, '2024-04-05', 'completado', 85.00),
(113, 3, '2024-04-12', 'completado', 1100.00),
(114, 5, '2024-04-18', 'procesando', 265.00),
(115, 7, '2024-05-02', 'completado', 505.00);

ALTER SEQUENCE pedidos_pedido_id_seq RESTART WITH 116;

-- Detalle de Pedidos
INSERT INTO detalle_pedidos (detalle_id, pedido_id, producto_id, cantidad, precio_unitario) VALUES
(1, 101, 1, 1, 1450.00),
(2, 101, 7, 1, 140.00),
(3, 102, 4, 1, 580.00),
(4, 102, 7, 1, 140.00),
(5, 103, 7, 1, 140.00),
(6, 103, 8, 1, 75.00),
(7, 104, 10, 2, 160.00),
(8, 105, 4, 1, 580.00),
(9, 106, 1, 1, 1450.00),
(10, 107, 13, 2, 420.00),
(11, 107, 15, 1, 60.00),
(12, 108, 2, 1, 1100.00),
(13, 108, 4, 1, 580.00),
(14, 108, 15, 1, 20.00),
(15, 109, 10, 1, 160.00),
(16, 110, 14, 1, 480.00),
(17, 111, 5, 1, 690.00),
(18, 112, 15, 1, 85.00),
(19, 113, 2, 1, 1100.00),
(20, 114, 11, 1, 110.00),
(21, 114, 8, 1, 75.00),
(22, 114, 15, 1, 80.00),
(23, 115, 13, 1, 420.00),
(24, 115, 15, 1, 85.00);

ALTER SEQUENCE detalle_pedidos_detalle_id_seq RESTART WITH 25;

-- Facturas
INSERT INTO facturas (factura_id, pedido_id, fecha_emision, monto_total, estado_factura) VALUES
(201, 101, '2024-01-10', 1590.00, 'pagada'),
(202, 102, '2024-01-12', 720.00, 'pagada'),
(203, 103, '2024-01-15', 215.00, 'pagada'),
(204, 104, '2024-02-01', 320.00, 'pagada'),
(205, 105, '2024-02-05', 580.00, 'anulada'),
(206, 106, '2024-02-14', 1450.00, 'pagada'),
(207, 107, '2024-02-20', 900.00, 'pagada'),
(208, 108, '2024-03-01', 1700.00, 'pagada'),
(209, 109, '2024-03-10', 160.00, 'pagada'),
(210, 110, '2024-03-15', 480.00, 'pendiente'),
(211, 111, '2024-03-22', 690.00, 'pagada'),
(212, 112, '2024-04-05', 85.00, 'pagada'),
(213, 113, '2024-04-12', 1100.00, 'pagada');

ALTER SEQUENCE facturas_factura_id_seq RESTART WITH 214;

-- Pagos
INSERT INTO pagos (pago_id, factura_id, metodo_pago, monto, fecha_pago, estado_pago) VALUES
(1, 201, 'tarjeta_credito', 1590.00, '2024-01-10', 'aprobado'),
(2, 202, 'transferencia', 720.00, '2024-01-12', 'aprobado'),
(3, 203, 'paypal', 215.00, '2024-01-15', 'aprobado'),
(4, 204, 'tarjeta_credito', 320.00, '2024-02-01', 'aprobado'),
(5, 206, 'transferencia', 1450.00, '2024-02-14', 'aprobado'),
(6, 207, 'tarjeta_credito', 900.00, '2024-02-20', 'aprobado'),
(7, 208, 'tarjeta_credito', 1700.00, '2024-03-01', 'aprobado'),
(8, 209, 'paypal', 160.00, '2024-03-10', 'aprobado'),
(9, 211, 'tarjeta_credito', 690.00, '2024-03-22', 'aprobado'),
(10, 212, 'tarjeta_credito', 85.00, '2024-04-05', 'aprobado'),
(11, 213, 'transferencia', 1100.00, '2024-04-12', 'aprobado');

ALTER SEQUENCE pagos_pago_id_seq RESTART WITH 12;

-- Asegurar permisos de lectura para el estudiante
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_student;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO readonly_student;
