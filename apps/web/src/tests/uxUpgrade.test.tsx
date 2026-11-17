// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => cleanup());
import { ER_TABLES, ER_RELATIONS, getRelatedTableNames } from '@/lib/schemaGraph';
import { MODULE_GUIDES, getModuleGuide } from '@/lib/moduleGuides';
import { SQL_REFERENCE_TERMS, searchSqlReference } from '@/lib/sqlReference';
import { ErDiagramModal } from '@/components/organisms/ErDiagramModal/ErDiagramModal';
import { ModuleGuideModal } from '@/components/organisms/ModuleGuideModal/ModuleGuideModal';
import { CertificateModal } from '@/components/organisms/CertificateModal/CertificateModal';

describe('Qurio UX, ER, Guías y Referencia SQL', () => {
  it('schemaGraph expone exactamente las 10 tablas canónicas y 9 relaciones FK válidas', () => {
    expect(ER_TABLES).toHaveLength(10);
    expect(ER_RELATIONS).toHaveLength(9);

    const tableNames = new Set(ER_TABLES.map((t) => t.name));
    for (const rel of ER_RELATIONS) {
      expect(tableNames.has(rel.fromTable)).toBe(true);
      expect(tableNames.has(rel.toTable)).toBe(true);
      const fromCols = ER_TABLES.find((t) => t.name === rel.fromTable)!.columns.map((c) => c.name);
      const toCols = ER_TABLES.find((t) => t.name === rel.toTable)!.columns.map((c) => c.name);
      expect(fromCols).toContain(rel.fromColumn);
      expect(toCols).toContain(rel.toColumn);
    }

    const pedidosRelated = getRelatedTableNames('pedidos');
    expect(pedidosRelated.has('clientes')).toBe(true);
    expect(pedidosRelated.has('facturas')).toBe(true);
    expect(pedidosRelated.has('detalle_pedidos')).toBe(true);
  });

  it('moduleGuides cubre los 12 módulos oficiales con diagramas y ejemplos sin spoilers de Ecommerce DB', () => {
    expect(MODULE_GUIDES).toHaveLength(12);
    const ecommerceTables = ['detalle_pedidos', 'almacenes', 'inventario', 'proveedores'];

    for (let i = 1; i <= 12; i++) {
      const prefix = i <= 4 ? 'a' : i <= 8 ? 'b' : 'c';
      const id = `${prefix}0000000-0000-0000-0000-0000000000${String(i).padStart(2, '0')}`;
      const guide = getModuleGuide(id);
      expect(guide).toBeDefined();
      expect(guide!.workedExamples.length).toBeGreaterThan(0);
      expect(guide!.commonMistakes.length).toBeGreaterThan(0);
      expect(guide!.transformDiagram.inputs.length).toBeGreaterThan(0);

      for (const ex of guide!.workedExamples) {
        for (const tbl of ecommerceTables) {
          expect(ex.sql.toLowerCase()).not.toContain(tbl);
        }
      }
    }
  });

  it('sqlReference filtra términos por categoría y texto', () => {
    expect(SQL_REFERENCE_TERMS.length).toBeGreaterThanOrEqual(20);
    expect(searchSqlReference('COALESCE').some((t) => t.id === 'coalesce')).toBe(true);
    expect(searchSqlReference('', 'modelado').every((t) => t.category === 'modelado')).toBe(true);
  });

  it('ErDiagramModal renderiza las 10 tablas y ajusta el zoom', () => {
    render(<ErDiagramModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/Diagrama Entidad-Relación/i)).toBeInTheDocument();
    expect(screen.getByText('clientes')).toBeInTheDocument();
    expect(screen.getByText('detalle_pedidos')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Acercar diagrama'));
    expect(screen.getByText('102%')).toBeInTheDocument();
  });

  it('ModuleGuideModal renderiza el diagrama de transformación y ejemplos', () => {
    const guide = getModuleGuide('b0000000-0000-0000-0000-000000000006')!;
    render(<ModuleGuideModal guide={guide} isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/Guía Teórica: Ausencias y Ceros/i)).toBeInTheDocument();
    expect(screen.getByText(guide.transformDiagram.title)).toBeInTheDocument();
    expect(screen.getByText(/Errores Frecuentes a Evitar/i)).toBeInTheDocument();
  });

  it('CertificateModal muestra datos verificados de la constancia', () => {
    render(
      <CertificateModal
        isOpen={true}
        onClose={() => {}}
        certificate={{
          id: 'sql-foundations',
          recipientName: 'erick_sql',
          trackTitle: '1. Fundamentos de SQL',
          completedExercises: 24,
          totalExercises: 24,
          issuedDate: '17 nov 2026',
          verificationCode: 'QURIO-SQL-FO-123456',
        }}
      />
    );
    expect(screen.getByText('erick_sql')).toBeInTheDocument();
    expect(screen.getByText('1. Fundamentos de SQL')).toBeInTheDocument();
    expect(screen.getByText(/QURIO-SQL-FO-123456/)).toBeInTheDocument();
  });
});
