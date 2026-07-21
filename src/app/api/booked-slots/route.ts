import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ slots: [] });
    }
    const photographerId = request.nextUrl.searchParams.get("photographerId");
    const date = request.nextUrl.searchParams.get("date");

    const where: Record<string, unknown> = { status: { in: ["confirmed", "pending"] } };
    if (date) where.bookingDate = date;
    if (photographerId) where.photographerId = Number(photographerId);

    const bookings = await prisma.booking.findMany({
      where,
      select: { bookingDate: true, startTime: true, endTime: true },
    });
    const slots = bookings.map((b) => ({
      date: b.bookingDate,
      start: b.startTime,
      end: b.endTime,
    }));
    return NextResponse.json({ slots });
  } catch (e) {
    console.error("Failed to fetch booked slots:", e);
    return NextResponse.json({ slots: [] });
  }
}
