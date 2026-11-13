import os
import json
import urllib.request
import urllib.error
from app.core.config import settings
from app.modules.curriculum.seed_data import SEED_EXERCISES

SUPABASE_URL = settings.SUPABASE_URL or os.getenv("SUPABASE_URL", "")
SERVICE_ROLE = settings.SUPABASE_SERVICE_ROLE_KEY or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

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
    print("--- PASO 1: Comprobando y desacoplando ejercicios legacy de Track 3 ---")
    track3_ex_ids = [
        "e0000000-0000-0000-0000-000000000015",
        "e0000000-0000-0000-0000-000000000016",
        "e0000000-0000-0000-0000-000000000017",
        "e0000000-0000-0000-0000-000000000007",
        "e0000000-0000-0000-0000-000000000018",
    ]
    for ex_id in track3_ex_ids:
        # Eliminar hints asociadas a estos ejercicios legacy
        try:
            api_request(f"exercise_hints?exercise_id=eq.{ex_id}", method="DELETE")
        except Exception as e:
            print(f"Error borrando hints de {ex_id}:", e)
        # Eliminar el ejercicio temporalmente para liberar la FK del módulo legacy
        try:
            api_request(f"exercises?id=eq.{ex_id}", method="DELETE")
            print(f"Desacoplado temporalmente ejercicio {ex_id}")
        except Exception as e:
            print(f"Nota ejercicio {ex_id}:", e)

    print("\n--- PASO 2: Limpiando y alineando Módulos en Supabase Cloud ---")
    # Eliminar módulos de track 3 legacy para recrearlos con orden y IDs correctos
    legacy_mod_ids = [
        "c0000000-0000-0000-0000-000000000008",
        "c0000000-0000-0000-0000-000000000009",
        "c0000000-0000-0000-0000-000000000010",
        "c0000000-0000-0000-0000-000000000011",
    ]
    for m_id in legacy_mod_ids:
        try:
            api_request(f"modules?id=eq.{m_id}", method="DELETE")
            print(f"Módulo legacy eliminado o listo: {m_id}")
        except Exception as e:
            print(f"Nota en módulo {m_id}:", e)

    # 12 Módulos oficiales
    official_modules = [
        {"id": "a0000000-0000-0000-0000-000000000001", "path_id": "sql-foundations", "module_number": 1, "title": "SELECT & Proyecciones de Datos", "description": "Aprende a solicitar columnas específicas y utilizar alias limpios."},
        {"id": "a0000000-0000-0000-0000-000000000002", "path_id": "sql-foundations", "module_number": 2, "title": "Filtrado con WHERE y Operadores Lógicos", "description": "Aplica filtros condicionales exactos mediante operadores de comparación y rangos."},
        {"id": "a0000000-0000-0000-0000-000000000003", "path_id": "sql-foundations", "module_number": 3, "title": "Ordenamiento y Paginación", "description": "Ordena resultados con ORDER BY (ASC/DESC) y limita registros devueltos."},
        {"id": "a0000000-0000-0000-0000-000000000004", "path_id": "sql-foundations", "module_number": 4, "title": "Agregación y Agrupamiento", "description": "Resume datos con COUNT, SUM, AVG y filtra agrupaciones con HAVING."},
        {"id": "b0000000-0000-0000-0000-000000000005", "path_id": "relational-sql", "module_number": 5, "title": "Uniones Fundamentales (INNER JOIN)", "description": "Cruza dos tablas mediante claves foráneas emparejando registros existentes."},
        {"id": "b0000000-0000-0000-0000-000000000006", "path_id": "relational-sql", "module_number": 6, "title": "Detección de Ausencias (LEFT JOIN & NULL)", "description": "Identifica registros huérfanos o entidades sin actividad asociada."},
        {"id": "b0000000-0000-0000-0000-000000000007", "path_id": "relational-sql", "module_number": 7, "title": "Consultas Multi-Tabla en Cascada", "description": "Conecta tres o más tablas en cascada para análisis integral del negocio."},
        {"id": "b0000000-0000-0000-0000-000000000008", "path_id": "relational-sql", "module_number": 8, "title": "Operaciones de Conjunto y Joins Especiales", "description": "Combina consultas mediante UNION, EXCEPT, CROSS JOIN y SELF JOIN."},
        {"id": "c0000000-0000-0000-0000-000000000009", "path_id": "advanced-queries", "module_number": 9, "title": "Subconsultas Analíticas", "description": "Integra subconsultas en cláusulas WHERE y proyecciones escalares."},
        {"id": "c0000000-0000-0000-0000-000000000010", "path_id": "advanced-queries", "module_number": 10, "title": "Expresiones Condicionales (CASE)", "description": "Transforma y categoriza datos en vuelo con lógica condicional."},
        {"id": "c0000000-0000-0000-0000-000000000011", "path_id": "advanced-queries", "module_number": 11, "title": "Common Table Expressions (CTEs)", "description": "Estructura consultas complejas y legibles con la cláusula WITH."},
        {"id": "c0000000-0000-0000-0000-000000000012", "path_id": "advanced-queries", "module_number": 12, "title": "Funciones de Ventana (Window Functions)", "description": "Aplica cálculos de partición y ranking sin colapsar las filas devueltas."},
    ]

    for mod in official_modules:
        res = api_request("modules", method="POST", data=mod)
        print(f"Módulo verificado: #{mod['module_number']} {mod['title']}")

    print("\n--- PASO 3: Sincronizando los 50 Ejercicios Oficiales ---")
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
    with open("database/supabase/02_seed_curriculum.sql", encoding="utf-8") as f:
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

    print("\n--- PASO 4: Verificación Final en Supabase Cloud ---")
    all_mods = api_request("modules?select=id,module_number,title")
    all_exs = api_request("exercises?select=id,title,sort_order&order=sort_order.asc")
    print(f"Total módulos en Cloud: {len(all_mods)}")
    print(f"Total ejercicios en Cloud: {len(all_exs)}")
    if len(all_exs) == 50 and len(all_mods) == 12:
        print("\n>>> ¡SINCRONIZACIÓN EXITOSA! 12 Módulos y 50 Ejercicios en Supabase Cloud <<<")
    else:
        print(f"\nAdvertencia: se esperaban 12 y 50, se obtuvieron {len(all_mods)} y {len(all_exs)}")

if __name__ == "__main__":
    main()
