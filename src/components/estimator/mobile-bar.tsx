"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { formatRangeShort } from "@/lib/estimator/format";
import { useEstimator } from "@/lib/estimator/state-provider";
import { EstimatePanel } from "./estimate-panel";

export function MobileEstimateBar() {
  const { estimate } = useEstimator();
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const total = estimate.isEmpty ? "\u2014" : formatRangeShort(estimate.total);

  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);

  return (
    <div className="lg:hidden" style={{ perspective: "1200px" }}>
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
        />
      )}

      <div
        ref={cardRef}
        className={[
          "fixed z-50 transition-all duration-500 ease-out",
          expanded
            ? "inset-4 top-12 rounded-2xl overflow-y-auto bg-card border shadow-2xl p-5"
            : "left-0 bottom-24 w-auto",
        ].join(" ")}
        style={
          expanded
            ? { transform: "rotateY(0deg) translateX(0)" }
            : {
                transform: `rotateY(18deg) translateX(-10px)`,
                transformOrigin: "left center",
              }
        }
      >
        {!expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="View estimate breakdown"
            className="flex items-center gap-2 rounded-r-2xl border border-l-0 bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur transition-transform active:scale-95"
            style={{ boxShadow: "4px 4px 20px rgba(0,0,0,0.15)" }}
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Estimate
              </span>
              <span className="font-heading text-sm font-semibold tabular-nums leading-tight">
                {total}
              </span>
            </div>
            <div className="flex size-5 items-center justify-center rounded-full bg-primary/10">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="text-primary"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Your Estimate
              </span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="flex size-7 items-center justify-center rounded-full bg-muted hover:bg-muted/80"
                aria-label="Close estimate"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-primary/5 p-4">
                <span className="text-xs text-muted-foreground">
                  Estimated total
                </span>
                <div className="font-heading text-2xl font-semibold tabular-nums">
                  {total}
                </div>
              </div>
              <EstimatePanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
