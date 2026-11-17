# Regla de Ingeniería Curricular y Pedagógica SQL — Qurio

Toda creación, modificación o revisión de ejercicios, módulos, pistas o rutas formativas en Qurio debe regirse estrictamente por [`docs/pedagogia/qurio_pedagogical_specification_ai_agent_framework.md`](file:///c:/Desarrollo/Qurio/docs/pedagogia/qurio_pedagogical_specification_ai_agent_framework.md).

---

## Checklist Obligatorio al Crear o Editar Ejercicios

1. **Paridad con PostgreSQL 16 (`readonly_student`):**
   * Toda `solution_query` debe ser 100% válida en PostgreSQL 16 sin dialectos ajenos ni funciones inventadas y ejecutar bajo `statement_timeout = 2000ms`.
2. **Esquema Canónico Cerrado (10 Tablas):**
   * Utilizar exclusivamente las 10 tablas y columnas exactas de [`database/sandbox/ecommerce_seed.sql`](file:///c:/Desarrollo/Qurio/database/sandbox/ecommerce_seed.sql) (`clientes`, `categorias`, `proveedores`, `productos`, `pedidos`, `detalle_pedidos`, `facturas`, `pagos`, `almacenes`, `inventario`).
3. **Cardinalidad Verificada (`1..20` filas):**
   * Ninguna `solution_query` puede retornar `0` filas ni superar las `20` filas de salida práctica en `ecommerce_sandbox`.
4. **Determinismo Estricto en Ordenamiento y Límites:**
   * Si el reto usa `LIMIT`, `OFFSET` o `check_order=True`, `ORDER BY` debe incluir un criterio secundario único de desempate (ej. `cliente_id ASC`, `producto_id ASC`, `pedido_id ASC`), salvo conjuntos matemáticamente únicos (`DISTINCT`, `UNION`, `EXCEPT`, `INTERSECT` o `ROW_NUMBER()` global).
5. **Blindaje Anti-Spoilers en `concept`:**
   * `concept.summary`, `concept.syntax`, `concept.key_points` y `concept.execution_order_note` **jamás deben nombrar tablas reales ni columnas específicas del reto**; usar solo metavariables abstractas (`tabla_origen`, `columna_1`, `entidad_id`, `importe`).
6. **Andamiaje en Exactamente 3 Pistas Progresivas:**
   * Nivel 1 (Conceptual, `-15% XP`): lógica relacional sin escribir la consulta.
   * Nivel 2 (Estructural, `-20% XP`): cláusulas, operadores y alias requeridos.
   * Nivel 3 (Plantilla, `-25% XP`): esqueleto parcial con huecos (`???`), nunca spoilers literales tipo `"Escribe: <solución>"`.
7. **Español 100% Progresivo y Átomo Cognitivo:**
   * Redactar títulos, consignas, pistas y etiquetas de UI en español claro y gradual (reservando el inglés únicamente para palabras clave y conceptos propios de SQL).
   * Evaluar un concepto nuevo a la vez respetando la progresión: `Principiante` (Ruta 1) $\to$ `Intermedio` (Ruta 2) $\to$ `Avanzado` (Ruta 3); consolidar operaciones simples antes de combinarlas (`GROUP BY` antes de `HAVING`; `INNER JOIN` plano antes de `INNER JOIN + GROUP BY`).
8. **Sincronía Triple y Validación Automatizada (Bloqueante):**
   * Mantener alineados [`apps/api/app/modules/curriculum/seed_data.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/curriculum/seed_data.py), [`apps/web/src/lib/fallbackCurriculum.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/fallbackCurriculum.ts) (**sin exponer jamás `solution_query`**) y [`database/supabase/02_seed_curriculum.sql`](file:///c:/Desarrollo/Qurio/database/supabase/02_seed_curriculum.sql).
   * Ejecutar obligatoriamente `pytest apps/api/tests/test_schema_consistency.py -v` contra el sandbox PostgreSQL 16 y confirmar `0` fallos antes de dar el cambio por terminado.
