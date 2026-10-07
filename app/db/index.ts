import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.ts";

const host = process.env.DATABASE_HOST || "localhost";
const port = process.env.DATABASE_PORT || "5432";
const dbName = process.env.DATABASE_NAME || "carnes";
const user = process.env.DATABASE_USER || "postgres";
const password = process.env.DATABASE_PASSWORD || "postgres";

export const connectionString = `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${dbName}`;

// Global singleton for client to avoid exhausting connections across reloads
declare global {
  var __db_client: ReturnType<typeof postgres> | undefined;
}

export const sqlClient = global.__db_client || postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 5,
  onnotice: () => {},
});

if (process.env.NODE_ENV !== "production") {
  global.__db_client = sqlClient;
}

export const db = drizzle(sqlClient, {
  schema,
  casing: "snake_case",
});

export type DB = typeof db;
