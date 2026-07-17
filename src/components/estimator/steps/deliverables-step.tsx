"use client";

import { CircleCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useEstimator } from "@/lib/estimator/state-provider";

export function DeliverablesStep() {
  const { deliverables } = useEstimator();

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">Deliverables</h1>
        <p className="text-sm text-muted-foreground">
          Deliverables are generated automatically based on the services you
          have selected. You do not need to manually choose them.
        </p>
      </header>

      {deliverables.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
          <CircleCheck className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No deliverables have been generated yet. Select coverage, add-on
            services, reels, or an album to see what you&apos;ll receive.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {deliverables.map((g) => (
            <div key={g.group} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Separator className="flex-1" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {g.group}
                </span>
                <Separator className="flex-1" />
              </div>
              <div className="grid gap-1.5">
                {g.items.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-start gap-2 rounded-lg bg-muted/30 p-2.5 text-sm"
                  >
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="flex flex-wrap items-baseline gap-x-1.5">
                      <span className="font-medium">{d.label}</span>
                      {d.detail && (
                        <span className="text-xs text-muted-foreground">
                          ({d.detail})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
