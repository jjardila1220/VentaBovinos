import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { useState } from "react";
import { requireAdmin } from "~/services/auth.server.ts";
import { getConsolidatedReport } from "~/services/reports.server.ts";
import { formatCOP, formatDate } from "~/utils/formatters.ts";
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  ChevronRight,
  PieChart,
  Sparkles
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const url = new URL(request.url);

  const type = (url.searchParams.get("type") as any) || "Ventas";
  const startDate = url.searchParams.get("startDate") || "";
  const endDate = url.searchParams.get("endDate") || "";

  try {
    const reportData = await getConsolidatedReport(type, startDate || undefined, endDate || undefined);
    return json({
      report: reportData,
      filters: { type, startDate, endDate },
    });
  } catch (error) {
    console.error("Reports loader error:", error);
    return json({
      report: {
        type: "Ventas",
        totalRevenue: 0,
        invoiceCount: 0,
        averageTicket: 0,
        itemsSold: 0,
        categoryStats: {},
        salesList: [],
      },
      filters: { type, startDate, endDate },
    });
  }
}

export default function Reportes() {
  const { report, filters } = useLoaderData<typeof loader>();

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (report.type === "Ventas" && (report as any).salesList) {
      csvContent += "Factura,Fecha,Cliente,Metodo,Total,Estado\n";
      (report as any).salesList.forEach((s: any) => {
        csvContent += `"${s.invoiceNumber}","${s.date}","${s.clientName}","${s.paymentMethod}","${s.total}","${s.status}"\n`;
      });
    } else if (report.type === "Inventario" && (report as any).bovineList) {
      csvContent += "ID,Nombre,Categoria,Peso,Precio,Estado\n";
      (report as any).bovineList.forEach((b: any) => {
        csvContent += `"${b.id}","${b.name}","${b.category}","${b.weight}","${b.price}","${b.status}"\n`;
      });
    } else if (report.type === "Movimientos" && (report as any).movementsList) {
      csvContent += "ID,Fecha,Tipo,Referencia,Cantidad,Usuario\n";
      (report as any).movementsList.forEach((m: any) => {
        csvContent += `"${m.id}","${m.createdAt}","${m.type}","${m.reference}","${m.quantity}","${m.userName || 'Sistema'}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_${report.type}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isVentas = report.type === "Ventas";
  const categoryStats = isVentas ? (report as any).categoryStats || {} : {};
  const maxCategoryTotal = Math.max(...Object.values(categoryStats).map((v: any) => v.total || 0), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link to="/" className="hover:text-[#B3202A]">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-bold">Reportes Consolidados</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#B3202A] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulo de Inteligencia de Negocio & Auditoría</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#B3202A]" />
            <span>Reportes Consolidados</span>
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Analítica de facturación, rotación de hato y balance de existencias con exportación a CSV.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadCSV}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Exportar a CSV</span>
        </button>
      </div>

      {/* Selector de Tipo y Rango de Fechas */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-200">
        <Form method="get" className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs items-end">
          <div className="space-y-1 sm:col-span-1">
            <label className="font-bold text-stone-700 block">Tipo de Reporte</label>
            <select
              name="type"
              defaultValue={filters.type}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            >
              <option value="Ventas">Ventas por Período</option>
              <option value="Inventario">Inventario Actual</option>
              <option value="Movimientos">Movimientos de Ganado</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">Fecha Inicio</label>
            <input
              type="date"
              name="startDate"
              defaultValue={filters.startDate}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">Fecha Fin</label>
            <input
              type="date"
              name="endDate"
              defaultValue={filters.endDate}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Generar Reporte</span>
          </button>
        </Form>
      </div>

      {/* REPORTE DE VENTAS */}
      {isVentas && (
        <div className="space-y-6">
          {/* Métricas Clave */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase block">Ingresos Totales</span>
              <p className="text-2xl font-black text-[#B3202A]">
                {formatCOP((report as any).totalRevenue || 0)}
              </p>
              <span className="text-[10px] text-stone-500">Facturación acumulada</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase block">Facturas Emitidas</span>
              <p className="text-2xl font-black text-stone-900">
                {(report as any).invoiceCount || 0}
              </p>
              <span className="text-[10px] text-stone-500">Transacciones completadas</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase block">Ticket Promedio</span>
              <p className="text-2xl font-black text-stone-800">
                {formatCOP((report as any).averageTicket || 0)}
              </p>
              <span className="text-[10px] text-stone-500">Valor medio por pedido</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase block">Cabezas Comercializadas</span>
              <p className="text-2xl font-black text-emerald-700">
                {(report as any).itemsSold || 0} unidades
              </p>
              <span className="text-[10px] text-emerald-800">Rotación de ejemplares</span>
            </div>
          </div>

          {/* Gráfico de Barras Responsivo con CSS/SVG Nativo */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="font-black text-stone-900 text-sm">
                Ventas por Categoría de Bovino (COP)
              </h3>
              <span className="text-[11px] text-stone-500">Distribución de ingresos</span>
            </div>

            <div className="space-y-4 pt-2">
              {Object.entries(categoryStats).map(([cat, data]: [string, any]) => {
                const percentage = Math.round((data.total / maxCategoryTotal) * 100);

                return (
                  <div key={cat} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold text-stone-800">
                      <span>{cat} ({data.count} cabezas)</span>
                      <span className="text-[#B3202A]">{formatCOP(data.total)}</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#B3202A] to-[#8B1820] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* REPORTE DE INVENTARIO */}
      {report.type === "Inventario" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
          <h3 className="font-black text-stone-900 text-sm">Resumen de Existencias</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
              <span className="text-[10px] font-bold text-stone-400 uppercase">Total Hato</span>
              <p className="text-xl font-black text-stone-900">{(report as any).total}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Disponibles</span>
              <p className="text-xl font-black text-emerald-700">{(report as any).disponibles}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <span className="text-[10px] font-bold text-amber-800 uppercase">Reservados</span>
              <p className="text-xl font-black text-amber-700">{(report as any).reservados}</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <span className="text-[10px] font-bold text-rose-800 uppercase">Valor Disponible</span>
              <p className="text-xl font-black text-[#B3202A]">{formatCOP((report as any).valorTotal || 0)}</p>
            </div>
          </div>
        </div>
      )}

      {/* REPORTE DE MOVIMIENTOS */}
      {report.type === "Movimientos" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-4">
          <h3 className="font-black text-stone-900 text-sm">Registro de Movimientos (Kárdex)</h3>
          <p className="text-xs text-stone-500">
            Total de movimientos registrados en el período: {(report as any).movementsList?.length || 0}
          </p>
        </div>
      )}
    </div>
  );
}
