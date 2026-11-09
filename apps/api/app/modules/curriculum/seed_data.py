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
    columns=["producto_id", "nombre_producto", "precio", "stock", "categoria_id"],
    rows=[
        [1, "Laptop Pro 15", 1299.99, 15, 1],
        [2, "Smartphone X", 799.50, 30, 1],
        [3, "Auriculares Noise-Cancelling", 199.99, 50, 1],
        [4, "Monitor 4K 27\"", 450.00, 20, 1],
        [5, "Teclado Mecánico RGB", 89.90, 80, 1],
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
    ],
)

# Catálogo semilla inicial enriquecido con didáctica estilo SQLBolt
SEED_EXERCISES: Dict[str, ExerciseDetail] = {
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
        sort_order=2,
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
        sort_order=3,
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
        sort_order=4,
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
    "e0000000-0000-0000-0000-000000000005": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000005",
        module_id="b0000000-0000-0000-0000-000000000005",
        title="Pedidos con Identidad del Cliente (INNER JOIN)",
        prompt="Genera un reporte que muestre el pedido_id, el nombre del cliente, su apellido y el total del pedido. Relaciona las tablas pedidos y clientes mediante su clave compartida.",
        initial_code="-- Cruza clientes con sus respectivos pedidos\nSELECT ",
        solution_query="SELECT p.pedido_id, c.nombre, c.apellido, p.total FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id;",
        xp_reward=45,
        difficulty="Intermedio",
        check_order=False,
        sort_order=5,
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
        sort_order=6,
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
    "e0000000-0000-0000-0000-000000000007": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000007",
        module_id="c0000000-0000-0000-0000-000000000011",
        title="Ranking de Productos por Precio (ROW_NUMBER)",
        prompt="El área de pricing desea clasificar los productos del más caro al más económico. Devuelve el producto_id, nombre_producto, precio y una columna llamada ranking con la posición de cada producto del más caro al más barato.",
        initial_code="-- Emplea ROW_NUMBER() OVER (...)\nSELECT ",
        solution_query="SELECT producto_id, nombre_producto, precio, ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking FROM productos;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=7,
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
}
