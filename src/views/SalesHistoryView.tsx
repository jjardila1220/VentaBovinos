import React, { useState, useEffect } from 'react';
import { salesService } from '../services/salesService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { formatCOP, formatDateTime } from '../utils/formatters.ts';
import { Invoice } from '../types/database.ts';
import { 
  FileText, 
  Search, 
  Filter, 
  RotateCcw, 
  ShieldAlert, 
  Eye, 
  ChevronRight, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface SalesHistoryViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({ onNavigate }) => {
  const { canAccessAdmin, user } = useAuth();

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [productQuery, setProductQuery] = useState('');

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Pagination (6 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const loadData = () => {
    const list = salesService.getInvoices({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: statusFilter,
      invoiceNumber: invoiceQuery,
      bovineQuery: productQuery
    });
    setInvoices(list);
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate, statusFilter, invoiceQuery, productQuery]);

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setStatusFilter('Todos');
    setInvoiceQuery('');
    setProductQuery('');
    setCurrentPage(1);
  };

  // Guard: Administrador y Vendedor
  if (!canAccessAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-sm border border-stone-200 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-[#B3202A]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Acceso Restringido</h2>
        <p className="text-xs text-stone-500">
          El historial de ventas sólo está disponible para roles de <strong>Administrador</strong> y <strong>Vendedor</strong>.
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

  const totalPages = Math.ceil(invoices.length / ITEMS_PER_PAGE) || 1;
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#8B1820] tracking-tight">
              Historial de Ventas
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#B3202A] border border-rose-200">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Consulta y auditoría de todas las transacciones, facturas y comprobantes emitidos.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-stone-500">Total facturado registrado: </span>
          <span className="text-base font-black text-[#8B1820] block sm:inline">
            {formatCOP(invoices.reduce((a, b) => a + b.total, 0))}
          </span>
        </div>
      </div>

      {/* Filters Bar (Pantalla 9) */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#B3202A]" />
            Filtros del Historial
          </span>
          <button
            onClick={handleReset}
            className="text-[11px] font-semibold text-stone-500 hover:text-[#B3202A] flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar filtros</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Fecha Inicio */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>

          {/* Estado (Completado, En proceso, Cancelado) */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Estado de Factura
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-rose-400"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Completado">Completado</option>
              <option value="En proceso">En proceso</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {/* Número de factura */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Número de Factura
            </label>
            <input
              type="text"
              placeholder="Ej. FAC-2026-000001"
              value={invoiceQuery}
              onChange={(e) => setInvoiceQuery(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>

          {/* Producto / Bovino */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Producto o Bovino
            </label>
            <input
              type="text"
              placeholder="Ej. Holstein, Angus o ID"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>
        </div>
      </div>

      {/* Sales Table (Pantalla 9: fecha, factura, producto, cantidad, total y estado. Clic abre comprobante) */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {paginatedInvoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="font-bold text-stone-700 text-sm">No se encontraron ventas registradas</p>
            <p className="text-xs text-stone-400">Intente modificar los filtros o fechas seleccionadas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 uppercase font-bold text-[10px] tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Fecha y Hora</th>
                  <th className="py-3.5 px-4">Factura</th>
                  <th className="py-3.5 px-4">Cliente / Comprador</th>
                  <th className="py-3.5 px-4">Producto(s) / Bovino(s)</th>
                  <th className="py-3.5 px-4 text-center">Cant.</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {paginatedInvoices.map((inv) => {
                  const isCompleted = inv.status === 'Completado';
                  const isCancelled = inv.status === 'Cancelado';
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => onNavigate('invoice', { id: inv.id })}
                      className="hover:bg-rose-50/50 cursor-pointer transition-colors group"
                      title="Haga clic para ver el comprobante completo"
                    >
                      <td className="py-3.5 px-4 text-stone-500 font-medium">
                        {formatDateTime(inv.date)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#8B1820] group-hover:underline">
                        {inv.id}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        {inv.buyer.name}
                        <span className="block text-[10px] text-stone-400 font-normal">
                          {inv.buyer.city}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {inv.items.map((item, i) => (
                            <div key={i} className="truncate max-w-xs">
                              <span className="font-semibold text-stone-900">{item.name}</span>
                              <span className="text-[10px] text-stone-400 ml-1.5">({item.bovineId})</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-stone-700">
                        {inv.items.length}
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-stone-900">
                        {formatCOP(inv.total)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCancelled
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-600" />
                          )}
                          <span>{inv.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('invoice', { id: inv.id });
                          }}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-[#B3202A] hover:text-white rounded-lg text-stone-700 text-xs font-semibold transition-colors"
                        >
                          Ver Factura
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-500">
              Página {currentPage} de {totalPages} ({invoices.length} facturas)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
