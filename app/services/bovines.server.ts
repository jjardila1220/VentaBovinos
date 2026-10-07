import { db, sqlClient } from "~/db/index.ts";
import { bovines } from "~/db/schema/bovines.ts";
import { breeds } from "~/db/schema/breeds.ts";
import { movements } from "~/db/schema/movements.ts";
import { saleDetails } from "~/db/schema/sale-details.ts";
import { eq, and, sql, desc, asc, gte, lte, ilike, or } from "drizzle-orm";

export function calculateAgeMonths(birthDayString: string): number {
  if (!birthDayString) return 0;
  const birth = new Date(birthDayString);
  const now = new Date();
  if (isNaN(birth.getTime())) return 0;
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

export async function releaseExpiredReservations(minutes = 30) {
  try {
    const expiredCutoff = new Date(Date.now() - minutes * 60 * 1000);
    await db
      .update(bovines)
      .set({
        status: "Disponible",
        reservedBy: null,
        reservedAt: null,
      })
      .where(
        and(
          eq(bovines.status, "Reservado"),
          lte(bovines.reservedAt, expiredCutoff)
        )
      );
  } catch (err) {
    console.error("Error releasing expired reservations:", err);
  }
}

export async function getBovines(filters: {
  category?: string;
  breedId?: number;
  minWeight?: number;
  maxWeight?: number;
  minAge?: number;
  maxAge?: number;
  sex?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
  status?: string;
} = {}) {
  // Release any expired reservations before listing
  await releaseExpiredReservations();

  const conditions = [];

  if (filters.category && filters.category !== "Todos") {
    conditions.push(eq(bovines.category, filters.category as any));
  }
  if (filters.breedId) {
    conditions.push(eq(bovines.breedId, filters.breedId));
  }
  if (filters.sex && filters.sex !== "Todos") {
    conditions.push(eq(bovines.sex, filters.sex as any));
  }
  if (filters.status && filters.status !== "Todos") {
    conditions.push(eq(bovines.status, filters.status as any));
  }
  if (filters.minWeight !== undefined && !isNaN(filters.minWeight)) {
    conditions.push(gte(bovines.weight, String(filters.minWeight)));
  }
  if (filters.maxWeight !== undefined && !isNaN(filters.maxWeight)) {
    conditions.push(lte(bovines.weight, String(filters.maxWeight)));
  }
  if (filters.minAge !== undefined && !isNaN(filters.minAge)) {
    conditions.push(gte(bovines.age, filters.minAge));
  }
  if (filters.maxAge !== undefined && !isNaN(filters.maxAge)) {
    conditions.push(lte(bovines.age, filters.maxAge));
  }
  if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
    conditions.push(gte(bovines.price, String(filters.minPrice)));
  }
  if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
    conditions.push(lte(bovines.price, String(filters.maxPrice)));
  }
  if (filters.search && filters.search.trim()) {
    const q = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(bovines.name, q),
        ilike(bovines.color, q),
        ilike(bovines.location, q),
        ilike(bovines.description, q)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let orderByClause = desc(bovines.id);
  if (filters.sortBy === "price_asc") {
    orderByClause = asc(bovines.price);
  } else if (filters.sortBy === "price_desc") {
    orderByClause = desc(bovines.price);
  } else if (filters.sortBy === "weight_desc") {
    orderByClause = desc(bovines.weight);
  } else if (filters.sortBy === "newest") {
    orderByClause = desc(bovines.registerDay);
  }

  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, filters.limit || 8);
  const offset = (page - 1) * limit;

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bovines)
    .where(whereClause);

  const total = Number(totalResult?.count || 0);

  const items = await db
    .select({
      id: bovines.id,
      name: bovines.name,
      breedId: bovines.breedId,
      breedName: breeds.name,
      category: bovines.category,
      sex: bovines.sex,
      birthDay: bovines.birthDay,
      age: bovines.age,
      weight: bovines.weight,
      price: bovines.price,
      color: bovines.color,
      location: bovines.location,
      description: bovines.description,
      sanitaryHistory: bovines.sanitaryHistory,
      imageUrls: bovines.imageUrls,
      status: bovines.status,
      registerDay: bovines.registerDay,
    })
    .from(bovines)
    .leftJoin(breeds, eq(bovines.breedId, breeds.id))
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getBovineById(id: number) {
  const [bovine] = await db
    .select({
      id: bovines.id,
      name: bovines.name,
      breedId: bovines.breedId,
      breedName: breeds.name,
      breedDescription: breeds.description,
      category: bovines.category,
      sex: bovines.sex,
      birthDay: bovines.birthDay,
      age: bovines.age,
      weight: bovines.weight,
      price: bovines.price,
      color: bovines.color,
      location: bovines.location,
      description: bovines.description,
      sanitaryHistory: bovines.sanitaryHistory,
      imageUrls: bovines.imageUrls,
      status: bovines.status,
      registerDay: bovines.registerDay,
      reservedBy: bovines.reservedBy,
      reservedAt: bovines.reservedAt,
    })
    .from(bovines)
    .leftJoin(breeds, eq(bovines.breedId, breeds.id))
    .where(eq(bovines.id, id));

  return bovine || null;
}

