import type { PriceRange } from "./types";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  currencyDisplay: "code",
  maximumFractionDigits: 0,
});

/** Format a whole-rupee amount as Indian currency, e.g. INR 1,25,000. */
export function formatINR(amount: number): string {
  return inrFormatter.format(Math.round(amount));
}

/** Format a min/max range; collapses to a single value when min === max. */
export function formatRange(range: PriceRange): string {
  if (range.min === range.max) return formatINR(range.min);
  return `${formatINR(range.min)} \u2013 ${formatINR(range.max)}`;
}

/** Compact label for a range used in tight UI spaces. */
export function formatRangeShort(range: PriceRange): string {
  if (range.min === range.max) return formatINR(range.min);
  return `${formatINR(range.min)} \u2013 ${formatINR(range.max)}`;
}

/** Compact Indian-style amount, e.g. INR 8k, INR 45k, INR 1L, INR 1.5L. */
export function formatINRCompact(amount: number): string {
  const n = Math.round(amount);
  if (n < 1000) return `INR ${n}`;
  if (n < 100000) return `INR ${Math.round(n / 1000)}k`;
  const lakhs = n / 100000;
  const text = lakhs.toFixed(1).replace(/\.0$/, "");
  return `INR ${text}L`;
}

/** Compact range for chip price hints, e.g. INR 8k–INR 15k, INR 45k–INR 1L. */
export function formatRangeCompact(range: PriceRange): string {
  if (range.min === range.max) return formatINRCompact(range.min);
  return `${formatINRCompact(range.min)} \u2013 ${formatINRCompact(range.max)}`;
}
