# Auditoría Curricular Profunda, Desalineaciones y Análisis de Deuda Educativa — Qurio

> **Fecha de Auditoría:** 19 de noviembre de 2026  
> **Enfoque:** Análisis crítico contra el código real ([`.agents/rules/critical-sparring.md`](file:///c:/Desarrollo/Qurio/.agents/rules/critical-sparring.md)) y la especificación pedagógica ([`docs/pedagogia/qurio_pedagogical_specification_ai_agent_framework.md`](file:///c:/Desarrollo/Qurio/docs/pedagogia/qurio_pedagogical_specification_ai_agent_framework.md)).  
> **Archivos Contrastados:**
> * [`apps/api/app/modules/curriculum/seed_data.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/curriculum/seed_data.py)
> * [`apps/web/src/lib/fallbackCurriculum.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/fallbackCurriculum.ts)
> * [`apps/web/src/lib/moduleGuides.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/moduleGuides.ts)
> * [`database/sandbox/ecommerce_seed.sql`](file:///c:/Desarrollo/Qurio/database/sandbox/ecommerce_seed.sql)
> * [`database/supabase/02_seed_curriculum.sql`](file:///c:/Desarrollo/Qurio/database/supabase/02_seed_curriculum.sql) y [`06_humanize_curriculum_copy.sql`](file:///c:/Desarrollo/Qurio/database/supabase/06_humanize_curriculum_copy.sql)
> * [`apps/api/sync_supabase_curriculum.py`](file:///c:/Desarrollo/Qurio/apps/api/sync_supabase_curriculum.py) y [`apps/api/tests/test_schema_consistency.py`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_schema_consistency.py)

---

## 1. Autocrítica Técnica: ¿Basta con corregir textos o hacen falta nuevos ejercicios?

En la primera revisión descarté agregar nuevos ejercicios bajo el argumento conservador de "no inflar el catálogo por encima de 76". **Ese argumento era incompleto y complaciente con el estado actual del código.**

Al auditar el dataset real ([`ecommerce_seed.sql`](file:///c:/Desarrollo/Qurio/database/sandbox/ecommerce_seed.sql)), el mapa de uso de las 10 tablas por ejercicio y la distribución de átomos cognitivos en los 16 módulos, la conclusión objetiva es otra:

1. **En SQL, un concepto que solo se menciona en una nota de texto pero nunca se escribe ni ejecuta en el editor es deuda educativa real.** El aprendizaje basado en restricciones (*Constraint-Based Modeling*, Mitrovic 2003/2007) requiere que el estudiante enfrente la condición en el motor y observe el efecto en el conjunto de datos resultante.
2. **El catálogo actual tiene redundancia en algunos módulos y vacíos críticos en otros:**
   * En el **Módulo 6 (`LEFT JOIN`)** hay **3 ejercicios seguidos** (`#30/006`, `#31/013`, `#32/036`) que evalúan exactamente el mismo patrón sintáctico (`LEFT JOIN ... WHERE pk_derecha IS NULL`).
   * En el **Módulo 5 (`INNER JOIN`)** hay **2 ejercicios seguidos** (`#26/033` y `#27/034`) que hacen exactamente lo mismo sobre la misma tabla (`productos INNER JOIN tabla_maestra ORDER BY ...`). Precisamente por esa redundancia quien redactó los `concept` le puso por error a `#27 (034)` la teoría de `INNER JOIN + WHERE`.
   * Mientras tanto, **hay 4 átomos cognitivos fundamentales de SQL / PostgreSQL 16 que ningún ejercicio del curso evalúa en la práctica** (a pesar de que algunos incluso se prometen en [`moduleGuides.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/moduleGuides.ts) o en [`CURRICULUM_SPEC.md`](file:///c:/Desarrollo/Qurio/docs/CURRICULUM_SPEC.md)).
3. **Viabilidad arquitectónica real de añadir ejercicios (verificada en el código):**
   * En Supabase (`public.user_progress`), el progreso del usuario está indexado por **`exercise_id` (UUID)**, no por `sort_order`.
   * De hecho, el proyecto ya evolucionó anteriormente de **50 $\to$ 60 $\to$ 76 ejercicios**: los retos `0051..0060` fueron insertados en medio de las Rutas 1–3 desplazando `sort_order`, y luego `0061..0076` agregaron la Ruta 4.
   * Ni el frontend ni el sistema de certificados (`public.user_certificates`) tienen hardcodeado el número `76` (calculan `total_exercises` dinámicamente por ruta). Los **únicos dos lugares** del repositorio con el número `76` fijo son [`test_schema_consistency.py#L90-L114`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_schema_consistency.py#L90-L114) y [`sync_supabase_curriculum.py#L189`](file:///c:/Desarrollo/Qurio/apps/api/sync_supabase_curriculum.py#L189).

---

## 2. Hallazgos en el Dataset Real (`ecommerce_seed.sql`) que Generan Deuda Educativa

Al inspeccionar fila por fila [`database/sandbox/ecommerce_seed.sql`](file:///c:/Desarrollo/Qurio/database/sandbox/ecommerce_seed.sql), aparecen dos anomalías estructurales en los datos semilla:

### 2.1. Anomalía 1: Existen `0` valores `NULL` almacenados en las 10 tablas del Sandbox
* Aunque varias columnas permiten nulos en el DDL (`categorias.descripcion`, `proveedores.telefono`, `productos.categoria_id`, `productos.proveedor_id`), **todas las filas insertadas en las 10 tablas tienen valores no nulos**.
* **Consecuencia pedagógica grave:**
  * El estudiante **jamás ve un `NULL` nativo en una tabla**. Cree erróneamente que `NULL` es algo que solo "aparece mágicamente cuando haces un `LEFT JOIN`" (Módulo 6) o un `LAG()` (Módulo 12).
  * La Guía del Módulo 2 ([`moduleGuides.ts#L82`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/moduleGuides.ts#L82)) promete enseñar `IS NULL` en `WHERE`, y su sección de errores comunes advierte contra `WHERE columna = NULL`, pero **no existe ningún ejercicio de filtrado de `NULL` en tabla simple** porque no había ninguna fila con `NULL` en `ecommerce_seed.sql`.
* **Análisis de impacto en el código real al introducir un `NULL` en `proveedores.telefono`:**
  * La tabla `proveedores` solo es consultada por **2 de los 76 ejercicios** de todo el curso: `#27 (034)` (que solo proyecta `nombre_proveedor, pais`) y `#65 (065)` (que actualiza `telefono` del `proveedor_id = 2`).
  * Si en `ecommerce_seed.sql` el proveedor `5` (`Peripheral Craft`) tiene `telefono = NULL` (dato de contacto pendiente de registro), **0 ejercicios existentes se ven afectados** y habilitamos de forma limpia un ejercicio real de `WHERE telefono IS NULL` / `IS NOT NULL` en el Módulo 2.

### 2.2. Anomalía 2: El 100% de las filas de `pagos` tienen `estado_pago = 'aprobado'`
* En [`ecommerce_seed.sql#L246-L257`](file:///c:/Desarrollo/Qurio/database/sandbox/ecommerce_seed.sql#L246-L257), las 11 filas de `pagos` tienen `estado_pago = 'aprobado'` (a pesar de que el `CHECK` de la tabla define `'aprobado'`, `'rechazado'` y `'procesando'`).
* **Consecuencia pedagógica grave:**
  * En **#28 (`035` — *Facturación detallada con pagos aprobados*)**, si el estudiante **olvida por completo escribir `WHERE pg.estado_pago = 'aprobado'`**, la consulta devuelve exactamente las mismas 11 filas y el evaluador semántico le da el reto por válido (falso positivo).
* **Análisis de impacto cruzado en los 4 ejercicios que tocan `pagos` (`#28/035`, `#32/036`, `#38/040`, `#74/074`):**
  * Si agregamos en `ecommerce_seed.sql` el registro:
    ```sql
    (12, 201, 'paypal', 1590.00, '2024-01-09', 'rechazado')
    ```
    *(un intento de pago con PayPal rechazado el día previo a que la factura `201` se pagara con tarjeta de crédito)*:
    1. **#28 (`035`)**: Ahora el filtro `WHERE pg.estado_pago = 'aprobado'` **es verdaderamente discriminante** (sin él devuelve 12 filas y reprueba; con él devuelve las 11 aprobadas).
    2. **#32 (`036` — *Facturas pendientes de cobro*)**: Filtra facturas sin registros en `pagos` (`WHERE p.pago_id IS NULL`). Como la factura `201` ya tenía pago, las facturas sin abonos siguen siendo exactamente `205` y `210` (**0 impacto**).
    3. **#74 (`074` — `CREATE UNIQUE INDEX ON pagos (factura_id, metodo_pago)`)**: El pago 1 es `(201, 'tarjeta_credito')` y el pago 12 es `(201, 'paypal')`. El par `(factura_id, metodo_pago)` sigue siendo único y el índice único se construye sin fallo (**0 impacto**).
    4. **#38 (`040` — *Conciliación de pedidos, facturación y pagos*)**: Aquí tenemos dos opciones limpias:
       * **Opción A:** Mantener `#38 (040)` sin `WHERE` (quitando el `WHERE ab.estado = 'aprobado'` espurio de su `concept`) y agregar `, pg.pago_id ASC` al `ORDER BY` (mostrando los 12 registros de trazabilidad, incluido el intento rechazado).
       * **Opción B:** Si en `#38 (040)` el `concept` ya tenía `WHERE ab.estado = 'aprobado'`, pedir en la consigna de `#38 (040)` conciliar únicamente los cobros con `estado_pago = 'aprobado'`, con lo que devuelve las 11 filas aprobadas y su `concept` actual cobra pleno sentido. *(La Opción A es preferible para el átomo cognitivo del Módulo 7 si queremos que `#38/040` se enfoque solo en el encadenamiento de 3 tablas sin repetir el filtro de `#28/035`)*.

---

## 3. Los 4 Vacíos Curriculares donde SÍ Conviene Crear Nuevos Ejercicios (`76 → 80 Retos`)

Aplicando la taxonomía de errores semánticos de Brass & Goldberg (2006) y Taipalus (2020), estos son los **4 temas omitidos** donde una simple nota teórica es insuficiente y **sí se justifica crear 4 nuevos ejercicios prácticos** (`e0000000-0000-0000-0000-000000000077` al `0080`):

### 3.1. Nuevo Ejercicio Propuesto #1 (`ID: ...0077`, Módulo 2): Detección de valores ausentes (`WHERE ... IS NULL`)
* **Por qué no basta con teoría:** Hoy el estudiante aprende `IS NULL` recién en el Módulo 6 mezclado con `LEFT JOIN`. Eso viola el principio de **un solo átomo cognitivo nuevo a la vez**: el alumno debe aprender primero qué es `NULL` y la lógica trivalente (`IS NULL` vs el error clásico `= NULL`) sobre una sola tabla en el Módulo 2 (`Filtrado lógico`), tal como ya promete la Guía del Módulo 2.
* **Diseño del reto:**
  * **Ubicación:** Módulo 2 (`Filtrado lógico`), justo después de `#10 (024 — AND + NOT)`.
  * **Título:** `Proveedores sin teléfono registrado (IS NULL)`
  * **Requisito en seed:** En `ecommerce_seed.sql`, el proveedor `5` (`Peripheral Craft`) pasa a tener `telefono = NULL`.
  * **Consigna:** *"Compras detectó que algunas fichas de fabricantes quedaron incompletas al darse de alta. Muestra el `proveedor_id`, `nombre_proveedor` y `pais` de aquellos registros de la tabla `proveedores` cuyo `telefono` no haya sido cargado (`NULL`)."*
  * **Solución:**
    ```sql
    SELECT proveedor_id, nombre_proveedor, pais
    FROM proveedores
    WHERE telefono IS NULL;
    ```
  * **Átomo cognitivo y trampa abordada:** Lógica trivalente (3VL) en una sola tabla: por qué `WHERE telefono = NULL` devuelve `0` filas (`UNKNOWN`) y es obligatorio usar `IS NULL` (o `IS NOT NULL`).

### 3.2. Nuevo Ejercicio Propuesto #2 (`ID: ...0078`, Módulo 2): Precedencia booleana con paréntesis `(A OR B) AND C`
* **Por qué no basta con teoría:** La Guía del Módulo 2 ([`moduleGuides.ts#L113-L125`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/moduleGuides.ts#L113-L125)) incluye un ejemplo resuelto entero sobre `(departamento = 'Datos' OR departamento = 'Backend') AND salario >= 3000`, pero ningún reto del Módulo 2 combina `OR` y `AND`. Si el estudiante nunca escribe paréntesis en `WHERE`, cometerá el error clásico de precedencia (`AND` ata más fuerte que `OR`).
* **Diseño del reto:**
  * **Ubicación:** Módulo 2 (`Filtrado lógico`), después del reto de `OR` y `AND`.
  * **Título:** `Combinación de condiciones con paréntesis ((OR) + AND)`
  * **Consigna:** *"Marketing busca lanzar una oferta sobre equipos de cómputo y pantallas con inventario suficiente. Muestra `producto_id`, `categoria_id`, `nombre_producto`, `precio` y `stock` de los artículos de la tabla `productos` que pertenezcan a la categoría `1` o a la categoría `2`, y que además tengan un `precio` menor a `1000`€. Ordena por `producto_id` ascendente."*
  * **Solución:**
    ```sql
    SELECT producto_id, categoria_id, nombre_producto, precio, stock
    FROM productos
    WHERE (categoria_id = 1 OR categoria_id = 2)
      AND precio < 1000
    ORDER BY producto_id ASC;
    ```
  * **Por qué es discriminante en el Sandbox actual (sin tocar `ecommerce_seed.sql`):**
    * Con paréntesis `(categoria_id = 1 OR categoria_id = 2) AND precio < 1000`, devuelve **4 filas** (productos `3, 4, 5, 6`).
    * Si el estudiante **olvida los paréntesis** (`WHERE categoria_id = 1 OR categoria_id = 2 AND precio < 1000`), PostgreSQL evalúa `categoria_id = 1 OR (categoria_id = 2 AND precio < 1000)`, colando los productos `1` (`1450€`) y `2` (`1100€`) y devolviendo **6 filas** (reprueba inmediatamente en el evaluador semántico).

### 3.3. Nuevo Ejercicio Propuesto #3 (`ID: ...0079`, Módulo 4): Conteo de entidades únicas (`COUNT(DISTINCT columna)`)
* **Por qué no basta con teoría:** En el Módulo 4 el estudiante usa `COUNT(*)` en 5 retos distintos, pero nunca aprende `COUNT(DISTINCT columna)`. Diferenciar cuántas **transacciones** ocurrieron (`COUNT(*)`) frente a cuántas **personas distintas** participaron (`COUNT(DISTINCT cliente_id)`) es esencial en SQL analítico.
* **Diseño del reto:**
  * **Ubicación:** Módulo 4 (`Agregación y agrupación`), junto a los retos de `COUNT(*)` y `GROUP BY`.
  * **Título:** `Pedidos totales vs. compradores únicos (COUNT DISTINCT)`
  * **Consigna:** *"Un mismo cliente puede haber realizado varios pedidos, por lo que contar filas no equivale a contar personas. Para cada `estado_pedido` en la tabla `pedidos`, muestra el `estado_pedido`, la cantidad total de órdenes como `total_pedidos` (`COUNT(*)`) y cuántos clientes diferentes participaron como `clientes_unicos` (`COUNT(DISTINCT cliente_id)`). Ordena de mayor a menor `total_pedidos` y desempata por `estado_pedido` ascendente."*
  * **Solución:**
    ```sql
    SELECT estado_pedido,
           COUNT(*) AS total_pedidos,
           COUNT(DISTINCT cliente_id) AS clientes_unicos
    FROM pedidos
    GROUP BY estado_pedido
    ORDER BY total_pedidos DESC, estado_pedido ASC;
    ```
  * **Por qué es discriminante en el Sandbox actual (sin tocar `ecommerce_seed.sql`):**
    * En `estado_pedido = 'completado'`, `COUNT(*)` devuelve `12` pedidos, mientras que `COUNT(DISTINCT cliente_id)` devuelve `8` clientes únicos. El estudiante comprueba visualmente en la misma fila la diferencia entre contar eventos y contar sujetos únicos.

### 3.4. Nuevo Ejercicio Propuesto #4 (`ID: ...0080`, Módulo 13): `UPSERT` transaccional (`INSERT ... ON CONFLICT DO UPDATE`)
* **Por qué no basta con teoría:** La Ruta 4 enseña DML en PostgreSQL 16 (`INSERT`, `UPDATE`, `DELETE`). En el reto `#64 (064 — INSERT INTO ... SELECT)`, la consigna actual tuvo que meter el filtro artificial `AND producto_id <> 15` porque el par `(almacen_id = 3, producto_id = 15)` ya existía en `inventario` y lanzaba error de `duplicate key value violates unique constraint "inventario_pkey"`. En lugar de esconder las colisiones de clave primaria, un curso de PostgreSQL 16 debe enseñar a resolverlas con **`ON CONFLICT (...) DO UPDATE SET ...`** y la tabla virtual **`EXCLUDED`**.
* **Diseño del reto:**
  * **Ubicación:** Módulo 13 (`Inserción de registros (INSERT)`), al final del módulo (`después de INSERT INTO ... SELECT`).
  * **Título:** `Reposición inteligente de stock (UPSERT con ON CONFLICT)`
  * **Consigna:** *"Llegó al almacén `3` una reposición de `20` unidades del producto `15` (`almacen_id = 3, producto_id = 15, cantidad_disponible = 20`). Como ese artículo ya tiene una fila registrada en `inventario` para ese almacén, un `INSERT` simple fallaría por clave primaria duplicada. Ejecuta un `INSERT INTO inventario (almacen_id, producto_id, cantidad_disponible) VALUES (3, 15, 20)` utilizando `ON CONFLICT (almacen_id, producto_id) DO UPDATE` para sumar la nueva cantidad al stock existente (`inventario.cantidad_disponible + EXCLUDED.cantidad_disponible`) y devuelve la fila resultante con `RETURNING almacen_id, producto_id, cantidad_disponible`."*
  * **Solución:**
    ```sql
    INSERT INTO inventario (almacen_id, producto_id, cantidad_disponible)
    VALUES (3, 15, 20)
    ON CONFLICT (almacen_id, producto_id)
    DO UPDATE SET cantidad_disponible = inventario.cantidad_disponible + EXCLUDED.cantidad_disponible
    RETURNING almacen_id, producto_id, cantidad_disponible;
    ```
  * **Resultado verificable en el Sandbox:** El lote `(3, 15)` tenía `20` unidades en `ecommerce_seed.sql`; tras el `UPSERT`, `RETURNING` devuelve `(3, 15, 40)`.

---

### 3.5. ¿Qué otros temas se evaluaron y por qué NO se recomienda crear ejercicios nuevos para ellos?

Para mantener rigor y evitar relleno, también evalué estos candidatos y las razones técnicas para **no** crearles un ejercicio aparte (sino cubrirlos o calibrar un reto existente):

1. **Diferencia temporal con `LAG()` (`#60 / 050`):**
   * En lugar de crear un segundo ejercicio de `LAG()`, es mucho más limpio **mejorar o mantener `#60 (050)`** y explicar en su `concept` tanto cómo restar fechas/montos con `LAG()` como la existencia de `LEAD()` (fila siguiente). *(Cambiar la `solution_query` de `#60` para restar fechas obligaría a lidiar con el primer registro `NULL` por cliente, pero explicarlo en `concept` cierra la duda sin complicar el átomo base de `LAG`)*.
2. **`RIGHT JOIN` y `FULL OUTER JOIN`:**
   * En ingeniería de datos real (Google/GitLab SQL Style Guides citadas en `CURRICULUM_SPEC.md`), `RIGHT JOIN` se desaconseja activamente porque disminuye la legibilidad (cualquier `A RIGHT JOIN B` se escribe de forma más clara como `B LEFT JOIN A`). No aporta valor crear un reto de `RIGHT JOIN`.
3. **Subconsultas en `FROM` (Tablas Derivadas):**
   * En PostgreSQL moderno, toda tabla derivada `FROM (SELECT ...) AS sub` se escribe con mayor claridad como una CTE (`WITH sub AS (...)`), que ya tiene un módulo completo (Módulo 11, 4 retos). Basta con explicarlo en el `concept` del reto `#52 (017)` y ajustar el resumen de la Guía del Módulo 9.

---

## 4. Desalineaciones en Ejercicios Existentes (A Corregir en el Catálogo Actual)

Además de los 4 nuevos ejercicios propuestos, se mantienen todas las correcciones detectadas sobre los ejercicios actuales:

### 4.1. Los 6 ejercicios cuyo bloque `concept` contradice o no explica lo que pide el reto

| Reto Actual | ID | Problema en `concept` | Corrección Exacta |
| :-: | :--- | :--- | :--- |
| **#22** | `...0004` | El reto introduce **`HAVING COUNT(*) > 2`**, pero `concept` solo explica `GROUP BY` y omite `HAVING` por completo. | Reescribir `concept` de `004` para explicar `GROUP BY` + `HAVING COUNT(*) > umbral` y mover la introducción general de `GROUP BY` a `#17 (027)`. |
| **#27** | `...0034` | El reto solo pide `INNER JOIN` + alias `AS pais_proveedor` + `ORDER BY` (**sin `WHERE`**), pero `concept` enseña a filtrar con `WHERE` sobre un `INNER JOIN`. | Reemplazar `concept` de `034` por la explicación de `INNER JOIN` proyectando columnas de ambas tablas con alias `AS` y ordenamiento determinista. |
| **#28** | `...0035` | El reto une **2 tablas** (`facturas` + `pagos`) con `WHERE pg.estado_pago = 'aprobado'`, pero `concept` enseña a encadenar **3 o más tablas**. | Asignar a `035` el `concept` de **`INNER JOIN` + filtro `WHERE`** (el que estaba por error en `034`). |
| **#32** | `...0036` | El reto usa `LEFT JOIN ... WHERE p.pago_id IS NULL ORDER BY ...`, pero `concept.key_points[2]` habla de `<>` y `!=`, `syntax` omite `ORDER BY` y `summary` no explica el concepto. | Limpiar `concept` de `036` enfocándolo en la auditoría de documentos pendientes con `LEFT JOIN ... WHERE pk_derecha IS NULL ORDER BY ...`. |
| **#36** | `...0014` | El reto une 5 tablas con `LIMIT 10` sin multiplicar columnas, pero `concept.key_points[2]` habla de multiplicar `d.cantidad * d.precio_venta` (que es del reto siguiente `039`). | Ajustar `concept` de `014` para explicar la navegación en cadena multi-tabla (cabecera $\to$ detalle $\to$ catálogos) con `ORDER BY` y `LIMIT`. |
| **#38** | `...040` | El reto une `pedidos`, `facturas` y `pagos` **sin `WHERE`**, pero `concept.syntax` y `key_points[1]` incluyen `WHERE ab.estado = 'aprobado'`. | Alinear `040` (si mantenemos `040` sin `WHERE`, quitar el `WHERE` de su `concept` y añadir desempate si se agrega el pago rechazado; o bien pedir pagos aprobados en `040` para que coincida con su `concept`). |

### 4.2. Los 7 saltos cognitivos en explicaciones existentes
1. **`#17 (027)`**: Presentar formalmente `GROUP BY` en su `concept` (actualmente solo explica `MIN/MAX`).
2. **`#18 (028)` y `#23 (030)`**: Explicar por qué los alias del `SELECT` funcionan en `ORDER BY` pero **no** en `WHERE`, `GROUP BY` ni `HAVING` (orden de evaluación lógica).
3. **`#25 (005)`**: Explicar explícitamente qué es Clave Primaria (`PK`) vs Clave Foránea (`FK`), cómo se declara un alias de tabla (`FROM pedidos p`) y cómo evita ambigüedad.
4. **`#29 (012)`**: Explicar por qué al agrupar tras un `JOIN` se incluyen en `GROUP BY` tanto la `PK` (`c.cliente_id`) como los atributos descriptivos (`c.nombre, c.apellido`).
5. **`#53 (049)`**: Sustituir el join implícito con coma (`FROM gasto_clientes g, promedio_general p`) por `CROSS JOIN promedio_general p` (en `solution_query`, `hints[2]` y `concept.syntax`), eliminando la contradicción con la Guía del Módulo 5 y alineándolo con la Guía del Módulo 11.
6. **`#56 (007)`, `#57 (018)`, `#59 (060)` y `#60 (050)`**: Contrastar `ROW_NUMBER` vs `RANK` vs `DENSE_RANK`, explicar por qué `ORDER BY` dentro de `SUM() OVER (...)` convierte la suma en acumulado fila a fila, y presentar `LEAD()` junto a `LAG()`.
7. **`#64 (064)` y `#67 (067)`**: En `#64`, reformular el `prompt` para no regalar la subconsulta `SELECT` literal completa en el enunciado (explicando la exclusión del producto `15`); en `#67`, aclarar que en `SET` el alias de tabla solo se prohíbe a la **izquierda** del signo `=`.

### 4.3. Anti-Spoilers, `SAMPLE_TABLES`, Redacción y Sincronía
* **Anti-Spoilers (Regla 5):**
  * Eliminar `"productos"` en `concept.summary` de `#31 (013)`.
  * Eliminar `clientes_pkey` y `clientes_email_key` en `execution_order_note` de `#76 (076)`.
* **`SAMPLE_TABLES`:**
  * Añadir la columna `proveedor_id` a `SAMPLE_TABLE_PRODUCTOS` en [`seed_data.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/curriculum/seed_data.py#L77-L87) y [`fallbackCurriculum.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/fallbackCurriculum.ts#L10-L18).
  * Alinear los datos de `SAMPLE_TABLE_PROVEEDORES` y `SAMPLE_TABLE_PAGOS` con `ecommerce_seed.sql`.
* **Gramática y Precisión:**
  * Corregir `"el condición"` $\to$ `"la condición"` en `#67 (067)`, `#68 (068)` y `#75 (075)`.
  * Corregir `"la número de filas"` $\to$ `"el número de filas"` en [`moduleGuides.ts#L336`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/moduleGuides.ts#L336).
  * Quitar `"en la misma fecha"` del `prompt` de `#74 (074)`.
  * Añadir desempate `, cat.nombre_categoria ASC` en `#37 (039)`.

---

## 5. Plan de Acción Completo y Decisiones para Confirmar

Para ejecutar la remediación completa (llevando el catálogo de **76 a 80 ejercicios** y corrigiendo todos los puntos anteriores), el plan técnico consta de:

1. **Actualizar [`database/sandbox/ecommerce_seed.sql`](file:///c:/Desarrollo/Qurio/database/sandbox/ecommerce_seed.sql):**
   * En `proveedores`, cambiar el teléfono del proveedor `5` (`Peripheral Craft`) a `NULL` para habilitar el reto de `IS NULL` en el Módulo 2 (`0077`).
   * En `pagos`, añadir el registro `(12, 201, 'paypal', 1590.00, '2024-01-09', 'rechazado')` para que el filtro `WHERE pg.estado_pago = 'aprobado'` de `#28 (035)` sea discriminante (y definir en `#38/040` el filtro de pagos aprobados o el desempate por `pg.pago_id ASC`).
2. **Agregar los 4 nuevos ejercicios (`0077`, `0078`, `0079`, `0080`) y reenumerar `sort_order` `1..80`:**
   * `e0000000-0000-0000-0000-000000000077` (Módulo 2): *Proveedores sin teléfono registrado (`IS NULL`)*
   * `e0000000-0000-0000-0000-000000000078` (Módulo 2): *Combinación de condiciones con paréntesis (`(OR) + AND`)*
   * `e0000000-0000-0000-0000-000000000079` (Módulo 4): *Pedidos totales vs. compradores únicos (`COUNT DISTINCT`)*
   * `e0000000-0000-0000-0000-000000000080` (Módulo 13): *Reposición inteligente de stock (`UPSERT` con `ON CONFLICT`)*
3. **Corregir los 6 bloques `concept` desalineados, los 7 saltos cognitivos, los 2 spoilers, las tablas de muestra y los errores gramaticales** en:
   * [`apps/api/app/modules/curriculum/seed_data.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/curriculum/seed_data.py)
   * [`apps/web/src/lib/fallbackCurriculum.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/fallbackCurriculum.ts)
   * [`apps/web/src/lib/moduleGuides.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/moduleGuides.ts)
   * [`database/supabase/02_seed_curriculum.sql`](file:///c:/Desarrollo/Qurio/database/supabase/02_seed_curriculum.sql) y [`06_humanize_curriculum_copy.sql`](file:///c:/Desarrollo/Qurio/database/supabase/06_humanize_curriculum_copy.sql)
   * [`apps/api/sync_supabase_curriculum.py`](file:///c:/Desarrollo/Qurio/apps/api/sync_supabase_curriculum.py)
4. **Reforzar [`apps/api/tests/test_schema_consistency.py`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_schema_consistency.py):**
   * Actualizar el conteo esperado a `80` ejercicios (`240` pistas) y añadir una prueba automatizada que verifique que ningún `concept.syntax` incluya cláusulas ajenas a su `solution_query` ni omita la cláusula principal evaluada.
