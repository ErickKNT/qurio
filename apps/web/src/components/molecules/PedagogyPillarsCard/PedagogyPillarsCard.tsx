import React from 'react';
import { BrainCircuit, Layers, ShieldCheck, ArrowUpRight, BookOpenCheck } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { Badge } from '@/components/atoms/Badge/Badge';
import { cn } from '@/lib/utils';

export interface PedagogyPillarsCardProps {
  onOpenMethodology?: () => void;
  compact?: boolean;
  className?: string;
}

const PILLARS = [
  {
    id: 'cognitive-load',
    title: 'Carga Cognitiva Gradual',
    subtitle: 'Sweller • Taipalus (2020)',
    description:
      'Un solo concepto relacional nuevo por reto, avanzando de proyecciones simples a analítica avanzada sin sobrecarga mental.',
    icon: BrainCircuit,
    accentClass: 'text-cyan-accent border-cyan-accent/25 bg-cyan-accent/10',
  },
  {
    id: 'scaffolding',
    title: 'Andamiaje en 3 Capas',
    subtitle: 'Renkl (2014) • Wilson (2019)',
    description:
      'Teoría abstracta sin spoilers y pistas graduadas (lógica → estructura → plantilla) que entrenan tu criterio antes de revelar código.',
    icon: Layers,
    accentClass: 'text-amber-streak border-amber-streak/25 bg-amber-streak/10',
  },
  {
    id: 'semantic-engine',
    title: 'Motor Real PostgreSQL 16',
    subtitle: 'Mitrovic • Brass & Goldberg',
    description:
      'Evaluación semántica de conjuntos, nulidad, mutaciones DML y catálogos DDL en esquemas efímeros pg_temp con ROLLBACK (máx. 2,000 ms).',
    icon: ShieldCheck,
    accentClass: 'text-emerald border-emerald/25 bg-emerald/10',
  },
] as const;

export const PedagogyPillarsCard: React.FC<PedagogyPillarsCardProps> = ({
  onOpenMethodology,
  compact = false,
  className,
}) => {
  return (
    <section
      aria-label="Fundamento Pedagógico y Técnico"
      className={cn(
        'rounded-2xl bg-surface/65 border border-border-subtle/70 shadow-sm',
        compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle/40">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm">
              Método Basado en Evidencia
            </Badge>
            <span className="text-[11px] font-mono text-content-muted">
              CER + Psicología Cognitiva + PostgreSQL 16
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-content-primary tracking-tight flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-primary shrink-0" />
            <span>Cómo garantiza Qurio que aprendas SQL real</span>
          </h2>
        </div>

        {onOpenMethodology && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenMethodology}
            rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
            className="text-xs shrink-0 whitespace-nowrap border-primary/30 hover:border-cyan-accent/50"
          >
            Ver Metodología y Respaldo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.id}
              className="p-3.5 rounded-xl bg-surface-dim/65 border border-border-subtle/50 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg border flex items-center justify-center shrink-0',
                      pillar.accentClass
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-content-primary truncate">
                    {pillar.title}
                  </h3>
                </div>
              </div>

              <span className="text-[10px] font-mono text-content-muted">
                {pillar.subtitle}
              </span>

              <p className="text-[11px] text-content-secondary leading-relaxed">
                {pillar.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
