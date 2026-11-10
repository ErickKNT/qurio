# Qurio — Informe de Pruebas End-to-End (E2E) en Navegador Real (Fase 11.1)

**Identificador:** `QURIO-PHASE-11.1-E2E-REPORT`  
**Fecha de ejecución:** 10 de Noviembre de 2026  
**Navegador empleado:** Google Chrome 134+ (Modo Real Headless, Windows 11)  
**Entorno de ejecución:** 
* **Frontend:** Servidor SPA estático (`apps/web/e2e/spa_server.mjs`) sirviendo `apps/web/dist` en `http://localhost:5173`.
* **Backend API:** FastAPI (Python 3.14 / 3.12) ejecutándose en contenedor Docker `qurio-api` en `http://localhost:8000`.
* **Base de Datos Sandbox:** PostgreSQL 16 (contenedor Docker `qurio-postgres-sandbox`) en `localhost:5433`.
* **Aislamiento Cloud:** Cero mutaciones en Supabase Cloud.  
**Resultado Global:** **19 Pruebas Ejecutadas / 19 Pruebas Pasadas (100% Éxito Reproducible)**

---

## 1. Clasificación Honesta y Transparente de las Pruebas E2E

Para garantizar una integridad técnica absoluta y desterrar cualquier enmascaramiento o simulación de conveniencia, la suite de 19 pruebas de `apps/web/e2e/pilot_e2e_suite.mjs` se clasifica explícitamente en los siguientes cuatro niveles de fidelidad:

### Nivel 1 (Tier A): Navegador Real contra Stack Local Real (FastAPI + Sandbox Docker PostgreSQL)
Pruebas donde el navegador interactúa directamente con los servidores locales reales, Monaco Editor, la API de FastAPI y la base de datos de práctica aislada en Docker:
* **T01 & T01.1:** Carga del Dashboard e inspección de elementos de cabecera de invitado.
* **T02:** Navegación cliente a la vista de Rutas de Aprendizaje (`/tracks`).
* **T03 & T03.1:** Deep link directo a Reto 1 e inspección de las 10 tablas canónicas en el panel de esquema relacional.
* **T05:** Evaluación semántica de consulta incorrecta (`SELECT nombre_producto FROM productos;`), validada en PostgreSQL Sandbox y retornando el badge de discrepancia con comparativa de columnas.
* **T06 & T06.1:** Evaluación semántica de consulta correcta (`SELECT nombre_producto, precio FROM productos;`), ejecutada en PostgreSQL Sandbox, con respuesta certificada de `xp_awarded: 0` y purga del borrador SQL.
* **T10 & T10.1:** Navegación a SQL Playground y ejecución libre de consulta relacional retornando registros reales de categorías.
* **T11 & T11.1:** Renderizado de página 404 temática SQL con redirección de regreso al Dashboard.

### Nivel 2 (Tier B): Pruebas con Interceptación Controlada de Red (`page.route()`)
Pruebas donde se utilizó la capacidad de intercepción de Playwright para simular respuestas específicas de red y proteger la base de datos de producción:
* **T08.1:** Intercepción de `POST /auth/v1/signup` para verificar que la UI despliegue la pantalla interactiva `"CORREO DE ACTIVACIÓN ENVIADO"` sin crear registros basura en Supabase Cloud.
* **T09:** Intercepción de `POST /auth/v1/recover` para comprobar el mensaje `"ENLACE DE RECUPERACIÓN ENVIADO"` sin consumir la cuota de correos transaccionales del proyecto.
* **T13:** Intercepción de `/api/v1/exercises/*/submit` simulando un error HTTP 500 para comprobar que el frontend captura la excepción inline sin colapsar la vista.

### Nivel 3 (Tier C): Pruebas con Estado Local Inyectado (`localStorage`)
Pruebas que evalúan la lógica de almacenamiento del navegador manipulando claves específicas:
* **T04:** Inyección de `qurio_draft_sql_<id>` y verificación de persistencia tras un refresco de página (F5) en el Monaco Editor.
* **T07:** Inyección de 3 retos completados en `qurio_guest_progress_v1` para verificar que, al intentar enviar el 4º reto, el backend FastAPI responde con el bloqueo HTTP 401 `REGISTRATION_REQUIRED_AFTER_TRIAL`.
* **T12:** Inyección de un perfil en `qurio_profile_cache_*` para validar el renderizado de la vista de perfil de usuario sin requerir login interactivo.

### Nivel 4 (Tier D): Flujos que Requieren Proveedor Real en la Nube (No Ejecutados en E2E)
Flujos deliberadamente omitidos de la suite automatizada para cumplir la directriz de **Zero Cloud Mutations**:
* Recepción real de correo electrónico en bandeja de entrada con token de verificación PKCE.
* Inicio de sesión federado vía proveedores OAuth (Google / GitHub).
* Persistencia y sincronización multi-dispositivo en la nube para cuentas reales.

---

## 2. Resumen Consolidado de Resultados

