from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class ExerciseConcept(BaseModel):
    summary: str
    syntax: Optional[str] = None
    key_points: Optional[List[str]] = None
    execution_order_note: Optional[str] = None


class SampleTableData(BaseModel):
    tableName: str
    columns: List[str]
    rows: List[List[Any]]


class ExerciseDetail(BaseModel):
    id: str
    module_id: str
    title: str
    prompt: str
    initial_code: str
    solution_query: str
    xp_reward: int
    difficulty: str
    check_order: bool
    sort_order: int
    hints: List[str] = []
    concept: Optional[ExerciseConcept] = None
    objectives: Optional[List[str]] = None
    sample_tables: Optional[List[SampleTableData]] = None


# Tablas de muestra compartidas para previsualización pedagógica
SAMPLE_TABLE_PRODUCTOS = SampleTableData(
    tableName="productos",
    columns=["producto_id", "categoria_id", "nombre_producto", "precio", "stock"],
    rows=[
        [1, 1, "Laptop Pro 15", 1299.99, 15],
        [2, 1, "Smartphone X", 799.50, 30],
        [3, 1, "Auriculares Noise-Cancelling", 199.99, 50],
        [4, 1, "Monitor 4K 27\"", 450.00, 20],
        [5, 1, "Teclado Mecánico RGB", 89.90, 80],
    ],
)

SAMPLE_TABLE_CLIENTES = SampleTableData(
    tableName="clientes",
    columns=["cliente_id", "nombre", "apellido", "email", "ciudad", "pais"],
    rows=[
        [1, "Carlos", "Mendoza", "carlos.mendoza@email.com", "Madrid", "España"],
        [2, "Elena", "Gómez", "elena.gomez@email.com", "Barcelona", "España"],
        [3, "Mateo", "Silva", "mateo.silva@email.com", "Valencia", "España"],
        [4, "Sofía", "Torres", "sofia.torres@email.com", "Sevilla", "España"],
        [11, "Diego", "Hernández", "diego.hernandez@email.com", "Madrid", "España"],
    ],
)

SAMPLE_TABLE_PEDIDOS = SampleTableData(
    tableName="pedidos",
    columns=["pedido_id", "cliente_id", "fecha_pedido", "estado_pedido", "total"],
    rows=[
        [101, 1, "2024-01-10", "completado", 1499.98],
        [102, 2, "2024-01-12", "completado", 799.50],
        [103, 3, "2024-01-15", "pendiente", 89.90],
        [104, 1, "2024-02-01", "completado", 450.00],
    ],
)

SAMPLE_TABLE_CATEGORIAS = SampleTableData(
    tableName="categorias",
    columns=["categoria_id", "nombre_categoria", "descripcion"],
    rows=[
        [1, "Electrónica", "Dispositivos, gadgets y accesorios tecnológicos"],
        [2, "Hogar", "Muebles, decoración y cocina"],
        [3, "Deportes", "Equipamiento deportivo y fitness"],
        [4, "Moda", "Ropa y calzado"],
        [5, "Libros", "Lecturas y material educativo"],
    ],
)

SAMPLE_TABLE_DETALLE_PEDIDOS = SampleTableData(
    tableName="detalle_pedidos",
    columns=["detalle_id", "pedido_id", "producto_id", "cantidad", "precio_unitario"],
    rows=[
        [1, 101, 1, 1, 1299.99],
        [2, 101, 3, 1, 199.99],
        [3, 102, 2, 1, 799.50],
        [4, 103, 5, 1, 89.90],
    ],
)

SAMPLE_TABLE_FACTURAS = SampleTableData(
    tableName="facturas",
    columns=["factura_id", "pedido_id", "fecha_emision", "monto_total", "estado_factura"],
    rows=[
        [201, 101, "2024-01-10", 1590.00, "pagada"],
        [202, 102, "2024-01-12", 720.00, "pagada"],
        [205, 105, "2024-01-20", 580.00, "anulada"],
        [210, 110, "2024-02-05", 480.00, "pendiente"],
    ],
)

SAMPLE_TABLE_PROVEEDORES = SampleTableData(
    tableName="proveedores",
    columns=["proveedor_id", "nombre_proveedor", "pais", "telefono"],
    rows=[
        [1, "TechDistro España S.L.", "España", "+34 91 123 4567"],
        [2, "Nordic Peripherals AB", "Suecia", "+46 8 555 1234"],
        [3, "Silicon Logistics Asia", "Taiwán", "+886 2 8765 4321"],
    ],
)


SAMPLE_TABLE_ALMACENES = SampleTableData(
    tableName="almacenes",
    columns=["almacen_id", "nombre_almacen", "ciudad", "capacidad_m2"],
    rows=[
        [1, "Hub Logístico Central Madrid", "Madrid", 5000],
        [2, "Centro de Distribución Norte", "Bilbao", 2800],
        [3, "Almacén Mediterráneo", "Valencia", 3500],
    ],
)

SAMPLE_TABLE_INVENTARIO = SampleTableData(
    tableName="inventario",
    columns=["almacen_id", "producto_id", "cantidad_disponible"],
    rows=[
        [1, 1, 15],
        [1, 4, 8],
        [2, 2, 20],
        [3, 3, 25],
    ],
)

SAMPLE_TABLE_PAGOS = SampleTableData(
    tableName="pagos",
    columns=["pago_id", "factura_id", "metodo_pago", "monto", "fecha_pago", "estado_pago"],
    rows=[
        [1, 201, "tarjeta_credito", 1590.00, "2024-01-10", "aprobado"],
        [2, 202, "transferencia", 720.00, "2024-01-12", "aprobado"],
        [3, 203, "paypal", 215.00, "2024-01-15", "aprobado"],
    ],
)

