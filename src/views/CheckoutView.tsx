import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { formatCOP } from '../utils/formatters.ts';
import { BuyerData } from '../types/database.ts';
import { 
  Check, 
  CreditCard, 
  Banknote, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onNavigate }) => {
  const { items, subtotal, shipping, total, completeCheckout } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  // 3 Steps as explicitly specified
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Datos del comprador
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [buyerDoc, setBuyerDoc] = useState('901.442.110-3');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '+57 312 450 9988');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || 'comprador@ganadocarnes.com');
  const [buyerAddress, setBuyerAddress] = useState('Hacienda La Aurora, Km 14 Vía al Mar');
  const [buyerCity, setBuyerCity] = useState('Montería, Córdoba');
  const [buyerNotes, setBuyerNotes] = useState('');

  // Step 2: Método de pago
  const [paymentMethod, setPaymentMethod] = useState('Transferencia Bancaria');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-sm border border-stone-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">No hay productos en el carrito</h2>
        <p className="text-xs text-stone-500">
          Debe seleccionar al menos un bovino del catálogo para iniciar el proceso de checkout.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-5 py-2.5 bg-[#B3202A] text-white rounded-xl text-xs font-bold hover:bg-[#8B1820]"
        >
          Ir al Catálogo
        </button>
      </div>
    );
  }

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!buyerName.trim()) newErrors.buyerName = 'El nombre completo o razón social es obligatorio.';
    if (!buyerDoc.trim()) newErrors.buyerDoc = 'El documento de identidad (Cédula o NIT) es obligatorio.';
    if (!buyerPhone.trim()) newErrors.buyerPhone = 'El número de teléfono móvil es obligatorio.';
    if (!buyerEmail.trim() || !buyerEmail.includes('@')) newErrors.buyerEmail = 'Ingrese un correo electrónico válido.';
    if (!buyerAddress.trim()) newErrors.buyerAddress = 'La dirección del predio o finca es obligatoria.';
    if (!buyerCity.trim()) newErrors.buyerCity = 'El municipio y departamento son obligatorios.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextStep2 = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmPurchase = () => {
    setIsSubmitting(true);
    try {
      const buyerData: BuyerData = {
        name: buyerName.trim(),
        document: buyerDoc.trim(),
        phone: buyerPhone.trim(),
        email: buyerEmail.trim(),
        address: buyerAddress.trim(),
        city: buyerCity.trim(),
        notes: buyerNotes.trim()
      };

      const invoice = completeCheckout(buyerData, paymentMethod);

      // Celebrate confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      showToast(`¡Compra completada con éxito! Factura ${invoice.id} generada.`, 'success');
      onNavigate('invoice', { id: invoice.id });
    } catch (err: any) {
      showToast(err.message || 'Error al completar la compra', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Checkout Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-[#8B1820] tracking-tight">
          Finalización de Compra Pecuaria
        </h1>
        <p className="text-xs text-stone-500">
          Complete los tres pasos obligatorios para emitir la factura oficial y asignar la guía de transporte.
        </p>
      </div>

      {/* 3 Step Wizard Tracker */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex items-center justify-between">
        {[
          { num: 1, title: '1. Datos del comprador' },
          { num: 2, title: '2. Método de pago' },
          { num: 3, title: '3. Confirmación' }
        ].map((step, idx) => {
          const isDone = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          return (
            <React.Fragment key={step.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#B3202A] text-white ring-4 ring-rose-100'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : step.num}
                </div>
                <span className={`text-xs font-bold hidden sm:inline ${
                  isCurrent ? 'text-[#8B1820]' : isDone ? 'text-stone-700' : 'text-stone-400'
                }`}>
                  {step.title}
                </span>
              </div>
              {idx < 2 && (
                <div className={`h-0.5 flex-1 mx-3 ${currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-stone-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Wizard Content Cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
        
        {/* PASO 1: Datos del comprador */}
        {currentStep === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Paso 1: Información del Comprador y Predio de Destino
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Estos datos se imprimirán en el comprobante fiscal y en la guía oficial de movilización de ganado del ICA.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nombre Completo / Razón Social *
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Ej. Inversiones Ganaderas El Trébol"
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    errors.buyerName ? 'border-red-500 bg-red-50' : 'border-stone-200 focus:ring-2 focus:ring-rose-300'
                  }`}
                />
                {errors.buyerName && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.buyerName}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Cédula de Ciudadanía o NIT *
                </label>
                <input
                  type="text"
                  value={buyerDoc}
                  onChange={(e) => setBuyerDoc(e.target.value)}
                  placeholder="Ej. 901.442.110-3 o 71.290.443"
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    errors.buyerDoc ? 'border-red-500 bg-red-50' : 'border-stone-200 focus:ring-2 focus:ring-rose-300'
                  }`}
                />
                {errors.buyerDoc && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.buyerDoc}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Teléfono Móvil de Contacto *
                </label>
                <input
                  type="text"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+57 310 000 0000"
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    errors.buyerPhone ? 'border-red-500 bg-red-50' : 'border-stone-200 focus:ring-2 focus:ring-rose-300'
                  }`}
                />
                {errors.buyerPhone && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.buyerPhone}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Correo Electrónico para Factura Electrónica *
                </label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="comprador@empresa.com"
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    errors.buyerEmail ? 'border-red-500 bg-red-50' : 'border-stone-200 focus:ring-2 focus:ring-rose-300'
                  }`}
                />
                {errors.buyerEmail && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.buyerEmail}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 mb-1">
                  Nombre de la Finca / Predio / Dirección de Desembarque *
                </label>
                <input
                  type="text"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  placeholder="Ej. Finca El Porvenir, Vereda El Salado, Km 8"
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    errors.buyerAddress ? 'border-red-500 bg-red-50' : 'border-stone-200 focus:ring-2 focus:ring-rose-300'
                  }`}
                />
                {errors.buyerAddress && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.buyerAddress}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 mb-1">
                  Municipio y Departamento de Destino *
                </label>
                <input
                  type="text"
                  value={buyerCity}
                  onChange={(e) => setBuyerCity(e.target.value)}
                  placeholder="Ej. Montería, Córdoba"
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    errors.buyerCity ? 'border-red-500 bg-red-50' : 'border-stone-200 focus:ring-2 focus:ring-rose-300'
                  }`}
                />
                {errors.buyerCity && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.buyerCity}</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigate('cart')}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
              >
                Volver al Carrito
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <span>Continuar a Método de Pago</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* PASO 2: Método de pago */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Paso 2: Selección de Método de Pago
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Elija la modalidad para formalizar la adquisición pecuaria.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: 'Transferencia Bancaria',
                  title: 'Transferencia Bancaria',
                  desc: 'Bancolombia, Davivienda o Banco Agrario. Certificación contra entrega.',
                  icon: Building2
                },
                {
                  id: 'Efectivo en Predio',
                  title: 'Efectivo contra Entrega en Predio',
                  desc: 'Pago directo al momento de verificar báscula y desembarque.',
                  icon: Banknote
                },
                {
                  id: 'Tarjeta de Crédito',
                  title: 'Tarjeta de Crédito',
                  desc: 'Visa, MasterCard, American Express. Pagos diferidos.',
                  icon: CreditCard
                },
                {
                  id: 'Tarjeta Débito (PSE)',
                  title: 'Tarjeta Débito / PSE',
                  desc: 'Débito seguro desde cualquier entidad bancaria colombiana.',
                  icon: CreditCard
                }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-[#B3202A] bg-[#F9E3E3] ring-2 ring-rose-200 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${
                      isSelected ? 'bg-[#B3202A] text-white' : 'bg-stone-100 text-stone-500'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">{m.title}</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Instrucciones de Despacho o Notas Adicionales (Opcional)
              </label>
              <textarea
                rows={2}
                value={buyerNotes}
                onChange={(e) => setBuyerNotes(e.target.value)}
                placeholder="Ej. Entregar en la mañana. Contactar al mayordomo Don Pedro al llegar."
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Datos del Comprador</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                className="px-6 py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <span>Revisar y Confirmar Pedido</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Confirmación */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Paso 3: Confirmación Final de la Compra
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Revise cuidadosamente el resumen antes de generar el comprobante oficial.
              </p>
            </div>

            {/* Buyer recap */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Comprador</span>
                <p className="font-bold text-stone-900 text-sm mt-0.5">{buyerName}</p>
                <p className="text-stone-600">NIT / CC: {buyerDoc}</p>
                <p className="text-stone-600">{buyerPhone} • {buyerEmail}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Destino y Pago</span>
                <p className="font-bold text-stone-900 mt-0.5">{buyerAddress}</p>
                <p className="text-stone-600">{buyerCity}</p>
                <p className="text-emerald-700 font-semibold mt-1">Método: {paymentMethod}</p>
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Bovinos a Facturar ({items.length})
              </span>
              <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 text-xs">
                {items.map((b) => (
                  <div key={b.id} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <p className="font-bold text-stone-900">{b.name}</p>
                      <p className="text-[11px] text-stone-500">{b.id} • Raza {b.breed} • {b.weight} kg</p>
                    </div>
                    <span className="font-bold text-[#B3202A]">{formatCOP(b.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Totals Box */}
            <div className="p-5 bg-[#F9E3E3] rounded-2xl border border-rose-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-700">
                <span>Subtotal ({items.length} cabezas):</span>
                <span className="font-bold">{formatCOP(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Transporte pecuario especializado:</span>
                <span className="font-bold text-emerald-800">GRATIS</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Expedición de factura única & guía ICA:</span>
                <span className="font-bold text-emerald-800">INCLUIDA</span>
              </div>
              <div className="pt-3 border-t border-rose-300 flex justify-between text-base font-black text-[#8B1820]">
                <span>TOTAL A PAGAR:</span>
                <span className="text-2xl">{formatCOP(total)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Método de Pago</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmPurchase}
                className="px-8 py-3 bg-[#B3202A] hover:bg-[#8B1820] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Generando Factura...' : 'Confirmar Compra y Generar Factura'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
