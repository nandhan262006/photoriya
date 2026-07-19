"use server";

export async function createService(_formData: FormData) {
  return { error: "Service management not configured yet" };
}

export async function updateService(_id: number, _formData: FormData) {
  return { error: "Service management not configured yet" };
}

export async function deleteService(_id: number) {
  return { success: true };
}
