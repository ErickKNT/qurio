# Lista de Tareas Activas (Todo)

## Fase 1: Cimientos de Datos & Docker (`feat/database-and-docker-infra`) — Completada

- [x] **T1.1:** Crear script de seguridad del sandbox `database/sandbox/init.sql` (creación de rol `readonly_student`, `statement_timeout = 2000`, permisos `SELECT`).
- [x] **T1.2:** Crear dataset relacional `Ecommerce_Production_DB` en `database/sandbox/ecommerce_seed.sql` (10 tablas con datos semilla de negocio realistas).
- [x] **T1.3:** Crear esquema de aplicación para Supabase en `database/supabase/01_schema.sql` (tablas de perfiles, rutas, módulos, ejercicios, intentos y logros).
- [x] **T1.4:** Crear catálogo inicial de las 3 rutas y ejercicios en `database/supabase/02_seed_curriculum.sql`.
- [x] **T1.5:** Configurar `docker-compose.yml` para levantar el contenedor PostgreSQL Sandbox en el puerto local 5433 con límites de recursos.
- [x] **T1.6:** Probar y verificar la inicialización del contenedor Docker y la conectividad con el usuario de solo lectura.
- [x] **T1.7:** Commit de la rama `feat/database-and-docker-infra` y sincronización con GitHub (`git push`).

## Fase 2: Motor de Ejecución y Evaluación en FastAPI (`feat/fastapi-runner-evaluator`) — Completada

- [x] **T2.1:** Configuración inicial de `apps/api` (virtualenv, dependencias `fastapi`, `asyncpg`, `pydantic-settings`, `uvicorn`, `httpx`, `pytest`).
- [x] **T2.2:** Módulo `core/config.py` con Pydantic Settings para PostgreSQL Sandbox y Supabase.
- [x] **T2.3:** Sanitizador de seguridad SQL `modules/runner/security.py` (bloqueo de DDL/DML, multi-statement, funciones peligrosas y control de row limits).
- [x] **T2.4:** Servicio `modules/runner/service.py` con pool `asyncpg`, timeouts estrictos y serialización segura de tipos PostgreSQL.
- [x] **T2.5:** Evaluador semántico `modules/runner/evaluator.py` con tolerancia de orden, normalización de flotantes/nulos, detección de diffs y cálculo de XP con pistas.
- [x] **T2.6:** Módulo de currículum y repositorio resiliente `modules/curriculum/repository.py` con catálogo semilla y soporte Supabase REST.
- [x] **T2.7:** Router y endpoints FastAPI en `modules/runner/router.py`:
  - `GET /api/v1/health`
  - `POST /api/v1/playground/execute`
  - `GET /api/v1/exercises`
  - `GET /api/v1/exercises/{exercise_id}`
  - `POST /api/v1/exercises/{exercise_id}/submit`
- [x] **T2.8:** Suite completa de pruebas con Pytest (26 pruebas unitarias e integración en vivo contra el Sandbox Docker pasando al 100%).
- [x] **T2.9:** `Dockerfile` para la API y orquestación unificada en `docker-compose.yml`.
- [x] **T2.10:** Commit en `feat/fastapi-runner-evaluator`, merge a `main` y sincronización con GitHub (`git push`).

## Fase 3: Frontend Base & Atomic Design Pragmático (`feat/web-atomic-design`) — Completada

- [x] **T3.1:** Inicializar `apps/web` con Vite + React 18 + TypeScript estricto.
- [x] **T3.2:** Configurar Tailwind CSS 3.4 con tokens de diseño *Terminal Glow Minimal* y fuentes tipográficas (`Plus Jakarta Sans` y `JetBrains Mono`).
- [x] **T3.3:** Crear estructura de carpetas bajo Atomic Design Pragmático (`src/components/{atoms,molecules,organisms,templates}`).
- [x] **T3.4:** Implementar Átomos: `Button`, `Badge`, `TextInput`, `KbdShortcut`, `RadioTab`.
- [x] **T3.5:** Implementar Moléculas: `SearchInput`, `StreakPill`, `FormField` (con validación de error inline rigurosa Anti-AI Slop), `MetricTile`.
- [x] **T3.6:** Implementar Organismos: `SidebarNav` (con isotipo SVG de Qurio y status de DB), `TopHeader`.
- [x] **T3.7:** Implementar Plantillas: `DashboardLayout`, `WorkspaceLayout` (con adaptación móvil de pestañas apiladas).
- [x] **T3.8:** Integrar cliente `@supabase/supabase-js` para autenticación y hook `useAuth` con perfil reactivo.
- [x] **T3.9:** Verificación de compilación TypeScript y empaquetado de producción con Vite (`built in 5.67s`, 0 errores).
- [x] **T3.10:** Commit en `feat/web-atomic-design`, merge a `main` y push a GitHub.

