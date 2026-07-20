"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS } from "@/lib/estimator/state";
import { useEstimator } from "@/lib/estimator/state-provider";

export function StepNav() {
  const { state, dispatch } = useEstimator();

  const goTo = (step: number) => {
    dispatch({ type: "SET_STEP", step });
  };

  return (
    <nav className="flex items-center gap-1 overflow-x-auto pb-1">
      {STEPS.map((label, i) => {
        const isCurrent = state.step === i;
        const isDone = i < state.step;
        return (
          <div key={label} className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 py-1 text-xs transition-colors",
                isCurrent
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? <Check className="size-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="size-3 shrink-0 text-muted-foreground/40" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
