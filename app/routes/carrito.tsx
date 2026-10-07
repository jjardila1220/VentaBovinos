import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useNavigation } from "@remix-run/react";
import { getUser } from "~/services/session.server.ts";
import { getUserCartBovines, releaseBovineAtomic } from "~/services/bovines.server.ts";
import { formatCOP } from "~/utils/formatters.ts";
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  Sparkles,
  Info
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) {
    return json({
      items: [],
      subtotal: 0,
      total: 0,
      user: null,
      dbError: false,
    });
  }

  try {
    const items = await getUserCartBovines(user.id);
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price), 0);

    return json({
      items,
      subtotal,
      total: subtotal,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      dbError: false,
    });
  } catch (error) {
    console.error("Cart loader error:", error);
    return json({
      items: [],
      subtotal: 0,
      total: 0,
      user: null,
      dbError: true,
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");
  const bovineId = Number(formData.get("bovineId"));

  if (intent === "remove" && bovineId) {
    await releaseBovineAtomic(bovineId, user.id);
    return redirect("/carrito?info=Bovino+removido+del+carrito");
  }

  return json({ ok: true });
}

export default function Carrito() {
  const { items, subtotal, total, user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb: Inicio > Carrito */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link to="/" className="hover:text-[#B3202A] transition-colors">
          Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-bold">Carrito de Compras</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-[#B3202A]" />
            <span>Carrito de Compras</span>
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Revisa los ejemplares reservados para compra directa. Cada bovino es único e individual.
          </p>
        </div>
        <div className="text-xs font-semibold text-stone-500">
          <span className="text-[#B3202A] font-bold text-base">{items.length}</span> {items.length === 1 ? "ejemplar reservado" : "ejemplares reservados"}
        </div>
      </div>

      {!user ? (
        /* Prompt para iniciar sesión */
        <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-[#B3202A] flex items-center justify-center mx-auto text-2xl font-black">
            🔒
          </div>
          <h2 className="text-lg font-bold text-stone-900">Inicia sesión para gestionar tu carrito</h2>
          <p className="text-xs text-stone-500">
            Para reservar ejemplares bovinos con concurrencia protegida en tiempo real y emitir tu factura, por favor inicia sesión o crea una cuenta.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/login?redirectTo=/carrito"
              className="px-6 py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/catalogo"
              className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs transition-colors"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>
      ) : items.length === 0 ? (
        /* Carrito Vacío */
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-rose-50 text-[#B3202A] flex items-center justify-center mx-auto text-3xl font-black">
            🛒
          </div>
          <h2 className="text-xl font-bold text-stone-900">Tu carrito está vacío</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Actualmente no tienes ningún bovino reservado en tu pedido. Explora nuestro catálogo de ganado lechero y de ceba para agregar ejemplares disponibles.
          </p>
          <div className="pt-2">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#B3202A] hover:bg-[#8B1820] text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105"
            >
              <span>Explorar Catálogo de Bovinos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Carrito con productos */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Lista de Bovinos (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Atención:</strong> Cada bovino es un individuo único. Los ejemplares quedan reservados temporalmente a tu nombre mientras completas la transacción.
              </span>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 divide-y divide-stone-100 overflow-hidden">
              {items.map((b) => {
                const image = b.imageUrls?.[0] || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80";

                return (
                  <div key={b.id} className="p-5 flex flex-col sm:flex-row items-center gap-5 justify-between hover:bg-stone-50/50 transition-colors">
                    {/* Imagen y Datos Principales */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <Link to={`/bovinos/${b.id}`} className="shrink-0">
                        <img
                          src={image}
                          alt={b.name}
                          className="w-20 h-20 rounded-2xl object-cover border border-stone-200 shadow-xs hover:opacity-90"
                        />
                      </Link>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#B3202A] uppercase">
                            {b.category}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400 font-bold">
                            #{b.id}
                          </span>
                        </div>

                        <Link to={`/bovinos/${b.id}`}>
                          <h3 className="font-bold text-stone-900 text-sm hover:text-[#B3202A] transition-colors">
                            {b.name}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span>{b.breedName || "Raza Pura"}</span>
                          <span>•</span>
                          <span>{b.weight} kg</span>
                          <span>•</span>
                          <span>{b.sex}</span>
                        </div>
                      </div>
                    </div>

                    {/* Precio y Botón Remover */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                          Precio Unitario
                        </span>
                        <span className="text-base font-black text-[#B3202A]">
                          {formatCOP(b.price)}
                        </span>
                      </div>

                      <Form method="post">
                        <input type="hidden" name="intent" value="remove" />
                        <input type="hidden" name="bovineId" value={b.id} />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          title="Remover ejemplar"
                          className="p-2.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Form>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                to="/catalogo"
                className="text-xs font-bold text-stone-600 hover:text-[#B3202A] flex items-center gap-1.5 transition-colors"
              >
                <span>← Seguir Comprando</span>
              </Link>
            </div>
          </div>

          {/* Resumen del Pedido (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-stone-200/90 space-y-6 sticky top-24">
            <h2 className="text-base font-black text-stone-900 pb-3 border-b border-stone-100 uppercase tracking-wide">
              Resumen del Pedido
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Cabezas de ganado:</span>
                <span className="font-bold text-stone-900">{items.length} unidades</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span className="font-bold text-stone-900">{formatCOP(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Guía Sanitaria ICA (GSMI):</span>
                <span className="font-bold text-emerald-600">Incluida</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>IVA Ganadero (Régimen Especial):</span>
                <span className="font-bold text-stone-900">$ 0</span>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-sm font-black text-stone-900 uppercase">Total a Pagar:</span>
                <span className="text-2xl font-black text-[#B3202A]">{formatCOP(total)}</span>
              </div>
            </div>

            {/* Garantías */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 space-y-2 text-[11px] text-stone-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Garantía de sanidad y trazabilidad oficial</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#B3202A] shrink-0" />
                <span>Despacho directo desde predio acreditado</span>
              </div>
            </div>

            {/* Botón Proceder al Pago */}
            <Link
              to="/checkout"
              className="w-full py-3.5 px-6 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide hover:scale-[1.01]"
            >
              <span>Proceder al Pago / Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
