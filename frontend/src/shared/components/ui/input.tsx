import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        className={cn(
          'w-full px-3.5 py-2 text-sm bg-[#14171F] border rounded-xl font-sans text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-rose-500/80 focus:ring-rose-500/40' : 'border-slate-800 focus:border-indigo-500/60',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
