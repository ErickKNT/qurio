import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Cpu,
  Database,
  Eye,
  FileSearch,
  Filter,
  Lock,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Terminal,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { RadioTab } from '@/components/atoms/RadioTab/RadioTab';
import { AdminBadge } from '@/components/atoms/AdminBadge/AdminBadge';
import { Select } from '@/components/atoms/Select/Select';
import { AdminMetricTile } from '@/components/molecules/AdminMetricTile/AdminMetricTile';
import { ConnectionGauge } from '@/components/molecules/ConnectionGauge/ConnectionGauge';
import { KillswitchToggle } from '@/components/molecules/KillswitchToggle/KillswitchToggle';
import { SqlDiffViewer } from '@/components/molecules/SqlDiffViewer/SqlDiffViewer';
import { AdminUsersPanel } from '@/components/organisms/AdminUsersPanel/AdminUsersPanel';
import { DataGridResults } from '@/components/organisms/DataGridResults/DataGridResults';
import { useAuth } from '@/hooks/useAuth';
import { adminApi, AttemptFilters } from '@/lib/adminApi';
import {
  AdminAttemptsPageResponse,
  AdminCurriculumMetricsResponse,
  AdminLiveOpsResponse,
  AdminReplayAttemptResponse,
  AdminSecurityAuditResponse,
  AdminUserRole,
  AdminUsersPageResponse,
  ExerciseOperationalStatus,
} from '@/types/admin';
import { cn } from '@/lib/utils';

type AdminTab = 'live-ops' | 'users' | 'curriculum' | 'forensics' | 'security' | 'system';

const TRACK_INFO_BY_ORDER = (sortOrder: number): { trackName: string; moduleNumber: number } => {
  if (sortOrder <= 4) return { trackName: '1. Fundamentos de SQL', moduleNumber: 1 };
  if (sortOrder <= 11) return { trackName: '1. Fundamentos de SQL', moduleNumber: 2 };
  if (sortOrder <= 15) return { trackName: '1. Fundamentos de SQL', moduleNumber: 3 };
  if (sortOrder <= 24) return { trackName: '1. Fundamentos de SQL', moduleNumber: 4 };
  if (sortOrder <= 29) return { trackName: '2. SQL Relacional', moduleNumber: 5 };
  if (sortOrder <= 35) return { trackName: '2. SQL Relacional', moduleNumber: 6 };
  if (sortOrder <= 39) return { trackName: '2. SQL Relacional', moduleNumber: 7 };
  if (sortOrder <= 44) return { trackName: '2. SQL Relacional', moduleNumber: 8 };
  if (sortOrder <= 48) return { trackName: '3. Consultas Avanzadas', moduleNumber: 9 };
  if (sortOrder <= 51) return { trackName: '3. Consultas Avanzadas', moduleNumber: 10 };
  if (sortOrder <= 55) return { trackName: '3. Consultas Avanzadas', moduleNumber: 11 };
  return { trackName: '3. Consultas Avanzadas', moduleNumber: 12 };
};

