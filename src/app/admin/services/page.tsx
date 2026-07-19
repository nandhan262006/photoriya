import { ServicesManager } from "@/components/admin/services-manager";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services: Array<{
    id: number;
    name: string;
    description: string;
    duration: number;
    price: string;
    image: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Services</h1>
      </div>

      <ServicesManager services={services} />
    </div>
  );
}
