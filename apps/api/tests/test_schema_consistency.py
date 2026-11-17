import re
from pathlib import Path
import pytest

ROOT_DIR = Path(__file__).resolve().parents[3]
SEED_SQL_PATH = ROOT_DIR / "database" / "sandbox" / "ecommerce_seed.sql"
README_PATH = ROOT_DIR / "README.md"
CURRICULUM_SPEC_PATH = ROOT_DIR / "docs" / "CURRICULUM_SPEC.md"
WEB_API_PATH = ROOT_DIR / "apps" / "web" / "src" / "lib" / "api.ts"
SPEC_PANEL_PATH = ROOT_DIR / "apps" / "web" / "src" / "components" / "organisms" / "ExerciseSpecPanel" / "ExerciseSpecPanel.tsx"


def test_ecommerce_seed_canonical_tables_and_row_counts():
    """
    Verifica que la fuente canónica (ecommerce_seed.sql) defina exactamente
    las 10 tablas relacionales esperadas y que la tabla 'pagos' con 'metodo_pago' sea la oficial.
    """
    assert SEED_SQL_PATH.exists(), f"No se encontró {SEED_SQL_PATH}"
    content = SEED_SQL_PATH.read_text(encoding="utf-8")

    expected_tables = {
        "clientes",
        "categorias",
        "proveedores",
        "productos",
        "almacenes",
        "inventario",
        "pedidos",
        "detalle_pedidos",
        "facturas",
        "pagos",
    }

    # Detectar CREATE TABLE
    created_tables = set(re.findall(r"CREATE\s+TABLE\s+([a-zA-Z_]+)\s*\(", content, re.IGNORECASE))
    assert expected_tables.issubset(created_tables), f"Faltan tablas en el seed: {expected_tables - created_tables}"

    # Confirmar que 'pagos' existe y 'metodos_pago' NO fue creada como tabla física
    assert "CREATE TABLE pagos" in content
    assert "CREATE TABLE metodos_pago" not in content
    assert "metodo_pago VARCHAR" in content


def test_no_obsolete_metodos_pago_in_docs_and_specs():
    """
    Comprueba que 'metodos_pago' no exista en README.md, CURRICULUM_SPEC.md ni ExerciseSpecPanel.tsx.
    """
    readme = README_PATH.read_text(encoding="utf-8")
    assert "metodos_pago" not in readme, "README.md aún contiene referencias obsoletas a 'metodos_pago'"

    spec = CURRICULUM_SPEC_PATH.read_text(encoding="utf-8")
    assert "metodos_pago" not in spec, "CURRICULUM_SPEC.md aún contiene referencias obsoletas a 'metodos_pago'"

    panel = SPEC_PANEL_PATH.read_text(encoding="utf-8")
    assert "metodos_pago" not in panel, "ExerciseSpecPanel.tsx aún contiene referencias a 'metodos_pago'"
    assert "name: 'pagos'" in panel, "ExerciseSpecPanel.tsx debe incluir la tabla 'pagos'"


def test_spec_panel_exposes_all_10_tables():
    """
    Comprueba que el panel didáctico del IDE (ExerciseSpecPanel.tsx) exponga las 10 tablas relacionales.
    """
    panel = SPEC_PANEL_PATH.read_text(encoding="utf-8")
    expected_tables = [
        "clientes",
        "categorias",
        "proveedores",
        "productos",
        "pedidos",
        "detalle_pedidos",
        "almacenes",
        "inventario",
        "facturas",
        "pagos",
    ]
    for table in expected_tables:
        assert f"name: '{table}'" in panel, f"ExerciseSpecPanel.tsx no expone la tabla '{table}'"


