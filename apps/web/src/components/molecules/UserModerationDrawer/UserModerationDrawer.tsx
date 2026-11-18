import React, { useEffect, useState } from 'react';
import {
  Activity,
  Ban,
  CheckCircle2,
  Eye,
  Flame,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { AdminBadge } from '@/components/atoms/AdminBadge/AdminBadge';
import { AdminUserRecord, AdminUserRole } from '@/types/admin';

export interface UserModerationDrawerProps {
  user: AdminUserRecord | null;
  currentAdminId?: string | null;
  onClose: () => void;
  onInspectAttempts: (userId: string) => void;
  onModerateRole: (userId: string, nextRole: AdminUserRole) => Promise<void>;
  onModerateBan: (userId: string, banned: boolean, reason?: string) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return 'Nunca';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString();
}

export const UserModerationDrawer: React.FC<UserModerationDrawerProps> = ({
  user,
  currentAdminId,
  onClose,
  onInspectAttempts,
  onModerateRole,
  onModerateBan,
  onDeleteUser,
}) => {
  const [confirmRoleStep, setConfirmRoleStep] = useState<AdminUserRole | null>(null);
  const [confirmBanStep, setConfirmBanStep] = useState<boolean | null>(null);
  const [banReason, setBanReason] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setConfirmRoleStep(null);
    setConfirmBanStep(null);
    setBanReason('');
    setConfirmDeleteOpen(false);
    setDeleteConfirmText('');
    setIsSubmitting(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, onClose]);

  if (!user) return null;

  const isSelf = Boolean(currentAdminId && currentAdminId === user.id);
  const isTargetAdmin = user.role === 'admin';
  const expectedDeleteTarget = user.email || user.username || user.id;
  const canConfirmDelete = deleteConfirmText.trim() === expectedDeleteTarget;
  const nextRole: AdminUserRole = user.role === 'admin' ? 'student' : 'admin';
  const completionPct =
    user.total_exercises > 0
      ? Math.round((user.completed_exercises / user.total_exercises) * 100)
      : 0;
  const passRate =
    user.total_attempts > 0
      ? Math.round((user.passed_attempts / user.total_attempts) * 100)
      : 0;

  const handleConfirmRole = async () => {
    if (!confirmRoleStep || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onModerateRole(user.id, confirmRoleStep);
      setConfirmRoleStep(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmBan = async () => {
    if (confirmBanStep === null || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onModerateBan(user.id, confirmBanStep, banReason.trim() || undefined);
      setConfirmBanStep(null);
      setBanReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDeleteUser || !canConfirmDelete || isSelf || isTargetAdmin || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onDeleteUser(user.id);
      setConfirmDeleteOpen(false);
      setDeleteConfirmText('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Inspección y Moderación de Usuario"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl h-full bg-canvas border-l border-border-subtle shadow-2xl flex flex-col overflow-hidden">
        {/* Cabecera */}
        <div className="px-5 py-4 bg-surface border-b border-border-subtle flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={`Avatar de ${user.display_name || user.username || user.email || user.id}`}
                className="w-10 h-10 rounded-full object-cover border border-border-subtle shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center font-mono text-sm font-bold text-primary-light shrink-0">
                {(user.display_name || user.username || user.email || 'Q').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-content-primary truncate">
                  {user.display_name || user.username || 'Sin nombre'}
                </h3>
                {isSelf && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-accent/15 text-cyan-accent border border-cyan-accent/30">
                    TU SESIÓN
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-content-muted truncate">
                @{user.username || 'sin_username'} • {user.email || 'sin correo'}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Cerrar panel de usuario"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Badges + UUID */}
          <div className="p-4 rounded-xl bg-surface border border-border-subtle/80 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <AdminBadge
                  status={user.role === 'admin' ? 'healthy' : 'warning'}
                  label={user.role === 'admin' ? 'ADMIN' : 'ESTUDIANTE'}
                />
                {user.is_banned ? (
                  <AdminBadge status="killswitch_active" label="SUSPENDIDO" />
                ) : user.email_confirmed_at ? (
                  <AdminBadge status="healthy" label="CORREO VERIFICADO" />
                ) : (
                  <AdminBadge status="warning" label="SIN CONFIRMAR" />
                )}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  onInspectAttempts(user.id);
                  onClose();
                }}
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                Ver Intentos en Forense
              </Button>
            </div>
            <div className="text-[11px] font-mono text-content-muted break-all">
              UUID: <span className="text-content-primary">{user.id}</span>
            </div>
          </div>

          {/* Telemetría de Aprendizaje */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-surface border border-border-subtle/80">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-content-muted mb-1">
                <Trophy className="w-3.5 h-3.5 text-amber-streak" /> Nivel & XP
              </div>
              <div className="font-mono text-base font-bold text-content-primary">
                Nv. {user.level}
              </div>
              <div className="text-[11px] font-mono text-emerald tabular-nums">{user.xp} XP</div>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-border-subtle/80">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-content-muted mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald" /> Plan de Estudios
              </div>
              <div className="font-mono text-base font-bold text-content-primary tabular-nums">
                {user.completed_exercises} / {user.total_exercises}
              </div>
              <div className="text-[11px] font-mono text-content-muted">{completionPct}% completado</div>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-border-subtle/80">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-content-muted mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-streak" /> Racha
              </div>
              <div className="font-mono text-base font-bold text-content-primary tabular-nums">
                {user.current_streak_days} días
              </div>
              <div className="text-[11px] font-mono text-content-muted">
                Máx: {user.max_streak_days} días
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-border-subtle/80">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-content-muted mb-1">
                <Activity className="w-3.5 h-3.5 text-cyan-accent" /> Intentos
              </div>
              <div className="font-mono text-base font-bold text-content-primary tabular-nums">
                {user.passed_attempts} / {user.total_attempts}
              </div>
              <div className="text-[11px] font-mono text-content-muted">{passRate}% acierto</div>
            </div>
          </div>

          {/* Auditoría de Cuenta */}
          <div className="rounded-xl border border-border-subtle/80 bg-surface p-4 flex flex-col gap-2 text-xs font-mono">
            <h4 className="text-[11px] uppercase tracking-wider text-content-muted font-semibold mb-1">
              Trazabilidad de Autenticación y Actividad
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <span className="text-content-muted block text-[10px]">Registro</span>
                <span className="text-content-primary">{formatDateTime(user.created_at)}</span>
              </div>
              <div>
                <span className="text-content-muted block text-[10px]">Confirmación Email</span>
                <span className="text-content-primary">{formatDateTime(user.email_confirmed_at)}</span>
              </div>
              <div>
                <span className="text-content-muted block text-[10px]">Último Login (Auth)</span>
                <span className="text-content-primary">{formatDateTime(user.last_sign_in_at)}</span>
              </div>
              <div>
                <span className="text-content-muted block text-[10px]">Última Actividad Plataforma</span>
                <span className="text-content-primary">{formatDateTime(user.last_activity_at)}</span>
              </div>
              {user.banned_until && (
                <div className="sm:col-span-2">
                  <span className="text-error block text-[10px]">Suspendido Hasta</span>
                  <span className="text-error">{formatDateTime(user.banned_until)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Acciones de Moderación (Confirmación Inline en 2 pasos) */}
          <div className="rounded-xl border border-border-subtle/80 bg-surface p-4 flex flex-col gap-4">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-content-muted font-semibold">
              Acciones de Moderación
            </h4>

            {/* 1. Gestión de Rol */}
            <div className="p-3.5 rounded-lg bg-canvas border border-border-subtle/70 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-content-primary">
                    Rol Administrativo (app_metadata.role)
                  </div>
                  <p className="text-[11px] text-content-muted">
                    {user.role === 'admin'
                      ? 'Tiene acceso completo al panel Qurio Admin y auditoría.'
                      : 'Acceso estándar de estudiante sobre rutas y sandbox.'}
                  </p>
                </div>

                {confirmRoleStep === null && (
                  <Button
                    type="button"
                    variant={user.role === 'admin' ? 'secondary' : 'primary'}
                    size="sm"
                    disabled={isSelf && user.role === 'admin'}
                    onClick={() => setConfirmRoleStep(nextRole)}
                    leftIcon={
                      user.role === 'admin' ? (
                        <ShieldOff className="w-3.5 h-3.5" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      )
                    }
                  >
                    {user.role === 'admin' ? 'Degradar a Estudiante' : 'Promover a Admin'}
                  </Button>
                )}
              </div>

              {isSelf && user.role === 'admin' && (
                <p className="text-[11px] font-mono text-amber-streak">
                  Protección activa: no puedes degradar tu propio rol desde esta sesión.
                </p>
              )}

              {confirmRoleStep !== null && (
                <div className="p-3 rounded-lg bg-amber-streak/10 border border-amber-streak/30 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-content-primary">
                    ¿Confirmar cambio de rol a <strong className="font-mono">{confirmRoleStep}</strong>?
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => setConfirmRoleStep(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      isLoading={isSubmitting}
                      onClick={handleConfirmRole}
                    >
                      Confirmar Cambio de Rol
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Suspensión / Reactivación */}
            <div className="p-3.5 rounded-lg bg-canvas border border-border-subtle/70 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-content-primary">
                    Estado de Acceso (Supabase Auth Ban)
                  </div>
                  <p className="text-[11px] text-content-muted">
                    {user.is_banned
                      ? 'La cuenta está bloqueada y no puede iniciar sesión ni renovar JWT.'
                      : 'Cuenta habilitada para autenticación y ejecución en Sandbox.'}
                  </p>
                </div>

                {confirmBanStep === null && (
                  <Button
                    type="button"
                    variant={user.is_banned ? 'secondary' : 'danger'}
                    size="sm"
                    disabled={isSelf}
                    onClick={() => setConfirmBanStep(!user.is_banned)}
                    leftIcon={<Ban className="w-3.5 h-3.5" />}
                  >
                    {user.is_banned ? 'Reactivar Cuenta' : 'Suspender Cuenta'}
                  </Button>
                )}
              </div>

              {isSelf && (
                <p className="text-[11px] font-mono text-amber-streak">
                  Protección activa: no puedes suspender tu propia cuenta de administrador.
                </p>
              )}

              {confirmBanStep !== null && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/30 flex flex-col gap-2.5">
                  <span className="text-xs text-content-primary">
                    {confirmBanStep
                      ? '¿Confirmar suspensión indefinida de esta cuenta?'
                      : '¿Confirmar reactivación de acceso para esta cuenta?'}
                  </span>
                  {confirmBanStep && (
                    <input
                      type="text"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="Motivo de moderación (opcional, para bitácora)"
                      className="px-3 py-1.5 rounded-lg bg-canvas border border-border-subtle text-xs font-mono text-content-primary"
                    />
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => {
                        setConfirmBanStep(null);
                        setBanReason('');
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      variant={confirmBanStep ? 'danger' : 'primary'}
                      size="sm"
                      isLoading={isSubmitting}
                      onClick={handleConfirmBan}
                    >
                      {confirmBanStep ? 'Confirmar Suspensión' : 'Confirmar Reactivación'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Eliminación Definitiva (Solo Cuentas de Prueba) */}
            {onDeleteUser && (
              <div className="p-3.5 rounded-lg bg-canvas border border-error/30 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-error">
                      Eliminar Cuenta Definitivamente (Solo Pruebas)
                    </div>
                    <p className="text-[11px] text-content-muted">
                      Elimina la cuenta de Supabase Auth y purga en cascada perfil, intentos, progreso y constancias. Acción irreversible.
                    </p>
                  </div>

                  {!confirmDeleteOpen && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      disabled={isSelf || isTargetAdmin}
                      onClick={() => setConfirmDeleteOpen(true)}
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Eliminar Cuenta
                    </Button>
                  )}
                </div>

                {(isSelf || isTargetAdmin) && (
                  <p className="text-[11px] font-mono text-amber-streak">
                    {isSelf
                      ? 'Protección activa: no puedes eliminar tu propia cuenta de administrador.'
                      : 'Protección activa: no se permite eliminar cuentas con rol administrador.'}
                  </p>
                )}

                {confirmDeleteOpen && (
                  <div className="p-3 rounded-lg bg-error/10 border border-error/30 flex flex-col gap-2.5">
                    <span className="text-xs text-content-primary">
                      Para confirmar el borrado definitivo, escribe exactamente{' '}
                      <strong className="font-mono text-error">{expectedDeleteTarget}</strong>:
                    </span>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder={expectedDeleteTarget}
                      aria-label="Confirmar identificador de cuenta a eliminar"
                      className="px-3 py-1.5 rounded-lg bg-canvas border border-error/40 text-xs font-mono text-content-primary"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => {
                          setConfirmDeleteOpen(false);
                          setDeleteConfirmText('');
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={!canConfirmDelete}
                        isLoading={isSubmitting}
                        onClick={handleConfirmDelete}
                      >
                        Confirmar Eliminación
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
