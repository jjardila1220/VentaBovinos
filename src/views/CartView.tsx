import React from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { formatCOP } from '../utils/formatters.ts';
import { 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Tag,
  CheckCircle2,
  Info
} from 'lucide-react';

interface CartViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const CartView: React.FC<CartViewProps> = ({ onNavigate }) => {
  const { items, count, subtotal, shipping, total, removeFromCart, clearCart } = useCart();
  const { showToast } = useToast();

  const handleRemove = (id: string, name: string) => {
    removeFromCart(id);
    showToast(`Ejemplar "${name}" removido y liberado en catálogo.`, 'info');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Title & Micro Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#8B1820] tracking-tight">
            Carrito de Compras
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {count} {count === 1 ? 'ejemplar seleccionado' : 'ejemplares seleccionados'} (Cada bovino es una unidad única)
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => { clearCart(); showToast('Carrito vaciado y ejemplares liberados.', 'info'); }}
            className="text-xs text-stone-500 hover:text-[#B3202A] font-semibold flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vaciar todo el carrito</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        /* Empty State con llamado a la acción (as specified) */
        <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-stone-200 shadow-sm space-y-5">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#F9E3E3] flex items-center justify-center text-[#B3202A] shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-stone-900">Su carrito está vacío</h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              No tiene ningún ejemplar bovino apartado en este momento. Explore nuestro catálogo con filtros por raza, peso y categoría para seleccionar su ganado.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('catalog')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#B3202A] hover:bg-[#8B1820] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              <span>Explorar Catálogo de Bovinos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Main 2-Column Layout: Lista de bovinos + Resumen del pedido */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Lista de bovinos con imagen, nombre, precio y botón eliminar. SIN controles de cantidad */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Reserva temporal activa: </strong>
                Mientras estos bovinos estén en su carrito, aparecen marcados como "Reservados" para evitar que otro usuario los compre simultáneamente.
              </div>
            </div>

            <div className="space-y-3">
              {items.map((bovine) => (
                <div
                  key={bovine.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center gap-4 hover:border-rose-200 transition-colors"
                >
                  {/* Image */}
                  <img
                    src={bovine.images[0]}
                    alt={bovine.name}
                    className="w-full sm:w-28 h-24 rounded-xl object-cover border border-stone-200 shrink-0 cursor-pointer"
                    onClick={() => onNavigate('detail', { id: bovine.id })}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-1 w-full">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-[#B3202A] uppercase">
                        {bovine.category}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400 font-bold">
                        {bovine.id}
                      </span>
                    </div>

                    <h3 
                      onClick={() => onNavigate('detail', { id: bovine.id })}
                      className="font-bold text-sm text-stone-900 hover:text-[#B3202A] transition-colors truncate cursor-pointer"
                      title={bovine.name}
                    >
                      {bovine.name}
                    </h3>

                    <p className="text-xs text-stone-500">
                      Raza {bovine.breed} • {bovine.weight} kg • {bovine.sex}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Ubicación: {bovine.location}
                    </p>
                  </div>

                  {/* Price & Delete Button (NO quantity controls as each bovine is unique) */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-stone-100 gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block sm:hidden">Precio:</span>
                      <span className="text-base sm:text-lg font-black text-[#B3202A]">
                        {formatCOP(bovine.price)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(bovine.id, bovine.name)}
                      className="p-2 text-stone-400 hover:text-[#B3202A] hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="Eliminar del carrito"
                    >
                      <Trash2 className="w-4 h-4 text-[#B3202A]" />
                      <span className="sm:hidden">Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Enlace "Seguir comprando" */}
            <div className="pt-2">
              <button
                onClick={() => onNavigate('catalog')}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#B3202A] hover:text-[#8B1820] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Seguir comprando más ejemplares</span>
              </button>
            </div>
          </div>

          {/* Right: Resumen del pedido con subtotal, envío (gratis) y total, actualizado en tiempo real */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 sticky top-24">
              <h2 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Subtotal ({count} bovinos):</span>
                  <span className="font-bold text-stone-900">{formatCOP(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <span>Transporte pecuario:</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Bonificado
                    </span>
                  </div>
                  <span className="font-bold text-emerald-700">GRATIS</span>
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <span>Guía sanitaria ICA:</span>
                  <span className="font-bold text-emerald-700">INCLUIDA</span>
                </div>

                {/* Total Actualizado en tiempo real */}
                <div className="pt-4 border-t border-stone-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-stone-800 block">
                      Total a Pagar:
                    </span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      Pesos colombianos (COP)
                    </span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-[#8B1820]">
                    {formatCOP(total)}
                  </span>
                </div>
              </div>

              {/* Botón "Finalizar compra" */}
              <button
                type="button"
                onClick={() => onNavigate('checkout')}
                className="w-full py-3.5 px-4 bg-[#B3202A] hover:bg-[#8B1820] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Finalizar compra</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Guarantees Box */}
              <div className="pt-2 border-t border-stone-100 space-y-2 text-[11px] text-stone-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Emisión automática de factura única con radicado oficial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Camiones pecuarios con desinfección sanitaria</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
