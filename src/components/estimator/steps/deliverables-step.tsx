"use client";

import { CircleCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useEstimator } from "@/lib/estimator/state-provider";

export function DeliverablesStep() {
  const { subEventDeliverables } = useEstimator();

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">Deliverables</h1>
        <p className="text-sm text-muted-foreground">
          Deliverables are generated automatically based on the services you
          have selected. You do not need to manually choose them.
        </p>
      </header>

      {subEventDeliverables.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
          <CircleCheck className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No deliverables have been generated yet. Select coverage, add-on
            services, reels, or an album to see what you&apos;ll receive.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {subEventDeliverables.map((se) => (
            <div key={se.subEventId} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Separator className="flex-1" />
                <span className="text-sm font-semibold text-foreground">
                  {se.subEventName}
                </span>
                <Separator className="flex-1" />
              </div>
              {se.groups.map((grp) => (
                <div key={grp.group} className="rounded-lg border bg-muted/20 p-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {grp.group}
                  </span>
                  <div className="mt-1.5 flex flex-col gap-1.5">
                    {grp.services.map((svc, i) => (
                      <div
                        key={`${se.subEventId}-${grp.group}-${i}`}
                        className="flex items-start gap-2 rounded-md bg-background p-2 text-sm"
                      >
                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                        <div className="flex flex-wrap items-baseline gap-x-1.5">
                          <span className="font-medium">{svc.label}</span>
                          {svc.detail && (
                            <span className="text-xs text-muted-foreground">
                              ({svc.detail})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
