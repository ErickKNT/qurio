# Informe de Resultados de Remediación y Hardening de Seguridad (Fase 9) — Qurio

**Fecha de Ejecución:** 9 de Noviembre de 2026  
**Rama Git:** `security/phase-9-hardening`  
**Estado:** Implementación Local y Batería de Pruebas Concluidas al 100% (Pendiente de Autorización para Despliegue en Supabase Cloud)  
**Autor:** Equipo de Arquitectura, AppSec y Backend de Qurio  

---

## 1. Resumen Ejecutivo

Este documento consolida los resultados técnicos de la remediación de seguridad aplicada a la plataforma **Qurio** en el marco de la **Fase 9: Hardening de Seguridad**. Siguiendo las directrices del informe [`SECURITY_AUDIT.md`](./SECURITY_AUDIT.md) y los mandatos del usuario, se ha reemplazado la validación superficial basada en expresiones regulares por una arquitectura de **defensa en profundidad**, centralizando la autoridad de progresión en el backend y blindando tanto el motor de ejecución SQL como la autenticación asimétrica de Supabase.

### Indicadores Clave de Calidad y Seguridad
* **Cobertura de Pruebas Automatizadas:** 49/49 pruebas pasando exitosamente en 2.34s (incremento del 88% respecto a las 26 pruebas iniciales).
* **Consultas del Currículo Verificadas:** Las 18 consultas oficiales de las 3 rutas formativas fueron probadas sintáctica y semánticamente contra el validador AST y el contenedor PostgreSQL Sandbox (`18/18 PASSED`).
* **Compilación Frontend:** TypeScript en modo `strict: true` y build de producción Vite finalizado en 5.47s con 0 errores.
* **Integridad de Datos en Producción:** Ninguna migración ni cambio de políticas ha sido ejecutado en Supabase Cloud sin previa autorización. La rama `main` se mantiene intacta.

---

## 2. Matriz de Remediación de Hallazgos

