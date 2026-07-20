import { getTemplates } from "@/lib/admin/template-actions";
import { EditorShell } from "./editor-shell";

export const dynamic = "force-dynamic";

export default async function EstimatorEditorPage() {
  const templates = await getTemplates();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Estimator Editor</h1>
      </div>
      <EditorShell templates={templates} />
    </div>
  );
}
