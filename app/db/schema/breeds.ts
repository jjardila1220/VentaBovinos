import { pgTable, serial, varchar, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { bovines } from "./bovines.ts";

export const breeds = pgTable("breed", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
});

export const breedsRelations = relations(breeds, ({ many }) => ({
  bovines: many(bovines),
}));
