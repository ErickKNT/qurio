# Qurio — Plataforma Interactiva de Aprendizaje SQL & Analítica Relacional

<p align="center">
  <img src="apps/web/public/og-preview.svg" alt="Qurio — Aprende SQL. Piensa en queries." width="820" />
</p>

<p align="center">
  <strong>«Aprende SQL. Piensa en queries.»</strong><br />
  Plataforma de alta fidelidad técnica para dominar SQL moderno mediante práctica activa contra una base de datos relacional real en un entorno sandbox aislado y seguro.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.12" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS 3.4" />
  <img src="https://img.shields.io/badge/Docker-Sandbox-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Sandbox" />
  <img src="https://img.shields.io/badge/Tests-26%2F26%20Passing-22C55E?style=for-the-badge" alt="Tests 26/26 Passing" />
  <img src="https://img.shields.io/badge/License-MIT-amber?style=for-the-badge" alt="MIT License" />
</p>

---

## 📑 Tabla de Contenidos

- [¿Qué es Qurio?](#-qué-es-qurio)
- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
  - [Diagrama de Arquitectura Global](#diagrama-de-arquitectura-global)
  - [Flujo de Evaluación Semántica](#flujo-de-evaluación-semántica)
- [Estructura del Monorepo](#-estructura-del-monorepo)
- [El Dataset: `Ecommerce_Production_DB`](#-el-dataset-ecommerce_production_db)
- [Seguridad del Sandbox](#-seguridad-del-sandbox)
- [Instalación y Puesta en Marcha Local](#-instalación-y-puesta-en-marcha-local)
  - [Prerrequisitos](#prerrequisitos)
  - [1. Clonar el Repositorio](#1-clonar-el-repositorio)
  - [2. Iniciar el Sandbox PostgreSQL (Docker)](#2-iniciar-el-sandbox-postgresql-docker)
  - [3. Configurar y Ejecutar la API (FastAPI)](#3-configurar-y-ejecutar-la-api-fastapi)
  - [4. Configurar y Ejecutar el Frontend (React + Vite)](#4-configurar-y-ejecutar-el-frontend-react--vite)
  - [5. Ejecutar la Suite de Pruebas Automatizadas](#5-ejecutar-la-suite-de-pruebas-automatizadas)
- [Variables de Entorno](#-variables-de-entorno)
- [Estándares de Ingeniería & Sistema de Diseño](#-estándares-de-ingeniería--sistema-de-diseño)
- [Licencia y Autoría](#-licencia-y-autoría)

---

## 💡 ¿Qué es Qurio?

La mayoría de las plataformas de aprendizaje de SQL caen en dos extremos: o son cuestionarios teóricos de opción múltiple desvinculados de la realidad, o comparan cadenas de texto SQL con expresiones regulares frágiles (haciendo que una consulta perfectamente válida falle si usas un alias distinto o un espacio extra).

**Qurio** fue concebido bajo una premisa fundamental: **el usuario debe escribir código SQL real contra un motor PostgreSQL real.**

- **Evaluador Semántico de Conjuntos:** No compara el texto de tu consulta. Ejecuta tu código en el sandbox y compara el **conjunto relacional resultante** (filas, columnas, tipos de datos, cardinalidad, multiconjuntos con `Counter` y comprobación estricta de orden cuando se especifica). Si tu lógica arroja el conjunto de datos esperado, tu solución es aprobada, sin importar si usaste mayúsculas, minúsculas o alias alternativos.
- **Entorno Aislado e Inmune:** Cada consulta enviada se ejecuta en un contenedor Docker con PostgreSQL 16 bajo el rol restringido `readonly_student`, con `statement_timeout = 2000ms`, transacciones de solo lectura y un sanitizador de seguridad de doble capa en FastAPI.
- **Experiencia de Estación de Trabajo:** Diseñado para sentirse como una herramienta profesional (estilo DataGrip, TablePlus o VS Code), no como un juguete interactivo infantil.

---

## ✨ Características Principales

### ⚡ IDE de Estación de Trabajo (Monaco Editor)
- Integración completa con el motor de **Monaco Editor** (el núcleo de VS Code).
- Temas cromáticos personalizados: `qurio-dark` y `qurio-light` adaptados al sistema de diseño.
- Resaltado sintáctico de PostgreSQL, autocompletado y tipografía técnica `JetBrains Mono`.
- Atajo de teclado nativo: **`⌘ + Enter`** (macOS) o **`Ctrl + Enter`** (Windows/Linux) para ejecución inmediata.
- Herramientas integradas de formateo de palabras reservadas SQL y restablecimiento de plantilla.

### 🌓 Soporte Nativo de Tema Claro y Oscuro
- Sistema reactivo de tokens de diseño con Tailwind CSS y variables CSS dinámicas en `:root` y `.dark`.
- Conmutador instantáneo en la cabecera superior y en la barra de herramientas del espacio de trabajo.
- Persistencia automática de la preferencia en `localStorage` (`qurio_theme`) y detección inteligente de la preferencia del sistema operativo (`prefers-color-scheme`).
- Script anti-parpadeo (anti-FOUC) integrado en el encabezado HTML para una carga limpia y fluida.

### 🔬 SQL Playground Libre
- Entorno de experimentación interactivo sin restricciones de ejercicio para escribir cualquier consulta `SELECT`.
- Explorador lateral de esquemas en vivo con las **10 tablas relacionales** de `Ecommerce_Production_DB`, recuento de filas y claves primarias/foráneas.
- Inserción de plantillas rápidas (`Top 5 Clientes`, `Productos con Stock Crítico`, `Resumen de Ventas`, `Facturación`).
- Consulta express en un clic (`SELECT * FROM tabla LIMIT 10`) y métricas de latencia de ejecución en milisegundos reales.

### 📊 Visualizador Tabular DataGrid de Alta Fidelidad
- Cuadrícula de datos interactiva con numeración de filas y visualización de tipos de datos inferidos (`VARCHAR`, `INT4`, `DECIMAL`, `TIMESTAMPTZ`, `BOOL`).
- Representación visual explícita para valores `NULL` con chips atenuados.
- Visualizador de discrepancias semánticas (`DiffResult`) que explica con claridad técnica por qué una solución difiere del resultado esperado (diferencia en recuento de filas, columnas faltantes o valores no coincidentes).
- Consola de terminal para visualización limpia de errores de PostgreSQL o bloqueos de seguridad.

### 🗺️ Rutas Curriculares Estructuradas (50 Retos)
El plan de estudios de Qurio está organizado en 3 rutas formativas diseñadas con complejidad progresiva:
1. **SQL Foundations (22 Retos - 44%):** `SELECT`, `WHERE`, operadores lógicos, ordenamiento con `ORDER BY`, agregaciones (`COUNT`, `SUM`, `AVG`), agrupamiento con `GROUP BY` y filtrado posterior con `HAVING`.
2. **Relational SQL & Joins (18 Retos - 36%):** Claves foráneas, `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL OUTER JOIN`, `CROSS JOIN`, uniones (`UNION`, `UNION ALL`) y subconsultas correlacionadas.
3. **Advanced Queries & Analytics (10 Retos - 20%):** Funciones de ventana (`ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LEAD`, `LAG`), expresiones de tabla comunes (`WITH` / CTEs), lógica condicional con `CASE WHEN` y consultas analíticas de negocio.

### 🏆 Gamificación y Rangos Técnicos
- Sistema de **Puntos de Experiencia (XP)** con cálculo dinámico y penalizaciones visuales progresivas por pistas (-15% por cada pista consultada).
- **Medallas de Ingeniería Desbloqueables:** Insignias de *Habilidad*, *Constancia* y *Progreso* (ej. *Primer Commit SQL*, *Maestro del Join*, *Arquitecto de Agregaciones*, *Sin Pistas*).
- **Perfil del Estudiante:** Gráfico de cadencia diaria de 30 días (mapa de calor estilo GitHub), barra de progreso hacia rangos de ingeniería y log de auditoría con historial de consultas ejecutadas.

### 🛡️ Autenticidad & Estándares Anti-AI Slop
- **Validación Inline Rigurosa:** Cero uso de `alert()` o `confirm()` nativos; todos los errores se muestran inline con tokens de diseño.
- **Página 404 Temática SQL:** Consola interactiva con código de error `SQLSTATE 42P01: relation does not exist in schema public` y sugerencia (`HINT`).
- **Favicon Vectorial Propio:** Isotipo matemático puro (cilindro relacional en capas con núcleo verde esmeralda activo).
- **Metadatos Open Graph:** Imagen y descripción institucional para previsualizaciones sociales atractivas.
- **Transparencia Total:** Política de privacidad honesta (sin cookies publicitarias de terceros) y enlaces reales a perfiles y código fuente (sin direcciones ficticias).

---

## 🏛️ Arquitectura del Sistema

Qurio utiliza un modelo arquitectónico desacoplado de alto rendimiento:

### Diagrama de Arquitectura Global

```mermaid
flowchart TD
    User["👤 Estudiante / Analista"] -->|"Navega / Escribe SQL"| Frontend["🌐 Frontend: React 18 + Vite\n(Atomic Design, Tailwind, Monaco)"]
    
    subgraph ClientLayer["Capa de Cliente"]
        Frontend
        Monaco["Monaco Editor\n(qurio-dark / qurio-light)"]
        DataGrid["DataGrid Tabular\n(Tipos, Diffs, Métricas)"]
    end

    Frontend -->|"Auth / Perfil / Progreso"| Supabase["☁️ Supabase Cloud\n(PostgreSQL RLS + GoTrue Auth)"]
    Frontend -->|"POST /submit o /execute\n(Timeout 2000ms)"| Backend["⚡ Backend API: FastAPI\n(Python 3.12, asyncpg, Pydantic)"]

    subgraph SecurityBoundary["Límite de Seguridad del Runner"]
        Backend -->|"1. Sanitización AST & Regex\n(Bloqueo de DDL/DML destructivo)"| SecurityFilter["Filtro de Seguridad"]
        SecurityFilter -->|"2. Conexión asyncpg\n(statement_timeout = 2000ms)"| Pool["Pool Asíncrono"]
        Pool -->|"3. Ejecuta bajo rol 'readonly_student'"| DockerSandbox["🐳 Sandbox Docker: PostgreSQL 16\n(Puerto 5433, Base: Ecommerce_Production_DB)"]
    end

    DockerSandbox -->|"Resultado del Estudiante"| Evaluator["🧪 Motor de Evaluación Semántica\n(FastAPI Evaluator)"]
    DockerSandbox -->|"Resultado de la Solución Oficial"| Evaluator
    Evaluator -->|"Veredicto, Diffs, XP & Latencia"| Frontend
```

### Flujo de Evaluación Semántica

```mermaid
sequenceDiagram
    autonumber
    actor U as Estudiante
    participant FE as Frontend (Monaco)
    participant API as FastAPI Runner
    participant DB as Docker PostgreSQL Sandbox
    participant EV as Evaluador Semántico

    U->>FE: Escribe query y presiona ⌘ + Enter
    FE->>API: POST /api/v1/exercises/{id}/submit { query }
    API->>API: Sanitización de seguridad (Bloqueo DDL/DML, multi-statement)
    alt Contiene sentencias destructivas o inyección
        API-->>FE: 400 Bad Request (Explicación técnica en terminal)
    else Consulta válida
        par Ejecutar consulta del estudiante
            API->>DB: SET statement_timeout = 2000; <query_estudiante>
            DB-->>API: Resultado del Estudiante (filas, columnas, tipos)
        and Ejecutar solución de referencia
            API->>DB: SET statement_timeout = 2000; <query_esperada>
            DB-->>API: Resultado Esperado
        end
        API->>EV: Comparar conjuntos (Columnas, Cardinalidad, Tipos, Multiconjunto)
        EV-->>API: Veredicto (is_correct, diffs, xp_awarded, latency_ms)
        API-->>FE: 200 OK con veredicto estructurado
        FE->>U: Renderiza DataGrid + SuccessModal / Consola de Diffs
    end
```

---

## 📂 Estructura del Monorepo

```
Qurio/
├── .agents/skills/             # Colección de habilidades para desarrollo asistido
├── apps/
│   ├── api/                    # ⚡ Backend FastAPI (Python 3.12)
│   │   ├── app/
│   │   │   ├── core/           # Configuración Pydantic Settings y ciclo de vida
│   │   │   ├── modules/
│   │   │   │   ├── curriculum/ # Repositorio de ejercicios y catálogo (REST / Fallback)
│   │   │   │   └── runner/     # Pool asyncpg, Evaluador semántico, Seguridad y Router
│   │   │   └── main.py         # Punto de entrada de la aplicación FastAPI
│   │   ├── tests/              # Suite de 26 pruebas automáticas (Pytest + Asyncio)
│   │   ├── Dockerfile          # Contenerización de la API
│   │   └── requirements.txt    # Dependencias de Python
│   │
│   └── web/                    # 🌐 Frontend React 18 + Vite + TypeScript
│       ├── public/             # Isotipo SVG, Favicon y vector Open Graph
│       ├── src/
│       │   ├── components/     # Árbol estricto bajo Atomic Design Pragmático
│       │   │   ├── atoms/      # Button, Badge, TextInput, KbdShortcut, RadioTab
│       │   │   ├── molecules/  # SearchInput, FormField, MetricTile, SuccessModal, etc.
│       │   │   ├── organisms/  # MonacoEditorPanel, DataGridResults, ExerciseSpecPanel,
│       │   │   │               # TracksView, SqlPlaygroundView, AchievementsView, etc.
│       │   │   └── templates/  # DashboardLayout, WorkspaceLayout
│       │   ├── hooks/          # useAuth, useTheme (modo claro/oscuro persistente)
│       │   ├── lib/            # Cliente API FastAPI y cliente Supabase SDK
│       │   ├── types/          # Definiciones estrictas de TypeScript
│       │   ├── App.tsx         # Coordinador principal y enrutador de vistas
│       │   └── index.css       # Tokens de diseño Tailwind con variables CSS
│       ├── tailwind.config.js  # Paleta de diseño Terminal Glow Minimal
│       └── vite.config.ts      # Configuración de compilación Vite
│
├── database/
│   ├── sandbox/                # 🐳 Definición del contenedor PostgreSQL Sandbox
│   │   ├── init.sql            # Rol de solo lectura readonly_student y timeouts
│   │   └── ecommerce_seed.sql  # Dataset de 10 tablas de Ecommerce_Production_DB
│   └── supabase/               # ☁️ Esquemas DDL y catálogo de Supabase Cloud
│       ├── 01_schema.sql       # Tablas de perfiles, rutas, módulos, intentos y logros
│       └── 02_seed_curriculum.sql # Catálogo semilla de ejercicios y pistas
│
├── docs/                       # 📚 Documentación técnica, PRD, SAD y bitácora
│   ├── BITACORA.md             # Registro cronológico detallado de hitos y decisiones
│   ├── PRD.md                  # Especificación de requerimientos de producto
│   └── SAD.md                  # Documento de arquitectura de software
│
├── docker-compose.yml          # Orquestación de contenedores locales (Sandbox + API)
├── AGENTS.md                   # Reglas de ingeniería, Anti-AI Slop y Atomic Design
└── README.md                   # Este documento
```

---

## 🗄️ El Dataset: `Ecommerce_Production_DB`

El sandbox PostgreSQL contiene una base de datos relacional realista de comercio electrónico con 10 tablas interconectadas diseñadas para permitir consultas de cualquier nivel de complejidad:

| Tabla | Registros | Descripción y Contenido |
| :--- | :---: | :--- |
| **`clientes`** | 15 | Identificadores, nombres, emails, ciudades y fechas de registro de clientes. |
| **`categorias`** | 5 | Categorías de catálogo (Electrónica, Hogar, Calzado, Ropa, Deportes). |
| **`proveedores`** | 6 | Empresas proveedoras, países de origen y correos de contacto. |
| **`productos`** | 20 | Catálogo con precios unitarios, IDs de categoría y proveedor, y descripciones. |
| **`pedidos`** | 30 | Órdenes de compra con estados (`completado`, `pendiente`, `enviado`, `cancelado`), montos y fechas. |
| **`detalle_pedidos`** | 45 | Líneas de pedido que vinculan pedidos y productos con cantidades y precios históricos. |
| **`facturas`** | 30 | Comprobantes fiscales con subtotales, impuestos (IVA 16%), totales y fechas de emisión. |
| **`metodos_pago`** | 5 | Métodos soportados (`Tarjeta de Crédito`, `Transferencia`, `PayPal`, `Efectivo`, `Cripto`). |
| **`almacenes`** | 4 | Ubicaciones físicas de distribución (Madrid Norte, Barcelona Puerto, Valencia Centro, Sevilla Sur). |
| **`inventario`** | 25 | Existencias físicas por producto y almacén, con puntos de reorden y stock mínimo. |

---

## 🔒 Seguridad del Sandbox

La regla de oro de Qurio es la **seguridad incondicional**. La ejecución de código SQL arbitrario introducido por usuarios requiere múltiples anillos concéntricos de defensa:

1. **Aislamiento a Nivel de Contenedor:** El sandbox se ejecuta en un contenedor Docker dedicado, físicamente separado de las bases de datos de producción o autenticación.
2. **Rol de Base de Datos Restringido (`readonly_student`):**
   - Permisos exclusivos: `GRANT SELECT ON ALL TABLES IN SCHEMA public`.
   - Revocación total de permisos de creación y modificación: `REVOKE CREATE ON SCHEMA public FROM PUBLIC`.
   - Transacción forzada de solo lectura: `SET TRANSACTION READ ONLY`.
3. **Límites de Recursos y Tiempos de Espera:**
   - `statement_timeout = 2000ms` (bloquea cualquier consulta que tarde más de 2 segundos).
   - `work_mem = 16MB` (limita el uso de memoria RAM por consulta para evitar ataques DoS).
4. **Filtro AST y Expresiones Regulares en FastAPI:**
   - Bloqueo de sentencias múltiples separadas por punto y coma (prevención de inyección).
   - Bloqueo de DDL: `DROP`, `ALTER`, `CREATE`, `TRUNCATE`.
   - Bloqueo de DML destructivo: `INSERT`, `UPDATE`, `DELETE`, `MERGE`.
   - Bloqueo de funciones de sistema peligrosas: `pg_sleep`, `pg_terminate_backend`, `dblink`, etc.
   - Limitador automático de filas a un máximo de 1,000 registros para proteger el ancho de banda.

---

## 🚀 Instalación y Puesta en Marcha Local

### Prerrequisitos

- **Docker Desktop** (con soporte para Docker Compose).
- **Node.js 18+** y **npm** (para el frontend de React).
- **Python 3.12+** (para el backend de FastAPI).
- **Git**.

---

### 1. Clonar el Repositorio

```bash
git clone https://github.com/ErickKNT/qurio.git
cd Qurio
```

---

### 2. Iniciar el Sandbox PostgreSQL (Docker)

Levanta el contenedor de PostgreSQL 16 con el dataset pre-cargado y el usuario de solo lectura:

```bash
docker compose up -d postgres-sandbox
```

Verifica que el contenedor esté saludable (`healthy`):

```bash
docker ps --filter "name=qurio-postgres-sandbox"
```

> **Puerto Local:** `localhost:5433`  
> **Base de Datos:** `Ecommerce_Production_DB`  
> **Usuario de Lectura:** `readonly_student`  
> **Contraseña:** `student_secure_pwd_2026`  
> *(Puedes conectar tu cliente favorito como DataGrip, DBeaver o TablePlus directamente a este puerto).*

---

### 3. Configurar y Ejecutar la API (FastAPI)

Navega a la carpeta de la API:

```bash
cd apps/api
```

Crea y activa un entorno virtual de Python:

```bash
# En Windows (PowerShell):
python -m venv .venv
.venv\Scripts\Activate.ps1

# En Linux / macOS:
python3 -m venv .venv
source .venv/bin/activate
```

Instala las dependencias:

```bash
pip install -r requirements.txt
```

Crea el archivo `.env` a partir del ejemplo:

```bash
# En Windows:
copy .env.example .env

# En Linux / macOS:
cp .env.example .env
```

Inicia el servidor de desarrollo de FastAPI:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> **API activa en:** `http://localhost:8000`  
> **Documentación interactiva Swagger:** `http://localhost:8000/docs`  
> **Documentación ReDoc:** `http://localhost:8000/redoc`

---

### 4. Configurar y Ejecutar el Frontend (React + Vite)

En una nueva terminal, navega a la carpeta del frontend:

```bash
cd apps/web
```

Instala los paquetes de Node:

```bash
npm install
```

Crea el archivo `.env` para el frontend:

```bash
# En Windows:
copy .env.example .env

# En Linux / macOS:
cp .env.example .env
```

Inicia el servidor de desarrollo con Vite:

```bash
npm run dev
```

> **Aplicación Web activa en:** `http://localhost:5173`

---

### 5. Ejecutar la Suite de Pruebas Automatizadas

La suite de pruebas de Qurio evalúa la seguridad, el evaluador semántico y los endpoints de integración en vivo contra el Sandbox de Docker:

```bash
cd apps/api
pytest tests/ -v
```

**Resultado esperado:**
```text
tests/test_security.py::test_select_query_allowed PASSED
tests/test_security.py::test_drop_table_blocked PASSED
...
tests/test_evaluator.py::test_exact_match_success PASSED
tests/test_evaluator.py::test_order_agnostic_multiset_match PASSED
...
tests/test_integration.py::test_live_sandbox_execution PASSED
tests/test_integration.py::test_live_exercise_submission PASSED

======================== 26 passed in 0.17s ========================
```

Para verificar la compilación de TypeScript y empaquetado del frontend:

```bash
cd apps/web
npm run build
```

---

## 🔑 Variables de Entorno

### Backend (`apps/api/.env`)

| Variable | Tipo | Valor por Defecto | Descripción |
| :--- | :---: | :--- | :--- |
| `API_V1_STR` | String | `/api/v1` | Prefijo de rutas de la API REST. |
| `PROJECT_NAME` | String | `Qurio Interactive SQL Runner` | Nombre del servicio. |
| `BACKEND_CORS_ORIGINS` | JSON List | `["http://localhost:5173", "http://127.0.0.1:5173"]` | Orígenes permitidos para CORS. |
| `SANDBOX_HOST` | String | `localhost` | Host del contenedor PostgreSQL. |
| `SANDBOX_PORT` | Entero | `5433` | Puerto mapeado de Docker. |
| `SANDBOX_DB` | String | `Ecommerce_Production_DB` | Nombre de la base de datos de ejercicios. |
| `SANDBOX_USER` | String | `readonly_student` | Rol con permisos estrictos de solo lectura. |
| `SANDBOX_PASSWORD` | String | `student_secure_pwd_2026` | Contraseña del rol sandbox. |
| `SUPABASE_URL` | String | *(Opcional)* | URL del proyecto Supabase Cloud. |
| `SUPABASE_ANON_KEY` | String | *(Opcional)* | Clave anónima pública de Supabase. |

*(Nota: Si no se configuran las credenciales de Supabase, el backend utiliza automáticamente un repositorio de datos semilla en memoria con resiliencia total).*

### Frontend (`apps/web/.env`)

| Variable | Tipo | Valor por Defecto | Descripción |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | String | `http://localhost:8000` | URL base del backend FastAPI. |
| `VITE_SUPABASE_URL` | String | *(Opcional)* | URL de tu instancia de Supabase. |
| `VITE_SUPABASE_ANON_KEY` | String | *(Opcional)* | Clave anónima de Supabase. |

---

## 🎨 Estándares de Ingeniería & Sistema de Diseño

El desarrollo de Qurio sigue directrices estrictas establecidas en [`AGENTS.md`](./AGENTS.md):

### 1. Atomic Design Pragmático
Todo componente reutilizable pertenece obligatoriamente a uno de los 4 niveles jerárquicos:
- **Átomos (`src/components/atoms/`):** Bloques indivisibles estilizados (`Button`, `Badge`, `TextInput`, `KbdShortcut`, `RadioTab`).
- **Moléculas (`src/components/molecules/`):** Combinaciones funcionales (`SearchInput`, `StreakPill`, `FormField`, `MetricTile`, `TrackCard`, `AchievementCard`).
- **Organismos (`src/components/organisms/`):** Módulos autónomos complejos (`MonacoEditorPanel`, `DataGridResults`, `ExerciseSpecPanel`, `TracksView`, `SqlPlaygroundView`, `UserProfileView`, `SidebarNav`, `TopHeader`).
- **Plantillas (`src/components/templates/`):** Estructuras de layout de página desacopladas de la lógica de datos (`DashboardLayout`, `WorkspaceLayout`).

### 2. Estética *Terminal Glow Minimal*
- **Paleta Oscura:** Fondo `#0B1020`, superficies `#111827` / `#172033`, bordes `#1E293B`.
- **Paleta Clara:** Fondo `#F8FAFC`, superficies `#FFFFFF` / `#F1F5F9`, bordes `#E2E8F0`.
- **Acentos Técnicos:** Cyan `#38BDF8`, Índigo `#6366F1`, Esmeralda `#22C55E`, Ámbar `#F59E0B`, Salmón de Error `#EF4444`.
- **Tipografía Dual:** `Inter` / `Plus Jakarta Sans` para lectura de interfaz y `JetBrains Mono` para código SQL, latencias, tipos de datos y atajos de teclado.

---

## 📄 Licencia y Autoría

- **Desarrollado por:** [Erick KNT](https://github.com/ErickKNT/qurio) (`erickipn14@gmail.com`).
- **Licencia:** Este proyecto se distribuye bajo los términos de la **Licencia MIT**. Consulta el archivo `LICENSE` para más información.

---

<p align="center">
  Construido con dedicación para ingenieros de datos, analistas y desarrolladores que desean dominar SQL con rigor.<br />
  <strong>Qurio © 2026</strong>
</p>
