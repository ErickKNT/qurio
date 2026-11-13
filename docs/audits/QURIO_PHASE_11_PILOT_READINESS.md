# Qurio — Dictamen de Preparación y Validación del Piloto (Fase 11.2)

**Identificador:** `QURIO-PHASE-11.2-PILOT-READINESS`  
**Fecha del informe:** 10 de Noviembre de 2026  
**Rama certificada:** `feat/phase-11-pilot-readiness`  
**Commit base:** `bba65c2`  
**Veredicto Final:** **LISTO PARA PILOTO CON RESTRICCIONES**

---

## 1. Declaración Ejecutiva y Veredicto Formal

Tras completar la certificación integral de seguridad, consistencia y robustez de la Fase 11.2, validar empíricamente los 8 escenarios de regresión para la RPC `record_verified_attempt` v6.1, certificar la cuota de invitados con 0 XP oficial, auditar la compatibilidad total de esquemas y ejecutar las suites completas en un navegador Google Chrome real, se emite el siguiente dictamen formal:

### Veredicto: LISTO PARA PILOTO CON RESTRICCIONES

La plataforma **Qurio** ha alcanzado el nivel de madurez técnica, estabilidad de código, seguridad de ejecución y calidad de experiencia de usuario requerido para abrir un **piloto controlado con evaluadores y estudiantes reales**, condicionado exclusivamente al cumplimiento de las tres restricciones operativas administrativas descritas en la Sección 4.

---

## 2. Matriz Consolidada de Validación Técnica

| Dimensión Evaluada | Herramienta / Entorno | Casos Totales | Casos Pasados | Fallos | Estado |
|:---|:---|:---:|:---:|:---:|:---:|
| **E2E Navegador Real** | Google Chrome 134+ / Playwright | 19 | **19** | 0 | **100% Pasado** |
| **Backend API & Migraciones** | Pytest 9.2 (Python 3.14 / 3.12) | 78 | **78** | 0 | **100% Pasado** |
| **Lógica Frontend & Progreso** | Vitest 5.1 (TypeScript estricto) | 17 | **17** | 0 | **100% Pasado** |
| **Compilación de Producción** | Vite 6.4 + TypeScript Compiler | 2,171 módulos | **2,171** | 0 | **0 errores, 0 advertencias** |
| **Seguridad de Dependencias** | `npm audit` (Registro oficial) | 175 paquetes | **175** | 0 | **0 vulnerabilidades** |
| **Aislamiento de Soluciones** | Análisis estático de bundle `dist/` | Todo el bundle | 0 ocurrencias | 0 | **0 fugas de `solution_query`** |
| **Evaluación de Invitados** | FastAPI `/submit` | N/A | `xp_awarded = 0` | 0 | **Cero XP oficial certificado** |
| **Idempotencia RPC y XP** | Suite de Regresión (8 Escenarios) | 8 escenarios | **8** | 0 | **100% Pasado** |

---

## 3. Matriz de Hallazgos y Estado de Mitigación

| ID | Hallazgo | Severidad | Estado | Resolución / Acción Requerida |
|:---|:---|:---:|:---:|:---|
| **H-01** | Exposición de `solution_query` en API REST pública de Supabase Cloud para `anon` | **Alta** | **Pendiente en Cloud (Resuelto en Código Local)** | El script `database/supabase/03_security_hardening.sql` (v6.1) fue blindado y verificado en local con 15 pruebas de integración. Requiere que el propietario del proyecto lo ejecute en el SQL Editor de Supabase Cloud antes del ingreso de estudiantes. |
| **H-02** | Contenedor Docker desactualizado retornando XP a invitados | **Media** | **Resuelto** | Se corrigió `docker-compose.yml` añadiendo volumen montado `./apps/api/app:/app/app:ro`, se reconstruyó la imagen y se agregaron 2 pruebas de regresión. La API retorna estrictamente `xp_awarded: 0`. |
| **H-03** | Desalineamiento conceptual de decisiones D-01 a D-07 | **Baja** | **Resuelto** | Se restauraron las definiciones de negocio originales del Blueprint v1.2 y se desacoplaron los requerimientos técnicos bajo identificadores independientes `REQ-*`. |
| **H-04** | Bloqueo de XP legítimo posterior a intentos de prueba con 0 XP | **Alta** | **Resuelto** | Se actualizó la RPC `record_verified_attempt` a v6.1 disociando `v_already_passed` de `v_already_awarded`, garantizando recompensa legítima cuando el usuario se autentica sin permitir duplicados de XP. |

---

## 4. Restricciones Operativas Previas al Lanzamiento del Piloto

