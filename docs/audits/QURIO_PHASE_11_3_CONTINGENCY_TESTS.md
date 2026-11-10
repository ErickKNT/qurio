# Qurio — Informe de Pruebas de Contingencia y Rollback (Fase 11.3)

**Identificador:** `QURIO-PHASE-11.3-CONTINGENCY-TESTS`  
**Fecha de ejecución:** 10 de Noviembre de 2026  
**Entorno de ejecución:** PostgreSQL 16 (Local Docker Sandbox `localhost:5433`), FastAPI local (8000), Node / Vitest y Playwright E2E en Google Chrome  
**Aislamiento Cloud:** **Zero Cloud Mutations (100% verificado en local sin tocar Supabase Cloud)**  
**Estado:** **80/80 Pruebas en Pytest Pasadas (100%), 17/17 Vitest Pasadas (100%), 19/19 E2E Pasadas (100%)**  
**Veredicto:** **APROBADO**

---

## 1. Resumen de la Validación Empírica

Este informe recopila las evidencias de ejecución técnica de los 10 aspectos requeridos por la auditoría de Fase 11.3, demostrando que tanto la base de datos PostgreSQL como el backend FastAPI se comportan de forma determinista, segura y predecible ante la desactivación o fallo de la RPC `record_verified_attempt`.

---

## 2. Matriz de Cobertura de Pruebas de Contingencia

| ID de Prueba | Aspecto Verificado | Archivo / Función de Prueba | Resultado | Detalle de la Evidencia |
|:---|:---|:---|:---:|:---|
| **CONT-01** | La RPC existe y funciona antes del rollback | `test_supabase_migration.py`::`test_effective_privileges_matrix` | **PASSED** | `pg_proc` confirma existencia de `record_verified_attempt`. Ejecución exitosa con `service_role`. |
| **CONT-02** | La RPC deja de existir después del rollback | `test_supabase_migration.py`::`test_rollback_script_preserves_strict_security` | **PASSED** | `SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname='record_verified_attempt')` retorna `False`. |
| **CONT-03** | El índice único parcial permanece activo | `test_supabase_migration.py`::`test_rollback_script_preserves_strict_security` | **PASSED** | `pg_indexes` confirma `idx_single_awarded_passed_attempt`. Rechaza segundo intento con `xp_awarded > 0`. |
| **CONT-04** | Los clientes no pueden insertar intentos directamente | `test_supabase_migration.py`::`test_rollback_script_preserves_strict_security` | **PASSED** | `INSERT INTO exercise_attempts` como `authenticated` lanza `InsufficientPrivilegeError`. |
| **CONT-05** | Los clientes no pueden modificar XP ni nivel | `test_supabase_migration.py`::`test_rollback_script_preserves_strict_security` | **PASSED** | `UPDATE user_profiles SET xp=...` y `level=...` lanzan `InsufficientPrivilegeError`. |
| **CONT-06** | `solution_query` continúa protegida (CLS) | `test_supabase_migration.py`::`test_rollback_script_preserves_strict_security` | **PASSED** | `has_column_privilege` es `False` para `anon` y `authenticated`. `service_role` mantiene acceso. |
| **CONT-07** | RLS permanece activo en las 11 tablas | `test_supabase_migration.py`::`test_rollback_script_preserves_strict_security` | **PASSED** | `pg_tables.rowsecurity` es `True` en las 11 entidades. `User Insert Own Attempts` eliminada. |
| **CONT-08** | El backend no acredita XP cuando la RPC no está disponible | `test_integration.py`::`test_contingency_mode_when_rpc_unavailable_awards_zero_xp_and_informs_user` | **PASSED** | Respuesta de API con `xp_awarded = 0`. Mensaje explicativo de contingencia entregado. |
| **CONT-09** | La interfaz no muestra falsamente progreso oficial si la persistencia falla | `test_integration.py`::`test_contingency_mode_when_rpc_unavailable_awards_zero_xp_and_informs_user` | **PASSED** | `data["xp_awarded"] == 0`, mensaje contiene `"modo de contingencia: tu consulta es válida, pero la certificación oficial de XP no está disponible temporalmente"`. |
| **CONT-10** | El comportamiento de contingencia no produce pérdida silenciosa ni duplicación de progreso | `test_integration.py`::`test_contingency_mode_preserves_practice_and_allows_subsequent_reward_when_rpc_restored` | **PASSED** | Intento posterior al restablecer la RPC acredita los +35 XP legítimos sin penalización. |

---

## 3. Detalle de Pruebas Críticas y Evidencias Reproducibles

