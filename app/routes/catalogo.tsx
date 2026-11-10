import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, Link, Form } from "@remix-run/react";
import { getBovines, getAllBreeds, reserveBovineAtomic } from "~/services/bovines.server.ts";
import { getUser } from "~/services/session.server.ts";
import { BovineCard } from "~/components/BovineCard.tsx";
import { Filter, RotateCcw, ChevronRight, SlidersHorizontal, ArrowUpDown } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "Todos";
  const breedIdStr = url.searchParams.get("breedId");
  const breedId = breedIdStr ? parseInt(breedIdStr, 10) : undefined;
  const sex = url.searchParams.get("sex") || "Todos";
  const minWeightStr = url.searchParams.get("minWeight");
  const maxWeightStr = url.searchParams.get("maxWeight");
  const minAgeStr = url.searchParams.get("minAge");
  const maxAgeStr = url.searchParams.get("maxAge");
  const minPriceStr = url.searchParams.get("minPrice");
  const maxPriceStr = url.searchParams.get("maxPrice");
  const search = url.searchParams.get("search") || "";
  const sortBy = url.searchParams.get("sortBy") || "newest";
  const pageStr = url.searchParams.get("page") || "1";
  const page = parseInt(pageStr, 10) || 1;
  const limit = 8;

  try {
    const breeds = await getAllBreeds();
    const result = await getBovines({
      category: category !== "Todos" ? category : undefined,
      breedId: breedId && !isNaN(breedId) ? breedId : undefined,
      sex: sex !== "Todos" ? sex : undefined,
      minWeight: minWeightStr ? parseFloat(minWeightStr) : undefined,
      maxWeight: maxWeightStr ? parseFloat(maxWeightStr) : undefined,
      minAge: minAgeStr ? parseInt(minAgeStr, 10) : undefined,
      maxAge: maxAgeStr ? parseInt(maxAgeStr, 10) : undefined,
      minPrice: minPriceStr ? parseFloat(minPriceStr) : undefined,
      maxPrice: maxPriceStr ? parseFloat(maxPriceStr) : undefined,
      search: search.trim() || undefined,
      sortBy,
      page,
      limit,
    });

    return json({
      bovines: result.items,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      breeds,
      filters: {
        category,
        breedId: breedIdStr || "",
        sex,
        minWeight: minWeightStr || "",
        maxWeight: maxWeightStr || "",
        minAge: minAgeStr || "",
        maxAge: maxAgeStr || "",
        minPrice: minPriceStr || "",
        maxPrice: maxPriceStr || "",
        search,
        sortBy,
      },
      dbError: false,
    });
  } catch (error) {
    console.error("Catálogo loader notice:", error);
    return json({
      bovines: [],
      total: 0,
      page: 1,
      totalPages: 1,
      breeds: [],
      filters: {
        category,
        breedId: breedIdStr || "",
        sex,
        minWeight: minWeightStr || "",
        maxWeight: maxWeightStr || "",
        minAge: minAgeStr || "",
        maxAge: maxAgeStr || "",
        minPrice: minPriceStr || "",
        maxPrice: maxPriceStr || "",
        search,
        sortBy,
      },
      dbError: true,
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "addToCart") {
    const bovineId = Number(formData.get("bovineId"));
    const user = await getUser(request);
    if (!user) {
      const url = new URL(request.url);
      throw redirect(`/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
    }
    const res = await reserveBovineAtomic(bovineId, user.id);
    if (!res.success) {
      return json({ error: res.message || "No se pudo reservar el bovino." }, { status: 400 });
    }
    return json({ success: true, message: "Bovino añadido al carrito" });
  }

  return json({ ok: true });
}

export default function Catalogo() {
  const { bovines, total, page, totalPages, breeds, filters, dbError } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const categories = ["Todos", "Vacas lecheras", "Novillos", "Terneros", "Toros"];
  const sexOptions = ["Todos", "Macho", "Hembra"];

  const createPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    return `?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb: Inicio > Catálogo */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link to="/" className="hover:text-[#B3202A] transition-colors">
          Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-bold">Catálogo de Bovinos</span>
      </nav>

      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            Bovinos
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Ejemplares lecheros y cárnicos de alta selección genética con certificación sanitaria ICA.
          </p>
        </div>
        <div className="text-sm font-semibold text-stone-500">
          Mostrando <span className="text-[#B3202A] font-bold">{bovines.length}</span> de <span className="font-bold text-stone-800">{total}</span> ejemplares
        </div>
      </div>

      {dbError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center justify-between">
          <span>
            <strong>Aviso de conexión:</strong> La base de datos PostgreSQL local se está inicializando o no tiene registros aún. Ejecuta <code className="bg-amber-100 px-1 py-0.5 rounded">bun run migrate</code> y <code className="bg-amber-100 px-1 py-0.5 rounded">bun run seed</code> en tu terminal local.
          </span>
        </div>
      )}

      {/* Layout Grid: Filtros a la izquierda + Catálogo a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Columna Izquierda de Filtros */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-stone-200/90 space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2 font-black text-stone-900 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-[#B3202A]" />
              <span>Filtros de Búsqueda</span>
            </div>
            <Link
              to="/catalogo"
              className="text-xs text-stone-500 hover:text-[#B3202A] font-medium flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar</span>
            </Link>
          </div>

          <form method="get" className="space-y-5 text-xs">
            {/* Mantener búsqueda y orden si existen */}
            {filters.search && <input type="hidden" name="search" value={filters.search} />}

            {/* Categoría */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 block">Categoría</label>
              <select
                name="category"
                defaultValue={filters.category}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#B3202A] focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Raza */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 block">Raza</label>
              <select
                name="breedId"
                defaultValue={filters.breedId}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#B3202A] focus:outline-none"
              >
                <option value="">Todas las razas</option>
                {breeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sexo */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 block">Sexo</label>
              <select
                name="sex"
                defaultValue={filters.sex}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#B3202A] focus:outline-none"
              >
                {sexOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Rango de peso en kg */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 block">Rango de Peso (kg)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="minWeight"
                  min="0"
                  step="10"
                  placeholder="Mín kg"
                  defaultValue={filters.minWeight}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#B3202A] focus:outline-none"
                />
                <input
                  type="number"
                  name="maxWeight"
                  min="0"
                  step="10"
                  placeholder="Máx kg"
                  defaultValue={filters.maxWeight}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#B3202A] focus:outline-none"
                />
              </div>
            </div>

            {/* Rango de edad en meses */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 block">Edad (meses)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="minAge"
                  min="0"
                  placeholder="Mín meses"
                  defaultValue={filters.minAge}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#B3202A] focus:outline-none"
                />
                <input
                  type="number"
                  name="maxAge"
                  min="0"
                  placeholder="Máx meses"
                  defaultValue={filters.maxAge}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#B3202A] focus:outline-none"
                />
              </div>
            </div>

            {/* Rango de precio en COP */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 block">Rango de Precio ($ COP)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="minPrice"
                  min="0"
                  step="100000"
                  placeholder="Mín $"
                  defaultValue={filters.minPrice}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#B3202A] focus:outline-none"
                />
                <input
                  type="number"
                  name="maxPrice"
                  min="0"
                  step="100000"
                  placeholder="Máx $"
                  defaultValue={filters.maxPrice}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#B3202A] focus:outline-none"
                />
              </div>
            </div>

            {/* Ordenamiento */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 block">Ordenar por</label>
              <select
                name="sortBy"
                defaultValue={filters.sortBy}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#B3202A] focus:outline-none"
              >
                <option value="newest">Más reciente</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="weight_asc">Peso: Menor a Mayor</option>
                <option value="weight_desc">Peso: Mayor a Menor</option>
              </select>
            </div>

            {/* Botones de acción */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Aplicar filtros</span>
              </button>
              <Link
                to="/catalogo"
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-center"
              >
                <span>Limpiar filtros</span>
              </Link>
            </div>
          </form>
        </aside>

        {/* Columna Derecha: Catálogo y Resultados */}
        <section className="lg:col-span-3 space-y-6">
          {/* Barra de filtros activos y orden rápido */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-600">
              <span className="font-bold text-stone-900">{total}</span>
              <span>bovinos encontrados</span>
              {filters.search && (
                <span className="bg-rose-50 text-[#B3202A] px-2.5 py-0.5 rounded-full font-semibold border border-rose-100">
                  Búsqueda: "{filters.search}"
                </span>
              )}
            </div>

            {/* Selector de ordenamiento en header de cuadrícula */}
            <Form method="get" className="flex items-center gap-2">
              <input type="hidden" name="category" value={filters.category} />
              {filters.breedId && <input type="hidden" name="breedId" value={filters.breedId} />}
              <input type="hidden" name="sex" value={filters.sex} />
              {filters.minWeight && <input type="hidden" name="minWeight" value={filters.minWeight} />}
              {filters.maxWeight && <input type="hidden" name="maxWeight" value={filters.maxWeight} />}
              {filters.minPrice && <input type="hidden" name="minPrice" value={filters.minPrice} />}
              {filters.maxPrice && <input type="hidden" name="maxPrice" value={filters.maxPrice} />}
              {filters.search && <input type="hidden" name="search" value={filters.search} />}

              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <select
                name="sortBy"
                defaultValue={filters.sortBy}
                onChange={(e) => e.target.form?.submit()}
                className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:outline-none"
              >
                <option value="newest">Más reciente</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="weight_asc">Peso: Menor a Mayor</option>
                <option value="weight_desc">Peso: Mayor a Menor</option>
              </select>
            </Form>
          </div>

          {/* Cuadrícula de tarjetas (4 cols escritorio, 2 tablet, 1 móvil) */}
          {bovines.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {bovines.map((b) => (
                b && <BovineCard key={b.id} bovine={b as any} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-[#B3202A] flex items-center justify-center mx-auto text-2xl font-black">
                🐂
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                No se encontraron bovinos con estos criterios
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Intenta ajustar o reiniciar los filtros de peso, edad, categoría o precio para ver otros ejemplares disponibles en el inventario.
              </p>
              <div>
                <Link
                  to="/catalogo"
                  className="inline-block px-5 py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Restablecer todos los filtros
                </Link>
              </div>
            </div>
          )}

          {/* Paginación si hay más de 8 elementos */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Link
                to={createPaginationUrl(Math.max(1, page - 1))}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                  page === 1
                    ? "pointer-events-none opacity-40 border-stone-200 text-stone-400"
                    : "border-stone-300 text-stone-700 hover:bg-stone-100"
                }`}
              >
                Anterior
              </Link>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  to={createPaginationUrl(p)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    p === page
                      ? "bg-[#B3202A] text-white shadow-xs"
                      : "border border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {p}
                </Link>
              ))}
              <Link
                to={createPaginationUrl(Math.min(totalPages, page + 1))}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                  page === totalPages
                    ? "pointer-events-none opacity-40 border-stone-200 text-stone-400"
                    : "border-stone-300 text-stone-700 hover:bg-stone-100"
                }`}
              >
                Siguiente
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
