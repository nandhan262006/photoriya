"use server";

import { prisma } from "@/lib/prisma";
import { invalidateCache } from "@/lib/estimator/templates";

function getDb() {
  if (!prisma) throw new Error("Database not configured");
  return prisma;
}

export async function getTemplates() {
  const db = getDb();
  return db.eventTemplate.findMany({
    include: { subEvents: { orderBy: { sortOrder: "asc" } } },
    orderBy: { name: "asc" },
  });
}

export async function getTemplate(id: number) {
  const db = getDb();
  return db.eventTemplate.findUnique({
    where: { id },
    include: { subEvents: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function upsertTemplate(data: {
  id?: number;
  typeId: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  isActive: boolean;
  defaultMaxReels: number;
  defaultReelMin: number;
  defaultReelMax: number;
  coverageOptions: string[];
  addOnOptions: string[];
}) {
  const db = getDb();
  let result;
  if (data.id) {
    result = await db.eventTemplate.update({
      where: { id: data.id },
      data: {
        typeId: data.typeId,
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        icon: data.icon,
        isActive: data.isActive,
        defaultMaxReels: data.defaultMaxReels,
        defaultReelMin: data.defaultReelMin,
        defaultReelMax: data.defaultReelMax,
        coverageOptions: JSON.stringify(data.coverageOptions),
        addOnOptions: JSON.stringify(data.addOnOptions),
      },
    });
  } else {
    result = await db.eventTemplate.create({
      data: {
        typeId: data.typeId,
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        icon: data.icon,
        isActive: data.isActive,
        defaultMaxReels: data.defaultMaxReels,
        defaultReelMin: data.defaultReelMin,
        defaultReelMax: data.defaultReelMax,
        coverageOptions: JSON.stringify(data.coverageOptions),
        addOnOptions: JSON.stringify(data.addOnOptions),
      },
    });
  }
  invalidateCache();
  return result;
}

export async function upsertSubEvent(data: {
  id?: number;
  subEventId: string;
  name: string;
  description: string;
  defaultSelected: boolean;
  maxReels: number | null;
  sortOrder: number;
  priceOverrides: Record<string, unknown>;
  templateId: number;
}) {
  const db = getDb();
  const payload = {
    subEventId: data.subEventId,
    name: data.name,
    description: data.description,
    defaultSelected: data.defaultSelected,
    maxReels: data.maxReels,
    sortOrder: data.sortOrder,
    priceOverrides: JSON.stringify(data.priceOverrides),
    templateId: data.templateId,
  };
  let result;
  if (data.id) {
    result = await db.subEvent.update({ where: { id: data.id }, data: payload });
  } else {
    result = await db.subEvent.create({ data: payload });
  }
  invalidateCache();
  return result;
}

export async function deleteSubEvent(id: number) {
  const db = getDb();
  const result = await db.subEvent.delete({ where: { id } });
  invalidateCache();
  return result;
}

export async function deleteTemplate(id: number) {
  const db = getDb();
  const result = await db.eventTemplate.delete({ where: { id } });
  invalidateCache();
  return result;
}
