import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sales } from "./sales.ts";
import { users } from "./users.ts";

export const clients = pgTable("client", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  document: varchar("document", { length: 50 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 150 }).unique(),
  address: varchar("address", { length: 255 }),
});

export const clientsRelations = relations(clients, ({ many }) => ({
  sales: many(sales),
  users: many(users),
}));
