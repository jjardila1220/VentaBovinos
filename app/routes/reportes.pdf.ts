import { type LoaderFunctionArgs } from "@remix-run/node";
import PDFDocument from "pdfkit";
import { requireAdmin } from "~/services/auth.server.ts";
import { getSalesHistory } from "~/services/sales.server.ts";
import { getReportClients } from "~/services/reports.server.ts";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const url = new URL(request.url);
  const startDate = url.searchParams.get("startDate") || undefined;
  const endDate = url.searchParams.get("endDate") || undefined;
  const clientIdParam = url.searchParams.get("clientId") || "";
  const status = url.searchParams.get("status") || "Todos";
  const invoiceNumber = url.searchParams.get("invoiceNumber") || undefined;
  const parsedClientId = clientIdParam ? Number(clientIdParam) : undefined;

  if (clientIdParam) {
    if (parsedClientId === undefined || !Number.isInteger(parsedClientId) || parsedClientId <= 0) {
      throw new Response("Cliente no válido", { status: 400 });
    }
  }
  const clientId = parsedClientId;

  const [{ items: sales, total }, clients] = await Promise.all([
    getSalesHistory({ startDate, endDate, clientId, status, invoiceNumber, page: 1, limit: 10000 }),
    getReportClients(),
  ]);
  const selectedClient = clients.find((client) => client.id === clientId);
  const generatedAt = new Date();
  const document = new PDFDocument({ margin: 40 });
  const chunks: Uint8Array[] = [];

  document.on("data", (chunk: Uint8Array) => chunks.push(chunk));
  const finished = new Promise<void>((resolve, reject) => {
    document.on("end", resolve);
    document.on("error", reject);
  });

  document
    .fontSize(18)
    .fillColor("#8B1820")
    .text("GanadoCarnes", { align: "center" })
    .fontSize(14)
    .fillColor("#222222")
    .text("Reporte de ventas", { align: "center" })
    .moveDown();

  document.fontSize(9).fillColor("#444444");
  document.text(`Generado: ${generatedAt.toLocaleString("es-CO")}`);
  document.text(`Filtros aplicados:`);
  document.text(`- Fecha inicial: ${startDate || "Todas"}`);
  document.text(`- Fecha final: ${endDate || "Todas"}`);
  document.text(`- Cliente: ${selectedClient ? `${selectedClient.name} (${selectedClient.document})` : "Todos"}`);
  document.text(`- Estado: ${status}`);
  document.text(`- Factura: ${invoiceNumber || "Todas"}`);
  document.text(`- Registros encontrados: ${total}`);
  document.moveDown();

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
  document
    .fontSize(11)
    .fillColor("#8B1820")
    .text(`Resumen: ${sales.length} ventas | Total: $ ${totalRevenue.toLocaleString("es-CO")} COP`)
    .moveDown();

  document.fontSize(8).fillColor("#222222");
  sales.forEach((sale, index) => {
    if (document.y > 730) document.addPage();
    document
      .fontSize(9)
      .fillColor("#8B1820")
      .text(`${index + 1}. ${sale.invoiceNumber} - ${sale.clientName || "Sin cliente"}`);
    document
      .fontSize(8)
      .fillColor("#222222")
      .text(
        `Fecha: ${new Date(sale.date).toLocaleString("es-CO")} | Estado: ${sale.status} | Pago: ${sale.paymentMethod}`
      )
      .text(`Total: $ ${Number(sale.total).toLocaleString("es-CO")} COP`);
    sale.details.forEach((detail) => {
      const item = detail.bovineName || detail.productName || `Ítem #${detail.id}`;
      document.text(`  - ${item} | Cantidad: ${detail.quantity} | Subtotal: $ ${Number(detail.subtotal).toLocaleString("es-CO")} COP`);
    });
    document.moveDown(0.6);
  });

  if (sales.length === 0) {
    document.fillColor("#666666").text("No se encontraron ventas con los filtros seleccionados.");
  }

  document.end();
  await finished;

  return new Response(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="reporte-ventas-${generatedAt.toISOString().slice(0, 10)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
