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

# Catálogo completo de 18 ejercicios enriquecidos con didáctica interactiva estilo SQLBolt
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

    # Módulo 2 - Reto 3: Filtrado con WHERE (> 500)
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
        sort_order=3,
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
        sort_order=4,
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
        sort_order=5,
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
        sort_order=6,
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
        sort_order=7,
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
        sort_order=8,
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
        sort_order=9,
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
        sort_order=10,
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
        sort_order=11,
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
        sort_order=12,
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
        sort_order=13,
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

    # =========================================================================
    # RUTA 3: Advanced Queries (Módulos 8 al 11)
    # =========================================================================

    # Módulo 8 - Reto 14: Subconsultas Escalares
    "e0000000-0000-0000-0000-000000000015": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000015",
        module_id="c0000000-0000-0000-0000-000000000008",
        title="Productos sobre el Promedio de Precio",
        prompt="Estrategia de precios necesita listar los productos que se venden por encima de la media del catálogo completo. Escribe una consulta que devuelva el nombre_producto y su precio para aquellos artículos cuyo precio sea estrictamente superior al promedio global de precios de la tabla productos. Ordena por precio de mayor a menor.",
        initial_code="-- Usa una subconsulta para comparar con el promedio global\nSELECT ",
        solution_query="SELECT nombre_producto, precio FROM productos WHERE precio > (SELECT AVG(precio) FROM productos) ORDER BY precio DESC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=14,
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

    # Módulo 9 - Reto 15: Expresiones Condicionales (CASE WHEN)
    "e0000000-0000-0000-0000-000000000016": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000016",
        module_id="c0000000-0000-0000-0000-000000000009",
        title="Segmentación de Pedidos por Monto",
        prompt="Finanzas desea clasificar los pedidos según su cuantía para priorizar la logística. Escribe una consulta que devuelva el pedido_id, el total del pedido y una columna llamada segmento calculada de la siguiente forma: si total >= 1000 asigna 'Alto Valor', si total >= 300 asigna 'Medio Valor', y en cualquier otro caso 'Bajo Valor'. Ordena por total descendente.",
        initial_code="-- Clasifica los pedidos en tres segmentos según su monto\nSELECT ",
        solution_query="SELECT pedido_id, total, CASE WHEN total >= 1000 THEN 'Alto Valor' WHEN total >= 300 THEN 'Medio Valor' ELSE 'Bajo Valor' END AS segmento FROM pedidos ORDER BY total DESC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=15,
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

    # Módulo 10 - Reto 16: Common Table Expressions (CTEs)
    "e0000000-0000-0000-0000-000000000017": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000017",
        module_id="c0000000-0000-0000-0000-000000000010",
        title="Facturación por Categoría mediante CTE",
        prompt="Para la junta directiva, prepara un informe de facturación por categoría usando una Common Table Expression (CTE). Define una expresión WITH llamada ventas_por_categoria que sume (cantidad * precio_unitario) agrupando por el nombre_categoria, y luego selecciona nombre_categoria y facturacion ordenados de mayor a menor facturación.",
        initial_code="-- Estructura la consulta analítica usando WITH ... AS\nWITH ",
        solution_query="WITH ventas_por_categoria AS (SELECT c.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS facturacion FROM categorias c INNER JOIN productos pr ON c.categoria_id = pr.categoria_id INNER JOIN detalle_pedidos dp ON pr.producto_id = dp.producto_id GROUP BY c.nombre_categoria) SELECT nombre_categoria, facturacion FROM ventas_por_categoria ORDER BY facturacion DESC;",
        xp_reward=60,
        difficulty="Intermedio",
        check_order=True,
        sort_order=16,
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

    # Módulo 11 - Reto 17: Window Functions (ROW_NUMBER)
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
        sort_order=17,
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

    # Módulo 11 - Reto 18: Window Functions (DENSE_RANK & PARTITION BY)
    "e0000000-0000-0000-0000-000000000018": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000018",
        module_id="c0000000-0000-0000-0000-000000000011",
        title="Ranking Relativo por Categoría (DENSE_RANK)",
        prompt="Análisis de surtido necesita clasificar los artículos dentro de cada categoría según su precio. Escribe una consulta que devuelva categoria_id, nombre_producto, precio y una columna analítica llamada ranking_categoria usando DENSE_RANK() con partición por categoria_id y orden descendente de precio. Ordena el resultado final por categoria_id ASC y ranking_categoria ASC.",
        initial_code="-- Usa DENSE_RANK() particionado por categoria_id\nSELECT ",
        solution_query="SELECT categoria_id, nombre_producto, precio, DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria FROM productos ORDER BY categoria_id ASC, ranking_categoria ASC;",
        xp_reward=65,
        difficulty="Intermedio",
        check_order=True,
        sort_order=18,
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
