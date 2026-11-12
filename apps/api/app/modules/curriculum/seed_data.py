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

# Catálogo completo de 32 ejercicios (Ruta 1 completa con 22 retos + Rutas 2 y 3) enriquecidos con didáctica interactiva estilo SQLBolt
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
            "Usa la sentencia SELECT seguida de las columnas solicitadas separadas por coma: nombre_producto, precio",
            "La cláusula FROM indica la tabla: FROM productos;"
        ],
        concept=ExerciseConcept(
            summary="Con `SELECT` eliges exactamente qué columnas quieres ver de una tabla, como si seleccionaras qué columnas mantener a la vista en una hoja de cálculo.",
            syntax="SELECT columna_1, columna_2\nFROM nombre_tabla;",
            key_points=[
                "`SELECT` va seguido de las columnas que quieres mostrar, separadas por coma `,`.",
                "`FROM` indica en qué tabla están guardados esos datos (en este caso, `productos`).",
                "Al final de cada instrucción en SQL se coloca un punto y coma `;`."
            ],
            execution_order_note="💡 ¿Cómo lo lee la base de datos? Primero busca la tabla con `FROM` y luego extrae solo las columnas que pediste en `SELECT`.",
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
            "Puedes realizar operaciones matemáticas directamente en SELECT, ej: precio * 1.21",
            "Usa ROUND(precio * 1.21, 2) AS precio_con_iva para limitar a 2 decimales y asignar el alias."
        ],
        concept=ExerciseConcept(
            summary="En SQL puedes hacer operaciones matemáticas directamente en tu consulta (+, -, *, /) y usar `AS` para ponerle un nombre claro al resultado.",
            syntax="SELECT columna, ROUND(columna * factor, 2) AS nuevo_nombre\nFROM nombre_tabla;",
            key_points=[
                "Puedes calcular directamente en el `SELECT`: `precio * 1.21`.",
                "`ROUND(cuenta, 2)` deja el número con 2 decimales limpios.",
                "`AS precio_con_iva` le da un título descriptivo a tu nueva columna calculada."
            ],
            execution_order_note="💡 El cálculo se hace al vuelo en la consulta; no altera los valores originales guardados en la tabla.",
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
            "Usa el operador de combinación de textos en SQL: '||'.",
            "Para insertar un espacio en medio escribe: nombre || ' ' || apellido AS cliente_completo."
        ],
        concept=ExerciseConcept(
            summary="En SQL, el símbolo `||` sirve para pegar o combinar textos (como juntar el primer nombre y el apellido en una sola columna).",
            syntax="SELECT columna1 || ' ' || columna2 AS nombre_completo\nFROM tabla;",
            key_points=[
                "Para unir texto y dejar un espacio en medio usa: `nombre || ' ' || apellido`.",
                "Los textos fijos en SQL siempre van entre comillas simples: `' '`.",
                "Usa `AS cliente_completo` para bautizar la nueva columna resultante."
            ],
            execution_order_note="💡 En SQL estándar, `||` une textos fila por fila sin modificar los datos de origen.",
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
            "La palabra reservada DISTINCT se coloca inmediatamente después de SELECT.",
            "Escribe: SELECT DISTINCT ciudad FROM clientes;"
        ],
        concept=ExerciseConcept(
            summary="`DISTINCT` es el filtro quitaduplicados de SQL: se asegura de que cada valor aparezca solo una vez en tu lista final.",
            syntax="SELECT DISTINCT columna\nFROM nombre_tabla;",
            key_points=[
                "`DISTINCT` se escribe justo después de `SELECT`: `SELECT DISTINCT ciudad FROM clientes;`.",
                "Si varios clientes viven en Madrid, con `DISTINCT` 'Madrid' aparecerá solo una vez."
            ],
            execution_order_note="💡 La base de datos agrupa y descarta las copias repetidas antes de mostrar el resultado final.",
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
            "Agrega una cláusula WHERE después de FROM productos.",
            "Utiliza el operador de comparación mayor que (>): WHERE precio > 500;"
        ],
        concept=ExerciseConcept(
            summary="`WHERE` es la condición o filtro de SQL: le pide a la base de datos que solo te entregue las filas que cumplan con una regla específica.",
            syntax="SELECT col1, col2, col3\nFROM tabla\nWHERE condicion_comparacion;",
            key_points=[
                "`WHERE` se coloca después de `FROM tabla`.",
                "Usa operadores de comparación habituales: `>` (mayor), `<` (menor), `=` (igual), `>=` (mayor o igual).",
                "Para este reto la condición es: `WHERE precio > 500;`."
            ],
            execution_order_note="💡 La base de datos revisa cada fila con `WHERE` y descarta de inmediato las que no cumplen la regla, ahorrando memoria y tiempo.",
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
            "Usa la cláusula WHERE con el operador BETWEEN: WHERE precio BETWEEN 100 AND 800;",
            "Recuerda que BETWEEN siempre conecta el rango con la palabra AND."
        ],
        concept=ExerciseConcept(
            summary="`BETWEEN` te permite buscar valores dentro de un rango cerrado (entre un mínimo y un máximo). Es mucho más cómodo que escribir dos comparaciones separadas.",
            syntax="SELECT columna_1, columna_2\nFROM tabla\nWHERE columna BETWEEN valor_min AND valor_max;",
            key_points=[
                "`BETWEEN min AND max` incluye ambos extremos del intervalo.",
                "Escribir `precio BETWEEN 100 AND 800` equivale a `precio >= 100 AND precio <= 800`.",
                "Sirve tanto para números como para fechas y letras."
            ],
            execution_order_note="💡 El motor evalúa el rango directamente sobre los datos de la columna de forma optimizada.",
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
            "El comodín % colocado al inicio indica que puede haber cualquier texto antes del dominio.",
            "Escribe: WHERE email LIKE '%@email.com';"
        ],
        concept=ExerciseConcept(
            summary="`LIKE` te ayuda a buscar coincidencias por partes de un texto usando el comodín `%` (que significa 'cualquier texto que haya antes o después').",
            syntax="SELECT columnas\nFROM tabla\nWHERE columna LIKE 'patron%';",
            key_points=[
                "`%@email.com` significa: 'no importa lo que haya al inicio, mientras termine en @email.com'.",
                "El texto a buscar siempre se escribe entre comillas simples: `'%'`.",
                "Si quisieras buscar que empiece con algo, pondrías el comodín al final: `'Carlos%'`."
            ],
            execution_order_note="💡 PostgreSQL examina el patrón texto por texto; el símbolo `%` actúa como un comodín flexible.",
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
            "Usa el operador IN seguido de la lista entre paréntesis: IN ('Madrid', 'Barcelona', 'Valencia').",
            "No olvides las comillas simples en cada ciudad dentro de la lista."
        ],
        concept=ExerciseConcept(
            summary="`IN` te permite revisar si un valor coincide con cualquiera de los elementos de una lista. Es la forma limpia y elegante de evitar escribir muchos `OR` seguidos.",
            syntax="SELECT columnas\nFROM tabla\nWHERE columna IN (val1, val2, val3);",
            key_points=[
                "Escribe la lista de opciones entre paréntesis y separada por comas: `IN ('Madrid', 'Barcelona', 'Valencia')`.",
                "Equivale a decir: `ciudad = 'Madrid' OR ciudad = 'Barcelona' OR ciudad = 'Valencia'`.",
                "Cada nombre de ciudad es un texto y va entre comillas simples."
            ],
            execution_order_note="💡 En lugar de evaluar condición por condición, PostgreSQL busca eficientemente el valor dentro de la lista en memoria.",
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
            "Usa OR para unir las dos reglas: stock <= 15 OR stock >= 75.",
            "Asegúrate de incluir los símbolos de igual (=) junto a < y >."
        ],
        concept=ExerciseConcept(
            summary="El operador `OR` te permite pedir resultados que cumplan al menos una de las dos condiciones que indiques.",
            syntax="SELECT columnas\nFROM tabla\nWHERE condicion1 OR condicion2;",
            key_points=[
                "Si la fila cumple la primera regla O la segunda regla (o ambas), aparecerá en el resultado.",
                "Menor o igual se escribe `<=`, mayor o igual se escribe `>=`.",
                "Escribe: `WHERE stock <= 15 OR stock >= 75;`."
            ],
            execution_order_note="💡 Evaluación de cortocircuito: si la base de datos comprueba que la primera condición es verdadera, no pierde tiempo verificando la segunda.",
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
            "Combina las condiciones con AND: WHERE monto_total >= 400 AND estado_factura <> 'pagada';",
            "Recuerda que 'pagada' va entre comillas simples."
        ],
        concept=ExerciseConcept(
            summary="Con `AND` exiges que dos reglas se cumplan al mismo tiempo. Para decir 'distinto de' en SQL, usamos el símbolo `<>` (o `!=`).",
            syntax="SELECT columnas\nFROM tabla\nWHERE cond1 AND cond2 <> 'valor';",
            key_points=[
                "`AND` exige que ambas condiciones sean verdaderas para que la fila aparezca.",
                "`<> 'pagada'` excluye todas las facturas que ya estén liquidadas.",
                "Monto de 400€ o más se escribe: `monto_total >= 400`."
            ],
            execution_order_note="💡 PostgreSQL evalúa primero la condición que descarte más filas rápidamente para ahorrar trabajo.",
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
        prompt="Organiza la lista de clientes que viven en España por orden alfabético. Muestra su `nombre`, `apellido` y `ciudad` de la tabla `clientes`, ordenando los resultados alfabéticamente por su `apellido` (de la A a la Z).",
        initial_code="-- Filtra y ordena los clientes\nSELECT ",
        solution_query="SELECT nombre, apellido, ciudad FROM clientes WHERE pais = 'Espa\u00f1a' ORDER BY apellido ASC;",
        xp_reward=40,
        difficulty="Principiante",
        check_order=True,
        sort_order=11,
        hints=[
            "Primero filtra el país en el WHERE y luego añade la cláusula ORDER BY al final.",
            "Escribe: ORDER BY apellido ASC;"
        ],
        concept=ExerciseConcept(
            summary="`ORDER BY` ordena los resultados de tu consulta por una o más columnas. Por defecto ordena de menor a mayor (A-Z o 1-9) con `ASC`.",
            syntax="SELECT col1, col2\nFROM tabla\nWHERE condicion\nORDER BY columna_orden [ASC | DESC];",
            key_points=[
                "`ORDER BY columna ASC` ordena de menor a mayor (ascendente).",
                "Para ordenar de mayor a menor (Z-A) se usa `DESC`.",
                "La cláusula `ORDER BY` siempre va al final de la consulta (después de `FROM` y `WHERE`)."
            ],
            execution_order_note="💡 La base de datos primero filtra las filas con `WHERE` y solo al final organiza las filas resultantes en el orden que pediste.",
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
        title="Top 5 Productos Críticos por Stock",
        prompt="El almacén necesita reponer con urgencia los artículos que están por agotarse. Muestra el `nombre_producto` y el `stock` de los 5 productos con menor cantidad disponible en inventario.",
        initial_code="-- Ordena y limita a los 5 productos con menos stock\nSELECT ",
        solution_query="SELECT nombre_producto, stock FROM productos ORDER BY stock ASC LIMIT 5;",
        xp_reward=40,
        difficulty="Principiante",
        check_order=True,
        sort_order=12,
        hints=[
            "Ordena por stock en orden ascendente para poner los más bajos primero: ORDER BY stock ASC.",
            "Agrega LIMIT 5 al final para quedarte solo con los primeros 5."
        ],
        concept=ExerciseConcept(
            summary="`LIMIT` le pone un tope al número de filas que te devuelve la consulta. Al combinar `ORDER BY` con `LIMIT`, creas rankings o listas de tipo 'Top N' en un segundo.",
            syntax="SELECT columna_1, columna_2\nFROM tabla\nORDER BY columna_criterio ASC\nLIMIT cantidad;",
            key_points=[
                "Para ver los que tienen menos stock, ordenamos con `ORDER BY stock ASC`.",
                "`LIMIT 5` corta el resultado y solo te muestra las primeras 5 filas.",
                "El orden es vital: primero ordenas, luego limitas."
            ],
            execution_order_note="💡 Con `LIMIT`, la base de datos se detiene en cuanto encuentra las primeras N filas requeridas, sin procesar la tabla entera.",
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
        sort_order=13,
        hints=[
            "Separa las dos columnas en ORDER BY con una coma: ORDER BY categoria_id ASC, precio DESC;",
            "Asegúrate de que categoria_id sea ASC y precio sea DESC."
        ],
        concept=ExerciseConcept(
            summary="Puedes ordenar por varias columnas a la vez separándolas por coma. La base de datos ordenará por la primera, y si hay empates, desempatará con la segunda.",
            syntax="SELECT columnas\nFROM tabla\nORDER BY col1 ASC, col2 DESC;",
            key_points=[
                "Escribe las columnas en orden de prioridad: `ORDER BY col1 ASC, col2 DESC`.",
                "Cada columna puede tener su propio sentido de orden (`ASC` o `DESC`)."
            ],
            execution_order_note="💡 La base de datos agrupa mentalmente por la primera columna y luego aplica la segunda ordenación sobre cada subgrupo.",
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
        sort_order=14,
        hints=[
            "El orden es: ORDER BY cliente_id ASC LIMIT 5 OFFSET 5;",
            "OFFSET 5 salta los primeros 5, y LIMIT 5 toma los 5 siguientes."
        ],
        concept=ExerciseConcept(
            summary="`OFFSET` te permite 'saltar' un número de filas antes de empezar a mostrar resultados. Junto con `LIMIT`, es la base de la paginación en cualquier web o app.",
            syntax="SELECT columnas\nFROM tabla\nORDER BY id ASC LIMIT N OFFSET M;",
            key_points=[
                "`LIMIT 5` indica cuántos registros mostrar por página.",
                "`OFFSET 5` indica cuántos registros saltarse (en este caso, los 5 de la primera página).",
                "Siempre debes usar `ORDER BY` al paginar para que los saltos sean consistentes y predecibles."
            ],
            execution_order_note="💡 `OFFSET` cuenta las filas en el orden indicado y solo empieza a enviar datos al cliente cuando llega al número marcado.",
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
        sort_order=15,
        hints=[
            "Usa GROUP BY categoria_id para agrupar los artículos.",
            "Usa HAVING COUNT(*) > 2 después de GROUP BY para quedarte solo con categorías con más de 2 productos."
        ],
        concept=ExerciseConcept(
            summary="`GROUP BY` agrupa filas que tienen el mismo valor en una columna, y `COUNT(*)` cuenta cuántas filas hay en cada grupo. Para filtrar sobre el total de un grupo, usamos `HAVING` en vez de `WHERE`.",
            syntax="SELECT categoria_id, COUNT(*) AS total_productos\nFROM productos\nGROUP BY categoria_id\nHAVING COUNT(*) > 2;",
            key_points=[
                "`GROUP BY categoria_id` junta los productos por su categoría.",
                "`COUNT(*) AS total_productos` cuenta los productos de cada categoría.",
                "`HAVING COUNT(*) > 2` filtra los grupos que superan el umbral (a diferencia de WHERE, HAVING filtra grupos, no filas individuales)."
            ],
            execution_order_note="💡 La base de datos primero forma los grupos en memoria con `GROUP BY`, calcula la cuenta, y luego descarta los grupos que no cumplan `HAVING`.",
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
            "Escribe las tres funciones en el SELECT separadas por coma.",
            "No necesitas GROUP BY porque quieres un solo resultado global."
        ],
        concept=ExerciseConcept(
            summary="Las funciones de resumen (`COUNT`, `SUM`, `AVG`) pueden usarse juntas para obtener métricas globales en una sola consulta sin necesidad de agrupar.",
            syntax="SELECT COUNT(*) AS total, SUM(monto) AS acumulado, ROUND(AVG(monto), 2) AS promedio\nFROM pedidos\nWHERE estado = 'completado';",
            key_points=[
                "`COUNT(*)` cuenta cuántos pedidos completados hubo.",
                "`SUM(total)` suma el dinero de todas esas compras.",
                "`ROUND(AVG(total), 2)` calcula el ticket promedio y lo redondea a 2 decimales.",
                "El `WHERE estado_pedido = 'completado'` asegura que solo contemos ventas reales."
            ],
            execution_order_note="💡 La base de datos recorre los pedidos completados acumulando la suma y el conteo en una sola pasada eficiente.",
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
            "Selecciona: categoria_id, MIN(precio) AS precio_minimo, MAX(precio) AS precio_maximo.",
            "No olvides agrupar al final: GROUP BY categoria_id;"
        ],
        concept=ExerciseConcept(
            summary="`MIN()` encuentra el valor más pequeño y `MAX()` encuentra el más grande dentro de cada grupo.",
            syntax="SELECT grupo, MIN(col), MAX(col)\nFROM tabla\nGROUP BY grupo;",
            key_points=[
                "`MIN(precio)` obtiene el artículo más barato de la categoría.",
                "`MAX(precio)` obtiene el artículo más caro de la categoría.",
                "Debes agrupar con `GROUP BY categoria_id` para que el cálculo se haga por cada categoría individual."
            ],
            execution_order_note="💡 `GROUP BY` separa los productos por categoría y calcula los valores extremos de cada grupo antes de devolver la respuesta.",
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
        prompt="¿De qué países son nuestros clientes? Muestra la columna `pais` y el número total de clientes en cada país bajo el nombre `total_clientes`, ordenando la lista de mayor a menor número de clientes.",
        initial_code="-- Agrupa clientes por pa\u00eds\nSELECT ",
        solution_query="SELECT pais, COUNT(*) AS total_clientes FROM clientes GROUP BY pais ORDER BY total_clientes DESC;",
        xp_reward=45,
        difficulty="Principiante",
        check_order=True,
        sort_order=18,
        hints=[
            "Usa COUNT(*) AS total_clientes para contar a los clientes de cada país.",
            "Agrupa por pais y ordena por total_clientes DESC."
        ],
        concept=ExerciseConcept(
            summary="Combinar `GROUP BY` con `ORDER BY ... DESC` te permite descubrir de dónde viene la mayor parte de tus usuarios en forma de ranking.",
            syntax="SELECT pais, COUNT(*) AS total\nFROM tabla\nGROUP BY pais\nORDER BY total DESC;",
            key_points=[
                "`GROUP BY pais` junta a los clientes según su país de residencia.",
                "`COUNT(*) AS total_clientes` cuenta cuántos clientes hay por país.",
                "`ORDER BY total_clientes DESC` pone en la cima al país con más clientes."
            ],
            execution_order_note="💡 Primero se agrupa por país, se realiza el conteo de filas, y finalmente se ordenan los grupos de mayor a menor.",
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
            "Escribe: SELECT proveedor_id, SUM(stock) AS stock_total FROM productos GROUP BY proveedor_id;"
        ],
        concept=ExerciseConcept(
            summary="`SUM(columna)` suma todos los números de esa columna para cada grupo que indiques en `GROUP BY`.",
            syntax="SELECT grupo, SUM(numerico) AS total\nFROM tabla\nGROUP BY grupo;",
            key_points=[
                "`SUM(stock) AS stock_total` suma las existencias de todos los productos del mismo proveedor.",
                "`GROUP BY proveedor_id` asegura que tengamos una sola fila por cada fabricante."
            ],
            execution_order_note="💡 La base de datos agrupa los productos por proveedor y va acumulando el stock de cada fila en un total sumatorio.",
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
        sort_order=20,
        hints=[
            "Agrega HAVING SUM(stock) > 100 después de tu GROUP BY proveedor_id.",
            "Recuerda que no puedes usar WHERE con funciones como SUM o COUNT."
        ],
        concept=ExerciseConcept(
            summary="Recuerda la regla de oro: `WHERE` filtra filas antes de agrupar; `HAVING` filtra grupos después de hacer la suma o cálculo.",
            syntax="SELECT grupo, SUM(col)\nFROM tabla\nGROUP BY grupo\nHAVING SUM(col) > valor;",
            key_points=[
                "Para filtrar sobre la suma (`SUM(stock) > 100`), se debe usar `HAVING` y nunca `WHERE`.",
                "`HAVING` se coloca siempre después del `GROUP BY`."
            ],
            execution_order_note="💡 El motor calcula la suma de inventario de cada proveedor y luego descarta a los que no alcancen las 100 unidades.",
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
        title="Clientes con Ticket Promedio Alto (HAVING AVG)",
        prompt="Encuentra a los clientes que hacen compras de alto valor promedio. Muestra el `cliente_id` y su importe promedio de compra redondeado a 2 decimales bajo el nombre `ticket_promedio`, mostrando solo a aquellos clientes cuyo promedio de compras supere los 500€.",
        initial_code="-- Filtra clientes por ticket promedio\nSELECT ",
        solution_query="SELECT cliente_id, ROUND(AVG(total), 2) AS ticket_promedio FROM pedidos GROUP BY cliente_id HAVING AVG(total) > 500;",
        xp_reward=50,
        difficulty="Principiante",
        check_order=False,
        sort_order=21,
        hints=[
            "Usa HAVING AVG(total) > 500 después del GROUP BY cliente_id.",
            "Redondea el promedio con ROUND(AVG(total), 2) en el SELECT."
        ],
        concept=ExerciseConcept(
            summary="`HAVING AVG(...) > valor` te permite encontrar clientes o entidades cuyo comportamiento promedio supere un estándar que tú definas.",
            syntax="SELECT cliente_id, ROUND(AVG(total), 2) AS avg_total\nFROM pedidos\nGROUP BY cliente_id\nHAVING AVG(total) > 500;",
            key_points=[
                "`ROUND(AVG(total), 2) AS ticket_promedio` calcula la media de gasto por cliente.",
                "`HAVING AVG(total) > 500` descarta a los clientes que gastan menos de 500€ en promedio.",
                "Se agrupa por `cliente_id` en la tabla `pedidos`."
            ],
            execution_order_note="💡 Para cada cliente se promedian sus pedidos y se verifica la condición de corte antes de proyectar.",
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
        prompt="Construye un panel de control de pedidos. Muestra el `estado_pedido`, la cantidad de pedidos bajo el nombre `total_pedidos` y la suma acumulada de dinero bajo `monto_acumulado`, agrupando por estado y ordenando del estado con mayor dinero al de menor dinero.",
        initial_code="-- Resumen consolidado por estado de pedido\nSELECT ",
        solution_query="SELECT estado_pedido, COUNT(*) AS total_pedidos, SUM(total) AS monto_acumulado FROM pedidos GROUP BY estado_pedido ORDER BY monto_acumulado DESC;",
        xp_reward=50,
        difficulty="Principiante",
        check_order=True,
        sort_order=22,
        hints=[
            "En el SELECT coloca: estado_pedido, COUNT(*) AS total_pedidos, SUM(total) AS monto_acumulado.",
            "Agrupa por estado_pedido y ordena por monto_acumulado DESC."
        ],
        concept=ExerciseConcept(
            summary="Puedes combinar conteos (`COUNT`) y sumas de dinero (`SUM`) en una misma consulta para entender el estado de un negocio de un solo vistazo.",
            syntax="SELECT estado, COUNT(*), SUM(monto)\nFROM tabla\nGROUP BY estado\nORDER BY SUM(monto) DESC;",
            key_points=[
                "`GROUP BY estado_pedido` agrupa en categorías como 'completado', 'pendiente', etc.",
                "`COUNT(*)` te dice cuántos pedidos hay en ese estado.",
                "`SUM(total)` te dice cuánto dinero representan esos pedidos.",
                "`ORDER BY monto_acumulado DESC` ordena de mayor a menor recaudación."
            ],
            execution_order_note="💡 La base de datos genera el resumen completo agrupado y lo ordena según la suma monetaria calculada.",
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
        sort_order=23,
        hints=[
            "Usa alias: FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id.",
            "Indica las columnas deseadas en el SELECT."
        ],
        concept=ExerciseConcept(
            summary="`INNER JOIN` es el puente que une dos tablas diferentes basándose en un dato que comparten (como el ID del cliente). Solo muestra filas donde haya coincidencia en ambos lados.",
            syntax="SELECT p.pedido_id, c.nombre, c.apellido, p.total\nFROM pedidos p\nINNER JOIN clientes c ON p.cliente_id = c.cliente_id;",
            key_points=[
                "`FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id` conecta las dos tablas.",
                "Usar alias cortos (`p` y `c`) hace que tu código sea mucho más fácil y rápido de leer.",
                "Si un pedido no tiene cliente, o un cliente no tiene pedidos, el `INNER JOIN` no lo mostrará."
            ],
            execution_order_note="💡 La base de datos compara las claves comunes y arma una sola fila combinada en memoria por cada coincidencia.",
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
        prompt="Calcula cuánto dinero ha gastado en total cada uno de nuestros clientes. Cruza `clientes` y `pedidos`, y muestra el `cliente_id`, `nombre`, `apellido` y la suma de todas sus compras bajo el nombre `total_gastado`, ordenando de mayor a menor gasto.",
        initial_code="-- Cruza clientes y pedidos y agrupa para sumar el gasto\nSELECT ",
        solution_query="SELECT c.cliente_id, c.nombre, c.apellido, SUM(p.total) AS total_gastado FROM clientes c INNER JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre, c.apellido ORDER BY total_gastado DESC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=24,
        hints=[
            "Recuerda incluir todas las columnas que no son funciones en el GROUP BY: GROUP BY c.cliente_id, c.nombre, c.apellido.",
            "Ordena al final por total_gastado DESC."
        ],
        concept=ExerciseConcept(
            summary="Unir (`JOIN`) y luego agrupar (`GROUP BY`) es uno de los superpoderes más utilizados en SQL: cruzas datos de dos tablas y calculas un total por cada persona.",
            syntax="SELECT c.cliente_id, c.nombre, SUM(p.total) AS total_gastado\nFROM clientes c\nINNER JOIN pedidos p ON c.cliente_id = p.cliente_id\nGROUP BY c.cliente_id, c.nombre\nORDER BY total_gastado DESC;",
            key_points=[
                "Cruza `clientes` y `pedidos` mediante `cliente_id`.",
                "Agrupa por los datos del cliente (`c.cliente_id, c.nombre, c.apellido`).",
                "`SUM(p.total) AS total_gastado` suma todas las compras de cada cliente.",
                "`ORDER BY total_gastado DESC` pone al mejor comprador arriba de todo."
            ],
            execution_order_note="💡 El motor empareja primero los pedidos de cada cliente y después suma el dinero por cada grupo.",
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
        sort_order=25,
        hints=[
            "FROM productos p INNER JOIN categorias c ON p.categoria_id = c.categoria_id.",
            "Ordena con ORDER BY c.nombre_categoria ASC, p.nombre_producto ASC."
        ],
        concept=ExerciseConcept(
            summary="En bases de datos relacionales, los nombres descriptivos se guardan en una tabla aparte para no repetir texto. Con `INNER JOIN` los traes a la vista fácilmente.",
            syntax="SELECT p.producto_id, p.nombre_producto, c.nombre_categoria, p.precio\nFROM productos p\nINNER JOIN categorias c ON p.categoria_id = c.categoria_id\nORDER BY c.nombre_categoria ASC, p.nombre_producto ASC;",
            key_points=[
                "Une `productos p` con `categorias c` usando `ON p.categoria_id = c.categoria_id`.",
                "Ahora puedes mostrar `c.nombre_categoria` en vez de un simple número.",
                "`ORDER BY c.nombre_categoria ASC, p.nombre_producto ASC` organiza la lista alfabéticamente."
            ],
            execution_order_note="💡 PostgreSQL reemplaza la clave numérica buscando instantáneamente en el índice de categorías.",
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
        prompt="Compras necesita saber de qué país proviene cada producto. Cruza `productos` con `proveedores` y muestra `producto_id`, `nombre_producto`, `nombre_proveedor` y el país del proveedor bajo el nombre `pais_proveedor`. Ordena los productos alfabéticamente.",
        initial_code="-- Relaciona productos con sus proveedores\nSELECT ",
        solution_query="SELECT pr.producto_id, pr.nombre_producto, pv.nombre_proveedor, pv.pais AS pais_proveedor FROM productos pr INNER JOIN proveedores pv ON pr.proveedor_id = pv.proveedor_id ORDER BY pr.nombre_producto ASC;",
        xp_reward=45,
        difficulty="Intermedio",
        check_order=True,
        sort_order=26,
        hints=[
            "Usa INNER JOIN entre productos y proveedores conectando proveedor_id.",
            "No olvides asignar el alias pais_proveedor a la columna pais."
        ],
        concept=ExerciseConcept(
            summary="Conectar los artículos con las empresas que los fabrican te permite rastrear el origen de tu inventario en un instante.",
            syntax="SELECT pr.producto_id, pr.nombre_producto, pv.nombre_proveedor, pv.pais AS pais_proveedor\nFROM productos pr\nINNER JOIN proveedores pv ON pr.proveedor_id = pv.proveedor_id\nORDER BY pr.nombre_producto ASC;",
            key_points=[
                "Conecta `productos pr` con `proveedores pv` mediante `proveedor_id`.",
                "Renombra la columna del país con `pv.pais AS pais_proveedor`.",
                "`ORDER BY pr.nombre_producto ASC` organiza de la A a la Z."
            ],
            execution_order_note="💡 Se cruzan los registros emparejando la clave del proveedor presente en la ficha de cada producto.",
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
        sort_order=27,
        hints=[
            "Cruza mediante factura_id y añade la condición WHERE pg.estado_pago = 'aprobado'.",
            "Ordena con ORDER BY f.factura_id ASC."
        ],
        concept=ExerciseConcept(
            summary="Combinar `INNER JOIN` con un filtro `WHERE` te permite conciliar registros financieros descartando intentos fallidos o pendientes.",
            syntax="SELECT f.factura_id, f.monto_total, pg.metodo_pago, pg.fecha_pago\nFROM facturas f\nINNER JOIN pagos pg ON f.factura_id = pg.factura_id\nWHERE pg.estado_pago = 'aprobado'\nORDER BY f.factura_id ASC;",
            key_points=[
                "Une `facturas f` y `pagos pg` mediante `factura_id`.",
                "`WHERE pg.estado_pago = 'aprobado'` descarta pagos rechazados o pendientes.",
                "Ordena de menor a mayor con `ORDER BY f.factura_id ASC`."
            ],
            execution_order_note="💡 Primero se emparejan las facturas con sus pagos y luego se filtran solo aquellos con estado aprobado.",
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
        sort_order=28,
        hints=[
            "Usa LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id.",
            "Filtra los que no tienen compra con WHERE p.pedido_id IS NULL;"
        ],
        concept=ExerciseConcept(
            summary="El `LEFT JOIN` conserva a todos los clientes (incluso los que no tienen compras). Cuando un cliente no ha comprado nada, el pedido queda vacío (`NULL`). Si filtras con `WHERE p.pedido_id IS NULL`, ¡encuentras a los inactivos!",
            syntax="SELECT c.cliente_id, c.nombre, c.apellido\nFROM clientes c\nLEFT JOIN pedidos p ON c.cliente_id = p.cliente_id\nWHERE p.pedido_id IS NULL;",
            key_points=[
                "`FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id` conserva a todos los clientes.",
                "`WHERE p.pedido_id IS NULL` se queda únicamente con los clientes sin compras.",
                "En SQL nunca se escribe `= NULL`; siempre se escribe `IS NULL`."
            ],
            execution_order_note="💡 `LEFT JOIN` rellena con valores `NULL` a la derecha cuando no encuentra coincidencias, permitiendo aislar registros sin actividad.",
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
        sort_order=29,
        hints=[
            "Escribe: FROM productos p LEFT JOIN detalle_pedidos dp ON p.producto_id = dp.producto_id WHERE dp.detalle_id IS NULL;"
        ],
        concept=ExerciseConcept(
            summary="La técnica de buscar ausencias con `LEFT JOIN ... WHERE campo IS NULL` es la forma más rápida y estándar en SQL de encontrar productos o elementos olvidados.",
            syntax="SELECT p.producto_id, p.nombre_producto\nFROM productos p\nLEFT JOIN detalle_pedidos dp ON p.producto_id = dp.producto_id\nWHERE dp.detalle_id IS NULL;",
            key_points=[
                "Cruza `productos p` con `detalle_pedidos dp` usando `LEFT JOIN` sobre `producto_id`.",
                "Filtra con `WHERE dp.detalle_id IS NULL` para hallar los productos que nadie ha comprado jamás."
            ],
            execution_order_note="💡 Los productos que nunca se incluyeron en un pedido tendrán `dp.detalle_id = NULL` en el resultado del `LEFT JOIN`.",
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
        title="Facturas Pendientes de Cobro (Anti-Join)",
        prompt="Tesorería necesita una lista de facturas emitidas que todavía no tienen ningún pago registrado. Haz un `LEFT JOIN` entre `facturas` y `pagos` para obtener `factura_id`, `pedido_id`, `fecha_emision` y `monto_total` de aquellas facturas sin ningún abono. Ordena por `factura_id` ascendente.",
        initial_code="-- Identifica facturas sin pagos registrados\nSELECT ",
        solution_query="SELECT f.factura_id, f.pedido_id, f.fecha_emision, f.monto_total FROM facturas f LEFT JOIN pagos p ON f.factura_id = p.factura_id WHERE p.pago_id IS NULL ORDER BY f.factura_id ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=30,
        hints=[
            "Asegúrate de unir sobre factura_id y filtrar con WHERE p.pago_id IS NULL.",
            "Ordena al final con ORDER BY f.factura_id ASC."
        ],
        concept=ExerciseConcept(
            summary="Encontrar facturas sin pagos es fundamental para el control de cobros. `LEFT JOIN` mantiene todas las facturas y `WHERE p.pago_id IS NULL` localiza las que están impagadas.",
            syntax="SELECT f.factura_id, f.pedido_id, f.fecha_emision, f.monto_total\nFROM facturas f\nLEFT JOIN pagos p ON f.factura_id = p.factura_id\nWHERE p.pago_id IS NULL\nORDER BY f.factura_id ASC;",
            key_points=[
                "Une `facturas f` con `pagos p` mediante `factura_id` usando `LEFT JOIN`.",
                "`WHERE p.pago_id IS NULL` descarta cualquier factura que ya haya recibido al menos un pago.",
                "`ORDER BY f.factura_id ASC` presenta las facturas en orden numérico."
            ],
            execution_order_note="💡 Las facturas sin cobros generarán una fila con `pago_id = NULL` que es capturada por el filtro `WHERE`.",
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
        title="Productos Fuera del Almacén Central (Anti-Join Condicional)",
        prompt="El responsable del almacén central de Madrid (`almacen_id = 1`) quiere saber qué productos del catálogo NO disponen de existencias en ese almacén en particular. Conecta `productos` con `inventario` mediante un `LEFT JOIN` acotado al almacén 1 y muestra el `producto_id` y `nombre_producto` de los artículos ausentes en ese almacén, ordenados por `producto_id` ascendente.",
        initial_code="-- Detecta productos no inventariados en el almac\u00e9n 1\nSELECT ",
        solution_query="SELECT p.producto_id, p.nombre_producto FROM productos p LEFT JOIN inventario i ON p.producto_id = i.producto_id AND i.almacen_id = 1 WHERE i.almacen_id IS NULL ORDER BY p.producto_id ASC;",
        xp_reward=50,
        difficulty="Intermedio",
        check_order=True,
        sort_order=31,
        hints=[
            "Coloca AND i.almacen_id = 1 dentro de la cláusula ON del LEFT JOIN.",
            "En el WHERE usa: WHERE i.almacen_id IS NULL."
        ],
        concept=ExerciseConcept(
            summary="Puedes poner condiciones adicionales dentro del `ON` de un `LEFT JOIN`. Así le dices a SQL: 'búscame inventario pero SOLO del almacén 1', y luego filtras los que resulten nulos.",
            syntax="SELECT p.producto_id, p.nombre_producto\nFROM productos p\nLEFT JOIN inventario i ON p.producto_id = i.producto_id AND i.almacen_id = 1\nWHERE i.almacen_id IS NULL\nORDER BY p.producto_id ASC;",
            key_points=[
                "`LEFT JOIN inventario i ON p.producto_id = i.producto_id AND i.almacen_id = 1` acota la búsqueda al almacén 1.",
                "`WHERE i.almacen_id IS NULL` detecta los productos que no existen en ese almacén.",
                "`ORDER BY p.producto_id ASC` los ordena de menor a mayor."
            ],
            execution_order_note="💡 La condición en el `ON` restringe la búsqueda en la tabla derecha antes de cruzarla con la tabla de productos.",
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
        sort_order=32,
        hints=[
            "No uses COUNT(*); usa COUNT(p.pedido_id) para que a los que no han comprado les salga 0.",
            "Ordena con ORDER BY total_pedidos DESC, c.cliente_id ASC."
        ],
        concept=ExerciseConcept(
            summary="Un truco clave de SQL: `COUNT(*)` cuenta filas físicas (y a un cliente sin pedidos le contaría 1 por la fila de nulos), mientras que `COUNT(p.pedido_id)` ignora los nulos y devuelve un 0 exacto.",
            syntax="SELECT c.cliente_id, c.nombre, COUNT(p.pedido_id) AS total_pedidos\nFROM clientes c\nLEFT JOIN pedidos p ON c.cliente_id = p.cliente_id\nGROUP BY c.cliente_id, c.nombre\nORDER BY total_pedidos DESC;",
            key_points=[
                "Usa `LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id` para no perder a ningún cliente.",
                "`COUNT(p.pedido_id) AS total_pedidos` cuenta solo pedidos reales y pone 0 si no hay ninguno.",
                "`GROUP BY c.cliente_id, c.nombre, c.apellido` agrupa por cliente.",
                "`ORDER BY total_pedidos DESC, c.cliente_id ASC` desempata en orden."
            ],
            execution_order_note="💡 Al contar una columna específica de la tabla derecha (`p.pedido_id`), SQL descarta automáticamente las filas con `NULL`.",
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
        sort_order=33,
        hints=[
            "Encadena los JOINs: pedidos -> clientes, pedidos -> detalle_pedidos -> productos -> categorias.",
            "Usa c.nombre AS cliente_nombre y aplica LIMIT 10 al final."
        ],
        concept=ExerciseConcept(
            summary="En bases de datos reales, la información está repartida en varias tablas especializadas. Conectar tablas en cascada con varios `INNER JOIN` te permite armar la historia completa de una venta.",
            syntax="SELECT p.pedido_id, c.nombre AS cliente_nombre, pr.nombre_producto, cat.nombre_categoria, dp.cantidad, dp.precio_unitario\nFROM pedidos p\nINNER JOIN clientes c ON p.cliente_id = c.cliente_id\nINNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id\nINNER JOIN productos pr ON dp.producto_id = pr.producto_id\nINNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id\nORDER BY p.pedido_id ASC, pr.nombre_producto ASC LIMIT 10;",
            key_points=[
                "Encadena cada tabla con su vecina usando su clave común (`pedidos` con `clientes`, `pedidos` con `detalle_pedidos`, `detalle_pedidos` con `productos`, `productos` con `categorias`).",
                "`LIMIT 10` te muestra una muestra de las primeras 10 líneas de compra."
            ],
            execution_order_note="💡 El motor va conectando cada tabla paso a paso como si fueran eslabones de una cadena.",
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
        sort_order=34,
        hints=[
            "Cruza las tablas necesarias para llegar de clientes a categorías pasando por pedidos y detalle.",
            "Agrupa por c.ciudad y cat.nombre_categoria."
        ],
        concept=ExerciseConcept(
            summary="Al cruzar varias tablas puedes combinar datos geográficos (ciudad) con datos de producto (categoría) y calcular totales de negocio muy potentes.",
            syntax="SELECT c.ciudad, cat.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS monto_vendido\nFROM clientes c\nINNER JOIN pedidos p ON c.cliente_id = p.cliente_id\nINNER JOIN detalle_pedidos dp ON p.pedido_id = dp.pedido_id\nINNER JOIN productos pr ON dp.producto_id = pr.producto_id\nINNER JOIN categorias cat ON pr.categoria_id = cat.categoria_id\nGROUP BY c.ciudad, cat.nombre_categoria\nORDER BY c.ciudad ASC, monto_vendido DESC;",
            key_points=[
                "Multiplica cantidad por precio para cada artículo: `dp.cantidad * dp.precio_unitario`.",
                "Suma el total con `SUM(...) AS monto_vendido`.",
                "`GROUP BY c.ciudad, cat.nombre_categoria` agrupa por ambos criterios.",
                "`ORDER BY c.ciudad ASC, monto_vendido DESC` organiza las ciudades y sus categorías estrella."
            ],
            execution_order_note="💡 La base de datos calcula las ventas de cada fila y luego las acumula en la combinación de ciudad y categoría correspondiente.",
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
        sort_order=35,
        hints=[
            "pedidos p INNER JOIN facturas f ON p.pedido_id = f.pedido_id INNER JOIN pagos pg ON f.factura_id = pg.factura_id.",
            "Renombra los montos con AS monto_factura y AS monto_pago."
        ],
        concept=ExerciseConcept(
            summary="Conectar pedidos, facturas y pagos te permite asegurar que cada orden comercial tenga su comprobante y su pago bancario registrado con exactitud.",
            syntax="SELECT p.pedido_id, p.cliente_id, f.monto_total AS monto_factura, pg.monto AS monto_pago, pg.metodo_pago\nFROM pedidos p\nINNER JOIN facturas f ON p.pedido_id = f.pedido_id\nINNER JOIN pagos pg ON f.factura_id = pg.factura_id\nORDER BY p.pedido_id ASC;",
            key_points=[
                "Une `pedidos p` con `facturas f` mediante `pedido_id`.",
                "Une `facturas f` con `pagos pg` mediante `factura_id`.",
                "Usa los alias `monto_factura` y `monto_pago` para distinguir los importes claramente."
            ],
            execution_order_note="💡 Se enlazan los tres eslabones comerciales: la orden original, el documento fiscal y la transacción financiera.",
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
        sort_order=36,
        hints=[
            "Une productos a inventario y luego inventario a almacenes.",
            "Filtra con WHERE i.cantidad_disponible > 10."
        ],
        concept=ExerciseConcept(
            summary="La tabla `inventario` actúa como un puente entre productos y almacenes. Conectar las tres tablas te permite saber exactamente cuánto stock hay de cada artículo en cada ciudad.",
            syntax="SELECT pr.nombre_producto, a.nombre_almacen, a.ciudad, i.cantidad_disponible\nFROM productos pr\nINNER JOIN inventario i ON pr.producto_id = i.producto_id\nINNER JOIN almacenes a ON i.almacen_id = a.almacen_id\nWHERE i.cantidad_disponible > 10\nORDER BY pr.nombre_producto ASC, a.nombre_almacen ASC;",
            key_points=[
                "Conecta `productos` con `inventario` mediante `producto_id`.",
                "Conecta `inventario` con `almacenes` mediante `almacen_id`.",
                "`WHERE i.cantidad_disponible > 10` filtra existencias suficientes.",
                "`ORDER BY pr.nombre_producto ASC, a.nombre_almacen ASC` ordena con prolijidad."
            ],
            execution_order_note="💡 Se resuelve la relación entre productos y ubicaciones mediante la tabla intermedia de existencias.",
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
        sort_order=37,
        hints=[
            "SELECT ciudad, 'cliente' AS tipo_entidad FROM clientes UNION SELECT ciudad, 'almacen' AS tipo_entidad FROM almacenes...",
            "Coloca el ORDER BY al final de la instrucción."
        ],
        concept=ExerciseConcept(
            summary="`UNION` te permite 'apilar' verticalmente los resultados de dos consultas diferentes en una sola lista final, eliminando filas repetidas automáticamente.",
            syntax="SELECT ciudad, 'cliente' AS tipo_entidad FROM clientes\nUNION\nSELECT ciudad, 'almacen' AS tipo_entidad FROM almacenes\nORDER BY ciudad ASC, tipo_entidad ASC;",
            key_points=[
                "Ambas consultas deben devolver la misma cantidad de columnas con tipos compatibles.",
                "`UNION` junta los resultados de la consulta de clientes con los de la consulta de almacenes.",
                "El `ORDER BY` se coloca una sola vez al final de todo el bloque."
            ],
            execution_order_note="💡 PostgreSQL ejecuta las dos consultas por separado, fusiona los resultados y descarta duplicados antes de ordenar.",
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
        sort_order=38,
        hints=[
            "Escribe: SELECT ciudad FROM clientes EXCEPT SELECT ciudad FROM almacenes ORDER BY ciudad ASC;"
        ],
        concept=ExerciseConcept(
            summary="`EXCEPT` compara dos listas y te devuelve lo que está en la primera lista pero NO en la segunda (como una resta matemática de conjuntos).",
            syntax="SELECT ciudad FROM clientes\nEXCEPT\nSELECT ciudad FROM almacenes\nORDER BY ciudad ASC;",
            key_points=[
                "`SELECT ciudad FROM clientes` obtiene las ciudades con clientes.",
                "`EXCEPT SELECT ciudad FROM almacenes` quita cualquier ciudad donde ya tengamos un almacén.",
                "Es ideal para detectar zonas desatendidas o mercados potenciales."
            ],
            execution_order_note="💡 El motor busca los elementos únicos del primer conjunto y elimina cualquiera que coincida con el segundo conjunto.",
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
        sort_order=39,
        hints=[
            "FROM almacenes a CROSS JOIN categorias c (sin ON).",
            "Ordena por a.nombre_almacen ASC, c.nombre_categoria ASC."
        ],
        concept=ExerciseConcept(
            summary="`CROSS JOIN` combina cada fila de una tabla con todas las filas de la otra (producto cartesiano). Si tienes 3 almacenes y 5 categorías, te devolverá 15 combinaciones.",
            syntax="SELECT a.nombre_almacen, c.nombre_categoria\nFROM almacenes a\nCROSS JOIN categorias c\nORDER BY a.nombre_almacen ASC, c.nombre_categoria ASC;",
            key_points=[
                "A diferencia de otros JOINs, `CROSS JOIN` no lleva cláusula `ON` porque combina todos contra todos.",
                "Es muy útil para crear matrices de cobertura, calendarios o combinaciones de prueba."
            ],
            execution_order_note="💡 La base de datos multiplica las filas de la tabla A por las de la tabla B para generar la cuadrícula completa.",
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
        sort_order=40,
        hints=[
            "ON p1.categoria_id = p2.categoria_id AND p1.producto_id < p2.producto_id.",
            "Ordena con ORDER BY p1.categoria_id ASC, producto_a ASC, producto_b ASC."
        ],
        concept=ExerciseConcept(
            summary="Un `SELF JOIN` consiste en unir una tabla consigo misma (usando dos alias distintos como `p1` y `p2`). El truco `p1.id < p2.id` evita comparar un producto consigo mismo y evita duplicar parejas como (A, B) y (B, A).",
            syntax="SELECT p1.categoria_id, p1.nombre_producto AS producto_a, p2.nombre_producto AS producto_b\nFROM productos p1\nINNER JOIN productos p2 ON p1.categoria_id = p2.categoria_id AND p1.producto_id < p2.producto_id\nORDER BY p1.categoria_id ASC, producto_a ASC, producto_b ASC;",
            key_points=[
                "`FROM productos p1 INNER JOIN productos p2 ON p1.categoria_id = p2.categoria_id` busca productos de la misma familia.",
                "`AND p1.producto_id < p2.producto_id` garantiza parejas únicas sin repeticiones espejo.",
                "Renombra con `AS producto_a`, `AS producto_b`, `AS precio_a`, `AS precio_b`."
            ],
            execution_order_note="💡 La base de datos trata la tabla como si fueran dos copias independientes en memoria para hacer las combinaciones.",
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
        prompt="¿Qué productos se venden por encima del precio promedio de toda la tienda? Muestra el `nombre_producto` y su `precio` para aquellos artículos cuyo precio sea mayor al promedio general de precios de la tabla `productos`. Ordena de mayor a menor precio.",
        initial_code="-- Usa una subconsulta para comparar con el promedio global\nSELECT ",
        solution_query="SELECT nombre_producto, precio FROM productos WHERE precio > (SELECT AVG(precio) FROM productos) ORDER BY precio DESC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=41,
        hints=[
            "WHERE precio > (SELECT AVG(precio) FROM productos).",
            "Ordena al final con ORDER BY precio DESC."
        ],
        concept=ExerciseConcept(
            summary="Una subconsulta es una consulta dentro de otra. En lugar de calcular el promedio en un papel y escribirlo a mano, dejas que una pequeña subconsulta `(SELECT AVG(precio) FROM productos)` lo calcule automáticamente dentro de tu `WHERE`.",
            syntax="SELECT columna_1, columna_2\nFROM tabla\nWHERE columna > (SELECT AVG(columna) FROM tabla)\nORDER BY columna DESC;",
            key_points=[
                "La subconsulta va encerrada entre paréntesis: `WHERE precio > (SELECT AVG(precio) FROM productos)`.",
                "Al devolver un solo número (escalar), puedes compararlo directamente con `>`.",
                "`ORDER BY precio DESC` pone los más costosos primero."
            ],
            execution_order_note="💡 PostgreSQL calcula el promedio global una sola vez y luego compara cada producto contra esa cifra.",
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
        title="Clientes con Pedidos de Alto Monto (IN Subquery)",
        prompt="Identifica a nuestros clientes VIP: aquellos que han hecho al menos un pedido importante (de 1000€ o más). Consulta la tabla `clientes` y muestra `cliente_id`, `nombre`, `apellido` y `email`, filtrando con una subconsulta usando el operador `IN` sobre la tabla `pedidos`. Ordena por `cliente_id` ascendente.",
        initial_code="-- Filtra clientes con una subconsulta en IN\nSELECT ",
        solution_query="SELECT cliente_id, nombre, apellido, email FROM clientes WHERE cliente_id IN (SELECT cliente_id FROM pedidos WHERE total >= 1000) ORDER BY cliente_id ASC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=42,
        hints=[
            "Usa WHERE cliente_id IN (SELECT cliente_id FROM pedidos WHERE total >= 1000).",
            "Ordena con ORDER BY cliente_id ASC."
        ],
        concept=ExerciseConcept(
            summary="Puedes usar `IN (SELECT ...)` para pedirle a una subconsulta la lista de IDs que cumplen una regla y usarla de filtro en tu consulta principal.",
            syntax="SELECT cliente_id, nombre, email\nFROM clientes\nWHERE cliente_id IN (\n    SELECT cliente_id FROM pedidos WHERE total >= 1000\n)\nORDER BY cliente_id ASC;",
            key_points=[
                "`WHERE cliente_id IN (SELECT cliente_id FROM pedidos WHERE total >= 1000)` encuentra a los clientes que tienen compras grandes.",
                "La consulta externa obtiene los nombres limpios de la tabla de clientes.",
                "`ORDER BY cliente_id ASC` los presenta en orden."
            ],
            execution_order_note="💡 La subconsulta genera la lista de clientes con compras grandes y la consulta principal extrae sus datos personales.",
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
        difficulty="Intermedio",
        check_order=True,
        sort_order=43,
        hints=[
            "WHERE EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.cliente_id AND p.estado_pedido = 'completado').",
            "Ordena con ORDER BY c.cliente_id ASC."
        ],
        concept=ExerciseConcept(
            summary="`EXISTS` comprueba si una subconsulta encuentra al menos una coincidencia. Es súper eficiente porque tan pronto como encuentra una sola fila que coincida, se detiene y da el visto bueno sin revisar las demás.",
            syntax="SELECT c.cliente_id, c.nombre\nFROM clientes c\nWHERE EXISTS (\n    SELECT 1 FROM pedidos p\n    WHERE p.cliente_id = c.cliente_id AND p.estado = 'completado'\n)\nORDER BY c.cliente_id ASC;",
            key_points=[
                "`WHERE EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.cliente_id AND p.estado_pedido = 'completado')`.",
                "Se suele escribir `SELECT 1` dentro de `EXISTS` porque lo único que importa es si la fila existe o no.",
                "Es una subconsulta conectada (correlacionada) con el cliente de la fila actual."
            ],
            execution_order_note="💡 Cortocircuito: la base de datos deja de buscar en cuanto encuentra la primera compra completada de ese cliente.",
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
        prompt="Clasifica los pedidos según su valor para organizar la entrega. Muestra el `pedido_id`, el `total` y una nueva columna llamada `segmento` que diga: si el total es de 1000€ o más asigna `'Alto Valor'`, si es de 300€ o más asigna `'Medio Valor'`, y para el resto `'Bajo Valor'`. Ordena de mayor a menor total.",
        initial_code="-- Clasifica los pedidos en tres segmentos seg\u00fan su monto\nSELECT ",
        solution_query="SELECT pedido_id, total, CASE WHEN total >= 1000 THEN 'Alto Valor' WHEN total >= 300 THEN 'Medio Valor' ELSE 'Bajo Valor' END AS segmento FROM pedidos ORDER BY total DESC;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=44,
        hints=[
            "CASE WHEN total >= 1000 THEN 'Alto Valor' WHEN total >= 300 THEN 'Medio Valor' ELSE 'Bajo Valor' END AS segmento.",
            "Ordena al final por total DESC."
        ],
        concept=ExerciseConcept(
            summary="`CASE` es como el `SI` o `IF` de la programación: te permite evaluar condiciones fila por fila y asignar una categoría o texto según lo que se cumpla.",
            syntax="SELECT col1, col2,\n       CASE\n         WHEN valor >= lim1 THEN 'Cat A'\n         WHEN valor >= lim2 THEN 'Cat B'\n         ELSE 'Cat C'\n       END AS clasificacion\nFROM tabla;",
            key_points=[
                "La estructura siempre empieza con `CASE` y termina con `END AS nombre_columna`.",
                "`WHEN condicion THEN 'resultado'` evalúa en orden; la primera regla que se cumpla gana.",
                "`ELSE 'resultado'` cubre todo lo demás que no haya entrado en las reglas anteriores."
            ],
            execution_order_note="💡 Para cada fila, PostgreSQL evalúa las condiciones de arriba a abajo y asigna la etiqueta correspondiente.",
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
        prompt="Clasifica los productos dentro de cada categoría del más caro al más barato. Muestra `categoria_id`, `nombre_producto`, `precio` y una columna con el puesto que ocupa llamada `ranking_categoria` usando `DENSE_RANK()`, dividiendo por categoría y ordenando de mayor a menor precio. Ordena por `categoria_id ASC` y `ranking_categoria ASC`.",
        initial_code="-- Usa DENSE_RANK() particionado por categoria_id\nSELECT ",
        solution_query="SELECT categoria_id, nombre_producto, precio, DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria FROM productos ORDER BY categoria_id ASC, ranking_categoria ASC;",
        xp_reward=65,
        difficulty="Intermedio",
        check_order=True,
        sort_order=45,
        hints=[
            "Usa DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria.",
            "Ordena por categoria_id ASC, ranking_categoria ASC al final."
        ],
        concept=ExerciseConcept(
            summary="Las funciones de ventana calculan rankings o acumulados sin aplastar las filas. `PARTITION BY categoria_id` reinicia el contador #1, #2, #3 en cada categoría, y `DENSE_RANK()` no deja huecos si hay empates.",
            syntax="SELECT categoria_id, nombre_producto, precio,\n       DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria\nFROM productos\nORDER BY categoria_id ASC, ranking_categoria ASC;",
            key_points=[
                "`DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS ranking_categoria`.",
                "`PARTITION BY` actúa como un mini-agrupador para que cada categoría tenga su propio primer lugar.",
                "A diferencia de GROUP BY, aquí no desaparecen las filas individuales de productos."
            ],
            execution_order_note="💡 La base de datos organiza los productos por categoría en memoria y asigna los puestos antes de mostrar la tabla.",
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
        title="Pivoteo Manual de Ventas por Estado (Conditional Aggregation)",
        prompt="Crea una tabla resumen que muestre cuánto dinero tiene cada cliente en compras completadas y cuánto en compras pendientes. Muestra el `cliente_id`, la suma de compras completadas bajo el nombre `ventas_completadas` (sumando el total cuando el estado sea `'completado'` y 0 si no) y la suma de compras pendientes bajo `ventas_pendientes` (sumando el total cuando sea `'pendiente'` y 0 si no). Agrupa y ordena por `cliente_id` ascendente.",
        initial_code="-- Agregaci\u00f3n condicional con CASE dentro de SUM\nSELECT ",
        solution_query="SELECT cliente_id, SUM(CASE WHEN estado_pedido = 'completado' THEN total ELSE 0 END) AS ventas_completadas, SUM(CASE WHEN estado_pedido = 'pendiente' THEN total ELSE 0 END) AS ventas_pendientes FROM pedidos GROUP BY cliente_id ORDER BY cliente_id ASC;",
        xp_reward=60,
        difficulty="Intermedio",
        check_order=True,
        sort_order=45,
        hints=[
            "Usa SUM(CASE WHEN estado_pedido = 'completado' THEN total ELSE 0 END) AS ventas_completadas.",
            "Haz lo mismo para pendientes y agrupa por cliente_id."
        ],
        concept=ExerciseConcept(
            summary="Poner un `CASE` dentro de una función `SUM()` es un truco maestro de SQL para transformar valores de filas en columnas separadas (técnica de pivoteo de datos).",
            syntax="SELECT cliente_id,\n       SUM(CASE WHEN estado = 'A' THEN monto ELSE 0 END) AS total_a,\n       SUM(CASE WHEN estado = 'B' THEN monto ELSE 0 END) AS total_b\nFROM pedidos\nGROUP BY cliente_id\nORDER BY cliente_id ASC;",
            key_points=[
                "`SUM(CASE WHEN estado_pedido = 'completado' THEN total ELSE 0 END) AS ventas_completadas` suma solo las ventas hechas.",
                "`SUM(CASE WHEN estado_pedido = 'pendiente' THEN total ELSE 0 END) AS ventas_pendientes` suma lo pendiente.",
                "`GROUP BY cliente_id` condensa los resultados por cada cliente individual."
            ],
            execution_order_note="💡 Cada fila se evalúa por separado: si cumple la regla suma su monto, si no suma 0, produciendo dos columnas limpias.",
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
        prompt="Prepara un reporte ordenado de facturación por categoría usando una expresión `WITH` (CTE). Crea una tabla temporal llamada `ventas_por_categoria` que sume las ventas (`SUM(dp.cantidad * dp.precio_unitario)`) como `facturacion` agrupando por `nombre_categoria`. Luego, consulta esa tabla temporal para mostrar `nombre_categoria` y `facturacion` ordenados de mayor a menor facturación.",
        initial_code="-- Estructura la consulta anal\u00edtica usando WITH ... AS\nWITH ",
        solution_query="WITH ventas_por_categoria AS (SELECT c.nombre_categoria, SUM(dp.cantidad * dp.precio_unitario) AS facturacion FROM categorias c INNER JOIN productos pr ON c.categoria_id = pr.categoria_id INNER JOIN detalle_pedidos dp ON pr.producto_id = dp.producto_id GROUP BY c.nombre_categoria) SELECT nombre_categoria, facturacion FROM ventas_por_categoria ORDER BY facturacion DESC;",
        xp_reward=60,
        difficulty="Intermedio",
        check_order=True,
        sort_order=46,
        hints=[
            "WITH ventas_por_categoria AS (SELECT c.nombre_categoria, SUM(...) AS facturacion FROM ... GROUP BY c.nombre_categoria) SELECT ...",
            "Ordena por facturacion DESC."
        ],
        concept=ExerciseConcept(
            summary="Una CTE (`WITH ... AS`) es como crear una pequeña tabla temporal con nombre dentro de tu consulta. Hace que las consultas largas sean súper limpias y fáciles de entender por pasos.",
            syntax="WITH nombre_cte AS (\n    SELECT clave, SUM(monto) AS total\n    FROM tabla\n    GROUP BY clave\n)\nSELECT clave, total\nFROM nombre_cte\nORDER BY total DESC;",
            key_points=[
                "Empieza con `WITH nombre_temporal AS (SELECT ...)`.",
                "Después de cerrar el paréntesis, escribes tu consulta principal llamando a esa tabla temporal como si fuera una tabla normal.",
                "Ayuda a que cualquiera que lea tu código entienda la lógica paso a paso."
            ],
            execution_order_note="💡 PostgreSQL calcula el bloque del `WITH` y deja el resultado listo en memoria para la consulta final.",
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
        title="CTEs Múltiples Encadenadas (Pipeline de Datos)",
        prompt="Construye un análisis por pasos usando dos CTEs encadenadas para encontrar a los clientes que gastan más que el promedio de todos los clientes. Primero crea `gasto_clientes` con el `cliente_id` y su gasto total (`SUM(total) AS total_gastado`). Luego crea `promedio_general` que calcule el promedio (`AVG(total_gastado) AS gasto_medio`) a partir de la primera. Finalmente, muestra `cliente_id` y `total_gastado` de aquellos clientes cuyo gasto supere el promedio general, ordenados de mayor a menor gasto.",
        initial_code="-- Encadena dos CTEs separadas por coma\nWITH ",
        solution_query="WITH gasto_clientes AS (SELECT cliente_id, SUM(total) AS total_gastado FROM pedidos GROUP BY cliente_id), promedio_general AS (SELECT AVG(total_gastado) AS gasto_medio FROM gasto_clientes) SELECT g.cliente_id, g.total_gastado FROM gasto_clientes g, promedio_general p WHERE g.total_gastado > p.gasto_medio ORDER BY g.total_gastado DESC;",
        xp_reward=60,
        difficulty="Intermedio",
        check_order=True,
        sort_order=47,
        hints=[
            "Separa las dos CTEs con una coma: WITH gasto_clientes AS (...), promedio_general AS (...).",
            "En la consulta final filtra WHERE g.total_gastado > p.gasto_medio ORDER BY g.total_gastado DESC."
        ],
        concept=ExerciseConcept(
            summary="Puedes encadenar varias CTEs separándolas por coma bajo un solo `WITH`. Cada paso puede usar los resultados del paso anterior, creando un pipeline analítico limpio y ordenado.",
            syntax="WITH cte_1 AS (\n    SELECT ...\n),\ncte_2 AS (\n    SELECT ... FROM cte_1\n)\nSELECT ... FROM cte_1, cte_2 WHERE ...;",
            key_points=[
                "`WITH paso_1 AS (...), paso_2 AS (...)` encadena dos etapas de análisis.",
                "El paso 2 calcula el promedio sobre los datos generados por el paso 1.",
                "La consulta final filtra con `WHERE g.total_gastado > p.gasto_medio` y ordena."
            ],
            execution_order_note="💡 Se genera un flujo de datos en dos etapas secuenciales antes de emitir la respuesta definitiva.",
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
        prompt="Crea una lista clasificada de productos del más caro al más económico. Muestra `producto_id`, `nombre_producto`, `precio` y una columna llamada `ranking` con la posición consecutiva (1, 2, 3...) de cada producto usando `ROW_NUMBER()` ordenado por precio descendente.",
        initial_code="-- Emplea ROW_NUMBER() OVER (...)\nSELECT ",
        solution_query="SELECT producto_id, nombre_producto, precio, ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking FROM productos;",
        xp_reward=55,
        difficulty="Intermedio",
        check_order=True,
        sort_order=48,
        hints=[
            "Escribe: ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking en tu lista de columnas."
        ],
        concept=ExerciseConcept(
            summary="`ROW_NUMBER() OVER (ORDER BY columna DESC)` numera cada fila con un 1, 2, 3... correlativo según el criterio que elijas, sin colapsar ninguna fila.",
            syntax="SELECT producto_id, nombre_producto, precio,\n       ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking\nFROM productos;",
            key_points=[
                "Es la función de ventana más simple y directa para enumerar puestos.",
                "`OVER (ORDER BY precio DESC)` indica en qué orden se reparten los números.",
                "Conserva todas las filas de la tabla de productos."
            ],
            execution_order_note="💡 Se ordenan las filas temporalmente y se les estampa un número secuencial de arriba a abajo.",
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
        prompt="Analiza cuánto tiempo pasa entre una compra y otra para cada cliente. Muestra el `pedido_id`, `cliente_id`, la `fecha_pedido` y el valor de la fecha del pedido inmediatamente anterior bajo el nombre `fecha_pedido_anterior`, usando la función de ventana `LAG(fecha_pedido)` dividiendo por cliente y ordenando cronológicamente. Ordena los resultados finales por `cliente_id ASC` y `fecha_pedido ASC`.",
        initial_code="-- Emplea LAG() OVER (PARTITION BY ... ORDER BY ...)\nSELECT ",
        solution_query="SELECT pedido_id, cliente_id, fecha_pedido, LAG(fecha_pedido) OVER (PARTITION BY cliente_id ORDER BY fecha_pedido ASC) AS fecha_pedido_anterior FROM pedidos ORDER BY cliente_id ASC, fecha_pedido ASC;",
        xp_reward=60,
        difficulty="Intermedio",
        check_order=True,
        sort_order=50,
        hints=[
            "Usa LAG(fecha_pedido) OVER (PARTITION BY cliente_id ORDER BY fecha_pedido ASC) AS fecha_pedido_anterior.",
            "Ordena al final por cliente_id ASC, fecha_pedido ASC."
        ],
        concept=ExerciseConcept(
            summary="`LAG()` te permite mirar la fila anterior sin tener que cruzar la tabla consigo misma. Es la herramienta favorita para calcular días transcurridos entre dos eventos.",
            syntax="SELECT pedido_id, cliente_id, fecha_pedido,\n       LAG(fecha_pedido) OVER (PARTITION BY cliente_id ORDER BY fecha_pedido ASC) AS fecha_anterior\nFROM pedidos\nORDER BY cliente_id ASC, fecha_pedido ASC;",
            key_points=[
                "`LAG(fecha_pedido) OVER (PARTITION BY cliente_id ORDER BY fecha_pedido ASC) AS fecha_pedido_anterior`.",
                "Para el primer pedido de cada cliente, como no hay compra anterior, devolverá `NULL` (lo cual es normal y correcto).",
                "Permite estudiar la frecuencia de recompra de cada usuario de forma limpia."
            ],
            execution_order_note="💡 PostgreSQL guarda el valor de la fila anterior en memoria mientras recorre la partición del cliente en orden cronológico.",
        ),
        objectives=[
            "1. Dividir las transacciones por cliente ordenándolas en secuencia temporal.",
            "2. Recuperar el valor cronológico de la compra inmediatamente anterior.",
            "3. Proyectar la fecha previa y ordenar adecuadamente."
        ],
        sample_tables=[SAMPLE_TABLE_PEDIDOS],
    ),
}
