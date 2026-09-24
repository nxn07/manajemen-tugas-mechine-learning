"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, AlertTriangle, Info, X, Loader2 } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  type: ToastType;
  message: string | null;
  title?: string;
  onClose: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    bgColor: "from-emerald-500 to-teal-500",
    textColor: "text-emerald-900",
    borderColor: "border-l-emerald-500",
    iconColor: "text-emerald-600",
  },
  error: {
    icon: AlertTriangle,
    bgColor: "from-rose-500 to-red-500",
    textColor: "text-rose-900",
    borderColor: "border-l-rose-500",
    iconColor: "text-rose-600",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "from-amber-500 to-yellow-500",
    textColor: "text-amber-900",
    borderColor: "border-l-amber-500",
    iconColor: "text-amber-600",
  },
  info: {
    icon: Info,
    bgColor: "from-blue-500 to-cyan-500",
    textColor: "text-blue-900",
    borderColor: "border-l-blue-500",
    iconColor: "text-blue-600",
  },
};

export function Toast({ type, message, title, onClose, duration = 4000 }: ToastProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!message) {
      // Cleanup when message is removed
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // Start countdown animation
    startTimeRef.current = Date.now();
    
    const animateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      if (progressRef.current) {
        progressRef.current.style.width = `${remaining}%`;
      }
      
      if (remaining > 0) {
        animationFrameRef.current = requestAnimationFrame(animateProgress);
      } else {
        animationFrameRef.current = null;
      }
    };

    // Clear any existing animation and start fresh
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    animateProgress();

    // Auto-close timer
    timerRef.current = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      // Cleanup on unmount or effect re-run
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [message, duration, onClose]);

  if (!message) return null;

  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div
      className="fixed top-4 right-4 z-50 max-w-sm w-full animate-slide-in-right"
      role="alert"
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden">
        {/* Left Gradient Border */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${config.bgColor}`} />
        
        <div className="p-4 pl-5 flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <p className={`text-sm font-black ${config.textColor} mb-0.5`}>
                {title}
              </p>
            )}
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600 cursor-pointer active:scale-90"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar (Auto-dismiss countdown) */}
        {duration && (
          <div className="h-0.5 bg-slate-100 relative overflow-hidden">
            <div
              ref={progressRef}
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${config.bgColor} transition-all ease-linear`}
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Toast Helper Functions for easy usage
export const showToast = {
  success: (message: string, title?: string, duration?: number) => ({
    type: "success" as const,
    message,
    title,
    duration,
  }),
  error: (message: string, title?: string, duration?: number) => ({
    type: "error" as const,
    message,
    title,
    duration,
  }),
  warning: (message: string, title?: string, duration?: number) => ({
    type: "warning" as const,
    message,
    title,
    duration,
  }),
  info: (message: string, title?: string, duration?: number) => ({
    type: "info" as const,
    message,
    title,
    duration,
  }),
};

export default Toast;
