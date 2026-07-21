"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

function getDb() {
  if (!prisma) throw new Error("Database not configured");
  return prisma;
}

export async function getTemplates() {
  await requireAdmin();
  const db = getDb();
  return db.eventTemplate.findMany({
    include: { subEvents: { orderBy: { sortOrder: "asc" } } },
    orderBy: { name: "asc" },
  });
}

export async function getTemplate(id: number) {
  await requireAdmin();
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
  defaultPrices?: string;
}) {
  await requireAdmin();
  const db = getDb();
  const payload: Record<string, unknown> = {
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
  };
  if (data.defaultPrices !== undefined) {
    payload.defaultPrices = data.defaultPrices;
  }
  let result;
  if (data.id) {
    result = await db.eventTemplate.update({ where: { id: data.id }, data: payload });
  } else {
    result = await db.eventTemplate.create({ data: payload as never });
  }
  revalidatePath("/admin/templates");
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
  await requireAdmin();
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
  revalidatePath("/admin/templates");
  return result;
}

export async function deleteSubEvent(id: number) {
  await requireAdmin();
  const db = getDb();
  const result = await db.subEvent.delete({ where: { id } });
  revalidatePath("/admin/templates");
  return result;
}

export async function deleteTemplate(id: number) {
  await requireAdmin();
  const db = getDb();
  const result = await db.eventTemplate.delete({ where: { id } });
  revalidatePath("/admin/templates");
  return result;
}
