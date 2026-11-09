# Informe de Resultados de Remediación y Hardening de Seguridad (Fase 9) — Qurio

**Fecha de Actualización:** 9 de Noviembre de 2026  
**Versión:** 2.0 (Revisión Final de Migración, Pruebas de Concurrencia y Precisión Decimal)  
**Rama Git:** `security/phase-9-hardening`  
**Estado:** Implementación Local y Validación Automatizada Concluidas al 100% (Pendiente de Autorización para Despliegue en Supabase Cloud)  
**Autores:** Equipo Multidisciplinario de Arquitectura, AppSec, Database Security y Backend de Qurio  

---

## 1. Resumen Ejecutivo

Este documento consolida los resultados técnicos de la remediación de seguridad aplicada a la plataforma **Qurio** en el marco de la **Fase 9: Hardening de Seguridad**. Siguiendo las directrices del informe [`SECURITY_AUDIT.md`](./SECURITY_AUDIT.md) y los requerimientos estrictos de la última revisión, se ha alcanzado una arquitectura de **defensa en profundidad integral**:

1. **SQL Runner:** Protección sintáctica basada en AST con **SQLGlot**, contención de recursión con límites nativos en PostgreSQL y soporte pleno de consultas analíticas avanzadas.
2. **Evaluador Semántico de Dos Capas:** Resolución demostrada del hallazgo de precisión `Decimal` (Capa 1: equivalencia numérica exacta sin pérdida por flotantes IEEE 754) e incorporación del **Inspector Pedagógico de AST** (Capa 2: detección de funciones didácticas obligatorias como `ROUND()`).
3. **Autoridad Central de Progreso:** Migración corregida [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql) con firma estricta en `REVOKE`/`GRANT`, bloqueo de concurrencia transaccional (`SELECT ... FOR UPDATE`), índice único condicional anti-duplicados, validación de parámetros y cálculo exacto de progreso de módulos.
4. **Validación en Entorno Local Idéntico a Supabase:** Se probó la migración completa contra una base de datos local en PostgreSQL con los esquemas, roles (`anon`, `authenticated`, `service_role`) y políticas de Supabase, validando concurrencia, permisos RLS/CLS e idempotencia.

### Indicadores Clave
* **Batería de Pruebas Automatizadas:** **61/61 pruebas pasando exitosamente en 2.95s** (13 de evaluador, 23 de seguridad/AST, 11 de integración, 6 de autenticación, 1 de rate limiting y 7 de migración Supabase).
* **Currículo Verificado:** Las 18 consultas del currículo oficial evaluadas y aprobadas (`18/18 PASSED`).
* **Compilación Frontend:** TypeScript estricto con `vite build` completado en 5.70s con 0 errores.
* **Integridad de Producción:** La rama `main` y Supabase Cloud permanecen 100% intactos sin modificaciones no autorizadas.

---

## 2. Matriz de Hallazgos y Remediaciones Verificadas

