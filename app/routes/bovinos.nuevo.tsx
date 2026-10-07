import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { requireAdmin } from "~/services/auth.server.ts";
import { getAllBreeds, createBovine } from "~/services/bovines.server.ts";
import { ChevronRight, Save, X, AlertTriangle, Sparkles, Plus } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const breeds = await getAllBreeds();
  return json({ breeds });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAdmin(request);
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
  const imageUrl1 = formData.get("imageUrl1")?.toString().trim() || "";
  const imageUrl2 = formData.get("imageUrl2")?.toString().trim() || "";

  const errors: Record<string, string> = {};

  if (!name || name.length < 3) {
    errors.name = "El nombre o identificador debe tener al menos 3 caracteres.";
  }
  if (!breedId || isNaN(breedId)) {
    errors.breedId = "Debes seleccionar una raza válida.";
  }
  if (!["Vacas lecheras", "Novillos", "Terneros", "Toros"].includes(category)) {
    errors.category = "Selecciona una categoría válida.";
  }
  if (!["Macho", "Hembra"].includes(sex)) {
    errors.sex = "Selecciona el sexo.";
  }
  if (!birthDay) {
    errors.birthDay = "La fecha de nacimiento es requerida.";
  } else {
    const d = new Date(birthDay);
    if (isNaN(d.getTime()) || d > new Date()) {
      errors.birthDay = "La fecha no puede ser futura.";
    }
  }
  if (isNaN(weight) || weight <= 0) {
    errors.weight = "El peso debe ser un número mayor a 0 kg.";
  }
  if (isNaN(price) || price <= 0) {
    errors.price = "El precio debe ser un número mayor a $ 0 COP.";
  }
  if (!location) {
    errors.location = "La ubicación del predio (departamento y municipio) es obligatoria.";
  }

  const imageUrls = [imageUrl1, imageUrl2].filter(Boolean);
  if (imageUrls.length === 0) {
    // Foto por defecto
    imageUrls.push("https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80");
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors, values: Object.fromEntries(formData) }, { status: 400 });
  }

  try {
    const newBovine = await createBovine({
      name,
      breedId,
      category,
      sex,
      birthDay,
      weight,
      price,
      color,
      location,
      description,
      sanitaryHistory,
      imageUrls,
    }, user.id);

    return redirect(`/bovinos/${newBovine.id}?success=Bovino+registrado+exitosamente`);
  } catch (err: any) {
    return json({ formError: err.message || "Error al crear el bovino.", values: Object.fromEntries(formData) }, { status: 500 });
  }
}

