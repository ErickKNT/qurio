import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  Terminal,
  BookOpen,
  Table as TableIcon,
  Code2,
  BookMarked,
  CornerDownLeft,
} from 'lucide-react';
import { Exercise, TableSchemaInfo } from '@/types';
import { MODULE_GUIDES, ModuleGuide } from '@/lib/moduleGuides';
import { SQL_REFERENCE_TERMS, SqlReferenceTerm } from '@/lib/sqlReference';
import { cn } from '@/lib/utils';

export type PaletteItem =
  | { kind: 'exercise'; id: string; title: string; subtitle: string; exercise: Exercise }
  | { kind: 'guide'; id: string; title: string; subtitle: string; guide: ModuleGuide }
  | { kind: 'table'; id: string; title: string; subtitle: string; table: TableSchemaInfo }
  | { kind: 'reference'; id: string; title: string; subtitle: string; term: SqlReferenceTerm };

export interface CommandPaletteModalProps {
  isOpen: boolean;
  initialQuery?: string;
  onClose: () => void;
  exercises: Exercise[];
  tables: TableSchemaInfo[];
  onSelectExercise: (ex: Exercise) => void;
  onSelectGuide: (guide: ModuleGuide) => void;
  onSelectTable: (table: TableSchemaInfo) => void;
  onSelectReference: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  initialQuery = '',
  onClose,
  exercises,
  tables,
  onSelectExercise,
  onSelectGuide,
  onSelectTable,
  onSelectReference,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen, initialQuery]);

  const results = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();

    const matchedExercises: PaletteItem[] = exercises
      .filter(
        (ex) =>
          !q ||
          ex.title.toLowerCase().includes(q) ||
          ex.prompt.toLowerCase().includes(q) ||
          ex.difficulty.toLowerCase().includes(q)
      )
      .slice(0, q ? 6 : 4)
      .map((ex) => ({
        kind: 'exercise',
        id: `ex-${ex.id}`,
        title: `#${ex.sort_order} ${ex.title}`,
        subtitle: `${ex.difficulty} • +${ex.xp_reward} XP`,
        exercise: ex,
      }));

    const matchedGuides: PaletteItem[] = MODULE_GUIDES.filter(
      (g) =>
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q)
    )
      .slice(0, q ? 4 : 3)
      .map((g) => ({
        kind: 'guide',
        id: `guide-${g.moduleId}`,
        title: `Guía Módulo ${g.moduleNumber}: ${g.title}`,
        subtitle: g.trackTitle,
        guide: g,
      }));

    const matchedTables: PaletteItem[] = tables
      .filter(
        (t) =>
          !q ||
          t.tableName.toLowerCase().includes(q) ||
          t.columns.some((c) => c.name.toLowerCase().includes(q))
      )
      .slice(0, q ? 4 : 3)
      .map((t) => ({
        kind: 'table',
        id: `tbl-${t.tableName}`,
        title: `Tabla: ${t.tableName}`,
        subtitle: `${t.rowCount} filas · ${t.columns.length} columnas`,
        table: t,
      }));

    const matchedTerms: PaletteItem[] = SQL_REFERENCE_TERMS.filter(
      (term) =>
        !q ||
        term.term.toLowerCase().includes(q) ||
        term.summary.toLowerCase().includes(q)
    )
      .slice(0, q ? 4 : 2)
      .map((term) => ({
        kind: 'reference',
        id: `ref-${term.id}`,
        title: `Sintaxis: ${term.term}`,
        subtitle: term.summary,
        term,
      }));

    return [...matchedExercises, ...matchedGuides, ...matchedTables, ...matchedTerms];
  }, [query, exercises, tables]);

  const handleSelectItem = (item: PaletteItem) => {
    onClose();
    if (item.kind === 'exercise') onSelectExercise(item.exercise);
    else if (item.kind === 'guide') onSelectGuide(item.guide);
    else if (item.kind === 'table') onSelectTable(item.table);
    else onSelectReference();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (results.length ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (results.length ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Enter' && results[activeIndex]) {
        e.preventDefault();
        handleSelectItem(results[activeIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, activeIndex, onClose]);

  if (!isOpen) return null;

  const iconForKind = (kind: PaletteItem['kind']) => {
    switch (kind) {
      case 'exercise':
        return <Code2 className="w-4 h-4 text-emerald shrink-0" />;
      case 'guide':
        return <BookOpen className="w-4 h-4 text-primary shrink-0" />;
      case 'table':
        return <TableIcon className="w-4 h-4 text-cyan-accent shrink-0" />;
      case 'reference':
        return <BookMarked className="w-4 h-4 text-amber-streak shrink-0" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Búsqueda rápida de Qurio"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 bg-canvas/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-2xl bg-surface border border-border-subtle shadow-2xl overflow-hidden flex flex-col">
        {/* Input */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border-subtle bg-surface-dim">
          <Search className="w-4 h-4 text-cyan-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Buscar retos, guías de módulos, tablas o sintaxis SQL..."
            className="flex-1 bg-transparent text-sm text-content-primary placeholder:text-content-muted focus:outline-none font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-content-muted hover:text-content-primary"
              title="Limpiar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-subtle text-[10px] font-mono text-content-muted">
            ESC
          </kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto p-2 flex flex-col gap-1">
          {results.map((item, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleSelectItem(item)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                  isSelected
                    ? 'bg-primary/15 border border-primary/30 text-content-primary'
                    : 'border border-transparent hover:bg-surface-card/60 text-content-secondary'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {iconForKind(item.kind)}
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-content-primary truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-content-muted truncate font-mono">
                      {item.subtitle}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <CornerDownLeft className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
              </button>
            );
          })}

          {results.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center gap-2 text-content-muted">
              <Terminal className="w-6 h-6 opacity-60" />
              <span className="text-xs font-mono">
                Sin coincidencias para "{query}". Prueba con JOIN, COALESCE, pedidos o CTE.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
