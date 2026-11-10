# Qurio — Informe de Pruebas End-to-End (E2E) en Navegador Real

**Identificador:** `QURIO-PHASE-11-E2E-REPORT`  
**Fecha de ejecución:** 10 de Noviembre de 2026  
**Navegador empleado:** Google Chrome 134+ (Modo Real Headless, Windows 11)  
**Entorno de ejecución:** 
* Frontend: Node SPA Server (`apps/web/e2e/spa_server.mjs`) sirviendo `apps/web/dist` en `http://localhost:5173`.
* Backend API: FastAPI (Python 3.12 / 3.14) en Docker en `http://localhost:8000`.
* Base de Datos Sandbox: PostgreSQL 16 (Docker `qurio-postgres-sandbox`) en `localhost:5433`.
* Autenticación: Intercepción controlada de red con Playwright (`page.route()`) para aislar Supabase Cloud de escrituras de prueba.
**Resultado Global:** **19 Pruebas Ejecutadas / 19 Pruebas Pasadas (100% Éxito)**

---

## 1. Metodología y Arquitectura del Banco de Pruebas

Para garantizar una validación fidedigna de la experiencia del estudiante y evitar cualquier simulación artificial:
1. **Compilación de Producción:** Las pruebas se ejecutaron sobre los activos minificados reales generados por Vite (`npm run build`).
2. **Motor de Navegador:** Se invocó el binario oficial de Google Chrome instalado en el sistema (`C:\Program Files\Google\Chrome\Application\chrome.exe`) utilizando Playwright Chromium Automation.
3. **Pila Completa Levantada:** FastAPI y el contenedor PostgreSQL Sandbox de Docker procesaron todas las consultas SQL enviadas por el navegador.
4. **Protección de Producción:** Las rutas de autenticación de Supabase (`/auth/v1/signup`, `/auth/v1/recover`) fueron interceptadas en la capa de red del navegador mediante regex para comprobar las respuestas y estados visuales del modal sin emitir peticiones no autorizadas ni ensuciar la base de datos de producción.

---

## 2. Resumen de Flujos Evaluados

| ID | Flujo del Estudiante / Plataforma | Módulo Involucrado | Resultado | Tiempo / Detalle |
|:---|:---|:---|:---:|:---|
| **T01** | Carga inicial del Dashboard para visitante | `DashboardLayout`, `TopHeader` | **PASSED** | Título: `"Dashboard \| Qurio"` |
| **T01.1** | Estado visual de Invitado | `TopHeader` | **PASSED** | Botón `"Iniciar Sesión"` visible |
| **T02** | Navegación hacia Rutas de Aprendizaje | `TracksView`, `routing.ts` | **PASSED** | URL: `/tracks`, Título actualizado |
| **T03** | Deep link a reto específico (Reto 1) | `WorkspaceLayout`, `App.tsx` | **PASSED** | Título: `"Catálogo Básico de Productos..."` |
| **T03.1** | Inspección de esquema relacional | `ExerciseSpecPanel` | **PASSED** | 10 tablas visibles, muestra de datos OK |
| **T04** | Retención de borrador tras recarga (F5) | `persistence.ts` (C-05) | **PASSED** | Borrador SQL restaurado intacto |
| **T05** | Evaluación semántica con fallo pedagógico | `evaluator.py`, `DataGridResults` | **PASSED** | Badge `"DISCREPANCIA"` y diff semántico |
| **T06** | Solución correcta en modo invitado | `api.ts`, `persistence.ts` | **PASSED** | Registrado en storage, 0 XP oficial |
| **T06.1** | Purga automática de borrador tras éxito | `persistence.ts` (C-05) | **PASSED** | Clave de borrador eliminada de storage |
| **T07** | Límite de prueba (Trial) de 3 retos para invitados | `exercises.py`, `DataGridResults` | **PASSED** | HTTP 401 `REGISTRATION_REQUIRED_AFTER_TRIAL` |
| **T08** | Validación inline de contraseña corta en registro | `AuthModal.tsx` | **PASSED** | Mensaje `"al menos 6 caracteres"` sin alerts |
| **T08.1** | Pantalla interactiva de activación de cuenta | `AuthModal.tsx` | **PASSED** | Badge `"CORREO DE ACTIVACIÓN ENVIADO"` |
| **T09** | Recuperación de contraseña (Forgot password) | `AuthModal.tsx` | **PASSED** | Badge `"ENLACE DE RECUPERACIÓN ENVIADO"` |
| **T10** | Navegación a SQL Playground interactivo | `SqlPlaygroundView` | **PASSED** | Título: `"SQL Playground \| Qurio"` |
| **T10.1** | Ejecución de consulta libre en Playground | `SqlPlaygroundView`, `DataGridResults` | **PASSED** | Renderizado tabular de categorías OK |
| **T11** | Página 404 temática con metáfora técnica SQL | `NotFoundView.tsx` | **PASSED** | Título: `"ERROR 404: Relation Not Found"` |
| **T11.1** | Retorno fluido al Dashboard desde 404 | `NotFoundView.tsx` | **PASSED** | Redirección SPA instantánea |
| **T12** | Perfil de usuario y estado autenticado simulado | `UserProfileView.tsx` | **PASSED** | Título: `"Mi Perfil \| Qurio"`, avatar y XP |
| **T13** | Resiliencia ante caída o error 500 en API | `api.ts`, `DataGridResults.tsx` | **PASSED** | Error capturado inline sin colapso de UI |

