import { Invoice, BuyerData, InvoiceItem, InventoryMovement } from '../types/database.ts';
import { storage } from './storageService.ts';
import { BOVINE_CHANGE_EVENT } from './bovineService.ts';

export const salesService = {
  getInvoices: (filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    bovineQuery?: string;
    invoiceNumber?: string;
  }): Invoice[] => {
    let list = storage.getInvoices();

    if (!filters) return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (filters.status && filters.status !== 'Todos') {
      list = list.filter((inv) => inv.status === filters.status);
    }

    if (filters.invoiceNumber && filters.invoiceNumber.trim()) {
      const q = filters.invoiceNumber.toLowerCase().trim();
      list = list.filter((inv) => inv.id.toLowerCase().includes(q));
    }

    if (filters.bovineQuery && filters.bovineQuery.trim()) {
      const q = filters.bovineQuery.toLowerCase().trim();
      list = list.filter((inv) =>
        inv.items.some(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.bovineId.toLowerCase().includes(q) ||
            item.breed.toLowerCase().includes(q)
        )
      );
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      list = list.filter((inv) => new Date(inv.date) >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      list = list.filter((inv) => new Date(inv.date) <= end);
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getById: (id: string): Invoice | undefined => {
    const list = storage.getInvoices();
    return list.find((inv) => inv.id.toLowerCase() === id.toLowerCase());
  },

  createSale: (params: {
    buyer: BuyerData;
    items: InvoiceItem[];
    paymentMethod: string;
    userName: string;
    userId?: string;
  }): Invoice => {
    const { buyer, items, paymentMethod, userName, userId } = params;

    if (!items || items.length === 0) {
      throw new Error('El carrito no contiene bovinos para facturar.');
    }

    if (!buyer.name || !buyer.document) {
      throw new Error('El nombre y documento del comprador son obligatorios.');
    }

    // Verify availability
    const bovines = storage.getBovines();
    for (const item of items) {
      const b = bovines.find((x) => x.id.toLowerCase() === item.bovineId.toLowerCase());
      if (!b) {
        throw new Error(`El bovino ${item.bovineId} no existe en el catálogo.`);
      }
      if (b.status === 'Vendido') {
        throw new Error(`El bovino ${b.name} (${b.id}) ya fue vendido.`);
      }
      if (b.status === 'Reservado' && userId && b.reservedByUserId && b.reservedByUserId !== userId) {
        throw new Error(`El bovino ${b.name} (${b.id}) está reservado por otro usuario.`);
      }
    }

    // Generate unique invoice number
    const invoiceNumber = storage.getNextInvoiceNumber();
    const subtotal = items.reduce((acc, i) => acc + i.price, 0);
    const shipping = 0; // Envío gratis en plataforma
    const total = subtotal + shipping;

    const newInvoice: Invoice = {
      id: invoiceNumber,
      date: new Date().toISOString(),
      buyer,
      items,
      subtotal,
      shipping,
      total,
      paymentMethod: paymentMethod || 'Transferencia Bancaria',
      status: 'Completado',
      createdByName: userName,
      createdById: userId
    };

    // Mark bovines as Vendido
    const movements = storage.getMovements();
    for (const item of items) {
      const b = bovines.find((x) => x.id.toLowerCase() === item.bovineId.toLowerCase())!;
      b.status = 'Vendido';
      b.reservedByUserId = null;

      movements.unshift({
        id: `MOV-${Date.now().toString().slice(-6)}-${item.bovineId}`,
        date: new Date().toISOString(),
        type: 'Venta',
        bovineId: b.id,
        bovineName: b.name,
        reference: invoiceNumber,
        user: userName
      });
    }

    storage.setBovines(bovines);
    storage.setMovements(movements);

    const invoices = storage.getInvoices();
    invoices.unshift(newInvoice);
    storage.setInvoices(invoices);

    window.dispatchEvent(new Event(BOVINE_CHANGE_EVENT));
    return newInvoice;
  },

  voidInvoice: (id: string, reason: string, userName = 'Administrador'): Invoice => {
    const invoices = storage.getInvoices();
    const inv = invoices.find((i) => i.id.toLowerCase() === id.toLowerCase());
    if (!inv) throw new Error('Factura no encontrada.');
    if (inv.status === 'Cancelado') throw new Error('La factura ya está cancelada.');

    inv.status = 'Cancelado';
    storage.setInvoices(invoices);

    // Revert bovines to Disponible
    const bovines = storage.getBovines();
    const movements = storage.getMovements();

    for (const item of inv.items) {
      const b = bovines.find((x) => x.id.toLowerCase() === item.bovineId.toLowerCase());
      if (b) {
        b.status = 'Disponible';
        b.reservedByUserId = null;

        movements.unshift({
          id: `MOV-${Date.now().toString().slice(-6)}-REV`,
          date: new Date().toISOString(),
          type: 'Entrada',
          bovineId: b.id,
          bovineName: b.name,
          reference: `Anulación de ${inv.id}: ${reason}`,
          user: userName
        });
      }
    }

    storage.setBovines(bovines);
    storage.setMovements(movements);

    window.dispatchEvent(new Event(BOVINE_CHANGE_EVENT));
    return inv;
  }
};
