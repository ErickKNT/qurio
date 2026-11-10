# Qurio — Product Requirements Document (PRD)

**Producto:** Qurio — Interactive SQL Learning Platform  
**Versión:** 1.0 (MVP)  
**Fecha:** Noviembre 2026  
**Estado:** Propuesto para revisión y aprobación  
**Documento de Intención de Referencia:** [`docs/intent/qurio-mvp.md`](intent/qurio-mvp.md)  
**Sistema de Diseño de Referencia:** [`Terminal Glow Minimal`](stitch_qurio_interactive_sql_platform/stitch_qurio_interactive_sql_platform/terminal_glow_minimal/DESIGN.md)

---

## 1. Visión y Objetivos del Producto

### 1.1 Declaración de Visión
Qurio es una plataforma web pública de aprendizaje práctico de SQL que fusiona la progresión guiada y gratificante de aplicaciones de aprendizaje modernas con el rigor analítico y la ergonomía de un IDE profesional contemporáneo. Su propósito es enseñar a pensar en consultas relacionales resolviendo desafíos basados en datos y situaciones de negocio reales.

### 1.2 Objetivos del MVP
1. **Validación Práctica de Extremo a Extremo:** Demostrar que un usuario autodidacta puede registrarse, elegir una ruta, escribir consultas SQL reales en Monaco Editor, ejecutarlas contra un PostgreSQL aislado y recibir feedback semántico inmediato.
2. **Alta Fidelidad Visual y Ergonómica:** Implementar la experiencia de usuario definida en el sistema de diseño *Terminal Glow Minimal* (Dark Mode por defecto, fuentes `Inter` y `JetBrains Mono`, bordes luminescentes y layout tipo estación de trabajo).
3. **Simplicidad y Seguridad Operativa:** Arquitectura híbrida que delega la autenticación y datos de aplicación a Supabase, mientras la ejecución de SQL arbitrario corre en un sandbox aislado en Docker sin comprometer la base de datos principal.
4. **Catálogo Inicial Relevante:** Disponer de 3 rutas de aprendizaje completas (Fundamentos, SQL Relacional y Consultas Avanzadas) con al menos 45 a 50 ejercicios evaluados de manera semántica.

---

## 2. Mapa de Capacidades del MVP (Capability Map)

| Módulo ID | Responsabilidad | Depende de | Mockup / Referencia |
| :--- | :--- | :--- | :--- |
| `auth-profile` | Registro, login, sesiones JWT con Supabase, perfiles de usuario y configuración. | Supabase Auth | `qurio_perfil_de_usuario` |
| `curriculum` | Gestión de rutas formativas, módulos, lecciones teóricas y catálogo de ejercicios. | Supabase DB | `qurio_rutas_de_aprendizaje`, `qurio_detalle_de_ruta_sql_foundations` |
| `execution-eval` | Runner de PostgreSQL aislado en Docker, ejecución segura de queries y evaluación semántica comparativa. | `curriculum` | `qurio_ejercicio_interactivo_sql` |
| `playground` | Consola libre con esquema de tablas de comercio electrónico (`Ecommerce_Production_DB`) e historial de consultas. | `execution-eval` | `qurio_sql_playground` |
| `gamification` | Motor de XP, niveles de dominio, registro de rachas diarias (*streaks*) e insignias. | `execution-eval`, `auth-profile` | `qurio_logros_rangos`, `qurio_dashboard` |

*Orden de Construcción:* `auth-profile` → `curriculum` → `execution-eval` → `playground` → `gamification`.

---

## 3. Personas y Usuarios Objetivo

### 3.1 Perfil Principal: El Autodidacta Pragmático (Junior Dev / Analista de Datos)
* **Demografía:** Desarrolladores web junior, analistas de negocio o estudiantes universitarios de informática.
* **Problema Actual:** Encuentran las plataformas existentes o demasiado teóricas (cursos en video sin interactividad) o excesivamente espartanas y anticuadas (SQLZoo, W3Schools), o centradas en algoritmos abstractos tipo LeetCode sin esquemas de negocio reales.
* **Necesidad:** Escribir SQL real contra bases de datos reales, entender por qué falló su lógica (más allá de un error de sintaxis) y sentir progreso tangible.

