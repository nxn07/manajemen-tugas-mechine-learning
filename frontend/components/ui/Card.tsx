import React, { forwardRef, RefAttributes } from 'react';

type CardVariant = 'elevated' | 'floating' | 'glass';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card = forwardRef<HTMLDivElement, CardProps & RefAttributes<HTMLDivElement>>(
  ({ variant = 'elevated', padding = 'md', children, className = '', onClick }, ref) => {
    const variantClasses = {
      elevated: 'bg-white shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow',
      floating: 'bg-white shadow-lg border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
      glass: 'bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-shadow',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
        onClick={onClick}
      >
        {/* Optional subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Content wrapper */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
export type { CardProps, CardVariant, CardPadding };
