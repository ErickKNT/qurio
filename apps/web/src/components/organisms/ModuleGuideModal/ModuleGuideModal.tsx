import React, { useEffect, useState } from 'react';
import {
  X,
  BookOpen,
  Layers,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Code2,
  ArrowRight,
} from 'lucide-react';
import { ModuleGuide } from '@/lib/moduleGuides';
import { formatSqlProse, highlightSqlBlock } from '@/lib/format';
import { SqlTransformDiagram } from '@/components/molecules/SqlTransformDiagram/SqlTransformDiagram';
import { Badge, Button } from '@/components/atoms';

export interface ModuleGuideModalProps {
  guide: ModuleGuide | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ModuleGuideModal: React.FC<ModuleGuideModalProps> = ({
  guide,
  isOpen,
  onClose,
}) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !guide) return null;

  const handleCopyExample = (idx: number, sql: string) => {
    navigator.clipboard?.writeText(sql);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="module-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-canvas/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl bg-surface border border-border-subtle shadow-2xl flex flex-col overflow-hidden">
        {/* Cabecera */}
        <div className="px-5 py-4 bg-surface-dim border-b border-border-subtle flex items-start justify-between gap-4 shrink-0">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cyan" size="sm">
                Módulo {guide.moduleNumber}
              </Badge>
              <span className="text-[11px] font-mono text-content-muted">
                {guide.trackTitle}
              </span>
            </div>
            <h2
              id="module-guide-title"
              className="text-lg sm:text-xl font-bold text-content-primary tracking-tight flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5 text-primary shrink-0" />
              <span>Guía Teórica: {guide.title}</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-card transition-colors shrink-0"
            aria-label="Cerrar guía del módulo"
            title="Cerrar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo desplazable */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* Resumen + Orden lógico */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-content-secondary leading-relaxed">
              {formatSqlProse(guide.summary)}
            </p>
            <div className="p-3 rounded-xl bg-cyan-accent/10 border border-cyan-accent/25 flex items-start gap-2.5 text-xs text-content-primary">
              <Layers className="w-4 h-4 shrink-0 mt-0.5 text-cyan-accent" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-cyan-600 dark:text-cyan-accent">
                  Orden Lógico de Evaluación (PostgreSQL 16)
                </span>
                <span className="leading-relaxed text-content-secondary">
                  {formatSqlProse(guide.executionOrder)}
                </span>
              </div>
            </div>
          </div>

          {/* Diagrama visual de transformación */}
          <SqlTransformDiagram diagram={guide.transformDiagram} />

          {/* Ejemplos resueltos */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-content-primary flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-primary" />
              <span>Ejemplos Resueltos (Referencia Ilustrativa)</span>
            </h3>

            <div className="flex flex-col gap-3">
              {guide.workedExamples.map((ex, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border-subtle/80 bg-surface-card/60 overflow-hidden"
                >
                  <div className="px-3.5 py-2 bg-surface-dim border-b border-border-subtle/50 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-content-primary">
                      {ex.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyExample(idx, ex.sql)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-content-muted hover:text-cyan-accent transition-colors"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald" />
                          <span className="text-emerald">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3.5 bg-canvas text-xs font-mono overflow-x-auto leading-relaxed m-0 [font-variant-ligatures:none]">
                    <code>{highlightSqlBlock(ex.sql)}</code>
                  </pre>
                  <p className="px-3.5 py-2.5 text-xs text-content-secondary leading-relaxed border-t border-border-subtle/40">
                    {formatSqlProse(ex.explanation)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Errores frecuentes */}
          <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-amber-streak/[0.06] border border-amber-streak/25">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-streak flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Errores Frecuentes a Evitar</span>
            </h3>
            <ul className="flex flex-col gap-2 text-xs text-content-secondary leading-relaxed">
              {guide.commonMistakes.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-streak font-bold shrink-0">•</span>
                  <span>{formatSqlProse(m)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Consejo de producción */}
          <div className="p-3.5 rounded-xl bg-emerald/[0.07] border border-emerald/25 flex items-start gap-2.5 text-xs text-content-secondary leading-relaxed">
            <Lightbulb className="w-4 h-4 text-emerald shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-emerald mr-1.5">Consejo de Ingeniería:</span>
              <span>{formatSqlProse(guide.productionTip)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-surface-dim border-t border-border-subtle flex items-center justify-end shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Volver a los Retos
          </Button>
        </div>
      </div>
    </div>
  );
};
