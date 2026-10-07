import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { movementTypeEnum } from "./enums.ts";
import { bovines } from "./bovines.ts";
import { products } from "./products.ts";
import { users } from "./users.ts";

export const movements = pgTable("movement", {
  id: serial("id").primaryKey(),
  type: movementTypeEnum("type").notNull(),
  reference: varchar("reference", { length: 150 }),
  bovineId: integer("bovine_id").references(() => bovines.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").default(1),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
});

export const movementsRelations = relations(movements, ({ one }) => ({
  bovine: one(bovines, {
    fields: [movements.bovineId],
    references: [bovines.id],
  }),
  product: one(products, {
    fields: [movements.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [movements.userId],
    references: [users.id],
  }),
}));
