# Spec: Ruta 4 — Ingeniería y Manipulación de Datos (DML & DDL) en Qurio

**Fecha:** 2026-11-18  
**Estado:** Fase 1 (`Specify`) — Pendiente de Aprobación Humana  
**Intención vinculada:** [`docs/intent/ruta-4-dml-ddl.md`](intent/ruta-4-dml-ddl.md)  
**Metodología:** [`spec-driven-development`](../.agents/skills/spec-driven-development/SKILL.md)  

---

## 0. Supuestos Explícitos (`Surface Assumptions`)

```
ASSUMPTIONS I'M MAKING:
1. Las 3 rutas actuales (Rutas 1, 2 y 3 con los retos sort_order 1..60) y el SQL Playground libre (/playground) conservan su modo estricto READ_ONLY sin cambios de comportamiento.
2. El rol `readonly_student` en PostgreSQL 16 (Docker sandbox) tendrá permiso `TEMP` sobre la base de datos `ecommerce_sandbox` (`GRANT TEMP ON DATABASE ecommerce_sandbox TO readonly_student;`), manteniendo revocados todos los permisos de escritura y DDL sobre el esquema `public`. Así, toda operación DML/DDL ocurrirá exclusivamente dentro del esquema temporal de sesión `pg_temp` dentro de una transacción con `SET LOCAL TRANSACTION READ WRITE;` y `ROLLBACK` garantizado.
3. Cada ejercicio de la Ruta 4 define en backend:
   - `execution_mode`: `"dml"` (Módulos 13 y 14) o `"ddl"` (Módulos 15 y 16), mientras que los retos 1..60 usan `"read_only"` por defecto.
   - `verification_query`: consulta `SELECT` interna determinista que inspecciona el estado resultante en `pg_temp` (o `None` cuando el propio reto exige usar la cláusula `RETURNING` y se evalúa su proyección directa).
4. En el frontend, cuando el estudiante pulsa "Probar Consulta" (`handleRunExerciseTrial`) dentro de un ejercicio, se enviará `exercise_id` opcional a `/api/v1/playground/execute` (o endpoint dedicado) para que el backend aplique las reglas y el sandbox transaccional `pg_temp` del ejercicio activo sin otorgar XP.
5. Los identificadores UUID de la Ruta 4 seguirán la convención del repositorio:
   - Módulos 13 a 16: `d0000000-0000-0000-0000-000000000013` a `d0000000-0000-0000-0000-000000000016`
   - Track ID / Slug: `data-manipulation-ddl` ("Ingeniería y Manipulación de Datos")
   - Retos 61 a 76: `e0000000-0000-0000-0000-000000000061` a `e0000000-0000-0000-0000-000000000076`
```

---

## 1. Objective (Objetivo y Criterios de Usuario)

Expandir el currículo interactivo de **Qurio** con la **Ruta 4: "Ingeniería y Manipulación de Datos"** (`data-manipulation-ddl`), añadiendo **4 módulos (Módulos 13 a 16)** y **16 retos (`sort_order` 61..76)** sobre el dominio canónico de 10 tablas (`ecommerce_sandbox`), permitiendo que los estudiantes practiquen y sean evaluados semánticamente en:
1. **Módulo 13 — Inserción de Registros (`INSERT`):** `INSERT INTO ... VALUES`, inserción multi-fila con `DEFAULT`, `INSERT ... RETURNING` e `INSERT INTO ... SELECT`.
2. **Módulo 14 — Actualización y Eliminación Segura (`UPDATE` & `DELETE`):** `UPDATE ... SET ... WHERE`, actualización calculada con `RETURNING`, `UPDATE ... FROM` multi-tabla y `DELETE FROM ... WHERE`.
3. **Módulo 15 — Creación y Evolución de Tablas (`CREATE`, `ALTER`, `DROP`):** `CREATE TABLE` con tipos de datos y `PRIMARY KEY`, restricciones (`NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`, `FOREIGN KEY`), `ALTER TABLE` (`ADD COLUMN`, `DROP COLUMN`) y `DROP TABLE IF EXISTS ... CASCADE`.
4. **Módulo 16 — Índices y Optimización Estructural (`CREATE INDEX`):** `CREATE INDEX` B-Tree simple, `CREATE UNIQUE INDEX` compuesto, índice parcial filtrado (`WHERE`) y `DROP INDEX IF EXISTS`.