---

## 4. Historias de Usuario y Criterios de Aceptación (Gherkin)

### US-01: Autenticación y Onboarding Liviano
> **Como** usuario autodidacta que llega a Qurio,  
> **quiero** crear una cuenta rápidamente con email y contraseña,  
> **para** poder guardar mi progreso, mis rachas y mi experiencia acumulada.

* **Criterios de Aceptación:**
  * **Dado** que un visitante no registrado accede a Qurio, **cuando** hace clic en "Registrarse" e introduce email y contraseña válidos, **entonces** Supabase Auth crea su usuario, se inicializa su perfil en la tabla `user_profiles` con Nivel 1 (0 XP) y es redirigido al Dashboard.
  * **Dado** un usuario con credenciales incorrectas, **cuando** intenta iniciar sesión, **entonces** la interfaz muestra un mensaje de error claro en color `error` (`#ffb4ab`) sin recargar la página.

### US-02: Exploración de Rutas y Syllabus
> **Como** estudiante de SQL,  
> **quiero** explorar el catálogo de rutas y ver el desglose de lecciones de cada una,  
> **para** entender los temas que aprenderé y el tiempo estimado requerido.

* **Criterios de Aceptación:**
  * **Dado** un usuario en la vista de Rutas de Aprendizaje, **cuando** visualiza la página, **entonces** observa las tarjetas de ruta con nivel de dificultad, número de ejercicios, tiempo estimado y porcentaje de completitud.
  * **Dado** que el usuario hace clic en la ruta *SQL Foundations*, **cuando** carga la pantalla de detalle, **entonces** ve el desglose modular (1 al 8) y el estado de cada ejercicio (completado, disponible, bloqueado).

### US-03: Resolución de Ejercicios en el IDE
> **Como** estudiante resolviendo un reto,  
> **quiero** redactar mi consulta en un editor con resaltado de sintaxis, ver el esquema relacional de las tablas y ejecutarla con un atajo de teclado,  
> **para** probar mi solución de manera fluida y sin distracciones.

* **Criterios de Aceptación:**
  * **Dado** un ejercicio abierto en la pantalla interactiva, **cuando** el estudiante inspecciona el panel izquierdo, **entonces** puede alternar entre las pestañas "Instrucciones" (consigna y formato esperado) y "Explorador (Schema)" (tablas, columnas y tipos de datos `INT`, `VARCHAR`).
  * **Dado** que el usuario escribe su consulta en Monaco Editor, **cuando** presiona `⌘ + Enter` (o `Ctrl + Enter`) o hace clic en "Ejecutar Consulta", **entonces** el botón entra en estado de carga luminescente y la consulta se envía a `/api/v1/exercises/{id}/submit`.

### US-04: Evaluación Semántica y Retroalimentación
> **Como** estudiante que envía una solución,  
> **quiero** que el sistema compare el resultado real de mi consulta contra el resultado esperado del caso de prueba,  
> **para** saber si mi lógica de negocio es correcta independientemente de cómo escribí la sintaxis (`JOIN` vs `EXISTS`).

* **Criterios de Aceptación:**
  * **Dado** que la consulta devuelve exactamente las mismas filas, columnas, tipos de datos y manejo de nulos que la solución esperada, **cuando** concluye la evaluación en el backend, **entonces** el frontend muestra el Data Grid en estado verde esmeralda (`#22C55E`), otorga los XP correspondientes (ej. `+45 XP`), actualiza la racha y habilita el botón "Siguiente Ejercicio".
  * **Dado** que la consulta tiene un error sintáctico o no devuelve las filas correctas, **cuando** se recibe el veredicto, **entonces** el sistema muestra la pestaña de aserciones fallidas, la diferencia de registros encontrados vs esperados, y un botón para desbloquear pistas progresivas (1/3).

