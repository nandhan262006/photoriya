"use client";

import { Camera, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: number;
  name: string;
  description: string | null;
  duration: number;
  price: string;
  image: string | null;
}

interface ServiceSelectProps {
  services: Service[];
  selected: Service | null;
  onSelect: (service: Service) => void;
}

export function ServiceSelect({
  services,
  selected,
  onSelect,
}: ServiceSelectProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Choose a Service</h2>
      <div className="grid gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className={cn(
              "text-left border rounded-lg p-6 transition-all hover:border-primary hover:shadow-md",
              selected?.id === service.id
                ? "border-primary ring-2 ring-primary/20"
                : "border-border"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{service.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {service.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.duration} min
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    ₹{Number(service.price).toFixed(0)}
                  </span>
                </div>
              </div>
              <Camera className="h-8 w-8 text-muted-foreground ml-4" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
