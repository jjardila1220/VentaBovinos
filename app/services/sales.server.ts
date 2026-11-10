import { db } from "~/db/index.ts";
import { sales } from "~/db/schema/sales.ts";
import { saleDetails } from "~/db/schema/sale-details.ts";
import { bovines } from "~/db/schema/bovines.ts";
import { clients } from "~/db/schema/clients.ts";
import { products } from "~/db/schema/products.ts";
import { movements } from "~/db/schema/movements.ts";
import { eq, and, sql, desc, gte, lte, or, ilike } from "drizzle-orm";

export async function generateInvoiceNumber(tx: any): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;

  const [lastSale] = await tx
    .select({ invoiceNumber: sales.invoiceNumber })
    .from(sales)
    .where(sql`${sales.invoiceNumber} LIKE ${prefix + "%"}`)
    .orderBy(desc(sales.id))
    .limit(1);

  let nextSeq = 1;
  if (lastSale?.invoiceNumber) {
    const parts = lastSale.invoiceNumber.split("-");
    const numPart = parseInt(parts[2], 10);
    if (!isNaN(numPart)) {
      nextSeq = numPart + 1;
    }
  }

  return `FAC-${year}-${String(nextSeq).padStart(6, "0")}`;
}

export function generateMockPaymentReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MOCK-${timestamp}-${suffix}`;
}

export async function completeCheckoutTransaction(params: {
  userId: number;
  buyer: {
    name: string;
    document: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  paymentMethod: string;
}) {
  const { userId, buyer, paymentMethod } = params;

  return await db.transaction(async (tx) => {
    // 1. Obtener o crear cliente
    let clientRecord = await tx
      .select()
      .from(clients)
      .where(eq(clients.document, buyer.document.trim()))
      .limit(1)
      .then((res) => res[0]);

    if (!clientRecord) {
      const [newClient] = await tx
        .insert(clients)
        .values({
          name: buyer.name.trim(),
          document: buyer.document.trim(),
          phone: buyer.phone?.trim() || null,
          email: buyer.email?.trim() || null,
          address: buyer.address?.trim() || null,
        })
        .returning();
      clientRecord = newClient;
    } else {
      // Actualizar datos de contacto si cambiaron
      await tx
        .update(clients)
        .set({
          name: buyer.name.trim(),
          phone: buyer.phone?.trim() || clientRecord.phone,
          email: buyer.email?.trim() || clientRecord.email,
          address: buyer.address?.trim() || clientRecord.address,
        })
        .where(eq(clients.id, clientRecord.id));
    }

    // 2. Verificar que los bovinos del carrito siguen reservados por ese usuario
    const cartBovines = await tx
      .select()
      .from(bovines)
      .where(
        and(
          eq(bovines.status, "Reservado"),
          eq(bovines.reservedBy, userId)
        )
      );

    if (cartBovines.length === 0) {
      throw new Error("El carrito está vacío o la reserva ha expirado.");
    }

    // 3. Calcular subtotal y total
    let totalAmount = 0;
    for (const b of cartBovines) {
      totalAmount += parseFloat(b.price);
    }

    // 4. Generar número de factura único formato FAC-AAAA-000001
    const invoiceNumber = await generateInvoiceNumber(tx);
    const paymentReference = generateMockPaymentReference();

    // 5. Crear la venta
    const [insertedSale] = await tx
      .insert(sales)
      .values({
        clientId: clientRecord.id,
        invoiceNumber,
        paymentMethod,
        paymentReference,
        total: String(totalAmount),
        status: "Completado",
      })
      .returning();

    // 6. Cambiar bovinos a 'Vendido', crear sale_detail y registrar movimientos
    for (const b of cartBovines) {
      // Cambiar a Vendido y liberar reserved_by
      await tx
        .update(bovines)
        .set({
          status: "Vendido",
          reservedBy: null,
          reservedAt: null,
        })
        .where(eq(bovines.id, b.id));

      // Crear detalle de venta (is_bovine = true, quantity = 1)
      await tx.insert(saleDetails).values({
        saleId: insertedSale.id,
        bovineId: b.id,
        productId: null,
        quantity: 1,
        unitaryPrice: b.price,
        subtotal: b.price,
        isBovine: true,
      });

      // Registrar movimiento de tipo 'Venta'
      await tx.insert(movements).values({
        type: "Venta",
        reference: invoiceNumber,
        bovineId: b.id,
        quantity: 1,
        userId,
      });
    }

    return {
      sale: insertedSale,
      invoiceNumber,
      paymentReference,
      client: clientRecord,
      bovines: cartBovines,
    };
  });
}

export async function getSalesHistory(filters: {
  startDate?: string;
  endDate?: string;
  status?: string;
  invoiceNumber?: string;
  productQuery?: string;
  clientId?: number;
  page?: number;
  limit?: number;
} = {}) {
  const conditions = [];

  if (filters.clientId) {
    conditions.push(eq(sales.clientId, filters.clientId));
  }
  if (filters.status && filters.status !== "Todos") {
    conditions.push(eq(sales.status, filters.status as any));
  }
  if (filters.invoiceNumber && filters.invoiceNumber.trim()) {
    conditions.push(ilike(sales.invoiceNumber, `%${filters.invoiceNumber.trim()}%`));
  }
  if (filters.startDate) {
    conditions.push(gte(sales.date, new Date(filters.startDate)));
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(sales.date, end));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, filters.limit || 10);
  const offset = (page - 1) * limit;

  const [totalRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sales)
    .where(whereClause);

  const total = Number(totalRes?.count || 0);

  const salesList = await db
    .select({
      id: sales.id,
      invoiceNumber: sales.invoiceNumber,
      date: sales.date,
      total: sales.total,
      status: sales.status,
      paymentMethod: sales.paymentMethod,
      paymentReference: sales.paymentReference,
      clientName: clients.name,
      clientDocument: clients.document,
      clientPhone: clients.phone,
      clientEmail: clients.email,
    })
    .from(sales)
    .leftJoin(clients, eq(sales.clientId, clients.id))
    .where(whereClause)
    .orderBy(desc(sales.date))
    .limit(limit)
    .offset(offset);

  // Obtener ítems para cada venta
  const salesWithDetails = await Promise.all(
    salesList.map(async (sale) => {
      const details = await db
        .select({
          id: saleDetails.id,
          quantity: saleDetails.quantity,
          unitaryPrice: saleDetails.unitaryPrice,
          subtotal: saleDetails.subtotal,
          isBovine: saleDetails.isBovine,
          bovineName: bovines.name,
          bovineId: bovines.id,
          productName: products.name,
          productId: products.id,
        })
        .from(saleDetails)
        .leftJoin(bovines, eq(saleDetails.bovineId, bovines.id))
        .leftJoin(products, eq(saleDetails.productId, products.id))
        .where(eq(saleDetails.saleId, sale.id));

      return {
        ...sale,
        details,
      };
    })
  );

  return {
    items: salesWithDetails,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getSaleById(id: number) {
  const [sale] = await db
    .select({
      id: sales.id,
      invoiceNumber: sales.invoiceNumber,
      date: sales.date,
      total: sales.total,
      status: sales.status,
      paymentMethod: sales.paymentMethod,
      paymentReference: sales.paymentReference,
      clientId: clients.id,
      clientName: clients.name,
      clientDocument: clients.document,
      clientPhone: clients.phone,
      clientEmail: clients.email,
      clientAddress: clients.address,
    })
    .from(sales)
    .leftJoin(clients, eq(sales.clientId, clients.id))
    .where(eq(sales.id, id));

  if (!sale) return null;

  const details = await db
    .select({
      id: saleDetails.id,
      bovineId: saleDetails.bovineId,
      productId: saleDetails.productId,
      quantity: saleDetails.quantity,
      unitaryPrice: saleDetails.unitaryPrice,
      subtotal: saleDetails.subtotal,
      isBovine: saleDetails.isBovine,
      bovineName: bovines.name,
      bovineCategory: bovines.category,
      productName: products.name,
    })
    .from(saleDetails)
    .leftJoin(bovines, eq(saleDetails.bovineId, bovines.id))
    .leftJoin(products, eq(saleDetails.productId, products.id))
    .where(eq(saleDetails.saleId, sale.id));

  return {
    ...sale,
    details,
  };
}

export async function getSaleByInvoiceNumber(invoiceNumber: string) {
  const [sale] = await db
    .select({
      id: sales.id,
      invoiceNumber: sales.invoiceNumber,
      date: sales.date,
      total: sales.total,
      status: sales.status,
      paymentMethod: sales.paymentMethod,
      paymentReference: sales.paymentReference,
      clientId: clients.id,
      clientName: clients.name,
      clientDocument: clients.document,
      clientPhone: clients.phone,
      clientEmail: clients.email,
      clientAddress: clients.address,
    })
    .from(sales)
    .leftJoin(clients, eq(sales.clientId, clients.id))
    .where(eq(sales.invoiceNumber, invoiceNumber));

  if (!sale) return null;

  const details = await db
    .select({
      id: saleDetails.id,
      bovineId: saleDetails.bovineId,
      productId: saleDetails.productId,
      quantity: saleDetails.quantity,
      unitaryPrice: saleDetails.unitaryPrice,
      subtotal: saleDetails.subtotal,
      isBovine: saleDetails.isBovine,
      bovineName: bovines.name,
      bovineCategory: bovines.category,
      productName: products.name,
    })
    .from(saleDetails)
    .leftJoin(bovines, eq(saleDetails.bovineId, bovines.id))
    .leftJoin(products, eq(saleDetails.productId, products.id))
    .where(eq(saleDetails.saleId, sale.id));

  return {
    ...sale,
    details,
  };
}
