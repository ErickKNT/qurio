import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { TextInput } from '@/components/atoms/TextInput/TextInput';
import { KbdShortcut } from '@/components/atoms/KbdShortcut/KbdShortcut';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  shortcut?: string[];
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Buscar retos, tablas o funciones...',
  className,
  shortcut = ['⌘', 'K'],
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative w-full max-w-md', className)}>
      <TextInput
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        leftIcon={<Search className="w-4 h-4" />}
        rightIcon={
          value ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-content-muted hover:text-content-primary p-0.5 rounded transition-colors"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : shortcut ? (
            <KbdShortcut keys={shortcut} />
          ) : null
        }
      />
    </div>
  );
};
