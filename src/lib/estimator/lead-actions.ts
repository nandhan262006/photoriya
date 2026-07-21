"use server";

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

export async function saveEstimateLead(data: {
  clientName: string;
  clientPhone: string;
  eventType: string;
  eventName: string;
  estimateData: string;
}) {
  const db = getDb();
  try {
    await db.$executeRaw`INSERT INTO EstimateLead (clientName, clientPhone, eventType, eventName, estimateData, createdAt) VALUES (${data.clientName}, ${data.clientPhone}, ${data.eventType}, ${data.eventName}, ${data.estimateData}, datetime('now'))`;
    return { success: true };
  } catch (e) {
    console.error("Failed to save estimate lead:", e);
    return { success: false };
  }
}

interface EstimateLeadRow {
  id: number;
  clientName: string;
  clientPhone: string;
  eventType: string;
  eventName: string;
  estimateData: string;
  createdAt: string;
}

export async function getEstimateLeads() {
  await requireAdmin();
  const db = getDb();
  try {
    return await db.$queryRaw<EstimateLeadRow[]>`SELECT * FROM EstimateLead ORDER BY createdAt DESC`;
  } catch (e) {
    console.error("Failed to fetch estimate leads:", e);
    return [];
  }
}