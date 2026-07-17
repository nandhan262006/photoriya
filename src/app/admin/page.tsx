import { db } from "@/db";
import { bookings, services, photographers } from "@/db/schema";
import { count, eq, sql } from "drizzle-orm";
import {
  CalendarCheck,
  Camera,
  Users,
  DollarSign,
  TrendingUp,
} from "lucide-react";

async function getStats() {
  const [bookingCount] = await db
    .select({ count: count() })
    .from(bookings);
  const [serviceCount] = await db
    .select({ count: count() })
    .from(services);
  const [photographerCount] = await db
    .select({ count: count() })
    .from(photographers);
  const [confirmed] = await db
    .select({ count: count() })
    .from(bookings)
    .where(eq(bookings.status, "confirmed"));

  const revenue = await db
    .select({
      total: sql<string>`COALESCE(SUM(CAST(${bookings.totalPrice} AS DECIMAL)), 0)`,
    })
    .from(bookings)
    .where(eq(bookings.status, "confirmed"));

  const recentBookings = await db.query.bookings.findMany({
    with: { service: true, photographer: true },
    orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
    limit: 5,
  });

  return {
    totalBookings: bookingCount.count,
    totalServices: serviceCount.count,
    totalPhotographers: photographerCount.count,
    confirmedBookings: confirmed.count,
    revenue: revenue[0]?.total || "0",
    recentBookings,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: CalendarCheck,
    },
    { label: "Confirmed", value: stats.confirmedBookings, icon: TrendingUp },
    { label: "Services", value: stats.totalServices, icon: Camera },
    { label: "Photographers", value: stats.totalPhotographers, icon: Users },
    {
      label: "Revenue",
      value: `$${Number(stats.revenue).toLocaleString()}`,
      icon: DollarSign,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {card.label}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 text-sm font-medium">Client</th>
              <th className="text-left p-3 text-sm font-medium">Service</th>
              <th className="text-left p-3 text-sm font-medium">Photographer</th>
              <th className="text-left p-3 text-sm font-medium">Date</th>
              <th className="text-left p-3 text-sm font-medium">Status</th>
              <th className="text-left p-3 text-sm font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentBookings.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="p-3">
                  <p className="font-medium">{b.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.clientEmail}
                  </p>
                </td>
                <td className="p-3 text-sm">{b.service?.name}</td>
                <td className="p-3 text-sm">{b.photographer?.name}</td>
                <td className="p-3 text-sm">
                  {b.bookingDate} {b.startTime}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      b.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : b.status === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : b.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="p-3 text-sm font-medium">
                  ${Number(b.totalPrice).toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