### US-05: SQL Playground Analítico
> **Como** estudiante o profesional que desea experimentar libremente,  
> **quiero** un área de laboratorio con datasets empresariales precargados,  
> **para** ensayar consultas complejas, probar combinaciones de `JOIN` y analizar métricas de ejecución.

* **Criterios de Aceptación:**
  * **Dado** un usuario en la vista *SQL Playground*, **cuando** selecciona el dataset `Ecommerce_Production_DB`, **entonces** el panel izquierdo muestra las 12 tablas disponibles (`clientes`, `pedidos`, `productos`, etc.) con sus tipos de datos.
  * **Dado** que el usuario ejecuta cualquier consulta de lectura (`SELECT`), **cuando** se procesa en el sandbox, **entonces** la respuesta se renderiza en un Data Grid paginado con métricas de tiempo de ejecución en milisegundos (`12ms`) y consumo de memoria.

### US-06: Gamificación, XP y Rachas
> **Como** usuario recurrente,  
> **quiero** acumular experiencia, subir de nivel y mantener mi racha activa día a día,  
> **para** mantenerme motivado y medir mi progreso real.

* **Criterios de Aceptación:**
  * **Dado** que el usuario resuelve al menos un ejercicio en el día, **cuando** se registra el intento exitoso, **entonces** el contador de racha (*streak*) se incrementa en 1 y se muestra la animación de fuego (`#F59E0B`).
  * **Dado** que el usuario alcanza el umbral de XP de su nivel (ej. 2,000 XP), **cuando** completa el ejercicio, **entonces** asciende de rango (de *Nivel 4: SQL Explorer* a *Nivel 5: Query Architect*) y su tarjeta de perfil se actualiza instantáneamente.

---

## 5. Requerimientos Funcionales Detallados

### 5.1 Módulo 1: Autenticación y Usuarios (`auth-profile`)
* **RF-1.1:** Registro con correo electrónico y contraseña mediante Supabase Auth.
* **RF-1.2:** Inicio de sesión con generación y renovación de tokens JWT.
* **RF-1.3:** Perfil de usuario con `username`, `display_name`, avatar, bio y tags de tecnologías.
* **RF-1.4:** Middleware en FastAPI para validación y verificación criptográfica del JWT emitido por Supabase.

### 5.2 Módulo 2: Rutas y Currículo (`curriculum`)
* **RF-2.1:** Gestión de rutas de aprendizaje estructuradas en modelo piramidal (50 ejercicios en total):
  1. *SQL Foundations* (Principiante — **22 ejercicios** / 44%):
     * Proyecciones y alias (4)
     * Filtros WHERE, operadores lógicos y de rango (`BETWEEN`, `IN`, `LIKE`) (6)
     * Ordenamiento y paginación (`ORDER BY`, `LIMIT`) (4)
     * Funciones de agregación, `GROUP BY` y filtros de grupo con `HAVING` (8)
  2. *Relational SQL* (Principiante/Intermedio — **18 ejercicios** / 36%):
     * `INNER JOIN` básico y con filtros (5)
     * `LEFT JOIN` y detección de registros ausentes con `IS NULL` (5)
     * Consultas multi-tabla (3 tablas cruzadas: Clientes + Pedidos + Detalle) (4)
     * Operadores de conjunto (`UNION`, `UNION ALL`) y `SELF JOIN` (4)
  3. *Advanced Queries* (Intermedio — **10 ejercicios** / 20%):
     * Subconsultas escalares y en cláusula `WHERE` (3)
     * Expresiones condicionales `CASE` (2)
     * Common Table Expressions (`WITH cte AS ...`) (2)
     * Funciones de ventana introductorias (`ROW_NUMBER()`, `RANK()`) (3)
* **RF-2.2:** Módulos y lecciones con contenido explicativo en Markdown.
* **RF-2.3:** Catálogo de 50 ejercicios con enunciados contextualizados en negocios (Comercio, RRHH, Finanzas).
* **RF-2.4:** Sistema de hasta 3 pistas (*hints*) escalonadas por ejercicio.

