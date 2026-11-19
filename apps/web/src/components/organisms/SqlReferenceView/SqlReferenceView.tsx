import React, { useState, useMemo } from 'react';
import { BookMarked, Copy, Check, Play, BookOpen } from 'lucide-react';
import {
  SQL_REFERENCE_CATEGORIES,
  SqlReferenceCategory,
  searchSqlReference,
} from '@/lib/sqlReference';
import { SearchInput } from '@/components/molecules/SearchInput/SearchInput';
import { RadioTab, Badge, Button } from '@/components/atoms';
import { ModuleGuideModal } from '@/components/organisms/ModuleGuideModal/ModuleGuideModal';
import { getModuleGuide } from '@/lib/moduleGuides';
import { formatSqlProse, highlightSqlBlock } from '@/lib/format';

export interface SqlReferenceViewProps {
  onOpenPlayground?: (query: string) => void;
}

export const SqlReferenceView: React.FC<SqlReferenceViewProps> = ({ onOpenPlayground }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | SqlReferenceCategory>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [guideModuleId, setGuideModuleId] = useState<string | null>(null);

  const filteredTerms = useMemo(
    () => searchSqlReference(search, category),
    [search, category]
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-surface-card border border-border-subtle/50 text-[11px] font-mono text-cyan-accent mb-2">
            <BookMarked className="w-3 h-3" />
            <span>Referencia rápida • PostgreSQL 16</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Glosario y sintaxis SQL
          </h1>
          <p className="text-xs text-content-secondary mt-1 max-w-2xl">
            Consulta rápida de cláusulas, funciones y patrones en PostgreSQL 16. Puedes probar cualquier ejemplo directamente en el Laboratorio SQL.
          </p>
        </div>

        <div className="w-full md:w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Filtrar cláusula o función..."
            shortcut={undefined}
          />
        </div>
      </div>

      {/* Categorías */}
      <div className="flex items-center gap-2 flex-wrap">
        {SQL_REFERENCE_CATEGORIES.map((cat) => (
          <RadioTab
            key={cat.id}
            label={cat.label}
            active={category === cat.id}
            onClick={() => setCategory(cat.id)}
          />
        ))}
        <span className="ml-auto text-xs font-mono text-content-muted">
          {filteredTerms.length} {filteredTerms.length === 1 ? 'término' : 'términos'}
        </span>
      </div>

      {/* Grid de términos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTerms.map((item) => {
          const isModelado = item.category === 'modelado';
          return (
            <article
              key={item.id}
              className="rounded-2xl border border-border-subtle/70 bg-surface/70 p-4 sm:p-5 flex flex-col gap-3 shadow-sm hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <h2 className="text-sm sm:text-base font-bold font-mono text-cyan-accent truncate">
                    {item.term}
                  </h2>
                  <p className="text-xs text-content-secondary leading-relaxed">
                    {formatSqlProse(item.summary)}
                  </p>
                </div>
                <Badge variant={isModelado ? 'amber' : 'mono'} size="sm" className="shrink-0">
                  {isModelado ? 'Solo lectura' : item.category}
                </Badge>
              </div>

              <div className="rounded-xl bg-surface-dim border border-border-subtle/60 p-2.5 text-[11px] font-mono overflow-x-auto [font-variant-ligatures:none]">
                <code>{highlightSqlBlock(item.syntax)}</code>
              </div>

              <div className="rounded-xl bg-canvas border border-border-subtle/50 overflow-hidden">
                <div className="px-3 py-1.5 bg-surface/60 border-b border-border-subtle/40 flex items-center justify-between text-[10px] font-mono text-content-muted">
                  <span>Ejemplo PostgreSQL 16</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.example)}
                    className="inline-flex items-center gap-1 hover:text-content-primary transition-colors"
                  >
                    {copiedId === item.id ? (
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
                <pre className="p-3 text-[11px] font-mono overflow-x-auto m-0 leading-relaxed [font-variant-ligatures:none]">
                  <code>{highlightSqlBlock(item.example)}</code>
                </pre>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                {item.relatedModuleId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGuideModuleId(item.relatedModuleId || null)}
                    leftIcon={<BookOpen className="w-3.5 h-3.5 text-primary" />}
                    className="text-xs"
                  >
                    Guía del módulo
                  </Button>
                )}
                {!isModelado && onOpenPlayground && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenPlayground(item.example)}
                    leftIcon={<Play className="w-3 h-3 text-cyan-accent fill-cyan-accent" />}
                    className="text-xs"
                  >
                    Probar en laboratorio
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {filteredTerms.length === 0 && (
        <div className="p-10 rounded-2xl border border-border-subtle/60 bg-surface/40 text-center font-mono text-xs text-content-muted">
          No se encontraron términos que coincidan con "{search}".
        </div>
      )}

      <ModuleGuideModal
        guide={guideModuleId ? getModuleGuide(guideModuleId) || null : null}
        isOpen={Boolean(guideModuleId)}
        onClose={() => setGuideModuleId(null)}
      />
    </div>
  );
};
