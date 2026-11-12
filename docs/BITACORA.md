# Bitácora de Desarrollo — Qurio

Este documento registra cronológicamente las fases, decisiones arquitectónicas, artefactos entregados y el estado operativo del proyecto **Qurio**. **Debe actualizarse obligatoriamente al concluir cada hito o cambio de fase.**

---

## 1. Estado Actual del Proyecto

* **Fase Actual:** **Fase 11.3: Auditoría Final del Procedimiento de Rollback y Continuidad Operativa (`QURIO-PHASE-11.3-ROLLBACK-AUDIT`) — Concluida**  
* **Próxima Fase:** **Aprobación Formal del Piloto (Gate G-07) y Despliegue Controlado con Usuarios**  
* **Rama Git Activa:** `feat/phase-11-pilot-readiness`  
* **Estado Operativo Real de Infraestructura (Verificación Forense y Ejecutable):**
  * Contenedores Docker (`qurio-api` en 8000, `qurio-postgres-sandbox` en 5433): Operativos y verificados de forma exhaustiva; apagados de forma controlada (`docker compose down`) tras concluir las pruebas.
  * API FastAPI: **100% Verificado** — Suite de **80 pruebas automatizadas pasando limpiamente en 61.50s** en `apps/api/tests/`. Incluye **15 pruebas de infraestructura de seguridad/migración** y **10 escenarios críticos de regresión/contingencia** (idempotencia de RPC v6.1, rollback v4.0 con preservación estricta de CLS/RLS, modo de contingencia en FastAPI sin adjudicación falsa de XP y recuperación íntegra de recompensas tras restablecimiento).
  * Frontend React 18 + Vite: **100% Verificado** — Build de producción `dist/` limpio (**2,171 módulos en 5.38s, 0 errores, 0 ocurrencias de `solution_query`**) y suite de **17 pruebas automatizadas en Vitest** (`npm run test`) pasando en 861ms (`progress.test.ts`, `persistence.test.ts`, `routing.test.ts`).
  * E2E en Navegador Real: **19 de 19 pruebas pasadas al 100% en Google Chrome real** vía Playwright (`pilot_e2e_suite.mjs`), con verificación indeleble de **0 XP oficial para invitados** en T06 y bloqueo en 4º reto en T07.
  * Continuidad Operativa (Alternativa B): Si la RPC no existe o falla, el Sandbox de PostgreSQL continúa evaluando las consultas con éxito, pero la API otorga estrictamente 0 XP oficial y notifica el modo contingencia sin falsificar progreso oficial.
  * Integridad de Supabase Cloud: **Zero Cloud Mutations** cumplido al 100% (0 escrituras en `bfvgqxfzftumwrleacof`). Scripts `03_security_hardening.sql` v6.1 y `rollback_security_hardening.sql` v4.0 reconciliados, probados y listos para aplicación administrativa por el propietario.
  * Veredicto Final: **APROBADO CON RESTRICCIONES**.

---

## 2. Tablero de Control de Fases

| Fase | Nombre | Estado | Rama Git | Hito Entregado |
| :---: | :--- | :---: | :---: | :--- |
| **0** | **Definición y Especificación** | ✅ Concluida | `main` | Declaración de intención, PRD, SAD, Sistema de Diseño y Reglas. |
| **1** | **Cimientos de Datos & Docker** | ✅ Concluida | `feat/database-and-docker-infra` | Sandbox PostgreSQL aislado, dataset de 10 tablas, esquemas Supabase y docker-compose. |
| **2** | **Motor de Ejecución y Evaluación** | ✅ Concluida | `feat/fastapi-runner-evaluator` | API FastAPI, pool seguro con asyncpg, evaluador semántico y pruebas iniciales. |
| **3** | **Frontend Base & Atomic Design** | ✅ Concluida | `feat/web-atomic-design` | React + Vite + Tailwind, árbol de componentes (átomos/moléculas/organismos/plantillas), auth y build validado. |
| **4** | **Flujo Principal End-to-End** | ✅ Concluida | `feat/exercise-ide-flow` | Monaco Editor, DataGrid tabular con tipos de datos, especificación del ejercicio con pistas, cliente API FastAPI y modal de recompensa XP. |
| **5** | **Catálogo, Playground & Gamificación** | ✅ Concluida | `feat/curriculum-and-gamification` | Rutas con syllabus interactivo, SQL Playground libre con explorador de esquemas, Logros con filtros y Mi Perfil con mapa de calor. |
| **6** | **Autenticidad, Calidad & Despliegue** | ✅ Concluida | `feat/authenticity-and-polish` | 404 temática SQL, favicon SVG propio, metadatos OG, adaptabilidad móvil y transparencia de contacto. |
| **+** | **Temas (Claro/Oscuro) & README** | ✅ Concluida | `feat/theme-support-and-readme` | Tokens Tailwind CSS dinámicos, toggle sol/luna, temas Monaco reactivos y README.md exhaustivo. |
| **7** | **Expansión Curricular (3 Rutas)** | ✅ Concluida | `feat/curriculum-expansion-3-tracks` | 18 ejercicios completos, didáctica SQLBolt, checklist de sub-objetivos interactiva. |
| **9** | **Hardening de Seguridad & AST** | ✅ Concluida | `main` (vía `security/phase-9-hardening`) | SQLGlot AST, defensa en profundidad, ES256 JWKS, Rate Limiting, RPC certified progress en Supabase Cloud. |
| **8/9+** | **Expansión Curricular Piramidal (50 Retos)** | ✅ Concluida | `main` (vía `feat/curriculum-expansion-50-exercises`) | Pirámide completa de 50 retos fundamentados en ISO/IEC 9075:2016 y PostgreSQL 16, 12 módulos, 10 tablas de muestra, 100% verificado en sandbox. |
| **10 (Doc)** | **Blueprint v1.2 & Plan de Estabilización v1.2** | ✅ Concluida | `docs/product-business-blueprint-v1` | `QURIO_PRODUCT_BUSINESS_BLUEPRINT.md` v1.2 y `PHASE_10_STABILIZATION_PLAN.md` v1.2 sincronizados. |
| **10 (Base)** | **Auditoría Operativa y Línea Base de Desarrollo** | ✅ Concluida | `docs/operational-baseline-v1` | `QURIO_OPERATIONAL_AUDIT.md` (diagnóstico forense) y `QURIO_OPERATIONAL_BASELINE.md` (prioridades de grupo piloto). |
| **10 (Ejec)** | **Estabilización Técnica Integral (Bloques A, B, C, D)** | ✅ Concluida | `feat/phase-10-stabilization` | Resolución de brechas `C-01` a `C-05`, suites de pruebas 100% exitosas (69 backend / 8 frontend), build limpio y sandbox apagado. |

---

## 3. Registro Cronológico de Entradas

### [2026-11-07] — Entrada 01: Inicio, Inspección y Setup de Skills
* **Objetivo:** Explorar la propuesta inicial y dotar al entorno de las habilidades necesarias para desarrollo riguroso.
* **Actividades:**
  * Lectura e inspección del documento fundacional [`docs/SQL_Academy_Propuesta_Arquitectura_MVP.md`](SQL_Academy_Propuesta_Arquitectura_MVP.md).
  * Instalación de 33 skills en `.agents/skills/` provenientes de Dietrich Gebert (Ponytail), Addy Osmani (Agent Skills), Vercel Labs (Find Skills) y Graphify Labs.
  * Versionado del gestor de habilidades en `skills-lock.json`.

---

### [2026-11-07] — Entrada 02: Revisión del Sistema de Diseño Visual
* **Objetivo:** Analizar los mockups de interfaz generados en Google Stitch.
* **Actividades:**
  * Inspección de las 10 subcarpetas en `docs/stitch_qurio_interactive_sql_platform/`.
  * Adopción formal del sistema de diseño [`Terminal Glow Minimal`](stitch_qurio_interactive_sql_platform/stitch_qurio_interactive_sql_platform/terminal_glow_minimal/DESIGN.md): paleta `#0B1020`, tipografía `Inter` + `JetBrains Mono`, bordes luminescentes sutiles y ergonomía de estación de trabajo.

---

### [2026-11-07] — Entrada 03: Entrevista de Requerimientos y Declaración de Intención
* **Objetivo:** Extraer la intención real del producto antes de escribir código (vía `interview-me`).
* **Decisiones Acordadas:**
  * **Usuario:** Público autodidacta en la web (estudiantes, analistas y desarrolladores junior).
  * **Alcance del MVP:** Rutas guiadas + evaluación semántica + Playground analítico. Laboratorios DDL complejos con contenedores efímeros quedan explícitamente fuera del MVP para evitar sobrecoste y riesgo operativo.
  * **Acceso:** Registro obligatorio liviano desde el inicio para vincular progreso y seguridad al `user_id`.
  * **Arquitectura Híbrida:** Supabase para Auth y datos de aplicación + Docker aislado para el runner de PostgreSQL.
* **Entregable:** [`docs/intent/qurio-mvp.md`](intent/qurio-mvp.md).

---

### [2026-11-07] — Entrada 04: Especificación Técnica (PRD y SAD)
* **Objetivo:** Formalizar los contratos funcionales y arquitectónicos antes de implementar (vía `spec-driven-development`).
* **Decisiones Acordadas:**
  * Distribución de los 50 retos en pirámide: **22** en *SQL Foundations* (44%), **18** en *Relational SQL* (36%) y **10** en *Advanced Queries* (20%).
  * Diagramas de secuencia y flujo para el motor de evaluación semántica.
* **Entregables:**
  * [`docs/PRD.md`](PRD.md): Requerimientos funcionales, no funcionales e historias de usuario en Gherkin.
  * [`docs/SAD.md`](SAD.md): Arquitectura de software, modelo de datos ER, seguridad del runner y estructura monorepo.

---

### [2026-11-07] — Entrada 05: Directrices de Autenticidad y Atomic Design Pragmático
* **Objetivo:** Blindar el código para que no parezca una plantilla genérica generada por IA.
* **Decisiones Acordadas:**
  * **Anti-AI Slop:** Manejo riguroso de errores inline en formularios (sin `alert()`), favicon SVG propio, 404 temática SQL, títulos dinámicos y cero banners de cookies o páginas de gracias artificiales.
  * **Atomic Design Pragmático:** Obligatoriedad estricta de organizar la UI en `atoms/`, `molecules/`, `organisms/` y `templates/` (prohibido crear componentes visuales huérfanos). Rechazo de átomos envoltorios triviales innecesarios (anti-dogma).
* **Entregable:** [`AGENTS.md`](../AGENTS.md) actualizado con estas reglas como contrato del repositorio.

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
  * [`database/sandbox/init.sql`](../database/sandbox/init.sql): Rol `readonly_student`, `statement_timeout = 2000ms`, `work_mem = 16MB`, permisos exclusivos de lectura.
  * [`database/sandbox/ecommerce_seed.sql`](../database/sandbox/ecommerce_seed.sql): 10 tablas relacionales del dataset `Ecommerce_Production_DB` con 15 clientes, pedidos, facturas, productos, inventario y almacenes.
  * [`database/supabase/01_schema.sql`](../database/supabase/01_schema.sql): DDL completo con políticas RLS para Supabase.
  * [`database/supabase/02_seed_curriculum.sql`](../database/supabase/02_seed_curriculum.sql): Semillas de rutas, módulos, pistas y primeros retos.
  * [`docker-compose.yml`](../docker-compose.yml): Orquestación del servicio `postgres-sandbox` en el puerto `5433`.
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
  * [`apps/api/app/core/config.py`](../apps/api/app/core/config.py): Gestión de variables de entorno y configuración para el Sandbox y Supabase vía `pydantic-settings`.
  * [`apps/api/app/modules/runner/security.py`](../apps/api/app/modules/runner/security.py): Filtro AST/Regex de seguridad estricta para bloquear inyecciones, sentencias múltiples, DDL (`DROP`, `ALTER`, `TRUNCATE`), DML destructivo (`INSERT`, `UPDATE`, `DELETE`) y funciones peligrosas (`pg_sleep`). Limitador automático de filas a 1,000 registros.
  * [`apps/api/app/modules/runner/service.py`](../apps/api/app/modules/runner/service.py): Manejador de pool asíncrono con `asyncpg`, timeouts estrictos por sentencia (`statement_timeout = 2000ms`), transacciones `readonly=True` y serialización de tipos PostgreSQL (Decimal, DateTime, UUID).
  * [`apps/api/app/modules/runner/evaluator.py`](../apps/api/app/modules/runner/evaluator.py): Evaluador semántico completo que compara cardinalidad, nombres/cantidad de columnas, tolerancia a flotantes y nulos, multiconjuntos (frecuencias con `Counter` cuando el orden no importa) y secuencial estricto (cuando `check_order=True`). Cálculo dinámico de XP con penalizaciones progresivas por pistas.
  * [`apps/api/app/modules/curriculum/repository.py`](../apps/api/app/modules/curriculum/repository.py): Repositorio resiliente que consulta Supabase REST y cuenta con respaldo offline de datos semilla.
  * [`apps/api/app/modules/runner/router.py`](../apps/api/app/modules/runner/router.py): Endpoints REST para salud (`/health`), ejecución libre en playground (`/playground/execute`), listado/detalle de ejercicios (`/exercises`) y envío/evaluación semántica (`/exercises/{id}/submit`).
  * [`apps/api/app/main.py`](../apps/api/app/main.py): Aplicación principal FastAPI con ciclo de vida asíncrono (`lifespan`), middleware CORS y documentación interactiva Swagger/Redoc.
  * [`apps/api/Dockerfile`](../apps/api/Dockerfile) & [`docker-compose.yml`](../docker-compose.yml): Contenerización y orquestación unificada en Docker del sandbox y de la API.
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

### [2026-11-08] — Entrada 10: Fase 4 — Flujo End-to-End del Ejercicio (IDE, Monaco & Evaluación)
* **Rama:** `feat/exercise-ide-flow`
* **Entregables de Flujo de Interacción:**
  * **Integración de Monaco Editor:**
    * Componente organismo [`MonacoEditorPanel`](../apps/web/src/components/organisms/MonacoEditorPanel/MonacoEditorPanel.tsx) con tema oscuro oficial `qurio-dark` (fondo `#0B1020`, cursor cyan `#38BDF8`, keywords cyan, strings esmeralda, números ámbar).
    * Tipografía `JetBrains Mono` con numeración limpia y padding técnico.
    * Atajo de teclado nativo `⌘ + Enter` / `Ctrl + Enter` mapeado directamente a la función de ejecución/envío.
    * Barra de herramientas con formateador automático de palabras reservadas SQL y restablecimiento de código.
  * **Visualizador Tabular de Resultados de Alta Fidelidad:**
    * Componente organismo [`DataGridResults`](../apps/web/src/components/organisms/DataGridResults/DataGridResults.tsx).
    * Cabeceras con nombre de columna y tipo de dato inferido (`VARCHAR`, `INT`, `DECIMAL`) en `JetBrains Mono`.
    * Celdas de datos con gutters numerados, formateo condicional de valores numéricos, booleanos y chips tenues cursivos para `NULL`.
    * Visualizador descriptivo de discrepancias semánticas (`DiffResult`) cuando la consulta del estudiante difiere de la solución esperada.
    * Mensajes de error del motor de base de datos o bloqueos de seguridad del sandbox presentados en caja de terminal inline (cero alertas del navegador).
  * **Panel de Especificación y Pistas Progresivas:**
    * Componente organismo [`ExerciseSpecPanel`](../apps/web/src/components/organisms/ExerciseSpecPanel/ExerciseSpecPanel.tsx).
    * Enunciado narrativo y objetivos técnicos del reto.
    * Acordeón interactivo con el esquema relacional (`clientes`, `pedidos`, `productos`, `categorias`).
    * Sistema de pistas progresivas con cálculo y visualización transparente de penalización de XP (-15% por pista).
  * **Modal de Recompensa y Avance:**
    * Componente molécula [`SuccessModal`](../apps/web/src/components/molecules/SuccessModal/SuccessModal.tsx).
    * Notificación instantánea de reto superado, medalla esmeralda, XP ganado, tiempo de ejecución en sandbox y botón de avance inmediato al siguiente reto del currículum.
  * **Cliente de Integración API:**
    * Módulo [`apps/web/src/lib/api.ts`](../apps/web/src/lib/api.ts) conectando el frontend con los endpoints de FastAPI (`POST /api/v1/exercises/{id}/submit`, `POST /api/v1/playground/execute`, `GET /api/v1/exercises`, `GET /api/v1/health`).
    * Fallback resiliente offline con los ejercicios semilla.
* **Pruebas y Verificación del Ciclo Completo:**
  * Build de producción Vite completado exitosamente en **6.91s** con cero errores de TypeScript.
  * Verificación en vivo: API FastAPI respondiendo `healthy` en el puerto 8000 con el PostgreSQL Sandbox Docker en puerto 5433, y frontend Vite activo en el puerto 5173.

---

### [2026-11-09] — Entrada 11: Refinamiento Visual y Desaturación de Interfaz (Anti-Clutter)
* **Rama:** `feat/ui-refinement-and-desaturation`
* **Motivación y Diagnóstico:**
  * Retroalimentación del usuario sobre fatiga visual y sensación de interfaz sobrecargada/saturada.
  * Diagnóstico técnico identificó: 5 colores neón compitiendo a la vez (Cyan, Esmeralda, Ámbar, Índigo, Salmón), más de 10 cápsulas/píldoras redondeadas simultáneas, "síndrome de caja dentro de caja" en el inspector de esquemas, y métricas triplicadas (racha y XP en Sidebar, Header y Bento Grid a la vez).
* **Soluciones Implementadas:**
  * **Regla 85-10-5 de Color:** 85% fondo pizarra neutral oscuro profundo (`surface/30` - `surface/70`), 10% identidad de marca (índigo tenue/cyan técnico), 5% colores semánticos (verde/rojo reservados exclusivamente para aprobados/errores de ejecución SQL).
  * **`TopHeader`:** Altura reducida de `h-16` a `h-14` (3.5rem); eliminación de las cápsulas redundantes de racha y XP (dejando solo contexto de ruta, buscador sutil `⌘K`, campana y avatar limpio).
  * **`SidebarNav`:** Reemplazo del botón gigante de 3 capas de base de datos por un indicador discreto con punto esmeralda tenue (`pg:16 sandbox`); remoción del badge estridente `Live` en SQL Playground; simplificación de la tarjeta de usuario en el pie.
  * **`MetricTile`:** Eliminación del arcoíris fluorescente; adopción de tarjetas oscuras uniformes en tono pizarra neutral con números de ancho fijo legibles y etiquetas atenuadas.
  * **`ExerciseSpecPanel`:** Eliminación de los badges individuales con bordes pesados por columna; sustitución por una lista tabular limpia tipo DataGrip/TablePlus con tipos de datos atenuados en monoespaciado.
  * **`DataGridResults` y `App.tsx`:** Suavizado del resplandor de fondo (`blur-2xl bg-primary/[0.04]`), eliminación de redundancias y persistencia de visualización tabular del resultado del usuario ante cualquier consulta ejecutada.
* **Verificación de Calidad:**
  * Compilación TypeScript estricta y empaquetado de producción con Vite (`built in 5.73s`, 0 errores).

---

