import React, { useEffect, useMemo, useState } from 'react';
import {
  Flame,
  Award,
  Terminal,
  CheckCircle2,
  Calendar,
  ChevronRight,
  UserCheck,
  Check,
  Play,
  Lock,
  ShieldAlert,
  Sparkles,
  Edit3,
  Share2,
  ShieldCheck,
  Route as RouteIcon,
  Download,
  Eye,
  GraduationCap,
  History,
} from 'lucide-react';
import {
  UserProfile,
  QueryHistoryItem,
  Track,
  Achievement,
  AttemptStats,
  CertificateRecord,
} from '@/types';
import { Badge, Button } from '@/components/atoms';
import { MetricTile } from '@/components/molecules/MetricTile/MetricTile';
import { EditProfileModal } from '@/components/molecules/EditProfileModal/EditProfileModal';
import { ProfileBadgesShowcase } from '@/components/molecules/ProfileBadgesShowcase/ProfileBadgesShowcase';
import { ProfilePrecisionCard } from '@/components/molecules/ProfilePrecisionCard/ProfilePrecisionCard';
import {
  QueryHistoryModal,
  QueryHistoryRow,
} from '@/components/molecules/QueryHistoryModal/QueryHistoryModal';
import {
  CertificateModal,
  CertificateData,
  mapCertificateRecordToData,
} from '@/components/organisms/CertificateModal/CertificateModal';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export interface UserProfileViewProps {
  profile: UserProfile | null;
  history: QueryHistoryItem[];
  tracks?: Track[];
  completedCount?: number;
  totalExercises?: number;
  totalAttemptsCount?: number;
  attemptStats?: AttemptStats;
  achievements?: Achievement[];
  dailyActivity?: { activity_date: string; exercises_solved: number; xp_earned: number }[];
  onOpenPlayground?: (initialQuery?: string) => void;
  onOpenAuth?: () => void;
  onOpenVerifyPage?: (code: string) => void;
  onSelectTrack?: (trackSlug: string) => void;
  onNavigateAchievements?: () => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => Promise<{ success?: boolean; error?: string } | void>;
  isCloudAuth?: boolean;
  isAdmin?: boolean;
  className?: string;
}

