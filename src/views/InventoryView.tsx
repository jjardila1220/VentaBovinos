import React, { useState, useEffect } from 'react';
import { bovineService, BOVINE_CHANGE_EVENT } from '../services/bovineService.ts';
import { storage } from '../services/storageService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { formatCOP, formatDateTime } from '../utils/formatters.ts';
import { Bovine, InventoryMovement } from '../types/database.ts';
import { 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Layers, 
  ShieldAlert, 
  Plus, 
  Eye, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  XCircle,
  FileText
} from 'lucide-react';

interface InventoryViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onNavigate }) => {
  const { isAdmin, canAccessAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'stock' | 'movimientos'>('stock');

  const [bovines, setBovines] = useState<Bovine[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);

  const loadData = () => {
    setBovines(bovineService.getAll());
    setMovements(storage.getMovements());
  };

  useEffect(() => {
    loadData();
    window.addEventListener(BOVINE_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(BOVINE_CHANGE_EVENT, loadData);
  }, []);

  if (!canAccessAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-sm border border-stone-200 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-[#B3202A]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Acceso Restringido</h2>
        <p className="text-xs text-stone-500">
          La vista de inventario solo está permitida para roles administrativos.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 bg-[#B3202A] text-white rounded-xl text-xs font-bold hover:bg-[#8B1820]"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const disponiblesCount = bovines.filter((b) => b.status === 'Disponible').length;
  const reservadosCount = bovines.filter((b) => b.status === 'Reservado').length;
  const vendidosCount = bovines.filter((b) => b.status === 'Vendido').length;
  const valorInventarioDisponible = bovines
    .filter((b) => b.status === 'Disponible')
    .reduce((sum, b) => sum + b.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top Banner & KPI Summary Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#8B1820] tracking-tight">
            Control de Inventario Ganadero
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitoreo en tiempo real de existencias, reservas y movimientos kárdex.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onNavigate('bovine-form')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#B3202A] hover:bg-[#8B1820] text-white rounded-xl text-xs font-bold shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Ejemplar</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Total en Hato</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">{bovines.length}</span>
          <span className="text-[11px] text-stone-500">Cabezas registradas</span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Disponibles</span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">{disponiblesCount}</span>
          <span className="text-[11px] text-emerald-600">En catálogo activo</span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Reservados</span>
          <span className="text-2xl font-black text-amber-800 mt-1 block">{reservadosCount}</span>
          <span className="text-[11px] text-amber-600">En carritos de compra</span>
        </div>

        <div className="bg-[#F9E3E3]/60 p-4 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B3202A] block">Vendidos</span>
          <span className="text-2xl font-black text-[#8B1820] mt-1 block">{vendidosCount}</span>
          <span className="text-[11px] text-rose-700">Facturados con éxito</span>
        </div>
      </div>

      {/* Tabs: Tabla de Inventario vs Vista de Movimientos */}
      <div className="flex border-b border-stone-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'stock'
              ? 'border-[#B3202A] text-[#B3202A]'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Existencias de Bovinos ({bovines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('movimientos')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'movimientos'
              ? 'border-[#B3202A] text-[#B3202A]'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Vista de Movimientos ({movements.length})</span>
        </button>
      </div>

      {/* Tab 1: Tabla con ID, producto, cantidad, estado (Disponible, Reservado, Vendido) */}
      {activeTab === 'stock' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 uppercase font-bold text-[10px] tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">ID Bovino</th>
                  <th className="py-3 px-4">Producto / Ejemplar</th>
                  <th className="py-3 px-4">Categoría / Raza</th>
                  <th className="py-3 px-4">Peso (kg)</th>
                  <th className="py-3 px-4 text-center">Cantidad</th>
                  <th className="py-3 px-4 text-right">Precio</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {bovines.map((b) => {
                  const isAvailable = b.status === 'Disponible';
                  const isReserved = b.status === 'Reservado';
                  return (
                    <tr key={b.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#8B1820]">{b.id}</td>
                      <td className="py-3 px-4 font-bold text-stone-900">{b.name}</td>
                      <td className="py-3 px-4 text-stone-500">{b.category} • {b.breed}</td>
                      <td className="py-3 px-4 text-stone-700 font-semibold">{b.weight} kg</td>
                      <td className="py-3 px-4 text-center font-bold">
                        {isAvailable ? '1' : isReserved ? '1 (En carrito)' : '0 (Vendido)'}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900">{formatCOP(b.price)}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : isReserved
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onNavigate('detail', { id: b.id })}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-[#B3202A] hover:text-white rounded-lg text-stone-700 text-xs font-semibold transition-colors"
                        >
                          Ficha
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Vista de movimientos: entradas, salidas y ventas, con fecha, tipo, referencia y usuario */}
      {activeTab === 'movimientos' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 uppercase font-bold text-[10px] tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Fecha y Hora</th>
                  <th className="py-3.5 px-4 text-center">Tipo de Movimiento</th>
                  <th className="py-3.5 px-4">Bovino Afectado</th>
                  <th className="py-3.5 px-4">Referencia / Motivo</th>
                  <th className="py-3.5 px-4">Usuario Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {movements.map((m) => {
                  const isVenta = m.type === 'Venta';
                  const isEntrada = m.type === 'Entrada';
                  return (
                    <tr key={m.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-stone-500 font-medium">{formatDateTime(m.date)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isVenta
                              ? 'bg-rose-100 text-[#B3202A]'
                              : isEntrada
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {isVenta ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                          <span>{m.type}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        {m.bovineName} <span className="font-mono text-stone-400 font-normal">({m.bovineId})</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-stone-700">{m.reference}</td>
                      <td className="py-3.5 px-4 text-stone-600 font-medium">{m.user}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
