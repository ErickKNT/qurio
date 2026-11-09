import React, { useState, useCallback } from 'react';
import { Terminal, Database, Sparkles, Table as TableIcon, ShieldCheck, Clock } from 'lucide-react';
import { TableSchemaInfo, ExecutionResult } from '@/types';
import { MonacoEditorPanel } from '@/components/organisms/MonacoEditorPanel/MonacoEditorPanel';
import { DataGridResults } from '@/components/organisms/DataGridResults/DataGridResults';
import { SchemaTableItem } from '@/components/molecules/SchemaTableItem/SchemaTableItem';
import { Badge } from '@/components/atoms';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export interface SqlPlaygroundViewProps {
  tables: TableSchemaInfo[];
  className?: string;
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
}) => {
  const [query, setQuery] = useState<string>(
    '-- SQL Playground — Qurio\n-- Escribe cualquier consulta libre contra el schema public de Ecommerce_Production_DB\nSELECT cliente_id, nombre, apellido, email, ciudad\nFROM clientes\nLIMIT 10;'
  );
  const [sidebarTab, setSidebarTab] = useState<'tables' | 'templates'>('tables');
  const [filterTable, setFilterTable] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  const filteredTables = tables.filter((t) =>
    t.tableName.toLowerCase().includes(filterTable.toLowerCase())
  );

  const handleExecute = useCallback(async () => {
    if (!query.trim() || isExecuting) return;

    setIsExecuting(true);
    try {
      const res = await api.executePlayground(query);
      setExecutionResult(res);

      // Guardar en historial local
      api.saveQueryHistory({
        id: `play-${Date.now()}`,
        query: query.trim(),
        executed_at: 'Hace un momento',
        status: res.status,
        execution_time_ms: res.execution_time_ms,
        row_count: res.row_count,
      });
    } catch (err: any) {
      setExecutionResult({
        status: 'ERROR',
        execution_time_ms: 0,
        row_count: 0,
        columns: [],
        rows: [],
        error: err.message || 'Error inesperado al ejecutar consulta en Playground.',
      });
    } finally {
      setIsExecuting(false);
    }
  }, [query, isExecuting]);

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden select-none">
      {/* 1. Barra de Estado Superior Compacta (Sin botones duplicados) */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-surface/50 border border-border-subtle/40 shrink-0 font-mono text-xs">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 text-content-primary font-bold">
            <Terminal className="w-4 h-4 text-cyan-accent shrink-0" />
            <span className="hidden sm:inline">SQL Playground</span>
          </div>

          <span className="text-border-subtle">•</span>

          <div className="flex items-center gap-1.5 text-content-secondary truncate text-[11px]">
            <Database className="w-3.5 h-3.5 text-content-muted shrink-0" />
            <span className="font-semibold text-content-primary">Ecommerce_Production_DB</span>
            <span className="text-content-muted">public</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 text-[11px]">
          <span className="hidden md:flex items-center gap-1 text-content-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald shrink-0" />
            <span>readonly_student</span>
          </span>

          <Badge variant="emerald" dot size="sm">
            postgres:16 sandbox
          </Badge>

          {executionResult && executionResult.execution_time_ms > 0 && (
            <span className="hidden sm:flex items-center gap-1 text-content-muted text-[10px]">
              <Clock className="w-3 h-3" />
              {executionResult.execution_time_ms.toFixed(1)}ms
            </span>
          )}
        </div>
      </div>

      {/* 2. Workspace Principal (Split: Explorador Lateral + Editor/DataGrid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0 overflow-hidden">
        {/* Panel Lateral Izquierdo: Tablas & Plantillas */}
        <div className="lg:col-span-3 flex flex-col h-full min-h-0 rounded-xl bg-surface/40 border border-border-subtle/50 overflow-hidden p-3 gap-2.5">
          {/* Selector de Pestañas del Panel */}
          <div className="flex items-center rounded-lg bg-surface-dim/80 p-0.5 border border-border-subtle/40 shrink-0 text-xs font-mono">
            <button
              onClick={() => setSidebarTab('tables')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md transition-colors',
                sidebarTab === 'tables'
                  ? 'bg-surface text-cyan-accent font-semibold shadow-sm'
                  : 'text-content-muted hover:text-content-primary'
              )}
            >
              <TableIcon className="w-3 h-3" />
              <span>Tablas ({tables.length})</span>
            </button>

            <button
              onClick={() => setSidebarTab('templates')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md transition-colors',
                sidebarTab === 'templates'
                  ? 'bg-surface text-amber-accent font-semibold shadow-sm'
                  : 'text-content-muted hover:text-content-primary'
              )}
            >
              <Sparkles className="w-3 h-3" />
              <span>Plantillas</span>
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
                    onInsertQuery={(templateQuery) => setQuery(templateQuery)}
                  />
                ))}
                {filteredTables.length === 0 && (
                  <div className="p-4 text-center text-xs font-mono text-content-muted">
                    No se encontraron tablas.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
              <span className="text-[11px] font-mono text-content-muted uppercase tracking-wider">
                Consultas de Ejemplo
              </span>
              {STARTER_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(sq.query)}
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
          )}
        </div>

        {/* Panel Derecho: Editor Monaco + Resultados de DataGrid */}
        <div className="lg:col-span-9 flex flex-col gap-3 h-full min-h-0 overflow-hidden">
          {/* Arriba: Editor Monaco */}
          <div className="h-[40%] min-h-[190px]">
            <MonacoEditorPanel
              value={query}
              onChange={(val) => setQuery(val)}
              onExecute={handleExecute}
              onReset={() => setQuery('')}
              isLoading={isExecuting}
              isSubmitMode={false}
              className="h-full"
            />
          </div>

          {/* Abajo: DataGrid de Resultados (isPlayground={true} elimina felicitaciones artificiales) */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <DataGridResults
              status={isExecuting ? 'LOADING' : executionResult ? executionResult.status : 'IDLE'}
              executionTimeMs={executionResult?.execution_time_ms || 0}
              rowCount={executionResult?.row_count || 0}
              columns={executionResult?.columns || []}
              rows={executionResult?.rows || []}
              error={executionResult?.error}
              isPlayground={true}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
