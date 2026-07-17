"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { defaultSubEventsFor } from "@/lib/estimator/state";
import { useEstimator } from "@/lib/estimator/state-provider";
import { Icon } from "../icons";

export function EventTypeStep() {
  const { templates, state, dispatch } = useEstimator();

  const select = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    dispatch({
      type: "SET_EVENT_TYPE",
      eventTypeId: id,
      defaultSubEvents: defaultSubEventsFor(template),
      albumBasePages: template.album.basePages,
    });
    dispatch({ type: "SET_STEP", step: 1 });
  };

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">
          What are you celebrating?
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick an event type to load the relevant package template.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {templates.map((t) => {
          const selected = state.eventTypeId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => select(t.id)}
              aria-pressed={selected}
              className={cn(
                "relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all",
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-foreground/30 hover:shadow-sm",
              )}
            >
              {selected && (
                <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3.5" />
                </span>
              )}
              <Icon
                name={t.icon}
                className={cn(
                  "size-6",
                  selected ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="font-heading text-base font-medium leading-tight">
                {t.name}
              </span>
              {t.tagline && (
                <span className="text-xs text-muted-foreground">
                  {t.tagline}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
