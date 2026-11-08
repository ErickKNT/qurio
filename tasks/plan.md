# Plan de Implementación General — Qurio MVP

**Fecha de Inicio:** Noviembre 2026  
**Rama Activa:** `feat/database-and-docker-infra`  
**Estrategia:** Slices verticales con ramas por funcionalidad y sincronización a GitHub.  

---

## 1. Fases del Proyecto

### Fase 1: Cimientos de Datos & Docker (`feat/database-and-docker-infra`)
* [ ] Script de seguridad y configuración de sandbox (`database/sandbox/init.sql`).
* [ ] Dataset semilla relacional `Ecommerce_Production_DB` (`database/sandbox/ecommerce_seed.sql`).
* [ ] Esquema DDL para Supabase (`database/supabase/01_schema.sql`).
* [ ] Catálogo semilla de las 3 rutas y ejercicios base (`database/supabase/02_seed_curriculum.sql`).
* [ ] Configuración `docker-compose.yml` para el PostgreSQL Sandbox (puerto 5433).
* [ ] Verificación en vivo levantando el contenedor Docker local.

### Fase 2: Motor de Ejecución y Evaluación (`feat/fastapi-runner-evaluator`)
* [ ] Inicialización de `apps/api` (FastAPI, Pydantic v2, asyncpg, CORS).
* [ ] Módulo `sandbox_runner` con pool seguro hacia el sandbox Docker.
* [ ] Algoritmo de evaluación semántica comparando tuplas, tipos, nulos y orden.
* [ ] Endpoints `/api/v1/exercises/{id}/submit` y `/api/v1/playground/execute`.
* [ ] Suite de pruebas unitarias para el evaluador.

### Fase 3: Frontend Base & Atomic Design (`feat/web-atomic-design`)
* [ ] Inicialización de `apps/web` con Vite + React 18 + TypeScript.
* [ ] Configuración Tailwind CSS con los tokens de *Terminal Glow Minimal*.
* [ ] Implementación de Átomos (`Button`, `Badge`, `TextInput`, `KbdShortcut`).
* [ ] Implementación de Moléculas (`SearchInput`, `StreakPill`, `FormField`).
* [ ] Implementación de Organismos (`SidebarNav`, `TopHeader`).
* [ ] Integración del cliente Supabase Auth (`useAuth`).

### Fase 4: Flujo End-to-End del Ejercicio (`feat/exercise-ide-flow`)
* [ ] Integración de Monaco Editor con tema oscuro personalizado.
* [ ] Componente `DataGridResults` para resultados tabulares.
* [ ] `WorkspaceLayout` (panel 30% consigna/schema, panel 70% editor/grid).
* [ ] Conexión del frontend con el endpoint de evaluación en FastAPI.
* [ ] Verificación del ciclo completo: alumno escribe SQL → ejecuta en Docker → ve feedback y XP.

### Fase 5: Rutas, Playground y Gamificación (`feat/curriculum-and-gamification`)
* [ ] Vista de Dashboard del Estudiante.
* [ ] Vista de Rutas de Aprendizaje y Detalle de Ruta (Syllabus).
* [ ] Vista de SQL Playground interactivo.
* [ ] Sistema de rachas, cálculo de nivel y perfil de usuario.

### Fase 6: Autenticidad, Pulido y Despliegue (`feat/authenticity-and-polish`)
* [ ] Página 404 temática con error SQL.
* [ ] Favicon SVG oficial de Qurio.
* [ ] Meta títulos dinámicos en cada pantalla.
* [ ] Adaptabilidad responsive móvil completa con pestañas apiladas.
* [ ] Verificación general contra `AGENTS.md`.
