export type SqlReferenceCategory =
  | 'consultas'
  | 'filtros'
  | 'uniones'
  | 'agregacion'
  | 'avanzado'
  | 'modelado';

export interface SqlReferenceTerm {
  id: string;
  term: string;
  category: SqlReferenceCategory;
  summary: string;
  syntax: string;
  example: string;
  relatedModuleId?: string;
}

export const SQL_REFERENCE_CATEGORIES: { id: 'all' | SqlReferenceCategory; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'consultas', label: 'Consultas' },
  { id: 'filtros', label: 'Filtros' },
  { id: 'uniones', label: 'Uniones y conjuntos' },
  { id: 'agregacion', label: 'Agregación' },
  { id: 'avanzado', label: 'SQL avanzado' },
  { id: 'modelado', label: 'DDL & DML' },
];

export const SQL_REFERENCE_TERMS: SqlReferenceTerm[] = [
  {
    id: 'select',
    term: 'SELECT',
    category: 'consultas',
    summary: 'Muestra columnas o expresiones calculadas desde una o más tablas.',
    syntax: 'SELECT col1, col2 AS alias FROM tabla;',
    example: 'SELECT nombre_producto, precio FROM productos LIMIT 5;',
    relatedModuleId: 'a0000000-0000-0000-0000-000000000001',
  },
  {
    id: 'distinct',
    term: 'DISTINCT',
    category: 'consultas',
    summary: 'Elimina filas duplicadas del conjunto de salida para mostrar solo combinaciones únicas.',
    syntax: 'SELECT DISTINCT columna FROM tabla;',
    example: 'SELECT DISTINCT pais FROM clientes;',
    relatedModuleId: 'a0000000-0000-0000-0000-000000000001',
  },
  {
    id: 'as',
    term: 'AS (Alias)',
    category: 'consultas',
    summary: 'Asigna un nombre legible a una columna calculada o un alias corto a una tabla.',
    syntax: 'SELECT expresion AS nuevo_nombre FROM tabla AS t;',
    example: 'SELECT precio * stock AS valor_total FROM productos;',
    relatedModuleId: 'a0000000-0000-0000-0000-000000000001',
  },
  {
    id: 'round',
    term: 'ROUND()',
    category: 'consultas',
    summary: 'Redondea un valor numérico a un número específico de decimales.',
    syntax: 'ROUND(expresion_numerica, decimales)',
    example: 'SELECT ROUND(AVG(total), 2) AS ticket_promedio FROM pedidos;',
    relatedModuleId: 'a0000000-0000-0000-0000-000000000001',
  },
  {
    id: 'concat',
    term: '|| (Concatenación)',
    category: 'consultas',
    summary: 'Une dos o más cadenas de texto en una sola columna de salida.',
    syntax: "col1 || ' ' || col2",
    example: "SELECT nombre || ' ' || apellido AS cliente FROM clientes;",
    relatedModuleId: 'a0000000-0000-0000-0000-000000000001',
  },
  {
    id: 'order-by',
    term: 'ORDER BY',
    category: 'consultas',
    summary: 'Ordena las filas de forma ascendente (ASC) o descendente (DESC), con columnas extra para desempatar.',
    syntax: 'SELECT ... FROM tabla ORDER BY col1 DESC, col2 ASC;',
    example: 'SELECT nombre_producto, precio FROM productos ORDER BY precio DESC, producto_id ASC;',
    relatedModuleId: 'a0000000-0000-0000-0000-000000000003',
  },
  {
    id: 'limit-offset',
    term: 'LIMIT / OFFSET',
    category: 'consultas',
    summary: 'Restringe la cantidad de filas devueltas y permite saltar registros para paginación.',
    syntax: 'SELECT ... ORDER BY id LIMIT N OFFSET M;',
    example: 'SELECT pedido_id, total FROM pedidos ORDER BY total DESC, pedido_id ASC LIMIT 5;',
    relatedModuleId: 'a0000000-0000-0000-0000-000000000003',
  },
  {
    id: 'where',
    term: 'WHERE',
    category: 'filtros',
    summary: 'Filtra fila por fila conservando únicamente los registros que cumplen la condición booleana.',
    syntax: 'SELECT ... FROM tabla WHERE condicion;',
    example: "SELECT pedido_id, total FROM pedidos WHERE estado_pedido = 'completado';",
    relatedModuleId: 'a0000000-0000-0000-0000-000000000002',
  },
  {
    id: 'between',
    term: 'BETWEEN',
    category: 'filtros',
    summary: 'Verifica si un valor cae dentro de un rango cerrado (incluye ambos extremos).',
    syntax: 'WHERE columna BETWEEN minimo AND maximo',
    example: 'SELECT nombre_producto, precio FROM productos WHERE precio BETWEEN 100 AND 500;',
    relatedModuleId: 'a0000000-0000-0000-0000-000000000002',
  },
  {
    id: 'in',
    term: 'IN',
    category: 'filtros',
    summary: 'Comprueba si un valor coincide con alguno de los elementos de una lista o subconsulta.',
    syntax: 'WHERE columna IN (valor1, valor2, ...)',
    example: "SELECT nombre, pais FROM clientes WHERE pais IN ('España', 'México');",
    relatedModuleId: 'a0000000-0000-0000-0000-000000000002',
  },
  {
    id: 'like-ilike',
    term: 'LIKE / ILIKE',
    category: 'filtros',
    summary: 'Busca coincidencias parciales de texto usando % (varios caracteres) y _ (un carácter). ILIKE ignora mayúsculas en PostgreSQL.',
    syntax: "WHERE columna LIKE '%patron%'",
    example: "SELECT nombre, email FROM clientes WHERE email ILIKE '%@email.com';",
    relatedModuleId: 'a0000000-0000-0000-0000-000000000002',
  },
  {
    id: 'is-null',
    term: 'IS NULL / IS NOT NULL',
    category: 'filtros',
    summary: 'Evalúa ausencia o presencia de valor. En SQL nunca uses = NULL.',
    syntax: 'WHERE columna IS NULL',
    example: 'SELECT c.nombre FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id WHERE p.pedido_id IS NULL;',
    relatedModuleId: 'b0000000-0000-0000-0000-000000000006',
  },
  {
    id: 'count-sum-avg',
    term: 'COUNT / SUM / AVG / MIN / MAX',
    category: 'agregacion',
    summary: 'Funciones de agregación que resumen múltiples filas en un único valor estadístico.',
    syntax: 'SELECT COUNT(*), SUM(col), AVG(col), MIN(col), MAX(col) FROM tabla;',
    example: 'SELECT COUNT(*) AS total_pedidos, SUM(total) AS ingresos FROM pedidos;',
    relatedModuleId: 'a0000000-0000-0000-0000-000000000004',
  },
  {
    id: 'group-by',
    term: 'GROUP BY',
    category: 'agregacion',
    summary: 'Agrupa filas con valores iguales para calcular métricas agregadas por cada grupo.',
    syntax: 'SELECT grupo, COUNT(*) FROM tabla GROUP BY grupo;',
    example: 'SELECT estado_pedido, COUNT(*) AS cantidad FROM pedidos GROUP BY estado_pedido;',
    relatedModuleId: 'a0000000-0000-0000-0000-000000000004',
  },
  {
    id: 'having',
    term: 'HAVING',
    category: 'agregacion',
    summary: 'Filtra grupos completos después de ejecutar GROUP BY y las funciones de agregación.',
    syntax: 'SELECT grupo, SUM(x) FROM tabla GROUP BY grupo HAVING SUM(x) > 100;',
    example: 'SELECT cliente_id, COUNT(*) FROM pedidos GROUP BY cliente_id HAVING COUNT(*) >= 2;',
    relatedModuleId: 'a0000000-0000-0000-0000-000000000004',
  },
  {
    id: 'inner-join',
    term: 'INNER JOIN',
    category: 'uniones',
    summary: 'Combina filas de dos tablas únicamente cuando existe coincidencia en la condición ON.',
    syntax: 'FROM tabla_a a INNER JOIN tabla_b b ON a.id = b.a_id',
    example: 'SELECT p.pedido_id, c.nombre FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id;',
    relatedModuleId: 'b0000000-0000-0000-0000-000000000005',
  },
  {
    id: 'left-join',
    term: 'LEFT JOIN',
    category: 'uniones',
    summary: 'Conserva todas las filas de la tabla izquierda aunque no tengan coincidencia en la derecha (rellena con NULL).',
    syntax: 'FROM tabla_izq i LEFT JOIN tabla_der d ON i.id = d.i_id',
    example: 'SELECT c.nombre, COUNT(p.pedido_id) AS pedidos FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre;',
    relatedModuleId: 'b0000000-0000-0000-0000-000000000006',
  },
  {
    id: 'coalesce',
    term: 'COALESCE()',
    category: 'uniones',
    summary: 'Devuelve el primer argumento no nulo de la lista; ideal para convertir NULL en 0 o texto por defecto.',
    syntax: 'COALESCE(expresion, valor_respaldo)',
    example: 'SELECT c.nombre, COALESCE(SUM(p.total), 0) AS gastado FROM clientes c LEFT JOIN pedidos p ON c.cliente_id = p.cliente_id GROUP BY c.cliente_id, c.nombre;',
    relatedModuleId: 'b0000000-0000-0000-0000-000000000006',
  },
  {
    id: 'union-intersect-except',
    term: 'UNION / INTERSECT / EXCEPT',
    category: 'uniones',
    summary: 'Operadores de conjuntos que combinan verticalmente resultados compatibles (unión, intersección o diferencia).',
    syntax: 'SELECT col FROM a UNION [ALL] SELECT col FROM b;',
    example: 'SELECT ciudad FROM clientes INTERSECT SELECT ciudad FROM almacenes;',
    relatedModuleId: 'b0000000-0000-0000-0000-000000000008',
  },
  {
    id: 'exists',
    term: 'EXISTS / NOT EXISTS',
    category: 'avanzado',
    summary: 'Evalúa si una subconsulta devuelve al menos una fila; a diferencia de NOT IN, no falla cuando hay valores NULL.',
    syntax: 'WHERE EXISTS (SELECT 1 FROM tabla_rel r WHERE r.fk = tabla.pk)',
    example: 'SELECT c.nombre FROM clientes c WHERE EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.cliente_id);',
    relatedModuleId: 'c0000000-0000-0000-0000-000000000009',
  },
  {
    id: 'case-when',
    term: 'CASE WHEN',
    category: 'avanzado',
    summary: 'Evalúa condiciones secuenciales tipo if/else dentro de expresiones SELECT, ORDER BY o agregaciones.',
    syntax: 'CASE WHEN cond1 THEN res1 ELSE res2 END',
    example: "SELECT nombre_producto, CASE WHEN stock = 0 THEN 'Agotado' ELSE 'Disponible' END AS estado FROM productos;",
    relatedModuleId: 'c0000000-0000-0000-0000-000000000010',
  },
  {
    id: 'with-cte',
    term: 'WITH (CTE)',
    category: 'avanzado',
    summary: 'Define expresiones de tabla comunes temporales para modularizar consultas complejas paso a paso.',
    syntax: 'WITH paso_1 AS (SELECT ...) SELECT * FROM paso_1;',
    example: 'WITH resumen AS (SELECT cliente_id, SUM(total) AS gasto FROM pedidos GROUP BY cliente_id) SELECT * FROM resumen ORDER BY gasto DESC;',
    relatedModuleId: 'c0000000-0000-0000-0000-000000000011',
  },
  {
    id: 'window-functions',
    term: 'OVER (PARTITION BY ... ORDER BY ...)',
    category: 'avanzado',
    summary: 'Ejecuta rankings (ROW_NUMBER, DENSE_RANK) o desplazamientos (LAG, LEAD) sobre particiones sin colapsar las filas.',
    syntax: 'ROW_NUMBER() OVER (PARTITION BY grupo ORDER BY metrica DESC)',
    example: 'SELECT nombre_producto, categoria_id, precio, ROW_NUMBER() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS rank_cat FROM productos;',
    relatedModuleId: 'c0000000-0000-0000-0000-000000000012',
  },
  {
    id: 'create-table',
    term: 'CREATE / ALTER / DROP TABLE',
    category: 'modelado',
    summary: 'Crea, modifica o elimina tablas con sus columnas, tipos de datos y restricciones (PRIMARY KEY, FOREIGN KEY, CHECK, NOT NULL).',
    syntax: 'CREATE TABLE nombre (id SERIAL PRIMARY KEY, col VARCHAR(50) NOT NULL);',
    example: 'CREATE TABLE reseñas (id SERIAL PRIMARY KEY, producto_id INT REFERENCES productos(producto_id), puntaje INT CHECK (puntaje BETWEEN 1 AND 5));',
    relatedModuleId: 'd0000000-0000-0000-0000-000000000015',
  },
  {
    id: 'insert-update-delete',
    term: 'INSERT / UPDATE / DELETE (+ RETURNING)',
    category: 'modelado',
    summary: 'Comandos DML para insertar filas, actualizar valores o borrar filas según una condición WHERE.',
    syntax: 'INSERT INTO tabla (c1) VALUES (v1) RETURNING *; UPDATE tabla SET c1 = v2 WHERE id = 1; DELETE FROM tabla WHERE id = 1;',
    example: 'UPDATE productos SET stock = stock + 10 WHERE producto_id = 1 RETURNING producto_id, stock;',
    relatedModuleId: 'd0000000-0000-0000-0000-000000000014',
  },
  {
    id: 'create-index',
    term: 'CREATE INDEX (B-Tree / Compuesto / Parcial)',
    category: 'modelado',
    summary: 'Los índices aceleran búsquedas, filtros y ordenamientos sobre columnas de alta cardinalidad o subconjuntos frecuentes.',
    syntax: 'CREATE [UNIQUE] INDEX idx_nombre ON tabla (col1, col2) [WHERE condicion];',
    example: 'CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);',
    relatedModuleId: 'd0000000-0000-0000-0000-000000000016',
  },
];

export function searchSqlReference(
  query: string,
  category: 'all' | SqlReferenceCategory = 'all'
): SqlReferenceTerm[] {
  const q = query.trim().toLowerCase();
  return SQL_REFERENCE_TERMS.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    return (
      item.term.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.syntax.toLowerCase().includes(q)
    );
  });
}
