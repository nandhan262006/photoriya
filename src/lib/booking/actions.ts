"use server";

import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");

interface BookingRecord {
  id: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
  serviceId: string;
  photographerId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: string;
  status: string;
  createdAt: string;
}

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readBookings(): Promise<BookingRecord[]> {
  try {
    await ensureDataDir();
    const raw = await readFile(BOOKINGS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeBookings(bookings: BookingRecord[]) {
  await ensureDataDir();
  await writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

export async function getServices() {
  return [
    { id: 1, name: "Wedding Photography", description: "Full-day wedding coverage with 2 photographers", duration: 480, price: "75000", image: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: "Event Photography", description: "Birthday, anniversary, or special event coverage", duration: 240, price: "35000", image: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 3, name: "Pre-Wedding Shoot", description: "Creative pre-wedding photoshoot at location of choice", duration: 180, price: "25000", image: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 4, name: "Corporate Event", description: "Professional coverage for corporate functions", duration: 360, price: "50000", image: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 5, name: "Portrait Session", description: "Individual or family portrait photography", duration: 120, price: "15000", image: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ];
}

export async function getPhotographers() {
  return [
    { id: 1, name: "Venky", email: "venky@photriya.com", phone: "+91 98765 43210", bio: "Lead photographer with 10+ years of experience", image: null, isActive: true, createdAt: new Date(), timeSlots: [] },
  ];
}

export async function getTimeSlots() {
  return ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
}

export async function getBookedSlots() {
  return [];
}

export async function createBooking(formData: FormData) {
  const booking: BookingRecord = {
    id: Date.now(),
    clientName: (formData.get("clientName") as string) || "",
    clientEmail: (formData.get("clientEmail") as string) || "",
    clientPhone: (formData.get("clientPhone") as string) || "",
    notes: (formData.get("notes") as string) || "",
    serviceId: (formData.get("serviceId") as string) || "",
    photographerId: (formData.get("photographerId") as string) || "",
    bookingDate: (formData.get("bookingDate") as string) || "",
    startTime: (formData.get("startTime") as string) || "",
    endTime: (formData.get("endTime") as string) || "",
    totalPrice: (formData.get("totalPrice") as string) || "",
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  const bookings = await readBookings();
  bookings.push(booking);
  await writeBookings(bookings);

  return { success: true, id: booking.id };
}

export async function getAdminBookings() {
  const bookings = await readBookings();
  return bookings.map((b) => ({
    id: b.id,
    clientName: b.clientName,
    clientEmail: b.clientEmail,
    clientPhone: b.clientPhone,
    bookingDate: b.bookingDate,
    startTime: b.startTime,
    endTime: b.endTime,
    status: b.status,
    totalPrice: b.totalPrice,
    notes: b.notes,
    service: null as { name: string } | null,
    photographer: null as { name: string } | null,
  }));
}

export async function updateBookingStatus(bookingId: number, status: string) {
  const bookings = await readBookings();
  const idx = bookings.findIndex((b) => b.id === bookingId);
  if (idx !== -1) {
    bookings[idx].status = status;
    await writeBookings(bookings);
  }
  return { success: true };
}

export async function deleteBooking(bookingId: number) {
  const bookings = await readBookings();
  const filtered = bookings.filter((b) => b.id !== bookingId);
  await writeBookings(filtered);
  return { success: true };
}
