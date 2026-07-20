"use server";

import { prisma } from "@/lib/prisma";

export async function getServices() {
  return prisma.service.findMany({ where: { isActive: true } });
}

export async function getPhotographers() {
  const photographers = await prisma.photographer.findMany({ where: { isActive: true } });
  return photographers.map((p) => ({ id: p.id, name: p.name, email: p.email, phone: p.phone, bio: p.bio, image: p.image, timeSlots: [] }));
}

export async function getTimeSlots() {
  return ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
}

export async function getBookedSlots() {
  return [];
}

export async function createBooking(formData: FormData) {
  await prisma.booking.create({
    data: {
      clientName: (formData.get("clientName") as string) || "",
      clientEmail: (formData.get("clientEmail") as string) || "",
      clientPhone: (formData.get("clientPhone") as string) || "",
      notes: (formData.get("notes") as string) || "",
      bookingDate: (formData.get("bookingDate") as string) || "",
      startTime: (formData.get("startTime") as string) || "",
      endTime: (formData.get("endTime") as string) || "",
      totalPrice: (formData.get("totalPrice") as string) || "",
      status: "confirmed",
      serviceId: Number(formData.get("serviceId")),
      photographerId: Number(formData.get("photographerId")),
    },
  });

  return { success: true };
}

export async function getAdminBookings() {
  return prisma.booking.findMany({
    include: { service: true, photographer: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateBookingStatus(bookingId: number, status: string) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
  return { success: true };
}

export async function deleteBooking(bookingId: number) {
  await prisma.booking.delete({ where: { id: bookingId } });
  return { success: true };
}
