import { pgTable, serial, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { userRoleEnum } from "./enums.ts";
import { clients } from "./clients.ts";
import { movements } from "./movements.ts";

export const users = pgTable("user", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  clientId: integer("client_id").references(() => clients.id),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  client: one(clients, {
    fields: [users.clientId],
    references: [clients.id],
  }),
  movements: many(movements),
}));
