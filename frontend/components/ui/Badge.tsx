import React, { forwardRef, RefAttributes } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'grade';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps & RefAttributes<HTMLSpanElement>>(
  ({ variant = 'neutral', size = 'md', children, className = '' }, ref) => {
    const variantClasses = {
      success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      warning: 'bg-amber-100 text-amber-800 border-amber-200',
      error: 'bg-rose-100 text-rose-800 border-rose-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      neutral: 'bg-slate-100 text-slate-800 border-slate-200',
      grade: '', // Custom handling below
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    const gradeClasses = {
      A: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20',
      B: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md shadow-blue-500/20',
      C: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/20',
      D: 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20',
      E: 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md shadow-red-600/30',
    };

    const baseClasses = variant === 'grade' ? gradeClasses[children as keyof typeof gradeClasses] || gradeClasses.A : variantClasses[variant];

    return (
      <span
        ref={ref}
        className={`inline-flex items-center font-semibold rounded-full border ${baseClasses} ${sizeClasses[size]} ${className}`}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
