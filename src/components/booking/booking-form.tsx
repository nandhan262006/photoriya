"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, User, Clock, CalendarDays } from "lucide-react";

interface Service {
  id: number;
  name: string;
  description: string | null;
  duration: number;
  price: string;
}

interface Photographer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

interface BookingFormProps {
  selectedService: Service | null;
  selectedPhotographer: Photographer | null;
  selectedDate: string;
  selectedTime: string;
  onBack: () => void;
  onNext: (data: { name: string; email: string; phone: string; notes: string }) => void;
  submitting: boolean;
}

export function BookingForm({
  selectedService,
  selectedPhotographer,
  selectedDate,
  selectedTime,
  onBack,
  onNext,
  submitting,
}: BookingFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const isValid = name && email;

  return (
    <div>
      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          <h2 className="text-2xl font-semibold mb-6">Your Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-6">Summary</h2>
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Photographer</p>
                <p className="font-medium">{selectedPhotographer?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Service</p>
                <p className="font-medium">{selectedService?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedService?.duration} min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date & Time</p>
                <p className="font-medium">
                  {selectedDate} at {selectedTime}
                </p>
              </div>
            </div>
            <div className="pt-3 border-t flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">
                ${Number(selectedService?.price || 0).toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={() => onNext({ name, email, phone, notes })}
          disabled={!isValid || submitting}
        >
          {submitting ? "Booking..." : "Confirm Booking"}{" "}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
