import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== "admin") throw new Error("Unauthorized");
}

export function getDb() {
  if (!db) throw new Error("Database not configured");
  return db;
}
