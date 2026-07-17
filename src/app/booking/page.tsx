import { getServices, getPhotographers } from "@/lib/booking/actions";
import { BookingFlow } from "@/components/booking/booking-flow";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const [services, photographers] = await Promise.all([
    getServices(),
    getPhotographers(),
  ]);

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-2">
          <span className="text-xl font-semibold">StudioBook</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">Book a Session</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <BookingFlow services={services} photographers={photographers} />
      </main>
    </div>
  );
}