### Catálogo Detallado de los 16 Retos de la Ruta 4 (`sort_order` 61..76)

| `sort_order` | UUID (`id`) | Módulo | Título del Reto | Dificultad | XP | Modo | Átomo Cognitivo Evaluado |
| :-: | :--- | :---: | :--- | :---: | :-: | :---: | :--- |
| **61** | `e0000000-...-0061` | M13 | Alta de Nueva Categoría en Catálogo | `Intermedio` | 50 | `dml` | `INSERT INTO tabla (cols) VALUES (...)` de un registro explícito. |
| **62** | `e0000000-...-0062` | M13 | Registro Múltiple de Almacenes Regionales | `Intermedio` | 55 | `dml` | `INSERT INTO ... VALUES (...), (...)` multi-fila en una sola sentencia. |
| **63** | `e0000000-...-0063` | M13 | Alta de Producto con Confirmación Inmediata (`RETURNING`) | `Intermedio` | 60 | `dml` | Cláusula `RETURNING` en `INSERT` para proyectar columnas generadas/insertadas. |
| **64** | `e0000000-...-0064` | M13 | Abastecimiento Inicial de Inventario desde Catálogo (`INSERT ... SELECT`) | `Intermedio` | 65 | `dml` | `INSERT INTO tabla_destino (...) SELECT ... FROM tabla_origen WHERE ...`. |
| **65** | `e0000000-...-0065` | M14 | Actualización de Teléfono de Proveedor (`UPDATE ... WHERE`) | `Intermedio` | 50 | `dml` | `UPDATE tabla SET col = val WHERE pk = id` puntual. |
| **66** | `e0000000-...-0066` | M14 | Ajuste Inflacionario de Precios con `RETURNING` | `Intermedio` | 60 | `dml` | `UPDATE` con expresión aritmética (`ROUND`), filtro `WHERE` y proyección `RETURNING`. |
| **67** | `e0000000-...-0067` | M14 | Despacho de Pedidos con Factura Pagada (`UPDATE ... FROM`) | `Intermedio` | 70 | `dml` | `UPDATE tabla_a SET ... FROM tabla_b WHERE ...` (actualización cruzada en PostgreSQL). |
| **68** | `e0000000-...-0068` | M14 | Depuración Segura de Pagos Rechazados o Huérfanos (`DELETE ... WHERE`) | `Intermedio` | 60 | `dml` | `DELETE FROM tabla WHERE condicion` precisa sin afectar registros activos. |
| **69** | `e0000000-...-0069` | M15 | Diseño de Tabla de Cupones Promocionales (`CREATE TABLE`) | `Intermedio` | 60 | `ddl` | `CREATE TABLE` con tipos de datos (`SERIAL`, `VARCHAR`, `NUMERIC`, `DATE`) y `PRIMARY KEY`. |
| **70** | `e0000000-...-0070` | M15 | Tabla de Reseñas con Reglas de Integridad (`CHECK`, `UNIQUE`, `FK`) | `Intermedio` | 70 | `ddl` | Restricciones `NOT NULL`, `UNIQUE`, `DEFAULT`, `CHECK (calificacion BETWEEN 1 AND 5)` y `REFERENCES`. |
| **71** | `e0000000-...-0071` | M15 | Expansión de Esquema en Almacenes (`ALTER TABLE ... ADD COLUMN`) | `Intermedio` | 65 | `ddl` | `ALTER TABLE tabla ADD COLUMN col tipo DEFAULT valor NOT NULL`. |
| **72** | `e0000000-...-0072` | M15 | Retiro Controlado de Tabla Temporal (`DROP TABLE ... CASCADE`) | `Intermedio` | 60 | `ddl` | `DROP TABLE IF EXISTS nombre_tabla CASCADE` sobre tabla efímera de auditoría. |
| **73** | `e0000000-...-0073` | M16 | Índice de Búsqueda por Ciudad de Clientes (`CREATE INDEX`) | `Avanzado` | 70 | `ddl` | `CREATE INDEX nombre_idx ON tabla (columna)` B-Tree estándar. |
| **74** | `e0000000-...-0074` | M16 | Índice Compuesto para Historial de Pedidos (`Multi-Column Index`) | `Avanzado` | 75 | `ddl` | `CREATE INDEX nombre_idx ON pedidos (cliente_id, fecha_pedido DESC)`. |
| **75** | `e0000000-...-0075` | M16 | Índice Parcial de Pedidos Pendientes (`Partial Index WHERE`) | `Avanzado` | 85 | `ddl` | `CREATE INDEX nombre_idx ON pedidos (fecha_pedido) WHERE estado_pedido = 'pendiente'`. |
| **76** | `e0000000-...-0076` | M16 | Eliminación de Índice Obsoleto (`DROP INDEX IF EXISTS`) | `Avanzado` | 70 | `ddl` | `DROP INDEX IF EXISTS nombre_idx` tras detectar índice redundante precreado en la sesión. |

