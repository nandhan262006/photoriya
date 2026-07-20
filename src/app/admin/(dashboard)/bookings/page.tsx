import { BookingsTable } from "@/components/admin/bookings-table";
import { getAdminBookings } from "@/lib/booking/actions";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const allBookings = await getAdminBookings();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Bookings</h1>
      </div>

      <BookingsTable bookings={allBookings} />
    </div>
  );
}
