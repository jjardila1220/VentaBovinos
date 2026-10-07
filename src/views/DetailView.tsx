import React, { useState, useEffect } from 'react';
import { bovineService } from '../services/bovineService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { formatCOP, formatDate } from '../utils/formatters.ts';
import { Bovine } from '../types/database.ts';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.tsx';
import { 
  ChevronRight, 
  ShoppingBag, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Scale, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';

interface DetailViewProps {
  bovineId: string;
  onNavigate: (view: string, params?: any) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ bovineId, onNavigate }) => {
  const { isAdmin } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { showToast } = useToast();

  const [bovine, setBovine] = useState<Bovine | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'descripcion' | 'caracteristicas' | 'ubicacion'>('descripcion');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const item = bovineService.getById(bovineId);
    if (item) {
      setBovine(item);
      setActiveImageIndex(0);
    }
  }, [bovineId]);

  if (!bovine) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-[#B3202A]">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Bovino no encontrado</h2>
        <p className="text-xs text-stone-500">
          El ejemplar solicitado con ID "{bovineId}" no existe en el registro pecuario o fue dado de baja.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-5 py-2.5 bg-[#B3202A] text-white rounded-xl text-xs font-bold hover:bg-[#8B1820]"
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  const isAvailable = bovine.status === 'Disponible';
  const isReserved = bovine.status === 'Reservado';
  const isSold = bovine.status === 'Vendido';
  const inCart = isInCart(bovine.id);

  const handleAddToCart = () => {
    const result = addToCart(bovine);
    if (result.success) {
      showToast(`¡${bovine.name} agregado al carrito de compras!`, 'success');
      // Refresh local state to show 'Reservado'
      const updated = bovineService.getById(bovine.id);
      if (updated) setBovine(updated);
    } else {
      showToast(result.message || 'No se pudo agregar al carrito', 'error');
    }
  };

  const handleDeleteConfirm = () => {
    setDeleteLoading(true);
    try {
      bovineService.delete(bovine.id);
      showToast(`Ejemplar ${bovine.id} eliminado correctamente del inventario.`, 'info');
      setDeleteModalOpen(false);
      onNavigate('catalog');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar bovino', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate('home')} className="hover:text-[#B3202A]">
            Inicio
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <button onClick={() => onNavigate('catalog')} className="hover:text-[#B3202A]">
            Bovinos
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-semibold text-stone-800">{bovine.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#B3202A] font-bold">{bovine.id}</span>
        </div>

        <button
          onClick={() => onNavigate('catalog')}
          className="flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-[#B3202A]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Catálogo</span>
        </button>
      </div>

      {/* Main Detail Grid (Pantalla 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Gallery (Imagen principal y miniaturas) - 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-stone-100 shadow-md border border-stone-200">
            <img
              src={bovine.images[activeImageIndex] || bovine.images[0]}
              alt={bovine.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {/* Status indicator on image */}
            <div className="absolute top-4 right-4">
              <span
                className={`text-xs font-black uppercase px-3 py-1 rounded-full shadow-lg tracking-wider ${
                  isAvailable
                    ? 'bg-emerald-600 text-white'
                    : isReserved
                    ? 'bg-amber-500 text-white'
                    : 'bg-[#B3202A] text-white'
                }`}
              >
                {bovine.status}
              </span>
            </div>

            {/* Unique ID Badge */}
            <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-xs text-white text-xs font-mono font-bold px-3 py-1 rounded-lg">
              ID: {bovine.id}
            </div>
          </div>

          {/* Thumbnails Gallery (miniaturas) */}
          {bovine.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {bovine.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-[#B3202A] ring-2 ring-rose-200 scale-105'
                      : 'border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Tabs Section: Descripción, Características, Ubicación */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex border-b border-stone-200 gap-6">
              {[
                { id: 'descripcion', label: 'Descripción' },
                { id: 'caracteristicas', label: 'Características' },
                { id: 'ubicacion', label: 'Ubicación' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-[#B3202A] text-[#B3202A]'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Descripción */}
            {activeTab === 'descripcion' && (
              <div className="text-xs text-stone-600 space-y-3 leading-relaxed">
                <p className="font-semibold text-stone-800 text-sm">
                  {bovine.shortDescription}
                </p>
                <p>{bovine.fullDescription}</p>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-[11px] text-stone-500">
                  Registrado oficialmente el: <strong>{formatDate(bovine.registerDay)}</strong> en el sistema ganadero GanadoCarnes.
                </div>
              </div>
            )}

            {/* Tab 2: Características */}
            {activeTab === 'caracteristicas' && (
              <div className="space-y-3 text-xs">
                <p className="text-stone-500 font-medium">Puntos zootécnicos destacados del ejemplar:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {bovine.characteristics.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Ubicación */}
            {activeTab === 'ubicacion' && (
              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100 text-stone-800">
                  <MapPin className="w-5 h-5 text-[#B3202A] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{bovine.location}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Predio ganadero registrado ante el ICA con corral de manejo para pesaje previo a despacho.
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500">
                  El transporte se coordina de manera directa hacia cualquier municipio o departamento con guía de movilización digital.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Commercial & Attributes Card - 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
            
            {/* Top Identity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  {bovine.category} • Raza {bovine.breed}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isAvailable
                      ? 'bg-emerald-100 text-emerald-800'
                      : isReserved
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {bovine.status}
                </span>
              </div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                {bovine.name}
              </h1>
              <p className="text-xs text-stone-500 italic">
                {bovine.shortDescription}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-[#F9E3E3] rounded-2xl border border-rose-200 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B3202A] block">
                  Precio de Venta
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#8B1820]">
                  {formatCOP(bovine.price)}
                </span>
              </div>
              <span className="text-xs text-[#B3202A] font-semibold">
                (Pesos Colombianos)
              </span>
            </div>

            {/* Cart Button or Reason if not available (Requirement Pantalla 3) */}
            <div className="space-y-2">
              {isAvailable ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={inCart}
                  className="w-full py-3.5 px-4 bg-[#B3202A] hover:bg-[#8B1820] disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{inCart ? 'Ya está en el Carrito' : 'Agregar al carrito'}</span>
                </button>
              ) : (
                /* Motivo y botón deshabilitado si no está disponible */
                <div className="space-y-2">
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-stone-200 text-stone-400 font-bold text-sm rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>No Disponible para Venta</span>
                  </button>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                      <strong>Motivo: </strong> 
                      {isReserved 
                        ? 'Este ejemplar se encuentra reservado en el carrito de un comprador en proceso de pago.'
                        : 'Este ejemplar ya ha sido vendido y facturado.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tabla de atributos (ID, raza, sexo, edad, peso, color, ubicación, fecha de registro, historial sanitario resumido) */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Ficha Técnica y Sanitaria
              </h3>
              
              <div className="overflow-hidden rounded-xl border border-stone-200 text-xs">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    <tr className="bg-stone-50/50">
                      <td className="py-2.5 px-3 font-semibold text-stone-500 w-1/3">Identificador (ID)</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-stone-900">{bovine.id}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-stone-500">Raza</td>
                      <td className="py-2.5 px-3 font-medium text-stone-900">{bovine.breed}</td>
                    </tr>
                    <tr className="bg-stone-50/50">
                      <td className="py-2.5 px-3 font-semibold text-stone-500">Sexo</td>
                      <td className="py-2.5 px-3 font-medium text-stone-900">{bovine.sex}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-stone-500">Edad Calculada</td>
                      <td className="py-2.5 px-3 font-medium text-stone-900">{bovine.age} meses</td>
                    </tr>
                    <tr className="bg-stone-50/50">
                      <td className="py-2.5 px-3 font-semibold text-stone-500">Peso en Báscula</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-800">{bovine.weight} kg</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-stone-500">Color y Capa</td>
                      <td className="py-2.5 px-3 font-medium text-stone-900">{bovine.color}</td>
                    </tr>
                    <tr className="bg-stone-50/50">
                      <td className="py-2.5 px-3 font-semibold text-stone-500">Ubicación</td>
                      <td className="py-2.5 px-3 font-medium text-stone-900">{bovine.location}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-stone-500">Fecha de Registro</td>
                      <td className="py-2.5 px-3 font-medium text-stone-900">{formatDate(bovine.registerDay)}</td>
                    </tr>
                    <tr className="bg-stone-50/50">
                      <td className="py-2.5 px-3 font-semibold text-stone-500">Registro ICA</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-stone-800">
                        {bovine.healthHistory.sanitaryRegistry}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-stone-500">Vacuna Fiebre Aftosa</td>
                      <td className="py-2.5 px-3 text-stone-800 font-medium">{formatDate(bovine.healthHistory.aftosaVaccine)}</td>
                    </tr>
                    <tr className="bg-stone-50/50">
                      <td className="py-2.5 px-3 font-semibold text-stone-500">Desparasitación</td>
                      <td className="py-2.5 px-3 text-stone-800 font-medium">{formatDate(bovine.healthHistory.dewormingDate)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Solo para administradores: botones "Editar" y "Eliminar" (con modal de confirmación) */}
            {isAdmin && (
              <div className="pt-4 border-t border-stone-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                  Acciones Administrativas
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('bovine-form', { id: bovine.id })}
                    className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-600" />
                    <span>Editar Bovino</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-[#B3202A] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#B3202A]" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="¿Eliminar Bovino del Sistema?"
        message={`¿Está seguro de que desea eliminar permanentemente a "${bovine.name}" (${bovine.id}) del catálogo pecuario?`}
        itemName={`${bovine.id} - ${bovine.name} (${bovine.breed}, ${bovine.weight} kg)`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
        loading={deleteLoading}
      />
    </div>
  );
};
