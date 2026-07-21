"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteEstimateLead } from "@/lib/estimator/lead-actions";

export function DeleteEstimateButton({ id }: { id: number }) {
  const [deleted, setDeleted] = useState(false);

  if (deleted) return null;

  async function handleClick() {
    setDeleted(true);
    await deleteEstimateLead(id);
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
    >
      <Trash2 className="size-3" />
      Delete
    </button>
  );
}
