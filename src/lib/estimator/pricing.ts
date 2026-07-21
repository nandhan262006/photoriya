import type {
  EstimateBreakdown,
  EventTemplate,
  ID,
  LineItem,
  PriceRange,
} from "./types";
import { getCoverageOption, getAddOnOption } from "./catalog";

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

function subEventName(template: EventTemplate, id: ID): string {
  return template.subEvents.find((s) => s.id === id)?.name ?? id;
}

export function calculateEstimate(
  state: { selectedSubEvents: ID[]; subEventConfig: Record<ID, { coverage: ID[]; addOns: ID[]; reels: number }>; album: { required: boolean; typeId: ID | null; sizeId: ID | null; pages: number; count: number } },
  template: EventTemplate,
): EstimateBreakdown {
  const items: LineItem[] = [];
  let total = 0;
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
        value: price.value,
      });
      total += price.value;
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
        value: price.value,
      });
      total += price.value;
    }

    if (cfg.reels > 0) {
      const price = reelPrice(template, subEventId);
      items.push({
        id: `reels-${subEventId}`,
        group: "Reels",
        label: `${cfg.reels} Instagram reel${cfg.reels > 1 ? "s" : ""}`,
        detail: name,
        value: price.value * cfg.reels,
      });
      total += price.value * cfg.reels;
    }
  }

  // Album
  const albumState = state.album;
  if (albumState.required && albumState.sizeId) {
    const size = template.album.sizes.find((s) => s.id === albumState.sizeId);
    if (size) {
      const perAlbum = albumState.pages * size.multiplier * 600;
      const albumTotal = perAlbum * albumState.count;
      items.push({
        id: "album",
        group: "Albums",
        label: `${albumState.count} album${albumState.count > 1 ? "s" : ""}`,
        detail: `${size.name}, ${albumState.pages} pages each`,
        value: albumTotal,
      });
      total += albumTotal;
    }
  }

  const isEmpty = items.length === 0;

  return {
    items,
    total,
    subEventCount,
    isEmpty,
  };
}

function labelForCoverage(id: ID): string {
  return getCoverageOption(id)?.label ?? id;
}

function labelForAddOn(id: ID): string {
  return getAddOnOption(id)?.label ?? id;
}