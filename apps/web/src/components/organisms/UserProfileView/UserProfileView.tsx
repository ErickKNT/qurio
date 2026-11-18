import React, { useMemo, useState } from 'react';
import {
  Zap,
  Flame,
  Award,
  Terminal,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Code2,
  UserCheck,
  Copy,
  Check,
  Play,
  ChevronDown,
  ChevronUp,
  Lock,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { UserProfile, QueryHistoryItem, Track } from '@/types';
import { Badge, Button } from '@/components/atoms';
import { MetricTile } from '@/components/molecules/MetricTile/MetricTile';
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
  dailyActivity?: { activity_date: string; exercises_solved: number; xp_earned: number }[];
  onOpenPlayground?: (initialQuery?: string) => void;
  onOpenAuth?: () => void;
  onOpenVerifyPage?: (code: string) => void;
  isCloudAuth?: boolean;
  isAdmin?: boolean;
  className?: string;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  profile,
  history,
  tracks = [],
  completedCount = 0,
  totalExercises = 60,
  dailyActivity = [],
  onOpenPlayground,
  onOpenAuth,
  onOpenVerifyPage,
  isCloudAuth = false,
  isAdmin = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [issuingId, setIssuingId] = useState<string | null>(null);
  const [certError, setCertError] = useState<string | null>(null);

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
      setSelectedCertificate(mapCertificateRecordToData(record));
    } catch (err: any) {
      setCertError(err?.message || 'No se pudo emitir la constancia desde la API.');
    } finally {
      setIssuingId(null);
    }
  };

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenInPlayground = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenPlayground?.(query);
  };
  const currentXp = profile?.total_xp ?? 0;
  const currentLevel = profile?.current_level ?? (1 + Math.floor(currentXp / 500));
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

  // 30 días naturales reales: desde hace 29 días hasta hoy
  const heatmapDays = useMemo(() => {
    const activityMap = new Map<string, number>();
    (dailyActivity || []).forEach((item) => {
      activityMap.set(item.activity_date, item.exercises_solved);
    });

    const days = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const dayOfMonth = d.getDate();
      const monthShort = d.toLocaleDateString('es-ES', { month: 'short' });
      const count = activityMap.get(isoDate) ?? 0;

      days.push({
        date: isoDate,
        day: dayOfMonth,
        month: monthShort,
        count,
        isToday: i === 0,
      });
    }

    return days;
  }, [dailyActivity]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Profile Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-7 rounded-2xl bg-surface/70 border border-border-subtle/60 shadow-lg">
        <div className="flex items-center gap-5">
          <img
            src={
              profile?.avatar_url ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'guest'}`
            }
            alt={`Avatar de ${profile?.username || 'Usuario'}`}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-border-subtle shadow-md"
          />

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-content-primary font-mono">
                {profile?.username || 'Invitado'}
              </h1>
              <Badge variant="cyan" dot size="sm">
                Nivel {currentLevel}
              </Badge>
              {isCloudAuth ? (
                <Badge variant="emerald" dot size="sm">
                  Sesión en la Nube
                </Badge>
              ) : (
                <Badge variant="amber" size="sm">
                  Modo Local
                </Badge>
              )}
            </div>

            <p className="text-xs text-content-secondary font-mono">
              {profile?.full_name || profile?.username || 'Estudiante'} • {isCloudAuth ? 'Sesión Autenticada' : 'Modo Demostración'}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] font-mono text-content-muted">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-content-muted" />
                Miembro desde Nov 2026
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Entorno de Práctica Conectado
              </span>
            </div>

            {onOpenAuth && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenAuth}
                  className="text-xs"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  <span>{isCloudAuth ? 'Gestionar Cuenta / Sesión' : 'Iniciar Sesión en Supabase'}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Level & XP Progression Card */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-dim/70 border border-border-subtle/50 min-w-[240px] font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-content-muted uppercase tracking-wider">
              Nivel {currentLevel} • {currentTitle}
            </span>
            <span className="font-bold text-amber-streak flex items-center gap-1">
              <Zap className="w-3 h-3 fill-amber-streak" />
              {currentXp} XP
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-surface overflow-hidden border border-border-subtle/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-500 to-cyan-accent transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>

          <span className="text-[10px] text-content-muted text-right">
            Faltan {xpRemaining} XP para Nivel {currentLevel + 1} ({nextTitle})
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Retos Completados"
          value={`${completedCount} / ${totalExercises}`}
          subValue={`${Math.round((completedCount / (totalExercises || 1)) * 100)}% del currículum`}
          icon={<Award className="w-4 h-4" />}
          accent="purple"
        />
        <MetricTile
          label="Racha Actual"
          value={`${profile?.current_streak_days ?? 0} días`}
          subValue="Objetivo: 7 días"
          icon={<Flame className="w-4 h-4" />}
          accent="amber"
        />
        <MetricTile
          label="Racha Récord"
          value={`${profile?.max_streak_days ?? 0} días`}
          subValue="Máxima histórica"
          icon={<Zap className="w-4 h-4" />}
          accent="indigo"
        />
        <MetricTile
          label="Tiempo de Respuesta"
          value={
            history.length > 0
              ? `${(history.reduce((acc, h) => acc + (h.execution_time_ms || 0), 0) / history.length).toFixed(1)} ms`
              : '3.6 ms'
          }
          subValue="Promedio en PostgreSQL"
          icon={<Clock className="w-4 h-4" />}
          accent="cyan"
        />
      </div>

      {/* Activity Heatmap Grid */}
      <section className="flex flex-col gap-4 p-6 rounded-2xl bg-surface/60 border border-border-subtle/60">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-content-primary">
              Cadencia de Práctica (Últimos 30 días)
            </h3>
            <p className="text-xs text-content-secondary mt-0.5">
              Consistencia de consultas ejecutadas en el entorno PostgreSQL.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-content-muted">
            <span>Menos</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-surface-dim border border-border-subtle/40" />
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-accent/25 border border-cyan-accent/30" />
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-accent/60" />
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-accent shadow-glow-cyan" />
            <span>Más</span>
          </div>
        </div>

        {/* Heatmap Blocks */}
        <div className="grid grid-cols-10 sm:grid-cols-15 gap-2 pt-2">
          {heatmapDays.map((d) => {
            const intensityClass =
              d.count === 0
                ? 'bg-surface-dim border-border-subtle/30 text-content-muted'
                : d.count === 1
                ? 'bg-cyan-accent/25 border-cyan-accent/40 text-cyan-accent font-semibold'
                : d.count <= 3
                ? 'bg-cyan-accent/60 border-cyan-accent/70 text-content-primary font-bold'
                : 'bg-cyan-accent border-cyan-accent text-canvas font-bold shadow-glow-cyan';

            const titleText = d.isToday
              ? `Hoy (${d.day} ${d.month}): ${d.count} consultas ejecutadas`
              : `${d.day} ${d.month}: ${d.count} consultas ejecutadas`;

            return (
              <div
                key={d.date}
                title={titleText}
                className={`h-8 rounded-lg border flex flex-col items-center justify-center font-mono text-[10px] transition-all cursor-pointer hover:scale-105 ${intensityClass}`}
              >
                <span>{d.day}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Constancias de Finalización por Ruta y Currículum Global */}
      <section className="flex flex-col gap-4 p-6 rounded-2xl bg-surface/60 border border-border-subtle/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-streak" />
              Constancias de Finalización (PDF + LinkedIn)
            </h3>
            <p className="text-xs text-content-secondary mt-0.5">
              Completa el 100% de una ruta oficial o de los {totalExercises} retos para emitir tu constancia verificable en PDF y vincularla a LinkedIn.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Badge variant="cyan" dot size="sm">
                Modo QA Admin Desbloqueado
              </Badge>
            )}
            {!isCloudAuth && (
              <Badge variant="amber" size="sm">
                Requiere cuenta autenticada
              </Badge>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="p-3 rounded-xl bg-cyan-accent/10 border border-cyan-accent/30 flex items-center gap-2.5 text-xs text-content-secondary">
            <ShieldAlert className="w-4 h-4 text-cyan-accent shrink-0" />
            <span>
              Tu sesión tiene rol <strong className="font-mono text-cyan-accent">admin</strong>: puedes emitir y probar constancias reales (PDF vectorial + QR + LinkedIn + verificación pública) en cualquier ruta sin completar los 60 retos primero.
            </span>
          </div>
        )}

        {certError && (
          <div role="alert" className="p-3 rounded-xl bg-error/10 border border-error/30 text-xs font-mono text-error">
            {certError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tracks.map((tr) => {
            const trTotal = tr.total_exercises || 1;
            const trDone = tr.completed_exercises ?? 0;
            const unlocked = isCloudAuth && trDone >= trTotal && trTotal > 0;
            const canIssue = unlocked || isAdmin;
            return (
              <div
                key={tr.id}
                className={cn(
                  'p-4 rounded-xl border flex items-center justify-between gap-3',
                  unlocked
                    ? 'bg-emerald/[0.06] border-emerald/35'
                    : isAdmin
                    ? 'bg-cyan-accent/[0.04] border-cyan-accent/30'
                    : 'bg-surface-dim/50 border-border-subtle/50'
                )}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-xs font-bold text-content-primary truncate">
                    {tr.title}
                  </span>
                  <span className="text-[11px] font-mono text-content-muted">
                    {trDone} / {trTotal} retos aprobados
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
                    className="shrink-0 text-xs"
                  >
                    {unlocked ? 'Ver Constancia' : 'Probar Constancia (QA)'}
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-content-muted shrink-0">
                    <Lock className="w-3 h-3" />
                    <span>{Math.max(0, trTotal - trDone)} restantes</span>
                  </span>
                )}
              </div>
            );
          })}

          {/* Constancia Global (60 retos) */}
          {(() => {
            const globalUnlocked = isCloudAuth && completedCount >= totalExercises && totalExercises > 0;
            const canIssueGlobal = globalUnlocked || isAdmin;
            return (
              <div
                className={cn(
                  'p-4 rounded-xl border flex items-center justify-between gap-3',
                  globalUnlocked
                    ? 'bg-primary/10 border-primary/40'
                    : isAdmin
                    ? 'bg-cyan-accent/[0.04] border-cyan-accent/30'
                    : 'bg-surface-dim/50 border-border-subtle/50'
                )}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-xs font-bold text-content-primary truncate">
                    Currículum Completo SQL (PostgreSQL 16)
                  </span>
                  <span className="text-[11px] font-mono text-content-muted">
                    {completedCount} / {totalExercises} retos aprobados
                  </span>
                </div>

                {canIssueGlobal ? (
                  <Button
                    size="sm"
                    variant={globalUnlocked ? 'primary' : 'outline'}
                    isLoading={issuingId === 'global-curriculum'}
                    leftIcon={!globalUnlocked ? <Sparkles className="w-3 h-3 text-cyan-accent" /> : undefined}
                    onClick={() =>
                      handleIssueAndOpen({
                        trackId: 'global-curriculum',
                        trackTitle: 'Currículum Completo SQL • PostgreSQL 16',
                        totalCount: totalExercises,
                        qaPreview: !globalUnlocked,
                      })
                    }
                    className="shrink-0 text-xs"
                  >
                    {globalUnlocked ? 'Ver Certificado' : 'Probar Certificado (QA)'}
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-content-muted shrink-0">
                    <Lock className="w-3 h-3" />
                    <span>{Math.max(0, totalExercises - completedCount)} restantes</span>
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Query Execution History Log */}
      <section className="flex flex-col gap-4 p-6 rounded-2xl bg-surface/60 border border-border-subtle/60">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-accent" />
              Historial Reciente de Consultas
            </h3>
            <p className="text-xs text-content-secondary mt-0.5">
              Registro de tus últimas consultas ejecutadas en PostgreSQL.
            </p>
          </div>

          {onOpenPlayground && (
            <Button size="sm" variant="outline" onClick={() => onOpenPlayground()} className="text-xs">
              <span>Abrir Laboratorio</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2 font-mono text-xs">
          {history.length === 0 ? (
            <div className="p-4 rounded-xl bg-surface-dim/40 border border-border-subtle/30 text-center text-content-muted">
              Aún no has ejecutado consultas. ¡Abre el Laboratorio SQL o resuelve un reto para ver tu historial!
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col p-3 rounded-xl bg-surface/40 hover:bg-surface/70 border border-border-subtle/40 gap-2 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="flex items-center gap-2.5 overflow-hidden flex-1 cursor-pointer select-none group"
                    title="Clic para expandir/contraer consulta completa"
                  >
                    <Code2 className="w-3.5 h-3.5 text-content-muted group-hover:text-cyan-accent shrink-0 transition-colors" />
                    <span className="text-content-primary truncate font-mono text-[11px] group-hover:text-primary-light transition-colors">
                      {item.query}
                    </span>
                    {expandedId === item.id ? (
                      <ChevronUp className="w-3 h-3 text-content-muted shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-content-muted opacity-60 group-hover:opacity-100 shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 text-[10px] text-content-muted">
                    <span className="text-emerald font-semibold">
                      {item.row_count} filas
                    </span>
                    <span>{item.execution_time_ms} ms</span>
                    <span>{item.executed_at}</span>
                    <Badge variant={item.status === 'SUCCESS' ? 'emerald' : 'error'} size="sm">
                      {item.status === 'SUCCESS' ? 'EXITOSA' : 'ERROR'}
                    </Badge>

                    {/* Acciones interactivas: Copiar y Abrir en Playground */}
                    <div className="flex items-center gap-1.5 pl-2 border-l border-border-subtle/40">
                      <button
                        type="button"
                        onClick={(e) => handleCopy(item.id, item.query, e)}
                        className={cn(
                          "px-2 py-1 rounded-md border transition-all flex items-center gap-1 select-none",
                          copiedId === item.id
                            ? "bg-emerald/15 border-emerald/40 text-emerald font-semibold"
                            : "bg-surface-card border-border-subtle text-content-secondary hover:text-content-primary hover:border-primary/50"
                        )}
                        title={copiedId === item.id ? "¡Copiado al portapapeles!" : "Copiar consulta SQL"}
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald" />
                            <span className="text-[10px] font-sans text-emerald">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px] font-sans hidden sm:inline">Copiar</span>
                          </>
                        )}
                      </button>

                      {onOpenPlayground && (
                        <button
                          type="button"
                          onClick={(e) => handleOpenInPlayground(item.query, e)}
                          className="px-2 py-1 rounded-md border bg-surface-card border-border-subtle text-content-secondary hover:text-cyan-accent hover:border-cyan-accent/50 hover:bg-cyan-accent/10 transition-all flex items-center gap-1 select-none"
                          title="Cargar esta consulta en el Laboratorio SQL"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span className="text-[10px] font-sans hidden sm:inline">Laboratorio</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vista expandida de la consulta completa */}
                {expandedId === item.id && (
                  <div className="mt-1 pt-2 border-t border-border-subtle/40 animate-fadeIn">
                    <div className="p-3 rounded-lg bg-canvas/80 border border-border-subtle font-mono text-xs text-primary-light overflow-x-auto select-text shadow-inner">
                      <pre className="m-0 leading-relaxed font-mono whitespace-pre-wrap break-words">
                        <code>{item.query}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <CertificateModal
        certificate={selectedCertificate}
        isOpen={Boolean(selectedCertificate)}
        onClose={() => setSelectedCertificate(null)}
        onOpenVerifyPage={onOpenVerifyPage}
      />
    </div>
  );
};
