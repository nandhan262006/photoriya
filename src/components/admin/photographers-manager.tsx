"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createPhotographer,
  deletePhotographer,
} from "@/lib/booking/photographer-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, User } from "lucide-react";

interface TimeSlot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Photographer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  image: string | null;
  timeSlots: TimeSlot[];
}

interface PhotographersManagerProps {
  photographers: Photographer[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function PhotographersManager({
  photographers,
}: PhotographersManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await createPhotographer(form);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Photographer added");
      setOpen(false);
      router.refresh();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this photographer and their time slots?")) return;
    const result = await deletePhotographer(id);
    if (result.success) {
      toast.success("Photographer deleted");
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground px-3 h-8 text-sm font-medium hover:bg-primary/80 cursor-pointer">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Photographer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Photographer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" />
              </div>
              <Button type="submit" className="w-full">
                Add Photographer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {photographers.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No photographers yet
          </p>
        )}
        {photographers.map((p) => (
          <div key={p.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                <div className="size-10 shrink-0 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{p.name}</h3>
                  <p className="truncate text-sm text-muted-foreground">{p.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(p.id)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600" />
              </Button>
            </div>
            {p.timeSlots.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {p.timeSlots.map((slot) => (
                  <span
                    key={slot.id}
                    className="inline-flex items-center text-xs bg-muted px-2 py-1 rounded"
                  >
                    {DAYS[slot.dayOfWeek]} {slot.startTime}-{slot.endTime}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
