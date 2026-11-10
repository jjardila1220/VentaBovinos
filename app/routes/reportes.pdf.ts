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
  const pageWidth = document.page.width - document.page.margins.left - document.page.margins.right;
  let pageNumber = 1;
  const colors = {
    primary: "#8B1820",
    accent: "#B3202A",
    pale: "#F9E3E3",
    text: "#292524",
    muted: "#78716C",
    border: "#E7E5E4",
    white: "#FFFFFF",
  };

  document.on("data", (chunk: Uint8Array) => chunks.push(chunk));
  const finished = new Promise<void>((resolve, reject) => {
    document.on("end", resolve);
    document.on("error", reject);
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const averageTicket = sales.length ? totalRevenue / sales.length : 0;

  const drawPageHeader = () => {
    document.save();
    document.rect(0, 0, document.page.width, 82).fill(colors.primary);
    document
      .fontSize(22)
      .fillColor(colors.white)
      .font("Helvetica-Bold")
      .text("GanadoCarnes", 40, 23);
    document
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#FBCACA")
      .text("GESTIÓN COMERCIAL Y TRAZABILIDAD BOVINA", 40, 51);
    document
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor(colors.white)
      .text("Reporte de ventas", 390, 30, { width: 165, align: "right" });
    document.restore();
    document.y = 105;
  };

  const drawFooter = () => {
    const footerY = document.page.height - 32;
    document
      .moveTo(40, footerY - 8)
      .lineTo(document.page.width - 40, footerY - 8)
      .lineWidth(0.5)
      .strokeColor(colors.border)
      .stroke();
    document
      .fontSize(7.5)
      .font("Helvetica")
      .fillColor(colors.muted)
      .text("Documento generado desde GanadoCarnes", 40, footerY, { width: 280 });
    document.text(`Página ${pageNumber}`, 420, footerY, {
      width: 135,
      align: "right",
    });
  };

  drawPageHeader();
  document
    .fontSize(8)
    .font("Helvetica")
    .fillColor(colors.muted)
    .text(`Generado el ${generatedAt.toLocaleString("es-CO")}`, 40, document.y);
  document.moveDown(1.2);

  const filtersTop = document.y;
  document.roundedRect(40, filtersTop, pageWidth, 104, 8).fill(colors.pale);
  document
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor(colors.primary)
    .text("Filtros aplicados", 54, filtersTop + 14);
  document
    .fontSize(8.5)
    .font("Helvetica")
    .fillColor(colors.text)
    .text(`Fecha inicial: ${startDate || "Todas"}`, 54, filtersTop + 38)
    .text(`Fecha final: ${endDate || "Todas"}`, 54, filtersTop + 58)
    .text(`Cliente: ${selectedClient ? `${selectedClient.name} (${selectedClient.document})` : "Todos"}`, 285, filtersTop + 38)
    .text(`Estado: ${status}`, 285, filtersTop + 58)
    .text(`Factura: ${invoiceNumber || "Todas"}`, 54, filtersTop + 78)
    .text(`Registros encontrados: ${total}`, 285, filtersTop + 78);
  document.y = filtersTop + 124;

  const metricWidth = (pageWidth - 16) / 3;
  [
    ["VENTAS", String(sales.length)],
    ["INGRESOS", `$ ${totalRevenue.toLocaleString("es-CO")}`],
    ["TICKET PROMEDIO", `$ ${averageTicket.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`],
  ].forEach(([label, value], index) => {
    const x = 40 + index * (metricWidth + 8);
    document.roundedRect(x, document.y, metricWidth, 54, 7).lineWidth(0.7).strokeColor(colors.border).fillAndStroke(colors.white, colors.border);
    document.fontSize(7.5).font("Helvetica-Bold").fillColor(colors.muted).text(label, x + 10, document.y + 10);
    document.fontSize(13).font("Helvetica-Bold").fillColor(colors.primary).text(value, x + 10, document.y + 26);
  });
  document.y += 78;
  document.fontSize(10).font("Helvetica-Bold").fillColor(colors.primary).text("Detalle de transacciones");
  document.moveDown(0.8);

  sales.forEach((sale, index) => {
    const cardHeight = 76 + sale.details.length * 16;
    if (document.y + cardHeight > document.page.height - 55) {
      drawFooter();
      document.addPage();
      pageNumber += 1;
      drawPageHeader();
      document.fontSize(10).font("Helvetica-Bold").fillColor(colors.primary).text("Detalle de transacciones");
      document.moveDown(0.8);
    }
    const cardTop = document.y;
    document.roundedRect(40, cardTop, pageWidth, cardHeight, 7).lineWidth(0.7).strokeColor(colors.border).fillAndStroke(colors.white, colors.border);
    document
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(colors.primary)
      .text(`${String(index + 1).padStart(2, "0")}  ${sale.invoiceNumber}`, 52, cardTop + 12);
    document
      .fontSize(8)
      .font("Helvetica")
      .fillColor(colors.muted)
      .text(sale.clientName || "Sin cliente", 52, cardTop + 30)
      .text(`${new Date(sale.date).toLocaleString("es-CO")}  |  ${sale.paymentMethod}`, 250, cardTop + 30);
    document
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(colors.primary)
      .text(`$ ${Number(sale.total).toLocaleString("es-CO")} COP`, 390, cardTop + 12, { width: 105, align: "right" });
    document.fontSize(8).font("Helvetica").fillColor(colors.text);
    sale.details.forEach((detail, detailIndex) => {
      const item = detail.bovineName || detail.productName || `Ítem #${detail.id}`;
      document.text(
        `• ${item}   |   Cantidad: ${detail.quantity}   |   $ ${Number(detail.subtotal).toLocaleString("es-CO")} COP`,
        58,
        cardTop + 50 + detailIndex * 16
      );
    });
    document.y = cardTop + cardHeight + 10;
  });

  if (sales.length === 0) {
    document.roundedRect(40, document.y, pageWidth, 48, 7).fill("#FAFAF9");
    document.fontSize(9).font("Helvetica").fillColor(colors.muted).text(
      "No se encontraron ventas con los filtros seleccionados.",
      54,
      document.y + 18
    );
  }

  drawFooter();
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
