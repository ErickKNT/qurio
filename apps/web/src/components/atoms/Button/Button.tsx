import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'emerald' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  kbdShortcut?: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      kbdShortcut,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] outline-none';

    const sizeStyles = {
      sm: 'text-xs h-8 px-3 rounded-md gap-1.5',
      md: 'text-sm h-10 px-4 rounded-lg gap-2',
      lg: 'text-base h-12 px-6 rounded-xl gap-2.5',
    };

    const variantStyles = {
      primary:
        'bg-primary text-white hover:bg-primary-hover shadow-glow-primary hover:shadow-primary border border-transparent hover:border-cyan-accent/50',
      secondary:
        'bg-surface-card text-content-secondary hover:text-content-primary hover:bg-surface-hover border border-border-subtle hover:border-primary/50',
      ghost:
        'bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-card/60 border border-transparent',
      emerald:
        'bg-emerald text-white hover:bg-emerald/90 shadow-glow-emerald border border-transparent hover:border-emerald-glow',
      danger:
        'bg-error-container text-content-primary hover:bg-red-700 border border-error/30',
      outline:
        'bg-transparent text-content-primary border border-border-subtle hover:border-primary/70 hover:bg-primary/10',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}

        <span>{children}</span>

        {rightIcon && !isLoading && <span className="shrink-0">{rightIcon}</span>}

        {kbdShortcut && (
          <kbd className="ml-1.5 px-1.5 py-0.5 text-[11px] font-mono font-medium rounded bg-black/30 border border-white/10 text-white/80 shrink-0">
            {kbdShortcut}
          </kbd>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
