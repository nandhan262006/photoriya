import { db } from "@/db";
import { PhotographersManager } from "@/components/admin/photographers-manager";

export const dynamic = "force-dynamic";

export default async function AdminPhotographersPage() {
  const allPhotographers = await db.query.photographers.findMany({
    with: { timeSlots: true },
    orderBy: (p, { asc }) => [asc(p.id)],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Photographers</h1>
      </div>

      <PhotographersManager photographers={allPhotographers} />
    </div>
  );
}
