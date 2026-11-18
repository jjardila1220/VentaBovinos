import { json, type HeadersFunction, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useNavigation } from "@remix-run/react";
import {
  Beef,
  ChartColumn,
  ChevronRight,
  Minus,
  Printer,
  RefreshCw,
  Sparkles,
  Sprout,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Scale,
} from "lucide-react";
import type { ReactNode } from "react";
import { VentasChart } from "~/components/comparativa/VentasChart.tsx";
import { cn } from "~/lib/utils.ts";
import { describeComparativa, type ComparativaCategoria } from "~/services/comparativa.ts";
import { getComparativa } from "~/services/comparativa.server.ts";
import { requireAdmin } from "~/services/auth.server.ts";
import { SemillasError } from "~/services/semillas.server.ts";
import { PERIODOS, parsePeriodo, type SemillasPeriodo } from "~/services/semillas.types.ts";
import {
  formatCOP,
  formatDateTime,
  formatInteger,
  formatIsoDate,
  formatPercent,
  formatSignedPercent,
} from "~/utils/formatters.ts";

// Datos financieros: nunca deben quedar en cachés del navegador ni de intermediarios.
const NO_STORE = { "Cache-Control": "no-store" };

export const headers: HeadersFunction = () => NO_STORE;

export const meta: MetaFunction = () => [
  { title: "Comparativa de ventas: bovinos y semillas | GanadoCarnes" },
  { name: "robots", content: "noindex, nofollow" },
];

