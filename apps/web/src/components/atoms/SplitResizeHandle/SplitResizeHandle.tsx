import React from 'react';
import { cn } from '@/lib/utils';

export interface SplitResizeHandleProps {
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  className?: string;
}

export const SplitResizeHandle: React.FC<SplitResizeHandleProps> = ({
  isDragging,
  onMouseDown,
  onDoubleClick,
  className,
}) => (
  <div
    role="separator"
    aria-orientation="horizontal"
    aria-label="Redimensionar panel de resultados"
    title="Arrastra para redimensionar · Doble clic para restablecer"
    onMouseDown={onMouseDown}
    onDoubleClick={onDoubleClick}
    className={cn(
      'hidden lg:flex h-2 w-full shrink-0 cursor-row-resize items-center justify-center border-y border-border-subtle bg-surface-dim/80 transition-colors hover:bg-primary/15 group',
      isDragging && 'bg-primary/25 border-primary/50',
      className
    )}
  >
    <span
      className={cn(
        'h-0.5 w-10 rounded-full bg-border-subtle group-hover:bg-primary transition-colors',
        isDragging && 'bg-primary w-14'
      )}
    />
  </div>
);
