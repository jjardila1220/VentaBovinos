import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { requireAdmin } from "~/services/auth.server.ts";
import { getAllBreeds, getBovineById, updateBovine } from "~/services/bovines.server.ts";
import { ChevronRight, Save, X, AlertTriangle, Sparkles } from "lucide-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const id = Number(params.id);
  if (isNaN(id)) throw new Response("ID no válido", { status: 400 });

  const bovine = await getBovineById(id);
  if (!bovine) throw new Response("Bovino no encontrado", { status: 404 });

  const breeds = await getAllBreeds();
  return json({ bovine, breeds });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireAdmin(request);
  const id = Number(params.id);
  const formData = await request.formData();

  const name = formData.get("name")?.toString().trim() || "";
  const breedId = Number(formData.get("breedId"));
  const category = formData.get("category")?.toString() as any;
  const sex = formData.get("sex")?.toString() as any;
  const birthDay = formData.get("birthDay")?.toString().trim() || "";
  const weight = parseFloat(formData.get("weight")?.toString() || "");
  const price = parseFloat(formData.get("price")?.toString() || "");
  const color = formData.get("color")?.toString().trim() || "";
  const location = formData.get("location")?.toString().trim() || "";
  const description = formData.get("description")?.toString().trim() || "";
  const sanitaryHistory = formData.get("sanitaryHistory")?.toString().trim() || "";
  const status = formData.get("status")?.toString() as any;
  const imageUrl1 = formData.get("imageUrl1")?.toString().trim() || "";
  const imageUrl2 = formData.get("imageUrl2")?.toString().trim() || "";

  const errors: Record<string, string> = {};

  if (!name || name.length < 3) errors.name = "El nombre debe tener al menos 3 caracteres.";
  if (!breedId || isNaN(breedId)) errors.breedId = "Debes seleccionar una raza.";
  if (isNaN(weight) || weight <= 0) errors.weight = "El peso debe ser mayor a 0 kg.";
  if (isNaN(price) || price <= 0) errors.price = "El precio debe ser mayor a $ 0 COP.";
  if (!location) errors.location = "La ubicación es obligatoria.";

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  const imageUrls = [imageUrl1, imageUrl2].filter(Boolean);

  try {
    await updateBovine(id, {
      name,
      breedId,
      category,
      sex,
      birthDay: birthDay || undefined,
      weight,
      price,
      color,
      location,
      description,
      sanitaryHistory,
      status,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    }, user.id);

    return redirect(`/bovinos/${id}?success=Bovino+actualizado+correctamente`);
  } catch (err: any) {
    return json({ formError: err.message || "Error al actualizar." }, { status: 500 });
  }
}

export default function EditarBovino() {
  const { bovine, breeds } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ errors?: Record<string, string>; formError?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const errors: Record<string, string> = actionData?.errors || {};
  const [birthDate, setBirthDate] = useState(bovine.birthDay ? bovine.birthDay.split("T")[0] : "");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link to="/" className="hover:text-[#B3202A]">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link to="/catalogo" className="hover:text-[#B3202A]">Catálogo</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link to={`/bovinos/${bovine.id}`} className="hover:text-[#B3202A]">{bovine.name}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-bold">Editar</span>
      </nav>

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Editar Bovino #{bovine.id}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Modifica la información zootécnica, sanitaria o comercial del ejemplar.
          </p>
        </div>
      </div>

      {actionData?.formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionData.formError}</span>
        </div>
      )}

      {/* Formulario */}
      <Form method="post" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Nombre / Identificador</label>
            <input
              type="text"
              name="name"
              defaultValue={bovine.name}
              className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                errors.name ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
              }`}
            />
            {errors.name && <p className="text-[11px] text-rose-600 font-medium">{errors.name}</p>}
          </div>

          {/* Raza */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Raza</label>
            <select
              name="breedId"
              defaultValue={bovine.breedId}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            >
              {breeds.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Categoría</label>
            <select
              name="category"
              defaultValue={bovine.category}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            >
              <option value="Vacas lecheras">Vacas lecheras</option>
              <option value="Novillos">Novillos</option>
              <option value="Terneros">Terneros</option>
              <option value="Toros">Toros</option>
            </select>
          </div>

          {/* Sexo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Sexo</label>
            <select
              name="sex"
              defaultValue={bovine.sex}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            >
              <option value="Hembra">Hembra</option>
              <option value="Macho">Macho</option>
            </select>
          </div>

          {/* Estado actual */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Estado Operativo</label>
            <select
              name="status"
              defaultValue={bovine.status}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            >
              <option value="Disponible">Disponible</option>
              <option value="Reservado">Reservado</option>
              <option value="Vendido">Vendido</option>
            </select>
          </div>

          {/* Fecha de Nacimiento */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Fecha de Nacimiento</label>
            <input
              type="date"
              name="birthDay"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>

          {/* Peso en kg */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Peso en kg</label>
            <input
              type="number"
              name="weight"
              min="1"
              step="0.5"
              defaultValue={bovine.weight}
              className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                errors.weight ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
              }`}
            />
            {errors.weight && <p className="text-[11px] text-rose-600 font-medium">{errors.weight}</p>}
          </div>

          {/* Precio en COP */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Precio en COP ($)</label>
            <input
              type="number"
              name="price"
              min="1"
              step="50000"
              defaultValue={bovine.price}
              className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                errors.price ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
              }`}
            />
            {errors.price && <p className="text-[11px] text-rose-600 font-medium">{errors.price}</p>}
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Color / Marcaje</label>
            <input
              type="text"
              name="color"
              defaultValue={bovine.color || ""}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>

          {/* Ubicación */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Ubicación del Predio</label>
            <input
              type="text"
              name="location"
              defaultValue={bovine.location || ""}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>

          {/* URLs de imágenes */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-stone-700 block">URL Imagen Principal</label>
            <input
              type="url"
              name="imageUrl1"
              defaultValue={bovine.imageUrls?.[0] || ""}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-stone-700 block">Descripción Zootécnica</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={bovine.description || ""}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>

          {/* Historial Sanitario */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-stone-700 block">Historial Sanitario ICA</label>
            <input
              type="text"
              name="sanitaryHistory"
              defaultValue={bovine.sanitaryHistory || ""}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <Link
            to={`/bovinos/${bovine.id}`}
            className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#B3202A] hover:bg-[#8B1820] text-white text-xs font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Guardando cambios..." : "Actualizar Bovino"}</span>
          </button>
        </div>
      </Form>
    </div>
  );
}
