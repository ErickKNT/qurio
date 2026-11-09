# Bitácora de Desarrollo — Qurio

Este documento registra cronológicamente las fases, decisiones arquitectónicas, artefactos entregados y el estado operativo del proyecto **Qurio**. **Debe actualizarse obligatoriamente al concluir cada hito o cambio de fase.**

---

## 1. Estado Actual del Proyecto

* **Fase Actual:** **Expansión del Currículum Completo de Retos (`feat/curriculum-expansion-3-tracks`) — Concluida**  
* **Próxima Fase:** **Operación, Métricas en Vivo y Nuevas Prácticas**  
* **Rama Git Activa:** `feat/curriculum-expansion-3-tracks` (mergeada a `main` y sincronizada en GitHub)  
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
| **7** | **Expansión Curricular (3 Rutas)** | ✅ Concluida | `feat/curriculum-expansion-3-tracks` | 18 ejercicios completos, didáctica SQLBolt, checklist de sub-objetivos interactiva. |
| **9** | **Hardening de Seguridad & AST** | 🔄 En Implementación / Revisión | `security/phase-9-hardening` | SQLGlot AST, defensa en profundidad, ES256 JWKS, Rate Limiting, RPC certified progress. |

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
    * Backend FastAPI: Creados `ExerciseConcept` y `SampleTableData` en [`apps/api/app/modules/curriculum/seed_data.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/curriculum/seed_data.py), enriqueciendo todos los ejercicios con explicaciones conceptuales, bloques de sintaxis formateados, notas de orden de ejecución en PostgreSQL y tablas de datos de muestra.
    * Frontend React: Agregados los tipos correspondientes en [`apps/web/src/types/index.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/types/index.ts) y catálogo enriquecido en [`apps/web/src/lib/api.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/api.ts).
  * **Re-arquitectura de `ExerciseSpecPanel` ([`apps/web/src/components/organisms/ExerciseSpecPanel/ExerciseSpecPanel.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/ExerciseSpecPanel/ExerciseSpecPanel.tsx)):**
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
  * **Configuración del Editor ([`MonacoEditorPanel.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/MonacoEditorPanel/MonacoEditorPanel.tsx)):**
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
    * Integrado botón de acción con iconos `Eye` / `EyeOff` en [`AuthModal.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/components/molecules/AuthModal/AuthModal.tsx) sobre el átomo `FormField`, permitiendo inspeccionar la contraseña tecleada tanto en registro como en login.
  * **Flujo de Recuperación de Contraseña (`forgot` mode):**
    * Enlace *"¿Olvidaste tu contraseña?"* en la pestaña de inicio de sesión de `AuthModal`.
    * Vista dedicada para solicitar restablecimiento con botón *"Enviar Enlace de Recuperación"* conectado a `supabase.auth.resetPasswordForEmail`.
  * **Página Temática del Sistema para Verificación de Correo ([`AuthConfirmView.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/AuthConfirmView/AuthConfirmView.tsx)):**
    * Al hacer clic en el enlace del correo de Supabase, el usuario aterriza en una vista nativa de Qurio con diseño *Terminal Glow Minimal*.
    * Isotipo animado con pulso esmeralda, ficha técnica de auditoría (`email_confirmed: TRUE`, sesión JWT firmada, rol `readonly_student`) y acceso directo al Dashboard.
  * **Página Temática para Restablecer Contraseña ([`ResetPasswordView.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/ResetPasswordView/ResetPasswordView.tsx)):**
    * Formulario nativo con nueva contraseña y confirmación (ambas con toggle `Eye/EyeOff`), validación de coincidencia y actualización de credenciales vía `supabase.auth.updateUser`.
  * **Enrutamiento y Detección de Redirecciones en [`App.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/App.tsx):**
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
  * Removido el estado `successModalOpen` y el nodo `<SuccessModal>` en [`apps/web/src/App.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/App.tsx).
  * Todo el feedback de victoria se delega exclusivamente al banner inline de [`DataGridResults.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/DataGridResults/DataGridResults.tsx) con badge verde esmeralda, ganancia de XP y botón interactivo "Siguiente Reto", preservando la tabla de datos intacta e interactiva.
  * Verificación de build de producción con Vite (`built in 5.62s`) y 26/26 pruebas de backend pasando en 0.13s.
* **Control de Versiones:**
  * Commits consolidados y fusionados con `git merge --no-ff feat/auth-experience-and-custom-redirects` hacia `main`.
  * Sincronizado en GitHub (`git push origin main`).

### Entrada 23 — Arquitectura Canónica de Autenticación React (AuthProvider), Inicio y Cierre de Sesión Real
* **Fecha:** 2026-11-09
* **Objetivo:** Implementar un flujo 100% funcional y reactivo de inicio (`signIn`) y cierre de sesión (`signOut`) con Supabase Cloud, eliminando perfiles simulados estáticos y permitiendo a los usuarios autenticarse y desautenticarse con reflejo instantáneo en toda la interfaz.
* **Cambios Clave:**
  * **Migración a React Context (`AuthProvider`):** En [`apps/web/src/hooks/useAuth.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/hooks/useAuth.tsx) se creó el contexto canónico de autenticación envolviendo la aplicación en [`main.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/main.tsx). Todos los componentes comparten una única fuente de verdad reactiva sin escuchas duplicadas.
  * **Flujo de Inicio de Sesión (`signIn`):** Validación real con `supabase.auth.signInWithPassword`, traducción de errores frecuentes (credenciales erróneas, cuenta sin verificar) y sincronización del perfil real desde `public.user_profiles`.
  * **Flujo de Cierre de Sesión (`signOut`):** Llamada real a `supabase.auth.signOut()`, purga de tokens JWT de sesión y limpieza de almacenamiento local (`clearLocalProfile()`), regresando instantáneamente al estado de Invitado.
  * **Estado de Invitado vs Autenticado en UI:**
    * [`TopHeader.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/TopHeader/TopHeader.tsx): Muestra botón explícito "Iniciar Sesión" para invitados. Si está autenticado, muestra avatar con halo activo esmeralda y menú desplegable interactivo con nombre, correo, XP y botón rojo "Cerrar Sesión".
    * [`SidebarNav.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/SidebarNav/SidebarNav.tsx): Presenta tarjeta de "Modo Invitado" con botón de login, o tarjeta de progreso del usuario autenticado con botón de cerrar sesión.
    * [`App.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/App.tsx): Cabecera del IDE adaptada con botón de login y botón de cierre de sesión dinámicos.
    * [`UserProfileView.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/UserProfileView/UserProfileView.tsx): Eliminado el valor cableado `Erick KNT` y `480 XP`, conectando los datos reales del perfil autenticado o del estado de invitado.
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
  * [`graphify-out/graph.html`](file:///c:/Desarrollo/Qurio/graphify-out/graph.html): Visualizador interactivo autocontenido ejecutable en cualquier navegador sin servidor.
  * [`graphify-out/graph.json`](file:///c:/Desarrollo/Qurio/graphify-out/graph.json): Grafo estructurado listo para GraphRAG.
  * [`graphify-out/GRAPH_REPORT.md`](file:///c:/Desarrollo/Qurio/graphify-out/GRAPH_REPORT.md): Informe ejecutivo de comunidades, métricas de cohesión y conexiones del sistema.
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
  * **SQL Runner & AST con SQLGlot ([`apps/api/app/modules/runner/security.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/runner/security.py)):**
    * Sustitución de regex por análisis sintáctico formal del AST (`sqlglot.parse` con dialecto `postgres`).
    * Allowlist estricta de raíces de lectura (`exp.Query`, `exp.Subquery`).
    * Denylist profunda en todo el árbol (`walk()`) para neutralizar mutaciones DDL/DML camufladas dentro de CTEs o subconsultas.
    * Bloqueo de funciones peligrosas del sistema (`pg_sleep`, `pg_terminate_backend`, `dblink`, `pg_read_file`, etc.) y tablas internas de credenciales (`pg_shadow`, `pg_authid`).
    * Soporte seguro para `WITH RECURSIVE` delegando la contención de recursiones infinitas al motor PostgreSQL (`statement_timeout = 2000ms`, `lock_timeout = 1000ms`).
    * Cláusula `LIMIT` forzada y manipulada de forma nativa en el AST (`enforce_row_limit`).
  * **Autenticación Asimétrica ES256 ([`apps/api/app/core/auth.py`](file:///c:/Desarrollo/Qurio/apps/api/app/core/auth.py)):**
    * Verificación contra el endpoint JWKS público de Supabase (`/.well-known/jwks.json`) con rotación automática de claves y caché en memoria.
    * Validación estricta de claims (`aud = authenticated`, `iss`, `sub`, expiración).
    * Modo invitado con fallback desacoplado que no bloquea la práctica local pero impide la persistencia no autorizada.
  * **Rate Limiting y Guardia de Concurrencia ([`apps/api/app/core/rate_limit.py`](file:///c:/Desarrollo/Qurio/apps/api/app/core/rate_limit.py)):**
    * Límite diferenciado: 20 req/min por IP para invitados, 120 req/min por UID para autenticados.
    * Semáforo de concurrencia (`asyncio.Semaphore(10)`) para blindar el pool `asyncpg` ante avalanchas.
  * **Cabeceras de Seguridad ([`apps/api/app/main.py`](file:///c:/Desarrollo/Qurio/apps/api/app/main.py)):**
    * Middleware con `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy`.
  * **Infraestructura Sandbox ([`docker-compose.yml`](file:///c:/Desarrollo/Qurio/docker-compose.yml) y [`database/sandbox/init.sql`](file:///c:/Desarrollo/Qurio/database/sandbox/init.sql)):**
    * Vinculación de PostgreSQL a `127.0.0.1:5433:5432` impidiendo exposición innecesaria a interfaces de red externas.
    * `lock_timeout = '1000ms'` y `temp_file_limit = '32MB'` sobre el rol `readonly_student`.
  * **Script de Hardening de Supabase ([`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql)):**
    * RPC `record_verified_attempt()` con `SECURITY DEFINER`, `search_path = public, pg_temp` e idempotencia que impide otorgar XP duplicado.
    * Restricción de permisos: solo ejecutable por `service_role`.
    * CLS en `user_profiles`: revocado el `UPDATE` directo sobre `xp` y `level` a clientes `authenticated`.
  * **Frontend ([`apps/web/src/lib/api.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/api.ts)):**
    * Envío automático de `Authorization: Bearer <token>` cuando existe sesión activa en Supabase Auth.
* **Resultados de Validación:**
  * **Backend Pytest:** 49/49 pruebas pasando en 2.34s (`test_security.py`, `test_auth.py`, `test_rate_limit.py`, `test_integration.py`, `test_evaluator.py`).
  * **Frontend Vite Build:** `built in 5.47s`, 0 errores tipados.
* **Control de Versiones:**
  * Rama `security/phase-9-hardening` lista sin mergear a `main`.


---

## 4. Estado de la Integración con Supabase Cloud

* El usuario confirmó la creación del proyecto en Supabase y la ejecución exitosa de los scripts [`database/supabase/01_schema.sql`](file:///c:/Desarrollo/Qurio/database/supabase/01_schema.sql) y [`database/supabase/02_seed_curriculum.sql`](file:///c:/Desarrollo/Qurio/database/supabase/02_seed_curriculum.sql).
* El backend queda preparado para conectarse a Supabase proveyendo `SUPABASE_URL` y `SUPABASE_ANON_KEY` en `apps/api/.env`. Si no se proporcionan, el fallback local garantiza operatividad y tests al 100%.
