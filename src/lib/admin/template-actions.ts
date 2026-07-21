"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, getDb } from "@/lib/db-utils";
import { eventTemplate, subEvent } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getTemplates() {
  await requireAdmin();
  const db = getDb();
  try {
    const templates = await db.select().from(eventTemplate).orderBy(asc(eventTemplate.name));
    const subEvents = await db.select().from(subEvent).orderBy(asc(subEvent.sortOrder));
    return templates.map((t) => ({
      ...t,
      subEvents: subEvents.filter((se) => se.templateId === t.id),
    }));
  } catch {
    return [];
  }
}

export async function getTemplate(id: number) {
  await requireAdmin();
  const db = getDb();
  const t = await db.select().from(eventTemplate).where(eq(eventTemplate.id, id)).then((r) => r[0] ?? null);
  if (!t) return null;
  const subEvents = await db.select().from(subEvent).where(eq(subEvent.templateId, id)).orderBy(asc(subEvent.sortOrder));
  return { ...t, subEvents };
}

export async function upsertTemplate(data: {
  id?: number;
  typeId: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  isActive: number;
  defaultMaxReels: number;
  defaultReelPrice: number;
  coverageOptions: string[];
  addOnOptions: string[];
  defaultPrices?: string;
}) {
  await requireAdmin();
  const db = getDb();
  const payload = {
    typeId: data.typeId,
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    icon: data.icon,
    isActive: data.isActive ? 1 : 0,
    defaultMaxReels: data.defaultMaxReels,
    defaultReelPrice: data.defaultReelPrice,
    coverageOptions: JSON.stringify(data.coverageOptions),
    addOnOptions: JSON.stringify(data.addOnOptions),
    defaultPrices: data.defaultPrices ?? "{}",
  };
  let result;
  if (data.id) {
    result = await db.update(eventTemplate).set(payload).where(eq(eventTemplate.id, data.id));
  } else {
    result = await db.insert(eventTemplate).values(payload);
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
    defaultSelected: data.defaultSelected ? 1 : 0,
    maxReels: data.maxReels,
    sortOrder: data.sortOrder,
    priceOverrides: JSON.stringify(data.priceOverrides),
    templateId: data.templateId,
  };
  let result;
  if (data.id) {
    result = await db.update(subEvent).set(payload).where(eq(subEvent.id, data.id));
  } else {
    result = await db.insert(subEvent).values(payload);
  }
  revalidatePath("/admin/templates");
  return result;
}

export async function deleteSubEvent(id: number) {
  await requireAdmin();
  const db = getDb();
  const result = await db.delete(subEvent).where(eq(subEvent.id, id));
  revalidatePath("/admin/templates");
  return result;
}

export async function deleteTemplate(id: number) {
  await requireAdmin();
  const db = getDb();
  const result = await db.delete(eventTemplate).where(eq(eventTemplate.id, id));
  revalidatePath("/admin/templates");
  return result;
}
