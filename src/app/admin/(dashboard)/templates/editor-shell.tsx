"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  upsertTemplate,
  upsertSubEvent,
  deleteSubEvent,
  deleteTemplate,
} from "@/lib/admin/template-actions";

interface SubEvent {
  id: number;
  subEventId: string;
  name: string;
  description: string;
  defaultSelected: boolean;
  maxReels: number | null;
  sortOrder: number;
  priceOverrides: string;
  templateId: number;
}

interface Template {
  id: number;
  typeId: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  isActive: boolean;
  defaultMaxReels: number;
  defaultReelMin: number;
  defaultReelMax: number;
  coverageOptions: string;
  addOnOptions: string;
  subEvents: SubEvent[];
}

const COVERAGE_IDS = [
  "traditional_photography", "traditional_videography",
  "candid_photography", "cinematic_videography", "drone",
];

const ADDON_IDS = [
  "led_screen", "live_streaming", "crane", "booth_360",
  "instant_prints", "photobooth", "same_day_edit",
];

const COVERAGE_LABELS: Record<string, string> = {
  traditional_photography: "Traditional Photography",
  traditional_videography: "Traditional Videography",
  candid_photography: "Candid Photography",
  cinematic_videography: "Cinematic Videography",
  drone: "Drone",
};

const ADDON_LABELS: Record<string, string> = {
  led_screen: "LED Screen", live_streaming: "Live Streaming",
  crane: "Crane", booth_360: "360 Booth",
  instant_prints: "Instant Prints", photobooth: "Photo Booth",
  same_day_edit: "Same-Day Edit",
};

const ICOS = ["heart", "cake", "flower", "baby", "home", "gift", "camera"];

type Tab = "events" | "subevents" | "coverage" | "addons" | "reels";

export function EditorShell({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("events");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const tmpl = templates.find((t) => t.id === selectedTemplate);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 border-b pb-1">
        {(["events", "subevents", "coverage", "addons", "reels"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "events" ? "1. Event Types" :
             t === "subevents" ? "2. Sub-Events" :
             t === "coverage" ? "3. Coverage Prices" :
             t === "addons" ? "4. Add-on Prices" : "5. Reels & Albums"}
          </button>
        ))}
      </div>

      {tab === "events" && <EventsEditor templates={templates} />}
      {tab === "subevents" && (
        <SubEventsEditor
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
        />
      )}
      {tab === "coverage" && (
        <CoverageEditor
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
        />
      )}
      {tab === "addons" && (
        <AddOnEditor
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
        />
      )}
      {tab === "reels" && <ReelsEditor templates={templates} />}
    </div>
  );
}

