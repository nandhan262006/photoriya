"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

function getDb() {
  if (!prisma) throw new Error("Database not configured");
  return prisma;
}

export async function getAdminBookings() {
  await requireAdmin();
  const db = getDb();
  return db.booking.findMany({
    include: { service: true, photographer: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateBookingStatus(bookingId: number, status: string) {
  await requireAdmin();
  const db = getDb();
  await db.booking.update({
    where: { id: bookingId },
    data: { status },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteBooking(bookingId: number) {
  await requireAdmin();
  const db = getDb();
  await db.booking.delete({ where: { id: bookingId } });
  revalidatePath("/admin");
  return { success: true };
}
