import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useAlertStore } from '../store/useAlertStore';
import { useEffect } from 'react';

const CustomDialog = () => {
  const { isOpen, title, message, type, confirmText, cancelText, onConfirm, onCancel, close } = useAlertStore();

  // Escape key closes alert
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (type === 'confirm' && onCancel) {
          onCancel();
        } else if (onConfirm) {
          onConfirm();
        } else {
          close();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, type, onConfirm, onCancel, close]);

  if (!isOpen) return null;

  // Determine icon and style based on title / message content
  const isWarning = title.toLowerCase().includes('warning') || 
                    title.toLowerCase().includes('cancel') || 
                    message.toLowerCase().includes('cancel') ||
                    message.toLowerCase().includes('refund');

  const isSuccess = title.toLowerCase().includes('success') || 
                    title.toLowerCase().includes('confirm') ||
                    message.toLowerCase().includes('confirm');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 transform transition-all duration-300 scale-100 animate-[scaleUp_0.2s_ease-out] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top decoration line */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
          isWarning ? 'bg-amber-500' : isSuccess ? 'bg-emerald-500' : 'bg-indigo-500'
        }`} />

        {/* Close Icon (Top Corner) */}
        <button 
          onClick={type === 'confirm' ? onCancel : onConfirm}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center mt-4 space-y-4">
          {/* Icon Badge */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isWarning ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500' :
            isSuccess ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500' :
            'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500'
          }`}>
            {isWarning ? <AlertTriangle size={32} /> :
             isSuccess ? <CheckCircle2 size={32} /> :
             <Info size={32} />}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {title}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed px-2">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6">
          {type === 'confirm' && (
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700/80 font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all hover:border-slate-300 dark:hover:border-slate-600"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white transition-all shadow-lg hover:shadow-xl ${
              isWarning 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomDialog;
