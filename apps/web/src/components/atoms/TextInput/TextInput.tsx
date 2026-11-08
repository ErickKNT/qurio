import React from 'react';
import { cn } from '@/lib/utils';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, error, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-content-muted pointer-events-none flex items-center">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full bg-canvas text-content-primary placeholder:text-content-muted text-sm rounded-lg',
            'border border-border-subtle transition-all duration-150 outline-none',
            'py-2 px-3',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            'focus:border-primary focus:shadow-glow-primary',
            error && 'border-error text-error focus:border-error focus:shadow-none',
            disabled && 'opacity-50 cursor-not-allowed bg-surface-dim',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-content-muted flex items-center">
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
