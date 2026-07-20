import type { EventTemplate, ID, PriceRange } from "../types";
import { prisma } from "@/lib/prisma";

const ALBUM_DEFAULTS = {
  types: [
    { id: "magazine", name: "Magazine Album", basePrice: { min: 15000, max: 22000 }, perPagePrice: { min: 120, max: 200 } },
    { id: "premium", name: "Premium Photographic", basePrice: { min: 18000, max: 25000 }, perPagePrice: { min: 150, max: 250 } },
    { id: "layflat", name: "Layflat Album", basePrice: { min: 28000, max: 40000 }, perPagePrice: { min: 300, max: 500 } },
    { id: "coffee_table", name: "Coffee Table Album", basePrice: { min: 35000, max: 55000 }, perPagePrice: { min: 400, max: 700 } },
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
  traditional_photography: { min: 8000, max: 15000 },
  traditional_videography: { min: 12000, max: 20000 },
  candid_photography: { min: 25000, max: 45000 },
  cinematic_videography: { min: 35000, max: 60000 },
  drone: { min: 15000, max: 25000 },
};

const DEFAULT_ADDON_PRICES: Record<ID, PriceRange> = {
  led_screen: { min: 25000, max: 40000 },
  live_streaming: { min: 15000, max: 25000 },
  crane: { min: 20000, max: 35000 },
  booth_360: { min: 18000, max: 30000 },
  instant_prints: { min: 8000, max: 15000 },
  photobooth: { min: 12000, max: 20000 },
  same_day_edit: { min: 20000, max: 35000 },
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

      return {
        id: t.typeId,
        name: t.name,
        tagline: t.tagline || undefined,
        description: t.description || undefined,
        icon: t.icon,
        coverageOptions,
        addOnOptions,
        defaultCoveragePrices: DEFAULT_COVERAGE_PRICES,
        defaultAddOnPrices: DEFAULT_ADDON_PRICES,
        defaultReelPrice: { min: t.defaultReelMin, max: t.defaultReelMax },
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
        deliverableRules: [],
        recommendationRules: [],
      };
    });
  } catch {
    return [];
  }
}

function safeJson<T>(val: string): T | null {
  try { return JSON.parse(val) as T; } catch { return null; }
}

let cachedDbTemplates: EventTemplate[] | null = null;

export async function loadTemplates(): Promise<EventTemplate[]> {
  if (!cachedDbTemplates) {
    cachedDbTemplates = await loadDbTemplates();
  }
  return cachedDbTemplates;
}

export async function loadTemplate(id: ID | null): Promise<EventTemplate | null> {
  if (!id) return null;
  const all = await loadTemplates();
  return all.find((t) => t.id === id) ?? null;
}

export function invalidateCache() {
  cachedDbTemplates = null;
}
