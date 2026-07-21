"use client";

import { ReceiptIndianRupee, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/estimator/format";
import { useEstimator } from "@/lib/estimator/state-provider";

const GROUP_ORDER = ["Coverage", "Add-on Services", "Reels", "Albums"];

export function EstimatePanel({ compact = false }: { compact?: boolean }) {
  const { estimate, recommendations, dispatch } = useEstimator();

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: estimate.items.filter((i) => i.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ReceiptIndianRupee className="size-4 text-muted-foreground" />
          <h2 className="font-heading text-base font-medium">Live estimate</h2>
        </div>
        {estimate.subEventCount > 0 && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {estimate.subEventCount} sub-event
            {estimate.subEventCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {!estimate.isEmpty && recommendations.length > 0 && (
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_STEP", step: 7 })}
          className="flex items-center gap-1.5 self-start rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
        >
          <Sparkles className="size-3.5" />
          {recommendations.length} smart suggestion
          {recommendations.length > 1 ? "s" : ""}
        </button>
      )}

      <div className="rounded-xl bg-muted/40 p-4">
        {estimate.isEmpty ? (
          <p className="text-sm text-muted-foreground">
            Select an event and add coverage to see your estimated price range.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Estimated total (approx.)
            </span>
            <span className="font-heading text-xl font-semibold tabular-nums sm:text-2xl">
              {formatINR(estimate.total)}
            </span>
          </div>
        )}
      </div>

      {!compact && grouped.length > 0 && (
        <>
          <Separator />
          <div className="flex max-h-[44vh] flex-col gap-3 overflow-y-auto pr-1">
            {grouped.map((g) => (
              <div key={g.group} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {g.group}
                </span>
                {g.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{item.label}</span>
                      {item.detail && (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.detail}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {formatINR(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
