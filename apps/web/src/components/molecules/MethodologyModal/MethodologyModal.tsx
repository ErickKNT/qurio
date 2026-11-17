import React, { useEffect } from 'react';
import {
  X,
  BrainCircuit,
  Layers,
  ShieldCheck,
  Database,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { Badge } from '@/components/atoms/Badge/Badge';

export interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCAFFOLDING_LAYERS = [
  {
    step: 'Capa 1',
    title: 'Concepto Abstracto',
    badge: 'Sin spoilers',
    detail:
      'Explicación del modelo relacional con metavariables genéricas (tabla_origen, columna_1) y el orden real de ejecución en PostgreSQL.',
  },
  {
    step: 'Capa 2',
    title: '3 Pistas Progresivas',
    badge: 'Andamiaje',
    detail:
      'Nivel 1 (lógica conceptual) → Nivel 2 (cláusulas y operadores) → Nivel 3 (plantilla estructural con huecos ???).',
  },
  {
    step: 'Capa 3',
    title: 'Validación Semántica Real',
    badge: 'PostgreSQL 16',
    detail:
      'Tu consulta corre en el Sandbox Docker aislado y se contrastan filas, columnas, nulos y escala numérica frente a la salida canónica.',
  },
] as const;

const SEMANTIC_TRAPS = [
  {
    family: '1. Lógica Booleana y NULL',
    example: 'Distinguir IS NULL de = NULL y evitar el colapso de NOT IN con valores nulos mediante NOT EXISTS.',
  },
  {
    family: '2. Cardinalidad en Uniones',
    example: 'Elegir LEFT JOIN frente a INNER JOIN para conservar registros sin actividad y filtrar en ON vs WHERE.',
  },
  {
    family: '3. Agrupación y Colapso',
    example: 'Separar filtros previos por fila (WHERE) de filtros posteriores por grupo (HAVING) sin omitir claves en GROUP BY.',
  },
  {
    family: '4. Lógica Trivalente (3VL)',
    example: 'Comprender COUNT(columna) frente a COUNT(*) y normalizar sumas nulas con COALESCE(SUM(...), 0).',
  },
  {
    family: '5. Orden y Determinismo',
    example: 'Garantizar desempates únicos en ORDER BY y LIMIT para evitar veredictos dependientes del escaneo físico.',
  },
] as const;

const ACADEMIC_REFERENCES = [
  {
    citation: 'Brass, S. & Goldberg, C. (2006) — Semantic errors in SQL queries',
    note: 'Taxonomía de errores lógicos en consultas válidas sintácticamente.',
    url: 'https://doi.org/10.1016/j.jss.2005.07.038',
  },
  {
    citation: 'Taipalus, T. (2020) — The Effects of Query Complexity on SQL Formulation',
    note: 'Aislamiento progresivo de joins, agregaciones y anidación.',
    url: 'https://doi.org/10.1016/j.compedu.2020.104008',
  },
  {
    citation: 'Mitrovic, A. (2003) — Constraint-Based Modeling for SQL Tutoring',
    note: 'Evaluación basada en propiedades del resultado relacional, no texto.',
    url: 'https://doi.org/10.1109/MIS.2003.1200727',
  },
  {
    citation: 'Sweller, J. (1988) & Renkl, A. (2014) — Cognitive Load & Worked Examples',
    note: 'Reducción de carga extraña y transición gradual de ejemplos a autonomía.',
    url: 'https://doi.org/10.1111/cogs.12128',
  },
  {
    citation: 'Wilson, G. (2019) — Teaching Tech Together (Faded Scaffolding)',
    note: 'Diseño instruccional técnico abierto basado en andamiaje decreciente.',
    url: 'https://teachtogether.tech/',
  },
] as const;

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="methodology-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[88vh] rounded-2xl bg-surface border border-border-subtle shadow-2xl flex flex-col overflow-hidden">
        {/* Header fijo */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border-subtle/60 bg-surface-card/40 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="methodology-modal-title"
                className="text-base sm:text-lg font-bold text-content-primary tracking-tight"
              >
                Metodología Pedagógica y Rigor Técnico
              </h2>
              <p className="text-xs text-content-secondary truncate">
                Por qué cada reto, pista y evaluación en Qurio sigue evidencia empírica y ejecución real.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de metodología"
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-dim transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo desplazable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6 text-xs text-content-secondary leading-relaxed">
          {/* Sección 1: Andamiaje Cognitivo en 3 Capas */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Layers className="w-3.5 h-3.5" />
              <span>1. Psicología Cognitiva y Andamiaje Decreciente</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SCAFFOLDING_LAYERS.map((layer) => (
                <div
                  key={layer.step}
                  className="p-3.5 rounded-xl bg-surface-dim/70 border border-border-subtle/50 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-semibold text-cyan-accent uppercase">
                      {layer.step}
                    </span>
                    <Badge variant="mono" size="sm">
                      {layer.badge}
                    </Badge>
                  </div>
                  <h3 className="text-xs font-bold text-content-primary">{layer.title}</h3>
                  <p className="text-[11px] text-content-secondary leading-relaxed">
                    {layer.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Sección 2: Pipeline Técnico de Verificación */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>2. Arquitectura Técnica de Ejecución y Evaluación Semántica</span>
            </div>

            <div className="p-4 rounded-xl bg-surface-dim/70 border border-emerald/25 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-content-primary">
                <span className="px-2.5 py-1 rounded-md bg-surface border border-border-subtle">
                  Editor Monaco
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-content-muted" />
                <span className="px-2.5 py-1 rounded-md bg-surface border border-border-subtle">
                  Inspección AST (SQLGlot)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-content-muted" />
                <span className="px-2.5 py-1 rounded-md bg-emerald/10 border border-emerald/30 text-emerald">
                  PostgreSQL 16 Sandbox (readonly_student • 2,000 ms)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-content-muted" />
                <span className="px-2.5 py-1 rounded-md bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent">
                  Comparador Semántico
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-content-primary">Equivalencia lógica real:</strong> distintas formas válidas de escribir un `JOIN`, alias o filtro son aceptadas si producen exactamente el conjunto esperado.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Database className="w-3.5 h-3.5 text-cyan-accent shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-content-primary">Aislamiento garantizado:</strong> tus consultas jamás tocan la base de datos de producción ni alteran el estado de otros estudiantes.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Sección 3: 5 Familias de Errores Semánticos */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-streak">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>3. Trampas Semánticas Reales que Entrena el Currículum</span>
            </div>

            <div className="flex flex-col gap-2">
              {SEMANTIC_TRAPS.map((trap) => (
                <div
                  key={trap.family}
                  className="p-2.5 px-3.5 rounded-lg bg-surface-dim/50 border border-border-subtle/40 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
                >
                  <span className="font-mono text-[11px] font-semibold text-content-primary sm:w-56 shrink-0">
                    {trap.family}
                  </span>
                  <span className="text-[11px] text-content-secondary">{trap.example}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Sección 4: Referencias Académicas Verificables */}
          <section className="flex flex-col gap-2.5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-content-muted">
              4. Literatura Científica de Respaldo
            </span>

            <div className="grid grid-cols-1 gap-2">
              {ACADEMIC_REFERENCES.map((ref) => (
                <a
                  key={ref.url}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 px-3 rounded-lg bg-surface-dim/40 hover:bg-surface-card border border-border-subtle/40 hover:border-primary/40 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[11px] font-semibold text-content-primary group-hover:text-cyan-accent transition-colors">
                      {ref.citation}
                    </span>
                    <span className="text-[10px] text-content-muted">{ref.note}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-content-muted group-hover:text-cyan-accent shrink-0" />
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Footer fijo */}
        <div className="px-6 py-3.5 border-t border-border-subtle/50 bg-surface-card/30 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] font-mono text-content-muted hidden sm:inline">
            60 retos validados • 10 tablas canónicas • 180 pistas progresivas
          </span>
          <Button variant="primary" size="sm" onClick={onClose} className="ml-auto">
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
};
