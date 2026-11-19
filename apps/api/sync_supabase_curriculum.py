import os
import json
from pathlib import Path
import urllib.request
import urllib.error
from dotenv import load_dotenv

API_DIR = Path(__file__).resolve().parent
ROOT_DIR = API_DIR.parents[1]
load_dotenv(API_DIR / ".env")

from app.core.config import settings
from app.modules.curriculum.seed_data import SEED_EXERCISES

SUPABASE_URL = os.getenv("SUPABASE_URL") or settings.SUPABASE_URL
SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or settings.SUPABASE_SERVICE_ROLE_KEY

headers = {
    "apikey": SERVICE_ROLE,
    "Authorization": f"Bearer {SERVICE_ROLE}",
    "Content-Type": "application/json",
    "Prefer": "return=representation,resolution=merge-duplicates"
}

def api_request(path, method="GET", data=None, extra_headers=None):
    h = headers.copy()
    if extra_headers:
        h.update(extra_headers)
    req_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", headers=h, method=method, data=req_data)
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode("utf-8")
        return json.loads(content) if content else None

def main():
    print("\n--- PASO 1: Sincronizando las 4 Rutas Formativas (learning_paths) vía UPSERT ---")
    official_paths = [
        {
            "id": "sql-foundations",
            "title": "Fundamentos de SQL",
            "description": "Aprende a consultar bases de datos desde cero: columnas con SELECT, cálculos, filtros con WHERE y fechas, ordenamiento y agregaciones.",
            "difficulty": "Principiante",
            "sort_order": 1,
            "estimated_hours": 7,
            "badge_reward": "Primera consulta",
        },
        {
            "id": "relational-sql",
            "title": "SQL relacional",
            "description": "Cruza tablas relacionadas usando llaves foráneas, INNER JOIN, LEFT JOIN con COALESCE, consultas de varias tablas y operaciones de conjunto.",
            "difficulty": "Intermedio",
            "sort_order": 2,
            "estimated_hours": 9,
            "badge_reward": "Cruce de tablas",
        },
        {
            "id": "advanced-queries",
            "title": "Consultas avanzadas",
            "description": "Trabaja con subconsultas correlacionadas (EXISTS/NOT EXISTS), condiciones con CASE, consultas temporales con WITH (CTEs) y funciones de ventana.",
            "difficulty": "Avanzado",
            "sort_order": 3,
            "estimated_hours": 14,
            "badge_reward": "Funciones de ventana",
        },
        {
            "id": "data-manipulation-ddl",
            "title": "Ingeniería y manipulación de datos",
            "description": "Inserta, actualiza y borra datos en transacciones, crea y modifica tablas, y acelera consultas con INSERT, UPSERT (ON CONFLICT), UPDATE, DELETE, RETURNING, CREATE/ALTER/DROP TABLE e índices B-Tree.",
            "difficulty": "Intermedio",
            "sort_order": 4,
            "estimated_hours": 12,
            "badge_reward": "Diseño de esquemas",
        },
    ]
    for lp in official_paths:
        api_request("learning_paths", method="POST", data=lp)
        print(f"Ruta verificada: {lp['id']} — {lp['title']}")

    print("\n--- PASO 2: Sincronizando los 16 Módulos en Supabase Cloud vía UPSERT ---")
    official_modules = [
        {"id": "a0000000-0000-0000-0000-000000000001", "path_id": "sql-foundations", "module_number": 1, "title": "SELECT y columnas calculadas", "description": "Elige columnas específicas, usa alias claros y haz cálculos aritméticos simples."},
        {"id": "a0000000-0000-0000-0000-000000000002", "path_id": "sql-foundations", "module_number": 2, "title": "Filtrado con WHERE y operadores lógicos", "description": "Filtra filas con operadores de comparación, patrones de texto, paréntesis, valores nulos (IS NULL), fechas y rangos con BETWEEN."},
        {"id": "a0000000-0000-0000-0000-000000000003", "path_id": "sql-foundations", "module_number": 3, "title": "Ordenamiento y paginación", "description": "Ordena resultados con ORDER BY (ASC/DESC) y limita las filas devueltas con LIMIT y OFFSET."},
        {"id": "a0000000-0000-0000-0000-000000000004", "path_id": "sql-foundations", "module_number": 4, "title": "Agregación y agrupamiento", "description": "Resume datos con COUNT, COUNT(DISTINCT), SUM, AVG, filtros previos con WHERE y filtros de grupos con HAVING."},
        {"id": "b0000000-0000-0000-0000-000000000005", "path_id": "relational-sql", "module_number": 5, "title": "Uniones básicas (INNER JOIN)", "description": "Cruza tablas relacionadas con llaves foráneas antes de pasar a agregaciones entre varias tablas."},
        {"id": "b0000000-0000-0000-0000-000000000006", "path_id": "relational-sql", "module_number": 6, "title": "Ausencias y ceros (LEFT JOIN y NULL)", "description": "Encuentra filas sin coincidencias o sin actividad usando LEFT JOIN, IS NULL y COALESCE."},
        {"id": "b0000000-0000-0000-0000-000000000007", "path_id": "relational-sql", "module_number": 7, "title": "Consultas de varias tablas", "description": "Conecta 3 o más tablas para analizar información del negocio en cascada."},
        {"id": "b0000000-0000-0000-0000-000000000008", "path_id": "relational-sql", "module_number": 8, "title": "Conjuntos y uniones especiales", "description": "Combina consultas con UNION, INTERSECT, EXCEPT, CROSS JOIN y uniones sobre la misma tabla (SELF JOIN)."},
        {"id": "c0000000-0000-0000-0000-000000000009", "path_id": "advanced-queries", "module_number": 9, "title": "Subconsultas", "description": "Usa subconsultas escalares, listas IN y pruebas de existencia (EXISTS / NOT EXISTS) en WHERE."},
        {"id": "c0000000-0000-0000-0000-000000000010", "path_id": "advanced-queries", "module_number": 10, "title": "Expresiones condicionales (CASE)", "description": "Clasifica filas y calcula conteos condicionales sobre la marcha con CASE WHEN."},
        {"id": "c0000000-0000-0000-0000-000000000011", "path_id": "advanced-queries", "module_number": 11, "title": "Consultas temporales con WITH (CTEs)", "description": "Divide consultas largas en pasos claros y legibles con la cláusula WITH."},
        {"id": "c0000000-0000-0000-0000-000000000012", "path_id": "advanced-queries", "module_number": 12, "title": "Funciones de ventana", "description": "Calcula rankings, máximos por grupo, acumulados y comparaciones entre filas (ROW_NUMBER, DENSE_RANK, SUM OVER, LAG)."},
        {"id": "d0000000-0000-0000-0000-000000000013", "path_id": "data-manipulation-ddl", "module_number": 13, "title": "Inserción de filas (INSERT)", "description": "Inserta filas individuales o por lotes, devuelve los datos guardados con RETURNING, copia filas con INSERT INTO ... SELECT y resuelve colisiones con ON CONFLICT (UPSERT)."},
        {"id": "d0000000-0000-0000-0000-000000000014", "path_id": "data-manipulation-ddl", "module_number": 14, "title": "Actualización y borrado (UPDATE y DELETE)", "description": "Modifica y borra filas de forma segura usando UPDATE ... WHERE, RETURNING, cruces UPDATE ... FROM y DELETE."},
        {"id": "d0000000-0000-0000-0000-000000000015", "path_id": "data-manipulation-ddl", "module_number": 15, "title": "Creación y cambios de tablas (CREATE, ALTER y DROP)", "description": "Crea tablas con llaves primarias, foráneas y reglas CHECK, modifica columnas con ALTER TABLE y borra tablas con DROP TABLE CASCADE."},
        {"id": "d0000000-0000-0000-0000-000000000016", "path_id": "data-manipulation-ddl", "module_number": 16, "title": "Índices y rendimiento (CREATE INDEX)", "description": "Crea índices B-Tree simples, índices únicos compuestos, índices parciales con WHERE y elimina índices con DROP INDEX."},
    ]

    for mod in official_modules:
        res = api_request("modules", method="POST", data=mod)
        print(f"Módulo verificado: #{mod['module_number']} {mod['title']}")

    print("\n--- PASO 3: Sincronizando los 80 Ejercicios Oficiales ---")
    exercises_to_upsert = []
    for ex in SEED_EXERCISES.values():
        exercises_to_upsert.append({
            "id": ex.id,
            "module_id": ex.module_id,
            "title": ex.title,
            "prompt": ex.prompt,
            "initial_code": ex.initial_code,
            "solution_query": ex.solution_query,
            "target_database": "ecommerce_sandbox",
            "xp_reward": ex.xp_reward,
            "difficulty": ex.difficulty,
            "check_order": ex.check_order,
            "sort_order": ex.sort_order,
        })

    # Upsert en lotes de 10
    for i in range(0, len(exercises_to_upsert), 10):
        batch = exercises_to_upsert[i:i+10]
        res = api_request("exercises", method="POST", data=batch)
        print(f"Lote de ejercicios insertado: {i+1} a {min(i+10, len(exercises_to_upsert))}")

    print("\n--- PASO 3.5: Sincronizando Pistas (Hints) desde 02_seed_curriculum.sql ---")
    import re
    with open(ROOT_DIR / "database" / "supabase" / "02_seed_curriculum.sql", encoding="utf-8") as f:
        sql_content = f.read()

    # Extraer sección de INSERT INTO public.exercise_hints
    hints_section = sql_content[sql_content.find("INSERT INTO public.exercise_hints"):]
    hint_matches = re.findall(
        r"\('(e0000000-[0-9a-f\-]+)',\s*(\d+),\s*'((?:[^']|'')*)',\s*(\d+)\)",
        hints_section
    )
    print(f"Pistas encontradas en SQL: {len(hint_matches)}")
    hints_to_upsert = []
    for ex_id, h_order, content, penalty in hint_matches:
        hints_to_upsert.append({
            "exercise_id": ex_id,
            "hint_order": int(h_order),
            "content": content.replace("''", "'"),
            "xp_penalty_percent": int(penalty),
        })

    for i in range(0, len(hints_to_upsert), 20):
        batch = hints_to_upsert[i:i+20]
        try:
            api_request("exercise_hints?on_conflict=exercise_id,hint_order", method="POST", data=batch)
        except Exception as e:
            print(f"Error en lote de hints {i}:", e)
    print(f"Total pistas procesadas: {len(hints_to_upsert)}")

    print("\n--- PASO 3.8: Sincronizando los 14 Logros desde 02_seed_curriculum.sql ---")
    ach_section = sql_content[sql_content.find("INSERT INTO public.achievements"):]
    ach_matches = re.findall(
        r"\('([a-z0-9\-]+)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'([^']+)',\s*'([^']+)',\s*(\d+)\)",
        ach_section,
    )
    if ach_matches:
        ach_to_upsert = [
            {
                "id": a_id,
                "name": name.replace("''", "'"),
                "description": desc.replace("''", "'"),
                "icon": icon,
                "category": cat,
                "xp_reward": int(xp),
            }
            for a_id, name, desc, icon, cat, xp in ach_matches
        ]
        api_request("achievements", method="POST", data=ach_to_upsert)
        print(f"Total logros sincronizados: {len(ach_to_upsert)}")

    print("\n--- PASO 4: Verificación Final en Supabase Cloud ---")
    all_mods = api_request("modules?select=id,module_number,title")
    all_exs = api_request("exercises?select=id,title,sort_order&order=sort_order.asc")
    print(f"Total módulos en Cloud: {len(all_mods)}")
    print(f"Total ejercicios en Cloud: {len(all_exs)}")
    if len(all_exs) == 80 and len(all_mods) == 16:
        print("\n>>> ¡SINCRONIZACIÓN EXITOSA! 16 Módulos y 80 Ejercicios en Supabase Cloud <<<")
    else:
        print(f"\nAdvertencia: se esperaban 16 y 80, se obtuvieron {len(all_mods)} y {len(all_exs)}")

if __name__ == "__main__":
    main()