### [2026-11-09] — Entrada 12: Fase 5 — Catálogo, Playground & Gamificación
* **Rama:** `feat/curriculum-and-gamification`
* **Entregables de la Fase 5:**
  * **Rutas Formativas & Syllabus Interactivo (`/tracks`):**
    * Componente molécula [`TrackCard`](../apps/web/src/components/molecules/TrackCard/TrackCard.tsx): tarjetas de rutas (*SQL Foundations*, *Relational SQL*, *Advanced Queries*) con porcentaje de completitud, horas estimadas y badges.
    * Componente molécula [`ModuleAccordion`](../apps/web/src/components/molecules/ModuleAccordion/ModuleAccordion.tsx): módulos colapsables con listado de retos, estados de resolución, dificultad y botón de acción directa.
    * Componente organismo [`TracksView`](../apps/web/src/components/organisms/TracksView/TracksView.tsx): catálogo completo que permite explorar y saltar directamente al IDE de cualquier reto del currículum.
  * **SQL Playground Libre (`/playground`):**
    * Componente molécula [`SchemaTableItem`](../apps/web/src/components/molecules/SchemaTableItem/SchemaTableItem.tsx): explorador de esquemas con 10 tablas relacionales (`clientes`, `pedidos`, `productos`, etc.), recuento de filas, claves primarias/foráneas y botón de consulta rápida (`SELECT * LIMIT 10`).
    * Componente organismo [`SqlPlaygroundView`](../apps/web/src/components/organisms/SqlPlaygroundView/SqlPlaygroundView.tsx): estación de experimentación con plantillas SQL, Monaco Editor con atajo `⌘ + Enter`, ejecución contra el sandbox Docker y visualizador tabular [`DataGridResults`](../apps/web/src/components/organisms/DataGridResults/DataGridResults.tsx).
  * **Logros & Rangos de Ingeniería (`/achievements`):**
    * Componente molécula [`AchievementCard`](../apps/web/src/components/molecules/AchievementCard/AchievementCard.tsx): medallas técnicas con iconos temáticos, cálculo de XP, barras de progreso y estado desbloqueado/bloqueado.
    * Componente organismo [`AchievementsView`](../apps/web/src/components/organisms/AchievementsView/AchievementsView.tsx): filtrado por pestañas (*Todos*, *Progreso*, *Habilidad*, *Constancia*) y resumen de insignias.
  * **Perfil del Estudiante & Auditoría (`/profile`):**
    * Componente organismo [`UserProfileView`](../apps/web/src/components/organisms/UserProfileView/UserProfileView.tsx): tarjeta técnica de usuario, barra de nivel (progreso hacia Nivel 3), mapa de calor de práctica de 30 días y log de auditoría con historial de consultas locales persistentes.
  * **Integración y Títulos Dinámicos:**
    * Cableado completo en [`App.tsx`](../apps/web/src/App.tsx) manteniendo estricto cumplimiento de **Atomic Design Pragmático** y **Anti-AI Slop** (títulos dinámicos de pestaña, manejo de errores en terminal y cero dependencias huérfanas).
* **Verificación de Calidad:**
  * Compilación TypeScript estricta y empaquetado de producción con Vite (`built in 5.38s`, 0 errores).

---

### [2026-11-09] — Entrada 13: Refinamiento de UX y Ergonomía del SQL Playground
* **Rama:** `fix/sql-playground-ux-polish`
* **Diagnóstico de los Problemas Visuales:**
  * **Botón Duplicado:** Existía un botón morado `[Ejecutar Consulta ⌘↵]` en la cabecera superior y otro idéntico `[Ejecutar Query ⌘↵]` en la barra de herramientas del editor Monaco a escasos píxeles de distancia.
  * **Mensaje Inapropiado de Reto Superado:** En una consulta ad-hoc de exploración, [`DataGridResults`](../apps/web/src/components/organisms/DataGridResults/DataGridResults.tsx) mostraba `SOLUCIÓN VÁLIDA` y un banner verde festivo de `¡Reto Superado con Éxito!`, lo cual no tiene sentido en un Playground libre donde no hay un reto que evaluar.
  * **Tablas Cortadas & Scroll Anidado:** La lista de tablas en la barra lateral izquierda tenía un `max-h-64` y el bloque `Plantillas Rápidas` le cortaba el paso visual a la mitad de `pedidos` y `detalle_pedidos`.
  * **Doble Scroll de Ventana:** La vista estaba restringida por `max-w-7xl` con `pt-20` y `pb-12`, generando barras de scroll tanto a nivel del navegador como dentro de los paneles.
* **Soluciones Implementadas:**
  * **Eliminación del Botón Duplicado:** Se retiró el botón superior redundante, dejando el botón contextual del editor en `MonacoEditorPanel`.
  * **Modo Playground en DataGrid (`isPlayground={true}`):** Se suprimió el banner de reto superado para consultas libres, dejando una presentación limpia tipo *DataGrip* / *Supabase Studio* con indicador sobrio `EJECUTADO` y métrica de latencia real.
  * **Pestañas en el Panel Lateral (`[Tablas (10)]` y `[Plantillas (4)]`):** Se separaron las tablas del esquema y las plantillas de consulta en pestañas con botón segmentado, permitiendo que la lista de tablas aproveche el 100% de la altura sin cortes.
  * **Ajuste de Workbench de Pantalla Completa:** `DashboardLayout` ahora detecta `currentPath === 'playground'` para suprimir el límite artificial `max-w-7xl` y ajustar la altura exacta a `100vh` sin barras de scroll en la ventana.
* **Verificación de Calidad:**
  * Compilación TypeScript estricta y empaquetado de producción con Vite (`built in 5.48s`, 0 errores).

---

### [2026-11-09] — Entrada 14: Fase 6 — Autenticidad, Calidad & Estándares Anti-AI Slop
* **Rama:** `feat/authenticity-and-polish`
* **Cumplimiento Integral de Directrices de Ingeniería ([`AGENTS.md`](../AGENTS.md)):**
  * **Página 404 Personalizada con Metáfora SQL:**
    * Componente organismo [`NotFoundView`](../apps/web/src/components/organisms/NotFoundView/NotFoundView.tsx) estilizado bajo *Terminal Glow Minimal*.
    * Simula una consola interactiva de PostgreSQL con código de error estándar `SQLSTATE 42P01: relation does not exist in schema public` y sugerencia de ayuda (`HINT`).
    * Proporciona botones de acción inmediata para volver al Dashboard, explorar Rutas o abrir el SQL Playground.
  * **Favicon e Identidad de Marca Oficial SVG:**
    * Creado el isotipo matemático puro [`apps/web/public/favicon.svg`](../apps/web/public/favicon.svg) (cilindro relacional en capas con núcleo verde esmeralda activo) y vinculado en `apps/web/index.html`.
  * **Open Graph (OG Tags) & Previsualización Social:**
    * Creado el activo vectorial oficial [`apps/web/public/og-preview.svg`](../apps/web/public/og-preview.svg) en estética oscura `#0B1020` con el lema institucional: *«Aprende SQL. Piensa en queries.»*.
    * Etiquetas `og:title`, `og:description`, `og:image`, `theme-color: #0B1020` y tarjetas Twitter configuradas en `index.html`.
  * **Contacto Transparente y Términos Claros (Cero Relleno):**
    * Integrado el modal molécula [`PrivacyModal`](../apps/web/src/components/molecules/PrivacyModal/PrivacyModal.tsx) explicando de forma transparente y humana la ausencia de cookies de rastreo y el aislamiento en sandbox.
    * Pie de página técnico en [`DashboardLayout`](../apps/web/src/components/templates/DashboardLayout/DashboardLayout.tsx) con enlace directo al repositorio oficial `https://github.com/ErickKNT/qurio` (sin direcciones postales ficticias).
  * **Adaptabilidad Responsiva Móvil y Accesibilidad (a11y):**
    * Verificado el sistema de pestañas apiladas (*Consigna*, *Editor SQL*, *Resultados*) en [`WorkspaceLayout`](../apps/web/src/components/templates/WorkspaceLayout/WorkspaceLayout.tsx) para pantallas móviles y tablets.
    * Textos alternativos (`alt`) descriptivos en el 100% de avatares e imágenes y atajos de teclado documentados (`⌘ + Enter`).
* **Verificación de Calidad:**
  * Compilación TypeScript estricta y empaquetado de producción con Vite (`built in 6.23s`, 0 errores).

---

### [2026-11-09] — Entrada 15: Soporte para Tema Claro/Oscuro y README Oficial de GitHub
* **Rama:** `feat/theme-support-and-readme`
* **Entregables de Temas y Documentación:**
  * **Tokens Dinámicos y Variables CSS para Tailwind:**
    * Re-arquitectura de [`apps/web/src/index.css`](../apps/web/src/index.css) con variables en canales RGB (`--color-canvas`, `--color-surface`, `--color-surface-subtle`, `--color-border-subtle`, `--color-border-focus`, `--color-text-main`, `--color-text-muted`, etc.) para `:root` (tema claro) y `.dark` (tema oscuro).
    * Actualización de [`apps/web/tailwind.config.js`](../apps/web/tailwind.config.js) para utilizar `rgb(var(--color-...) / <alpha-value>)`, permitiendo compatibilidad total con modificadores de opacidad de Tailwind (ej. `bg-surface/70`, `border-border-subtle/50`).
  * **Hook Reactivo y Persistencia (`useTheme`):**
    * Módulo [`apps/web/src/hooks/useTheme.ts`](../apps/web/src/hooks/useTheme.ts) con almacenamiento en `localStorage` (`qurio_theme`), detección de `prefers-color-scheme`, eventos custom `qurio-theme-change` y listeners a cambios del sistema operativo.
  * **Controles Visuales de Alternancia (Toggle Sol / Luna):**
    * Botón integrado en la barra de herramientas superior [`TopHeader`](../apps/web/src/components/organisms/TopHeader/TopHeader.tsx).
    * Botón integrado en la cabecera del espacio de trabajo [`WorkspaceLayout`](../apps/web/src/components/templates/WorkspaceLayout/WorkspaceLayout.tsx) en [`App.tsx`](../apps/web/src/App.tsx).
  * **Temas Reactivos en Monaco Editor:**
    * Actualización de [`MonacoEditorPanel`](../apps/web/src/components/organisms/MonacoEditorPanel/MonacoEditorPanel.tsx) definiendo el tema claro oficial `qurio-light` (fondo `#F8FAFC`, cursor cyan `#0284C7`, palabras reservadas azul/índigo, strings verde oscuro, comentarios grises).
    * Cambio reactivo del editor mediante `monaco.editor.setTheme()` cuando cambia `isDark`.
  * **Script Anti-Parpadeo (Anti-FOUC):**
    * Script embebido en `<head>` de [`apps/web/index.html`](../apps/web/index.html) para inyectar la clase `dark` antes del primer render del DOM.
  * **README.md Oficial y Exhaustivo:**
    * Documentación técnica completa en [`README.md`](../README.md) con badges oficiales, diagramas Mermaid de arquitectura global y flujo de evaluación semántica, resumen del dataset de 10 tablas, guía de instalación paso a paso, suite de pruebas y estándares de ingeniería.
* **Verificación de Calidad:**
  * Compilación TypeScript estricta y empaquetado de producción con Vite (`built in 5.96s`, 0 errores).

---

### [2026-11-09] — Entrada 16: Corrección Integral de Tema (ThemeProvider y Mutación Síncrona DOM)
* **Rama:** `main`
* **Diagnóstico del Fallo de Cambio de Tema:**
  * La implementación previa de `useTheme` utilizaba instancias aisladas de `useState` en cada componente (`TopHeader`, `App`, `MonacoEditorPanel`) coordinadas por eventos custom en `window`.
  * En React 18 con `StrictMode` en desarrollo, el ciclo de montaje/desmontaje generaba desincronización de estados y desenganche de escuchadores.
  * No existía un `ThemeProvider` unificado como único origen de la verdad en el árbol de componentes.
* **Soluciones Implementadas:**
  * **`ThemeProvider` y `ThemeContext` Reactivo:** Creado [`apps/web/src/hooks/useTheme.tsx`](../apps/web/src/hooks/useTheme.tsx) y envuelto en [`apps/web/src/main.tsx`](../apps/web/src/main.tsx), garantizando un único estado global para toda la aplicación.
  * **Mutación Síncrona del DOM:** `toggleTheme` y `setTheme` ejecutan inmediatamente la mutación de `document.documentElement` (`classList.toggle('dark')`, `classList.toggle('light')`, `style.colorScheme`), actualizando tanto el CSS nativo como Tailwind y persistiendo en `localStorage` sin condiciones de carrera.
  * **Tokens CSS con Alta Especificidad:** Añadidas reglas explícitas `html.light, :root` y `html.dark, .dark` en [`apps/web/src/index.css`](../apps/web/src/index.css) con transición suave (`transition: background-color 0.2s ease, color 0.2s ease`).
  * **Atributos de Botón y Clases de Color:** Añadido `type="button"` a los botones de alternancia en `TopHeader` y `WorkspaceLayout`, corrigiendo la clase inexistente `text-amber-accent` a `text-amber-streak`.
* **Verificación de Calidad:**
  * Compilación TypeScript y empaquetado de producción Vite verificado exitosamente (`built in 5.99s`, 0 errores).
  * Servidor Vite dev reiniciado y activo en `http://127.0.0.1:5173`.
  * Commit y sincronización con GitHub completados.

---

### [2026-11-09] — Entrada 17: Enriquecimiento Cromático Equilibrado (Tasteful Color Polish)
* **Rama:** `main`
* **Objetivo:** Responder a la retroalimentación del usuario respecto a dotar de vida cromática y calidez visual a la interfaz, evitando tanto la monotonía grisácea plana como la saturación excesiva de luces de neón previas.
* **Soluciones Implementadas:**
  * **Sistema de Acentos en `MetricTile`:**
    * Añadido soporte tipado de acentos funcionales (`accent="purple" | "indigo" | "amber" | "cyan" | "emerald"`).
    * Cada métrica cuenta con un contenedor cuadrado de icono tintado con borde sutil al 25% y resplandor al hover (`group-hover:shadow-[...]`), haciendo que las estadísticas de nivel, XP, racha, consultas y éxito sean reconocibles de un solo vistazo.
  * **`SidebarNav`:**
    * Isotipo con degradado armónico tricolor (`from-primary/15 via-cyan-accent/10 to-emerald/15`).
    * Elemento activo con píldora izquierda vertical de acento (`bg-primary`), fondo tintado (`bg-primary/10`) y borde luminiscente sutil.
    * Iconos de navegación con colores temáticos según contexto funcional (Playground: cyan, Logros: ámbar, Perfil: púrpura, Rutas/Dashboard: índigo).
    * Barra de XP en pie con gradiente fluido `from-primary via-indigo-500 to-cyan-accent`.
  * **Hero Banner del Dashboard:**
    * Fondo con sutil degradado radial ambiental (`from-surface via-surface to-primary/[0.04]`) y resplandores de desenfoque difuminado (3xl) no invasivos.
    * Cápsula de estado de ruta en esmeralda vivo (`bg-emerald/10 text-emerald-600 dark:text-emerald font-medium`).
  * **`AchievementCard` & `TrackCard`:**
    * Iconos de medallas con fondos temáticos según categoría (*habilidad*, *constancia*, *progreso*).
    * Badges de rutas con variantes cromáticas según dificultad (Foundations: cyan, Relational: índigo, Advanced: ámbar).
  * **`TopHeader` & Playground:**
    * Indicador de sección con punto primario activo.
    * Botón de acceso a Playground con píldora cyan suave (`bg-cyan-accent/10`).
* **Verificación de Calidad:**
  * Compilación TypeScript estricta y empaquetado de producción con Vite (`built in 5.43s`, 0 errores).
  * Sincronización exitosa en GitHub.

---

### [2026-11-09] — Entrada 18: Persistencia Real de Progreso y Autenticación con Supabase Cloud (Fase 7)
* **Rama:** `feat/supabase-auth-and-persistence`
* **Objetivo:** Implementar la capa de autenticación de usuarios (Supabase Auth con tokens JWT) y la persistencia de intentos de resolución, XP acumulado, niveles, rachas y estado de ejercicios completados en Supabase Cloud, garantizando resiliencia y funcionamiento transparente offline / demo local sin bloquear el flujo pedagógico.
* **Entregables Técnicos:**
  * **Motor de Persistencia Híbrida (`apps/web/src/lib/persistence.ts`):**
    * Servicio desacoplado que gestiona la escritura y lectura dual (Supabase Cloud + LocalStorage).
    * `recordAttempt`: Inserta cada ejecución en la tabla `exercise_attempts` (`user_id`, `exercise_id`, `submitted_sql`, `status`, `execution_time_ms`, `hints_used`, `xp_awarded`, `error_message`). Si el reto es aprobado (`PASSED`), actualiza automáticamente `xp` y `level` en `user_profiles` e incrementa la actividad en `user_daily_activity`.
    * `getCompletedExerciseIds`: Consulta los IDs de ejercicios resueltos con éxito por el usuario autenticado (o desde `localStorage` si opera en local/demo).
    * `updateProfile`: Actualiza perfiles tanto en la nube como en almacenamiento local.
  * **Hook de Autenticación Reactivo (`apps/web/src/hooks/useAuth.ts`):**
    * Soporte para `signIn`, `signUp` y `signOut`.
    * En `signUp` y primer inicio de sesión, inserta y mapea automáticamente el perfil del usuario en la tabla `user_profiles` de Supabase a partir de los metadatos de autenticación.
    * Mapeo estricto entre el esquema relacional de Supabase (`xp`, `level`) y los tipos TypeScript del frontend (`total_xp`, `current_level`).
    * Provee indicadores booleanos `isCloudAuth` (sesión activa contra Supabase) e `isDemoMode` (modo demostración local sin credenciales).
  * **Molécula `AuthModal` (`apps/web/src/components/molecules/AuthModal/AuthModal.tsx`):**
    * Pestañas estilizadas bajo *Terminal Glow Minimal* para alternar entre "Iniciar Sesión" y "Crear Cuenta".
    * Formularios integrados con `FormField` con validación inline estricta (Anti-AI Slop: cero alertas nativas `alert()`).
    * Badge de estado de conexión JWT y protección criptográfica en pie del modal.
  * **Integración en Organismos y Plantillas:**
    * `TopHeader`: Botón de avatar de usuario que despliega el modal de autenticación o muestra el estado de sesión.
    * `WorkspaceLayout`: Incorporación del avatar y gatillo de sesión en la barra de herramientas del IDE para que el usuario pueda autenticarse sin salir de su ejercicio.
    * `UserProfileView`: Indicador visual de estado de cuenta (`Supabase Cloud` / `Local / Offline`) y botón de acción para gestionar sesión o sincronizar progreso.
  * **Flujo End-to-End de Evaluación y Persistencia en `App.tsx`:**
    * En `handleExecuteSolution`, cada intento evaluado en el Sandbox Docker se persiste inmediatamente vía `persistence.recordAttempt`.
    * Cuando el estado es `PASSED`, se calcula el nuevo nivel y XP, se actualiza el perfil en memoria y en la base de datos, se marca el ejercicio como completado en el currículum y se actualizan los contadores de progreso en las rutas de aprendizaje (`tracks`).
    * En el montaje inicial, sincroniza los retos completados previamente por el usuario y los refleja en toda la aplicación.
* **Verificación de Calidad y Estándares:**
  * Compilación TypeScript estricta y empaquetado de producción con Vite verificado al 100% (`built in 5.42s`, 0 errores).
  * FastAPI corriendo en puerto 8000 con respuesta HTTP 200 en `/docs`.
  * Vite dev server activo en puerto 5173 con respuesta HTTP 200.
  * Docker sandbox PostgreSQL activo en puerto 5433.
