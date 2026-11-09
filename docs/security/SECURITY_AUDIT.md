# Auditoría Técnica de Seguridad, Arquitectura y Plan de Remediación — Qurio

**Proyecto:** Qurio (Plataforma Interactiva de Aprendizaje SQL)  
**Fecha de Actualización:** 9 de Noviembre de 2026  
**Equipo Auditor:**
- Senior Software Architect
- Senior Backend Engineer (Python, FastAPI, PostgreSQL)
- Application Security Engineer (AppSec)
- Database Security Engineer (PostgreSQL, Supabase)
- Senior Frontend Engineer (React, TypeScript)
- QA Automation Engineer

**Estado del Documento:** Plan Técnico Refinado y Aprobado para Ejecución  
**Rama de Trabajo Aislada:** `security/phase-9-hardening`

---

## 1. Resumen Ejecutivo y Diagnóstico Global

Qurio cuenta con una arquitectura de tres capas bien estructurada: un frontend moderno en React 18 con Atomic Design y Monaco Editor, un motor de backend en FastAPI con pool `asyncpg` y evaluador semántico multiconjunto, y una infraestructura híbrida compuesta por un Sandbox PostgreSQL 16 aislado en Docker (`ecommerce_sandbox`) y Supabase Cloud para autenticación y persistencia de usuarios.

La plataforma funciona satisfactoriamente para flujos normales; sin embargo, una auditoría técnica profunda revela vulnerabilidades estructurales en las fronteras de confianza del sistema:

1. **El Frontend tiene autoridad indebida sobre el XP y el progreso:** El cliente calcula y actualiza directamente en Supabase los puntos de experiencia (`xp`), el `level` y el estado de los ejercicios completados sin que el backend intervenga ni valide criptográficamente la identidad del usuario.
2. **El filtrado SQL del Runner depende de expresiones regulares:** La validación de consultas no utiliza un analizador sintáctico (AST parser), provocando tanto **falsos positivos** (rechaza queries legítimas del currículo con cadenas de texto que contienen palabras reservadas o punto y coma) como **riesgos de denegación de servicio** (consultas recursivas descontroladas).
3. **Los endpoints de ejecución en FastAPI carecen de autenticación y Rate Limiting:** Cualquier cliente puede enviar consultas ilimitadas al Sandbox sin identificarse, arriesgando saturación del pool de conexiones.
4. **Exposición de puertos en Docker:** El puerto PostgreSQL 5433 está vinculado a `0.0.0.0` en lugar de `127.0.0.1`.
5. **Gaps en Pruebas Automatizadas:** Existen 26 pruebas en backend, pero 0 pruebas en frontend y 0 pruebas de políticas RLS.

---

