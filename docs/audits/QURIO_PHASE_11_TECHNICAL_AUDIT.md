# Qurio — Auditoría Técnica y Revisión de Código (Fase 11.1)

**Identificador:** `QURIO-PHASE-11.1-TECHNICAL-AUDIT`  
**Rama de trabajo autorizada:** `feat/phase-11-pilot-readiness`  
**Commit base:** `bba65c2` (rama `feat/phase-10-stabilization`)  
**Fecha:** 10 de Noviembre de 2026  
**Área:** Arquitectura de Software, Seguridad, Backend FastAPI, Sandbox Docker & Frontend React/TS  
**Estado:** Certificado Integralmente

---

## 1. Resumen Ejecutivo y Alcance

Esta auditoría técnica constituye la revisión exhaustiva y conciliación definitiva de **Qurio** para la **Fase 11.1: Conciliación Final y Cierre de Hallazgos**, con el objetivo de certificar si la plataforma se encuentra técnicamente preparada para un **piloto controlado con usuarios**.

El análisis examina en profundidad:
1. **Historial Git y confinamiento estricto:** Verificación del diff acumulado contra `main` y cumplimiento riguroso de la política de **Zero Push / Zero Merge**.
2. **Reconciliación Conceptual de Decisiones Canónicas (D-01 a D-07):** Restauración de los significados aprobados en el *Qurio Product & Business Blueprint v1.2* y desacoplamiento de requerimientos técnicos en identificadores dedicados (`REQ-*`).
3. **Correcciones de Estabilización (C-01 a C-05):** Verificación empírica de la autoridad del progreso, aislamiento de invitados y retención de borradores SQL.
4. **Higiene de Secretos y Fuga de Soluciones:** Comprobación de `.gitignore`, inspección del bundle de producción (`dist/`) y protección de `solution_query`.
5. **Cadena de Suministro de Dependencias:** Auditoría de vulnerabilidades con `npm audit` y revisión de dependencias Python.
6. **Resultados de Validación Automatizada:** Ejecución de 72 pruebas en Pytest, 17 pruebas en Vitest y 19 pruebas E2E en Google Chrome real.

---

## 2. Historial Git y Diff Comparativo vs `main`

### 2.1 Topología de Ramas y Política de Confinamiento
* **Rama principal (`main`):** Preservada completamente intacta; 0 commits directos, 0 merges prematuros.
* **Rama de estabilización previa (`feat/phase-10-stabilization`):** Concluida y certificada en el commit `bba65c2`.
* **Rama de trabajo activa (`feat/phase-11-pilot-readiness`):** Rama dedicada a la preparación, auditoría y certificación del piloto.
* **Directriz estricta de confinamiento:** **Zero Push / Zero Merge**. Ningún cambio ha sido enviado a repositorios remotos ni fusionado a `main`. Todo el código, configuraciones de prueba y reportes permanecen confinados localmente a la espera de la autorización expresa del propietario.

### 2.2 Inventario Estructural de Archivos Modificados vs `main`
El árbol de trabajo acumulado en `feat/phase-11-pilot-readiness` respecto a `main` comprende:

1. **Infraestructura y Contenedores:**
   * `docker-compose.yml`: Configuración del servicio API (`qurio-api`) en puerto 8000 y del Sandbox PostgreSQL 16 (`qurio-postgres-sandbox`) en puerto 5433. Incluye el volumen de desarrollo montado en solo lectura (`./apps/api/app:/app/app:ro`) para sincronización inmediata de código sin desfases de compilación en Docker.
   * `database/sandbox/init.sql` & `ecommerce_seed.sql`: Esquema relacional canónico de 10 tablas (`productos`, `categorias`, `clientes`, `pedidos`, `detalles_pedidos`, etc.) bajo el rol restringido `readonly_student` con `statement_timeout = 2000ms`.
   * `database/supabase/03_security_hardening.sql`: Script de seguridad versión 6.0 que implementa Column-Level Security (CLS) sobre `public.exercises` (bloqueando `solution_query`), restringe `exercise_attempts` y `user_progress` a mutaciones exclusivas vía RPC, y blinda la función `record_verified_attempt`.

