import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { ServiceGallery } from "@/components/service-gallery";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
          <Link href="/" className="flex items-center">
            <Image src="/NAVIBAR.png" alt="StudioBook" width={140} height={40} priority />
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
          href="/estimator"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground px-4 h-9 text-sm font-medium hover:bg-primary/80"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Estimate an Event
        </Link>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-2xl font-semibold">Our Work</h2>
        </div>
        <ServiceGallery
          images={[
            { src: "/gallery/gallery1.avif", alt: "Photography work 1" },
            { src: "/gallery/gallery2.avif", alt: "Photography work 2" },
            { src: "/gallery/gallery3.avif", alt: "Photography work 3" },
            { src: "/gallery/gallery4.avif", alt: "Photography work 4" },
            { src: "/gallery/gallery5.avif", alt: "Photography work 5" },
            { src: "/gallery/gallery6.avif", alt: "Photography work 6" },
            { src: "/gallery/gallery7.avif", alt: "Photography work 7" },
            { src: "/gallery/gallery8.avif", alt: "Photography work 8" },
          ]}
        />
      </section>
    </div>
  );
}