## Fase 4: Flujo End-to-End del Ejercicio (`feat/exercise-ide-flow`) — Completada

- [x] **T4.1:** Integración de `@monaco-editor/react` con tema oscuro `qurio-dark`, tipografía `JetBrains Mono` y atajo `⌘ + Enter` para ejecutar.
- [x] **T4.2:** Organismo `DataGridResults` con visualización tabular de resultados, tipos de datos en monospace, chips `NULL`, métricas de latencia y visualizador de discrepancias semánticas (`DiffResult`).
- [x] **T4.3:** Organismo `ExerciseSpecPanel` con consigna detallada, esquema relacional desplegable (`clientes`, `pedidos`, `productos`, `categorias`) y sistema de pistas progresivas con penalización visual de XP.
- [x] **T4.4:** Cliente de integración `apps/web/src/lib/api.ts` conectado con los endpoints de FastAPI (`/api/v1/exercises/{id}/submit` y `/api/v1/health`).
- [x] **T4.5:** Molécula `SuccessModal` de recompensa de XP, tiempo en sandbox y navegación fluida al siguiente reto.
- [x] **T4.6:** Verificación de compilación completa con TypeScript y Vite (`built in 6.91s`, 0 errores).
- [x] **T4.7:** Servidores activos: FastAPI en puerto 8000, Vite en puerto 5173, Docker PostgreSQL en puerto 5433.
- [x] **T4.8:** Commit en `feat/exercise-ide-flow`, merge a `main` y push a GitHub.

## Refinamiento Visual & Desaturación de Interfaz (`feat/ui-refinement-and-desaturation`) — Completada

- [x] **TR.1:** Reducir saturación de `TopHeader`: eliminar píldoras redundantes de racha y XP, reducir altura a `h-14` y suavizar bordes.
- [x] **TR.2:** Racionalizar `SidebarNav`: simplificar indicador de base de datos a punto esmeralda sutil (`pg:16 sandbox`), remover etiqueta ruidosa `Live` de Playground y limpiar tarjeta inferior de usuario.
- [x] **TR.3:** Homogeneizar `MetricTile`: suprimir arcoíris competitivo de bordes neón y unificar en tarjetas pizarra neutrales con números monoespaciados legibles.
- [x] **TR.4:** Limpiar vista de esquema en `ExerciseSpecPanel`: eliminar contenedores dobles por cada columna y adoptar formato limpio de terminal tipo DataGrip/TablePlus.
- [x] **TR.5:** Suavizar resplandores en Dashboard de `App.tsx` y preservar siempre la visualización de la cuadrícula de resultados del usuario.
- [x] **TR.6:** Verificación de compilación de producción Vite (`built in 5.73s`, 0 errores).
- [x] **TR.7:** Commit en `feat/ui-refinement-and-desaturation`, merge a `main` y sincronización con GitHub.

## Fase 5: Catálogo, Playground & Gamificación (`feat/curriculum-and-gamification`) — Completada

- [x] **T5.1:** Vista de Rutas de Aprendizaje y Detalle de Ruta (`TracksView`, `TrackCard`, `ModuleAccordion` con syllabus colapsable, porcentajes de avance y lanzamiento directo al IDE).
- [x] **T5.2:** Vista de SQL Playground interactivo (`SqlPlaygroundView`, `SchemaTableItem` con explorador de esquema en vivo para 10 tablas, plantillas rápidas, Monaco Editor y DataGrid).
- [x] **T5.3:** Vista de Logros & Rangos (`AchievementsView`, `AchievementCard` con filtro por categorías, medallas desbloqueadas/bloqueadas, progreso y cálculo de XP).
- [x] **T5.4:** Vista de Mi Perfil (`UserProfileView` con barra de progresión a Nivel 3, tiles de métricas, mapa de calor de cadencia de 30 días y log de consultas auditadas).
- [x] **T5.5:** Sincronización en `App.tsx` con títulos dinámicos (`document.title`) para cada vista y navegación fluida entre secciones.
- [x] **T5.6:** Verificación de compilación TypeScript y empaquetado de producción con Vite (`built in 5.38s`, 0 errores).
- [x] **T5.7:** Commit en `feat/curriculum-and-gamification`, merge a `main` y push a GitHub.

## Fase 6: Autenticidad, Calidad & Despliegue (`feat/authenticity-and-polish`) — Completada

