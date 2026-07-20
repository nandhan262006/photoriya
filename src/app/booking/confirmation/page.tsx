import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground mb-2">
          Your photography session has been booked successfully.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Our team will reach out to you shortly to confirm the details.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground px-4 h-9 text-sm font-medium hover:bg-primary/80"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
