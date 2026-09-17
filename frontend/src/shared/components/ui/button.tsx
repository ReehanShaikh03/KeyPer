import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-[#0F1115] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

    const variants = {
      primary: 'bg-[#6366F1] hover:bg-[#5457E5] text-white shadow-md shadow-indigo-900/20 active:scale-[0.98]',
      secondary: 'bg-[#14B8A6] hover:bg-[#0D9488] text-white shadow-md shadow-teal-900/20 active:scale-[0.98]',
      outline: 'border border-slate-700/80 bg-[#1A1D24] text-slate-200 hover:bg-[#232732] hover:border-slate-600',
      ghost: 'bg-transparent text-slate-300 hover:bg-[#1A1D24] hover:text-white',
      destructive: 'bg-rose-600/90 hover:bg-rose-600 text-white shadow-md shadow-rose-950/40 active:scale-[0.98]',
      subtle: 'bg-[#1F232D] text-slate-200 hover:bg-[#282E3D] hover:text-white border border-slate-800',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-4 py-2 h-10 gap-2',
      lg: 'text-base px-6 py-3 h-12 gap-2.5',
      icon: 'h-9 w-9 p-0 flex items-center justify-center shrink-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