- [x] **T6.1:** Página 404 temática con estética Terminal Glow Minimal y metáfora técnica SQL (`ERROR 404: Relation 'route' does not exist in schema public`) en [`NotFoundView`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/NotFoundView/NotFoundView.tsx) con botones de recuperación al Dashboard, Rutas y Playground.
- [x] **T6.2:** Favicon SVG oficial de Qurio (cilindro relacional en capas con núcleo verde esmeralda activo) en `apps/web/public/favicon.svg` vinculado en `index.html`.
- [x] **T6.3:** Metadatos Open Graph y Twitter Cards (`og:title`, `og:description`, `og:image`, `theme-color: #0B1020`) con el vector oficial [`og-preview.svg`](file:///c:/Desarrollo/Qurio/apps/web/public/og-preview.svg) y lema *"Aprende SQL. Piensa en queries."*.
- [x] **T6.4:** Adaptabilidad responsiva móvil y tablet verificada en [`WorkspaceLayout`](file:///c:/Desarrollo/Qurio/apps/web/src/components/templates/WorkspaceLayout/WorkspaceLayout.tsx) (pestañas apiladas: *Consigna*, *Editor SQL*, *Resultados*).
- [x] **T6.5:** Transparencia y contacto real en el pie de página del Dashboard y modal [`PrivacyModal`](file:///c:/Desarrollo/Qurio/apps/web/src/components/molecules/PrivacyModal/PrivacyModal.tsx) (cero direcciones falsas, enlace auténtico a `github.com/ErickKNT/qurio` y política de privacidad clara sin cookies de terceros).
- [x] **T6.6:** Verificación de compilación TypeScript y empaquetado de producción con Vite (`built in 6.23s`, 0 errores).
- [x] **T6.7:** Commit en `feat/authenticity-and-polish`, merge a `main` y sincronización con GitHub.

## Soporte de Temas (Claro / Oscuro) y Documentación README (`feat/theme-support-and-readme`) — Completada

- [x] **T7.1:** Sistema de variables CSS para Tailwind en `apps/web/src/index.css` (`:root` para tema claro y `.dark` para tema oscuro).
- [x] **T7.2:** Adaptación de `apps/web/tailwind.config.js` para usar canales alfa dinámicos `rgb(var(--color-...) / <alpha-value>)`.
- [x] **T7.3:** Hook `useTheme` en `apps/web/src/hooks/useTheme.ts` con persistencia en `localStorage`, detección de `prefers-color-scheme` y eventos de sincronización.
- [x] **T7.4:** Botón interactivo de alternancia sol/luna en `TopHeader` y en la cabecera de `WorkspaceLayout`.
- [x] **T7.5:** Integración reactiva del tema en `MonacoEditorPanel` (`qurio-dark` y `qurio-light` con cambio dinámico vía `monaco.editor.setTheme`).
- [x] **T7.6:** Script anti-parpadeo (anti-FOUC) en `apps/web/index.html`.
- [x] **T7.7:** `README.md` exhaustivo y profesional en la raíz del repositorio con badges, diagramas Mermaid, quickstart, dataset y estándares de arquitectura.
- [x] **T7.8:** Verificación de compilación TypeScript y build de producción Vite (`built in 5.96s`, 0 errores).
- [x] **T7.9:** Commit en `feat/theme-support-and-readme`, merge a `main` y sincronización con GitHub.

## Fase 7: Persistencia Real de Progreso y Autenticación con Supabase Cloud (`feat/supabase-auth-and-persistence`) — Completada

- [x] **T8.1:** Motor de persistencia híbrida `apps/web/src/lib/persistence.ts` con guardado de intentos (`recordAttempt`), lectura de completados (`getCompletedExerciseIds`), cálculo de XP/nivel y respaldo local transparente (`localStorage`) ante desconexión o modo demo.
- [x] **T8.2:** Ampliación del hook `useAuth.ts` con soporte para login (`signIn`), registro (`signUp`), logout (`signOut`), creación reactiva de perfiles en `user_profiles` y sincronización de sesiones Supabase JWT.
- [x] **T8.3:** Molécula `AuthModal` (`apps/web/src/components/molecules/AuthModal/AuthModal.tsx`) con pestañas para Iniciar Sesión / Registro, campos `FormField` con validación inline de errores, feedback visual y estado de conexión JWT.
- [x] **T8.4:** Integración en `TopHeader` y `WorkspaceLayout` del disparador modal de sesión y visualización del usuario actual.
- [x] **T8.5:** Integración en `UserProfileView` con selector de estado (Cloud / Local), visualización de badge Supabase Cloud y botón de gestión de cuenta.
- [x] **T8.6:** Flujo end-to-end en `App.tsx`: persistencia automática de cada evaluación exitosa (`PASSED`), fallida (`FAILED`) o con error (`ERROR`), actualización en tiempo real de XP, nivel y estado de retos superados.
- [x] **T8.7:** Verificación de compilación TypeScript y empaquetado de producción con Vite (`built in 5.42s`, 0 errores).
- [x] **T8.8:** Servidores activos y verificados: FastAPI (8000), Vite (5173), PostgreSQL Sandbox en Docker (5433).
- [x] **T8.9:** Commit en `feat/supabase-auth-and-persistence`, merge a `main` y sincronización con GitHub.


