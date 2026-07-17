"use server";

import { db } from "@/db";
import { photographers, timeSlots } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createPhotographer(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const bio = formData.get("bio") as string;

  if (!name || !email) {
    return { error: "Name and email are required" };
  }

  await db.insert(photographers).values({ name, email, phone, bio });
  revalidatePath("/admin/photographers");
  return { success: true };
}

export async function deletePhotographer(id: number) {
  await db.delete(timeSlots).where(eq(timeSlots.photographerId, id));
  await db.delete(photographers).where(eq(photographers.id, id));
  revalidatePath("/admin/photographers");
  return { success: true };
}
