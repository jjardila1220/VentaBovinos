import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getBovines } from "~/services/bovines.server.ts";
import { BovineCard } from "~/components/BovineCard.tsx";
import { formatCOP } from "~/utils/formatters.ts";
import { ArrowRight, Search, Sparkles, ShieldCheck } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { items: featured } = await getBovines({
      status: "Disponible",
      limit: 4,
      sortBy: "newest",
    });
    return json({ featured, dbError: false });
  } catch (error) {
    console.error("Database connection notice:", error);
    return json({ featured: [], dbError: true });
  }
}

export default function Index() {
  const { featured, dbError } = useLoaderData<typeof loader>();

  const categories = [
    {
      title: "Vacas lecheras",
      description: "Líneas Holstein, Jersey y Gyr con alta producción láctea y genética certificada.",
      image: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80",
      minPrice: 5900000,
      badge: "Alta Producción",
    },
    {
      title: "Novillos",
      description: "Machos de ceba y levante con excelente desarrollo muscular y conversión cárnica.",
      image: "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=800&q=80",
      minPrice: 4900000,
      badge: "Ceba y Levante",
    },
    {
      title: "Terneros",
      description: "Destetos precoces de gran rusticidad para reemplazo de hato y programas de engorde.",
      image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80",
      minPrice: 2800000,
      badge: "Genética Joven",
    },
    {
      title: "Toros",
      description: "Sementales evaluados con andrológico vigente, pedigree cerrado y gran vigor híbrido.",
      image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80",
      minPrice: 12800000,
      badge: "Reproductores Élite",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Inicio Banner:
          título "Ganado Lechero y Ganado Carnal" y eslogan "Calidad, confianza y el mejor precio".
          Barra de búsqueda con botón Filtrar.
      */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8B1820] via-[#B3202A] to-[#6E1017] text-white py-16 sm:py-24 px-4 sm:px-6 shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-rose-100 text-xs font-semibold backdrop-blur-xs border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Comercialización Directa de Ganado en Colombia</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Ganado Lechero y Ganado Carnal
          </h1>

          <p className="text-lg sm:text-2xl font-light text-rose-100 max-w-2xl mx-auto">
            Calidad, confianza y el mejor precio
          </p>

          {/* Barra de búsqueda con botón Filtrar */}
          <form
            method="get"
            action="/catalogo"
            className="max-w-2xl mx-auto mt-8 flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-2xl shadow-2xl border border-rose-200"
          >
            <div className="flex items-center gap-3 px-3 flex-1 w-full">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                name="search"
                placeholder="Buscar por raza (Holstein, Brahman, Angus...), peso o ID..."
                className="w-full text-stone-900 placeholder-stone-400 text-sm focus:outline-none py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#B3202A] hover:bg-[#8B1820] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Filtrar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Enlaces rápidos */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-rose-100">
            <span className="text-rose-200">Categorías:</span>
            {categories.map((cat) => (
              <Link
                key={cat.title}
                to={`/catalogo?category=${encodeURIComponent(cat.title)}`}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/25 transition-colors border border-white/15"
              >
                {cat.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Sección "Nuestros productos" con fondo rosa claro (#F9E3E3) y tarjetas de categoría
          (Vacas lecheras, Novillos, Terneros, Toros), precio desde y botón "Ver más".
      */}
      <section className="bg-[#F9E3E3] py-16 px-4 sm:px-6 border-y border-rose-200/80">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B3202A]">
              Catálogo Especializado
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#8B1820] tracking-tight">
              Nuestros Productos
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
              Seleccione la categoría de su interés para visualizar los ejemplares con pesaje en báscula digital y trazabilidad ICA.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-rose-100 flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#B3202A] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                    {cat.badge}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-stone-900 group-hover:text-[#B3202A] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1.5 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 space-y-3">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                        Precio desde
                      </span>
                      <span className="text-lg font-black text-[#B3202A]">
                        {formatCOP(cat.minPrice)}
                      </span>
                    </div>

                    <Link
                      to={`/catalogo?category=${encodeURIComponent(cat.title)}`}
                      className="w-full py-2.5 px-4 bg-[#B3202A] hover:bg-[#8B1820] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Ver más</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Ejemplares Destacados */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B3202A]">
              Disponibilidad Inmediata
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Ejemplares Destacados en Catálogo
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="text-xs font-bold text-[#B3202A] hover:text-[#8B1820] flex items-center gap-1.5"
          >
            <span>Ver todos los bovinos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((b) => (
              <BovineCard key={b.id} bovine={b as any} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
            {dbError ? (
              <p>Conectando a base de datos PostgreSQL local. Ejecuta <code>bun run migrate</code> y <code>bun run seed</code> para cargar los datos.</p>
            ) : (
              <p>No hay bovinos disponibles en este momento.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
