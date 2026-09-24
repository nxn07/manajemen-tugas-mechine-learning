"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // Log to your monitoring service if needed
    // Example: reportErrorToMonitoringService(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-6">
          <div className="bg-white border-2 border-rose-200 rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border-2 border-rose-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                Maaf, Terjadi Kesalahan
              </h2>
              <p className="text-sm text-slate-600 font-medium mb-4">
                Kami tidak sengaja mengalami masalah. Silakan refresh halaman atau coba lagi nanti.
              </p>
              
              {this.state.error && (
                <details className="text-left bg-slate-50 border-2 border-slate-200 rounded-xl p-4 mb-4">
                  <summary className="font-bold text-xs text-slate-700 cursor-pointer">
                    Detail Error (untuk Developer)
                  </summary>
                  <pre className="text-[10px] text-slate-600 mt-2 overflow-x-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 px-4 bg-blue-900 hover:bg-blue-950 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer border-2 border-blue-950"
              >
                Refresh Halaman
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl shadow-md transition-all cursor-pointer border-2 border-slate-300"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC wrapper for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent: React.ComponentType<P>
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={<FallbackComponent {...props} />} >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