# Catálogo completo de 32 ejercicios (Ruta 1 completa con 22 retos + Rutas 2 y 3) enriquecidos con didáctica interactiva estilo SQLBolt
SEED_EXERCISES: Dict[str, ExerciseDetail] = {
    # =========================================================================
    # RUTA 1: SQL Foundations (Módulos 1 al 4)
    # =========================================================================

    # Módulo 1 - Reto 1: SELECT & Proyecciones
    "e0000000-0000-0000-0000-000000000001": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000001",
        module_id="a0000000-0000-0000-0000-000000000001",
        title="Catálogo Básico de Productos",
        prompt="El departamento de ventas necesita listar los nombres de los productos junto con su precio de venta unitario. Escribe una consulta que obtenga únicamente las columnas nombre_producto y precio de la tabla productos.",
        initial_code="-- Escribe tu consulta aquí\nSELECT ",
        solution_query="SELECT nombre_producto, precio FROM productos;",
        xp_reward=30,
        difficulty="Principiante",
        check_order=False,
        sort_order=1,
        hints=[
            "Usa la sentencia SELECT seguida de las columnas solicitadas separadas por coma.",
            "La cláusula FROM indica la tabla productos.",
        ],
        concept=ExerciseConcept(
            summary="La sentencia SELECT es la instrucción fundamental en SQL para recuperar datos de una base de datos relacional. Te permite proyectar únicamente las columnas necesarias.",
            syntax="SELECT columna_1, columna_2\nFROM nombre_tabla;",
            key_points=[
                "SELECT especifica qué atributos deseas proyectar en el conjunto final.",
                "FROM indica la entidad o tabla de origen donde residen los datos.",
                "En PostgreSQL las columnas y tablas no distinguen mayúsculas salvo que lleven comillas dobles.",
            ],
            execution_order_note="⚡ Orden de procesamiento interno: FROM se ejecuta antes que SELECT para cargar primero la relación en el buffer.",
        ),
        objectives=[
            "1. Identificar la tabla de origen: 'productos'.",
            "2. Proyectar exactamente las columnas 'nombre_producto' y 'precio'.",
            "3. Finalizar la instrucción con punto y coma (;).",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    # Módulo 1 - Reto 2: Expresiones Aritméticas y Alias
    "e0000000-0000-0000-0000-000000000008": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000008",
        module_id="a0000000-0000-0000-0000-000000000001",
        title="Cálculo de Precios con IVA",
        prompt="El área contable requiere proyectar el precio final de cada producto aplicando el 21% de IVA (multiplicando el precio por 1.21). Escribe una consulta que devuelva el nombre_producto, el precio original y el precio calculado redondeado a 2 decimales bajo el alias precio_con_iva.",
        initial_code="-- Proyecta columnas y calcula el precio con IVA\nSELECT ",
        solution_query="SELECT nombre_producto, precio, ROUND(precio * 1.21, 2) AS precio_con_iva FROM productos;",
        xp_reward=35,
        difficulty="Principiante",
        check_order=False,
        sort_order=2,
        hints=[
            "Puedes realizar operaciones matemáticas directamente en SELECT, ej: precio * 1.21",
            "Usa ROUND(expresion, 2) AS precio_con_iva para limitar a 2 decimales y asignar el alias.",
        ],
        concept=ExerciseConcept(
            summary="En SQL las expresiones aritméticas (+, -, *, /) se evalúan en la cláusula SELECT para derivar métricas en tiempo de consulta. La palabra clave AS asigna un nombre limpio y legible al atributo calculado.",
            syntax="SELECT columna, ROUND(columna * factor, 2) AS nuevo_nombre\nFROM nombre_tabla;",
            key_points=[
                "Las operaciones aritméticas respetan la precedencia estándar de las matemáticas.",
                "ROUND(valor, decimales) ajusta la precisión numérica para evitar artefactos de punto flotante.",
                "Los alias de columna renombran los campos en la proyección final sin modificar la tabla física.",
            ],
            execution_order_note="⚡ Las expresiones aritméticas se calculan en la fase de proyección SELECT una vez leídas las filas.",
        ),
        objectives=[
            "1. Proyectar 'nombre_producto' y 'precio'.",
            "2. Calcular 'precio * 1.21' redondeado con ROUND(..., 2).",
            "3. Asignar el alias 'precio_con_iva'.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    
    # Módulo 1 - Reto 3: Concatenación de Cadenas y Alias
    "e0000000-0000-0000-0000-000000000019": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000019",
        module_id="a0000000-0000-0000-0000-000000000001",
        title="Concatenación de Nombre Completo",
        prompt="El departamento de soporte requiere un directorio de clientes con su nombre completo unificado y su correo electrónico. Escribe una consulta que combine las columnas nombre y apellido separadas por un espacio bajo el alias cliente_completo, junto con la columna email de la tabla clientes.",
        initial_code="-- Concatena nombre y apellido con un espacio\nSELECT ",
        solution_query="SELECT nombre || ' ' || apellido AS cliente_completo, email FROM clientes;",
        xp_reward=35,
        difficulty="Principiante",
        check_order=False,
        sort_order=3,
        hints=[
            "Usa el operador de concatenación de cadenas de texto en SQL: '||'.",
            "Para insertar un espacio en medio escribe: nombre || ' ' || apellido AS cliente_completo.",
        ],
        concept=ExerciseConcept(
            summary="El operador de tubería doble '||' permite concatenar cadenas de caracteres en SQL estándar y PostgreSQL. La cláusula AS renombra la columna resultante en la proyección.",
            syntax="SELECT columna1 || ' ' || columna2 AS nombre_completo\nFROM tabla;",
            key_points=[
                "El operador || une valores de texto o columnas de tipo VARCHAR/TEXT.",
                "Si un término es NULL, la concatenación en SQL estándar resulta en NULL (a menos que uses CONCAT).",
            ],
            execution_order_note="⚡ La concatenación se evalúa fila por fila en la fase de proyección SELECT.",
        ),
        objectives=[
            "1. Identificar la tabla de origen 'clientes'.",
            "2. Concatenar 'nombre', un espacio ' ' y 'apellido' bajo el alias 'cliente_completo'.",
            "3. Proyectar la columna 'email'.",
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES],
    ),

    # Módulo 1 - Reto 4: Catálogo de Ciudades Únicas (DISTINCT)
    "e0000000-0000-0000-0000-000000000020": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000020",
        module_id="a0000000-0000-0000-0000-000000000001",
        title="Catálogo de Ciudades Únicas (DISTINCT)",
        prompt="El equipo de logística necesita conocer todas las ciudades únicas donde residen clientes para planificar nuevas rutas de entrega. Escribe una consulta que obtenga la lista de ciudades sin repeticiones de la tabla clientes, bajo la columna ciudad.",
        initial_code="-- Obtén valores únicos de ciudad\nSELECT ",
        solution_query="SELECT DISTINCT ciudad FROM clientes;",
        xp_reward=35,
        difficulty="Principiante",
        check_order=False,
        sort_order=4,
        hints=[
            "La palabra reservada DISTINCT se coloca inmediatamente después de SELECT.",
            "Escribe: SELECT DISTINCT ciudad FROM clientes;",
        ],
        concept=ExerciseConcept(
            summary="La cláusula DISTINCT elimina filas duplicadas del conjunto de resultados devuelto por la consulta relacional, garantizando unicidad en la proyección.",
            syntax="SELECT DISTINCT columna\nFROM nombre_tabla;",
            key_points=[
                "DISTINCT opera sobre todas las columnas de la lista de selección en conjunto.",
                "Internamente suele ejecutar una ordenación o un hash en memoria para descartar repetidos.",
            ],
            execution_order_note="⚡ DISTINCT se procesa casi al final del pipeline lógico, justo antes de ORDER BY y LIMIT.",
        ),
        objectives=[
            "1. Usar la palabra clave DISTINCT tras SELECT.",
            "2. Proyectar la columna 'ciudad' de la tabla 'clientes'.",
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES],
    ),

# Módulo 2 - Reto 5: Filtrado con WHERE (> 500)
    "e0000000-0000-0000-0000-000000000002": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000002",
        module_id="a0000000-0000-0000-0000-000000000002",
        title="Productos Premium (> 500€)",
        prompt="Para una campaña exclusiva, marketing solicita todos los productos cuyo precio supere los 500 euros. Devuelve el nombre del producto, el precio y el stock actual para aquellos productos con precio estrictamente mayor a 500.",
        initial_code="-- Filtra los productos de alto valor\nSELECT ",
        solution_query="SELECT nombre_producto, precio, stock FROM productos WHERE precio > 500;",
        xp_reward=35,
        difficulty="Principiante",
        check_order=False,
        sort_order=5,
        hints=[
            "Agrega una cláusula WHERE después de FROM productos.",
            "Utiliza el operador de comparación mayor que (>).",
        ],
        concept=ExerciseConcept(
            summary="La cláusula WHERE restringe los resultados evaluando una condición booleana fila por fila. Solo las filas donde la expresión resulte TRUE son devueltas.",
            syntax="SELECT col1, col2, col3\nFROM tabla\nWHERE condicion_comparacion;",
            key_points=[
                "Operadores estándar: >, <, >=, <=, =, <> (o !=).",
                "WHERE evalúa tuplas individuales antes de cualquier agregación o agrupamiento.",
            ],
            execution_order_note="⚡ Orden de procesamiento: FROM → WHERE → SELECT. El filtro se evalúa ANTES de proyectar las columnas.",
        ),
        objectives=[
            "1. Seleccionar 'nombre_producto', 'precio' y 'stock' de 'productos'.",
            "2. Añadir la cláusula WHERE con la condición 'precio > 500'.",
            "3. Verificar que no se incluyan productos de 500€ exactos o menores.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    # Módulo 2 - Reto 4: Operador BETWEEN
    "e0000000-0000-0000-0000-000000000009": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000009",
        module_id="a0000000-0000-0000-0000-000000000002",
        title="Productos en Rango Medio (BETWEEN)",
        prompt="El equipo de catálogo desea identificar productos de gama media con precios entre 100€ y 800€ (inclusive). Escribe una consulta que liste el nombre_producto y el precio de los productos que cumplan con dicho rango.",
        initial_code="-- Filtra productos en el rango de 100 a 800\nSELECT ",
        solution_query="SELECT nombre_producto, precio FROM productos WHERE precio BETWEEN 100 AND 800;",
        xp_reward=35,
        difficulty="Principiante",
        check_order=False,
        sort_order=6,
        hints=[
            "El operador BETWEEN valor_min AND valor_max incluye ambos extremos del intervalo.",
            "Equivale lógicamente a 'WHERE precio >= 100 AND precio <= 800'.",
        ],
        concept=ExerciseConcept(
            summary="El operador BETWEEN evalúa si una expresión se encuentra dentro de un rango cerrado inclusivo [min, max]. Es más conciso y legible que combinar dos condiciones con AND.",
            syntax="SELECT columna_1, columna_2\nFROM tabla\nWHERE columna BETWEEN valor_min AND valor_max;",
            key_points=[
                "BETWEEN es inclusivo: incluye los valores frontera min y max.",
                "Funciona tanto con números como con fechas y cadenas de texto alfabéticas.",
            ],
            execution_order_note="⚡ WHERE BETWEEN filtra las tuplas durante la etapa de restricción en el escaneo de tabla.",
        ),
        objectives=[
            "1. Consultar 'nombre_producto' y 'precio' de la tabla 'productos'.",
            "2. Aplicar 'WHERE precio BETWEEN 100 AND 800'.",
            "3. Comprobar que los límites de 100 y 800 queden incluidos.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    
    # Módulo 2 - Reto 7: Búsqueda por Patrón de Correo (LIKE)
    "e0000000-0000-0000-0000-000000000021": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000021",
        module_id="a0000000-0000-0000-0000-000000000002",
        title="Búsqueda por Patrón de Correo (LIKE)",
        prompt="El equipo de marketing desea enviar un comunicado a los usuarios registrados con cuentas corporativas estándar que utilicen el dominio genérico '@email.com'. Escribe una consulta que devuelva el nombre, apellido y email de todos los clientes cuyo correo electrónico termine exactamente en '@email.com'.",
        initial_code="-- Filtra clientes con comodín LIKE\nSELECT ",
        solution_query="SELECT nombre, apellido, email FROM clientes WHERE email LIKE '%@email.com';",
        xp_reward=40,
        difficulty="Principiante",
        check_order=False,
        sort_order=7,
        hints=[
            "Usa el operador LIKE en la cláusula WHERE.",
            "El comodín '%' representa cero o más caracteres arbitrarios: LIKE '%@email.com'.",
        ],
        concept=ExerciseConcept(
            summary="El operador LIKE evalúa si una cadena coincide con un patrón específico utilizando comodines. En PostgreSQL, '%' coincide con cualquier secuencia de caracteres y '_' con un solo carácter.",
            syntax="SELECT columnas\nFROM tabla\nWHERE columna LIKE 'patron%';",
            key_points=[
                "'%texto' coincide con cadenas que terminen en ese texto.",
                "LIKE distingue entre mayúsculas y minúsculas; en PostgreSQL existe ILIKE para búsquedas insensibles.",
            ],
            execution_order_note="⚡ WHERE se evalúa sobre cada tupla leída de disco antes de enviar los datos al cliente.",
        ),
        objectives=[
            "1. Proyectar 'nombre', 'apellido' y 'email'.",
            "2. Aplicar WHERE email LIKE '%@email.com'.",
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES],
    ),

    # Módulo 2 - Reto 8: Filtro de Ciudades Específicas (IN)
    "e0000000-0000-0000-0000-000000000022": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000022",
        module_id="a0000000-0000-0000-0000-000000000002",
        title="Filtro de Ciudades Específicas (IN)",
        prompt="Operaciones ha lanzado una promoción especial de envíos exprés para los centros urbanos principales: Madrid, Barcelona y Valencia. Escribe una consulta que devuelva cliente_id, nombre, apellido y ciudad para los clientes que residan en cualquiera de estas tres ciudades.",
        initial_code="-- Filtra mediante el operador IN\nSELECT ",
        solution_query="SELECT cliente_id, nombre, apellido, ciudad FROM clientes WHERE ciudad IN ('Madrid', 'Barcelona', 'Valencia');",
        xp_reward=40,
        difficulty="Principiante",
        check_order=False,
        sort_order=8,
        hints=[
            "El operador IN permite comprobar la pertenencia a una lista de valores discretos.",
            "Escribe WHERE ciudad IN ('Madrid', 'Barcelona', 'Valencia').",
        ],
        concept=ExerciseConcept(
            summary="El operador IN es una abreviación concisa y optimizada para múltiples condiciones OR (col = 'A' OR col = 'B' OR col = 'C'). Comprueba si un valor pertenece a una lista explícita.",
            syntax="SELECT columnas\nFROM tabla\nWHERE columna IN (val1, val2, val3);",
            key_points=[
                "Mejora la legibilidad del código SQL evitando cadenas repetitivas de OR.",
                "El optimizador de consultas de PostgreSQL suele transformar listas IN en búsquedas indexadas eficientes.",
            ],
            execution_order_note="⚡ La comprobación IN se ejecuta durante la fase de filtrado de filas WHERE.",
        ),
        objectives=[
            "1. Proyectar 'cliente_id', 'nombre', 'apellido' y 'ciudad'.",
            "2. Filtrar con WHERE ciudad IN ('Madrid', 'Barcelona', 'Valencia').",
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES],
    ),

    # Módulo 2 - Reto 9: Productos en Riesgo de Stock (OR)
    "e0000000-0000-0000-0000-000000000023": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000023",
        module_id="a0000000-0000-0000-0000-000000000002",
        title="Productos en Riesgo de Stock (OR)",
        prompt="Almacén necesita identificar con urgencia los artículos que están en extremos de inventario (aquellos con existencias críticas menores o iguales a 15 unidades, o artículos con sobrestock igual o mayor a 75 unidades). Escribe una consulta que devuelva producto_id, nombre_producto y stock para los productos que cumplan alguna de estas dos condiciones.",
        initial_code="-- Combina condiciones con OR\nSELECT ",
        solution_query="SELECT producto_id, nombre_producto, stock FROM productos WHERE stock <= 15 OR stock >= 75;",
        xp_reward=40,
        difficulty="Principiante",
        check_order=False,
        sort_order=9,
        hints=[
            "Usa el operador lógico OR para combinar dos predicados de comparación.",
            "Escribe WHERE stock <= 15 OR stock >= 75;",
        ],
        concept=ExerciseConcept(
            summary="El operador lógico OR devuelve TRUE si al menos una de las expresiones condicionales evaluadas es verdadera. Permite ampliar el conjunto de resultados para capturar múltiples criterios alternativos.",
            syntax="SELECT columnas\nFROM tabla\nWHERE condicion1 OR condicion2;",
            key_points=[
                "A diferencia de AND, con OR basta que una condición se cumpla para que la fila pase el filtro.",
                "Cuidado con la precedencia de operadores: AND tiene mayor prioridad que OR; usa paréntesis cuando combines ambos.",
            ],
            execution_order_note="⚡ El motor evalúa con cortocircuito: si la primera condición es TRUE, no necesita verificar la segunda.",
        ),
        objectives=[
            "1. Proyectar 'producto_id', 'nombre_producto' y 'stock'.",
            "2. Filtrar con WHERE stock <= 15 OR stock >= 75.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    # Módulo 2 - Reto 10: Facturas de Alto Valor No Pagadas (AND + NOT)
    "e0000000-0000-0000-0000-000000000024": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000024",
        module_id="a0000000-0000-0000-0000-000000000002",
        title="Facturas de Alto Valor No Pagadas (AND + NOT)",
        prompt="El departamento de cobranzas necesita auditar las facturas pendientes o en litigio de importe relevante. Escribe una consulta que devuelva factura_id, monto_total y estado_factura de todas las facturas cuyo monto_total sea mayor o igual a 400 y cuyo estado_factura sea diferente de 'pagada'.",
        initial_code="-- Combina AND con el operador de desigualdad\nSELECT ",
        solution_query="SELECT factura_id, monto_total, estado_factura FROM facturas WHERE monto_total >= 400 AND estado_factura <> 'pagada';",
        xp_reward=45,
        difficulty="Principiante",
        check_order=False,
        sort_order=10,
        hints=[
            "En SQL estándar la desigualdad se expresa con '<>' o '!='.",
            "Combina ambas condiciones con AND: WHERE monto_total >= 400 AND estado_factura <> 'pagada'.",
        ],
        concept=ExerciseConcept(
            summary="El operador lógico AND exige que ambas condiciones se satisfagan simultáneamente. El operador de desigualdad '<>' (o '!=') excluye valores específicos del conjunto de resultados.",
            syntax="SELECT columnas\nFROM tabla\nWHERE cond1 AND cond2 <> 'valor';",
            key_points=[
                "AND reduce la cardinalidad del resultado al exigir el cumplimiento de todos los predicados.",
                "Recuerda que si un valor es NULL, cualquier comparación con <> devolverá UNKNOWN, no TRUE.",
            ],
            execution_order_note="⚡ El optimizador puede reordenar las condiciones del WHERE para evaluar primero el predicado más selectivo.",
        ),
        objectives=[
            "1. Proyectar 'factura_id', 'monto_total' y 'estado_factura'.",
            "2. Filtrar con WHERE monto_total >= 400 AND estado_factura <> 'pagada'.",
        ],
        sample_tables=[SAMPLE_TABLE_FACTURAS],
    ),

    # Módulo 3 - Reto 5: Ordenamiento ORDER BY ASC
    "e0000000-0000-0000-0000-000000000003": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000003",
        module_id="a0000000-0000-0000-0000-000000000003",
        title="Clientes Españoles Ordenados por Apellido",
        prompt="Obtén el nombre, apellido y ciudad de todos los clientes cuyo país sea 'España'. Los resultados deben venir ordenados alfabéticamente de forma ascendente por su apellido.",
        initial_code="-- Filtra y ordena los clientes\nSELECT ",
        solution_query="SELECT nombre, apellido, ciudad FROM clientes WHERE pais = 'España' ORDER BY apellido ASC;",
        xp_reward=40,
        difficulty="Principiante",
        check_order=True,
        sort_order=11,
        hints=[
            "Usa WHERE pais = 'España'.",
            "Para ordenar utiliza ORDER BY apellido ASC.",
        ],
        concept=ExerciseConcept(
            summary="La cláusula ORDER BY ordena el conjunto de tuplas resultante por una o más columnas. ASC ordena de menor a mayor (A-Z) y DESC de mayor a menor (Z-A).",
            syntax="SELECT col1, col2\nFROM tabla\nWHERE condicion\nORDER BY columna_orden [ASC | DESC];",
            key_points=[
                "Los literales de texto en SQL siempre se encierran entre comillas simples ('España').",
                "Por defecto, si omites la dirección, PostgreSQL asume orden ascendente (ASC).",
            ],
            execution_order_note="⚡ Orden de procesamiento: FROM → WHERE → SELECT → ORDER BY.",
        ),
        objectives=[
            "1. Filtrar los clientes con 'pais = \\'España\\' '.",
            "2. Proyectar 'nombre', 'apellido' y 'ciudad'.",
            "3. Ordenar alfabéticamente por 'apellido' en orden ascendente (ASC).",
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES],
    ),

    # Módulo 3 - Reto 6: Top N con LIMIT
    "e0000000-0000-0000-0000-000000000010": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000010",
        module_id="a0000000-0000-0000-0000-000000000003",
        title="Top 5 Productos Críticos por Stock",
        prompt="El almacén necesita reponer con urgencia los artículos con menores existencias. Escribe una consulta que devuelva el nombre_producto y el stock de los 5 productos con menor cantidad disponible en inventario, ordenados de menor a mayor stock.",
        initial_code="-- Ordena y limita a los 5 productos con menos stock\nSELECT ",
        solution_query="SELECT nombre_producto, stock FROM productos ORDER BY stock ASC LIMIT 5;",
        xp_reward=40,
        difficulty="Principiante",
        check_order=True,
        sort_order=12,
        hints=[
            "Ordena por la columna stock en dirección ascendente: ORDER BY stock ASC.",
            "Agrega la cláusula LIMIT 5 al final para acotar el resultado a 5 filas.",
        ],
        concept=ExerciseConcept(
            summary="La cláusula LIMIT restringe el número máximo de tuplas retornadas por el motor. Cuando se combina con ORDER BY, permite construir rankings o consultas de tipo 'Top N' de forma muy eficiente.",
            syntax="SELECT columna_1, columna_2\nFROM tabla\nORDER BY columna_criterio ASC\nLIMIT cantidad;",
            key_points=[
                "LIMIT siempre debe acompañarse de ORDER BY para garantizar resultados deterministas.",
                "En PostgreSQL LIMIT se procesa en el último paso antes de emitir la respuesta al cliente.",
            ],
            execution_order_note="⚡ Orden de procesamiento: FROM → WHERE → SELECT → ORDER BY → LIMIT.",
        ),
        objectives=[
            "1. Seleccionar 'nombre_producto' y 'stock' de 'productos'.",
            "2. Ordenar por 'stock ASC' (menor a mayor).",
            "3. Limitar el resultado a exactamente 5 registros con 'LIMIT 5'.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    
    # Módulo 3 - Reto 13: Ordenamiento Multi-Criterio
    "e0000000-0000-0000-0000-000000000025": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000025",
        module_id="a0000000-0000-0000-0000-000000000003",
        title="Ordenamiento Multi-Criterio",
        prompt="Catalogación requiere listar los productos organizados por su categoría y valor comercial. Escribe una consulta que devuelva producto_id, categoria_id, nombre_producto y precio, ordenados primero por categoria_id en orden ascendente (ASC) y, para productos dentro de la misma categoría, por precio en orden descendente (DESC).",
        initial_code="-- Ordena por múltiples columnas\nSELECT ",
        solution_query="SELECT producto_id, categoria_id, nombre_producto, precio FROM productos ORDER BY categoria_id ASC, precio DESC;",
        xp_reward=45,
        difficulty="Principiante",
        check_order=True,
        sort_order=13,
        hints=[
            "Puedes incluir múltiples columnas separadas por comas en ORDER BY.",
            "Especifica la dirección tras cada columna: ORDER BY categoria_id ASC, precio DESC.",
        ],
        concept=ExerciseConcept(
            summary="La cláusula ORDER BY permite ordenar el resultado por múltiples columnas estableciendo prioridades: si hay valores idénticos en la primera columna, el motor desempata utilizando la segunda columna.",
            syntax="SELECT columnas\nFROM tabla\nORDER BY col1 ASC, col2 DESC;",
            key_points=[
                "ASC ordena de menor a mayor (por defecto); DESC ordena de mayor a menor.",
                "El orden en que listas las columnas en ORDER BY define la jerarquía del ordenamiento.",
            ],
            execution_order_note="⚡ ORDER BY se ejecuta después de SELECT, por lo que puede hacer referencia a columnas proyectadas o alias.",
        ),
        objectives=[
            "1. Proyectar 'producto_id', 'categoria_id', 'nombre_producto' y 'precio'.",
            "2. Ordenar por categoria_id ASC.",
            "3. Desempatar con precio DESC.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    # Módulo 3 - Reto 14: Paginación de Clientes (OFFSET)
    "e0000000-0000-0000-0000-000000000026": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000026",
        module_id="a0000000-0000-0000-0000-000000000003",
        title="Paginación de Clientes (OFFSET)",
        prompt="Para implementar paginación en el panel administrativo con 5 registros por página, obtén los clientes correspondientes a la segunda página. Escribe una consulta que devuelva cliente_id, nombre y email, ordenados por cliente_id ASC, omitiendo los primeros 5 clientes y limitando el resultado a los siguientes 5 registros.",
        initial_code="-- Usa LIMIT y OFFSET para paginar\nSELECT ",
        solution_query="SELECT cliente_id, nombre, email FROM clientes ORDER BY cliente_id ASC LIMIT 5 OFFSET 5;",
        xp_reward=45,
        difficulty="Principiante",
        check_order=True,
        sort_order=14,
        hints=[
            "Combina LIMIT para el tamaño de página y OFFSET para la cantidad de filas a saltar.",
            "Escribe ORDER BY cliente_id ASC LIMIT 5 OFFSET 5;",
        ],
        concept=ExerciseConcept(
            summary="OFFSET salta un número determinado de filas antes de comenzar a devolver resultados, mientras que LIMIT acota el número máximo de tuplas entregadas. Juntos forman el mecanismo clásico de paginación.",
            syntax="SELECT columnas\nFROM tabla\nORDER BY id ASC LIMIT N OFFSET M;",
            key_points=[
                "OFFSET sin ORDER BY no es determinista: las bases de datos relacionales no garantizan orden sin ORDER BY.",
                "OFFSET M salta M filas; LIMIT N toma las siguientes N filas.",
            ],
            execution_order_note="⚡ LIMIT y OFFSET son las últimas operaciones del pipeline de ejecución relacional.",
        ),
        objectives=[
            "1. Proyectar 'cliente_id', 'nombre' y 'email'.",
            "2. Ordenar por cliente_id ASC.",
            "3. Aplicar LIMIT 5 OFFSET 5.",
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES],
    ),

    # Módulo 4 - Reto 7: Agrupación GROUP BY & HAVING
    "e0000000-0000-0000-0000-000000000004": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000004",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Conteo de Productos por Categoría",
        prompt="El equipo de inventario desea saber cuántos productos existen en cada categoría. Escribe una consulta que devuelva el categoria_id y el total de productos bajo el alias total_productos para aquellas categorías que tengan más de 2 productos registrados.",
        initial_code="-- Utiliza GROUP BY y HAVING\nSELECT ",
        solution_query="SELECT categoria_id, COUNT(*) AS total_productos FROM productos GROUP BY categoria_id HAVING COUNT(*) > 2;",
        xp_reward=45,
        difficulty="Principiante",
        check_order=False,
        sort_order=15,
        hints=[
            "Agrupa por categoria_id con GROUP BY.",
            "Para filtrar grupos agregados usa HAVING COUNT(*) > 2.",
        ],
        concept=ExerciseConcept(
            summary="GROUP BY agrupa filas que comparten valores comunes en columnas específicas. HAVING funciona como un WHERE especializado que filtra exclusivamente sobre los grupos agregados.",
            syntax="SELECT categoria_id, COUNT(*) AS total_productos\nFROM productos\nGROUP BY categoria_id\nHAVING COUNT(*) > 2;",
            key_points=[
                "WHERE filtra filas individuales ANTES de agrupar.",
                "HAVING filtra grupos calculados DESPUÉS de ejecutar GROUP BY.",
                "Toda columna en el SELECT que no esté envuelta en una función de agregación debe estar en el GROUP BY.",
            ],
            execution_order_note="⚡ Orden de procesamiento: FROM → WHERE → GROUP BY → HAVING → SELECT.",
        ),
        objectives=[
            "1. Agrupar las filas de 'productos' por 'categoria_id'.",
            "2. Calcular el conteo con COUNT(*) y asignarle el alias 'total_productos'.",
            "3. Filtrar los grupos que tengan más de 2 productos con 'HAVING COUNT(*) > 2'.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
    ),

    # Módulo 4 - Reto 8: Agregaciones Globales
    "e0000000-0000-0000-0000-000000000011": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000011",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Métricas Globales de Ventas",
        prompt="La dirección comercial solicita un resumen ejecutivo de las ventas completadas. Escribe una consulta que calcule el total de pedidos completados bajo el alias total_pedidos, la suma acumulada de ingresos bajo ingresos_totales y el ticket promedio redondeado a 2 decimales bajo ticket_promedio, considerando únicamente pedidos con estado_pedido = 'completado'.",
        initial_code="-- Agrega las métricas globales para pedidos completados\nSELECT ",
        solution_query="SELECT COUNT(*) AS total_pedidos, SUM(total) AS ingresos_totales, ROUND(AVG(total), 2) AS ticket_promedio FROM pedidos WHERE estado_pedido = 'completado';",
        xp_reward=45,
        difficulty="Principiante",
        check_order=False,
        sort_order=16,
        hints=[
            "Filtra primero con WHERE estado_pedido = 'completado'.",
            "Aplica COUNT(*), SUM(total) y ROUND(AVG(total), 2) con sus respectivos alias.",
        ],
        concept=ExerciseConcept(
            summary="Las funciones de agregación global (COUNT, SUM, AVG, MIN, MAX) procesan el conjunto completo de tuplas filtradas sin necesidad de GROUP BY, devolviendo un único registro de resumen ejecutivo.",
            syntax="SELECT COUNT(*) AS total, SUM(monto) AS acumulado, ROUND(AVG(monto), 2) AS promedio\nFROM pedidos\nWHERE estado = 'completado';",
            key_points=[
                "Al no haber GROUP BY, el resultado colapsa siempre en una única tupla resumen.",
                "ROUND(AVG(campo), 2) formatea el promedio con precisión monetaria estándar.",
            ],
            execution_order_note="⚡ Orden de procesamiento: FROM → WHERE → Funciones de agregación → SELECT.",
        ),
        objectives=[
            "1. Filtrar los pedidos con 'estado_pedido = \\'completado\\' '.",
            "2. Calcular 'COUNT(*)' con alias 'total_pedidos'.",
            "3. Calcular 'SUM(total)' como 'ingresos_totales' y 'ROUND(AVG(total), 2)' como 'ticket_promedio'.",
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),

    # =========================================================================
    # RUTA 2: Relational SQL (Módulos 5 al 7)
    # =========================================================================

    
    # Módulo 4 - Reto 17: Rango de Precios por Categoría (MAX/MIN)
    "e0000000-0000-0000-0000-000000000027": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000027",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Rango de Precios por Categoría (MAX/MIN)",
        prompt="El departamento de pricing necesita analizar la dispersión de precios en cada departamento comercial. Escribe una consulta que devuelva el categoria_id, el precio más bajo bajo el alias precio_minimo y el precio más alto bajo el alias precio_maximo para cada categoría de productos.",
        initial_code="-- Calcula precios extremos por categoría\nSELECT ",
        solution_query="SELECT categoria_id, MIN(precio) AS precio_minimo, MAX(precio) AS precio_maximo FROM productos GROUP BY categoria_id;",
        xp_reward=45,
        difficulty="Principiante",
        check_order=False,
        sort_order=17,
        hints=[
            "Utiliza las funciones de agregación MIN(precio) y MAX(precio).",
            "Agrupa las filas por categoria_id mediante GROUP BY categoria_id.",
        ],
        concept=ExerciseConcept(
            summary="Las funciones de agregación MIN() y MAX() calculan los valores extremos dentro de cada grupo formado por GROUP BY. Si no hay GROUP BY, operan sobre la totalidad de la tabla.",
            syntax="SELECT grupo, MIN(col), MAX(col)\nFROM tabla\nGROUP BY grupo;",
            key_points=[
                "MIN() y MAX() ignoran valores NULL en la columna evaluada.",
                "Toda columna no agregada en SELECT debe figurar obligatoriamente en GROUP BY.",
            ],
            execution_order_note="⚡ GROUP BY colapsa las filas antes de que SELECT calcule MIN() y MAX().",
        ),
        objectives=[
            "1. Proyectar 'categoria_id'.",
            "2. Calcular MIN(precio) AS precio_minimo.",
            "3. Calcular MAX(precio) AS precio_maximo.",
            "4. Agrupar por 'categoria_id'.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    # Módulo 4 - Reto 18: Distribución de Clientes por País
    "e0000000-0000-0000-0000-000000000028": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000028",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Distribución de Clientes por País",
        prompt="Expansión internacional requiere un censo de clientes por país de residencia. Escribe una consulta que devuelva la columna pais y el número total de clientes bajo el alias total_clientes, agrupando por país y ordenando el resultado de mayor a menor número de clientes.",
        initial_code="-- Agrupa clientes por país\nSELECT ",
        solution_query="SELECT pais, COUNT(*) AS total_clientes FROM clientes GROUP BY pais ORDER BY total_clientes DESC;",
        xp_reward=45,
        difficulty="Principiante",
        check_order=True,
        sort_order=18,
        hints=[
            "Agrupa por pais usando GROUP BY pais.",
            "Cuenta las filas con COUNT(*) AS total_clientes y ordena con ORDER BY total_clientes DESC.",
        ],
        concept=ExerciseConcept(
            summary="COUNT(*) devuelve el recuento de tuplas en cada grupo relacional. Combinado con ORDER BY descendente, permite construir rankings de distribución de frecuencias.",
            syntax="SELECT pais, COUNT(*) AS total\nFROM tabla\nGROUP BY pais\nORDER BY total DESC;",
            key_points=[
                "COUNT(*) cuenta todas las tuplas del grupo, incluyendo aquellas con columnas nulas.",
                "Puedes usar el alias de agregación en ORDER BY porque ORDER BY se evalúa después de SELECT.",
            ],
            execution_order_note="⚡ GROUP BY particiona $\to$ SELECT proyecta y cuenta $\to$ ORDER BY ordena las filas colapsadas.",
        ),
        objectives=[
            "1. Proyectar 'pais' y 'COUNT(*) AS total_clientes'.",
            "2. Agrupar por 'pais'.",
            "3. Ordenar por total_clientes DESC.",
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES],
    ),

    # Módulo 4 - Reto 19: Stock Total por Proveedor
    "e0000000-0000-0000-0000-000000000029": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000029",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Stock Total por Proveedor",
        prompt="Gestión de proveedores necesita conocer el volumen total de inventario que suministra cada fabricante. Escribe una consulta que devuelva el proveedor_id y la suma de unidades disponibles bajo el alias stock_total para cada proveedor en la tabla productos.",
        initial_code="-- Suma el stock por proveedor\nSELECT ",
        solution_query="SELECT proveedor_id, SUM(stock) AS stock_total FROM productos GROUP BY proveedor_id;",
        xp_reward=45,
        difficulty="Principiante",
        check_order=False,
        sort_order=19,
        hints=[
            "Usa SUM(stock) AS stock_total para sumar las unidades.",
            "Agrupa por proveedor_id con GROUP BY proveedor_id.",
        ],
        concept=ExerciseConcept(
            summary="La función SUM() agrega valores numéricos de una columna en un acumulado total por grupo. Devuelve NULL si el grupo solo contiene valores NULL.",
            syntax="SELECT grupo, SUM(numerico) AS total\nFROM tabla\nGROUP BY grupo;",
            key_points=[
                "SUM() solo es aplicable a columnas numéricas (INT, NUMERIC, DECIMAL, FLOAT).",
                "Se evalúa después de WHERE y colapsa las filas que compartan el mismo valor en GROUP BY.",
            ],
            execution_order_note="⚡ GROUP BY crea los grupos en memoria y SUM() acumula las cantidades de cada grupo.",
        ),
        objectives=[
            "1. Proyectar 'proveedor_id'.",
            "2. Calcular SUM(stock) AS stock_total.",
            "3. Agrupar por 'proveedor_id'.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_PROVEEDORES],
    ),

    # Módulo 4 - Reto 20: Proveedores de Alto Volumen (HAVING SUM)
    "e0000000-0000-0000-0000-000000000030": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000030",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Proveedores de Alto Volumen (HAVING SUM)",
        prompt="Compras desea clasificar a sus proveedores estratégicos. Escribe una consulta que obtenga el proveedor_id y el total de existencias bajo el alias stock_total, mostrando únicamente aquellos proveedores cuyo stock total acumulado supere estrictamente las 100 unidades.",
        initial_code="-- Filtra grupos con HAVING\nSELECT ",
        solution_query="SELECT proveedor_id, SUM(stock) AS stock_total FROM productos GROUP BY proveedor_id HAVING SUM(stock) > 100;",
        xp_reward=50,
        difficulty="Principiante",
        check_order=False,
        sort_order=20,
        hints=[
            "La cláusula HAVING se coloca después de GROUP BY.",
            "Escribe HAVING SUM(stock) > 100;",
        ],
        concept=ExerciseConcept(
            summary="HAVING es el mecanismo de filtrado para grupos agregados en SQL. Mientras WHERE filtra filas individuales ANTES de agrupar, HAVING filtra grupos DESPUÉS de que las agregaciones han sido calculadas.",
            syntax="SELECT grupo, SUM(col)\nFROM tabla\nGROUP BY grupo\nHAVING SUM(col) > valor;",
            key_points=[
                "Prohibido usar agregados en WHERE: WHERE SUM(...) es un error de sintaxis en cualquier base de datos SQL.",
                "HAVING evalúa predicados booleanos sobre funciones agregadas o columnas de agrupamiento.",
            ],
            execution_order_note="⚡ Orden crucial: WHERE (filtra filas) $\to$ GROUP BY (agrupa) $\to$ HAVING (descarta grupos completos).",
        ),
        objectives=[
            "1. Proyectar 'proveedor_id' y 'SUM(stock) AS stock_total'.",
            "2. Agrupar por 'proveedor_id'.",
            "3. Filtrar los grupos con HAVING SUM(stock) > 100.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    # Módulo 4 - Reto 21: Clientes con Ticket Promedio Alto (HAVING AVG)
    "e0000000-0000-0000-0000-000000000031": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000031",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Clientes con Ticket Promedio Alto (HAVING AVG)",
        prompt="Fidelización busca identificar a los compradores con mayor poder adquisitivo por compra. Escribe una consulta sobre la tabla pedidos que devuelva el cliente_id y el importe promedio de sus compras redondeado a 2 decimales bajo el alias ticket_promedio, considerando únicamente a los clientes cuyo promedio de compras supere los 500 euros.",
        initial_code="-- Filtra clientes por ticket promedio\nSELECT ",
        solution_query="SELECT cliente_id, ROUND(AVG(total), 2) AS ticket_promedio FROM pedidos GROUP BY cliente_id HAVING AVG(total) > 500;",
        xp_reward=50,
        difficulty="Principiante",
        check_order=False,
        sort_order=21,
        hints=[
            "Usa ROUND(AVG(total), 2) AS ticket_promedio en SELECT.",
            "Filtra en HAVING usando AVG(total) > 500.",
        ],
        concept=ExerciseConcept(
            summary="AVG() calcula la media aritmética ignorando valores NULL. Combinado con HAVING AVG(...) > X permite identificar segmentos basados en comportamiento medio o representativo.",
            syntax="SELECT cliente_id, ROUND(AVG(total), 2) AS avg_total\nFROM pedidos\nGROUP BY cliente_id\nHAVING AVG(total) > 500;",
            key_points=[
                "ROUND() en la proyección asegura la presentación limpia con 2 decimales.",
                "HAVING puede utilizar la función agregada directamente sin alias: HAVING AVG(total) > 500.",
            ],
            execution_order_note="⚡ HAVING calcula el promedio de cada partición de cliente y descarta los que no alcancen el umbral.",
        ),
        objectives=[
            "1. Proyectar 'cliente_id'.",
            "2. Calcular ROUND(AVG(total), 2) AS ticket_promedio.",
            "3. Agrupar por 'cliente_id'.",
            "4. Filtrar con HAVING AVG(total) > 500.",
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),

    # Módulo 4 - Reto 22: Resumen de Pedidos por Estado
    "e0000000-0000-0000-0000-000000000032": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000032",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Resumen de Pedidos por Estado",
        prompt="Operaciones comerciales solicita un cuadro de control de pedidos. Escribe una consulta que devuelva estado_pedido, la cantidad de pedidos bajo el alias total_pedidos y la suma acumulada de dinero bajo el alias monto_acumulado, agrupando por el estado del pedido y ordenando por monto_acumulado en orden descendente.",
        initial_code="-- Resumen consolidado por estado de pedido\nSELECT ",
        solution_query="SELECT estado_pedido, COUNT(*) AS total_pedidos, SUM(total) AS monto_acumulado FROM pedidos GROUP BY estado_pedido ORDER BY monto_acumulado DESC;",
        xp_reward=50,
        difficulty="Principiante",
        check_order=True,
        sort_order=22,
        hints=[
            "Proyecta estado_pedido, COUNT(*) AS total_pedidos, SUM(total) AS monto_acumulado.",
            "Agrupa por estado_pedido y ordena por monto_acumulado DESC.",
        ],
        concept=ExerciseConcept(
            summary="En una sola consulta de agregación es posible combinar múltiples funciones agregadas (COUNT, SUM, AVG) sobre la misma partición para construir paneles ejecutivos y tableros analíticos.",
            syntax="SELECT estado, COUNT(*), SUM(monto)\nFROM tabla\nGROUP BY estado\nORDER BY SUM(monto) DESC;",
            key_points=[
                "Permite auditar el estado del negocio agrupando por dimensiones categóricas ('completado', 'pendiente', 'cancelado').",
                "ORDER BY sobre el resultado acumulado destaca de inmediato el segmento más relevante para el negocio.",
            ],
            execution_order_note="⚡ Agrupación $\to$ Cálculo múltiple (COUNT y SUM) $\to$ Ordenación final por la suma calculada.",
        ),
        objectives=[
            "1. Proyectar 'estado_pedido'.",
            "2. Calcular COUNT(*) AS total_pedidos.",
            "3. Calcular SUM(total) AS monto_acumulado.",
            "4. Agrupar por 'estado_pedido'.",
            "5. Ordenar por monto_acumulado DESC.",
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),

    # Módulo 5 - Reto 9: INNER JOIN Fundamentos
    "e0000000-0000-0000-0000-000000000005": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000005",
        module_id="b0000000-0000-0000-0000-000000000005",
        title="Pedidos con Identidad del Cliente",
        prompt="Genera un reporte que muestre el pedido_id, el nombre del cliente, su apellido y el total del pedido. Relaciona las tablas pedidos y clientes mediante su clave compartida.",
        initial_code="-- Cruza clientes con sus respectivos pedidos\nSELECT ",
        solution_query="SELECT p.pedido_id, c.nombre, c.apellido, p.total FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id;",
        xp_reward=45,
        difficulty="Intermedio",
        check_order=False,
        sort_order=23,
        hints=[
            "Usa INNER JOIN clientes c ON p.cliente_id = c.cliente_id.",
            "Proyecta p.pedido_id, c.nombre, c.apellido, p.total.",
        ],
        concept=ExerciseConcept(
            summary="INNER JOIN combina tuplas de dos tablas basándose en una condición de coincidencia entre claves (PK y FK). Solo incluye registros que tengan correspondencia exacta en ambos lados.",
            syntax="SELECT p.pedido_id, c.nombre, c.apellido, p.total\nFROM pedidos p\nINNER JOIN clientes c ON p.cliente_id = c.cliente_id;",
            key_points=[
                "Los alias de tabla (como 'p' o 'c') son obligatorios en consultas profesionales para evitar ambigüedades.",
                "El predicado ON define cómo se intersecan los dos conjuntos de datos relacionales.",
            ],
            execution_order_note="⚡ El cruce relacional (JOIN) se evalúa dentro de la cláusula FROM antes de aplicar filtros.",
        ),
        objectives=[
            "1. Relacionar 'pedidos' con 'clientes' usando 'cliente_id'.",
            "2. Proyectar 'p.pedido_id', 'c.nombre', 'c.apellido' y 'p.total'.",
            "3. Desambiguar los atributos con alias de tabla.",
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_CLIENTES],
    ),

    # Módulo 5 - Reto 10: INNER JOIN + Agregación
    "e0000000-0000-0000-0000-000000000012": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000012",
        module_id="b0000000-0000-0000-0000-000000000005",
        title="Gasto Acumulado por Cliente",
        prompt="El departamento de fidelización necesita saber cuánto ha gastado en total cada cliente. Escribe una consulta que relacione clientes y pedidos, y devuelva cliente_id, nombre, apellido y la suma total de sus compras bajo el alias total_gastado, ordenando a los clientes de mayor a menor gasto total.",
        initial_code="-- Cruza clientes y pedidos y agrupa para sumar el gasto\nSELECT ",
        solution_query="SELECT c.cliente_id, c.nombre, c.apellido, SUM(p.total) AS total_gastado FROM clientes c INNER JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_gastado DESC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=24,
        hints=[
            "Usa INNER JOIN clientes c ON c.cliente_id = p.cliente_id.",
            "Agrupa por c.cliente_id, c.nombre, c.apellido en la cláusula GROUP BY.",
            "Ordena el resultado con ORDER BY total_gastado DESC.",
        ],
        concept=ExerciseConcept(
            summary="La combinación de JOIN con GROUP BY es uno de los patrones más recurrentes en SQL analítico: se enriquecen los datos mediante relaciones y luego se condensan por entidad usando funciones de agregación.",
            syntax="SELECT c.cliente_id, c.nombre, SUM(p.total) AS total_gastado\nFROM clientes c\nINNER JOIN pedidos p ON c.cliente_id = p.cliente_id\nGROUP BY c.cliente_id, c.nombre\nORDER BY total_gastado DESC;",
            key_points=[
                "Todas las columnas de 'clientes' en el SELECT deben aparecer en la cláusula GROUP BY.",
                "ORDER BY sobre un alias de agregación permite ordenar directamente por la métrica calculada.",
            ],
            execution_order_note="⚡ Orden de procesamiento: FROM (JOIN) → GROUP BY → Agregación SUM → SELECT → ORDER BY.",
        ),
        objectives=[
            "1. Realizar INNER JOIN entre 'clientes c' y 'pedidos p'.",
            "2. Agrupar por 'c.cliente_id', 'c.nombre' y 'c.apellido'.",
            "3. Sumar 'p.total' como 'total_gastado' y ordenar en sentido DESC.",
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
    ),

    # Módulo 6 - Reto 11: LEFT JOIN & IS NULL (Clientes Inactivos)
    "e0000000-0000-0000-0000-000000000006": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000006",
        module_id="b0000000-0000-0000-0000-000000000006",
        title="Clientes sin Compras Registradas (LEFT JOIN & IS NULL)",
        prompt="El equipo de marketing necesita reactivar a usuarios registrados que nunca han realizado un pedido en la plataforma. Escribe una consulta que devuelva el ID del cliente, su nombre y su apellido para todos los clientes que no tienen registros en la tabla de compras.",
        initial_code="-- Identifica clientes inactivos sin pedidos asociados\nSELECT ",
        solution_query="SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id WHERE p.pedido_id IS NULL;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=False,
        sort_order=28,
        hints=[
            "Inicia realizando un LEFT JOIN desde la tabla clientes hacia la tabla pedidos usando la relación c.cliente_id = p.cliente_id.",
            "Cuando un cliente no tiene pedidos, las columnas provenientes de la tabla pedidos resultarán con valores NULL. Filtra usando WHERE p.pedido_id IS NULL.",
            "Asegúrate de proyectar exactamente tres columnas: cliente_id, nombre y apellido.",
        ],
        concept=ExerciseConcept(
            summary="LEFT JOIN preserva todas las filas de la tabla izquierda ('clientes'), rellenando con NULL los campos de la tabla derecha ('pedidos') cuando no existe coincidencia. El filtro 'WHERE p.id IS NULL' aísla las tuplas huérfanas.",
            syntax="SELECT c.cliente_id, c.nombre, c.apellido\nFROM clientes c\nLEFT JOIN pedidos p ON c.cliente_id = p.cliente_id\nWHERE p.pedido_id IS NULL;",
            key_points=[
                "Para evaluar valores nulos siempre se usa 'IS NULL' o 'IS NOT NULL', nunca '= NULL'.",
                "Es el patrón canónico para auditoría de integridad referencial y detección de inactividad.",
            ],
            execution_order_note="⚡ Orden de procesamiento: FROM (LEFT JOIN) → WHERE (filtra solo registros con clave foránea NULL) → SELECT.",
        ),
        objectives=[
            "1. Realizar un LEFT JOIN de 'clientes c' hacia 'pedidos p' por 'cliente_id'.",
            "2. Filtrar únicamente las filas donde 'p.pedido_id IS NULL'.",
            "3. Proyectar 'cliente_id', 'nombre' y 'apellido'.",
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
    ),

    # Módulo 6 - Reto 12: Anti-Join en Productos
    "e0000000-0000-0000-0000-000000000013": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000013",
        module_id="b0000000-0000-0000-0000-000000000006",
        title="Productos sin Movimiento de Venta",
        prompt="Auditoría de catálogo necesita detectar productos que nunca han sido incluidos en ninguna orden de compra. Escribe una consulta que devuelva el producto_id y el nombre_producto de los artículos que no tienen ninguna línea registrada en detalle_pedidos.",
        initial_code="-- Localiza productos sin ventas cruzando con detalle_pedidos\nSELECT ",
        solution_query="SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN detalle_pedidos dp ON p.producto_id = dp.producto_id WHERE dp.detalle_id IS NULL;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=False,
        sort_order=29,
        hints=[
            "Une productos p con detalle_pedidos dp mediante LEFT JOIN usando producto_id.",
            "Filtra las filas donde la clave foránea o primaria de la tabla derecha sea nula: WHERE dp.detalle_id IS NULL.",
        ],
        concept=ExerciseConcept(
            summary="El patrón Anti-Join mediante LEFT JOIN ... WHERE right.pk IS NULL permite encontrar registros huérfanos o entidades inactivas con un rendimiento óptimo en motores relacionales.",
            syntax="SELECT p.producto_id, p.nombre_producto\nFROM productos p\nLEFT JOIN detalle_pedidos dp ON p.producto_id = dp.producto_id\nWHERE dp.detalle_id IS NULL;",
            key_points=[
                "Preserva todos los productos de la tabla izquierda.",
                "Los productos sin ventas tendrán 'dp.detalle_id' con valor NULL.",
            ],
            execution_order_note="⚡ Orden de procesamiento: FROM (LEFT JOIN) → WHERE (dp.detalle_id IS NULL) → SELECT.",
        ),
        objectives=[
            "1. Realizar LEFT JOIN entre 'productos p' y 'detalle_pedidos dp'.",
            "2. Filtrar con 'WHERE dp.detalle_id IS NULL'.",
            "3. Proyectar 'producto_id' y 'nombre_producto'.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_DETALLE_PEDIDOS],
    ),

    # Módulo 7 - Reto 13: Consultas Multi-Tabla en Cascada
    "e0000000-0000-0000-0000-000000000014": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000014",
        module_id="b0000000-0000-0000-0000-000000000007",
        title="Desglose Completo de Líneas de Pedido",
        prompt="Operaciones necesita auditar las transacciones vinculando todas sus dimensiones relacionales. Escribe una consulta que conecte pedidos, clientes, detalle_pedidos, productos y categorias, y devuelva pedido_id, el nombre del cliente bajo el alias cliente_nombre, nombre_producto, nombre_categoria, cantidad y precio_unitario. Ordena los resultados por pedido_id ASC y nombre_producto ASC, limitando a 10 registros.",
        initial_code="-- Conecta en cascada pedidos, clientes, detalle, productos y categorias\nSELECT ",
        solution_query="SELECT p.pedido_id, c.nombre AS cliente_nombre, pr.nombre_producto, cat.nombre_categoria, dp.cantidad, dp.precio_unitario FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id INNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id INNER JOIN productos pr ON dp.producto_id = pr.producto_id INNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id ORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=33,
        hints=[
            "Encadena 4 cláusulas INNER JOIN siguiendo las claves foráneas correspondientes.",
            "Usa alias de tabla concisos: p, c, dp, pr, cat.",
            "Añade ORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10; al final.",
        ],
        concept=ExerciseConcept(
            summary="Las consultas multi-tabla permiten recorrer esquemas en estrella o copo de nieve conectando tablas de hechos (como pedidos y detalle_pedidos) con tablas de dimensiones (clientes, productos, categorías).",
            syntax="SELECT p.pedido_id, c.nombre AS cliente_nombre, pr.nombre_producto, cat.nombre_categoria, dp.cantidad, dp.precio_unitario\nFROM pedidos p\nINNER JOIN clientes c ON p.cliente_id = c.cliente_id\nINNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id\nINNER JOIN productos pr ON dp.producto_id = pr.producto_id\nINNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id\nORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10;",
            key_points=[
                "Cada JOIN agrega una dimensión al árbol de relaciones relacional.",
                "El optimizador de PostgreSQL reordena los joins basándose en estadísticas de cardinalidad.",
            ],
            execution_order_note="⚡ Se evalúan todos los joins dentro de FROM construyendo el producto cartesiano restringido.",
        ),
        objectives=[
            "1. Conectar las 5 tablas con 4 INNER JOINs correctos.",
            "2. Proyectar las 6 columnas especificadas con el alias 'cliente_nombre'.",
            "3. Aplicar 'ORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10'.",
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_DETALLE_PEDIDOS, SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
    ),

    # Módulo 5 - Reto 25: Catálogo con Nombre de Categoría
    "e0000000-0000-0000-0000-000000000033": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000033",
        module_id="b0000000-0000-0000-0000-000000000005",
        title="Catálogo con Nombre de Categoría",
        prompt="Catalogación necesita presentar el catálogo con el nombre de su categoría descriptiva en vez del código numérico. Escribe una consulta que devuelva el producto_id, nombre_producto, nombre_categoria y precio, relacionando las tablas productos y categorias mediante categoria_id. Ordena los resultados por nombre_categoria ASC y luego por nombre_producto ASC.",
        initial_code="-- Cruza productos con categorias\nSELECT ",
        solution_query="SELECT p.producto_id, p.nombre_producto, c.nombre_categoria, p.precio FROM productos p INNER JOIN categorias c ON p.categoria_id = c.categoria_id ORDER BY c.nombre_categoria ASC, p.nombre_producto ASC;",
        xp_reward=45,
        difficulty="Intermedio",
        check_order=True,
        sort_order=25,
        hints=[
            "Usa INNER JOIN categorias c ON p.categoria_id = c.categoria_id.",
            "Ordena con ORDER BY c.nombre_categoria ASC, p.nombre_producto ASC;",
        ],
        concept=ExerciseConcept(
            summary="El INNER JOIN sustituye claves foráneas numéricas por nombres descriptivos provenientes de tablas maestras o dimensiones (normalización relacional).",
            syntax="SELECT p.producto_id, p.nombre_producto, c.nombre_categoria, p.precio\nFROM productos p\nINNER JOIN categorias c ON p.categoria_id = c.categoria_id\nORDER BY c.nombre_categoria ASC, p.nombre_producto ASC;",
            key_points=[
                "Permite enriquecer entidades de catálogo sustituyendo códigos por etiquetas comprensibles.",
                "Solo se conservan las filas que presenten correspondencia en ambas entidades.",
            ],
            execution_order_note="⚡ Se evalúa la condición de cruce ON p.categoria_id = c.categoria_id al escanear las tablas.",
        ),
        objectives=[
            "1. Realizar INNER JOIN entre productos y categorias.",
            "2. Proyectar producto_id, nombre_producto, nombre_categoria y precio.",
            "3. Ordenar por nombre_categoria ASC, nombre_producto ASC.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
    ),

    # Módulo 5 - Reto 26: Productos y sus Proveedores Directos
    "e0000000-0000-0000-0000-000000000034": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000034",
        module_id="b0000000-0000-0000-0000-000000000005",
        title="Productos y sus Proveedores Directos",
        prompt="El área de compras requiere auditar el origen geográfico de cada artículo del catálogo. Escribe una consulta que relacione las tablas productos y proveedores, devolviendo producto_id, nombre_producto, nombre_proveedor y el país del proveedor bajo el alias pais_proveedor. Ordena alfabéticamente por nombre_producto ASC.",
        initial_code="-- Relaciona productos con sus proveedores\nSELECT ",
        solution_query="SELECT pr.producto_id, pr.nombre_producto, pv.nombre_proveedor, pv.pais AS pais_proveedor FROM productos pr INNER JOIN proveedores pv ON pr.proveedor_id = pv.proveedor_id ORDER BY pr.nombre_producto ASC;",
        xp_reward=45,
        difficulty="Intermedio",
        check_order=True,
        sort_order=26,
        hints=[
            "Une productos pr con proveedores pv usando proveedor_id.",
            "Asigna el alias pais_proveedor a pv.pais y ordena con ORDER BY pr.nombre_producto ASC;",
        ],
        concept=ExerciseConcept(
            summary="Vincular una tabla transaccional o de artículos con sus entidades suministradoras es esencial en la gestión de la cadena de suministro.",
            syntax="SELECT pr.producto_id, pr.nombre_producto, pv.nombre_proveedor, pv.pais AS pais_proveedor\nFROM productos pr\nINNER JOIN proveedores pv ON pr.proveedor_id = pv.proveedor_id\nORDER BY pr.nombre_producto ASC;",
            key_points=[
                "El uso de alias cortos de tabla (pr, pv) simplifica la lectura y mantenimiento del código SQL.",
                "El alias de columna renombra el atributo en la salida sin modificar el catálogo subyacente.",
            ],
            execution_order_note="⚡ Se asocian los productos con sus proveedores mediante su clave foránea común.",
        ),
        objectives=[
            "1. Relacionar productos con proveedores mediante proveedor_id.",
            "2. Proyectar producto_id, nombre_producto, nombre_proveedor y pais con alias pais_proveedor.",
            "3. Ordenar por nombre_producto ASC.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_PROVEEDORES],
    ),

    # Módulo 5 - Reto 27: Facturación Detallada con Pagos Aprobados
    "e0000000-0000-0000-0000-000000000035": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000035",
        module_id="b0000000-0000-0000-0000-000000000005",
        title="Facturación Detallada con Pagos Aprobados",
        prompt="Contabilidad solicita una conciliación de facturas con sus pagos exitosos. Escribe una consulta que una facturas con pagos mediante factura_id, proyectando factura_id, monto_total de la factura, metodo_pago y fecha_pago, considerando únicamente aquellos registros donde estado_pago = 'aprobado'. Ordena por factura_id ASC.",
        initial_code="-- Concilia facturas con pagos aprobados\nSELECT ",
        solution_query="SELECT f.factura_id, f.monto_total, pg.metodo_pago, pg.fecha_pago FROM facturas f INNER JOIN pagos pg ON f.factura_id = pg.factura_id WHERE pg.estado_pago = 'aprobado' ORDER BY f.factura_id ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=27,
        hints=[
            "Usa INNER JOIN pagos pg ON f.factura_id = pg.factura_id.",
            "Filtra en WHERE pg.estado_pago = 'aprobado' y ordena por f.factura_id ASC.",
        ],
        concept=ExerciseConcept(
            summary="La combinación de INNER JOIN con filtros WHERE permite conciliar movimientos financieros entre entidades relacionadas descartando transacciones pendientes o fallidas.",
            syntax="SELECT f.factura_id, f.monto_total, pg.metodo_pago, pg.fecha_pago\nFROM facturas f\nINNER JOIN pagos pg ON f.factura_id = pg.factura_id\nWHERE pg.estado_pago = 'aprobado'\nORDER BY f.factura_id ASC;",
            key_points=[
                "El JOIN establece el vínculo 1:N o 1:1 entre facturas y sus abonos.",
                "WHERE filtra las filas resultantes preservando solo los pagos conformes.",
            ],
            execution_order_note="⚡ JOIN empareja facturas con pagos $\to$ WHERE restringe a estado_pago = 'aprobado' $\to$ SELECT proyecta y ordena.",
        ),
        objectives=[
            "1. Cruzar facturas con pagos por factura_id.",
            "2. Filtrar pagos donde estado_pago = 'aprobado'.",
            "3. Proyectar factura_id, monto_total, metodo_pago, fecha_pago y ordenar por factura_id ASC.",
        ],
        sample_tables=[SAMPLE_TABLE_FACTURAS, SAMPLE_TABLE_PAGOS],
    ),

    # Módulo 6 - Reto 30: Facturas Pendientes de Cobro (Anti-Join)
    "e0000000-0000-0000-0000-000000000036": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000036",
        module_id="b0000000-0000-0000-0000-000000000006",
        title="Facturas Pendientes de Cobro (Anti-Join)",
        prompt="Tesorería necesita listar las facturas emitidas para las cuales todavía no se ha registrado ningún abono en la tabla de pagos (patrón Anti-Join). Escribe una consulta mediante LEFT JOIN entre facturas y pagos que obtenga factura_id, pedido_id, fecha_emision y monto_total de aquellas facturas sin ningún pago asociado. Ordena por factura_id ASC.",
        initial_code="-- Identifica facturas sin pagos registrados\nSELECT ",
        solution_query="SELECT f.factura_id, f.pedido_id, f.fecha_emision, f.monto_total FROM facturas f LEFT JOIN pagos p ON f.factura_id = p.factura_id WHERE p.pago_id IS NULL ORDER BY f.factura_id ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=30,
        hints=[
            "Haz un LEFT JOIN desde facturas f hacia pagos p por factura_id.",
            "Filtra con WHERE p.pago_id IS NULL para encontrar facturas sin ningún abono.",
            "Ordena por f.factura_id ASC.",
        ],
        concept=ExerciseConcept(
            summary="El patrón Anti-Join con LEFT JOIN y predicado IS NULL es la técnica óptima y estándar en SQL para encontrar entidades principales que carecen de registros subordinados.",
            syntax="SELECT f.factura_id, f.pedido_id, f.fecha_emision, f.monto_total\nFROM facturas f\nLEFT JOIN pagos p ON f.factura_id = p.factura_id\nWHERE p.pago_id IS NULL\nORDER BY f.factura_id ASC;",
            key_points=[
                "LEFT JOIN asegura que todas las facturas aparezcan en el conjunto intermedio.",
                "Las facturas sin pago tendrán p.pago_id con valor NULL; WHERE aísla exactamente esas filas.",
            ],
            execution_order_note="⚡ LEFT JOIN preserva facturas $\to$ WHERE filtra donde p.pago_id IS NULL.",
        ),
        objectives=[
            "1. Efectuar LEFT JOIN entre facturas y pagos.",
            "2. Filtrar con WHERE p.pago_id IS NULL.",
            "3. Proyectar factura_id, pedido_id, fecha_emision, monto_total y ordenar por factura_id ASC.",
        ],
        sample_tables=[SAMPLE_TABLE_FACTURAS, SAMPLE_TABLE_PAGOS],
    ),

    # Módulo 6 - Reto 31: Productos Fuera del Almacén Central (Anti-Join Condicional)
    "e0000000-0000-0000-0000-000000000037": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000037",
        module_id="b0000000-0000-0000-0000-000000000006",
        title="Productos Fuera del Almacén Central (Anti-Join Condicional)",
        prompt="El responsable del Hub Logístico Central Madrid (almacen_id = 1) desea identificar qué productos del catálogo no disponen de existencias ubicadas en sus instalaciones. Escribe una consulta que relacione la tabla productos con inventario mediante un LEFT JOIN acotado al almacén 1 (ON p.producto_id = i.producto_id AND i.almacen_id = 1) y devuelva producto_id y nombre_producto de los artículos ausentes en dicho almacén. Ordena por producto_id ASC.",
        initial_code="-- Detecta productos no inventariados en el almacén 1\nSELECT ",
        solution_query="SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN inventario i ON p.producto_id = i.producto_id AND i.almacen_id = 1 WHERE i.almacen_id IS NULL ORDER BY p.producto_id ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=31,
        hints=[
            "En el ON del LEFT JOIN incluye p.producto_id = i.producto_id AND i.almacen_id = 1.",
            "En WHERE comprueba WHERE i.almacen_id IS NULL para encontrar las ausencias.",
        ],
        concept=ExerciseConcept(
            summary="Agregar condiciones adicionales a la cláusula ON en un LEFT JOIN filtra la tabla derecha antes de realizar la unión, permitiendo evaluar la ausencia de una relación en un contexto específico.",
            syntax="SELECT p.producto_id, p.nombre_producto\nFROM productos p\nLEFT JOIN inventario i ON p.producto_id = i.producto_id AND i.almacen_id = 1\nWHERE i.almacen_id IS NULL\nORDER BY p.producto_id ASC;",
            key_points=[
                "Colocar el filtro de almacén en ON restringe qué filas de inventario se cruzan, no las filas de productos.",
                "Si pusieras i.almacen_id = 1 en WHERE convertirías el LEFT JOIN en un INNER JOIN implícito.",
            ],
            execution_order_note="⚡ ON evalúa el predicado compuesto en la unión $\to$ WHERE detecta los nulos resultantes.",
        ),
        objectives=[
            "1. Realizar LEFT JOIN con doble condición en ON (producto_id y almacen_id = 1).",
            "2. Filtrar con WHERE i.almacen_id IS NULL.",
            "3. Proyectar producto_id y nombre_producto ordenados por producto_id ASC.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_INVENTARIO],
    ),

    # Módulo 6 - Reto 32: Censo Completo de Pedidos por Cliente (Preservando Ceros)
    "e0000000-0000-0000-0000-000000000038": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000038",
        module_id="b0000000-0000-0000-0000-000000000006",
        title="Censo Completo de Pedidos por Cliente (Preservando Ceros)",
        prompt="CRM requiere un censo íntegro de la cartera de clientes, visualizando cuántos pedidos ha efectuado cada usuario sin omitir a aquellos que nunca han comprado. Escribe una consulta mediante LEFT JOIN de clientes con pedidos que devuelva cliente_id, nombre, apellido y el recuento total de compras bajo el alias total_pedidos (usando COUNT(p.pedido_id)). Ordena los resultados por total_pedidos DESC y, en caso de empate, por cliente_id ASC.",
        initial_code="-- Agrupa preservando clientes sin compras con COUNT(columna)\nSELECT ",
        solution_query="SELECT c.cliente_id, c.nombre, c.apellido, COUNT(p.pedido_id) AS total_pedidos FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_pedidos DESC, c.cliente_id ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=32,
        hints=[
            "Usa COUNT(p.pedido_id) AS total_pedidos para contar únicamente pedidos existentes.",
            "Agrupa por c.cliente_id, c.nombre, c.apellido y ordena con ORDER BY total_pedidos DESC, c.cliente_id ASC;",
        ],
        concept=ExerciseConcept(
            summary="Diferencia crucial entre COUNT(*) y COUNT(columna): COUNT(*) cuenta filas físicas (daría 1 para clientes sin pedidos por la fila generada con NULLs), mientras que COUNT(p.pedido_id) ignora los NULLs y devuelve correctamente 0.",
            syntax="SELECT c.cliente_id, c.nombre, COUNT(p.pedido_id) AS total_pedidos\nFROM clientes c\nLEFT JOIN pedidos p ON c.cliente_id = p.cliente_id\nGROUP BY c.cliente_id, c.nombre\nORDER BY total_pedidos DESC;",
            key_points=[
                "COUNT(expresion) solo suma tuplas donde 'expresion' NO sea nula.",
                "Es el estándar relacional para métricas acumuladas que deben reflejar el cero absoluto.",
            ],
            execution_order_note="⚡ LEFT JOIN preserva entidades huérfanas $\to$ GROUP BY colapsa $\to$ COUNT(col) ignora los nulos.",
        ),
        objectives=[
            "1. Efectuar LEFT JOIN entre clientes y pedidos.",
            "2. Agrupar por cliente_id, nombre, apellido.",
            "3. Contar pedidos con COUNT(p.pedido_id) AS total_pedidos.",
            "4. Ordenar por total_pedidos DESC, cliente_id ASC.",
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
    ),

    # Módulo 7 - Reto 34: Historial de Ventas por Ciudad y Categoría
    "e0000000-0000-0000-0000-000000000039": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000039",
        module_id="b0000000-0000-0000-0000-000000000007",
        title="Historial de Ventas por Ciudad y Categoría",
        prompt="Dirección estratégica solicita un desglose de facturación territorial por categoría de producto. Conecta clientes, pedidos, detalle_pedidos, productos y categorias para calcular la suma de ventas (SUM(dp.cantidad * dp.precio_unitario)) bajo el alias monto_vendido, agrupada por la ciudad del cliente y el nombre_categoria. Ordena por ciudad ASC y luego por monto_vendido DESC.",
        initial_code="-- Conecta 5 tablas y calcula ventas por ciudad y categoria\nSELECT ",
        solution_query="SELECT c.ciudad, cat.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS monto_vendido FROM clientes c INNER JOIN pedidos p ON c.cliente_id = p.cliente_id INNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id INNER JOIN productos pr ON dp.producto_id = pr.producto_id INNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id GROUP BY c.ciudad, cat.nombre_categoria ORDER BY c.ciudad ASC, monto_vendido DESC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=34,
        hints=[
            "Encadena 4 INNER JOINs desde clientes hasta categorias.",
            "Agrupa por c.ciudad y cat.nombre_categoria, calculando SUM(dp.cantidad * dp.precio_unitario) AS monto_vendido.",
            "Ordena por c.ciudad ASC, monto_vendido DESC;",
        ],
        concept=ExerciseConcept(
            summary="Al conectar un esquema relacional normalizado en estrella o copo de nieve, se pueden cruzar dimensiones geográficas (ciudad) con dimensiones de producto (categoría) para análisis multidimensional.",
            syntax="SELECT c.ciudad, cat.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS monto_vendido\nFROM clientes c\nINNER JOIN pedidos p ON c.cliente_id = p.cliente_id\nINNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id\nINNER JOIN productos pr ON dp.producto_id = pr.producto_id\nINNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id\nGROUP BY c.ciudad, cat.nombre_categoria\nORDER BY c.ciudad ASC, monto_vendido DESC;",
            key_points=[
                "El cálculo de línea (cantidad * precio_unitario) se evalúa antes de la agregación SUM().",
                "Todas las columnas de dimensión no agregadas deben incluirse en GROUP BY.",
            ],
            execution_order_note="⚡ Cadena de JOINs genera el cubo de datos $\to$ GROUP BY agrupa por ciudad y categoría $\to$ SUM acumula.",
        ),
        objectives=[
            "1. Unir clientes, pedidos, detalle_pedidos, productos y categorias.",
            "2. Calcular SUM(dp.cantidad * dp.precio_unitario) AS monto_vendido.",
            "3. Agrupar por c.ciudad y cat.nombre_categoria.",
            "4. Ordenar por c.ciudad ASC, monto_vendido DESC.",
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_DETALLE_PEDIDOS, SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
    ),

    # Módulo 7 - Reto 35: Conciliación de Pedidos, Facturación y Pagos
    "e0000000-0000-0000-0000-000000000040": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000040",
        module_id="b0000000-0000-0000-0000-000000000007",
        title="Conciliación de Pedidos, Facturación y Pagos",
        prompt="Auditoría financiera requiere verificar la trazabilidad íntegra entre órdenes de compra, facturación emitida y pagos liquidados. Escribe una consulta que una pedidos con facturas y pagos, proyectando pedido_id, cliente_id, monto_total de la factura como monto_factura, el monto del pago como monto_pago y el metodo_pago. Ordena por pedido_id ASC.",
        initial_code="-- Cruza pedidos con facturas y pagos\nSELECT ",
        solution_query="SELECT p.pedido_id, p.cliente_id, f.monto_total AS monto_factura, pg.monto AS monto_pago, pg.metodo_pago FROM pedidos p INNER JOIN facturas f ON p.pedido_id = f.pedido_id INNER JOIN pagos pg ON f.factura_id = pg.factura_id ORDER BY p.pedido_id ASC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=35,
        hints=[
            "Une pedidos p con facturas f por pedido_id, y facturas f con pagos pg por factura_id.",
            "Usa f.monto_total AS monto_factura y pg.monto AS monto_pago.",
            "Ordena por p.pedido_id ASC;",
        ],
        concept=ExerciseConcept(
            summary="Las consultas multi-tabla en el dominio contable conectan la orden comercial con el comprobante fiscal y la transacción bancaria para certificar la consistencia del flujo de caja.",
            syntax="SELECT p.pedido_id, p.cliente_id, f.monto_total AS monto_factura, pg.monto AS monto_pago, pg.metodo_pago\nFROM pedidos p\nINNER JOIN facturas f ON p.pedido_id = f.pedido_id\nINNER JOIN pagos pg ON f.factura_id = pg.factura_id\nORDER BY p.pedido_id ASC;",
            key_points=[
                "Permite contrastar si el importe facturado coincide con el importe cobrado.",
                "Identifica discrepancias en importes o modalidades de pago entre órdenes.",
            ],
            execution_order_note="⚡ pedidos se une a facturas $\to$ facturas se une a pagos $\to$ proyección de atributos financieros.",
        ),
        objectives=[
            "1. Cruzar pedidos, facturas y pagos mediante sus claves foráneas.",
            "2. Proyectar pedido_id, cliente_id, monto_factura, monto_pago y metodo_pago.",
            "3. Ordenar por pedido_id ASC.",
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_FACTURAS, SAMPLE_TABLE_PAGOS],
    ),

    # Módulo 7 - Reto 36: Trazabilidad Física de Inventario por Almacén
    "e0000000-0000-0000-0000-000000000041": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000041",
        module_id="b0000000-0000-0000-0000-000000000007",
        title="Trazabilidad Física de Inventario por Almacén",
        prompt="Operaciones logísticas necesita un informe de existencias distribuidas por punto de almacenamiento. Conecta las tablas productos, inventario y almacenes, proyectando nombre_producto, nombre_almacen, la ciudad del almacén y cantidad_disponible, filtrando únicamente registros con existencias mayores a 10 unidades. Ordena por nombre_producto ASC y luego por nombre_almacen ASC.",
        initial_code="-- Conecta productos, inventario y almacenes\nSELECT ",
        solution_query="SELECT pr.nombre_producto, a.nombre_almacen, a.ciudad, i.cantidad_disponible FROM productos pr INNER JOIN inventario i ON pr.producto_id = i.producto_id INNER JOIN almacenes a ON i.almacen_id = a.almacen_id WHERE i.cantidad_disponible > 10 ORDER BY pr.nombre_producto ASC, a.nombre_almacen ASC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=36,
        hints=[
            "Une productos pr con inventario i por producto_id, e inventario i con almacenes a por almacen_id.",
            "Filtra en WHERE i.cantidad_disponible > 10 y ordena con ORDER BY pr.nombre_producto ASC, a.nombre_almacen ASC;",
        ],
        concept=ExerciseConcept(
            summary="En modelos de inventario multi-almacén (relación N:M entre productos y almacenes mediante la tabla de enlace inventario), conectar las tres entidades resuelve la ubicación física y disponibilidad exacta.",
            syntax="SELECT pr.nombre_producto, a.nombre_almacen, a.ciudad, i.cantidad_disponible\nFROM productos pr\nINNER JOIN inventario i ON pr.producto_id = i.producto_id\nINNER JOIN almacenes a ON i.almacen_id = a.almacen_id\nWHERE i.cantidad_disponible > 10\nORDER BY pr.nombre_producto ASC, a.nombre_almacen ASC;",
            key_points=[
                "La tabla 'inventario' actúa como tabla de unión (junction table) con atributos descriptivos adicionales (cantidad_disponible).",
                "El filtro WHERE restringe las existencias antes del ordenamiento.",
            ],
            execution_order_note="⚡ Cruce N:M resuelto mediante tabla intermedia $\to$ filtrado de stock $\to$ ordenamiento compuesto.",
        ),
        objectives=[
            "1. Conectar productos, inventario y almacenes.",
            "2. Filtrar donde cantidad_disponible > 10.",
            "3. Proyectar nombre_producto, nombre_almacen, ciudad, cantidad_disponible.",
            "4. Ordenar por nombre_producto ASC, nombre_almacen ASC.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_INVENTARIO, SAMPLE_TABLE_ALMACENES],
    ),

    # Módulo 8 - Reto 37: Directorio Operativo Unificado (UNION)
    "e0000000-0000-0000-0000-000000000042": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000042",
        module_id="b0000000-0000-0000-0000-000000000008",
        title="Directorio Operativo Unificado (UNION)",
        prompt="Planificación territorial necesita construir un censo consolidado de todas las ciudades con presencia de la empresa, distinguiendo si la presencia es comercial (clientes) o logística (almacenes). Escribe una consulta mediante el operador UNION que combine ciudad y el literal 'cliente' AS tipo_entidad de la tabla clientes, con ciudad y el literal 'almacen' AS tipo_entidad de almacenes. Ordena por ciudad ASC y tipo_entidad ASC.",
        initial_code="-- Combina ciudades de clientes y almacenes con UNION\nSELECT ",
        solution_query="SELECT ciudad, 'cliente' AS tipo_entidad FROM clientes UNION SELECT ciudad, 'almacen' AS tipo_entidad FROM almacenes ORDER BY ciudad ASC, tipo_entidad ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=37,
        hints=[
            "El primer bloque es SELECT ciudad, 'cliente' AS tipo_entidad FROM clientes.",
            "Usa UNION con el segundo bloque: SELECT ciudad, 'almacen' AS tipo_entidad FROM almacenes.",
            "Finaliza la instrucción con ORDER BY ciudad ASC, tipo_entidad ASC;",
        ],
        concept=ExerciseConcept(
            summary="El operador UNION combina verticalmente el resultado de dos consultas compatibles en tipos de datos y número de columnas, eliminando filas duplicadas de forma automática.",
            syntax="SELECT ciudad, 'cliente' AS tipo_entidad FROM clientes\nUNION\nSELECT ciudad, 'almacen' AS tipo_entidad FROM almacenes\nORDER BY ciudad ASC, tipo_entidad ASC;",
            key_points=[
                "A diferencia de los JOINs que combinan horizontalmente columnas, los operadores de conjunto combinan verticalmente filas.",
                "Cada consulta componente debe proyectar el mismo número de columnas y de tipos compatibles.",
            ],
            execution_order_note="⚡ Se evalúa cada consulta por separado $\to$ UNION une los conjuntos y descarta duplicados $\to$ ORDER BY final.",
        ),
        objectives=[
            "1. Construir la consulta sobre clientes proyectando ciudad y literal 'cliente' AS tipo_entidad.",
            "2. Unir con UNION la consulta sobre almacenes proyectando ciudad y 'almacen' AS tipo_entidad.",
            "3. Ordenar por ciudad ASC, tipo_entidad ASC.",
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_ALMACENES],
    ),

    # Módulo 8 - Reto 38: Ciudades sin Presencia de Almacenes (EXCEPT)
    "e0000000-0000-0000-0000-000000000043": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000043",
        module_id="b0000000-0000-0000-0000-000000000008",
        title="Ciudades sin Presencia de Almacenes (EXCEPT)",
        prompt="Expansión comercial busca detectar mercados desabastecidos de infraestructura logística propia. Escribe una consulta utilizando el operador de diferencia de conjuntos EXCEPT que obtenga las ciudades de la tabla clientes que NO existan en la tabla almacenes. Ordena la lista alfabéticamente por ciudad ASC.",
        initial_code="-- Diferencia de conjuntos con EXCEPT\nSELECT ",
        solution_query="SELECT ciudad FROM clientes EXCEPT SELECT ciudad FROM almacenes ORDER BY ciudad ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=38,
        hints=[
            "Escribe SELECT ciudad FROM clientes seguido de EXCEPT SELECT ciudad FROM almacenes.",
            "Agrega ORDER BY ciudad ASC; al final.",
        ],
        concept=ExerciseConcept(
            summary="El operador EXCEPT (o MINUS en otros motores) devuelve todas las tuplas distintas devueltas por la primera consulta que no están presentes en el resultado de la segunda consulta.",
            syntax="SELECT ciudad FROM clientes\nEXCEPT\nSELECT ciudad FROM almacenes\nORDER BY ciudad ASC;",
            key_points=[
                "Aplica la resta de conjuntos del álgebra relacional: A - B.",
                "Elimina duplicados automáticamente en el conjunto resultante.",
            ],
            execution_order_note="⚡ Se generan los dos conjuntos $\to$ EXCEPT sustrae los elementos de B presentes en A $\to$ ORDER BY.",
        ),
        objectives=[
            "1. Seleccionar 'ciudad' de 'clientes'.",
            "2. Aplicar 'EXCEPT' seleccionando 'ciudad' de 'almacenes'.",
            "3. Ordenar por 'ciudad ASC'.",
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_ALMACENES],
    ),

    # Módulo 8 - Reto 39: Matriz de Cobertura Almacén-Categoría (CROSS JOIN)
    "e0000000-0000-0000-0000-000000000044": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000044",
        module_id="b0000000-0000-0000-0000-000000000008",
        title="Matriz de Cobertura Almacén-Categoría (CROSS JOIN)",
        prompt="Para la auditoría de cobertura de almacenamiento, el equipo directivo requiere generar la matriz completa de combinaciones posibles entre cada almacén y cada categoría de producto registrada. Escribe una consulta mediante un producto cartesiano explícito (CROSS JOIN) entre las tablas almacenes y categorias, devolviendo nombre_almacen y nombre_categoria. Ordena por nombre_almacen ASC y nombre_categoria ASC.",
        initial_code="-- Genera el producto cartesiano con CROSS JOIN\nSELECT ",
        solution_query="SELECT a.nombre_almacen, c.nombre_categoria FROM almacenes a CROSS JOIN categorias c ORDER BY a.nombre_almacen ASC, c.nombre_categoria ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=39,
        hints=[
            "Usa CROSS JOIN entre almacenes a y categorias c.",
            "Ordena el resultado por a.nombre_almacen ASC, c.nombre_categoria ASC;",
        ],
        concept=ExerciseConcept(
            summary="CROSS JOIN genera el producto cartesiano completo entre dos conjuntos: cada tupla de la primera tabla se combina con cada una de las tuplas de la segunda tabla (N x M).",
            syntax="SELECT a.nombre_almacen, c.nombre_categoria\nFROM almacenes a\nCROSS JOIN categorias c\nORDER BY a.nombre_almacen ASC, c.nombre_categoria ASC;",
            key_points=[
                "No requiere cláusula ON porque no impone restricción de claves.",
                "Es la técnica canónica para generar grillas de combinaciones, matrices de prueba o calendarios.",
            ],
            execution_order_note="⚡ Se computa el producto cartesiano de cardinalidad |A| * |B| $\to$ SELECT $\to$ ORDER BY.",
        ),
        objectives=[
            "1. Aplicar CROSS JOIN entre 'almacenes a' y 'categorias c'.",
            "2. Proyectar 'nombre_almacen' y 'nombre_categoria'.",
            "3. Ordenar por nombre_almacen ASC, nombre_categoria ASC.",
        ],
        sample_tables=[SAMPLE_TABLE_ALMACENES, SAMPLE_TABLE_CATEGORIAS],
    ),

    # Módulo 8 - Reto 40: Pares de Productos de la Misma Categoría (SELF JOIN)
    "e0000000-0000-0000-0000-000000000045": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000045",
        module_id="b0000000-0000-0000-0000-000000000008",
        title="Pares de Productos de la Misma Categoría (SELF JOIN)",
        prompt="El motor de recomendaciones busca sugerir productos alternativos de la misma categoría. Escribe una consulta mediante un auto-cruce (SELF JOIN) sobre la tabla productos (p1 y p2) que empareje artículos que compartan la misma categoria_id, asegurando que p1.producto_id < p2.producto_id (para evitar pares simétricos y descartar emparejamientos consigo mismo). Proyecta p1.categoria_id, p1.nombre_producto AS producto_a, p2.nombre_producto AS producto_b, p1.precio AS precio_a y p2.precio AS precio_b. Ordena por p1.categoria_id ASC, producto_a ASC y producto_b ASC.",
        initial_code="-- Auto-cruce de productos con condición de desigualdad\nSELECT ",
        solution_query="SELECT p1.categoria_id, p1.nombre_producto AS producto_a, p2.nombre_producto AS producto_b, p1.precio AS precio_a, p2.precio AS precio_b FROM productos p1 INNER JOIN productos p2 ON p1.categoria_id = p2.categoria_id AND p1.producto_id < p2.producto_id ORDER BY p1.categoria_id ASC, producto_a ASC, producto_b ASC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=40,
        hints=[
            "Une productos p1 con productos p2 en ON p1.categoria_id = p2.categoria_id AND p1.producto_id < p2.producto_id.",
            "Ordena por p1.categoria_id ASC, producto_a ASC, producto_b ASC;",
        ],
        concept=ExerciseConcept(
            summary="Un SELF JOIN relaciona una tabla consigo misma tratándola como dos instancias relacionales separadas mediante alias distintos. La desigualdad estricta (<) previene pares espejo (A,B y B,A) y auto-emparejamientos (A,A).",
            syntax="SELECT p1.categoria_id, p1.nombre_producto AS producto_a, p2.nombre_producto AS producto_b\nFROM productos p1\nINNER JOIN productos p2 ON p1.categoria_id = p2.categoria_id AND p1.producto_id < p2.producto_id\nORDER BY p1.categoria_id ASC, producto_a ASC, producto_b ASC;",
            key_points=[
                "Los alias p1 y p2 son indispensables para que el motor distinga a cuál instancia corresponde cada atributo.",
                "El filtro 'p1.id < p2.id' es el patrón matemático clásico para combinaciones sin repetición.",
            ],
            execution_order_note="⚡ La tabla se instancia virtualmente dos veces y se filtra por categoría idéntica y clave menor estricta.",
        ),
        objectives=[
            "1. Realizar SELF JOIN sobre 'productos' usando alias p1 y p2.",
            "2. Unir por 'p1.categoria_id = p2.categoria_id AND p1.producto_id < p2.producto_id'.",
            "3. Proyectar categoria_id, producto_a, producto_b, precio_a, precio_b.",
            "4. Ordenar por categoria_id ASC, producto_a ASC, producto_b ASC.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    # =========================================================================
    # RUTA 3: Advanced Queries (Módulos 8 al 11)
    # =========================================================================

    # Módulo 8 - Reto 14: Subconsultas Escalares
    "e0000000-0000-0000-0000-000000000015": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000015",
        module_id="c0000000-0000-0000-0000-000000000009",
        title="Productos sobre el Promedio de Precio",
        prompt="Estrategia de precios necesita listar los productos que se venden por encima de la media del catálogo completo. Escribe una consulta que devuelva el nombre_producto y su precio para aquellos artículos cuyo precio sea estrictamente superior al promedio global de precios de la tabla productos. Ordena por precio de mayor a menor.",
        initial_code="-- Usa una subconsulta para comparar con el promedio global\nSELECT ",
        solution_query="SELECT nombre_producto, precio FROM productos WHERE precio > (SELECT AVG(precio) FROM productos) ORDER BY precio DESC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=41,
        hints=[
            "En la cláusula WHERE, escribe precio > (SELECT AVG(precio) FROM productos).",
            "No olvides ordenar con ORDER BY precio DESC.",
        ],
        concept=ExerciseConcept(
            summary="Una subconsulta escalar retorna un único valor (una fila, una columna) que puede utilizarse en cualquier lugar donde se admita un literal o expresión, como operandos en condiciones WHERE.",
            syntax="SELECT columna_1, columna_2\nFROM tabla\nWHERE columna > (SELECT AVG(columna) FROM tabla)\nORDER BY columna DESC;",
            key_points=[
                "La subconsulta se ejecuta primero y su valor resultante se compara contra cada tupla externa.",
                "Permite filtros dinámicos que no dependen de constantes hardcodeadas.",
            ],
            execution_order_note="⚡ PostgreSQL calcula la subconsulta una sola vez (o la optimiza como constante) antes de evaluar el filtro WHERE.",
        ),
        objectives=[
            "1. Calcular el promedio de precio en una subconsulta escalar con AVG(precio).",
            "2. Filtrar en WHERE con 'precio > (subconsulta)'.",
            "3. Ordenar por 'precio DESC'.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    # Módulo 9 - Reto 42: Expresiones Condicionales (CASE WHEN)
    "e0000000-0000-0000-0000-000000000016": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000016",
        module_id="c0000000-0000-0000-0000-000000000010",
        title="Segmentación de Pedidos por Monto",
        prompt="Finanzas desea clasificar los pedidos según su cuantía para priorizar la logística. Escribe una consulta que devuelva el pedido_id, el total del pedido y una columna llamada segmento calculada de la siguiente forma: si total >= 1000 asigna 'Alto Valor', si total >= 300 asigna 'Medio Valor', y en cualquier otro caso 'Bajo Valor'. Ordena por total descendente.",
        initial_code="-- Clasifica los pedidos en tres segmentos según su monto\nSELECT ",
        solution_query="SELECT pedido_id, total, CASE WHEN total >= 1000 THEN 'Alto Valor' WHEN total >= 300 THEN 'Medio Valor' ELSE 'Bajo Valor' END AS segmento FROM pedidos ORDER BY total DESC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=44,
        hints=[
            "Usa la sintaxis: CASE WHEN condicion1 THEN valor1 WHEN condicion2 THEN valor2 ELSE valor_defecto END AS segmento.",
            "Recuerda ordenar con ORDER BY total DESC.",
        ],
        concept=ExerciseConcept(
            summary="La expresión CASE permite incorporar bifurcaciones condicionales 'if-then-else' directamente dentro de una consulta SQL, categorizando tuplas dinámicamente sin alterar la base de datos.",
            syntax="SELECT col1, col2,\n       CASE\n         WHEN valor >= lim1 THEN 'Cat A'\n         WHEN valor >= lim2 THEN 'Cat B'\n         ELSE 'Cat C'\n       END AS clasificacion\nFROM tabla;",
            key_points=[
                "Las ramas WHEN se evalúan en orden secuencial; la primera que cumple detiene la evaluación.",
                "La cláusula ELSE es opcional pero recomendada para evitar valores nulos inesperados.",
            ],
            execution_order_note="⚡ CASE se evalúa para cada fila durante la fase de proyección SELECT.",
        ),
        objectives=[
            "1. Proyectar 'pedido_id' y 'total'.",
            "2. Construir la expresión CASE con las condiciones >= 1000, >= 300 y ELSE.",
            "3. Nombrar la columna resultante como 'segmento' y ordenar por 'total DESC'.",
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),

    # Módulo 10 - Reto 43: Common Table Expressions (CTEs)
    "e0000000-0000-0000-0000-000000000017": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000017",
        module_id="c0000000-0000-0000-0000-000000000011",
        title="Facturación por Categoría mediante CTE",
        prompt="Para la junta directiva, prepara un informe de facturación por categoría usando una Common Table Expression (CTE). Define una expresión WITH llamada ventas_por_categoria que sume (cantidad * precio_unitario) agrupando por el nombre_categoria, y luego selecciona nombre_categoria y facturacion ordenados de mayor a menor facturación.",
        initial_code="-- Estructura la consulta analítica usando WITH ... AS\nWITH ",
        solution_query="WITH ventas_por_categoria AS (SELECT c.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS facturacion FROM categorias c INNER JOIN productos pr ON c.categoria_id = pr.categoria_id INNER JOIN detalle_pedidos dp ON pr.producto_id = dp.producto_id GROUP BY c.nombre_categoria) SELECT nombre_categoria, facturacion FROM ventas_por_categoria ORDER BY facturacion DESC;",
        xp_reward=60,
        difficulty="Intermedio",
        check_order=True,
        sort_order=46,
        hints=[
            "Inicia con WITH ventas_por_categoria AS ( ... )",
            "Dentro del CTE, cruza categorias, productos y detalle_pedidos y agrupa por c.nombre_categoria.",
            "En la consulta principal, haz SELECT nombre_categoria, facturacion FROM ventas_por_categoria ORDER BY facturacion DESC;",
        ],
        concept=ExerciseConcept(
            summary="Las Common Table Expressions (CTEs) crean tablas de resultados temporales nombradas dentro del alcance de una única consulta, mejorando drásticamente la legibilidad y modularidad de queries complejas.",
            syntax="WITH nombre_cte AS (\n    SELECT clave, SUM(monto) AS total\n    FROM tabla\n    GROUP BY clave\n)\nSELECT clave, total\nFROM nombre_cte\nORDER BY total DESC;",
            key_points=[
                "Reemplazan subconsultas anidadas difíciles de leer por pasos analíticos secuenciales.",
                "En PostgreSQL moderno, los CTEs pueden ser optimizados e inlined de forma transparente.",
            ],
            execution_order_note="⚡ El CTE se evalúa y su conjunto intermedio queda disponible para la consulta principal que le sigue.",
        ),
        objectives=[
            "1. Declarar 'WITH ventas_por_categoria AS (...)' con la agregación de facturación.",
            "2. Cruzar 'categorias', 'productos' y 'detalle_pedidos' agrupando por 'nombre_categoria'.",
            "3. Consumir el CTE en la consulta final ordenando por 'facturacion DESC'.",
        ],
        sample_tables=[SAMPLE_TABLE_CATEGORIAS, SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_DETALLE_PEDIDOS],
    ),

    # Módulo 11 - Reto 44: Window Functions (ROW_NUMBER)
    "e0000000-0000-0000-0000-000000000007": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000007",
        module_id="c0000000-0000-0000-0000-000000000012",
        title="Ranking de Productos por Precio (ROW_NUMBER)",
        prompt="El área de pricing desea clasificar los productos del más caro al más económico. Devuelve el producto_id, nombre_producto, precio y una columna llamada ranking con la posición de cada producto del más caro al más barato.",
        initial_code="-- Emplea ROW_NUMBER() OVER (...)\nSELECT ",
        solution_query="SELECT producto_id, nombre_producto, precio, ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking FROM productos;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=48,
        hints=["Usa la función ventana ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking."],
        concept=ExerciseConcept(
            summary="Las funciones ventana (Window Functions) realizan cálculos a través de particiones de tuplas sin colapsar el resultado en una sola fila. ROW_NUMBER() numera secuencialmente cada registro según la cláusula OVER (ORDER BY ...).",
            syntax="SELECT producto_id, nombre_producto, precio,\n       ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking\nFROM productos;",
            key_points=[
                "La cláusula OVER() determina el marco de la ventana analítica.",
                "Permite calcular clasificaciones, acumulados y diferencias entre filas consecutivas.",
            ],
            execution_order_note="⚡ Las funciones ventana se evalúan después de WHERE, GROUP BY y HAVING, pero antes del ORDER BY de salida final.",
        ),
        objectives=[
            "1. Proyectar 'producto_id', 'nombre_producto' y 'precio'.",
            "2. Utilizar 'ROW_NUMBER() OVER (ORDER BY precio DESC)' con alias 'ranking'.",
            "3. Comprobar que el producto más costoso ocupe la posición 1.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    # Módulo 11 - Reto 45: Window Functions (DENSE_RANK & PARTITION BY)
    "e0000000-0000-0000-0000-000000000018": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000018",
        module_id="c0000000-0000-0000-0000-000000000012",
        title="Ranking Relativo por Categoría (DENSE_RANK)",
        prompt="Análisis de surtido necesita clasificar los artículos dentro de cada categoría según su precio. Escribe una consulta que devuelva categoria_id, nombre_producto, precio y una columna analítica llamada ranking_categoria usando DENSE_RANK() con partición por categoria_id y orden descendente de precio. Ordena el resultado final por categoria_id ASC y ranking_categoria ASC.",
        initial_code="-- Usa DENSE_RANK() particionado por categoria_id\nSELECT ",
        solution_query="SELECT categoria_id, nombre_producto, precio, DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria FROM productos ORDER BY categoria_id ASC, ranking_categoria ASC;",
        xp_reward=65,
        difficulty="Intermedio",
        check_order=True,
        sort_order=45,
        hints=[
            "Usa DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria.",
            "Ordena al final por categoria_id ASC, ranking_categoria ASC.",
        ],
        concept=ExerciseConcept(
            summary="La cláusula PARTITION BY dentro de OVER() divide las tuplas en particiones independientes antes de aplicar la función de ventana. A diferencia de ROW_NUMBER(), DENSE_RANK() asigna el mismo rango a valores iguales sin dejar huecos en la numeración.",
            syntax="SELECT categoria_id, nombre_producto, precio,\n       DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria\nFROM productos\nORDER BY categoria_id ASC, ranking_categoria ASC;",
            key_points=[
                "PARTITION BY restablece el cálculo analítico para cada categoría de producto de forma aislada.",
                "DENSE_RANK() maneja empates elegantemente (1, 2, 2, 3...) sin saltar posiciones numéricas.",
            ],
            execution_order_note="⚡ Se particionan los datos en memoria antes de evaluar la ordenación interna de la ventana.",
        ),
        objectives=[
            "1. Proyectar 'categoria_id', 'nombre_producto' y 'precio'.",
            "2. Construir 'DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC)' con alias 'ranking_categoria'.",
            "3. Ordenar la salida final por 'categoria_id ASC, ranking_categoria ASC'.",
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
    ),
}
