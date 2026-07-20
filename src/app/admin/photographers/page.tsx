import { PhotographersManager } from "@/components/admin/photographers-manager";
import { getPhotographers } from "@/lib/booking/actions";

export const dynamic = "force-dynamic";

export default async function AdminPhotographersPage() {
  const allPhotographers = await getPhotographers();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Photographers</h1>
      </div>

      <PhotographersManager photographers={allPhotographers} />
    </div>
  );
}