const DEFAULT_ATTEMPT_STATS: AttemptStats = {
  totalAttempts: 0,
  passedAttempts: 0,
  fastAttemptsUnder50ms: 0,
  zeroHintPassedAttempts: 0,
};

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  profile,
  history,
  tracks = [],
  completedCount = 0,
  totalExercises = 60,
  totalAttemptsCount,
  attemptStats,
  achievements = [],
  dailyActivity = [],
  onOpenPlayground,
  onOpenAuth,
  onOpenVerifyPage,
  onSelectTrack,
  onNavigateAchievements,
  onUpdateProfile,
  isCloudAuth = false,
  isAdmin = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [issuedCertificates, setIssuedCertificates] = useState<CertificateRecord[]>([]);
  const [issuingId, setIssuingId] = useState<string | null>(null);
  const [certError, setCertError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copiedProfileSummary, setCopiedProfileSummary] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'SUCCESS'>('all');
  const [isFullHistoryOpen, setIsFullHistoryOpen] = useState(false);

  useEffect(() => {
    if (!isCloudAuth) {
      setIssuedCertificates([]);
      return;
    }
    let active = true;
    api
      .getMyCertificates()
      .then((list) => {
        if (active && Array.isArray(list)) {
          setIssuedCertificates(list);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isCloudAuth, profile?.id]);

  const handleIssueAndOpen = async (params: {
    trackId: string;
    trackTitle: string;
    totalCount: number;
    qaPreview: boolean;
  }) => {
    setCertError(null);
    setIssuingId(params.trackId);
    try {
      const record = await api.issueCertificate({
        track_id: params.trackId,
        track_title: params.trackTitle,
        recipient_name: profile?.full_name || profile?.username || 'Estudiante Qurio',
        total_exercises: params.totalCount,
        qa_preview: params.qaPreview,
      });
      setIssuedCertificates((prev) => {
        const filtered = prev.filter((c) => c.verification_code !== record.verification_code);
        return [record, ...filtered];
      });
      setSelectedCertificate(mapCertificateRecordToData(record));
    } catch (err: any) {
      setCertError(err?.message || 'No se pudo emitir la constancia desde la API.');
    } finally {
      setIssuingId(null);
    }
  };

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenInPlayground = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenPlayground?.(query);
  };

  const handleShareProfile = () => {
    const primaryCert = issuedCertificates[0];
    const shareText = primaryCert
      ? primaryCert.verify_url
      : `${profile?.full_name || profile?.username || 'Estudiante Qurio'} — Nivel ${currentLevel} (${currentXp} XP) • ${completedCount}/${totalExercises} retos SQL completados en Qurio (${typeof window !== 'undefined' ? window.location.origin : ''})`;
    navigator.clipboard?.writeText(shareText);
    setCopiedProfileSummary(true);
    setTimeout(() => setCopiedProfileSummary(false), 2200);
  };

  const currentXp = profile?.total_xp ?? 0;
  const currentLevel = profile?.current_level ?? 1 + Math.floor(currentXp / 500);
  const xpInCurrentLevel = currentXp % 500;
  const xpRemaining = 500 - xpInCurrentLevel;
  const levelProgress = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / 500) * 100)));

  const levelTitles: Record<number, string> = {
    1: 'Novato SQL',
    2: 'Constructor de Consultas',
    3: 'Especialista Relacional',
    4: 'Arquitecto de Consultas',
    5: 'Maestro de Datos',
  };
  const currentTitle = levelTitles[currentLevel] || `Ingeniero Nivel ${currentLevel}`;
  const nextTitle = levelTitles[currentLevel + 1] || `Nivel ${currentLevel + 1}`;

  const memberSinceLabel = useMemo(() => {
    if (!profile?.created_at) return 'Noviembre 2026';
    try {
      const date = new Date(profile.created_at);
      return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    } catch {
      return 'Noviembre 2026';
    }
  }, [profile?.created_at]);

  // Métricas derivadas de intentos reales
  const effectiveStats = useMemo<AttemptStats>(() => {
    if (attemptStats && attemptStats.totalAttempts > 0) {
      return attemptStats;
    }
    if (history.length > 0) {
      let passedAttempts = 0;
      let fastAttemptsUnder50ms = 0;
      for (const h of history) {
        if (h.status === 'SUCCESS') passedAttempts++;
        if ((h.execution_time_ms ?? 0) < 50) fastAttemptsUnder50ms++;
      }
      return {
        totalAttempts: history.length,
        passedAttempts,
        fastAttemptsUnder50ms,
        zeroHintPassedAttempts: passedAttempts,
      };
    }
    return DEFAULT_ATTEMPT_STATS;
  }, [attemptStats, history]);

  const effectiveAttemptsTotal =
    totalAttemptsCount !== undefined && totalAttemptsCount > 0
      ? totalAttemptsCount
      : effectiveStats.totalAttempts || history.length;

  const completedTracksCount = tracks.filter(
    (tr) => (tr.total_exercises || 0) > 0 && (tr.completed_exercises ?? 0) >= (tr.total_exercises || 1)
  ).length;

  // Mapa de calor anual real: 52 semanas × 7 días (364 días terminando hoy)
  const { heatmapWeeks, annualSolvedCount, monthMarkers } = useMemo(() => {
    const activityMap = new Map<string, { solved: number; xp: number }>();
    let totalSolved = 0;
    (dailyActivity || []).forEach((item) => {
      const prev = activityMap.get(item.activity_date) || { solved: 0, xp: 0 };
      const next = {
        solved: prev.solved + (item.exercises_solved || 0),
        xp: prev.xp + (item.xp_earned || 0),
      };
      activityMap.set(item.activity_date, next);
      totalSolved += item.exercises_solved || 0;
    });

    const today = new Date();
    const totalDays = 52 * 7; // 364 días
    const cells: {
      date: string;
      label: string;
      solved: number;
      xp: number;
      isToday: boolean;
      monthKey: string;
    }[] = [];

    for (let offset = totalDays - 1; offset >= 0; offset--) {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const isoDate = d.toISOString().split('T')[0];
      const entry = activityMap.get(isoDate) || { solved: 0, xp: 0 };
      const label = d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const monthKey = d.toLocaleDateString('es-ES', { month: 'short' });
      cells.push({
        date: isoDate,
        label,
        solved: entry.solved,
        xp: entry.xp,
        isToday: offset === 0,
        monthKey,
      });
    }

    const weeks: typeof cells[] = [];
    const markers: { weekIdx: number; label: string }[] = [];
    let lastMonth = '';
    for (let w = 0; w < 52; w++) {
      const slice = cells.slice(w * 7, w * 7 + 7);
      weeks.push(slice);
      const firstDayMonth = slice[0]?.monthKey || '';
      if (firstDayMonth && firstDayMonth !== lastMonth) {
        markers.push({ weekIdx: w, label: firstDayMonth.replace('.', '') });
        lastMonth = firstDayMonth;
      }
    }

    return {
      heatmapWeeks: weeks,
      annualSolvedCount: totalSolved,
      monthMarkers: markers,
    };
  }, [dailyActivity]);

  const visibleHistory = useMemo(() => {
    const filtered =
      historyFilter === 'SUCCESS'
        ? history.filter((item) => item.status === 'SUCCESS')
        : history;
    return filtered.slice(0, 5);
  }, [history, historyFilter]);

  const scrollToCerts = () => {
    const el = document.getElementById('cert-section');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const featuredCert = issuedCertificates[0] || null;
  const globalUnlocked = isCloudAuth && completedCount >= totalExercises && totalExercises > 0;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* 1. BANNER HEROICO BENTO */}
      <section className="relative w-full rounded-2xl bg-surface/80 border border-border-subtle/70 p-6 sm:p-7 overflow-hidden shadow-xl">
        {/* Glows atmosféricos sutiles */}
        <div className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 -bottom-24 w-72 h-72 rounded-full bg-cyan-accent/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Izquierda: Avatar + Identidad + Bio + Stack */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
            <div className="relative shrink-0 group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary to-cyan-accent opacity-60 blur-sm group-hover:opacity-90 transition-opacity" />
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-surface-card ring-4 ring-surface shadow-lg">
                <img
                  src={
                    profile?.avatar_url ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'guest'}`
                  }
                  alt={`Avatar de ${profile?.full_name || profile?.username || 'Usuario'}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                title={isCloudAuth ? 'Sesión sincronizada en la nube' : 'Modo Local'}
                className={cn(
                  'absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full ring-2 ring-surface',
                  isCloudAuth ? 'bg-emerald shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-amber-streak'
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
                  {profile?.full_name || profile?.username || 'Invitado'}
                </h1>
                <span className="font-mono text-xs text-cyan-accent font-medium">
                  @{profile?.username || 'invitado'}
                </span>
                {isCloudAuth ? (
                  <Badge variant="emerald" dot size="sm">
                    Verificado
                  </Badge>
                ) : (
                  <Badge variant="amber" size="sm">
                    Modo Local
                  </Badge>
                )}
                {isAdmin && (
                  <Badge variant="cyan" size="sm">
                    Admin QA
                  </Badge>
                )}
              </div>

              <p className="text-sm text-content-secondary max-w-xl leading-relaxed">
                {profile?.bio?.trim()
                  ? profile.bio
                  : 'Estudiante de SQL Relacional y Optimización de Consultas en PostgreSQL 16.'}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs font-mono text-content-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-accent" />
                  <span>Miembro desde {memberSinceLabel}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-emerald">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PostgreSQL 16 Sandbox</span>
                </span>
              </div>

              {/* Etiquetas técnicas reales según entorno y avance */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                <span className="px-2.5 py-0.5 rounded-md bg-surface-card border border-border-subtle/60 font-mono text-[11px] text-primary-light">
                  PostgreSQL 16
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-surface-card border border-border-subtle/60 font-mono text-[11px] text-cyan-accent">
                  SQL Relacional
                </span>
                {completedCount >= 24 && (
                  <span className="px-2.5 py-0.5 rounded-md bg-surface-card border border-border-subtle/60 font-mono text-[11px] text-emerald">
                    Consultas Avanzadas
                  </span>
                )}
                {issuedCertificates.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald/10 border border-emerald/30 font-mono text-[11px] text-emerald">
                    {issuedCertificates.length}{' '}
                    {issuedCertificates.length === 1 ? 'Constancia' : 'Constancias'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Derecha: Nivel, Barra XP y CTAs */}
          <div className="flex flex-col gap-3.5 sm:min-w-[290px] bg-surface-dim/75 border border-border-subtle/60 p-4 rounded-xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary-light" />
                <span className="text-base font-bold text-content-primary">Nivel {currentLevel}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary-light font-mono text-[11px] uppercase tracking-wider font-semibold">
                {currentTitle}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-content-muted">Progreso de Nivel</span>
                <span className="text-primary-light font-semibold">
                  {currentXp} <span className="text-content-muted">/ {currentLevel * 500} XP</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-card overflow-hidden border border-border-subtle/40">
                <div
                  className="h-full bg-gradient-to-r from-primary to-cyan-accent rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center font-mono text-[10px] text-content-muted">
                <span>
                  Faltan {xpRemaining} XP para Nivel {currentLevel + 1} ({nextTitle})
                </span>
                <span className="text-emerald font-semibold">{levelProgress}%</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-2 pt-1">
              {onUpdateProfile && profile && (
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-card hover:bg-surface border border-border-subtle text-content-primary font-mono text-xs font-semibold transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-accent" />
                  <span>Editar Perfil</span>
                </button>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={handleShareProfile}
                  title="Copiar enlace o resumen de perfil"
                  aria-label="Compartir perfil"
                  className="inline-flex items-center justify-center p-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors shadow-sm"
                >
                  {copiedProfileSummary ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                </button>
                {copiedProfileSummary && (
                  <div className="absolute -top-9 right-0 px-2.5 py-1 bg-surface-card border border-border-subtle text-emerald font-mono text-[10px] rounded shadow-lg whitespace-nowrap">
                    ✓ Copiado al portapapeles
                  </div>
                )}
              </div>

              {onOpenAuth && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  title={isCloudAuth ? 'Gestionar Cuenta / Sesión' : 'Iniciar Sesión en Supabase'}
                  aria-label={isCloudAuth ? 'Gestionar Cuenta / Sesión' : 'Iniciar Sesión en Supabase'}
                  className="inline-flex items-center justify-center p-2 rounded-lg bg-surface-card hover:bg-surface border border-border-subtle text-content-primary transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-primary-light" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. FILA DE 4 KPIs REALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Retos Completados"
          value={`${completedCount} / ${totalExercises}`}
          subValue={`${Math.round((completedCount / (totalExercises || 1)) * 100)}% del currículum`}
          icon={<Award className="w-4 h-4" />}
          accent="purple"
        />
        <MetricTile
          label="Consultas Evaluadas"
          value={`${effectiveAttemptsTotal}`}
          subValue={isCloudAuth ? 'Total histórico en servidor' : 'Registradas en sesión local'}
          icon={<Terminal className="w-4 h-4" />}
          accent="cyan"
        />
        <MetricTile
          label="Racha Máxima"
          value={`${profile?.max_streak_days ?? 0} días`}
          subValue={`Racha activa: ${profile?.current_streak_days ?? 0} días`}
          icon={<Flame className="w-4 h-4" />}
          accent="amber"
        />
        <MetricTile
          label="Rutas Completadas"
          value={`${completedTracksCount} / ${tracks.length || 3}`}
          subValue={
            issuedCertificates.length > 0
              ? `${issuedCertificates.length} certificado(s) emitidos`
              : 'Completa una ruta para acreditarte'
          }
          icon={<GraduationCap className="w-4 h-4" />}
          accent="emerald"
        />
      </div>

      {/* 3. GRID ASIMÉTRICO 12 COLUMNAS (8 IZQUIERDA / 4 DERECHA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          {/* A. Mapa de Calor Anual (52 semanas estilo GitHub) */}
          <section className="rounded-2xl bg-surface/70 border border-border-subtle/60 p-5 sm:p-6 shadow-md flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald" />
                <h2 className="text-base font-semibold text-content-primary">
                  Mapa de Calor de Actividad (Último Año)
                </h2>
              </div>
              <span className="font-mono text-xs text-content-secondary">
                <strong className="text-emerald font-semibold">{annualSolvedCount}</strong> retos resueltos en 52 semanas
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-dim/80 border border-border-subtle/50 overflow-x-auto">
              {/* Etiquetas de meses */}
              <div className="relative h-4 min-w-[660px] mb-1.5 pl-8 font-mono text-[10px] text-content-muted">
                {monthMarkers.map((m) => (
                  <span
                    key={`${m.weekIdx}-${m.label}`}
                    className="absolute capitalize"
                    style={{ left: `calc(2rem + ${(m.weekIdx / 52) * 100}% * 0.92)` }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>

              <div className="flex gap-2 min-w-[660px]">
                <div className="flex flex-col justify-between text-content-muted font-mono text-[10px] py-0.5 w-6 text-right shrink-0">
                  <span>Lun</span>
                  <span>Mié</span>
                  <span>Vie</span>
                </div>

                <div className="grid grid-cols-[repeat(52,minmax(0,1fr))] gap-1 flex-1" aria-label="Mapa anual de actividad">
                  {heatmapWeeks.map((week, wIdx) => (
                    <div key={wIdx} className="grid grid-rows-7 gap-1">
                      {week.map((cell) => {
                        let cellClass = 'bg-surface-card border border-border-subtle/40';
                        if (cell.solved === 1) {
                          cellClass = 'bg-emerald/30 border border-emerald/30';
                        } else if (cell.solved === 2) {
                          cellClass = 'bg-emerald/55 border border-emerald/50';
                        } else if (cell.solved >= 3) {
                          cellClass = 'bg-emerald border border-emerald/80 shadow-[0_0_6px_rgba(34,197,94,0.45)]';
                        }
                        return (
                          <span
                            key={cell.date}
                            title={`${cell.label}: ${cell.solved} retos (${cell.xp} XP)`}
                            className={cn(
                              'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] transition-transform hover:scale-125',
                              cellClass,
                              cell.isToday && 'ring-1 ring-cyan-accent'
                            )}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border-subtle/40 text-content-muted font-mono text-[10px] min-w-[660px]">
                <span>
                  {isCloudAuth
                    ? 'Registro sincronizado diariamente en Supabase (user_daily_activity).'
                    : 'Inicia sesión para persistir tu calendario anual en la nube.'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span>Menos</span>
                  <span className="w-2.5 h-2.5 rounded-sm bg-surface-card border border-border-subtle/50" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald/30" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald/55" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald" />
                  <span>Más</span>
                </div>
              </div>
            </div>
          </section>

          {/* B. Rutas de Aprendizaje en Progreso */}
          <section className="rounded-2xl bg-surface/70 border border-border-subtle/60 p-5 sm:p-6 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <RouteIcon className="w-4 h-4 text-cyan-accent" />
                <h2 className="text-base font-semibold text-content-primary">
                  Rutas de Aprendizaje en Progreso
                </h2>
              </div>
              {onSelectTrack && (
                <button
                  type="button"
                  onClick={() => onSelectTrack(tracks[0]?.slug || 'sql-foundations')}
                  className="text-xs font-mono text-cyan-accent hover:text-content-primary transition-colors inline-flex items-center gap-1"
                >
                  <span>Ver catálogo completo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {tracks.map((tr) => {
                const trTotal = tr.total_exercises || 1;
                const trDone = tr.completed_exercises ?? 0;
                const pct = Math.min(100, Math.round((trDone / trTotal) * 100));
                const completed = trDone >= trTotal && trTotal > 0;
                const certForTrack = issuedCertificates.find((c) => c.track_id === tr.id);

                return (
                  <div
                    key={tr.id}
                    className="p-4 rounded-xl bg-surface-dim/60 hover:bg-surface-card/70 border border-border-subtle/60 transition-all flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
                            completed
                              ? 'bg-emerald/15 border-emerald/35 text-emerald'
                              : trDone > 0
                              ? 'bg-cyan-accent/15 border-cyan-accent/35 text-cyan-accent'
                              : 'bg-primary/15 border-primary/35 text-primary-light'
                          )}
                        >
                          {completed ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <RouteIcon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-content-primary truncate">
                              {tr.title}
                            </span>
                            <Badge
                              variant={completed ? 'emerald' : trDone > 0 ? 'cyan' : 'mono'}
                              size="sm"
                            >
                              {completed ? 'Completada' : trDone > 0 ? 'En curso' : 'Por iniciar'}
                            </Badge>
                          </div>
                          <span className="text-xs font-mono text-content-muted">
                            {trDone} de {trTotal} retos aprobados • {tr.modules?.length ?? 4} módulos
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span
                          className={cn(
                            'font-mono text-xs font-semibold',
                            completed ? 'text-emerald' : 'text-cyan-accent'
                          )}
                        >
                          {pct}%
                        </span>
                        {certForTrack ? (
                          <button
                            type="button"
                            onClick={() => setSelectedCertificate(mapCertificateRecordToData(certForTrack))}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card hover:bg-primary hover:text-white border border-border-subtle text-content-primary font-mono text-xs font-semibold transition-colors"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-streak" />
                            <span>Credencial #{certForTrack.verification_code.slice(-6)}</span>
                          </button>
                        ) : completed ? (
                          <button
                            type="button"
                            onClick={scrollToCerts}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald/15 hover:bg-emerald/25 border border-emerald/35 text-emerald font-mono text-xs font-semibold transition-colors"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Emitir Constancia</span>
                          </button>
                        ) : (
                          onSelectTrack && (
                            <button
                              type="button"
                              onClick={() => onSelectTrack(tr.slug)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-mono text-xs font-semibold transition-colors"
                            >
                              <span>{trDone > 0 ? 'Continuar' : 'Explorar'}</span>
                              <Play className="w-3 h-3 fill-current" />
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden border border-border-subtle/40">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          completed ? 'bg-emerald' : trDone > 0 ? 'bg-cyan-accent' : 'bg-primary'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* C. Historial Compacto (Top 5) + Modal Buscable */}
          <section className="rounded-2xl bg-surface/70 border border-border-subtle/60 p-5 sm:p-6 shadow-md flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col">
                <h2 className="text-base font-semibold text-content-primary flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary-light" />
                  <span>Historial Reciente (Últimas 5)</span>
                </h2>
                <p className="text-xs text-content-secondary mt-0.5">
                  Tus últimos envíos en el evaluador o Playground listos para reabrir.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center p-0.5 rounded-lg bg-surface-dim border border-border-subtle/60">
                  <button
                    type="button"
                    onClick={() => setHistoryFilter('all')}
                    className={cn(
                      'px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors',
                      historyFilter === 'all'
                        ? 'bg-primary text-white font-semibold'
                        : 'text-content-secondary hover:text-content-primary'
                    )}
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryFilter('SUCCESS')}
                    className={cn(
                      'px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors',
                      historyFilter === 'SUCCESS'
                        ? 'bg-emerald text-white font-semibold'
                        : 'text-content-secondary hover:text-content-primary'
                    )}
                  >
                    Solo Exitosas
                  </button>
                </div>

                {(history.length > 0 || effectiveAttemptsTotal > 0) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsFullHistoryOpen(true)}
                    leftIcon={<History className="w-3.5 h-3.5 text-cyan-accent" />}
                    className="text-xs"
                  >
                    <span>Ver todo ({effectiveAttemptsTotal || history.length})</span>
                  </Button>
                )}

                {onOpenPlayground && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onOpenPlayground()}
                    className="text-xs"
                  >
                    <span>Laboratorio</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs">
              {visibleHistory.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface-dim/50 border border-border-subtle/40 text-center text-content-muted">
                  {history.length === 0
                    ? 'Aún no has ejecutado consultas. ¡Abre el Laboratorio SQL o resuelve un reto para ver tu historial!'
                    : 'No hay consultas exitosas recientes en la vista rápida.'}
                </div>
              ) : (
                visibleHistory.map((item) => (
                  <QueryHistoryRow
                    key={item.id}
                    item={item}
                    isExpanded={expandedId === item.id}
                    isCopied={copiedId === item.id}
                    onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
                    onCopy={handleCopy}
                    onOpenPlayground={onOpenPlayground ? handleOpenInPlayground : undefined}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-w-0">
          {/* 1. Vitrina de Insignias */}
          <ProfileBadgesShowcase
            achievements={achievements}
            onViewAll={onNavigateAchievements}
          />

          {/* 2. Precisión de Código Real */}
          <ProfilePrecisionCard stats={effectiveStats} />

          {/* 3. Certificaciones Oficiales (PDF + QR + LinkedIn + QA Admin) */}
          <section
            id="cert-section"
            className="rounded-2xl bg-surface/70 border border-border-subtle/60 p-5 shadow-md flex flex-col gap-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary-light" />
                <h2 className="text-base font-semibold text-content-primary">Certificaciones</h2>
              </div>
              <span className="font-mono text-xs text-content-muted">
                {issuedCertificates.length} {issuedCertificates.length === 1 ? 'Acreditada' : 'Acreditadas'}
              </span>
            </div>

            {isAdmin && (
              <div className="p-3 rounded-xl bg-cyan-accent/10 border border-cyan-accent/30 flex items-start gap-2 text-[11px] text-content-secondary">
                <ShieldAlert className="w-4 h-4 text-cyan-accent shrink-0 mt-0.5" />
                <span>
                  <strong className="font-mono text-cyan-accent">Modo QA Admin:</strong> puedes emitir y probar constancias reales (PDF + QR + LinkedIn + verificación pública) sin completar los 60 retos.
                </span>
              </div>
            )}

            {certError && (
              <div role="alert" className="p-3 rounded-xl bg-error/10 border border-error/30 text-xs font-mono text-error">
                {certError}
              </div>
            )}

            {/* Tarjeta destacada de credencial emitida (si existe) */}
            {featuredCert && (
              <div className="relative rounded-xl bg-surface-dim/90 border border-primary/35 p-4 overflow-hidden shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary-light shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-content-primary truncate">
                        {featuredCert.track_title}
                      </span>
                      <span className="font-mono text-[10px] text-content-muted">
                        Emitido el{' '}
                        {new Date(featuredCert.issued_at).toLocaleDateString('es-ES', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <Badge variant={featuredCert.is_qa_preview ? 'amber' : 'emerald'} size="sm">
                    {featuredCert.is_qa_preview ? 'QA' : '100%'}
                  </Badge>
                </div>

                <div className="rounded-lg bg-surface p-2.5 border border-border-subtle/50 flex flex-col gap-1 font-mono text-[10px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-content-muted">ID Criptográfico:</span>
                    <span className="text-cyan-accent truncate">#{featuredCert.verification_code}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-content-muted">Validación:</span>
                    <span className="text-content-secondary">SHA-256 Verificable</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCertificate(mapCertificateRecordToData(featuredCert))}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-mono text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Certificado Digital</span>
                  </button>
                  <a
                    href={api.getCertificatePdfUrl(featuredCert.verification_code)}
                    download={`constancia-qurio-${featuredCert.verification_code.toLowerCase()}.pdf`}
                    title="Descargar PDF"
                    aria-label="Descargar PDF oficial"
                    className="inline-flex items-center justify-center p-2 rounded-lg bg-surface-card hover:bg-surface border border-border-subtle text-content-primary transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Listado compacto por ruta + Certificado Global */}
            <div className="flex flex-col gap-2">
              {tracks.map((tr) => {
                const trTotal = tr.total_exercises || 1;
                const trDone = tr.completed_exercises ?? 0;
                const unlocked = isCloudAuth && trDone >= trTotal && trTotal > 0;
                const canIssue = unlocked || isAdmin;

                return (
                  <div
                    key={tr.id}
                    className={cn(
                      'p-3 rounded-xl border flex items-center justify-between gap-2.5',
                      unlocked
                        ? 'bg-emerald/[0.06] border-emerald/35'
                        : isAdmin
                        ? 'bg-cyan-accent/[0.04] border-cyan-accent/30'
                        : 'bg-surface-dim/50 border-border-subtle/50'
                    )}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-content-primary truncate">
                        {tr.title}
                      </span>
                      <span className="text-[10px] font-mono text-content-muted">
                        {trDone} / {trTotal} retos
                      </span>
                    </div>

                    {canIssue ? (
                      <Button
                        size="sm"
                        variant={unlocked ? 'emerald' : 'outline'}
                        isLoading={issuingId === tr.id}
                        leftIcon={!unlocked ? <Sparkles className="w-3 h-3 text-cyan-accent" /> : undefined}
                        onClick={() =>
                          handleIssueAndOpen({
                            trackId: tr.id,
                            trackTitle: tr.title,
                            totalCount: trTotal,
                            qaPreview: !unlocked,
                          })
                        }
                        className="shrink-0 text-[11px]"
                      >
                        {unlocked ? 'Ver Constancia' : 'Probar Constancia (QA)'}
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-content-muted shrink-0">
                        <Lock className="w-3 h-3" />
                        <span>{Math.max(0, trTotal - trDone)} rest.</span>
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Certificado Global del Currículum */}
              <div
                className={cn(
                  'p-3 rounded-xl border flex items-center justify-between gap-2.5',
                  globalUnlocked
                    ? 'bg-primary/10 border-primary/40'
                    : isAdmin
                    ? 'bg-cyan-accent/[0.05] border-cyan-accent/35'
                    : 'bg-surface-dim/40 border-border-subtle/40'
                )}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-content-primary truncate">
                    Certificado Global SQL Engineering
                  </span>
                  <span className="text-[10px] font-mono text-content-muted">
                    {completedCount} / {totalExercises} retos globales
                  </span>
                </div>

                {globalUnlocked || isAdmin ? (
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={issuingId === 'global-curriculum'}
                    leftIcon={!globalUnlocked ? <Sparkles className="w-3 h-3" /> : undefined}
                    onClick={() =>
                      handleIssueAndOpen({
                        trackId: 'global-curriculum',
                        trackTitle: 'Currículum Completo SQL Engineering',
                        totalCount: totalExercises,
                        qaPreview: !globalUnlocked,
                      })
                    }
                    className="shrink-0 text-[11px]"
                  >
                    {globalUnlocked ? 'Ver Global' : 'Probar Global (QA)'}
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-content-muted shrink-0">
                    <Lock className="w-3 h-3" />
                    <span>{Math.max(0, totalExercises - completedCount)} rest.</span>
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modales */}
      <CertificateModal
        certificate={selectedCertificate}
        isOpen={Boolean(selectedCertificate)}
        onClose={() => setSelectedCertificate(null)}
        onOpenVerifyPage={onOpenVerifyPage}
      />

      {onUpdateProfile && (
        <EditProfileModal
          profile={profile}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={onUpdateProfile}
        />
      )}

      <QueryHistoryModal
        isOpen={isFullHistoryOpen}
        onClose={() => setIsFullHistoryOpen(false)}
        userId={profile?.id}
        isCloudAuth={isCloudAuth}
        localHistory={history}
        initialFilter={historyFilter}
        onOpenPlayground={onOpenPlayground}
      />
    </div>
  );
};