## 2. Mapa Arquitectónico y Fronteras de Confianza Propuestas

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA DE SEGURIDAD REVISADA                              │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [1. CLIENTE / FRONTEND] (Zona No Confiable)
   - React 18 + Monaco Editor
   - Supabase Auth: envía JWT de sesión en header `Authorization: Bearer <token>`
   - SOLO lectura y actualización de campos cosméticos (`display_name`, `avatar_url`, `bio`)
   - Cero autoridad sobre XP, niveles, intentos o completitud de retos
                                   │
                                   │ HTTPS / REST (con Bearer JWT)
                                   ▼
 [2. BACKEND API - FASTAPI] (Zona de Autoridad & Orquestación)
   ├─ A. Rate Limiter Middleware:
   │    - Por Usuario (claim `sub` del JWT) para autenticados
   │    - Por IP para usuarios anónimos/invitados
   │    - Concurrencia máxima acotada por Semáforo (`asyncio.Semaphore`)
   ├─ B. Autenticación Criptográfica JWT:
   │    - Valida firma (HMAC-SHA256 con Supabase JWT Secret o JWKS asimétrico)
   │    - Valida claims estrictos: `aud: "authenticated"`, `iss`, y expiración `exp`
   ├─ C. SQL Runner Defensivo (AST Parser con SQLGlot):
   │    - Allowlist de nodos (`Select`, `Union`, `CTE`)
   │    - Distingue literales string de comandos DDL/DML (0 falsos positivos)
   │    - Control de sentencias múltiples en árbol AST
   │    - Permite `WITH RECURSIVE` legítimo pero audita restricciones de seguridad
   └─ D. Evaluador Semántico Dual:
        - Capa A: Equivalencia de datos estricta (preserva `Decimal`, controla escala)
        - Capa B: Inspector pedagógico de AST (verifica uso de funciones solicitadas)
                                   │
                  ┌────────────────┴────────────────┐
                  │                                 │
                  ▼                                 ▼
 [3. POSTGRESQL SANDBOX]              [4. SUPABASE CLOUD]
   - Aislamiento de Red:                - Función Transaccional RPC:
     * Dev: `127.0.0.1:5433:5432`         `record_verified_attempt()`
     * Prod: Red interna Docker           (`SECURITY DEFINER`, `search_path = public, pg_temp`)
   - Rol `readonly_student`:            - Idempotencia: otorga XP 1 sola vez por reto
     * `read_only = on`                 - Column-Level Security (CLS):
     * `statement_timeout = 2000ms`       `REVOKE UPDATE ON user_profiles` (salvo bio/avatar)
     * `lock_timeout = 1000ms`          - Service Role Key resguardado 100% en backend
     * `work_mem = 16MB`
```

---

## 3. Inventario y Estado Inicial de Pruebas

| Capa | Entorno / Herramienta | Pruebas Existentes | Estado | Observación |
|:---|:---|:---:|:---:|:---|
| **Backend API** | Pytest 9.2 + asyncpg | 26 | ✅ 26 PASSED | Evaluador semántico (8), integración básica (8), regex security (10). |
| **Frontend Web** | Ninguno (Sin arnés) | 0 | ❌ No implementado | No hay `vitest` ni `jest` configurados en `apps/web/package.json`. |
| **Políticas RLS** | Supabase REST | 0 | ❌ No implementado | No existen tests que intenten atacar o eludir las políticas de acceso entre usuarios. |
| **Concurrencia / DoS** | Stress scripts | 0 | ❌ No implementado | Sin validación de agotamiento de pool de conexiones bajo carga masiva. |

---

## 4. Verificación y Reclasificación Rigurosa de Hallazgos

| ID | Hallazgo Técnico | Categoría | Evidencia / Fundamento | Vector CVSS v3.1 | Score |
|:---:|:---|:---:|:---|:---|:---:|
| **SEC-01** | **Manipulación Arbitraria de XP y Nivel desde el Cliente** | **Vulnerabilidad Confirmada** | Código en `persistence.ts:74` ejecutando `update({ xp })` directamente vía REST de Supabase + política RLS en `01_schema.sql:185` sin restricción de columnas. | `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N` | **6.5 (Medium/High)** |
| **SEC-02** | **Endpoints de Ejecución sin Auth ni Rate Limiting** | **Vulnerabilidad Confirmada** | Endpoint `/playground/execute` en `router.py:46` accesible por cualquier cliente sin cabecera de autenticación ni limitador de peticiones por IP o usuario. | `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H` | **7.5 (High)** |
| **SEC-03** | **Falsos Positivos y Evasión por RegEx en SQL Runner** | **Vulnerabilidad Confirmada** | `clean_sql.split(";")` rompe queries legítimas con delimitador dentro de strings (`WHERE x = 'A; B'`). RegEx `\bCREATE\b` rechaza `'CREATE your style'`. | `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:L` | **5.3 (Medium)** |
| **SEC-04** | **Falsificación de Intentos en `exercise_attempts` vía RLS** | **Vulnerabilidad Confirmada** | Política RLS `User Insert Own Attempts` en `01_schema.sql:189` permite enviar cualquier `status` (`PASSED`) y `xp_awarded` arbitrarios sin evaluación del backend. | `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N` | **4.3 (Medium)** |
| **SEC-05** | **Vinculación de PostgreSQL Sandbox a `0.0.0.0:5433`** | **Riesgo Potencial de Despliegue** | `docker-compose.yml:10` vincula el puerto a todas las interfaces del host. En servidores sin firewall de host, el puerto queda expuesto a escaneo público. | `CVSS:3.1/AV:A/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N` | **3.1 (Low)** |
| **SEC-06** | **Ausencia de Cabeceras HTTP de Seguridad** | **Deficiencia de Configuración** | `main.py` no implementa middlewares de `SecurityHeaders` (`HSTS`, `CSP`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`). | `CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N` | **3.1 (Low)** |
| **SEC-07** | **Tolerancia Excesiva en Evaluación Numérica** | **Deficiencia de Calidad Pedagógica** | `evaluator.py:16` convierte a `float` y redondea a 3 decimales, admitiendo queries sin `ROUND` como válidas por coincidencia numérica en datasets simples. | Calidad / Lógica Didáctica | **N/A** |
| **SEC-08** | **Ausencia de Pruebas Unitarias en Frontend** | **Deficiencia de Calidad / Cobertura** | `apps/web/package.json` no cuenta con arnés de test automatizado (`vitest`) para verificar regresiones de autenticación, sesión y renderizado. | Calidad / Deuda Técnica | **N/A** |

