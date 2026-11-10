import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { requireUser } from "~/services/session.server.ts";
import { getUserCartBovines } from "~/services/bovines.server.ts";
import { completeCheckoutTransaction } from "~/services/sales.server.ts";
import { formatCOP } from "~/utils/formatters.ts";
import { 
  ChevronRight, 
  CreditCard, 
  Building2, 
  Banknote, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Truck,
  User,
  MapPin,
  Phone,
  Mail,
  FileText
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const items = await getUserCartBovines(user.id);

  if (items.length === 0) {
    return redirect("/carrito?info=El+carrito+está+vacío");
  }

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price), 0);

  return json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    items,
    subtotal,
    total: subtotal,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();

  const name = formData.get("name")?.toString().trim() || "";
  const document = formData.get("document")?.toString().trim() || "";
  const phone = formData.get("phone")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim() || "";
  const address = formData.get("address")?.toString().trim() || "";
  const paymentMethod = formData.get("paymentMethod")?.toString() || "Transferencia Bancaria";

  const errors: Record<string, string> = {};

  if (!name || name.length < 3) errors.name = "El nombre completo o razón social es requerido.";
  if (!document || document.length < 6) errors.document = "La cédula o NIT es obligatoria (mínimo 6 caracteres).";
  if (!phone || phone.length < 7) errors.phone = "El teléfono de contacto es obligatorio.";
  if (!email || !email.includes("@")) errors.email = "Ingresa un correo electrónico válido para envío de la factura.";
  if (!address || address.length < 5) errors.address = "Ingresa el predio de destino o dirección de entrega.";

  if (Object.keys(errors).length > 0) {
    return json({ errors, values: Object.fromEntries(formData) }, { status: 400 });
  }

  try {
    const result = await completeCheckoutTransaction({
      userId: user.id,
      buyer: {
        name,
        document,
        phone,
        email,
        address,
      },
      paymentMethod,
    });

    return redirect(`/facturas/${result.sale.id}?success=Compra+finalizada+con+éxito`);
  } catch (error: any) {
    console.error("Checkout transaction error:", error);
    return json({
      formError: error.message || "No se pudo procesar la compra. Es posible que la reserva haya caducado.",
      values: Object.fromEntries(formData),
    }, { status: 500 });
  }
}

