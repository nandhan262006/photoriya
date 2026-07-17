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
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-500"
          onClick={() => setExpanded(false)}
        />
      )}

      <div
        className="fixed z-50 transition-all duration-500 ease-out"
        style={
          expanded
            ? {
                top: "1rem",
                left: "0.5rem",
                right: "0.5rem",
                maxHeight: "calc(100dvh - 2rem)",
                width: "auto",
                transform: "rotateY(0deg) rotateZ(0deg) translateX(0)",
              }
            : {
                top: "50%",
                left: "0",
                width: "6.5rem",
                transform:
                  "translateY(-50%) rotateY(20deg) rotateZ(-2deg) translateX(-8px)",
                transformOrigin: "left center",
              }
        }
      >
        <div
          className="flex flex-col overflow-hidden rounded-r-xl rounded-l-sm bg-white text-black shadow-2xl transition-all duration-500"
          style={
            expanded
              ? {
                  maxHeight: "calc(100dvh - 2rem)",
                  overflowY: "auto",
                  borderRadius: "1rem",
                }
              : {
                  cursor: "pointer",
                  boxShadow:
                    "6px 8px 24px rgba(0,0,0,0.22), 2px 2px 0 rgba(0,0,0,0.04) inset",
                }
          }
          onClick={() => !expanded && setExpanded(true)}
        >
          {!expanded ? (
            <button
              type="button"
              className="flex flex-col items-center gap-1 px-2.5 pt-3 pb-3 active:scale-95 transition-transform"
            >
              <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400">
                EST
              </span>
              <span className="font-heading text-[11px] font-bold tabular-nums leading-tight text-center">
                {total}
              </span>
              {eventName && (
                <span className="text-[8px] text-neutral-400 truncate max-w-full">
                  {eventName}
                </span>
              )}
              <div className="mt-0.5 flex size-4 items-center justify-center rounded-full bg-neutral-100">
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-neutral-400"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>
          ) : (
            <div className="flex flex-col">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-3.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Your Estimate
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(false);
                  }}
                  className="flex size-7 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200"
                  aria-label="Close"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <div className="flex flex-col gap-4 p-5">
                <div className="rounded-xl bg-neutral-50 p-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                    Estimated total
                  </span>
                  <div className="font-heading text-2xl font-bold tabular-nums mt-1">
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