export async function createBovine(data: {
  breedId: number;
  name: string;
  category: "Vacas lecheras" | "Novillos" | "Terneros" | "Toros";
  sex: "Macho" | "Hembra";
  birthDay: string;
  weight: number;
  price: number;
  color?: string;
  location?: string;
  description?: string;
  sanitaryHistory?: string;
  imageUrls?: string[];
}, userId?: number) {
  if (data.weight <= 0) {
    throw new Error("El peso del bovino debe ser mayor a 0 kg.");
  }
  if (data.price < 0) {
    throw new Error("El precio no puede ser un valor negativo.");
  }

  const age = calculateAgeMonths(data.birthDay);
  if (age < 0) {
    throw new Error("La fecha de nacimiento no puede ser futura.");
  }

  const [newBovine] = await db
    .insert(bovines)
    .values({
      breedId: data.breedId,
      name: data.name.trim(),
      category: data.category,
      sex: data.sex,
      birthDay: data.birthDay,
      age,
      weight: String(data.weight),
      price: String(data.price),
      color: data.color?.trim() || null,
      location: data.location?.trim() || null,
      description: data.description?.trim() || null,
      sanitaryHistory: data.sanitaryHistory?.trim() || null,
      imageUrls: data.imageUrls || [],
      status: "Disponible",
    })
    .returning();

  // Registrar movimiento de Entrada
  await db.insert(movements).values({
    type: "Entrada",
    reference: `Ingreso bovino #${newBovine.id} - ${newBovine.name}`,
    bovineId: newBovine.id,
    quantity: 1,
    userId: userId || null,
  });

  return newBovine;
}

export async function updateBovine(id: number, data: {
  breedId?: number;
  name?: string;
  category?: "Vacas lecheras" | "Novillos" | "Terneros" | "Toros";
  sex?: "Macho" | "Hembra";
  birthDay?: string;
  weight?: number;
  price?: number;
  color?: string;
  location?: string;
  description?: string;
  sanitaryHistory?: string;
  imageUrls?: string[];
  status?: "Disponible" | "Reservado" | "Vendido";
}, userId?: number) {
  const current = await getBovineById(id);
  if (!current) throw new Error("Bovino no encontrado.");

  if (data.weight !== undefined && data.weight <= 0) {
    throw new Error("El peso debe ser mayor a 0 kg.");
  }
  if (data.price !== undefined && data.price < 0) {
    throw new Error("El precio no puede ser negativo.");
  }

  const updatePayload: any = {};
  if (data.breedId !== undefined) updatePayload.breedId = data.breedId;
  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.category !== undefined) updatePayload.category = data.category;
  if (data.sex !== undefined) updatePayload.sex = data.sex;
  if (data.birthDay !== undefined) {
    updatePayload.birthDay = data.birthDay;
    updatePayload.age = calculateAgeMonths(data.birthDay);
  }
  if (data.weight !== undefined) updatePayload.weight = String(data.weight);
  if (data.price !== undefined) updatePayload.price = String(data.price);
  if (data.color !== undefined) updatePayload.color = data.color.trim();
  if (data.location !== undefined) updatePayload.location = data.location.trim();
  if (data.description !== undefined) updatePayload.description = data.description.trim();
  if (data.sanitaryHistory !== undefined) updatePayload.sanitaryHistory = data.sanitaryHistory.trim();
  if (data.imageUrls !== undefined) updatePayload.imageUrls = data.imageUrls;
  if (data.status !== undefined) updatePayload.status = data.status;

  const [updated] = await db
    .update(bovines)
    .set(updatePayload)
    .where(eq(bovines.id, id))
    .returning();

  return updated;
}

