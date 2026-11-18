import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Code2,
  Copy,
  History,
  Play,
  Search,
  X,
} from 'lucide-react';
import { QueryHistoryItem } from '@/types';
import { Badge } from '@/components/atoms';
import { persistence } from '@/lib/persistence';
import { cn } from '@/lib/utils';

export function formatExecutedAt(raw: string): string {
  if (!raw) return '';
  if (!raw.includes('T') && !/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw;
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export interface QueryHistoryRowProps {
  item: QueryHistoryItem;
  isExpanded: boolean;
  isCopied: boolean;
  onToggleExpand: (id: string) => void;
  onCopy: (id: string, query: string, e: React.MouseEvent) => void;
  onOpenPlayground?: (query: string, e: React.MouseEvent) => void;
}

export const QueryHistoryRow: React.FC<QueryHistoryRowProps> = ({
  item,
  isExpanded,
  isCopied,
  onToggleExpand,
  onCopy,
  onOpenPlayground,
}) => (
  <div className="flex flex-col p-3 rounded-xl bg-surface-dim/50 hover:bg-surface-card/70 border border-border-subtle/50 gap-2 transition-all">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div
        onClick={() => onToggleExpand(item.id)}
        className="flex items-center gap-2.5 overflow-hidden flex-1 cursor-pointer select-none group"
        title="Clic para expandir/contraer consulta completa"
      >
        <Code2 className="w-3.5 h-3.5 text-content-muted group-hover:text-cyan-accent shrink-0 transition-colors" />
        <span className="text-content-primary truncate font-mono text-[11px] group-hover:text-primary-light transition-colors">
          {item.query}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 text-content-muted shrink-0" />
        ) : (
          <ChevronDown className="w-3 h-3 text-content-muted opacity-60 group-hover:opacity-100 shrink-0" />
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono text-content-muted flex-wrap">
        {item.row_count !== undefined && (
          <span className="text-emerald font-semibold">{item.row_count} filas</span>
        )}
        <span>{item.execution_time_ms} ms</span>
        <span>{formatExecutedAt(item.executed_at)}</span>
        <Badge variant={item.status === 'SUCCESS' ? 'emerald' : 'error'} size="sm">
          {item.status === 'SUCCESS' ? 'EXITOSA' : 'ERROR'}
        </Badge>

        <div className="flex items-center gap-1.5 pl-2 border-l border-border-subtle/40">
          <button
            type="button"
            onClick={(e) => onCopy(item.id, item.query, e)}
            className={cn(
              'px-2 py-1 rounded-md border transition-all flex items-center gap-1 select-none',
              isCopied
                ? 'bg-emerald/15 border-emerald/40 text-emerald font-semibold'
                : 'bg-surface-card border-border-subtle text-content-secondary hover:text-content-primary hover:border-primary/50'
            )}
            title="Copiar consulta SQL"
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald" />
                <span className="text-[10px] font-sans text-emerald">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="text-[10px] font-sans hidden sm:inline">Copiar</span>
              </>
            )}
          </button>

          {onOpenPlayground && (
            <button
              type="button"
              onClick={(e) => onOpenPlayground(item.query, e)}
              className="px-2 py-1 rounded-md border bg-surface-card border-border-subtle text-content-secondary hover:text-cyan-accent hover:border-cyan-accent/50 hover:bg-cyan-accent/10 transition-all flex items-center gap-1 select-none"
              title="Cargar esta consulta en el Laboratorio SQL"
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-sans hidden sm:inline">Laboratorio</span>
            </button>
          )}
        </div>
      </div>
    </div>

    {isExpanded && (
      <div className="mt-1 pt-2 border-t border-border-subtle/40 animate-fadeIn">
        <div className="p-3 rounded-lg bg-canvas/80 border border-border-subtle font-mono text-xs text-primary-light overflow-x-auto select-text shadow-inner">
          <pre className="m-0 leading-relaxed font-mono whitespace-pre-wrap break-words">
            <code>{item.query}</code>
          </pre>
        </div>
      </div>
    )}
  </div>
);

export interface QueryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  isCloudAuth?: boolean;
  localHistory: QueryHistoryItem[];
  initialFilter?: 'all' | 'SUCCESS';
  onOpenPlayground?: (query: string) => void;
}

const PAGE_SIZE = 10;