### 5.3 Módulo 3: Motor de Ejecución y Evaluación (`execution-eval`)
* **RF-3.1:** El servicio `sql-runner` ejecuta las consultas contra una base de datos PostgreSQL aislada en Docker.
* **RF-3.2:** Las conexiones de estudiantes se abren bajo un rol con permisos estrictos de solo lectura (`GRANT SELECT`).
* **RF-3.3:** Límite estricto de tiempo por consulta (`statement_timeout = 2000` ms).
* **RF-3.4:** Límite de filas devueltas (máximo 1,000 filas por consulta para evitar saturación de memoria).
* **RF-3.5:** Comparador semántico de resultados:
  * Coincidencia de nombres de columnas y tipos de datos devueltos.
  * Coincidencia de cardinalidad (número de registros).
  * Coincidencia de valores (incluyendo tratamiento estricto de `NULL`).
  * Validación de orden solo cuando el enunciado lo exija explícitamente (`ORDER BY`).

### 5.4 Módulo 4: Playground (`playground`)
* **RF-4.1:** Editor de consultas libres con esquema exploratorio de tablas relacionales.
* **RF-4.2:** Precarga del dataset semilla `Ecommerce_Production_DB` (10 a 12 tablas relacionadas).
* **RF-4.3:** Historial local/sesión de las últimas 20 consultas ejecutadas por el usuario.
* **RF-4.4:** Exportación de resultados a formato CSV y JSON.

### 5.5 Módulo 5: Gamificación (`gamification`)
* **RF-5.1:** Cálculo de XP por ejercicio resuelto sin pistas (100% XP) o con penalización porcentual por pista revelada.
* **RF-5.2:** Progresión de niveles (Nivel 1: *Query Novice* hasta Nivel 6: *Master DBA*).
* **RF-5.3:** Seguimiento de racha diaria de resolución consecutiva con zona horaria UTC.
* **RF-5.4:** Catálogo inicial de 8 insignias (*badges*) técnicas desbloqueables (ej. *Primer Query*, *Join Master*, *Window Wizard*).

---

## 6. Requerimientos No Funcionales (NFRs)

### 6.1 Rendimiento
* **RNF-1 (Latencia del Runner):** El ciclo completo de ejecución y validación de una consulta debe responder en menos de **800 ms** bajo condiciones normales de red.
* **RNF-2 (Carga de la Interfaz):** First Contentful Paint (FCP) de la aplicación frontend menor a **1.5 s**.
* **RNF-3 (Monaco Editor):** Inicialización del editor de código en menos de **250 ms**.

### 6.2 Seguridad y Aislamiento
* **RNF-4 (Aislamiento de Bases de Datos):** La base de datos de producción (Supabase) y la base de datos de prácticas (Docker Sandbox) residirán en redes e infraestructuras completamente disjuntas. Ninguna query enviada por un usuario tendrá conectividad con Supabase.
* **RNF-5 (Inyecciones y Comandos Destructivos):** El rol de base de datos del sandbox bloqueará cualquier sentencia de tipo `ALTER`, `DROP`, `CREATE`, `INSERT`, `UPDATE`, `DELETE`, `GRANT`, `COPY` o funciones del sistema (`pg_sleep`, `pg_read_file`).
* **RNF-6 (Rate Limiting):** Límite de 30 consultas por minuto por usuario registrado para prevenir ataques de denegación de servicio.

### 6.3 Usabilidad y Compatibilidad
* **RNF-7 (Sistema de Diseño):** Cumplimiento estricto de la guía *Terminal Glow Minimal* (`#0B1020`, tipografía `Inter` + `JetBrains Mono`, bordes luminescentes).
* **RNF-8 (Responsive):** Experiencia completa y adaptable en Desktop (1440px y 1920px), Laptops (1024px) y tablets/móviles mediante sistema de pestañas apiladas.

