import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  ariaLabel?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 8,
  max = 128,
  step = 1,
  onChange,
  className,
  disabled,
  ariaLabel = 'Password length slider',
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn('relative flex items-center w-full select-none touch-none py-1.5', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-[#14171F] rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 accent-[#6366F1] z-10 opacity-0"
        {...props}
      />
      {/* Custom styled track */}
      <div className="absolute left-0 right-0 h-2 bg-[#14171F] border border-slate-800 rounded-full pointer-events-none overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 transition-all duration-75 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Custom styled thumb */}
      <div
        className="absolute w-5 h-5 bg-[#6366F1] border-2 border-white rounded-full shadow-md shadow-indigo-900/40 pointer-events-none transform -translate-x-1/2 transition-transform active:scale-110"
        style={{ left: `${percentage}%` }}
      />
    </div>
  );
};
