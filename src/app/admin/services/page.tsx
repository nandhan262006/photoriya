import { ServicesManager } from "@/components/admin/services-manager";
import { getServices } from "@/lib/booking/actions";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await getServices();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Services</h1>
      </div>

      <ServicesManager services={services} />
    </div>
  );
}
