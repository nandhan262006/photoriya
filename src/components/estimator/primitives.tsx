"use client";

import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Icon } from "./icons";

interface ToggleChipProps {
  selected: boolean;
  onClick: () => void;
  iconKey?: string;
  label: string;
  description?: string;
  priceLabel?: string;
  className?: string;
}

export function ToggleChip({
  selected,
  onClick,
  iconKey,
  label,
  description,
  priceLabel,
  className,
}: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-2.5 text-left text-sm transition-all",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-foreground/30 hover:bg-muted/40",
        className,
      )}
    >
      {iconKey && (
        <Icon
          name={iconKey}
          className={cn(
            "size-4 shrink-0",
            selected ? "text-primary" : "text-muted-foreground",
          )}
        />
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{label}</span>
        {description && (
          <span className="line-clamp-2 text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      {selected ? (
        <Check className="size-4 shrink-0 text-primary" />
      ) : priceLabel ? (
        <span className="shrink-0 whitespace-nowrap text-right text-xs font-medium text-muted-foreground">
          {priceLabel}
        </span>
      ) : null}
    </button>
  );
}

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
  ariaLabel?: string;
}

export function Stepper({
  value,
  min,
  max,
  onChange,
  suffix,
  ariaLabel,
}: StepperProps) {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-input"
      role="group"
      aria-label={ariaLabel}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease"
      >
        <Minus />
      </Button>
      <span className="w-10 text-center text-sm font-medium tabular-nums">
        {value}
        {suffix}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase"
      >
        <Plus />
      </Button>
    </div>
  );
}
