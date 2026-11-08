from typing import Dict, Any, List, Optional
from pydantic import BaseModel


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


# Catálogo semilla inicial para pruebas y fallback offline
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
        hints=["Usa la sentencia SELECT seguida de las columnas solicitadas separadas por coma.", "La cláusula FROM indica la tabla productos."]
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
        hints=["Agrega una cláusula WHERE después de FROM productos.", "Utiliza el operador de comparación mayor que (>)."]
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
        hints=["Usa WHERE pais = 'España'.", "Para ordenar utiliza ORDER BY apellido ASC."]
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
        hints=["Agrupa por categoria_id con GROUP BY.", "Para filtrar grupos agregados usa HAVING COUNT(*) > 2."]
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
        hints=["Usa INNER JOIN clientes c ON p.cliente_id = c.cliente_id.", "Proyecta p.pedido_id, c.nombre, c.apellido, p.total."]
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
            "Asegúrate de proyectar exactamente tres columnas: cliente_id, nombre y apellido."
        ]
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
        hints=["Usa la función ventana ROW_NUMBER() OVER (ORDER BY precio DESC) AS ranking."]
    )
}
