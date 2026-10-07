import React, { useState, useMemo } from 'react';
import { salesService } from '../services/salesService.ts';
import { bovineService } from '../services/bovineService.ts';
import { storage } from '../services/storageService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { formatCOP, formatDate } from '../utils/formatters.ts';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  ShieldAlert, 
  Filter, 
  TrendingUp, 
  PieChart, 
  Layers, 
  DollarSign
} from 'lucide-react';

interface ReportsViewProps {
  onNavigate: (view: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onNavigate }) => {
  const { isAdmin } = useAuth();

  // Selector de tipo (Ventas, Inventario, Movimientos)
  const [reportType, setReportType] = useState<'Ventas' | 'Inventario' | 'Movimientos'>('Ventas');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Guard: Solo Administrador
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-sm border border-stone-200 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-[#B3202A]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Acceso Restringido</h2>
        <p className="text-xs text-stone-500">
          Los reportes consolidados son de acceso exclusivo para la Gerencia y Administración.
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

  // Data queries
  const allInvoices = salesService.getInvoices();
  const allBovines = bovineService.getAll();
  const allMovements = storage.getMovements();

  // Filtered invoices by date
  const filteredInvoices = useMemo(() => {
    return allInvoices.filter((inv) => {
      const d = new Date(inv.date);
      if (startDate && d < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  }, [allInvoices, startDate, endDate]);

  // Calculate Metrics
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalBovinesSold = filteredInvoices.reduce((sum, inv) => sum + inv.items.length, 0);
  const averageTicket = filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0;

  // Bar Chart Data: Sales by Category / Breed
  const salesByCategory = useMemo(() => {
    const counts: Record<string, { count: number; total: number }> = {
      'Vacas lecheras': { count: 0, total: 0 },
      'Novillos': { count: 0, total: 0 },
      'Terneros': { count: 0, total: 0 },
      'Toros': { count: 0, total: 0 }
    };

    filteredInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        if (counts[item.category]) {
          counts[item.category].count += 1;
          counts[item.category].total += item.price;
        } else {
          counts[item.category] = { count: 1, total: item.price };
        }
      });
    });

    const maxTotal = Math.max(...Object.values(counts).map((c) => c.total), 1);

    return Object.entries(counts).map(([name, data]) => ({
      name,
      count: data.count,
      total: data.total,
      percentage: Math.round((data.total / maxTotal) * 100)
    }));
  }, [filteredInvoices]);

  // Export to CSV Function
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'Ventas') {
      csvContent += 'Factura,Fecha,Cliente,Documento,Bovinos_Vendidos,Metodo_Pago,Total_COP,Estado\n';
      filteredInvoices.forEach((inv) => {
        const itemNames = inv.items.map((i) => `${i.name} (${i.bovineId})`).join('; ');
        csvContent += `"${inv.id}","${inv.date}","${inv.buyer.name}","${inv.buyer.document}","${itemNames}","${inv.paymentMethod}","${inv.total}","${inv.status}"\n`;
      });
    } else if (reportType === 'Inventario') {
      csvContent += 'ID,Nombre,Categoria,Raza,Sexo,Peso_kg,Edad_meses,Precio_COP,Estado,Ubicacion\n';
      allBovines.forEach((b) => {
        csvContent += `"${b.id}","${b.name}","${b.category}","${b.breed}","${b.sex}","${b.weight}","${b.age}","${b.price}","${b.status}","${b.location}"\n`;
      });
    } else {
      csvContent += 'ID_Movimiento,Fecha,Tipo,Bovino,Referencia,Usuario\n';
      allMovements.forEach((m) => {
        csvContent += `"${m.id}","${m.date}","${m.type}","${m.bovineName} (${m.bovineId})","${m.reference}","${m.user}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ganadocarnes_${reportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#8B1820] tracking-tight">
            Reportes Consolidados
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Análisis financiero, evolución de ventas y rotación de inventario en pie.
          </p>
        </div>

        {/* Export to CSV Button */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Exportar a CSV ({reportType})</span>
        </button>
      </div>

      {/* Selector de Tipo & Rango de Fechas (Requirement Pantalla 11) */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          
          {/* Selector de tipo (Ventas, Inventario, Movimientos) */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Tipo de Reporte *
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-bold text-[#8B1820] focus:ring-2 focus:ring-rose-300 focus:outline-none"
            >
              <option value="Ventas">Reporte Consolidado de Ventas</option>
              <option value="Inventario">Balance de Inventario Pecuario</option>
              <option value="Movimientos">Registro Kárdex de Movimientos</option>
            </select>
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Fecha Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:outline-none"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Fecha Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:outline-none"
            />
          </div>

          {/* Botón "Generar" */}
          <div className="flex items-end">
            <button
              onClick={() => {}}
              className="w-full py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Generar Reporte</span>
            </button>
          </div>

        </div>
      </div>

      {/* KPI Totales (Tarjetas con totales) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Ingresos por Ventas
          </span>
          <p className="text-xl sm:text-2xl font-black text-[#8B1820]">
            {formatCOP(totalRevenue)}
          </p>
          <span className="text-[11px] text-stone-500">En el período seleccionado</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Cabezas Vendidas
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-800">
            {totalBovinesSold} ejemplares
          </p>
          <span className="text-[11px] text-stone-500">Despachos formalizados</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Ticket Promedio
          </span>
          <p className="text-xl sm:text-2xl font-black text-stone-900">
            {formatCOP(averageTicket)}
          </p>
          <span className="text-[11px] text-stone-500">Por factura emitida</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Facturas Emitidas
          </span>
          <p className="text-xl sm:text-2xl font-black text-stone-900">
            {filteredInvoices.length} comprobantes
          </p>
          <span className="text-[11px] text-stone-500">Trazabilidad completa</span>
        </div>
      </div>

      {/* Gráfico de barras por producto / categoría (Responsive Bar Chart) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Distribución de Facturación por Categoría de Ganado
            </h2>
            <p className="text-xs text-stone-500">
              Volumen de ingresos captados por tipo de ejemplar en pesos colombianos (COP).
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-400">Valores en COP</span>
        </div>

        {/* Visual Responsive Bar Chart */}
        <div className="space-y-4 pt-2">
          {salesByCategory.map((cat) => (
            <div key={cat.name} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800">{cat.name} ({cat.count} vendidos)</span>
                <span className="font-mono font-bold text-[#8B1820]">{formatCOP(cat.total)}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-4 overflow-hidden p-0.5 border border-stone-200">
                <div
                  className="bg-gradient-to-r from-[#B3202A] to-[#8B1820] h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(cat.percentage, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table for current report type */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
            Detalle Consolidado: {reportType}
          </h3>
          <span className="text-[11px] text-stone-400">
            {reportType === 'Ventas'
              ? `${filteredInvoices.length} facturas`
              : reportType === 'Inventario'
              ? `${allBovines.length} bovinos`
              : `${allMovements.length} movimientos`}
          </span>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'Ventas' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Factura</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Comprador</th>
                  <th className="py-3 px-4">Bovinos</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#8B1820]">{inv.id}</td>
                    <td className="py-2.5 px-4 text-stone-500">{formatDate(inv.date)}</td>
                    <td className="py-2.5 px-4 font-semibold text-stone-800">{inv.buyer.name}</td>
                    <td className="py-2.5 px-4">{inv.items.map((i) => i.name).join(', ')}</td>
                    <td className="py-2.5 px-4 text-right font-black">{formatCOP(inv.total)}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reportType === 'Inventario' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Ejemplar</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Raza</th>
                  <th className="py-3 px-4">Peso</th>
                  <th className="py-3 px-4 text-right">Precio</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {allBovines.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#8B1820]">{b.id}</td>
                    <td className="py-2.5 px-4 font-bold text-stone-800">{b.name}</td>
                    <td className="py-2.5 px-4 text-stone-600">{b.category}</td>
                    <td className="py-2.5 px-4 text-stone-600">{b.breed}</td>
                    <td className="py-2.5 px-4 text-stone-600">{b.weight} kg</td>
                    <td className="py-2.5 px-4 text-right font-black">{formatCOP(b.price)}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'Disponible' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4 text-center">Tipo</th>
                  <th className="py-3 px-4">Bovino</th>
                  <th className="py-3 px-4">Referencia</th>
                  <th className="py-3 px-4">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {allMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-4 text-stone-500">{formatDate(m.date)}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-rose-800">{m.type}</td>
                    <td className="py-2.5 px-4 font-bold text-stone-800">{m.bovineName}</td>
                    <td className="py-2.5 px-4 font-mono">{m.reference}</td>
                    <td className="py-2.5 px-4 text-stone-600">{m.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
