import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'teal';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors';
  const variants = {
    default: 'bg-indigo-950/60 text-indigo-300 border border-indigo-700/50',
    success: 'bg-emerald-950/60 text-emerald-400 border border-emerald-600/40',
    warning: 'bg-amber-950/60 text-amber-400 border border-amber-600/40',
    destructive: 'bg-rose-950/60 text-rose-400 border border-rose-600/40',
    outline: 'bg-[#14171F] text-slate-300 border border-slate-700/60',
    teal: 'bg-teal-950/60 text-teal-300 border border-teal-600/40',
  };

  return (
    <div className={cn(base, variants[variant], className)} {...props}>
      {children}
    </div>
  );
};