* **Control de Versiones:**
  * Commits atómicos en la rama `feat/supabase-auth-and-persistence`.
  * Fusión (`merge --no-ff`) hacia la rama `main` y sincronización con GitHub (`git push origin main`).

---

### [2026-11-09] — Entrada 19: Pedagogía Interactiva y Enriquecimiento Didáctico al Estilo SQLBolt (Fase 8)
* **Rama:** `feat/interactive-pedagogy-and-sqlbolt-learning`
* **Objetivo:** Incorporar las mejores lecciones de diseño instruccional y pedagógico de la plataforma de referencia **SQLBolt**, elevando la experiencia de resolución de retos en Qurio con micro-teoría contextualizada, previsualización de datos de muestra y checklists de sub-objetivos progresivos.
* **Entregables Técnicos:**
  * **Ampliación de Esquemas y Modelos:**
    * Backend FastAPI: Creados `ExerciseConcept` y `SampleTableData` en [`apps/api/app/modules/curriculum/seed_data.py`](../apps/api/app/modules/curriculum/seed_data.py), enriqueciendo todos los ejercicios con explicaciones conceptuales, bloques de sintaxis formateados, notas de orden de ejecución en PostgreSQL y tablas de datos de muestra.
    * Frontend React: Agregados los tipos correspondientes en [`apps/web/src/types/index.ts`](../apps/web/src/types/index.ts) y catálogo enriquecido en [`apps/web/src/lib/api.ts`](../apps/web/src/lib/api.ts).
  * **Re-arquitectura de `ExerciseSpecPanel` ([`apps/web/src/components/organisms/ExerciseSpecPanel/ExerciseSpecPanel.tsx`](../apps/web/src/components/organisms/ExerciseSpecPanel/ExerciseSpecPanel.tsx)):**
    * **Pestaña `Guía & Reto`:**
      * Tarjeta de **Concepto Clave & Sintaxis**: Micro-aprendizaje directo al grano con caja de código en `JetBrains Mono`, puntos clave y píldora explicativa de orden de ejecución (`FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY`).
      * Consigna de negocio clara con enlace directo a la previsualización de datos.
      * Checklist interactivo de **Sub-Objetivos**: Permite al estudiante verificar el cumplimiento paso a paso de cada requisito de la consulta.
    * **Pestaña `Muestra de Datos` (Sample Data Preview):**
      * Muestra una cuadrícula de datos reales con las primeras 4–5 filas del Sandbox de PostgreSQL para las tablas involucradas en el reto (`productos`, `clientes`, `pedidos`, `categorias`).
      * Selector dinámico multi-tabla para retos con JOINs.
      * Función de copiado rápido de identificadores de columna en un clic para acelerar la escritura en Monaco Editor.
    * **Pestaña `Esquema`:** Inspección completa de nombres de columna, tipos y claves del schema public.
    * **Pestaña `Pistas`:** Revelación progresiva de pistas con penalización controlada de XP.
* **Verificación de Calidad y Estándares:**
  * Suite completa de pruebas de backend con Pytest pasando al 100% (26 tests en 0.13s).
  * Compilación estricta TypeScript y empaquetado de producción con Vite (`built in 5.60s`, 0 errores).
  * Servidores FastAPI (8000), Vite (5173) y Docker PostgreSQL (5433) activos y respondiendo correctamente.
* **Control de Versiones:**
  * Commit en la rama `feat/interactive-pedagogy-and-sqlbolt-learning`.
  * Fusión (`merge --no-ff`) hacia `main` y sincronización con GitHub (`git push origin main`).
  * Fix de UX: Desactivación permanente del modal superpuesto `SuccessModal` al evaluar soluciones; los resultados, XP otorgado y botón de avance al siguiente reto se presentan de forma no invasiva inline en `DataGridResults`, garantizando visibilidad total de la tabla de resultados.

---

### [2026-11-09] — Entrada 20: Autocompletado Inteligente en Monaco Editor y Resolución de Alias SQL
* **Rama:** `feat/monaco-sql-intellisense-and-aliases`
* **Objetivo:** Dotar a Monaco Editor de capacidades de autocompletado profesional tipo IDE (DataGrip / VS Code), sugiriendo palabras clave SQL en mayúsculas mientras el usuario teclea, nombres de tablas relacionales del dataset `Ecommerce_Production_DB`, nombres de columnas tipadas y resolución dinámica de alias de tabla (`c.`, `p.`, `dp.`).
* **Entregables Técnicos:**
  * **Motor de Autocompletado (`apps/web/src/components/organisms/MonacoEditorPanel/sqlCompleter.ts`):**
    * `registerSqlCompletionProvider`: Registra un proveedor en `monaco.languages` con soporte para caracteres disparadores (`.`, espacio, paréntesis).
    * `extractTableAliases`: Analizador léxico ligero que examina las cláusulas `FROM` y `JOIN` del búfer SQL para construir un mapa dinámico de alias (`Map<alias, tableName>`), filtrando palabras reservadas.
    * **Autocompletado con Punto (`alias.` / `tabla.`):** Al escribir `c.` o `clientes.`, detecta el alias, busca la tabla en `ECOMMERCE_TABLES_SCHEMA` y sugiere exclusivamente sus columnas (`cliente_id`, `nombre`, `apellido`, `email`, etc.) con sus tipos PostgreSQL e indicadores `[PK]` y `[FK]`.
    * **Autocompletado General:** Sugiere palabras clave SQL (`SELECT`, `FROM`, `WHERE`, `INNER JOIN`, `GROUP BY`, `COUNT`, `ROW_NUMBER`, etc.), nombres de tablas con número de filas y columnas del esquema con priorización según las tablas mencionadas en la consulta.
  * **Configuración del Editor ([`MonacoEditorPanel.tsx`](../apps/web/src/components/organisms/MonacoEditorPanel/MonacoEditorPanel.tsx)):**
    * Activación de `quickSuggestions` (other: true), `suggestOnTriggerCharacters`, `acceptSuggestionOnEnter: 'smart'` y `tabCompletion: 'on'` para que las sugerencias aparezcan de forma fluida a medida que el usuario escribe sin necesidad de presionar `Ctrl + Espacio`.
* **Verificación de Calidad:**
  * Compilación TypeScript estricta y build de producción con Vite (`built in 5.53s`, 0 errores).
  * Pruebas de funcionamiento del autocompletado verificado en caliente con Vite dev server.
* **Control de Versiones:**
  * Commit en la rama `feat/monaco-sql-intellisense-and-aliases`.
  * Fusión (`merge --no-ff`) hacia `main` y sincronización con GitHub (`git push origin main`).

---

### [2026-11-09] — Entrada 21: Experiencia de Autenticación, Toggle de Contraseña y Vistas del Sistema
* **Rama:** `feat/auth-experience-and-custom-redirects`
* **Objetivo:** Perfeccionar la experiencia de usuario en autenticación incorporando alternancia interactiva para ver y ocultar contraseñas, flujo de recuperación de contraseña ("¿Olvidaste tu contraseña?"), y páginas temáticas del sistema para la confirmación de correo y restablecimiento de contraseña en Supabase Cloud.
* **Entregables Técnicos:**
  * **Toggle de Visibilidad de Contraseña:**
    * Integrado botón de acción con iconos `Eye` / `EyeOff` en [`AuthModal.tsx`](../apps/web/src/components/molecules/AuthModal/AuthModal.tsx) sobre el átomo `FormField`, permitiendo inspeccionar la contraseña tecleada tanto en registro como en login.
  * **Flujo de Recuperación de Contraseña (`forgot` mode):**
    * Enlace *"¿Olvidaste tu contraseña?"* en la pestaña de inicio de sesión de `AuthModal`.
    * Vista dedicada para solicitar restablecimiento con botón *"Enviar Enlace de Recuperación"* conectado a `supabase.auth.resetPasswordForEmail`.
  * **Página Temática del Sistema para Verificación de Correo ([`AuthConfirmView.tsx`](../apps/web/src/components/organisms/AuthConfirmView/AuthConfirmView.tsx)):**
    * Al hacer clic en el enlace del correo de Supabase, el usuario aterriza en una vista nativa de Qurio con diseño *Terminal Glow Minimal*.
    * Isotipo animado con pulso esmeralda, ficha técnica de auditoría (`email_confirmed: TRUE`, sesión JWT firmada, rol `readonly_student`) y acceso directo al Dashboard.
  * **Página Temática para Restablecer Contraseña ([`ResetPasswordView.tsx`](../apps/web/src/components/organisms/ResetPasswordView/ResetPasswordView.tsx)):**
    * Formulario nativo con nueva contraseña y confirmación (ambas con toggle `Eye/EyeOff`), validación de coincidencia y actualización de credenciales vía `supabase.auth.updateUser`.
  * **Enrutamiento y Detección de Redirecciones en [`App.tsx`](../apps/web/src/App.tsx):**
    * Listener reactivo a `hashchange` y parámetros de URL para capturar automáticamente `type=signup`, `auth-confirm`, `type=recovery` y `reset-password`.
    * Títulos dinámicos de navegador actualizados (`Verificación de Cuenta | Qurio`, `Restablecer Contraseña | Qurio`).
* **Verificación de Calidad:**
  * Compilación TypeScript estricta y empaquetado de producción con Vite verificado al 100% (`built in 5.50s`, 0 errores).
  * Servidores FastAPI y Vite activos en sus respectivos puertos.
* **Control de Versiones:**
  * Commit en la rama `feat/auth-experience-and-custom-redirects`.
  * Fusión (`merge --no-ff`) hacia `main` y sincronización con GitHub (`git push origin main`).

### Entrada 22 — Desmontaje Definitivo del Modal Overlay de Victoria y Fusión a Main
* **Fecha:** 2026-11-09
* **Objetivo:** Eliminar por completo el componente `SuccessModal` del flujo de ejecución del ejercicio para asegurar que la tabla de resultados de la consulta permanezca 100% visible sin ningún backdrop opaco. Consolidar todas las mejoras de autenticación en `main`.
* **Cambios Clave:**
  * Removido el estado `successModalOpen` y el nodo `<SuccessModal>` en [`apps/web/src/App.tsx`](../apps/web/src/App.tsx).
  * Todo el feedback de victoria se delega exclusivamente al banner inline de [`DataGridResults.tsx`](../apps/web/src/components/organisms/DataGridResults/DataGridResults.tsx) con badge verde esmeralda, ganancia de XP y botón interactivo "Siguiente Reto", preservando la tabla de datos intacta e interactiva.
  * Verificación de build de producción con Vite (`built in 5.62s`) y 26/26 pruebas de backend pasando en 0.13s.
* **Control de Versiones:**
  * Commits consolidados y fusionados con `git merge --no-ff feat/auth-experience-and-custom-redirects` hacia `main`.
  * Sincronizado en GitHub (`git push origin main`).

### Entrada 23 — Arquitectura Canónica de Autenticación React (AuthProvider), Inicio y Cierre de Sesión Real
* **Fecha:** 2026-11-09
* **Objetivo:** Implementar un flujo 100% funcional y reactivo de inicio (`signIn`) y cierre de sesión (`signOut`) con Supabase Cloud, eliminando perfiles simulados estáticos y permitiendo a los usuarios autenticarse y desautenticarse con reflejo instantáneo en toda la interfaz.
* **Cambios Clave:**
  * **Migración a React Context (`AuthProvider`):** En [`apps/web/src/hooks/useAuth.tsx`](../apps/web/src/hooks/useAuth.tsx) se creó el contexto canónico de autenticación envolviendo la aplicación en [`main.tsx`](../apps/web/src/main.tsx). Todos los componentes comparten una única fuente de verdad reactiva sin escuchas duplicadas.
  * **Flujo de Inicio de Sesión (`signIn`):** Validación real con `supabase.auth.signInWithPassword`, traducción de errores frecuentes (credenciales erróneas, cuenta sin verificar) y sincronización del perfil real desde `public.user_profiles`.
  * **Flujo de Cierre de Sesión (`signOut`):** Llamada real a `supabase.auth.signOut()`, purga de tokens JWT de sesión y limpieza de almacenamiento local (`clearLocalProfile()`), regresando instantáneamente al estado de Invitado.
  * **Estado de Invitado vs Autenticado en UI:**
    * [`TopHeader.tsx`](../apps/web/src/components/organisms/TopHeader/TopHeader.tsx): Muestra botón explícito "Iniciar Sesión" para invitados. Si está autenticado, muestra avatar con halo activo esmeralda y menú desplegable interactivo con nombre, correo, XP y botón rojo "Cerrar Sesión".
    * [`SidebarNav.tsx`](../apps/web/src/components/organisms/SidebarNav/SidebarNav.tsx): Presenta tarjeta de "Modo Invitado" con botón de login, o tarjeta de progreso del usuario autenticado con botón de cerrar sesión.
    * [`App.tsx`](../apps/web/src/App.tsx): Cabecera del IDE adaptada con botón de login y botón de cierre de sesión dinámicos.
    * [`UserProfileView.tsx`](../apps/web/src/components/organisms/UserProfileView/UserProfileView.tsx): Eliminado el valor cableado `Erick KNT` y `480 XP`, conectando los datos reales del perfil autenticado o del estado de invitado.
  * Verificación de build de producción con Vite (`built in 5.50s`) y suite de pruebas pasando al 100%.
* **Control de Versiones:**
  * Commit `5d3b1ff` en la rama `main` y sincronizado en GitHub.

### Entrada 24 — Generación del Grafo de Conocimiento y Visualización Interactiva con Graphify
* **Fecha:** 2026-11-09
* **Objetivo:** Ejecutar la skill `graphify` para mapear de extremo a extremo las dependencias, componentes de Atomic Design, servicios de backend, esquemas y conceptos arquitectónicos de Qurio.
* **Métricas del Grafo:**
  * **Nodos totales:** 430 nodos.
  * **Relaciones/Aristas:** 986 aristas tipadas.
  * **Comunidades identificadas:** 29 comunidades funcionales (Atomic Design UI Library, Interactive Exercise Workspace, Docker Sandbox Infrastructure, Supabase Cloud Authentication, Semantic Evaluation Engine, SQL AST Security Guard, etc.).
  * **Ciclos de importación:** 0 (arquitectura limpia y desacoplada).
  * **Nodos centrales ("God Nodes"):** `cn()`, `react`, `Button`, `Badge()`, `App()`, `evaluate_solution()`, `validate_sql_security()`, `EvaluationStatus`.
* **Artefactos Entregados:**
  * [`graphify-out/graph.html`](../graphify-out/graph.html): Visualizador interactivo autocontenido ejecutable en cualquier navegador sin servidor.
  * [`graphify-out/graph.json`](../graphify-out/graph.json): Grafo estructurado listo para GraphRAG.
  * [`graphify-out/GRAPH_REPORT.md`](../graphify-out/GRAPH_REPORT.md): Informe ejecutivo de comunidades, métricas de cohesión y conexiones del sistema.
* **Control de Versiones:**
  * Commit `576edbb` en la rama `main` y sincronizado en GitHub.

### Entrada 25 — Expansión Integral del Currículum: 3 Rutas y 11 Módulos (18 Ejercicios Semánticos)
* **Fecha:** 2026-11-09
* **Objetivo:** Ampliar el catálogo curricular a 18 ejercicios completos que abarcan los 11 módulos de las 3 rutas formativas, cada uno con didáctica enriquecida estilo SQLBolt (conceptos, sintaxis de referencia, notas de orden de ejecución, checklists de sub-objetivos y tablas de muestra interactivas).
* **Distribución de Retos Implementados:**
  * **Ruta 1: SQL Foundations (8 ejercicios, Módulos 1-4):**
    * M1: Catálogo Básico de Productos (`SELECT nombre_producto, precio`) y Cálculo de Precios con IVA (`ROUND(precio * 1.21, 2) AS precio_con_iva`).
    * M2: Productos Premium (`WHERE precio > 500`) y Rango Medio (`WHERE precio BETWEEN 100 AND 800`).
    * M3: Clientes Españoles Ordenados (`ORDER BY apellido ASC`) y Top 5 Críticos por Stock (`ORDER BY stock ASC LIMIT 5`).
    * M4: Conteo por Categoría (`GROUP BY ... HAVING COUNT(*) > 2`) y Métricas Globales (`COUNT(*)`, `SUM(total)`, `ROUND(AVG(total), 2)`).
  * **Ruta 2: Relational SQL (5 ejercicios, Módulos 5-7):**
    * M5: Pedidos con Identidad del Cliente (`INNER JOIN`) y Gasto Acumulado por Cliente (`INNER JOIN + GROUP BY`).
    * M6: Clientes sin Compras (`LEFT JOIN ... WHERE p.pedido_id IS NULL`) y Productos sin Ventas (`Anti-Join con detalle_pedidos`).
    * M7: Desglose Completo de Líneas de Pedido (Multi-Tabla 5-way JOIN entre pedidos, clientes, detalle_pedidos, productos y categorias).
  * **Ruta 3: Advanced Queries (5 ejercicios, Módulos 8-11):**
    * M8: Productos sobre el Promedio de Precio (Subconsulta escalar `WHERE precio > (SELECT AVG(precio)...)`).
    * M9: Segmentación de Pedidos por Monto (`CASE WHEN total >= 1000 ... WHEN total >= 300 ... ELSE ... END`).
    * M10: Facturación por Categoría mediante CTE (`WITH ventas_por_categoria AS (...) SELECT ...`).
    * M11: Ranking Global de Precios (`ROW_NUMBER() OVER (ORDER BY precio DESC)`) y Ranking Relativo por Categoría (`DENSE_RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC)`).
* **Validaciones Técnicas:**
  * **Sandbox PostgreSQL (Docker):** Las 18 consultas solución probadas directamente contra `ecommerce_sandbox` (`18 PASSED / 0 FAILED`).
  * **API FastAPI:** Suite Pytest (26/26 pruebas pasando en 0.14s). Endpoint `GET /api/v1/exercises` sirviendo los 18 retos en orden.
  * **Frontend React / TypeScript:** Compilación estricta y empaquetado de producción con Vite (`built in 5.72s`, 0 errores).
* **Control de Versiones:**
  * Rama `feat/curriculum-expansion-3-tracks` mergeada a `main` y sincronizada en GitHub.

---

