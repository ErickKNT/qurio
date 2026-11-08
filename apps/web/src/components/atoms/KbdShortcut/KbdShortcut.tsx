import React from 'react';
import { cn } from '@/lib/utils';

export interface KbdShortcutProps extends React.HTMLAttributes<HTMLElement> {
  keys: string[];
}

export const KbdShortcut: React.FC<KbdShortcutProps> = ({ keys, className, ...props }) => {
  return (
    <span className={cn('inline-flex items-center gap-1 select-none', className)} {...props}>
      {keys.map((k, index) => (
        <kbd
          key={index}
          className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-mono font-semibold text-content-secondary bg-surface-card border border-border-subtle rounded shadow-sm"
        >
          {k}
        </kbd>
      ))}
    </span>
  );
};
