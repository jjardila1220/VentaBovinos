import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getSaleById } from "~/services/sales.server.ts";
import { formatCOP, formatDateTime } from "~/utils/formatters.ts";
import { 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  FileText,
  QrCode
} from "lucide-react";

export async function loader({ params }: LoaderFunctionArgs) {
  const id = Number(params.id);
  if (isNaN(id)) {
    throw new Response("ID de factura inválido", { status: 400 });
  }

  try {
    const sale = await getSaleById(id);
    if (!sale) {
      throw new Response("Factura o comprobante no encontrado", { status: 404 });
    }

    return json({ sale });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Error loading invoice:", error);
    throw new Response("Error al consultar la factura en la base de datos.", { status: 500 });
  }
}

export default function FacturaDetalle() {
  const { sale } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Botones de acción superiores (Ocultos en impresión) */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#B3202A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/ventas"
            className="px-4 py-2 border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-bold transition-colors"
          >
            Ver Historial de Ventas
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2 bg-[#B3202A] hover:bg-[#8B1820] text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar como PDF</span>
          </button>
        </div>
      </div>

      {/* Comprobante / Factura Oficial */}
      <div className="bg-white rounded-3xl shadow-lg border border-stone-200 p-8 sm:p-12 space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Encabezado Comercial */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-stone-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#B3202A] flex items-center justify-center text-white shadow-md">
                <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M21 4c-.6 0-1.7.5-2.5 1.5-1.2 1.5-2.5 2.5-4.5 2.5H10c-2 0-3.3-1-4.5-2.5C4.7 4.5 3.6 4 3 4c-.6 0-1 .4-1 1 0 1.2 1 3.5 2.5 5 1.1 1.1 2.2 1.8 3.5 2v1.5c0 2.5 1.8 4.5 4 4.5s4-2 4-4.5V12c1.3-.2 2.4-.9 3.5-2 1.5-1.5 2.5-3.8 2.5-5 0-.6-.4-1-1-1zm-9 13c-1.1 0-2-.9-2-2v-.5c.6.3 1.3.5 2 .5s1.4-.2 2-.5v.5c0 1.1-.9 2-2 2z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-[#B3202A] block leading-none">
                  GanadoCarnes S.A.S.
                </span>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                  Comercializadora de Ganado Lechero y Carnal
                </span>
              </div>
            </div>

            <div className="text-xs text-stone-600 space-y-0.5 pt-2">
              <p><strong>NIT:</strong> 901.482.910-3 (Régimen Común)</p>
              <p><strong>Dirección:</strong> Km 14 Vía al Llano, Villavicencio, Meta</p>
              <p><strong>Teléfono:</strong> +57 311 450 8920</p>
              <p><strong>Registro Pecuario ICA:</strong> RUV-50001-2026</p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-2">
            <div className="inline-block bg-rose-50 border border-rose-200 px-4 py-2 rounded-2xl">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">Factura Electrónica de Venta</span>
              <span className="text-xl font-black text-[#B3202A] font-mono tracking-tight">
                {sale.invoiceNumber}
              </span>
            </div>

            <div className="text-xs text-stone-500 space-y-1">
              <p><strong>Fecha y Hora:</strong> {formatDateTime(sale.date)}</p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Estado: {sale.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Datos del Comprador y Transacción */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50 p-6 rounded-2xl border border-stone-200 text-xs">
          <div>
            <h3 className="font-black text-stone-900 uppercase tracking-wider text-[11px] mb-2">
              Datos del Comprador
            </h3>
            <div className="space-y-1 text-stone-700">
              <p><strong>Nombre / Razón Social:</strong> {sale.clientName}</p>
              <p><strong>Documento / NIT:</strong> {sale.clientDocument}</p>
              <p><strong>Teléfono:</strong> {sale.clientPhone || "No registrado"}</p>
              <p><strong>Correo:</strong> {sale.clientEmail || "No registrado"}</p>
              <p><strong>Predio de Destino:</strong> {sale.clientAddress || "Por coordinar"}</p>
            </div>
          </div>

          <div>
            <h3 className="font-black text-stone-900 uppercase tracking-wider text-[11px] mb-2">
              Detalles del Pago & Despacho
            </h3>
            <div className="space-y-1 text-stone-700">
              <p><strong>Método de Pago:</strong> {sale.paymentMethod}</p>
              <p><strong>Guía ICA (GSMI):</strong> Autorizada y Tramitada</p>
              <p><strong>Vigencia Sanitaria:</strong> 5 días calendario</p>
              <p><strong>Pesaje Oficial:</strong> Realizado en Báscula Camionera</p>
            </div>
          </div>
        </div>

        {/* Tabla con los Bovinos Adquiridos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-stone-300 text-stone-500 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-2">Ítem / ID</th>
                <th className="py-3 px-2">Descripción del Ejemplar</th>
                <th className="py-3 px-2">Categoría</th>
                <th className="py-3 px-2 text-right">Cant.</th>
                <th className="py-3 px-2 text-right">Precio Unitario</th>
                <th className="py-3 px-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {sale.details.map((item, idx) => (
                <tr key={item.id} className="text-stone-800">
                  <td className="py-3.5 px-2 font-mono font-bold text-stone-500">
                    #{item.bovineId || idx + 1}
                  </td>
                  <td className="py-3.5 px-2 font-bold text-stone-900">
                    {item.bovineName || item.productName || "Bovino Certificado"}
                  </td>
                  <td className="py-3.5 px-2 text-stone-600">
                    {item.bovineCategory || "Ganado Bovino"}
                  </td>
                  <td className="py-3.5 px-2 text-right font-medium">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    {formatCOP(parseFloat(item.unitaryPrice))}
                  </td>
                  <td className="py-3.5 px-2 text-right font-bold text-stone-900">
                    {formatCOP(parseFloat(item.subtotal))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales y Liquidación */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-4 border-t-2 border-stone-200">
          <div className="space-y-2 text-xs text-stone-500 max-w-sm">
            <p className="font-semibold text-stone-700">Términos de la Transacción:</p>
            <p className="leading-relaxed text-[11px]">
              Esta factura electrónica es título valor conforme a la ley colombiana. La entrega de los semovientes incluye certificado de desparasitación, examen andrológico (en toros) y guía ICA de movilización expedida a nombre del comprador.
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="font-bold text-stone-900">{formatCOP(parseFloat(sale.total))}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Guía ICA / RUV:</span>
              <span className="font-bold text-emerald-600">$ 0 (Incluido)</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>IVA Régimen Pecuario:</span>
              <span className="font-bold text-stone-900">$ 0</span>
            </div>

            <div className="pt-3 border-t-2 border-[#B3202A] flex justify-between items-baseline">
              <span className="text-sm font-black text-stone-900 uppercase">Total Pagado:</span>
              <span className="text-2xl font-black text-[#B3202A]">
                {formatCOP(parseFloat(sale.total))}
              </span>
            </div>
          </div>
        </div>

        {/* Firma y Sellos de Garantía */}
        <div className="pt-8 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] text-stone-500">
          <div className="space-y-1">
            <div className="h-12 border-b border-stone-300 w-48"></div>
            <p className="font-bold text-stone-800">Firma Autorizada GanadoCarnes S.A.S.</p>
            <p>Gerencia de Comercialización Pecuaria</p>
          </div>
          <div className="space-y-1 sm:text-right">
            <p className="font-mono text-[10px] text-stone-400">CUFE: a7d9e4c1-8b20-4e3f-91a0-543210abcdef</p>
            <p className="text-emerald-700 font-bold">Documento Verificado por la DIAN y el ICA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