---

## 3. Detalle de Pruebas y Evidencia Paso a Paso

### Flujo 1: Experiencia de Invitado, Carga Inicial y Enrutamiento (T01 - T03)
* **Objetivo:** Comprobar que un estudiante sin credenciales accede al Dashboard de forma rápida, visualiza el isotipo oficial de Qurio, observa el botón de "Iniciar Sesión" y puede navegar entre el catálogo de rutas y los retos interactivos.
* **Acción ejecutada:** Navegación inicial a `http://localhost:5173/`, verificación de `document.title` dinámico, clic en "Rutas de Aprendizaje" y navegación por deep link a `/exercises/e0000000-0000-0000-0000-000000000001`.
* **Resultado:**
  * Carga inicial completada en menos de 1000 ms.
  * Título dinámico: `Dashboard | Qurio` y posteriormente `Catálogo Básico de Productos — SQL Foundations | Qurio`.
  * La pestaña "Esquema" del panel lateral (`ExerciseSpecPanel`) desplegó las 10 tablas canónicas del Sandbox (`productos`, `categorias`, `clientes`, `pedidos`, `detalles_pedidos`, etc.).

### Flujo 2: Preservación de Borrador en Recarga F5 (T04)
* **Objetivo:** Comprobar que el trabajo en progreso de un estudiante en el Monaco Editor no se pierde si recarga la página o cierra accidentalmente la pestaña (Cumplimiento C-05).
* **Acción ejecutada:** Se inyectó en el editor una consulta en progreso:
  ```sql
  SELECT nombre_producto, precio FROM productos WHERE precio > 10; -- draft test
  ```
  Se forzó un refresco completo de página (`page.reload({ waitUntil: 'load' })`).
* **Resultado:** Al reiniciar el ciclo de vida de React, la clave `qurio_draft_sql_e0000000-0000-0000-0000-000000000001` fue leída desde `localStorage`, restaurando el texto en el editor sin ninguna pérdida.

### Flujo 3: Evaluación Semántica — Fallo Pedagógico y Comparativa Semántica (T05)
* **Objetivo:** Verificar la retroalimentación ante una consulta incorrecta.
* **Consulta enviada:** `SELECT nombre_producto FROM productos;` (falta la columna `precio`).
* **Respuesta de FastAPI:** `status: "FAILED"`, mensaje pedagógico indicando discrepancia en la proyección.
* **Resultado en UI:**
  * El botón "Enviar Solución" activó el estado de carga (`isLoading`).
  * `DataGridResults` mostró de forma inmediata el badge de estado `"DISCREPANCIA"`.
  * La pestaña `"Comparativa Semántica"` se activó automáticamente permitiendo al estudiante contrastar las columnas obtenidas frente a las esperadas.

### Flujo 4: Evaluación Semántica — Solución Exitosa en Modo Invitado (T06 & T06.1)
* **Objetivo:** Validar la resolución exitosa de un reto en modo invitado, garantizando la persistencia local en `qurio_guest_progress_v1`, la purga del borrador y la ausencia de mutaciones no autorizadas en Supabase Cloud.
* **Consulta enviada:** `SELECT nombre_producto, precio FROM productos;`.
* **Respuesta de FastAPI:**
  ```json
  {
    "status": "PASSED",
    "execution_time_ms": 1.11,
    "xp_awarded": 30,
    "columns": ["nombre_producto", "precio"],
    "rows": [["ProBook Ultra 16 M3", 1450], ...],
    "message": "¡Reto Superado con Éxito en modo invitado! Inicia sesión para guardar tu progreso y ganar XP."
  }
  ```
