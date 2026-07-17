"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ServiceSelect } from "./service-select";
import { DateTimePicker } from "./date-time-picker";
import { BookingForm } from "./booking-form";
import { createBooking } from "@/lib/booking/actions";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const steps = ["Service", "Date & Time", "Details", "Confirm"];

interface Service {
  id: number;
  name: string;
  description: string | null;
  duration: number;
  price: string;
  image: string | null;
}

interface Photographer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  image: string | null;
}

interface BookingFlowProps {
  services: Service[];
  photographers: Photographer[];
}

export function BookingFlow({ services, photographers }: BookingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPhotographer, setSelectedPhotographer] =
    useState<Photographer | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleBook = async (formData: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  }) => {
    if (!selectedService || !selectedPhotographer || !selectedDate || !selectedTime) {
      toast.error("Missing booking details");
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.set("clientName", formData.name);
    fd.set("clientEmail", formData.email);
    fd.set("clientPhone", formData.phone);
    fd.set("notes", formData.notes);
    fd.set("serviceId", String(selectedService.id));
    fd.set("photographerId", String(selectedPhotographer.id));
    fd.set("bookingDate", selectedDate);
    fd.set("startTime", selectedTime);
    fd.set("endTime", selectedEndTime);
    fd.set("totalPrice", selectedService.price);

    const result = await createBooking(fd);

    if (result.error) {
      toast.error(result.error);
      setSubmitting(false);
    } else {
      toast.success("Booking confirmed!");
      router.push("/booking/confirmation");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`text-sm hidden sm:inline ${
                i <= step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className="w-8 h-px bg-border mx-1" />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <ServiceSelect
          services={services}
          selected={selectedService}
          onSelect={(s) => {
            setSelectedService(s);
            setStep(1);
          }}
        />
      )}

      {step === 1 && selectedService && (
        <DateTimePicker
          photographers={photographers}
          selectedPhotographer={selectedPhotographer}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          serviceDuration={selectedService.duration}
          onSelectPhotographer={setSelectedPhotographer}
          onSelectDate={setSelectedDate}
          onSelectTime={(time, endTime) => {
            setSelectedTime(time);
            setSelectedEndTime(endTime);
          }}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <BookingForm
          selectedService={selectedService}
          selectedPhotographer={selectedPhotographer}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onBack={() => setStep(1)}
          onNext={handleBook}
          submitting={submitting}
        />
      )}

      {step === 3 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-6">
            We&apos;ve sent a confirmation to your email.
          </p>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      )}
    </div>
  );
}
