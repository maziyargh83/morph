import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.ts";

export function createDatabase(connectionString = requireDatabaseUrl()) {
  const pool = new Pool({ connectionString });
  const db = drizzle({ client: pool, schema });
  return { db, pool };
}

export type MorphDatabase = ReturnType<typeof createDatabase>["db"];

function requireDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (value) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production.");
  }

  return "postgresql://morph:morph@localhost:5432/morph";
}