| ID de Prueba | Nivel de Prueba | Flujo Validado | Resultado | Detalle Empírico de Validación |
|:---|:---:|:---|:---:|:---|
| **T01** | Tier A | Carga Inicial de Dashboard | **PASSED** | Título: `"Dashboard \| Qurio"`. Carga < 1000ms. |
| **T01.1** | Tier A | Estado de Invitado en TopHeader | **PASSED** | Botón `"Iniciar Sesión"` presente en DOM. |
| **T02** | Tier A | Navegación a Rutas de Aprendizaje | **PASSED** | URL: `/tracks`, Título: `"Rutas de Aprendizaje \| Qurio"`. |
| **T03** | Tier A | Deep Link a Reto 1 | **PASSED** | Título: `"Catálogo Básico de Productos — SQL Foundations \| Qurio"`. |
| **T03.1** | Tier A | Pestaña Esquema en IDE | **PASSED** | 10 tablas canónicas visibles; tabla `productos` auditada. |
| **T04** | Tier C | Preservación de Borrador en F5 | **PASSED** | Borrador SQL restaurado en Monaco Editor tras recarga forzada. |
| **T05** | Tier A | Evaluación Semántica — Fallo | **PASSED** | Badge `"DISCREPANCIA"` y pestaña Comparativa Semántica activados. |
| **T06** | Tier A | Evaluación Correcta — Invitado | **PASSED** | **Certificado: `xp_awarded: 0`**. Guardado en `qurio_guest_progress_v1`. |
| **T06.1** | Tier A | Purga Automática de Borrador | **PASSED** | Borrador temporal eliminado de storage tras respuesta `PASSED`. |
| **T07** | Tier A/C | Límite de Prueba de Invitados | **PASSED** | **HTTP 401 `REGISTRATION_REQUIRED_AFTER_TRIAL`** en 4º reto. |
| **T08** | Tier A | Validación Inline de Contraseña | **PASSED** | Mensaje `"al menos 6 caracteres"` capturado sin alerts nativos. |
| **T08.1** | Tier B | Pantalla Interactiva de Activación | **PASSED** | Banner `"CORREO DE ACTIVACIÓN ENVIADO"` renderizado. |
| **T09** | Tier B | Recuperación de Contraseña | **PASSED** | Banner `"ENLACE DE RECUPERACIÓN ENVIADO"` verificado. |
| **T10** | Tier A | Navegación a SQL Playground | **PASSED** | Título: `"SQL Playground \| Qurio"`. |
| **T10.1** | Tier A | Ejecución Libre en Playground | **PASSED** | DataGrid renderizó 3 filas de categorías ejecutadas en sandbox. |
| **T11** | Tier A | Página 404 Temática SQL | **PASSED** | Título: `"ERROR 404: Relation Not Found \| Qurio"`. |
| **T11.1** | Tier A | Retorno a Dashboard desde 404 | **PASSED** | Clic en `"Volver al Dashboard"` redirige a `/` instantáneamente. |
| **T12** | Tier C | Perfil de Usuario Simulado | **PASSED** | Título: `"Mi Perfil \| Qurio"`. |
| **T13** | Tier B | Resiliencia ante Error 500 de API | **PASSED** | Captura inline de error de red sin caída de interfaz. |

---

## 3. Evidencias Destacadas y Verificaciones Clave

### 3.1 Prueba T06: Demostración de Cero XP Oficial para Invitados (C-03 & D-05)
Durante la ejecución de T06, el navegador Google Chrome envió la consulta canónica al endpoint local `POST http://localhost:8000/api/v1/exercises/e0000000-0000-0000-0000-000000000001/submit` sin cabecera `Authorization`.

* **Respuesta de red recibida por el navegador:**
  ```json
  {
    "status": "PASSED",
    "execution_time_ms": 1.13,
    "xp_awarded": 0,
    "columns": ["nombre_producto", "precio"],
    "rows": [
      ["ProBook Ultra 16 M3", 1450],
      ["DevStation Mini i7", 1250],
      ["Gamer Titan RTX", 2100]
    ],
    "message": "¡Reto Superado con Éxito en modo invitado! Inicia sesión para guardar tu progreso y ganar XP."
  }
  ```
* **Aserción automatizada en `pilot_e2e_suite.mjs`:**
  ```javascript
  if (resJson.xp_awarded !== 0) {
    throw new Error(`Infracción C-03 / D-05: La API devolvió xp_awarded = ${resJson.xp_awarded} para un invitado. Debe ser estrictamente 0.`);
  }
  ```
* **Estado en Almacenamiento Local:** Se verificó que el reto fue insertado en `qurio_guest_progress_v1` con `sync_status: 'pending'`, sin realizar ninguna escritura en Supabase Cloud.

### 3.2 Prueba T07: Límite de Prueba para Invitados (D-05)
* Al simular 3 retos en `qurio_guest_progress_v1` e intentar evaluar el 4º reto (`e0000000-0000-0000-0000-000000000004`), FastAPI respondió:
  ```json
  {
    "detail": "Has completado los 3 retos de prueba gratuitos. Regístrate gratis para continuar aprendiendo y guardar tu progreso oficial.",
    "code": "REGISTRATION_REQUIRED_AFTER_TRIAL"
  }
  ```
* La interfaz desplegó el banner de registro sin permitir que el invitado avance sin autenticarse.

---

## 4. Sección de Reconciliación con Informes Anteriores

Esta sección documenta y certifica la corrección del defecto de reporte previo:

1. **Corrección de la Discrepancia de XP en T06:**
   * *Informe anterior:* Se reportó erróneamente `xp_awarded: 30` en el resumen de T06.
   * *Causa raíz:* La imagen del contenedor `qurio-api` en Docker se había compilado antes de incorporar la lógica de cota de XP y no contaba con volumen en vivo montado.
   * *Solución aplicada:* Se añadió `./apps/api/app:/app/app:ro` en `docker-compose.yml`, se reconstruyó la imagen y se incorporó una aserción estricta en la suite Playwright. La prueba T06 ahora verifica de forma indeleble que `xp_awarded` es exactamente 0.
2. **Eliminación de Máscaras de Simulación:**
   * Se diferenció con total transparencia qué pruebas ejecutaron el backend real contra la base de datos PostgreSQL, cuáles utilizaron intercepción de red de Playwright y cuáles evaluaron `localStorage`.