---

## 5. Estrategia Técnica Detallada de Remediación

### 5.1 SQL Runner y SQLGlot (Defensa en Profundidad sin Bloqueo Indiscriminado)
* **El problema de la RegEx actual:** `clean_sql.split(";")` y listas negras de texto rompen consultas válidas con strings y no previenen ataques AST complejos.
* **Estrategia con SQLGlot (PostgreSQL Dialect):**
  1. **Análisis de Sentencia Única:** `parsed = sqlglot.parse(sql, read="postgres")`. Si `len(parsed) != 1`, se rechaza formalmente por multi-statement sin verse afectado por caracteres dentro de strings.
  2. **Allowlist de Operaciones:** El nodo raíz debe ser obligatoriamente una consulta de lectura: `isinstance(tree, (exp.Select, exp.Union))`. Se prohíben explícitamente nodos de mutación (`exp.Insert`, `exp.Update`, `exp.Delete`, `exp.Drop`, `exp.Alter`, `exp.Create`, `exp.Command`).
  3. **Control Inteligente de `WITH RECURSIVE`:** No se bloquea la recursión porque Qurio enseña SQL avanzado. La contención de bucles infinitos se garantiza mediante:
     - Inspección AST: Se valida que el CTE contenga una unión de caso base (`UNION ALL` / `UNION`) y una proyección finita.
     - Garantía de Ejecución en Motor: `ALTER ROLE readonly_student SET statement_timeout = '2000ms'`. Cualquier recursión descontrolada es abortada por PostgreSQL en exactamente 2 segundos sin afectar al sistema host.
  4. **Restricción de Esquemas y Funciones:** Inspección de llamadas `exp.Anonymous` y `exp.Func` contra una lista negra de administración (`pg_read_file`, `pg_write_file`, `dblink`, `pg_sleep`, `pg_terminate_backend`), y bloqueo de consultas directas a tablas de `information_schema` o `pg_catalog` no autorizadas.