| ID | Hallazgo Original | Estado Previo | Remediación Implementada y Verificada | Estado Final | Evidencia Automatizada |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **SEC-01** | Evasión de regex en SQL Runner mediante mutaciones en CTEs o literales con `;` | Vulnerabilidad Confirmada | Sustitución completa por análisis sintáctico de AST con **SQLGlot** (dialecto `postgres`). Inspección profunda de todo el árbol (`walk()`) para neutralizar mutaciones en subconsultas o CTEs. | **REMEDIADO** | `test_security.py` (23 pruebas pasando: literales con `;`, `WITH RECURSIVE`, bloqueo de CTE mutante). |
| **SEC-02** | Autoridad vulnerable: Auto-adjudicación de XP y niveles desde el cliente web | Vulnerabilidad Confirmada | Creación de la función RPC `record_verified_attempt()` con `SECURITY DEFINER`, `search_path = public, pg_temp`, bloqueo `FOR UPDATE`, índice único condicional y CLS que revoca `UPDATE` sobre `user_profiles(xp, level)` a clientes. | **REMEDIADO (Validado en BD local)** | `test_supabase_migration.py` (`test_cls_prevents_client_modifying_xp_directly`, `test_idempotency_prevents_duplicate_xp_reward`). |
| **SEC-03** | Falta de autenticación en endpoints de ejecución del backend | Vulnerabilidad Confirmada | Módulo `app/core/auth.py` con validación asimétrica **ES256** vía endpoint JWKS público de Supabase (`/.well-known/jwks.json`). Modo invitado desacoplado para práctica sin persistencia ni XP. | **REMEDIADO** | `test_auth.py` (6 pruebas: tokens ES256 válidos, expirados, audience inválida, modo invitado). |
| **SEC-04** | Falsificación de intentos en `exercise_attempts` vía RLS | Vulnerabilidad Confirmada | Revocación total del permiso de `INSERT` sobre `exercise_attempts` para roles `anon` y `authenticated`. Solo `service_role` (backend) puede registrar intentos. | **REMEDIADO** | `test_supabase_migration.py` (`test_client_cannot_insert_exercise_attempts_directly`). |
| **SEC-05** | Exposición de puerto PostgreSQL Sandbox a `0.0.0.0:5433` | Riesgo de Despliegue | Vinculación estricta a `127.0.0.1:5433:5432` en [`docker-compose.yml`](file:///c:/Desarrollo/Qurio/docker-compose.yml). | **REMEDIADO** | Configuración de Docker Compose actualizada y verificada. |
| **SEC-06** | Falta de control de `lock_timeout` y archivos temporales en Sandbox | Deficiencia de Configuración | Incorporados `lock_timeout = '1000ms'` y `temp_file_limit = '32MB'` sobre el rol `readonly_student` en [`init.sql`](file:///c:/Desarrollo/Qurio/database/sandbox/init.sql). | **REMEDIADO** | Inicialización del rol en PostgreSQL Sandbox verificada. |
| **SEC-07** | Tolerancia excesiva en evaluación numérica y falta de validación pedagógica | Deficiencia Pedagógica / Calidad | **Evaluador de Dos Capas:** Capa 1 preserva tipos `Decimal` normalizados evitando redondeos de float IEEE 754; Capa 2 inspecciona el AST de la consulta para exigir funciones obligatorias como `ROUND()`. | **REMEDIADO** | `test_evaluator.py` (13 pruebas pasando: precisión Decimal exacta, tolerancia de escala, rechazo de consultas sin `ROUND`). |
| **SEC-08** | Inconsistencia de tipos en frontend entre estados de ejecución | Calidad / Tipado | Normalización a `executionStatus === 'SUCCESS'` en `ExerciseSpecPanel.tsx` y validación tipada con TypeScript `strict: true`. | **REMEDIADO** | Build de producción de Vite exitoso en 5.70s con 0 errores. |

---

## 3. Demostración y Pruebas del Evaluador (Hallazgo SEC-07: Precisión Decimal y Requisitos Didácticos)

En el informe inicial se detectó que `evaluator.py` convertía los valores devueltos a `float` y aplicaba `round(val, 3)`. Esto generaba dos problemas técnicos graves:
1. **Pérdida de Precisión Numérica (IEEE 754):** Números con más de 15 dígitos o valores monetarios de alta precisión sufrían pérdida de bits en representación flotante.
2. **Falsos Positivos Pedagógicos:** En el ejercicio de cálculo de IVA, una consulta como `SELECT nombre_producto, precio, precio * 1.21 AS precio_con_iva FROM productos;` arrojaba `1754.5` numéricamente idéntico a `round(1754.50, 2)`. El evaluador anterior lo marcaba como aprobado a pesar de que el estudiante **no utilizó la función `ROUND()` exigida por la consigna**.

### Corrección Implementada: Arquitectura de Doble Capa
* **Capa 1 (Datos con Exactitud Decimal):** La función `normalize_cell` procesa los números convirtiéndolos en instancias de `decimal.Decimal`.
  * Si `enforce_scale=False`: Compara la equivalencia de valor numérico (`Decimal("1754.5").normalize() == Decimal("1754.50").normalize()`).
  * Si `enforce_scale=True`: Compara el valor junto con su exponente de escala (`(d, d.as_tuple().exponent)`), distinguiendo 1 decimal de 2 decimales.
  * Los números de alta precisión (ej. `10000000000000.00000001` vs `10000000000000.00000002`) no se redondean ni colapsan como ocurriría con `float`.
* **Capa 2 (Inspector Pedagógico de AST):**
  * La función `inspect_pedagogical_requirements(student_sql, expected_sql)` analiza el árbol sintáctico de la consulta del estudiante.
  * Si la solución de referencia utiliza `exp.Round`, se exige que la consulta del estudiante contenga al menos un nodo `exp.Round` o `Anonymous(name="round")`.
  * Si el estudiante omite la función requerida, la evaluación devuelve `status: FAILED` con el motivo exacto:
    *"Requisito pedagógico no cumplido: La consigna requiere utilizar la función ROUND() para asegurar el redondeo explícito de los valores calculados."*

### Pruebas Automatizadas en `test_evaluator.py`:
* `test_evaluator_decimal_exact_precision`: Demuestra que valores Decimal con alta precisión no sufren truncamiento y detectan diferencias mínimas que `float` ignoraría.
* `test_evaluator_decimal_scale_numerical_equivalence`: Demuestra que `1754.5` y `1754.50` son equivalentes cuando no se exige escala fija.
* `test_evaluator_decimal_scale_strict_enforcement`: Demuestra que si `enforce_scale=True`, `1754.5` y `1754.50` son distinguidos.
* `test_evaluator_pedagogical_ast_check_fails_when_round_missing`: Demuestra que multiplicar directo sin `ROUND()` en el reto de IVA es **rechazado didácticamente**.
* `test_evaluator_pedagogical_ast_check_passes_when_round_present`: Demuestra que al utilizar `ROUND(precio * 1.21, 2)` la consulta es aprobada.

---

## 4. Auditoría Técnica de la Migración `03_security_hardening.sql`

La versión revisada del script [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql) incorpora todas las salvaguardas de nivel bancario solicitadas:

### 4.1 Firma Explícita de Permisos
```sql
ALTER FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) OWNER TO postgres;

REVOKE EXECUTE ON FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) FROM anon;

REVOKE EXECUTE ON FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) TO service_role;
```

### 4.2 Control de Concurrencia Transaccional e Idempotencia
1. **Bloqueo `FOR UPDATE` sobre `user_profiles`:**
   ```sql
   SELECT xp, level INTO v_current_xp, v_current_level
   FROM public.user_profiles
   WHERE id = p_user_id
   FOR UPDATE;
   ```
   Cualquier petición concurrente del mismo usuario es serializada en el motor PostgreSQL. La segunda transacción espera la liberación del bloqueo, momento en el que detecta que `v_already_passed` es `TRUE` y otorga `0 XP`.
2. **Restricción de Unicidad Condicional:**
   ```sql
   CREATE UNIQUE INDEX IF NOT EXISTS idx_single_awarded_passed_attempt
       ON public.exercise_attempts (user_id, exercise_id)
       WHERE status = 'PASSED' AND xp_awarded > 0;
   ```
   Impide a nivel de restricciones de almacenamiento físico que puedan existir dos registros con `xp_awarded > 0` para el mismo usuario y ejercicio. Los intentos posteriores de práctica se permiten registrando `xp_awarded = 0`.

### 4.3 Validación Estricta de Parámetros
* `p_status`: Acepta únicamente `'PASSED'`, `'FAILED'`, `'ERROR'`.
* `p_execution_time_ms`: Rechaza valores negativos (`< 0`).
* `p_hints_used`: Rechaza valores fuera del rango `[0, 3]`.
* `p_xp_to_award`: Valida que se encuentre en el rango `[0, 500]`.
* `p_submitted_sql`: Rechaza consultas vacías o mayores a 10,000 caracteres.
* Verificación obligatoria de existencia previa del `user_id` y del `exercise_id`.

### 4.4 Cálculo Auditado del Progreso de Módulos
```sql
-- Contar total de ejercicios del módulo
SELECT COUNT(*) INTO v_total_module_exercises
FROM public.exercises
WHERE module_id = v_module_id;

-- Contar ejercicios distintos aprobados por este usuario en el módulo
SELECT COUNT(DISTINCT a.exercise_id) INTO v_completed_count
FROM public.exercise_attempts a
JOIN public.exercises ex ON a.exercise_id = ex.id
WHERE a.user_id = p_user_id
  AND ex.module_id = v_module_id
  AND a.status = 'PASSED';

v_is_module_completed := (v_completed_count >= v_total_module_exercises AND v_total_module_exercises > 0);
```
Actualiza atómicamente `public.user_progress` con el número real de ejercicios superados y marca `is_completed = TRUE` únicamente cuando se alcanzan todos los ejercicios del módulo.

---

## 5. Pruebas Automatizadas de la Migración en Entorno Local (`test_supabase_migration.py`)

Se aprovisionó una base de datos local `supabase_mock_test` en el contenedor Docker de PostgreSQL aplicando los esquemas DDL de Supabase y la migración `03_security_hardening.sql`. Todas las pruebas pasaron exitosamente:

```text
apps\api\tests\test_supabase_migration.py .......                        [100%]
============================== 7 passed in 0.66s ==============================
```

### Casos Demostrados:
1. `test_rpc_permissions_denied_for_anon_and_authenticated`: Roles `anon` y `authenticated` reciben `InsufficientPrivilegeError` al intentar llamar a la función RPC.
2. `test_cls_prevents_client_modifying_xp_directly`: Clientes `authenticated` no pueden modificar `xp` en `user_profiles` (bloqueado por CLS), pero sí pueden actualizar su `display_name`.
3. `test_client_cannot_insert_exercise_attempts_directly`: Clientes `authenticated` no pueden insertar intentos arbitrarios directamente.
4. `test_idempotency_prevents_duplicate_xp_reward`: El primer intento aprobado otorga 45 XP; el segundo otorga 0 XP con `already_passed = TRUE`, preservando los 2 registros en el historial.
5. `test_concurrent_requests_do_not_duplicate_xp`: Dos solicitudes asíncronas simultáneas (`asyncio.gather`) compitiendo por el mismo ejercicio resultan en exactamente 35 XP en el perfil (nunca 70 XP).
6. `test_rpc_validation_rejects_invalid_parameters`: Rechazo confirmado ante estados inválidos (`HACKED`), tiempos negativos, pistas fuera de rango, XP desbordado y usuarios inexistentes.
7. `test_module_progress_calculation`: Al resolver el ejercicio 1 y el ejercicio 8 (los 2 ejercicios del Módulo 1), `exercises_completed_count` pasa de 1 a 2 y `is_completed` pasa de `FALSE` a `TRUE` en `public.user_progress`.

---

## 6. Lista de Riesgos Residuales

Tras la implementación de estas medidas, el nivel de riesgo global del sistema desciende de **ALTO** a **BAJO/RESIDUAL**:

1. **Gestión de la Credencial `SUPABASE_SERVICE_ROLE_KEY`:**
   * *Riesgo:* Si la clave de servicio se filtra o se expone accidentalmente en el repositorio o en el frontend, el atacante obtendría privilegios de superadministrador en Supabase.
   * *Mitigación:* La variable `SUPABASE_SERVICE_ROLE_KEY` se define exclusivamente en el entorno del servidor (`apps/api/.env`). El archivo `.gitignore` prohíbe el versionado de archivos `.env`. El frontend (`apps/web/.env`) utiliza exclusivamente `VITE_SUPABASE_ANON_KEY`.
2. **Entorno Sandbox Multi-Inquilino sin Docker Dinámico:**
   * *Riesgo:* En el MVP, todos los estudiantes comparten la misma base de datos de solo lectura `ecommerce_sandbox` en PostgreSQL.
   * *Mitigación:* El rol `readonly_student` tiene revocado `CREATE` y `TEMP`, `statement_timeout = 2000ms`, `lock_timeout = 1000ms`, `work_mem = 16MB` y `temp_file_limit = 32MB`. Las transacciones son forzadas en modo `READ ONLY`. El semáforo de FastAPI limita la concurrencia a 10 consultas simultáneas.
3. **Escalabilidad de Rate Limiting en Multi-Instancia:**
   * *Riesgo:* La implementación actual utiliza contadores en memoria dentro de cada proceso de FastAPI. Si se despliegan varias instancias en Kubernetes o balanceador de carga sin afinidad de sesión, la cuota efectiva por IP se multiplica por el número de réplicas.
   * *Mitigación:* La arquitectura de `rate_limit.py` está desacoplada mediante interfaz de adaptador. Para entornos con réplicas múltiples, se añadirá el backend de Redis proveyendo `REDIS_URL`.

---

## 7. Instrucciones de Despliegue y Plan de Rollback

### 7.1 Procedimiento de Despliegue en Supabase Cloud (Paso a Paso)
> [!IMPORTANT]
> Requiere la autorización explícita del usuario. No ejecutar sin su confirmación.

1. **Acceso al Panel:** Iniciar sesión en el panel de control de Supabase (`https://supabase.com/dashboard/project/bfvgqxfzftumwrleacof`).
2. **Navegación al SQL Editor:** Abrir la pestaña **SQL Editor** en la barra lateral izquierda.
3. **Pegar Contenido:** Copiar el contenido íntegro del archivo [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql).
4. **Ejecutar Consulta:** Hacer clic en **Run**. Verificar que el resultado sea `Success. No rows returned`.
5. **Configuración de Backend:**
   * Ir a **Project Settings > API**.
   * Copiar la clave `service_role (secret)`.
   * En el servidor backend, colocar en `apps/api/.env`:
     ```env
     SUPABASE_SERVICE_ROLE_KEY=tu_clave_secreta_service_role_aqui
     ```
6. **Verificación de Salud:** Realizar una solicitud de prueba a `http://localhost:8000/api/v1/health` y validar respuesta `healthy`.

### 7.2 Procedimiento de Rollback Inmediato
Si durante la puesta en marcha se detectara alguna incompatibilidad imprevista, ejecutar en el SQL Editor de Supabase el siguiente bloque de reversión:

```sql
-- =============================================================================
-- Qurio: Script de Rollback de Emergencia para Fase 9
-- =============================================================================

-- 1. Restaurar permisos de UPDATE en user_profiles para clientes autenticados
GRANT UPDATE ON public.user_profiles TO authenticated;

-- 2. Restaurar permisos de INSERT en exercise_attempts para clientes autenticados
GRANT INSERT ON public.exercise_attempts TO authenticated;

-- 3. Eliminar índice condicional anti-duplicados
DROP INDEX IF EXISTS public.idx_single_awarded_passed_attempt;

-- 4. Eliminar función RPC de certificación
DROP FUNCTION IF EXISTS public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
);
```

---

## 8. Estado del Repositorio y Control de Versiones

* **Rama Git de Trabajo:** `security/phase-9-hardening`
* **Rama Principal (`main`):** Protegida, limpia y sin alteraciones.
* **Compromiso:** Ningún cambio será fusionado a `main` hasta la verificación final en vivo y la aprobación explícita del usuario.
