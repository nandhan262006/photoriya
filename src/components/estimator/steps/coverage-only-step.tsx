"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCoverageOption } from "@/lib/estimator/catalog";
import { formatRangeCompact } from "@/lib/estimator/format";
import { useEstimator } from "@/lib/estimator/state-provider";
import type { EventTemplate, ID, PriceRange } from "@/lib/estimator/types";
import { ToggleChip } from "../primitives";

function coveragePrice(
  template: EventTemplate,
  subEventId: ID,
  coverageId: ID,
): PriceRange | undefined {
  const sub = template.subEvents.find((s) => s.id === subEventId);
  return sub?.coverage?.[coverageId] ?? template.defaultCoveragePrices[coverageId];
}

export function CoverageOnlyStep() {
  const { state, template, dispatch } = useEstimator();
  const [open, setOpen] = useState<Record<ID, boolean>>({});

  if (!template) return null;

  const firstId = state.selectedSubEvents[0];
  const isOpen = (id: ID) => open[id] ?? id === firstId;
  const toggle = (id: ID) => setOpen((o) => ({ ...o, [id]: !isOpen(id) }));

  if (state.selectedSubEvents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Select at least one sub-event first.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">
          Coverage selection
        </h1>
        <p className="text-sm text-muted-foreground">
          For every selected sub-event, choose the photography and videography
          coverage you need. Prices update instantly.
        </p>
      </header>

      <div className="flex flex-col gap-2.5">
        {state.selectedSubEvents.map((subId) => {
          const sub = template.subEvents.find((s) => s.id === subId);
          const cfg = state.subEventConfig[subId];
          if (!sub || !cfg) return null;

          const summary =
            cfg.coverage.length > 0
              ? `${cfg.coverage.length} coverage option${cfg.coverage.length > 1 ? "s" : ""}`
              : "No coverage selected";

          return (
            <div key={subId} className="rounded-xl border">
              <button
                type="button"
                onClick={() => toggle(subId)}
                aria-expanded={isOpen(subId)}
                className="flex w-full items-center justify-between gap-2 p-3 text-left"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">{sub.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {summary}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen(subId) && "rotate-180",
                  )}
                />
              </button>

              {isOpen(subId) && (
                <div className="flex flex-col gap-3 border-t p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {template.coverageOptions.map((id) => {
                      const opt = getCoverageOption(id);
                      if (!opt) return null;
                      const price = coveragePrice(template, subId, id);
                      return (
                        <ToggleChip
                          key={id}
                          iconKey={opt.icon}
                          label={opt.label}
                          description={opt.description}
                          selected={cfg.coverage.includes(id)}
                          priceLabel={
                            price ? formatRangeCompact(price) : undefined
                          }
                          onClick={() =>
                            dispatch({
                              type: "TOGGLE_COVERAGE",
                              subEventId: subId,
                              coverageId: id,
                            })
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