### 6.4 Autenticidad de Producto y Anti-AI Slop
* **RNF-9 (Validación y Errores en Formularios):** Validación en tiempo real y mensajes de error inline estéticos (color `error: #ffb4ab`) sin recurrir a alerts nativos.
* **RNF-10 (Identidad y Favicon):** Favicon SVG oficial de Qurio integrado en lugar del favicon genérico de Vite/React.
* **RNF-11 (Página 404 Personalizada):** Manejo inmersivo de rutas 404 con temática SQL (`ERROR 404: Relation 'route' does not exist in schema public`).
* **RNF-12 (Meta Títulos Dinámicos):** Actualización de `document.title` según la vista o el ejercicio activo.
* **RNF-13 (Open Graph Tags):** Metadatos `og:title`, `og:description` y tarjeta gráfica `og:image` institucional.
* **RNF-14 (Transparencia en Datos y Privacidad):** Políticas de privacidad y términos redactados en lenguaje humano y conciso, con datos de contacto reales y verificables.

---

## 7. Alcance y Exclusiones del MVP

### 7.1 Dentro del Alcance (In Scope)
* Aplicación web SPA en React + Vite + TypeScript + Tailwind CSS.
* Backend API en Python con FastAPI.
* Integración con Supabase para Auth y base de datos de usuarios/currículo.
* Contenedor Docker para PostgreSQL Sandbox de ejecución.
* 3 Rutas completas y 50 ejercicios con evaluación semántica.
* Editor Monaco con resaltado de sintaxis PostgreSQL y autocompletado básico.
* Dashboard, Rutas, Detalle de Ruta, IDE de Ejercicio, Playground, Logros y Perfil.

### 7.2 Fuera del Alcance (Out of Scope para el MVP)
* Laboratorios efímeros de DDL con terminales SSH dedicadas.
* Soporte para múltiples motores (MySQL, SQL Server, Oracle).
* Chat o tutoría mediante Inteligencia Artificial generativa.
* Pasarelas de pago (Stripe), planes de suscripción o paywalls.
* Modo multijugador o edición colaborativa en tiempo real.
* Aplicación móvil nativa (iOS / Android).

---

## 8. Límites y Reglas de Desarrollo (Boundaries)

* **Siempre hacer (Always):**
  * Escribir TypeScript en modo estricto (`strict: true`).
  * Estructurar todos los componentes de interfaz bajo el árbol de Atomic Design Pragmático (`atoms`, `molecules`, `organisms`, `templates`).
  * Utilizar consultas parametrizadas o el cliente oficial de Supabase para operaciones de la aplicación.
  * Ejecutar el linter y pruebas automáticas antes de confirmar cambios.
  * Validar esquemas de entrada en FastAPI con modelos Pydantic.
* **Preguntar primero (Ask first):**
  * Modificaciones en el esquema de base de datos de Supabase.
  * Incorporación de nuevas dependencias npm o paquetes pip.
  * Alteraciones a los contratos de los endpoints `/api/v1`.
* **Nunca hacer (Never):**
  * Permitir que una consulta de un usuario se ejecute en la base de datos de Supabase.
  * Subir claves secretas (`service_role_key` de Supabase o credenciales de base de datos) al repositorio.
  * Crear componentes visuales sueltos fuera del árbol de Atomic Design o crear átomos artificiales de envoltura innecesarios.
  * Desactivar reglas de tipado con `@ts-ignore` o `Any` en Python sin justificación expresa.
  * Realizar comparaciones de texto plano para evaluar ejercicios SQL.
  * Añadir banners de cookies innecesarios o páginas de gracias típicas de plantillas comerciales.
  * Incluir información de contacto falsa o marcadores genéricos de plantillas de IA.

---

## 9. Criterios de Éxito del MVP
El MVP se considerará exitoso y listo para lanzamiento cuando:
1. Un nuevo usuario pueda registrarse e iniciar sesión sin errores.
2. Pueda recorrer los 50 ejercicios de las 3 rutas y recibir retroalimentación precisa en cada uno.
3. El motor de evaluación apruebe soluciones funcionalmente equivalentes (ej. `LEFT JOIN ... WHERE NULL` vs `NOT EXISTS`).
4. Cualquier intento de ejecutar consultas maliciosas (`DROP TABLE`, `pg_sleep`) sea abortado de forma segura en menos de 2 segundos sin afectar a la plataforma.
5. El diseño visual sea 100% fiel a los mockups interactivos de Stitch.
