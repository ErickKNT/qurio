import React, { useState } from 'react';
import { Table, ChevronDown, ChevronRight, Key, ArrowUpRight } from 'lucide-react';
import { TableSchemaInfo } from '@/types';
import { cn } from '@/lib/utils';

export interface SchemaTableItemProps {
  table: TableSchemaInfo;
  onInsertQuery?: (query: string) => void;
  className?: string;
}

export const SchemaTableItem: React.FC<SchemaTableItemProps> = ({
  table,
  onInsertQuery,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleQuickSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInsertQuery) {
      onInsertQuery(`SELECT * FROM ${table.tableName} LIMIT 10;`);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border transition-all text-xs font-mono',
        isOpen
          ? 'bg-surface/80 border-border-subtle/80'
          : 'bg-surface/30 hover:bg-surface/60 border-border-subtle/40',
        className
      )}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-2.5 cursor-pointer select-none group"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <button className="text-content-muted group-hover:text-content-primary">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          <Table className="w-3.5 h-3.5 text-primary-light shrink-0" />
          <span className="font-semibold text-content-primary truncate">
            {table.tableName}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-content-muted">
            {table.rowCount} filas
          </span>
          {onInsertQuery && (
            <button
              onClick={handleQuickSelect}
              title={`Insertar SELECT * FROM ${table.tableName} LIMIT 10;`}
              className="p-1 rounded hover:bg-surface-dim text-content-muted hover:text-cyan-accent transition-colors"
            >
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-col px-3 pb-2.5 pt-1 border-t border-border-subtle/30 bg-surface-dim/30 divide-y divide-border-subtle/20">
          {table.columns.map((col, idx) => (
            <div key={idx} className="flex items-center justify-between py-1 text-[11px]">
              <span className="flex items-center gap-1.5 text-content-secondary">
                {col.isPrimary && (
                  <span title="Primary Key">
                    <Key className="w-2.5 h-2.5 text-amber-accent shrink-0" />
                  </span>
                )}
                {col.isForeign && (
                  <span className="text-[9px] text-cyan-accent font-bold" title="Foreign Key">
                    FK
                  </span>
                )}
                <span>{col.name}</span>
              </span>
              <span className="text-[10px] text-content-muted">
                {col.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
