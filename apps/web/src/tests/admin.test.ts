// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const mockUseAuth = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    isDark: true,
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
  }),
}));

const mockGetLiveOps = vi.fn();
const mockGetCurriculumMetrics = vi.fn();
const mockListUsers = vi.fn();
const mockListAttempts = vi.fn();
const mockUpdateUserRole = vi.fn();
const mockUpdateUserBan = vi.fn();

vi.mock('@/lib/adminApi', () => ({
  adminApi: {
    getLiveOps: (...args: unknown[]) => mockGetLiveOps(...args),
    getCurriculumMetrics: (...args: unknown[]) => mockGetCurriculumMetrics(...args),
    listUsers: (...args: unknown[]) => mockListUsers(...args),
    updateUserRole: (...args: unknown[]) => mockUpdateUserRole(...args),
    updateUserBan: (...args: unknown[]) => mockUpdateUserBan(...args),
    listAttempts: (...args: unknown[]) => mockListAttempts(...args),
    getSecurityAuditLog: vi.fn().mockResolvedValue({ audit_logs: [], rate_limit_buckets: [] }),
    updateKillswitches: vi.fn(),
    recyclePool: vi.fn(),
    cancelSandboxQuery: vi.fn(),
    replayAttempt: vi.fn(),
  },
}));

import { App } from '@/App';
import { KillswitchToggle } from '@/components/molecules/KillswitchToggle/KillswitchToggle';
import { SqlDiffViewer } from '@/components/molecules/SqlDiffViewer/SqlDiffViewer';

function buildAuthState(overrides: Record<string, unknown> = {}) {
  return {
    session: null,
    user: null,
    profile: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    isAdmin: false,
    isCloudAuth: false,
    isDemoMode: true,
    isPasswordRecovery: false,
    clearPasswordRecovery: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    updateProfile: vi.fn(),
    refreshProfile: vi.fn(),
    ...overrides,
  };
}