def test_curriculum_60_exercises_unique_sort_order_and_sync():
    """
    Verifica que existan exactamente 60 ejercicios con sort_order contiguo 1..60,
    sincronizados entre seed_data.py, fallbackCurriculum.ts (sin solution_query)
    y database/supabase/02_seed_curriculum.sql (180 pistas en 3 niveles),
    y sin encabezados de rutas/módulos en inglés sin traducir.
    """
    from app.modules.curriculum.seed_data import SEED_EXERCISES

    exercises = sorted(SEED_EXERCISES.values(), key=lambda ex: ex.sort_order)
    assert len(exercises) == 60, f"Se esperaban 60 ejercicios, encontrados: {len(exercises)}"
    assert [ex.sort_order for ex in exercises] == list(range(1, 61)), (
        "Los valores de sort_order deben ser contiguos y únicos del 1 al 60"
    )

    fallback_path = ROOT_DIR / "apps" / "web" / "src" / "lib" / "fallbackCurriculum.ts"
    fallback_text = fallback_path.read_text(encoding="utf-8")
    assert "solution_query" not in fallback_text, (
        "BRECHA DE SEGURIDAD: fallbackCurriculum.ts no debe exponer solution_query"
    )

    seed_sql_path = ROOT_DIR / "database" / "supabase" / "02_seed_curriculum.sql"
    seed_sql_text = seed_sql_path.read_text(encoding="utf-8")
    hints_section = seed_sql_text[seed_sql_text.find("INSERT INTO public.exercise_hints"):]
    sql_hints = re.findall(
        r"\('(e0000000-[0-9a-f\-]+)',\s*(\d+),\s*'((?:[^']|'')*)',\s*(\d+)\)",
        hints_section,
    )
    assert len(sql_hints) == 180, f"Se esperaban 180 pistas en 02_seed_curriculum.sql, encontradas: {len(sql_hints)}"
    sql_hints_map = {(ex_id, int(order)): content.replace("''", "'") for ex_id, order, content, _ in sql_hints}

    for ex in exercises:
        assert f"id: '{ex.id}'" in fallback_text, f"Falta {ex.id} en fallbackCurriculum.ts"
        assert ex.title in fallback_text, f"Título desincronizado en fallbackCurriculum.ts: {ex.title}"
        assert ex.title.replace("'", "''") in seed_sql_text, f"Falta título en 02_seed_curriculum.sql: {ex.title}"
        assert len(ex.hints) == 3, f"Reto #{ex.sort_order} ({ex.title}) debe tener exactamente 3 pistas"
        for idx, hint_text in enumerate(ex.hints, start=1):
            assert sql_hints_map.get((ex.id, idx)) == hint_text, (
                f"Pista {idx} desincronizada en 02_seed_curriculum.sql para {ex.id}"
            )

        if ex.module_id.startswith("a0000000"):
            assert ex.difficulty == "Principiante", f"Ruta 1 reto #{ex.sort_order} debe ser Principiante"
        elif ex.module_id.startswith("b0000000"):
            assert ex.difficulty == "Intermedio", f"Ruta 2 reto #{ex.sort_order} debe ser Intermedio"
        elif ex.module_id.startswith("c0000000"):
            assert ex.difficulty == "Avanzado", f"Ruta 3 reto #{ex.sort_order} debe ser Avanzado"

    # Progresión de átomo cognitivo dentro de Módulo 4 y Módulo 5
    mod4 = [ex for ex in exercises if ex.module_id == "a0000000-0000-0000-0000-000000000004"]
    seen_having = False
    for ex in mod4:
        has_having = "HAVING" in ex.solution_query.upper()
        if has_having:
            seen_having = True
        else:
            assert not seen_having, f"Módulo 4: '{ex.title}' (sin HAVING) no debe ir después de un reto con HAVING"

    mod5 = [ex for ex in exercises if ex.module_id == "b0000000-0000-0000-0000-000000000005"]
    seen_group_by = False
    for ex in mod5:
        has_gb = "GROUP BY" in ex.solution_query.upper()
        if has_gb:
            seen_group_by = True
        else:
            assert not seen_group_by, f"Módulo 5: '{ex.title}' (sin GROUP BY) no debe ir después de un reto con GROUP BY"

    sync_script_text = (ROOT_DIR / "apps" / "api" / "sync_supabase_curriculum.py").read_text(encoding="utf-8")
    forbidden_english_headings = [
        "SQL Foundations",
        "Relational SQL",
        "Advanced Queries",
        "Common Table Expressions",
        "Window Functions",
        "Anti-Join",
    ]
    for label, text_blob in [
        ("fallbackCurriculum.ts", fallback_text),
        ("02_seed_curriculum.sql", seed_sql_text),
        ("sync_supabase_curriculum.py", sync_script_text),
    ]:
        for term in forbidden_english_headings:
            assert term not in text_blob, f"{label} aún contiene encabezado/jerga sin localizar: '{term}'"