### 5.2 XP, Progreso y Supabase (Autoridad Absoluta del Servidor)
* **Arquitectura de Persistencia Blindada:**
  1. El cliente **ya no ejecuta `supabase.from('user_profiles').update({ xp })`**.
  2. El cliente envía la solución a FastAPI con su Bearer Token.
  3. Tras la evaluación exitosa (`PASSED`), el backend ejecuta la operación transaccional mediante una función RPC en Supabase con `SECURITY DEFINER`:
     ```sql
     CREATE OR REPLACE FUNCTION public.record_verified_attempt(
         p_user_id UUID,
         p_exercise_id UUID,
         p_submitted_sql TEXT,
         p_status VARCHAR,
         p_execution_time_ms INT,
         p_hints_used INT,
         p_base_xp INT
     ) RETURNS JSONB
     LANGUAGE plpgsql
     SECURITY DEFINER
     SET search_path = public, pg_temp
     AS $$
     ...
     $$;
     ```
     * **Seguridad de `search_path`:** `SET search_path = public, pg_temp` previene secuestro de esquemas en funciones con privilegios elevados.
     * **Idempotencia Garantizada:** Verifica si el usuario ya completó el ejercicio previamente en `public.user_progress`. Si ya está superado, registra el intento pero otorga **0 XP adicional**, impidiendo repetición fraudulenta de recompensas.
     * **Atomicidad:** En una única transacción actualiza `exercise_attempts`, `user_progress`, acumula XP en `user_profiles` y registra `user_daily_activity`.
  4. **Seguridad a Nivel de Columnas (CLS) en Supabase:**
     ```sql
     REVOKE UPDATE ON public.user_profiles FROM authenticated;
     GRANT UPDATE (display_name, avatar_url, bio, updated_at) ON public.user_profiles TO authenticated;
     ```
     Esto hace físicamente imposible que un usuario altere su `xp` o `level` desde DevTools, independientemente de cualquier política RLS.

### 5.3 Autenticación y Rate Limiting
* **Validación JWT Compatible con Supabase:**
  * Endpoint de autenticación dependiente (`get_current_user` en FastAPI):
    * Valida firma criptográfica con `PyJWT` contra el `SUPABASE_JWT_SECRET` del proyecto (o JWKS público).
    * Valida audiencia: `aud == "authenticated"`.
    * Valida emisor: `iss == "https://bfvgqxfzftumwrleacof.supabase.co/auth/v1"`.
    * Valida fecha de expiración (`exp`) y emisión (`nbf`).
    * Extrae el `sub` (UUID del usuario en Supabase).
  * **Modo Invitado / Demostración:** Si la petición no lleva cabecera `Authorization`, se permite la ejecución local en el Sandbox pero el backend omite la persistencia en la nube y el otorgamiento de XP oficial.
* **Rate Limiting Escalar y Protección de Recursos:**
  * Concurrencia acotada con `asyncio.Semaphore(18)` en el runner para que las peticiones concurrentes nunca superen la capacidad del pool de conexiones (20).
  * Rate limiter estructurado mediante interfaz abstracta (`RateLimiter`):
    * Por Usuario: 30 ejecuciones/minuto para usuarios autenticados.
    * Por IP: 10 ejecuciones/minuto para peticiones anónimas.
    * Soporta backend en memoria con ventana deslizante para desarrollo local y permite evolucionar a Redis en producción sin cambiar el código de la aplicación.

### 5.4 Docker e Infraestructura (Desarrollo vs Producción)
* **Entorno de Desarrollo (`docker-compose.yml` / local):**
  * Vinculación segura explícita: `ports: - "127.0.0.1:5433:5432"`. Accesible para scripts de prueba locales pero cerrada a la red externa.
* **Entorno de Producción (`docker-compose.prod.yml`):**
  * **Sin mapeo de puertos al host (`ports` omitido):** La base de datos `postgres-sandbox` solo se comunica con el contenedor `api` a través de la red interna `qurio-network`. Nadie desde el exterior puede escanear ni conectar al puerto de Postgres.
  * Límites estrictos de recursos Docker:
    * `cpus: "1.0"`, `memory: 512M` (Sandbox).
    * `cpus: "1.0"`, `memory: 512M` (FastAPI).
  * Ejecución no privilegiada en Dockerfile:
    * `RUN useradd -m -u 1000 qurio && USER qurio` en la imagen de FastAPI.
  * Privilegios de PostgreSQL Sandbox:
    * Rol `readonly_student`: adición de `lock_timeout = '1000ms'`.

### 5.5 Evaluador Semántico: Separación de Resultados y Requisitos Pedagógicos
* **Capa 1: Evaluación Semántica de Datos (Result Equivalence):**
  * Preservar tipos `Decimal` devueltos por `asyncpg` en lugar de convertirlos inmediatamente a `float` nativo.
  * Normalización con escala: si la consulta devuelve un valor monetario o `NUMERIC(10,2)`, comparar cardinalidad y escala requerida.
