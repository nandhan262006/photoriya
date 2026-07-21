"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, getDb } from "@/lib/db-utils";
import { booking, service as serviceTable, photographer as photographerTable } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const VALID_STATUSES = ["confirmed", "pending", "cancelled"];

export async function getAdminBookings() {
  await requireAdmin();
  const db = getDb();
  try {
    const rows = await db
      .select({
        id: booking.id,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone,
        notes: booking.notes,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: booking.totalPrice,
        status: booking.status,
        createdAt: booking.createdAt,
        serviceName: serviceTable.name,
        photographerName: photographerTable.name,
      })
      .from(booking)
      .leftJoin(serviceTable, eq(booking.serviceId, serviceTable.id))
      .leftJoin(photographerTable, eq(booking.photographerId, photographerTable.id))
      .orderBy(desc(booking.createdAt));
    return rows;
  } catch {
    return [];
  }
}

export async function updateBookingStatus(bookingId: number, status: string) {
  await requireAdmin();
  if (!VALID_STATUSES.includes(status)) throw new Error("Invalid status");
  const db = getDb();
  await db.update(booking).set({ status }).where(eq(booking.id, bookingId));
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteBooking(bookingId: number) {
  await requireAdmin();
  const db = getDb();
  await db.delete(booking).where(eq(booking.id, bookingId));
  revalidatePath("/admin");
  return { success: true };
}
