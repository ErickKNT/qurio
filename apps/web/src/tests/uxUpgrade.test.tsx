// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
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
import { TracksView } from '@/components/organisms/TracksView/TracksView';
import { DataGridResults } from '@/components/organisms/DataGridResults/DataGridResults';
import { ModuleCompletedModal } from '@/components/molecules/ModuleCompletedModal/ModuleCompletedModal';
import { EditProfileModal } from '@/components/molecules/EditProfileModal/EditProfileModal';
import * as avatarLib from '@/lib/avatar';
import { persistence } from '@/lib/persistence';
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

  it('moduleGuides cubre los 16 módulos oficiales con diagramas y ejemplos sin spoilers de Ecommerce DB', () => {
    expect(MODULE_GUIDES).toHaveLength(16);
    const ecommerceTables = ['detalle_pedidos', 'almacenes', 'inventario', 'proveedores'];

    for (let i = 1; i <= 16; i++) {
      const prefix = i <= 4 ? 'a' : i <= 8 ? 'b' : i <= 12 ? 'c' : 'd';
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
    expect(screen.getAllByText('Constancia de finalización').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('QURIO VERIFIED')).toBeInTheDocument();
    expect(screen.getByText('Temas incluidos')).toBeInTheDocument();
    expect(screen.getByText('Verificación pública')).toBeInTheDocument();
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

    cleanup();

    const { container: ddlContainer } = render(
      <div>
        <p data-testid="ddl-prose">{formatSqlProse('Usa DELETE, UNIQUE, INDEX, RETURNING y CASCADE en DDL/DML.')}</p>
        <pre data-testid="ddl-block">{highlightSqlBlock('CREATE UNIQUE INDEX idx_email ON clientes (email); DELETE FROM logs RETURNING *;')}</pre>
      </div>
    );

    const ddlProseCodes = Array.from(ddlContainer.querySelectorAll('[data-testid="ddl-prose"] code')).map((el) => el.textContent);
    expect(ddlProseCodes).toEqual(['DELETE', 'UNIQUE', 'INDEX', 'RETURNING', 'CASCADE']);

    const uniqueIndexSpan = Array.from(ddlContainer.querySelectorAll('[data-testid="ddl-block"] span')).find(
      (el) => el.textContent === 'CREATE UNIQUE INDEX'
    );
    expect(uniqueIndexSpan?.className).toContain('text-cyan-accent');
    expect(uniqueIndexSpan?.className).toContain('font-bold');

    cleanup();

    const { container: boldContainer } = render(
      <p data-testid="bold-prose">
        {formatSqlProse('El **alias de tabla** va en FROM sin AS y la **Clave Primaria (`PK`)** identifica la fila.')}
      </p>
    );
    const boldNodes = Array.from(boldContainer.querySelectorAll('[data-testid="bold-prose"] strong'));
    expect(boldNodes.map((n) => n.textContent)).toEqual(['alias de tabla', 'Clave Primaria (PK)']);
    expect(boldContainer.textContent).not.toContain('**');
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
    expect(screen.getByText('Actividad del último año')).toBeInTheDocument();

    const heatmap = container.querySelector('[aria-label="Mapa anual de actividad"]');
    expect(heatmap).not.toBeNull();
    expect(heatmap!.querySelectorAll('span')).toHaveLength(364);

    expect(screen.getByText('Precisión SQL')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('Insignias')).toBeInTheDocument();
    expect(screen.getByText('Probar Global (QA)')).toBeInTheDocument();

    // Abrir EditProfileModal y comprobar validación inline y ausencia de campo URL externa
    fireEvent.click(screen.getByRole('button', { name: /Editar Perfil/i }));
    expect(screen.getByText('Editar Perfil Técnico')).toBeInTheDocument();
    expect(screen.queryByLabelText(/URL de Avatar/i)).toBeNull();
    const nameInput = screen.getByLabelText(/Nombre Completo/i);
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/al menos 2 caracteres/i);
  });

  it('EditProfileModal valida archivo de avatar, procesa subida a Storage y restaura avatar del proveedor al quitar foto', async () => {
    const createObjectUrlMock = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-preview');
    const revokeObjectUrlMock = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const onSave = vi.fn().mockResolvedValue({ success: true });
    const onClose = vi.fn();

    const { rerender } = render(
      <EditProfileModal
        profile={{
          id: 'usr-cloud-1',
          username: 'erick_sql',
          full_name: 'Erick Bonilla',
          avatar_url: 'https://lh3.googleusercontent.com/provider-avatar.jpg',
          bio: 'Data Engineer',
          total_xp: 500,
          current_level: 2,
          current_streak_days: 3,
          max_streak_days: 5,
          preferred_theme: 'dark',
          created_at: '2026-11-01T00:00:00Z',
        }}
        isOpen={true}
        isCloudAuth={true}
        providerAvatarUrl="https://lh3.googleusercontent.com/provider-avatar.jpg"
        onClose={onClose}
        onSave={onSave}
      />
    );

    const fileInput = screen.getByLabelText(/Imagen de Perfil/i) as HTMLInputElement;

    // 1. Rechazar SVG con error inline
    const svgFile = new File(['<svg />'], 'bad.svg', { type: 'image/svg+xml' });
    fireEvent.change(fileInput, { target: { files: [svgFile] } });
    expect(screen.getByRole('alert')).toHaveTextContent(/JPG, PNG o WebP/i);

    // 2. Subir PNG válido -> procesa en canvas y sube a Storage
    const processedBlob = new Blob([new Uint8Array(32)], { type: 'image/webp' });
    vi.spyOn(avatarLib, 'processAvatarImage').mockResolvedValue(processedBlob);
    vi.spyOn(persistence, 'uploadUserAvatar').mockResolvedValue({
      publicUrl: 'https://demo.supabase.co/storage/v1/object/public/avatars/usr-cloud-1/avatar.webp?v=99',
    });

    const validPng = new File([new Uint8Array(64)], 'foto.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [validPng] } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          avatar_url:
            'https://demo.supabase.co/storage/v1/object/public/avatars/usr-cloud-1/avatar.webp?v=99',
        })
      );
    });

    // 3. Quitar foto personalizada -> borra de Storage y envía avatar_url: null para restaurar avatar del proveedor
    vi.spyOn(persistence, 'removeUserAvatar').mockResolvedValue({ success: true });
    rerender(
      <EditProfileModal
        profile={{
          id: 'usr-cloud-1',
          username: 'erick_sql',
          full_name: 'Erick Bonilla',
          avatar_url: 'https://demo.supabase.co/storage/v1/object/public/avatars/usr-cloud-1/avatar.webp?v=99',
          bio: 'Data Engineer',
          total_xp: 500,
          current_level: 2,
          current_streak_days: 3,
          max_streak_days: 5,
          preferred_theme: 'dark',
          created_at: '2026-11-01T00:00:00Z',
        }}
        isOpen={true}
        isCloudAuth={true}
        providerAvatarUrl="https://lh3.googleusercontent.com/provider-avatar.jpg"
        onClose={onClose}
        onSave={onSave}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Quitar foto/i }));
    expect(screen.getByText(/Se restaurará tu avatar del proveedor al guardar/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => {
      expect(persistence.removeUserAvatar).toHaveBeenCalledWith('usr-cloud-1');
      expect(onSave).toHaveBeenLastCalledWith(
        expect.objectContaining({
          avatar_url: null,
        })
      );
    });

    createObjectUrlMock.mockRestore();
    revokeObjectUrlMock.mockRestore();
    vi.restoreAllMocks();
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
          activeModule: FALLBACK_TRACKS[0]?.modules?.[0],
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

    expect(screen.getByText(/MODO INVITADO • 3 RETOS GRATIS/i)).toBeInTheDocument();
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

  it('TracksView y LearningRoadmapMap despliegan las 4 rutas en grid 2x2 y los 16 módulos en el mapa curricular interactivo', () => {
    const { container } = render(
      <TracksView
        tracks={FALLBACK_TRACKS}
        exercises={FALLBACK_EXERCISES}
        onSelectExercise={() => {}}
      />
    );

    expect(screen.getByText('4 rutas')).toBeInTheDocument();
    expect(screen.getByText('16 Módulos • 80 Retos')).toBeInTheDocument();
    expect(screen.getByText(/Etapa 4 • Ingeniería y Manipulación de Datos/i)).toBeInTheDocument();
    expect(screen.getByText('M13')).toBeInTheDocument();
    expect(screen.getByText('M14')).toBeInTheDocument();
    expect(screen.getByText('M15')).toBeInTheDocument();
    expect(screen.getByText('M16')).toBeInTheDocument();

    // Verificar grid 2x2 simétrico en las tarjetas de ruta
    const tracksGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-5');
    expect(tracksGrid).not.toBeNull();

    // Cambiar al modo Camino por Etapas y verificar que renderiza las 4 etapas
    fireEvent.click(screen.getByRole('button', { name: /Camino por Etapas/i }));
    expect(screen.getByText(/Etapa 4: Ingeniería y Manipulación de Datos/i)).toBeInTheDocument();
  });

  it('TracksView selecciona por defecto la ruta actual en curso y abre su primer módulo incompleto', () => {
    const track1ModuleIds = new Set(FALLBACK_TRACKS[0].modules!.map((m) => m.id));
    const track1Ids = FALLBACK_EXERCISES
      .filter((ex) => track1ModuleIds.has(ex.module_id))
      .map((ex) => ex.id);
    const track2 = FALLBACK_TRACKS[1];
    const track2Mod1 = track2.modules![0];
    const track2Mod2 = track2.modules![1];
    const mod1FirstExercise = FALLBACK_EXERCISES.find(
      (ex) => ex.module_id === track2Mod1.id
    )!;
    const mod2FirstExercise = FALLBACK_EXERCISES.find(
      (ex) => ex.module_id === track2Mod2.id
    )!;

    // Con la Ruta 1 completada, debe seleccionar la Ruta 2 y abrir su primer módulo incompleto
    const { rerender } = render(
      <TracksView
        tracks={FALLBACK_TRACKS}
        exercises={FALLBACK_EXERCISES}
        completedExerciseIds={new Set(track1Ids)}
        onSelectExercise={() => {}}
      />
    );

    expect(screen.getByText(`Temario: ${track2.title}`)).toBeInTheDocument();
    expect(screen.getByText(mod1FirstExercise.title)).toBeInTheDocument();
    expect(screen.queryByText(mod2FirstExercise.title)).not.toBeInTheDocument();

    // Si también se completa el primer módulo de la Ruta 2, debe abrir automáticamente el segundo módulo
    const track2Mod1Ids = FALLBACK_EXERCISES
      .filter((ex) => ex.module_id === track2Mod1.id)
      .map((ex) => ex.id);

    rerender(
      <TracksView
        tracks={FALLBACK_TRACKS}
        exercises={FALLBACK_EXERCISES}
        completedExerciseIds={new Set([...track1Ids, ...track2Mod1Ids])}
        onSelectExercise={() => {}}
      />
    );

    expect(screen.getByText(`Temario: ${track2.title}`)).toBeInTheDocument();
    expect(screen.getByText(mod2FirstExercise.title)).toBeInTheDocument();
  });

  it('TracksView controlado respeta selectedTrackId entre montajes y notifica selección manual vía onSelectTrack', () => {
    const track2 = FALLBACK_TRACKS[1];
    const track3 = FALLBACK_TRACKS[2];
    const selectedHistory: string[] = [];

    const { unmount } = render(
      <TracksView
        tracks={FALLBACK_TRACKS}
        exercises={FALLBACK_EXERCISES}
        selectedTrackId={track2.id}
        onSelectTrack={(trackId) => selectedHistory.push(trackId)}
        onSelectExercise={() => {}}
      />
    );

    expect(screen.getByText(`Temario: ${track2.title}`)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('heading', { name: track3.title }));
    expect(selectedHistory).toEqual([track3.id]);

    // Simula salir de Rutas de aprendizaje y volver manteniendo el track seleccionado
    unmount();

    render(
      <TracksView
        tracks={FALLBACK_TRACKS}
        exercises={FALLBACK_EXERCISES}
        selectedTrackId={track3.id}
        onSelectTrack={(trackId) => selectedHistory.push(trackId)}
        onSelectExercise={() => {}}
      />
    );

    expect(screen.getByText(`Temario: ${track3.title}`)).toBeInTheDocument();
  });

  it('ModuleCompletedModal felicita el cierre del módulo y permite continuar al siguiente o revisar consulta', () => {
    const track = FALLBACK_TRACKS[0];
    const mod1 = track.modules![0];
    const mod2 = track.modules![1];
    let closed = 0;
    let continued = 0;
    let viewedTracks = 0;

    render(
      <ModuleCompletedModal
        isOpen={true}
        lastXpAwarded={35}
        summary={{
          completedModule: mod1,
          track,
          moduleTotalExercises: 4,
          moduleTotalXp: 130,
          trackCompletedCount: 4,
          trackTotalCount: 24,
          trackPercent: 17,
          isTrackCompleted: false,
          nextModule: mod2,
          nextExercise: FALLBACK_EXERCISES[4],
        }}
        onClose={() => {
          closed += 1;
        }}
        onContinueNextModule={() => {
          continued += 1;
        }}
        onViewTracks={() => {
          viewedTracks += 1;
        }}
      />
    );

    expect(screen.getByText('Módulo completado')).toBeInTheDocument();
    expect(screen.getByText(`Cerraste ${mod1.title}`)).toBeInTheDocument();
    expect(screen.getByText('4 / 4 retos')).toBeInTheDocument();
    expect(screen.getByText('130 XP del módulo')).toBeInTheDocument();
    expect(screen.getByText(mod2.title)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Continuar al siguiente módulo/i }));
    expect(continued).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: /Revisar consulta/i }));
    expect(closed).toBe(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(closed).toBe(2);

    cleanup();

    render(
      <ModuleCompletedModal
        isOpen={true}
        lastXpAwarded={50}
        summary={{
          completedModule: track.modules![3],
          track,
          moduleTotalExercises: 5,
          moduleTotalXp: 210,
          trackCompletedCount: 24,
          trackTotalCount: 24,
          trackPercent: 100,
          isTrackCompleted: true,
        }}
        onClose={() => {}}
        onContinueNextModule={() => {}}
        onViewTracks={() => {
          viewedTracks += 1;
        }}
      />
    );

    expect(screen.getByText('Ruta completada')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Ver rutas y constancia/i }));
    expect(viewedTracks).toBe(1);
  });

  it('DataGridResults muestra la etiqueta personalizada de transición entre módulos', () => {
    render(
      <DataGridResults
        status="SUCCESS"
        executionTimeMs={4.2}
        rowCount={1}
        columns={[{ name: 'id', type: 'int4' }]}
        rows={[[1]]}
        xpAwarded={35}
        onNextExercise={() => {}}
        nextExerciseLabel="Siguiente Módulo"
      />
    );

    expect(screen.getByRole('button', { name: /Siguiente Módulo/i })).toBeInTheDocument();
  });

  it('TracksView muestra el botón Probar modal (QA) solo para administradores y abre ModuleCompletedModal', () => {
    render(
      <TracksView
        tracks={FALLBACK_TRACKS}
        exercises={FALLBACK_EXERCISES}
        onSelectExercise={() => {}}
        isAdmin={false}
      />
    );
    expect(screen.queryAllByRole('button', { name: /Probar modal \(QA\)/i })).toHaveLength(0);

    cleanup();

    render(
      <TracksView
        tracks={FALLBACK_TRACKS}
        exercises={FALLBACK_EXERCISES}
        onSelectExercise={() => {}}
        isAdmin={true}
      />
    );
    const qaButtons = screen.getAllByRole('button', { name: /Probar modal \(QA\)/i });
    expect(qaButtons).toHaveLength(FALLBACK_TRACKS.length);

    fireEvent.click(qaButtons[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Módulo completado')).toBeInTheDocument();
  });
});
