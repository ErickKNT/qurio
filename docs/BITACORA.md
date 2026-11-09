# Bitácora de Desarrollo — Qurio

Este documento registra cronológicamente las fases, decisiones arquitectónicas, artefactos entregados y el estado operativo del proyecto **Qurio**. **Debe actualizarse obligatoriamente al concluir cada hito o cambio de fase.**

---

## 1. Estado Actual del Proyecto

* **Fase Actual:** **Soporte de Tema Claro/Oscuro y Documentación GitHub (`feat/theme-support-and-readme`) — Concluida (MVP 1.0 Pulido)**  
* **Próxima Fase:** **Operación, Despliegue en la Nube y Expansión de Catálogo**  
* **Rama Git Activa:** `feat/theme-support-and-readme` (en proceso de merge a `main` y push a GitHub)  
* **Infraestructura Activa:**
  * Contenedor Docker `qurio-postgres-sandbox` corriendo en `localhost:5433` (saludable y verificado).
  * API FastAPI corriendo en `http://localhost:8000` con pool `asyncpg` y evaluador semántico (26/26 tests pasando).
  * Frontend React 18 + Vite corriendo en `http://localhost:5173` con soporte dinámico de tema claro/oscuro, Monaco Editor con temas `qurio-dark`/`qurio-light` y DataGrid (Build de producción 100% verificado).
  * Proyecto Supabase en la nube con esquemas DDL `01_schema.sql` y catálogo semilla `02_seed_curriculum.sql` desplegados.
  * Documentación completa `README.md` en la raíz del repositorio.

---

## 2. Tablero de Control de Fases

| Fase | Nombre | Estado | Rama Git | Hito Entregado |
| :---: | :--- | :---: | :---: | :--- |
| **0** | **Definición y Especificación** | ✅ Concluida | `main` | Declaración de intención, PRD, SAD, Sistema de Diseño y Reglas. |
| **1** | **Cimientos de Datos & Docker** | ✅ Concluida | `feat/database-and-docker-infra` | Sandbox PostgreSQL aislado, dataset de 10 tablas, esquemas Supabase y docker-compose. |
| **2** | **Motor de Ejecución y Evaluación** | ✅ Concluida | `feat/fastapi-runner-evaluator` | API FastAPI, pool seguro con asyncpg, evaluador semántico y 26 tests automatizados. |
| **3** | **Frontend Base & Atomic Design** | ✅ Concluida | `feat/web-atomic-design` | React + Vite + Tailwind, árbol de componentes (átomos/moléculas/organismos/plantillas), auth y build validado. |
| **4** | **Flujo Principal End-to-End** | ✅ Concluida | `feat/exercise-ide-flow` | Monaco Editor, DataGrid tabular con tipos de datos, especificación del ejercicio con pistas, cliente API FastAPI y modal de recompensa XP. |
| **5** | **Catálogo, Playground & Gamificación** | ✅ Concluida | `feat/curriculum-and-gamification` | Rutas con syllabus interactivo, SQL Playground libre con explorador de esquemas, Logros con filtros y Mi Perfil con mapa de calor. |
| **6** | **Autenticidad, Calidad & Despliegue** | ✅ Concluida | `feat/authenticity-and-polish` | 404 temática SQL, favicon SVG propio, metadatos OG, adaptabilidad móvil y transparencia de contacto. |
| **+** | **Temas (Claro/Oscuro) & README** | ✅ Concluida | `feat/theme-support-and-readme` | Tokens Tailwind CSS dinámicos, toggle sol/luna, temas Monaco reactivos y README.md exhaustivo. |

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