### Entrada 26 — Fase 9: Hardening de Seguridad, Análisis AST con SQLGlot y Autoridad Central de Progreso
* **Fecha:** 2026-11-09
* **Rama:** `security/phase-9-hardening` (aislada de `main`, lista para revisión).
* **Objetivo:** Implementar el plan de remediación integral de seguridad derivado de la auditoría técnica (`SECURITY_AUDIT.md`), cubriendo validación sintáctica mediante AST, soporte controlado de consultas avanzadas (`WITH RECURSIVE`), autenticación asimétrica ES256 (JWKS), Rate Limiting desacoplado y arquitectura de progreso certificado en el backend.
* **Componentes Implementados y Modificados:**
  * **SQL Runner & AST con SQLGlot ([`apps/api/app/modules/runner/security.py`](../apps/api/app/modules/runner/security.py)):**
    * Sustitución de regex por análisis sintáctico formal del AST (`sqlglot.parse` con dialecto `postgres`).
    * Allowlist estricta de raíces de lectura (`exp.Query`, `exp.Subquery`).
    * Denylist profunda en todo el árbol (`walk()`) para neutralizar mutaciones DDL/DML camufladas dentro de CTEs o subconsultas.
    * Bloqueo de funciones peligrosas del sistema (`pg_sleep`, `pg_terminate_backend`, `dblink`, `pg_read_file`, etc.) y tablas internas de credenciales (`pg_shadow`, `pg_authid`).
    * Soporte seguro para `WITH RECURSIVE` delegando la contención de recursiones infinitas al motor PostgreSQL (`statement_timeout = 2000ms`, `lock_timeout = 1000ms`).
    * Cláusula `LIMIT` forzada y manipulada de forma nativa en el AST (`enforce_row_limit`).
  * **Autenticación Asimétrica ES256 ([`apps/api/app/core/auth.py`](../apps/api/app/core/auth.py)):**
    * Verificación contra el endpoint JWKS público de Supabase (`/.well-known/jwks.json`) con rotación automática de claves y caché en memoria.
    * Validación estricta de claims (`aud = authenticated`, `iss`, `sub`, expiración).
    * Modo invitado con fallback desacoplado que no bloquea la práctica local pero impide la persistencia no autorizada.
  * **Rate Limiting y Guardia de Concurrencia ([`apps/api/app/core/rate_limit.py`](../apps/api/app/core/rate_limit.py)):**
    * Límite diferenciado: 20 req/min por IP para invitados, 120 req/min por UID para autenticados.
    * Semáforo de concurrencia (`asyncio.Semaphore(10)`) para blindar el pool `asyncpg` ante avalanchas.
  * **Cabeceras de Seguridad ([`apps/api/app/main.py`](../apps/api/app/main.py)):**
    * Middleware con `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy`.
  * **Infraestructura Sandbox ([`docker-compose.yml`](../docker-compose.yml) y [`database/sandbox/init.sql`](../database/sandbox/init.sql)):**
    * Vinculación de PostgreSQL a `127.0.0.1:5433:5432` impidiendo exposición innecesaria a interfaces de red externas.
    * `lock_timeout = '1000ms'` y `temp_file_limit = '32MB'` sobre el rol `readonly_student`.

---

### Entrada 27 (Reconciliación Cronológica: Cierre de Fase 9) — Hardening de Seguridad y Ajustes Finales (v5.0)
> [!NOTE]
> **Nota de Trazabilidad Histórica:** Esta entrada fue numerada como 27 en el historial de trabajo preliminar, pero cronológicamente antecede a la Entrada 20 (Expansión Curricular) y Entrada 22 (Blueprint v1.2). Se conserva íntegra sin reescribir para preservar la veracidad del historial.
* **Fecha:** 2026-11-09
* **Rama:** `security/phase-9-hardening` (aislada de `main`, protegida sin despliegue automático).
* **Objetivo:** Ejecutar los dos ajustes finales requeridos para cerrar formalmente la Fase 9:
  1. Revocación explícita de `SELECT` por columna en `public.exercise_attempts` para `PUBLIC` y `anon`.
  2. Conservación del índice condicional único parcial `idx_single_awarded_passed_attempt` durante el rollback como salvaguarda estructural independiente.
* **Refactorizaciones Entregadas:**
  * **Script DDL Supabase v5.0 ([`database/supabase/03_security_hardening.sql`](../database/supabase/03_security_hardening.sql)):**
    * Validación anti-NULL explícita en cada parámetro de `record_verified_attempt()`.
    * Eliminación definitiva del mínimo artificial de 10 XP; cálculo autoritativo proporcional (0, 5, 10, 20, 100 XP) y validación de `e.xp_reward`.
    * Sustitución de `search_path = public, pg_temp` por `SET search_path = ''` para neutralizar secuestro de esquemas.
    * Calificación explícita de esquemas en todos los objetos de aplicación (`public.*`, `pg_catalog.*`).
    * Revocación explícita de `SELECT` en las 10 columnas de `public.exercise_attempts` para `PUBLIC` y `anon`.
    * Revocación explícita de `INSERT` y `UPDATE` en las 10 columnas de `exercise_attempts` y sobre `xp/level` en `user_profiles`.
    * Propietario asignado a `postgres`, revocación explícita de `EXECUTE` a `PUBLIC`, `anon`, `authenticated`, y concesión exclusiva a `service_role`.
    * Bloqueo físico `SELECT ... FOR UPDATE` sobre `public.user_profiles` e índice condicional único `idx_single_awarded_passed_attempt`.
    * Preservación de la consistencia auditada de `public.user_progress` en intentos fallidos (`FAILED`, `ERROR`).
    * Consulta diagnóstica de conciliación multi-fuente de XP sin alteración automática de datos.
  * **Script de Reversión Seguro v3.0 ([`database/supabase/rollback_security_hardening.sql`](../database/supabase/rollback_security_hardening.sql)):**
    * Conservación del índice único parcial `idx_single_awarded_passed_attempt` (eliminado el `DROP INDEX`).
    * Mantiene blindados `xp`, `level` e inserciones en `exercise_attempts` para clientes incluso tras revertir la RPC.
    * Procedimiento de contingencia operacional documentado.
  * **Script de Diagnóstico de Privilegios v3.0 ([`database/supabase/diagnose_privileges.sql`](../database/supabase/diagnose_privileges.sql)):**
    * Inspección de ACL mediante `aclexplode` demostrando que `PUBLIC` (grantee 0) no tiene acceso a la RPC.
    * Comprobación de `SELECT` por columna distinguiendo entre permisos de tabla y de columna para `PUBLIC`, `anon` y `authenticated`.
    * Consulta no destructiva de conciliación multi-fuente de XP.
  * **Suite Automatizada de Migración Supabase ([`apps/api/tests/test_supabase_migration.py`](../apps/api/tests/test_supabase_migration.py)):**
    * 9 pruebas integrales en Docker con roles, RLS y esquemas reales:
      1. Matriz de privilegios efectivos CLS a nivel de tabla y columna (`PUBLIC` y `anon` sin `SELECT`).
      2. Rechazo explícito de parámetros nulos.
      3. Rechazo de XP desbordado.
      4. Cálculo autoritativo de XP proporcional en 0, 5, 10, 20 y 100 XP con 0 a 3 pistas.
      5. Concurrencia en conexiones físicas independientes sin race conditions.
      6. Concurrencia en diferentes ejercicios sin lost updates.
      7. Consistencia de `user_progress` en intentos `FAILED` y `ERROR`.
      8. Regla canónica de primer aprobado con 0 XP.
      9. Auditoría de rollback comprobando supervivencia del índice parcial, rechazo de duplicados con XP positivo, aceptación de reintentos con 0 XP y persistencia del blindaje en clientes.
* **Resultados de Validación:**
  * **Suite Completa Pytest:** **64/64 pruebas pasando en 3.79s** (100% éxito).
  * **Currículo Verificado:** Las 18 consultas del currículo oficial evaluadas y aprobadas (`18/18 PASSED`).
  * **Frontend Vite Build:** Empaquetado de producción TypeScript verificado en 5.84s con 0 errores.
* **Control de Versiones y Despliegue en Producción:**
  * Migración `03_security_hardening.sql` autorizada y aplicada exitosamente en Supabase Cloud por el usuario.
  * Verificación en vivo comprobada: llamadas de clientes anónimos bloqueadas con `42501` y backend certificado con `service_role`.
  * Rama `security/phase-9-hardening` fusionada a `main` y sincronizada en GitHub.

---

### [2026-11-09] — Entrada 20: Fase 10 — Expansión Curricular Integral a 50 Retos (Rutas 1, 2 y 3)
* **Rama:** `feat/curriculum-expansion-50-exercises`.
* **Fundamentación Formal & Anti-AI Slop:**
  * Redacción y publicación de la especificación pedagógica integral en [`docs/CURRICULUM_SPEC.md`](CURRICULUM_SPEC.md).
  * Todos los 50 retos sustentados en el estándar **ISO/IEC 9075:2016 (SQL Core)**, la documentación oficial de **PostgreSQL 16** y la **Taxonomía de Bloom**.
  * Cada reto cuenta con `concept` (resumen, sintaxis formal, puntos clave y nota de orden lógico de procesamiento), `objectives` (lista de comprobación interactiva), `hints` (1 a 3 pistas progresivas con penalización porcentual decreciente) y `sample_tables` (10 tablas pedagógicas compartidas).
* **Distribución Piramidal Entregada:**
  1. **Ruta 1 — SQL Foundations (22 Retos — 44%):**
     * Módulo 1: SELECT & Proyecciones de Datos (4 retos: proyecciones atómicas, cálculos con IVA, concatenación `||`, `DISTINCT`).
     * Módulo 2: Filtrado con WHERE y Operadores Lógicos (6 retos: `>`, `BETWEEN`, `LIKE`, `IN`, `OR`, `AND + <>`).
     * Módulo 3: Ordenamiento y Paginación (4 retos: `ORDER BY ASC/DESC`, `LIMIT`, multi-criterio, `OFFSET`).
     * Módulo 4: Agregación y Agrupamiento (8 retos: `COUNT(*)`, métricas ejecutivas, `MIN/MAX`, distribución geográfica, `SUM(stock)`, `HAVING SUM`, `HAVING AVG`, embudo de estados).
  2. **Ruta 2 — Relational SQL & Joins (18 Retos — 36%):**
     * Módulo 5: Uniones Fundamentales (INNER JOIN) (5 retos: pedidos-clientes, gasto acumulado, catálogo con categorías, productos-proveedores, facturación con pagos).
     * Módulo 6: Detección de Ausencias (LEFT JOIN & NULL) (5 retos: clientes inactivos, stock sin ventas, facturas sin cobro, ausencias en almacén central, censo con `COUNT(col)`).
     * Módulo 7: Consultas Multi-Tabla en Cascada (4 retos: desglose pentagonal, ventas territoriales por categoría, conciliación pedidos-facturas-pagos, trazabilidad física en almacenes).
     * Módulo 8: Operaciones de Conjunto y Joins Especiales (4 retos: censo unificado con `UNION`, mercados desabastecidos con `EXCEPT`, matriz de distribución con `CROSS JOIN`, pares alternativos con `SELF JOIN`).
  3. **Ruta 3 — Advanced Queries & Analytics (10 Retos — 20%):**
     * Módulo 9: Subconsultas Analíticas (3 retos: promedio escalar, clientes VIP con `IN`, comprobación de existencia con `EXISTS`).
     * Módulo 10: Expresiones Condicionales (CASE WHEN) (2 retos: segmentación de pedidos, pivoteo condicional con `SUM(CASE ...)`).
     * Módulo 11: Common Table Expressions (CTEs con WITH) (2 retos: facturación modular por categoría, pipeline encadenado de 2 pasos).
     * Módulo 12: Funciones de Ventana Analíticas (Window Functions) (3 retos: ranking absoluto con `ROW_NUMBER`, ranking relativo particionado con `DENSE_RANK`, análisis cronológico con `LAG`).
* **Sincronización de Componentes y Código:**
  * **Backend ([`apps/api/app/modules/curriculum/seed_data.py`](../apps/api/app/modules/curriculum/seed_data.py)):** Catálogo completo de 50 ejercicios tipados en Pydantic con 10 tablas de muestra y 112 pistas.
  * **Base de Datos ([`database/supabase/02_seed_curriculum.sql`](../database/supabase/02_seed_curriculum.sql)):** DDL de inserción de 3 rutas, 12 módulos, 50 ejercicios y 112 pistas.
  * **Frontend ([`apps/web/src/lib/api.ts`](../apps/web/src/lib/api.ts)):** Soporte offline completo con las 10 tablas de muestra, 50 ejercicios en `FALLBACK_EXERCISES` y contadores de módulos en `FALLBACK_TRACKS`.
* **Garantía de Calidad y Resultados de Verificación:**
  * **Ejecución en Sandbox Docker:** 50/50 consultas ejecutadas contra PostgreSQL Sandbox en el puerto 5433 arrojando cardinalidades no degeneradas ($>0$ filas).
  * **Validación AST de Seguridad:** 50/50 consultas validadas contra `validate_sql_security` sin falsos positivos.
  * **Suite Pytest Completa:** **64/64 pruebas pasando en 3.47s** (100% éxito).
  * **Compilación Frontend Vite:** **0 errores TypeScript** (`tsc && vite build` completado exitosamente).
  * **Grafo de Conocimiento (Graphify):** Actualizado conforme a la regla del proyecto (`python -m graphify update .`), indexando **1,540 nodos, 2,365 aristas y 93 comunidades**.

---

