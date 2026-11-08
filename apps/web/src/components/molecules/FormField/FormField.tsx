import React from 'react';
import { AlertCircle } from 'lucide-react';
import { TextInput, TextInputProps } from '@/components/atoms/TextInput/TextInput';
import { cn } from '@/lib/utils';

export interface FormFieldProps extends TextInputProps {
  label: string;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, errorMessage, helperText, required, className, id, ...props }, ref) => {
    const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', className)}>
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="text-xs font-semibold text-content-primary">
            {label}
            {required && <span className="text-cyan-accent ml-1">*</span>}
          </label>
        </div>

        <TextInput
          id={inputId}
          ref={ref}
          error={Boolean(errorMessage)}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? `${inputId}-error` : undefined}
          {...props}
        />

        {/* Mensaje de error riguroso e inline (Anti-AI Slop) */}
        {errorMessage ? (
          <div
            id={`${inputId}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-xs text-error mt-0.5 animate-fadeIn"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-error" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        ) : helperText ? (
          <span className="text-[11px] text-content-muted mt-0.5">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
