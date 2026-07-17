"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateBookingStatus, deleteBooking } from "@/lib/booking/actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

interface Booking {
  id: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: string;
  notes: string | null;
  service: { name: string } | null;
  photographer: { name: string } | null;
}

interface BookingsTableProps {
  bookings: Booking[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const router = useRouter();

  async function handleStatusChange(bookingId: number, status: string) {
    const result = await updateBookingStatus(bookingId, status);
    if (result.success) {
      toast.success(`Booking ${status}`);
      router.refresh();
    }
  }

  async function handleDelete(bookingId: number) {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    const result = await deleteBooking(bookingId);
    if (result.success) {
      toast.success("Booking deleted");
      router.refresh();
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-3 text-sm font-medium">Client</th>
            <th className="text-left p-3 text-sm font-medium">Service</th>
            <th className="text-left p-3 text-sm font-medium">Photographer</th>
            <th className="text-left p-3 text-sm font-medium">Date & Time</th>
            <th className="text-left p-3 text-sm font-medium">Amount</th>
            <th className="text-left p-3 text-sm font-medium">Status</th>
            <th className="text-left p-3 text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 && (
            <tr>
              <td colSpan={7} className="p-8 text-center text-muted-foreground">
                No bookings yet
              </td>
            </tr>
          )}
          {bookings.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="p-3">
                <p className="font-medium text-sm">{b.clientName}</p>
                <p className="text-xs text-muted-foreground">
                  {b.clientEmail}
                </p>
              </td>
              <td className="p-3 text-sm">{b.service?.name}</td>
              <td className="p-3 text-sm">{b.photographer?.name}</td>
              <td className="p-3 text-sm">
                {b.bookingDate}
                <br />
                <span className="text-xs text-muted-foreground">
                  {b.startTime} - {b.endTime}
                </span>
              </td>
              <td className="p-3 text-sm font-medium">
                ${Number(b.totalPrice).toFixed(0)}
              </td>
              <td className="p-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    b.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : b.status === "completed"
                        ? "bg-blue-100 text-blue-700"
                        : b.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {b.status}
                </span>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <Select
                    defaultValue={b.status}
                    onValueChange={(v) => v && handleStatusChange(b.id, v)}
                  >
                    <SelectTrigger className="h-8 text-xs w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                    onClick={() => handleDelete(b.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
