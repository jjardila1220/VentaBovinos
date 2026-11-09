import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useSearchParams, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { requireStaff, requireAdmin } from "~/services/auth.server.ts";
import { getInventoryStock, getMovementsLog } from "~/services/inventory.server.ts";
import { deleteBovine, getAllBreeds, updateBovine } from "~/services/bovines.server.ts";
import { formatCOP, formatDateTime } from "~/utils/formatters.ts";
import { 
  Package, 
  Layers, 
  History, 
  ChevronRight, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Filter, 
  PlusCircle,
  Sparkles
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireStaff(request);
  const url = new URL(request.url);

  const tab = url.searchParams.get("tab") || "stock";
  const category = url.searchParams.get("category") || "Todos";
  const status = url.searchParams.get("status") || "Todos";

  try {
    const { items, stats } = await getInventoryStock();
    const movements = await getMovementsLog(100);
    const breeds = await getAllBreeds();

    // Filtros en memoria para la vista de inventario
    let filteredItems = items;
    if (category !== "Todos") {
      filteredItems = filteredItems.filter((i) => i.category === category);
    }
    if (status !== "Todos") {
      filteredItems = filteredItems.filter((i) => i.status === status);
    }

    const valorTotal = items
      .filter((i) => i.status === "Disponible")
      .reduce((sum, i) => sum + parseFloat(i.price), 0);

    return json({
      items: filteredItems,
      allCount: items.length,
      stats: {
        ...stats,
        valorTotal,
      },
      movements,
      breeds,
      isAdmin: user.role === "Administrador",
      currentTab: tab,
      filters: { category, status },
    });
  } catch (error) {
    console.error("Inventory loader error:", error);
    return json({
      items: [],
      allCount: 0,
      stats: { total: 0, disponibles: 0, reservados: 0, vendidos: 0, valorTotal: 0 },
      movements: [],
      breeds: [],
      isAdmin: user.role === "Administrador",
      currentTab: tab,
      filters: { category, status },
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updateStatus") {
    const bovineId = Number(formData.get("bovineId"));
    const newStatus = formData.get("status")?.toString() as any;
    if (bovineId && newStatus) {
      await updateBovine(bovineId, { status: newStatus }, user.id);
      return json({ success: true });
    }
  }

  if (intent === "delete") {
    const bovineId = Number(formData.get("bovineId"));
    if (!Number.isInteger(bovineId) || bovineId <= 0) {
      return json({ error: "El bovino seleccionado no es válido." }, { status: 400 });
    }

    try {
      await deleteBovine(bovineId, user.id);
      return redirect("/inventario?success=Bovino+eliminado+correctamente");
    } catch (error) {
      return json(
        { error: error instanceof Error ? error.message : "No se pudo eliminar el bovino." },
        { status: 400 }
      );
    }
  }

  return json({ error: "Acción no válida." }, { status: 400 });
}

export default function Inventario() {
  const { items, stats, movements, isAdmin, currentTab, filters } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [activeTab, setActiveTab] = useState<"stock" | "movimientos">(currentTab === "movimientos" ? "movimientos" : "stock");
  const navigation = useNavigation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link to="/" className="hover:text-[#B3202A]">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-bold">Control de Inventario</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#B3202A] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gestión de Existencias & Trazabilidad Kárdex</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-[#B3202A]" />
            <span>Inventario de Bovinos</span>
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Monitoreo en tiempo real del estado de cada ejemplar, altas, bajas, reservas y ventas.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/bovinos/nuevo"
            className="px-5 py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Nuevo Bovino</span>
          </Link>
        )}
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-stone-400 block">Total en Hato</span>
          <p className="text-2xl font-black text-stone-900">{stats.total} cabezas</p>
          <span className="text-[10px] text-stone-500">Histórico registrado</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-1 bg-emerald-50/20">
          <span className="text-[10px] font-bold uppercase text-emerald-700 block">Disponibles</span>
          <p className="text-2xl font-black text-emerald-700">{stats.disponibles}</p>
          <span className="text-[10px] text-emerald-800">Listos para venta</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs space-y-1 bg-amber-50/20">
          <span className="text-[10px] font-bold uppercase text-amber-700 block">Reservados</span>
          <p className="text-2xl font-black text-amber-700">{stats.reservados}</p>
          <span className="text-[10px] text-amber-800">En carrito / proceso</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-stone-500 block">Vendidos</span>
          <p className="text-2xl font-black text-stone-700">{stats.vendidos}</p>
          <span className="text-[10px] text-stone-500">Con factura emitida</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-[#F9E3E3] p-5 rounded-2xl border border-rose-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#8B1820] block">Valor Disponible</span>
          <p className="text-lg sm:text-xl font-black text-[#B3202A]">{formatCOP(stats.valorTotal)}</p>
          <span className="text-[10px] text-stone-600">Patrimonio en pie</span>
        </div>
      </div>

      {/* Pestañas: Stock vs Movimientos */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="flex border-b border-stone-200 px-6 pt-4 gap-6 bg-stone-50/50">
          <button
            type="button"
            onClick={() => setActiveTab("stock")}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "stock"
                ? "border-[#B3202A] text-[#B3202A]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Existencias Actuales ({items.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("movimientos")}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "movimientos"
                ? "border-[#B3202A] text-[#B3202A]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Kárdex de Movimientos ({movements.length})</span>
          </button>
        </div>

        {/* CONTENIDO TAB 1: STOCK */}
        {activeTab === "stock" && (
          <div className="p-6 space-y-6">
            {actionData && "error" in actionData && actionData.error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">
                {actionData.error}
              </div>
            )}

            {/* Filtros de la tabla */}
            <Form method="get" className="flex flex-wrap items-center gap-3 text-xs">
              <input type="hidden" name="tab" value="stock" />
              <select
                name="category"
                defaultValue={filters.category}
                onChange={(e) => e.target.form?.submit()}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 font-medium"
              >
                <option value="Todos">Todas las categorías</option>
                <option value="Vacas lecheras">Vacas lecheras</option>
                <option value="Novillos">Novillos</option>
                <option value="Terneros">Terneros</option>
                <option value="Toros">Toros</option>
              </select>

              <select
                name="status"
                defaultValue={filters.status}
                onChange={(e) => e.target.form?.submit()}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 font-medium"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Disponible">Disponible</option>
                <option value="Reservado">Reservado</option>
                <option value="Vendido">Vendido</option>
              </select>
            </Form>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3 font-bold">ID</th>
                    <th className="py-3 px-3 font-bold">Identificador / Nombre</th>
                    <th className="py-3 px-3 font-bold">Categoría</th>
                    <th className="py-3 px-3 font-bold">Raza</th>
                    <th className="py-3 px-3 font-bold">Peso</th>
                    <th className="py-3 px-3 font-bold text-right">Precio COP</th>
                    <th className="py-3 px-3 font-bold text-center">Estado</th>
                    <th className="py-3 px-3 font-bold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {items.map((b) => (
                    <tr key={b.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-stone-400">
                        #{b.id}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-stone-900">
                        <Link to={`/bovinos/${b.id}`} className="hover:text-[#B3202A]">
                          {b.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-3 text-stone-600">{b.category}</td>
                      <td className="py-3.5 px-3 text-stone-600">{b.breedName || "Puro"}</td>
                      <td className="py-3.5 px-3 font-medium text-stone-800">{b.weight} kg</td>
                      <td className="py-3.5 px-3 text-right font-black text-[#B3202A]">
                        {formatCOP(parseFloat(b.price))}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === "Disponible"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.status === "Reservado"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            to={`/bovinos/${b.id}`}
                            className="p-1.5 text-stone-400 hover:text-[#B3202A] hover:bg-stone-100 rounded-lg transition-colors"
                            title="Ver Ficha Técnica"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {isAdmin && (
                            <>
                              <Link
                                to={`/bovinos/${b.id}/editar`}
                                className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                                title="Editar Ejemplar"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>
                              <Form
                                method="post"
                                onSubmit={(event) => {
                                  if (!window.confirm(`¿Eliminar "${b.name}" del inventario?`)) {
                                    event.preventDefault();
                                  }
                                }}
                              >
                                <input type="hidden" name="intent" value="delete" />
                                <input type="hidden" name="bovineId" value={b.id} />
                                <button
                                  type="submit"
                                  className="p-1.5 text-stone-400 hover:text-[#B3202A] hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Eliminar Ejemplar"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </Form>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTENIDO TAB 2: KÁRDEX DE MOVIMIENTOS */}
        {activeTab === "movimientos" && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3 font-bold">Fecha / Hora</th>
                    <th className="py-3 px-3 font-bold">Tipo</th>
                    <th className="py-3 px-3 font-bold">Detalle / Referencia</th>
                    <th className="py-3 px-3 font-bold">Bovino</th>
                    <th className="py-3 px-3 font-bold text-center">Cant.</th>
                    <th className="py-3 px-3 font-bold">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-3 text-stone-500">
                        {formatDateTime(m.createdAt)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.type === "Entrada"
                              ? "bg-emerald-100 text-emerald-800"
                              : m.type === "Salida"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-stone-800">
                        {m.reference}
                      </td>
                      <td className="py-3 px-3 text-stone-600 font-semibold">
                        {m.bovineName || (m.bovineId ? `#${m.bovineId}` : "—")}
                      </td>
                      <td className="py-3 px-3 text-center font-bold">
                        {m.quantity}
                      </td>
                      <td className="py-3 px-3 text-stone-500">
                        {m.userName || "Sistema Automatizado"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
