import { defineConfig } from "drizzle-kit";

const host = process.env.DATABASE_HOST || "localhost";
const port = Number(process.env.DATABASE_PORT) || 5432;
const database = process.env.DATABASE_NAME || "carnes";
const user = process.env.DATABASE_USER || "postgres";
const password = process.env.DATABASE_PASSWORD || "postgres";

export default defineConfig({
  dialect: "postgresql",
  schema: "./app/db/schema",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: {
    host,
    port,
    database,
    user,
    password,
    ssl: false,
  },
});
