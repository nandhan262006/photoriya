import type { EventTemplate, ID, PriceRange } from "../types";
import { prisma } from "@/lib/prisma";
import { deliverableRulesFor, commonRecommendations } from "./shared";
import { weddingTemplate } from "./wedding";
import {
  birthdayTemplate,
  halfSareeTemplate,
  babyShowerTemplate,
  housewarmingTemplate,
  anniversaryTemplate,
  corporateTemplate,
} from "./other-events";

const ALBUM_DEFAULTS = {
  types: [
    { id: "magazine", name: "Magazine Album", basePrice: { value: 18000 }, perPagePrice: { value: 150 } },
    { id: "premium", name: "Premium Photographic", basePrice: { value: 22000 }, perPagePrice: { value: 200 } },
    { id: "layflat", name: "Layflat Album", basePrice: { value: 32000 }, perPagePrice: { value: 400 } },
    { id: "coffee_table", name: "Coffee Table Album", basePrice: { value: 45000 }, perPagePrice: { value: 550 } },
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

const DEFAULT_COVERAGE_PRICES: Record<ID, PriceRange> = {
  traditional_photography: { value: 12000 },
  traditional_videography: { value: 16000 },
  candid_photography: { value: 35000 },
  cinematic_videography: { value: 45000 },
  drone: { value: 20000 },
};

const DEFAULT_ADDON_PRICES: Record<ID, PriceRange> = {
  led_screen: { value: 25000 },
  live_streaming: { value: 15000 },
  ai_gallery: { value: 25000 },
  instant_teaser: { value: 20000 },
};

async function loadDbTemplates(): Promise<EventTemplate[]> {
  try {
    const db = prisma;
    if (!db) return [];
    const dbTemplates = await db.eventTemplate.findMany({
      where: { isActive: true },
      include: { subEvents: { orderBy: { sortOrder: "asc" } } },
    });
    if (!dbTemplates.length) return [];

    return dbTemplates.map((t) => {
      const coverageOptions: ID[] = safeJson<ID[]>(t.coverageOptions) ?? [];
      const addOnOptions: ID[] = safeJson<ID[]>(t.addOnOptions) ?? [];
      const defaultPrices: Record<string, Record<string, number>> = safeJson(t.defaultPrices) ?? {};

      function toPriceRange(map: Record<string, number> | undefined): Record<ID, PriceRange> {
        const result: Record<ID, PriceRange> = {};
        if (!map) return result;
        for (const [key, val] of Object.entries(map)) {
          result[key] = { value: val };
        }
        return result;
      }

      return {
        id: t.typeId,
        name: t.name,
        tagline: t.tagline || undefined,
        description: t.description || undefined,
        icon: t.icon,
        coverageOptions,
        addOnOptions,
        defaultCoveragePrices: Object.keys(toPriceRange(defaultPrices.coverage)).length
          ? toPriceRange(defaultPrices.coverage)
          : DEFAULT_COVERAGE_PRICES,
        defaultAddOnPrices: Object.keys(toPriceRange(defaultPrices.addOns)).length
          ? toPriceRange(defaultPrices.addOns)
          : DEFAULT_ADDON_PRICES,
        defaultReelPrice: { value: Math.round((t.defaultReelMin + t.defaultReelMax) / 2) },
        defaultMaxReels: t.defaultMaxReels,
        subEvents: t.subEvents.map((se) => {
          const overrides: Record<string, unknown> = safeJson<Record<string, unknown>>(se.priceOverrides) ?? {};
          return {
            id: se.subEventId,
            name: se.name,
            description: se.description || undefined,
            defaultSelected: se.defaultSelected,
            maxReels: se.maxReels ?? undefined,
            coverage: overrides.coverage as unknown as Partial<Record<ID, PriceRange>> | undefined,
            addOns: overrides.addOns as unknown as Partial<Record<ID, PriceRange>> | undefined,
            reel: overrides.reel as unknown as PriceRange | undefined,
          };
        }),
        album: ALBUM_DEFAULTS,
        deliverableRules: deliverableRulesFor(coverageOptions, addOnOptions),
        recommendationRules: commonRecommendations(),
      };
    });
  } catch {
    return [];
  }
}

function safeJson<T>(val: string): T | null {
  try { return JSON.parse(val) as T; } catch { return null; }
}

const HARDCODED_TEMPLATES: EventTemplate[] = [
  weddingTemplate,
  birthdayTemplate,
  halfSareeTemplate,
  babyShowerTemplate,
  housewarmingTemplate,
  anniversaryTemplate,
  corporateTemplate,
];

export async function loadTemplates(): Promise<EventTemplate[]> {
  const dbTemplates = await loadDbTemplates();
  if (dbTemplates.length > 0) return dbTemplates;
  return HARDCODED_TEMPLATES;
}

export async function loadTemplate(id: ID | null): Promise<EventTemplate | null> {
  if (!id) return null;
  const all = await loadTemplates();
  return all.find((t) => t.id === id) ?? null;
}