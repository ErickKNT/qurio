import React, { useState, useCallback, useEffect } from 'react';
import {
  Terminal,
  Database,
  Sparkles,
  Table as TableIcon,
  ShieldCheck,
  Clock,
  Code,
  Plus,
  X,
  History,
  GitFork,
} from 'lucide-react';
import { TableSchemaInfo, ExecutionResult, QueryHistoryItem } from '@/types';
import { MonacoEditorPanel } from '@/components/organisms/MonacoEditorPanel/MonacoEditorPanel';
import { DataGridResults } from '@/components/organisms/DataGridResults/DataGridResults';
import { ErDiagramModal } from '@/components/organisms/ErDiagramModal/ErDiagramModal';
import { SchemaTableItem } from '@/components/molecules/SchemaTableItem/SchemaTableItem';
import { Badge, RadioTab, SplitResizeHandle } from '@/components/atoms';
import { useResizableSplit } from '@/hooks/useResizableSplit';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export interface SqlPlaygroundViewProps {
  tables: TableSchemaInfo[];
  initialQuery?: string;
  className?: string;
}

interface PlaygroundTab {
  id: string;
  title: string;
  query: string;
}

const PLAYGROUND_SPLIT_STORAGE_KEY = 'qurio_playground_results_pct';
const TABS_STORAGE_KEY = 'qurio_playground_tabs_v1';
const MAX_TABS = 6;
const DEFAULT_SQL =
  '-- Laboratorio SQL — Qurio\n-- Escribe cualquier consulta libre contra la base de datos de práctica\nSELECT cliente_id, nombre, apellido, email, ciudad\nFROM clientes\nLIMIT 10;';

function loadInitialTabs(initialQuery?: string): { tabs: PlaygroundTab[]; activeId: string } {
  const defaultTab: PlaygroundTab = {
    id: 'tab-1',
    title: 'Query 1',
    query: initialQuery || DEFAULT_SQL,
  };
  if (typeof window === 'undefined') {
    return { tabs: [defaultTab], activeId: defaultTab.id };
  }
  try {
    const raw = window.localStorage.getItem(TABS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PlaygroundTab[];
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((t) => t.id && t.title)) {
        if (initialQuery) {
          const newId = `tab-${Date.now()}`;
          const next = [...parsed.slice(0, MAX_TABS - 1), { id: newId, title: 'Consulta cargada', query: initialQuery }];
          return { tabs: next, activeId: newId };
        }
        return { tabs: parsed.slice(0, MAX_TABS), activeId: parsed[0].id };
      }
    }
  } catch {
    // fallback limpio
  }
  return { tabs: [defaultTab], activeId: defaultTab.id };
}

const STARTER_QUERIES = [
  {
    name: 'Top 5 Clientes Recientes',
    description: 'Proyección ordenada por fecha de registro',
    query: 'SELECT cliente_id, nombre, apellido, ciudad, fecha_registro\nFROM clientes\nORDER BY fecha_registro DESC\nLIMIT 5;',
  },
  {
    name: 'Stock y Valor de Inventario',
    description: 'Cálculo de precio * stock por producto',
    query: 'SELECT nombre_producto, precio, stock, (precio * stock) AS valor_inventario\nFROM productos\nORDER BY valor_inventario DESC\nLIMIT 10;',
  },
  {
    name: 'Pedidos por Estado',
    description: 'Agrupación y sumatoria de totales de venta',
    query: 'SELECT estado_pedido, COUNT(*) AS total_pedidos, SUM(total) AS monto_total\nFROM pedidos\nGROUP BY estado_pedido;',
  },
  {
    name: 'Clientes sin Compras (LEFT JOIN)',
    description: 'Detección de registros huérfanos con IS NULL',
    query: 'SELECT c.cliente_id, c.nombre, c.apellido, c.email\nFROM clientes c\nLEFT JOIN pedidos p ON c.cliente_id = p.cliente_id\nWHERE p.pedido_id IS NULL;',
  },
];

