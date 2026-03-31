import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps extends ToastData {
  onRemove: (id: string) => void;
}

const configs = {
  success: { icon: CheckCircle, bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', icon_: 'text-emerald-500' },
  error: { icon: XCircle, bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon_: 'text-red-500' },
  warning: { icon: AlertCircle, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon_: 'text-amber-500' },
};

function ToastItem({ id, message, type, onRemove }: ToastProps) {
  const { icon: Icon, bg, text, icon_ } = configs[type];
  useEffect(() => {
    const t = setTimeout(() => onRemove(id), 3500);
    return () => clearTimeout(t);
  }, [id, onRemove]);

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-md ${bg} animate-slide-in`}>
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${icon_}`} />
      <p className={`text-sm font-medium flex-1 ${text}`}>{message}</p>
      <button onClick={() => onRemove(id)} className={`${text} opacity-60 hover:opacity-100`}><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => <ToastItem key={t.id} {...t} onRemove={onRemove} />)}
    </div>
  );
}

// Hook
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const show = (message: string, type: ToastType = 'success') => {
    setToasts((prev) => [...prev, { id: Date.now().toString(), message, type }]);
  };
  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));
  return { toasts, show, remove, success: (m: string) => show(m, 'success'), error: (m: string) => show(m, 'error'), warning: (m: string) => show(m, 'warning') };
}
