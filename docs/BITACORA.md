# Bitácora de Desarrollo — Qurio

Este documento registra cronológicamente las fases, decisiones arquitectónicas, artefactos entregados y el estado operativo del proyecto **Qurio**. **Debe actualizarse obligatoriamente al concluir cada hito o cambio de fase.**

---

## 1. Estado Actual del Proyecto

* **Fase Actual:** **Fase 3: Frontend Base & Atomic Design Pragmático (`feat/web-atomic-design`) — Concluida**  
* **Próxima Fase:** **Fase 4: Flujo End-to-End del Ejercicio (`feat/exercise-ide-flow`)**  
* **Rama Git Activa:** `feat/web-atomic-design` (en proceso de merge a `main` y push a GitHub)  
* **Infraestructura Activa:**
  * Contenedor Docker `qurio-postgres-sandbox` corriendo en `localhost:5433` (saludable y verificado).
  * API FastAPI con pool asíncrono `asyncpg` y evaluador semántico (26/26 pruebas superadas).
  * Frontend React 18 + Vite + TypeScript + Tailwind CSS con Atomic Design Pragmático (Build de producción validado al 100%).
  * Proyecto Supabase en la nube con esquemas DDL `01_schema.sql` y catálogo semilla `02_seed_curriculum.sql` desplegados.

---

## 2. Tablero de Control de Fases

| Fase | Nombre | Estado | Rama Git | Hito Entregado |
| :---: | :--- | :---: | :---: | :--- |
| **0** | **Definición y Especificación** | ✅ Concluida | `main` | Declaración de intención, PRD, SAD, Sistema de Diseño y Reglas. |
| **1** | **Cimientos de Datos & Docker** | ✅ Concluida | `feat/database-and-docker-infra` | Sandbox PostgreSQL aislado, dataset de 10 tablas, esquemas Supabase y docker-compose. |
| **2** | **Motor de Ejecución y Evaluación** | ✅ Concluida | `feat/fastapi-runner-evaluator` | API FastAPI, pool seguro con asyncpg, evaluador semántico y 26 tests automatizados. |
| **3** | **Frontend Base & Atomic Design** | ✅ Concluida | `feat/web-atomic-design` | React + Vite + Tailwind, árbol de componentes (átomos/moléculas/organismos/plantillas), auth y build validado. |
| **4** | **Flujo Principal End-to-End** | ⏳ Próxima | `feat/exercise-ide-flow` | Monaco Editor, Data Grid de resultados, resolución y verificación completa de un reto. |
| **5** | **Catálogo, Playground & Gamificación** | ⏹️ Pendiente | `feat/curriculum-and-gamification` | Dashboard, rutas/syllabus, consola libre de Playground, niveles, XP y rachas. |
| **6** | **Autenticidad, Calidad & Despliegue** | ⏹️ Pendiente | `feat/authenticity-and-polish` | 404 temática SQL, favicon SVG, adaptabilidad responsive móvil y checklist de lanzamiento. |

---

## 3. Registro Cronológico de Entradas

