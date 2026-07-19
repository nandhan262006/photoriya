"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Receipt } from "lucide-react";
import { formatRangeShort } from "@/lib/estimator/format";
import { useEstimator } from "@/lib/estimator/state-provider";
import { EstimatePanel } from "./estimate-panel";

export function MobileEstimateBar() {
  const { estimate, template } = useEstimator();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const total = estimate.isEmpty ? null : estimate.total;
  const eventName = template?.name ?? "";

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 250);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="lg:hidden">
      {/* Floating trigger */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed top-16 right-4 z-50 flex items-center gap-2 rounded-full border bg-background px-4 py-3 shadow-lg"
        >
          <Receipt className="size-4 text-muted-foreground" />
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] text-muted-foreground">Estimate</span>
            {total ? (
              <span className="text-sm font-semibold tabular-nums">
                {formatRangeShort(total)}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
          {eventName && (
            <span className="text-[10px] text-muted-foreground max-w-[80px] truncate">
              {eventName}
            </span>
          )}
        </button>
      )}

      {/* Overlay */}
      {open && (
        <div
          className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-250 ${closing ? "opacity-0" : "opacity-100"}`}
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      {open && (
        <div
          className={`fixed inset-y-0 right-0 z-50 flex w-[min(85vw,400px)] flex-col bg-background shadow-2xl transition-transform duration-250 ease-out ${closing ? "translate-x-full" : "translate-x-0"}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Receipt className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Your Estimate</span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <EstimatePanel />
          </div>

          {/* Footer */}
          {total && (
            <div className="border-t px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Estimated Total</span>
                <span className="text-lg font-semibold tabular-nums">
                  {formatRangeShort(total)}
                </span>
              </div>
              <button
                type="button"
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Book Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
