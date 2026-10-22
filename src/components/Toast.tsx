import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Overlay positioned inside mobile viewport */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm pointer-events-none flex flex-col gap-2">
        {toasts.map((toast) => {
          let bg = 'bg-[#151324] border-purple-500/40 text-purple-200';
          let Icon = Info;
          if (toast.type === 'success') {
            bg = 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200';
            Icon = CheckCircle2;
          } else if (toast.type === 'error') {
            bg = 'bg-red-950/90 border-red-500/40 text-red-200';
            Icon = AlertCircle;
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-950/90 border-amber-500/40 text-amber-200';
            Icon = AlertTriangle;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all animate-bounceIn text-xs font-medium ${bg}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate leading-tight text-white/95">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    return {
      showToast: (msg: string) => console.log('[Toast]:', msg),
    };
  }
  return ctx;
};
