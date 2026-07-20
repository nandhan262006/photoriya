import { getTemplates } from "@/lib/admin/template-actions";
import { TemplatesManager } from "./templates-manager";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const templates = await getTemplates();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Event Templates</h1>
      </div>
      <TemplatesManager templates={templates} />
    </div>
  );
}
