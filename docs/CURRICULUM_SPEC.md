# Especificación Curricular y Marco Pedagógico — Qurio (50 Retos)

Este documento establece el **marco pedagógico, fundamentos formales, taxonomía y fuentes oficiales** que respaldan cada uno de los 50 ejercicios interactivos de **Qurio**.

---

## 1. Declaración de Rigor Pedagógico (Anti-AI Slop Educativo)

En Qurio rechazamos los ejercicios generados como relleno arbitrario o desvinculados de la realidad técnica. Cada reto del currículum cumple cuatro criterios obligatorios:

1. **Fundamentación Formal:** Cada concepto responde a una especificación canónica del estándar **ISO/IEC 9075:2016 (SQL Core)** y la documentación oficial de **PostgreSQL 16**.
2. **Progresión Taxonómica (Bloom):** Los ejercicios guían al estudiante desde el reconocimiento sintáctico hasta el análisis de datos multi-tabla y la formulación de consultas analíticas avanzadas.
3. **Casos de Negocio Auténticos:** Todo ejercicio está contextualizado en el modelo de datos relacional `Ecommerce_Production_DB` (10 tablas reales: clientes, pedidos, inventario, facturación, proveedores y logística).
4. **Validación Semántica Automática:** Cada consulta de referencia ha sido ejecutada, verificada y tipada contra el motor PostgreSQL 16 Sandbox en Docker.

---

## 2. Marco Teórico y Fuentes Oficiales

### 2.1 El Orden Lógico de Procesamiento de Consultas
A diferencia de los lenguajes imperativos, SQL es un lenguaje declarativo donde el orden sintáctico de escritura difiere diametralmente del orden lógico de ejecución relacional:

$$\text{FROM} \longrightarrow \text{JOIN / ON} \longrightarrow \text{WHERE} \longrightarrow \text{GROUP BY} \longrightarrow \text{HAVING} \longrightarrow \text{SELECT} \longrightarrow \text{DISTINCT} \longrightarrow \text{ORDER BY} \longrightarrow \text{LIMIT / OFFSET}$$

El currículum de Qurio entrena al estudiante para internalizar este modelo mental, erradicando errores conceptuales clásicos (como intentar filtrar por un alias de `SELECT` dentro de `WHERE` o colocar condiciones de filtro de grupos en `WHERE` en lugar de `HAVING`).

### 2.2 Fuentes Documentales de Referencia

