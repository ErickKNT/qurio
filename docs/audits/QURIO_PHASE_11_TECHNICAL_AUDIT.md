# Qurio — Auditoría Técnica y Revisión de Código (Fase 11)

**Identificador:** `QURIO-PHASE-11-TECHNICAL-AUDIT`  
**Rama de trabajo:** `feat/phase-11-pilot-readiness`  
**Commit base:** `bba65c2` (rama `feat/phase-10-stabilization`)  
**Fecha:** 10 de Noviembre de 2026  
**Área:** Arquitectura de Software, Seguridad, Frontend & Backend  
**Estado:** Certificado

---

## 1. Resumen Ejecutivo y Alcance

Esta auditoría técnica evalúa el estado del código de **Qurio** tras la consolidación de la Fase 10 y durante la preparación de la **Fase 11: Preparación y Validación Controlada del Piloto**.

El objetivo es contrastar de manera exhaustiva el código fuente real frente a las decisiones canónicas del Blueprint v1.2 (D-01 a D-07), las correcciones de estabilización C-01 a C-05, el estado del árbol Git, la higiene de secretos y la seguridad de la cadena de suministro de dependencias.

---

## 2. Historial Git y Diff Comparativo vs `main`

### 2.1 Topología de Ramas
* **Rama principal:** `main` (preservada intacta, 0 commits directos, 0 merges forzados).
* **Rama de estabilización previa:** `feat/phase-10-stabilization` (cerrada con commit `bba65c2`).
* **Rama autorizada para Fase 11:** `feat/phase-11-pilot-readiness` (creada a partir de `bba65c2`).
* **Regla de confinamiento:** **Zero Push / Zero Merge** respetado estrictamente. Todo el trabajo permanece confinado localmente.

### 2.2 Inventario de Archivos Modificados vs `main`
El diff acumulado entre `main` y `feat/phase-11-pilot-readiness` abarca los siguientes módulos estructurales:

1. **Backend (`apps/api/`):**
   * `app/core/config.py`: Definición tipada con Pydantic Settings de variables de entorno, soporte de sandbox, límites de tasa y flags de modo demo.
   * `app/core/security.py`: Motor de validación semántica y sintáctica AST de queries SQL con `sqlglot`. Bloqueo de DDL/DML, funciones del sistema (`pg_*`), recursión no acotada y límite forzado (`statement_timeout = 2000ms`, `ROW_LIMIT = 500`).
   * `app/core/auth.py`: Validador de tokens JWT de Supabase Auth con algoritmo ES256/RS256 y modo tolerante de prueba (`demo-student`).
   * `app/routers/exercises.py`: Endpoints de listado de catálogo, detalle y evaluación de soluciones (`/submit`). Enforce estricto de límite de 3 retos para invitados (`REGISTRATION_REQUIRED_AFTER_TRIAL`).
   * `app/routers/playground.py`: Endpoint `/playground/execute` conectado al PostgreSQL Sandbox en Docker bajo el rol `readonly_student`.
   * `tests/`: 70 pruebas unitarias e integración en Pytest que validan autenticación, seguridad AST, cuotas, aserciones semánticas y la migración canónica de Supabase.

2. **Frontend (`apps/web/`):**
   * `src/components/atoms/`: Componentes atómicos de UI (`Button`, `Badge`, `KbdShortcut`, `RadioTab`, `TextInput`).
   * `src/components/molecules/`: Moléculas funcionales (`AuthModal`, `FormField`, `MetricTile`, `ModuleAccordion`, `SchemaTableItem`, `SearchInput`, `StreakPill`, `SuccessModal`, `TrackCard`).
   * `src/components/organisms/`: Organismos autónomos (`TopHeader`, `SidebarNav`, `MonacoEditorPanel`, `DataGridResults`, `ExerciseSpecPanel`, `SqlPlaygroundView`, `UserProfileView`, `AchievementsView`, `NotFoundView`, `AuthConfirmView`, `ResetPasswordView`).
   * `src/components/templates/`: Layouts estructurales (`WorkspaceLayout`, `DashboardLayout`).
   * `src/lib/persistence.ts`: Implementación estricta de C-03 y D-05. Aislamiento total del almacén de invitados (`qurio_guest_progress_v1`), telemetría de intentos locales y borrador SQL persistente (`qurio_draft_sql_<id>`).
   * `src/lib/progress.ts`: Funciones matemáticas puras desacopladas `computeOfficialTracksProgress` (alimentada solo por `authoritativeCompletedIds`) y `computeGuestTrialTracksProgress` (para invitados).
   * `src/lib/routing.ts`: Enrutamiento cliente con HTML5 History API y meta-títulos dinámicos sin dependencias pesadas.
   * `src/App.tsx`: Conexión de estado global, navegación, sincronización de tokens de confirmación y recuperación de contraseña, y preservación de estado de ejecución en el IDE.

---

## 3. Verificación de Decisiones D-01 a D-07 y Correcciones C-01 a C-05