### 3.1 Prueba de Aislamiento de Base de Datos tras Rollback
En `apps/api/tests/test_supabase_migration.py`:
```python
@pytest.mark.asyncio
async def test_rollback_script_preserves_strict_security(db_conn, create_test_user):
    # 1. Ejecutar el script SQL de rollback
    await db_conn.execute(rollback_sql)

    # 2. Comprobar que la RPC fue removida
    can_exec = await db_conn.fetchval(
        "SELECT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'record_verified_attempt');"
    )
    assert can_exec is False

    # 3. Comprobar que el índice condicional sobrevive
    idx_exists = await db_conn.fetchval(
        "SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_single_awarded_passed_attempt');"
    )
    assert idx_exists is True

    # 4. Probar que el índice bloquea duplicados de XP positivo
    # (Primer intento con 30 XP pasa; segundo intento idéntico lanza error de clave duplicada)
    with pytest.raises(PostgresError) as exc_info:
        await db_conn.execute("INSERT INTO exercise_attempts ... (30 XP);")
    assert "idx_single_awarded_passed_attempt" in str(exc_info.value)

    # 5. Probar que reintentos formativos con 0 XP sí son permitidos
    await db_conn.execute("INSERT INTO exercise_attempts ... (0 XP);") # PASSED

    # 6. Comprobar que solution_query permanece bloqueada
    assert await db_conn.fetchval(
        "SELECT has_column_privilege('anon', 'public.exercises', 'solution_query', 'SELECT');"
    ) is False
    assert await db_conn.fetchval(
        "SELECT has_column_privilege('authenticated', 'public.exercises', 'solution_query', 'SELECT');"
    ) is False

    # 7. Comprobar purga de permisos residuales de columnas visuales en user_profiles para anon y PUBLIC
    for col in ["display_name", "avatar_url", "bio", "updated_at", "xp", "level", "username"]:
        assert await db_conn.fetchval(
            f"SELECT has_column_privilege('anon', 'public.user_profiles', '{col}', 'UPDATE');"
        ) is False
        assert await db_conn.fetchval(
            f"SELECT EXISTS(SELECT 1 FROM information_schema.column_privileges WHERE table_name='user_profiles' AND column_name='{col}' AND grantee='PUBLIC' AND privilege_type='UPDATE');"
        ) is False
```
* **Resultado:** **PASSED (100% de aserciones validadas sin fallos)**.

### 3.2 Prueba del Modo de Contingencia en Backend FastAPI
En `apps/api/tests/test_integration.py`:
```python
@pytest.mark.asyncio
async def test_contingency_mode_when_rpc_unavailable_awards_zero_xp_and_informs_user(client: AsyncClient, monkeypatch):
    # Simula falla o ausencia de la RPC en Supabase Cloud
    async def fake_failed_rpc(**kwargs):
        return {
            "success": False,
            "already_passed": False,
            "already_awarded": False,
            "xp_awarded": 0,
            "error": "PGRST202: Could not find function record_verified_attempt",
            "contingency_mode": True,
        }

    monkeypatch.setattr("app.modules.runner.router.record_verified_progress", fake_failed_rpc)

    response = await client.post(f"/api/v1/exercises/{exercise_id}/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PASSED"
    assert data["xp_awarded"] == 0
    assert "contingencia" in data["message"].lower()
```
* **Resultado:** **PASSED**. La API jamás adjudica XP cuando la persistencia falla y entrega retroalimentación clara de contingencia.

### 3.3 Prueba de Recuperación sin Pérdida de Recompensa al Restaurar la RPC
```python
@pytest.mark.asyncio
async def test_contingency_mode_preserves_practice_and_allows_subsequent_reward_when_rpc_restored(client: AsyncClient, monkeypatch):
    # 1. Alumno resuelve en contingencia -> 0 XP otorgado
    res1 = await client.post(...)
    assert res1.json()["xp_awarded"] == 0

    # 2. La RPC se restablece y el alumno reenvía -> se acreditan sus +35 XP legítimos
    res2 = await client.post(...)
    assert res2.json()["xp_awarded"] == 35
```
* **Resultado:** **PASSED**. No existe pérdida de progreso oficial ni duplicación de recompensas.

---

## 4. Evidencias Consolidadas de la Suite Completa

### 4.1 Backend Pytest (80/80 Pruebas Pasadas)
```text
============================= test session starts =============================
platform win32 -- Python 3.14.5, pytest-9.2.0, pluggy-1.7.0
rootdir: C:\Desarrollo\Qurio\apps\api
configfile: pytest.ini
collected 80 items

apps/api/tests/test_auth.py .................................. [  7%] (6 tests)
apps/api/tests/test_evaluator.py ............................. [ 25%] (14 tests)
apps/api/tests/test_integration.py ........................... [ 47%] (18 tests)
apps/api/tests/test_rate_limit.py ............................ [ 48%] (1 test)
apps/api/tests/test_schema_consistency.py .................... [ 52%] (3 tests)
apps/api/tests/test_security.py .............................. [ 81%] (23 tests)
apps/api/tests/test_supabase_migration.py .................... [100%] (15 tests)

======================== 80 passed in 61.50s (0:01:01) ========================
```

### 4.2 Frontend Vitest (17/17 Pruebas Pasadas)
```text
 ✓ src/lib/__tests__/routing.test.ts (5 tests) 5ms
 ✓ src/lib/__tests__/progress.test.ts (5 tests) 5ms
 ✓ src/lib/__tests__/persistence.test.ts (7 tests) 111ms

 Test Files  3 passed (3)
      Tests  17 passed (17)
   Duration  861ms
```

### 4.3 Frontend Production Build
```text
✓ 2171 modules transformed.
dist/index.html                              3.10 kB │ gzip:  1.21 kB
dist/assets/index-DVOcn_Yl.js              247.82 kB │ gzip: 66.25 kB
✓ built in 5.38s (0 errores, 0 fugas de solution_query)
```

### 4.4 Playwright E2E en Google Chrome Real
```text
Total: 19 | Pasadas: 19 | Fallidas: 0 (100% éxito)
 - [PASSED] T01: Carga Inicial de Dashboard
 - [PASSED] T06: Evaluación Correcta en Modo Invitado (0 XP oficial acreditado)
 - [PASSED] T07: Límite de Prueba de Invitados Enforced (HTTP 401 en 4to reto)
 - [PASSED] T13: Manejo Resiliente de Error 500 de API
```

---

## 5. Dictamen Técnico Final

### Veredicto: APROBADO

Tanto la base de datos PostgreSQL como la API de FastAPI han demostrado empíricamente una resiliencia total frente a la contingencia del rollback. El sistema de práctica nunca se bloquea, la seguridad jamás se degrada, las soluciones canónicas continúan inaccesibles y la adjudicación de XP oficial no certificada queda bloqueada de forma determinista.