### [2026-11-08] — Entrada 10: Fase 4 — Flujo End-to-End del Ejercicio (IDE, Monaco & Evaluación)
* **Rama:** `feat/exercise-ide-flow`
* **Entregables de Flujo de Interacción:**
  * **Integración de Monaco Editor:**
    * Componente organismo [`MonacoEditorPanel`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/MonacoEditorPanel/MonacoEditorPanel.tsx) con tema oscuro oficial `qurio-dark` (fondo `#0B1020`, cursor cyan `#38BDF8`, keywords cyan, strings esmeralda, números ámbar).
    * Tipografía `JetBrains Mono` con numeración limpia y padding técnico.
    * Atajo de teclado nativo `⌘ + Enter` / `Ctrl + Enter` mapeado directamente a la función de ejecución/envío.
    * Barra de herramientas con formateador automático de palabras reservadas SQL y restablecimiento de código.
  * **Visualizador Tabular de Resultados de Alta Fidelidad:**
    * Componente organismo [`DataGridResults`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/DataGridResults/DataGridResults.tsx).
    * Cabeceras con nombre de columna y tipo de dato inferido (`VARCHAR`, `INT`, `DECIMAL`) en `JetBrains Mono`.
    * Celdas de datos con gutters numerados, formateo condicional de valores numéricos, booleanos y chips tenues cursivos para `NULL`.
    * Visualizador descriptivo de discrepancias semánticas (`DiffResult`) cuando la consulta del estudiante difiere de la solución esperada.
    * Mensajes de error del motor de base de datos o bloqueos de seguridad del sandbox presentados en caja de terminal inline (cero alertas del navegador).
  * **Panel de Especificación y Pistas Progresivas:**
    * Componente organismo [`ExerciseSpecPanel`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/ExerciseSpecPanel/ExerciseSpecPanel.tsx).
    * Enunciado narrativo y objetivos técnicos del reto.
    * Acordeón interactivo con el esquema relacional (`clientes`, `pedidos`, `productos`, `categorias`).
    * Sistema de pistas progresivas con cálculo y visualización transparente de penalización de XP (-15% por pista).
  * **Modal de Recompensa y Avance:**
    * Componente molécula [`SuccessModal`](file:///c:/Desarrollo/Qurio/apps/web/src/components/molecules/SuccessModal/SuccessModal.tsx).
    * Notificación instantánea de reto superado, medalla esmeralda, XP ganado, tiempo de ejecución en sandbox y botón de avance inmediato al siguiente reto del currículum.
  * **Cliente de Integración API:**
    * Módulo [`apps/web/src/lib/api.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/api.ts) conectando el frontend con los endpoints de FastAPI (`POST /api/v1/exercises/{id}/submit`, `POST /api/v1/playground/execute`, `GET /api/v1/exercises`, `GET /api/v1/health`).
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
    * Componente molécula [`TrackCard`](file:///c:/Desarrollo/Qurio/apps/web/src/components/molecules/TrackCard/TrackCard.tsx): tarjetas de rutas (*SQL Foundations*, *Relational SQL*, *Advanced Queries*) con porcentaje de completitud, horas estimadas y badges.
    * Componente molécula [`ModuleAccordion`](file:///c:/Desarrollo/Qurio/apps/web/src/components/molecules/ModuleAccordion/ModuleAccordion.tsx): módulos colapsables con listado de retos, estados de resolución, dificultad y botón de acción directa.
    * Componente organismo [`TracksView`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/TracksView/TracksView.tsx): catálogo completo que permite explorar y saltar directamente al IDE de cualquier reto del currículum.
  * **SQL Playground Libre (`/playground`):**
    * Componente molécula [`SchemaTableItem`](file:///c:/Desarrollo/Qurio/apps/web/src/components/molecules/SchemaTableItem/SchemaTableItem.tsx): explorador de esquemas con 10 tablas relacionales (`clientes`, `pedidos`, `productos`, etc.), recuento de filas, claves primarias/foráneas y botón de consulta rápida (`SELECT * LIMIT 10`).
    * Componente organismo [`SqlPlaygroundView`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/SqlPlaygroundView/SqlPlaygroundView.tsx): estación de experimentación con plantillas SQL, Monaco Editor con atajo `⌘ + Enter`, ejecución contra el sandbox Docker y visualizador tabular [`DataGridResults`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/DataGridResults/DataGridResults.tsx).
  * **Logros & Rangos de Ingeniería (`/achievements`):**
    * Componente molécula [`AchievementCard`](file:///c:/Desarrollo/Qurio/apps/web/src/components/molecules/AchievementCard/AchievementCard.tsx): medallas técnicas con iconos temáticos, cálculo de XP, barras de progreso y estado desbloqueado/bloqueado.
    * Componente organismo [`AchievementsView`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/AchievementsView/AchievementsView.tsx): filtrado por pestañas (*Todos*, *Progreso*, *Habilidad*, *Constancia*) y resumen de insignias.
  * **Perfil del Estudiante & Auditoría (`/profile`):**
    * Componente organismo [`UserProfileView`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/UserProfileView/UserProfileView.tsx): tarjeta técnica de usuario, barra de nivel (progreso hacia Nivel 3), mapa de calor de práctica de 30 días y log de auditoría con historial de consultas locales persistentes.
  * **Integración y Títulos Dinámicos:**
    * Cableado completo en [`App.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/App.tsx) manteniendo estricto cumplimiento de **Atomic Design Pragmático** y **Anti-AI Slop** (títulos dinámicos de pestaña, manejo de errores en terminal y cero dependencias huérfanas).
* **Verificación de Calidad:**
  * Compilación TypeScript estricta y empaquetado de producción con Vite (`built in 5.38s`, 0 errores).

---

### [2026-11-09] — Entrada 13: Refinamiento de UX y Ergonomía del SQL Playground
* **Rama:** `fix/sql-playground-ux-polish`
* **Diagnóstico de los Problemas Visuales:**
  * **Botón Duplicado:** Existía un botón morado `[Ejecutar Consulta ⌘↵]` en la cabecera superior y otro idéntico `[Ejecutar Query ⌘↵]` en la barra de herramientas del editor Monaco a escasos píxeles de distancia.
  * **Mensaje Inapropiado de Reto Superado:** En una consulta ad-hoc de exploración, [`DataGridResults`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/DataGridResults/DataGridResults.tsx) mostraba `SOLUCIÓN VÁLIDA` y un banner verde festivo de `¡Reto Superado con Éxito!`, lo cual no tiene sentido en un Playground libre donde no hay un reto que evaluar.
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
* **Cumplimiento Integral de Directrices de Ingeniería ([`AGENTS.md`](file:///c:/Desarrollo/Qurio/AGENTS.md)):**
  * **Página 404 Personalizada con Metáfora SQL:**
    * Componente organismo [`NotFoundView`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/NotFoundView/NotFoundView.tsx) estilizado bajo *Terminal Glow Minimal*.
    * Simula una consola interactiva de PostgreSQL con código de error estándar `SQLSTATE 42P01: relation does not exist in schema public` y sugerencia de ayuda (`HINT`).
    * Proporciona botones de acción inmediata para volver al Dashboard, explorar Rutas o abrir el SQL Playground.
  * **Favicon e Identidad de Marca Oficial SVG:**
    * Creado el isotipo matemático puro [`apps/web/public/favicon.svg`](file:///c:/Desarrollo/Qurio/apps/web/public/favicon.svg) (cilindro relacional en capas con núcleo verde esmeralda activo) y vinculado en `apps/web/index.html`.
  * **Open Graph (OG Tags) & Previsualización Social:**
    * Creado el activo vectorial oficial [`apps/web/public/og-preview.svg`](file:///c:/Desarrollo/Qurio/apps/web/public/og-preview.svg) en estética oscura `#0B1020` con el lema institucional: *«Aprende SQL. Piensa en queries.»*.
    * Etiquetas `og:title`, `og:description`, `og:image`, `theme-color: #0B1020` y tarjetas Twitter configuradas en `index.html`.
  * **Contacto Transparente y Términos Claros (Cero Relleno):**
    * Integrado el modal molécula [`PrivacyModal`](file:///c:/Desarrollo/Qurio/apps/web/src/components/molecules/PrivacyModal/PrivacyModal.tsx) explicando de forma transparente y humana la ausencia de cookies de rastreo y el aislamiento en sandbox.
    * Pie de página técnico en [`DashboardLayout`](file:///c:/Desarrollo/Qurio/apps/web/src/components/templates/DashboardLayout/DashboardLayout.tsx) con enlace directo al repositorio oficial `https://github.com/ErickKNT/qurio` (sin direcciones postales ficticias).
  * **Adaptabilidad Responsiva Móvil y Accesibilidad (a11y):**
    * Verificado el sistema de pestañas apiladas (*Consigna*, *Editor SQL*, *Resultados*) en [`WorkspaceLayout`](file:///c:/Desarrollo/Qurio/apps/web/src/components/templates/WorkspaceLayout/WorkspaceLayout.tsx) para pantallas móviles y tablets.
    * Textos alternativos (`alt`) descriptivos en el 100% de avatares e imágenes y atajos de teclado documentados (`⌘ + Enter`).
* **Verificación de Calidad:**
  * Compilación TypeScript estricta y empaquetado de producción con Vite (`built in 6.23s`, 0 errores).

---

### [2026-11-09] — Entrada 15: Soporte para Tema Claro/Oscuro y README Oficial de GitHub
* **Rama:** `feat/theme-support-and-readme`
* **Entregables de Temas y Documentación:**
  * **Tokens Dinámicos y Variables CSS para Tailwind:**
    * Re-arquitectura de [`apps/web/src/index.css`](file:///c:/Desarrollo/Qurio/apps/web/src/index.css) con variables en canales RGB (`--color-canvas`, `--color-surface`, `--color-surface-subtle`, `--color-border-subtle`, `--color-border-focus`, `--color-text-main`, `--color-text-muted`, etc.) para `:root` (tema claro) y `.dark` (tema oscuro).
    * Actualización de [`apps/web/tailwind.config.js`](file:///c:/Desarrollo/Qurio/apps/web/tailwind.config.js) para utilizar `rgb(var(--color-...) / <alpha-value>)`, permitiendo compatibilidad total con modificadores de opacidad de Tailwind (ej. `bg-surface/70`, `border-border-subtle/50`).
  * **Hook Reactivo y Persistencia (`useTheme`):**
    * Módulo [`apps/web/src/hooks/useTheme.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/hooks/useTheme.ts) con almacenamiento en `localStorage` (`qurio_theme`), detección de `prefers-color-scheme`, eventos custom `qurio-theme-change` y listeners a cambios del sistema operativo.
  * **Controles Visuales de Alternancia (Toggle Sol / Luna):**
    * Botón integrado en la barra de herramientas superior [`TopHeader`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/TopHeader/TopHeader.tsx).
    * Botón integrado en la cabecera del espacio de trabajo [`WorkspaceLayout`](file:///c:/Desarrollo/Qurio/apps/web/src/components/templates/WorkspaceLayout/WorkspaceLayout.tsx) en [`App.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/App.tsx).
  * **Temas Reactivos en Monaco Editor:**
    * Actualización de [`MonacoEditorPanel`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/MonacoEditorPanel/MonacoEditorPanel.tsx) definiendo el tema claro oficial `qurio-light` (fondo `#F8FAFC`, cursor cyan `#0284C7`, palabras reservadas azul/índigo, strings verde oscuro, comentarios grises).
    * Cambio reactivo del editor mediante `monaco.editor.setTheme()` cuando cambia `isDark`.
  * **Script Anti-Parpadeo (Anti-FOUC):**
    * Script embebido en `<head>` de [`apps/web/index.html`](file:///c:/Desarrollo/Qurio/apps/web/index.html) para inyectar la clase `dark` antes del primer render del DOM.
  * **README.md Oficial y Exhaustivo:**
    * Documentación técnica completa en [`README.md`](file:///c:/Desarrollo/Qurio/README.md) con badges oficiales, diagramas Mermaid de arquitectura global y flujo de evaluación semántica, resumen del dataset de 10 tablas, guía de instalación paso a paso, suite de pruebas y estándares de ingeniería.
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
  * **`ThemeProvider` y `ThemeContext` Reactivo:** Creado [`apps/web/src/hooks/useTheme.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/hooks/useTheme.tsx) y envuelto en [`apps/web/src/main.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/main.tsx), garantizando un único estado global para toda la aplicación.
  * **Mutación Síncrona del DOM:** `toggleTheme` y `setTheme` ejecutan inmediatamente la mutación de `document.documentElement` (`classList.toggle('dark')`, `classList.toggle('light')`, `style.colorScheme`), actualizando tanto el CSS nativo como Tailwind y persistiendo en `localStorage` sin condiciones de carrera.
  * **Tokens CSS con Alta Especificidad:** Añadidas reglas explícitas `html.light, :root` y `html.dark, .dark` en [`apps/web/src/index.css`](file:///c:/Desarrollo/Qurio/apps/web/src/index.css) con transición suave (`transition: background-color 0.2s ease, color 0.2s ease`).
  * **Atributos de Botón y Clases de Color:** Añadido `type="button"` a los botones de alternancia en `TopHeader` y `WorkspaceLayout`, corrigiendo la clase inexistente `text-amber-accent` a `text-amber-streak`.
* **Verificación de Calidad:**
  * Compilación TypeScript y empaquetado de producción Vite verificado exitosamente (`built in 5.99s`, 0 errores).
  * Servidor Vite dev reiniciado y activo en `http://127.0.0.1:5173`.
  * Commit y sincronización con GitHub completados.

---

## 4. Estado de la Integración con Supabase Cloud

* El usuario confirmó la creación del proyecto en Supabase y la ejecución exitosa de los scripts [`database/supabase/01_schema.sql`](file:///c:/Desarrollo/Qurio/database/supabase/01_schema.sql) y [`database/supabase/02_seed_curriculum.sql`](file:///c:/Desarrollo/Qurio/database/supabase/02_seed_curriculum.sql).
* El backend queda preparado para conectarse a Supabase proveyendo `SUPABASE_URL` y `SUPABASE_ANON_KEY` en `apps/api/.env`. Si no se proporcionan, el fallback local garantiza operatividad y tests al 100%.
