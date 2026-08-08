import React from 'react';
import { CheckCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border text-xs transition-all transform translate-y-0 ${
            toast.type === 'success'
              ? 'bg-[#123B5D] text-white border-[#2E7D52]'
              : toast.type === 'error'
              ? 'bg-[#C62828] text-white border-red-700'
              : toast.type === 'loading'
              ? 'bg-[#123B5D] text-white border-[#D4A72C]'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-[#2E7D52]" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-amber-300" />}
            {toast.type === 'loading' && <Loader2 className="w-5 h-5 text-[#D4A72C] animate-spin" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
          </div>

          <div className="flex-1 space-y-0.5">
            <h4 className="font-bold text-sm leading-snug">{toast.title}</h4>
            {toast.message && <p className="opacity-90 text-[11px] leading-relaxed">{toast.message}</p>}
          </div>

          <button
            onClick={() => onClose(toast.id)}
            className="shrink-0 text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
