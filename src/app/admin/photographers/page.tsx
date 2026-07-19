import { PhotographersManager } from "@/components/admin/photographers-manager";

export const dynamic = "force-dynamic";

export default async function AdminPhotographersPage() {
  const allPhotographers: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    bio: string;
    image: string;
    isActive: boolean;
    createdAt: Date;
    timeSlots: Array<{
      id: number;
      photographerId: number;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isActive: boolean;
    }>;
  }> = [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Photographers</h1>
      </div>

      <PhotographersManager photographers={allPhotographers} />
    </div>
  );
}
