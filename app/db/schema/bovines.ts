import { pgTable, serial, integer, varchar, date, numeric, text, timestamp, check } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { breeds } from "./breeds.ts";
import { users } from "./users.ts";
import { bovineCategoryEnum, bovineStatusEnum, sexEnum } from "./enums.ts";
import { saleDetails } from "./sale-details.ts";
import { movements } from "./movements.ts";

export const bovines = pgTable(
  "bovine",
  {
    id: serial("id").primaryKey(),
    breedId: integer("breed_id")
      .notNull()
      .references(() => breeds.id),
    name: varchar("name", { length: 150 }).notNull(),
    category: bovineCategoryEnum("category").notNull(),
    sex: sexEnum("sex").notNull(),
    birthDay: date("birth_day", { mode: "string" }).notNull(),
    age: integer("age").notNull(),
    weight: numeric("weight", { precision: 8, scale: 2 }).notNull(),
    price: numeric("price", { precision: 14, scale: 2 }).notNull(),
    color: varchar("color", { length: 100 }),
    location: varchar("location", { length: 150 }),
    description: text("description"),
    sanitaryHistory: text("sanitary_history"),
    imageUrls: text("image_urls").array(),
    status: bovineStatusEnum("status").default("Disponible").notNull(),
    registerDay: date("register_day", { mode: "string" }).default(sql`CURRENT_DATE`),
    reservedBy: integer("reserved_by").references(() => users.id),
    reservedAt: timestamp("reserved_at", { withTimezone: true }),
  },
  (table) => [
    check("bovine_weight_positive", sql`${table.weight} > 0`),
    check("bovine_price_non_negative", sql`${table.price} >= 0`),
    check("bovine_age_non_negative", sql`${table.age} >= 0`),
  ]
);

export const bovinesRelations = relations(bovines, ({ one, many }) => ({
  breed: one(breeds, {
    fields: [bovines.breedId],
    references: [breeds.id],
  }),
  reserver: one(users, {
    fields: [bovines.reservedBy],
    references: [users.id],
  }),
  saleDetails: many(saleDetails),
  movements: many(movements),
}));
