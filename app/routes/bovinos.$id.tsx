import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Form, useNavigation, useActionData } from "@remix-run/react";
import { useState } from "react";
import { getBovineById, reserveBovineAtomic, deleteBovine } from "~/services/bovines.server.ts";
import { getUser } from "~/services/session.server.ts";
import { formatCOP } from "~/utils/formatters.ts";
import { DeleteModal } from "~/components/DeleteModal.tsx";
import { 
  ChevronRight, 
  ShoppingBag, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Scale, 
  Dna, 
  FileText, 
  Edit3, 
  Trash2,
  AlertTriangle,
  Award,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const id = Number(params.id);
  if (isNaN(id)) {
    throw new Response("ID de bovino no válido", { status: 400 });
  }

  const user = await getUser(request);

  try {
    const bovine = await getBovineById(id);
    if (!bovine) {
      throw new Response("Bovino no encontrado", { status: 404 });
    }

    return json({
      bovine,
      user: user
        ? {
            id: user.id,
            name: user.name,
            role: user.role,
          }
        : null,
      isAdmin: user?.role === "Administrador",
      dbError: false,
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Error loading bovine detail:", error);
    throw new Response("Error al consultar el bovino en la base de datos.", { status: 500 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const id = Number(params.id);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const user = await getUser(request);

  if (intent === "addToCart") {
    if (!user) {
      const url = new URL(request.url);
      return redirect(`/login?redirectTo=${encodeURIComponent(url.pathname)}`);
    }

    const result = await reserveBovineAtomic(id, user.id);
    if (!result.success) {
      return json({ error: result.message || "El bovino ya no está disponible para reserva." }, { status: 400 });
    }

    return redirect(`/carrito?success=¡${encodeURIComponent("Bovino agregado al carrito exitosamente")}!`);
  }

  if (intent === "delete") {
    if (!user || user.role !== "Administrador") {
      return json({ error: "Acceso denegado: solo Administradores pueden eliminar bovinos." }, { status: 403 });
    }

    try {
      await deleteBovine(id, user.id);
      return redirect(`/catalogo?success=Bovino+#${id}+eliminado+correctamente`);
    } catch (err: any) {
      return json({ error: err.message || "No se pudo eliminar el bovino." }, { status: 400 });
    }
  }

  return json({ ok: true });
}

export default function BovineDetail() {
  const { bovine, user, isAdmin } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const images = bovine.imageUrls && bovine.imageUrls.length > 0
    ? bovine.imageUrls
    : ["https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80"];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [activeTab, setActiveTab] = useState<"descripcion" | "caracteristicas" | "ubicacion">("descripcion");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isAvailable = bovine.status === "Disponible";
  const isReserved = bovine.status === "Reservado";
  const isSold = bovine.status === "Vendido";

  // Productive characteristics simulation according to category
  const isDairy = bovine.category === "Vacas lecheras";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb: Inicio > Catálogo > Nombre */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link to="/" className="hover:text-[#B3202A] transition-colors">
          Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link to="/catalogo" className="hover:text-[#B3202A] transition-colors">
          Catálogo
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-bold truncate max-w-xs">{bovine.name}</span>
      </nav>

      {/* Action error banner */}
      {actionData?.error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionData.error}</span>
        </div>
      )}

      {/* Main Container: Gallery + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-stone-100 shadow-md border border-stone-200">
            <img
              src={activeImage}
              alt={bovine.name}
              className="w-full h-full object-cover"
            />
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider ${
                  isAvailable
                    ? "bg-emerald-600 text-white"
                    : isReserved
                    ? "bg-amber-500 text-white"
                    : "bg-red-700 text-white"
                }`}
              >
                {bovine.status}
              </span>
            </div>
            {/* ID Tag */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-xs text-white text-xs font-mono font-bold px-3 py-1 rounded-xl">
              Identificador Oficial: #{bovine.id}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImage === img
                      ? "border-[#B3202A] ring-2 ring-[#B3202A]/20 scale-105"
                      : "border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* ICA Certification Banner */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-950 text-xs">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Certificación Sanitaria ICA Vigente</p>
              <p className="text-[11px] text-emerald-800">
                Hato libre de Brucelosis y Tuberculosis Bovina. Vacunación contra Fiebre Aftosa al día con ciclo oficial RUV.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Info & Purchase Action (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200/90 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
              <span>{bovine.category}</span>
              <span className="text-[#8B1820] font-bold">{bovine.breedName || "Bovino Seleccionado"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
              {bovine.name}
            </h1>
            <p className="text-stone-500 text-xs mt-2 leading-relaxed">
              {bovine.description || "Ejemplar bovino adaptado a condiciones tropicales de pastoreo y excelente potencial genético."}
            </p>
          </div>

          {/* Price Box */}
          <div className="p-5 rounded-2xl bg-[#F9E3E3] border border-rose-200/80 space-y-1">
            <span className="text-xs uppercase font-bold text-stone-600">Precio Comercial</span>
            <div className="text-3xl font-black text-[#B3202A]">
              {formatCOP(bovine.price)}
            </div>
            <p className="text-[11px] text-stone-600">
              * Incluye trámite de Guía Sanitaria de Movilización Interna (GSMI) ICA.
            </p>
          </div>

          {/* Quick Technical Specs Table */}
          <div className="space-y-2 border-y border-stone-100 py-4 text-xs">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Ficha Técnica del Ejemplar
            </h3>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 block text-[10px] font-semibold">PESO ACTUAL</span>
                <span className="font-bold text-stone-800 text-sm">{bovine.weight} kg</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 block text-[10px] font-semibold">EDAD</span>
                <span className="font-bold text-stone-800 text-sm">
                  {bovine.age} meses ({Math.floor(bovine.age / 12)}a {bovine.age % 12}m)
                </span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 block text-[10px] font-semibold">SEXO</span>
                <span className="font-bold text-stone-800 text-sm">{bovine.sex}</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 block text-[10px] font-semibold">COLOR / MARCAJE</span>
                <span className="font-bold text-stone-800 text-sm">{bovine.color || "Estándar"}</span>
              </div>
            </div>
          </div>

          {/* Cart CTA Button */}
          <div className="space-y-3">
            {isAvailable ? (
              <Form method="post">
                <input type="hidden" name="intent" value="addToCart" />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{isSubmitting ? "Reservando ejemplar..." : "Agregar al carrito"}</span>
                </button>
              </Form>
            ) : isReserved ? (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full py-3.5 px-6 bg-stone-200 text-stone-400 font-bold rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Ejemplar Reservado en Carrito</span>
                </button>
                <p className="text-[11px] text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 text-center font-medium">
                  Este bovino se encuentra en proceso de compra por otro cliente. Si la reserva caduca, volverá a estar disponible automáticamente.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full py-3.5 px-6 bg-stone-200 text-stone-400 font-bold rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Ejemplar Vendido</span>
                </button>
                <p className="text-[11px] text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 text-center font-medium">
                  Este ejemplar ya fue adquirido y transferido con comprobante oficial. Explora nuestro catálogo para encontrar otros bovinos disponibles.
                </p>
              </div>
            )}
          </div>

          {/* Admin Tools: Editar y Eliminar */}
          {isAdmin && (
            <div className="pt-4 border-t border-stone-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 block">
                Herramientas de Administración
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={`/bovinos/${bovine.id}/editar`}
                  className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                  <span>Editar Bovino</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Eliminar Bovino</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pestañas Inferiores: Descripción detallada, Características productivas, Ubicación del predio */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/90 space-y-6">
        <div className="flex border-b border-stone-200 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("descripcion")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "descripcion"
                ? "border-[#B3202A] text-[#B3202A]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Descripción Detallada
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("caracteristicas")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "caracteristicas"
                ? "border-[#B3202A] text-[#B3202A]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Características Productivas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ubicacion")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "ubicacion"
                ? "border-[#B3202A] text-[#B3202A]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Ubicación del Predio
          </button>
        </div>

        {/* Tab 1: Descripción */}
        {activeTab === "descripcion" && (
          <div className="space-y-4 text-xs text-stone-700 leading-relaxed max-w-4xl">
            <p>
              {bovine.description || "Ejemplar en óptimas condiciones de salud, con aplomos correctos, dorso recto y excelente desarrollo esquelético y muscular acorde a su raza y edad."}
            </p>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
              <h4 className="font-bold text-stone-900">Historial Sanitario y Manejo:</h4>
              <p className="text-stone-600">
                {bovine.sanitaryHistory || "Plan de vacunación completo para aftosa, carbón sintomático, rabia bovina y complejo reproductivo. Desparasitación interna y externa realizada en el último mes."}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Características Productivas */}
        {activeTab === "caracteristicas" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {isDairy ? (
              <>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-1">
                  <span className="text-[10px] font-bold text-rose-800 uppercase">Producción de Leche Estimada</span>
                  <p className="text-xl font-black text-[#B3202A]">18 - 26 Litros / Día</p>
                  <p className="text-[11px] text-stone-600">En dos ordeños con suplementación estándar.</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[10px] font-bold text-stone-600 uppercase">Calidad de Sólidos</span>
                  <p className="text-xl font-black text-stone-800">3.8% Grasa / 3.2% Prot.</p>
                  <p className="text-[11px] text-stone-600">Alta aptitud para pasteurización o quesería.</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[10px] font-bold text-stone-600 uppercase">Conformación de Ubre</span>
                  <p className="text-xl font-black text-stone-800">Calificación 88/100</p>
                  <p className="text-[11px] text-stone-600">Ligamento suspensorio medio firme y pezones simétricos.</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-1">
                  <span className="text-[10px] font-bold text-rose-800 uppercase">Ganancia de Peso Diaria</span>
                  <p className="text-xl font-black text-[#B3202A]">850 - 1.150 g / Día</p>
                  <p className="text-[11px] text-stone-600">En régimen de pastoreo rotacional y sales mineralizadas.</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[10px] font-bold text-stone-600 uppercase">Rendimiento en Canal</span>
                  <p className="text-xl font-black text-stone-800">56% - 59%</p>
                  <p className="text-[11px] text-stone-600">Excelente conformación de lomo, pierna y cuarto trasero.</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[10px] font-bold text-stone-600 uppercase">Temperamento</span>
                  <p className="text-xl font-black text-stone-800">Dócil / Manejo Fácil</p>
                  <p className="text-[11px] text-stone-600">Acostumbrado al arreo a caballo y manga de trabajo.</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 3: Ubicación del Predio */}
        {activeTab === "ubicacion" && (
          <div className="space-y-4 text-xs text-stone-700">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <MapPin className="w-4 h-4 text-[#B3202A]" />
              <span>Predio de Origen: {bovine.location || "Villavicencio, Meta"}</span>
            </div>
            <p className="text-stone-600 max-w-3xl">
              El ejemplar se encuentra alojado en instalaciones acreditadas con buenas prácticas ganaderas (BPG) del ICA. Las visitas para inspección veterinaria presencial pueden coordinarse con 24 horas de antelación.
            </p>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="font-bold text-stone-900 block">Despacho y Transporte Ganadero</span>
                <span className="text-[11px] text-stone-500">Coordinación logística con camiones estacas equipados con cama de aserrín.</span>
              </div>
              <Link
                to="/contacto"
                className="px-4 py-2 bg-[#B3202A] hover:bg-[#8B1820] text-white rounded-xl text-xs font-bold transition-colors"
              >
                Solicitar Ruta de Transporte
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal for Admins */}
      <DeleteModal
        isOpen={showDeleteModal}
        title="¿Eliminar este bovino del sistema?"
        message={`Estás a punto de eliminar permanentemente a "${bovine.name}" (ID #${bovine.id}). Si el bovino tiene ventas asociadas, la base de datos impedirá la eliminación para proteger la integridad histórica.`}
        itemName={`Bovino #${bovine.id} - ${bovine.name}`}
        actionUrl={`/bovinos/${bovine.id}`}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
