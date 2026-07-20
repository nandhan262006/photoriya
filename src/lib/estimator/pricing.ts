/**
 * Pure, isomorphic pricing engine.
 *
 * `calculateEstimate` takes the current state and the selected template and
 * returns a fully derived estimate. It has no React and no I/O, so it runs
 * identically in the browser (live panel) and on the server (PDF). This is
 * what guarantees the live total and the downloaded PDF can never disagree.
 */
import type {
  EstimateBreakdown,
  EventTemplate,
  ID,
  LineItem,
  PriceRange,
} from "./types";

function coveragePrice(template: EventTemplate, subEventId: ID, coverageId: ID): PriceRange | undefined {
  const sub = template.subEvents.find((s) => s.id === subEventId);
  const override = sub?.coverage?.[coverageId];
  return override ?? template.defaultCoveragePrices[coverageId];
}

function addOnPrice(template: EventTemplate, subEventId: ID, addOnId: ID): PriceRange | undefined {
  const sub = template.subEvents.find((s) => s.id === subEventId);
  const override = sub?.addOns?.[addOnId];
  return override ?? template.defaultAddOnPrices[addOnId];
}

function reelPrice(template: EventTemplate, subEventId: ID): PriceRange {
  const sub = template.subEvents.find((s) => s.id === subEventId);
  return sub?.reel ?? template.defaultReelPrice;
}

function multiply(range: PriceRange, factor: number): PriceRange {
  return { min: range.min * factor, max: range.max * factor };
}

function add(into: PriceRange, range: PriceRange): void {
  into.min += range.min;
  into.max += range.max;
}

function subEventName(template: EventTemplate, id: ID): string {
  return template.subEvents.find((s) => s.id === id)?.name ?? id;
}

export function calculateEstimate(
  state: { selectedSubEvents: ID[]; subEventConfig: Record<ID, { coverage: ID[]; addOns: ID[]; reels: number }>; album: { required: boolean; typeId: ID | null; sizeId: ID | null; pages: number; count: number } },
  template: EventTemplate,
): EstimateBreakdown {
  const items: LineItem[] = [];
  const subtotal: PriceRange = { min: 0, max: 0 };
  let subEventCount = 0;

  const validCoverage = new Set(template.coverageOptions);
  const validAddOns = new Set(template.addOnOptions);

  for (const subEventId of state.selectedSubEvents) {
    const cfg = state.subEventConfig[subEventId];
    if (!cfg) continue;
    const hasAnything =
      cfg.coverage.length > 0 || cfg.addOns.length > 0 || cfg.reels > 0;
    if (!hasAnything) continue;
    subEventCount += 1;
    const name = subEventName(template, subEventId);

    for (const coverageId of template.coverageOptions) {
      if (!cfg.coverage.includes(coverageId)) continue;
      if (!validCoverage.has(coverageId)) continue;
      const price = coveragePrice(template, subEventId, coverageId);
      if (!price) continue;
      items.push({
        id: `coverage-${subEventId}-${coverageId}`,
        group: "Coverage",
        label: labelForCoverage(coverageId),
        detail: name,
        min: price.min,
        max: price.max,
      });
      add(subtotal, price);
    }

    for (const addOnId of template.addOnOptions) {
      if (!cfg.addOns.includes(addOnId)) continue;
      if (!validAddOns.has(addOnId)) continue;
      const price = addOnPrice(template, subEventId, addOnId);
      if (!price) continue;
      items.push({
        id: `addon-${subEventId}-${addOnId}`,
        group: "Add-on Services",
        label: labelForAddOn(addOnId),
        detail: name,
        min: price.min,
        max: price.max,
      });
      add(subtotal, price);
    }

    if (cfg.reels > 0) {
      const price = multiply(reelPrice(template, subEventId), cfg.reels);
      items.push({
        id: `reels-${subEventId}`,
        group: "Reels",
        label: `${cfg.reels} Instagram reel${cfg.reels > 1 ? "s" : ""}`,
        detail: name,
        min: price.min,
        max: price.max,
      });
      add(subtotal, price);
    }
  }

  // Album
  const albumState = state.album;
  if (albumState.required && albumState.sizeId) {
    const size = template.album.sizes.find((s) => s.id === albumState.sizeId);
    if (size) {
      const pages = albumState.pages;
      const perPage = 600;
      const perAlbum: PriceRange = {
        min: pages * perPage * size.multiplier,
        max: pages * perPage * size.multiplier,
      };
      const total = multiply(perAlbum, albumState.count);
      items.push({
        id: "album",
        group: "Albums",
        label: `${albumState.count} album${albumState.count > 1 ? "s" : ""}`,
        detail: `${size.name}, ${pages} pages each`,
        min: total.min,
        max: total.max,
      });
      add(subtotal, total);
    }
  }

  const isEmpty = items.length === 0;

  return {
    items,
    subtotal,
    total: { min: subtotal.min, max: subtotal.max },
    subEventCount,
    isEmpty,
  };
}

/* Icon-key -> human label mirrors kept here so the engine output is readable
 * without importing the catalog (keeps the engine dependency-free). */
const COVERAGE_LABELS: Record<ID, string> = {
  traditional_photography: "Traditional Photography",
  traditional_videography: "Traditional Videography",
  candid_photography: "Candid Photography",
  cinematic_videography: "Cinematic Videography",
  drone: "Drone",
};

const ADDON_LABELS: Record<ID, string> = {
  led_screen: "LED Screen",
  live_streaming: "Live Streaming",
  crane: "Crane",
  booth_360: "360 Booth",
  instant_prints: "Instant Prints",
  photobooth: "Photo Booth",
  same_day_edit: "Same-Day Edit",
};

function labelForCoverage(id: ID): string {
  return COVERAGE_LABELS[id] ?? id;
}

function labelForAddOn(id: ID): string {
  return ADDON_LABELS[id] ?? id;
}
