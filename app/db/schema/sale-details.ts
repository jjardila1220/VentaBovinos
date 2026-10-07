import { pgTable, serial, integer, numeric, boolean, check } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { sales } from "./sales.ts";
import { bovines } from "./bovines.ts";
import { products } from "./products.ts";

export const saleDetails = pgTable(
  "sale_detail",
  {
    id: serial("id").primaryKey(),
    saleId: integer("sale_id")
      .notNull()
      .references(() => sales.id, { onDelete: "cascade" }),
    bovineId: integer("bovine_id").references(() => bovines.id, { onDelete: "restrict" }),
    productId: integer("product_id").references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitaryPrice: numeric("unitary_price", { precision: 14, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull(),
    isBovine: boolean("is_bovine").notNull(),
  },
  (table) => [
    check("detail_quantity_positive", sql`${table.quantity} > 0`),
    check("detail_unitary_price_non_negative", sql`${table.unitaryPrice} >= 0`),
    check("detail_subtotal_non_negative", sql`${table.subtotal} >= 0`),
    check(
      "detail_item_exclusive",
      sql`(${table.bovineId} IS NOT NULL AND ${table.productId} IS NULL AND ${table.isBovine} = true AND ${table.quantity} = 1) OR (${table.bovineId} IS NULL AND ${table.productId} IS NOT NULL AND ${table.isBovine} = false)`
    ),
  ]
);

export const saleDetailsRelations = relations(saleDetails, ({ one }) => ({
  sale: one(sales, {
    fields: [saleDetails.saleId],
    references: [sales.id],
  }),
  bovine: one(bovines, {
    fields: [saleDetails.bovineId],
    references: [bovines.id],
  }),
  product: one(products, {
    fields: [saleDetails.productId],
    references: [products.id],
  }),
}));
