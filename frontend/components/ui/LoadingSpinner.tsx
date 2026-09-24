import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'danger';
  fullscreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  fullscreen = false,
  message = 'Loading...',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4',
  };

  const colorClasses = {
    primary: 'border-teal-200 border-t-teal-600',
    secondary: 'border-blue-200 border-t-blue-600',
    danger: 'border-rose-200 border-t-rose-600',
  };

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-6 animate-fade-in-up-small">
          {/* Spinner */}
          <div
            className={`rounded-full border-4 ${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
          />
          
          {/* Optional custom icon */}
          {message.includes('Central Saga') && (
            <div className="w-20 h-20 rounded-2xl bg-white p-3 flex items-center justify-center shadow-xl border-2 border-emerald-500/30 animate-pulse-glow">
              <svg
                className="w-full h-full text-emerald-600"
                viewBox="0 0 100 100"
                fill="currentColor"
              >
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  d="M50 10 L50 90 M10 50 L90 50"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
          
          {/* Message */}
          <p className="text-slate-600 font-bold text-lg tracking-wide">{message}</p>
          
          {/* Progress indicator dots */}
          <div className="flex items-center gap-2 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-teal-600 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Inline loading state (non-fullscreen)
  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={`rounded-full border-4 ${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
      />
    </div>
  );
};

// Skeleton loader components
export const CardSkeleton: React.FC<{ padding?: 'sm' | 'md' | 'lg' }> = ({ padding = 'md' }) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm ${paddingClasses[padding]}`}>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-8 bg-slate-200 rounded w-1/2" />
        <div className="h-32 bg-slate-200 rounded" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse" />
      </div>
      <div className="divide-y divide-slate-200">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-1/3" />
              <div className="h-2 bg-slate-200 rounded w-1/4" />
            </div>
            <div className="w-16 h-6 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;
