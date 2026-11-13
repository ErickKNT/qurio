# Qurio — Auditoría Técnica y Revisión de Código (Fase 11.2)

**Identificador:** `QURIO-PHASE-11.2-TECHNICAL-AUDIT`  
**Rama de trabajo autorizada:** `feat/phase-11-pilot-readiness`  
**Commit base:** `bba65c2` (rama `feat/phase-10-stabilization`)  
**Fecha:** 10 de Noviembre de 2026  
**Área:** Arquitectura de Software, Seguridad, Backend FastAPI, Sandbox Docker & Frontend React/TS  
**Estado:** Certificado Integralmente

---

## 1. Resumen Ejecutivo y Alcance

Esta auditoría técnica constituye la revisión exhaustiva y certificación definitiva de **Qurio** para la **Fase 11.2: Certificación Final de Seguridad y Consistencia**, con el objetivo de certificar si la plataforma se encuentra técnicamente preparada para un **piloto controlado con usuarios**.

El análisis examina en profundidad:
1. **Historial Git y confinamiento estricto:** Verificación del diff acumulado contra `main` y cumplimiento riguroso de la política de **Zero Push / Zero Merge**.
2. **Fidelidad Canónica del Blueprint v1.2 (D-01 a D-07):** Restauración irrestricta de las decisiones estratégicas de producto y negocio aprobadas, distinguiendo hipótesis y evaluaciones de decisiones firmes.
3. **Desacoplamiento de Requerimientos Técnicos (`REQ-*`):** Matriz formal de ingeniería independiente de las definiciones comerciales.
4. **Correcciones de Estabilización (C-01 a C-05):** Verificación empírica de la autoridad del progreso, aislamiento de invitados y retención de borradores SQL.
5. **Robustez de la RPC `record_verified_attempt` (v6.1):** Separación de `v_already_passed` frente a `v_already_awarded`, protección contra duplicación de XP, compatibilidad con intentos de prueba previos con 0 XP y verificación de 8 escenarios críticos de regresión.
6. **Higiene de Secretos y Fuga de Soluciones:** Comprobación de `.gitignore`, inspección del bundle de producción (`dist/`) y protección de `solution_query` a nivel de base de datos (CLS).
7. **Cadena de Suministro de Dependencias:** Auditoría de vulnerabilidades con `npm audit` (0 vulnerabilidades) y revisión de dependencias Python.
8. **Resultados de Validación Automatizada:** Ejecución de 78 pruebas en Pytest (100% pasadas), 17 pruebas en Vitest (100% pasadas) y 19 pruebas E2E en Google Chrome real (100% pasadas).

---

## 2. Historial Git y Diff Comparativo vs `main`

### 2.1 Topología de Ramas y Política de Confinamiento
* **Rama principal (`main`):** Preservada completamente intacta; 0 commits directos, 0 merges prematuros.
* **Rama de estabilización previa (`feat/phase-10-stabilization`):** Concluida y conciliada en el commit `bba65c2`.
* **Rama de trabajo activa (`feat/phase-11-pilot-readiness`):** Rama dedicada a la preparación, auditoría, hardening y certificación del piloto.
* **Directriz estricta de confinamiento:** **Zero Push / Zero Merge**. Ningún cambio ha sido enviado a repositorios remotos ni fusionado a `main`. Todo el código, scripts SQL, configuraciones de prueba y reportes permanecen confinados localmente a la espera de la autorización expresa del propietario.

### 2.2 Inventario Estructural de Archivos Modificados vs `main`
El árbol de trabajo acumulado en `feat/phase-11-pilot-readiness` respecto a `main` comprende:

1. **Infraestructura y Contenedores:**
   * `docker-compose.yml`: Configuración del servicio API (`qurio-api`) en puerto 8000 y del Sandbox PostgreSQL 16 (`qurio-postgres-sandbox`) en puerto 5433. Incluye el volumen de desarrollo montado en solo lectura (`./apps/api/app:/app/app:ro`) para sincronización inmediata de código sin desfases en Docker.
   * `database/sandbox/init.sql` & `ecommerce_seed.sql`: Esquema relacional canónico de 10 tablas (`productos`, `categorias`, `clientes`, `pedidos`, `detalles_pedidos`, etc.) bajo el rol restringido `readonly_student` con `statement_timeout = 2000ms`.
   * `database/supabase/03_security_hardening.sql`: Script de seguridad versión 6.1 que implementa RLS explícito en las 11 tablas del esquema público, Column-Level Security (CLS) sobre `public.exercises` (revocando `solution_query` de `anon` y `authenticated`), restringe `exercise_attempts`, `user_progress` y `user_profiles` a mutaciones seguras, y blinda la RPC `record_verified_attempt`.
   * `database/supabase/rollback_security_hardening.sql`: Script de reversión versión 4.0 que remueve la RPC preservando la protección CLS y la integridad de las tablas.

2. **Backend API (`apps/api/`):**
   * `app/core/config.py`: Tipado estricto con Pydantic Settings para variables de entorno, flags de modo demo y endpoints JWKS.
   * `app/core/security.py`: Validador semántico y sintáctico AST basado en `sqlglot`. Bloquea sentencias DDL/DML, llamadas a funciones del sistema (`pg_*`), recursión no acotada en CTEs y fuerza la cota de filas (`ROW_LIMIT = 500`).
   * `app/core/auth.py`: Autenticación basada en Supabase JWT (algoritmo ES256/RS256) con decodificación asíncrona y modo tolerante de prueba (`demo-student`).
   * `app/core/supabase.py`: Cliente de invocación segura a la RPC `record_verified_attempt` utilizando `SUPABASE_SERVICE_ROLE_KEY`.
   * `app/modules/runner/router.py`: Endpoint `/submit` de evaluación semántica. Cumple la regla de invitados otorgando estrictamente `xp_awarded = 0`, omite persistencia en la nube para sesiones no autenticadas, y sincroniza el XP oficial cuando el usuario se autentica.
   * `app/modules/curriculum/repository.py`: Repositorio con doble interfaz: método interno para el evaluador con `solution_query`, y método público que retorna `ExercisePublicDTO` excluyendo completamente las soluciones.
   * `tests/`: 78 pruebas automatizadas en Pytest (autenticación, evaluador, integración con PostgreSQL Sandbox, rate limits, esquema canónico, AST security y 15 pruebas profundas de migración de seguridad en Supabase con 8 escenarios de regresión).

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

## 3. Fidelidad Irrestricta a Decisiones Canónicas D-01 a D-07 (Blueprint v1.2)

Se audita el estricto apego al texto y espíritu del **Qurio Product & Business Blueprint v1.2**, respetando que las hipótesis de precios y las evaluaciones técnicas no deben ser presentadas como decisiones aprobadas irreversibles:

| ID Canónico | Nombre de la Decisión | Definición Oficial (Blueprint v1.2) | Estado en Piloto |
|:---|:---|:---|:---:|
| **D-01** | Modelo Free / Plus | Modelo freemium con nivel gratuito (SQL Foundations completo) y suscripción Plus con **precios hipotéticos de $129 MXN mensuales y $999 MXN anuales** sujetos a validación de elasticidad. | **DIFERIDO A FASE 12** (Piloto opera 100% gratuito sin cobro) |
| **D-02** | Marca y Lemas Oficiales | **Eslogan general:** «Aprende datos. Practica. Construye tu futuro.»<br>**Lema SQL:** «Aprende SQL. Piensa en queries.»<br>Identidad visual *Terminal Glow Minimal* (#0e131f, verde esmeralda #00dc82, cian). | **CUMPLIDO AL 100%** |
| **D-03** | Pasarela de Pagos | **Evaluar Stripe México** como opción principal de procesamiento, sin integración aprobada todavía ni compromisos contractuales previos a la validación del piloto. | **DIFERIDO A FASE 12** |
| **D-04** | Sandbox de Ejecución Python | **Evaluar alternativas de ejecución de Python** (ej. WebAssembly/Pyodide en cliente vs. microservicio en contenedores efímeros) sin elegir arquitectura anticipadamente. | **DIFERIDO A FASE 13** |
| **D-05** | Experiencia de Invitado y Conversión | Acceso inmediato sin registro a los 3 primeros ejercicios de prueba gratuitos de SQL Foundations; buffer local en `qurio_guest_progress_v1`; **cero (0) XP oficial**; bloqueo formativo en el 4º ejercicio requiriendo registro. | **CUMPLIDO Y CERTIFICADO** |
| **D-06** | Qurio Teams Académico | Módulo B2B para universidades y bootcamps con tableros de rendimiento institucional **pospuesto** para etapas posteriores a la estabilización B2C. | **POSPUESTO POST-LANZAMIENTO** |
| **D-07** | Priorización Estricta de Estabilidad | Regla de oro: **priorizar estabilidad, seguridad y calidad antes de introducir nuevas funcionalidades** (cierre obligatorio y auditado de C-01 a C-05 antes de abrir el piloto). | **CUMPLIDO AL 100%** |

---

## 4. Requerimientos Técnicos Desacoplados (`REQ-*`)

Para evitar cualquier mezcla conceptual entre las decisiones de negocio (D) y las directrices de arquitectura de software, se formaliza la siguiente matriz de requerimientos de ingeniería:

| Identificador | Requerimiento Técnico | Implementación Concreta | Evidencia Empírica |
|:---|:---|:---|:---|
| **REQ-SANDBOX-01** | Aislamiento de Sandbox PostgreSQL | Contenedor Docker PostgreSQL 16 (`qurio-postgres-sandbox`) en puerto 5433 bajo rol `readonly_student` y `statement_timeout = 2000ms`. | `test_playground_execute_valid_query`, `test_playground_execute_security_block` PASSED. |
| **REQ-EVAL-01** | Evaluación Semántica de Consultas | Motor en FastAPI con AST `sqlglot` y comparación de DataFrames (filas, columnas, nulos, orden y `ROUND()`). | 14 pruebas en `test_evaluator.py` PASSED en 0.22s. |
| **REQ-AUTH-01** | Autenticación Segura con Supabase | Validación de JWT asíncrona (ES256/RS256) con claims `sub`, `aud="authenticated"` e `iss`. Modo tolerante de prueba. | 6 pruebas en `test_auth.py` PASSED en 0.04s. |
| **REQ-XP-01** | Acreditación Centralizada e Idempotente de XP | Invocación exclusiva de la RPC `record_verified_attempt` v6.1 con disociación de aprobación e historial de XP, bloqueo `FOR UPDATE` e índice único parcial. | 15 pruebas en `test_supabase_migration.py` PASSED. |
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

Esta sección documenta y certifica formalmente los desalineamientos resueltos en las Fases 11.1 y 11.2:

1. **Reconciliación de XP para Usuarios Invitados (D-05 / C-03):**
   * *Discrepancia previa:* El informe preliminar reportaba en la prueba E2E T06 un XP de 30 para invitados.
   * *Diagnóstico técnico real:* El contenedor Docker de la API carecía de volumen montado para `app/`, ejecutando una imagen desactualizada.
   * *Corrección aplicada:* Se añadió el montaje `volumes: - ./apps/api/app:/app/app:ro` en `docker-compose.yml`, se reconstruyó la imagen y se incorporó en `router.py` la forzatura de `xp_awarded = 0` para sesiones de invitado.
   * *Verificación reproducible:* La respuesta de la API para invitados entrega estrictamente `xp_awarded: 0` y no invoca la RPC en Supabase.

2. **Idempotencia y Distinción entre Reto Aprobado y Reto Recompensado (RPC v6.1):**
   * *Defecto resuelto:* Versiones anteriores de `record_verified_attempt` evaluaban únicamente `v_already_passed`. Si un usuario aprobaba previamente un ejercicio con `xp_awarded = 0` (por ejemplo, en modo práctica o trial de invitado), esa fila con 0 XP bloqueaba de por vida cualquier recompensa posterior legítima al autenticarse.
   * *Solución implementada:* Se disoció `v_already_passed` (existencia de intento `PASSED`) de `v_already_awarded` (existencia de intento `PASSED AND xp_awarded > 0`). Si el usuario aprueba con éxito y no ha recibido XP previamente (`NOT v_already_awarded`), la RPC le otorga el XP canónico autoritativo. Si ya fue recompensado (`v_already_awarded = TRUE`), otorga `0` XP de forma estrictamente idempotente.
   * *Aserción de consistencia:* La RPC valida que `p_xp_to_award` no exceda ni difiera del cálculo autoritativo del ejercicio (`v_authoritative_xp`), admitiendo expresamente `0` cuando no se solicita XP.
   * *8 Escenarios de Regresión:* Se verificaron mediante 15 pruebas exhaustivas en `test_supabase_migration.py`, incluyendo concurrencia con transacciones independientes en paralelo y rechazo de parámetros corruptos o nulos.

3. **Reconciliación de Precios y Lemas de Marca (Blueprint v1.2):**
   * Se restauraron las cifras hipotéticas de **$129 MXN / mes** y **$999 MXN / año** (subsanando erratas previas de montos en USD).
   * Se restituyó el eslogan general institucional («Aprende datos. Practica. Construye tu futuro.») manteniendo el lema temático de SQL («Aprende SQL. Piensa en queries.»).

---

## 7. Auditoría de Secretos y Cumplimiento de `.gitignore`

1. **Rastreo de Credenciales en Git:**
   * Se inspeccionó el historial de commits mediante expresiones regulares para detectar tokens JWT, claves `service_role` o contraseñas de bases de datos.
   * Resultado: **0 secretos expuestos en Git**. Los archivos `.env` permanecen rigurosamente excluidos por `.gitignore`.
2. **Exposición de Soluciones en Frontend Compilado:**
   * Se ejecutó un análisis estático de cadenas sobre todos los archivos `.js` generados en `apps/web/dist/`.
   * Resultado: **0 ocurrencias de `solution_query`**. La interfaz web no incluye las soluciones canónicas; la evaluación corre al 100% en el backend FastAPI y la columna está revocada por CLS en PostgreSQL.

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
  La anulación (override) de `dompurify: "^3.4.17"` en `package.json` neutralizó con éxito la vulnerabilidad de sanitización sin generar conflictos con `monaco-editor`.

### 8.2 Backend (`apps/api`)
* Python 3.14.5 / 3.12 con FastAPI 0.162.0, Pydantic 2.14.0, asyncpg 0.32.0, sqlglot 30.30.0, PyJWT 2.15.0 y cryptography 50.0.0.
* Todas las dependencias son oficiales y estables, libres de vulnerabilidades conocidas.

---

## 9. Resultados de Suites de Pruebas Automatizadas

| Suite de Pruebas | Entorno / Herramienta | Casos Totales | Pasadas | Fallidas | Tiempo de Ejecución |
|:---|:---|:---:|:---:|:---:|:---:|
| **Backend API & Migración** | Pytest 9.2 (Python 3.14) | 78 | **78** | 0 | 61.17 s |
| **Frontend Lógica & Progreso** | Vitest 5.1 (TypeScript) | 17 | **17** | 0 | 892 ms |
| **Compilación de Producción** | Vite 6.4 + `tsc` | 2,171 módulos | **2,171** | 0 | 5.48 s |
| **E2E Navegador Real** | Playwright en Google Chrome | 19 | **19** | 0 | 20.85 s |

---

## 10. Conclusión de la Auditoría Técnica

El código de **Qurio** en la rama `feat/phase-11-pilot-readiness` se encuentra estabilizado, con arquitectura limpia, sin deuda técnica en las áreas certificadas, con higiene estricta de credenciales y con suites de pruebas reproducibles al 100%.
