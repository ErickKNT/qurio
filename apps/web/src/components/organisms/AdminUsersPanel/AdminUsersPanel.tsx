import React, { useMemo, useState } from 'react';
import {
  Activity,
  Ban,
  Eye,
  Filter,
  Flame,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { AdminBadge } from '@/components/atoms/AdminBadge/AdminBadge';
import { Select } from '@/components/atoms/Select/Select';
import { AdminMetricTile } from '@/components/molecules/AdminMetricTile/AdminMetricTile';
import { UserModerationDrawer } from '@/components/molecules/UserModerationDrawer/UserModerationDrawer';
import { AdminUserRecord, AdminUserRole, AdminUsersPageResponse } from '@/types/admin';

export interface AdminUsersPanelProps {
  usersPage: AdminUsersPageResponse | null;
  loading: boolean;
  search: string;
  roleFilter: string;
  statusFilter: string;
  currentAdminId?: string | null;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onApplyFilters: () => void;
  onPageChange: (nextOffset: number) => void;
  onInspectAttempts: (userId: string) => void;
  onModerateRole: (userId: string, nextRole: AdminUserRole) => Promise<void>;
  onModerateBan: (userId: string, banned: boolean, reason?: string) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
}

export const AdminUsersPanel: React.FC<AdminUsersPanelProps> = ({
  usersPage,
  loading,
  search,
  roleFilter,
  statusFilter,
  currentAdminId,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onApplyFilters,
  onPageChange,
  onInspectAttempts,
  onModerateRole,
  onModerateBan,
  onDeleteUser,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const selectedUser: AdminUserRecord | null = useMemo(
    () => usersPage?.items.find((u) => u.id === selectedUserId) ?? null,
    [usersPage?.items, selectedUserId]
  );

  const summary = usersPage?.summary;
  const total = usersPage?.total ?? 0;
  const limit = usersPage?.limit ?? 50;
  const offset = usersPage?.offset ?? 0;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-mono uppercase tracking-wider text-content-secondary">
            Directorio de Usuarios, Progreso y Moderación
          </h2>
          <p className="text-xs text-content-muted">
            Vista consolidada de Supabase Auth + perfiles + avance curricular e historial de intentos.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          isLoading={loading}
          onClick={onApplyFilters}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refrescar
        </Button>
      </div>

      {/* KPIs de Comunidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricTile
          label="Usuarios Registrados"
          value={summary?.total_users ?? 0}
          subLabel={`${summary?.confirmed_count ?? 0} correos verificados`}
          accent="cyan"
          icon={<Users className="w-4 h-4" />}
        />
        <AdminMetricTile
          label="Activos (Últimos 7d)"
          value={summary?.active_7d_count ?? 0}
          subLabel="Con login o intentos recientes"
          accent="emerald"
          icon={<Activity className="w-4 h-4" />}
        />
        <AdminMetricTile
          label="Administradores"
          value={summary?.admins_count ?? 0}
          subLabel="Rol app_metadata.role = admin"
          accent="indigo"
          icon={<ShieldCheck className="w-4 h-4" />}
        />
        <AdminMetricTile
          label="Cuentas Suspendidas"
          value={summary?.banned_count ?? 0}
          subLabel="Bloqueadas por moderación"
          accent={(summary?.banned_count ?? 0) > 0 ? 'error' : 'amber'}
          icon={<Ban className="w-4 h-4" />}
        />
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-surface border border-border-subtle/80">
        <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
          <label htmlFor="admin-users-search" className="text-[10px] font-mono uppercase text-content-muted">
            Buscar usuario
          </label>
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 pointer-events-none" />
            <input
              id="admin-users-search"
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onApplyFilters();
              }}
              placeholder="Email, @username, nombre o UUID..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-canvas border border-border-subtle text-xs font-mono text-content-primary"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="admin-users-role" className="text-[10px] font-mono uppercase text-content-muted">
            Rol
          </label>
          <Select
            id="admin-users-role"
            value={roleFilter}
            onChange={(val) => onRoleFilterChange(val)}
            aria-label="Rol"
            className="min-w-[140px]"
            options={[
              { value: '', label: 'Todos' },
              { value: 'student', label: 'Estudiantes' },
              { value: 'admin', label: 'Admins' },
            ]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="admin-users-status" className="text-[10px] font-mono uppercase text-content-muted">
            Estado Cuenta
          </label>
          <Select
            id="admin-users-status"
            value={statusFilter}
            onChange={(val) => onStatusFilterChange(val)}
            aria-label="Estado Cuenta"
            className="min-w-[190px]"
            options={[
              { value: '', label: 'Todos' },
              { value: 'active', label: 'Activos y verificados' },
              { value: 'unconfirmed', label: 'Sin confirmar correo' },
              { value: 'banned', label: 'Suspendidos' },
            ]}
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          isLoading={loading}
          onClick={onApplyFilters}
          leftIcon={<Filter className="w-3.5 h-3.5" />}
        >
          Filtrar
        </Button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="rounded-xl border border-border-subtle/80 bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-border-subtle/70 text-[10px] uppercase tracking-wider text-content-muted bg-surface-card/40">
                <th className="px-4 py-2.5">Usuario</th>
                <th className="px-4 py-2.5">Rol</th>
                <th className="px-4 py-2.5">Estado</th>
                <th className="px-4 py-2.5">Nivel / XP</th>
                <th className="px-4 py-2.5">Progreso</th>
                <th className="px-4 py-2.5">Racha</th>
                <th className="px-4 py-2.5">Última Actividad</th>
                <th className="px-4 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {!usersPage || usersPage.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-content-muted">
                    {loading
                      ? 'Consultando usuarios desde Supabase Auth y perfiles...'
                      : usersPage?.data_source === 'unavailable'
                        ? 'Servicio de usuarios no disponible (verifica SUPABASE_SERVICE_ROLE_KEY).'
                        : 'No se encontraron usuarios con los filtros actuales.'}
                  </td>
                </tr>
              ) : (
                usersPage.items.map((u) => {
                  const pct =
                    u.total_exercises > 0
                      ? Math.round((u.completed_exercises / u.total_exercises) * 100)
                      : 0;
                  return (
                    <tr key={u.id} className="hover:bg-surface-hover/50">
                      <td className="px-4 py-3 font-sans">
                        <div className="flex flex-col">
                          <span className="font-semibold text-content-primary">
                            {u.display_name || u.username || 'Usuario sin perfil'}
                          </span>
                          <span className="text-[11px] font-mono text-content-muted">
                            @{u.username || '—'} • {u.email || u.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <AdminBadge
                          status={u.role === 'admin' ? 'healthy' : 'warning'}
                          label={u.role === 'admin' ? 'ADMIN' : 'STUDENT'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {u.is_banned ? (
                          <AdminBadge status="killswitch_active" label="SUSPENDIDO" />
                        ) : u.email_confirmed_at ? (
                          <AdminBadge status="healthy" label="ACTIVO" />
                        ) : (
                          <AdminBadge status="warning" label="PENDIENTE" />
                        )}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        <span className="text-content-primary font-semibold">Nv. {u.level}</span>
                        <span className="block text-[11px] text-emerald">{u.xp} XP</span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        <div className="flex flex-col gap-1 min-w-[110px]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-content-primary">
                              {u.completed_exercises}/{u.total_exercises}
                            </span>
                            <span className="text-content-muted">{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-canvas overflow-hidden">
                            <div
                              className="h-full bg-emerald rounded-full"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-content-muted">
                            {u.passed_attempts}/{u.total_attempts} intentos OK
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        <span className="inline-flex items-center gap-1 text-amber-streak">
                          <Flame className="w-3.5 h-3.5" /> {u.current_streak_days}d
                        </span>
                        <span className="block text-[10px] text-content-muted">
                          máx {u.max_streak_days}d
                        </span>
                      </td>
                      <td className="px-4 py-3 text-content-muted whitespace-nowrap">
                        {u.last_activity_at
                          ? new Date(u.last_activity_at).toLocaleString()
                          : 'Sin actividad'}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onInspectAttempts(u.id)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Ver Intentos
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedUserId(u.id)}
                          >
                            Inspeccionar / Moderar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {usersPage && total > limit && (
          <div className="px-4 py-3 border-t border-border-subtle/70 flex items-center justify-between text-xs font-mono">
            <span className="text-content-muted">
              Página {currentPage} de {totalPages} • Total: {total}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={offset <= 0}
                onClick={() => onPageChange(Math.max(0, offset - limit))}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={offset + limit >= total}
                onClick={() => onPageChange(offset + limit)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      <UserModerationDrawer
        user={selectedUser}
        currentAdminId={currentAdminId}
        onClose={() => setSelectedUserId(null)}
        onInspectAttempts={onInspectAttempts}
        onModerateRole={onModerateRole}
        onModerateBan={onModerateBan}
        onDeleteUser={onDeleteUser}
      />
    </section>
  );
};