* **Capa 2: Inspector de Cumplimiento Pedagógico (Feature AST Check):**
  * Como vimos en el ejercicio de precios con IVA, una consulta puede dar el mismo resultado matemático multiplicando directo sin usar `ROUND`.
  * Los ejercicios podrán definir opcionalmente `required_constructs: ["ROUND", "BETWEEN", "INNER JOIN"]`.
  * El evaluador usará SQLGlot para inspeccionar si el estudiante utilizó el concepto didáctico exigido:
    * Si los datos son correctos pero falta la función requerida: El backend informa con status `PEDAGOGICAL_WARNING` o `FAILED` explicando amablemente: *"Tus datos son numéricamente equivalentes, pero la consigna solicita utilizar la función ROUND(expresión, 2)."*

---

## 6. Archivos que se Modificarán

### Backend (`apps/api`):
* `requirements.txt`: Inclusión de `sqlglot>=25.0.0`, `pyjwt>=2.9.0` y `cryptography>=43.0.0`.
* `app/core/config.py`: Parámetros `SUPABASE_JWT_SECRET`, `RATE_LIMIT_PER_MINUTE`, `ENVIRONMENT`.
* `app/core/auth.py` *(Nuevo)*: Dependencia `get_current_user` para validación criptográfica de JWT Supabase.
* `app/modules/runner/security.py`: Implementación del validador AST con SQLGlot (Allowlist, sentencias únicas, desambiguación de strings, control de funciones peligrosas).
* `app/modules/runner/service.py`: Semáforo de concurrencia y retención de tipos `Decimal`.
* `app/modules/runner/evaluator.py`: Soporte de validación pedagógica de AST y precisión numérica estricta.
* `app/modules/runner/router.py`: Inyección de dependencias de auth, rate limiting y orquestación de guardado seguro.
* `app/main.py`: Middleware de cabeceras HTTP de seguridad y rate limit.
* `Dockerfile`: Creación y cambio a usuario no-root `qurio`.

### Base de Datos Supabase (`database/supabase`):
* `03_security_hardening.sql` *(Nuevo script de migración)*:
  * Función transaccional `record_verified_attempt()` con `SECURITY DEFINER`.
  * Column-Level Security en `user_profiles` revocando actualización de `xp` y `level` a usuarios finales.

### Infraestructura:
* `docker-compose.yml`: Enlace del puerto a `127.0.0.1:5433:5432`.
* `database/sandbox/init.sql`: Parámetro `lock_timeout = '1000ms'`.

### Frontend (`apps/web`):
* `src/lib/api.ts`: Envío automático del Bearer Token JWT en `/exercises/{id}/submit`.
* `src/lib/persistence.ts`: Delegación del guardado de XP y nivel al backend cuando el usuario está autenticado, conservando el respaldo local en `localStorage` ante desconexión.

---

## 7. Dependencias Nuevas y Justificación Técnica

| Dependencia | Entorno | Versión Sugerida | Justificación Técnica |
|:---|:---:|:---:|:---|
| `sqlglot` | Backend | `>=25.0.0` | Parser SQL puro de alto rendimiento sin dependencias en C. Soporta dialecto PostgreSQL, tokeniza correctamente literales con delimitadores y genera árboles AST precisos para allowlists. |
| `pyjwt` | Backend | `>=2.9.0` | Estándar de la industria para validación criptográfica estricta de tokens JWT RFC 7519 emitidos por Supabase. |
| `cryptography` | Backend | `>=43.0.0` | Backend criptográfico seguro necesario para verificación de firmas asimétricas y HMAC. |

---

## 8. Riesgos de Compatibilidad y Mitigación

1. **Riesgo: Consultas del currículo bloqueadas por el nuevo parser.**
   * *Mitigación:* Se ejecutará una prueba de regresión automática contra las **18 consultas oficiales del currículo** con el nuevo validador AST antes de promover los cambios.
