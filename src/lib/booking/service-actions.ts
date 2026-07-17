"use server";

import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const duration = parseInt(formData.get("duration") as string);
  const price = formData.get("price") as string;

  if (!name || !duration || !price) {
    return { error: "Missing required fields" };
  }

  await db.insert(services).values({ name, description, duration, price });
  revalidatePath("/admin/services");
  return { success: true };
}

export async function updateService(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const duration = parseInt(formData.get("duration") as string);
  const price = formData.get("price") as string;
  const isActive = formData.get("isActive") === "true";

  await db
    .update(services)
    .set({ name, description, duration, price, isActive })
    .where(eq(services.id, id));

  revalidatePath("/admin/services");
  return { success: true };
}

export async function deleteService(id: number) {
  await db.delete(services).where(eq(services.id, id));
  revalidatePath("/admin/services");
  return { success: true };
}
