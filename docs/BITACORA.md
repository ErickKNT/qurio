# Bitácora de Desarrollo — Qurio

Este documento registra cronológicamente las fases, decisiones arquitectónicas, artefactos entregados y el estado operativo del proyecto **Qurio**. **Debe actualizarse obligatoriamente al concluir cada hito o cambio de fase.**

---

## 1. Estado Actual del Proyecto

* **Fase Actual:** **Pausa de Configuración — Conexión con Supabase Cloud**  
* **Próxima Fase:** **Fase 2: Motor de Ejecución y Evaluación en FastAPI (`feat/fastapi-runner-evaluator`)**  
* **Rama Git Activa:** `main` (sincronizada con `origin/main`)  
* **Infraestructura Activa:** Contenedor Docker `qurio-postgres-sandbox` corriendo en `localhost:5433` (verificado mediante DataGrip).

---

## 2. Tablero de Control de Fases

| Fase | Nombre | Estado | Rama Git | Hito Entregado |
| :---: | :--- | :---: | :---: | :--- |
| **0** | **Definición y Especificación** | ✅ Concluida | `main` | Declaración de intención, PRD, SAD, Sistema de Diseño y Reglas. |
| **1** | **Cimientos de Datos & Docker** | ✅ Concluida | `feat/database-and-docker-infra` | Sandbox PostgreSQL aislado, dataset de 10 tablas, esquemas Supabase y docker-compose. |
| **2** | **Motor de Ejecución y Evaluación** | ⏳ Próxima | `feat/fastapi-runner-evaluator` | API FastAPI, pool seguro con asyncpg, evaluador semántico y tests unitarios. |
| **3** | **Frontend Base & Atomic Design** | ⏹️ Pendiente | `feat/web-atomic-design` | React + Vite + Tailwind, árbol de componentes (átomos/moléculas) y auth con Supabase. |
| **4** | **Flujo Principal End-to-End** | ⏹️ Pendiente | `feat/exercise-ide-flow` | Monaco Editor, Data Grid de resultados, resolución y verificación completa de un reto. |
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

## 4. Instrucciones para la Integración con Supabase (En Curso)

Cuando tengas creado tu proyecto en el panel web de Supabase:
1. Dirígete a la pestaña **SQL Editor**.
2. Pega y ejecuta el contenido de [`database/supabase/01_schema.sql`](file:///c:/Desarrollo/Qurio/database/supabase/01_schema.sql) para crear las tablas y políticas RLS.
3. Pega y ejecuta el contenido de [`database/supabase/02_seed_curriculum.sql`](file:///c:/Desarrollo/Qurio/database/supabase/02_seed_curriculum.sql) para poblar el catálogo de cursos y ejercicios.
4. En **Project Settings > API**, obtén:
   * `Project URL`
   * `anon / public key`
   * `service_role key` (secreta, solo para el backend).