function EventsEditor({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({
    typeId: "", name: "", tagline: "", description: "",
    icon: "heart", isActive: true,
    defaultMaxReels: 3, defaultReelMin: 4000, defaultReelMax: 8000,
  });

  const startEdit = (t?: Template) => {
    if (t) {
      setForm({
        typeId: t.typeId, name: t.name, tagline: t.tagline,
        description: t.description, icon: t.icon, isActive: t.isActive,
        defaultMaxReels: t.defaultMaxReels,
        defaultReelMin: t.defaultReelMin,
        defaultReelMax: t.defaultReelMax,
      });
      setEditing(t.id);
    } else {
      setForm({ typeId: "", name: "", tagline: "", description: "", icon: "heart", isActive: true, defaultMaxReels: 3, defaultReelMin: 4000, defaultReelMax: 8000 });
      setEditing(null);
    }
  };

  const save = async () => {
    await upsertTemplate({ ...form, id: editing ?? undefined, coverageOptions: [], addOnOptions: [] });
    toast.success("Saved");
    setEditing(null);
    router.refresh();
  };

  const del = async (id: number) => {
    if (!confirm("Delete this event type and all its sub-events?")) return;
    await deleteTemplate(id);
    toast.success("Deleted");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Button onClick={() => startEdit()} size="sm">+ New Event Type</Button>
      </div>

      {editing !== null && (
        <div className="rounded-xl border p-4 grid gap-3 sm:grid-cols-2">
          <div><Label>ID</Label><Input value={form.typeId} onChange={(e) => setForm({ ...form, typeId: e.target.value })} /></div>
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div>
            <Label>Icon</Label>
            <select className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
              {ICOS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2 pb-2">
            <input type="checkbox" id="ea" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="size-4" />
            <Label htmlFor="ea">Active</Label>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {templates.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{t.name}</span>
              {!t.isActive && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Inactive</span>}
              <span className="text-xs text-muted-foreground">{t.subEvents.length} sub-events</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="xs" onClick={() => startEdit(t)}>Edit</Button>
              <Button variant="ghost" size="xs" className="text-destructive" onClick={() => del(t.id)}>×</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubEventsEditor({
  templates, selectedTemplate, onSelectTemplate,
}: {
  templates: Template[];
  selectedTemplate: number | null;
  onSelectTemplate: (id: number | null) => void;
}) {
  const router = useRouter();
  const tmpl = templates.find((t) => t.id === selectedTemplate);
  const [form, setForm] = useState({ subEventId: "", name: "", description: "", defaultSelected: false, maxReels: "", sortOrder: 0 });
  const [editing, setEditing] = useState<number | null>(null);

  const startEdit = (se?: SubEvent) => {
    if (se) {
      setForm({ subEventId: se.subEventId, name: se.name, description: se.description, defaultSelected: se.defaultSelected, maxReels: se.maxReels?.toString() ?? "", sortOrder: se.sortOrder });
      setEditing(se.id);
    } else {
      setForm({ subEventId: "", name: "", description: "", defaultSelected: false, maxReels: "", sortOrder: tmpl?.subEvents.length ?? 0 });
      setEditing(null);
    }
  };

  const save = async () => {
    if (!selectedTemplate || !form.subEventId || !form.name) { toast.error("ID and name required"); return; }
    await upsertSubEvent({
      id: editing ?? undefined,
      subEventId: form.subEventId,
      name: form.name,
      description: form.description,
      defaultSelected: form.defaultSelected,
      maxReels: form.maxReels ? Number(form.maxReels) : null,
      sortOrder: form.sortOrder,
      priceOverrides: {},
      templateId: selectedTemplate,
    });
    toast.success("Saved");
    setEditing(null);
    router.refresh();
  };

  const del = async (id: number) => {
    if (!confirm("Delete this sub-event?")) return;
    await deleteSubEvent(id);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => { onSelectTemplate(t.id); startEdit(); }}
            className={`rounded-[9999px] border px-3 py-1 text-sm transition-colors ${
              selectedTemplate === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {tmpl && (
        <>
          <div className="flex gap-2">
            <Button onClick={() => startEdit()} size="sm">+ Add Sub-Event</Button>
          </div>

          {editing !== null && (
            <div className="rounded-xl border p-4 grid gap-3 sm:grid-cols-2">
              <div><Label className="text-xs">ID</Label><Input value={form.subEventId} onChange={(e) => setForm({ ...form, subEventId: e.target.value })} /></div>
              <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label className="text-xs">Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="ds" checked={form.defaultSelected} onChange={(e) => setForm({ ...form, defaultSelected: e.target.checked })} className="size-4" />
                <Label htmlFor="ds" className="text-xs">Default selected</Label>
              </div>
              <div>
                <Label className="text-xs">Max Reels</Label>
                <Input type="number" value={form.maxReels} onChange={(e) => setForm({ ...form, maxReels: e.target.value })} />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button size="sm" onClick={save}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="grid gap-1">
            {tmpl.subEvents.map((se) => (
              <div key={se.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{se.name}</span>
                  <span className="text-xs text-muted-foreground">({se.subEventId})</span>
                  {se.defaultSelected && <span className="text-xs text-primary">*default</span>}
                  {se.maxReels && <span className="text-xs text-muted-foreground">max {se.maxReels} reels</span>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="xs" onClick={() => startEdit(se)}>Edit</Button>
                  <Button variant="ghost" size="xs" className="text-destructive" onClick={() => del(se.id)}>×</Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CoverageEditor({
  templates, selectedTemplate, onSelectTemplate,
}: {
  templates: Template[];
  selectedTemplate: number | null;
  onSelectTemplate: (id: number | null) => void;
}) {
  const router = useRouter();
  const tmpl = templates.find((t) => t.id === selectedTemplate);

  const [prices, setPrices] = useState<Record<string, Record<string, { min: string; max: string }>>>({});

  const loadPrices = (seId: number) => {
    const se = tmpl?.subEvents.find((s) => s.id === seId);
    if (!se) return {};
    try {
      const parsed = JSON.parse(se.priceOverrides);
      const result: Record<string, { min: string; max: string }> = {};
      if (parsed.coverage) {
        for (const [key, val] of Object.entries(parsed.coverage as Record<string, { min: number; max: number }>)) {
          result[key] = { min: String(val.min), max: String(val.max) };
        }
      }
      return result;
    } catch { return {}; }
  };

  const saveCoveragePrice = async (subEventId: number, coverageId: string, min: string, max: string) => {
    if (!selectedTemplate) return;
    const se = tmpl?.subEvents.find((s) => s.id === subEventId);
    if (!se) return;
    let overrides: Record<string, unknown> = {};
    try { overrides = JSON.parse(se.priceOverrides); } catch {}
    if (!overrides.coverage) overrides.coverage = {};
    (overrides.coverage as Record<string, { min: number; max: number }>)[coverageId] = { min: Number(min) || 0, max: Number(max) || 0 };
    await upsertSubEvent({
      id: subEventId, subEventId: se.subEventId, name: se.name,
      description: se.description, defaultSelected: se.defaultSelected,
      maxReels: se.maxReels, sortOrder: se.sortOrder,
      priceOverrides: overrides, templateId: selectedTemplate,
    });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelectTemplate(t.id)}
            className={`rounded-[9999px] border px-3 py-1 text-sm transition-colors ${
              selectedTemplate === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {tmpl && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                <th className="p-2 text-left font-medium">Sub-Event</th>
                {COVERAGE_IDS.map((cid) => (
                  <th key={cid} className="p-2 text-left font-medium min-w-[140px]">{COVERAGE_LABELS[cid]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tmpl.subEvents.map((se) => {
                const sePrices = loadPrices(se.id);
                return (
                  <tr key={se.id} className="border-b">
                    <td className="p-2 font-medium text-sm">{se.name}</td>
                    {COVERAGE_IDS.map((cid) => {
                      const p = sePrices[cid];
                      return (
                        <td key={cid} className="p-1">
                          <div className="flex gap-1">
                            <Input
                              size={1}
                              className="h-7 w-16 text-xs"
                              placeholder="Min"
                              value={p?.min ?? ""}
                              onChange={(e) => {
                                const max = p?.max ?? "";
                                saveCoveragePrice(se.id, cid, e.target.value, max);
                              }}
                            />
                            <Input
                              size={1}
                              className="h-7 w-16 text-xs"
                              placeholder="Max"
                              value={p?.max ?? ""}
                              onChange={(e) => {
                                const min = p?.min ?? "";
                                saveCoveragePrice(se.id, cid, min, e.target.value);
                              }}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AddOnEditor({
  templates, selectedTemplate, onSelectTemplate,
}: {
  templates: Template[];
  selectedTemplate: number | null;
  onSelectTemplate: (id: number | null) => void;
}) {
  const router = useRouter();
  const tmpl = templates.find((t) => t.id === selectedTemplate);

  const saveAddOnPrice = async (subEventId: number, addOnId: string, min: string, max: string) => {
    if (!selectedTemplate) return;
    const se = tmpl?.subEvents.find((s) => s.id === subEventId);
    if (!se) return;
    let overrides: Record<string, unknown> = {};
    try { overrides = JSON.parse(se.priceOverrides); } catch {}
    if (!overrides.addOns) overrides.addOns = {};
    (overrides.addOns as Record<string, { min: number; max: number }>)[addOnId] = { min: Number(min) || 0, max: Number(max) || 0 };
    await upsertSubEvent({
      id: subEventId, subEventId: se.subEventId, name: se.name,
      description: se.description, defaultSelected: se.defaultSelected,
      maxReels: se.maxReels, sortOrder: se.sortOrder,
      priceOverrides: overrides, templateId: selectedTemplate,
    });
    router.refresh();
  };

  const loadAddOnPrices = (seId: number) => {
    const se = tmpl?.subEvents.find((s) => s.id === seId);
    if (!se) return {};
    try {
      const parsed = JSON.parse(se.priceOverrides);
      const result: Record<string, { min: string; max: string }> = {};
      if (parsed.addOns) {
        for (const [key, val] of Object.entries(parsed.addOns as Record<string, { min: number; max: number }>)) {
          result[key] = { min: String(val.min), max: String(val.max) };
        }
      }
      return result;
    } catch { return {}; }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelectTemplate(t.id)}
            className={`rounded-[9999px] border px-3 py-1 text-sm transition-colors ${
              selectedTemplate === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {tmpl && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                <th className="p-2 text-left font-medium">Sub-Event</th>
                {ADDON_IDS.map((aid) => (
                  <th key={aid} className="p-2 text-left font-medium min-w-[140px]">{ADDON_LABELS[aid]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tmpl.subEvents.map((se) => {
                const sePrices = loadAddOnPrices(se.id);
                return (
                  <tr key={se.id} className="border-b">
                    <td className="p-2 font-medium text-sm">{se.name}</td>
                    {ADDON_IDS.map((aid) => {
                      const p = sePrices[aid];
                      return (
                        <td key={aid} className="p-1">
                          <div className="flex gap-1">
                            <Input size={1} className="h-7 w-16 text-xs" placeholder="Min" value={p?.min ?? ""} onChange={(e) => { const m = p?.max ?? ""; saveAddOnPrice(se.id, aid, e.target.value, m); }} />
                            <Input size={1} className="h-7 w-16 text-xs" placeholder="Max" value={p?.max ?? ""} onChange={(e) => { const n = p?.min ?? ""; saveAddOnPrice(se.id, aid, n, e.target.value); }} />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReelsEditor({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ defaultMaxReels: 3, defaultReelMin: 4000, defaultReelMax: 8000 });

  const startEdit = (t?: Template) => {
    if (t) {
      setForm({ defaultMaxReels: t.defaultMaxReels, defaultReelMin: t.defaultReelMin, defaultReelMax: t.defaultReelMax });
      setEditing(t.id);
    }
  };

  const save = async () => {
    if (!editing) return;
    const t = templates.find((t) => t.id === editing);
    if (!t) return;
    await upsertTemplate({
      id: editing,
      typeId: t.typeId, name: t.name, tagline: t.tagline,
      description: t.description, icon: t.icon, isActive: t.isActive,
      ...form, coverageOptions: [], addOnOptions: [],
    });
    toast.success("Saved");
    setEditing(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      {templates.map((t) => (
        <div key={t.id} className="rounded-xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">{t.name}</span>
            <Button variant="outline" size="xs" onClick={() => startEdit(t)}>Edit</Button>
          </div>

          {editing === t.id ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div><Label className="text-xs">Max Reels</Label><Input type="number" value={form.defaultMaxReels} onChange={(e) => setForm({ ...form, defaultMaxReels: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Reel Price Min</Label><Input type="number" value={form.defaultReelMin} onChange={(e) => setForm({ ...form, defaultReelMin: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Reel Price Max</Label><Input type="number" value={form.defaultReelMax} onChange={(e) => setForm({ ...form, defaultReelMax: Number(e.target.value) })} /></div>
              <div className="flex gap-2">
                <Button size="sm" onClick={save}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Max reels: {t.defaultMaxReels}</span>
              <span>Reel price: ₹{t.defaultReelMin} – ₹{t.defaultReelMax}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