const PERIODO_OPCIONES: Array<{ value: SemillasPeriodo; label: string; hint: string }> = [
  { value: "semana", label: "Semanas", hint: "Últimas 8 semanas" },
  { value: "mes", label: "Meses", hint: "Últimos 6 meses" },
  { value: "anio", label: "Años", hint: "Últimos 3 años" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const periodo = parsePeriodo(new URL(request.url).searchParams.get("periodo"));

  try {
    const comparativa = await getComparativa(periodo);
    return json({ periodo, comparativa, error: null }, { headers: NO_STORE });
  } catch (error) {
    if (error instanceof SemillasError) {
      // El detalle técnico queda en el log del servidor; al navegador solo llega un mensaje seguro.
      console.error(`[comparativa] Semillas del Valle (${error.code}): ${error.message}`);
      const status = error.code === "not_configured" ? 500 : error.code === "unavailable" ? 503 : 502;
      return json(
        { periodo, comparativa: null, error: { code: error.code, message: error.userMessage } },
        { status, headers: NO_STORE }
      );
    }
    console.error("[comparativa] Error generando la comparativa:", error);
    return json(
      {
        periodo,
        comparativa: null,
        error: { code: "internal", message: "No se pudo generar la comparativa. Inténtalo de nuevo en unos minutos." },
      },
      { status: 500, headers: NO_STORE }
    );
  }
}

export default function ComparativaVentas() {
  const { periodo, comparativa, error } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading" && navigation.location?.pathname === "/reportes/comparativa";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6" aria-busy={isLoading}>
      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs text-stone-500 font-medium print:hidden">
        <Link to="/" className="hover:text-[#B3202A]">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
        <span>Reportes</span>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
        <span className="text-stone-900 font-bold" aria-current="page">Comparativa de ventas</span>
      </nav>

      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#B3202A] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Bovinos + Semillas del Valle</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <ChartColumn className="w-8 h-8 text-[#B3202A]" aria-hidden="true" />
            <span>Comparativa de ventas</span>
          </h1>
          <p className="text-stone-500 text-xs mt-1 max-w-2xl">
            Ventas completadas de bovinos frente a las de semillas, agrupadas en los mismos periodos para compararlas de
            forma justa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <nav aria-label="Periodo del reporte" className="inline-flex rounded-xl bg-stone-100 p-1 text-xs font-bold">
            {PERIODO_OPCIONES.map((option) => {
              const active = option.value === periodo;
              return (
                <Link
                  key={option.value}
                  to={`?periodo=${option.value}`}
                  preventScrollReset
                  title={option.hint}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "px-4 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3202A]",
                    active ? "bg-white text-[#B3202A] shadow-sm" : "text-stone-500 hover:text-stone-800"
                  )}
                >
                  {option.label}
                </Link>
              );
            })}
          </nav>
          {comparativa && (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              Imprimir
            </button>
          )}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {isLoading ? "Consultando ventas…" : ""}
      </p>

      {error || !comparativa ? (
        <ErrorState message={error?.message ?? "No se pudo generar la comparativa."} periodo={periodo} />
      ) : (
        <div className={cn("space-y-6 transition-opacity", isLoading && "opacity-50 pointer-events-none")}>
          {/* Conclusión */}
          <div className="rounded-3xl bg-[#F9E3E3] border border-rose-200 px-5 py-4 text-sm text-stone-800 leading-relaxed print:break-inside-avoid">
            <p>
              <span className="font-black text-[#8B1820]">En resumen · </span>
              {describeComparativa(comparativa)}
            </p>
            <p className="text-[11px] text-stone-600 mt-1">
              {formatIsoDate(comparativa.desde)} – {formatIsoDate(comparativa.hasta)}
              {comparativa.serie.some((p) => p.enCurso) && " · El último intervalo está en curso, por lo que su total es parcial."}
            </p>
          </div>

          {/* Indicadores */}
          <section aria-label="Indicadores principales" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              icon={<Beef className="w-4 h-4" aria-hidden="true" />}
              accent="bg-[#B3202A]"
              label="Ventas de bovinos"
              value={formatCOP(comparativa.bovinos.total)}
              footer={
                <>
                  <VariationChip value={comparativa.bovinos.variacion} />
                  <p className="text-[11px] text-stone-500 mt-1.5">
                    {formatInteger(comparativa.bovinos.pedidos)} facturas · {formatInteger(comparativa.bovinos.unidades)}{" "}
                    {comparativa.bovinos.unidades === 1 ? "ejemplar" : "ejemplares"}
                  </p>
                </>
              }
            />
            <KpiCard
              icon={<Sprout className="w-4 h-4" aria-hidden="true" />}
              accent="bg-emerald-700"
              label="Ventas de semillas"
              value={formatCOP(comparativa.semillas.total)}
              footer={
                <>
                  <VariationChip value={comparativa.semillas.variacion} />
                  <p className="text-[11px] text-stone-500 mt-1.5">
                    {formatInteger(comparativa.semillas.pedidos)} pedidos · {formatInteger(comparativa.semillas.unidades)}{" "}
                    unidades
                  </p>
                </>
              }
            />
            <KpiCard
              icon={<Scale className="w-4 h-4" aria-hidden="true" />}
              accent="bg-stone-700"
              label="Total combinado"
              value={formatCOP(comparativa.combinado.total)}
              footer={
                <p className="text-[11px] text-stone-500">
                  Bovinos {formatPercent(comparativa.combinado.participacionBovinos)} · Semillas{" "}
                  {formatPercent(comparativa.combinado.participacionSemillas)}
                </p>
              }
            />
            <KpiCard
              icon={<ChartColumn className="w-4 h-4" aria-hidden="true" />}
              accent="bg-amber-600"
              label="Peso de las semillas"
              value={formatPercent(comparativa.combinado.participacionSemillas)}
              footer={
                <p className="text-[11px] text-stone-500">
                  Ticket promedio: bovinos {formatCOP(comparativa.bovinos.ticketPromedio)} · semillas{" "}
                  {formatCOP(comparativa.semillas.ticketPromedio)}
                </p>
              }
            />
          </section>

          {/* Gráfico */}
          <Card
            title="Ventas por periodo"
            subtitle={`${comparativa.etiquetaPeriodo}. Cada barra compara bovinos y semillas en el mismo intervalo.`}
          >
            <VentasChart serie={comparativa.serie} titulo={`Ventas por periodo, ${comparativa.etiquetaPeriodo}`} />
          </Card>

          {/* Tabla de detalle */}
          <Card title="Detalle por periodo" subtitle="Los mismos datos del gráfico, en cifras.">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-left text-xs border-collapse">
                <caption className="sr-only">
                  Ventas de bovinos y de semillas por periodo, con el porcentaje que representan las semillas.
                </caption>
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider">
                    <th scope="col" className="py-3 px-3 font-bold">Periodo</th>
                    <th scope="col" className="py-3 px-3 font-bold text-right">Bovinos</th>
                    <th scope="col" className="py-3 px-3 font-bold text-right">Semillas</th>
                    <th scope="col" className="py-3 px-3 font-bold text-right">Total</th>
                    <th scope="col" className="py-3 px-3 font-bold text-right">% semillas</th>
                    <th scope="col" className="py-3 px-3 font-bold text-right">Facturas bovinos</th>
                    <th scope="col" className="py-3 px-3 font-bold text-right">Pedidos semillas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {comparativa.serie.map((point) => (
                    <tr key={point.desde} className="hover:bg-rose-50/40 transition-colors">
                      <th scope="row" className="py-3 px-3 font-bold text-stone-900 whitespace-nowrap">
                        <span>{point.etiqueta}</span>
                        {point.enCurso && (
                          <span className="ml-2 inline-block rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                            en curso
                          </span>
                        )}
                        <span className="block text-[10px] font-normal text-stone-400">
                          {formatIsoDate(point.desde)} – {formatIsoDate(point.hasta)}
                        </span>
                      </th>
                      <td className="py-3 px-3 text-right tabular-nums text-stone-800">{formatCOP(point.bovinos.total)}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-stone-800">{formatCOP(point.semillas.total)}</td>
                      <td className="py-3 px-3 text-right tabular-nums font-bold text-stone-900">{formatCOP(point.total)}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-stone-600">
                        {formatPercent(point.participacionSemillas)}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-stone-600">{formatInteger(point.bovinos.pedidos)}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-stone-600">{formatInteger(point.semillas.pedidos)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-stone-200 bg-stone-50 font-black text-stone-900">
                    <th scope="row" className="py-3 px-3">Total</th>
                    <td className="py-3 px-3 text-right tabular-nums">{formatCOP(comparativa.bovinos.total)}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{formatCOP(comparativa.semillas.total)}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{formatCOP(comparativa.combinado.total)}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{formatPercent(comparativa.combinado.participacionSemillas)}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{formatInteger(comparativa.bovinos.pedidos)}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{formatInteger(comparativa.semillas.pedidos)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Composición por categoría */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Bovinos por categoría" subtitle="Cómo se reparten las ventas de ganado.">
              <CategoryBars items={comparativa.bovinos.porCategoria} variant="bovinos" />
            </Card>
            <Card title="Semillas por categoría" subtitle="Cómo se reparten las ventas de semillas.">
              <CategoryBars items={comparativa.semillas.porCategoria} variant="semillas" />
            </Card>
          </div>

          {/* Detalle de semillas */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <Card title="Semillas más vendidas" subtitle="Los cinco productos con mayor facturación en el periodo.">
                {comparativa.semillas.masVendidos.length === 0 ? (
                  <EmptyNote>Sin ventas de semillas en el periodo.</EmptyNote>
                ) : (
                  <div className="overflow-x-auto -mx-1">
                    <table className="w-full text-left text-xs border-collapse">
                      <caption className="sr-only">Productos de semillas con mayor facturación.</caption>
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider">
                          <th scope="col" className="py-3 px-3 font-bold">Producto</th>
                          <th scope="col" className="py-3 px-3 font-bold text-right">Unidades</th>
                          <th scope="col" className="py-3 px-3 font-bold text-right">Total</th>
                          <th scope="col" className="py-3 px-3 font-bold text-right">% de semillas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {comparativa.semillas.masVendidos.map((product) => (
                          <tr key={product.id} className="hover:bg-rose-50/40 transition-colors">
                            <th scope="row" className="py-3 px-3 font-bold text-stone-900">
                              {product.nombre}
                              {product.presentacion && (
                                <span className="ml-1.5 font-normal text-stone-400">{product.presentacion}</span>
                              )}
                            </th>
                            <td className="py-3 px-3 text-right tabular-nums text-stone-700">{formatInteger(product.unidades)}</td>
                            <td className="py-3 px-3 text-right tabular-nums font-bold text-stone-900">{formatCOP(product.total)}</td>
                            <td className="py-3 px-3 text-right tabular-nums text-stone-600">{formatPercent(product.participacion)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card title="Reservas de semillas" subtitle="De lo apartado en carritos, cuánto se terminó comprando.">
                <Conversion
                  percent={comparativa.semillas.conversion.porcentaje_compradas}
                  sold={comparativa.semillas.conversion.unidades_vendidas}
                  cancelled={comparativa.semillas.conversion.unidades_canceladas}
                  reserved={comparativa.semillas.conversion.unidades_apartadas_ahora}
                />
                <dl className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-stone-100 text-xs">
                  <div>
                    <dt className="text-stone-500">Clientes de semillas</dt>
                    <dd className="font-black text-stone-900 text-base tabular-nums">{formatInteger(comparativa.semillas.clientes)}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-500">Productos distintos</dt>
                    <dd className="font-black text-stone-900 text-base tabular-nums">{formatInteger(comparativa.semillas.productosDistintos)}</dd>
                  </div>
                </dl>
              </Card>
            </div>
          </div>

          {/* Notas metodológicas */}
          <aside className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-[11px] leading-relaxed text-stone-500 print:break-inside-avoid">
            <p className="font-bold text-stone-700 mb-1">Cómo se calcula</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>
                <strong className="text-stone-700">Bovinos:</strong> líneas de factura de ejemplares en ventas con estado
                «Completado» de esta plataforma. No incluye cortes cárnicos.
              </li>
              <li>
                <strong className="text-stone-700">Semillas:</strong> pedidos «Completado» de Semillas del Valle, consultados a
                su API.
              </li>
              <li>Los intervalos los define Semillas y se usa la fecha de Bogotá (UTC-5) en ambos lados.</li>
              <li>
                La variación compara contra el periodo inmediatamente anterior de igual duración. Datos generados el{" "}
                {formatDateTime(comparativa.generadoEn)} (las ventas de semillas se consultan con una caché breve).
              </li>
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Piezas de interfaz
// ---------------------------------------------------------------------------

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-3xl shadow-sm border border-stone-200 p-5 sm:p-6 print:shadow-none print:break-inside-avoid">
      <header className="mb-4">
        <h2 className="text-base font-black text-stone-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function KpiCard({
  icon,
  accent,
  label,
  value,
  footer,
}: {
  icon: ReactNode;
  accent: string;
  label: string;
  value: string;
  footer: ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-5 print:shadow-none print:break-inside-avoid">
      <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
        <span className={cn("w-7 h-7 rounded-lg text-white flex items-center justify-center", accent)}>{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-3 text-2xl font-black text-stone-900 tracking-tight tabular-nums">{value}</p>
      <div className="mt-2">{footer}</div>
    </div>
  );
}

/** La variación se comunica con ícono, signo y texto, no solo con color. */
function VariationChip({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-[11px] text-stone-400">Sin periodo anterior con ventas para comparar</span>;
  }
  const direction = value > 0 ? "up" : value < 0 ? "down" : "flat";
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  const tone =
    direction === "up"
      ? "bg-emerald-50 text-emerald-800"
      : direction === "down"
        ? "bg-rose-50 text-rose-800"
        : "bg-stone-100 text-stone-600";
  const spoken =
    direction === "flat"
      ? "Sin cambio frente al periodo anterior"
      : `${direction === "up" ? "Sube" : "Baja"} ${formatPercent(Math.abs(value))} frente al periodo anterior`;

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className="sr-only">{spoken}</span>
      <span aria-hidden="true" className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold", tone)}>
        <Icon className="w-3 h-3" />
        {formatSignedPercent(value)}
      </span>
      <span aria-hidden="true" className="text-[11px] text-stone-400">vs. periodo anterior</span>
    </span>
  );
}

function CategoryBars({ items, variant }: { items: ComparativaCategoria[]; variant: "bovinos" | "semillas" }) {
  if (items.length === 0) return <EmptyNote>Sin ventas en el periodo.</EmptyNote>;

  const fill =
    variant === "bovinos"
      ? { backgroundColor: "#B3202A" }
      : { backgroundImage: "repeating-linear-gradient(45deg, #047857 0 4px, #D1FAE5 4px 6px)", backgroundColor: "#047857" };

  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const width = Math.min(100, Math.max(0, item.participacion ?? 0));
        return (
          <li key={item.nombre}>
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="font-bold text-stone-800">{item.nombre}</span>
              <span className="tabular-nums text-stone-600">
                {formatCOP(item.total)} · <strong className="text-stone-900">{formatPercent(item.participacion)}</strong>
              </span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-stone-100 overflow-hidden" aria-hidden="true">
              <div className="h-full rounded-full" style={{ width: `${width}%`, ...fill }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Conversion({
  percent,
  sold,
  cancelled,
  reserved,
}: {
  percent: number | null;
  sold: number;
  cancelled: number;
  reserved: number;
}) {
  const width = Math.min(100, Math.max(0, percent ?? 0));
  return (
    <div>
      <p className="text-3xl font-black text-stone-900 tabular-nums">{formatPercent(percent)}</p>
      <p className="text-xs text-stone-500 mb-3">
        {percent === null ? "No hubo unidades apartadas en el periodo." : "de las unidades apartadas se compraron."}
      </p>
      <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden" aria-hidden="true">
        <div className="h-full rounded-full bg-emerald-700" style={{ width: `${width}%` }} />
      </div>
      <dl className="grid grid-cols-3 gap-2 mt-4 text-xs">
        <div>
          <dt className="text-stone-500">Compradas</dt>
          <dd className="font-black text-stone-900 tabular-nums">{formatInteger(sold)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Liberadas</dt>
          <dd className="font-black text-stone-900 tabular-nums">{formatInteger(cancelled)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">En carritos hoy</dt>
          <dd className="font-black text-stone-900 tabular-nums">{formatInteger(reserved)}</dd>
        </div>
      </dl>
    </div>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 py-8 text-center text-xs text-stone-500">
      {children}
    </div>
  );
}

function ErrorState({ message, periodo }: { message: string; periodo: SemillasPeriodo }) {
  return (
    <div role="alert" className="rounded-3xl border border-rose-200 bg-white shadow-sm p-8 text-center max-w-2xl mx-auto">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-[#B3202A] flex items-center justify-center">
        <TriangleAlert className="w-7 h-7" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-black text-stone-900">No pudimos generar la comparativa</h2>
      <p className="mt-2 text-xs leading-relaxed text-stone-600">{message}</p>
      <Link
        to={`?periodo=${PERIODOS.includes(periodo) ? periodo : "mes"}`}
        preventScrollReset
        className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white rounded-xl text-xs font-bold transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
        Reintentar
      </Link>
    </div>
  );
}