* **Resultado en UI:**
  * Se renderizó el banner `"¡Reto Superado con Éxito!"` con el badge `"SOLUCIÓN VÁLIDA"`.
  * Se verificó en `localStorage` la adición del objeto a `qurio_guest_progress_v1` con `sync_status: 'pending'`.
  * El borrador temporal `qurio_draft_sql_<id>` fue automáticamente purgado de `localStorage` al confirmarse el éxito.

### Flujo 5: Enforce del Límite de Prueba (Trial) para Invitados (T07)
* **Objetivo:** Confirmar que un usuario sin registrar no puede avanzar más allá del 3er ejercicio resuelto (Regla D-03 / D-05).
* **Acción ejecutada:** Se simularon 3 retos aprobados en `qurio_guest_progress_v1` y se navegó al Reto 4 (`e0000000-0000-0000-0000-000000000004`). Se intentó evaluar una consulta válida.
* **Respuesta de FastAPI:** Código HTTP 401 Unauthorized con detalle `REGISTRATION_REQUIRED_AFTER_TRIAL`.
* **Resultado en UI:** El panel de resultados interceptó el error y presentó de manera clara el aviso indicando que se requiere registro para continuar con el currículo.

### Flujo 6: Flujos de Autenticación, Registro y Recuperación de Contraseña (T08 - T09)
* **Objetivo:** Validar los formularios de inicio de sesión, registro y olvido de contraseña conforme a las directrices Anti-AI Slop (sin `alert()` nativo, con validación inline tipada y pantallas interactivas de confirmación).
* **Acción ejecutada:**
  1. Se abrió el modal desde el botón de cabecera.
  2. Se seleccionó la pestaña "Registrarse".
  3. Se ingresó una contraseña de 3 caracteres (`123`): la validación inline mostró `"La contraseña debe tener al menos 6 caracteres"` sin alterar el layout.
  4. Se completó con una contraseña segura (`SafePilotPass2026!`): la llamada a Supabase Auth fue interceptada con éxito retornando la pantalla interactiva con el badge `"CORREO DE ACTIVACIÓN ENVIADO"`.
  5. Se probó el enlace `"¿Olvidaste tu contraseña?"`, se envió una solicitud de correo y se verificó la pantalla de confirmación `"ENLACE DE RECUPERACIÓN ENVIADO"`.

### Flujo 7: SQL Playground Libre (T10 - T10.1)
* **Objetivo:** Comprobar la consola libre de SQL para experimentación.
* **Consulta enviada:** `SELECT categoria_id, nombre_categoria FROM categorias ORDER BY categoria_id LIMIT 3;`.
* **Resultado:** La consulta se ejecutó en el contenedor de PostgreSQL en 1.2 ms, y el `DataGridResults` renderizó de manera fluida las 3 filas correspondientes a `Laptops & Computación`, `Monitores & Pantallas` y `Periféricos`.

### Flujo 8: Error 404 Temático SQL y Resiliencia de Red (T11 - T13)
* **Objetivo:** Validar la presentación de errores y la robustez de la aplicación ante contingencias técnicas.
* **Resultados:**
  * Al acceder a `/ruta-inexistente-error-404`, la aplicación renderizó la vista `NotFoundView` con el mensaje: `ERROR 404: Relation 'route' does not exist in schema public` y el botón interactivo que retornó de inmediato al Dashboard.
  * Al simular una respuesta HTTP 500 en `/api/v1/exercises/*/submit`, la aplicación capturó el error en línea dentro del panel de resultados sin que la ventana colapsara ni se congelara el Monaco Editor.

---

## 4. Conclusión del Banco de Pruebas E2E

La suite de 19 pruebas de integración en Google Chrome se ejecutó de extremo a extremo sin ninguna omisión ni enmascaramiento, confirmando que la experiencia del usuario y la estabilidad operativa de Qurio cumplen los estándares exigidos para el despliegue del piloto.
