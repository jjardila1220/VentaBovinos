import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, Form, Link, useNavigation } from "@remix-run/react";
import { db } from "~/db/index.ts";
import { users } from "~/db/schema/users.ts";
import { clients } from "~/db/schema/clients.ts";
import { hashPassword, createUserSession } from "~/services/auth.server.ts";
import { getUser } from "~/services/session.server.ts";
import { eq } from "drizzle-orm";
import { UserPlus, User, Mail, Lock, Phone, FileText, AlertCircle } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (user) {
    throw createUserSession(user.id, "/", request);
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString() || "";
  const phone = formData.get("phone")?.toString().trim() || "";
  const document = formData.get("document")?.toString().trim() || "";

  const errors: Record<string, string> = {};

  if (!name || name.length < 3) errors.name = "Ingresa tu nombre completo.";
  if (!email || !email.includes("@")) errors.email = "Ingresa un correo electrónico válido.";
  if (!password || password.length < 6) errors.password = "La contraseña debe tener al menos 6 caracteres.";
  if (!document || document.length < 5) errors.document = "Ingresa tu cédula o NIT.";

  if (Object.keys(errors).length > 0) {
    return json({ errors, values: Object.fromEntries(formData) }, { status: 400 });
  }

  try {
    // Verificar si el correo ya existe
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      return json({ errors: { email: "Este correo electrónico ya está registrado." }, values: Object.fromEntries(formData) }, { status: 400 });
    }

    // 1. Crear registro en clients si no existe
    let [client] = await db.select().from(clients).where(eq(clients.document, document));
    if (!client) {
      const [newClient] = await db.insert(clients).values({
        name,
        document,
        email,
        phone: phone || null,
      }).returning();
      client = newClient;
    }

    // 2. Hashear contraseña con argon2id / Bun.password.hash
    const passwordHash = await hashPassword(password);

    // 3. Crear usuario con rol 'Cliente'
    const [newUser] = await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: "Cliente",
      clientId: client?.id || null,
      active: true,
    }).returning();

    return createUserSession(newUser.id, "/?success=Bienvenido+a+GanadoCarnes", request);
  } catch (error: any) {
    console.error("Registration error:", error);
    return json({ formError: error.message || "No se pudo registrar la cuenta.", values: Object.fromEntries(formData) }, { status: 500 });
  }
}

export default function Registro() {
  const actionData = useActionData<{ errors?: Record<string, string>; formError?: string; values?: Record<string, any> }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const errors: Record<string, string> = actionData?.errors || {};
  const values: Record<string, any> = actionData?.values || {};

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-[#B3202A] text-white flex items-center justify-center mx-auto shadow-lg">
          <UserPlus className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Crear Cuenta de Cliente
        </h1>
        <p className="text-xs text-stone-500">
          Únete a GanadoCarnes para comprar ejemplares de alta selección genética con despacho seguro.
        </p>
      </div>

      {actionData?.formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionData.formError}</span>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-5">
        <Form method="post" className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 block">Nombre Completo</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                name="name"
                defaultValue={values.name}
                required
                placeholder="Ej: Andrés Felipe Gómez"
                className={`w-full bg-stone-50 border rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                  errors.name ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
                }`}
              />
            </div>
            {errors.name && <p className="text-[11px] text-rose-600 font-medium">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 block">Cédula o NIT</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                name="document"
                defaultValue={values.document}
                required
                placeholder="Ej: 1.090.842.112"
                className={`w-full bg-stone-50 border rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                  errors.document ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
                }`}
              />
            </div>
            {errors.document && <p className="text-[11px] text-rose-600 font-medium">{errors.document}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 block">Teléfono / WhatsApp</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="tel"
                name="phone"
                defaultValue={values.phone}
                placeholder="Ej: +57 311 450 8920"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 block">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                defaultValue={values.email}
                required
                placeholder="tu@correo.com"
                className={`w-full bg-stone-50 border rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                  errors.email ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-600 font-medium">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 block">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                placeholder="Mínimo 6 caracteres"
                className={`w-full bg-stone-50 border rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                  errors.password ? "border-rose-500 ring-rose-200" : "border-stone-200 focus:ring-[#B3202A]"
                }`}
              />
            </div>
            {errors.password && <p className="text-[11px] text-rose-600 font-medium">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold rounded-xl text-xs shadow-md transition-colors disabled:opacity-50 mt-2"
          >
            {isSubmitting ? "Registrando cuenta..." : "Crear mi Cuenta de Cliente"}
          </button>
        </Form>

        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-bold text-[#B3202A] hover:underline">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
