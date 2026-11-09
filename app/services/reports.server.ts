import { db } from "~/db/index.ts";
import { sales } from "~/db/schema/sales.ts";
import { saleDetails } from "~/db/schema/sale-details.ts";
import { bovines } from "~/db/schema/bovines.ts";
import { movements } from "~/db/schema/movements.ts";
import { clients } from "~/db/schema/clients.ts";
import { users } from "~/db/schema/users.ts";
import { eq, gte, lte, and, desc } from "drizzle-orm";

export async function getReportClients() {
  return db
    .select({ id: clients.id, name: clients.name, document: clients.document })
    .from(clients)
    .orderBy(clients.name);
}

export async function getConsolidatedReport(
  type: "Ventas" | "Inventario" | "Movimientos",
  startDate?: string,
  endDate?: string,
  clientId?: number,
  status?: string
) {
  const conditions = [];
  if (startDate) conditions.push(gte(sales.date, new Date(startDate)));
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(sales.date, end));
  }
  if (clientId) conditions.push(eq(sales.clientId, clientId));
  if (status && status !== "Todos") conditions.push(eq(sales.status, status as any));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  if (type === "Ventas") {
    const salesList = await db
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        date: sales.date,
        total: sales.total,
        status: sales.status,
        paymentMethod: sales.paymentMethod,
        clientName: clients.name,
      })
      .from(sales)
      .leftJoin(clients, eq(sales.clientId, clients.id))
      .where(whereClause)
      .orderBy(desc(sales.date));

    const totalRevenue = salesList.reduce((sum, s) => sum + parseFloat(s.total), 0);
    const invoiceCount = salesList.length;
    const averageTicket = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;

    // Breakdown por categoría
    const details = await db
      .select({
        category: bovines.category,
        subtotal: saleDetails.subtotal,
        quantity: saleDetails.quantity,
      })
      .from(saleDetails)
      .leftJoin(bovines, eq(saleDetails.bovineId, bovines.id))
      .leftJoin(sales, eq(saleDetails.saleId, sales.id))
      .where(whereClause);

    const categoryStats: Record<string, { count: number; total: number }> = {
      "Vacas lecheras": { count: 0, total: 0 },
      "Novillos": { count: 0, total: 0 },
      "Terneros": { count: 0, total: 0 },
      "Toros": { count: 0, total: 0 },
    };

    details.forEach((d) => {
      const cat = d.category || "Otros";
      if (!categoryStats[cat]) categoryStats[cat] = { count: 0, total: 0 };
      categoryStats[cat].count += d.quantity;
      categoryStats[cat].total += parseFloat(d.subtotal);
    });

    return {
      type,
      totalRevenue,
      invoiceCount,
      averageTicket,
      itemsSold: details.reduce((acc, d) => acc + d.quantity, 0),
      categoryStats,
      salesList,
    };
  }

  if (type === "Inventario") {
    const allBovines = await db.select().from(bovines).orderBy(desc(bovines.id));
    const total = allBovines.length;
    const disponibles = allBovines.filter((b) => b.status === "Disponible").length;
    const reservados = allBovines.filter((b) => b.status === "Reservado").length;
    const vendidos = allBovines.filter((b) => b.status === "Vendido").length;
    const valorTotal = allBovines.reduce((sum, b) => sum + parseFloat(b.price), 0);

    return {
      type,
      total,
      disponibles,
      reservados,
      vendidos,
      valorTotal,
      bovineList: allBovines,
    };
  }

  // Movimientos
  const movementsList = await db
    .select({
      id: movements.id,
      type: movements.type,
      reference: movements.reference,
      createdAt: movements.createdAt,
      userName: users.name,
      bovineName: bovines.name,
    })
    .from(movements)
    .leftJoin(users, eq(movements.userId, users.id))
    .leftJoin(bovines, eq(movements.bovineId, bovines.id))
    .orderBy(desc(movements.createdAt))
    .limit(200);

  return {
    type,
    movementsList,
    totalMovements: movementsList.length,
  };
}