export const QueryHistoryModal: React.FC<QueryHistoryModalProps> = ({
  isOpen,
  onClose,
  userId,
  isCloudAuth = false,
  localHistory,
  initialFilter = 'all',
  onOpenPlayground,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'SUCCESS'>(initialFilter);
  const [page, setPage] = useState(0);
  const [cloudItems, setCloudItems] = useState<QueryHistoryItem[]>([]);
  const [cloudTotal, setCloudTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatusFilter(initialFilter);
      setPage(0);
    }
  }, [isOpen, initialFilter]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !isCloudAuth || !userId || userId.startsWith('demo-')) return;
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      persistence
        .getUserAttemptsPage({
          userId,
          page,
          pageSize: PAGE_SIZE,
          statusFilter,
          search,
        })
        .then((res) => {
          if (active) {
            setCloudItems(res.items);
            setCloudTotal(res.total);
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 180);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, isCloudAuth, userId, page, statusFilter, search]);

  const { items, totalCount } = useMemo(() => {
    if (isCloudAuth && userId && !userId.startsWith('demo-')) {
      return { items: cloudItems, totalCount: cloudTotal };
    }
    const q = search.trim().toLowerCase();
    const filtered = localHistory.filter((item) => {
      if (statusFilter === 'SUCCESS' && item.status !== 'SUCCESS') return false;
      if (q && !item.query.toLowerCase().includes(q)) return false;
      return true;
    });
    const start = page * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      totalCount: filtered.length,
    };
  }, [isCloudAuth, userId, cloudItems, cloudTotal, localHistory, search, statusFilter, page]);

  if (!isOpen) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);

  const handleCopy = (id: string, query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(query);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleOpenInPlayground = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    onOpenPlayground?.(query);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="query-history-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-canvas/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl bg-surface border border-border-subtle shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="px-5 py-4 bg-surface-dim border-b border-border-subtle flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4 text-primary-light" />
            <h2 id="query-history-modal-title" className="text-base font-bold text-content-primary">
              Historial Completo de Consultas
            </h2>
            <span className="font-mono text-xs text-content-muted">({totalCount})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar historial completo"
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-card transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de búsqueda y filtro */}
        <div className="px-5 py-3 bg-surface-dim/40 border-b border-border-subtle/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Buscar por cláusula o tabla (ej. JOIN, productos, GROUP BY)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-border-subtle focus:border-primary focus:outline-none text-xs font-mono text-content-primary"
            />
          </div>

          <div className="inline-flex items-center p-1 rounded-xl bg-surface border border-border-subtle/60 shrink-0">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setPage(0);
              }}
              className={cn(
                'px-3 py-1 rounded-lg font-mono text-xs transition-colors',
                statusFilter === 'all'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-content-secondary hover:text-content-primary'
              )}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('SUCCESS');
                setPage(0);
              }}
              className={cn(
                'px-3 py-1 rounded-lg font-mono text-xs transition-colors',
                statusFilter === 'SUCCESS'
                  ? 'bg-emerald text-white font-semibold'
                  : 'text-content-secondary hover:text-content-primary'
              )}
            >
              Solo Exitosas
            </button>
          </div>
        </div>

        {/* Listado paginado */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-2">
          {loading ? (
            <div className="py-12 flex items-center justify-center gap-2 text-xs font-mono text-content-muted">
              <div className="w-4 h-4 border-2 border-cyan-accent border-t-transparent rounded-full animate-spin" />
              <span>Consultando historial en servidor...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-content-muted">
              No se encontraron consultas que coincidan con el filtro actual.
            </div>
          ) : (
            items.map((item) => (
              <QueryHistoryRow
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                isCopied={copiedId === item.id}
                onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
                onCopy={handleCopy}
                onOpenPlayground={onOpenPlayground ? handleOpenInPlayground : undefined}
              />
            ))
          )}
        </div>

        {/* Paginación */}
        <div className="px-5 py-3 bg-surface-dim border-t border-border-subtle flex items-center justify-between gap-3 text-xs font-mono text-content-muted">
          <span>
            Página <strong className="text-content-primary">{safePage + 1}</strong> de{' '}
            <strong className="text-content-primary">{totalPages}</strong> • {PAGE_SIZE} por página
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface border border-border-subtle text-content-primary hover:bg-surface-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages - 1 || loading}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface border border-border-subtle text-content-primary hover:bg-surface-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
