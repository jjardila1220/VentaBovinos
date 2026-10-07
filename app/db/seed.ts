import { db, sqlClient } from "./index.ts";
import { breeds } from "./schema/breeds.ts";
import { users } from "./schema/users.ts";
import { clients } from "./schema/clients.ts";
import { products } from "./schema/products.ts";
import { bovines } from "./schema/bovines.ts";
import { sales } from "./schema/sales.ts";
import { saleDetails } from "./schema/sale-details.ts";
import { movements } from "./schema/movements.ts";
import { eq } from "drizzle-orm";

declare const Bun: any;

export async function seedDatabase() {
  console.log("🌱 Iniciando inserción de datos de ejemplo (idempotente)...");

  // 1. Razas (5 razas obligatorias)
  console.log("Insertando razas...");
  const breedList = [
    { name: "Holstein", description: "Raza lechera por excelencia, de origen holandés. Alta productividad de leche con óptima conformación de ubre." },
    { name: "Jersey", description: "Raza lechera británica compacta, reconocida por el alto porcentaje de grasa y proteína en sus sólidos lácteos." },
    { name: "Brahman", description: "Cebuino cárnico adaptado al trópico bajo, de gran rusticidad, tolerancia térmica y resistencia a parásitos." },
    { name: "Angus", description: "Raza británica de carne con marmoleo superior, precocidad reproductiva y ausencia natural de cuernos (mocha)." },
    { name: "Simmental", description: "Raza europea de doble propósito con destacado desarrollo muscular y excelente producción de leche." },
  ];

  for (const b of breedList) {
    await db.insert(breeds).values(b).onConflictDoNothing({ target: breeds.name });
  }

  const existingBreeds = await db.select().from(breeds);
  const breedMap = new Map(existingBreeds.map((b) => [b.name, b.id]));

  // 2. Clientes (3 clientes)
  console.log("Insertando clientes...");
  const clientList = [
    {
      name: "Hacienda San Jerónimo S.A.S.",
      document: "900.541.229-4",
      phone: "+57 310 442 8891",
      email: "contacto@sanjeronimo.com.co",
      address: "Km 18 Vía Cereté, Montería, Córdoba",
    },
    {
      name: "Carlos Alberto Restrepo",
      document: "71.492.311",
      phone: "+57 315 889 2200",
      email: "carlos.restrepo@agrovalle.co",
      address: "Finca La Esperanza, Rionegro, Antioquia",
    },
    {
      name: "Ganadera Santa María Ltda",
      document: "890.312.445-1",
      phone: "+57 318 776 5432",
      email: "compras@santamaria.com",
      address: "Sector El Trapiche, Villavicencio, Meta",
    },
  ];

  for (const c of clientList) {
    await db.insert(clients).values(c).onConflictDoNothing({ target: clients.document });
  }

  const existingClients = await db.select().from(clients);
  const clientMap = new Map(existingClients.map((c) => [c.email, c.id]));

  // 3. Usuarios (uno por rol: Administrador, Vendedor, Cliente)
  console.log("Insertando usuarios con Bun.password.hash...");
  const hashPw = async (password: string) => {
    if (typeof Bun !== "undefined" && Bun.password) {
      return Bun.password.hash(password, { algorithm: "argon2id" });
    }
    const crypto = await import("node:crypto");
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
  };

  const adminPassHash = await hashPw("admin123");
  const vendorPassHash = await hashPw("vendedor123");
  const clientPassHash = await hashPw("cliente123");

  const userList = [
    {
      name: "Ing. Mateo Gómez (Administrador)",
      email: "admin@ganadocarnes.com",
      passwordHash: adminPassHash,
      role: "Administrador" as const,
      active: true,
    },
    {
      name: "Laura Vargas (Asesora Comercial)",
      email: "vendedor@ganadocarnes.com",
      passwordHash: vendorPassHash,
      role: "Vendedor" as const,
      active: true,
    },
    {
      name: "Carlos Alberto Restrepo (Cliente)",
      email: "cliente@ganadocarnes.com",
      passwordHash: clientPassHash,
      role: "Cliente" as const,
      clientId: clientMap.get("carlos.restrepo@agrovalle.co") || null,
      active: true,
    },
  ];

  for (const u of userList) {
    await db.insert(users).values(u).onConflictDoNothing({ target: users.email });
  }

  const existingUsers = await db.select().from(users);
  const adminUser = existingUsers.find((u) => u.role === "Administrador") || existingUsers[0];

  // 4. Productos (Cortes cárnicos con stock)
  console.log("Insertando productos cárnicos...");
  const productList = [
    {
      name: "Lomo Fino Angus Premium",
      cut: "Lomo Fino / Tenderloin",
      weight: "2.50",
      pricePerKilogram: "68000.00",
      stock: 24,
    },
    {
      name: "Punta de Anca Madurada",
      cut: "Punta de Anca / Picaña",
      weight: "1.80",
      pricePerKilogram: "54000.00",
      stock: 35,
    },
    {
      name: "Corte Tomahawk Steak con Hueso",
      cut: "Ribeye con costilla larga",
      weight: "1.20",
      pricePerKilogram: "82000.00",
      stock: 18,
    },
  ];

  for (const p of productList) {
    const existing = await db.select().from(products).where(eq(products.name, p.name));
    if (existing.length === 0) {
      await db.insert(products).values(p);
    }
  }

  // 5. Bovinos (12 bovinos repartidos en 4 categorías: 10 Disponible y 2 Vendido)
  console.log("Insertando 12 ejemplares bovinos...");
  const bovineList = [
    // Vacas lecheras
    {
      name: "Bella Holstein Supreme",
      breedId: breedMap.get("Holstein") || 1,
      category: "Vacas lecheras" as const,
      sex: "Hembra" as const,
      birthDay: "2023-01-15",
      age: 44,
      weight: "580.00",
      price: "6800000.00",
      color: "Blanco y negro",
      location: "Sopó, Cundinamarca",
      description: "Excelente productora de leche de primer parto con ubre bien insertada y promedio de 28 Lts/día.",
      sanitaryHistory: "Registro ICA-008492-CUN. Vacunación antiaftosa al día. Negativa en brucelosis.",
      imageUrls: [
        "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80",
      ],
      status: "Disponible" as const,
    },
    {
      name: "Dulce Jersey Dorada",
      breedId: breedMap.get("Jersey") || 2,
      category: "Vacas lecheras" as const,
      sex: "Hembra" as const,
      birthDay: "2023-05-20",
      age: 40,
      weight: "440.00",
      price: "5900000.00",
      color: "Marrón café claro",
      location: "Santa Rosa de Osos, Antioquia",
      description: "Alta concentración de grasa 4.8% y proteína en leche, ideal para quesos artesanos.",
      sanitaryHistory: "Registro ICA-010488-ANT. Plan vacunal completo certificado.",
      imageUrls: [
        "https://images.unsplash.com/photo-1596733430284-f7437764b14d?auto=format&fit=crop&w=1000&q=80",
      ],
      status: "Disponible" as const,
    },
    {
      name: "Baviera Simmental Milk",
      breedId: breedMap.get("Simmental") || 5,
      category: "Vacas lecheras" as const,
      sex: "Hembra" as const,
      birthDay: "2022-11-10",
      age: 46,
      weight: "620.00",
      price: "7400000.00",
      color: "Rojo overo manchado",
      location: "Ubaté, Cundinamarca",
      description: "Doble propósito con balance lechero de 22 litros y pezuñas sólidas resistentes a humedad.",
      sanitaryHistory: "Registro ICA-009941-CUN. Desparasitada en enero 2026.",
      imageUrls: [
        "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80",
      ],
      status: "Disponible" as const,
    },

    // Novillos
    {
      name: "Relámpago Brahman Blanco",
      breedId: breedMap.get("Brahman") || 3,
      category: "Novillos" as const,
      sex: "Macho" as const,
      birthDay: "2024-03-05",
      age: 31,
      weight: "480.00",
      price: "4900000.00",
      color: "Blanco perla",
      location: "Montería, Córdoba",
      description: "Novillo de levante con giba prominente y ganancia verificada de 950 gramos diarios a pasto.",
      sanitaryHistory: "Registro ICA-005612-COR. Certificado libre de tuberculosis y brucelosis.",
      imageUrls: [
        "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80",
      ],
      status: "Disponible" as const,
    },
    {
      name: "Titan Angus Black",
      breedId: breedMap.get("Angus") || 4,
      category: "Novillos" as const,
      sex: "Macho" as const,
      birthDay: "2024-02-18",
      age: 32,
      weight: "520.00",
      price: "6200000.00",
      color: "Negro azabache",
      location: "La Ceja, Antioquia",
      description: "Genética pura mocha natural, excelente masa muscular en lomo y cuartos traseros.",
      sanitaryHistory: "Registro ICA-014490-ANT. Vacunas al día.",
      imageUrls: [
        "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=1000&q=80",
      ],
      status: "Disponible" as const,
    },
    {
      name: "Cariñoso Simmental Cruzado",
      breedId: breedMap.get("Simmental") || 5,
      category: "Novillos" as const,
      sex: "Macho" as const,
      birthDay: "2024-04-10",
      age: 30,
      weight: "460.00",
      price: "5300000.00",
      color: "Rojo caoba",
      location: "Puerto López, Meta",
      description: "Novillo precoz adaptado a sabana tropical con rendimiento en canal proyectado de 59%.",
      sanitaryHistory: "Registro ICA-003310-MET. Desparasitación reciente con ivermectina.",
      imageUrls: [
        "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80",
      ],
      status: "Disponible" as const,
    },

    // Terneros
    {
      name: "Lucero Brahman Rojo",
      breedId: breedMap.get("Brahman") || 3,
      category: "Terneros" as const,
      sex: "Macho" as const,
      birthDay: "2025-05-12",
      age: 17,
      weight: "230.00",
      price: "2800000.00",
      color: "Rojo cereza",
      location: "Caucasia, Antioquia",
      description: "Ternero desteto precoz hijo de IATF con toro campeón. Gran pigmentación de piel.",
      sanitaryHistory: "Registro ICA-012903-ANT. Primera dosis aftosa y rabia aplicada.",
      imageUrls: [
        "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80",
      ],
      status: "Disponible" as const,
    },
    {
      name: "Esperanza Holstein Jr",
      breedId: breedMap.get("Holstein") || 1,
      category: "Terneros" as const,
      sex: "Hembra" as const,
      birthDay: "2025-06-25",
      age: 15,
      weight: "195.00",
      price: "3200000.00",
      color: "Blanco y negro",
      location: "Facatativá, Cundinamarca",
      description: "Ternera criada en cuna individual con balanceado iniciador y genealogía lechera probada.",
      sanitaryHistory: "Registro ICA-007781-CUN. Vacunada contra brucelosis (cepa 19).",
      imageUrls: [
        "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80",
      ],
      status: "Disponible" as const,
    },
    {
      name: "Capitán Jersey Desteto",
      breedId: breedMap.get("Jersey") || 2,
      category: "Terneros" as const,
      sex: "Macho" as const,
      birthDay: "2025-04-18",
      age: 18,
      weight: "210.00",
      price: "2900000.00",
      color: "Bayo claro",
      location: "Tunja, Boyacá",
      description: "Ternero manso al bozal con gran rusticidad para clima frío y rápido desarrollo.",
      sanitaryHistory: "Registro ICA-004452-BOY. Plan sanitario completo.",
      imageUrls: [
        "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80",
      ],
      status: "Disponible" as const,
    },

    // Toros (Reproductores)
    {
      name: "El Sultán Brahman Supremo",
      breedId: breedMap.get("Brahman") || 3,
      category: "Toros" as const,
      sex: "Macho" as const,
      birthDay: "2022-03-10",
      age: 55,
      weight: "940.00",
      price: "14500000.00",
      color: "Blanco plateado",
      location: "Planeta Rica, Córdoba",
      description: "Semental Brahman con registro Asocebú. Examen andrológico vigente con 85% motilidad.",
      sanitaryHistory: "Registro ICA-001920-COR. Andrológico de laboratorio y pruebas serológicas negativas.",
      imageUrls: [
        "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80",
      ],
      status: "Disponible" as const,
    },

    // Bovinos Vendidos (2 ejemplares en estado 'Vendido' según el requerimiento)
    {
      name: "Conquistador Simmental Fleckvieh",
      breedId: breedMap.get("Simmental") || 5,
      category: "Toros" as const,
      sex: "Macho" as const,
      birthDay: "2022-06-02",
      age: 52,
      weight: "980.00",
      price: "12800000.00",
      color: "Rojo overo",
      location: "Chiquinquirá, Boyacá",
      description: "Toro reproductor puro de línea alemana fleckvieh. Vendido en remate oficial.",
      sanitaryHistory: "Registro ICA-006734-BOY. Guía ICA formalizada para despacho.",
      imageUrls: [
        "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80",
      ],
      status: "Vendido" as const,
    },
    {
      name: "Barón Angus Red Semental",
      breedId: breedMap.get("Angus") || 4,
      category: "Toros" as const,
      sex: "Macho" as const,
      birthDay: "2022-08-14",
      age: 50,
      weight: "890.00",
      price: "13200000.00",
      color: "Rojo cereza oscuro",
      location: "Rionegro, Antioquia",
      description: "Toro Red Angus con pruebas de progenie con facilidad de parto comprobada.",
      sanitaryHistory: "Registro ICA-011234-ANT. Sanidad al 100%.",
      imageUrls: [
        "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80",
      ],
      status: "Vendido" as const,
    },
  ];

  for (const b of bovineList) {
    const existing = await db.select().from(bovines).where(eq(bovines.name, b.name));
    if (existing.length === 0) {
      await db.insert(bovines).values(b);
    }
  }

  const existingBovines = await db.select().from(bovines);
  const bovineMap = new Map(existingBovines.map((b) => [b.name, b.id]));

  // 6. Facturas (5 facturas de ejemplo con formato FAC-AAAA-000001)
  console.log("Insertando 5 facturas de ejemplo con detalles...");
  const firstClientId = existingClients[0]?.id || 1;
  const secondClientId = existingClients[1]?.id || 1;

  const invoiceList = [
    {
      clientId: firstClientId,
      invoiceNumber: "FAC-2026-000001",
      paymentMethod: "Transferencia Bancaria",
      total: "12800000.00",
      status: "Completado" as const,
      date: new Date("2026-02-14T10:30:00Z"),
      bovineId: bovineMap.get("Conquistador Simmental Fleckvieh"),
    },
    {
      clientId: secondClientId,
      invoiceNumber: "FAC-2026-000002",
      paymentMethod: "Efectivo en Predio",
      total: "13200000.00",
      status: "Completado" as const,
      date: new Date("2026-02-20T15:45:00Z"),
      bovineId: bovineMap.get("Barón Angus Red Semental"),
    },
    {
      clientId: firstClientId,
      invoiceNumber: "FAC-2026-000003",
      paymentMethod: "Transferencia Bancaria",
      total: "68000.00",
      status: "Completado" as const,
      date: new Date("2026-03-01T11:10:00Z"),
      productId: 1,
    },
    {
      clientId: secondClientId,
      invoiceNumber: "FAC-2026-000004",
      paymentMethod: "Tarjeta de Crédito",
      total: "54000.00",
      status: "Completado" as const,
      date: new Date("2026-03-12T16:20:00Z"),
      productId: 2,
    },
    {
      clientId: firstClientId,
      invoiceNumber: "FAC-2026-000005",
      paymentMethod: "Transferencia Bancaria",
      total: "82000.00",
      status: "Completado" as const,
      date: new Date("2026-03-25T09:15:00Z"),
      productId: 3,
    },
  ];

  for (const inv of invoiceList) {
    const existing = await db.select().from(sales).where(eq(sales.invoiceNumber, inv.invoiceNumber));
    if (existing.length === 0) {
      const [insertedSale] = await db
        .insert(sales)
        .values({
          clientId: inv.clientId,
          invoiceNumber: inv.invoiceNumber,
          paymentMethod: inv.paymentMethod,
          total: inv.total,
          status: inv.status,
          date: inv.date,
        })
        .returning();

      if (inv.bovineId) {
        await db.insert(saleDetails).values({
          saleId: insertedSale.id,
          bovineId: inv.bovineId,
          productId: null,
          quantity: 1,
          unitaryPrice: inv.total,
          subtotal: inv.total,
          isBovine: true,
        });

        // Registrar movimiento
        await db.insert(movements).values({
          type: "Venta",
          reference: inv.invoiceNumber,
          bovineId: inv.bovineId,
          quantity: 1,
          userId: adminUser?.id,
          createdAt: inv.date,
        });
      } else if (inv.productId) {
        await db.insert(saleDetails).values({
          saleId: insertedSale.id,
          bovineId: null,
          productId: inv.productId,
          quantity: 1,
          unitaryPrice: inv.total,
          subtotal: inv.total,
          isBovine: false,
        });

        await db.insert(movements).values({
          type: "Venta",
          reference: inv.invoiceNumber,
          productId: inv.productId,
          quantity: 1,
          userId: adminUser?.id,
          createdAt: inv.date,
        });
      }
    }
  }

  console.log("✅ Datos de ejemplo sembrados con éxito en la base de datos.");
}

// Ejecutar si se corre directamente
if (import.meta.main) {
  try {
    await seedDatabase();
    process.exit(0);
  } catch (err) {
    console.error("Error en seed:", err);
    process.exit(1);
  } finally {
    await sqlClient.end();
  }
}
