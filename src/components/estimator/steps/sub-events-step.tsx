"use client";

import { Button } from "@/components/ui/button";
import { useEstimator } from "@/lib/estimator/state-provider";
import { ToggleChip } from "../primitives";

export function SubEventsStep() {
  const { state, template, dispatch } = useEstimator();
  if (!template) return null;

  const all = template.subEvents;
  const selectedSet = new Set(state.selectedSubEvents);
  const selectedCount = state.selectedSubEvents.length;
  const allSelected = selectedCount === all.length;

  const toggleAll = () => {
    const targets = allSelected
      ? all.filter((s) => selectedSet.has(s.id))
      : all.filter((s) => !selectedSet.has(s.id));
    targets.forEach((s) =>
      dispatch({ type: "TOGGLE_SUB_EVENT", subEventId: s.id }),
    );
  };

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold">
            Select your sub-events
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose the functions you want covered. You can configure coverage
            for each in the next step.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {selectedCount} selected
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={toggleAll}>
            {allSelected ? "Clear all" : "Select all"}
          </Button>
        </div>
      </header>

      <div className="grid gap-2 sm:grid-cols-2">
        {all.map((s) => (
          <ToggleChip
            key={s.id}
            label={s.name}
            description={s.description}
            selected={selectedSet.has(s.id)}
            onClick={() =>
              dispatch({ type: "TOGGLE_SUB_EVENT", subEventId: s.id })
            }
          />
        ))}
      </div>
    </section>
  );
}
