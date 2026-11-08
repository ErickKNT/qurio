import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Zap,
  Award,
  Database,
  Play,
  CheckCircle2,
  Code2,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/templates';
import { Button, Badge, KbdShortcut, RadioTab } from '@/components/atoms';
import { MetricTile, FormField, StreakPill } from '@/components/molecules';
import { useAuth } from '@/hooks/useAuth';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('dashboard');
  const [activeTab, setActiveTab] = useState<'overview' | 'components'>('overview');
  const [formEmail, setFormEmail] = useState('');
  const [formError, setFormError] = useState('');
  const { profile } = useAuth();

  // Actualización dinámica del título de la pestaña (Anti-AI Slop Regla 1.1)
  useEffect(() => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard | Qurio',
      tracks: 'Rutas de Aprendizaje | Qurio',
      playground: 'SQL Playground | Qurio',
      achievements: 'Logros & Rangos | Qurio',
      profile: 'Mi Perfil | Qurio',
    };
    document.title = titles[currentPath] || 'Qurio | Aprende SQL. Piensa en queries.';
  }, [currentPath]);

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

  return (
    <DashboardLayout
      currentPath={currentPath}
      onNavigate={setCurrentPath}
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
                onClick={() => setCurrentPath('playground')}
              >
                Abrir Playground
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
                  Clientes sin Compras Registradas (LEFT JOIN & IS NULL)
                </h3>

                <p className="text-xs text-content-secondary leading-relaxed">
                  El equipo de marketing necesita reactivar a usuarios registrados que nunca han realizado un pedido en la plataforma. Escribe una consulta que devuelva el ID del cliente, su nombre y su apellido para todos los clientes inactivos.
                </p>

                <div className="mt-2 p-3 rounded-lg bg-canvas border border-border-subtle font-mono text-xs text-cyan-accent flex items-center justify-between">
                  <code>SELECT c.cliente_id, c.nombre, c.apellido FROM clientes c...</code>
                  <KbdShortcut keys={['⌘', '↵']} />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-streak">
                  <Zap className="w-4 h-4 fill-amber-streak" />
                  <span>Recompensa: +50 XP</span>
                </div>

                <Button variant="primary" size="sm" onClick={() => setCurrentPath('playground')}>
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
