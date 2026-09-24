import React, { forwardRef, RefAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps & RefAttributes<HTMLButtonElement>>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      fullWidth = false,
      children,
      className = '',
      onClick,
      type = 'button',
    },
    ref
  ) => {
    const variantClasses = {
      primary:
        'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-xl border border-transparent',
      secondary:
        'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-transparent',
      danger:
        'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg hover:shadow-xl border border-transparent',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-base gap-2',
      lg: 'px-6 py-3.5 text-lg gap-2.5',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    const loadingSpinner = isLoading ? (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ) : null;

    return (
      <button
        ref={ref}
        type={type}
        className={`
          relative inline-flex items-center justify-center font-semibold rounded-xl 
          transition-all duration-300 active:scale-95 active:transition-transform
          focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none
          ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}
        `}
        onClick={onClick}
        disabled={isLoading}
      >
        {/* Shimmer effect for primary buttons */}
        {variant === 'primary' && !isLoading && (
          <span className="absolute inset-0 animate-shimmer pointer-events-none rounded-xl" />
        )}
        
        {/* Left Icon */}
        {!isLoading && icon && <span className="relative z-10">{icon}</span>}
        
        {/* Loading text or children */}
        <span className="relative z-10">
          {isLoading ? 'Loading...' : children}
        </span>
        
        {/* Right Icon (if provided separately) */}
        {!isLoading && icon && children && (
          <span className="relative z-10 ml-1">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
