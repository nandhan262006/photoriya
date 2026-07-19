"use server";

export async function createPhotographer(_formData: FormData) {
  return { error: "Photographer management not configured yet" };
}

export async function deletePhotographer(_id: number) {
  return { success: true };
}
