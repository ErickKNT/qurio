import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, Code, Table } from 'lucide-react';
import { RadioTab, SplitResizeHandle } from '@/components/atoms';
import { useResizableSplit } from '@/hooks/useResizableSplit';

const SPLIT_STORAGE_KEY = 'qurio_workspace_results_pct';

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
  const {
    splitContainerRef,
    isDraggingSplit,
    effectiveResultsPct,
    handleMouseDownSplit,
    handleResetSplit,
  } = useResizableSplit({
    storageKey: SPLIT_STORAGE_KEY,
    defaultPct: 48,
    minPct: 28,
    maxPct: 78,
    expandedPct: 76,
    isResultsExpanded,
    onToggleResultsExpanded,
  });

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
          label="Instrucciones"
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
          <SplitResizeHandle
            isDragging={isDraggingSplit}
            onMouseDown={handleMouseDownSplit}
            onDoubleClick={handleResetSplit}
          />

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
