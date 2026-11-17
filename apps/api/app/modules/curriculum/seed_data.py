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


class ExercisePublicDTO(BaseModel):
    id: str
    module_id: str
    title: str
    prompt: str
    initial_code: str
    xp_reward: int
    difficulty: str
    check_order: bool
    sort_order: int
    operational_status: str = "active"
    hints: List[str] = []
    concept: Optional[ExerciseConcept] = None
    objectives: Optional[List[str]] = None
    sample_tables: Optional[List[SampleTableData]] = None


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
    operational_status: str = "active"
    hints: List[str] = []
    concept: Optional[ExerciseConcept] = None
    objectives: Optional[List[str]] = None
    sample_tables: Optional[List[SampleTableData]] = None

    def to_public_dto(self) -> ExercisePublicDTO:
        return ExercisePublicDTO(
            id=self.id,
            module_id=self.module_id,
            title=self.title,
            prompt=self.prompt,
            initial_code=self.initial_code,
            xp_reward=self.xp_reward,
            difficulty=self.difficulty,
            check_order=self.check_order,
            sort_order=self.sort_order,
            operational_status=self.operational_status,
            hints=self.hints,
            concept=self.concept,
            objectives=self.objectives,
            sample_tables=self.sample_tables,
        )


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

# Catálogo completo de 60 ejercicios (3 rutas formativas completas) calibrados con didáctica interactiva progresiva
SEED_EXERCISES: Dict[str, ExerciseDetail] = {

    "e0000000-0000-0000-0000-000000000001": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000001",
        module_id="a0000000-0000-0000-0000-000000000001",
        title="Catálogo Básico de Productos",
        prompt="Imagina que necesitas armar un catálogo sencillo para la tienda. Muestra únicamente el nombre de cada producto (`nombre_producto`) y su precio (`precio`) desde la tabla `productos`.",
        initial_code="-- Escribe tu consulta aqu\u00ed\nSELECT ",
        solution_query="SELECT nombre_producto, precio FROM productos;",
        xp_reward=30,
        difficulty="Principiante",
        check_order=False,
        sort_order=1,
        hints=[
            "Identifica la tabla que guarda el catálogo de artículos y qué dos columnas contienen el nombre y el precio.",
            "Usa SELECT seguido de las columnas separadas por coma y FROM para indicar la tabla.",
            "SELECT ???, ??? FROM productos;"
        ],
        concept=ExerciseConcept(
            summary='Con `SELECT` eliges exactamente qué columnas quieres ver de una tabla, como si seleccionaras qué columnas mantener a la vista en una hoja de cálculo.',
            syntax='SELECT columna_1, columna_2\nFROM nombre_tabla;',
            key_points=[
                '`SELECT` va seguido de las columnas que quieres mostrar, separadas por coma `,`.',
                '`FROM` indica el nombre de la tabla de donde se obtendrán los datos.',
                'Toda instrucción en SQL finaliza con un punto y coma `;`.'
            ],
            execution_order_note='💡 ¿Cómo lo lee la base de datos? Primero busca la tabla con `FROM` y luego extrae solo las columnas que pediste en `SELECT`.',
        ),
        objectives=[
            "1. Identificar la tabla de productos dentro del esquema.",
            "2. Seleccionar únicamente el nombre y el costo unitario de cada artículo.",
            "3. Ejecutar y verificar los registros devueltos en la cuadrícula."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    "e0000000-0000-0000-0000-000000000008": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000008",
        module_id="a0000000-0000-0000-0000-000000000001",
        title="Cálculo de Precios con IVA",
        prompt="Calcula el precio final con impuestos para cada producto. Muestra el `nombre_producto`, el `precio` original y calcula el precio con el 21% de IVA (`precio * 1.21`) redondeado a 2 decimales, llamando a esa nueva columna `precio_con_iva`.",
        initial_code="-- Proyecta columnas y calcula el precio con IVA\nSELECT ",
        solution_query="SELECT nombre_producto, precio, ROUND(precio * 1.21, 2) AS precio_con_iva FROM productos;",
        xp_reward=35,
        difficulty="Principiante",
        check_order=False,
        sort_order=2,
        hints=[
            "Puedes calcular valores nuevos al vuelo multiplicando la columna numérica por 1.21.",
            "Combina la multiplicación con ROUND(..., 2) para dejar dos decimales y AS para nombrar la columna.",
            "SELECT ???, ???, ROUND(??? * 1.21, 2) AS precio_con_iva FROM productos;"
        ],
        concept=ExerciseConcept(
            summary='En SQL puedes realizar cálculos aritméticos directamente en la cláusula `SELECT` (+, -, *, /) y renombrar el resultado con `AS`.',
            syntax='SELECT columna,\n       ROUND(columna * factor, 2) AS nuevo_nombre\nFROM nombre_tabla;',
            key_points=[
                'Puedes operar con columnas numéricas directamente en el `SELECT`: `columna * multiplicador` o `col_a + col_b`.',
                '`ROUND(expresion, N)` redondea el número resultante a `N` decimales de precisión.',
                '`AS alias_deseado` asigna un encabezado limpio y descriptivo a la columna calculada en la cuadrícula final.'
            ],
            execution_order_note='💡 El cálculo se hace al vuelo en la consulta; no altera los valores originales guardados en la tabla.',
        ),
        objectives=[
            "1. Mostrar las columnas descriptivas y de precio base del artículo.",
            "2. Aplicar el cálculo de la tasa del 21% de impuesto con 2 decimales.",
            "3. Asignar un nombre claro y representativo a la columna calculada."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    "e0000000-0000-0000-0000-000000000019": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000019",
        module_id="a0000000-0000-0000-0000-000000000001",
        title="Concatenación de Nombre Completo",
        prompt="Prepara un directorio para el equipo de atención al cliente. Une el `nombre` y el `apellido` de cada cliente separados por un espacio, nómbralo `cliente_completo`, y muestra también su `email` desde la tabla `clientes`.",
        initial_code="-- Concatena nombre y apellido con un espacio\nSELECT ",
        solution_query="SELECT nombre || ' ' || apellido AS cliente_completo, email FROM clientes;",
        xp_reward=35,
        difficulty="Principiante",
        check_order=False,
        sort_order=3,
        hints=[
            "Necesitas unir dos columnas de texto intercalando un espacio en blanco entre ellas.",
            "Utiliza el operador || junto con un espacio literal ' ' y asigna el alias cliente_completo con AS.",
            "SELECT ??? || ' ' || ??? AS cliente_completo, ??? FROM clientes;"
        ],
        concept=ExerciseConcept(
            summary='El operador de concatenación `||` permite unir dos o más valores de texto en una sola columna combinada.',
            syntax="SELECT columna_a || ' ' || columna_b AS texto_completo\nFROM nombre_tabla;",
            key_points=[
                "Para intercalar un espacio entre dos textos, se encadenan tres elementos con `||`: `col1 || ' ' || col2`.",
                "En SQL, las cadenas de texto literales siempre deben encerrarse entre comillas simples: `' '`.",
                'Usa `AS nombre_columna` para darle un nombre representativo a la columna resultante.'
            ],
            execution_order_note='💡 Si cualquiera de los dos lados concatenados fuera `NULL`, el resultado total de `||` sería `NULL`.',
        ),
        objectives=[
            "1. Obtener los registros de la tabla de clientes.",
            "2. Combinar el nombre y el apellido en una sola columna con separación legible.",
            "3. Presentar la columna unificada junto con la dirección de correo electrónico."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES],
    ),

    "e0000000-0000-0000-0000-000000000020": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000020",
        module_id="a0000000-0000-0000-0000-000000000001",
        title="Catálogo de Ciudades Únicas (DISTINCT)",
        prompt="Logística necesita saber en qué ciudades tenemos clientes sin que los nombres se repitan. Obtén la lista de ciudades únicas (`ciudad`) de la tabla `clientes`.",
        initial_code="-- Obt\u00e9n valores \u00fanicos de ciudad\nSELECT ",
        solution_query="SELECT DISTINCT ciudad FROM clientes;",
        xp_reward=35,
        difficulty="Principiante",
        check_order=False,
        sort_order=4,
        hints=[
            "Para evitar que una ciudad aparezca varias veces, debes eliminar filas repetidas en el resultado.",
            "Coloca la palabra clave DISTINCT inmediatamente después de SELECT antes de nombrar la columna.",
            "SELECT DISTINCT ??? FROM clientes;"
        ],
        concept=ExerciseConcept(
            summary='`DISTINCT` filtra y elimina filas duplicadas, devolviendo únicamente valores únicos en el resultado.',
            syntax='SELECT DISTINCT columna\nFROM nombre_tabla;',
            key_points=[
                '`DISTINCT` se escribe inmediatamente después de la palabra clave `SELECT`.',
                'Si un valor se repite en cientos de registros, `DISTINCT` colapsa los duplicados en una única aparición.',
                'Se aplica sobre el conjunto de columnas proyectadas; si proyectas una columna, garantiza valores únicos de esa columna.'
            ],
            execution_order_note='💡 El motor primero reúne las filas y luego ejecuta una ordenación interna para descartar duplicados.',
        ),
        objectives=[
            "1. Consultar la ubicación de residencia de los clientes.",
            "2. Filtrar el listado para suprimir todas las ciudades repetidas.",
            "3. Presentar una lista de ubicaciones geográficas únicas."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES],
    ),

    "e0000000-0000-0000-0000-000000000002": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000002",
        module_id="a0000000-0000-0000-0000-000000000002",
        title="Productos Premium (> 500€)",
        prompt="El equipo de marketing prepara una campaña especial de productos exclusivos. Muestra el `nombre_producto`, el `precio` y el `stock` de aquellos productos cuyo precio sea mayor a 500€.",
        initial_code="-- Filtra los productos de alto valor\nSELECT ",
        solution_query="SELECT nombre_producto, precio, stock FROM productos WHERE precio > 500;",
        xp_reward=35,
        difficulty="Principiante",
        check_order=False,
        sort_order=5,
        hints=[
            "Debes proyectar tres columnas del catálogo y conservar solo los artículos cuyo precio supera el umbral.",
            "Añade la cláusula WHERE después de FROM y compara la columna numérica con el operador >.",
            "SELECT ???, ???, ??? FROM productos WHERE ??? > 500;"
        ],
        concept=ExerciseConcept(
            summary='`WHERE` es la cláusula de filtrado de SQL: instruye a la base de datos a retornar únicamente aquellas filas que cumplan una condición lógica.',
            syntax='SELECT columna_1, columna_2\nFROM nombre_tabla\nWHERE columna_numerica > valor_umbral;',
            key_points=[
                '`WHERE` se ubica después de `FROM nombre_tabla` y antes de cualquier ordenamiento.',
                'Operadores numéricos de teclado: mayor que `>`, menor que `<`, igual `=`, mayor o igual `>=` y menor o igual `<=`.',
                'Los operadores `>=` y `<=` se escriben combinando dos caracteres seguidos en el teclado sin espacios (`>` luego `=`, `<` luego `=`).'
            ],
            execution_order_note='💡 El motor filtra con `WHERE` antes de armar las columnas del `SELECT` para no procesar datos innecesarios.',
        ),
        objectives=[
            "1. Seleccionar la descripción, precio y existencias del inventario.",
            "2. Establecer una condición para aislar exclusivamente los artículos de alto valor.",
            "3. Asegurar que los productos que no alcancen el umbral queden excluidos."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    "e0000000-0000-0000-0000-000000000009": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000009",
        module_id="a0000000-0000-0000-0000-000000000002",
        title="Productos en Rango Medio (BETWEEN)",
        prompt="Encuentra los productos de gama media para una promoción especial. Muestra el `nombre_producto` y el `precio` de todos los artículos cuyo precio esté entre 100€ y 800€ (ambos inclusive).",
        initial_code="-- Filtra productos en el rango de 100 a 800\nSELECT ",
        solution_query="SELECT nombre_producto, precio FROM productos WHERE precio BETWEEN 100 AND 800;",
        xp_reward=35,
        difficulty="Principiante",
        check_order=False,
        sort_order=6,
        hints=[
            "Necesitas filtrar artículos que caigan dentro de un rango numérico incluyendo ambos extremos.",
            "Usa WHERE con el operador BETWEEN conectando el límite inferior y superior mediante AND.",
            "SELECT ???, ??? FROM productos WHERE ??? BETWEEN 100 AND 800;"
        ],
        concept=ExerciseConcept(
            summary='`BETWEEN` evalúa si un valor se encuentra dentro de un intervalo cerrado (entre un límite inferior y un límite superior).',
            syntax='SELECT columna_1, columna_2\nFROM nombre_tabla\nWHERE columna BETWEEN limite_min AND limite_max;',
            key_points=[
                '`BETWEEN min AND max` es inclusivo: incluye tanto el límite inferior como el superior.',
                'Escribir `col BETWEEN a AND b` equivale lógicamente a `col >= a AND col <= b`.',
                'Funciona de manera óptima tanto con números como con fechas y cadenas alfanuméricas.'
            ],
            execution_order_note='💡 El motor evalúa el rango directamente sobre los datos de la columna de forma optimizada.',
        ),
        objectives=[
            "1. Consultar el catálogo de artículos de gama media.",
            "2. Delimitar los resultados mediante un operador de rango continuo.",
            "3. Comprobar que los límites superior e inferior queden incluidos."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    "e0000000-0000-0000-0000-000000000021": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000021",
        module_id="a0000000-0000-0000-0000-000000000002",
        title="Búsqueda por Patrón de Correo (LIKE)",
        prompt="Marketing quiere enviar un aviso a los usuarios registrados con correos corporativos estándar `@email.com`. Muestra el `nombre`, `apellido` y `email` de aquellos clientes cuyo correo termine exactamente en `@email.com`.",
        initial_code="-- Filtra clientes con comod\u00edn LIKE\nSELECT ",
        solution_query="SELECT nombre, apellido, email FROM clientes WHERE email LIKE '%@email.com';",
        xp_reward=40,
        difficulty="Principiante",
        check_order=False,
        sort_order=7,
        hints=[
            "Debes buscar coincidencias parciales al final de la cadena de correo electrónico.",
            "Usa WHERE con LIKE y el comodín % al principio del patrón entre comillas simples.",
            "SELECT ???, ???, ??? FROM clientes WHERE ??? LIKE '%@email.com';"
        ],
        concept=ExerciseConcept(
            summary='`LIKE` busca coincidencias en cadenas de texto mediante caracteres comodín como `%` (cualquier secuencia de caracteres).',
            syntax="SELECT columna_1, columna_2\nFROM nombre_tabla\nWHERE columna_texto LIKE '%terminacion';",
            key_points=[
                'El comodín `%` representa cero, uno o múltiples caracteres arbitrarios.',
                "`'%texto'` busca textos que terminen exactamente en esa palabra; `'texto%'` busca que comiencen con ella; y `'%texto%'` busca que la contenga en cualquier parte.",
                "El patrón de búsqueda siempre debe encerrarse entre comillas simples: `'...%'`."
            ],
            execution_order_note='💡 `LIKE` distingue mayúsculas de minúsculas. Si necesitas ignorar mayúsculas en PostgreSQL se usa `ILIKE`.',
        ),
        objectives=[
            "1. Consultar los datos de contacto de los clientes registrados.",
            "2. Aplicar un filtro de patrón para identificar la terminación del correo corporativo.",
            "3. Verificar que solo aparezcan cuentas con el dominio especificado."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES],
    ),

    "e0000000-0000-0000-0000-000000000022": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000022",
        module_id="a0000000-0000-0000-0000-000000000002",
        title="Filtro de Ciudades Específicas (IN)",
        prompt="Operaciones lanzó envíos express para tres ciudades clave: Madrid, Barcelona y Valencia. Muestra el `cliente_id`, `nombre`, `apellido` y `ciudad` de los clientes que vivan en cualquiera de estas tres ciudades.",
        initial_code="-- Filtra mediante el operador IN\nSELECT ",
        solution_query="SELECT cliente_id, nombre, apellido, ciudad FROM clientes WHERE ciudad IN ('Madrid', 'Barcelona', 'Valencia');",
        xp_reward=40,
        difficulty="Principiante",
        check_order=False,
        sort_order=8,
        hints=[
            "En lugar de escribir varios OR seguidos, conviene comprobar pertenencia a una lista cerrada de valores.",
            "Emplea WHERE con el operador IN (...) encerrando cada ciudad entre comillas simples.",
            "SELECT ???, ???, ???, ??? FROM clientes WHERE ??? IN ('Madrid', 'Barcelona', 'Valencia');"
        ],
        concept=ExerciseConcept(
            summary='`IN` comprueba si el valor de una columna coincide con cualquiera de los elementos listados dentro de un conjunto cerrado.',
            syntax="SELECT columna_1, columna_2\nFROM nombre_tabla\nWHERE columna IN ('valor_1', 'valor_2', 'valor_3');",
            key_points=[
                'La lista de opciones válidas se delimita entre paréntesis `(...)` y cada elemento se separa por comas.',
                '`col IN (a, b)` es la alternativa limpia y recomendada para evitar múltiples `OR` encadenados (`col = a OR col = b`).',
                "Cada valor de texto dentro de la lista debe llevar sus propias comillas simples individuales: `'valor'`."
            ],
            execution_order_note='💡 `IN` suele ejecutarse de forma mucho más rápida que múltiples `OR` gracias a la búsqueda por tabla hash en el motor.',
        ),
        objectives=[
            "1. Consultar la lista de clientes y sus ciudades de residencia.",
            "2. Filtrar los usuarios pertenecientes al listado de centros urbanos clave.",
            "3. Resolver el filtro sin encadenar comparaciones individuales repetidas."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES],
    ),

    "e0000000-0000-0000-0000-000000000023": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000023",
        module_id="a0000000-0000-0000-0000-000000000002",
        title="Productos en Riesgo de Stock (OR)",
        prompt="El almacén necesita ubicar productos en situación crítica de inventario: artículos con muy poco stock (15 o menos unidades) o artículos con sobrestock (75 o más unidades). Muestra el `producto_id`, `nombre_producto` y `stock` que cumplan cualquiera de estas dos condiciones.",
        initial_code="-- Combina condiciones con OR\nSELECT ",
        solution_query="SELECT producto_id, nombre_producto, stock FROM productos WHERE stock <= 15 OR stock >= 75;",
        xp_reward=40,
        difficulty="Principiante",
        check_order=False,
        sort_order=9,
        hints=[
            "Un artículo cumple si se encuentra en cualquiera de los dos extremos de existencias (bajo o exceso).",
            "Combina las dos comparaciones (<= 15 y >= 75) en WHERE usando el operador lógico OR.",
            "SELECT ???, ???, ??? FROM productos WHERE ??? <= 15 OR ??? >= 75;"
        ],
        concept=ExerciseConcept(
            summary='El operador lógico `OR` permite incluir una fila si satisface al menos una de las condiciones especificadas (o ambas).',
            syntax='SELECT columna_1, columna_2\nFROM nombre_tabla\nWHERE condicion_1 OR condicion_2;',
            key_points=[
                '`cond1 OR cond2` devolverá la fila si la condición 1 es verdadera, si la condición 2 es verdadera, o si ambas lo son.',
                'Para operadores compuestos de teclado: menor o igual se escribe `<=` y mayor o igual se escribe `>=` (sin espacios entre los dos símbolos).',
                'Puedes combinar rangos extremos uniendo dos predicados con `OR` en la cláusula `WHERE`.'
            ],
            execution_order_note='💡 En lógica booleana de SQL, `AND` tiene mayor precedencia que `OR`; si mezclas ambos operadores, usa paréntesis `()`.',
        ),
        objectives=[
            "1. Consultar los artículos en los extremos de disponibilidad.",
            "2. Establecer una doble condición donde baste cumplir cualquiera de los dos extremos.",
            "3. Incluir productos en escasez crítica o con exceso de inventario."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    "e0000000-0000-0000-0000-000000000024": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000024",
        module_id="a0000000-0000-0000-0000-000000000002",
        title="Facturas de Alto Valor No Pagadas (AND + NOT)",
        prompt="Contabilidad necesita revisar facturas importantes pendientes de cobro. Muestra el `factura_id`, `monto_total` y `estado_factura` de aquellas facturas con un monto de 400€ o más y cuyo estado sea distinto de `'pagada'`.",
        initial_code="-- Combina AND con el operador de desigualdad\nSELECT ",
        solution_query="SELECT factura_id, monto_total, estado_factura FROM facturas WHERE monto_total >= 400 AND estado_factura <> 'pagada';",
        xp_reward=45,
        difficulty="Principiante",
        check_order=False,
        sort_order=10,
        hints=[
            "Deben cumplirse dos condiciones a la vez: un monto mínimo y un estado distinto a 'pagada'.",
            "Une en WHERE la comparación >= 400 con el operador de desigualdad <> (o !=) usando AND.",
            "SELECT ???, ???, ??? FROM facturas WHERE ??? >= 400 AND ??? <> 'pagada';"
        ],
        concept=ExerciseConcept(
            summary="`AND` exige el cumplimiento simultáneo de dos reglas. Para evaluar desigualdad ('distinto de'), SQL utiliza `<>` o `!=`.",
            syntax="SELECT columna_1, columna_2\nFROM nombre_tabla\nWHERE condicion_1 AND columna_estado <> 'valor_excluido';",
            key_points=[
                '`AND` requiere que ambas expresiones sean verdaderas para que el registro aparezca en el resultado.',
                'En SQL, la desigualdad se expresa con `<>` (estándar ISO) o con `!=` (signo de admiración `!` seguido de `=`). Ambos son reconocidos por PostgreSQL.',
                'Mayor o igual se escribe `>=` con los dos caracteres de teclado consecutivos (`>` y `=`).'
            ],
            execution_order_note='💡 PostgreSQL evalúa primero la condición que descarte más filas rápidamente para ahorrar trabajo.',
        ),
        objectives=[
            "1. Consultar la información contable de las facturas.",
            "2. Exigir simultáneamente un importe relevante y un estado pendiente de cobro.",
            "3. Excluir explícitamente los comprobantes que ya fueron liquidados."
        ],
        sample_tables=[SAMPLE_TABLE_FACTURAS],
    ),

    "e0000000-0000-0000-0000-000000000003": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000003",
        module_id="a0000000-0000-0000-0000-000000000003",
        title="Clientes Españoles Ordenados por Apellido",
        prompt="Organiza la lista de clientes que viven en España por orden alfabético. Muestra su `nombre`, `apellido` y `ciudad` de la tabla `clientes`, ordenando los resultados alfabéticamente por su `apellido` (de la A a la Z) y, en caso de empate, por `cliente_id` ascendente.",
        initial_code="-- Filtra y ordena los clientes\nSELECT ",
        solution_query="SELECT nombre, apellido, ciudad FROM clientes WHERE pais = 'Espa\u00f1a' ORDER BY apellido ASC, cliente_id ASC;",
        xp_reward=40,
        difficulty="Principiante",
        check_order=True,
        sort_order=12,
        hints=[
            "Primero filtra por el país solicitado y luego ordena las filas resultantes de forma alfabética con desempate único.",
            "Aplica WHERE pais = 'España' y añade ORDER BY apellido ASC, cliente_id ASC al final.",
            "SELECT ???, ???, ??? FROM clientes WHERE ??? = 'España' ORDER BY ??? ASC, cliente_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='`ORDER BY` controla la ordenación de las filas devueltas, permitiendo clasificar de forma ascendente (`ASC`) o descendente (`DESC`).',
            syntax='SELECT columna_1, columna_2\nFROM nombre_tabla\nWHERE condicion_filtro\nORDER BY columna_criterio [ASC | DESC];',
            key_points=[
                '`ORDER BY col ASC` ordena de menor a mayor (A-Z o numérico creciente); es el modo por defecto si se omite.',
                '`ORDER BY col DESC` ordena de mayor a menor (Z-A o numérico decreciente).',
                'La cláusula `ORDER BY` se escribe al final de la consulta (después de `FROM` y `WHERE`).'
            ],
            execution_order_note='💡 `ORDER BY` se ejecuta casi al final de todo el proceso de consulta, justo antes de enviar los datos al cliente.',
        ),
        objectives=[
            "1. Acotar el conjunto de clientes al país solicitado.",
            "2. Seleccionar los campos de identidad y residencia.",
            "3. Ordenar alfabéticamente el listado de la A a la Z por el apellido."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES],
    ),

    "e0000000-0000-0000-0000-000000000010": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000010",
        module_id="a0000000-0000-0000-0000-000000000003",
        title="Los 5 Productos con Menor Stock",
        prompt="El almacén necesita reponer con urgencia los artículos que están por agotarse. Muestra el `nombre_producto` y el `stock` de los 5 productos con menor cantidad disponible, ordenando por `stock` ascendente y desempatando por `producto_id` ascendente.",
        initial_code="-- Ordena y limita a los 5 productos con menos stock\nSELECT ",
        solution_query="SELECT nombre_producto, stock FROM productos ORDER BY stock ASC, producto_id ASC LIMIT 5;",
        xp_reward=40,
        difficulty="Principiante",
        check_order=True,
        sort_order=13,
        hints=[
            "Para hallar los valores más pequeños primero ordena de menor a mayor con desempate único y luego recorta el resultado.",
            "Usa ORDER BY stock ASC, producto_id ASC seguido de LIMIT 5.",
            "SELECT ???, ??? FROM productos ORDER BY ??? ASC, producto_id ASC LIMIT 5;"
        ],
        concept=ExerciseConcept(
            summary='`LIMIT` restringe la cantidad máxima de filas retornadas, permitiendo obtener los primeros `N` registros clasificados.',
            syntax='SELECT columna_1, columna_2\nFROM nombre_tabla\nORDER BY columna_criterio ASC\nLIMIT cantidad_filas;',
            key_points=[
                '`LIMIT N` corta el conjunto de datos y entrega únicamente las primeras `N` filas.',
                'El orden es determinante: primero se ordenan los datos con `ORDER BY` y luego `LIMIT` toma los primeros puestos del ranking.',
                'Si buscas los menores valores, ordena con `ASC`; si buscas los mayores, ordena con `DESC`.'
            ],
            execution_order_note='💡 Usar `LIMIT` evita transferir gigabytes de datos cuando solo te interesan las muestras principales.',
        ),
        objectives=[
            "1. Consultar los artículos de menor disponibilidad en almacén.",
            "2. Clasificar el inventario de menor a mayor existencia.",
            "3. Acotar el resultado para mostrar exactamente los 5 artículos más urgentes."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    "e0000000-0000-0000-0000-000000000025": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000025",
        module_id="a0000000-0000-0000-0000-000000000003",
        title="Ordenamiento Multi-Criterio",
        prompt="Organiza los productos por su categoría y luego por su valor comercial. Muestra `producto_id`, `categoria_id`, `nombre_producto` y `precio`, ordenándolos primero por categoría de menor a mayor (`categoria_id ASC`), y dentro de cada categoría, del más caro al más barato (`precio DESC`).",
        initial_code="-- Ordena por m\u00faltiples columnas\nSELECT ",
        solution_query="SELECT producto_id, categoria_id, nombre_producto, precio FROM productos ORDER BY categoria_id ASC, precio DESC;",
        xp_reward=45,
        difficulty="Principiante",
        check_order=True,
        sort_order=14,
        hints=[
            "Primero agrupa visualmente ordenando por categoría y luego desempata los precios de mayor a menor.",
            "Especifica dos criterios en ORDER BY separados por coma: primero ASC y el segundo DESC.",
            "SELECT ???, ???, ???, ??? FROM productos ORDER BY ??? ASC, ??? DESC;"
        ],
        concept=ExerciseConcept(
            summary='Puedes ordenar por múltiples columnas separándolas por coma en el `ORDER BY`, estableciendo prioridades de desempate.',
            syntax='SELECT columna_1, columna_2, columna_3\nFROM nombre_tabla\nORDER BY columna_prioritaria ASC, columna_desempate DESC;',
            key_points=[
                'El motor ordena primero por la columna inicial; si existen valores idénticos (empates), recurre a la segunda columna para desempatar.',
                'Cada columna en la lista puede tener su propia dirección independiente (`ASC` o `DESC`).',
                'Separa cada criterio de ordenación mediante una coma `,`.'
            ],
            execution_order_note='💡 Los índices compuestos en la base de datos aceleran drásticamente los ordenamientos multi-columna.',
        ),
        objectives=[
            "1. Consultar los artículos asociando su familia comercial y precio.",
            "2. Ordenar las categorías en sentido ascendente.",
            "3. Desempatar los artículos de una misma familia del más caro al más barato."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    "e0000000-0000-0000-0000-000000000026": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000026",
        module_id="a0000000-0000-0000-0000-000000000003",
        title="Paginación de Clientes (OFFSET)",
        prompt="Simula la paginación de un panel web que muestra 5 clientes por página. Obtén los clientes de la segunda página mostrando `cliente_id`, `nombre` y `email`, ordenados por `cliente_id ASC`, saltando los primeros 5 registros y mostrando los siguientes 5.",
        initial_code="-- Usa LIMIT y OFFSET para paginar\nSELECT ",
        solution_query="SELECT cliente_id, nombre, email FROM clientes ORDER BY cliente_id ASC LIMIT 5 OFFSET 5;",
        xp_reward=45,
        difficulty="Principiante",
        check_order=True,
        sort_order=15,
        hints=[
            "Para mostrar la segunda página de 5 elementos debes ordenar primero de forma estable, saltar 5 filas y tomar 5.",
            "Combina ORDER BY cliente_id ASC con LIMIT 5 y OFFSET 5 al final de la consulta.",
            "SELECT ???, ???, ??? FROM clientes ORDER BY ??? ASC LIMIT 5 OFFSET 5;"
        ],
        concept=ExerciseConcept(
            summary='`OFFSET` salta un número determinado de filas antes de empezar a devolver resultados, permitiendo implementar paginación junto a `LIMIT`.',
            syntax='SELECT columna_1, columna_2\nFROM nombre_tabla\nORDER BY columna_identificador ASC\nLIMIT tamano_pagina OFFSET filas_a_saltar;',
            key_points=[
                '`LIMIT` define el tamaño de la página (cuántas filas ver) y `OFFSET` define el salto (cuántas filas ignorar al inicio).',
                'Para una paginación determinista y reproducible, siempre se debe incluir un `ORDER BY` con una clave única.',
                'La fórmula clásica de salto es: `OFFSET (numero_pagina - 1) * tamano_pagina`.'
            ],
            execution_order_note='💡 Aunque `OFFSET` salte filas, el motor debe leerlas internamente; para millones de registros se recomienda paginación por cursor.',
        ),
        objectives=[
            "1. Establecer el orden de visualización de los clientes.",
            "2. Omitir el bloque de registros correspondiente a la primera página.",
            "3. Acotar el lote devuelto al tamaño de página requerido."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES],
    ),

    "e0000000-0000-0000-0000-000000000004": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000004",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Conteo de Productos por Categoría",
        prompt="¿Cuántos productos tenemos en cada categoría? Muestra el `categoria_id` y el número total de productos bajo el nombre `total_productos`, mostrando únicamente aquellas categorías que tengan más de 2 productos.",
        initial_code="-- Utiliza GROUP BY y HAVING\nSELECT ",
        solution_query="SELECT categoria_id, COUNT(*) AS total_productos FROM productos GROUP BY categoria_id HAVING COUNT(*) > 2;",
        xp_reward=45,
        difficulty="Principiante",
        check_order=False,
        sort_order=22,
        hints=[
            "Primero agrupa los productos por su categoría, cuenta cuántos hay en cada grupo y luego descarta los grupos pequeños.",
            "Usa GROUP BY sobre la categoría y HAVING COUNT(*) > 2 después de agrupar.",
            "SELECT ???, COUNT(*) AS total_productos FROM productos GROUP BY ??? HAVING COUNT(*) > 2;"
        ],
        concept=ExerciseConcept(
            summary='`GROUP BY` agrupa filas que comparten el mismo valor en una o más columnas, permitiendo calcular agregaciones como `COUNT(*)` por cada grupo.',
            syntax='SELECT columna_grupo,\n       COUNT(*) AS total_registros\nFROM nombre_tabla\nGROUP BY columna_grupo;',
            key_points=[
                '`GROUP BY columna` condensa todas las filas que tienen el mismo valor en una sola fila representativa.',
                'Toda columna en el `SELECT` que no esté dentro de una función de agregación (`COUNT`, `SUM`, etc.) debe estar presente en la cláusula `GROUP BY`.',
                '`COUNT(*)` contabiliza el número total de filas pertenecientes a cada grupo formado.'
            ],
            execution_order_note='💡 `GROUP BY` se ejecuta inmediatamente después de `WHERE` y antes de evaluar las funciones del `SELECT`.',
        ),
        objectives=[
            "1. Condensar los artículos agrupándolos por su familia comercial.",
            "2. Contar el volumen total de productos asociados a cada familia.",
            "3. Descartar los grupos que no superen el volumen mínimo establecido."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
    ),

    "e0000000-0000-0000-0000-000000000011": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000011",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Métricas Globales de Ventas",
        prompt="Genera un resumen ejecutivo de las ventas completadas. Calcula el número de pedidos bajo el nombre `total_pedidos`, la suma total de dinero bajo `ingresos_totales` y el promedio de compra redondeado a 2 decimales bajo `ticket_promedio`, tomando solo los pedidos con estado `'completado'`.",
        initial_code="-- Agrega las m\u00e9tricas globales para pedidos completados\nSELECT ",
        solution_query="SELECT COUNT(*) AS total_pedidos, SUM(total) AS ingresos_totales, ROUND(AVG(total), 2) AS ticket_promedio FROM pedidos WHERE estado_pedido = 'completado';",
        xp_reward=45,
        difficulty="Principiante",
        check_order=False,
        sort_order=16,
        hints=[
            "Solo debes tomar pedidos completados y calcular tres métricas globales en una única fila resumen (sin GROUP BY).",
            "Combina WHERE estado_pedido = 'completado' con las funciones COUNT(*), SUM(total) y ROUND(AVG(total), 2).",
            "SELECT COUNT(*) AS total_pedidos, SUM(???) AS ingresos_totales, ROUND(AVG(???), 2) AS ticket_promedio FROM pedidos WHERE ??? = 'completado';"
        ],
        concept=ExerciseConcept(
            summary='Las funciones de agregación (`COUNT`, `SUM`, `AVG`) condensan todo el conjunto de filas en una sola fila resumen de métricas clave.',
            syntax='SELECT COUNT(*) AS total_filas,\n       SUM(columna_monto) AS suma_total,\n       ROUND(AVG(columna_monto), 2) AS promedio\nFROM nombre_tabla\nWHERE condicion_filtro;',
            key_points=[
                '`COUNT(*)` cuenta el total de registros, `SUM(col)` acumula el total numérico y `AVG(col)` calcula la media aritmética.',
                'Al aplicar filtros con `WHERE`, las funciones de agregación operan únicamente sobre las filas que cumplan la condición.',
                '`ROUND(expresion, 2)` evita decimales flotantes interminables y garantiza precisión comercial.'
            ],
            execution_order_note='💡 Si no usas `GROUP BY`, las funciones de agregación reducen toda la tabla a una sola fila de resultados globales.',
        ),
        objectives=[
            "1. Filtrar las transacciones considerando únicamente las compras exitosas.",
            "2. Calcular simultáneamente el recuento, la suma total de ingresos y el promedio.",
            "3. Asegurar que los promedios monetarios tengan el formato decimal requerido."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000027": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000027",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Rango de Precios por Categoría (MAX/MIN)",
        prompt="Analiza la diferencia de precios en cada departamento. Muestra el `categoria_id`, el precio más bajo bajo el nombre `precio_minimo` y el precio más alto bajo `precio_maximo` para cada categoría de productos.",
        initial_code="-- Calcula precios extremos por categor\u00eda\nSELECT ",
        solution_query="SELECT categoria_id, MIN(precio) AS precio_minimo, MAX(precio) AS precio_maximo FROM productos GROUP BY categoria_id;",
        xp_reward=45,
        difficulty="Principiante",
        check_order=False,
        sort_order=17,
        hints=[
            "Agrupa el catálogo por categoría para calcular tanto el valor mínimo como el máximo dentro de cada grupo.",
            "Usa MIN(precio), MAX(precio) en el SELECT y agrupa con GROUP BY categoria_id.",
            "SELECT ???, MIN(???) AS precio_minimo, MAX(???) AS precio_maximo FROM productos GROUP BY ???;"
        ],
        concept=ExerciseConcept(
            summary='`MIN()` y `MAX()` obtienen el valor más bajo y el valor más alto de una columna dentro de cada grupo o en toda la tabla.',
            syntax='SELECT columna_grupo,\n       MIN(columna_valor) AS valor_minimo,\n       MAX(columna_valor) AS valor_maximo\nFROM nombre_tabla\nGROUP BY columna_grupo;',
            key_points=[
                '`MIN(col)` localiza el valor mínimo del grupo y `MAX(col)` el valor máximo.',
                '`GROUP BY columna_grupo` permite obtener estos extremos de forma segmentada para cada grupo independiente.',
                'Tanto `MIN` como `MAX` ignoran automáticamente valores nulos (`NULL`) en su cálculo.'
            ],
            execution_order_note='💡 En columnas indexadas, `MIN` y `MAX` son operaciones casi instantáneas (O(log N)).',
        ),
        objectives=[
            "1. Agrupar el catálogo por familia comercial.",
            "2. Detectar el artículo más económico de cada grupo.",
            "3. Detectar el artículo de mayor valor de cada grupo y nombrar las columnas."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    "e0000000-0000-0000-0000-000000000028": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000028",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Distribución de Clientes por País",
        prompt="¿De qué países son nuestros clientes? Muestra la columna `pais` y el número total de clientes en cada país bajo el nombre `total_clientes`, ordenando la lista de mayor a menor número de clientes y, en caso de empate, alfabéticamente por `pais`.",
        initial_code="-- Agrupa clientes por pa\u00eds\nSELECT ",
        solution_query="SELECT pais, COUNT(*) AS total_clientes FROM clientes GROUP BY pais ORDER BY total_clientes DESC, pais ASC;",
        xp_reward=45,
        difficulty="Principiante",
        check_order=True,
        sort_order=18,
        hints=[
            "Agrupa los clientes por país, cuenta los registros de cada grupo y ordena poniendo los más numerosos primero.",
            "Usa GROUP BY pais junto a COUNT(*) AS total_clientes y ORDER BY total_clientes DESC, pais ASC.",
            "SELECT ???, COUNT(*) AS total_clientes FROM clientes GROUP BY ??? ORDER BY total_clientes DESC, ??? ASC;"
        ],
        concept=ExerciseConcept(
            summary='Combinar `GROUP BY`, `COUNT(*)` y `ORDER BY` permite crear tablas de distribución de frecuencias ordenadas por volumen.',
            syntax='SELECT columna_segmento,\n       COUNT(*) AS total_filas\nFROM nombre_tabla\nGROUP BY columna_segmento\nORDER BY total_filas DESC;',
            key_points=[
                'El `GROUP BY` agrupa por el criterio demográfico o de categorización deseado.',
                'Para ver los grupos más numerosos arriba de todo, ordena por el alias de la función de conteo con `DESC`.',
                'El orden de ejecución del motor procesa primero `GROUP BY`, luego la proyección del `SELECT` y finalmente `ORDER BY`.'
            ],
            execution_order_note='💡 Puedes referenciar el alias de la columna agregada directamente en el `ORDER BY` final.',
        ),
        objectives=[
            "1. Agrupar la base de usuarios por su país de origen.",
            "2. Contar el volumen de clientes registrados en cada territorio.",
            "3. Presentar los países en un ranking ordenado de mayor a menor presencia."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES],
    ),

    "e0000000-0000-0000-0000-000000000029": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000029",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Stock Total por Proveedor",
        prompt="Calcula el volumen total de productos que nos suministra cada fabricante. Muestra el `proveedor_id` y la suma de unidades disponibles en stock bajo el nombre `stock_total` desde la tabla `productos`.",
        initial_code="-- Suma el stock por proveedor\nSELECT ",
        solution_query="SELECT proveedor_id, SUM(stock) AS stock_total FROM productos GROUP BY proveedor_id;",
        xp_reward=45,
        difficulty="Principiante",
        check_order=False,
        sort_order=19,
        hints=[
            "Debes sumar las unidades disponibles agrupando los productos por su identificador de proveedor.",
            "Usa SUM(stock) AS stock_total en el SELECT y agrupa al final con GROUP BY proveedor_id.",
            "SELECT ???, SUM(???) AS stock_total FROM productos GROUP BY ???;"
        ],
        concept=ExerciseConcept(
            summary='`SUM()` suma todos los valores de una columna numérica dentro de cada grupo formado por `GROUP BY`.',
            syntax='SELECT columna_identificador,\n       SUM(columna_cantidad) AS total_acumulado\nFROM nombre_tabla\nGROUP BY columna_identificador;',
            key_points=[
                '`SUM(col)` totaliza los valores cuantitativos de todas las filas agrupadas.',
                'Debes incluir en el `GROUP BY` la clave o columna que identifica al grupo.',
                'Si una fila contiene `NULL` en la columna sumada, `SUM` la ignora sin alterar el acumulado.'
            ],
            execution_order_note='💡 `SUM()` sobre columnas vacías o solo con nulos devuelve `NULL`, no 0. Para forzar cero se suele usar `COALESCE(SUM(col), 0)`.',
        ),
        objectives=[
            "1. Agrupar el inventario en función del fabricante o distribuidor.",
            "2. Acumular las unidades totales en almacén provistas por cada entidad.",
            "3. Asignar un alias descriptivo al total acumulado."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_PROVEEDORES],
    ),

    "e0000000-0000-0000-0000-000000000030": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000030",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Proveedores de Alto Volumen (HAVING SUM)",
        prompt="Identifica a nuestros proveedores más importantes en volumen. Muestra el `proveedor_id` y su stock total bajo el nombre `stock_total`, mostrando únicamente a aquellos proveedores cuyo stock total acumulado supere las 100 unidades.",
        initial_code="-- Filtra grupos con HAVING\nSELECT ",
        solution_query="SELECT proveedor_id, SUM(stock) AS stock_total FROM productos GROUP BY proveedor_id HAVING SUM(stock) > 100;",
        xp_reward=50,
        difficulty="Principiante",
        check_order=False,
        sort_order=23,
        hints=[
            "Primero agrupa y suma el stock por proveedor; después filtra los grupos ya agregados que superen las 100 unidades.",
            "Recuerda que las funciones agregadas como SUM(...) se filtran en HAVING, no en WHERE.",
            "SELECT ???, SUM(???) AS stock_total FROM productos GROUP BY ??? HAVING SUM(???) > 100;"
        ],
        concept=ExerciseConcept(
            summary='`HAVING` es el filtro de los grupos: se aplica sobre los resultados calculados por funciones de agregación, donde `WHERE` no tiene alcance.',
            syntax='SELECT columna_grupo,\n       SUM(columna_metrica) AS acumulado\nFROM nombre_tabla\nGROUP BY columna_grupo\nHAVING SUM(columna_metrica) > valor_corte;',
            key_points=[
                'Regla de oro: `WHERE` filtra filas individuales *antes* de agrupar; `HAVING` filtra grupos *después* de agrupar.',
                'En la cláusula `HAVING` se escriben directamente funciones agregadas como `SUM(...) > umbral` o `COUNT(...) >= N`.',
                'La cláusula `HAVING` siempre se posiciona inmediatamente después de `GROUP BY`.'
            ],
            execution_order_note='💡 Nunca coloques funciones de agregación en el `WHERE`; el motor lanzará error de sintaxis.',
        ),
        objectives=[
            "1. Calcular el inventario acumulado por cada fabricante.",
            "2. Aplicar un filtro posterior a la agregación para evaluar el volumen conjunto.",
            "3. Conservar únicamente los proveedores estratégicos de gran volumen."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    "e0000000-0000-0000-0000-000000000031": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000031",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Clientes con Compra Promedio Alta (HAVING AVG)",
        prompt="Encuentra a los clientes que hacen compras de alto valor promedio. Muestra el `cliente_id` y su importe promedio de compra redondeado a 2 decimales bajo el nombre `ticket_promedio`, mostrando solo a aquellos clientes cuyo promedio de compras supere los 500€.",
        initial_code="-- Filtra clientes por compra promedio\nSELECT ",
        solution_query="SELECT cliente_id, ROUND(AVG(total), 2) AS ticket_promedio FROM pedidos GROUP BY cliente_id HAVING AVG(total) > 500;",
        xp_reward=50,
        difficulty="Principiante",
        check_order=False,
        sort_order=24,
        hints=[
            "Calcula el promedio por cliente agrupando sus pedidos y quédate solo con quienes superen 500€ de media.",
            "Usa ROUND(AVG(total), 2) en SELECT, agrupa con GROUP BY cliente_id y filtra con HAVING AVG(total) > 500.",
            "SELECT ???, ROUND(AVG(???), 2) AS ticket_promedio FROM pedidos GROUP BY ??? HAVING AVG(???) > 500;"
        ],
        concept=ExerciseConcept(
            summary='`HAVING` con `AVG()` filtra aquellos grupos cuya media aritmética supera o no alcanza un determinado umbral de negocio.',
            syntax='SELECT columna_grupo,\n       ROUND(AVG(columna_monto), 2) AS promedio_grupo\nFROM nombre_tabla\nGROUP BY columna_grupo\nHAVING AVG(columna_monto) > umbral_promedio;',
            key_points=[
                '`HAVING AVG(columna) > umbral` descarta grupos cuyo promedio no cumpla con la regla mínima.',
                'Para operadores de teclado: mayor o igual se escribe `>=` y menor o igual se escribe `<=` (caracteres contiguos sin espacios).',
                '`AVG` solo puede aplicarse a tipos de datos numéricos (enteros, decimales, flotantes).'
            ],
            execution_order_note='💡 Puedes usar `ROUND()` en el `SELECT` para presentar la media limpia y mantener la comparación pura en el `HAVING`.',
        ),
        objectives=[
            "1. Calcular el gasto medio por transacción de cada comprador.",
            "2. Filtrar a los clientes cuyo promedio supere el umbral de alto poder adquisitivo.",
            "3. Asegurar el redondeo monetario adecuado en la columna final."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000032": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000032",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Resumen de Pedidos por Estado",
        prompt="Construye un resumen de pedidos por estado. Muestra el `estado_pedido`, la cantidad de pedidos bajo el nombre `total_pedidos` y la suma acumulada de dinero bajo `monto_acumulado`, agrupando por estado y ordenando del estado con mayor dinero al de menor dinero (desempatando por `estado_pedido` ascendente).",
        initial_code="-- Resumen consolidado por estado de pedido\nSELECT ",
        solution_query="SELECT estado_pedido, COUNT(*) AS total_pedidos, SUM(total) AS monto_acumulado FROM pedidos GROUP BY estado_pedido ORDER BY monto_acumulado DESC, estado_pedido ASC;",
        xp_reward=50,
        difficulty="Principiante",
        check_order=True,
        sort_order=21,
        hints=[
            "Agrupa todos los pedidos por estado para contar cuántos hay y sumar su importe en la misma consulta.",
            "Combina COUNT(*), SUM(total) y GROUP BY estado_pedido, ordenando por monto_acumulado DESC, estado_pedido ASC.",
            "SELECT ???, COUNT(*) AS total_pedidos, SUM(???) AS monto_acumulado FROM pedidos GROUP BY ??? ORDER BY monto_acumulado DESC, ??? ASC;"
        ],
        concept=ExerciseConcept(
            summary='Puedes calcular múltiples agregaciones simultáneas (`COUNT`, `SUM`, `AVG`) en un solo `GROUP BY` para construir resúmenes claros.',
            syntax='SELECT columna_estado,\n       COUNT(*) AS total_operaciones,\n       SUM(columna_importe) AS suma_acumulada\nFROM nombre_tabla\nGROUP BY columna_estado\nORDER BY suma_acumulada DESC, columna_estado ASC;',
            key_points=[
                'Un solo `GROUP BY` puede alimentar tantas métricas agregadas en el `SELECT` como requiera el análisis.',
                'Puedes ordenar la salida final por cualquiera de las métricas agregadas utilizando su alias o la función con `DESC`.',
                'Asegúrate de que la columna categórica no agregada esté presente en la cláusula `GROUP BY`.'
            ],
            execution_order_note='💡 Cada estado diferente formará una fila con sus totales correspondientes calculados en un solo pase de datos.',
        ),
        objectives=[
            "1. Agrupar el histórico de pedidos según su estado operativo.",
            "2. Contar el número de operaciones y calcular el dinero asociado a cada estado.",
            "3. Ordenar el tablero de mayor a menor recaudación económica."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000005": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000005",
        module_id="b0000000-0000-0000-0000-000000000005",
        title="Pedidos con Identidad del Cliente",
        prompt="Descubre qué cliente realizó cada pedido. Cruza las tablas `pedidos` y `clientes` mediante su identificador común y muestra el `pedido_id`, el `nombre` del cliente, su `apellido` y el `total` del pedido.",
        initial_code="-- Cruza clientes con sus respectivos pedidos\nSELECT ",
        solution_query="SELECT p.pedido_id, c.nombre, c.apellido, p.total FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id;",
        xp_reward=45,
        difficulty="Intermedio",
        check_order=False,
        sort_order=25,
        hints=[
            "Conecta ambas tablas mediante la clave que identifica al cliente en la tabla de pedidos y en el catálogo de clientes.",
            "Usa INNER JOIN combinando pedidos y clientes con ON sobre cliente_id, asignando alias cortos para evitar ambigüedad.",
            "SELECT p.pedido_id, c.nombre, c.apellido, p.total FROM pedidos p INNER JOIN clientes c ON p.??? = c.???;"
        ],
        concept=ExerciseConcept(
            summary='`INNER JOIN` combina filas de dos tablas basándose en una condición de coincidencia común (`ON`), preservando solo los registros que existen en ambas.',
            syntax='SELECT t1.columna_a, t2.columna_b\nFROM tabla_1 t1\nINNER JOIN tabla_2 t2 ON t1.clave_foranea = t2.clave_primaria;',
            key_points=[
                'La cláusula `ON` especifica la igualdad entre la clave primaria de una tabla y la clave foránea de la otra.',
                'Los alias cortos de tabla (como `t1` y `t2`) simplifican la consulta y evitan ambigüedad al referenciar columnas homónimas.',
                'Si un registro en una tabla no tiene correspondencia en la otra, `INNER JOIN` lo omite del resultado final.'
            ],
            execution_order_note='💡 Los optimizadores eligen algoritmos como Hash Join o Nested Loop según el tamaño de las tablas unidas.',
        ),
        objectives=[
            "1. Conectar las transacciones con el directorio de usuarios mediante su clave compartida.",
            "2. Extraer los datos personales del comprador y el total de la orden.",
            "3. Verificar que solo aparezcan órdenes con compradores válidos."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_CLIENTES],
    ),

    "e0000000-0000-0000-0000-000000000012": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000012",
        module_id="b0000000-0000-0000-0000-000000000005",
        title="Gasto Acumulado por Cliente",
        prompt="Calcula cuánto dinero ha gastado en total cada uno de nuestros clientes. Cruza `clientes` y `pedidos`, y muestra el `cliente_id`, `nombre`, `apellido` y la suma de todas sus compras bajo el nombre `total_gastado`, ordenando de mayor a menor gasto y, en caso de empate, por `cliente_id` ascendente.",
        initial_code="-- Cruza clientes y pedidos y agrupa para sumar el gasto\nSELECT ",
        solution_query="SELECT c.cliente_id, c.nombre, c.apellido, SUM(p.total) AS total_gastado FROM clientes c INNER JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_gastado DESC, c.cliente_id ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=29,
        hints=[
            "Une clientes y pedidos por su identificador común e incluye en GROUP BY todas las columnas no agregadas del SELECT.",
            "Calcula SUM(p.total) AS total_gastado después de agrupar por c.cliente_id, c.nombre y c.apellido, y ordena con desempate único.",
            "SELECT c.cliente_id, c.nombre, c.apellido, SUM(p.total) AS total_gastado FROM clientes c INNER JOIN pedidos p ON c.??? = p.??? GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_gastado DESC, c.cliente_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='Combinar `INNER JOIN` con `GROUP BY` permite cruzar datos de transacciones con entidades maestras y agregar totales por entidad.',
            syntax='SELECT t1.id, t1.nombre_entidad,\n       SUM(t2.columna_monto) AS total_agregado\nFROM tabla_entidades t1\nINNER JOIN tabla_transacciones t2 ON t1.id = t2.entidad_id\nGROUP BY t1.id, t1.nombre_entidad\nORDER BY total_agregado DESC;',
            key_points=[
                'Primero se establece la unión relacional mediante `INNER JOIN ... ON ...`.',
                'En el `GROUP BY` deben incluirse todas las columnas de la entidad maestra seleccionadas en el `SELECT` que no sean funciones agregadas.',
                '`ORDER BY total_agregado DESC` clasifica de mayor a menor según el acumulado obtenido.'
            ],
            execution_order_note='💡 El motor primero ejecuta el cruce `JOIN`, filtra filas si hay `WHERE`, agrupa con `GROUP BY` y finalmente calcula el `SUM`.',
        ),
        objectives=[
            "1. Cruzar las órdenes de compra con la información de los clientes.",
            "2. Acumular el monto total pagado por cada persona en su historial.",
            "3. Ordenar el resultado destacando a los clientes con mayor volumen de compras."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000033": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000033",
        module_id="b0000000-0000-0000-0000-000000000005",
        title="Catálogo con Nombre de Categoría",
        prompt="Haz que el catálogo de productos sea legible mostrando el nombre de la categoría en lugar de su código numérico. Cruza `productos` con `categorias` y muestra `producto_id`, `nombre_producto`, `nombre_categoria` y `precio`. Ordena primero por categoría (A-Z) y luego por producto (A-Z).",
        initial_code="-- Cruza productos con categorias\nSELECT ",
        solution_query="SELECT p.producto_id, p.nombre_producto, c.nombre_categoria, p.precio FROM productos p INNER JOIN categorias c ON p.categoria_id = c.categoria_id ORDER BY c.nombre_categoria ASC, p.nombre_producto ASC;",
        xp_reward=45,
        difficulty="Intermedio",
        check_order=True,
        sort_order=26,
        hints=[
            "Reemplaza el identificador numérico de categoría uniendo la tabla de productos con su tabla descriptiva de categorías.",
            "Usa INNER JOIN categorias c ON p.categoria_id = c.categoria_id y ordena primero por nombre_categoria ASC y luego por nombre_producto ASC.",
            "SELECT p.producto_id, p.nombre_producto, c.nombre_categoria, p.precio FROM productos p INNER JOIN categorias c ON p.??? = c.??? ORDER BY c.nombre_categoria ASC, p.nombre_producto ASC;"
        ],
        concept=ExerciseConcept(
            summary='`INNER JOIN` permite sustituir códigos numéricos de clasificación (IDs) por nombres descriptivos presentes en tablas maestras.',
            syntax='SELECT t1.id, t1.nombre_item, t2.nombre_clasificacion, t1.precio\nFROM tabla_items t1\nINNER JOIN tabla_clasificaciones t2 ON t1.clasificacion_id = t2.clasificacion_id\nORDER BY t2.nombre_clasificacion ASC, t1.nombre_item ASC;',
            key_points=[
                'La condición `ON t1.id_relacional = t2.id_relacional` enlaza el detalle con su catálogo descriptivo.',
                'Prefijar cada columna con su alias (`t1.columna`, `t2.columna`) evita errores de columna ambigua.',
                'Puedes ordenar jerárquicamente por la descripción de la categoría y luego por el nombre del artículo.'
            ],
            execution_order_note='💡 Los índices de clave foránea aceleran el proceso de emparejamiento entre las tablas maestras y de detalle.',
        ),
        objectives=[
            "1. Cruzar los artículos con la tabla maestra de familias comerciales.",
            "2. Sustituir el identificador numérico por el nombre legible de la categoría.",
            "3. Organizar alfabéticamente por categoría y luego por nombre de producto."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
    ),

    "e0000000-0000-0000-0000-000000000034": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000034",
        module_id="b0000000-0000-0000-0000-000000000005",
        title="Productos y sus Proveedores Directos",
        prompt="Compras necesita saber de qué país proviene cada producto. Cruza `productos` con `proveedores` y muestra `producto_id`, `nombre_producto`, `nombre_proveedor` y el país del proveedor bajo el nombre `pais_proveedor`. Ordena los productos alfabéticamente y, en caso de empate, por `producto_id` ascendente.",
        initial_code="-- Relaciona productos con sus proveedores\nSELECT ",
        solution_query="SELECT pr.producto_id, pr.nombre_producto, pv.nombre_proveedor, pv.pais AS pais_proveedor FROM productos pr INNER JOIN proveedores pv ON pr.proveedor_id = pv.proveedor_id ORDER BY pr.nombre_producto ASC, pr.producto_id ASC;",
        xp_reward=45,
        difficulty="Intermedio",
        check_order=True,
        sort_order=27,
        hints=[
            "Relaciona el catálogo de artículos con la tabla de fabricantes mediante la clave de proveedor.",
            "Usa INNER JOIN proveedores pv sobre proveedor_id, renombra el país con AS pais_proveedor y ordena con desempate único.",
            "SELECT pr.producto_id, pr.nombre_producto, pv.nombre_proveedor, pv.pais AS pais_proveedor FROM productos pr INNER JOIN proveedores pv ON pr.??? = pv.??? ORDER BY pr.nombre_producto ASC, pr.producto_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='Puedes aplicar filtros con `WHERE` sobre cualquiera de las tablas unidas en un `INNER JOIN` para refinar el resultado conjunto.',
            syntax="SELECT t1.columna_a, t2.columna_b\nFROM tabla_1 t1\nINNER JOIN tabla_2 t2 ON t1.fk_id = t2.pk_id\nWHERE t2.columna_filtro = 'criterio'\nORDER BY t1.columna_a ASC;",
            key_points=[
                'El `WHERE` se evalúa después de que el motor ha resuelto el `JOIN`, filtrando las filas ya combinadas.',
                'Puedes filtrar por columnas de la tabla principal, de la tabla unida o de ambas a la vez.',
                "Recuerda que los valores alfanuméricos en el `WHERE` van entre comillas simples: `'criterio'`."
            ],
            execution_order_note="💡 El optimizador suele aplicar 'pushdown de predicados', filtrando las tablas antes del JOIN para reducir filas.",
        ),
        objectives=[
            "1. Vincular los artículos del catálogo con su empresa suministradora.",
            "2. Extraer el nombre del proveedor y su país de origen con alias claros.",
            "3. Ordenar los artículos alfabéticamente."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_PROVEEDORES],
    ),

    "e0000000-0000-0000-0000-000000000035": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000035",
        module_id="b0000000-0000-0000-0000-000000000005",
        title="Facturación Detallada con Pagos Aprobados",
        prompt="Concilia las facturas emitidas con sus pagos aprobados. Cruza `facturas` con `pagos` mediante `factura_id`, mostrando `factura_id`, el monto de la factura (`monto_total`), el `metodo_pago` y la `fecha_pago`, tomando únicamente los registros con `estado_pago = 'aprobado'`. Ordena por `factura_id` ascendente.",
        initial_code="-- Concilia facturas con pagos aprobados\nSELECT ",
        solution_query="SELECT f.factura_id, f.monto_total, pg.metodo_pago, pg.fecha_pago FROM facturas f INNER JOIN pagos pg ON f.factura_id = pg.factura_id WHERE pg.estado_pago = 'aprobado' ORDER BY f.factura_id ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=28,
        hints=[
            "Une facturas y pagos por su identificador de factura, y filtra únicamente los pagos con estado aprobado.",
            "Combina INNER JOIN pagos pg ON f.factura_id = pg.factura_id con WHERE pg.estado_pago = 'aprobado' y ordena por factura_id ascendente.",
            "SELECT f.factura_id, f.monto_total, pg.metodo_pago, pg.fecha_pago FROM facturas f INNER JOIN pagos pg ON f.??? = pg.??? WHERE pg.estado_pago = 'aprobado' ORDER BY f.factura_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='Encadenar múltiples cláusulas `INNER JOIN` permite trazar relaciones a lo largo de tres o más tablas conectadas en cadena.',
            syntax="SELECT t1.id, t2.col_b, t3.col_c\nFROM tabla_1 t1\nINNER JOIN tabla_2 t2 ON t1.t2_id = t2.id\nINNER JOIN tabla_3 t3 ON t2.t3_id = t3.id\nWHERE t3.estado = 'aprobado';",
            key_points=[
                'Cada nuevo `INNER JOIN` requiere su propia cláusula `ON` que defina la llave de conexión con alguna tabla previa.',
                'La consulta se ejecuta como una cadena relacional: `T1` conecta con `T2`, y `T2` a su vez conecta con `T3`.',
                'Los filtros `WHERE` pueden evaluar condiciones sobre cualquiera de las tres tablas participantes.'
            ],
            execution_order_note='💡 El planificador de PostgreSQL reorganiza el orden de unión para procesar primero las tablas más pequeñas.',
        ),
        objectives=[
            "1. Cruzar los comprobantes fiscales con sus comprobantes de pago bancarios.",
            "2. Restringir la consulta a las transacciones con estado liquidado y aprobado.",
            "3. Proyectar los identificadores, fechas y montos en orden secuencial."
        ],
        sample_tables=[SAMPLE_TABLE_FACTURAS, SAMPLE_TABLE_PAGOS],
    ),

    "e0000000-0000-0000-0000-000000000006": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000006",
        module_id="b0000000-0000-0000-0000-000000000006",
        title="Clientes sin Compras Registradas (LEFT JOIN & IS NULL)",
        prompt="¿Qué clientes se han registrado pero nunca han realizado una compra? Haz un `LEFT JOIN` entre `clientes` y `pedidos` para mostrar el `cliente_id`, `nombre` y `apellido` de todos los usuarios sin pedidos registrados.",
        initial_code="-- Identifica clientes inactivos sin pedidos asociados\nSELECT ",
        solution_query="SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id WHERE p.pedido_id IS NULL;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=False,
        sort_order=30,
        hints=[
            "Para conservar a todos los clientes aunque no tengan pedidos, la tabla de clientes debe ir a la izquierda de un LEFT JOIN.",
            "Cuando un cliente no tiene pedidos asociados, las columnas de pedidos quedan como NULL; filtra con WHERE ... IS NULL.",
            "SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c LEFT JOIN pedidos p ON c.??? = p.??? WHERE p.pedido_id IS NULL;"
        ],
        concept=ExerciseConcept(
            summary='`LEFT JOIN` preserva todas las filas de la tabla izquierda; al combinarse con `WHERE clave_derecha IS NULL`, permite detectar registros sin coincidencia.',
            syntax='SELECT t1.id, t1.nombre\nFROM tabla_izquierda t1\nLEFT JOIN tabla_derecha t2 ON t1.id = t2.entidad_id\nWHERE t2.entidad_id IS NULL;',
            key_points=[
                '`LEFT JOIN` incluye todos los registros de la tabla izquierda, rellenando con `NULL` las columnas de la derecha si no hay coincidencia.',
                'El filtro `WHERE t2.clave IS NULL` descarta las filas que sí hicieron match, aislando exclusivamente a los registros sin actividad.',
                'En SQL la comprobación de nulos se escribe siempre `IS NULL` (nunca `= NULL`).'
            ],
            execution_order_note='💡 Esta técnica es más eficiente que subconsultas `NOT IN` cuando las tablas contienen valores nulos.',
        ),
        objectives=[
            "1. Relacionar clientes y compras conservando a la totalidad de usuarios registrados.",
            "2. Identificar a aquellos que no registran ningún pedido en la plataforma.",
            "3. Mostrar los datos de contacto de los usuarios inactivos."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000013": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000013",
        module_id="b0000000-0000-0000-0000-000000000006",
        title="Productos sin Movimiento de Venta",
        prompt="Detecta qué artículos del catálogo nunca han tenido ventas. Muestra el `producto_id` y `nombre_producto` de aquellos artículos que no tengan ninguna línea registrada en la tabla `detalle_pedidos`.",
        initial_code="-- Localiza productos sin ventas cruzando con detalle_pedidos\nSELECT ",
        solution_query="SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN detalle_pedidos dp ON p.producto_id = dp.producto_id WHERE dp.detalle_id IS NULL;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=False,
        sort_order=31,
        hints=[
            "Mantén todos los productos en el resultado usando LEFT JOIN hacia la tabla donde se registran las líneas de venta.",
            "Si un artículo nunca se vendió, la clave primaria de la tabla derecha valdrá NULL; evalúa esa ausencia en WHERE.",
            "SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN detalle_pedidos dp ON p.??? = dp.??? WHERE dp.detalle_id IS NULL;"
        ],
        concept=ExerciseConcept(
            summary='El patrón de exclusión por ausencia (`LEFT JOIN ... WHERE ... IS NULL`) es fundamental para detectar catálogo sin movimiento o elementos sin transacciones.',
            syntax='SELECT t1.id, t1.nombre\nFROM tabla_catalogo t1\nLEFT JOIN tabla_movimientos t2 ON t1.id = t2.item_id\nWHERE t2.item_id IS NULL\nORDER BY t1.id ASC;',
            key_points=[
                'La tabla del catálogo va a la izquierda (`FROM`) y la tabla transaccional va a la derecha (`LEFT JOIN`).',
                'Si un artículo jamás fue vendido o movido, sus columnas asociadas en la tabla derecha tendrán valor `NULL`.',
                'Utiliza `WHERE t2.clave_primaria IS NULL` para capturar únicamente los elementos sin registros en la tabla derecha.'
            ],
            execution_order_note='💡 Al elegir la columna a verificar en el `WHERE ... IS NULL`, opta siempre por la clave primaria de la tabla derecha.',
        ),
        objectives=[
            "1. Cruzar el catálogo con las líneas de compra conservando todos los artículos.",
            "2. Aislar los productos que no registran ningún movimiento de salida.",
            "3. Proyectar el identificador y nombre de los artículos desatendidos."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_DETALLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000036": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000036",
        module_id="b0000000-0000-0000-0000-000000000006",
        title="Facturas Pendientes de Cobro (LEFT JOIN)",
        prompt="Tesorería necesita una lista de facturas emitidas que todavía no tienen ningún pago registrado. Haz un `LEFT JOIN` entre `facturas` y `pagos` para obtener `factura_id`, `pedido_id`, `fecha_emision` y `monto_total` de aquellas facturas sin ningún abono. Ordena por `factura_id` ascendente.",
        initial_code="-- Identifica facturas sin pagos registrados\nSELECT ",
        solution_query="SELECT f.factura_id, f.pedido_id, f.fecha_emision, f.monto_total FROM facturas f LEFT JOIN pagos p ON f.factura_id = p.factura_id WHERE p.pago_id IS NULL ORDER BY f.factura_id ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=32,
        hints=[
            "Une todas las facturas emitidas con sus posibles abonos mediante LEFT JOIN para no perder las que no tienen cobro.",
            "Filtra en WHERE las facturas cuya clave de pago derecha sea IS NULL y ordena de forma ascendente por factura_id.",
            "SELECT f.factura_id, f.pedido_id, f.fecha_emision, f.monto_total FROM facturas f LEFT JOIN pagos p ON f.??? = p.??? WHERE p.pago_id IS NULL ORDER BY f.factura_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='Localiza documentos o comprobantes maestros que no registran ningún abono asociado en la tabla de cobros.',
            syntax='SELECT t1.documento_id, t1.monto\nFROM tabla_documentos t1\nLEFT JOIN tabla_abonos t2 ON t1.documento_id = t2.documento_id\nWHERE t2.abono_id IS NULL;',
            key_points=[
                'Conecta el encabezado con el detalle mediante `LEFT JOIN ... ON t1.id = t2.fk_id`.',
                'Aplica `IS NULL` sobre la clave primaria de la tabla derecha para identificar comprobantes sin abonos.',
                'El operador de desigualdad para exclusiones explícitas de estado es `<>` o `!=`.'
            ],
            execution_order_note='💡 PostgreSQL puede convertir internamente este patrón en una búsqueda hash de exclusión de alto rendimiento.',
        ),
        objectives=[
            "1. Relacionar las facturas emitidas con la tabla de cobros.",
            "2. Filtrar aquellos comprobantes que carecen de registro de abono.",
            "3. Presentar los datos de las facturas pendientes de cobro ordenadas por ID."
        ],
        sample_tables=[SAMPLE_TABLE_FACTURAS, SAMPLE_TABLE_PAGOS],
    ),

    "e0000000-0000-0000-0000-000000000037": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000037",
        module_id="b0000000-0000-0000-0000-000000000006",
        title="Productos Fuera del Almacén Central (LEFT JOIN Condicional)",
        prompt="El responsable del almacén central de Madrid (`almacen_id = 1`) quiere saber qué productos del catálogo NO disponen de existencias en ese almacén en particular. Conecta `productos` con `inventario` mediante un `LEFT JOIN` acotado al almacén 1 y muestra el `producto_id` y `nombre_producto` de los artículos ausentes en ese almacén, ordenados por `producto_id` ascendente.",
        initial_code="-- Detecta productos no inventariados en el almac\u00e9n 1\nSELECT ",
        solution_query="SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN inventario i ON p.producto_id = i.producto_id AND i.almacen_id = 1 WHERE i.almacen_id IS NULL ORDER BY p.producto_id ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=33,
        hints=[
            "Si filtras el almacén 1 en el WHERE perderás los productos sin inventario; coloca esa restricción dentro de la cláusula ON.",
            "En el ON del LEFT JOIN combina producto_id con i.almacen_id = 1, y después conserva los ausentes con WHERE i.almacen_id IS NULL.",
            "SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN inventario i ON p.??? = i.??? AND i.almacen_id = 1 WHERE i.almacen_id IS NULL ORDER BY p.producto_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='Puedes incorporar condiciones adicionales en la cláusula `ON` del `LEFT JOIN` antes de aplicar la exclusión de nulos en `WHERE`.',
            syntax='SELECT t1.id, t1.descripcion\nFROM tabla_items t1\nLEFT JOIN tabla_asignaciones t2\n  ON t1.id = t2.item_id AND t2.ubicacion_id = valor_especifico\nWHERE t2.item_id IS NULL;',
            key_points=[
                'Colocar una condición en el `ON` del `LEFT JOIN` restringe el cruce a esa condición antes de generar los nulos.',
                'El `WHERE ... IS NULL` posterior filtra a los elementos que no tuvieron coincidencia bajo esa regla específica.',
                'Es una técnica eficiente para auditar ausencias en ubicaciones o estados determinados.'
            ],
            execution_order_note='💡 Las condiciones en `ON` afectan a qué filas se emparejan; las condiciones en `WHERE` descartan filas después de la unión.',
        ),
        objectives=[
            "1. Vincular los productos con el inventario acotando la búsqueda a la instalación central.",
            "2. Aislar los artículos que no cuentan con existencias en dicha instalación.",
            "3. Proyectar el catálogo de productos ausentes en dicho centro."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_INVENTARIO],
    ),

    "e0000000-0000-0000-0000-000000000038": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000038",
        module_id="b0000000-0000-0000-0000-000000000006",
        title="Censo Completo de Pedidos por Cliente (Preservando Ceros)",
        prompt="Queremos una lista completa de todos los clientes y saber cuántos pedidos ha hecho cada uno, incluyendo con 0 a los que nunca han comprado. Muestra `cliente_id`, `nombre`, `apellido` y el total de compras bajo el nombre `total_pedidos` (usando `COUNT(p.pedido_id)`). Ordena por número de pedidos de mayor a menor y, en caso de empate, por `cliente_id` ascendente.",
        initial_code="-- Agrupa preservando clientes sin compras con COUNT(columna)\nSELECT ",
        solution_query="SELECT c.cliente_id, c.nombre, c.apellido, COUNT(p.pedido_id) AS total_pedidos FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_pedidos DESC, c.cliente_id ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=34,
        hints=[
            "Para que los clientes sin compras aparezcan con 0 en lugar de desaparecer, usa LEFT JOIN y evita COUNT(*).",
            "Cuenta explícitamente p.pedido_id con COUNT(p.pedido_id) AS total_pedidos y agrupa por las columnas del cliente.",
            "SELECT c.cliente_id, c.nombre, c.apellido, COUNT(p.pedido_id) AS total_pedidos FROM clientes c LEFT JOIN pedidos p ON c.??? = p.??? GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_pedidos DESC, c.cliente_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='`LEFT JOIN` con `COUNT(columna_derecha)` permite contabilizar ocurrencias preservando en 0 a las entidades sin actividad.',
            syntax='SELECT t1.id, t1.nombre,\n       COUNT(t2.transaccion_id) AS total_ocurrencias\nFROM tabla_maestra t1\nLEFT JOIN tabla_movimientos t2 ON t1.id = t2.entidad_id\nGROUP BY t1.id, t1.nombre\nORDER BY total_ocurrencias DESC;',
            key_points=[
                'Cuidado con `COUNT`: `COUNT(*)` contaría 1 para los registros con nulos; debes usar `COUNT(t2.id)` para que los nulos sumen 0.',
                '`LEFT JOIN` asegura que ninguna entidad de la tabla izquierda sea omitida, aunque tenga cero movimientos.',
                'Agrupa por los campos de la tabla maestra incluidos en el `SELECT`.'
            ],
            execution_order_note='💡 `COUNT(columna)` ignora nulos automáticamente, garantizando que entidades o registros sin eventos tengan conteo 0.',
        ),
        objectives=[
            "1. Conectar usuarios y pedidos garantizando que nadie quede fuera de la lista.",
            "2. Contabilizar los pedidos garantizando que los usuarios sin compras muestren 0.",
            "3. Ordenar el censo de mayor a menor número de compras y desempatar por ID."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000014": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000014",
        module_id="b0000000-0000-0000-0000-000000000007",
        title="Desglose Completo de Líneas de Pedido",
        prompt="Audita las compras mostrando toda la información conectada: pedido, cliente, producto y categoría. Conecta `pedidos`, `clientes`, `detalle_pedidos`, `productos` y `categorias`, y muestra `pedido_id`, el nombre del cliente como `cliente_nombre`, `nombre_producto`, `nombre_categoria`, `cantidad` y `precio_unitario`. Ordena por `pedido_id ASC` y `nombre_producto ASC`, limitando a los primeros 10 registros.",
        initial_code="-- Conecta en cascada pedidos, clientes, detalle, productos y categorias\nSELECT ",
        solution_query="SELECT p.pedido_id, c.nombre AS cliente_nombre, pr.nombre_producto, cat.nombre_categoria, dp.cantidad, dp.precio_unitario FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id INNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id INNER JOIN productos pr ON dp.producto_id = pr.producto_id INNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id ORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=36,
        hints=[
            "Traza el camino relacional paso a paso: desde el pedido hacia el cliente por un lado, y hacia sus líneas, productos y categorías por otro.",
            "Encadena los 4 INNER JOIN con alias cortos, renombra c.nombre AS cliente_nombre y termina con ORDER BY y LIMIT 10.",
            "SELECT p.pedido_id, c.nombre AS cliente_nombre, pr.nombre_producto, cat.nombre_categoria, dp.cantidad, dp.precio_unitario FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id INNER JOIN detalle_pedidos dp ON p.??? = dp.??? INNER JOIN productos pr ON dp.??? = pr.??? INNER JOIN categorias cat ON pr.??? = cat.??? ORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10;"
        ],
        concept=ExerciseConcept(
            summary='Las relaciones maestro-detalle complejas suelen requerir unir la cabecera, las líneas de detalle y los catálogos descriptivos.',
            syntax='SELECT c.id, d.linea_id, i.nombre, d.cantidad, d.precio_venta\nFROM cabecera c\nINNER JOIN detalle d ON c.id = d.cabecera_id\nINNER JOIN catalogo i ON d.item_id = i.id\nORDER BY c.id ASC, d.linea_id ASC;',
            key_points=[
                'La cabecera se une con las líneas de detalle (`cabecera_id`), y cada línea se une con su artículo (`item_id`).',
                'Los alias de una letra (`c`, `d`, `i`) mantienen la consulta legible y compacta.',
                'Puedes calcular valores de línea multiplicando columnas: `d.cantidad * d.precio_venta`.'
            ],
            execution_order_note='💡 Cada línea de pedido generará una fila en el resultado; un pedido con 3 artículos devolverá 3 filas.',
        ),
        objectives=[
            "1. Conectar en cadena las 5 entidades del circuito comercial.",
            "2. Extraer las dimensiones del comprador, artículo, categoría y transacción.",
            "3. Ordenar secuencialmente y acotar el lote a 10 líneas de muestra."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_DETALLE_PEDIDOS, SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
    ),

    "e0000000-0000-0000-0000-000000000039": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000039",
        module_id="b0000000-0000-0000-0000-000000000007",
        title="Historial de Ventas por Ciudad y Categoría",
        prompt="Descubre cuánto dinero se ha vendido en cada ciudad por cada tipo de producto. Conecta las tablas necesarias para calcular la suma de ventas (`SUM(dp.cantidad * dp.precio_unitario)`) bajo el nombre `monto_vendido`, agrupando por la `ciudad` del cliente y el `nombre_categoria`. Ordena alfabéticamente por ciudad y luego de mayor a menor venta.",
        initial_code="-- Conecta 5 tablas y calcula ventas por ciudad y categoria\nSELECT ",
        solution_query="SELECT c.ciudad, cat.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS monto_vendido FROM clientes c INNER JOIN pedidos p ON c.cliente_id = p.cliente_id INNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id INNER JOIN productos pr ON dp.producto_id = pr.producto_id INNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id GROUP BY c.ciudad, cat.nombre_categoria ORDER BY c.ciudad ASC, monto_vendido DESC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=37,
        hints=[
            "Necesitas recorrer la cadena completa desde clientes hasta categorías pasando por pedidos, detalle de pedidos y productos.",
            "Agrupa por c.ciudad y cat.nombre_categoria, suma cantidad * precio_unitario como monto_vendido y ordena por ciudad ASC y monto DESC.",
            "SELECT c.ciudad, cat.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS monto_vendido FROM clientes c INNER JOIN pedidos p ON c.cliente_id = p.cliente_id INNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id INNER JOIN productos pr ON dp.producto_id = pr.producto_id INNER JOIN categorias cat ON pr.??? = cat.??? GROUP BY c.ciudad, cat.nombre_categoria ORDER BY c.ciudad ASC, monto_vendido DESC;"
        ],
        concept=ExerciseConcept(
            summary='Unir múltiples tablas antes de agrupar permite construir cubos multidimensionales de agregación geográfica y comercial.',
            syntax='SELECT t_geo.ciudad, t_cat.categoria,\n       SUM(t_mov.monto) AS volumen_total\nFROM transacciones t_mov\nINNER JOIN entidades t_ent ON t_mov.entidad_id = t_ent.id\nINNER JOIN clasificaciones t_cat ON t_mov.clasificacion_id = t_cat.id\nGROUP BY t_geo.ciudad, t_cat.categoria\nORDER BY volumen_total DESC;',
            key_points=[
                'El `GROUP BY` multidimensional agrupa por cada combinación única de ciudad y categoría.',
                'Asegúrate de que todas las columnas no agregadas del `SELECT` figuren en el `GROUP BY`.',
                'El cruce previo con `INNER JOIN` conecta la transacción con la entidad geográfica y el catálogo.'
            ],
            execution_order_note='💡 Si tienes N ciudades y M categorías activas, el resultado tendrá un máximo de N * M filas agrupadas.',
        ),
        objectives=[
            "1. Cruzar clientes, compras y catálogo para enlazar territorio y producto.",
            "2. Calcular la recaudación multiplicando volumen por precio unitario.",
            "3. Agrupar por ciudad y familia comercial ordenando de mayor a menor venta."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_DETALLE_PEDIDOS, SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
    ),

    "e0000000-0000-0000-0000-000000000040": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000040",
        module_id="b0000000-0000-0000-0000-000000000007",
        title="Conciliación de Pedidos, Facturación y Pagos",
        prompt="Verifica el flujo completo de una compra: el pedido, su factura y su cobro. Conecta `pedidos` con `facturas` y `pagos`, mostrando `pedido_id`, `cliente_id`, el monto de la factura bajo el nombre `monto_factura`, el monto del pago bajo `monto_pago` y el `metodo_pago`. Ordena por `pedido_id` ascendente.",
        initial_code="-- Cruza pedidos con facturas y pagos\nSELECT ",
        solution_query="SELECT p.pedido_id, p.cliente_id, f.monto_total AS monto_factura, pg.monto AS monto_pago, pg.metodo_pago FROM pedidos p INNER JOIN facturas f ON p.pedido_id = f.pedido_id INNER JOIN pagos pg ON f.factura_id = pg.factura_id ORDER BY p.pedido_id ASC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=38,
        hints=[
            "Enlaza tres tablas en secuencia: la orden conecta con su factura y la factura conecta con su pago.",
            "Asigna los alias monto_factura a f.monto_total y monto_pago a pg.monto, y ordena por p.pedido_id ascendente.",
            "SELECT p.pedido_id, p.cliente_id, f.monto_total AS monto_factura, pg.monto AS monto_pago, pg.metodo_pago FROM pedidos p INNER JOIN facturas f ON p.??? = f.??? INNER JOIN pagos pg ON f.??? = pg.??? ORDER BY p.pedido_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='La conciliación transaccional conecta el ciclo de vida comercial completo: orden de compra, comprobante emitido y cobro acreditado.',
            syntax="SELECT p.id, c.numero_comprobante, ab.medio_abono, ab.monto\nFROM ordenes p\nINNER JOIN comprobantes c ON p.id = c.orden_id\nINNER JOIN abonos ab ON c.id = ab.comprobante_id\nWHERE ab.estado = 'aprobado';",
            key_points=[
                'Encadena cada relación con su llave natural: la orden vincula al comprobante, y el comprobante vincula al cobro.',
                'Filtra en el `WHERE` para restringir el análisis a transacciones con estado validado.',
                'La proyección debe incluir los identificadores necesarios de cada etapa para garantizar trazabilidad.'
            ],
            execution_order_note='💡 `INNER JOIN` descarta órdenes que no tengan comprobante emitido o comprobantes sin cobro registrado.',
        ),
        objectives=[
            "1. Enlazar los tres eslabones comerciales: pedido, comprobante fiscal y pago.",
            "2. Distinguir con alias transparentes el monto facturado frente al cobrado.",
            "3. Mostrar el método de pago y ordenar por número de orden."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS, SAMPLE_TABLE_FACTURAS, SAMPLE_TABLE_PAGOS],
    ),

    "e0000000-0000-0000-0000-000000000041": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000041",
        module_id="b0000000-0000-0000-0000-000000000007",
        title="Trazabilidad Física de Inventario por Almacén",
        prompt="Consulta la disponibilidad física de inventario por almacén. Conecta `productos`, `inventario` y `almacenes`, mostrando `nombre_producto`, `nombre_almacen`, la `ciudad` del almacén y la `cantidad_disponible`, filtrando únicamente aquellos registros con más de 10 unidades. Ordena por nombre de producto y luego por almacén.",
        initial_code="-- Conecta productos, inventario y almacenes\nSELECT ",
        solution_query="SELECT pr.nombre_producto, a.nombre_almacen, a.ciudad, i.cantidad_disponible FROM productos pr INNER JOIN inventario i ON pr.producto_id = i.producto_id INNER JOIN almacenes a ON i.almacen_id = a.almacen_id WHERE i.cantidad_disponible > 10 ORDER BY pr.nombre_producto ASC, a.nombre_almacen ASC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=39,
        hints=[
            "Conecta productos con almacenes usando la tabla puente de existencias físicas y aplica el filtro de mayor a 10 unidades.",
            "Filtra con WHERE i.cantidad_disponible > 10 y ordena alfabéticamente por nombre_producto ASC y luego nombre_almacen ASC.",
            "SELECT pr.nombre_producto, a.nombre_almacen, a.ciudad, i.cantidad_disponible FROM productos pr INNER JOIN inventario i ON pr.??? = i.??? INNER JOIN almacenes a ON i.??? = a.??? WHERE i.cantidad_disponible > 10 ORDER BY pr.nombre_producto ASC, a.nombre_almacen ASC;"
        ],
        concept=ExerciseConcept(
            summary='Conectar tablas de existencias físicas, artículos y centros logísticos permite rastrear la distribución geográfica del stock.',
            syntax='SELECT c.nombre_centro, a.nombre_item, ex.cantidad_stock\nFROM existencias ex\nINNER JOIN centros_logisticos c ON ex.centro_id = c.id\nINNER JOIN articulos a ON ex.articulo_id = a.id\nWHERE ex.cantidad_stock > 0\nORDER BY c.nombre_centro ASC, ex.cantidad_stock DESC;',
            key_points=[
                'La tabla puente de existencias conecta las entidades de centro logístico y de artículo.',
                'Operadores numéricos de teclado: mayor que `>`, menor que `<`, mayor o igual `>=` y menor o igual `<=`.',
                'El ordenamiento múltiple permite agrupar visualmente por instalación y jerarquizar por volumen de existencias.'
            ],
            execution_order_note='💡 Las claves foráneas compuestas garantizan que no existan registros duplicados para un mismo par artículo-centro.',
        ),
        objectives=[
            "1. Conectar el catálogo con las instalaciones a través de la tabla de existencias.",
            "2. Filtrar únicamente las ubicaciones con existencias superiores a 10 unidades.",
            "3. Presentar el producto, almacén, ciudad y stock ordenados con prolijidad."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_INVENTARIO, SAMPLE_TABLE_ALMACENES],
    ),

    "e0000000-0000-0000-0000-000000000042": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000042",
        module_id="b0000000-0000-0000-0000-000000000008",
        title="Directorio Operativo Unificado (UNION)",
        prompt="Crea una lista unificada de todas las ciudades donde tenemos presencia, indicando si la presencia es de clientes o de almacenes. Combina con `UNION` la ciudad y la etiqueta `'cliente'` como `tipo_entidad` de la tabla `clientes`, con la ciudad y la etiqueta `'almacen'` como `tipo_entidad` de la tabla `almacenes`. Ordena por ciudad y por tipo de entidad.",
        initial_code="-- Combina ciudades de clientes y almacenes con UNION\nSELECT ",
        solution_query="SELECT ciudad, 'cliente' AS tipo_entidad FROM clientes UNION SELECT ciudad, 'almacen' AS tipo_entidad FROM almacenes ORDER BY ciudad ASC, tipo_entidad ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=40,
        hints=[
            "Construye dos consultas SELECT independientes con la misma estructura de columnas y combínalas verticalmente con UNION.",
            "En cada SELECT incluye una etiqueta de texto literal con el alias tipo_entidad ('cliente' y 'almacen') y coloca un único ORDER BY al final.",
            "SELECT ciudad, 'cliente' AS tipo_entidad FROM clientes UNION SELECT ???, 'almacen' AS tipo_entidad FROM almacenes ORDER BY ciudad ASC, tipo_entidad ASC;"
        ],
        concept=ExerciseConcept(
            summary='`UNION` combina verticalmente los resultados de dos consultas `SELECT` independientes en una única lista de filas.',
            syntax="SELECT nombre, correo, 'Rol A' AS tipo_entidad FROM tabla_a\nUNION\nSELECT nombre, correo, 'Rol B' AS tipo_entidad FROM tabla_b\nORDER BY nombre ASC;",
            key_points=[
                'Ambas consultas deben tener exactamente la misma cantidad de columnas y en el mismo orden de tipos de datos.',
                '`UNION` elimina duplicados automáticamente; si deseas conservar duplicados, utiliza `UNION ALL`.',
                'La cláusula `ORDER BY` solo se escribe una vez al final de toda la sentencia compuesta.'
            ],
            execution_order_note='💡 `UNION` ejecuta un sort interno para deduplicar filas; `UNION ALL` es más rápido porque concatena directamente.',
        ),
        objectives=[
            "1. Obtener la presencia geográfica tanto de clientes como de instalaciones.",
            "2. Unificar verticalmente ambos listados en una sola colección consolidada.",
            "3. Eliminar duplicidades y ordenar alfabéticamente por ciudad y tipo."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_ALMACENES],
    ),

    "e0000000-0000-0000-0000-000000000043": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000043",
        module_id="b0000000-0000-0000-0000-000000000008",
        title="Ciudades sin Presencia de Almacenes (EXCEPT)",
        prompt="Encuentra ciudades donde tengamos clientes pero todavía NO tengamos ningún almacén logístico. Usa el operador de diferencia `EXCEPT` para restar a las ciudades de `clientes` las ciudades de `almacenes`, ordenando la lista alfabéticamente.",
        initial_code="-- Diferencia de conjuntos con EXCEPT\nSELECT ",
        solution_query="SELECT ciudad FROM clientes EXCEPT SELECT ciudad FROM almacenes ORDER BY ciudad ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=42,
        hints=[
            "Para restar un conjunto de resultados de otro sin usar uniones, coloca el operador EXCEPT entre dos consultas SELECT equivalentes.",
            "Pon primero las ciudades de clientes, luego EXCEPT, luego las ciudades de almacenes y ordena el resultado alfabéticamente.",
            "SELECT ciudad FROM clientes EXCEPT SELECT ??? FROM almacenes ORDER BY ciudad ASC;"
        ],
        concept=ExerciseConcept(
            summary='`EXCEPT` (o `MINUS`) devuelve los registros de la primera consulta que no existen en el resultado de la segunda consulta.',
            syntax='SELECT columna_a FROM tabla_origen\nEXCEPT\nSELECT columna_b FROM tabla_exclusion\nORDER BY columna_a ASC;',
            key_points=[
                'Resta el segundo conjunto al primero, eliminando cualquier valor presente en la segunda consulta.',
                'Ambas consultas deben proyectar el mismo número de columnas y de tipos compatibles.',
                'Es una alternativa limpia y matemática a las exclusiones basadas en `NOT IN` o `IS NULL`.'
            ],
            execution_order_note='💡 `EXCEPT` elimina duplicados en el conjunto resultante por definición del estándar relacional.',
        ),
        objectives=[
            "1. Obtener el conjunto de ciudades residenciales de los clientes.",
            "2. Restar las ciudades que ya disponen de almacén logístico propio.",
            "3. Generar la lista de territorios con clientes desprovistos de centro logístico."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_ALMACENES],
    ),

    "e0000000-0000-0000-0000-000000000044": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000044",
        module_id="b0000000-0000-0000-0000-000000000008",
        title="Matriz de Cobertura Almacén-Categoría (CROSS JOIN)",
        prompt="Genera todas las combinaciones posibles entre cada almacén y cada categoría de productos. Usa un `CROSS JOIN` entre `almacenes` y `categorias`, mostrando `nombre_almacen` y `nombre_categoria`, ordenando por almacén y por categoría.",
        initial_code="-- Genera el producto cartesiano con CROSS JOIN\nSELECT ",
        solution_query="SELECT a.nombre_almacen, c.nombre_categoria FROM almacenes a CROSS JOIN categorias c ORDER BY a.nombre_almacen ASC, c.nombre_categoria ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=43,
        hints=[
            "Para obtener todas las combinaciones posibles entre dos catálogos independientes, CROSS JOIN no lleva condición ON.",
            "Conecta almacenes y categorias mediante CROSS JOIN y ordena por nombre_almacen ASC y nombre_categoria ASC.",
            "SELECT a.nombre_almacen, c.nombre_categoria FROM almacenes a CROSS JOIN categorias c ORDER BY ??? ASC, ??? ASC;"
        ],
        concept=ExerciseConcept(
            summary='`CROSS JOIN` calcula el producto cartesiano: combina cada fila de la primera tabla con cada fila de la segunda tabla.',
            syntax='SELECT t1.nombre_a, t2.nombre_b\nFROM tabla_1 t1\nCROSS JOIN tabla_2 t2\nORDER BY t1.nombre_a ASC, t2.nombre_b ASC;',
            key_points=[
                'No utiliza cláusula `ON`: el resultado tendrá `M * N` filas (filas de tabla 1 multiplicadas por filas de tabla 2).',
                'Es la herramienta clásica para generar matrices completas de cobertura, combinaciones o calendarios base.',
                'Debe usarse con cautela sobre tablas grandes para evitar explosión volumétrica de filas.'
            ],
            execution_order_note='💡 No requiere índices al no haber condición de emparejamiento; simplemente genera todas las combinaciones posibles.',
        ),
        objectives=[
            "1. Cruzar todas las instalaciones logísticas contra todas las familias comerciales.",
            "2. Generar la matriz completa de combinaciones posibles sin condiciones de enlace.",
            "3. Presentar la cuadrícula de cobertura ordenada por almacén y familia."
        ],
        sample_tables=[SAMPLE_TABLE_ALMACENES, SAMPLE_TABLE_CATEGORIAS],
    ),

    "e0000000-0000-0000-0000-000000000045": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000045",
        module_id="b0000000-0000-0000-0000-000000000008",
        title="Pares de Productos de la Misma Categoría (SELF JOIN)",
        prompt="Genera sugerencias de productos emparejados dentro de la misma categoría. Cruza la tabla `productos` consigo misma (`p1` y `p2`) para emparejar artículos con la misma `categoria_id`, asegurando que `p1.producto_id < p2.producto_id` para no emparejar un producto consigo mismo ni repetir la pareja al revés. Muestra `categoria_id`, los nombres como `producto_a` y `producto_b`, y los precios como `precio_a` y `precio_b`. Ordena por categoría y nombres.",
        initial_code="-- Auto-cruce de productos con condici\u00f3n de desigualdad\nSELECT ",
        solution_query="SELECT p1.categoria_id, p1.nombre_producto AS producto_a, p2.nombre_producto AS producto_b, p1.precio AS precio_a, p2.precio AS precio_b FROM productos p1 INNER JOIN productos p2 ON p1.categoria_id = p2.categoria_id AND p1.producto_id < p2.producto_id ORDER BY p1.categoria_id ASC, producto_a ASC, producto_b ASC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=44,
        hints=[
            "Une la tabla de productos consigo misma usando dos alias distintos (p1 y p2) para comparar parejas de la misma categoría.",
            "Además de igualar categoria_id, agrega p1.producto_id < p2.producto_id en el ON para evitar pares repetidos o consigo mismo.",
            "SELECT p1.categoria_id, p1.nombre_producto AS producto_a, p2.nombre_producto AS producto_b, p1.precio AS precio_a, p2.precio AS precio_b FROM productos p1 INNER JOIN productos p2 ON p1.categoria_id = p2.categoria_id AND p1.??? < p2.??? ORDER BY p1.categoria_id ASC, producto_a ASC, producto_b ASC;"
        ],
        concept=ExerciseConcept(
            summary='Un `SELF JOIN` une una tabla consigo misma usando alias diferenciados, permitiendo comparar o emparejar filas del mismo conjunto.',
            syntax='SELECT a.nombre AS item_1, b.nombre AS item_2, a.clasificacion_id\nFROM tabla a\nINNER JOIN tabla b\n  ON a.clasificacion_id = b.clasificacion_id AND a.id < b.id\nORDER BY a.id ASC, b.id ASC;',
            key_points=[
                'Es obligatorio asignar alias distintos (ej. `a` y `b`) a cada instancia de la misma tabla.',
                'La condición `a.id < b.id` es un patrón clave para evitar que un elemento se empareje consigo mismo (`a.id = b.id`) y descartar pares duplicados invertidos.',
                'La igualdad en la clave de clasificación (`a.cat_id = b.cat_id`) garantiza que pertenezcan al mismo grupo.'
            ],
            execution_order_note='💡 `a.id < b.id` reduce el espacio de búsqueda a la mitad de combinaciones respecto a `a.id <> b.id`.',
        ),
        objectives=[
            "1. Cruzar la tabla de artículos consigo misma para comparar productos hermanos.",
            "2. Emparejar artículos pertenecientes a la misma familia comercial.",
            "3. Evitar emparejamientos con el mismo producto y suprimir duplicados simétricos."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    "e0000000-0000-0000-0000-000000000015": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000015",
        module_id="c0000000-0000-0000-0000-000000000009",
        title="Productos sobre el Promedio de Precio",
        prompt="¿Qué productos se venden por encima del precio promedio de toda la tienda? Muestra el `nombre_producto` y su `precio` para aquellos artículos cuyo precio sea mayor al promedio general de precios de la tabla `productos`. Ordena de mayor a menor precio y, en caso de empate, alfabéticamente por `nombre_producto`.",
        initial_code="-- Usa una subconsulta para comparar con el promedio global\nSELECT ",
        solution_query="SELECT nombre_producto, precio FROM productos WHERE precio > (SELECT AVG(precio) FROM productos) ORDER BY precio DESC, nombre_producto ASC;",
        xp_reward=55,
        difficulty="Avanzado",
        check_order=True,
        sort_order=45,
        hints=[
            "Calcula primero el promedio global de precios dentro de una subconsulta entre paréntesis en la cláusula WHERE.",
            "Compara precio > (SELECT AVG(precio) FROM productos) y ordena del más caro al más barato desempatando por nombre_producto.",
            "SELECT nombre_producto, precio FROM productos WHERE precio > (SELECT AVG(???) FROM productos) ORDER BY precio DESC, nombre_producto ASC;"
        ],
        concept=ExerciseConcept(
            summary='Una subconsulta escalar retorna un único valor (1 fila y 1 columna) que puede usarse como comparador dinámico en el `WHERE`.',
            syntax='SELECT columna_1, columna_precio\nFROM nombre_tabla\nWHERE columna_precio > (SELECT AVG(columna_precio) FROM nombre_tabla)\nORDER BY columna_precio DESC;',
            key_points=[
                'La subconsulta se encierra obligatoriamente entre paréntesis `(...)`.',
                'Al retornar un único valor escalar, puedes compararlo con operadores estándar como `>`, `<`, `=`, `>=` o `<=`.',
                'Se evalúa primero la subconsulta interna y su valor resultante se inyecta como filtro en la consulta externa.'
            ],
            execution_order_note='💡 El motor calcula la subconsulta una sola vez al inicio y reutiliza la constante para evaluar cada fila de la tabla externa.',
        ),
        objectives=[
            "1. Calcular dinámicamente el precio de referencia promedio del catálogo completo.",
            "2. Comparar el precio de cada artículo contra dicho valor medio en el filtro.",
            "3. Proyectar los artículos de precio superior ordenados del más caro al más barato."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    "e0000000-0000-0000-0000-000000000046": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000046",
        module_id="c0000000-0000-0000-0000-000000000009",
        title="Clientes con Pedidos de Alto Monto (Subconsulta con IN)",
        prompt="Identifica a nuestros clientes VIP: aquellos que han hecho al menos un pedido importante (de 1000€ o más). Consulta la tabla `clientes` y muestra `cliente_id`, `nombre`, `apellido` y `email`, filtrando con una subconsulta usando el operador `IN` sobre la tabla `pedidos`. Ordena por `cliente_id` ascendente.",
        initial_code="-- Filtra clientes con una subconsulta en IN\nSELECT ",
        solution_query="SELECT cliente_id, nombre, apellido, email FROM clientes WHERE cliente_id IN (SELECT cliente_id FROM pedidos WHERE total >= 1000) ORDER BY cliente_id ASC;",
        xp_reward=55,
        difficulty="Avanzado",
        check_order=True,
        sort_order=46,
        hints=[
            "Genera en una subconsulta la lista de identificadores de clientes que tienen al menos un pedido de 1000€ o más.",
            "Usa WHERE cliente_id IN (...) sobre la subconsulta de pedidos filtrada por total >= 1000 y ordena por cliente_id ascendente.",
            "SELECT cliente_id, nombre, apellido, email FROM clientes WHERE cliente_id IN (SELECT ??? FROM pedidos WHERE total >= 1000) ORDER BY cliente_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='Una subconsulta en la cláusula `IN` retorna una lista dinámica de IDs sobre la cual la consulta principal aplica el filtrado.',
            syntax='SELECT id, nombre, email\nFROM tabla_maestra\nWHERE id IN (\n    SELECT clave_foranea\n    FROM tabla_transaccional\n    WHERE monto > umbral_valor\n);',
            key_points=[
                'La subconsulta interna debe proyectar exactamente una sola columna, coincidente con la columna evaluada en el `IN`.',
                'Filtra en la consulta interna para generar únicamente el subconjunto de IDs de interés.',
                'Es una alternativa declarativa a los joins cuando no necesitas proyectar columnas de la tabla transaccional.'
            ],
            execution_order_note='💡 PostgreSQL optimiza consultas `IN (SELECT ...)` convirtiéndolas internamente en un Semi-Join indexado.',
        ),
        objectives=[
            "1. Obtener el conjunto de compradores con compras de gran volumen mediante una consulta interna.",
            "2. Utilizar dicho conjunto como criterio de pertenencia para filtrar la tabla de clientes.",
            "3. Proyectar los datos de contacto de los clientes clasificados en orden."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000047": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000047",
        module_id="c0000000-0000-0000-0000-000000000009",
        title="Comprobación de Existencia Eficiente (EXISTS)",
        prompt="Premia a los clientes activos que tengan al menos una compra completada. Muestra el `cliente_id`, `nombre` y `apellido` de aquellos clientes para los que exista al menos un pedido con `estado_pedido = 'completado'`, usando una subconsulta con `EXISTS`. Ordena por `cliente_id` ascendente.",
        initial_code="-- Subconsulta correlacionada con EXISTS\nSELECT ",
        solution_query="SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c WHERE EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.cliente_id AND p.estado_pedido = 'completado') ORDER BY c.cliente_id ASC;",
        xp_reward=55,
        difficulty="Avanzado",
        check_order=True,
        sort_order=47,
        hints=[
            "Para verificar si existe al menos un pedido completado por cada cliente sin duplicar filas, usa una subconsulta correlacionada con EXISTS.",
            "Dentro de EXISTS (SELECT 1 FROM pedidos p ...), conecta p.cliente_id = c.cliente_id junto con estado_pedido = 'completado'.",
            "SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c WHERE EXISTS (SELECT 1 FROM pedidos p WHERE p.??? = c.??? AND p.estado_pedido = 'completado') ORDER BY c.cliente_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='`EXISTS` comprueba si una subconsulta correlacionada devuelve al menos una fila; en cuanto encuentra una coincidencia, detiene la búsqueda.',
            syntax="SELECT t1.id, t1.nombre\nFROM tabla_a t1\nWHERE EXISTS (\n    SELECT 1\n    FROM tabla_b t2\n    WHERE t2.a_id = t1.id AND t2.condicion = 'valor'\n);",
            key_points=[
                'Dentro del `SELECT` de `EXISTS` se acostumbra colocar `SELECT 1`, ya que al motor solo le interesa la existencia de filas, no sus valores.',
                'La subconsulta está correlacionada: hace referencia a la clave de la fila actual de la consulta externa (`t2.a_id = t1.id`).',
                '`NOT EXISTS` realiza la operación inversa, comprobando la no existencia de registros subordinados.'
            ],
            execution_order_note='💡 `EXISTS` se detiene tan pronto como encuentra la primera fila coincidente, siendo muy eficiente.',
        ),
        objectives=[
            "1. Evaluar de forma conectada si existe al menos una compra confirmada por cliente.",
            "2. Detener la búsqueda en cuanto se encuentre la primera coincidencia por usuario.",
            "3. Listar a los clientes activos ordenados secuencialmente."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000016": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000016",
        module_id="c0000000-0000-0000-0000-000000000010",
        title="Segmentación de Pedidos por Monto",
        prompt="Clasifica los pedidos según su valor para organizar la entrega. Muestra el `pedido_id`, el `total` y una nueva columna llamada `segmento` que diga: si el total es de 1000€ o más asigna `'Alto Valor'`, si es de 300€ o más asigna `'Medio Valor'`, y para el resto `'Bajo Valor'`. Ordena de mayor a menor total y, en caso de empate, por `pedido_id` ascendente.",
        initial_code="-- Clasifica los pedidos en tres segmentos seg\u00fan su monto\nSELECT ",
        solution_query="SELECT pedido_id, total, CASE WHEN total >= 1000 THEN 'Alto Valor' WHEN total >= 300 THEN 'Medio Valor' ELSE 'Bajo Valor' END AS segmento FROM pedidos ORDER BY total DESC, pedido_id ASC;",
        xp_reward=55,
        difficulty="Avanzado",
        check_order=True,
        sort_order=49,
        hints=[
            "Evalúa los rangos de mayor a menor usando una expresión condicional CASE WHEN ... THEN ... ELSE ... END.",
            "Recuerda poner primero el umbral más alto (>= 1000), luego el intermedio (>= 300) y cerrar con ELSE 'Bajo Valor' END AS segmento.",
            "SELECT pedido_id, total, CASE WHEN total >= 1000 THEN 'Alto Valor' WHEN total >= 300 THEN 'Medio Valor' ELSE 'Bajo Valor' END AS segmento FROM pedidos ORDER BY total DESC, ??? ASC;"
        ],
        concept=ExerciseConcept(
            summary='La estructura `CASE WHEN ... THEN ... ELSE ... END` implementa lógica condicional (if-else) para transformar o clasificar valores.',
            syntax="SELECT columna_id, columna_monto,\n       CASE\n         WHEN columna_monto >= lim_alto THEN 'Segmento A'\n         WHEN columna_monto >= lim_medio THEN 'Segmento B'\n         ELSE 'Segmento Base'\n       END AS nivel_clasificacion\nFROM nombre_tabla;",
            key_points=[
                'Se evalúa secuencialmente de arriba hacia abajo; la primera cláusula `WHEN` que resulte verdadera asigna el valor y sale del `CASE`.',
                'El operador mayor o igual se escribe `>=` en el teclado con los símbolos `>` e `=` consecutivos.',
                'La estructura siempre se abre con `CASE` y se cierra con `END` (generalmente acompañada de un alias con `AS`).'
            ],
            execution_order_note='💡 Si ninguna regla `WHEN` coincide y no existe cláusula `ELSE`, el resultado asignado será `NULL`.',
        ),
        objectives=[
            "1. Evaluar las reglas de cuantía económica para cada orden individual.",
            "2. Asignar la etiqueta correspondiente según los umbrales de valor comercial.",
            "3. Bautizar la nueva dimensión calculada y ordenar por importe descendente."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000018": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000018",
        module_id="c0000000-0000-0000-0000-000000000012",
        title="Ranking Relativo por Categoría (DENSE_RANK)",
        prompt="Clasifica los productos dentro de cada categoría del más caro al más barato. Muestra `categoria_id`, `nombre_producto`, `precio` y una columna con el puesto que ocupa llamada `ranking_categoria` usando `DENSE_RANK()`, dividiendo por categoría y ordenando de mayor a menor precio. Ordena por `categoria_id ASC`, `ranking_categoria ASC` y `nombre_producto ASC`.",
        initial_code="-- Usa DENSE_RANK() particionado por categoria_id\nSELECT ",
        solution_query="SELECT categoria_id, nombre_producto, precio, DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria FROM productos ORDER BY categoria_id ASC, ranking_categoria ASC, nombre_producto ASC;",
        xp_reward=65,
        difficulty="Avanzado",
        check_order=True,
        sort_order=57,
        hints=[
            "Usa DENSE_RANK() con PARTITION BY dentro de OVER (...) para reiniciar el ranking en cada categoría sin dejar huecos ante empates.",
            "Particiona por categoria_id y ordena internamente por precio DESC; al final ordena por categoria_id, ranking_categoria y nombre_producto.",
            "SELECT categoria_id, nombre_producto, precio, DENSE_RANK() OVER (PARTITION BY ??? ORDER BY precio DESC) AS ranking_categoria FROM productos ORDER BY categoria_id ASC, ranking_categoria ASC, nombre_producto ASC;"
        ],
        concept=ExerciseConcept(
            summary='`DENSE_RANK()` numera filas en orden de clasificación sin dejar huecos en la secuencia numérica en caso de empates.',
            syntax='SELECT grupo_id, item_nombre, columna_metrica,\n       DENSE_RANK() OVER (PARTITION BY grupo_id ORDER BY columna_metrica DESC) AS posicion_ranking\nFROM nombre_tabla\nORDER BY grupo_id ASC, posicion_ranking ASC;',
            key_points=[
                '`PARTITION BY columna_grupo` reinicia la numeración ordinal del ranking para cada partición independiente.',
                '`ORDER BY columna DESC` define el criterio de clasificación (del mayor al menor valor).',
                'A diferencia de `GROUP BY`, las funciones de ventana preservan todas las filas individuales sin colapsarlas.'
            ],
            execution_order_note='💡 En empates, `DENSE_RANK()` asigna el mismo número y continúa inmediatamente con el siguiente (ej. 1, 2, 2, 3), a diferencia de `RANK()` (1, 2, 2, 4).',
        ),
        objectives=[
            "1. Segmentar los artículos por familia comercial sin colapsar el listado.",
            "2. Calcular la posición relativa de cada artículo según su precio descendente.",
            "3. Garantizar que valores idénticos compartan posición sin saltos en la correlación."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_CATEGORIAS],
    ),

    "e0000000-0000-0000-0000-000000000048": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000048",
        module_id="c0000000-0000-0000-0000-000000000010",
        title="Resumen de Ventas por Estado (Agregación Condicional)",
        prompt="Crea una tabla resumen que muestre cuánto dinero tiene cada cliente en compras completadas y cuánto en compras pendientes. Muestra el `cliente_id`, la suma de compras completadas bajo el nombre `ventas_completadas` (sumando el total cuando el estado sea `'completado'` y 0 si no) y la suma de compras pendientes bajo `ventas_pendientes` (sumando el total cuando sea `'pendiente'` y 0 si no). Agrupa y ordena por `cliente_id` ascendente.",
        initial_code="-- Agregaci\u00f3n condicional con CASE dentro de SUM\nSELECT ",
        solution_query="SELECT cliente_id, SUM(CASE WHEN estado_pedido = 'completado' THEN total ELSE 0 END) AS ventas_completadas, SUM(CASE WHEN estado_pedido = 'pendiente' THEN total ELSE 0 END) AS ventas_pendientes FROM pedidos GROUP BY cliente_id ORDER BY cliente_id ASC;",
        xp_reward=60,
        difficulty="Avanzado",
        check_order=True,
        sort_order=50,
        hints=[
            "Coloca una expresión CASE dentro de cada función SUM() para acumular solo los importes que correspondan a cada estado.",
            "Cuando el estado no coincida devuelve 0 en el ELSE, agrupa por cliente_id y ordena de forma ascendente.",
            "SELECT cliente_id, SUM(CASE WHEN estado_pedido = 'completado' THEN ??? ELSE 0 END) AS ventas_completadas, SUM(CASE WHEN estado_pedido = 'pendiente' THEN ??? ELSE 0 END) AS ventas_pendientes FROM pedidos GROUP BY cliente_id ORDER BY cliente_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='Combinar `SUM(CASE WHEN ... THEN monto ELSE 0 END)` permite transformar valores de filas en columnas métricas independientes (pivoteo).',
            syntax="SELECT entidad_id,\n       SUM(CASE WHEN estado = 'tipo_a' THEN monto ELSE 0 END) AS total_a,\n       SUM(CASE WHEN estado = 'tipo_b' THEN monto ELSE 0 END) AS total_b\nFROM nombre_tabla\nGROUP BY entidad_id\nORDER BY entidad_id ASC;",
            key_points=[
                'El `CASE` evalúa el estado fila por fila; si coincide devuelve el monto, y si no, devuelve 0 para no alterar la suma.',
                'Cada expresión agregada genera una columna horizontal diferenciada en el reporte.',
                'El `GROUP BY entidad_id` agrupa las transacciones condensándolas por cada entidad.'
            ],
            execution_order_note='💡 Esta técnica es el estándar SQL portátil para pivotar datos sin depender de extensiones propietarias.',
        ),
        objectives=[
            "1. Evaluar condicionalmente el monto transaccionado según el estado del pedido.",
            "2. Acumular las ventas confirmadas y las pendientes en columnas independientes.",
            "3. Condensar los importes por cada cliente y ordenar por ID."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000017": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000017",
        module_id="c0000000-0000-0000-0000-000000000011",
        title="Facturación por Categoría mediante CTE",
        prompt="Prepara un reporte ordenado de facturación por categoría usando una expresión `WITH` (CTE). Crea una tabla temporal llamada `ventas_por_categoria` que sume las ventas (`SUM(dp.cantidad * dp.precio_unitario)`) como `facturacion` agrupando por `nombre_categoria`. Luego, consulta esa tabla temporal para mostrar `nombre_categoria` y `facturacion` ordenados de mayor a menor facturación y, en caso de empate, alfabéticamente por `nombre_categoria`.",
        initial_code="-- Estructura la consulta anal\u00edtica usando WITH ... AS\nWITH ",
        solution_query="WITH ventas_por_categoria AS (SELECT c.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS facturacion FROM categorias c INNER JOIN productos pr ON c.categoria_id = pr.categoria_id INNER JOIN detalle_pedidos dp ON pr.producto_id = dp.producto_id GROUP BY c.nombre_categoria) SELECT nombre_categoria, facturacion FROM ventas_por_categoria ORDER BY facturacion DESC, nombre_categoria ASC;",
        xp_reward=60,
        difficulty="Avanzado",
        check_order=True,
        sort_order=52,
        hints=[
            "Define primero el bloque temporal WITH ventas_por_categoria AS (...) cruzando categorias, productos y detalle_pedidos.",
            "Dentro de la CTE agrupa por c.nombre_categoria calculando SUM(dp.cantidad * dp.precio_unitario) AS facturacion, y luego consulta esa CTE.",
            "WITH ventas_por_categoria AS (SELECT c.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS facturacion FROM categorias c INNER JOIN productos pr ON c.categoria_id = pr.categoria_id INNER JOIN detalle_pedidos dp ON pr.producto_id = dp.producto_id GROUP BY c.nombre_categoria) SELECT nombre_categoria, facturacion FROM ventas_por_categoria ORDER BY facturacion DESC, ??? ASC;"
        ],
        concept=ExerciseConcept(
            summary='Una CTE (`WITH ... AS (...)`) define una tabla temporal con nombre dentro de la consulta, organizando análisis complejos por fases.',
            syntax='WITH cte_resumen AS (\n    SELECT columna_clave,\n           SUM(columna_importe) AS importe_total\n    FROM nombre_tabla\n    GROUP BY columna_clave\n)\nSELECT columna_clave, importe_total\nFROM cte_resumen\nORDER BY importe_total DESC;',
            key_points=[
                'Se declara al inicio con `WITH nombre_cte AS (...)` conteniendo una subconsulta completa entre paréntesis.',
                'La consulta principal posterior puede consultar la CTE como si fuera una tabla física real del esquema.',
                'Aumenta significativamente la legibilidad, mantenimiento y modularidad de consultas extensas.'
            ],
            execution_order_note='💡 En PostgreSQL moderno, las CTEs no recursivas se integran directamente en el optimizador sin penalización de rendimiento.',
        ),
        objectives=[
            "1. Estructurar el cálculo de facturación por familia en una tabla temporal nombrada.",
            "2. Consultar la tabla temporal como origen para la selección final de datos.",
            "3. Ordenar el resultado final de mayor a menor recaudación."
        ],
        sample_tables=[SAMPLE_TABLE_CATEGORIAS, SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_DETALLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000049": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000049",
        module_id="c0000000-0000-0000-0000-000000000011",
        title="CTEs Múltiples Encadenadas (Análisis por Etapas)",
        prompt="Construye un análisis por pasos usando dos CTEs encadenadas para encontrar a los clientes que gastan más que el promedio de todos los clientes. Primero crea `gasto_clientes` con el `cliente_id` y su gasto total (`SUM(total) AS total_gastado`). Luego crea `promedio_general` que calcule el promedio (`AVG(total_gastado) AS gasto_medio`) a partir de la primera. Finalmente, muestra `cliente_id` y `total_gastado` de aquellos clientes cuyo gasto supere el promedio general, ordenados de mayor a menor gasto y, en caso de empate, por `cliente_id` ascendente.",
        initial_code="-- Encadena dos CTEs separadas por coma\nWITH ",
        solution_query="WITH gasto_clientes AS (SELECT cliente_id, SUM(total) AS total_gastado FROM pedidos GROUP BY cliente_id), promedio_general AS (SELECT AVG(total_gastado) AS gasto_medio FROM gasto_clientes) SELECT g.cliente_id, g.total_gastado FROM gasto_clientes g, promedio_general p WHERE g.total_gastado > p.gasto_medio ORDER BY g.total_gastado DESC, g.cliente_id ASC;",
        xp_reward=60,
        difficulty="Avanzado",
        check_order=True,
        sort_order=53,
        hints=[
            "Declara dos tablas temporales en una sola cláusula WITH separándolas por una coma, donde la segunda lea el resultado de la primera.",
            "Compara el gasto de cada cliente contra el promedio general calculado en promedio_general y ordena por total_gastado DESC y cliente_id ASC.",
            "WITH gasto_clientes AS (SELECT cliente_id, SUM(total) AS total_gastado FROM pedidos GROUP BY cliente_id), promedio_general AS (SELECT AVG(total_gastado) AS gasto_medio FROM gasto_clientes) SELECT g.cliente_id, g.total_gastado FROM gasto_clientes g, promedio_general p WHERE g.total_gastado > p.??? ORDER BY g.total_gastado DESC, g.cliente_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='Puedes encadenar múltiples CTEs separándolas por coma bajo una sola cláusula `WITH` para crear flujos analíticos por etapas.',
            syntax='WITH etapa_1 AS (\n    SELECT entidad_id, SUM(monto) AS acumulado\n    FROM tabla_transacciones\n    GROUP BY entidad_id\n),\netapa_2 AS (\n    SELECT AVG(acumulado) AS umbral_medio\n    FROM etapa_1\n)\nSELECT e1.entidad_id, e1.acumulado\nFROM etapa_1 e1, etapa_2 e2\nWHERE e1.acumulado > e2.umbral_medio\nORDER BY e1.acumulado DESC;',
            key_points=[
                'Las CTEs subsiguientes se separan por comas `,` sin repetir la palabra clave `WITH`.',
                'Cada CTE puede hacer referencia a cualquiera de las CTEs definidas previamente en la secuencia.',
                'La consulta final combina o filtra los resultados de las etapas anteriores mediante condiciones lógicas.'
            ],
            execution_order_note='💡 Estructurar consultas en pasos CTE permite depurar cada etapa de forma aislada antes de ensamblar la consulta final.',
        ),
        objectives=[
            "1. Encadenar la primera etapa de acumulación de gasto por cliente.",
            "2. Calcular el promedio general tomando como entrada la etapa previa.",
            "3. Filtrar en la consulta final a los clientes que superen dicho promedio general."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000007": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000007",
        module_id="c0000000-0000-0000-0000-000000000012",
        title="Ranking de Productos por Precio (ROW_NUMBER)",
        prompt="Crea una lista clasificada de productos del más caro al más económico. Muestra `producto_id`, `nombre_producto`, `precio` y una columna llamada `ranking` con la posición consecutiva (1, 2, 3...) de cada producto usando `ROW_NUMBER()` ordenado por precio descendente (desempatando por `producto_id` ascendente), y ordena el resultado final por `ranking` ascendente.",
        initial_code="-- Emplea ROW_NUMBER() OVER (...)\nSELECT ",
        solution_query="SELECT producto_id, nombre_producto, precio, ROW_NUMBER() OVER (ORDER BY precio DESC, producto_id ASC) AS ranking FROM productos ORDER BY ranking ASC;",
        xp_reward=55,
        difficulty="Avanzado",
        check_order=True,
        sort_order=56,
        hints=[
            "Utiliza la función de ventana ROW_NUMBER() acompañada de OVER (...) para numerar cada producto sin colapsar las filas.",
            "Dentro de OVER define ORDER BY precio DESC, producto_id ASC para desempatar precios iguales, y ordena la consulta final por ranking ASC.",
            "SELECT producto_id, nombre_producto, precio, ROW_NUMBER() OVER (ORDER BY precio DESC, ??? ASC) AS ranking FROM productos ORDER BY ranking ASC;"
        ],
        concept=ExerciseConcept(
            summary='`ROW_NUMBER()` numera correlativamente cada fila (1, 2, 3...) según el orden estricto indicado en su cláusula `OVER`.',
            syntax='SELECT columna_id, columna_nombre, columna_criterio,\n       ROW_NUMBER() OVER (ORDER BY columna_criterio DESC) AS posicion\nFROM nombre_tabla;',
            key_points=[
                '`ROW_NUMBER()` garantiza una numeración secuencial estricta y única sin duplicar posiciones, incluso ante valores idénticos.',
                '`OVER (ORDER BY columna DESC)` define la dirección y prioridad con la que se asignan los números de posición.',
                'No reduce ni colapsa filas; conserva la totalidad de los registros de la tabla original.'
            ],
            execution_order_note='💡 Las funciones de ventana se ejecutan después de `WHERE`, `GROUP BY` y `HAVING`, sobre el conjunto ya filtrado.',
        ),
        objectives=[
            "1. Enumerar correlativamente cada producto según su valor comercial.",
            "2. Distribuir las posiciones del artículo más costoso al más económico.",
            "3. Mantener todas las filas del catálogo sin agrupar."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    "e0000000-0000-0000-0000-000000000050": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000050",
        module_id="c0000000-0000-0000-0000-000000000012",
        title="Análisis de Intervalo Temporal entre Pedidos (LAG)",
        prompt="Analiza cuánto tiempo pasa entre una compra y otra para cada cliente. Muestra el `pedido_id`, `cliente_id`, la `fecha_pedido` y el valor de la fecha del pedido inmediatamente anterior bajo el nombre `fecha_pedido_anterior`, usando la función de ventana `LAG(fecha_pedido)` dividiendo por cliente y ordenando cronológicamente (`fecha_pedido ASC, pedido_id ASC`). Ordena los resultados finales por `cliente_id ASC`, `fecha_pedido ASC` y `pedido_id ASC`.",
        initial_code="-- Emplea LAG() OVER (PARTITION BY ... ORDER BY ...)\nSELECT ",
        solution_query="SELECT pedido_id, cliente_id, fecha_pedido, LAG(fecha_pedido) OVER (PARTITION BY cliente_id ORDER BY fecha_pedido ASC, pedido_id ASC) AS fecha_pedido_anterior FROM pedidos ORDER BY cliente_id ASC, fecha_pedido ASC, pedido_id ASC;",
        xp_reward=60,
        difficulty="Avanzado",
        check_order=True,
        sort_order=60,
        hints=[
            "La función de ventana LAG() te permite leer la fecha de la fila anterior dentro de la partición de cada cliente.",
            "Usa PARTITION BY cliente_id y ORDER BY fecha_pedido ASC, pedido_id ASC tanto en la ventana OVER como al final de la consulta.",
            "SELECT pedido_id, cliente_id, fecha_pedido, LAG(fecha_pedido) OVER (PARTITION BY ??? ORDER BY fecha_pedido ASC, pedido_id ASC) AS fecha_pedido_anterior FROM pedidos ORDER BY cliente_id ASC, fecha_pedido ASC, pedido_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='`LAG()` accede a los datos de una fila anterior dentro de la misma partición sin necesidad de recurrir a auto-uniones (`SELF JOIN`).',
            syntax='SELECT entidad_id, fecha_evento,\n       LAG(fecha_evento) OVER (PARTITION BY entidad_id ORDER BY fecha_evento ASC) AS fecha_evento_anterior\nFROM nombre_tabla\nORDER BY entidad_id ASC, fecha_evento ASC;',
            key_points=[
                '`LAG(columna)` obtiene el valor de la fila inmediatamente precedente en el orden especificado.',
                '`PARTITION BY entidad_id` reinicia la ventana para cada entidad, evitando mezclar fechas o eventos de diferentes sujetos.',
                'Para el primer registro de cada partición, al no existir fila previa, `LAG()` retorna naturalmente `NULL`.'
            ],
            execution_order_note='💡 `LAG(columna, N, valor_default)` permite especificar cuántas filas mirar hacia atrás y qué valor devolver si es nulo.',
        ),
        objectives=[
            "1. Dividir las transacciones por cliente ordenándolas en secuencia temporal.",
            "2. Recuperar el valor cronológico de la compra inmediatamente anterior.",
            "3. Proyectar la fecha previa y ordenar adecuadamente."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000051": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000051",
        module_id="a0000000-0000-0000-0000-000000000002",
        title="Pedidos de Febrero de 2024 (Fechas con BETWEEN)",
        prompt="Auditoría quiere revisar todas las compras registradas durante febrero de 2024. Muestra el `pedido_id`, `cliente_id`, `fecha_pedido` y `total` de los pedidos realizados entre `'2024-02-01'` y `'2024-02-29'` (ambos inclusive), ordenados cronológicamente por `fecha_pedido ASC` y, en caso de empate, por `pedido_id ASC`.",
        initial_code="-- Filtra por rango de fechas en WHERE\nSELECT ",
        solution_query="SELECT pedido_id, cliente_id, fecha_pedido, total FROM pedidos WHERE fecha_pedido BETWEEN '2024-02-01' AND '2024-02-29' ORDER BY fecha_pedido ASC, pedido_id ASC;",
        xp_reward=40,
        difficulty="Principiante",
        check_order=True,
        sort_order=11,
        hints=[
            "Las fechas en formato estándar se comparan como texto delimitado entre comillas simples ('AAAA-MM-DD') dentro de WHERE.",
            "Usa BETWEEN '2024-02-01' AND '2024-02-29' sobre fecha_pedido y ordena con fecha_pedido ASC, pedido_id ASC.",
            "SELECT ???, ???, ???, ??? FROM pedidos WHERE ??? BETWEEN '2024-02-01' AND '2024-02-29' ORDER BY fecha_pedido ASC, pedido_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='Las columnas de tipo fecha (`DATE`) admiten rangos inclusivos con `BETWEEN`, escribiendo siempre las fechas en formato ISO `AAAA-MM-DD` entre comillas simples.',
            syntax="SELECT columna_id, columna_fecha\nFROM nombre_tabla\nWHERE columna_fecha BETWEEN '2024-01-01' AND '2024-01-31'\nORDER BY columna_fecha ASC;",
            key_points=[
                "El formato estándar `AAAA-MM-DD` entre comillas simples (`'2024-02-01'`) es interpretado de forma unívoca por PostgreSQL.",
                '`BETWEEN` incluye tanto la fecha inicial como la fecha final del intervalo.',
                'Incluir un identificador único como segundo criterio en `ORDER BY` desempata compras realizadas el mismo día.'
            ],
            execution_order_note='💡 Nunca omitas las comillas simples en literales de fecha; sin comillas el motor los interpretaría como una resta numérica.',
        ),
        objectives=[
            "1. Filtrar registros temporales mediante un rango cerrado de fechas.",
            "2. Aplicar el formato ISO de fecha entre comillas simples.",
            "3. Ordenar cronológicamente con criterio único de desempate."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000052": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000052",
        module_id="a0000000-0000-0000-0000-000000000004",
        title="Compras Completadas por Cliente (WHERE + GROUP BY)",
        prompt="Analiza únicamente las compras efectivas por cliente sin mezclar pedidos cancelados ni pendientes. Filtra los pedidos con `estado_pedido = 'completado'`, agrupa por `cliente_id` y muestra el `cliente_id`, el número de compras como `compras_completadas` y su suma como `gasto_completado`. Ordena de mayor a menor `gasto_completado` y desempata por `cliente_id` ascendente.",
        initial_code="-- Filtra filas individuales antes de agrupar\nSELECT ",
        solution_query="SELECT cliente_id, COUNT(*) AS compras_completadas, SUM(total) AS gasto_completado FROM pedidos WHERE estado_pedido = 'completado' GROUP BY cliente_id ORDER BY gasto_completado DESC, cliente_id ASC;",
        xp_reward=45,
        difficulty="Principiante",
        check_order=True,
        sort_order=20,
        hints=[
            "Primero descarta con WHERE las filas que no están completadas y después agrupa por cliente para contar y sumar.",
            "Coloca WHERE estado_pedido = 'completado' antes de GROUP BY cliente_id, proyectando COUNT(*) y SUM(total).",
            "SELECT ???, COUNT(*) AS compras_completadas, SUM(???) AS gasto_completado FROM pedidos WHERE ??? = 'completado' GROUP BY ??? ORDER BY gasto_completado DESC, ??? ASC;"
        ],
        concept=ExerciseConcept(
            summary='Combinar `WHERE` con `GROUP BY` permite depurar qué filas individuales entran en cada grupo antes de calcular los resúmenes.',
            syntax="SELECT columna_entidad,\n       COUNT(*) AS total_registros,\n       SUM(columna_importe) AS suma_filtrada\nFROM nombre_tabla\nWHERE columna_estado = 'valor_valido'\nGROUP BY columna_entidad\nORDER BY suma_filtrada DESC;",
            key_points=[
                'El orden sintáctico obligatorio es: `FROM` $\\to$ `WHERE` $\\to$ `GROUP BY` $\\to$ `ORDER BY`.',
                '`WHERE` filtra filas individuales *antes* de formar los grupos; por eso es más eficiente descartar registros inválidos aquí.',
                'Toda columna no agregada del `SELECT` debe aparecer en `GROUP BY`.'
            ],
            execution_order_note='💡 Al filtrar primero con `WHERE`, el motor procesa menos filas al construir los grupos y calcular `SUM` o `COUNT`.',
        ),
        objectives=[
            "1. Excluir pedidos no completados antes de realizar la agrupación.",
            "2. Calcular simultáneamente el conteo y el importe total por cliente.",
            "3. Ordenar el resumen con desempate único por identificador."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000053": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000053",
        module_id="b0000000-0000-0000-0000-000000000006",
        title="Gasto Total de Clientes Incluyendo 0€ (COALESCE)",
        prompt="Genera un reporte financiero con TODOS los clientes registrados y su gasto total acumulado, asegurando que quienes nunca han comprado muestren `0` en lugar de `NULL`. Haz un `LEFT JOIN` entre `clientes` y `pedidos`, proyecta `cliente_id`, `nombre`, `apellido` y `COALESCE(SUM(p.total), 0)` como `gasto_total`. Ordena de mayor a menor `gasto_total` y desempata por `cliente_id` ascendente.",
        initial_code="-- Reemplaza valores NULL de la suma con COALESCE\nSELECT ",
        solution_query="SELECT c.cliente_id, c.nombre, c.apellido, COALESCE(SUM(p.total), 0) AS gasto_total FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY gasto_total DESC, c.cliente_id ASC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=35,
        hints=[
            "Al unir con LEFT JOIN, SUM() sobre filas sin pedidos devuelve NULL en lugar de cero; envuélvelo en una función de respaldo.",
            "Usa COALESCE(SUM(p.total), 0) AS gasto_total agrupando por las columnas del cliente y ordenando con desempate único.",
            "SELECT c.cliente_id, c.nombre, c.apellido, COALESCE(SUM(p.???), 0) AS gasto_total FROM clientes c LEFT JOIN pedidos p ON c.??? = p.??? GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY gasto_total DESC, c.cliente_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='`COALESCE(expresion, valor_por_defecto)` convierte resultados `NULL` en un valor numérico o de texto seguro, indispensable tras un `LEFT JOIN` con `SUM()`.',
            syntax='SELECT t1.id, t1.nombre,\n       COALESCE(SUM(t2.importe), 0) AS acumulado_seguro\nFROM tabla_maestra t1\nLEFT JOIN tabla_movimientos t2 ON t1.id = t2.entidad_id\nGROUP BY t1.id, t1.nombre\nORDER BY acumulado_seguro DESC, t1.id ASC;',
            key_points=[
                'A diferencia de `COUNT(col)` que devuelve `0` ante nulos, `SUM(col)` sobre un grupo sin filas coincidentes devuelve `NULL`.',
                '`COALESCE(valor, 0)` evalúa el primer argumento y, si resulta `NULL`, devuelve `0`.',
                'Mantener `LEFT JOIN` y `GROUP BY` sobre las columnas maestras preserva a todas las entidades aunque no tengan movimientos.'
            ],
            execution_order_note='💡 En reportes financieros es obligatorio normalizar `NULL` a `0` antes de calcular promedios o ordenar rankings descendentes.',
        ),
        objectives=[
            "1. Conservar la lista completa de entidades mediante LEFT JOIN.",
            "2. Evitar valores NULL al sumar importes de entidades sin actividad.",
            "3. Ordenar de mayor a menor gasto con desempate único."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000054": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000054",
        module_id="b0000000-0000-0000-0000-000000000008",
        title="Ciudades con Clientes y Almacenes (INTERSECT)",
        prompt="Logística quiere identificar en qué ciudades coincidimos teniendo tanto clientes registrados como al menos un almacén físico. Usa el operador de conjuntos `INTERSECT` entre las ciudades de `clientes` y las ciudades de `almacenes`, ordenando el resultado alfabéticamente por `ciudad` ascendente.",
        initial_code="-- Intersección de conjuntos con INTERSECT\nSELECT ",
        solution_query="SELECT ciudad FROM clientes INTERSECT SELECT ciudad FROM almacenes ORDER BY ciudad ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=41,
        hints=[
            "Para hallar elementos presentes en ambos conjuntos a la vez, separa dos consultas SELECT simples con INTERSECT.",
            "Proyecta ciudad desde la primera tabla, escribe INTERSECT, proyecta ciudad desde la segunda y coloca ORDER BY ciudad ASC al final.",
            "SELECT ??? FROM clientes INTERSECT SELECT ??? FROM almacenes ORDER BY ciudad ASC;"
        ],
        concept=ExerciseConcept(
            summary='`INTERSECT` devuelve únicamente las filas que aparecen de forma idéntica en el resultado de ambas consultas `SELECT`, eliminando duplicados automáticamente.',
            syntax='SELECT columna_comun FROM tabla_a\nINTERSECT\nSELECT columna_comun FROM tabla_b\nORDER BY columna_comun ASC;',
            key_points=[
                'Ambas consultas deben tener el mismo número de columnas y tipos compatibles.',
                '`INTERSECT` entrega un conjunto único sin valores repetidos (equivale a la intersección matemática $A \\cap B$).',
                'El `ORDER BY` se escribe una sola vez al final de toda la operación de conjunto.'
            ],
            execution_order_note='💡 Mientras `UNION` suma dos listas y `EXCEPT` las resta, `INTERSECT` conserva exclusivamente las coincidencias exactas entre ambas.',
        ),
        objectives=[
            "1. Extraer la columna de ciudades de dos orígenes independientes.",
            "2. Obtener únicamente las ciudades presentes en ambos conjuntos.",
            "3. Ordenar el listado único alfabéticamente."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_ALMACENES],
    ),

    "e0000000-0000-0000-0000-000000000055": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000055",
        module_id="c0000000-0000-0000-0000-000000000009",
        title="Clientes sin Pedidos Completados (NOT EXISTS)",
        prompt="Fidelización busca contactar a los clientes que aún no cuentan con ninguna compra completada (ya sea porque nunca compraron o porque sus órdenes fueron canceladas o están pendientes). Muestra `cliente_id`, `nombre` y `apellido` de `clientes` usando una subconsulta correlacionada con `NOT EXISTS` sobre `pedidos` filtrando por `estado_pedido = 'completado'`. Ordena por `cliente_id` ascendente.",
        initial_code="-- Subconsulta correlacionada negativa con NOT EXISTS\nSELECT ",
        solution_query="SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.cliente_id AND p.estado_pedido = 'completado') ORDER BY c.cliente_id ASC;",
        xp_reward=60,
        difficulty="Avanzado",
        check_order=True,
        sort_order=48,
        hints=[
            "Utiliza WHERE NOT EXISTS (...) para conservar únicamente las filas de la consulta externa que no encuentren ninguna coincidencia interna.",
            "Dentro de la subconsulta correlaciona p.cliente_id = c.cliente_id y exige p.estado_pedido = 'completado'.",
            "SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.??? = c.??? AND p.estado_pedido = 'completado') ORDER BY c.cliente_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='`NOT EXISTS` verifica que una subconsulta correlacionada no devuelva ninguna fila; es inmune a las trampas de lógica trivalente (`NULL`) que rompen a `NOT IN`.',
            syntax="SELECT t1.id, t1.nombre\nFROM tabla_principal t1\nWHERE NOT EXISTS (\n    SELECT 1\n    FROM tabla_relacionada t2\n    WHERE t2.principal_id = t1.id\n      AND t2.estado = 'valido'\n)\nORDER BY t1.id ASC;",
            key_points=[
                'Si una subconsulta usada con `NOT IN (...)` llega a devolver un solo `NULL`, el filtro completo devuelve 0 filas; `NOT EXISTS` evita por completo ese error.',
                'La correlación `t2.fk = t1.pk` enlaza cada fila externa con sus posibles coincidencias internas.',
                'La consulta externa ordena los resultados finales por su identificador único.'
            ],
            execution_order_note='💡 En PostgreSQL, `NOT EXISTS` detiene el escaneo interno en cuanto encuentra la primera coincidencia para descartar la fila.',
        ),
        objectives=[
            "1. Identificar entidades sin actividad válida mediante lógica booleana segura.",
            "2. Correlacionar consulta externa e interna evitando fallos por valores NULL.",
            "3. Ordenar el listado resultante de forma determinista."
        ],
        sample_tables=[SAMPLE_TABLE_CLIENTES, SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000056": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000056",
        module_id="c0000000-0000-0000-0000-000000000010",
        title="Conteo de Productos por Nivel de Precio (COUNT + CASE)",
        prompt="Clasifica la composición del catálogo por categoría contando cuántos artículos de cada una pertenecen al rango premium (`precio >= 500`) y cuántos al rango estándar (`precio < 500`). Une `categorias` y `productos` con `LEFT JOIN`, muestra `nombre_categoria`, `productos_premium` y `productos_estandar` usando `COUNT(CASE WHEN ... THEN 1 END)`. Agrupa por categoría y ordena por `categoria_id` ascendente.",
        initial_code="-- Conteo condicional combinando COUNT y CASE\nSELECT ",
        solution_query="SELECT c.nombre_categoria, COUNT(CASE WHEN p.precio >= 500 THEN 1 END) AS productos_premium, COUNT(CASE WHEN p.precio < 500 THEN 1 END) AS productos_estandar FROM categorias c LEFT JOIN productos p ON c.categoria_id = p.categoria_id GROUP BY c.categoria_id, c.nombre_categoria ORDER BY c.categoria_id ASC;",
        xp_reward=60,
        difficulty="Avanzado",
        check_order=True,
        sort_order=51,
        hints=[
            "Como COUNT() ignora los valores NULL, puedes devolver 1 en THEN cuando la condición se cumpla y omitir el ELSE (que queda NULL).",
            "Combina LEFT JOIN productos p, agrupa por c.categoria_id y c.nombre_categoria, y usa COUNT(CASE WHEN p.precio >= 500 THEN 1 END).",
            "SELECT c.nombre_categoria, COUNT(CASE WHEN p.??? >= 500 THEN 1 END) AS productos_premium, COUNT(CASE WHEN p.??? < 500 THEN 1 END) AS productos_estandar FROM categorias c LEFT JOIN productos p ON c.??? = p.??? GROUP BY c.categoria_id, c.nombre_categoria ORDER BY c.categoria_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='`COUNT(CASE WHEN condicion THEN 1 END)` cuenta únicamente las filas del grupo que cumplen una regla sin necesidad de sumar ceros manualmente.',
            syntax='SELECT t1.nombre_grupo,\n       COUNT(CASE WHEN t2.metrica >= umbral THEN 1 END) AS conteo_alto,\n       COUNT(CASE WHEN t2.metrica < umbral THEN 1 END) AS conteo_bajo\nFROM tabla_grupos t1\nLEFT JOIN tabla_elementos t2 ON t1.id = t2.grupo_id\nGROUP BY t1.id, t1.nombre_grupo\nORDER BY t1.id ASC;',
            key_points=[
                'Cuando un `CASE` omite la cláusula `ELSE`, toda fila que no cumpla ningún `WHEN` evalúa automáticamente a `NULL`.',
                'Debido a que `COUNT(expresion)` ignora los valores `NULL`, solo contabiliza las filas donde el `CASE` devolvió `1`.',
                'No confundas `THEN 1` con `THEN 0` si omites el `ELSE`: `COUNT(0)` también contaría 1!'
            ],
            execution_order_note='💡 Esta técnica permite construir matrices comparativas de conteo en una sola pasada por la tabla.',
        ),
        objectives=[
            "1. Contabilizar subconjuntos con criterios opuestos dentro de un mismo agrupamiento.",
            "2. Aprovechar el comportamiento de COUNT frente a NULL omitiendo el ELSE.",
            "3. Preservar todas las categorías ordenadas por su identificador."
        ],
        sample_tables=[SAMPLE_TABLE_CATEGORIAS, SAMPLE_TABLE_PRODUCTOS],
    ),

    "e0000000-0000-0000-0000-000000000057": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000057",
        module_id="c0000000-0000-0000-0000-000000000011",
        title="Evolución Mensual de Ventas mediante CTE (TO_CHAR)",
        prompt="Dirección necesita una serie mensual de ingresos de pedidos completados. Define una CTE llamada `pedidos_mensuales` que transforme la fecha al formato año-mes con `TO_CHAR(fecha_pedido, 'YYYY-MM') AS mes`, cuente los pedidos como `total_pedidos` y sume el total como `ingresos_mensuales` filtrando `estado_pedido = 'completado'`. Luego consulta esa CTE mostrando `mes`, `total_pedidos` e `ingresos_mensuales`, ordenados cronológicamente por `mes ASC`.",
        initial_code="-- Agrupación temporal por mes estructurada en una CTE\nWITH ",
        solution_query="WITH pedidos_mensuales AS (SELECT TO_CHAR(fecha_pedido, 'YYYY-MM') AS mes, COUNT(*) AS total_pedidos, SUM(total) AS ingresos_mensuales FROM pedidos WHERE estado_pedido = 'completado' GROUP BY TO_CHAR(fecha_pedido, 'YYYY-MM')) SELECT mes, total_pedidos, ingresos_mensuales FROM pedidos_mensuales ORDER BY mes ASC;",
        xp_reward=65,
        difficulty="Avanzado",
        check_order=True,
        sort_order=54,
        hints=[
            "Extrae el periodo mensual con TO_CHAR(fecha_pedido, 'YYYY-MM') tanto en el SELECT como en el GROUP BY dentro de la CTE.",
            "Filtra primero estado_pedido = 'completado' dentro de pedidos_mensuales y ordena la selección final por mes ASC.",
            "WITH pedidos_mensuales AS (SELECT TO_CHAR(fecha_pedido, 'YYYY-MM') AS mes, COUNT(*) AS total_pedidos, SUM(???) AS ingresos_mensuales FROM pedidos WHERE ??? = 'completado' GROUP BY TO_CHAR(fecha_pedido, 'YYYY-MM')) SELECT mes, total_pedidos, ingresos_mensuales FROM pedidos_mensuales ORDER BY mes ASC;"
        ],
        concept=ExerciseConcept(
            summary='Encapsular expresiones temporales como `TO_CHAR(fecha, \'YYYY-MM\')` dentro de una CTE separa la limpieza de fechas del reporte final.',
            syntax="WITH resumen_mensual AS (\n    SELECT TO_CHAR(columna_fecha, 'YYYY-MM') AS periodo,\n           COUNT(*) AS cantidad,\n           SUM(columna_importe) AS monto\n    FROM tabla_eventos\n    GROUP BY TO_CHAR(columna_fecha, 'YYYY-MM')\n)\nSELECT periodo, cantidad, monto\nFROM resumen_mensual\nORDER BY periodo ASC;",
            key_points=[
                "`TO_CHAR(fecha, 'YYYY-MM')` convierte cualquier fecha en una etiqueta ordenable cronológicamente (`2024-01`, `2024-02`, ...).",
                'En SQL estándar debes repetir la expresión `TO_CHAR(...)` en `GROUP BY` (no el alias del `SELECT`).',
                'Separar el cálculo en una CTE permite leer y reutilizar el periodo ya limpio en la consulta externa.'
            ],
            execution_order_note='💡 Como `YYYY-MM` coloca el año antes del mes con dos dígitos fijos, el orden alfabético coincide exactamente con el orden cronológico.',
        ),
        objectives=[
            "1. Normalizar fechas diarias a períodos mensuales ordenables.",
            "2. Calcular volumen y facturación mensual sobre ventas válidas dentro de una CTE.",
            "3. Presentar la serie temporal en orden ascendente."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000058": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000058",
        module_id="c0000000-0000-0000-0000-000000000011",
        title="Categorías sobre el Promedio de Facturación (CTE + Subconsulta)",
        prompt="Identifica qué categorías facturan por encima del promedio de todas las categorías. Crea una CTE llamada `facturacion_categoria` que sume las líneas de venta (`SUM(dp.cantidad * dp.precio_unitario) AS facturacion`) agrupando por `c.categoria_id` y `c.nombre_categoria`. En la consulta final, muestra `nombre_categoria` y `facturacion` filtrando aquellas cuyo valor supere `(SELECT AVG(facturacion) FROM facturacion_categoria)`. Ordena de mayor a menor `facturacion` y desempata por `nombre_categoria` ascendente.",
        initial_code="-- Reutiliza la misma CTE en una subconsulta escalar\nWITH ",
        solution_query="WITH facturacion_categoria AS (SELECT c.categoria_id, c.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS facturacion FROM categorias c INNER JOIN productos pr ON c.categoria_id = pr.categoria_id INNER JOIN detalle_pedidos dp ON pr.producto_id = dp.producto_id GROUP BY c.categoria_id, c.nombre_categoria) SELECT nombre_categoria, facturacion FROM facturacion_categoria WHERE facturacion > (SELECT AVG(facturacion) FROM facturacion_categoria) ORDER BY facturacion DESC, nombre_categoria ASC;",
        xp_reward=65,
        difficulty="Avanzado",
        check_order=True,
        sort_order=55,
        hints=[
            "Una CTE puede referenciarse varias veces en la consulta principal: úsala tanto en el FROM como dentro de una subconsulta escalar en el WHERE.",
            "Compara WHERE facturacion > (SELECT AVG(facturacion) FROM facturacion_categoria) y ordena por facturacion DESC, nombre_categoria ASC.",
            "WITH facturacion_categoria AS (SELECT c.categoria_id, c.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS facturacion FROM categorias c INNER JOIN productos pr ON c.categoria_id = pr.categoria_id INNER JOIN detalle_pedidos dp ON pr.producto_id = dp.producto_id GROUP BY c.categoria_id, c.nombre_categoria) SELECT nombre_categoria, facturacion FROM facturacion_categoria WHERE facturacion > (SELECT AVG(???) FROM facturacion_categoria) ORDER BY facturacion DESC, ??? ASC;"
        ],
        concept=ExerciseConcept(
            summary='Una CTE definida en `WITH` puede reutilizarse múltiples veces en la consulta principal, evitando duplicar subconsultas largas al comparar un grupo contra el promedio global de grupos.',
            syntax='WITH totales_grupo AS (\n    SELECT grupo_id, nombre_grupo, SUM(monto) AS total_grupo\n    FROM tabla_base\n    GROUP BY grupo_id, nombre_grupo\n)\nSELECT nombre_grupo, total_grupo\nFROM totales_grupo\nWHERE total_grupo > (SELECT AVG(total_grupo) FROM totales_grupo)\nORDER BY total_grupo DESC, nombre_grupo ASC;',
            key_points=[
                'No es necesario calcular dos veces la agregación: la CTE `totales_grupo` sirve a la vez como tabla origen y dentro de `AVG(...)`.',
                'La subconsulta escalar `(SELECT AVG(...) FROM cte)` devuelve un único promedio general de referencia.',
                'La consulta final mantiene un desempate determinista en `ORDER BY`.'
            ],
            execution_order_note='💡 Este patrón resuelve el clásico problema de "grupos por encima del promedio de todos los grupos" con máxima legibilidad.',
        ),
        objectives=[
            "1. Consolidar las ventas por grupo dentro de una tabla temporal con nombre.",
            "2. Reutilizar la CTE en el WHERE para calcular dinámicamente el promedio entre grupos.",
            "3. Filtrar y ordenar las categorías destacadas con desempate alfabético."
        ],
        sample_tables=[SAMPLE_TABLE_CATEGORIAS, SAMPLE_TABLE_PRODUCTOS, SAMPLE_TABLE_DETALLE_PEDIDOS],
    ),

    "e0000000-0000-0000-0000-000000000059": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000059",
        module_id="c0000000-0000-0000-0000-000000000012",
        title="Producto Más Caro por Categoría (CTE + ROW_NUMBER)",
        prompt="Encuentra el artículo líder en precio dentro de cada categoría. Crea una CTE `ranking_productos` que proyecte `categoria_id`, `nombre_producto`, `precio` y `ROW_NUMBER() OVER (PARTITION BY categoria_id ORDER BY precio DESC, producto_id ASC) AS posicion` desde `productos`. Luego selecciona `categoria_id`, `nombre_producto` y `precio` filtrando únicamente `WHERE posicion = 1` y ordenando por `categoria_id ASC`.",
        initial_code="-- Patrón de artículo líder por categoría combinando CTE y ROW_NUMBER()\nWITH ",
        solution_query="WITH ranking_productos AS (SELECT categoria_id, nombre_producto, precio, ROW_NUMBER() OVER (PARTITION BY categoria_id ORDER BY precio DESC, producto_id ASC) AS posicion FROM productos) SELECT categoria_id, nombre_producto, precio FROM ranking_productos WHERE posicion = 1 ORDER BY categoria_id ASC;",
        xp_reward=70,
        difficulty="Avanzado",
        check_order=True,
        sort_order=58,
        hints=[
            "Las funciones de ventana no pueden filtrarse directamente en el WHERE de la misma consulta; envuélvelas primero en una CTE.",
            "Dentro de OVER particiona por categoria_id y ordena por precio DESC, producto_id ASC; en el SELECT externo filtra WHERE posicion = 1.",
            "WITH ranking_productos AS (SELECT categoria_id, nombre_producto, precio, ROW_NUMBER() OVER (PARTITION BY ??? ORDER BY precio DESC, ??? ASC) AS posicion FROM productos) SELECT categoria_id, nombre_producto, precio FROM ranking_productos WHERE posicion = 1 ORDER BY categoria_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='El patrón CTE + `ROW_NUMBER() OVER (PARTITION BY ...)` + `WHERE posicion = 1` es la técnica estándar en SQL para extraer el mejor o más reciente registro de cada grupo.',
            syntax='WITH clasificados AS (\n    SELECT grupo_id, nombre_item, metrica,\n           ROW_NUMBER() OVER (PARTITION BY grupo_id ORDER BY metrica DESC, id ASC) AS pos\n    FROM tabla_elementos\n)\nSELECT grupo_id, nombre_item, metrica\nFROM clasificados\nWHERE pos = 1\nORDER BY grupo_id ASC;',
            key_points=[
                'SQL no permite escribir `WHERE ROW_NUMBER() OVER (...) = 1` directamente porque `WHERE` se ejecuta antes que las funciones de ventana.',
                'Envolver el cálculo de ventana dentro de una CTE permite filtrar por la columna `pos` en la consulta exterior.',
                'Incluir un desempate único dentro de `OVER (ORDER BY ...)` garantiza que siempre exista exactamente un ganador por grupo.'
            ],
            execution_order_note='💡 Este patrón Top-N por grupo evita subconsultas correlacionadas costosas y escala de forma lineal en PostgreSQL.',
        ),
        objectives=[
            "1. Numerar los artículos dentro de cada grupo de mayor a menor valor.",
            "2. Aislar la función de ventana en una CTE para poder filtrarla en WHERE.",
            "3. Recuperar el artículo líder por categoría en orden ascendente."
        ],
        sample_tables=[SAMPLE_TABLE_PRODUCTOS],
    ),

    "e0000000-0000-0000-0000-000000000060": ExerciseDetail(
        id="e0000000-0000-0000-0000-000000000060",
        module_id="c0000000-0000-0000-0000-000000000012",
        title="Ingresos Acumulados Progresivos (SUM OVER)",
        prompt="Calcula la curva acumulada de facturación pedido a pedido. Para los pedidos con `estado_pedido = 'completado'`, muestra `pedido_id`, `fecha_pedido`, `total` y una columna llamada `ingresos_acumulados` usando `SUM(total) OVER (ORDER BY fecha_pedido ASC, pedido_id ASC)`. Ordena la salida por `fecha_pedido ASC` y `pedido_id ASC`.",
        initial_code="-- Total acumulado progresivo con SUM() OVER\nSELECT ",
        solution_query="SELECT pedido_id, fecha_pedido, total, SUM(total) OVER (ORDER BY fecha_pedido ASC, pedido_id ASC) AS ingresos_acumulados FROM pedidos WHERE estado_pedido = 'completado' ORDER BY fecha_pedido ASC, pedido_id ASC;",
        xp_reward=70,
        difficulty="Avanzado",
        check_order=True,
        sort_order=59,
        hints=[
            "Cuando SUM() lleva OVER (ORDER BY ...) se comporta como función de ventana y va sumando fila tras fila en vez de colapsar toda la tabla.",
            "Filtra estado_pedido = 'completado' en WHERE y usa SUM(total) OVER (ORDER BY fecha_pedido ASC, pedido_id ASC) AS ingresos_acumulados.",
            "SELECT pedido_id, fecha_pedido, total, SUM(???) OVER (ORDER BY fecha_pedido ASC, ??? ASC) AS ingresos_acumulados FROM pedidos WHERE ??? = 'completado' ORDER BY fecha_pedido ASC, pedido_id ASC;"
        ],
        concept=ExerciseConcept(
            summary='`SUM(col) OVER (ORDER BY ...)` calcula un total acumulado continuo fila por fila respetando el orden definido en la ventana.',
            syntax='SELECT evento_id, fecha, importe,\n       SUM(importe) OVER (ORDER BY fecha ASC, evento_id ASC) AS acumulado_progresivo\nFROM tabla_operaciones\nORDER BY fecha ASC, evento_id ASC;',
            key_points=[
                '`SUM(col)` con `GROUP BY` reduce filas; `SUM(col) OVER (ORDER BY ...)` conserva todas las filas y acumula hasta la fila actual.',
                'Incluir el identificador único después de la fecha en `OVER (ORDER BY fecha, id)` evita sumar a la vez operaciones distintas del mismo día.',
                'Las condiciones en `WHERE` se aplican *antes* de calcular el acumulado de ventana.'
            ],
            execution_order_note='💡 PostgreSQL ejecuta la ventana sobre las filas filtradas por `WHERE`, acumulando exactamente el saldo progresivo tras cada operación válida.',
        ),
        objectives=[
            "1. Filtrar las transacciones válidas antes de construir el acumulado.",
            "2. Calcular el saldo progresivo fila a fila sin colapsar los pedidos individuales.",
            "3. Garantizar un orden cronológico determinista tanto en la ventana como en la salida."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),
}