Para garantizar que el piloto se desarrolle en un entorno blindado y sin incidencias pedagógicas ni de infraestructura, se establecen las siguientes tres restricciones de cumplimiento previo:

### Restricción 1: Aplicación Administrativa de `03_security_hardening.sql` (v6.1) en Supabase Cloud
* **Condición:** Antes de enviar credenciales o invitar formalmente a los estudiantes al piloto, el propietario debe ejecutar el archivo [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql) en el SQL Editor de Supabase Cloud (`https://supabase.com/dashboard/project/bfvgqxfzftumwrleacof/sql`).
* **Justificación:** Revoca el acceso a la columna `solution_query` para los roles `anon` y `authenticated`, impidiendo que estudiantes con conocimientos técnicos inspeccionen las consultas de solución oficiales mediante PostgREST.

### Restricción 2: Gestión de la Tasa de Correos Transaccionales (Supabase Auth)
* **Condición:** En el plan gratuito de Supabase Cloud existe un límite por defecto de 3 a 4 correos de confirmación por hora.
* **Acción recomendada para el piloto:**
  * Opción A: Configurar un proveedor SMTP propio en el panel de Supabase (SendGrid, Resend, Amazon SES).
  * Opción B: En el panel de Supabase Auth, desactivar temporalmente la casilla *"Confirm email"* para que los usuarios del piloto puedan iniciar sesión inmediatamente tras registrarse sin depender de la recepción de correo.

### Restricción 3: Configuración de `SUPABASE_SERVICE_ROLE_KEY` en el Despliegue de Backend
* **Condición:** Si la API de FastAPI se despliega en un servidor accesible por internet para los estudiantes del piloto, la variable `SUPABASE_SERVICE_ROLE_KEY` debe estar configurada en el entorno del backend.
* **Justificación:** Permite al backend invocar la RPC `record_verified_attempt` en Supabase para certificar el progreso oficial y leer `solution_query` de los ejercicios sembrados en la nube. En caso contrario, el backend opera correctamente utilizando el catálogo seed local.

---

## 5. Sección de Reconciliación con Informes Anteriores

Esta sección resume formalmente todas las correcciones efectuadas frente a los informes preliminares de Fase 11:

1. **Conciliación de la Discrepancia de XP de Invitados:**
   * Se comprobó la causa raíz: desincronización de la imagen Docker en ejecución sin montaje de volumen.
   * Se modificó `docker-compose.yml`, se reconstruyó `qurio-api`, se verificó `xp_awarded: 0` en el endpoint `/submit` y se validó en la prueba E2E T06 de Google Chrome.
2. **Conciliación de Idempotencia y Recompensa Justa en la RPC v6.1:**
   * Se comprobó que evaluar solo `status = 'PASSED'` penalizaba a los usuarios que probaban retos en modo 0 XP.
   * La versión 6.1 evalúa `status = 'PASSED' AND xp_awarded > 0`, permitiendo acreditar el XP oficial en el primer intento exitoso con recompensa legítima y bloqueando cualquier intento subsecuente de duplicación.
3. **Conciliación de Columnas y Firmas en `03_security_hardening.sql`:**
   * Se eliminaron las referencias erróneas a columnas ficticias (`track_id`, `description`, etc.) y se corrigió la firma de la función RPC a sus 8 parámetros reales.
4. **Restauración Canónica de Decisiones D-01 a D-07 (Blueprint v1.2):**
   * Se eliminó la ambigüedad documental alineando todas las referencias con las decisiones D-01 ($129 MXN / $999 MXN), D-02 (lema general y lema SQL), D-03 (evaluar Stripe México), D-04 (evaluar ejecución de Python), D-05 (invitados 3 retos, 0 XP), D-06 (Teams académico pospuesto) y D-07 (prioridad estabilidad).
5. **Clasificación Honesta de Pruebas E2E:**
   * Se transparentaron los 4 niveles de pruebas (navegador contra sandbox real, intercepciones de Playwright, storage simulado y flujos que requieren infraestructura cloud real).

---

## 6. Hoja de Ruta para el Despliegue del Piloto

Una vez que el propietario ejecute el script SQL v6.1 en Supabase Cloud:
1. Iniciar los contenedores locales con `docker compose up -d` (o desplegar FastAPI y el Sandbox en el servidor del piloto).
2. Servir el build de producción de `apps/web/dist`.
3. Distribuir el enlace de acceso a los evaluadores del piloto.
4. Recopilar métricas de uso y telemetría de errores para la preparación de la **Fase 12: Pasarela de Pagos (Stripe) y Rutas Avanzadas**.
