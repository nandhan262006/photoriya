"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAddOnOption, getCoverageOption } from "@/lib/estimator/catalog";
import { formatRangeCompact } from "@/lib/estimator/format";
import { maxReelsFor } from "@/lib/estimator/state";
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

function addOnPrice(
  template: EventTemplate,
  subEventId: ID,
  addOnId: ID,
): PriceRange | undefined {
  const sub = template.subEvents.find((s) => s.id === subEventId);
  return sub?.addOns?.[addOnId] ?? template.defaultAddOnPrices[addOnId];
}

function reelPrice(template: EventTemplate, subEventId: ID): PriceRange {
  const sub = template.subEvents.find((s) => s.id === subEventId);
  return sub?.reel ?? template.defaultReelPrice;
}

export function CoverageStep() {
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
          Coverage &amp; services
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure photography, videography, add-ons and reels for each
          sub-event. Prices update instantly.
        </p>
      </header>

      <div className="flex flex-col gap-2.5">
        {state.selectedSubEvents.map((subId) => {
          const sub = template.subEvents.find((s) => s.id === subId);
          const cfg = state.subEventConfig[subId];
          if (!sub || !cfg) return null;

          const parts: string[] = [];
          if (cfg.coverage.length) parts.push(`${cfg.coverage.length} coverage`);
          if (cfg.addOns.length) parts.push(`${cfg.addOns.length} add-on${cfg.addOns.length > 1 ? "s" : ""}`);
          if (cfg.reels > 0) parts.push(`${cfg.reels} reel${cfg.reels > 1 ? "s" : ""}`);
          const summary = parts.length ? parts.join(" \u00b7 ") : "Not configured yet";

          const maxReels = maxReelsFor(template, subId);

          return (
            <div key={subId} className="rounded-xl border">
              <button
                type="button"
                onClick={() => toggle(subId)}
                aria-expanded={isOpen(subId)}
                className="flex w-full items-center justify-between gap-2 p-3 text-left"
              >
                <span className="flex min-w-0 items-center gap-2 overflow-hidden">
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
                <div className="flex flex-col gap-4 border-t p-3">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Coverage
                    </span>
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

                  {template.addOnOptions.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Add-on services
                      </span>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {template.addOnOptions.map((id) => {
                          const opt = getAddOnOption(id);
                          if (!opt) return null;
                          const price = addOnPrice(template, subId, id);
                          return (
                            <ToggleChip
                              key={id}
                              iconKey={opt.icon}
                              label={opt.label}
                              description={opt.description}
                              selected={cfg.addOns.includes(id)}
                              priceLabel={
                                price ? formatRangeCompact(price) : undefined
                              }
                              onClick={() =>
                                dispatch({
                                  type: "TOGGLE_ADDON",
                                  subEventId: subId,
                                  addOnId: id,
                                })
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Instagram reels
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRangeCompact(reelPrice(template, subId))} / reel
                      </span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {Array.from({ length: maxReels + 1 }).map((_, n) => {
                        const selected = cfg.reels === n;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() =>
                              dispatch({
                                type: "SET_REELS",
                                subEventId: subId,
                                reels: n,
                              })
                            }
                            aria-pressed={selected}
                            className={cn(
                              "flex-1 rounded-lg border py-2 text-sm font-medium transition-all",
                              selected
                                ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                                : "border-border hover:bg-muted/40",
                            )}
                          >
                            {n === 0 ? "None" : n}
                          </button>
                        );
                      })}
                    </div>
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
