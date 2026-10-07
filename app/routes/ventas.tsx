import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, Link, Form } from "@remix-run/react";
import { requireStaff } from "~/services/auth.server.ts";
import { getSalesHistory } from "~/services/sales.server.ts";
import { formatCOP, formatDateTime } from "~/utils/formatters.ts";
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw,
  Sparkles
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireStaff(request);
  const url = new URL(request.url);

  const startDate = url.searchParams.get("startDate") || "";
  const endDate = url.searchParams.get("endDate") || "";
  const status = url.searchParams.get("status") || "Todos";
  const invoiceNumber = url.searchParams.get("invoiceNumber") || "";
  const pageStr = url.searchParams.get("page") || "1";
  const page = parseInt(pageStr, 10) || 1;

  try {
    const result = await getSalesHistory({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: status !== "Todos" ? status : undefined,
      invoiceNumber: invoiceNumber.trim() || undefined,
      page,
      limit: 10,
    });

    return json({
      sales: result.items,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      filters: {
        startDate,
        endDate,
        status,
        invoiceNumber,
      },
    });
  } catch (error) {
    console.error("Sales history loader error:", error);
    return json({
      sales: [],
      total: 0,
      page: 1,
      totalPages: 1,
      filters: {
        startDate,
        endDate,
        status,
        invoiceNumber,
      },
    });
  }
}

export default function VentasHistorial() {
  const { sales, total, page, totalPages, filters } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const createPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    return `?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link to="/" className="hover:text-[#B3202A]">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-bold">Historial de Ventas</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#B3202A] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulo Comercial & Facturación</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#B3202A]" />
            <span>Historial de Ventas</span>
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Consulta y audita todas las transacciones realizadas, comprobantes emitidos y estado de las órdenes.
          </p>
        </div>

        <div className="text-xs font-semibold text-stone-500">
          Total registradas: <span className="text-[#B3202A] font-bold text-sm">{total}</span> ventas
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-200">
        <Form method="get" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs items-end">
          {/* N° Comprobante o Cliente */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">N° Factura o Comprobante</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                name="invoiceNumber"
                defaultValue={filters.invoiceNumber}
                placeholder="FAC-2026-..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
              />
            </div>
          </div>

          {/* Fecha Inicio */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">Desde</label>
            <input
              type="date"
              name="startDate"
              defaultValue={filters.startDate}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>

          {/* Fecha Fin */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">Hasta</label>
            <input
              type="date"
              name="endDate"
              defaultValue={filters.endDate}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>

          {/* Estado */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">Estado</label>
            <select
              name="status"
              defaultValue={filters.status}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Completado">Completado</option>
              <option value="En proceso">En proceso</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrar</span>
            </button>
            <Link
              to="/ventas"
              className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors"
              title="Restablecer filtros"
            >
              <RotateCcw className="w-4 h-4" />
            </Link>
          </div>
        </Form>
      </div>

      {/* Tabla de Ventas */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 font-bold">N° Factura</th>
                <th className="py-3.5 px-4 font-bold">Fecha y Hora</th>
                <th className="py-3.5 px-4 font-bold">Comprador</th>
                <th className="py-3.5 px-4 font-bold">Bovinos / Ítems</th>
                <th className="py-3.5 px-4 font-bold">Método de Pago</th>
                <th className="py-3.5 px-4 font-bold text-right">Total</th>
                <th className="py-3.5 px-4 font-bold text-center">Estado</th>
                <th className="py-3.5 px-4 font-bold text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-rose-50/40 transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-[#B3202A]">
                      <Link to={`/facturas/${sale.id}`} className="hover:underline">
                        {sale.invoiceNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-stone-600">
                      {formatDateTime(sale.date)}
                    </td>
                    <td className="py-4 px-4 font-bold text-stone-900">
                      <div>{sale.clientName}</div>
                      <span className="text-[10px] text-stone-400 font-normal">{sale.clientDocument}</span>
                    </td>
                    <td className="py-4 px-4 text-stone-600">
                      <span className="font-semibold text-stone-800">
                        {sale.details?.length || 0} {sale.details?.length === 1 ? "bovino" : "bovinos"}
                      </span>
                      <span className="text-[10px] text-stone-400 block truncate max-w-[150px]">
                        {sale.details?.map((d: any) => d.bovineName || d.productName).join(", ")}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-stone-600 font-medium">
                      {sale.paymentMethod}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-stone-900">
                      {formatCOP(parseFloat(sale.total))}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.status === "Completado"
                            ? "bg-emerald-100 text-emerald-800"
                            : sale.status === "En proceso"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{sale.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link
                        to={`/facturas/${sale.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-[#B3202A] hover:text-white rounded-lg text-stone-700 font-bold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Factura</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-500">
                    No se encontraron transacciones registradas con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-1.5">
              <Link
                to={createPaginationUrl(Math.max(1, page - 1))}
                className={`px-3 py-1 rounded-lg border text-xs font-bold ${
                  page === 1 ? "opacity-40 pointer-events-none" : "hover:bg-white"
                }`}
              >
                Anterior
              </Link>
              <Link
                to={createPaginationUrl(Math.min(totalPages, page + 1))}
                className={`px-3 py-1 rounded-lg border text-xs font-bold ${
                  page === totalPages ? "opacity-40 pointer-events-none" : "hover:bg-white"
                }`}
              >
                Siguiente
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