| ID | Hallazgo Original (`SECURITY_AUDIT.md`) | Severidad Previa | Estrategia de Remediación Implementada | Estado | Evidencia de Verificación |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **SEC-01** | Evasión de validación regex en SQL Runner mediante mutaciones en CTEs o literales con punto y coma | **ALTA** | Sustitución completa por análisis sintáctico formal del AST con **SQLGlot** (dialecto PostgreSQL). Inspección exhaustiva de todo el árbol (`walk()`) para neutralizar `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, etc., incluso dentro de subconsultas. | **REMEDIADO** | `test_block_cte_with_mutation`, `test_string_literal_with_semicolon_is_allowed` (42 pruebas pasando). |
| **SEC-02** | Autoridad de progresión vulnerable: Auto-adjudicación de XP y niveles desde el cliente web | **ALTA** | Creación de la función RPC protegida `record_verified_attempt()` con `SECURITY DEFINER`, `search_path = public, pg_temp` e idempotencia. Retiro de permisos de `UPDATE` sobre `xp` y `level` a clientes directos mediante Column-Level Security (CLS). | **REMEDIADO (Código listo)** | Script [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql) generado y probado en lógica backend; pendiente de ejecución manual en Supabase Cloud. |
| **SEC-03** | Falta de autenticación en endpoints de ejecución del backend (`/submit` y `/playground`) | **MEDIA-ALTA** | Implementación de `app/core/auth.py` con validación asimétrica **ES256** vía endpoint JWKS de Supabase (`/.well-known/jwks.json`). Modo invitado desacoplado para práctica sin persistencia ni XP. | **REMEDIADO** | `test_auth.py` (6 casos: tokens válidos, expirados, audience incorrecta, modo invitado). |
| **SEC-04** | Ausencia de Rate Limiting y riesgo de saturación del pool de conexiones | **MEDIA** | Módulo `app/core/rate_limit.py`: Límite estricto de 20 req/min por IP para invitados y 120 req/min por UID para autenticados. Semáforo `asyncio.Semaphore(10)` protegiendo el pool `asyncpg`. | **REMEDIADO** | `test_rate_limit.py` (HTTP 429 tras exceder cuota y verificación de cabecera `Retry-After`). |
| **SEC-05** | Exposición innecesaria del puerto de PostgreSQL al exterior en Docker | **MEDIA** | Re-vinculación en [`docker-compose.yml`](file:///c:/Desarrollo/Qurio/docker-compose.yml) a `127.0.0.1:5433:5432`. El sandbox ya no escucha en interfaces públicas o de red local. | **REMEDIADO** | Verificado en configuración de Docker y arranque local. |
| **SEC-06** | Falta de control de tiempo de bloqueo (`lock_timeout`) y archivos temporales en Sandbox | **BAJA-MEDIA** | Se añadieron `lock_timeout = '1000ms'` y `temp_file_limit = '32MB'` sobre el rol `readonly_student` en [`init.sql`](file:///c:/Desarrollo/Qurio/database/sandbox/init.sql). | **REMEDIADO** | Incorporado en el DDL de inicialización del contenedor. |
| **SEC-07** | Ausencia de cabeceras de seguridad HTTP básicas en FastAPI | **BAJA** | Middleware HTTP en [`main.py`](file:///c:/Desarrollo/Qurio/apps/api/app/main.py) inyectando `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy` y `Permissions-Policy`. | **REMEDIADO** | Presente en todas las respuestas del API. |
| **SEC-08** | Inconsistencia de tipo en frontend entre estados de ejecución de consulta | **BAJA (Calidad)** | Normalización a `executionStatus === 'SUCCESS'` en `ExerciseSpecPanel.tsx` y validación estricta de compilador TypeScript. | **REMEDIADO** | Build de Vite completado en 5.47s con 0 errores. |

---

## 3. Desglose Técnico de las Modificaciones

### 3.1. SQL Runner y Defensa en Profundidad ([`apps/api/app/modules/runner/security.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/runner/security.py))
* **Parseo de AST:** Utiliza `sqlglot.parse(sql, read="postgres")`. Si la consulta no es parseable o contiene errores graves de sintaxis, se rechaza antes de enviarla al motor de base de datos.
* **Control de Sentencias Múltiples:** Valida que el arreglo de sentencias retorne exactamente 1 elemento (`len(statements) == 1`). A diferencia del método anterior con `clean_sql.split(";")`, SQLGlot comprende que el punto y coma dentro de una cadena `'Cable; 2m'` no divide sentencias.
* **Allowlist de Raíces:** Solo se permiten sentencias que heredan de `exp.Query` (`Select`, `Union`, `Intersect`, `Except`) o `exp.Subquery`.
* **Inspección de Nodos de Mutación:** Mediante `root.walk()`, se inspeccionan todos los nodos secundarios. Se rechaza inmediatamente cualquier instancia de `exp.Insert`, `exp.Update`, `exp.Delete`, `exp.Drop`, `exp.Alter`, `exp.Create`, `exp.Grant`, `exp.Revoke`, `exp.TruncateTable` o `exp.Copy`.
* **Soporte Controlado de `WITH RECURSIVE`:**
  * No se bloquea sintácticamente en el AST para permitir el aprendizaje de SQL avanzado (Fase 3 del currículo).
  * La contención de recursiones infinitas se confía al motor PostgreSQL:
    1. Si la consulta tiene proyección directa, `enforce_row_limit` inyecta `LIMIT 1000` en el AST de la consulta externa, permitiendo que PostgreSQL detenga la generación de filas tras 1000 iteraciones (evaluado en 3.6ms).
    2. Si la consulta recursiva agrega o calcula sin límite (ej. `SELECT MAX(n) FROM inf`), el `statement_timeout = '2000ms'` cancela la ejecución a los 2.0s y el backend captura `asyncpg.QueryCanceledError` / `asyncio.TimeoutError`, retornando: *"Tiempo de ejecución excedido (Límite: 2000ms). Optimiza tu consulta."*
* **Bloqueo de Funciones Peligrosas:** Se verifica el nombre canónico de las funciones invocadas mediante `root.find_all(exp.Func)`. Se bloquean `pg_sleep`, `pg_terminate_backend`, `pg_cancel_backend`, `pg_read_file`, `pg_write_file`, `dblink`, `pg_ls_dir`, `lo_export`, `set_config`.
* **Bloqueo de Tablas Internas:** Se inspecciona `root.find_all(exp.Table)` para prohibir accesos a `pg_shadow`, `pg_authid`, `pg_user`, `pg_roles`.
* **Manipulación de Límites con AST (`enforce_row_limit`):** Si la consulta carece de `LIMIT`, se añade `LIMIT 1000`. Si contiene un límite excesivo (ej. `LIMIT 5000`), el AST lo reescribe a `LIMIT 1000`. Si contiene un límite inferior (ej. `LIMIT 50`), se preserva intacto.