---

## 2. Tech Stack & Architecture Contracts

* **Backend:** FastAPI (`Python 3.12`), `pydantic >= 2.0`, `sqlglot >= 25.0.0` (dialecto `postgres`), `asyncpg >= 0.30.0`.
* **Sandbox Database:** PostgreSQL 16 (`postgres:16-alpine` en Docker, puerto `5433`).
* **Frontend:** React 18, TypeScript 5.7 (`strict: true`), Tailwind CSS 3.4 (*Terminal Glow Minimal*), Monaco Editor (`@monaco-editor/react`).

### 2.1 Contrato de Aislamiento Transaccional en `pg_temp` (`SandboxRunner`)
Para ejecutar cualquier reto con `execution_mode in ("dml", "ddl")`:
1. Se adquiere una conexión del pool `asyncpg` y se abre una transacción explícita.
2. Se ejecuta `SET LOCAL TRANSACTION READ WRITE;` junto con:
   ```sql
   SET LOCAL statement_timeout = '2000ms';
   SET LOCAL lock_timeout = '500ms';
   SET LOCAL work_mem = '16MB';
   SET LOCAL temp_file_limit = '16MB';
   ```
3. Se inicializa el entorno efímero en `pg_temp` clonando las 10 tablas canónicas (estructura, `PRIMARY KEY`, `UNIQUE`, `CHECK`, `DEFAULT`, secuencias inicializadas en el valor exacto del seed y filas de `public.*`) más cualquier objeto previo requerido por el reto (por ejemplo, una tabla auxiliar `auditoria_obsoleta` para el reto #72 de `DROP TABLE` o un índice preexistente `idx_clientes_pais_antiguo` para el reto #76 de `DROP INDEX`), y colocando `SET LOCAL search_path TO pg_temp, public;`.
4. **Determinismo entre Alumno y Solución Oficial:**
   * En vez de compartir el estado mutado, la ejecución del alumno y la ejecución de `solution_query` corren cada una sobre un estado `pg_temp` idéntico y limpio (mediante `SAVEPOINT` + reinicio determinista de tablas/secuencias en `pg_temp`, o dos transacciones efímeras `READ WRITE` independientes que terminan siempre en `ROLLBACK`).
   * **Ventaja de dos transacciones `ROLLBACK` independientes:** Si la sentencia del alumno produce un error de PostgreSQL (ej. violación de `CHECK` o `SyntaxError`), la transacción del alumno no aborta ni ensucia la transacción de `solution_query`, y las secuencias `SERIAL` (`pg_temp`) arrancan exactamente en el mismo número (`16` para `clientes`, `6` para `categorias`, etc.) en ambas ejecuciones.
5. **Ejecución de `verification_query`:**
   * Si el ejercicio define `verification_query` (ej. `SELECT categoria_id, nombre_categoria, descripcion FROM categorias ORDER BY categoria_id ASC;`), el runner ejecuta primero la sentencia DML/DDL del estudiante (`conn.execute(student_sql)`) y acto seguido ejecuta `verification_query` (`conn.fetch(verification_query)`), retornando sus columnas y filas en `ExecutionResult`.
   * Si el ejercicio evalúa directamente `RETURNING` (`verification_query is None`), el runner obtiene las columnas y filas devueltas por la propia sentencia `INSERT/UPDATE/DELETE ... RETURNING` del estudiante, y el inspector pedagógico AST verifica que la sentencia incluya obligatoriamente `RETURNING` y el tipo de comando requerido (`INSERT`, `UPDATE`, etc.).

---

## 3. Commands (Comandos Ejecutables de Verificación)

```powershell
# 1. Pruebas automatizadas de Backend (Seguridad AST, Evaluador, Consistencia Curricular y Sandbox)
pytest apps/api/tests/test_security.py apps/api/tests/test_evaluator.py apps/api/tests/test_schema_consistency.py -v

# 2. Suite completa de Backend
pytest apps/api/tests/ -v

# 3. Pruebas automatizadas de Frontend (Vitest)
npm --prefix apps/web test -- --run

# 4. Compilación TypeScript y Build de Producción Frontend
npm --prefix apps/web run build

# 5. Actualización obligatoria del Grafo de Conocimiento (Graphify)
python -m graphify update .
```

---

## 4. Project Structure (Archivos a Modificar / Crear)

```text
docs/
├── intent/ruta-4-dml-ddl.md                  → Declaración de intención confirmada
├── SPEC-ruta-4-dml-ddl.md                    → Esta especificación técnica formal
├── CURRICULUM_SPEC.md                        → Documentación curricular actualizada (4 rutas, 16 módulos, 76 retos)
└── BITACORA.md                               → Registro de avance de la fase

database/
├── sandbox/init.sql                          → GRANT TEMP ON DATABASE ecommerce_sandbox TO readonly_student
└── supabase/02_seed_curriculum.sql           → Seed sincronizado con la Ruta 4 (76 ejercicios, 228 pistas)

apps/api/
├── app/modules/curriculum/seed_data.py       → Fuente maestra única: ExerciseDetail (+execution_mode, +verification_query, +setup_sql) y Retos 61..76
├── app/modules/runner/
│   ├── schemas.py                            → ExecutionMode enum y exercise_id opcional en QueryExecuteRequest
│   ├── security.py                           → Validación AST contextual por ExecutionMode (READ_ONLY, DML, DDL) y enforce_row_limit seguro
│   ├── service.py                            → Ejecución transaccional aislada en pg_temp con verification_query y ROLLBACK forzado
│   ├── evaluator.py                          → Inspector AST extendido para exigir el comando DML/DDL y cláusulas clave (RETURNING, CREATE INDEX, etc.)
│   └── router.py                             → Paso de execution_mode/verification_query en /submit y en /playground/execute cuando viene exercise_id
├── app/modules/certificates/service.py       → Soporte de constancia PDF/QR para track 'data-manipulation-ddl' (4 módulos) y global-curriculum (16 módulos)
└── tests/
    ├── test_security.py                      → Pruebas unitarias de AST para modos READ_ONLY, DML y DDL (bloqueos de COPY, GRANT, FUNCTION, multi-statement)
    ├── test_evaluator.py                     → Pruebas unitarias del inspector AST para DML/DDL
    └── test_schema_consistency.py            → Validación de 76 retos, sincronía triple, rúbrica pedagógica y ejecución real en sandbox pg_temp

apps/web/src/
├── types/index.ts                            → Tipo ExecutionMode opcional en Exercise
├── lib/
│   ├── fallbackCurriculum.ts                 → Sincronización pública de Ruta 4, Módulos 13..16 y Retos 61..76 (sin solution_query ni verification_query)
│   ├── api.ts                                → Paso opcional de exerciseId en executePlayground() para modo "Probar Consulta"
│   └── moduleGuides.ts                       → 4 nuevas guías interactivas con diagramas SqlTransformDiagram para Módulos 13, 14, 15 y 16
├── hooks/useExerciseWorkspace.ts             → Enviar activeExercise.id al pulsar "Probar Consulta"
└── components/organisms/MonacoEditorPanel/
    └── sqlCompleter.ts                       → Snippets y keywords de autocompletado para INSERT, UPDATE, DELETE, RETURNING, CREATE TABLE, ALTER TABLE, DROP, CREATE INDEX
```

---

## 5. Code Style & Security Contract

Ejemplo del contrato de validación AST contextual en [`apps/api/app/modules/runner/security.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/runner/security.py):

```python
from enum import Enum
from typing import Tuple
import sqlglot
from sqlglot import exp


class ExecutionMode(str, Enum):
    READ_ONLY = "read_only"
    DML = "dml"
    DDL = "ddl"


# Nodos siempre prohibidos en CUALQUIER modo (RCE, escalada de privilegios, DoS)
ALWAYS_FORBIDDEN_NODES = (
    exp.Grant,
    exp.Revoke,
    exp.Copy,
    exp.Transaction,
    exp.Command,
    exp.Merge,
)

# Objetos DDL permitidos únicamente en ExecutionMode.DDL
ALLOWED_DDL_KINDS = {"TABLE", "INDEX", "VIEW"}
```

---

## 6. Testing Strategy

1. **Pruebas de Seguridad AST (`apps/api/tests/test_security.py`):**
   * Verificar que en modo `READ_ONLY` (por defecto) `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, `DROP` sigan 100% bloqueados.
   * Verificar que en modo `DML` se permitan `INSERT`, `UPDATE`, `DELETE` individuales, pero se bloqueen `DROP`, `CREATE`, `ALTER`, `TRUNCATE`, `COPY`, `GRANT` y sentencias múltiples (`INSERT ...; DROP ...;`).
   * Verificar que en modo `DDL` se permitan `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, `CREATE INDEX`, `DROP INDEX`, pero se bloqueen `CREATE FUNCTION`, `CREATE EXTENSION`, `CREATE ROLE`, `CREATE DATABASE`, `COPY`, `GRANT` y `pg_sleep`.
2. **Pruebas de Consistencia Curricular y Ejecución Real en Sandbox (`apps/api/tests/test_schema_consistency.py`):**
   * Verificar que los **76 ejercicios (`sort_order` 1..76)** cumplan la sincronía triple (`seed_data.py`, `fallbackCurriculum.ts`, `02_seed_curriculum.sql`), tengan 3 pistas (228 pistas en total), cumplan el blindaje anti-spoilers en `concept`, ejecuten su `solution_query` + `verification_query` contra PostgreSQL 16 devolviendo entre `1` y `20` filas, y que al terminar la prueba las 10 tablas de `public.*` en el sandbox mantengan exactamente sus conteos y estructura original (0 mutaciones residuales).
3. **Pruebas de Frontend (`Vitest`):**
   * Verificar que `MODULE_GUIDES` incluya las 16 guías, que `sqlCompleter.ts` sugiera cláusulas DML/DDL sin regresiones y que el build de producción compile con 0 errores de TypeScript.

---

## 7. Boundaries (Límites de Operación)

* **Always do (Siempre):**
  * Trabajar en una rama dedicada (`feat/track-4-dml-ddl-engineering`).
  * Ejecutar toda operación de la Ruta 4 dentro de una transacción efímera sobre `pg_temp` que finalice incondicionalmente con `ROLLBACK`.
  * Mantener ocultos en el backend `solution_query`, `verification_query` y `setup_sql` (jamás exponerlos en `ExercisePublicDTO` ni en `fallbackCurriculum.ts`).
* **Ask first (Preguntar antes):**
  * Cualquier cambio a las tablas permanentes de producción en Supabase Cloud o adición de dependencias externas en `package.json` / `requirements.txt`.
* **Never do (Nunca):**
  * Nunca permitir múltiples sentencias separadas por `;` en una petición del usuario.
  * Nunca conceder permisos `INSERT`, `UPDATE`, `DELETE`, `ALTER` o `DROP` sobre el esquema `public` al rol `readonly_student`.

---

## 8. Success Criteria (Criterios de Éxito Verificables)

1. Los 16 nuevos ejercicios de la Ruta 4 (`sort_order` 61..76) ejecutan su `solution_query` en el sandbox PostgreSQL 16 en `< 2000ms` y producen un resultado verificable de `1..20` filas.
2. Si un estudiante envía la consulta correcta en un reto de `INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` o `CREATE INDEX`, obtiene `EvaluationStatus.PASSED` y visualiza la tabla o estructura resultante en `DataGridResults`.
3. Si un estudiante envía un `SELECT` tramposo que finge el resultado de `verification_query` sin haber ejecutado la operación DML/DDL solicitada (ej. sin hacer `CREATE INDEX` o `UPDATE`), el inspector pedagógico AST (`inspect_pedagogical_requirements`) lo rechaza con un mensaje didáctico claro.
4. Tras ejecutar 100 operaciones destructivas de prueba (`DROP TABLE pedidos CASCADE;`, `DELETE FROM clientes;`, `UPDATE productos SET precio = 0;`), una consulta inmediata a `public.clientes`, `public.pedidos` y `public.productos` confirma que el 100% de los datos semilla originales permanecen intactos.
5. `pytest` (backend) y `vitest` + `vite build` (frontend) pasan con **0 errores**.

---

## 9. Open Questions

Ninguna pregunta pendiente — todos los requerimientos funcionales, pedagógicos y de aislamiento quedaron resueltos durante la fase `interview-me`.
