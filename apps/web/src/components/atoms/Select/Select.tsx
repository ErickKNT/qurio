import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string | number = string> {
  id?: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  'aria-label'?: string;
  className?: string;
  menuClassName?: string;
}

export function Select<T extends string | number = string>({
  id,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  disabled = false,
  size = 'sm',
  'aria-label': ariaLabel,
  className,
  menuClassName,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return next;
    });
  };

  const handleSelectOption = (option: SelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      } else {
        setHighlightedIndex((prev) => Math.min(options.length - 1, prev + 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : options.length - 1);
      } else {
        setHighlightedIndex((prev) => Math.max(0, prev - 1));
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (isOpen && highlightedIndex >= 0 && options[highlightedIndex]) {
        e.preventDefault();
        handleSelectOption(options[highlightedIndex]);
      }
    }
  };

  const sizeStyles = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs';

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          'w-full flex items-center justify-between gap-2 rounded-lg font-mono text-left transition-all duration-150 outline-none',
          'bg-surface-card text-content-primary border border-border-subtle',
          'hover:border-primary/50 focus-visible:border-cyan-accent focus-visible:ring-2 focus-visible:ring-cyan-accent/20',
          isOpen && 'border-cyan-accent ring-2 ring-cyan-accent/20',
          disabled && 'opacity-50 cursor-not-allowed',
          sizeStyles
        )}
      >
        <span className={cn('truncate', !selectedOption && 'text-content-muted')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-content-muted shrink-0 transition-transform duration-150',
            isOpen && 'rotate-180 text-cyan-accent'
          )}
        />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            'absolute left-0 z-50 mt-1.5 min-w-full w-max max-w-[min(90vw,420px)] max-h-64 overflow-y-auto',
            'rounded-xl bg-surface-card border border-border-subtle shadow-2xl py-1 backdrop-blur-md',
            menuClassName
          )}
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-xs font-mono text-content-muted">Sin opciones</li>
          ) : (
            options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isHighlighted = idx === highlightedIndex;
              return (
                <li
                  key={String(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => handleSelectOption(opt)}
                  className={cn(
                    'w-full flex items-center justify-between gap-2.5 px-3 py-2 text-xs font-mono cursor-pointer transition-colors',
                    opt.disabled && 'opacity-40 cursor-not-allowed',
                    isSelected
                      ? 'bg-primary/15 text-cyan-accent font-semibold'
                      : isHighlighted
                        ? 'bg-surface-hover text-content-primary'
                        : 'text-content-secondary hover:bg-surface-hover hover:text-content-primary'
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-accent shrink-0" />}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