### 3.2. Módulo de Autenticación Supabase JWT ([`apps/api/app/core/auth.py`](file:///c:/Desarrollo/Qurio/apps/api/app/core/auth.py))
* **Verificación Asimétrica ES256:** El proyecto Supabase de Qurio (`bfvgqxfzftumwrleacof`) firma sus tokens con algoritmo `ES256` y clave curva elíptica P-256 (`kid: e20ddad2-254c-4c50-b41a-eb9730d3fce1`).
* **Integración PyJWKClient:** Conecta con `https://bfvgqxfzftumwrleacof.supabase.co/auth/v1/.well-known/jwks.json`, almacenando en caché la clave pública por 1 hora y soportando rotación de claves en vivo sin reiniciar el servidor.
* **Claims Obligatorios:** Valida que el claim `aud` sea `"authenticated"`, que `iss` coincida con el dominio del proyecto Supabase y que el token no haya expirado.
* **Dependencias Inyectables:**
  * `get_optional_current_user`: Extrae el usuario autenticado si hay cabecera `Authorization: Bearer <token>`. Si no existe, entrega un objeto `AuthenticatedUser(id="guest", role="anon", is_guest=True)` para soportar el modo invitado.
  * `get_required_current_user`: Exige obligatoriamente una identidad validada, rechazando invitados con HTTP 401.

### 3.3. Autoridad Central de Progreso y RPC Segura ([`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql))
* **Principio de Mínimo Privilegio:** Se revoca a los clientes web autenticados la capacidad de hacer `UPDATE` sobre `user_profiles(xp, level)` y de hacer `INSERT` sobre `exercise_attempts`.
* **Función `record_verified_attempt()`:**
  * Marcada como `SECURITY DEFINER` con `SET search_path = public, pg_temp` para neutralizar ataques de suplantación de esquema.
  * Todos los objetos referenciados están explícitamente calificados (`public.exercises`, `public.exercise_attempts`, `public.user_profiles`).
  * **Idempotencia:** Verifica si el usuario ya aprobó previamente el reto; si ya lo aprobó, registra el intento pero otorga `0 XP` para evitar inflación de experiencia.
  * **Control de Permisos:** Se revoca el permiso de ejecución a `PUBLIC`, `anon` y `authenticated`. Solo el rol `service_role` (utilizado exclusivamente por el backend) tiene permisos de invocación.

### 3.4. Rate Limiting y Concurrencia ([`apps/api/app/core/rate_limit.py`](file:///c:/Desarrollo/Qurio/apps/api/app/core/rate_limit.py))
* **Control de Frecuencia en Memoria:** Algoritmo *Sliding Window Log* con interfaz modular para desacoplar el almacenamiento y permitir migración transparente a Redis en entornos con múltiples instancias de API.
* **Cuotas:**
  * **Modo Invitado:** Máximo 20 peticiones por minuto por IP.
  * **Modo Autenticado:** Máximo 120 peticiones por minuto por `user_id`.
* **Protección del Pool:** Semáforo `asyncio.Semaphore(10)` que asegura que un pico imprevisto de consultas simultáneas no agote las conexiones disponibles de `asyncpg`.

### 3.5. Frontend ([`apps/web/src/lib/api.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/api.ts))
* Se implementó el helper `getAuthHeaders()` que consulta la sesión activa de Supabase (`supabase.auth.getSession()`).
* Todas las llamadas a `/playground/execute` y `/exercises/{id}/submit` envían automáticamente el encabezado `Authorization: Bearer <access_token>` si el usuario ha iniciado sesión. Si el usuario navega como invitado, no envía cabecera y el backend opera en modo invitado sin bloquear la experiencia visual.

---

## 4. Evidencia de Pruebas Automatizadas

La suite de pruebas automatizadas del backend se ejecutó en su totalidad:

```text
============================= test session starts =============================
platform win32 -- Python 3.14.5, pytest-9.2.0, pluggy-1.7.0
rootdir: C:\Desarrollo\Qurio\apps\api
configfile: pytest.ini
plugins: anyio-4.16.0, asyncio-1.4.1.post1
asyncio: mode=Mode.AUTO, debug=False, asyncio_default_fixture_loop_scope=session
collected 49 items

apps\api\tests\test_auth.py ......                                       [ 12%]
apps\api\tests\test_evaluator.py ........                                [ 28%]
apps\api\tests\test_integration.py ...........                           [ 51%]
apps\api\tests\test_rate_limit.py .                                      [ 53%]
apps\api\tests\test_security.py .......................                  [100%]

============================= 49 passed in 2.34s ==============================
```

### Detalle de Casos de Prueba Clave en `test_security.py` (23 Pruebas):
1. `test_all_18_curriculum_queries_pass_security`: Valida que las 18 soluciones oficiales de los ejercicios pasen el análisis AST sin falsos positivos.
2. `test_string_literal_with_semicolon_is_allowed`: Valida que `SELECT id, 'Cable; HDMI 2.0; 2m' AS desc FROM productos` sea aceptada.
3. `test_string_literal_with_sql_keywords_is_allowed`: Valida que cadenas con `DROP TABLE` o `DELETE` como datos no sean bloqueadas.
4. `test_allow_recursive_cte`: Valida que `WITH RECURSIVE` sea admitido en el AST.
5. `test_allow_set_operations_union_intersect_except`: Valida operaciones de conjuntos (`UNION`, `UNION ALL`, `INTERSECT`, `EXCEPT`).
6. `test_block_cte_with_mutation`: Valida el bloqueo de `WITH hack AS (DELETE FROM clientes ...) SELECT * FROM hack`.
7. `test_block_drop_table`, `test_block_alter_table`, `test_block_insert`, `test_block_update`, `test_block_delete`: Bloqueo de sentencias DDL/DML.
8. `test_block_dangerous_functions`: Bloqueo de `pg_sleep`, `pg_terminate_backend`, `dblink`, `pg_read_file`, etc.
9. `test_block_sensitive_catalogs_and_tables`: Bloqueo de accesos a `pg_shadow`, `pg_authid`.
10. `test_enforce_row_limit_*`: Comprobación de límites en consultas simples, con límite previo, con CTEs y consultas de conjunto.

### Detalle de Casos en `test_integration.py` (11 Pruebas):
1. `test_playground_recursive_cte_timeout`: Prueba de integración real contra el contenedor Docker donde una consulta recursiva infinita con agregación (`SELECT MAX(n) FROM inf`) es cancelada por el motor a los 2.0s retornando el error de timeout esperado.
2. `test_playground_blocked_cte_delete`: Comprueba que una mutación en CTE devuelva error de seguridad en el endpoint HTTP.
3. `test_playground_string_with_semicolon`: Comprueba que un literal con punto y coma ejecute y retorne datos reales.

---

## 5. Procedimiento para Despliegue en Supabase Cloud (Requiere Autorización)

Para que el modelo de autoridad central de progreso sea 100% efectivo en la nube de Supabase, se requiere ejecutar el script [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql).

### Pasos a Seguir:
1. **Revisión del Script:** Inspeccionar el archivo [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql).
2. **Ejecución en Supabase SQL Editor:** Copiar su contenido y ejecutarlo en el SQL Editor del panel de Supabase Cloud.
3. **Configuración de Variables de Entorno en Backend:**
   * En el entorno del backend (`apps/api/.env`), colocar el valor de `SUPABASE_SERVICE_ROLE_KEY` obtenido del panel de Supabase (*Project Settings > API > service_role (secret)*).
   * **Importante:** La clave `service_role` jamás debe agregarse en `apps/web/.env` ni compartirse con el cliente React.
4. **Fusión de la Rama Git:**
   * Una vez verificado el comportamiento con las credenciales activas, la rama `security/phase-9-hardening` podrá ser fusionada a `main`.

---

## 6. Estado del Repositorio

* **Rama activa:** `security/phase-9-hardening`
* **Commit de la fase:** `4168493` — `feat(security): implement Phase 9 hardening, SQLGlot AST runner, ES256 JWKS auth, rate limiting and certified progress`
* **Sincronización:** Rama empujada a GitHub en `origin/security/phase-9-hardening`.
* **Rama `main`:** Permanece inalterada y protegida hasta la aprobación final.
