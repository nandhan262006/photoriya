"use server";

import { prisma } from "@/lib/prisma";
import { invalidateCache } from "@/lib/estimator/templates";

export async function getTemplates() {
  return prisma.eventTemplate.findMany({
    include: { subEvents: { orderBy: { sortOrder: "asc" } } },
    orderBy: { name: "asc" },
  });
}

export async function getTemplate(id: number) {
  return prisma.eventTemplate.findUnique({
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
  let result;
  if (data.id) {
    result = await prisma.eventTemplate.update({
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
    result = await prisma.eventTemplate.create({
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
  priceOverrides: Record<string, { min: number; max: number }>;
  templateId: number;
}) {
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
    result = await prisma.subEvent.update({ where: { id: data.id }, data: payload });
  } else {
    result = await prisma.subEvent.create({ data: payload });
  }
  invalidateCache();
  return result;
}

export async function deleteSubEvent(id: number) {
  const result = await prisma.subEvent.delete({ where: { id } });
  invalidateCache();
  return result;
}

export async function deleteTemplate(id: number) {
  const result = await prisma.eventTemplate.delete({ where: { id } });
  invalidateCache();
  return result;
}
