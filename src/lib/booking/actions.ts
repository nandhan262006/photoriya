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

export async function getServices() {
  const db = getDb();
  return db.service.findMany({ where: { isActive: true } });
}

export async function getPhotographers() {
  const db = getDb();
  const photographers = await db.photographer.findMany({ where: { isActive: true } });
  return photographers.map((p) => ({ id: p.id, name: p.name, email: p.email, phone: p.phone, bio: p.bio, image: p.image, timeSlots: [] }));
}

export async function getTimeSlots() {
  return ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
}

export async function getBookedSlots(date: string) {
  const db = getDb();
  const bookings = await db.booking.findMany({
    where: { bookingDate: date, status: { in: ["confirmed", "pending"] } },
    select: { startTime: true, endTime: true },
  });
  return bookings.map((b) => ({ start: b.startTime, end: b.endTime }));
}

export async function createBooking(formData: FormData) {
  const db = getDb();

  const rawServiceId = formData.get("serviceId");
  const rawPhotographerId = formData.get("photographerId");
  const rawTotalPrice = (formData.get("totalPrice") as string) || "";

  const serviceId = typeof rawServiceId === "string" ? Number(rawServiceId) : NaN;
  const photographerId = typeof rawPhotographerId === "string" ? Number(rawPhotographerId) : NaN;

  if (isNaN(serviceId) || isNaN(photographerId)) {
    throw new Error("Invalid service or photographer selection");
  }

  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error("Selected service not found");

  const photographer = await db.photographer.findUnique({ where: { id: photographerId } });
  if (!photographer) throw new Error("Selected photographer not found");

  await db.booking.create({
    data: {
      clientName: (formData.get("clientName") as string)?.trim() || "",
      clientEmail: (formData.get("clientEmail") as string)?.trim() || "",
      clientPhone: (formData.get("clientPhone") as string)?.trim() || "",
      notes: (formData.get("notes") as string)?.trim() || "",
      bookingDate: (formData.get("bookingDate") as string) || "",
      startTime: (formData.get("startTime") as string) || "",
      endTime: (formData.get("endTime") as string) || "",
      totalPrice: rawTotalPrice || service.price,
      status: "confirmed",
      serviceId,
      photographerId,
    },
  });
  revalidatePath("/admin");
  return { success: true };
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
