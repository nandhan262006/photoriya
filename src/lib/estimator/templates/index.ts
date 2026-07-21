import type { EventTemplate, ID, PriceRange } from "../types";
import { prisma } from "@/lib/prisma";
import {
  deliverableRulesFor,
  commonRecommendations,
  ALBUM_DEFAULTS,
  DEFAULT_COVERAGE_PRICES,
  DEFAULT_ADDON_PRICES,
} from "./shared";
import { weddingTemplate } from "./wedding";
import {
  birthdayTemplate,
  halfSareeTemplate,
  babyShowerTemplate,
  housewarmingTemplate,
  anniversaryTemplate,
  corporateTemplate,
} from "./other-events";

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