export async function deleteBovine(id: number, userId?: number) {
  // Check if bovine has sales details
  const [salesRecord] = await db
    .select({ count: sql<number>`count(*)` })
    .from(saleDetails)
    .where(eq(saleDetails.bovineId, id));

  if (Number(salesRecord?.count || 0) > 0) {
    throw new Error("No se puede eliminar un bovino con ventas registradas (ON DELETE RESTRICT). Aplica baja lógica.");
  }

  const [deleted] = await db.delete(bovines).where(eq(bovines.id, id)).returning();

  if (deleted) {
    await db.insert(movements).values({
      type: "Salida",
      reference: `Baja/Eliminación de bovino #${deleted.id} - ${deleted.name}`,
      bovineId: null,
      quantity: 1,
      userId: userId || null,
    });
  }

  return deleted;
}

/**
 * RNF 5: Concurrencia y Reservas atómicas
 * UPDATE bovine SET status='Reservado', reserved_by=$user, reserved_at=now() WHERE id=$1 AND status='Disponible' RETURNING id
 */
export async function reserveBovineAtomic(bovineId: number, userId: number): Promise<{ success: boolean; message?: string }> {
  // Solo SQL crudo para la reserva atómica estricta como exige la especificación
  const result = await sqlClient`
    UPDATE bovine 
    SET status = 'Reservado', reserved_by = ${userId}, reserved_at = now() 
    WHERE id = ${bovineId} AND status = 'Disponible' 
    RETURNING id
  `;

  if (result.length === 0) {
    return {
      success: false,
      message: "Este bovino ya no está disponible",
    };
  }

  return { success: true };
}

/**
 * Quitar un bovino del carrito:
 * UPDATE ... SET status='Disponible', reserved_by=NULL, reserved_at=NULL WHERE id=$1 AND reserved_by=$user
 */
export async function releaseBovineAtomic(bovineId: number, userId: number) {
  const result = await sqlClient`
    UPDATE bovine 
    SET status = 'Disponible', reserved_by = NULL, reserved_at = NULL 
    WHERE id = ${bovineId} AND reserved_by = ${userId}
    RETURNING id
  `;

  return result.length > 0;
}

/**
 * El carrito de un usuario es el conjunto de bovinos con status 'Reservado' y reserved_by = ese usuario.
 * No hay tabla de carrito aparte.
 */
export async function getUserCartBovines(userId: number) {
  await releaseExpiredReservations();

  return await db
    .select({
      id: bovines.id,
      name: bovines.name,
      breedId: bovines.breedId,
      breedName: breeds.name,
      category: bovines.category,
      sex: bovines.sex,
      weight: bovines.weight,
      price: bovines.price,
      imageUrls: bovines.imageUrls,
      location: bovines.location,
      status: bovines.status,
    })
    .from(bovines)
    .leftJoin(breeds, eq(bovines.breedId, breeds.id))
    .where(
      and(
        eq(bovines.status, "Reservado"),
        eq(bovines.reservedBy, userId)
      )
    );
}

export async function getAllBreeds() {
  return await db.select().from(breeds).orderBy(asc(breeds.name));
}
