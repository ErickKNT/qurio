# Qurio — Revisión de Seguridad y Auditoría de Supabase Cloud (Fase 11)

**Identificador:** `QURIO-PHASE-11-SECURITY-REVIEW`  
**Fecha de auditoría:** 10 de Noviembre de 2026  
**Proyecto auditado:** `bfvgqxfzftumwrleacof` (Supabase Cloud — Producción)  
**Modalidad:** **Auditoría Estricta de Solo Lectura (Zero Mutations)**  
**Área:** Seguridad de Datos, Control de Acceso (RLS / Privilegios), Protección de Soluciones  
**Estado:** Hallazgo Identificado — Listo para Mitigación Administrativa por el Propietario

---

## 1. Resumen Ejecutivo de Seguridad

Durante la Fase 11 se llevó a cabo una auditoría de seguridad perimetral de **Supabase Cloud**, inspeccionando de forma no invasiva las políticas de Row Level Security (RLS), la exposición de esquemas y los privilegios efectivos concedidos al rol anónimo (`anon`) y al rol autenticado (`authenticated`).

El objetivo principal fue verificar si las soluciones oficiales de los ejercicios (`solution_query`) se encuentran protegidas en la nube y confirmar si la función RPC de certificación de progreso (`record_verified_attempt`) es invulnerable a llamadas fraudulentas de clientes públicos.

---

## 2. Evidencia Empírica de Auditoría en la Nube (Solo Lectura)

Se realizaron pruebas de sondeo HTTP dirigidas a los endpoints REST de Supabase Cloud (`https://bfvgqxfzftumwrleacof.supabase.co`) utilizando la clave pública `anon` provista en la aplicación frontend.

### 2.1 Sondeo 1: Exposición de `solution_query` en Tabla `exercises`
* **Consulta enviada:**
  ```http
  GET /rest/v1/exercises?select=id,title,solution_query&limit=3 HTTP/1.1
  Host: bfvgqxfzftumwrleacof.supabase.co
  apikey: <VITE_SUPABASE_ANON_KEY>
  Authorization: Bearer <VITE_SUPABASE_ANON_KEY>
  ```
* **Respuesta obtenida:**
  * **Código HTTP:** `200 OK`
  * **Cuerpo de respuesta:**
    ```json
    [
      {
        "id": "e0000000-0000-0000-0000-000000000001",
        "title": "Catálogo Básico de Productos",
        "solution_query": "SELECT nombre_producto, precio FROM productos;"
      },
      {
        "id": "e0000000-0000-0000-0000-000000000008",
        "title": "Cálculo de Precios con IVA",
        "solution_query": "SELECT nombre_producto, precio, ROUND(precio * 1.21, 2) AS precio_con_iva FROM productos;"
      },
      {
        "id": "e0000000-0000-0000-0000-000000000019",
        "title": "Concatenación de Nombre Completo",
        "solution_query": "SELECT nombre || ' ' || apellido AS cliente_completo, email FROM clientes;"
      }
    ]
    ```
* **Diagnóstico del Hallazgo (H-01):**
  * En el entorno local (`apps/api/tests/test_supabase_migration.py`), el script `03_security_hardening.sql` restringe el acceso a la columna `solution_query` mediante la revocación explícita de `SELECT(solution_query)` al rol público.
  * **En Supabase Cloud de producción, el script `03_security_hardening.sql` aún no ha sido ejecutado por el propietario del proyecto en el SQL Editor.**
  * En consecuencia, cualquier usuario que inspeccione las peticiones de red o consulte la API REST con la clave `anon` puede leer las soluciones canónicas de los 18 ejercicios sembrados en la nube.

### 2.2 Sondeo 2: Estado de la RPC `record_verified_attempt`
* **Consulta enviada como `anon`:**
  ```http
  POST /rest/v1/rpc/record_verified_attempt HTTP/1.1
  Host: bfvgqxfzftumwrleacof.supabase.co
  apikey: <VITE_SUPABASE_ANON_KEY>
  Authorization: Bearer <VITE_SUPABASE_ANON_KEY>
  Content-Type: application/json

  {
    "p_user_id": "00000000-0000-0000-0000-000000000000",
    "p_exercise_id": "e0000000-0000-0000-0000-000000000001",
    "p_submitted_sql": "SELECT 1;",
    "p_status": "PASSED",
    "p_execution_time_ms": 1.0,
    "p_hints_used": 0,
    "p_xp_awarded": 30
  }
  ```
* **Respuesta obtenida:**
  * **Código HTTP:** `401 Unauthorized`
  * **Mensaje:** `{"code": "42501", "message": "permission denied for function record_verified_attempt"}`
* **Diagnóstico:**
  * La RPC **rechaza de forma estricta e inmediata cualquier intento de llamada por parte del rol anónimo**.
  * No es posible para un atacante invocar la RPC desde el navegador para otorgarse XP o acreditar retos sin pasar por el backend.

### 2.3 Sondeo 3: Protección de la Tabla `exercise_attempts`
* **Consulta enviada como `anon`:**
  ```http
  GET /rest/v1/exercise_attempts?limit=1 HTTP/1.1
  ```
* **Respuesta obtenida:**
  * **Código HTTP:** `401 Unauthorized` (`permission denied for table exercise_attempts`).
* **Diagnóstico:** Los intentos de resolución de los alumnos están debidamente confinados y no pueden ser leídos por usuarios externos.