export default function Checkout() {
  const { user, items, subtotal, total } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ errors?: Record<string, string>; formError?: string; values?: Record<string, any> }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const errors: Record<string, string> = actionData?.errors || {};
  const values: Record<string, any> = actionData?.values || {};

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedPayment, setSelectedPayment] = useState(values.paymentMethod || "Transferencia Bancaria");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link to="/" className="hover:text-[#B3202A]">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link to="/carrito" className="hover:text-[#B3202A]">Carrito</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-bold">Proceso de Compra (Checkout)</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          Finalizar Compra de Ganado
        </h1>
        <p className="text-stone-500 text-xs mt-1">
          Completa los datos del comprador para registrar la compra y generar una referencia de pago simulada.
        </p>
      </div>

      {actionData?.formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionData.formError}</span>
        </div>
      )}

      {/* Stepper Indicator */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div
          onClick={() => setCurrentStep(1)}
          className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
            currentStep === 1
              ? "bg-[#B3202A] text-white border-[#B3202A] shadow-md"
              : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-80">Paso 1</span>
          <span className="text-xs font-black truncate block">Datos del Comprador</span>
        </div>

        <div
          onClick={() => setCurrentStep(2)}
          className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
            currentStep === 2
              ? "bg-[#B3202A] text-white border-[#B3202A] shadow-md"
              : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-80">Paso 2</span>
          <span className="text-xs font-black truncate block">Método de Pago</span>
        </div>

        <div
          onClick={() => setCurrentStep(3)}
          className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
            currentStep === 3
              ? "bg-[#B3202A] text-white border-[#B3202A] shadow-md"
              : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-80">Paso 3</span>
          <span className="text-xs font-black truncate block">Confirmación & Factura</span>
        </div>
      </div>

      <Form method="post" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Step Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* PASO 1: Datos del Comprador */}
          <div className={`bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6 ${currentStep !== 1 ? "hidden" : "block"}`}>
            <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
              <User className="w-5 h-5 text-[#B3202A]" />
              <h2 className="text-lg font-black text-stone-900">
                Paso 1: Información Legal y Predio de Destino
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-stone-700 block">
                  Nombre Completo o Razón Social <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={values.name || user.name}
                  placeholder="Ej: Agropecuaria El Samán S.A.S."
                  className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                    errors.name ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
                  }`}
                />
                {errors.name && <p className="text-[11px] text-rose-600">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">
                  Cédula de Ciudadanía o NIT <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  name="document"
                  defaultValue={values.document}
                  placeholder="Ej: 900.541.229-4 ó 1.090.442.110"
                  className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                    errors.document ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
                  }`}
                />
                {errors.document && <p className="text-[11px] text-rose-600">{errors.document}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">
                  Teléfono de Contacto <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={values.phone}
                  placeholder="Ej: +57 311 450 8920"
                  className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                    errors.phone ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
                  }`}
                />
                {errors.phone && <p className="text-[11px] text-rose-600">{errors.phone}</p>}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-stone-700 block">
                  Correo Electrónico para Facturación <span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={values.email || user.email}
                  placeholder="facturacion@empresa.com"
                  className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                    errors.email ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
                  }`}
                />
                {errors.email && <p className="text-[11px] text-rose-600">{errors.email}</p>}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-stone-700 block">
                  Predio de Destino / Dirección de Entrega (con Municipio y Dpto) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  defaultValue={values.address}
                  placeholder="Ej: Hacienda Santa Bárbara, Vereda El Triunfo, Villavicencio, Meta"
                  className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                    errors.address ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
                  }`}
                />
                {errors.address && <p className="text-[11px] text-rose-600">{errors.address}</p>}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
              >
                <span>Continuar a Método de Pago</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PASO 2: Método de Pago */}
          <div className={`bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6 ${currentStep !== 2 ? "hidden" : "block"}`}>
            <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
              <CreditCard className="w-5 h-5 text-[#B3202A]" />
              <h2 className="text-lg font-black text-stone-900">
                Paso 2: Selección de Método de Pago
              </h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "Transferencia Bancaria",
                  title: "Transferencia Bancaria (Bancolombia / Davivienda)",
                  description: "Referencia de pago simulada para validar el flujo de compra.",
                  icon: Building2,
                },
                {
                  id: "Efectivo en Predio",
                  title: "Efectivo Contra Entrega en Predio",
                  description: "Método registrado como pago simulado para validar el flujo.",
                  icon: Banknote,
                },
                {
                  id: "Tarjeta de Crédito",
                  title: "Tarjeta de Crédito / Débito (Pasarela Segura)",
                  description: "Tarjeta simulada; no se conecta con una pasarela real.",
                  icon: CreditCard,
                },
                {
                  id: "PSE",
                  title: "PSE - Débito Bancario en Línea",
                  description: "PSE simulado; no se realiza un débito bancario real.",
                  icon: ShieldCheck,
                },
              ].map((m) => {
                const IconComponent = m.icon;
                const isSelected = selectedPayment === m.id;

                return (
                  <label
                    key={m.id}
                    className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#B3202A] bg-rose-50/50 shadow-xs"
                        : "border-stone-200 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={m.id}
                        checked={isSelected}
                        onChange={() => setSelectedPayment(m.id)}
                        className="text-[#B3202A] focus:ring-[#B3202A]"
                      />
                      <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                        <IconComponent className="w-5 h-5 text-[#B3202A]" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-stone-900 text-xs block">{m.title}</span>
                        <span className="text-[11px] text-stone-500 block mt-0.5">{m.description}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 border border-stone-200 rounded-xl text-stone-700 font-bold text-xs hover:bg-stone-50"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
              >
                <span>Revisar y Confirmar Orden</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PASO 3: Resumen y Confirmación */}
          <div className={`bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6 ${currentStep !== 3 ? "hidden" : "block"}`}>
            <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
              <CheckCircle2 className="w-5 h-5 text-[#B3202A]" />
              <h2 className="text-lg font-black text-stone-900">
                Paso 3: Confirmación Final de la Transacción
              </h2>
            </div>

            {/* Resumen de cabezas */}
            <div className="space-y-3">
              <h3 className="font-bold text-stone-800 text-xs uppercase tracking-wide">
                Bovinos Incluidos en la Factura ({items.length})
              </h3>
              <div className="divide-y divide-stone-100 border border-stone-100 rounded-2xl overflow-hidden bg-stone-50/50">
                {items.map((b) => (
                  <div key={b.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-stone-900">{b.name}</span>
                      <span className="text-stone-500 block text-[11px]">
                        ID #{b.id} • {b.breedName || "Bovino"} • {b.weight} kg • {b.category}
                      </span>
                    </div>
                    <span className="font-black text-[#B3202A]">{formatCOP(b.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen de Pago */}
            <div className="p-4 rounded-2xl bg-[#F9E3E3] border border-rose-200/80 text-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-600 uppercase">Método seleccionado:</span>
              <p className="font-bold text-[#8B1820]">{selectedPayment}</p>
              <p className="text-[11px] text-stone-600">
                Al confirmar, se generará tu factura electrónica oficial con índice consecutivo único (FAC-2026-XXXXXX) y se descargará el comprobante.
              </p>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 border border-stone-200 rounded-xl text-stone-700 font-bold text-xs hover:bg-stone-50"
              >
                Atrás
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-[#B3202A] hover:bg-[#8B1820] text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl transition-all flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? "Emitiendo factura..." : "Confirmar y Pagar Orden"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-200/90 space-y-5 sticky top-24">
          <h3 className="font-black text-stone-900 text-xs uppercase tracking-wider pb-3 border-b border-stone-100">
            Resumen Financiero
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Cabezas a transferir:</span>
              <span className="font-bold text-stone-900">{items.length}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Subtotal bovinos:</span>
              <span className="font-bold text-stone-900">{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Guía ICA & Pesaje:</span>
              <span className="font-bold text-emerald-600">Gratis</span>
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
              <span className="font-black text-stone-900 uppercase">Total:</span>
              <span className="text-xl font-black text-[#B3202A]">{formatCOP(total)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 space-y-2">
            <p>✓ Transacción asegurada y auditada.</p>
            <p>✓ Inventario descontado atómicamente.</p>
            <p>✓ Generación de factura con índice único.</p>
          </div>
        </div>
      </Form>
    </div>
  );
}