export interface AdminDashboardViewProps {
  onBackToDashboard?: () => void;
  className?: string;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onBackToDashboard,
  className,
}) => {
  const { user: currentAdminUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('live-ops');
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);

  // Estado Usuarios & Moderación
  const [usersPage, setUsersPage] = useState<AdminUsersPageResponse | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersAppliedFilters, setUsersAppliedFilters] = useState({
    search: '',
    role: '',
    status: '',
    offset: 0,
  });

  // Estado Live Ops
  const [liveOps, setLiveOps] = useState<AdminLiveOpsResponse | null>(null);
  const [loadingLiveOps, setLoadingLiveOps] = useState(false);
  const [autoRefreshLiveOps, setAutoRefreshLiveOps] = useState(false);
  const [cancellingPid, setCancellingPid] = useState<number | null>(null);

  // Estado Analítica Curricular
  const [curriculum, setCurriculum] = useState<AdminCurriculumMetricsResponse | null>(null);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [curriculumSearch, setCurriculumSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState<string>('ALL');

  // Estado Forense
  const [attemptsPage, setAttemptsPage] = useState<AdminAttemptsPageResponse | null>(null);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [attemptFilters, setAttemptFilters] = useState<AttemptFilters>({
    status: '',
    exercise_id: '',
    user_id: '',
    page: 1,
    page_size: 20,
  });
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [replayResult, setReplayResult] = useState<AdminReplayAttemptResponse | null>(null);
  const [loadingReplay, setLoadingReplay] = useState(false);
  const [drawerGridMode, setDrawerGridMode] = useState<'student' | 'expected'>('student');

  // Estado Seguridad AST
  const [securityAudit, setSecurityAudit] = useState<AdminSecurityAuditResponse | null>(null);
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  // Estado Control del Sistema
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);
  const [maintenanceMessageDraft, setMaintenanceMessageDraft] = useState(
    'La plataforma se encuentra en mantenimiento programado. La ejecución SQL está temporalmente pausada.'
  );
  const [isRecyclingPool, setIsRecyclingPool] = useState(false);
  const [confirmRecycleStep, setConfirmRecycleStep] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [selectedExerciseStatus, setSelectedExerciseStatus] = useState<ExerciseOperationalStatus>('active');
  const [isUpdatingExerciseStatus, setIsUpdatingExerciseStatus] = useState(false);

  const clearBanners = () => {
    setBannerError(null);
    setBannerSuccess(null);
  };

  const fetchLiveOps = useCallback(async () => {
    setLoadingLiveOps(true);
    try {
      const data = await adminApi.getLiveOps();
      setLiveOps(data);
      setBannerError(null);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'No se pudo obtener el estado de Live Ops.');
    } finally {
      setLoadingLiveOps(false);
    }
  }, []);

  const fetchCurriculum = useCallback(async () => {
    setLoadingCurriculum(true);
    try {
      const data = await adminApi.getCurriculumMetrics();
      setCurriculum(data);
      if (!selectedExerciseId && data.exercises.length > 0) {
        setSelectedExerciseId(data.exercises[0].exercise_id);
        setSelectedExerciseStatus(data.exercises[0].operational_status);
      }
      setBannerError(null);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'No se pudieron cargar las métricas curriculares.');
    } finally {
      setLoadingCurriculum(false);
    }
  }, [selectedExerciseId]);

  const fetchAttempts = useCallback(async (filters: AttemptFilters) => {
    setLoadingAttempts(true);
    try {
      const data = await adminApi.listAttempts(filters);
      setAttemptsPage(data);
      setBannerError(null);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'No se pudo listar el historial forense.');
    } finally {
      setLoadingAttempts(false);
    }
  }, []);

  const fetchSecurityAudit = useCallback(async () => {
    setLoadingSecurity(true);
    try {
      const data = await adminApi.getSecurityAuditLog(100);
      setSecurityAudit(data);
      setBannerError(null);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'No se pudo cargar la auditoría AST.');
    } finally {
      setLoadingSecurity(false);
    }
  }, []);

  const fetchUsers = useCallback(
    async (filters: { search: string; role: string; status: string; offset: number }) => {
      setLoadingUsers(true);
      try {
        const data = await adminApi.listUsers({
          search: filters.search,
          role: filters.role,
          status: filters.status,
          limit: 50,
          offset: filters.offset,
        });
        setUsersPage(data);
        setBannerError(null);
      } catch (err) {
        setBannerError(err instanceof Error ? err.message : 'No se pudo cargar el directorio de usuarios.');
      } finally {
        setLoadingUsers(false);
      }
    },
    []
  );

  // Carga reactiva según pestaña activa
  useEffect(() => {
    clearBanners();
    if (activeTab === 'live-ops' || activeTab === 'system') {
      fetchLiveOps();
    }
    if (activeTab === 'users') {
      fetchUsers(usersAppliedFilters);
    }
    if (activeTab === 'curriculum' || activeTab === 'system') {
      fetchCurriculum();
    }
    if (activeTab === 'forensics') {
      fetchAttempts(attemptFilters);
    }
    if (activeTab === 'security') {
      fetchSecurityAudit();
    }
  }, [
    activeTab,
    fetchLiveOps,
    fetchUsers,
    usersAppliedFilters,
    fetchCurriculum,
    fetchAttempts,
    fetchSecurityAudit,
    attemptFilters,
  ]);

  // Auto-polling opcional en Live Ops
  useEffect(() => {
    if (!autoRefreshLiveOps || activeTab !== 'live-ops') return;
    const id = window.setInterval(() => {
      fetchLiveOps();
    }, 3000);
    return () => window.clearInterval(id);
  }, [autoRefreshLiveOps, activeTab, fetchLiveOps]);

  // Cierre del Drawer forense con Escape
  useEffect(() => {
    if (!selectedAttemptId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedAttemptId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedAttemptId]);

  const handleCancelQuery = async (pid: number) => {
    setCancellingPid(pid);
    clearBanners();
    try {
      const res = await adminApi.cancelSandboxQuery(pid);
      setBannerSuccess(res.message);
      await fetchLiveOps();
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : `No se pudo cancelar el PID ${pid}.`);
    } finally {
      setCancellingPid(null);
    }
  };

  const handleInspectUserAttempts = useCallback((userId: string) => {
    setAttemptFilters((prev) => ({ ...prev, user_id: userId, page: 1 }));
    setActiveTab('forensics');
  }, []);

  const handleModerateUserRole = async (userId: string, nextRole: AdminUserRole) => {
    clearBanners();
    try {
      const res = await adminApi.updateUserRole(userId, nextRole);
      setBannerSuccess(res.message);
      await fetchUsers(usersAppliedFilters);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'No se pudo actualizar el rol del usuario.');
      throw err;
    }
  };

  const handleModerateUserBan = async (userId: string, banned: boolean, reason?: string) => {
    clearBanners();
    try {
      const res = await adminApi.updateUserBan(userId, banned, reason);
      setBannerSuccess(res.message);
      await fetchUsers(usersAppliedFilters);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'No se pudo moderar el estado de la cuenta.');
      throw err;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    clearBanners();
    try {
      const res = await adminApi.deleteUser(userId);
      setBannerSuccess(res.message);
      await fetchUsers(usersAppliedFilters);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'No se pudo eliminar la cuenta.');
      throw err;
    }
  };

  const handleOpenForensicReplay = async (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setReplayResult(null);
    setLoadingReplay(true);
    setDrawerGridMode('student');
    clearBanners();
    try {
      const data = await adminApi.replayAttempt(attemptId);
      setReplayResult(data);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Fallo al ejecutar replay forense.');
    } finally {
      setLoadingReplay(false);
    }
  };

  const handleToggleMaintenance = async (nextState: boolean) => {
    setIsTogglingMaintenance(true);
    clearBanners();
    try {
      const res = await adminApi.updateKillswitches({
        is_maintenance_mode: nextState,
        maintenance_message: maintenanceMessageDraft,
      });
      setBannerSuccess(
        res.is_maintenance_mode
          ? 'Modo Mantenimiento ACTIVADO: envíos y playground responden HTTP 503.'
          : 'Modo Mantenimiento DESACTIVADO: ejecución SQL restaurada.'
      );
      await fetchLiveOps();
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Error actualizando modo mantenimiento.');
    } finally {
      setIsTogglingMaintenance(false);
    }
  };

  const handleRecyclePool = async () => {
    setIsRecyclingPool(true);
    clearBanners();
    try {
      const res = await adminApi.recyclePool();
      setConfirmRecycleStep(false);
      setBannerSuccess(res.message);
      await fetchLiveOps();
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'No se pudo reciclar el pool asyncpg.');
    } finally {
      setIsRecyclingPool(false);
    }
  };

  const handleUpdateExerciseStatus = async () => {
    if (!selectedExerciseId) return;
    setIsUpdatingExerciseStatus(true);
    clearBanners();
    try {
      await adminApi.updateKillswitches({
        exercise_id: selectedExerciseId,
        exercise_status: selectedExerciseStatus,
      });
      setBannerSuccess(`Estado operativo del ejercicio actualizado a '${selectedExerciseStatus}'.`);
      await fetchCurriculum();
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'No se pudo actualizar el estado del reto.');
    } finally {
      setIsUpdatingExerciseStatus(false);
    }
  };

  const filteredExercises = useMemo(() => {
    if (!curriculum) return [];
    const term = curriculumSearch.trim().toLowerCase();
    return curriculum.exercises.filter((ex) => {
      const info = TRACK_INFO_BY_ORDER(ex.sort_order);
      if (trackFilter !== 'ALL' && !info.trackName.startsWith(trackFilter)) {
        return false;
      }
      if (!term) return true;
      return (
        ex.title.toLowerCase().includes(term) ||
        ex.exercise_id.toLowerCase().includes(term) ||
        String(ex.sort_order).includes(term)
      );
    });
  }, [curriculum, curriculumSearch, trackFilter]);

  return (
    <div className={cn('min-h-screen bg-canvas text-content-primary flex flex-col', className)}>
      {/* Top Bar de Operaciones */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border-subtle px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary dark:text-primary-light shadow-glow-primary">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold tracking-tight text-content-primary">
                  Qurio Admin &amp; Operaciones en Vivo
                </h1>
                <AdminBadge
                  status={
                    liveOps?.maintenance_mode
                      ? 'killswitch_active'
                      : liveOps?.sandbox_healthy
                      ? 'healthy'
                      : 'warning'
                  }
                  label={
                    liveOps?.maintenance_mode
                      ? 'MANTENIMIENTO 503'
                      : liveOps?.sandbox_healthy
                      ? 'ENTORNO ACTIVO'
                      : 'VERIFICANDO'
                  }
                />
              </div>
              <p className="text-xs font-mono text-content-muted">
                Observabilidad PostgreSQL 16 Sandbox • Auditoría SQLGlot AST • Control Operativo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onBackToDashboard && (
              <Button type="button" variant="secondary" size="sm" onClick={onBackToDashboard}>
                Volver al Inicio
              </Button>
            )}
          </div>
        </div>

        {/* Navegación por 6 pestañas técnicas */}
        <nav
          aria-label="Secciones de administración"
          className="max-w-7xl mx-auto mt-4 flex items-center gap-1.5 overflow-x-auto pb-1"
        >
          <RadioTab
            label="[Operaciones en Vivo]"
            active={activeTab === 'live-ops'}
            onClick={() => setActiveTab('live-ops')}
            icon={<Activity className="w-3.5 h-3.5" />}
          />
          <RadioTab
            label="[Usuarios]"
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={<Users className="w-3.5 h-3.5" />}
          />
          <RadioTab
            label="[Analítica Pedagógica]"
            active={activeTab === 'curriculum'}
            onClick={() => setActiveTab('curriculum')}
            icon={<BarChart3 className="w-3.5 h-3.5" />}
          />
          <RadioTab
            label="[Forense de Intentos]"
            active={activeTab === 'forensics'}
            onClick={() => setActiveTab('forensics')}
            icon={<FileSearch className="w-3.5 h-3.5" />}
          />
          <RadioTab
            label="[Auditoría AST & Seguridad]"
            active={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
            icon={<Lock className="w-3.5 h-3.5" />}
          />
          <RadioTab
            label="[Control del Sistema]"
            active={activeTab === 'system'}
            onClick={() => setActiveTab('system')}
            icon={<Sliders className="w-3.5 h-3.5" />}
          />
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6">
        {/* Alertas Inline (cero alert/confirm nativo) */}
        {bannerError && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-error/10 border border-error/40 text-error text-xs font-mono"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{bannerError}</span>
            </div>
            <button
              type="button"
              onClick={() => setBannerError(null)}
              aria-label="Cerrar alerta de error"
              className="p-1 hover:bg-error/20 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {bannerSuccess && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald/10 border border-emerald/40 text-emerald text-xs font-mono"
          >
            <span>{bannerSuccess}</span>
            <button
              type="button"
              onClick={() => setBannerSuccess(null)}
              aria-label="Cerrar notificación"
              className="p-1 hover:bg-emerald/20 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: USUARIOS & MODERACIÓN */}
        {/* =================================================================== */}
        {activeTab === 'users' && (
          <AdminUsersPanel
            usersPage={usersPage}
            loading={loadingUsers}
            search={usersSearch}
            roleFilter={usersAppliedFilters.role}
            statusFilter={usersAppliedFilters.status}
            currentAdminId={currentAdminUser?.id}
            onSearchChange={setUsersSearch}
            onRoleFilterChange={(role) =>
              setUsersAppliedFilters((prev) => ({ ...prev, search: usersSearch, role, offset: 0 }))
            }
            onStatusFilterChange={(statusVal) =>
              setUsersAppliedFilters((prev) => ({ ...prev, search: usersSearch, status: statusVal, offset: 0 }))
            }
            onApplyFilters={() =>
              setUsersAppliedFilters((prev) => ({ ...prev, search: usersSearch, offset: 0 }))
            }
            onPageChange={(offset) =>
              setUsersAppliedFilters((prev) => ({ ...prev, offset }))
            }
            onInspectAttempts={handleInspectUserAttempts}
            onModerateRole={handleModerateUserRole}
            onModerateBan={handleModerateUserBan}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {/* =================================================================== */}
        {/* TAB 1: LIVE OPS & SANDBOX */}
        {/* =================================================================== */}
        {activeTab === 'live-ops' && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-mono uppercase tracking-wider text-content-secondary">
                Telemetría en Tiempo Real — Docker PostgreSQL 16
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={autoRefreshLiveOps ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setAutoRefreshLiveOps((prev) => !prev)}
                >
                  {autoRefreshLiveOps ? 'Auto-refresco 3s: ON' : 'Auto-refresco 3s: OFF'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  isLoading={loadingLiveOps}
                  onClick={fetchLiveOps}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Refrescar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminMetricTile
                label="Sandbox RTT (SELECT 1)"
                value={liveOps?.rtt_ms ?? '—'}
                unit="ms"
                subLabel={liveOps?.sandbox_healthy ? 'ecommerce_sandbox conectado' : 'Sin respuesta'}
                accent={liveOps?.sandbox_healthy ? 'emerald' : 'error'}
                icon={<Database className="w-4 h-4" />}
              />
              <AdminMetricTile
                label="FastAPI RSS Memory"
                value={liveOps?.process_rss_mb ?? '—'}
                unit="MiB"
                subLabel="Proceso ASGI activo"
                accent="cyan"
                icon={<Cpu className="w-4 h-4" />}
              />
              <AdminMetricTile
                label="Consultas en Vuelo"
                value={liveOps?.active_queries.length ?? 0}
                unit="PIDs"
                subLabel="pg_stat_activity (state != idle)"
                accent={(liveOps?.active_queries.length ?? 0) > 3 ? 'amber' : 'indigo'}
                icon={<Activity className="w-4 h-4" />}
              />
              <AdminMetricTile
                label="Estado Operativo"
                value={liveOps?.maintenance_mode ? '503 PAUSED' : 'ONLINE'}
                subLabel={liveOps?.sampled_at ? `Muestreo ${new Date(liveOps.sampled_at).toLocaleTimeString()}` : undefined}
                accent={liveOps?.maintenance_mode ? 'error' : 'emerald'}
                icon={<ShieldAlert className="w-4 h-4" />}
              />
            </div>

            {liveOps && <ConnectionGauge pool={liveOps.pool} />}

            <div className="rounded-xl border border-border-subtle/80 bg-surface overflow-hidden">
              <div className="px-4 py-3 bg-surface-dim/80 border-b border-border-subtle/70 flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-content-primary">
                  pg_stat_activity — Consultas Activas en ecommerce_sandbox
                </span>
                <span className="text-[11px] font-mono text-content-muted tabular-nums">
                  {liveOps?.active_queries.length ?? 0} activas
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle/70 text-[10px] uppercase tracking-wider text-content-muted bg-surface-card/40">
                      <th className="px-4 py-2.5">PID</th>
                      <th className="px-4 py-2.5">Usuario</th>
                      <th className="px-4 py-2.5">Cliente</th>
                      <th className="px-4 py-2.5">Duración</th>
                      <th className="px-4 py-2.5">Estado</th>
                      <th className="px-4 py-2.5">Query SQL</th>
                      <th className="px-4 py-2.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50">
                    {!liveOps || liveOps.active_queries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-content-muted">
                          No hay consultas en vuelo en este instante.
                        </td>
                      </tr>
                    ) : (
                      liveOps.active_queries.map((q) => (
                        <tr key={q.pid} className="hover:bg-surface-hover/50">
                          <td className="px-4 py-2.5 text-cyan-accent font-semibold tabular-nums">{q.pid}</td>
                          <td className="px-4 py-2.5">{q.usename}</td>
                          <td className="px-4 py-2.5 text-content-secondary">{q.client_addr}</td>
                          <td className="px-4 py-2.5 tabular-nums text-amber-streak">{q.duration_ms} ms</td>
                          <td className="px-4 py-2.5">
                            <AdminBadge status={q.duration_ms > 1500 ? 'warning' : 'healthy'} label={q.state} />
                          </td>
                          <td className="px-4 py-2.5 max-w-md truncate text-content-primary" title={q.query}>
                            {q.query}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              isLoading={cancellingPid === q.pid}
                              onClick={() => handleCancelQuery(q.pid)}
                              leftIcon={<Trash2 className="w-3 h-3" />}
                            >
                              Cancelar PID
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* TAB 2: ANALÍTICA PEDAGÓGICA */}
        {/* =================================================================== */}
        {activeTab === 'curriculum' && (
          <section className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminMetricTile
                label="Retos del Plan de Estudios"
                value={curriculum?.total_exercises ?? 76}
                subLabel={`Fuente: ${curriculum?.data_source ?? 'cargando...'}`}
                accent="indigo"
              />
              <AdminMetricTile
                label="First-Pass Global"
                value={`${curriculum?.overall_first_pass_rate ?? 0}%`}
                subLabel="Aprobación al 1er intento"
                accent="emerald"
              />
              <AdminMetricTile
                label="Intentos Registrados"
                value={curriculum?.total_attempts ?? 0}
                subLabel="Histórico analizado"
                accent="cyan"
              />
              <AdminMetricTile
                label="Conversión Invitados M01"
                value={`${curriculum?.guest_conversion.conversion_rate_percent ?? 0}%`}
                subLabel={`${curriculum?.guest_conversion.m01_trial_completers ?? 0} M01 / ${curriculum?.guest_conversion.registered_profiles ?? 0} perfiles`}
                accent="amber"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="search"
                  value={curriculumSearch}
                  onChange={(e) => setCurriculumSearch(e.target.value)}
                  placeholder="Buscar reto por título, orden o UUID..."
                  aria-label="Filtrar retos del plan de estudios"
                  className="px-3 py-2 rounded-lg bg-surface border border-border-subtle text-xs font-mono text-content-primary placeholder:text-content-muted focus:outline-none focus:border-cyan-accent min-w-[260px]"
                />
                <Select
                  value={trackFilter}
                  onChange={(val) => setTrackFilter(val)}
                  aria-label="Filtrar por ruta formativa"
                  size="md"
                  className="min-w-[230px]"
                  options={[
                    { value: 'ALL', label: 'Todas las Rutas (1–3)' },
                    { value: '1.', label: 'Ruta 1: Fundamentos de SQL (M1–M4)' },
                    { value: '2.', label: 'Ruta 2: SQL Relacional (M5–M8)' },
                    { value: '3.', label: 'Ruta 3: Consultas Avanzadas (M9–M12)' },
                  ]}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                isLoading={loadingCurriculum}
                onClick={fetchCurriculum}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Actualizar Métricas
              </Button>
            </div>

            <div className="rounded-xl border border-border-subtle/80 bg-surface overflow-hidden">
              <div className="overflow-x-auto [content-visibility:auto]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle/70 font-mono text-[10px] uppercase tracking-wider text-content-muted bg-surface-card/40">
                      <th className="px-3 py-2.5">#</th>
                      <th className="px-3 py-2.5">Módulo / Ruta</th>
                      <th className="px-3 py-2.5">Reto</th>
                      <th className="px-3 py-2.5">Estado</th>
                      <th className="px-3 py-2.5 text-right">Intentos</th>
                      <th className="px-3 py-2.5 text-right">% 1er Intento</th>
                      <th className="px-3 py-2.5 text-right">Drop-off %</th>
                      <th className="px-3 py-2.5 text-center">Pistas (0/1/2/3)</th>
                      <th className="px-3 py-2.5 text-right">Media / Mediana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50 font-mono">
                    {filteredExercises.map((ex) => {
                      const trackMeta = TRACK_INFO_BY_ORDER(ex.sort_order);
                      return (
                        <tr key={ex.exercise_id} className="hover:bg-surface-hover/40">
                          <td className="px-3 py-2.5 text-content-muted tabular-nums">{ex.sort_order}</td>
                          <td className="px-3 py-2.5 text-content-secondary">
                            <span className="text-cyan-accent">M{String(trackMeta.moduleNumber).padStart(2, '0')}</span>{' '}
                            <span className="text-[11px]">{trackMeta.trackName}</span>
                          </td>
                          <td className="px-3 py-2.5 font-sans font-medium text-content-primary">{ex.title}</td>
                          <td className="px-3 py-2.5">
                            <AdminBadge
                              status={
                                ex.operational_status === 'active'
                                  ? 'healthy'
                                  : ex.operational_status === 'under_review'
                                  ? 'warning'
                                  : 'critical'
                              }
                              label={ex.operational_status}
                            />
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{ex.total_attempts}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-emerald">{ex.first_pass_rate}%</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-amber-streak">
                            {ex.dropoff_rate}%
                          </td>
                          <td className="px-3 py-2.5 text-center tabular-nums text-content-secondary">
                            {ex.hints_distribution.hints_0}/{ex.hints_distribution.hints_1}/
                            {ex.hints_distribution.hints_2}/{ex.hints_distribution.hints_3}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-content-secondary">
                            {ex.avg_execution_time_ms} / {ex.median_execution_time_ms} ms
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* TAB 3: FORENSE DE INTENTOS */}
        {/* =================================================================== */}
        {activeTab === 'forensics' && (
          <section className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-surface border border-border-subtle/80">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-content-muted">Estado</label>
                <Select
                  value={attemptFilters.status ?? ''}
                  onChange={(val) =>
                    setAttemptFilters((prev) => ({ ...prev, status: val, page: 1 }))
                  }
                  aria-label="Estado de intento"
                  className="min-w-[120px]"
                  options={[
                    { value: '', label: 'Todos' },
                    { value: 'PASSED', label: 'PASSED' },
                    { value: 'FAILED', label: 'FAILED' },
                    { value: 'ERROR', label: 'ERROR' },
                  ]}
                />
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <label className="text-[10px] font-mono uppercase text-content-muted">Exercise ID</label>
                <input
                  type="text"
                  value={attemptFilters.exercise_id ?? ''}
                  onChange={(e) =>
                    setAttemptFilters((prev) => ({ ...prev, exercise_id: e.target.value, page: 1 }))
                  }
                  placeholder="UUID del ejercicio"
                  className="px-3 py-1.5 rounded-lg bg-canvas border border-border-subtle text-xs font-mono text-content-primary"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <label className="text-[10px] font-mono uppercase text-content-muted">User ID</label>
                <input
                  type="text"
                  value={attemptFilters.user_id ?? ''}
                  onChange={(e) =>
                    setAttemptFilters((prev) => ({ ...prev, user_id: e.target.value, page: 1 }))
                  }
                  placeholder="UUID del estudiante"
                  className="px-3 py-1.5 rounded-lg bg-canvas border border-border-subtle text-xs font-mono text-content-primary"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                isLoading={loadingAttempts}
                onClick={() => fetchAttempts(attemptFilters)}
                leftIcon={<Filter className="w-3.5 h-3.5" />}
              >
                Consultar
              </Button>
            </div>

            <div className="rounded-xl border border-border-subtle/80 bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle/70 text-[10px] uppercase tracking-wider text-content-muted bg-surface-card/40">
                      <th className="px-4 py-2.5">Fecha</th>
                      <th className="px-4 py-2.5">Estado</th>
                      <th className="px-4 py-2.5">Reto</th>
                      <th className="px-4 py-2.5">SQL Enviado</th>
                      <th className="px-4 py-2.5 text-right">Latencia</th>
                      <th className="px-4 py-2.5 text-right">Replay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50">
                    {!attemptsPage || attemptsPage.items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-content-muted">
                          {loadingAttempts
                            ? 'Consultando registros en exercise_attempts...'
                            : `Sin registros disponibles (fuente: ${attemptsPage?.data_source ?? 'local'}).`}
                        </td>
                      </tr>
                    ) : (
                      attemptsPage.items.map((att) => (
                        <tr key={att.id} className="hover:bg-surface-hover/50">
                          <td className="px-4 py-2.5 text-content-muted whitespace-nowrap">
                            {new Date(att.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5">
                            <AdminBadge
                              status={
                                att.status === 'PASSED'
                                  ? 'healthy'
                                  : att.status === 'FAILED'
                                  ? 'warning'
                                  : 'critical'
                              }
                              label={att.status}
                            />
                          </td>
                          <td className="px-4 py-2.5 font-sans text-content-primary">
                            {att.exercise_title || att.exercise_id}
                          </td>
                          <td className="px-4 py-2.5 max-w-sm truncate text-content-secondary">
                            {att.submitted_sql}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{att.execution_time_ms} ms</td>
                          <td className="px-4 py-2.5 text-right">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenForensicReplay(att.id)}
                              leftIcon={<Eye className="w-3.5 h-3.5" />}
                            >
                              Inspeccionar Diff
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {attemptsPage && attemptsPage.total > attemptsPage.page_size && (
                <div className="px-4 py-3 border-t border-border-subtle/70 flex items-center justify-between text-xs font-mono">
                  <span className="text-content-muted">
                    Página {attemptsPage.page} • Total: {attemptsPage.total}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={attemptsPage.page <= 1}
                      onClick={() =>
                        setAttemptFilters((p) => ({ ...p, page: Math.max(1, (p.page ?? 1) - 1) }))
                      }
                    >
                      Anterior
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={attemptsPage.page * attemptsPage.page_size >= attemptsPage.total}
                      onClick={() => setAttemptFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* TAB 4: AUDITORÍA AST & SEGURIDAD */}
        {/* =================================================================== */}
        {activeTab === 'security' && (
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono uppercase tracking-wider text-content-secondary">
                Bloqueos AST (SQLGlot) y Limitador de Tasa
              </h2>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                isLoading={loadingSecurity}
                onClick={fetchSecurityAudit}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Actualizar Auditoría
              </Button>
            </div>

            <div className="rounded-xl border border-border-subtle/80 bg-surface overflow-hidden">
              <div className="px-4 py-3 bg-surface-dim/80 border-b border-border-subtle/70 flex items-center justify-between">
                <span className="text-xs font-mono font-semibold">
                  Buffer Circular de Violaciones AST SQLGlot
                </span>
                <AdminBadge
                  status={(securityAudit?.audit_logs.length ?? 0) > 0 ? 'warning' : 'healthy'}
                  label={`${securityAudit?.audit_logs.length ?? 0} EVENTOS`}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle/70 text-[10px] uppercase tracking-wider text-content-muted bg-surface-card/40">
                      <th className="px-4 py-2.5">Timestamp</th>
                      <th className="px-4 py-2.5">IP Cliente</th>
                      <th className="px-4 py-2.5">Actor</th>
                      <th className="px-4 py-2.5">Regla Violada</th>
                      <th className="px-4 py-2.5">Nodo Bloqueado</th>
                      <th className="px-4 py-2.5">SQL Interceptado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50">
                    {!securityAudit || securityAudit.audit_logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-content-muted">
                          No se han registrado violaciones AST en el buffer de esta instancia.
                        </td>
                      </tr>
                    ) : (
                      securityAudit.audit_logs.map((entry, idx) => (
                        <tr key={`${entry.timestamp}-${idx}`} className="hover:bg-surface-hover/50">
                          <td className="px-4 py-2.5 whitespace-nowrap text-content-muted">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-2.5 text-cyan-accent">{entry.client_ip}</td>
                          <td className="px-4 py-2.5">{entry.user_id}</td>
                          <td className="px-4 py-2.5 text-amber-streak">{entry.rule_violated}</td>
                          <td className="px-4 py-2.5">
                            <AdminBadge status="critical" label={entry.blocked_node} />
                          </td>
                          <td className="px-4 py-2.5 max-w-md truncate text-error">
                            {entry.submitted_sql_snippet}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-border-subtle/80 bg-surface overflow-hidden">
              <div className="px-4 py-3 bg-surface-dim/80 border-b border-border-subtle/70">
                <span className="text-xs font-mono font-semibold">
                  Estado de Cuotas Activas del Limitador de Tasa
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle/70 text-[10px] uppercase tracking-wider text-content-muted bg-surface-card/40">
                      <th className="px-4 py-2.5">Identificador</th>
                      <th className="px-4 py-2.5">Tipo</th>
                      <th className="px-4 py-2.5 text-right">Consumidas / Límite</th>
                      <th className="px-4 py-2.5 text-right">Tokens Libres</th>
                      <th className="px-4 py-2.5 text-right">Reinicio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50">
                    {!securityAudit || securityAudit.rate_limit_buckets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-content-muted">
                          No hay ventanas activas de rate limiting en los últimos 60 segundos.
                        </td>
                      </tr>
                    ) : (
                      securityAudit.rate_limit_buckets.map((b) => (
                        <tr key={b.identifier}>
                          <td className="px-4 py-2.5 text-content-primary">{b.identifier}</td>
                          <td className="px-4 py-2.5 text-content-secondary">{b.subject_type}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            {b.requests_used} / {b.limit}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-emerald">
                            {b.remaining_tokens}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-content-muted">
                            {b.reset_in_seconds}s
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* TAB 5: CONTROL DEL SISTEMA & KILLSWITCHES */}
        {/* =================================================================== */}
        {activeTab === 'system' && (
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-content-secondary">
                Mensaje de respuesta HTTP 503 en Modo Mantenimiento
              </label>
              <input
                type="text"
                value={maintenanceMessageDraft}
                onChange={(e) => setMaintenanceMessageDraft(e.target.value)}
                className="px-3 py-2 rounded-lg bg-surface border border-border-subtle text-xs font-mono text-content-primary focus:outline-none focus:border-cyan-accent"
              />
            </div>

            <KillswitchToggle
              title="Interruptor de Modo Mantenimiento Global (HTTP 503)"
              description="Bloquea de forma atómica POST /exercises/{id}/submit y POST /playground/execute devolviendo HTTP 503 Service Unavailable, manteniendo activas las lecturas de catálogo y rutas."
              isActive={Boolean(liveOps?.maintenance_mode)}
              isBusy={isTogglingMaintenance}
              onConfirmToggle={handleToggleMaintenance}
            />

            {/* Reciclaje Limpio del Pool asyncpg */}
            <div className="p-4 rounded-xl bg-surface border border-border-subtle/80 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-content-primary">
                    Reciclaje Limpio del Pool asyncpg
                  </h4>
                  <p className="text-xs text-content-secondary">
                    Cierra las conexiones actuales hacia el Sandbox PostgreSQL y reconstruye el pool sin reiniciar el contenedor Docker.
                  </p>
                </div>
                {!confirmRecycleStep && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmRecycleStep(true)}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Reciclar Pool
                  </Button>
                )}
              </div>

              {confirmRecycleStep && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-surface-dim border border-amber-streak/40">
                  <span className="text-xs font-mono text-content-primary">
                    ¿Confirmar cierre y reinicialización del pool hacia localhost:5433?
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmRecycleStep(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      isLoading={isRecyclingPool}
                      onClick={handleRecyclePool}
                    >
                      Confirmar Reciclaje
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Control de Estado Operativo por Reto */}
            <div className="p-4 rounded-xl bg-surface border border-border-subtle/80 flex flex-col gap-3">
              <div>
                <h4 className="text-sm font-semibold text-content-primary">
                  Estado Operativo de Reto Curricular
                </h4>
                <p className="text-xs text-content-secondary">
                  Oculta un reto problemático del catálogo público (&apos;hidden&apos;) o márcalo en revisión (&apos;under_review&apos;).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={selectedExerciseId}
                  onChange={(nextId) => {
                    setSelectedExerciseId(nextId);
                    const found = curriculum?.exercises.find((item) => item.exercise_id === nextId);
                    if (found) setSelectedExerciseStatus(found.operational_status);
                  }}
                  aria-label="Seleccionar reto"
                  size="md"
                  className="flex-1 min-w-[260px]"
                  options={(curriculum?.exercises ?? []).map((ex) => ({
                    value: ex.exercise_id,
                    label: `#${ex.sort_order} — ${ex.title} (${ex.operational_status})`,
                  }))}
                />

                <Select<ExerciseOperationalStatus>
                  value={selectedExerciseStatus}
                  onChange={(val) => setSelectedExerciseStatus(val)}
                  aria-label="Seleccionar estado operativo"
                  size="md"
                  className="min-w-[155px]"
                  options={[
                    { value: 'active', label: 'active' },
                    { value: 'under_review', label: 'under_review' },
                    { value: 'hidden', label: 'hidden' },
                  ]}
                />

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={isUpdatingExerciseStatus}
                  disabled={!selectedExerciseId}
                  onClick={handleUpdateExerciseStatus}
                >
                  Aplicar Estado
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ===================================================================== */}
      {/* DRAWER FORENSE LATERAL (SLIDE-OVER) */}
      {/* ===================================================================== */}
      {selectedAttemptId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Auditoría Forense y Replay Semántico"
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedAttemptId(null);
          }}
        >
          <div className="w-full max-w-4xl h-full bg-canvas border-l border-border-subtle shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-4 bg-surface border-b border-border-subtle flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-content-primary">
                  Replay Forense • Intento {selectedAttemptId}
                </h3>
                {replayResult && (
                  <p className="text-xs font-mono text-content-muted">
                    {replayResult.exercise_title} • Veredicto: {replayResult.evaluation_status}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAttemptId(null)}
                aria-label="Cerrar panel forense"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              {loadingReplay && (
                <div className="py-12 text-center text-xs font-mono text-cyan-accent">
                  Ejecutando replay concurrente contra PostgreSQL Sandbox...
                </div>
              )}

              {replayResult && (
                <>
                  <SqlDiffViewer
                    studentSql={replayResult.submitted_sql}
                    expectedSql={replayResult.solution_query}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-surface border border-border-subtle">
                      <span className="text-content-muted block text-[10px] uppercase">Delta Cardinalidad</span>
                      <strong className="text-lg tabular-nums text-amber-streak">
                        {replayResult.forensic_diff.cardinality_delta} filas
                      </strong>
                    </div>
                    <div className="p-3 rounded-lg bg-surface border border-border-subtle">
                      <span className="text-content-muted block text-[10px] uppercase">Filas Faltantes</span>
                      <strong className="text-lg tabular-nums text-error">
                        {replayResult.forensic_diff.missing_rows.length}
                      </strong>
                    </div>
                    <div className="p-3 rounded-lg bg-surface border border-border-subtle">
                      <span className="text-content-muted block text-[10px] uppercase">Filas Sobrantes</span>
                      <strong className="text-lg tabular-nums text-cyan-accent">
                        {replayResult.forensic_diff.extra_rows.length}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <RadioTab
                      label={`Resultado Estudiante (${replayResult.student_result.row_count})`}
                      active={drawerGridMode === 'student'}
                      onClick={() => setDrawerGridMode('student')}
                    />
                    <RadioTab
                      label={`Resultado Oficial (${replayResult.expected_result.row_count})`}
                      active={drawerGridMode === 'expected'}
                      onClick={() => setDrawerGridMode('expected')}
                    />
                  </div>

                  <div className="min-h-[280px] rounded-xl border border-border-subtle overflow-hidden">
                    <DataGridResults
                      status={
                        drawerGridMode === 'student'
                          ? replayResult.student_result.status === 'SUCCESS'
                            ? 'SUCCESS'
                            : 'ERROR'
                          : 'SUCCESS'
                      }
                      executionTimeMs={
                        drawerGridMode === 'student'
                          ? replayResult.student_result.execution_time_ms
                          : replayResult.expected_result.execution_time_ms
                      }
                      rowCount={
                        drawerGridMode === 'student'
                          ? replayResult.student_result.row_count
                          : replayResult.expected_result.row_count
                      }
                      columns={
                        drawerGridMode === 'student'
                          ? replayResult.student_result.columns
                          : replayResult.expected_result.columns
                      }
                      rows={
                        drawerGridMode === 'student'
                          ? replayResult.student_result.rows
                          : replayResult.expected_result.rows
                      }
                      error={
                        drawerGridMode === 'student'
                          ? replayResult.student_result.error ?? undefined
                          : undefined
                      }
                      diff={
                        drawerGridMode === 'student'
                          ? replayResult.forensic_diff.summary_diff ?? undefined
                          : undefined
                      }
                      message={replayResult.evaluation_message}
                      isPlayground
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
