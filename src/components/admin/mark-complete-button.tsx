"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { markEstimateComplete } from "@/lib/estimator/lead-actions";

export function MarkCompleteButton({ id, currentStatus }: { id: number; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);

  if (status === "completed") return null;

  async function handleClick() {
    setStatus("completed");
    await markEstimateComplete(id);
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      <Check className="size-3" />
      Mark Complete
    </button>
  );
}