2. **Riesgo: Estudiantes en modo invitado/offline bloqueados por la autenticación.**
   * *Mitigación:* El endpoint aceptará peticiones anónimas sin JWT para fines pedagógicos locales, pero solo registrará progreso y otorgará XP cuando se proporcione un JWT válido.
3. **Riesgo: Sobrescritura de datos o conflicto con RLS existente.**
   * *Mitigación:* La función RPC `record_verified_attempt()` se ejecuta como `SECURITY DEFINER`, evitando fricciones de permisos en inserciones transaccionales.

---

## 9. Criterios de Aceptación

* [ ] Consultas legítimas con punto y coma dentro de cadenas de texto (ej. `'Item; A'`) son aceptadas y ejecutadas correctamente.
* [ ] Consultas legítimas que contienen palabras como `'CREATE'` o `'DROP'` dentro de literales de texto son aceptadas.
* [ ] Sentencias DDL/DML reales (`DROP TABLE`, `INSERT INTO`, `UPDATE`) son bloqueadas a nivel AST antes de llegar al motor.
* [ ] Intentos de ejecución masiva y concurrente son acotados por el Rate Limiter y el Semáforo del Sandbox.
* [ ] El endpoint `/submit` rechaza tokens JWT manipulados, expirados o con firma inválida.
* [ ] Es imposible alterar el `xp` o `level` de un perfil mediante llamadas directas del cliente a Supabase.
* [ ] Las 18 soluciones del currículo y las 26 pruebas existentes continúan pasando al 100%.
* [ ] Nuevas pruebas unitarias de seguridad demuestran la mitigación de los vectores evaluados.

---

## 10. Orden Exacto de Implementación Propuesto

```
Paso 1: Rama Git Aislada
  └─ Crear la rama `security/phase-9-hardening`.

Paso 2: SQL Runner Defensivo con AST (sqlglot)
  └─ Actualizar `requirements.txt` e implementar `security.py` con AST Parser.
  └─ Añadir suite de pruebas con 15+ casos de evasión y falsos positivos en `test_security.py`.

Paso 3: Infraestructura Local Segura
  └─ Vincular PostgreSQL a `127.0.0.1:5433` y añadir `lock_timeout` en `init.sql`.

Paso 4: Módulo de Autenticación JWT en Backend
  └─ Crear `apps/api/app/core/auth.py` con validación estricta de tokens de Supabase.

Paso 5: Script de Migración y RPC en Supabase
  └─ Crear `database/supabase/03_security_hardening.sql` (RPC atómica e idempotente + CLS).

Paso 6: Conexión Frontend-Backend para Autoridad de XP
  └─ Conectar envío de JWT en `api.ts` y sincronizar `persistence.ts`.

Paso 7: Rate Limiting & Cabeceras HTTP
  └─ Integrar limitador de tasa y middleware de seguridad en `main.py`.

Paso 8: Verificación Completa y Documentación
  └─ Ejecutar suite completa de Pytest, verificar build de Vite y generar `REMEDIATION_LOG.md`.
```

---

## 11. Operaciones que Requieren tu Autorización Explícita

1. **Creación de la rama `security/phase-9-hardening`** e instalación de dependencias en el entorno virtual de la API.
2. **Ejecución del script `database/supabase/03_security_hardening.sql` en Supabase Cloud** (solo cuando el backend esté verificado y listo para asumir el control de XP).

---

## 12. Riesgo Residual Aceptado

Ningún sistema que permita ejecutar SQL arbitrario puede declararse 100% invulnerable. El riesgo residual contemplado se mitiga mediante defensa en profundidad:
* **Capa 1:** Validación semántica AST en FastAPI (rechaza sentencias no deseadas sin falsos positivos en strings).
* **Capa 2:** Rol de solo lectura a nivel PostgreSQL (`default_transaction_read_only = on`).
* **Capa 3:** Aislamiento de proceso con `statement_timeout = 2000ms`, `lock_timeout = 1000ms` y `work_mem = 16MB`.
* **Capa 4:** Contenedor Docker con límites estrictos de CPU (1.0 core) y Memoria (512 MB).
