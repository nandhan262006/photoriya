"use server";

import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getServices() {
  return db.query.services.findMany({
    where: eq(
      sql`${sql.raw("services.is_active")}`,
      true
    ),
  });
}

export async function getPhotographers() {
  return db.query.photographers.findMany({
    where: eq(
      sql`${sql.raw("photographers.is_active")}`,
      true
    ),
  });
}

export async function getTimeSlots(photographerId: number) {
  return db.query.timeSlots.findMany({
    where: eq(
      sql`${sql.raw("time_slots.photographer_id")}`,
      photographerId
    ),
  });
}

export async function getBookedSlots(
  photographerId: number,
  date: string
) {
  const existing = await db.query.bookings.findMany({
    where: and(
      eq(bookings.photographerId, photographerId),
      eq(bookings.bookingDate, date),
      sql`${bookings.status} != 'cancelled'`
    ),
    columns: { startTime: true, endTime: true },
  });
  return existing;
}

export async function createBooking(formData: FormData) {
  const clientName = formData.get("clientName") as string;
  const clientEmail = formData.get("clientEmail") as string;
  const clientPhone = formData.get("clientPhone") as string;
  const serviceId = parseInt(formData.get("serviceId") as string);
  const photographerId = parseInt(formData.get("photographerId") as string);
  const bookingDate = formData.get("bookingDate") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const totalPrice = formData.get("totalPrice") as string;
  const notes = formData.get("notes") as string;

  if (!clientName || !clientEmail || !serviceId || !bookingDate || !startTime) {
    return { error: "Missing required fields" };
  }

  const existing = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.photographerId, photographerId),
      eq(bookings.bookingDate, bookingDate),
      eq(bookings.startTime, startTime),
      sql`${bookings.status} != 'cancelled'`
    ),
  });

  if (existing) {
    return { error: "This time slot is already booked" };
  }

  const [booking] = await db
    .insert(bookings)
    .values({
      clientName,
      clientEmail,
      clientPhone,
      serviceId,
      photographerId,
      bookingDate,
      startTime,
      endTime,
      totalPrice,
      notes,
      status: "confirmed",
    })
    .returning();

  revalidatePath("/booking");
  revalidatePath("/admin/bookings");
  return { success: true, booking };
}

export async function getAdminBookings() {
  return db.query.bookings.findMany({
    with: { service: true, photographer: true },
    orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
  });
}

export async function updateBookingStatus(
  bookingId: number,
  status: string
) {
  await db
    .update(bookings)
    .set({ status, updatedAt: new Date() })
    .where(eq(bookings.id, bookingId));

  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function deleteBooking(bookingId: number) {
  await db.delete(bookings).where(eq(bookings.id, bookingId));
  revalidatePath("/admin/bookings");
  return { success: true };
}