export const SqlPlaygroundView: React.FC<SqlPlaygroundViewProps> = ({
  tables,
  initialQuery,
}) => {
  const [isResultsExpanded, setIsResultsExpanded] = useState(false);
  const {
    splitContainerRef,
    isDraggingSplit,
    effectiveResultsPct,
    handleMouseDownSplit,
    handleResetSplit,
  } = useResizableSplit({
    storageKey: PLAYGROUND_SPLIT_STORAGE_KEY,
    defaultPct: 54,
    minPct: 24,
    maxPct: 78,
    expandedPct: 76,
    isResultsExpanded,
    onToggleResultsExpanded: setIsResultsExpanded,
  });
  const [{ tabs: initialTabs, activeId: initialActiveId }] = useState(() => loadInitialTabs(initialQuery));
  const [tabs, setTabs] = useState<PlaygroundTab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(initialActiveId);
  const [resultsByTab, setResultsByTab] = useState<Record<string, ExecutionResult | null>>({});
  const [historyItems, setHistoryItems] = useState<QueryHistoryItem[]>(() => api.getQueryHistory());

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const query = activeTab?.query || '';
  const executionResult = resultsByTab[activeTab?.id] ?? null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
      } catch {
        // Ignorar si localStorage no está disponible
      }
    }
  }, [tabs]);

  useEffect(() => {
    if (!initialQuery) return;
    setTabs((prev) => {
      const existing = prev.find((t) => t.query.trim() === initialQuery.trim());
      if (existing) {
        setActiveTabId(existing.id);
        return prev;
      }
      const newTab: PlaygroundTab = {
        id: `tab-${Date.now()}`,
        title: `Query ${prev.length + 1}`,
        query: initialQuery,
      };
      const next = prev.length >= MAX_TABS ? [...prev.slice(1), newTab] : [...prev, newTab];
      setActiveTabId(newTab.id);
      return next;
    });
  }, [initialQuery]);

  const [sidebarTab, setSidebarTab] = useState<'tables' | 'templates' | 'history'>('tables');
  const [mobileTab, setMobileTab] = useState<'tables' | 'editor' | 'results'>('editor');
  const [filterTable, setFilterTable] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [erDiagramOpen, setErDiagramOpen] = useState(false);

  const filteredTables = tables.filter((t) =>
    t.tableName.toLowerCase().includes(filterTable.toLowerCase())
  );

  const updateActiveQuery = useCallback(
    (nextQuery: string) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTab.id ? { ...t, query: nextQuery } : t))
      );
    },
    [activeTab.id]
  );

  const handleSelectQuery = useCallback(
    (nextQuery: string) => {
      updateActiveQuery(nextQuery);
      setMobileTab('editor');
    },
    [updateActiveQuery]
  );

  const handleAddTab = useCallback(() => {
    if (tabs.length >= MAX_TABS) return;
    const nextNum = tabs.length + 1;
    const newTab: PlaygroundTab = {
      id: `tab-${Date.now()}`,
      title: `Query ${nextNum}`,
      query: '-- Nueva consulta SQL\nSELECT ',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setMobileTab('editor');
  }, [tabs.length]);

  const handleCloseTab = useCallback(
    (tabId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (tabs.length <= 1) return;
      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === tabId);
        const filtered = prev.filter((t) => t.id !== tabId);
        if (activeTabId === tabId && filtered.length > 0) {
          const fallback = filtered[Math.max(0, idx - 1)] || filtered[0];
          setActiveTabId(fallback.id);
        }
        return filtered;
      });
    },
    [tabs.length, activeTabId]
  );

  const runSqlForTab = useCallback(
    async (tabId: string, sqlToRun: string) => {
      if (!sqlToRun.trim() || isExecuting) return;
      setIsExecuting(true);
      try {
        const res = await api.executePlayground(sqlToRun);
        setResultsByTab((prev) => ({ ...prev, [tabId]: res }));
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          setMobileTab('results');
        }

        api.saveQueryHistory({
          id: `play-${Date.now()}`,
          query: sqlToRun.trim(),
          executed_at: 'Hace un momento',
          status: res.status,
          execution_time_ms: res.execution_time_ms,
          row_count: res.row_count,
        });
        setHistoryItems(api.getQueryHistory());
      } catch (err: any) {
        setResultsByTab((prev) => ({
          ...prev,
          [tabId]: {
            status: 'ERROR',
            execution_time_ms: 0,
            row_count: 0,
            columns: [],
            rows: [],
            error: err.message || 'Error inesperado al ejecutar consulta en Playground.',
          },
        }));
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          setMobileTab('results');
        }
      } finally {
        setIsExecuting(false);
      }
    },
    [isExecuting]
  );

  const handleExecute = useCallback(
    (activeSql?: string) => {
      const targetSql = activeSql && activeSql.trim() ? activeSql : query;
      return runSqlForTab(activeTab.id, targetSql);
    },
    [runSqlForTab, activeTab.id, query]
  );

  const handlePreviewTable = useCallback(
    (tableName: string, previewSql: string) => {
      const tabTitle = `tabla: ${tableName}`;
      const existing = tabs.find((t) => t.title === tabTitle);
      if (existing) {
        setActiveTabId(existing.id);
        void runSqlForTab(existing.id, previewSql);
        return;
      }
      const newTab: PlaygroundTab = {
        id: `tab-${Date.now()}`,
        title: tabTitle,
        query: previewSql,
      };
      setTabs((prev) => (prev.length >= MAX_TABS ? [...prev.slice(1), newTab] : [...prev, newTab]));
      setActiveTabId(newTab.id);
      void runSqlForTab(newTab.id, previewSql);
    },
    [tabs, runSqlForTab]
  );

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden select-none">
      {/* 1. Barra de Estado Superior Compacta (Sin botones duplicados) */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-surface/50 border border-border-subtle/40 shrink-0 font-mono text-xs">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 text-content-primary font-bold">
            <Terminal className="w-4 h-4 text-cyan-accent shrink-0" />
            <span className="hidden sm:inline">Laboratorio SQL</span>
          </div>

          <span className="text-border-subtle">•</span>

          <div className="flex items-center gap-1.5 text-content-secondary truncate text-[11px]">
            <Database className="w-3.5 h-3.5 text-cyan-accent shrink-0" />
            <span className="font-semibold text-primary dark:text-primary-light">Base de Práctica (Tienda)</span>
            <span className="text-content-muted text-[10px] font-mono px-1 py-0.2 rounded bg-surface-dim border border-border-subtle/40">public</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 text-[11px]">
          <button
            type="button"
            onClick={() => setErDiagramOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card hover:bg-surface-hover border border-border-subtle hover:border-cyan-accent/50 text-content-primary hover:text-cyan-accent transition-colors text-[11px] font-mono font-medium"
            title="Abrir Diagrama Entidad-Relación interactivo"
          >
            <GitFork className="w-3.5 h-3.5 text-cyan-accent shrink-0" />
            <span className="hidden sm:inline">Diagrama ER</span>
          </button>

          <span className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald/10 text-emerald-600 dark:text-emerald border border-emerald/20 text-[10px] font-mono font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald shrink-0" />
            <span>solo lectura</span>
          </span>

          <Badge variant="emerald" dot size="sm">
            PostgreSQL 16
          </Badge>

          {executionResult && executionResult.execution_time_ms > 0 && (
            <span className="hidden sm:flex items-center gap-1 text-content-muted text-[10px]">
              <Clock className="w-3 h-3" />
              {executionResult.execution_time_ms.toFixed(1)}ms
            </span>
          )}
        </div>
      </div>

      {/* Mobile Tab Switcher (< lg) */}
      <div className="lg:hidden flex items-center justify-around rounded-xl border border-border-subtle bg-surface-dim p-1 shrink-0 gap-1">
        <RadioTab
          label="Tablas"
          badge={tables.length}
          icon={<TableIcon className="w-3.5 h-3.5" />}
          active={mobileTab === 'tables'}
          onClick={() => setMobileTab('tables')}
          className="flex-1 justify-center px-2"
        />
        <RadioTab
          label="Editor SQL"
          icon={<Code className="w-3.5 h-3.5" />}
          active={mobileTab === 'editor'}
          onClick={() => setMobileTab('editor')}
          className="flex-1 justify-center px-2"
        />
        <RadioTab
          label="Resultados"
          badge={executionResult ? executionResult.row_count : undefined}
          icon={<Terminal className="w-3.5 h-3.5" />}
          active={mobileTab === 'results'}
          onClick={() => setMobileTab('results')}
          className="flex-1 justify-center px-2"
        />
      </div>

      {/* 2. Workspace Principal (Split: Explorador Lateral + Editor/DataGrid) */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3.5 flex-1 min-h-0 overflow-hidden">
        {/* Panel Lateral Izquierdo: Tablas & Plantillas */}
        <div
          className={cn(
            'lg:col-span-3 flex-col h-full min-h-0 rounded-xl bg-surface/40 border border-border-subtle/50 overflow-hidden p-3 gap-2.5',
            mobileTab === 'tables' ? 'flex flex-1 lg:flex' : 'hidden lg:flex'
          )}
        >
          {/* Selector de Pestañas del Panel */}
          <div className="flex items-center rounded-lg bg-surface-dim/80 p-0.5 border border-border-subtle/40 shrink-0 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setSidebarTab('tables')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-md transition-colors',
                sidebarTab === 'tables'
                  ? 'bg-surface text-cyan-accent font-semibold shadow-sm'
                  : 'text-content-muted hover:text-content-primary'
              )}
            >
              <TableIcon className="w-3 h-3 shrink-0" />
              <span>Tablas ({tables.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('templates')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-md transition-colors',
                sidebarTab === 'templates'
                  ? 'bg-surface text-amber-streak font-semibold shadow-sm'
                  : 'text-content-muted hover:text-content-primary'
              )}
            >
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>Plantillas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setHistoryItems(api.getQueryHistory());
                setSidebarTab('history');
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-md transition-colors',
                sidebarTab === 'history'
                  ? 'bg-surface text-primary font-semibold shadow-sm'
                  : 'text-content-muted hover:text-content-primary'
              )}
            >
              <History className="w-3 h-3 shrink-0" />
              <span>Historial</span>
            </button>
          </div>

          {/* Contenido según pestaña activa */}
          {sidebarTab === 'tables' ? (
            <div className="flex flex-col flex-1 min-h-0 gap-2">
              <input
                type="text"
                placeholder="Filtrar tablas..."
                value={filterTable}
                onChange={(e) => setFilterTable(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface-dim border border-border-subtle/50 text-xs font-mono text-content-primary placeholder:text-content-muted focus:outline-none focus:border-cyan-accent/60 transition-colors shrink-0"
              />

              <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 space-y-1.5">
                {filteredTables.map((tbl) => (
                  <SchemaTableItem
                    key={tbl.tableName}
                    table={tbl}
                    onInsertQuery={(templateQuery) => handleSelectQuery(templateQuery)}
                    onPreviewTable={handlePreviewTable}
                  />
                ))}
                {filteredTables.length === 0 && (
                  <div className="p-4 text-center text-xs font-mono text-content-muted">
                    No se encontraron tablas.
                  </div>
                )}
              </div>
            </div>
          ) : sidebarTab === 'templates' ? (
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
              <span className="text-[11px] font-mono text-content-muted uppercase tracking-wider">
                Consultas de Ejemplo
              </span>
              {STARTER_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectQuery(sq.query)}
                  className="flex flex-col items-start p-2.5 rounded-lg bg-surface/50 hover:bg-surface/80 border border-border-subtle/40 hover:border-cyan-accent/40 text-left transition-colors group"
                >
                  <span className="text-xs font-medium text-content-primary group-hover:text-cyan-accent">
                    {sq.name}
                  </span>
                  <span className="text-[10px] text-content-muted mt-0.5">
                    {sq.description}
                  </span>
                  <span className="text-[10px] font-mono text-content-muted/80 line-clamp-1 mt-1 font-mono">
                    {sq.query.replace(/\n/g, ' ')}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
              <span className="text-[11px] font-mono text-content-muted uppercase tracking-wider">
                Ejecuciones Recientes
              </span>
              {historyItems.slice(0, 15).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectQuery(item.query)}
                  className="flex flex-col items-start p-2.5 rounded-lg bg-surface/50 hover:bg-surface/80 border border-border-subtle/40 hover:border-primary/40 text-left transition-colors group"
                >
                  <div className="flex items-center justify-between w-full text-[10px] font-mono mb-1">
                    <span className={item.status === 'SUCCESS' ? 'text-emerald' : 'text-error'}>
                      {item.status}
                    </span>
                    <span className="text-content-muted">
                      {item.execution_time_ms.toFixed(1)}ms{item.row_count !== undefined ? ` • ${item.row_count}f` : ''}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-content-primary group-hover:text-cyan-accent line-clamp-2 break-all">
                    {item.query}
                  </span>
                </button>
              ))}
              {historyItems.length === 0 && (
                <div className="p-4 text-center text-xs font-mono text-content-muted">
                  Aún no hay consultas ejecutadas.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel Derecho: Editor Monaco + Resultados de DataGrid */}
        <div
          ref={splitContainerRef}
          style={{ '--playground-results-split': `${effectiveResultsPct}%` } as React.CSSProperties}
          className={cn(
            'lg:col-span-9 flex-col gap-3 lg:gap-0 h-full min-h-0 overflow-hidden',
            isDraggingSplit && 'select-none',
            mobileTab === 'tables' ? 'hidden lg:flex' : 'flex flex-1 lg:flex'
          )}
        >
          {/* Barra de pestañas multi-consulta */}
          <div
            className={cn(
              'flex items-center gap-1 px-1 overflow-x-auto shrink-0 font-mono text-[11px]',
              mobileTab === 'results' ? 'hidden lg:flex' : 'flex'
            )}
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={cn(
                    'group flex items-center gap-1.5 px-2.5 py-1 rounded-t-lg border border-b-0 transition-colors shrink-0 max-w-[160px]',
                    isActive
                      ? 'bg-surface-dim border-border-subtle text-cyan-accent font-semibold'
                      : 'bg-surface/30 border-transparent text-content-muted hover:text-content-primary hover:bg-surface/60'
                  )}
                >
                  <span className="truncate">{tab.title}</span>
                  {tabs.length > 1 && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleCloseTab(tab.id, e)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleCloseTab(tab.id, e as any);
                      }}
                      title={`Cerrar ${tab.title}`}
                      className="p-0.5 rounded hover:bg-surface-card text-content-muted hover:text-error opacity-70 group-hover:opacity-100"
                    >
                      <X className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
            {tabs.length < MAX_TABS && (
              <button
                type="button"
                onClick={handleAddTab}
                title="Nueva pestaña de consulta"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-content-muted hover:text-cyan-accent hover:bg-surface-card/60 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nueva</span>
              </button>
            )}
          </div>

          {/* Arriba: Editor Monaco */}
          <div
            className={cn(
              'rounded-xl lg:rounded-b-none overflow-hidden border border-border-subtle/70 lg:flex-1 min-h-0 lg:min-h-[140px]',
              mobileTab === 'results' ? 'hidden lg:block' : 'flex-1'
            )}
          >
            <MonacoEditorPanel
              value={query}
              onChange={updateActiveQuery}
              onExecute={handleExecute}
              onReset={() => updateActiveQuery('')}
              isLoading={isExecuting}
              isSubmitMode={false}
              executeActiveStatement={true}
              hideEngineBadge={true}
              tabLabel={activeTab.title}
              className="h-full"
            />
          </div>

          {/* Divisor arrastrable en escritorio (doble clic restablece proporción) */}
          <SplitResizeHandle
            isDragging={isDraggingSplit}
            onMouseDown={handleMouseDownSplit}
            onDoubleClick={handleResetSplit}
          />

          {/* Abajo: DataGrid de Resultados (isPlayground={true} elimina felicitaciones artificiales) */}
          <div
            className={cn(
              'flex-1 lg:flex-none lg:h-[var(--playground-results-split)] min-h-0 lg:min-h-[180px] overflow-hidden transition-[height] duration-150 ease-out',
              isDraggingSplit && 'transition-none',
              mobileTab === 'editor' ? 'hidden lg:block' : 'block'
            )}
          >
            <DataGridResults
              status={isExecuting ? 'LOADING' : executionResult ? executionResult.status : 'IDLE'}
              executionTimeMs={executionResult?.execution_time_ms || 0}
              rowCount={executionResult?.row_count || 0}
              columns={executionResult?.columns || []}
              rows={executionResult?.rows || []}
              error={executionResult?.error}
              isPlayground={true}
              isExpanded={isResultsExpanded}
              onToggleExpand={() => setIsResultsExpanded((prev) => !prev)}
              className="h-full"
            />
          </div>
        </div>
      </div>

      <ErDiagramModal
        isOpen={erDiagramOpen}
        onClose={() => setErDiagramOpen(false)}
        onSelectTableQuery={handlePreviewTable}
      />
    </div>
  );
};