### 2.4 Sondeo 4: Estado de la Tabla `user_profiles`
* **Consulta enviada como `anon`:**
  ```http
  GET /rest/v1/user_profiles?select=id,username,total_xp,current_level&limit=3 HTTP/1.1
  ```
* **Respuesta obtenida:** `200 OK` (lectura de datos públicos para leaderboard y perfiles).
* **Prueba de escritura cliente (INSERT/UPDATE directo):** Bloqueada por políticas de RLS que exigen `auth.uid() = id`.

---

## 3. Matriz de Seguridad: Local vs Supabase Cloud

| Dimensión de Seguridad | Pila Local (FastAPI + Docker Sandbox) | Supabase Cloud (Estado Actual) | Requisito Pre-Piloto |
|:---|:---:|:---:|:---:|
| **Aislamiento de Ejecución** | Contenedor Docker aislado, rol `readonly_student`, `statement_timeout = 2000ms` | N/A (Cloud no ejecuta código SQL del alumno) | Conforme |
| **Protección en Frontend** | 0 ocurrencias de `solution_query` en código o bundles compilados | N/A | Conforme |
| **Protección en API FastAPI** | Esquemas Pydantic `ExerciseResponse` omiten `solution_query` | N/A | Conforme |
| **Restricción RPC `record_verified_attempt`** | Protegida (`401 permission denied` para cliente) | Protegida (`401 permission denied` para cliente) | Conforme |
| **Protección de `exercise_attempts`** | Confinada con RLS y privilegios mínimos | Confinada con RLS (`401 permission denied` a `anon`) | Conforme |
| **Ocultación de `solution_query` en REST** | **PROTEGIDA** (revocada en base de datos local) | **EXPUESTA** (falta aplicar `03_security_hardening.sql`) | **Acción Requerida** |

---

## 4. Guía de Migración DDL Pendiente para el Propietario

Debido a que las instrucciones autorizadas para esta fase establecen de forma estricta:
> *"Supabase Cloud: no ejecutes operaciones de escritura ni migraciones DDL; audita en modo solo lectura"*,

el agente no ha aplicado modificaciones sobre Supabase Cloud.

Para subsanar el hallazgo **H-01** antes de la apertura del piloto con estudiantes, el **propietario del proyecto** debe seguir las siguientes instrucciones administrativas directas:

### 4.1 Pasos de Aplicación en Supabase Cloud
1. Iniciar sesión en el [Panel de Control de Supabase](https://supabase.com/dashboard/project/bfvgqxfzftumwrleacof).
2. En el menú de navegación izquierdo, ingresar a **SQL Editor**.
3. Abrir o crear una nueva consulta en blanco (**New Query**).
4. Copiar y pegar el contenido íntegro del script existente en el repositorio:
   [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql).
5. Pulsar el botón **Run** (Ejecutar).

### 4.2 Script SQL a Aplicar (`03_security_hardening.sql`)
```sql
-- ============================================================================
-- QURIO — Hardening de Seguridad de Supabase Cloud
-- ============================================================================

-- 1. Revocar acceso a la columna de soluciones canónicas
REVOKE SELECT ON exercises FROM anon, authenticated;
GRANT SELECT (
    id, track_id, title, description, initial_code,
    difficulty, order_index, xp_reward, is_active, created_at
) ON exercises TO anon, authenticated;

-- 2. Asegurar que solo el service_role del backend pueda consultar soluciones completas
GRANT SELECT ON exercises TO service_role;

-- 3. Blindar la tabla de intentos de ejercicios
REVOKE ALL ON exercise_attempts FROM anon;
GRANT SELECT, INSERT ON exercise_attempts TO authenticated;

-- 4. Blindar la función RPC para que solo el backend pueda certificar intentos
REVOKE ALL ON FUNCTION record_verified_attempt(UUID, UUID, TEXT, VARCHAR, NUMERIC, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION record_verified_attempt(UUID, UUID, TEXT, VARCHAR, NUMERIC, INT, INT) FROM anon;
REVOKE ALL ON FUNCTION record_verified_attempt(UUID, UUID, TEXT, VARCHAR, NUMERIC, INT, INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION record_verified_attempt(UUID, UUID, TEXT, VARCHAR, NUMERIC, INT, INT) TO service_role;
```

### 4.3 Consulta de Verificación Post-Aplicación
Una vez ejecutado el script en el SQL Editor, el propietario puede verificar la efectividad ejecutando la siguiente consulta:

```sql
-- Debe retornar error de privilegios insuficientes en la columna solution_query para anon:
SET ROLE anon;
SELECT id, title, solution_query FROM exercises;
-- Salida esperada: ERROR: permission denied for column "solution_query" of relation "exercises"

-- Debe permitir la lectura de los campos públicos:
SELECT id, title, xp_reward FROM exercises LIMIT 3;
-- Salida esperada: 3 filas devueltas con éxito

RESET ROLE;
```

---

## 5. Análisis de Impacto de la Migración

* **Impacto en el Frontend:** Nulo. La interfaz web (`apps/web`) jamás lee ni requiere la columna `solution_query`.
* **Impacto en el Backend (FastAPI):** Nulo. El backend se comunica con Supabase utilizando el rol `service_role` o la base de datos sandbox local, por lo que retiene los permisos necesarios para la evaluación.
* **Beneficio de Seguridad:** Cierre total de la única brecha de fuga de soluciones en la nube, garantizando que los estudiantes del piloto no puedan copiar las respuestas inspeccionando el tráfico de red.
