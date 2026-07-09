import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { Toast } from '../types';

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none" style={{ direction: 'rtl' }}>
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = 'bg-white text-gray-800 border-gray-100 shadow-xl';
          let Icon = Info;
          let iconColor = 'text-blue-500';

          switch (toast.type) {
            case 'success':
              bgColor = 'bg-emerald-50 text-emerald-900 border-emerald-200 shadow-lg shadow-emerald-100';
              Icon = CheckCircle;
              iconColor = 'text-emerald-500';
              break;
            case 'error':
              bgColor = 'bg-rose-50 text-rose-900 border-rose-200 shadow-lg shadow-rose-100';
              Icon = XCircle;
              iconColor = 'text-rose-500';
              break;
            case 'warning':
              bgColor = 'bg-amber-50 text-amber-900 border-amber-200 shadow-lg shadow-amber-100';
              Icon = AlertTriangle;
              iconColor = 'text-amber-500';
              break;
            case 'info':
              bgColor = 'bg-sky-50 text-sky-900 border-sky-200 shadow-lg shadow-sky-100';
              Icon = Info;
              iconColor = 'text-sky-500';
              break;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              layout
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border ${bgColor} text-sm font-medium gap-3`}
              id={`toast-${toast.id}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => onClose(toast.id)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-black/5 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
