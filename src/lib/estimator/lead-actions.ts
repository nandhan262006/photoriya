"use server";

import { requireAdmin, getDb } from "@/lib/db-utils";
import { estimateLead } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";

export async function saveEstimateLead(data: {
  clientName: string;
  clientPhone: string;
  eventType: string;
  eventName: string;
  estimateData: string;
}) {
  const db = getDb();
  try {
    await db.insert(estimateLead).values({
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      eventType: data.eventType,
      eventName: data.eventName,
      estimateData: data.estimateData,
    });
    return { success: true };
  } catch (e) {
    console.error("Failed to save estimate lead:", e);
    return { success: false };
  }
}

export async function getEstimateLeads() {
  await requireAdmin();
  const db = getDb();
  try {
    return await db.select().from(estimateLead).orderBy(desc(estimateLead.createdAt));
  } catch (e) {
    console.error("Failed to fetch estimate leads:", e);
    return [];
  }
}
