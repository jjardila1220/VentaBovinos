import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const host = process.env.DATABASE_HOST || "localhost";
const port = process.env.DATABASE_PORT || "5432";
const dbName = process.env.DATABASE_NAME || "carnes";
const user = process.env.DATABASE_USER || "postgres";
const password = process.env.DATABASE_PASSWORD || "postgres";

const connectionString = `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${dbName}`;

console.log(`Connecting to database at ${host}:${port}/${dbName} for migrations...`);

const migrationClient = postgres(connectionString, { max: 1 });
const db = drizzle(migrationClient);

async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigrations();
