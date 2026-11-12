import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, Code, Table } from 'lucide-react';
import { RadioTab } from '@/components/atoms/RadioTab/RadioTab';

const SPLIT_STORAGE_KEY = 'qurio_workspace_results_pct';
const DEFAULT_RESULTS_PCT = 48;
const MIN_RESULTS_PCT = 28;
const MAX_RESULTS_PCT = 78;
const EXPANDED_RESULTS_PCT = 76;

export interface WorkspaceLayoutProps {
  sidebarContent: React.ReactNode;
  editorContent: React.ReactNode;
  resultsContent: React.ReactNode;
  headerBar?: React.ReactNode;
  statusBar?: React.ReactNode;
  isResultsExpanded?: boolean;
  onToggleResultsExpanded?: (expanded: boolean) => void;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  sidebarContent,
  editorContent,
  resultsContent,
  headerBar,
  statusBar,
  isResultsExpanded = false,
  onToggleResultsExpanded,
}) => {
  const [mobileTab, setMobileTab] = useState<'consigna' | 'editor' | 'resultados'>('editor');
  const [resultsPct, setResultsPct] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_RESULTS_PCT;
    const saved = Number(window.localStorage.getItem(SPLIT_STORAGE_KEY));
    if (!Number.isNaN(saved) && saved >= MIN_RESULTS_PCT && saved <= MAX_RESULTS_PCT) {
      return saved;
    }
    return DEFAULT_RESULTS_PCT;
  });
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseDownSplit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (isResultsExpanded && onToggleResultsExpanded) {
      onToggleResultsExpanded(false);
    }
    setIsDraggingSplit(true);
  }, [isResultsExpanded, onToggleResultsExpanded]);

  useEffect(() => {
    if (!isDraggingSplit) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = splitContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (rect.height <= 0) return;
      const fromBottom = rect.bottom - e.clientY;
      const pct = Math.round((fromBottom / rect.height) * 100);
      const clamped = Math.max(MIN_RESULTS_PCT, Math.min(MAX_RESULTS_PCT, pct));
      setResultsPct(clamped);
    };

    const handleMouseUp = () => {
      setIsDraggingSplit(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SPLIT_STORAGE_KEY, String(resultsPct));
    }
  }, [resultsPct]);

  const effectiveResultsPct = isResultsExpanded ? EXPANDED_RESULTS_PCT : resultsPct;

  return (
    <div className="h-screen w-full flex flex-col bg-canvas text-content-primary overflow-hidden">
      {/* Top Header / Breadcrumb Bar */}
      {headerBar && (
        <div className="h-12 border-b border-border-subtle bg-surface/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-30">
          {headerBar}
        </div>
      )}

      {/* Mobile Tab Switcher (Visible only on < lg screens per Anti-AI Slop rule 1.1) */}
      <div className="lg:hidden flex items-center justify-around border-b border-border-subtle bg-surface-dim p-1.5 shrink-0">
        <RadioTab
          label="Consigna"
          icon={<BookOpen className="w-3.5 h-3.5" />}
          active={mobileTab === 'consigna'}
          onClick={() => setMobileTab('consigna')}
        />
        <RadioTab
          label="Editor SQL"
          icon={<Code className="w-3.5 h-3.5" />}
          active={mobileTab === 'editor'}
          onClick={() => setMobileTab('editor')}
        />
        <RadioTab
          label="Resultados"
          icon={<Table className="w-3.5 h-3.5" />}
          active={mobileTab === 'resultados'}
          onClick={() => setMobileTab('resultados')}
        />
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Split Model: Left 30% Consigna & Schema */}
        <aside
          className={cn(
            'w-full lg:w-[32%] xl:w-[28%] border-r border-border-subtle bg-surface-dim flex flex-col overflow-y-auto shrink-0',
            mobileTab !== 'consigna' && 'hidden lg:flex'
          )}
        >
          {sidebarContent}
        </aside>

        {/* Desktop Split Model: Right 70% Editor & Data Grid */}
        <div
          ref={splitContainerRef}
          style={{ '--results-split': `${effectiveResultsPct}%` } as React.CSSProperties}
          className={cn(
            'flex-1 flex flex-col overflow-hidden bg-canvas min-w-0',
            isDraggingSplit && 'select-none',
            mobileTab === 'consigna' && 'hidden lg:flex'
          )}
        >
          {/* Editor Area (Top) */}
          <div
            className={cn(
              'flex-1 min-h-[140px] flex flex-col overflow-hidden',
              mobileTab === 'resultados' && 'hidden lg:flex'
            )}
          >
            {editorContent}
          </div>

          {/* Divisor arrastrable en escritorio (doble clic restablece proporción) */}
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label="Redimensionar panel de resultados"
            title="Arrastra para redimensionar · Doble clic para restablecer"
            onMouseDown={handleMouseDownSplit}
            onDoubleClick={() => {
              setResultsPct(DEFAULT_RESULTS_PCT);
              onToggleResultsExpanded?.(false);
            }}
            className={cn(
              'hidden lg:flex h-2 w-full shrink-0 cursor-row-resize items-center justify-center border-y border-border-subtle bg-surface-dim/80 transition-colors hover:bg-primary/15 group',
              isDraggingSplit && 'bg-primary/25 border-primary/50'
            )}
          >
            <span
              className={cn(
                'h-0.5 w-10 rounded-full bg-border-subtle group-hover:bg-primary transition-colors',
                isDraggingSplit && 'bg-primary w-14'
              )}
            />
          </div>

          {/* Results Grid Area (Bottom) */}
          <div
            className={cn(
              'flex-1 lg:flex-none lg:h-[var(--results-split)] min-h-[180px] bg-surface flex flex-col overflow-hidden transition-[height] duration-150 ease-out',
              isDraggingSplit && 'transition-none',
              mobileTab === 'editor' && 'hidden lg:flex'
            )}
          >
            {resultsContent}
          </div>
        </div>
      </div>

      {/* Optional Persistent Bottom Status Bar */}
      {statusBar && (
        <div className="h-9 border-t border-border-subtle bg-surface-dim px-4 flex items-center justify-between text-xs font-mono text-content-muted shrink-0 z-30">
          {statusBar}
        </div>
      )}
    </div>
  );
};
