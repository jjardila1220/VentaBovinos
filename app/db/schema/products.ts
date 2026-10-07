import { pgTable, serial, varchar, numeric, integer, check } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { saleDetails } from "./sale-details.ts";

export const products = pgTable(
  "product",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    cut: varchar("cut", { length: 100 }),
    weight: numeric("weight", { precision: 10, scale: 2 }).default("0.00"),
    pricePerKilogram: numeric("price_per_kilogram", { precision: 14, scale: 2 }).default("0.00"),
    stock: integer("stock").default(0).notNull(),
  },
  (table) => [
    check("product_stock_non_negative", sql`${table.stock} >= 0`),
    check("product_price_kg_non_negative", sql`${table.pricePerKilogram} >= 0`),
    check("product_weight_non_negative", sql`${table.weight} >= 0`),
  ]
);

export const productsRelations = relations(products, ({ many }) => ({
  saleDetails: many(saleDetails),
}));
