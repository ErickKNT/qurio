# Implementation Plan: Ruta 4 — Ingeniería y Manipulación de Datos (DML & DDL)

**Fecha:** 2026-11-18  
**Rama Activa:** `feat/track-4-dml-ddl-engineering`  
**Especificación Vinculada:** [`docs/SPEC-ruta-4-dml-ddl.md`](../docs/SPEC-ruta-4-dml-ddl.md)  
**Metodología:** [`planning-and-task-breakdown`](../.agents/skills/planning-and-task-breakdown/SKILL.md)  

---

## Overview

Implementar la **Ruta 4 ("Ingeniería y Manipulación de Datos: DML & DDL")** en **Qurio**, añadiendo **4 módulos (Módulos 13 a 16)** y **16 retos (`sort_order` 61..76)** sobre PostgreSQL 16. El motor de ejecución (`SandboxRunner`) aislará toda operación `INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` y `CREATE/DROP INDEX` dentro de una transacción efímera (`READ WRITE` + `ROLLBACK` garantizado) sobre copias clonadas en el esquema temporal de la sesión (`pg_temp`), evaluando el estado resultante mediante `verification_query` automática + inspección AST pedagógica, e integrando guías modulares interactivas, autocompletado en Monaco Editor y constancias verificables PDF/QR.

---

## Architecture Decisions

1. **Aislamiento Efímero en `pg_temp` con `ROLLBACK` Determinista:**
   * En vez de levantar contenedores Docker efímeros por usuario o abrir permisos de escritura sobre `public.*`, se otorga `GRANT TEMP ON DATABASE ecommerce_sandbox TO readonly_student;` y cada evaluación `dml`/`ddl` clona en `pg_temp` las tablas canónicas con sus restricciones y secuencias reiniciadas, anteponiendo `SET LOCAL search_path TO pg_temp, public;` y finalizando siempre con `ROLLBACK`.
2. **Dos Transacciones Independientes (Alumno vs. Solución Oficial):**
   * La consulta del estudiante y la `solution_query` de referencia se ejecutan en transacciones efímeras separadas sobre `pg_temp`. Esto garantiza que las secuencias (`SERIAL`), restricciones y estado inicial sean 100% idénticos y que un error de base de datos del alumno no contamine la transacción del evaluador.
3. **Políticas AST Basadas en `ExecutionMode` (`read_only`, `dml`, `ddl`):**
   * `validate_sql_security()` recibe el modo del reto activo:
     * `read_only`: Solo `SELECT` / `WITH` (Rutas 1–3 y SQL Playground libre).
     * `dml`: Permite `INSERT`, `UPDATE`, `DELETE` y `SELECT` (subconsultas/proyecciones), bloqueando `DROP`, `ALTER`, `CREATE` y `TRUNCATE`.
     * `ddl`: Permite `CREATE`, `ALTER` y `DROP` únicamente sobre `TABLE`, `INDEX` o `VIEW`.
   * **Denylist Global Inquebrantable:** `COPY`, `GRANT`, `REVOKE`, `CREATE FUNCTION`, `CREATE PROCEDURE`, `CREATE TRIGGER`, `CREATE EXTENSION`, `CREATE ROLE`, `ALTER SYSTEM`, bloques anónimos `DO`, sentencias múltiples (`;`), `pg_sleep`, `dblink`, `pg_read_file` y catálogos sensibles (`pg_shadow`, `pg_authid`, `pg_roles`).
4. **Verificación Post-Mutación (`verification_query` + Inspector AST):**
   * Los retos que no exigen `RETURNING` definen una `verification_query` interna en `ExerciseDetail` que proyecta las filas o metadatos del catálogo en `pg_temp` (`1..20` filas) para mostrarlos en `DataGridResults` y compararlos semánticamente.
   * El inspector pedagógico AST (`evaluator.py`) verifica que el estudiante haya utilizado la instrucción DML/DDL exigida por la consigna (impidiendo que un alumno pase un reto de `UPDATE` o `CREATE INDEX` enviando un `SELECT` literal que imite la tabla de verificación).

---

## Dependency Graph

```text
1. Sandbox DB Role (init.sql: GRANT TEMP)
       │
       ├── 2. Security AST & Schemas (ExecutionMode: read_only, dml, ddl)
       │         │
       │         ├── 3. SandboxRunner pg_temp Transactional Engine & AST Evaluator
       │         │         │
       │         │         └── 4. Curriculum Seed Data (Retos 61..76 en seed_data.py)
       │         │                   │
       │         │                   ├── 5. Triple Sync (fallbackCurriculum.ts + 02_seed_curriculum.sql)
       │         │                   │
       │         │                   └── 6. Frontend Trial Mode, Guides, Completer & Certificates
```

---

## Task List

