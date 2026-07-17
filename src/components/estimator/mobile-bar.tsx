"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatRangeShort } from "@/lib/estimator/format";
import { useEstimator } from "@/lib/estimator/state-provider";
import { EstimatePanel } from "./estimate-panel";

export function MobileEstimateBar() {
  const { estimate } = useEstimator();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              Estimated total
            </span>
            <span className="font-heading text-lg font-semibold tabular-nums">
              {estimate.isEmpty ? "\u2014" : formatRangeShort(estimate.total)}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setOpen(true)}
            disabled={estimate.isEmpty}
          >
            Breakdown
            <ChevronUp />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Your Estimate</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            <EstimatePanel />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
