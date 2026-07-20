import Link from "next/link";
import Image from "next/image";
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
          <Link href="/" className="flex items-center">
            <Image src="/NAVIBAR.png" alt="Photriya Studios" width={75} height={75} priority />
          </Link>
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
