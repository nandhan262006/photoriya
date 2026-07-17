import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const photographerId = request.nextUrl.searchParams.get("photographerId");
  const date = request.nextUrl.searchParams.get("date");

  if (!photographerId || !date) {
    return NextResponse.json({ slots: [] });
  }

  const existing = await db.query.bookings.findMany({
    where: and(
      eq(bookings.photographerId, parseInt(photographerId)),
      eq(bookings.bookingDate, date),
      ne(bookings.status, "cancelled")
    ),
    columns: { startTime: true, endTime: true },
  });

  const slots = existing.map(
    (b) => `${b.startTime}-${b.endTime}`
  );

  return NextResponse.json({ slots });
}
