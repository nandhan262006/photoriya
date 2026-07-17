"use client";

import { useState, useEffect } from "react";
import { format, addDays, isBefore, startOfDay, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Photographer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  image: string | null;
}

interface DateTimePickerProps {
  photographers: Photographer[];
  selectedPhotographer: Photographer | null;
  selectedDate: string;
  selectedTime: string;
  serviceDuration: number;
  onSelectPhotographer: (p: Photographer) => void;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string, endTime: string) => void;
  onBack: () => void;
  onNext: () => void;
}

function generateTimeSlots() {
  const slots: string[] = [];
  for (let h = 9; h < 17; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 16) {
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
  }
  return slots;
}

function addMinutes(time: string, mins: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function DateTimePicker({
  photographers,
  selectedPhotographer,
  selectedDate,
  selectedTime,
  serviceDuration,
  onSelectPhotographer,
  onSelectDate,
  onSelectTime,
  onBack,
  onNext,
}: DateTimePickerProps) {
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [month, setMonth] = useState(new Date());

  const today = startOfDay(new Date());
  const maxDate = addDays(today, 60);

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    if (!selectedPhotographer || !selectedDate) return;
    let cancelled = false;
    fetch(
      `/api/booked-slots?photographerId=${selectedPhotographer.id}&date=${selectedDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setBookedSlots(data.slots || []);
      })
      .catch(() => {
        if (!cancelled) setBookedSlots([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPhotographer, selectedDate]);

  const isSlotBooked = (time: string) => {
    return bookedSlots.some((slot) => {
      const [sStart, sEnd] = slot.split("-");
      return time >= sStart && time < sEnd;
    });
  };

  const validSlots = timeSlots.filter((time) => {
    if (isSlotBooked(time)) return false;
    const endTime = addMinutes(time, serviceDuration);
    return endTime <= "17:00";
  });

  const canProceed = selectedPhotographer && selectedDate && selectedTime;

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">1. Choose Photographer</h3>
          <div className="space-y-2">
            {photographers.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelectPhotographer(p);
                  onSelectDate("");
                  onSelectTime("", "");
                }}
                className={cn(
                  "w-full text-left border rounded-lg p-4 transition-all hover:border-primary",
                  selectedPhotographer?.id === p.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.email}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">2. Pick a Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate ? parseISO(selectedDate) : undefined}
            onSelect={(date) => {
              if (date) onSelectDate(format(date, "yyyy-MM-dd"));
            }}
            disabled={(date) =>
              isBefore(date, today) || isBefore(maxDate, date)
            }
            month={month}
            onMonthChange={setMonth}
            className="rounded-md border"
          />

          {selectedDate && selectedPhotographer && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">
                3. Pick a Time
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {validSlots.length === 0 && (
                  <p className="col-span-3 text-sm text-muted-foreground">
                    No available slots for this date
                  </p>
                )}
                {validSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() =>
                      onSelectTime(time, addMinutes(time, serviceDuration))
                    }
                    className={cn(
                      "border rounded-md py-2 text-sm font-medium transition-all",
                      selectedTime === time
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
