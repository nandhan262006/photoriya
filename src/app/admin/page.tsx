import {
  CalendarCheck,
  Camera,
  Users,
  DollarSign,
  TrendingUp,
} from "lucide-react";

async function getStats() {
  return {
    totalBookings: 0,
    totalServices: 0,
    totalPhotographers: 0,
    confirmedBookings: 0,
    revenue: "0",
    recentBookings: [],
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
            {stats.recentBookings.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No bookings yet. Connect a database to see booking data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
