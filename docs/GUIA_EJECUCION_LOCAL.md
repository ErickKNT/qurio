# Guía de Ejecución Local — Qurio

Esta guía explica paso a paso cómo levantar, verificar y apagar **Qurio** manualmente en entorno local (**Windows / PowerShell**).

---

## Prerrequisitos

* **Docker Desktop** abierto y en ejecución (*Running*).
* **Node.js 18+** y `npm`.
* **Python 3.12+** *(solo si deseas correr FastAPI fuera de Docker con `--reload` o ejecutar `pytest`)*.
* Archivos de entorno creados (`apps/api/.env` y `apps/web/.env`). Si estás en una máquina nueva, cópialos desde los ejemplos antes de iniciar:

```powershell
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env
```

---

## Opción 1: Modo Recomendado (Sandbox + API en Docker + Frontend Vite)

Esta opción levanta PostgreSQL 16 Sandbox (`5433`) y el backend FastAPI (`8000`) en contenedores Docker, y deja únicamente el frontend en Vite (`5173`).

### 1. Ubícate en la raíz del repositorio y selecciona la rama deseada

```powershell
cd C:\Desarrollo\Qurio
# Para probar lo estable en main:
git checkout main
# O si deseas probar el rediseño de perfil aún en rama de feature:
git checkout feat/profile-bento-redesign
```

### 2. Levantar el Sandbox PostgreSQL 16 y la API FastAPI

```powershell
docker compose up -d --build
```

*(Si no modificaste dependencias Python ni el `Dockerfile`, en arranques posteriores basta con `docker compose up -d`).*

Verifica que ambos contenedores estén activos y la API conectada al Sandbox:

```powershell
docker ps --filter "name=qurio"
curl.exe -s http://127.0.0.1:8000/api/v1/health
```

Respuesta esperada:

```json
{"status":"healthy","sandbox_database":"connected","error":null}
```

### 3. Levantar el Frontend React + Vite

```powershell
cd C:\Desarrollo\Qurio\apps\web
npm.cmd run dev
```

> **Nota PowerShell:** Se usa `npm.cmd` en lugar de `npm` para evitar errores de `ExecutionPolicy` en Windows con `npm.ps1`. Si es la primera vez en el equipo, instala dependencias antes con `npm.cmd install`.

### 4. Abrir la plataforma en el navegador

* **Aplicación Web:** `http://localhost:5173`
* **API Docs (Swagger):** `http://localhost:8000/docs`
* **Health Check API:** `http://127.0.0.1:8000/api/v1/health`

---

## Opción 2: Modo Desarrollo Backend (`uvicorn --reload` fuera de Docker)

Útil si vas a modificar el código Python en `apps/api/` y necesitas recarga automática al guardar archivos.

### Terminal 1 — Solo PostgreSQL Sandbox

```powershell
cd C:\Desarrollo\Qurio
docker compose up -d postgres-sandbox
```

### Terminal 2 — API FastAPI en entorno virtual local

```powershell
cd C:\Desarrollo\Qurio\apps\api
# Si es la primera vez:
# python -m venv .venv
# .\.venv\Scripts\pip.exe install -r requirements.txt

.\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Terminal 3 — Frontend React + Vite

```powershell
cd C:\Desarrollo\Qurio\apps\web
npm.cmd run dev
```

---

## Verificación Rápida de Pruebas y Build

### Frontend (`Vitest` + `tsc && vite build`)

```powershell
cd C:\Desarrollo\Qurio\apps\web
npm.cmd test
npm.cmd run build
```

### Backend (`Pytest` con Sandbox activo en `localhost:5433`)

```powershell
cd C:\Desarrollo\Qurio
.\apps\api\.venv\Scripts\pytest.exe apps\api\tests\ -v
```

---

## Cómo Apagar la Plataforma Limpiamente

1. En la terminal donde corre **Vite** (y en la de **`uvicorn`** si usaste la Opción 2), presiona **`Ctrl + C`**.
2. En la raíz del proyecto, detén y limpia los contenedores Docker:

```powershell
cd C:\Desarrollo\Qurio
docker compose down
```

3. *(Opcional)* Comprueba que los puertos `5173`, `8000` y `5433` quedaron libres:

```powershell
Get-NetTCPConnection -LocalPort 5173,8000,5433 -State Listen -ErrorAction SilentlyContinue
```

---

## Nota sobre Supabase Cloud (Constancias)

Si aún no lo has ejecutado en tu proyecto de Supabase Cloud, corre el script [`database/supabase/05_certificates.sql`](../database/supabase/05_certificates.sql) en el **SQL Editor** de Supabase para habilitar la persistencia en la nube de `public.user_certificates` (mientras tanto, las pruebas QA locales usan el almacén en memoria del backend).
