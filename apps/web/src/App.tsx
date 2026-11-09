import React, { useState, useEffect, useCallback } from 'react';
import {
  Terminal,
  Zap,
  Award,
  Database,
  Play,
  CheckCircle2,
  Code2,
  Sparkles,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { DashboardLayout, WorkspaceLayout } from '@/components/templates';
import { Button, Badge, KbdShortcut, RadioTab } from '@/components/atoms';
import { MetricTile, FormField, StreakPill, SuccessModal } from '@/components/molecules';
import { MonacoEditorPanel, DataGridResults, ExerciseSpecPanel } from '@/components/organisms';
import { useAuth } from '@/hooks/useAuth';
import { api, FALLBACK_EXERCISES } from '@/lib/api';
import { Exercise, EvaluationResponse, DiffResult, ColumnInfo } from '@/types';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<'dashboard' | 'playground' | 'tracks' | 'achievements' | 'profile'>('dashboard');
  const [activeTab, setActiveTab] = useState<'overview' | 'components'>('overview');
  const [formEmail, setFormEmail] = useState('');
  const [formError, setFormError] = useState('');
  const { profile } = useAuth();

  // Estados del Ejercicio Activo y del IDE
  const [exercises, setExercises] = useState<Exercise[]>(FALLBACK_EXERCISES);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sqlCode, setSqlCode] = useState(FALLBACK_EXERCISES[0].initial_code);
  const [hintsUnlocked, setHintsUnlocked] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  // Estados de Resultados
  const [executionStatus, setExecutionStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR' | 'FAILED'>('IDLE');
  const [executionTime, setExecutionTime] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [resultColumns, setResultColumns] = useState<ColumnInfo[]>([]);
  const [resultRows, setResultRows] = useState<any[][]>([]);
  const [resultError, setResultError] = useState<string | undefined>();
  const [resultDiff, setResultDiff] = useState<DiffResult | undefined>();
  const [resultMessage, setResultMessage] = useState<string | undefined>();

  // Modal de Victoria
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [awardedXp, setAwardedXp] = useState(0);

  const activeExercise = exercises[currentExerciseIndex] || FALLBACK_EXERCISES[0];

  // Cargar ejercicios desde FastAPI al inicio
  useEffect(() => {
    api.getExercises().then((data) => {
      if (data && data.length > 0) {
        setExercises(data);
      }
    });
  }, []);

  // Actualización dinámica del título de la pestaña (Anti-AI Slop Regla 1.1)
  useEffect(() => {
    if (currentPath === 'playground') {
      document.title = `${activeExercise.title} — SQL Foundations | Qurio`;
    } else {
      const titles: Record<string, string> = {
        dashboard: 'Dashboard | Qurio',
        tracks: 'Rutas de Aprendizaje | Qurio',
        achievements: 'Logros & Rangos | Qurio',
        profile: 'Mi Perfil | Qurio',
      };
      document.title = titles[currentPath] || 'Qurio | Aprende SQL. Piensa en queries.';
    }
  }, [currentPath, activeExercise]);

  // Cambiar de ejercicio activo
  const handleSelectExercise = (index: number) => {
    const ex = exercises[index];
    if (ex) {
      setCurrentExerciseIndex(index);
      setSqlCode(ex.initial_code);
      setHintsUnlocked(0);
      setExecutionStatus('IDLE');
      setResultError(undefined);
      setResultDiff(undefined);
    }
  };

  // Desbloquear siguiente pista
  const handleUnlockHint = () => {
    const totalHints = activeExercise.hints ? activeExercise.hints.length : 0;
    if (hintsUnlocked < totalHints) {
      setHintsUnlocked((prev) => prev + 1);
    }
  };

  // Ejecución / Evaluación Semántica End-to-End
  const handleExecuteSolution = useCallback(async () => {
    if (!sqlCode.trim()) return;

    setIsExecuting(true);
    setExecutionStatus('LOADING');
    setResultError(undefined);
    setResultDiff(undefined);

    try {
      const evalResponse: EvaluationResponse = await api.submitSolution(
        activeExercise.id,
        sqlCode,
        hintsUnlocked
      );

      setExecutionTime(evalResponse.execution_time_ms);

      if (evalResponse.status === 'PASSED') {
        setExecutionStatus('SUCCESS');
        setRowCount(evalResponse.rows.length);
        setResultColumns(evalResponse.columns.map((name) => ({ name, type: 'column' })));
        setResultRows(evalResponse.rows);
        setAwardedXp(evalResponse.xp_awarded);
        // Dejar visible el resultado en pantalla (no bloquear con modal inmediato)
        setSuccessModalOpen(false);
      } else if (evalResponse.status === 'FAILED') {
        setExecutionStatus('FAILED');
        setRowCount(evalResponse.rows ? evalResponse.rows.length : 0);
        setResultColumns(evalResponse.columns ? evalResponse.columns.map((name) => ({ name, type: 'column' })) : []);
        setResultRows(evalResponse.rows || []);
        setResultDiff(evalResponse.diff);
        setResultMessage(evalResponse.message);
      } else {
        setExecutionStatus('ERROR');
        setResultError(evalResponse.error || evalResponse.message);
      }
    } catch (err: any) {
      setExecutionStatus('ERROR');
      setResultError(err.message || 'Error de conexión con el evaluador semántico en FastAPI.');
    } finally {
      setIsExecuting(false);
    }
  }, [activeExercise, sqlCode, hintsUnlocked]);

  // Avanzar al siguiente reto
  const handleNextExercise = () => {
    setSuccessModalOpen(false);
    const nextIndex = (currentExerciseIndex + 1) % exercises.length;
    handleSelectExercise(nextIndex);
  };

  const handleValidateEmail = (val: string) => {
    setFormEmail(val);
    if (!val) {
      setFormError('El correo electrónico es obligatorio para guardar tu progreso.');
    } else if (!val.includes('@') || !val.includes('.')) {
      setFormError('Introduce un formato de correo electrónico válido (ej. usuario@dominio.com).');
    } else {
      setFormError('');
    }
  };

  // ============================================================================
  // VISTA 1: ESPACIO DE TRABAJO DEL EJERCICIO (IDE INTERACTIVO CON MONACO)
  // ============================================================================
  if (currentPath === 'playground') {
    return (
      <>
        <WorkspaceLayout
          headerBar={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  onClick={() => setCurrentPath('dashboard')}
                >
                  Dashboard
                </Button>

                <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-content-muted">
                  <span>SQL Foundations</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-content-primary font-medium">{activeExercise.title}</span>
                </div>
              </div>

              {/* Selector Rápido de Ejercicios */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-content-muted hidden md:inline">Reto:</span>
                <select
                  value={currentExerciseIndex}
                  onChange={(e) => handleSelectExercise(Number(e.target.value))}
                  className="bg-surface-card text-content-primary border border-border-subtle text-xs rounded-lg px-2.5 py-1 font-mono outline-none focus:border-primary"
                >
                  {exercises.map((ex, idx) => (
                    <option key={ex.id} value={idx}>
                      #{idx + 1} {ex.title}
                    </option>
                  ))}
                </select>

                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-dim border border-border-subtle text-[11px] font-mono text-emerald">
                  <span className="w-2 h-2 rounded-full bg-emerald shadow-glow-emerald" />
                  <span>Sandbox Online</span>
                </div>
              </div>
            </div>
          }
          sidebarContent={
            <ExerciseSpecPanel
              exercise={activeExercise}
              unlockedHintsCount={hintsUnlocked}
              onUnlockHint={handleUnlockHint}
            />
          }
          editorContent={
            <MonacoEditorPanel
              value={sqlCode}
              onChange={setSqlCode}
              onExecute={handleExecuteSolution}
              onReset={() => setSqlCode(activeExercise.initial_code)}
              isLoading={isExecuting}
              isSubmitMode={true}
            />
          }
          resultsContent={
            <DataGridResults
              status={executionStatus}
              executionTimeMs={executionTime}
              rowCount={rowCount}
              columns={resultColumns}
              rows={resultRows}
              error={resultError}
              diff={resultDiff}
              message={resultMessage}
              xpAwarded={awardedXp}
              onNextExercise={handleNextExercise}
            />
          }
          statusBar={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <span>PostgreSQL 16.3 (Sandbox Docker)</span>
                <span>DB: ecommerce_sandbox</span>
                <span>User: readonly_student</span>
              </div>
              <div className="flex items-center gap-3">
                <KbdShortcut keys={['⌘', '↵']} />
                <span>para compilar y evaluar</span>
              </div>
            </div>
          }
        />

        {/* Modal de Reto Superado con XP y Avance Directo */}
        <SuccessModal
          isOpen={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          onNextExercise={handleNextExercise}
          xpAwarded={awardedXp}
          exerciseTitle={activeExercise.title}
          executionTimeMs={executionTime}
          hintsUsed={hintsUnlocked}
        />
      </>
    );
  }

  // ============================================================================
  // VISTA 2: DASHBOARD GENERAL
  // ============================================================================
  return (
    <DashboardLayout
      currentPath={currentPath}
      onNavigate={(path) => setCurrentPath(path as any)}
      title={currentPath === 'dashboard' ? 'Centro de Mando de Ingeniería' : currentPath.toUpperCase()}
    >
      <div className="flex flex-col gap-8">
        {/* Banner de Bienvenida y Rendimiento del Sandbox */}
        <section className="relative overflow-hidden rounded-2xl bg-surface p-6 sm:p-8 border border-border-subtle shadow-xl">
          <div className="absolute -right-20 -top-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute right-64 -bottom-20 w-64 h-64 rounded-full bg-cyan-accent/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-border-subtle w-fit text-xs font-mono text-cyan-accent">
                <span className="w-2 h-2 rounded-full bg-emerald shadow-glow-emerald" />
                <span>Ruta Activa • SQL Foundations</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-content-primary">
                ¡Hola, {profile?.username || 'Erick'}!{' '}
                <span className="text-primary-light font-normal">¿Listo para compilar hoy?</span>
              </h1>

              <p className="text-sm text-content-secondary leading-relaxed">
                Sandbox PostgreSQL aislado en Docker activo. Resuelve ejercicios relacionales con feedback semántico
                instantáneo y progresión de nivel sin rodeos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex flex-col items-start sm:items-end pr-2 font-mono">
                <span className="text-[11px] text-content-muted uppercase tracking-wider">Latencia Sandbox</span>
                <span className="text-xs text-emerald font-semibold flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> 3.6ms (pg_stat_ready)
                </span>
              </div>

              <Button
                variant="primary"
                size="md"
                kbdShortcut="⌘↵"
                leftIcon={<Play className="w-4 h-4 fill-white" />}
                onClick={() => {
                  handleSelectExercise(0);
                  setCurrentPath('playground');
                }}
              >
                Abrir IDE & Resolver
              </Button>
            </div>
          </div>
        </section>

        {/* Bento Grid de Métricas (5 Tiles) */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <MetricTile
            label="Rango Actual"
            value="Nivel 4"
            subValue="Explorer"
            icon={<Award className="w-4 h-4" />}
            accentColor="cyan"
          />
          <MetricTile
            label="XP Acumulado"
            value={`${profile?.total_xp || 0}`}
            subValue="/ 2,000"
            icon={<Zap className="w-4 h-4" />}
            accentColor="primary"
          />
          <MetricTile
            label="Racha Activa"
            value={`${profile?.current_streak_days || 0}d`}
            subValue="Max: 14d"
            icon={<StreakPill days={profile?.current_streak_days || 0} />}
            accentColor="amber"
          />
          <MetricTile
            label="Queries Evaluados"
            value="142"
            subValue="+18 hoy"
            icon={<Terminal className="w-4 h-4" />}
            accentColor="emerald"
          />
          <MetricTile
            label="Tasa de Éxito"
            value="94.2%"
            subValue="Semántico"
            icon={<CheckCircle2 className="w-4 h-4" />}
            accentColor="cyan"
            className="col-span-2 sm:col-span-1"
          />
        </section>

        {/* Selector de Pestañas para el Dashboard / Atomic Showcase */}
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <RadioTab
            label="Visión General"
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<Terminal className="w-3.5 h-3.5" />}
          />
          <RadioTab
            label="Sistema de Diseño & Átomos"
            active={activeTab === 'components'}
            onClick={() => setActiveTab('components')}
            icon={<Sparkles className="w-3.5 h-3.5" />}
            badge="Atomic"
          />
        </div>

        {activeTab === 'overview' ? (
          /* Vista de Retos Destacados */
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reto Estrella en Proceso */}
            <div className="lg:col-span-2 flex flex-col justify-between p-6 rounded-2xl bg-surface border border-border-subtle shadow-lg">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Badge variant="cyan" dot>Reto Estrella Recomendado</Badge>
                  <span className="text-xs font-mono text-content-muted">Módulo 6 • Intermedio</span>
                </div>

                <h3 className="text-lg font-bold text-content-primary">
                  {exercises[3]?.title || 'Clientes sin Compras Registradas (LEFT JOIN & IS NULL)'}
                </h3>

                <p className="text-xs text-content-secondary leading-relaxed">
                  {exercises[3]?.prompt || 'El equipo de marketing necesita reactivar a usuarios registrados que nunca han realizado un pedido en la plataforma.'}
                </p>

                <div className="mt-2 p-3 rounded-lg bg-canvas border border-border-subtle font-mono text-xs text-cyan-accent flex items-center justify-between">
                  <code>SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c...</code>
                  <KbdShortcut keys={['⌘', '↵']} />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-streak">
                  <Zap className="w-4 h-4 fill-amber-streak" />
                  <span>Recompensa: +{exercises[3]?.xp_reward || 50} XP</span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleSelectExercise(3 < exercises.length ? 3 : 0);
                    setCurrentPath('playground');
                  }}
                >
                  Resolver Reto
                </Button>
              </div>
            </div>

            {/* Panel Lateral de Esquema Activo */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-surface border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-content-secondary">
                  Esquema Activo
                </span>
                <Badge variant="emerald" size="sm">Ecommerce DB</Badge>
              </div>

              <div className="flex flex-col gap-2 font-mono text-xs">
                {['clientes (15 filas)', 'pedidos (30 filas)', 'detalles_pedido (60 filas)', 'productos (20 filas)', 'categorias (5 filas)'].map((tbl, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-card border border-border-subtle/60 text-content-secondary hover:text-content-primary hover:border-primary/40 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-primary-light" />
                      {tbl}
                    </span>
                    <span className="text-[10px] text-content-muted">public</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          /* Showcase del Árbol de Atomic Design Pragmático */
          <section className="flex flex-col gap-6 p-6 rounded-2xl bg-surface border border-border-subtle">
            <div>
              <h3 className="text-base font-bold text-content-primary">
                Verificación del Sistema de Diseño (Atomic Design Pragmático)
              </h3>
              <p className="text-xs text-content-secondary mt-1">
                Todos los componentes pertenecen estrictamente a Átomos, Moléculas u Organismos bajo la especificación Terminal Glow Minimal.
              </p>
            </div>

            {/* Átomos: Botones */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono font-semibold text-cyan-accent uppercase tracking-wider">
                1. Átomos — Variantes de Button
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" kbdShortcut="⌘↵">Primario (Ejecutar)</Button>
                <Button variant="secondary">Secundario (Formatear)</Button>
                <Button variant="emerald">Éxito Semántico</Button>
                <Button variant="ghost">Ghost (Copiar)</Button>
                <Button variant="outline">Contorno</Button>
                <Button variant="danger">Peligro</Button>
                <Button variant="primary" isLoading>Cargando</Button>
              </div>
            </div>

            {/* Átomos: Badges */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono font-semibold text-cyan-accent uppercase tracking-wider">
                2. Átomos — Badges con Opacidad 10% y Borde
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">DEFAULT</Badge>
                <Badge variant="cyan" dot>CYAN ACCENT</Badge>
                <Badge variant="emerald" dot>TEST PASSED</Badge>
                <Badge variant="amber" dot>STREAK x2</Badge>
                <Badge variant="error" dot>ERROR 404</Badge>
                <Badge variant="mono">VARCHAR(255)</Badge>
              </div>
            </div>

            {/* Molécula: Manejo Riguroso de Errores Inline (Anti-AI Slop) */}
            <div className="flex flex-col gap-3 max-w-md">
              <span className="text-xs font-mono font-semibold text-cyan-accent uppercase tracking-wider">
                3. Molécula — FormField con Error Inline Riguroso (Anti-AI Slop)
              </span>
              <FormField
                label="Correo Electrónico de Registro"
                placeholder="tu_correo@ejemplo.com"
                value={formEmail}
                onChange={(e) => handleValidateEmail(e.target.value)}
                errorMessage={formError}
                helperText="Escribe un correo inválido para probar la validación inline estricta."
                required
              />
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default App;