### [2026-11-07] — Entrada 01: Inicio, Inspección y Setup de Skills
* **Objetivo:** Explorar la propuesta inicial y dotar al entorno de las habilidades necesarias para desarrollo riguroso.
* **Actividades:**
  * Lectura e inspección del documento fundacional [`docs/SQL_Academy_Propuesta_Arquitectura_MVP.md`](file:///c:/Desarrollo/Qurio/docs/SQL_Academy_Propuesta_Arquitectura_MVP.md).
  * Instalación de 33 skills en `.agents/skills/` provenientes de Dietrich Gebert (Ponytail), Addy Osmani (Agent Skills), Vercel Labs (Find Skills) y Graphify Labs.
  * Versionado del gestor de habilidades en `skills-lock.json`.

---

### [2026-11-07] — Entrada 02: Revisión del Sistema de Diseño Visual
* **Objetivo:** Analizar los mockups de interfaz generados en Google Stitch.
* **Actividades:**
  * Inspección de las 10 subcarpetas en `docs/stitch_qurio_interactive_sql_platform/`.
  * Adopción formal del sistema de diseño [`Terminal Glow Minimal`](file:///c:/Desarrollo/Qurio/docs/stitch_qurio_interactive_sql_platform/stitch_qurio_interactive_sql_platform/terminal_glow_minimal/DESIGN.md): paleta `#0B1020`, tipografía `Inter` + `JetBrains Mono`, bordes luminescentes sutiles y ergonomía de estación de trabajo.

---

### [2026-11-07] — Entrada 03: Entrevista de Requerimientos y Declaración de Intención
* **Objetivo:** Extraer la intención real del producto antes de escribir código (vía `interview-me`).
* **Decisiones Acordadas:**
  * **Usuario:** Público autodidacta en la web (estudiantes, analistas y desarrolladores junior).
  * **Alcance del MVP:** Rutas guiadas + evaluación semántica + Playground analítico. Laboratorios DDL complejos con contenedores efímeros quedan explícitamente fuera del MVP para evitar sobrecoste y riesgo operativo.
  * **Acceso:** Registro obligatorio liviano desde el inicio para vincular progreso y seguridad al `user_id`.
  * **Arquitectura Híbrida:** Supabase para Auth y datos de aplicación + Docker aislado para el runner de PostgreSQL.
* **Entregable:** [`docs/intent/qurio-mvp.md`](file:///c:/Desarrollo/Qurio/docs/intent/qurio-mvp.md).

---

### [2026-11-07] — Entrada 04: Especificación Técnica (PRD y SAD)
* **Objetivo:** Formalizar los contratos funcionales y arquitectónicos antes de implementar (vía `spec-driven-development`).
* **Decisiones Acordadas:**
  * Distribución de los 50 retos en pirámide: **22** en *SQL Foundations* (44%), **18** en *Relational SQL* (36%) y **10** en *Advanced Queries* (20%).
  * Diagramas de secuencia y flujo para el motor de evaluación semántica.
* **Entregables:**
  * [`docs/PRD.md`](file:///c:/Desarrollo/Qurio/docs/PRD.md): Requerimientos funcionales, no funcionales e historias de usuario en Gherkin.
  * [`docs/SAD.md`](file:///c:/Desarrollo/Qurio/docs/SAD.md): Arquitectura de software, modelo de datos ER, seguridad del runner y estructura monorepo.

---

### [2026-11-07] — Entrada 05: Directrices de Autenticidad y Atomic Design Pragmático
* **Objetivo:** Blindar el código para que no parezca una plantilla genérica generada por IA.
* **Decisiones Acordadas:**
  * **Anti-AI Slop:** Manejo riguroso de errores inline en formularios (sin `alert()`), favicon SVG propio, 404 temática SQL, títulos dinámicos y cero banners de cookies o páginas de gracias artificiales.
  * **Atomic Design Pragmático:** Obligatoriedad estricta de organizar la UI en `atoms/`, `molecules/`, `organisms/` y `templates/` (prohibido crear componentes visuales huérfanos). Rechazo de átomos envoltorios triviales innecesarios (anti-dogma).
* **Entregable:** [`AGENTS.md`](file:///c:/Desarrollo/Qurio/AGENTS.md) actualizado con estas reglas como contrato del repositorio.

---

### [2026-11-07] — Entrada 06: Conexión Inicial con GitHub
* **Objetivo:** Configurar el control de versiones y el repositorio remoto.
* **Actividades:**
  * Creación de `.gitignore` integral para Node, Python, Docker y variables de entorno.
  * Configuración de usuario Git: `ErickKNT` / `erickipn14@gmail.com`.
  * Vinculación remota con [`https://github.com/ErickKNT/qurio.git`](https://github.com/ErickKNT/qurio.git).
  * Commit inicial y push de la rama `main`.

---

### [2026-11-07] — Entrada 07: Fase 1 — Cimientos de Datos & Docker Sandbox
* **Rama:** `feat/database-and-docker-infra` → Fusionada en `main`.
* **Entregables de Base de Datos:**
  * [`database/sandbox/init.sql`](file:///c:/Desarrollo/Qurio/database/sandbox/init.sql): Rol `readonly_student`, `statement_timeout = 2000ms`, `work_mem = 16MB`, permisos exclusivos de lectura.
  * [`database/sandbox/ecommerce_seed.sql`](file:///c:/Desarrollo/Qurio/database/sandbox/ecommerce_seed.sql): 10 tablas relacionales del dataset `Ecommerce_Production_DB` con 15 clientes, pedidos, facturas, productos, inventario y almacenes.
  * [`database/supabase/01_schema.sql`](file:///c:/Desarrollo/Qurio/database/supabase/01_schema.sql): DDL completo con políticas RLS para Supabase.
  * [`database/supabase/02_seed_curriculum.sql`](file:///c:/Desarrollo/Qurio/database/supabase/02_seed_curriculum.sql): Semillas de rutas, módulos, pistas y primeros retos.
  * [`docker-compose.yml`](file:///c:/Desarrollo/Qurio/docker-compose.yml): Orquestación del servicio `postgres-sandbox` en el puerto `5433`.
* **Verificación Práctica:**
  * Contenedor levantado y saludable.
  * Pruebas de consulta exitosas con el rol restringido.
  * Prueba de bloqueo destructivo confirmada: `cannot execute DROP TABLE in a read-only transaction`.
  * Verificación visual confirmada por el usuario conectándose exitosamente con **DataGrip**.
  * Merge a `main` y push a GitHub.

---

### [2026-11-07] — Entrada 08: Fase 2 — Motor de Ejecución y Evaluación en FastAPI
* **Rama:** `feat/fastapi-runner-evaluator`
* **Entregables de Backend:**
  * [`apps/api/app/core/config.py`](file:///c:/Desarrollo/Qurio/apps/api/app/core/config.py): Gestión de variables de entorno y configuración para el Sandbox y Supabase vía `pydantic-settings`.
  * [`apps/api/app/modules/runner/security.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/runner/security.py): Filtro AST/Regex de seguridad estricta para bloquear inyecciones, sentencias múltiples, DDL (`DROP`, `ALTER`, `TRUNCATE`), DML destructivo (`INSERT`, `UPDATE`, `DELETE`) y funciones peligrosas (`pg_sleep`). Limitador automático de filas a 1,000 registros.
  * [`apps/api/app/modules/runner/service.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/runner/service.py): Manejador de pool asíncrono con `asyncpg`, timeouts estrictos por sentencia (`statement_timeout = 2000ms`), transacciones `readonly=True` y serialización de tipos PostgreSQL (Decimal, DateTime, UUID).
  * [`apps/api/app/modules/runner/evaluator.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/runner/evaluator.py): Evaluador semántico completo que compara cardinalidad, nombres/cantidad de columnas, tolerancia a flotantes y nulos, multiconjuntos (frecuencias con `Counter` cuando el orden no importa) y secuencial estricto (cuando `check_order=True`). Cálculo dinámico de XP con penalizaciones progresivas por pistas.
  * [`apps/api/app/modules/curriculum/repository.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/curriculum/repository.py): Repositorio resiliente que consulta Supabase REST y cuenta con respaldo offline de datos semilla.
  * [`apps/api/app/modules/runner/router.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/runner/router.py): Endpoints REST para salud (`/health`), ejecución libre en playground (`/playground/execute`), listado/detalle de ejercicios (`/exercises`) y envío/evaluación semántica (`/exercises/{id}/submit`).
  * [`apps/api/app/main.py`](file:///c:/Desarrollo/Qurio/apps/api/app/main.py): Aplicación principal FastAPI con ciclo de vida asíncrono (`lifespan`), middleware CORS y documentación interactiva Swagger/Redoc.
  * [`apps/api/Dockerfile`](file:///c:/Desarrollo/Qurio/apps/api/Dockerfile) & [`docker-compose.yml`](file:///c:/Desarrollo/Qurio/docker-compose.yml): Contenerización y orquestación unificada en Docker del sandbox y de la API.
* **Pruebas y Verificación:**
  * 26 pruebas automáticas implementadas con `pytest` y `pytest-asyncio`:
    * 10 pruebas de seguridad y límite de filas (`test_security.py`).
    * 8 pruebas unitarias del algoritmo de evaluación semántica (`test_evaluator.py`).
    * 8 pruebas de integración de endpoints en vivo contra el Sandbox PostgreSQL local (`test_integration.py`).
  * Resultado: **26/26 pruebas aprobadas en 0.17 segundos**.

---

### [2026-11-08] — Entrada 09: Fase 3 — Frontend Base & Atomic Design Pragmático
* **Rama:** `feat/web-atomic-design`
* **Entregables de Frontend:**
  * **Setup e Infraestructura Web:**
    * Inicialización de `apps/web` con Vite + React 18 + TypeScript estricto.
    * Configuración de Tailwind CSS 3.4 con los tokens de *Terminal Glow Minimal* (`#0B1020`, `#111827`, `#172033`, `#1E293B`, `#6366F1`, `#38BDF8`, `#22C55E`, `#F59E0B`).
    * Tipografía oficial dual: `Plus Jakarta Sans` / `Inter` para narrativa y UI, y `JetBrains Mono` para código, metadatos, latencias y atajos de teclado.
    * Isotipo SVG oficial de Qurio integrado en `favicon.svg` (cilindro relacional en capas con núcleo verde esmeralda activo).
  * **Estructura Estricta bajo Atomic Design Pragmático:**
    * **Átomos (`src/components/atoms/`):**
      * `Button`: 6 variantes (`primary`, `secondary`, `emerald`, `ghost`, `outline`, `danger`), soporte de estados de carga, iconos y atajo de teclado integrado (`kbdShortcut`).
      * `Badge`: Variantes cromáticas (`cyan`, `emerald`, `amber`, `error`, `mono`, `default`) con opacidad al 10% y borde contrastado.
      * `TextInput`: Entrada con foco luminiscente y variantes de iconos laterales.
      * `KbdShortcut`: Visualizador de combinación de teclas en `JetBrains Mono`.
      * `RadioTab`: Selector de pestaña/segmento interactivo con punto activo.
    * **Moléculas (`src/components/molecules/`):**
      * `SearchInput`: Campo de búsqueda con atajo global `⌘K` y botón de limpieza rápida.
      * `StreakPill`: Cápsula de racha con llama animada y conteo en `JetBrains Mono`.
      * `FormField`: Formulario con validación rigurosa inline (`#ffb4ab`), cumpliendo con la regla Anti-AI Slop (cero `alert()`).
      * `MetricTile`: Métrica de estación de trabajo con tipografía técnica y acentos cromáticos.
    * **Organismos (`src/components/organisms/`):**
      * `SidebarNav`: Navegación lateral persistente y colapsable, con indicador de base de datos en vivo (*PostgreSQL 16 • Online*), avatar de estudiante y barra de progreso de XP.
      * `TopHeader`: Barra superior con desenfoque (`backdrop-blur-xl`), buscador integrado, contador de XP, cápsula de racha y campana de notificaciones.
    * **Plantillas (`src/components/templates/`):**
      * `DashboardLayout`: Estructura general con navegación desacoplada y área de trabajo adaptable.
      * `WorkspaceLayout`: Layout de 2 paneles (30% consigna / 70% editor y data grid) con adaptación responsiva a móvil mediante pestañas apiladas (*Consigna*, *Editor SQL*, *Resultados*).
  * **Autenticación e Integración:**
    * Módulo de cliente `@supabase/supabase-js` con fallback seguro local.
    * Hook reactivo `useAuth` con sincronización de perfiles, niveles y rachas.
* **Verificación y Calidad:**
  * Compilación TypeScript (`tsc`) sin errores con tipado estricto.
  * Build de producción Vite completado exitosamente en 5.67s.

---

## 4. Estado de la Integración con Supabase Cloud

* El usuario confirmó la creación del proyecto en Supabase y la ejecución exitosa de los scripts [`database/supabase/01_schema.sql`](file:///c:/Desarrollo/Qurio/database/supabase/01_schema.sql) y [`database/supabase/02_seed_curriculum.sql`](file:///c:/Desarrollo/Qurio/database/supabase/02_seed_curriculum.sql).
* El backend queda preparado para conectarse a Supabase proveyendo `SUPABASE_URL` y `SUPABASE_ANON_KEY` en `apps/api/.env`. Si no se proporcionan, el fallback local garantiza operatividad y tests al 100%.
