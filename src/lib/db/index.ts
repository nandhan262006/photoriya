import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { _db: ReturnType<typeof createDb> };

function createDb(): { db: LibSQLDatabase<typeof schema> } | { db: null } {
  const url = process.env.DATABASE_URL;
  if (!url) return { db: null };
  try {
    const authToken = process.env.TURSO_AUTH_TOKEN;
    const client = url.startsWith("libsql://")
      ? createClient({ url, authToken })
      : createClient({ url });
    return { db: drizzle(client, { schema }) };
  } catch {
    return { db: null };
  }
}

const resolved = globalForDb._db ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb._db = resolved;

export const { db } = resolved;
export { schema };
