import type { EventTemplate, ID, PriceRange } from "../types";
import {
  anniversaryTemplate,
  babyShowerTemplate,
  birthdayTemplate,
  halfSareeTemplate,
  housewarmingTemplate,
} from "./other-events";
import { weddingTemplate } from "./wedding";
import { prisma } from "@/lib/prisma";

const FILE_TEMPLATES: EventTemplate[] = [
  weddingTemplate,
  birthdayTemplate,
  halfSareeTemplate,
  babyShowerTemplate,
  housewarmingTemplate,
  anniversaryTemplate,
];

async function loadDbTemplates(): Promise<EventTemplate[]> {
  try {
    const dbTemplates = await prisma.eventTemplate.findMany({
      where: { isActive: true },
      include: { subEvents: { orderBy: { sortOrder: "asc" } } },
    });
    if (!dbTemplates.length) return [];

    return dbTemplates.map((t) => {
      const fileTmpl = FILE_TEMPLATES.find((f) => f.id === t.typeId);
      const coverageOptions: ID[] = safeJson<ID[]>(t.coverageOptions) ?? [];
      const addOnOptions: ID[] = safeJson<ID[]>(t.addOnOptions) ?? [];

      return {
        id: t.typeId,
        name: t.name,
        tagline: t.tagline || fileTmpl?.tagline,
        description: t.description || fileTmpl?.description,
        icon: t.icon,
        coverageOptions: coverageOptions.length ? coverageOptions : (fileTmpl?.coverageOptions ?? []),
        addOnOptions: addOnOptions.length ? addOnOptions : (fileTmpl?.addOnOptions ?? []),
        defaultCoveragePrices: fileTmpl?.defaultCoveragePrices ?? {},
        defaultAddOnPrices: fileTmpl?.defaultAddOnPrices ?? {},
        defaultReelPrice: { min: t.defaultReelMin, max: t.defaultReelMax },
        defaultMaxReels: t.defaultMaxReels,
        subEvents: t.subEvents.map((se) => {
          const fileSe = fileTmpl?.subEvents.find((f) => f.id === se.subEventId);
          const overrides: Record<string, unknown> = safeJson<Record<string, unknown>>(se.priceOverrides) ?? {};
          return {
            id: se.subEventId,
            name: se.name,
            description: se.description || fileSe?.description,
            defaultSelected: se.defaultSelected,
            maxReels: se.maxReels ?? undefined,
            coverage: overrides.coverage as unknown as Partial<Record<ID, PriceRange>> | undefined,
            addOns: overrides.addOns as unknown as Partial<Record<ID, PriceRange>> | undefined,
            reel: overrides.reel as unknown as PriceRange | undefined,
          };
        }),
        album: fileTmpl?.album ?? { types: [], sizes: [], basePages: 30, maxPages: 120, maxAlbums: 10 },
        deliverableRules: fileTmpl?.deliverableRules ?? [],
        recommendationRules: fileTmpl?.recommendationRules ?? [],
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
  if (cachedDbTemplates.length > 0) return cachedDbTemplates;
  return FILE_TEMPLATES;
}

export async function loadTemplate(id: ID | null): Promise<EventTemplate | null> {
  if (!id) return null;
  const all = await loadTemplates();
  return all.find((t) => t.id === id) ?? null;
}

export function invalidateCache() {
  cachedDbTemplates = null;
}