async def test_curriculum_pedagogical_rubric_and_sandbox_determinism():
    """
    Audita los 50 retos contra el PostgreSQL Sandbox real y la especificación pedagógica:
    - Cada solution_query ejecuta limpiamente devolviendo 1..20 filas (sin conjunto vacío ni ruido excesivo).
    - Las 3 pistas progresivas no contienen spoilers directos.
    - Los bloques concept no filtran tablas ni columnas reales del esquema ecommerce_sandbox.
    - Los ordenamientos con check_order=True o LIMIT garantizan determinismo estricto.
    """
    import asyncpg
    import sqlglot
    from sqlglot import exp
    from app.core.config import settings
    from app.modules.curriculum.seed_data import SEED_EXERCISES

    real_tables = {
        "clientes", "categorias", "proveedores", "productos", "pedidos",
        "detalle_pedidos", "facturas", "pagos", "almacenes", "inventario",
    }
    real_specific_columns = {
        "cliente_id", "categoria_id", "proveedor_id", "producto_id", "pedido_id",
        "detalle_id", "factura_id", "pago_id", "almacen_id", "nombre_producto",
        "nombre_categoria", "nombre_proveedor", "nombre_almacen", "fecha_registro",
        "fecha_pedido", "estado_pedido", "precio_unitario", "cantidad_disponible",
        "ultima_actualizacion", "fecha_emision", "monto_total", "estado_factura",
        "metodo_pago", "fecha_pago", "estado_pago", "capacidad_m2",
    }
    unique_keys = {
        "cliente_id", "categoria_id", "proveedor_id", "producto_id", "pedido_id",
        "detalle_id", "factura_id", "pago_id", "almacen_id", "email",
    }
    anglicism_patterns = [
        r"\bAnti-?Join\b",
        r"\bPipeline\b",
        r"\bSubquery\b",
        r"\bConditional Aggregation\b",
        r"\bTop \d+\b",
    ]

    conn = await asyncpg.connect(
        host=settings.SANDBOX_DB_HOST,
        port=settings.SANDBOX_DB_PORT,
        database=settings.SANDBOX_DB_NAME,
        user=settings.SANDBOX_DB_USER,
        password=settings.SANDBOX_DB_PASSWORD,
        timeout=5.0,
    )
    try:
        for ex in sorted(SEED_EXERCISES.values(), key=lambda item: item.sort_order):
            async with conn.transaction(readonly=True):
                rows = await conn.fetch(ex.solution_query)
            assert 1 <= len(rows) <= 20, (
                f"Reto #{ex.sort_order} ({ex.title}) devolvió {len(rows)} filas (rango válido: 1..20)"
            )

            norm_sol = re.sub(r"\s+", " ", ex.solution_query.strip().lower()).rstrip(";")
            for idx, hint in enumerate(ex.hints, start=1):
                low = hint.lower()
                assert "escribe:" not in low and "solución:" not in low, (
                    f"Reto #{ex.sort_order} pista {idx} contiene prefijo spoiler"
                )
                assert norm_sol not in re.sub(r"\s+", " ", low), (
                    f"Reto #{ex.sort_order} pista {idx} filtra la solución completa"
                )

            assert ex.concept is not None, f"Reto #{ex.sort_order} sin bloque concept"
            for fname, fval in [
                ("syntax", ex.concept.syntax or ""),
                ("summary", ex.concept.summary or ""),
                ("key_points", " ".join(ex.concept.key_points or [])),
                ("execution_order_note", ex.concept.execution_order_note or ""),
            ]:
                tokens = set(re.findall(r"\b[a-z_][a-z0-9_]*\b", fval.lower()))
                assert not (tokens & real_tables), (
                    f"Reto #{ex.sort_order} concept.{fname} filtra tablas reales: {tokens & real_tables}"
                )
                assert not (tokens & real_specific_columns), (
                    f"Reto #{ex.sort_order} concept.{fname} filtra columnas reales: {tokens & real_specific_columns}"
                )

            text_blob = f"{ex.title} || {ex.prompt}"
            for pat in anglicism_patterns:
                assert not re.search(pat, text_blob), (
                    f"Reto #{ex.sort_order} contiene anglicismo/jerga '{pat}' en título o consigna"
                )

            tree = sqlglot.parse_one(ex.solution_query, read="postgres")
            has_limit = tree.args.get("limit") is not None
            order_node = tree.args.get("order")
            if has_limit or ex.check_order:
                assert order_node is not None, (
                    f"Reto #{ex.sort_order} ({ex.title}) requiere ORDER BY determinista"
                )
                row_number_aliases: set[str] = set()
                if isinstance(tree, exp.Select):
                    for expr in tree.expressions:
                        if isinstance(expr, exp.Alias):
                            win = expr.find(exp.Window)
                            if win and isinstance(win.this, exp.RowNumber) and not win.args.get("partition_by"):
                                row_number_aliases.add(expr.alias.lower())

                is_unique_single_col_set = False
                if isinstance(tree, (exp.Except, exp.Union, exp.Intersect)) and tree.args.get("distinct") is not False:
                    left_sel = tree.find(exp.Select)
                    if left_sel and len(left_sel.expressions) == 1:
                        is_unique_single_col_set = True
                elif isinstance(tree, exp.Select) and tree.args.get("distinct") is not None and len(tree.expressions) == 1:
                    is_unique_single_col_set = True
                else:
                    outer_select = tree.find(exp.Select) if not isinstance(tree, exp.Select) else tree
                    if outer_select and outer_select.args.get("group") and len(outer_select.args["group"].expressions) == 1:
                        is_unique_single_col_set = True
                    elif tree.args.get("with_"):
                        # Si ordena por una clave de agrupación única heredada de una CTE de 1 clave GROUP BY
                        for cte in tree.args["with_"].expressions:
                            cte_sel = cte.this
                            if isinstance(cte_sel, exp.Select) and cte_sel.args.get("group") and len(cte_sel.args["group"].expressions) == 1:
                                is_unique_single_col_set = True

                ordered_cols = [
                    (o.this.name.lower() if isinstance(o.this, (exp.Column, exp.Identifier)) else o.this.sql(dialect="postgres").lower())
                    for o in order_node.expressions
                ]
                has_unique = any(
                    c in unique_keys or c in row_number_aliases or is_unique_single_col_set
                    for c in ordered_cols
                )
                if has_limit:
                    assert has_unique, f"Reto #{ex.sort_order} usa LIMIT sin columna única de desempate: {ordered_cols}"
                elif len(ordered_cols) == 1:
                    assert has_unique, f"Reto #{ex.sort_order} usa ORDER BY simple potencialmente empatable: {ordered_cols}"
    finally:
        await conn.close()