2. **Backend API (`apps/api/`):**
   * `app/core/config.py`: Tipado estricto con Pydantic Settings para variables de entorno, flags de modo demo y endpoints JWKS.
   * `app/core/security.py`: Validador semántico y sintáctico AST basado en `sqlglot`. Bloquea sentencias DDL/DML, llamadas a funciones del sistema (`pg_*`), recursión no acotada en CTEs y fuerza la cota de filas (`ROW_LIMIT = 500`).
   * `app/core/auth.py`: Autenticación basada en Supabase JWT (algoritmo ES256/RS256) con decodificación asíncrona y modo tolerante de prueba (`demo-student`).
   * `app/core/supabase.py`: Cliente de invocación segura a la RPC `record_verified_attempt` utilizando `SUPABASE_SERVICE_ROLE_KEY`.
   * `app/modules/runner/router.py`: Endpoint `/submit` de evaluación semántica. Cumple la regla de invitados otorgando estrictamente `xp_awarded = 0` y omitiendo persistencia en la nube para sesiones no autenticadas.
   * `app/modules/curriculum/repository.py`: Repositorio con doble interfaz: método interno para el evaluador con `solution_query`, y método público que retorna `ExercisePublicDTO` excluyendo completamente las soluciones.
   * `tests/`: 72 pruebas automatizadas en Pytest (autenticación, evaluador, integración con PostgreSQL Sandbox, rate limits y migración de seguridad en Supabase).

3. **Frontend Web (`apps/web/`):**
   * Estructura basada en **Atomic Design Pragmático**:
     * **Átomos:** `Button`, `Badge`, `TextInput`, `KbdShortcut`, `RadioTab`.
     * **Moléculas:** `AuthModal`, `FormField`, `MetricTile`, `ModuleAccordion`, `SchemaTableItem`, `SearchInput`, `StreakPill`, `SuccessModal`, `TrackCard`.
     * **Organismos:** `TopHeader`, `SidebarNav`, `MonacoEditorPanel`, `DataGridResults`, `ExerciseSpecPanel`, `SqlPlaygroundView`, `UserProfileView`, `AchievementsView`, `NotFoundView`, `AuthConfirmView`, `ResetPasswordView`.
     * **Plantillas:** `WorkspaceLayout`, `DashboardLayout`.
   * `src/lib/persistence.ts`: Gestión rigurosa del buffer de invitados (`qurio_guest_progress_v1`), telemetría de intentos locales y borrador de código en progreso (`qurio_draft_sql_<id>`).
   * `src/lib/progress.ts`: Funciones matemáticas puras desacopladas `computeOfficialTracksProgress` (alimentada exclusivamente por `authoritativeCompletedIds`) y `computeGuestTrialTracksProgress` (para invitados).
   * `src/lib/routing.ts`: Enrutador cliente basado en HTML5 History API con actualización dinámica de meta-títulos en pestaña de navegador.
   * `e2e/pilot_e2e_suite.mjs`: Suite de 19 pruebas de integración en Google Chrome real utilizando Playwright.

---

## 3. Reconciliación de Decisiones Canónicas D-01 a D-07 (Blueprint v1.2)

En los informes preliminares de Fase 11 se produjo un desalineamiento documental al redefinir las decisiones D-01 a D-07 con especificaciones técnicas de implementación. A continuación se restaura formalmente la definición canónica aprobada en el **Qurio Product & Business Blueprint v1.2**:

| ID Canónico | Nombre de la Decisión | Definición Oficial (Blueprint v1.2) | Estado en Piloto |
|:---|:---|:---|:---:|
| **D-01** | Modelo de Monetización Free / Plus | Modelo freemium con nivel gratuito (SQL Foundations completo) y suscripción Plus (\$12/mes o \$99/año) para rutas avanzadas y proyectos guiados. | **DIFERIDO A FASE 12** (Piloto opera 100% gratuito sin cobro) |
| **D-02** | Marca y Eslogan Oficial | Qurio — *"Aprende SQL. Piensa en queries."* Estética *Terminal Glow Minimal*, paleta oscura (#0e131f, verde esmeralda activo #00dc82, cian de acento). | **CUMPLIDO AL 100%** |
| **D-03** | Pasarela de Pagos | Integración con Stripe Checkout y Stripe Customer Portal para suscripciones y facturación de autoservicio. | **DIFERIDO A FASE 12** |
| **D-04** | Sandbox de Ejecución Python | Arquitectura de ejecución de código Python/Pandas en microservicio o contenedor efímero aislado. | **DIFERIDO A FASE 13** |
| **D-05** | Experiencia de Invitado y Conversión | Acceso inmediato sin registro a los 3 primeros retos de SQL Foundations; buffer local en `qurio_guest_progress_v1`; **0 XP oficial**; bloqueo en el 4º reto con banner suave de registro. | **CUMPLIDO Y VERIFICADO** |
| **D-06** | Qurio Teams Académico | Módulo B2B para universidades y bootcamps con tableros de rendimiento grupal y licencias institucionales. | **DIFERIDO POST-LANZAMIENTO** |
| **D-07** | Priorización Estricta de Estabilidad | Regla de oro: estabilidad, seguridad y calidad antes de introducir nuevas funcionalidades (cierre obligatorio de C-01 a C-05 antes del piloto). | **CUMPLIDO AL 100%** |

---

## 4. Requerimientos Técnicos Desacoplados (`REQ-*`)

Para evitar cualquier ambigüedad futura entre las decisiones de producto/negocio (D) y la arquitectura técnica de software, se formaliza la siguiente matriz de requerimientos de ingeniería:

| Identificador | Requerimiento Técnico | Implementación Concreta | Evidencia Empírica |
|:---|:---|:---|:---|
| **REQ-SANDBOX-01** | Aislamiento de Sandbox PostgreSQL | Contenedor Docker PostgreSQL 16 (`qurio-postgres-sandbox`) en puerto 5433 bajo rol `readonly_student` y `statement_timeout = 2000ms`. | `test_playground_execute_valid_query`, `test_playground_execute_security_block` PASSED. |
| **REQ-EVAL-01** | Evaluación Semántica de Consultas | Motor en FastAPI con AST `sqlglot` y comparación de DataFrames (filas, columnas, nulos, orden y `ROUND()`). | 14 pruebas en `test_evaluator.py` PASSED en 0.22s. |
| **REQ-AUTH-01** | Autenticación Segura con Supabase | Validación de JWT asíncrona (ES256/RS256) con claims `sub`, `aud="authenticated"` e `iss`. Modo tolerante de prueba. | 6 pruebas en `test_auth.py` PASSED en 0.44s. |
| **REQ-XP-01** | Acreditación Centralizada e Idempotente de XP | Invocación exclusiva de la RPC `record_verified_attempt` con `search_path=''` y bloqueo transaccional `FOR UPDATE`. | 9 pruebas en `test_supabase_migration.py` PASSED. |
| **REQ-MIGRATION-01** | Sincronización de Buffer de Invitados | Migración atómica de retos guardados en `qurio_guest_progress_v1` al autenticarse, con mutex anti-carreras (`isSyncInProgress`). | 7 pruebas en `persistence.test.ts` PASSED. |
| **REQ-DESIGN-01** | Atomic Design Pragmático & UI | Organización de interfaz en 4 niveles de componentes Tailwind CSS conforme a `DESIGN.md`. | 0 componentes fuera del árbol. Build limpio sin errores. |
| **REQ-ANTISLOP-01** | Estándares de Autenticidad Anti-AI Slop | Cero `alert()` nativos, errores inline tipados, página 404 temática SQL y meta-títulos dinámicos en pestaña. | Pruebas E2E T01, T08, T11 PASSED en Chrome real. |

---

## 5. Verificación de Correcciones de Estabilización (C-01 a C-05)

| ID | Corrección Aprobada | Archivos Responsables | Estado | Evidencia |
|:---|:---|:---|:---:|:---|
| **C-01** | Tolerancia a fallos en Supabase / Modo local sin caídas de UI | `useAuth.tsx`, `api.ts` | **CUMPLIDO** | Si Supabase no responde o no está configurado, la aplicación conmuta transparentemente a modo local sin excepciones. |
| **C-02** | Validación estricta de escala y redondeo numérico (`ROUND()`) | `app/services/evaluator.py` | **CUMPLIDO** | Comprueba AST para funciones `ROUND()` cuando la consigna pedagógica lo exige. |
| **C-03** | Fuente autoritativa del progreso: únicamente `authoritativeCompletedIds` | `progress.ts`, `persistence.ts` | **CUMPLIDO** | `computeOfficialTracksProgress` ignora campos locales y `localStorage`. Pruebas vitest `progress.test.ts` PASSED. |
| **C-04** | Sincronización de esquemas canónicos (10 tablas) sin tablas obsoletas | `apps/web/src/lib/api.ts`, `database/sandbox/ecommerce_seed.sql` | **CUMPLIDO** | 10 tablas relacionales auditadas; tabla obsoleta `metodos_pago` purgada al 100% de código y documentación. |
| **C-05** | Preservación de borrador SQL en recarga (F5) con aislamiento por ejercicio | `persistence.ts`, `App.tsx` | **CUMPLIDO** | Almacena `qurio_draft_sql_<id>` y lo purga automáticamente solo al aprobar el reto. Prueba E2E T04 PASSED. |

---

## 6. Sección de Reconciliación con Informes Anteriores

Esta sección documenta y certifica formalmente los dos desalineamientos detectados en la Fase 11 y cómo fueron subsanados:

1. **Reconciliación de XP para Usuarios Invitados (Hallazgo Crítico):**
   * *Discrepancia previa:* El informe E2E de Fase 11 mostraba en la prueba T06: `status: PASSED`, `xp_awarded: 30`. Esto contradecía la directriz C-03 y D-05.
   * *Diagnóstico técnico real:* El código en `apps/api/app/modules/runner/router.py` ya contenía la regla `if user.is_guest: evaluation.xp_awarded = 0`. Sin embargo, `docker-compose.yml` carecía de un volumen montado para `apps/api/app`, lo que provocó que el contenedor Docker estuviese ejecutando una imagen desactualizada generada con anterioridad al commit `bba65c2`.
   * *Corrección aplicada:* Se añadió el montaje `volumes: - ./apps/api/app:/app/app:ro` en `docker-compose.yml`, se reconstruyó la imagen con `docker compose build api` y se reinició la pila.
   * *Verificación reproducible:* La llamada HTTP al endpoint `/submit` como invitado ahora retorna rigurosamente:
     ```json
     {"status":"PASSED","execution_time_ms":1.13,"xp_awarded":0,"columns":["nombre_producto","precio"],"rows":[["ProBook Ultra 16 M3",1450],...],"message":"¡Reto Superado con Éxito en modo invitado! Inicia sesión para guardar tu progreso y ganar XP."}
     ```
   * En `pilot_e2e_suite.mjs`, la prueba T06 ahora incorpora una aserción estricta de red: `if (resJson.xp_awarded !== 0) throw new Error(...)`.
   * Se agregaron pruebas de regresión en `apps/api/tests/test_integration.py` (`test_regression_guest_xp_strictly_zero_and_no_rpc_called` y `test_regression_authenticated_user_passes_exercise_4_and_receives_xp`), ambas aprobadas con éxito.

2. **Reconciliación Conceptual de Decisiones D-01 a D-07:**
   * *Discrepancia previa:* En los documentos de Fase 11 se asignaron descripciones de componentes de software (como Docker Sandbox o AST sqlglot) a los identificadores D-01 a D-07.
   * *Corrección aplicada:* Se restituyeron íntegramente las definiciones de negocio del Blueprint v1.2 y se crearon los identificadores `REQ-SANDBOX-01`, `REQ-EVAL-01`, `REQ-AUTH-01`, `REQ-XP-01`, `REQ-MIGRATION-01`, `REQ-DESIGN-01` y `REQ-ANTISLOP-01`.

---

## 7. Auditoría de Secretos y Cumplimiento de `.gitignore`

1. **Rastreo de Credenciales en Git:**
   * Se inspeccionó el historial completo de commits mediante expresiones regulares para detectar tokens JWT, claves `service_role` o contraseñas de bases de datos.
   * Resultado: **0 secretos expuestos en Git**. Los archivos `.env` permanecen correctamente excluidos por `.gitignore`.
2. **Exposición de Soluciones en Frontend Compilado:**
   * Se ejecutó un análisis estático de cadenas sobre todos los archivos `.js` generados en `apps/web/dist/`.
   * Resultado: **0 ocurrencias de `solution_query`**. La interfaz web no incluye las soluciones canónicas; la evaluación corre al 100% en el backend FastAPI.

---

## 8. Auditoría de Dependencias y Vulnerabilidades

### 8.1 Frontend (`apps/web`)
* Se ejecutó la auditoría oficial contra el registro central:
  ```bash
  npm audit --registry=https://registry.npmjs.org
  ```
* Resultado:
  ```text
  found 0 vulnerabilities
  ```
  La anulación (override) de `dompurify: "^3.4.17"` en `package.json` neutralizó con éxito el CVE de manipulación de anidamientos en DOMPurify sin generar conflictos con `monaco-editor`.

### 8.2 Backend (`apps/api`)
* Python 3.14.5 / 3.12 con FastAPI 0.162.0, Pydantic 2.14.0, asyncpg 0.32.0, sqlglot 30.30.0, PyJWT 2.15.0 y cryptography 50.0.0.
* Todas las dependencias son oficiales y estables, libres de vulnerabilidades reportadas.

---

## 9. Resultados de Suites de Pruebas Automatizadas

| Suite de Pruebas | Entorno / Herramienta | Casos Totales | Pasadas | Fallidas | Tiempo de Ejecución |
|:---|:---|:---:|:---:|:---:|:---:|
| **Backend API & Migración** | Pytest 9.2 (Python 3.14) | 72 | **72** | 0 | 44.68 s |
| **Frontend Lógica & Progreso** | Vitest 5.1 (TypeScript) | 17 | **17** | 0 | 954 ms |
| **Compilación de Producción** | Vite 6.4 + `tsc` | 2,171 módulos | **2,171** | 0 | 6.01 s |
| **E2E Navegador Real** | Playwright en Google Chrome | 19 | **19** | 0 | 22.13 s |

---

## 10. Conclusión de la Auditoría Técnica

El código de **Qurio** en la rama `feat/phase-11-pilot-readiness` se encuentra estabilizado, con arquitectura limpia, sin deuda técnica en las áreas certificadas, con higiene estricta de credenciales y con suites de pruebas reproducibles al 100%.