### [2026-11-10] — Entrada 22: Revisión Final de Consistencia Técnica Documental (Blueprint v1.2 y Plan de Fase 10 v1.2)
* **Rama:** `docs/product-business-blueprint-v1`.
* **Objetivo:** Actualizar `docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md` y `docs/roadmap/PHASE_10_STABILIZATION_PLAN.md` a la **versión 1.2**, cerrando las 4 precisiones técnicas de la revisión documental (C-03 fuente autoritativa y skeleton de carga, D-05 recuperación ante interrupciones e idempotencia en migración de invitados, C-01 fuente maestra única de currículo y paridad en 7 atributos, trazabilidad de diffs completos y matriz de pruebas). Tarea 100% documental sin cambios en código ni infraestructura.
* **Artefactos Documentales Actualizados:**
  1. [`docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md`](product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md) (**Versión `1.2`**).
  2. [`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](roadmap/PHASE_10_STABILIZATION_PLAN.md) (**Versión `1.2`**).
* **Estado de Código e Infraestructura:** **Cero modificaciones en código, SQL, migraciones ni infraestructura. No se ha iniciado la implementación de PR-10.1.**

---

### [2026-11-10] — Entrada 23: Auditoría del Estado Operativo y Definición de la Nueva Línea Base (`QURIO-OPERATIONAL-BASELINE-01`)
* **Rama:** `docs/operational-baseline-v1` (ramificada desde `main` / `add8b6d` tras sincronizar documentación v1.2).
* **Objetivo:** Ejecutar una auditoría técnica y forense integral del repositorio Qurio para contrastar afirmaciones documentales contra el estado real del código, evaluar el flujo de 21 pasos de aceptación del estudiante y establecer una nueva línea base operativa orientada estrictamente al éxito del primer grupo piloto.
* **Resultados de la Auditoría Forense:**
  * **Verificación de Git:** Rama `main` en commit `add8b6d`. Las 17 ramas de características históricas están 100% fusionadas a `main`. `origin/main` sincronizado.
  * **Verificación de Currículo (50 Retos):** Paridad comprobada 1:1 en los 7 atributos entre `seed_data.py`, `02_seed_curriculum.sql` y `api.ts`. Se detectó que la variable se llama `SEED_EXERCISES` (no `EXERCISES_SEED`) y que `TRACKS_SEED`/`MODULES_SEED` no existen en backend.
  * **Verificación de Seguridad (Brecha C-01, P0):** Se confirmó que `solution_query` está expuesta en 50 ocurrencias en el bundle JS compilado (`dist/assets/index-*.js`), en `FALLBACK_EXERCISES`, en respuestas de la API (`GET /exercises`) y en PostgREST (`SELECT * FROM exercises`).
  * **Verificación de Persistencia (Brecha C-02, P1):** Confirmada la doble escritura en el frontend (`persistence.ts`) que es rechazada con `42501` y silenciada en consola, bloqueando la edición de perfil.
  * **Verificación de Progreso (Brecha C-03, P1):** Confirmado que `App.tsx` asigna el total global a todas las rutas simultáneamente y suma `+1` a todas al resolver cualquier reto.
  * **Verificación de Esquema (Brecha C-04, P2):** Confirmada la discrepancia `pagos` vs `metodos_pago`, conteos de filas ficticios en `api.ts` y que `ExerciseSpecPanel` solo muestra 4 de las 10 tablas del sandbox.
  * **Verificación de Navegación (Brecha C-05, P1):** Confirmada la ausencia de React Router: estado en memoria con `useState`, sin URLs para retos (`/exercises/:id`) y pérdida de vista en recarga (`F5`).
  * **Verificación de Infraestructura y Pruebas:** Docker Sandbox apagado conforme a solicitud previa; suite de 64 pruebas en FastAPI bloqueada si Docker no corre debido al fixture global en `conftest.py`; frontend sin test runner configurado (`package.json`).
* **Artefactos Entregados:**
  1. [`docs/audits/QURIO_OPERATIONAL_AUDIT.md`](audits/QURIO_OPERATIONAL_AUDIT.md) (**Informe Forense de Auditoría v1.0**).
  2. [`docs/roadmap/QURIO_OPERATIONAL_BASELINE.md`](roadmap/QURIO_OPERATIONAL_BASELINE.md) (**Nueva Línea Base Operativa v1.0**).
* **Estado de Código e Infraestructura:** **Cero modificaciones en código de aplicación (`apps/web`, `apps/api`), cero cambios en esquemas SQL (`database/`), cero cambios en Supabase Cloud. No se inició `PR-10.1`.**


### [2026-11-10] — Entrada 24: Cierre de Auditoría Operativa, Validación Ejecutable y Consolidación de la Línea Base (`QURIO-OPERATIONAL-BASELINE-02`)
* **Rama:** `feat/phase-10-stabilization` (ramificada desde `docs/operational-baseline-v1`).
* **Objetivo:** Ejecutar la resolución integral de las 5 brechas prioritarias de la auditoría operativa (`C-01` a `C-05`) organizadas en 4 bloques funcionales coherentes, validar mediante pruebas automatizadas locales en backend y frontend, verificar el empaquetado de producción y consolidar la nueva línea base técnica para el grupo piloto.
* **Entregables por Bloque Funcional:**
  1. **Bloque A — Seguridad Curricular (`C-01`):**
     * **Backend:** Implementación de `ExercisePublicDTO` en `seed_data.py` (omitiendo `solution_query`) y método `to_public_dto()`. `ExerciseRepository` expone `list_public()` y `get_public_by_id()` retornando DTOs públicos, mientras que `get_internal_for_evaluation()` reserva el acceso a `solution_query` exclusivamente para el evaluador interno.
     * **Frontend:** Eliminación de `solution_query` en la interfaz `Exercise` (`types/index.ts`) y purga completa de las 50 soluciones en `FALLBACK_EXERCISES` de `api.ts`.
     * **Verificación:** `npm run build` genera un bundle en `dist/assets/*.js` con **cero apariciones** de `solution_query`. Pruebas en FastAPI (`test_public_exercises_never_expose_solution_query`) certifican que ni el catálogo ni el detalle exponen soluciones.
  2. **Bloque B — Persistencia y Experiencia de Usuario Autenticado e Invitado (`C-02` + `D-05`):**
     * **Frontend (`persistence.ts`):** Eliminación total de llamadas directas a `.from('exercise_attempts').insert`, `.from('user_profiles').update({ xp, level })` y `.from('user_daily_activity').update`.
     * **Restricción de Perfil:** `persistence.updateProfile` restringido estrictamente a campos visuales (`display_name`, `avatar_url`, `username`), impidiendo errores `42501`.
     * **Límite de Prueba de Invitado:** En backend (`router.py`), usuarios sin sesión (`user.is_guest`) son rechazados con HTTP 401 `REGISTRATION_REQUIRED_AFTER_TRIAL` si intentan evaluar retos fuera de los 3 de prueba del M01.
     * **Almacén Temporal de Invitados (`qurio_guest_progress_v1`):** Protocolo de migración idempotente (`syncGuestProgress`) con recuperación de bloqueos stale en `syncing` (>30s) y descarte de duplicados ya existentes en la nube.
     * **Aislamiento de Progreso:** `getCompletedExerciseIds` para usuarios autenticados lee exclusivamente de Supabase Cloud, sin mezclar datos de `localStorage`.
  3. **Bloque C — Integridad del Currículo y Progreso (`C-03` + `C-04`):**
     * **Funciones Puras (`progress.ts`):** Implementación de `computeOfficialTracksProgress` (calcula avance por ruta cruzando módulos con `authoritativeCompletedIds`) y `computeGuestTrialTracksProgress` (aislado para prueba).
     * **Tratamiento de `isLoading`:** Cuando `isLoading` es true, devuelve `completed_exercises: null`, `progress_percent: null` e `is_progress_loading: true`, renderizando un badge pulsante y skeleton shimmer en `TrackCard.tsx` para evitar parpadeos en 0%.
     * **Aislamiento de Rutas:** Se erradicó el bug que sumaba progreso a todas las rutas. Completar retos en Ruta 1 solo incrementa Ruta 1.
     * **Esquema Relacional Canónico:** `ExerciseSpecPanel.tsx` actualizado para mostrar las **10 tablas completas** del sandbox relacional. `ECOMMERCE_TABLES_SCHEMA` (`api.ts`) y `README.md` alineados con los conteos reales de filas de `ecommerce_seed.sql` y tabla `pagos` con columna `metodo_pago`. `docs/CURRICULUM_SPEC.md` alineado en reto #27.
  4. **Bloque D — Navegación y Autenticación (`C-05`):**
     * **Enrutamiento Web Real con History API:** URLs navegables y limpias (`/`, `/tracks`, `/tracks/:slug`, `/exercises/:id`, `/playground`, `/achievements`, `/profile`, `/auth/confirm`, `/reset-password`).
     * **Preservación en F5:** Recargar el navegador dentro de un reto conserva el ejercicio activo y el estado del IDE mediante deep linking y sincronización con `exercises`.
     * **Soporte de Navegación:** Botones Atrás y Adelante sincronizados con listener `popstate`.
     * **Detección Auth Segura:** Detección de parámetros PKCE `code`, `token_hash`, `type=recovery` y `type=signup` en search y hash, con limpieza de URL mediante `replaceState`.
* **Resultados de la Validación Automatizada:**
  * **Backend Pytest:** **69/69 pruebas pasando en 44.20s** (100% éxito), incluyendo 13 pruebas de integración, 3 pruebas unitarias de consistencia de esquemas (`test_schema_consistency.py`) y 53 pruebas de seguridad/migración/evaluador. Conexión de pool desacoplada con timeout de 3.0s.
  * **Frontend Vitest:** **8/8 pruebas pasando en 848ms** en `apps/web` (`progress.test.ts` y `persistence.test.ts`), verificando no-inflación por `is_completed`, estados `isLoading`, aislamiento entre rutas, recuperación ante interrupciones de 30s e idempotencia de migración.
  * **Frontend Build:** Empaquetado de producción `tsc && vite build` completado en 5.47s con **0 errores TypeScript** y **0 fugas** de `solution_query`.
  * **Infraestructura:** Contenedores de prueba de Docker apagados limpiamente (`docker compose down`).
* **Estado de la Línea Base:** La línea base operativa de Qurio queda **100% estabilizada, verificada y lista para la apertura del grupo piloto de estudiantes**.

---

### [2026-11-10] — Entrada 25: Revisión Correctiva, Certificación Técnica y Cierre Definitivo de Fase 10 (`QURIO-PHASE-10-CORRECTIVE-VALIDATION-01`)
* **Rama:** `feat/phase-10-stabilization`
* **Objetivo:** Ejecutar una revisión correctiva integral, certificación técnica y cierre definitivo de la Fase 10 actuando como equipo multidisciplinario senior (Arquitectura, Backend/Seguridad, Frontend/UX, PostgreSQL/Supabase, QA Automation/E2E y DevOps).
* **Entregables y Remediaciones Ejecutadas:**
  1. **Rendimiento y Code Splitting (Bloque 10):**
     * Configuración de `manualChunks` en Vite (`apps/web/vite.config.ts`) separando `vendor-monaco`, `vendor-supabase`, `vendor-react` y `vendor-lucide`.
     * Carga diferida (`React.lazy()` y `<Suspense>`) de vistas secundarias (`SqlPlaygroundView`, `AchievementsView`, `UserProfileView`, `NotFoundView`, `AuthConfirmView`, `ResetPasswordView`).
     * **Resultado cuantitativo:** Reducción del bundle principal de 689.56 kB a **247.68 kB** (disminución del **64.1%**), eliminando permanentemente la advertencia de Rollup >500 kB con 0 errores TypeScript.
  2. **Preservación del Borrador del Editor (C-05 Refinado):**
     * Implementación de `persistence.saveExerciseDraft`, `persistence.getExerciseDraft` y `persistence.clearExerciseDraft`.
     * Preservación del código SQL no enviado tecleado por el estudiante ante recargas (`F5`) y navegación de deep links.
     * Limpieza automática del borrador al resolver el reto con éxito (`PASSED`) o al pulsar "Restablecer".
     * Blindaje comprobado: la clave `qurio_draft_sql_${id}` contiene estrictamente texto SQL sin tokens ni credenciales.
  3. **Corrección de Migración de Invitados y Respuesta HTTP Perdida (D-05):**
     * Corrección del defecto de persistencia en `syncGuestProgress`: guardado local obligatorio al detectar aciertos previos en la nube antes de ejecutar `continue`.
     * Implementación de mutex de concurrencia (`isSyncInProgress`) para neutralizar invocaciones solapadas simultáneas.
     * Certificación automatizada del Escenario 6 y 8 de D-05 (respuesta HTTP perdida / reconexión): al detectar el reto en la nube, se marca `'synced'` y se purga el almacenamiento local sin invocar a la API ni duplicar XP.
  4. **Desacoplamiento Arquitectónico de Pruebas (Bloque E):**
     * Refactorización de `apps/api/tests/conftest.py`: eliminación de `autouse=True` en `init_sandbox_pool` e incorporación del fixture explícito `sandbox_db` requerido por `client`.
     * Las pruebas de integración fallan con mensaje descriptivo de infraestructura si Docker no está activo.
     * Las 40 pruebas unitarias corren de forma 100% offline sin levantar sockets ni depender de Docker.
  5. **Ampliación de Pruebas Automatizadas:**
     * **Backend (Pytest):** **69/69 pruebas pasando al 100% en 44.39s** con Docker activo.
     * **Frontend (Vitest):** Suite ampliada de 8 a **17 pruebas pasando al 100% en 919ms** distribuidas en `progress.test.ts`, `persistence.test.ts` y `routing.test.ts`.
  6. **Validación Funcional en Vivo con Docker:**
     * Contenedor `qurio-api` reconstruido y verificado.
     * `curl` a `/api/v1/exercises` y `/api/v1/exercises/{id}` confirma **0 `solution_query`** en respuestas HTTP.
     * Límite de prueba de invitados verificado: Retos 1-3 aprobados; Reto 4 rechazado con HTTP 401 `REGISTRATION_REQUIRED_AFTER_TRIAL`.
  7. **Higiene Documental y Enlaces Relativos:**
     * Sustitución de **145 enlaces locales absolutos `file:///c:...`** por rutas relativas portables en todos los documentos Markdown del proyecto.
* **Artefacto Entregado:** [`docs/audits/QURIO_PHASE_10_CERTIFICATION_FINAL.md`](audits/QURIO_PHASE_10_CERTIFICATION_FINAL.md) (Informe Final de Certificación de Fase 10).
* **Control de Versiones:** Rama `feat/phase-10-stabilization` lista para revisión ejecutiva. Docker apagado (`docker compose down`). Zero push a origin, zero merge a main.

---

### [2026-11-10] — Entrada 26: Conciliación Final de Seguridad, XP de Invitados y Autorizaciones (`QURIO-PHASE-10-FINAL-RECONCILIATION`)
* **Rama:** `feat/phase-10-stabilization`
* **Objetivo:** Realizar la conciliación final del informe de certificación de Fase 10, aclarando con evidencia forense el uso de Supabase Cloud, garantizando la política de XP para invitados (D-05), delimitando la certificación de C-01 y formalizando la trazabilidad Git.
* **Actividades y Resoluciones Técnicas:**
  1. **Aclaración Obligatoria sobre Supabase Cloud (Auditoría Forense):**
     * Se auditó el historial íntegro de llamadas HTTP emitidas durante las pruebas.
     * **Resultado definitivo:** Se certifica que el proyecto en la nube (`bfvgqxfzftumwrleacof`) **no sufrió escrituras, modificaciones ni inserciones de prueba** (0 registros afectados, 0 XP otorgado).
     * Los únicos intentos de escritura ejecutados contra la nube fueron bloqueados por RLS y revocación de funciones (códigos 401 y 400).
     * Las pruebas automatizadas de RPC y migración (`test_supabase_migration.py`, 16 tests) se ejecutaron **estrictamente contra el PostgreSQL Sandbox local en Docker (puerto 5433)**.
     * La sección 6 del informe de certificación fue corregida para transparentar que describe la arquitectura funcional validada en local y mocks, sin escrituras en Cloud de producción.
  2. **Corrección de XP y Progreso de Invitados (Decisión D-05):**
     * En `apps/api/app/modules/runner/router.py`, se corrigió la respuesta para invitados forzando taxativamente `evaluation.xp_awarded = 0` y mensaje educativo para registrarse al superar un reto.
     * Un invitado no puede alterar XP oficial, nivel oficial ni estadísticas en la base de datos de producción.
     * El progreso de invitado permanece en `qurio_guest_progress_v1` en `localStorage` exclusivamente como buffer transitorio para su canje posterior.
     * La migración posterior a una cuenta es idempotente y no duplica XP (`cloudPassedSet` en frontend y `already_passed` en RPC).
     * Suite de integración ampliada a **70 pruebas en backend**, validando con éxito tanto `test_submit_exercise_success_guest` (`xp_awarded == 0`) como `test_submit_exercise_success_authenticated` (`xp_awarded == 30`).
  3. **Delimitación de la Certificación de C-01:**
     * **Nivel 1 (Código):** 100% certificado. `ExercisePublicDTO`, DTOs en repositorio/router, interfaz TypeScript y 0 coincidencias en bundle JS (247.68 kB).
     * **Nivel 2 (PostgreSQL Local):** 100% certificado en Docker (puerto 5433). Script `03_security_hardening.sql` probado con roles `anon`, `authenticated` (bloqueados en `solution_query`) y `service_role` (autorizado).
     * **Nivel 3 (Supabase Cloud Producción):** Declarado con total transparencia. No se ejecutó en caliente en el dashboard de producción; queda documentado para aplicación manual por parte del propietario.
  4. **Trazabilidad y Contención Git:**
     * Rama de trabajo: `feat/phase-10-stabilization`.
     * Cero modificaciones en `main`, cero push a `origin`, cero despliegue público.
* **Documentación Actualizada:** [`docs/audits/QURIO_PHASE_10_CERTIFICATION_FINAL.md`](audits/QURIO_PHASE_10_CERTIFICATION_FINAL.md) y [`docs/BITACORA.md`](BITACORA.md).
* **Decisiones Preservadas:** `D-01` a `D-07` permanecen 100% intactas.

---

## 4. Estado de la Integración con Supabase Cloud

* El usuario confirmó la ejecución exitosa de los scripts [`database/supabase/01_schema.sql`](../database/supabase/01_schema.sql), [`database/supabase/02_seed_curriculum.sql`](../database/supabase/02_seed_curriculum.sql) y [`database/supabase/03_security_hardening.sql`](../database/supabase/03_security_hardening.sql) en el panel de Supabase Cloud.
* **Verificación en Vivo Confirmada:**
  * La RPC protegida `record_verified_attempt` está activa en la nube con `SET search_path = ''` y validaciones anti-NULL.
  * Invocaciones autorizadas mediante `service_role` (backend) responden correctamente.
  * Invocaciones no autorizadas mediante `anon` (cliente público) son rechazadas por PostgreSQL con código de error `42501: permission denied for function record_verified_attempt`.
* Las credenciales se encuentran configuradas de forma segura: `SUPABASE_SERVICE_ROLE_KEY` reside exclusivamente en `apps/api/.env`, mientras que `apps/web/.env` opera únicamente con `VITE_SUPABASE_ANON_KEY`.

---

### Entrada 27: Fase 11 — Preparación y Validación Controlada del Piloto

* **Fecha:** 10 de Noviembre de 2026
* **Rama de Trabajo Autorizada:** `feat/phase-11-pilot-readiness` (creada a partir de `feat/phase-10-stabilization` en commit `bba65c2`).
* **Objetivo:** Ejecutar la preparación y validación técnica integral previa al despliegue del piloto controlado con estudiantes reales, cubriendo auditoría de código, auditoría de seguridad perimetral de Supabase Cloud en modo solo lectura, remediación de vulnerabilidades y pruebas E2E en Google Chrome real.
* **Actividades y Logros Clave:**
  1. **Auditoría Técnica y Remediación de Vulnerabilidades:**
     * Se auditó la cadena de suministro de dependencias de frontend: `npm audit` detectó una vulnerabilidad crítica en `dompurify <=3.4.16` (CVE de Cross-Site Scripting y manipulación de anidamientos).
     * Se aplicó la remediación mediante override en `apps/web/package.json` fijando `dompurify: "^3.4.17"`.
     * Se verificó con `npm audit --registry=https://registry.npmjs.org`: **0 vulnerabilidades encontradas** sobre 175 paquetes.
     * En backend, las dependencias en `apps/api/requirements.txt` (FastAPI 0.162, Starlette 1.10, Pydantic 2.14, asyncpg 0.32, sqlglot 30.30, PyJWT 2.15, cryptography 50.0) fueron validadas y certificadas libres de vulnerabilidades.
  2. **Auditoría de Solo Lectura de Supabase Cloud (`bfvgqxfzftumwrleacof`):**
     * Se comprobó de forma no invasiva la API REST pública de Cloud utilizando la clave `anon`:
       * La RPC `record_verified_attempt` está debidamente bloqueada para llamadas directas anónimas (`HTTP 401: 42501 permission denied for function`).
       * La tabla `exercise_attempts` rechaza lecturas anónimas (`HTTP 401: permission denied for table`).
       * **Hallazgo Alto (H-01):** La tabla `exercises` en Supabase Cloud aún expone la columna `solution_query` a consultas anónimas directas (`HTTP 200`), dado que el script `03_security_hardening.sql` no ha sido ejecutado por el propietario en el panel en la nube.
       * Se generó la guía detallada de aplicación en [`docs/audits/QURIO_PHASE_11_SECURITY_REVIEW.md`](audits/QURIO_PHASE_11_SECURITY_REVIEW.md) para que el propietario aplique el script en el SQL Editor de Supabase antes del ingreso de estudiantes.
  3. **Suite Completa de Pruebas E2E en Navegador Real (Google Chrome):**
     * Se implementó el banco de pruebas automatizado con Playwright (`apps/web/e2e/pilot_e2e_suite.mjs`) e infraestructura de servidor SPA local (`apps/web/e2e/spa_server.mjs`).
     * Se levantó la pila completa (FastAPI en 8000, PostgreSQL Sandbox en 5433, SPA en 5173).
     * Se ejecutaron 19 pruebas de integración en Google Chrome real cubriendo:
       * Carga de Dashboard y metatítulos dinámicos (`T01`, `T01.1`).
       * Navegación y deep links (`T02`, `T03`, `T03.1`).
       * Preservación de borradores SQL ante recargas (F5) con purga tras éxito (`T04`, `T06.1`).
       * Evaluación semántica con fallo pedagógico y comparativa de diff (`T05`).
       * Evaluación correcta en modo invitado con registro local y 0 XP oficial (`T06`).
       * Enforce de límite de cuota trial (HTTP 401 en 4º reto para invitados) (`T07`).
       * Formularios de registro y recuperación de contraseña sin alerts nativos (`T08`, `T08.1`, `T09`).
       * Consola interactiva de SQL Playground (`T10`, `T10.1`).
       * Página 404 temática SQL (`T11`, `T11.1`).
       * Perfil de usuario autenticado (`T12`).
       * Resiliencia ante caídas de red y errores 500 (`T13`).
     * **Resultado E2E:** **19 de 19 pruebas pasadas al 100%**.
  4. **Corrección de UX en Navegación React (`App.tsx` & `AuthModal.tsx`):**
     * Se corrigió la condición de enrutamiento en `App.tsx` para evitar que las actualizaciones del array de ejercicios en memoria reinicien el estado `executionStatus` a `'IDLE'` al resolver un reto.
     * Se añadió un hook `useEffect` en `AuthModal.tsx` para garantizar que cada apertura del modal inicie de forma limpia en el modo solicitado (`signin` por defecto) y restablezca cualquier mensaje transitorio.
  5. **Baterías Automatizadas Consolidadas:**
     * Backend Pytest: **70/70 pruebas pasadas** (44.63s).
     * Frontend Vitest: **17/17 pruebas pasadas** (507ms).
     * Compilación de producción Vite: **Limpia (0 errores)** en 5.41s.
  6. **Contención Git y Veredicto:**
     * Rama: `feat/phase-11-pilot-readiness`.
     * Zero Push, Zero Merge, cero modificaciones en `main`.
     * **Veredicto:** **LISTO PARA PILOTO CON RESTRICCIÓN ADMINISTRATIVA PREVIA** (aplicación de `03_security_hardening.sql` en Supabase Cloud).
* **Entregables Documentales Generados:**
  * [`docs/audits/QURIO_PHASE_11_TECHNICAL_AUDIT.md`](audits/QURIO_PHASE_11_TECHNICAL_AUDIT.md)
  * [`docs/audits/QURIO_PHASE_11_E2E_REPORT.md`](audits/QURIO_PHASE_11_E2E_REPORT.md)
  * [`docs/audits/QURIO_PHASE_11_SECURITY_REVIEW.md`](audits/QURIO_PHASE_11_SECURITY_REVIEW.md)
  * [`docs/audits/QURIO_PHASE_11_PILOT_READINESS.md`](audits/QURIO_PHASE_11_PILOT_READINESS.md)

---

### Entrada 28: Fase 11.1 — Conciliación Final, Cierre de Hallazgos y Certificación del Piloto

* **Fecha:** 10 de Noviembre de 2026
* **Rama de Trabajo Autorizada:** `feat/phase-11-pilot-readiness` (mantenida estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Resolver definitivamente las discrepancias detectadas en los informes preliminares de Fase 11, subsanar la caché desactualizada del contenedor Docker en la evaluación de invitados, blindar `03_security_hardening.sql` con nombres canónicos de columnas, restaurar las decisiones D-01 a D-07 del Blueprint v1.2 y generar evidencia reproducible al 100%.
* **Actividades y Logros Clave:**
  1. **Resolución de la Discrepancia Crítica de XP en Invitados (C-03 & D-05):**
     * **Causa Raíz:** El código en `apps/api/app/modules/runner/router.py` ya contaba con la cota `xp_awarded = 0`, pero `docker-compose.yml` carecía de un volumen montado para `apps/api/app`, ejecutando una imagen desfasada previa al commit `bba65c2` que devolvía `xp_awarded: 30`.
     * **Corrección:** Se agregó el volumen `./apps/api/app:/app/app:ro` en `docker-compose.yml`, se reconstruyó la imagen con `docker compose build api` y se reinició la pila.
     * **Validación Empírica:** La llamada HTTP al endpoint `/submit` como invitado devuelve taxativamente `"xp_awarded": 0`.
     * **Regresiones:** Se añadieron 2 pruebas en `apps/api/tests/test_integration.py` (`test_regression_guest_xp_strictly_zero_and_no_rpc_called` y `test_regression_authenticated_user_passes_exercise_4_and_receives_xp`). Total Pytest: **72 pruebas pasadas**.
  2. **Endurecimiento Riguroso de `03_security_hardening.sql` (v6.0):**
     * Se auditaron las columnas físicas de `public.exercises` (`id, module_id, title, prompt, initial_code, target_database, xp_reward, difficulty, check_order, sort_order, created_at`), eliminando referencias erróneas a columnas ficticias (`track_id`, `description`).
     * Se implementó Column-Level Security (CLS) sobre `exercises`: `solution_query` queda completamente denegada para `anon` y `authenticated`, siendo accesible únicamente por `service_role`.
     * Se blindó `public.user_progress` contra modificaciones directas de estudiantes, delegando actualizaciones exclusivamente a la RPC `record_verified_attempt`.
     * Se corrigió la firma exacta de 8 parámetros de la RPC: `record_verified_attempt(UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT)`.
     * Se verificó en `test_supabase_migration.py`: 9 pruebas de privilegios efectivos y transacciones aprobadas al 100%.
  3. **Reconciliación Conceptual de Decisiones D-01 a D-07:**
     * Se restauraron las definiciones de producto del Blueprint v1.2 (D-01: Free/Plus, D-02: Marca y eslogan, D-03: Stripe diferido, D-04: Python diferido, D-05: Invitados 3 retos con 0 XP, D-06: Teams diferido, D-07: Estabilidad prioritaria).
     * Se formalizaron identificadores técnicos desacoplados: `REQ-SANDBOX-01`, `REQ-EVAL-01`, `REQ-AUTH-01`, `REQ-XP-01`, `REQ-MIGRATION-01`, `REQ-DESIGN-01`, `REQ-ANTISLOP-01`.
  4. **Clasificación Honesta y Transparente de la Suite E2E:**
     * Se clasificaron las 19 pruebas de `pilot_e2e_suite.mjs` en 4 niveles de fidelidad:
       * **Tier A (12 pruebas):** Navegador real contra API local y Docker PostgreSQL Sandbox real.
       * **Tier B (3 pruebas):** Intercepción de rutas de red (`page.route()`) para proteger la nube.
       * **Tier C (3 pruebas):** Pruebas de almacenamiento local (`localStorage`).
       * **Tier D:** Flujos que requieren infraestructura cloud real delimitados con claridad.
     * En T06 se agregó la aserción estricta de red `if (resJson.xp_awarded !== 0) throw new Error(...)`, verificando `xp_awarded === 0`.
  5. **Baterías Automatizadas Consolidadas:**
     * Backend Pytest: **72/72 pruebas pasadas** (44.68s).
     * Frontend Vitest: **17/17 pruebas pasadas** (954ms).
     * Compilación de producción Vite: **Limpia (0 errores)** en 6.01s (2,171 módulos, 0 fugas de `solution_query`).
     * Seguridad de dependencias: `npm audit` reportó **0 vulnerabilidades**.
     * E2E Google Chrome: **19/19 pruebas pasadas** al 100%.
  6. **Contención Git y Veredicto Final:**
     * Rama de trabajo: `feat/phase-11-pilot-readiness`.
     * Política respetada: Zero Push, Zero Merge, cero modificaciones en `main`.
     * **Veredicto:** **LISTO PARA PILOTO CON RESTRICCIONES** (requiere que el propietario aplique `03_security_hardening.sql` en Supabase Cloud antes de entregar accesos).
* **Entregables Documentales Reconciliados y Actualizados:**
  * [`docs/audits/QURIO_PHASE_11_TECHNICAL_AUDIT.md`](audits/QURIO_PHASE_11_TECHNICAL_AUDIT.md)
  * [`docs/audits/QURIO_PHASE_11_E2E_REPORT.md`](audits/QURIO_PHASE_11_E2E_REPORT.md)
  * [`docs/audits/QURIO_PHASE_11_SECURITY_REVIEW.md`](audits/QURIO_PHASE_11_SECURITY_REVIEW.md)
  * [`docs/audits/QURIO_PHASE_11_PILOT_READINESS.md`](audits/QURIO_PHASE_11_PILOT_READINESS.md)

---

### Entrada 29: Fase 11.2 — Certificación Final de Seguridad, Consistencia y Preparación del Piloto

* **Fecha:** 10 de Noviembre de 2026
* **Rama de Trabajo Autorizada:** `feat/phase-11-pilot-readiness` (mantenida estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Resolver los últimos hallazgos de idempotencia de la RPC en Supabase, perfeccionar el script de seguridad `03_security_hardening.sql` (v6.1) y su reversión (`rollback_security_hardening.sql` v4.0), restaurar la fidelidad al Blueprint v1.2, validar 8 escenarios críticos de regresión y emitir el dictamen formal definitivo para la autorización del piloto.
* **Actividades y Logros Clave:**
  1. **Perfeccionamiento e Idempotencia de la RPC `record_verified_attempt` (v6.1):**
     * **Disociación de Estado:** Se separó la verificación de intento aprobado (`v_already_passed`) de la verificación de recompensa otorgada (`v_already_awarded`).
     * **Desbloqueo de XP tras Prueba:** Un intento anterior con `xp_awarded = 0` (modo invitado o práctica) ya no bloquea una recompensa legítima cuando el usuario se autentica.
     * **Anti-Duplicados:** Si `v_already_awarded = TRUE`, la RPC fuerza `v_effective_xp := 0` y no incrementa el XP del usuario.
     * **Validación Autoritativa de Coherencia:** La RPC rechaza cualquier solicitud con `p_xp_to_award > 0` que no coincida exactamente con el cálculo canónico (`v_authoritative_xp`), admitiendo expresamente `0` cuando no se solicita XP.
  2. **Auditoría Integral de Infraestructura de Base de Datos (`03_security_hardening.sql` v6.1):**
     * Se habilitó explícitamente Row Level Security (RLS) en las 11 tablas del esquema público.
     * Se implementaron políticas RLS idempotentes con `DROP POLICY IF EXISTS ...; CREATE POLICY ...;`.
     * Se otorgó `GRANT ALL ON TABLE public.user_profiles TO service_role;` garantizando interoperabilidad del backend.
     * Se mantuvo la protección Column-Level Security (CLS) sobre `solution_query` en `exercises` para `anon` y `authenticated`.
     * Se preparó y verificó el script de reversión `rollback_security_hardening.sql` (v4.0).
  3. **Suite Exhaustiva de Regresión (8 Escenarios Críticos en Pytest):**
     * En `apps/api/tests/test_supabase_migration.py` se implementaron y verificaron 15 pruebas cubriendo:
       1. Primer pase con XP otorgado.
       2. Segundo pase sin XP duplicado (`xp_awarded = 0`).
       3. Primer pase con 0 XP (modo práctica / trial).
       4. Pase posterior con recompensa legítima (+30 XP acreditados).
       5. Dos solicitudes concurrentes simultáneas sobre el mismo reto y usuario.
       6. Rechazo de XP inconsistente o inflado.
       7. Rechazo de usuario inexistente con excepción.
       8. Rechazo de ejercicio inexistente con excepción.
       9. Prueba de script de reversión confirmando preservación de seguridad CLS.
     * Total Pytest: **78 pruebas pasadas en 61.17s**.
  4. **Fidelidad Canónica al Blueprint v1.2 (D-01 a D-07):**
     * D-01: Free/Plus con precios hipotéticos de **$129 MXN mensuales y $999 MXN anuales**.
     * D-02: Eslogan general: «Aprende datos. Practica. Construye tu futuro.» y lema SQL: «Aprende SQL. Piensa en queries.».
     * D-03: Evaluar Stripe México, sin integración aprobada todavía.
     * D-04: Evaluar alternativas de ejecución de Python sin elegir arquitectura anticipadamente.
     * D-05: Invitados con 3 ejercicios gratuitos y 0 XP oficial.
     * D-06: Teams académico pospuesto.
     * D-07: Priorizar estabilidad antes de nuevas funcionalidades.
  5. **Baterías Automatizadas Consolidadas:**
     * Backend Pytest: **78/78 pruebas pasadas** (61.17s).
     * Frontend Vitest: **17/17 pruebas pasadas** (892ms).
     * Compilación de producción: **Limpia (2,171 módulos, 0 errores, 0 fugas de `solution_query`)** en 5.48s.
     * Seguridad de dependencias: `npm audit` reportó **0 vulnerabilidades**.
     * E2E Google Chrome: **19/19 pruebas pasadas** al 100% (20.85s).
  6. **Contención Git y Veredicto Final:**
     * Rama de trabajo: `feat/phase-11-pilot-readiness`.
     * Zero Push / Zero Merge cumplido rigurosamente.
     * **Veredicto Definitivo:** **LISTO PARA PILOTO CON RESTRICCIONES** (aplicación administrativa de `03_security_hardening.sql` v6.1 en Supabase Cloud antes del ingreso de estudiantes).
* **Entregables Documentales Certificados:**
  * [`docs/audits/QURIO_PHASE_11_TECHNICAL_AUDIT.md`](audits/QURIO_PHASE_11_TECHNICAL_AUDIT.md)
  * [`docs/audits/QURIO_PHASE_11_E2E_REPORT.md`](audits/QURIO_PHASE_11_E2E_REPORT.md)
  * [`docs/audits/QURIO_PHASE_11_SECURITY_REVIEW.md`](audits/QURIO_PHASE_11_SECURITY_REVIEW.md)
  * [`docs/audits/QURIO_PHASE_11_PILOT_READINESS.md`](audits/QURIO_PHASE_11_PILOT_READINESS.md)

---

### Entrada 30: Fase 11.3 — Auditoría Final del Procedimiento de Rollback y Continuidad Operativa

* **Fecha:** 10 de Noviembre de 2026
* **Rama de Trabajo Autorizada:** `feat/phase-11-pilot-readiness` (mantenida estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Auditar y verificar el procedimiento de contingencia y reversión en `rollback_security_hardening.sql`, contrastarlo con el hardening v6.1 y la arquitectura de FastAPI, purgar permisos residuales de columnas en `user_profiles`, implementar y certificar el Modo de Contingencia en el backend (Alternativa B), y conciliar las versiones documentales (v4.0).
* **Actividades y Logros Clave:**
  1. **Auditoría Exhaustiva de `rollback_security_hardening.sql` (v4.0):**
     * **Firma Exacta:** Verificada la eliminación precisa de `record_verified_attempt(UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT)`.
     * **Conservación del Índice Único Parcial:** Preservado y asegurado con `CREATE UNIQUE INDEX IF NOT EXISTS idx_single_awarded_passed_attempt`, impidiendo duplicación física de XP positivo.
     * **Preservación de CLS y RLS:** `solution_query` permanece revocada para `anon` y `authenticated`. RLS explícito verificado en las 11 tablas del esquema público.
     * **Purga de Permisos Residuales:** Se revocaron explícitamente todos los permisos de columna (`SELECT, INSERT, UPDATE, REFERENCES`) en `user_profiles` para `anon` y `PUBLIC`, garantizando que ninguna concesión previa de columnas visuales permanezca activa.
     * **Secuencias:** Blindadas contra modificación (`UPDATE`/`ALTER`) para clientes.
  2. **Continuidad Operativa en Backend FastAPI (Alternativa B Certificada):**
     * Inspección confirmó que FastAPI no dispone (ni debe disponer por seguridad) de un mecanismo de inserción directa a tablas de progreso en caso de caída de la RPC.
     * Se implementó en `app/core/supabase.py` y `app/modules/runner/router.py` el **Modo de Contingencia**: si la RPC no existe (post-rollback) o falla por red/configuración, el backend:
       * Permite que la evaluación semántica en PostgreSQL Sandbox continúe con éxito (la práctica del alumno nunca se bloquea).
       * Establece estrictamente `evaluation.xp_awarded = 0`.
       * Emite un mensaje claro indicando que la práctica fue válida pero la certificación de XP está temporalmente en pausa.
       * La UI jamás falsifica progreso oficial ni muestra `+35 XP acreditados` sin persistencia efectiva.
     * No hay pérdida silenciosa de progreso: como no se registró XP falso, cuando la RPC se restablece, el estudiante puede volver a enviar su reto y la RPC v6.1 le acredita sus +35 XP legítimos.
  3. **Pruebas Automatizadas Consolidadas (80 Pytest, 17 Vitest, 19 E2E):**
     * Se incorporaron 2 pruebas de contingencia en `test_integration.py` (`test_contingency_mode_when_rpc_unavailable_awards_zero_xp_and_informs_user` y `test_contingency_mode_preserves_practice_and_allows_subsequent_reward_when_rpc_restored`).
     * Se amplió `test_rollback_script_preserves_strict_security` en `test_supabase_migration.py` validando los 8 criterios de base de datos.
     * Pytest: **80/80 pruebas pasadas** (61.50s).
     * Vitest: **17/17 pruebas pasadas** (861ms).
     * Compilación: **2,171 módulos limpios** en 5.38s.
     * E2E Google Chrome: **19/19 pruebas pasadas** (100%).
  4. **Conciliación Documental Homogénea:**
     * Fuente de verdad establecida: `database/supabase/rollback_security_hardening.sql` **Versión 4.0**.
     * Homogeneizadas todas las referencias en reportes previos y bitácora.
* **Entregables de Fase 11.3:**
  * [`docs/audits/QURIO_PHASE_11_3_ROLLBACK_AUDIT.md`](audits/QURIO_PHASE_11_3_ROLLBACK_AUDIT.md)
  * [`docs/audits/QURIO_PHASE_11_3_CONTINGENCY_TESTS.md`](audits/QURIO_PHASE_11_3_CONTINGENCY_TESTS.md)
  * [`database/supabase/rollback_security_hardening.sql`](../database/supabase/rollback_security_hardening.sql) (v4.0 verificado)

---

### Entrada 31: Cierre Definitivo de Fase 11.3 — Corrección Sintáctica, Blindaje de Secuencias, Simulación Realista PGRST202 y Congelamiento de Seguridad

* **Fecha:** 10 de Noviembre de 2026
* **Rama de Trabajo Autorizada:** `feat/phase-11-pilot-readiness` (estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Resolver los últimos hallazgos de la auditoría independiente de rollback, corregir la sintaxis de revocación por columna en PostgreSQL, blindar totalmente las secuencias contra roles de cliente, certificar la conmutación a Modo de Contingencia ante el error realista PostgREST `PGRST202`, generar la matriz definitiva de permisos y congelar definitivamente el alcance de la Fase 11.3 sin abrir subfases adicionales.
* **Actividades y Logros Clave:**
  1. **Alineación Sintáctica en PostgreSQL (`rollback_security_hardening.sql` v4.1 y `03_security_hardening.sql` v6.1):**
     * Corrección estricta de cláusulas `REVOKE` por columna utilizando la sintaxis estándar de PostgreSQL: `REVOKE UPDATE, INSERT (...) ON TABLE public.<tabla> FROM ...;`.
     * Eliminación de operaciones no soportadas por columna (`DELETE`, `TRUNCATE`) de las listas de columnas, asegurando su revocación exclusiva a nivel de tabla.
     * Corrección de nombres canónicos de columnas en `public.user_progress` (`exercises_completed_count` en lugar de referencias desactualizadas).
  2. **Blindaje Integral de Secuencias en Schema `public`:**
     * Revocación absoluta de todos los privilegios sobre secuencias para roles de cliente:
       `REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;`
     * Concesión exclusiva de privilegios sobre secuencias al rol de administración interna del backend:
       `GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;`
     * Validación automatizada en PostgreSQL comprobando que ninguna secuencia otorga `USAGE` ni `SELECT` a `anon` ni `authenticated`.
  3. **Prueba de Integración con Simulación Realista de Error PostgREST `PGRST202`:**
     * Implementada `test_contingency_mode_with_realistic_pgrst202_postgrest_error` en `apps/api/tests/test_integration.py`.
     * Interceptación defensiva a nivel de transporte HTTP asíncrono devolviendo exactamente el payload emitido por PostgREST ante desincronización de caché o eliminación de RPC (`HTTP 404 Not Found`, `code: "PGRST202"`).
     * Comprobada la resiliencia integral:
       * `record_verified_progress` captura el error sin excepciones no controladas.
       * Endpoint `/api/v1/exercises/{exercise_id}/submit` responde `HTTP 200 OK` con `status='PASSED'` y `xp_awarded=0`.
       * Mensaje transparente advierte al alumno sobre la operación en modo de contingencia.
       * Cero llamadas hacia internet o hacia Supabase Cloud.
  4. **Baterías Automatizadas Consolidadas (100% de Éxito):**
     * Backend Pytest: **81/81 pruebas pasadas** (62.43s) cubriendo autenticación, evaluador semántico, sandbox, seguridad AST con SQLGlot, límites de invitados, matriz CLS, concurrencia, idempotencia, rollback v4.1 y contingencia ante PGRST202.
     * Frontend Vitest: **17/17 pruebas pasadas** (1.14s).
     * Compilación de producción Vite: **2,171 módulos transformados limpiamente (0 errores)** en 5.54s.
     * E2E en Navegador Real Google Chrome: **19/19 flujos pasados** (22.80s).
     * Auditoría npm: **0 vulnerabilidades**.
  5. **Veredicto Final y Congelamiento:**
     * **Veredicto Único:** **APROBADO CON RESTRICCIONES OPERATIVAS EXTERNAS** (código y plataforma 100% listos; ejecución manual previa de `03_security_hardening.sql` v6.1 en Supabase Cloud reservada para el administrador de producción).
     * Alcance de Fase 11.3 definitivamente congelado.
* **Entregables Certificados:**
  * [`database/supabase/rollback_security_hardening.sql`](../database/supabase/rollback_security_hardening.sql) (Versión definitiva v4.1)
  * [`database/supabase/03_security_hardening.sql`](../database/supabase/03_security_hardening.sql) (Versión canónica v6.1)
  * [`docs/audits/QURIO_PHASE_11_3_FINAL_CERTIFICATION.md`](audits/QURIO_PHASE_11_3_FINAL_CERTIFICATION.md) (Informe canónico de certificación y congelamiento)

---

### Entrada 32: Corrección Puntual de Privacidad en Perfiles de Usuario (`user_profiles`)

* **Fecha:** 10 de Noviembre de 2026
* **Rama de Trabajo Autorizada:** `feat/phase-11-pilot-readiness` (estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Resolver la exposición pública innecesaria de la tabla `public.user_profiles`, eliminando la política permisiva `Public Read Profiles` (`USING (true)`) y la concesión indiscriminada de `SELECT` al rol `anon`, restringiendo la lectura exclusivamente al propio perfil del usuario autenticado (`auth.uid() = id`) y blindando todas las columnas sensibles contra modificación indebida.
* **Actividades y Logros Clave:**
  1. **Auditoría de Consumidores y Superficie Social:**
     * Se inspeccionó exhaustivamente el frontend React y backend FastAPI confirmando que Qurio **no cuenta ni requiere actualmente tablas de clasificación (rankings), directorios de estudiantes ni perfiles públicos de otros usuarios**.
     * Por directriz estricta de diseño mínimo, **no se crearon vistas públicas innecesarias**, manteniendo la superficie de ataque al mínimo absoluto.
  2. **Endurecimiento RLS y CLS en `user_profiles` (`03_security_hardening.sql` v6.2 y `rollback_security_hardening.sql` v4.2):**
     * Eliminación de la política `Public Read Profiles`.
     * Creación de la política de aislamiento estricto `User Read Own Profile` con `USING (auth.uid() = id)`.
     * Revocación total de `SELECT` a `anon`: `anon` no dispone de ningún privilegio en `user_profiles`.
     * `authenticated` dispone de `GRANT SELECT ON TABLE public.user_profiles TO authenticated;`, filtrado obligatoriamente por la política RLS `auth.uid() = id`.
     * Mantenimiento de la política `User Update Own Profile` con `USING (auth.uid() = id)`.
     * Mantenimiento de permisos de actualización restringidos por columna (CLS): `authenticated` únicamente puede modificar `display_name`, `avatar_url`, `bio` y `updated_at`. Modificaciones sobre `xp`, `level`, `current_streak_days`, `max_streak_days`, `username` o `id` son denegadas inmediatamente por PostgreSQL (`InsufficientPrivilegeError`).
  3. **Certificación Automatizada en PostgreSQL Real (`test_supabase_migration.py`):**
     * Incorporada la prueba integral `test_user_profiles_privacy_strict_rls_and_cls`:
       * `anon` intentando `SELECT` falla con `InsufficientPrivilegeError`.
       * Usuario A consultando su propio perfil obtiene 1 fila con sus datos correctos.
       * Usuario A consultando el perfil de usuario B (`WHERE id = user_B`) obtiene 0 filas (filtrado por RLS).
       * Usuario A ejecutando `SELECT * FROM user_profiles` obtiene únicamente su propia fila (1 tupla), nunca tuplas ajenas.
       * Usuario A intentando actualizar a usuario B afecta 0 filas (`UPDATE 0`).
       * Usuario A actualizando sus campos visuales propios afecta 1 fila exitosamente (`UPDATE 1`).
       * Usuario A intentando actualizar `xp`, `level`, `current_streak_days`, `max_streak_days`, `username` o `id` falla con `InsufficientPrivilegeError`.
       * `pg_policies` confirma la inexistencia de `Public Read Profiles` y la vigencia de `User Read Own Profile`.
       * Catálogos educativos (`learning_paths`, `modules`, `lessons`, `exercises`, etc.) verificados plenamente accesibles sin regresiones.
  4. **Baterías Consolidadas:**
     * Pytest backend: **82/82 pruebas pasadas** (64.46s).
     * Vitest frontend: **17/17 pruebas pasadas** (873ms).
     * Compilación de producción Vite: **2,171 módulos transformados limpiamente (0 errores)** en 5.63s.
     * E2E en Navegador Real Google Chrome: **19/19 flujos pasados** (22.80s).
     * Auditoría npm: **0 vulnerabilidades**.
* **Entregables:**
  * [`database/supabase/03_security_hardening.sql`](../database/supabase/03_security_hardening.sql) (Versión canónica v6.2)
  * [`database/supabase/rollback_security_hardening.sql`](../database/supabase/rollback_security_hardening.sql) (Versión definitiva v4.2)
  * [`apps/api/tests/test_supabase_migration.py`](../apps/api/tests/test_supabase_migration.py) (Suite ampliada a 16 pruebas)

---

### Entrada 33: Onboarding Dinámico de Invitados, Corrección de Logout y Aplicación en Supabase Cloud

* **Fecha:** 10 de Noviembre de 2026
* **Rama de Trabajo:** `feat/phase-11-pilot-readiness` (estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Implementar la experiencia de bienvenida para usuarios no registrados en el Dashboard, corregir la persistencia del nombre en el logout y registrar la aplicación efectiva del hardening v6.2 en Supabase Cloud.
* **Actividades y Logros Clave:**
  1. **Corrección del Fallback en Cierre de Sesión:**
     * Se eliminó el string estático `'Erick'` en `apps/web/src/App.tsx#L717`.
     * Para usuarios autenticados: saludo dinámico con `profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Estudiante'`.
  2. **Hero Banner Dinámico de Invitados (Alternativa A Implementada):**
     * Al navegar como invitado o tras cerrar sesión, el Hero Banner superior se transforma de manera inmediata y sin fricciones:
       * **Badge:** `● MODO INVITADO • PRUEBA ACTIVA (3 RETOS GRATUITOS)` en verde esmeralda con `animate-pulse`.
       * **Título:** `¡Bienvenido a Qurio! Aprende SQL pensando en queries.`
       * **Descripción:** Información transparente sobre la conexión al motor PostgreSQL 16 real en Docker y los 3 retos interactivos sin registro.
       * **Acciones:** Botón primario `Comenzar Reto 1 ⌘↵` y botón secundario `Iniciar Sesión`.
     * **Métricas Bento Adaptadas a Invitado:** Indican de forma auténtica `Invitado (Modo Explorador)`, `0 XP Oficial`, `0 días` y `X / 3 Retos de Prueba`, eliminando números mock ficticios.
  3. **Hito de Infraestructura: Aplicación Exitosa de Hardening en Supabase Cloud:**
     * El usuario confirmó la ejecución directa de `database/supabase/03_security_hardening.sql` (v6.2) en el SQL Editor de Supabase Cloud (`bfvgqxfzftumwrleacof`).
     * Con esta aplicación administrativa, las medidas de RLS, CLS, revocación de escrituras de clientes, blindaje de `solution_query`, revocación de secuencias y la RPC autoritativa de XP v6.2 se encuentran plenamente operativas en producción en la nube.
     * La restricción operativa externa queda formalmente resuelta.
  4. **Validación de Frontend:**
     * Vitest: **17/17 pruebas pasadas** (959ms).
     * Build de producción: **2,171 módulos transformados limpiamente (0 errores)** en 5.61s.
     * Servidor de desarrollo con recarga en caliente (HMR) activo en `http://localhost:5173/`.


---

### Entrada 34: Configuración de Entorno VS Code para Pylance y Corrección de Ergonomía Visual en Botones del Hero Banner

* **Fecha:** 10 de Noviembre de 2026
* **Rama de Trabajo:** `feat/phase-11-pilot-readiness` (estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Resolver el diagnóstico de Pylance `reportMissingImports: "fastapi"` en `apps/api/app/modules/runner/router.py` y solucionar el defecto de empaquetamiento y salto de línea ("amontonamiento") en los botones del Hero Banner de invitados.
* **Actividades y Logros Clave:**
  1. **Configuración de Entorno VS Code / Pylance (`.vscode/settings.json`):**
     * **Causa raíz:** El workspace raíz de VS Code es `c:\Desarrollo\Qurio`, mientras que el entorno virtual de Python está aislado en `apps/api/.venv/`. Al no existir configuración de workspace, Pylance usaba el intérprete global y no resolvía dependencias como `fastapi`, `pydantic`, `sqlglot` o `asyncpg`.
     * **Solución:** Se creó `.vscode/settings.json` configurando `python.defaultInterpreterPath` hacia `${workspaceFolder}/apps/api/.venv/Scripts/python.exe` y añadiendo `${workspaceFolder}/apps/api` a `python.analysis.extraPaths` y `python.autoComplete.extraPaths`.
     * Se verificó compatibilidad con `.gitignore`, el cual ya permitía explícitamente `!.vscode/settings.json`.
  2. **Refactorización de Layout y Ergonomía de Botones (Atomic Design):**
     * **Causa raíz:** En `apps/web/src/components/atoms/Button/Button.tsx`, la clase base carecía de `whitespace-nowrap`, permitiendo que el navegador dividiera el texto del botón en múltiples líneas ("Comenzar\nReto 1" e "Iniciar\nSesión") cuando el contenedor lateral reducía su espacio horizontal disponible.
     * **Solución en Átomo `Button`:** Se añadió `whitespace-nowrap` a `baseStyles` y `shrink-0` al contenedor de atajo de teclado `<kbd>`, garantizando que ningún botón rompa su texto ni deforme su geometría.
     * **Ajuste en `App.tsx`:** Se aplicó `shrink-0` y `whitespace-nowrap` al bloque de telemetría de latencia (`Latencia Sandbox: 3.6ms (pg_stat_ready)`), se aumentó el espaciado entre botones (`gap-3`) y se ajustó el breakpoint de disposición lateral a `lg:flex-row` con `shrink-0`, otorgando holgura completa en pantallas medianas y de escritorio.
  3. **Verificación y Pruebas:**
     * **Compilación de producción Vite:** 2,171 módulos transformados limpiamente (0 errores) en 6.14s.
     * **Vitest frontend:** 17/17 pruebas pasadas en 950ms.
     * **Pytest backend:** Suites unitarias ejecutadas con éxito (0.05s).
     * **HMR Activo:** Los cambios se sincronizaron en caliente en el navegador en `http://localhost:5173/`.


---

### Entrada 35: Optimización de Identidad de Marca y Adaptación Responsiva del Sidebar Colapsable

* **Fecha:** 10 de Noviembre de 2026
* **Rama de Trabajo:** `feat/phase-11-pilot-readiness` (estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Resolver el dimensionamiento del isotipo y logotipo de la plataforma ("se ve muy pequeño") y corregir el recorte visual del logo al colapsar la barra lateral (`SidebarNav`).
* **Actividades y Logros Clave:**
  1. **Rediseño y Jerarquía del Isotipo y Nombre de Marca:**
     * Se aumentó el contenedor del isotipo SVG de `w-8 h-8` a `w-10 h-10` (40px) y el vector SVG de `w-5 h-5` a `w-6.5 h-6.5`, otorgando nitidez y presencia a las capas cilíndricas del modelo relacional y al núcleo verde esmeralda activo.
     * Se jerarquizó la tipografía del nombre "Qurio" de `text-sm font-bold` a `text-lg font-bold tracking-tight text-content-primary leading-none`.
     * Se optimizó la píldora indicadora `pg:16 sandbox` a `text-[10px] font-mono px-2 py-0.5` con micro-animación pulsante.
  2. **Resolución del Recorte al Colapsar (`isCollapsed`):**
     * **Causa raíz:** En la barra colapsada (ancho de 80px), el contenedor del encabezado aplicaba `p-4 flex items-center justify-between` con `overflow-hidden`. El espacio resultante (48px) no permitía alojar en una sola fila el isotipo (32px) y el botón de colapso/expansión (24px), cortando el borde derecho del logo.
     * **Solución arquitectónica:** Al estar colapsada (`isCollapsed: true`), el encabezado cambia dinámicamente a disposición en columna centrada (`py-3.5 px-2 flex flex-col items-center gap-2.5`). El isotipo queda perfectamente centrado en los 80px del sidebar y el botón de alternancia (`ChevronRight`) se ubica verticalmente debajo, eliminando todo desbordamiento o recorte.
  3. **Optimización de Ítems de Navegación en Estado Colapsado:**
     * En estado colapsado, los botones de navegación pasan de `w-full gap-3` a cuadrículas cuadradas ergonómicas `w-10 h-10 mx-auto justify-center rounded-lg` con iconos escalados a `w-5 h-5`, mejorando la accesibilidad táctil y visual.
  4. **Verificación y Estado:**
     * **Compilación de producción Vite:** 2,171 módulos transformados limpiamente (0 errores) en 8.00s.
     * **Vitest frontend:** 17/17 pruebas pasadas en 968ms.
     * **HMR:** Sincronizado en tiempo real en `http://localhost:5173/`.


---

### Entrada 36: Sincronización Integral de Métricas Auténticas: Racha Diaria, Actividad de 30 Días, Reto Inteligente y Desbloqueo Reactivo de Logros

* **Fecha:** 11 de Noviembre de 2026
* **Rama de Trabajo:** `feat/phase-11-pilot-readiness` (estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Eliminar todos los valores *mock*, fallbacks ficticios (`|| 2`, `|| 5`, `|| 480`) y datos cableados en la plataforma, convirtiendo el 100% de los contadores, gráficos de cadencia, retos recomendados y medallas en métricas autoritativas y dinámicas para usuarios registrados.
* **Actividades y Logros Clave:**
  1. **Motor Autoritativo de Racha y Actividad Diaria (`03_security_hardening.sql` v6.3):**
     * Se actualizó la función RPC `record_verified_attempt` para registrar atómicamente cada intento aprobado en `public.user_daily_activity (user_id, activity_date, exercises_solved, xp_earned)`.
     * Se implementó el cálculo matemático de rachas consecutivas: evalúa `MAX(activity_date) < CURRENT_DATE`. Si la última práctica fue ayer (`CURRENT_DATE - 1`), la racha se incrementa en 1; si ya practicó hoy, se preserva; si hubo más de 1 día de inactividad, se reinicia a 1.
     * Actualiza atómicamente `current_streak_days` y `max_streak_days = GREATEST(max_streak_days, current_streak_days)` en `public.user_profiles`.
  2. **Servicios de Persistencia en Frontend (`persistence.ts`):**
     * `getUserDailyActivity(userId)`: Consulta las actividades reales de los últimos 30 días calendario en `user_daily_activity`.
     * `getUserAttemptsHistory(userId, limit)`: Recupera los intentos reales registrados en `exercise_attempts` en la nube.
     * `getUserTotalAttemptsCount(userId)`: Obtiene el conteo exacto de consultas evaluadas por el usuario.
  3. **Dashboard 100% Funcional y Reto Recomendado Dinámico (`App.tsx`):**
     * En el Bento Grid: Se reemplazaron contadores volátiles por métricas auditadas (`Nivel ${profile.current_level}`, `${profile.total_xp} XP`, `${profile.current_streak_days} días`, y total histórico de consultas evaluadas).
     * El Reto Estrella Recomendado ya no apunta al ejercicio fijo `exercises[3]`; ahora calcula reactivamente el primer ejercicio pendiente del estudiante (`authoritativeCompletedIds`), guiando el aprendizaje progresivo paso a paso.
  4. **Perfil Auténtico y Cadencia de Práctica (`UserProfileView.tsx`):**
     * Eliminación de valores mock (`|| 2`, `|| 5`, `12 / 50`). Muestra retos completados reales sobre el total, racha actual y récord del perfil.
     * El Heatmap de 30 días mapea los últimos 30 días calendario reales cruzados con `user_daily_activity`, reflejando la intensidad y días exactos en que el estudiante practicó.
  5. **Evaluador Reactivo de Medallas (`AchievementsView.tsx` & `api.ts`):**
     * Se implementó `evaluateUserAchievements`: las medallas ya no tienen fechas predefinidas ni desbloqueos falsos; se evalúan en tiempo real frente a los retos resueltos, rachas de 3 y 7 días, y tiempo de ejecución.
  6. **Verificación y Pruebas:**
     * **Vitest frontend:** 21/21 pruebas unitarias pasadas limpiamente en 936ms (incluyendo `achievements.test.ts`).
     * **Compilación de producción Vite:** 2,171 módulos transformados limpiamente (0 errores) en 6.42s.
     * **Pytest backend:** 37 pruebas unitarias de seguridad y evaluación pasando en <0.2s.
     * **Recarga en Caliente (HMR):** Sincronizada automáticamente en `http://localhost:5173/`.


---

### Entrada 37: Resolución de Conectividad Service Role en Docker y Adición de Racha/XP en Workspace

* **Fecha:** 11 de Noviembre de 2026
* **Rama de Trabajo:** `feat/phase-11-pilot-readiness` (estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Resolver el desacoplamiento de certificación de XP oficial en el contenedor Docker de FastAPI y agregar el contador de racha y progreso de XP visible en la vista del Workspace de ejercicios.
* **Actividades y Logros Clave:**
  1. **Diagnóstico de XP no Acreditado (70 XP en Dashboard):**
     * **Causa raíz:** Al inspeccionar los logs del contenedor `qurio-api` en Docker, se identificó la advertencia: `[WARNING] app.core.supabase: SUPABASE_SERVICE_ROLE_KEY no configurado en backend. Activando modo contingencia (0 XP oficial persistido)`.
     * El archivo `docker-compose.yml` no cargaba `env_file: ./apps/api/.env`, por lo que el contenedor no recibía las credenciales administrativas de Supabase. El backend evaluaba correctamente el SQL en el Sandbox pero entraba en modo de contingencia, no ejecutaba la RPC en Supabase y el perfil del usuario permanecía con sus 70 XP previos en la nube.
     * **Solución:** Se añadió `env_file: - ./apps/api/.env` al servicio `api` en `docker-compose.yml` y se recreó el contenedor (`docker compose up -d api`). Al iniciar, `qurio-api` cargó exitosamente las credenciales de Supabase eliminando la contingencia.
  2. **Contador de Racha y XP en el Workspace de Ejercicios (`App.tsx`):**
     * Se integró la molécula `StreakPill` en la barra superior de `WorkspaceLayout`, mostrando la llama ámbar activa y los días de racha consecutivos certificados del usuario.
     * Se añadió un indicador de XP en vivo (`total_xp ?? 0 XP`) junto al avatar del estudiante en la cabecera del editor, permitiendo ver el incremento del progreso sin salir del ejercicio.
  3. **Verificación y Pruebas:**
     * **Compilación Vite:** 2,171 módulos transformados limpiamente en 5.70s.
     * **Vitest frontend:** 21/21 pruebas unitarias pasando.
     * **Graphify:** Grafo de conocimiento actualizado (2090 nodos, 3331 aristas).


---

### Entrada 38: Restauración de Metadatos Pedagógicos (Guía Didáctica de Conceptos y Checklist de Objetivos)

* **Fecha:** 11 de Noviembre de 2026
* **Rama de Trabajo:** `feat/phase-11-pilot-readiness` (estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Resolver la ausencia de la guía didáctica explicativa (`concept`) y del checklist interactivo de objetivos (`objectives`) en el panel lateral de especificación del ejercicio (`ExerciseSpecPanel`).
* **Actividades y Logros Clave:**
  1. **Diagnóstico de Causa Raíz:**
     * Al consultar la lista o detalle de ejercicios desde FastAPI (`/api/v1/exercises`), el repositorio `ExerciseRepository` consultaba Supabase Cloud vía REST. Como la tabla relacional `public.exercises` solo almacena las columnas canónicas de la base de datos (`id`, `title`, `prompt`, `initial_code`, `solution_query`, `xp_reward`, etc.), los campos pedagógicos `concept`, `objectives`, `sample_tables` y `hints` no venían en la respuesta de Supabase y se instanciaban como `None`.
     * El frontend recibía estos objetos sin metadatos y reemplazaba el catálogo con la respuesta incompleta, haciendo que la tarjeta didáctica y el checklist no se renderizaran.
  2. **Resolución y Fusión de Metadatos Didácticos (Backend & Frontend):**
     * **En Backend (`repository.py`):** Se modificó `get_internal_for_evaluation` y `list_all` para que, tras consultar Supabase, combine e inyecte automáticamente los metadatos enriquecidos de `self._cache` (`concept`, `objectives`, `sample_tables`, `hints`) a cada DTO público.
     * **En Frontend (`api.ts`):** En `getExercises()` y `getExercise()`, se garantizó la fusión defensiva con `FALLBACK_EXERCISES`, asegurando que el contenido pedagógico completo nunca se degrade ni desaparezca ante ninguna respuesta parcial de red.
  3. **Verificación y Estado:**
     * Verificación HTTP directa contra `http://localhost:8000/api/v1/exercises`: confirmación de `Has concept: True` y `Has objectives: True` (3 objetivos).
     * Compilación de producción Vite: 2,171 módulos transformados limpiamente en 5.91s.
     * Vitest: 21/21 pruebas unitarias pasando.

---

### Entrada 39: Sincronización Autoritativa del Currículum Completo (12 Módulos, 50 Ejercicios y 112 Pistas en Supabase Cloud) e Historial Interactivo

* **Fecha:** 11 de Noviembre de 2026
* **Rama de Trabajo:** `feat/phase-11-pilot-readiness` (estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Sincronizar el catálogo completo de 50 ejercicios, 12 módulos y 112 pistas en Supabase Cloud resolviendo el desfasaje del syllabus (que solo mostraba 17/18 retos), habilitar las funciones interactivas del historial de consultas en el perfil (copiado y carga en Playground), y garantizar la coherencia pedagógica de extremo a extremo.
* **Actividades y Logros Clave:**
  1. **Diagnóstico del Desfase Curricular (Syllabus con 17/18 Ejercicios):**
     * **Causa raíz:** En la fase temprana del proyecto, la base de datos de producción en Supabase Cloud se había inicializado únicamente con un lote inicial de 18 ejercicios y 11 módulos preliminares. Al solicitar los ejercicios el backend (`/api/v1/exercises`), consultaba Supabase y devolvía únicamente esos 18 ejercicios, por lo que la vista del Syllabus contabilizaba 8 en *SQL Foundations*, 5 en *Relational SQL* y 5 en *Advanced Queries*.
     * Adicionalmente, el esquema de módulos previo tenía desalineado el Módulo 8 (ubicado antes erróneamente en `advanced-queries`), lo que causaba violaciones de clave foránea al intentar insertar los 50 ejercicios que contemplan el Módulo 8 como `relational-sql` (*Operaciones de Conjunto y Joins Especiales*).
  2. **Migración y Sincronización Integral en Supabase Cloud (`sync_supabase_curriculum.py`):**
     * Se desvincularon los ejercicios temporales sin intentos de Track 3 para permitir la reorganización estructural de la tabla `public.modules`.
     * Se reestructuraron y validaron los 12 módulos oficiales exactos:
       * Módulos 1 a 4: *SQL Foundations* (`a000...001` a `a000...004`).
       * Módulos 5 a 8: *Relational SQL* (`b000...005` a `b000...008`).
       * Módulos 9 a 12: *Advanced Queries* (`c000...009` a `c000...012`).
     * Se sincronizaron en lotes transaccionales los **50 ejercicios oficiales** completos con sus consignas, soluciones SQL y recompensas de XP.
     * Se sincronizaron las **112 pistas progresivas** (`exercise_hints`) con control de unicidad (`on_conflict=exercise_id,hint_order`).
  3. **Historial de Consultas Interactivo en el Perfil (`UserProfileView.tsx` & `SqlPlaygroundView.tsx`):**
     * **Botón de Copiado de Código:** Permite copiar la consulta SQL al portapapeles con feedback visual en verde esmeralda ("Copiado").
     * **Acción "Abrir en Playground":** Pasa la consulta seleccionada al estado global de la aplicación (`playgroundInitialQuery`), navega a la vista de SQL Playground e inyecta la consulta directamente en Monaco Editor para su ejecución o modificación libre.
     * **Acordeón Desplegable:** Permite expandir cualquier fila para visualizar la consulta completa formateada en un bloque de código tipográfico en `JetBrains Mono`.
  4. **Blindaje Defensivo de Metadatos Didácticos (`repository.py`):**
     * Se reforzó la fusión en `ExerciseRepository` (`list_all` y `get_internal_for_evaluation`) para asegurar que si un atributo pedagógico (`concept`, `objectives`, `sample_tables`, `hints`) viniese ausente o `None` desde la nube, se inyecte irrevocablemente desde el catálogo enriquecido en memoria.
  5. **Verificación y Pruebas:**
     * **Verificación REST Supabase Cloud:** 12 módulos confirmados, 50 ejercicios confirmados.
     * **Verificación FastAPI (`/exercises`):** 50 ejercicios retornados con `concept: True` y checklist de objetivos intacto.
     * **Syllabus Web (`http://localhost:5173/`):**
       * *SQL Foundations*: 22 ejercicios (M1: 4, M2: 6, M3: 4, M4: 8).
       * *Relational SQL*: 18 ejercicios (M5: 5, M6: 5, M7: 4, M8: 4).
       * *Advanced Queries*: 10 ejercicios (M9: 3, M10: 2, M11: 2, M12: 3).
       * Total: **50 ejercicios** sincronizados y accesibles.
     * **Vitest Frontend:** 21/21 pruebas unitarias pasando limpiamente en 1.03s.
     * **Build de Producción Vite:** 2,171 módulos transformados limpiamente en 5.77s (0 errores).
     * **Grafo de Conocimiento (Graphify):** 2,097 nodos y 3,398 aristas actualizados en `graphify-out/`.

---

### Entrada 40: Experiencia de Onboarding de Invitados (Modal de Celebración & Conversión) y Alineación del Trial

* **Fecha:** 11 de Noviembre de 2026
* **Rama de Trabajo:** `feat/phase-11-pilot-readiness` (estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Resolver el bloqueo del modo invitado en el segundo ejercicio, eliminar el mensaje de error de base de datos sustituyéndolo por un flujo de conversión amigable, implementar el componente `GuestTrialCompleteModal` al superar los 3 retos iniciales de prueba y consolidar las acciones interactivas del historial de consultas (copiado y carga en Playground).
* **Actividades y Logros Clave:**
  1. **Alineación de Retos de Prueba en Backend (`router.py`):**
     * **Causa raíz:** `GUEST_TRIAL_EXERCISE_IDS` contenía cableados los IDs `...0001`, `...0002`, `...0003`. En el currículum ordenado por `sort_order`, el Reto 2 es `e...0008` (*Cálculo de Precios con IVA*) y el Reto 3 es `e...0019` (*Concatenación de Nombre Completo*). Por ende, el backend rechazaba el Reto 2 como si estuviese fuera del trial.
     * **Solución:** Se sincronizó `GUEST_TRIAL_EXERCISE_IDS` con los 3 ejercicios reales del Módulo 1 (`e...0001`, `e...0008`, `e...0019`), permitiendo a cualquier invitado completar la secuencia pedagógica inicial.
  2. **Supresión del Error Rojo de Base de Datos (`api.ts` & `App.tsx`):**
     * En `api.submitSolution`, si el backend responde con `HTTP 401 (REGISTRATION_REQUIRED_AFTER_TRIAL)`, ya no se captura como fallo de ejecución (`status: 'ERROR'`).
     * Se emite el estado semántico `status: 'AUTH_REQUIRED'`, el cual intercepta el flujo en `App.tsx` y despliega limpiamente el modal de registro sin pintar alertas rojas de fallo en la cuadrícula de resultados.
  3. **Molécula `GuestTrialCompleteModal` (`GuestTrialCompleteModal.tsx`):**
     * Creado bajo Atomic Design Pragmático con tokens de *Terminal Glow Minimal*:
       * Micro-tiles con recuento de retos superados (3/3) y XP ganado (+100 XP resguardado localmente).
       * Mensaje de propuesta de valor destacando la transferencia automática de XP a Supabase Cloud al registrarse.
       * Botón CTA prioritario `"Crear Cuenta Gratuita"` (abre `AuthModal` en modo `signup`) y enlace secundario `"Iniciar Sesión"`.
  4. **Activación Reactiva en `App.tsx`:**
     * Se despliega automáticamente al resolver con éxito el 3er reto del trial.
     * Se despliega al pulsar *"Siguiente Reto"* tras finalizar la prueba.
     * Se activa preventivamente si el invitado intenta ejecutar un reto del currículum completo (Reto 4 en adelante).
  5. **Verificación y Pruebas:**
     * **Vitest Frontend:** 21/21 pruebas unitarias pasando en 956ms.
     * **Build de Producción Vite:** 2,172 módulos transformados limpiamente en 5.68s (0 errores).
     * **Pytest Backend:** 20 pruebas unitarias en 0.09s y 19 pruebas de integración en 9.40s pasando al 100%.
     * **Grafo de Conocimiento (Graphify):** 2,101 nodos y 3,418 aristas actualizados.

---

### Entrada 41: Centro de Avance Continuo en Dashboard — Módulo Hero Unificado "Continuar tu Ruta" (Opción 1)

* **Fecha:** 11 de Noviembre de 2026
* **Rama de Trabajo:** `feat/phase-11-pilot-readiness` (estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Implementar la Opción 1 en el Dashboard principal para usuarios autenticados, transformando el banner superior en un centro de comando dinámico que presenta la ruta activa, el número y nombre del reto pendiente por concluir, barra de progreso interactiva con porcentaje y acción directa de reanudación.
* **Actividades y Logros Clave:**
  1. **Motor Reactivo de Posición Curricular (`activeLearningData` en `App.tsx`):**
     * Determina automáticamente la ruta activa (`activeTrack`) a partir del primer reto pendiente del usuario (`authoritativeCompletedIds`).
     * Calcula dinámicamente el módulo activo (`activeModule`), el número secuencial del reto dentro de la ruta (`Reto #3 de 22`), el total de retos completados en dicha ruta (`trackCompleted`), el total de la ruta (`trackTotal`) y el porcentaje de avance (`trackPercent`).
     * Identifica los retos restantes para culminar el módulo actual (`moduleRemaining`), ofreciendo micro-metas pedagógicas claras.
  2. **Banner Hero Unificado para Usuarios Autenticados:**
     * **Píldora de Contexto:** `Ruta Activa • SQL Foundations • Módulo 1: SELECT & Proyecciones de Datos` con indicador pulsante esmeralda y latencia del PostgreSQL 16 Sandbox.
     * **Siguiente Desafío en Foco:** Título destacado en tipografía `JetBrains Mono`: `Reto #3: Concatenación de Nombre Completo` con insignias de XP (`+35 XP`) y dificultad (`Principiante`), acompañado por el resumen de la consigna de negocio.
     * **Barra de Progreso Viva:** Barra gráfica con resplandor cian/esmeralda (`shadow-[0_0_12px_rgba(56,189,248,0.4)]`), porcentaje numérico en tiempo real (`14%`) y texto de apoyo: `3 de 22 retos superados`.
     * **Micro-meta y Métricas Globales:** Notificación contextual de avance en módulo (`Faltan 2 retos para culminar este módulo`) junto al avance global del currículum (`3 / 50 — 6%`).
     * **Acciones Directas:**
       * Botón primario: `"Continuar Reto #3"` con atajo de teclado (`⌘↵`) que navega directamente a la URL canónica del reto pendiente sin fricciones intermedias.
       * Botón secundario: `"Ver Syllabus Completo"` para inspeccionar la malla curricular.
  3. **Verificación y Pruebas:**
     * **Vitest Frontend:** 21/21 pruebas unitarias pasando al 100% en 1.09s.
     * **Build de Producción Vite:** 2,172 módulos transformados limpiamente en 5.61s (0 errores).
     * **Grafo de Conocimiento (Graphify):** 2,102 nodos y 3,421 aristas actualizados.


---

### Entrada 42: Certificación de Coherencia Curricular (50 Retos) y Restauración Definitiva de Guía y Objetivos

* **Fecha:** 11 de Noviembre de 2026
* **Rama de Trabajo:** `feat/phase-11-pilot-readiness` (estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Auditar, certificar y documentar la resolución integral de las dos anomalías visuales reportadas:
  1. *Ausencia de Guía Didáctica y Checklist de Objetivos en "Catálogo Básico de Productos":* Diagnóstico y verificación del enriquecimiento pedagógico tras el reinicio del contenedor `qurio-api`.
  2. *Recuento de Ejercicios en el Syllabus (3/8, 0/5, 0/4):* Diagnóstico del desfasaje del build previo (17 retos) frente a la sincronización oficial de 50 retos en Supabase Cloud y el frontend.
* **Actividades y Logros Clave:**
  1. **Diagnóstico y Solución de la Guía Didáctica (Captura 1):**
     * **Causa raíz:** Las tablas en Supabase Cloud (`public.exercises`) almacenan únicamente las columnas relacionales estándar (`id`, `title`, `prompt`, `solution_query`, etc.), sin las columnas `concept` ni `objectives`. Aunque el enriquecimiento en memoria se había programado en `repository.py`, el contenedor Docker `qurio-api` se encontraba activo desde hacía más de 2 horas sin `--reload`, devolviendo objetos con `concept=None` y `objectives=None`. Además, la versión anterior de `api.ts` reemplazaba el catálogo local con la respuesta cruda de red sin fusionar los metadatos.
     * **Acción ejecutada:** Se aplicó la fusión defensiva bidireccional tanto en backend (`ExerciseRepository.list_all` y `get_internal_for_evaluation`) como en frontend (`api.getExercises` y `api.getExercise`). Se reinició el contenedor Docker (`docker restart qurio-api`).
     * **Verificación:** Invocación a `http://localhost:8000/api/v1/exercises`: los 50 ejercicios devuelven `concept` (`summary`, `syntax`, `key_points`, `execution_order_note`) y el checklist interactivo de `objectives` al 100%.
  2. **Diagnóstico y Solución del Conteo Curricular (Captura 2):**
     * **Causa raíz:** En la captura previa, el navegador del usuario mostraba la versión anterior de la malla curricular con 17 ejercicios (8 en *SQL Foundations*, 5 en *Relational SQL*, 4 en *Advanced Queries*).
     * **Acción ejecutada:** Tras la ejecución del script de sincronización en Supabase Cloud (`sync_supabase_curriculum.py`) y la actualización de `FALLBACK_TRACKS`, la distribución oficial es:
       * *Ruta 1 (SQL Foundations):* 22 ejercicios (M1: 4, M2: 6, M3: 4, M4: 8).
       * *Ruta 2 (Relational SQL):* 18 ejercicios (M5: 5, M6: 5, M7: 4, M8: 4).
       * *Ruta 3 (Advanced Queries):* 10 ejercicios (M9: 3, M10: 2, M11: 2, M12: 3).
       * **Total exacto:** 50 ejercicios (3/22 completados = 14% para `erickbonillamx@gmail.com`).
  3. **Pruebas de Integridad Automatizadas (`progress.test.ts`):**
     * Se añadió una suite de verificación de consistencia que comprueba que los 50 ejercicios posean `concept` no nulo, lista de `objectives` no vacía y que las rutas totalicen matemáticamente 50 ejercicios (22 + 18 + 10).
  4. **Verificación y Estado:**
     * **Vitest Frontend:** 22/22 pruebas unitarias pasando al 100% en 0.79s.
     * **Pytest Backend:** 82/82 pruebas de seguridad, integración y evaluación pasando al 100% en 64.15s.
     * **Build de Producción Vite:** 2,172 módulos transformados limpiamente en 5.70s (0 errores).
     * **Grafo de Conocimiento (Graphify):** Sincronizado (2,103 nodos, 3,425 aristas).


---

### Entrada 43: Humanización Pedagógica del Currículum (Paso A — Reescritura Empática de Retos Iniciales)

* **Fecha:** 12 de Noviembre de 2026
* **Rama de Trabajo:** `feat/phase-11-pilot-readiness` (estrictamente local; Zero Push / Zero Merge).
* **Objetivo:** Transformar el lenguaje técnico y formal de los primeros 5 ejercicios del currículum (incluyendo los 3 retos del Trial de Invitados) sustituyendo la jerga de ingeniería y burocracia corporativa por consignas empáticas, intuitivas y orientadas a la acción, reduciendo el riesgo de abandono en principiantes.
* **Actividades y Logros Clave:**
  1. **Reescritura Pedagógica de los Retos 1 al 5 (`seed_data.py` y `api.ts`):**
     * **Reto 1 (SELECT):** Se cambió *"proyectar relación en el buffer"* por la metáfora de seleccionar columnas visibles como en una hoja de cálculo.
     * **Reto 2 (Cálculos & Alias):** Se transformó *"expresiones aritméticas y artefactos de punto flotante"* en cuentas matemáticas al vuelo con alias claros (`precio_con_iva`).
     * **Reto 3 (Concatenación):** Se reemplazó *"operador de tubería doble y tipo VARCHAR"* por la explicación intuitiva de unir texto con `||`.
     * **Reto 4 (DISTINCT):** Se reformuló como el *"filtro quitaduplicados"* de ciudades de clientes.
     * **Reto 5 (WHERE):** Se presentó como la regla o condición que pide a la base de datos solo las filas que cumplen un criterio.
  2. **Precedencia Defensiva del Prompt Enriquecido:**
     * En `ExerciseRepository` (`repository.py`) y en `api.ts`, se configuró la precedencia de `prompt` para que la redacción pedagógica local prevalezca inmediatamente en la UI sin depender de sincronizaciones remotas a Supabase.
  3. **Alineación de Semilla SQL (`02_seed_curriculum.sql`):**
     * Sincronizados los prompts de los ejercicios 1, 8, 19, 20 y 2 en el script oficial de semillas de PostgreSQL.
  4. **Verificación y Pruebas:**
     * **Vitest Frontend:** 22/22 pruebas unitarias pasando al 100% en 1.05s.
     * **Build de Producción Vite:** 2,172 módulos transformados limpiamente en 6.47s (0 errores).
     * **Pytest Backend:** 40/40 pruebas unitarias pasando al 100% en 0.16s.


---

### Entrada 44: Fase 1 — Humanización Pedagógica Integral (50 Retos) y Objetivos Libres de Spoilers

* **Fecha:** 12 de Noviembre de 2026
* **Rama de Trabajo:** `feat/pedagogical-refinement-and-solution-reveal`
* **Objetivo:** Desplegar la reescritura pedagógica completa en los 50 ejercicios del currículum de Qurio (Rutas 1, 2 y 3) y depurar el checklist interactivo de objetivos para eliminar cualquier fragmento o spoiler de código SQL, transformándolos estrictamente en metas y criterios de éxito funcionales.
* **Actividades y Logros Clave:**
  1. **Creación de Rama de Características:**
     * Creada y publicada en GitHub la rama `feat/pedagogical-refinement-and-solution-reveal`.
  2. **Actualización de los 50 Ejercicios en Backend (`seed_data.py`):**
     * Sustituida la jerga abstracta (tuplas, buffers, productos cartesianos) por consignas de negocio cotidianas y claras.
     * Integrados conceptos intuitivos (analogías de hoja de cálculo, quitaduplicados, ausencias con `LEFT JOIN`, etc.) y notas de nivel 2 (*"Bajo el capó"*).
  3. **Depuración Estricta de Objetivos (Anti-Spoilers):**
     * Eliminadas todas las palabras clave SQL (`WHERE`, `SELECT`, `FROM`, `JOIN`, fórmulas numéricas explícitas) de los checklists interactivos.
     * Los objetivos ahora evalúan el entendimiento del requerimiento (ej. *"Aislar a los clientes que no registran ninguna actividad de compra"* en vez de *"Filtrar con WHERE p.pedido_id IS NULL"*).
  4. **Sincronización Total en Frontend y Base de Datos:**
     * `apps/web/src/lib/api.ts`: Actualizados los 50 ejercicios en el catálogo `FALLBACK_EXERCISES`.
     * `database/supabase/02_seed_curriculum.sql`: Sincronizadas las sentencias `INSERT` para que el catálogo de producción coincida exactamente.
  5. **Verificación y Pruebas:**
     * **Vitest Frontend:** 22/22 pruebas unitarias pasando al 100% en 1.00s.
     * **Pytest Backend:** 40/40 pruebas unitarias pasando al 100% en 0.12s.
     * **Build de Producción Vite:** 2,172 módulos transformados sin errores en 5.36s.
     * **Grafo de Conocimiento (Graphify):** 2,180 nodos, 3,506 aristas y 155 comunidades actualizados.