| ID | Requerimiento / Directriz | Archivos Clave | Estado de Implementación | Evidencia Empírica |
|:---|:---|:---|:---:|:---|
| **D-01** | Docker Sandbox PostgreSQL 16 con `readonly_student` y `statement_timeout = 2000ms`. | `docker-compose.yml`, `database/sandbox/init.sql` | **CUMPLIDO** | Las consultas corren exclusivamente en el sandbox sin acceso a producción. |
| **D-02** | Evaluación semántica de conjuntos de datos con AST `sqlglot`. | `apps/api/app/core/security.py`, `evaluator.py` | **CUMPLIDO** | Valida columnas, tipos, filas, cardinalidad y `ROUND()` sin comparar strings SQL. |
| **D-03** | Cuota de prueba para invitados: máximo 3 retos resueltos antes de exigir registro. | `apps/api/app/routers/exercises.py`, `App.tsx` | **CUMPLIDO** | Al enviar el 4º reto sin autenticar, FastAPI responde HTTP 401 `REGISTRATION_REQUIRED_AFTER_TRIAL`. |
| **D-04** | Acreditación oficial de XP mediante RPC segura `record_verified_attempt`. | `database/supabase/01_schema.sql`, `03_security_hardening.sql` | **CUMPLIDO** | Frontend jamás escribe directamente en `user_profiles` ni `exercise_attempts`. |
| **D-05** | Migración atómica de progreso de invitados al registrarse con mutex en storage. | `apps/web/src/lib/persistence.ts` | **CUMPLIDO** | Flag en memoria `isSyncInProgress` y auto-recuperación de locks huérfanos tras 30s. |
| **D-06** | Identidad visual *Terminal Glow Minimal* y Atomic Design Pragmático. | `apps/web/src/components/*` | **CUMPLIDO** | 4 niveles de componentes (Átomos, Moléculas, Organismos, Plantillas), paleta oficial y JetBrains Mono. |
| **D-07** | Filosofía Anti-AI Slop: favicon personalizado, 404 temática, sin alerts nativos, meta-títulos. | `index.html`, `NotFoundView.tsx`, `AuthModal.tsx` | **CUMPLIDO** | 0 llamadas a `alert()` o `confirm()`. Títulos dinámicos en todas las rutas. |
| **C-01** | Tolerancia a fallos en Supabase Cloud / Modo Demo local sin caídas de UI. | `apps/web/src/hooks/useAuth.tsx`, `api.ts` | **CUMPLIDO** | Si Supabase no responde o no está configurado, la app conmuta a modo local sin excepciones. |
| **C-02** | Validación estricta de escala y redondeo numérico en aserciones de moneda. | `apps/api/app/services/evaluator.py` | **CUMPLIDO** | Comprueba AST para funciones `ROUND()` cuando la consigna pedagógica lo exige. |
| **C-03** | Fuente autoritativa del progreso: únicamente `authoritativeCompletedIds` en Supabase. | `apps/web/src/lib/progress.ts`, `persistence.ts` | **CUMPLIDO** | `computeOfficialTracksProgress` ignora `localStorage` y campos locales del catálogo. |
| **C-04** | Sincronización de esquemas canónicos (10 tablas) sin tablas obsoletas. | `apps/web/src/lib/api.ts`, `database/sandbox/ecommerce_seed.sql` | **CUMPLIDO** | 10 tablas canónicas auditadas; tabla obsoleta `metodos_pago` purgada al 100%. |
| **C-05** | Preservación de borrador SQL en recarga (F5) con aislamiento por ejercicio. | `apps/web/src/lib/persistence.ts`, `App.tsx` | **CUMPLIDO** | Almacena `qurio_draft_sql_<id>` y lo purga automáticamente solo al aprobar el reto. |

---

## 4. Auditoría de Secretos y Cumplimiento de `.gitignore`

Se realizó una inspección estricta de variables de entorno y archivos de configuración:

1. **Archivos `.env*`:**
   * `apps/api/.env.example` contiene únicamente valores de ejemplo y documentación clara.
   * `apps/web/.env.example` contiene placeholders documentados.
   * `apps/web/.env` contiene las credenciales de desarrollo (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`), las cuales están ignoradas por `.gitignore` y **no están rastreadas en Git**.
2. **Historial de Commits:**
   * Se comprobó mediante `git log -S` y búsqueda de patrones de claves que ninguna `SUPABASE_SERVICE_ROLE_KEY` ni contraseñas maestras de producción fueron jamás comiteadas al repositorio.
3. **Exposición de Soluciones:**
   * Se inspeccionó el bundle compilado de producción (`apps/web/dist`) con búsqueda de texto (`Select-String`):
     * Ocurrencias de `solution_query` en el bundle de frontend: **0**.
     * El frontend no posee ni embebe las soluciones canónicas; la evaluación corre 100% aislada en el backend FastAPI.

---

## 5. Auditoría de Dependencias y Vulnerabilidades

### 5.1 Frontend (`apps/web`)
* **Incidencia detectada inicialmente:** `npm audit` reportó una vulnerabilidad crítica en `dompurify <=3.4.16` (CVE de Cross-Site Scripting y manipulación de anidamientos) introducida transitivamente por `monaco-editor`.
* **Acción correctiva implementada:**
  * Se configuró en `apps/web/package.json` una directiva explícita de anulación:
    ```json
    "overrides": {
      "dompurify": "^3.4.17"
    }
    ```
  * Se ejecutó `npm install` contra el registro oficial `https://registry.npmjs.org`.
* **Resultado post-remediación:**
  ```text
  audited 175 packages in 3s
  found 0 vulnerabilities
  ```
  La cadena de dependencias de frontend quedó completamente limpia (0 vulnerabilidades).

### 5.2 Backend (`apps/api`)
* **Entorno:** Python 3.14 / 3.12, FastAPI 0.162.0, Starlette 1.10.0, Pydantic 2.14.0, asyncpg 0.32.0, sqlglot 30.30.0, PyJWT 2.15.0, cryptography 50.0.0.
* **Resultado:** Todas las librerías se encuentran en versiones estables y libres de vulnerabilidades conocidas.

---

## 6. Conclusión de la Auditoría Técnica

El código de Qurio se encuentra en un estado de alta calidad técnica, sin deuda oculta en las áreas estabilizadas, con la arquitectura desacoplada y una estricta separación de responsabilidades entre el frontend visual, el motor de ejecución aislado y la base de datos oficial.