describe('Qurio Admin Console — RBAC Stealth Guard & Componentes Operativos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/admin');
    mockGetLiveOps.mockResolvedValue({
      sandbox_healthy: true,
      rtt_ms: 1.8,
      process_rss_mb: 64.2,
      pool: {
        initialized: true,
        total_connections: 2,
        idle_connections: 2,
        active_connections: 0,
        queued_requests: 0,
        min_size: 2,
        max_size: 20,
      },
      active_queries: [],
      maintenance_mode: false,
      sampled_at: '2026-11-17T10:00:00Z',
    });
    mockListAttempts.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      data_source: 'mock',
    });
    mockListUsers.mockResolvedValue({
      items: [],
      total: 0,
      limit: 50,
      offset: 0,
      data_source: 'supabase',
      summary: {
        total_users: 0,
        admins_count: 0,
        active_7d_count: 0,
        banned_count: 0,
        confirmed_count: 0,
      },
    });
    mockGetCurriculumMetrics.mockResolvedValue({
      data_source: 'local_catalog_only',
      total_exercises: 50,
      total_attempts: 0,
      overall_first_pass_rate: 0,
      guest_conversion: { m01_trial_completers: 0, registered_profiles: 0, conversion_rate_percent: 0 },
      exercises: [],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('test_admin_guard_renders_404_view_for_guests_and_regular_users', async () => {
    // 1. Invitado accede a /admin -> debe ver NotFoundView (SQLSTATE 42P01) sin pistas del panel admin
    mockUseAuth.mockReturnValue(buildAuthState({ isAuthenticated: false, isAdmin: false }));
    const { unmount } = render(React.createElement(App));

    await waitFor(() => {
      expect(screen.getByText(/SQLSTATE 42P01/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Qurio Admin & Operaciones en Vivo/i)).not.toBeInTheDocument();
    expect(document.title).toBe('ERROR 404: Relation Not Found | Qurio');
    unmount();

    // 2. Usuario autenticado estándar (sin role admin en app_metadata) -> también 404 sigiloso
    window.history.replaceState({}, '', '/admin');
    mockUseAuth.mockReturnValue(
      buildAuthState({
        isAuthenticated: true,
        isAdmin: false,
        user: {
          id: 'usr-regular-1',
          app_metadata: { provider: 'email' },
          user_metadata: { role: 'admin' },
        },
        profile: {
          id: 'usr-regular-1',
          username: 'student',
          total_xp: 120,
          current_level: 2,
          current_streak_days: 1,
          max_streak_days: 1,
          preferred_theme: 'dark',
          created_at: '2026-11-17T00:00:00Z',
        },
      })
    );
    render(React.createElement(App));

    await waitFor(() => {
      expect(screen.getByText(/SQLSTATE 42P01/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Qurio Admin & Operaciones en Vivo/i)).not.toBeInTheDocument();
    expect(document.title).toBe('ERROR 404: Relation Not Found | Qurio');
  });

  it('test_admin_guard_renders_dashboard_for_admin_role', async () => {
    mockUseAuth.mockReturnValue(
      buildAuthState({
        isAuthenticated: true,
        isAdmin: true,
        user: {
          id: 'usr-admin-1',
          app_metadata: { role: 'admin' },
        },
      })
    );

    render(React.createElement(App));

    await waitFor(() => {
      expect(screen.getByText(/Qurio Admin & Operaciones en Vivo/i)).toBeInTheDocument();
    });
    expect(document.title).toBe('Administración y Operaciones | Qurio');
    expect(mockGetLiveOps).toHaveBeenCalled();
  });

  it('test_killswitch_toggle_requires_two_step_confirmation', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      React.createElement(KillswitchToggle, {
        title: 'Modo Mantenimiento Global',
        description: 'Bloquea envíos con HTTP 503',
        isActive: false,
        onConfirmToggle: onConfirm,
      })
    );

    // Paso 1: Clic inicial NO dispara la mutación, despliega confirmación inline
    fireEvent.click(screen.getByRole('button', { name: /Activar Interruptor/i }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Confirmar Activación/i })).toBeInTheDocument();

    // Cancelación aborta sin ejecutar
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(onConfirm).not.toHaveBeenCalled();

    // Paso 2: Reabrir y confirmar ejecuta el callback
    fireEvent.click(screen.getByRole('button', { name: /Activar Interruptor/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Activación/i }));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledWith(true);
    });
  });

  it('test_sql_diff_viewer_highlights_discrepancies', () => {
    const { container } = render(
      React.createElement(SqlDiffViewer, {
        studentSql: 'SELECT nombre\nFROM productos;',
        expectedSql: 'SELECT nombre_producto, precio\nFROM productos;',
      })
    );

    expect(screen.getByText(/1 línea discrepante/i)).toBeInTheDocument();
    const modifiedRows = container.querySelectorAll('[data-diff-kind="modified"]');
    const sameRows = container.querySelectorAll('[data-diff-kind="same"]');
    expect(modifiedRows.length).toBe(2); // 1 en columna estudiante + 1 en columna oficial
    expect(sameRows.length).toBe(2);
  });

  it('test_users_tab_renders_directory_drawer_forensic_jump_and_two_step_moderation', async () => {
    mockUseAuth.mockReturnValue(
      buildAuthState({
        isAuthenticated: true,
        isAdmin: true,
        user: { id: 'admin-self-1', email: 'erick@qurio.dev', app_metadata: { role: 'admin' } },
      })
    );

    mockListUsers.mockResolvedValue({
      items: [
        {
          id: 'admin-self-1',
          email: 'erick@qurio.dev',
          username: 'erick_admin',
          display_name: 'Erick Admin',
          avatar_url: null,
          role: 'admin',
          email_confirmed_at: '2026-01-01T00:00:00Z',
          last_sign_in_at: '2026-11-17T09:00:00Z',
          created_at: '2026-01-01T00:00:00Z',
          banned_until: null,
          is_banned: false,
          level: 5,
          xp: 1200,
          current_streak_days: 9,
          max_streak_days: 14,
          completed_exercises: 45,
          total_exercises: 60,
          total_attempts: 80,
          passed_attempts: 65,
          last_activity_at: '2026-11-17T09:30:00Z',
        },
        {
          id: 'student-target-2',
          email: 'ana@qurio.dev',
          username: 'ana_sql',
          display_name: 'Ana López',
          avatar_url: null,
          role: 'student',
          email_confirmed_at: '2026-02-01T00:00:00Z',
          last_sign_in_at: '2026-11-16T15:00:00Z',
          created_at: '2026-02-01T00:00:00Z',
          banned_until: null,
          is_banned: false,
          level: 3,
          xp: 520,
          current_streak_days: 4,
          max_streak_days: 7,
          completed_exercises: 18,
          total_exercises: 60,
          total_attempts: 25,
          passed_attempts: 20,
          last_activity_at: '2026-11-16T18:00:00Z',
        },
      ],
      total: 2,
      limit: 50,
      offset: 0,
      data_source: 'supabase',
      summary: {
        total_users: 2,
        admins_count: 1,
        active_7d_count: 2,
        banned_count: 0,
        confirmed_count: 2,
      },
    });

    mockUpdateUserRole.mockResolvedValue({
      user_id: 'student-target-2',
      role: 'admin',
      is_banned: false,
      banned_until: null,
      updated_at: '2026-11-17T10:00:00Z',
      updated_by: 'admin-self-1',
      message: "Rol actualizado a 'admin' para el usuario student-target-2.",
    });

    mockUpdateUserBan.mockResolvedValue({
      user_id: 'student-target-2',
      role: 'admin',
      is_banned: true,
      banned_until: '2099-12-31T23:59:59Z',
      updated_at: '2026-11-17T10:05:00Z',
      updated_by: 'admin-self-1',
      message: 'Cuenta student-target-2 suspendida por moderación administrativa.',
    });

    render(React.createElement(App));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\[Usuarios\]/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /\[Usuarios\]/i }));
    await waitFor(() => {
      expect(screen.getByText('Ana López')).toBeInTheDocument();
      expect(screen.getByText('18/60')).toBeInTheDocument();
    });

    // 1. Verificar protección de auto-moderación sobre la propia sesión
    const inspectButtons = screen.getAllByRole('button', { name: /Inspeccionar \/ Moderar/i });
    fireEvent.click(inspectButtons[0]);
    expect(screen.getByText(/TU SESIÓN/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Degradar a Estudiante/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Suspender Cuenta/i })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Cerrar panel de usuario/i }));

    // 2. Inspeccionar estudiante y confirmar promoción en 2 pasos
    fireEvent.click(inspectButtons[1]);
    fireEvent.click(screen.getByRole('button', { name: /Promover a Admin/i }));
    expect(mockUpdateUserRole).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Cambio de Rol/i }));

    await waitFor(() => {
      expect(mockUpdateUserRole).toHaveBeenCalledWith('student-target-2', 'admin');
    });

    // 3. Suspender cuenta en 2 pasos con motivo
    fireEvent.click(screen.getByRole('button', { name: /Suspender Cuenta/i }));
    expect(mockUpdateUserBan).not.toHaveBeenCalled();
    fireEvent.change(screen.getByPlaceholderText(/Motivo de moderación/i), {
      target: { value: 'Pruebas de moderación' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Suspensión/i }));

    await waitFor(() => {
      expect(mockUpdateUserBan).toHaveBeenCalledWith('student-target-2', true, 'Pruebas de moderación');
    });

    // 4. Salto directo a [Forense de Intentos] prefiltrado por user_id
    fireEvent.click(screen.getByRole('button', { name: /Ver Intentos en Forense/i }));
    await waitFor(() => {
      expect(mockListAttempts).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'student-target-2' })
      );
    });
  });
});
