import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface ToastProps {
  message?: string | null;
  type?: "success" | "error" | "info";
  duration?: number;
}

export function Toast({ message, type = "success", duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!visible || !message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-start gap-3 p-3.5 rounded-xl shadow-xl border text-xs font-medium animate-in slide-in-from-bottom duration-200 bg-stone-900 text-white border-stone-800 max-w-sm">
      {type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
      {type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
      {type === "info" && <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="p-0.5 text-stone-400 hover:text-white"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
