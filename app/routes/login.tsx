import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useSearchParams, Form, Link, useNavigation } from "@remix-run/react";
import { authenticate, createUserSession } from "~/services/auth.server.ts";
import { getUser } from "~/services/session.server.ts";
import { Lock, Mail, AlertCircle } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (user) {
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get("redirectTo") || "/";
    throw createUserSession(user.id, redirectTo, request);
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const redirectTo = formData.get("redirectTo")?.toString() || "/";

  if (!email || !password) {
    return json({ error: "Credenciales inválidas" }, { status: 400 });
  }

  const user = await authenticate(email, password);

  if (!user) {
    return json({ error: "Credenciales inválidas. Verifica tu correo y contraseña." }, { status: 401 });
  }

  return createUserSession(user.id, redirectTo, request);
}

export default function Login() {
  const actionData = useActionData<{ error?: string }>();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const redirectTo = searchParams.get("redirectTo") || "/";

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-[#B3202A] text-white flex items-center justify-center mx-auto shadow-lg">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Iniciar Sesión
        </h1>
        <p className="text-xs text-stone-500">
          Ingresa a tu cuenta de GanadoCarnes para gestionar tus pedidos y compras.
        </p>
      </div>

      {actionData?.error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionData.error}</span>
        </div>
      )}

      {/* Formulario Principal */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
        <Form method="post" className="space-y-4 text-xs">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 block">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                placeholder="tu@correo.com"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 block">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold rounded-xl text-xs shadow-md transition-colors disabled:opacity-50 mt-2"
          >
            {isSubmitting ? "Autenticando..." : "Ingresar a mi Cuenta"}
          </button>
        </Form>

        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
          ¿No tienes una cuenta aún?{" "}
          <Link to="/registro" className="font-bold text-[#B3202A] hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </div>

    </div>
  );
}
