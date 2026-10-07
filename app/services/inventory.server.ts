import { db } from "~/db/index.ts";
import { bovines } from "~/db/schema/bovines.ts";
import { breeds } from "~/db/schema/breeds.ts";
import { movements } from "~/db/schema/movements.ts";
import { users } from "~/db/schema/users.ts";
import { eq, desc } from "drizzle-orm";

export async function getInventoryStock() {
  const bovineList = await db
    .select({
      id: bovines.id,
      name: bovines.name,
      breedName: breeds.name,
      category: bovines.category,
      weight: bovines.weight,
      price: bovines.price,
      status: bovines.status,
    })
    .from(bovines)
    .leftJoin(breeds, eq(bovines.breedId, breeds.id))
    .orderBy(desc(bovines.id));

  const total = bovineList.length;
  const disponibles = bovineList.filter((b) => b.status === "Disponible").length;
  const reservados = bovineList.filter((b) => b.status === "Reservado").length;
  const vendidos = bovineList.filter((b) => b.status === "Vendido").length;

  return {
    items: bovineList,
    stats: {
      total,
      disponibles,
      reservados,
      vendidos,
    },
  };
}

export async function getMovementsLog(limit = 100) {
  return await db
    .select({
      id: movements.id,
      type: movements.type,
      reference: movements.reference,
      bovineId: movements.bovineId,
      productId: movements.productId,
      quantity: movements.quantity,
      createdAt: movements.createdAt,
      userName: users.name,
      bovineName: bovines.name,
    })
    .from(movements)
    .leftJoin(users, eq(movements.userId, users.id))
    .leftJoin(bovines, eq(movements.bovineId, bovines.id))
    .orderBy(desc(movements.createdAt))
    .limit(limit);
}