* **PostgreSQL 16 Official Documentation:**
  * [Capítulo 7: Queries](https://www.postgresql.org/docs/16/queries.html) (Table Expressions, Grouping, Window Functions, CTEs).
  * [Capítulo 9: Functions and Operators](https://www.postgresql.org/docs/16/functions.html) (Pattern Matching, Comparison Operators, Aggregate Functions).
* **Estándar Internacional:** ISO/IEC 9075:2016 Information technology — Database languages — SQL.
* **Referencia Académica:** *Database System Concepts* (Silberschatz, Korth, Sudarshan) & ACM/IEEE CS Curricula for Data Management.
* **Guías de Ingeniería de Producción:** [Google SQL Style Guide](https://github.com/mattm/google-styleguides/blob/master/trunk/google-sql-style.md) y [GitLab SQL Guide](https://docs.gitlab.com/ee/development/sql_style_guide.html).

---

## 3. Matriz Curricular: Distribución Piramidal de los 50 Retos

```
                        ▲
                       / \
                      /   \       Ruta 3: Advanced Queries (10 Retos - 20%)
                     /  ▲  \      CTEs, Window Functions, CASE, Subqueries
                    /───────\
                   /         \    Ruta 2: Relational SQL (18 Retos - 36%)
                  /     ▲     \   INNER/LEFT/CROSS/SELF JOIN, Multi-Tabla, UNION
                 /─────────────\
                /               \ Ruta 1: SQL Foundations (22 Retos - 44%)
               /─────────────────\ Proyecciones, WHERE, ORDER BY, GROUP BY, HAVING
```

---

## 4. Catálogo Detallado de Retos: Objetivos, Fuentes y Consignas

### RUTA 1: SQL Foundations (22 Retos)
*Objetivo de Ruta:* Dominar la extracción, cálculo escalar, filtrado y agregación sobre entidades atómicas antes de cruzar relaciones.

#### Módulo 1: SELECT & Proyecciones de Datos (4 Retos)
| # | ID | Título | Bloom | Fuente Oficial PostgreSQL 16 | Concepto / Reto de Negocio |
| :-: | :--- | :--- | :-: | :--- | :--- |
| **01** | `e0000000-...-0001` | **Catálogo Básico de Productos** | Recordar | [7.3. Select Lists](https://www.postgresql.org/docs/16/queries-select-lists.html) | Proyección atómica: proyectar `nombre_producto` y `precio` de la tabla `productos`. |
| **02** | `e0000000-...-0008` | **Cálculo de Precios con IVA** | Aplicar | [9.1. Math Functions](https://www.postgresql.org/docs/16/functions-math.html) | Expresión aritmética escalar: proyectar `nombre_producto`, `precio` y `ROUND(precio * 1.21, 2) AS precio_con_iva`. |
| **03** | `e0000000-...-0019` | **Concatenación de Nombre Completo** | Aplicar | [9.4. String Functions](https://www.postgresql.org/docs/16/functions-string.html) | Operador de cadena `\|\|`: combinar `nombre || ' ' || apellido AS cliente_completo` y `email` en la tabla `clientes`. |
| **04** | `e0000000-...-0020` | **Catálogo de Ciudades Únicas (DISTINCT)** | Comprender | [7.3.3. DISTINCT](https://www.postgresql.org/docs/16/queries-select-lists.html#QUERIES-DISTINCT) | Colapso de duplicados relacionales: listar `DISTINCT ciudad` de `clientes` para mapeo logístico. |

#### Módulo 2: Filtrado con WHERE y Operadores Lógicos (6 Retos)
| # | ID | Título | Bloom | Fuente Oficial PostgreSQL 16 | Concepto / Reto de Negocio |
| :-: | :--- | :--- | :-: | :--- | :--- |
| **05** | `e0000000-...-0002` | **Productos Premium (> 500€)** | Aplicar | [9.2. Comparison Operators](https://www.postgresql.org/docs/16/functions-comparison.html) | Predicado simple de comparación mayor que (`>`): filtrar artículos de alto valor en `productos`. |
| **06** | `e0000000-...-0009` | **Productos en Rango Medio (BETWEEN)** | Comprender | [9.2. Comparison Predicates](https://www.postgresql.org/docs/16/functions-comparison.html) | Predicado de intervalo cerrado inclusivo: `precio BETWEEN 100 AND 800`. |
| **07** | `e0000000-...-0021` | **Búsqueda por Patrón de Correo (LIKE)** | Aplicar | [9.7. Pattern Matching](https://www.postgresql.org/docs/16/functions-matching.html) | Coincidencia de comodín `%`: filtrar clientes cuyo email termine en `%@email.com`. |
| **08** | `e0000000-...-0022` | **Filtro de Ciudades Específicas (IN)** | Aplicar | [9.24. Subquery Expressions (IN)](https://www.postgresql.org/docs/16/functions-subquery.html) | Membresía de conjunto estático: `ciudad IN ('Madrid', 'Barcelona', 'Valencia')`. |
| **09** | `e0000000-...-0023` | **Productos en Riesgo de Stock (OR)** | Analizar | [9.2. Logical Operators](https://www.postgresql.org/docs/16/functions-logical.html) | Disyunción lógica relacional: identificar productos con `stock <= 15 OR stock >= 75`. |
| **10** | `e0000000-...-0024` | **Facturas de Alto Valor No Pagadas (AND + NOT)** | Analizar | [9.2. Logical Operators](https://www.postgresql.org/docs/16/functions-logical.html) | Conjunción y negación: facturas con `monto_total >= 400 AND estado_factura <> 'pagada'`. |

#### Módulo 3: Ordenamiento y Paginación (4 Retos)
| # | ID | Título | Bloom | Fuente Oficial PostgreSQL 16 | Concepto / Reto de Negocio |
| :-: | :--- | :--- | :-: | :--- | :--- |
| **11** | `e0000000-...-0003` | **Clientes Ordenados por Apellido** | Aplicar | [7.5. Sorting Rows (ORDER BY)](https://www.postgresql.org/docs/16/queries-order.html) | Ordenamiento lexicográfico unicolumna: `ORDER BY apellido ASC` para clientes españoles. |
| **12** | `e0000000-...-0010` | **Top 5 Productos Críticos por Stock** | Aplicar | [7.6. LIMIT and OFFSET](https://www.postgresql.org/docs/16/queries-limit.html) | Acotamiento de cardinalidad superior: `ORDER BY stock ASC LIMIT 5`. |
| **13** | `e0000000-...-0025` | **Ordenamiento Multi-Criterio** | Analizar | [7.5. Sorting Rows](https://www.postgresql.org/docs/16/queries-order.html) | Prioridad secuencial de orden: `ORDER BY categoria_id ASC, precio DESC`. |
| **14** | `e0000000-...-0026` | **Paginación de Clientes (OFFSET)** | Aplicar | [7.6. LIMIT and OFFSET](https://www.postgresql.org/docs/16/queries-limit.html) | Desplazamiento de cursor: obtener la página 2 de clientes mediante `LIMIT 5 OFFSET 5`. |

#### Módulo 4: Agregación y Agrupamiento (8 Retos)
| # | ID | Título | Bloom | Fuente Oficial PostgreSQL 16 | Concepto / Reto de Negocio |
| :-: | :--- | :--- | :-: | :--- | :--- |
| **15** | `e0000000-...-0004` | **Conteo de Productos por Categoría** | Aplicar | [7.2.4. GROUP BY / HAVING](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-GROUP) | Agrupamiento y filtro post-agregación: `GROUP BY categoria_id HAVING COUNT(*) > 2`. |
| **16** | `e0000000-...-0011` | **Métricas Globales de Ventas** | Analizar | [9.20. Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) | Resumen ejecutivo escalar: `COUNT(*)`, `SUM(total)`, `ROUND(AVG(total), 2)` sobre pedidos completados. |
| **17** | `e0000000-...-0027` | **Rango de Precios por Categoría (MAX/MIN)** | Aplicar | [9.20. Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) | Dispersión de precios: `MIN(precio) AS precio_minimo, MAX(precio) AS precio_maximo` agrupado por `categoria_id`. |
| **18** | `e0000000-...-0028` | **Distribución de Clientes por País** | Aplicar | [7.2.4. GROUP BY](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-GROUP) | Censo geográfico: `COUNT(*) AS total_clientes` agrupado por `pais`, ordenado descendentemente. |
| **19** | `e0000000-...-0029` | **Stock Total por Proveedor** | Aplicar | [9.20. Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) | Agregación sumatoria: `SUM(stock) AS stock_total` agrupado por `proveedor_id`. |
| **20** | `e0000000-...-0030` | **Proveedores de Alto Volumen (HAVING SUM)** | Analizar | [7.2.4. HAVING](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-HAVING) | Filtro de grupo acumulado: agrupar por `proveedor_id` con `HAVING SUM(stock) > 100`. |
| **21** | `e0000000-...-0031` | **Clientes con Ticket Promedio Alto (HAVING AVG)** | Analizar | [7.2.4. HAVING](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-HAVING) | Filtro de promedio: agrupar pedidos por `cliente_id` con `HAVING AVG(total) > 500`. |
| **22** | `e0000000-...-0032` | **Resumen de Pedidos por Estado** | Analizar | [7.2.4. GROUP BY](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-GROUP) | Auditoría de embudo: conteo y monto total agrupado por `estado_pedido`. |

---

### RUTA 2: Relational SQL & Joins (18 Retos)
*Objetivo de Ruta:* Dominar el producto cartesiano restringido, la navegación por claves foráneas, la preservación de ausencias y las operaciones de conjuntos.

#### Módulo 5: Uniones Fundamentales (INNER JOIN) (5 Retos)
| # | ID | Título | Bloom | Fuente Oficial PostgreSQL 16 | Concepto / Reto de Negocio |
| :-: | :--- | :--- | :-: | :--- | :--- |
| **23** | `e0000000-...-0005` | **Pedidos con Identidad del Cliente** | Aplicar | [7.2.1. Joined Tables (INNER)](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Cruce elemental 1:N: `pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id`. |
| **24** | `e0000000-...-0012` | **Gasto Acumulado por Cliente** | Analizar | [7.2.1. Joined Tables + Grouping](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Cruce con agregación: sumar pedidos completados por cliente y ordenar de mayor a menor gasto. |
| **25** | `e0000000-...-0033` | **Catálogo con Nombre de Categoría** | Aplicar | [7.2.1. Joined Tables](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Normalización: cruzar `productos` con `categorias` para mostrar `nombre_producto`, `nombre_categoria` y `precio`. |
| **26** | `e0000000-...-0034` | **Productos y sus Proveedores Directos** | Aplicar | [7.2.1. Joined Tables](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Directorio de suministros: vincular `productos` y `proveedores` mostrando nombre del producto y razón social del proveedor. |
| **27** | `e0000000-...-0035` | **Facturación Detallada con Pagos Aprobados** | Analizar | [7.2.1. Joined Tables](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Conciliación financiera: cruzar `facturas` con `pagos` mostrando `factura_id`, `monto_total`, `metodo_pago` y `fecha_pago` donde `estado_pago = 'aprobado'`. |

#### Módulo 6: Detección de Ausencias (LEFT JOIN & Tratamiento de NULL) (5 Retos)
| # | ID | Título | Bloom | Fuente Oficial PostgreSQL 16 | Concepto / Reto de Negocio |
| :-: | :--- | :--- | :-: | :--- | :--- |
| **28** | `e0000000-...-0006` | **Clientes sin Compras (Anti-Join)** | Analizar | [7.2.1. Joined Tables (LEFT)](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Anti-Join clásico: `clientes c LEFT JOIN pedidos p ... WHERE p.pedido_id IS NULL`. |
| **29** | `e0000000-...-0013` | **Productos sin Movimiento de Venta** | Analizar | [7.2.1. Joined Tables (LEFT)](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Detección de stock muerto: productos que no figuran en `detalle_pedidos`. |
| **30** | `e0000000-...-0036` | **Proveedores sin Productos Asignados** | Analizar | [7.2.1. Joined Tables (LEFT)](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Proveedores inactivos: cruce por izquierda de `proveedores` contra `productos` filtrando nulos. |
| **31** | `e0000000-...-0037` | **Almacenes sin Registro de Inventario** | Analizar | [7.2.1. Joined Tables (LEFT)](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Capacidad ociosa: almacenes registrados en `almacenes` sin existencias en `inventario`. |
| **32** | `e0000000-...-0038` | **Conteo Total de Pedidos por Cliente (Incluyendo Cero)** | Sintetizar | [7.2.1. Joined Tables + COUNT](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | `COUNT(columna)` vs `COUNT(*)` en presencia de nulos: preservar clientes con 0 pedidos usando `COUNT(p.pedido_id)`. |

#### Módulo 7: Consultas Multi-Tabla en Cascada (4 Retos)
| # | ID | Título | Bloom | Fuente Oficial PostgreSQL 16 | Concepto / Reto de Negocio |
| :-: | :--- | :--- | :-: | :--- | :--- |
| **33** | `e0000000-...-0014` | **Desglose Completo de Líneas de Pedido** | Analizar | [7.2.1. Joined Tables](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Conexión pentagonal: `pedidos` $\to$ `clientes` $\to$ `detalle_pedidos` $\to$ `productos` $\to$ `categorias`. |
| **34** | `e0000000-...-0039` | **Historial de Compras por Ciudad y Categoría** | Sintetizar | [7.2.1. Joined Tables](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Análisis geográfico: cruzar clientes, pedidos, detalle y productos para sumar ventas por ciudad y categoría. |
| **35** | `e0000000-...-0040` | **Auditoría de Facturación vs Pedidos** | Analizar | [7.2.1. Joined Tables](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Consistencia fiscal: cruzar `facturas`, `pedidos` y `clientes` verificando coincidencias de importes. |
| **36** | `e0000000-...-0041` | **Disponibilidad Física de Producto en Almacenes** | Analizar | [7.2.1. Joined Tables](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Trazabilidad física: conectar `productos`, `inventario` y `almacenes` mostrando ubicación del stock. |

#### Módulo 8: Operaciones de Conjunto y Joins Especiales (4 Retos)
| # | ID | Título | Bloom | Fuente Oficial PostgreSQL 16 | Concepto / Reto de Negocio |
| :-: | :--- | :--- | :-: | :--- | :--- |
| **37** | `e0000000-...-0042` | **Unificación de Contactos (UNION vs UNION ALL)** | Comprender | [7.4. Combining Queries (UNION)](https://www.postgresql.org/docs/16/queries-union.html) | Álgebra de conjuntos: unificar emails de clientes y proveedores eliminando duplicados mediante `UNION`. |
| **38** | `e0000000-...-0043` | **Catálogo de Ciudades con Clientes pero sin Almacenes (EXCEPT)** | Analizar | [7.4. Combining Queries (EXCEPT)](https://www.postgresql.org/docs/16/queries-union.html) | Diferencia de conjuntos relacionales: ciudades de `clientes` menos ciudades de `almacenes`. |
| **39** | `e0000000-...-0044` | **Matriz de Cobertura Almacén-Categoría (CROSS JOIN)** | Sintetizar | [7.2.1. Joined Tables (CROSS)](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Producto cartesiano intencional: generar la matriz de combinaciones posibles de almacenes y categorías. |
| **40** | `e0000000-...-0045` | **Pares de Productos en la Misma Categoría (SELF JOIN)** | Sintetizar | [7.2.1. Joined Tables (Self-Join)](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) | Auto-unión con desigualdad: `p1.categoria_id = p2.categoria_id AND p1.producto_id < p2.producto_id`. |

---

### RUTA 3: Advanced Queries & Analytics (10 Retos)
*Objetivo de Ruta:* Formular consultas analíticas de grado empresarial utilizando subconsultas correlacionadas, lógica condicional `CASE`, CTEs modulares y funciones de ventana.

#### Módulo 9: Subconsultas Analíticas (3 Retos)
| # | ID | Título | Bloom | Fuente Oficial PostgreSQL 16 | Concepto / Reto de Negocio |
| :-: | :--- | :--- | :-: | :--- | :--- |
| **41** | `e0000000-...-0015` | **Productos sobre el Promedio de Precio** | Analizar | [9.24. Subquery Expressions](https://www.postgresql.org/docs/16/functions-subquery.html) | Subconsulta escalar no correlacionada en cláusula `WHERE`: `WHERE precio > (SELECT AVG(precio) FROM productos)`. |
| **42** | `e0000000-...-0046` | **Clientes con Pedidos de Alto Monto (IN Subquery)** | Analizar | [9.24. Subquery Expressions (IN)](https://www.postgresql.org/docs/16/functions-subquery.html) | Filtro de membresía dinámica: clientes cuyo ID figure en la subconsulta de pedidos mayores a 1,000€. |
| **43** | `e0000000-...-0047` | **Comprobación de Existencia Eficiente (EXISTS)** | Evaluar | [9.24. Subquery Expressions (EXISTS)](https://www.postgresql.org/docs/16/functions-subquery.html) | Subconsulta correlacionada de cortocircuito booleano: `WHERE EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.cliente_id)`. |

#### Módulo 10: Expresiones Condicionales (CASE WHEN) (2 Retos)
| # | ID | Título | Bloom | Fuente Oficial PostgreSQL 16 | Concepto / Reto de Negocio |
| :-: | :--- | :--- | :-: | :--- | :--- |
| **44** | `e0000000-...-0016` | **Segmentación de Pedidos por Monto** | Aplicar | [9.18. Conditional Expressions (CASE)](https://www.postgresql.org/docs/16/functions-conditional.html#FUNCTIONS-CASE) | Lógica condicional simple: clasificar en `'Alto Valor'`, `'Medio Valor'` y `'Bajo Valor'` según cuantía. |
| **45** | `e0000000-...-0048` | **Pivoteo Manual de Ventas por Estado (Conditional Aggregation)** | Sintetizar | [9.18. CASE + Aggregate](https://www.postgresql.org/docs/16/functions-conditional.html) | Agregación condicional estilo pivote: `SUM(CASE WHEN estado_pedido = 'completado' THEN total ELSE 0 END)`. |

#### Módulo 11: Common Table Expressions (CTEs con WITH) (2 Retos)
| # | ID | Título | Bloom | Fuente Oficial PostgreSQL 16 | Concepto / Reto de Negocio |
| :-: | :--- | :--- | :-: | :--- | :--- |
| **46** | `e0000000-...-0017` | **Facturación por Categoría mediante CTE** | Sintetizar | [7.8. WITH Queries (Common Table Expressions)](https://www.postgresql.org/docs/16/queries-with.html) | Modularidad analítica: encapsular el cálculo de facturación en `WITH ventas_por_categoria AS (...)` y consultar el resumen. |
| **47** | `e0000000-...-0049` | **CTEs Múltiples Encadenadas (Pipeline de Datos)** | Evaluar | [7.8. WITH Queries](https://www.postgresql.org/docs/16/queries-with.html) | Pipeline de dos pasos: CTE 1 calcula gasto por cliente, CTE 2 segmenta clientes en deciles o categorías de fidelidad. |

#### Módulo 12: Funciones de Ventana Analíticas (Window Functions) (3 Retos)
| # | ID | Título | Bloom | Fuente Oficial PostgreSQL 16 | Concepto / Reto de Negocio |
| :-: | :--- | :--- | :-: | :--- | :--- |
| **48** | `e0000000-...-0007` | **Ranking de Productos por Precio (ROW_NUMBER)** | Aplicar | [7.7. Window Function Processing](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-WINDOW) | Numeración secuencial determinista sin empates: `ROW_NUMBER() OVER (ORDER BY precio DESC)`. |
| **49** | `e0000000-...-0018` | **Ranking Relativo por Categoría (DENSE_RANK)** | Analizar | [9.22. Window Functions](https://www.postgresql.org/docs/16/functions-window.html) | Clasificación particionada con empates compactos: `DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC)`. |
| **50** | `e0000000-...-0050` | **Variación Temporal entre Pedidos (LAG / LEAD)** | Sintetizar | [9.22. Window Functions (LAG)](https://www.postgresql.org/docs/16/functions-window.html) | Análisis de series cronológicas: usar `LAG(fecha_pedido) OVER (PARTITION BY cliente_id ORDER BY fecha_pedido)` para calcular el intervalo de recompra. |

---

## 5. Garantía de Calidad y Verificación Técnica

Cada uno de los 50 ejercicios definidos en esta especificación cumple las siguientes garantías de ingeniería:

1. **Aserciones Semánticas en Docker:** Las 50 soluciones de referencia se ejecutan contra el PostgreSQL Sandbox local (`localhost:5433`).
2. **Cardinalidad No Degenerada:** Ninguna consulta devuelve 0 filas (conjunto vacío involuntario) ni la totalidad ciega de la tabla, garantizando que el filtro o cálculo sea significativo.
3. **Soporte Bidireccional:**
   * Archivo de producción en la nube: [`database/supabase/02_seed_curriculum.sql`](../database/supabase/02_seed_curriculum.sql).
   * Catálogo de resiliencia offline de la API: [`apps/api/app/modules/curriculum/seed_data.py`](../apps/api/app/modules/curriculum/seed_data.py).
