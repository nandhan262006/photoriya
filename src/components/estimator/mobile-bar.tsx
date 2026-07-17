"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { formatRangeShort } from "@/lib/estimator/format";
import { useEstimator } from "@/lib/estimator/state-provider";
import { EstimatePanel } from "./estimate-panel";

export function MobileEstimateBar() {
  const { estimate, template } = useEstimator();
  const [expanded, setExpanded] = useState(false);
  const total = estimate.isEmpty ? "\u2014" : formatRangeShort(estimate.total);
  const eventName = template?.name ?? "";

  useEffect(() => {
    document.body.style.overflow = expanded ? "hidden" : "";
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
        className={[
          "fixed z-50 transition-all duration-500 ease-out",
          expanded
            ? "inset-0 flex items-center justify-center p-4"
            : "left-0 bottom-16",
        ].join(" ")}
      >
        <div
          className={[
            "relative flex flex-col overflow-hidden rounded-sm bg-white text-black shadow-2xl",
            "transition-all duration-500 ease-out",
            expanded
              ? "w-full max-w-xs max-h-[85vh] rotate-0 overflow-y-auto"
              : "w-28 cursor-pointer active:scale-95",
          ].join(" ")}
          style={
            expanded
              ? {}
              : {
                  transform: "rotateY(22deg) rotateZ(-3deg) translateX(-6px)",
                  transformOrigin: "left center",
                  boxShadow:
                    "6px 8px 24px rgba(0,0,0,0.25), 2px 2px 0 rgba(0,0,0,0.05) inset",
                }
          }
          onClick={() => !expanded && setExpanded(true)}
        >
          {!expanded && (
            <div className="flex flex-col items-center gap-1 px-2 pt-2 pb-2.5">
              <span className="text-[9px] font-medium uppercase tracking-wider text-neutral-400">
                Estimate
              </span>
              <span className="font-heading text-xs font-bold tabular-nums leading-tight text-center">
                {total}
              </span>
              {eventName && (
                <span className="text-[9px] text-neutral-400 truncate max-w-full">
                  {eventName}
                </span>
              )}
              <div className="mt-0.5 h-0.5 w-8 rounded-full bg-neutral-200" />
            </div>
          )}

          {expanded && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Your Estimate
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(false);
                  }}
                  className="flex size-6 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200"
                  aria-label="Close"
                >
                  <X className="size-3" />
                </button>
              </div>
              <div className="flex flex-col gap-4 p-4">
                <div className="rounded-lg bg-neutral-50 p-4">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                    Estimated total
                  </span>
                  <div className="font-heading text-2xl font-bold tabular-nums mt-0.5">
                    {total}
                  </div>
                  {eventName && (
                    <span className="text-xs text-neutral-400 mt-1 block">
                      {eventName}
                    </span>
                  )}
                </div>
                <EstimatePanel />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
