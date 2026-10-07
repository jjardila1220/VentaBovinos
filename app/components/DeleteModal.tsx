import { Form } from "@remix-run/react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  actionUrl: string;
  onClose: () => void;
}

export function DeleteModal({
  isOpen,
  title,
  message,
  itemName,
  actionUrl,
  onClose,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 bg-rose-50 border-b border-rose-100 text-[#B3202A]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#B3202A]" />
            <h3 className="font-bold text-sm">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">{message}</p>

          {itemName && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900">
              {itemName}
            </div>
          )}

          <p className="text-[11px] text-rose-700 font-medium">
            Si el bovino ya ha sido vendido, el sistema rechazará la eliminación por restricción de integridad referencial (ON DELETE RESTRICT).
          </p>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold rounded-xl"
            >
              Cancelar
            </button>
            <Form method="post" action={actionUrl}>
              <input type="hidden" name="intent" value="delete" />
              <button
                type="submit"
                className="px-5 py-2 bg-[#B3202A] hover:bg-[#8B1820] text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Eliminación</span>
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
