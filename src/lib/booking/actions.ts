"use server";

export async function getServices() {
  return [];
}

export async function getPhotographers() {
  return [];
}

export async function getTimeSlots(_photographerId: number) {
  return [];
}

export async function getBookedSlots(_photographerId: number, _date: string) {
  return [];
}

export async function createBooking(_formData: FormData) {
  return { error: "Online booking is currently unavailable. Please contact us directly." };
}

export async function getAdminBookings() {
  return [];
}

export async function updateBookingStatus(_bookingId: number, _status: string) {
  return { success: true };
}

export async function deleteBooking(_bookingId: number) {
  return { success: true };
}
