import React, { useState, useCallback } from 'react';
import { Terminal, Database, Sparkles, Play } from 'lucide-react';
import { TableSchemaInfo, ExecutionResult } from '@/types';
import { MonacoEditorPanel } from '@/components/organisms/MonacoEditorPanel/MonacoEditorPanel';
import { DataGridResults } from '@/components/organisms/DataGridResults/DataGridResults';
import { SchemaTableItem } from '@/components/molecules/SchemaTableItem/SchemaTableItem';
import { Button, Badge } from '@/components/atoms';
import { api } from '@/lib/api';

export interface SqlPlaygroundViewProps {
  tables: TableSchemaInfo[];
  className?: string;
}

const STARTER_QUERIES = [
  {
    name: 'Top 5 Clientes Recientes',
    query: 'SELECT cliente_id, nombre, apellido, ciudad, fecha_registro\nFROM clientes\nORDER BY fecha_registro DESC\nLIMIT 5;',
  },
  {
    name: 'Stock y Valor de Productos',
    query: 'SELECT nombre_producto, precio, stock, (precio * stock) AS valor_inventario\nFROM productos\nORDER BY valor_inventario DESC\nLIMIT 10;',
  },
  {
    name: 'Pedidos por Estado',
    query: 'SELECT estado_pedido, COUNT(*) AS total_pedidos, SUM(total) AS monto_total\nFROM pedidos\nGROUP BY estado_pedido;',
  },
  {
    name: 'Clientes sin Pedidos (LEFT JOIN)',
    query: 'SELECT c.cliente_id, c.nombre, c.apellido, c.email\nFROM clientes c\nLEFT JOIN pedidos p ON c.cliente_id = p.cliente_id\nWHERE p.pedido_id IS NULL;',
  },
];

export const SqlPlaygroundView: React.FC<SqlPlaygroundViewProps> = ({
  tables,
}) => {
  const [query, setQuery] = useState<string>(
    '-- SQL Playground Libre — Qurio\n-- Escribe cualquier consulta SELECT contra el schema public de Ecommerce_Production_DB\nSELECT cliente_id, nombre, apellido, email, ciudad\nFROM clientes\nLIMIT 10;'
  );
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

      // Save to local history
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
    <div className="flex flex-col gap-6 h-[calc(100vh-6.5rem)] pb-4">
      {/* Playground Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-card border border-border-subtle flex items-center justify-center text-cyan-accent shadow-sm">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-content-primary">
                SQL Playground Interactivo
              </h1>
              <Badge variant="emerald" dot size="sm">
                Sandbox Docker Activo
              </Badge>
            </div>
            <p className="text-xs text-content-secondary">
              Entorno libre de experimentación relacional. Ejecución aislada bajo rol de solo lectura.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={handleExecute}
            isLoading={isExecuting}
            kbdShortcut="⌘↵"
            size="sm"
          >
            <Play className="w-3.5 h-3.5 mr-1 fill-current" />
            <span>Ejecutar Consulta</span>
          </Button>
        </div>
      </div>

      {/* Main Workspace Split (Left: Schema Explorer, Right: Editor + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-hidden">
        {/* Left Panel: Database Schema Navigator & Templates (4 cols on large screens) */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Database Info Pill */}
          <div className="p-3.5 rounded-xl bg-surface/60 border border-border-subtle/50 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-content-muted flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-accent" />
                Base de Datos
              </span>
              <span className="text-[10px] font-mono text-emerald px-1.5 py-0.5 rounded bg-emerald/10 border border-emerald/20">
                postgres:16
              </span>
            </div>
            <span className="font-mono text-xs font-semibold text-content-primary">
              Ecommerce_Production_DB
            </span>
            <span className="text-[11px] text-content-muted">
              {tables.length} tablas relacionales listas para consultar.
            </span>
          </div>

          {/* Table Search & List */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-content-secondary uppercase tracking-wider">
                Tablas ({filteredTables.length})
              </span>
            </div>

            <input
              type="text"
              placeholder="Filtrar tablas..."
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-surface-dim border border-border-subtle/50 text-xs font-mono text-content-primary placeholder:text-content-muted focus:outline-none focus:border-cyan-accent/60 transition-colors"
            />

            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
              {filteredTables.map((tbl) => (
                <SchemaTableItem
                  key={tbl.tableName}
                  table={tbl}
                  onInsertQuery={(templateQuery) => setQuery(templateQuery)}
                />
              ))}
            </div>
          </div>

          {/* Quick Query Templates */}
          <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle/30">
            <span className="text-xs font-mono font-semibold text-content-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-accent" />
              Plantillas Rápidas
            </span>

            <div className="flex flex-col gap-1.5">
              {STARTER_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(sq.query)}
                  className="flex flex-col items-start p-2 rounded-lg bg-surface/30 hover:bg-surface/70 border border-border-subtle/30 text-left transition-colors group"
                >
                  <span className="text-xs font-medium text-content-primary group-hover:text-cyan-accent">
                    {sq.name}
                  </span>
                  <span className="text-[10px] font-mono text-content-muted line-clamp-1">
                    {sq.query.replace(/\n/g, ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Editor (top) + DataGrid (bottom) (9 cols on large screens) */}
        <div className="lg:col-span-9 flex flex-col gap-4 h-full min-h-0 overflow-hidden">
          {/* Top: Editor Panel */}
          <div className="h-[46%] min-h-[220px]">
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

          {/* Bottom: Execution Results Table */}
          <div className="flex-1 min-h-0">
            <DataGridResults
              status={isExecuting ? 'LOADING' : executionResult ? executionResult.status : 'IDLE'}
              executionTimeMs={executionResult?.execution_time_ms || 0}
              rowCount={executionResult?.row_count || 0}
              columns={executionResult?.columns || []}
              rows={executionResult?.rows || []}
              error={executionResult?.error}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