export default function NuevoBovino() {
  const { breeds } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ errors?: Record<string, string>; formError?: string; values?: Record<string, any> }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const errors: Record<string, string> = actionData?.errors || {};
  const values: Record<string, any> = actionData?.values || {};

  const [birthDate, setBirthDate] = useState(values.birthDay || "");
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  const handleDateChange = (val: string) => {
    setBirthDate(val);
    if (val) {
      const b = new Date(val);
      const now = new Date();
      if (!isNaN(b.getTime())) {
        let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
        if (now.getDate() < b.getDate()) months -= 1;
        setCalculatedAge(Math.max(0, months));
      }
    } else {
      setCalculatedAge(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link to="/" className="hover:text-[#B3202A]">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link to="/catalogo" className="hover:text-[#B3202A]">Catálogo</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-bold">Registrar Bovino</span>
      </nav>

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#B3202A] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulo de Administración de Hato</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Registrar Nuevo Bovino
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Ingresa la información zootécnica y comercial del ejemplar. Todos los valores numéricos deben ser positivos.
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
          {/* Nombre / Identificador */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">
              Nombre / Identificador <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              defaultValue={values.name}
              placeholder="Ej: Corona Real 402/8"
              className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                errors.name ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
              }`}
            />
            {errors.name && <p className="text-[11px] text-rose-600 font-medium">{errors.name}</p>}
          </div>

          {/* Raza */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">
              Raza <span className="text-rose-600">*</span>
            </label>
            <select
              name="breedId"
              defaultValue={values.breedId}
              className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                errors.breedId ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
              }`}
            >
              <option value="">Selecciona una raza</option>
              {breeds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.breedId && <p className="text-[11px] text-rose-600 font-medium">{errors.breedId}</p>}
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">
              Categoría <span className="text-rose-600">*</span>
            </label>
            <select
              name="category"
              defaultValue={values.category || "Vacas lecheras"}
              className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                errors.category ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
              }`}
            >
              <option value="Vacas lecheras">Vacas lecheras</option>
              <option value="Novillos">Novillos</option>
              <option value="Terneros">Terneros</option>
              <option value="Toros">Toros</option>
            </select>
            {errors.category && <p className="text-[11px] text-rose-600 font-medium">{errors.category}</p>}
          </div>

          {/* Sexo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">
              Sexo <span className="text-rose-600">*</span>
            </label>
            <select
              name="sex"
              defaultValue={values.sex || "Hembra"}
              className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                errors.sex ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
              }`}
            >
              <option value="Hembra">Hembra</option>
              <option value="Macho">Macho</option>
            </select>
            {errors.sex && <p className="text-[11px] text-rose-600 font-medium">{errors.sex}</p>}
          </div>

          {/* Fecha de Nacimiento (con cálculo de edad) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">
              Fecha de Nacimiento <span className="text-rose-600">*</span>
            </label>
            <input
              type="date"
              name="birthDay"
              value={birthDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                errors.birthDay ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
              }`}
            />
            {calculatedAge !== null && (
              <p className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                Edad calculada: {calculatedAge} meses ({Math.floor(calculatedAge / 12)}a {calculatedAge % 12}m)
              </p>
            )}
            {errors.birthDay && <p className="text-[11px] text-rose-600 font-medium">{errors.birthDay}</p>}
          </div>

          {/* Peso en kg */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">
              Peso en kg <span className="text-rose-600">*</span>
            </label>
            <input
              type="number"
              name="weight"
              min="1"
              step="0.5"
              defaultValue={values.weight}
              placeholder="Ej: 480"
              className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                errors.weight ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
              }`}
            />
            {errors.weight && <p className="text-[11px] text-rose-600 font-medium">{errors.weight}</p>}
          </div>

          {/* Precio en COP */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">
              Precio en COP ($) <span className="text-rose-600">*</span>
            </label>
            <input
              type="number"
              name="price"
              min="1"
              step="50000"
              defaultValue={values.price}
              placeholder="Ej: 5200000"
              className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                errors.price ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
              }`}
            />
            {errors.price && <p className="text-[11px] text-rose-600 font-medium">{errors.price}</p>}
          </div>

          {/* Color / Marcaje */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Color / Marcaje</label>
            <input
              type="text"
              name="color"
              defaultValue={values.color}
              placeholder="Ej: Blanco con negro, hierro 42"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>

          {/* Ubicación */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-stone-700 block">
              Ubicación del Predio (Departamento y Municipio) <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              name="location"
              defaultValue={values.location}
              placeholder="Ej: Finca Las Palmas, Montería, Córdoba"
              className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                errors.location ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
              }`}
            />
            {errors.location && <p className="text-[11px] text-rose-600 font-medium">{errors.location}</p>}
          </div>

          {/* URLs de imágenes */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-stone-700 block">
              URL Imagen Principal (Foto del bovino)
            </label>
            <input
              type="url"
              name="imageUrl1"
              defaultValue={values.imageUrl1 || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80"}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-stone-700 block">
              URL Imagen Secundaria (Opcional)
            </label>
            <input
              type="url"
              name="imageUrl2"
              defaultValue={values.imageUrl2}
              placeholder="https://..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>

          {/* Descripción corta y detallada */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-stone-700 block">Descripción Zootécnica</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={values.description}
              placeholder="Características fenotípicas, genealogía o historial del animal..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>

          {/* Historial Sanitario */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-stone-700 block">Historial Sanitario / Vacunación ICA</label>
            <input
              type="text"
              name="sanitaryHistory"
              defaultValue={values.sanitaryHistory || "Vacunación oficial aftosa y brucelosis al día. RUV expedido."}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <Link
            to="/catalogo"
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
            <span>{isSubmitting ? "Guardando ejemplar..." : "Guardar Bovino"}</span>
          </button>
        </div>
      </Form>
    </div>
  );
}
