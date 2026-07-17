/**
 * Shared building blocks for event templates: default pricing tables, album
 * defaults, and helpers that emit declarative deliverable / recommendation
 * rules. Templates compose these so per-event files stay focused on what is
 * actually different (sub-events, offered options, overrides).
 */
import type {
  AlbumDefaults,
  DeliverableRule,
  ID,
  PriceRange,
  RecommendationRule,
} from "../types";

export const DEFAULT_MAX_REELS = 3;

export const DEFAULT_COVERAGE_PRICES: Record<ID, PriceRange> = {
  traditional_photography: { min: 8000, max: 15000 },
  traditional_videography: { min: 12000, max: 20000 },
  candid_photography: { min: 25000, max: 45000 },
  cinematic_videography: { min: 35000, max: 60000 },
  drone: { min: 15000, max: 25000 },
};

export const DEFAULT_ADDON_PRICES: Record<ID, PriceRange> = {
  led_screen: { min: 25000, max: 40000 },
  live_streaming: { min: 15000, max: 25000 },
  crane: { min: 20000, max: 35000 },
  booth_360: { min: 18000, max: 30000 },
  instant_prints: { min: 8000, max: 15000 },
  photobooth: { min: 12000, max: 20000 },
  same_day_edit: { min: 20000, max: 35000 },
};

export const DEFAULT_REEL_PRICE: PriceRange = { min: 4000, max: 8000 };

export const ALBUM_DEFAULTS: AlbumDefaults = {
  types: [
    {
      id: "magazine",
      name: "Magazine Album",
      basePrice: { min: 15000, max: 22000 },
      perPagePrice: { min: 120, max: 200 },
    },
    {
      id: "premium",
      name: "Premium Photographic",
      basePrice: { min: 18000, max: 25000 },
      perPagePrice: { min: 150, max: 250 },
    },
    {
      id: "layflat",
      name: "Layflat Album",
      basePrice: { min: 28000, max: 40000 },
      perPagePrice: { min: 300, max: 500 },
    },
    {
      id: "coffee_table",
      name: "Coffee Table Album",
      basePrice: { min: 35000, max: 55000 },
      perPagePrice: { min: 400, max: 700 },
    },
  ],
  sizes: [
    { id: "12x36", name: '12" × 36"', multiplier: 1.0 },
    { id: "15x45", name: '15" × 45"', multiplier: 1.3 },
    { id: "20x60", name: '20" × 60"', multiplier: 1.8 },
    { id: "24x72", name: '24" × 72"', multiplier: 2.4 },
  ],
  basePages: 30,
  maxPages: 120,
  maxAlbums: 10,
};

const COVERAGE_DELIVERABLE_LABELS: Record<ID, string> = {
  traditional_photography: "Traditional photography coverage (edited soft copy)",
  traditional_videography: "Full event traditional video footage",
  candid_photography: "Curated & edited candid photographs (soft copy)",
  cinematic_videography: "Cinematic highlight film + full event film",
  drone: "Aerial drone footage (compiled reel)",
};

const ADDON_DELIVERABLE_LABELS: Record<ID, string> = {
  led_screen: "Live LED screen playback at the venue",
  live_streaming: "Live stream link for remote guests",
  crane: "Cine crane cinematic shots",
  booth_360: "360\u00b0 booth clips for guests",
  instant_prints: "Instant printed photos for guests",
  photobooth: "Photo booth prints with props",
  same_day_edit: "Same-day highlight edit screened at the event",
};

const DELIVERABLE_GROUP_COVERAGE = "Photography & Videography";
const DELIVERABLE_GROUP_ADDONS = "Add-on Services";
const DELIVERABLE_GROUP_EXTRAS = "Reels & Albums";

/** Build the standard deliverable rules for a set of coverage + add-on ids. */
export function deliverableRulesFor(
  coverageIds: ID[],
  addonIds: ID[],
): DeliverableRule[] {
  const rules: DeliverableRule[] = [];

  for (const id of coverageIds) {
    const label = COVERAGE_DELIVERABLE_LABELS[id];
    if (!label) continue;
    rules.push({
      id: `deliv-coverage-${id}`,
      when: { coverage: [id] },
      produce: {
        group: DELIVERABLE_GROUP_COVERAGE,
        label,
        countPerSubEvent: true,
      },
    });
  }

  for (const id of addonIds) {
    const label = ADDON_DELIVERABLE_LABELS[id];
    if (!label) continue;
    rules.push({
      id: `deliv-addon-${id}`,
      when: { addOns: [id] },
      produce: {
        group: DELIVERABLE_GROUP_ADDONS,
        label,
        countPerSubEvent: true,
      },
    });
  }

  rules.push({
    id: "deliv-reels",
    when: { reels: true },
    produce: {
      group: DELIVERABLE_GROUP_EXTRAS,
      label: "Instagram reels",
    },
  });

  rules.push({
    id: "deliv-album",
    when: { album: true },
    produce: {
      group: DELIVERABLE_GROUP_EXTRAS,
      label: "Premium printed album(s)",
    },
  });

  return rules;
}

/**
 * Common smart recommendations used across event types. Each is declarative so
 * it remains serializable for a future CMS-backed template builder.
 */
export function commonRecommendations(): RecommendationRule[] {
  return [
    {
      id: "rec-drone-for-reception",
      suggest: { type: "coverage", id: "drone" },
      message: "Add Drone coverage to your main events for stunning aerial shots.",
      requiresAnySubEvent: ["wedding", "reception", "wedding_day", "main"],
      requiresCoverage: ["cinematic_videography"],
    },
    {
      id: "rec-candid-for-main",
      suggest: { type: "coverage", id: "candid_photography" },
      message: "Add Candid Photography to capture authentic, unposed moments.",
      requiresAnySubEvent: ["wedding", "reception", "wedding_day", "main", "party"],
    },
    {
      id: "rec-same-day-edit",
      suggest: { type: "addon", id: "same_day_edit" },
      message: "A Same-Day Edit screened at the event is a guest favourite.",
      requiresAnySubEvent: ["wedding", "reception", "wedding_day", "main"],
    },
    {
      id: "rec-live-streaming",
      suggest: { type: "addon", id: "live_streaming" },
      message: "Live Streaming lets faraway family join the celebration.",
      requiresAnySubEvent: ["wedding", "reception", "wedding_day", "main"],
    },
  ];
}
