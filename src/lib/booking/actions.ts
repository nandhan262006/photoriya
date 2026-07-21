"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, getDb } from "@/lib/db-utils";

const VALID_STATUSES = ["confirmed", "pending", "cancelled"];

export async function getAdminBookings() {
  await requireAdmin();
  const db = getDb();
  try {
    return await db.booking.findMany({
      include: { service: true, photographer: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function updateBookingStatus(bookingId: number, status: string) {
  await requireAdmin();
  if (!VALID_STATUSES.includes(status)) throw new Error("Invalid status");
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
