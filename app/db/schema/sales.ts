import { pgTable, serial, integer, timestamp, numeric, varchar, check } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { clients } from "./clients.ts";
import { saleStatusEnum } from "./enums.ts";
import { saleDetails } from "./sale-details.ts";

export const sales = pgTable(
  "sale",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id),
    date: timestamp("date", { withTimezone: true }).default(sql`now()`).notNull(),
    total: numeric("total", { precision: 14, scale: 2 }).notNull(),
    status: saleStatusEnum("status").default("Completado").notNull(),
    paymentMethod: varchar("payment_method", { length: 100 }).notNull(),
    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  },
  (table) => [
    check("sale_total_non_negative", sql`${table.total} >= 0`),
  ]
);

export const salesRelations = relations(sales, ({ one, many }) => ({
  client: one(clients, {
    fields: [sales.clientId],
    references: [clients.id],
  }),
  details: many(saleDetails),
}));
