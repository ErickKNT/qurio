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
import { ExerciseSpecPanel } from '@/components/organisms/ExerciseSpecPanel/ExerciseSpecPanel';
import { UserProfileView } from '@/components/organisms/UserProfileView/UserProfileView';
import { DashboardHomeView } from '@/components/organisms/DashboardHomeView/DashboardHomeView';
import { DesignSystemShowcase } from '@/components/organisms/DesignSystemShowcase/DesignSystemShowcase';
import { FALLBACK_EXERCISES, FALLBACK_TRACKS } from '@/lib/fallbackCurriculum';
import { ACHIEVEMENTS_CATALOG, ECOMMERCE_TABLES_SCHEMA } from '@/lib/api';
import { formatSqlProse, highlightSqlBlock } from '@/lib/format';
import { parseLocation, pathToUrl } from '@/lib/routing';

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
    expect(screen.getAllByText('1. Fundamentos de SQL').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Acreditación de Competencia Técnica').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('QURIO VERIFIED')).toBeInTheDocument();
    expect(screen.getByText('Habilidades Técnicas Validadas')).toBeInTheDocument();
    expect(screen.getByText('Validación Pública')).toBeInTheDocument();
    expect(screen.getByText(/^ID: QURIO-SQL-FO-123456$/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Añadir a LinkedIn/i })).toHaveAttribute(
      'href',
      expect.stringContaining('https://www.linkedin.com/profile/add')
    );
  });

  it('routing soporta /verify/:code para verificación pública de constancias', () => {
    expect(pathToUrl('verify', { verifyCode: 'QURIO-2026-ABC123' })).toBe('/verify/QURIO-2026-ABC123');
    expect(parseLocation('/verify/QURIO-2026-ABC123')).toEqual({
      path: 'verify',
      verifyCode: 'QURIO-2026-ABC123',
    });
  });

  it('formatSqlProse y highlightSqlBlock resaltan palabras reservadas SQL en JetBrains Mono', () => {
    const { container } = render(
      <div>
        <p data-testid="prose">{formatSqlProse('Usa LEFT JOIN con IS NULL en lugar de = NULL.')}</p>
        <pre data-testid="block">{highlightSqlBlock("SELECT nombre FROM usuarios WHERE edad >= 18 AND pais = 'España';")}</pre>
      </div>
    );

    const proseCodes = container.querySelectorAll('[data-testid="prose"] code');
    expect(Array.from(proseCodes).map((el) => el.textContent)).toEqual([
      'LEFT JOIN',
      'IS NULL',
      'NULL',
    ]);

    const selectToken = Array.from(container.querySelectorAll('[data-testid="block"] span')).find(
      (el) => el.textContent === 'SELECT'
    );
    expect(selectToken?.className).toContain('text-cyan-accent');
    expect(selectToken?.className).toContain('font-bold');
  });

  it('ExerciseSpecPanel resalta palabras reservadas SQL en pistas y solución oficial', () => {
    const { container } = render(
      <ExerciseSpecPanel
        exercise={FALLBACK_EXERCISES[0]}
        unlockedHintsCount={2}
        onUnlockHint={() => {}}
        failedAttemptsCount={2}
        isSolutionRevealed={true}
        solutionQuery="SELECT nombre_producto, precio FROM productos;"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Pistas \(2\/3\)/i }));
    const hintCodes = Array.from(container.querySelectorAll('code')).map((el) => el.textContent);
    expect(hintCodes).toContain('SELECT');
    expect(hintCodes).toContain('FROM');

    fireEvent.click(screen.getByRole('button', { name: /^Solución$/i }));
    const selectSpan = Array.from(container.querySelectorAll('pre code span')).find(
      (el) => el.textContent === 'SELECT'
    );
    expect(selectSpan?.className).toContain('text-cyan-accent');
    expect(selectSpan?.className).toContain('font-bold');
  });

  it('UserProfileView renderiza layout Bento real con heatmap 52 semanas, precisión SQL, insignias y EditProfileModal', () => {
    const todayIso = new Date().toISOString().split('T')[0];
    const { container } = render(
      <UserProfileView
        profile={{
          id: 'usr-admin-1',
          username: 'erick_sql',
          full_name: 'Erick Bonilla',
          bio: 'Ingeniero de Datos enfocado en PostgreSQL 16',
          total_xp: 750,
          current_level: 2,
          current_streak_days: 4,
          max_streak_days: 9,
          preferred_theme: 'dark',
          created_at: '2026-11-01T00:00:00Z',
        }}
        history={[
          {
            id: 'h1',
            query: 'SELECT * FROM clientes;',
            executed_at: 'Hace 1 min',
            status: 'SUCCESS',
            execution_time_ms: 8,
            row_count: 15,
          },
        ]}
        tracks={FALLBACK_TRACKS}
        completedCount={12}
        totalExercises={60}
        totalAttemptsCount={10}
        attemptStats={{
          totalAttempts: 10,
          passedAttempts: 8,
          fastAttemptsUnder50ms: 9,
          zeroHintPassedAttempts: 7,
        }}
        achievements={ACHIEVEMENTS_CATALOG}
        dailyActivity={[{ activity_date: todayIso, exercises_solved: 3, xp_earned: 120 }]}
        isCloudAuth={true}
        isAdmin={true}
        onUpdateProfile={async () => {}}
      />
    );

    expect(screen.getByText('Erick Bonilla')).toBeInTheDocument();
    expect(screen.getByText('@erick_sql')).toBeInTheDocument();
    expect(screen.getByText(/Ingeniero de Datos enfocado en PostgreSQL 16/i)).toBeInTheDocument();
    expect(screen.getByText('Mapa de Calor de Actividad (Último Año)')).toBeInTheDocument();

    const heatmap = container.querySelector('[aria-label="Mapa anual de actividad"]');
    expect(heatmap).not.toBeNull();
    expect(heatmap!.querySelectorAll('span')).toHaveLength(364);

    expect(screen.getByText('Precisión SQL')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('Insignias')).toBeInTheDocument();
    expect(screen.getByText('Probar Global (QA)')).toBeInTheDocument();

    // Abrir EditProfileModal y comprobar validación inline
    fireEvent.click(screen.getByRole('button', { name: /Editar Perfil/i }));
    expect(screen.getByText('Editar Perfil Técnico')).toBeInTheDocument();
    const nameInput = screen.getByLabelText(/Nombre Completo/i);
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/al menos 2 caracteres/i);
  });

  it('UserProfileView limita historial rápido a 5 filas y abre QueryHistoryModal con búsqueda y paginación de 10', () => {
    const manyQueries = Array.from({ length: 14 }, (_, idx) => ({
      id: `q-${idx}`,
      query: idx === 11 ? 'SELECT * FROM productos_especial;' : `SELECT ${idx} FROM clientes;`,
      executed_at: '2026-11-17T18:00:00Z',
      status: (idx % 2 === 0 ? 'SUCCESS' : 'ERROR') as 'SUCCESS' | 'ERROR',
      execution_time_ms: 12,
    }));

    render(
      <UserProfileView
        profile={{
          id: 'demo-local',
          username: 'demo_sql',
          total_xp: 200,
          current_level: 1,
          current_streak_days: 1,
          max_streak_days: 1,
          preferred_theme: 'dark',
          created_at: '2026-11-01T00:00:00Z',
        }}
        history={manyQueries}
        tracks={FALLBACK_TRACKS}
        isCloudAuth={false}
      />
    );

    expect(screen.getByText('Historial Reciente (Últimas 5)')).toBeInTheDocument();
    expect(screen.getByText('SELECT 0 FROM clientes;')).toBeInTheDocument();
    expect(screen.queryByText('SELECT 6 FROM clientes;')).not.toBeInTheDocument();
    // No muestra "0 filas" cuando row_count no existe
    expect(screen.queryByText('0 filas')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ver todo/i }));
    expect(screen.getByText('Historial Completo de Consultas')).toBeInTheDocument();
    expect(screen.getByText(/Página/i)).toHaveTextContent(/Página 1 de 2/i);

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(screen.getByText('SELECT * FROM productos_especial;')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Buscar por cláusula o tabla/i);
    fireEvent.change(searchInput, { target: { value: 'productos_especial' } });
    expect(screen.getByText('SELECT * FROM productos_especial;')).toBeInTheDocument();
  });

  it('DashboardHomeView y DesignSystemShowcase operan desacoplados con navegación consistente (H01, H08, H13)', () => {
    const navigatedPaths: string[] = [];
    const startedExercises: string[] = [];

    render(
      <DashboardHomeView
        isAuthenticated={false}
        isAdmin={false}
        profile={null}
        activeLearningData={{
          activeTrack: FALLBACK_TRACKS[0],
          activeModule: FALLBACK_TRACKS[0].modules[0],
          nextExercise: FALLBACK_EXERCISES[0],
          exerciseNumberInTrack: 1,
          trackTotal: 24,
          trackCompleted: 0,
          trackPercent: 0,
          moduleRemaining: 4,
          isAllCompleted: false,
        }}
        recommendedExercise={FALLBACK_EXERCISES[0]}
        exercisesCount={60}
        completedCount={0}
        totalAttemptsCount={0}
        queryHistoryCount={0}
        tables={ECOMMERCE_TABLES_SCHEMA}
        onStartExerciseById={(id) => startedExercises.push(id)}
        onNavigate={(path) => navigatedPaths.push(path)}
        onOpenAuth={() => {}}
        onOpenMethodology={() => {}}
      />
    );

    expect(screen.getByText(/MODO INVITADO • PRUEBA ACTIVA/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Ver Rutas/i }));
    expect(navigatedPaths).toContain('tracks');

    fireEvent.click(screen.getByRole('button', { name: /Resolver Reto/i }));
    expect(startedExercises).toContain(FALLBACK_EXERCISES[0].id);

    cleanup();

    render(<DesignSystemShowcase onNavigate={(path) => navigatedPaths.push(path)} />);
    const emailInput = screen.getByLabelText(/Correo Electrónico de Registro/i);
    fireEvent.change(emailInput, { target: { value: 'invalido' } });
    expect(screen.getByText(/formato de correo electrónico válido/i)).toBeInTheDocument();
  });
});
