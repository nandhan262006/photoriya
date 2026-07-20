"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createService,
  deleteService,
} from "@/lib/booking/service-actions";
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
import { Plus, Trash2, Clock } from "lucide-react";

interface Service {
  id: number;
  name: string;
  description: string | null;
  duration: number;
  price: string;
  isActive: boolean;
}

interface ServicesManagerProps {
  services: Service[];
}

export function ServicesManager({ services }: ServicesManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    let result;
    if (editing) {
      result = await createService(form);
    } else {
      result = await createService(form);
    }

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(editing ? "Service updated" : "Service created");
      setOpen(false);
      setEditing(null);
      router.refresh();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this service?")) return;
    const result = await deleteService(id);
    if (result.success) {
      toast.success("Service deleted");
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground px-3 h-8 text-sm font-medium hover:bg-primary/80 cursor-pointer">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Service" : "New Service"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editing?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editing?.description || ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    defaultValue={editing?.duration}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (\u20b9)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editing?.price}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="border rounded-lg p-4 flex items-center justify-between"
          >
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{service.name}</h3>
              <p className="truncate text-sm text-muted-foreground">
                {service.description}
              </p>
              <div className="flex items-center gap-4 mt-1 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {service.duration} min
                </span>
                <span className="font-medium">
                  ₹{Number(service.price).toFixed(0)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(service.id)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
