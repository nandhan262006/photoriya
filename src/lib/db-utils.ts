import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== "admin") throw new Error("Unauthorized");
}

export function getDb() {
  if (!prisma) throw new Error("Database not configured");
  return prisma;
}
