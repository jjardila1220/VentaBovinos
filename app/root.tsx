import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useSearchParams,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getUser } from "~/services/session.server.ts";
import { getUserCartBovines } from "~/services/bovines.server.ts";
import { Header } from "~/components/Header.tsx";
import { Footer } from "~/components/Footer.tsx";
import { Toast } from "~/components/Toast.tsx";
import styles from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap",
  },
];

export const meta: MetaFunction = () => [
  { title: "GanadoCarnes - Compra y Venta de Ganado Lechero y Carnal" },
  {
    name: "description",
    content: "Plataforma de compra y venta de bovinos en Colombia. Calidad, confianza y el mejor precio.",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await getUser(request);
    let cartCount = 0;
    if (user) {
      const cartItems = await getUserCartBovines(user.id);
      cartCount = cartItems.length;
    }
    return json({
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        : null,
      cartCount,
      dbConnected: true,
    });
  } catch (error) {
    // Si la base de datos aún no está corriendo en local o falla la conexión inicial
    return json({
      user: null,
      cartCount: 0,
      dbConnected: false,
    });
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full flex flex-col bg-stone-50 text-stone-800 font-sans antialiased selection:bg-rose-100 selection:text-[#B3202A]">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");
  const infoParam = searchParams.get("info");

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={data.user} cartCount={data.cartCount} />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* Global query param toasts */}
      {successParam && <Toast message={successParam} type="success" />}
      {errorParam && <Toast message={errorParam} type="error" />}
      {infoParam && <Toast message={infoParam} type="info" />}
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  let errorMessage = "Ha ocurrido un error inesperado.";
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.data?.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <header className="bg-[#B3202A] text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="font-black text-xl">GanadoCarnes</a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg border border-stone-200 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-[#B3202A] font-black text-2xl">
            !
          </div>
          <h1 className="text-xl font-bold text-stone-900">Error {errorStatus}</h1>
          <p className="text-xs text-stone-600 leading-relaxed">{errorMessage}</p>
          <div className="pt-2">
            <a
              href="/"
              className="inline-block px-5 py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white rounded-xl text-xs font-bold transition-colors"
            >
              Regresar al Inicio
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
