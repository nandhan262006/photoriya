import type { EventTemplate, ID, PriceRange } from "../types";
import { db } from "@/lib/db";
import { eventTemplate, subEvent } from "@/lib/db/schema";
import { eq, asc, and } from "drizzle-orm";
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

const HARDCODED_TEMPLATES: EventTemplate[] = [
  weddingTemplate,
  birthdayTemplate,
  halfSareeTemplate,
  babyShowerTemplate,
  housewarmingTemplate,
  anniversaryTemplate,
  corporateTemplate,
];

async function loadDbTemplates(): Promise<EventTemplate[]> {
  try {
    if (!db) return [];
    const dbTemplates = await db.select().from(eventTemplate).where(eq(eventTemplate.isActive, 1));
    if (!dbTemplates.length) return [];

    const allSubEvents = await db.select().from(subEvent).orderBy(asc(subEvent.sortOrder));

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

      const templateSubEvents = allSubEvents.filter((se) => se.templateId === t.id);

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
        defaultReelPrice: { value: t.defaultReelPrice },
        defaultMaxReels: t.defaultMaxReels,
        subEvents: templateSubEvents.map((se) => {
          const overrides: Record<string, unknown> = safeJson<Record<string, unknown>>(se.priceOverrides) ?? {};
          return {
            id: se.subEventId,
            name: se.name,
            description: se.description || undefined,
            defaultSelected: Boolean(se.defaultSelected),
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