### Phase 1: Foundation — Sandbox Permissions, AST Security & Transactional Runner
- [x] **Task 1:** Habilitar `GRANT TEMP` en `database/sandbox/init.sql` (y aplicar en vivo al contenedor `qurio-postgres-sandbox`) manteniendo revocados `CREATE` y `INSERT/UPDATE/DELETE` en `public`.
- [x] **Task 2:** Extender `schemas.py` y `security.py` con `ExecutionMode` (`read_only`, `dml`, `ddl`), validación AST contextual, protección de `enforce_row_limit()` para no inyectar `LIMIT` en raíces mutables, y pruebas unitarias en `test_security.py`.
- [x] **Task 3:** Implementar el motor transaccional efímero `pg_temp` en `service.py` (`execute_ephemeral_mutation_query`), extender `evaluator.py` (inspector AST para `INSERT`, `UPDATE`, `DELETE`, `RETURNING`, `CREATE/ALTER/DROP TABLE`, `CREATE/DROP INDEX`), actualizar `router.py` y verificar con pruebas unitarias en `test_evaluator.py`.

### Checkpoint 1: Foundation
- [x] `pytest apps/api/tests/test_security.py apps/api/tests/test_evaluator.py -v` pasa al 100% y el contenedor sandbox conserva `public.*` inmutable.

### Phase 2: Core Curriculum — Ruta 4 (16 Retos DML/DDL & Sincronía Triple)
- [x] **Task 4:** Diseñar e incorporar los 16 nuevos ejercicios (`sort_order` 61..76, Módulos 13 a 16) en `apps/api/app/modules/curriculum/seed_data.py` con `execution_mode`, `verification_query` y `setup_sql`, cumpliendo todas las reglas de `.agents/rules/sql-pedagogy.md`.
- [x] **Task 5:** Sincronizar la Ruta 4 y los 16 ejercicios en `apps/web/src/lib/fallbackCurriculum.ts` (sin exponer `solution_query`, `verification_query` ni `setup_sql`), `database/supabase/02_seed_curriculum.sql` (76 retos, 228 pistas) y `apps/api/sync_supabase_curriculum.py`.
- [x] **Task 6:** Actualizar `apps/api/tests/test_schema_consistency.py` para validar los 76 ejercicios, la sincronía triple, la rúbrica pedagógica, la ejecución real en `pg_temp` y la inmutabilidad de `public.*`.

### Checkpoint 2: Core Curriculum
- [x] `pytest apps/api/tests/test_schema_consistency.py -v` pasa con 0 fallos contra el sandbox PostgreSQL 16.

### Phase 3: Frontend Integration — Trial Execution, Guides, Completer & Certificates
- [x] **Task 7:** Actualizar `apps/web/src/lib/api.ts` y `apps/web/src/hooks/useExerciseWorkspace.ts` para que el botón **"Probar Consulta"** (`handleRunExerciseTrial`) envíe `exercise_id` y permita previsualizar mutaciones DML/DDL en `pg_temp` sin otorgar XP.
- [x] **Task 8:** Añadir las 4 nuevas guías teóricas interactivas (Módulos 13 a 16) con diagramas `SqlTransformDiagram` en `apps/web/src/lib/moduleGuides.ts`, ampliar los snippets DML/DDL en `sqlCompleter.ts` y registrar la Ruta 4 (`data-manipulation-ddl`) en `apps/api/app/modules/certificates/service.py` y `CertificateShowcase.tsx`.
- [x] **Task 9:** Actualizar documentación (`docs/CURRICULUM_SPEC.md`, `docs/BITACORA.md`), ejecutar `python -m graphify update .` y verificar suites completas (`pytest`, `vitest`, `vite build`).

### Checkpoint 3: Complete
- [x] Todas las pruebas de backend (`pytest`) y frontend (`vitest` + `npm run build`) pasan sin errores y el grafo de conocimiento (`graphify-out/`) está actualizado.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
| :--- | :---: | :--- |
| Desfase de secuencias `SERIAL` entre intento del alumno y `solution_query` | High | Ejecutar el intento del alumno y la `solution_query` en transacciones `pg_temp` independientes con `ROLLBACK` y secuencias inicializadas en valores fijos deterministas. |
| Alumno pasa reto DML/DDL escribiendo un `SELECT` constante que imita la salida de `verification_query` | High | El inspector AST (`inspect_pedagogical_requirements` en `evaluator.py`) verifica que la raíz AST del estudiante coincida con el tipo de sentencia exigido por `expected_sql` (`Insert`, `Update`, `Delete`, `Create`, `Alter`, `Drop`). |
| Sobrecarga de memoria por `INSERT INTO ... SELECT` masivo | Medium | `SET LOCAL temp_file_limit = '16MB'`, `work_mem = '16MB'` y `statement_timeout = '2000ms'` abortan cualquier explosión cartesiana al instante. |
| Exposición accidental de `verification_query` o `setup_sql` al cliente | High | Mantener ambos campos exclusivamente en `ExerciseDetail` (interno en backend) y excluirlos estructuralmente de `ExercisePublicDTO` y `fallbackCurriculum.ts`. |

---

## Open Questions

Ninguna — especificación validada y aprobada por el propietario del producto.
