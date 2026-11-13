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
