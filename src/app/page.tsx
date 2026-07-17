import Link from "next/link";
import { getServices } from "@/lib/booking/actions";
import { Camera, Calendar, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let services: Awaited<ReturnType<typeof getServices>> = [];
  try {
    services = await getServices();
  } catch {
    // DB may not be provisioned — the home page still renders without services.
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            <span className="text-xl font-semibold">StudioBook</span>
          </div>
          <Link
            href="/admin/login"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 h-8 text-sm font-medium hover:bg-muted hover:text-foreground"
          >
            Admin
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Capture Your Best Moments
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Professional photography services tailored to your needs. Book a
          session with our talented photographers.
        </p>
        <Link
          href="/booking"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground px-4 h-9 text-sm font-medium hover:bg-primary/80"
        >
          <Calendar className="mr-2 h-5 w-5" />
          Book a Session
        </Link>
        <Link
          href="/estimator"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background px-4 h-9 text-sm font-medium hover:bg-muted hover:text-foreground"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Estimate an Event
        </Link>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-2xl font-semibold">Our Services</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {service.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">
                  ${Number(service.price).toFixed(0)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {service.duration} min
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
