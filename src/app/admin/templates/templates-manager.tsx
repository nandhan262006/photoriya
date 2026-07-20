"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { upsertTemplate, upsertSubEvent, deleteSubEvent } from "@/lib/admin/template-actions";

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
  "traditional_photography",
  "traditional_videography",
  "candid_photography",
  "cinematic_videography",
  "drone",
];

const ADDON_IDS = [
  "led_screen",
  "live_streaming",
  "crane",
  "booth_360",
  "instant_prints",
  "photobooth",
  "same_day_edit",
];

const COVERAGE_LABELS: Record<string, string> = {
  traditional_photography: "Traditional Photography",
  traditional_videography: "Traditional Videography",
  candid_photography: "Candid Photography",
  cinematic_videography: "Cinematic Videography",
  drone: "Drone",
};

const ADDON_LABELS: Record<string, string> = {
  led_screen: "LED Screen",
  live_streaming: "Live Streaming",
  crane: "Crane",
  booth_360: "360 Booth",
  instant_prints: "Instant Prints",
  photobooth: "Photo Booth",
  same_day_edit: "Same-Day Edit",
};

export function TemplatesManager({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    typeId: "",
    name: "",
    tagline: "",
    description: "",
    icon: "heart",
    isActive: true,
    defaultMaxReels: 3,
    defaultReelMin: 4000,
    defaultReelMax: 8000,
  });

  const startEdit = (t?: Template) => {
    if (t) {
      setForm({
        typeId: t.typeId,
        name: t.name,
        tagline: t.tagline,
        description: t.description,
        icon: t.icon,
        isActive: t.isActive,
        defaultMaxReels: t.defaultMaxReels,
        defaultReelMin: t.defaultReelMin,
        defaultReelMax: t.defaultReelMax,
      });
      setEditingId(t.id);
    } else {
      setForm({ typeId: "", name: "", tagline: "", description: "", icon: "heart", isActive: true, defaultMaxReels: 3, defaultReelMin: 4000, defaultReelMax: 8000 });
      setEditingId(null);
    }
  };

  const save = async () => {
    await upsertTemplate({ ...form, id: editingId ?? undefined, coverageOptions: [], addOnOptions: [] });
    toast.success("Template saved");
    setEditingId(null);
    router.refresh();
  };

  const icos = ["heart", "cake", "flower", "baby", "home", "gift", "camera"];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <Button onClick={() => startEdit()} size="sm">New Template</Button>
      </div>

      {editingId !== null && (
        <div className="rounded-xl border p-4 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Type ID</Label>
              <Input value={form.typeId} onChange={(e) => setForm({ ...form, typeId: e.target.value })} />
            </div>
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Tagline</Label>
              <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Icon</Label>
              <select className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                {icos.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2 pb-2">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="size-4" />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div>
              <Label>Default Max Reels</Label>
              <Input type="number" value={form.defaultMaxReels} onChange={(e) => setForm({ ...form, defaultMaxReels: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Reel Price Min</Label>
              <Input type="number" value={form.defaultReelMin} onChange={(e) => setForm({ ...form, defaultReelMin: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Reel Price Max</Label>
              <Input type="number" value={form.defaultReelMax} onChange={(e) => setForm({ ...form, defaultReelMax: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {templates.map((t) => (
          <div key={t.id} className="rounded-xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t.name}</span>
                {!t.isActive && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Inactive</span>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(t)}>Edit</Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {t.subEvents.map((se) => (
                <span key={se.id} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {se.name}{se.defaultSelected ? " *" : ""}
                </span>
              ))}
            </div>

            <SubEventsEditor templateId={t.id} subEvents={t.subEvents} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SubEventsEditor({ templateId, subEvents }: { templateId: number; subEvents: SubEvent[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ subEventId: "", name: "", description: "", defaultSelected: false, maxReels: "", sortOrder: 0 });
  const [prices, setPrices] = useState<Record<string, { min: string; max: string }>>({});
  const [editingSe, setEditingSe] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const startEditSe = (se?: SubEvent) => {
    if (se) {
      const overrides = parsePrices(se.priceOverrides);
      setForm({ subEventId: se.subEventId, name: se.name, description: se.description, defaultSelected: se.defaultSelected, maxReels: se.maxReels?.toString() ?? "", sortOrder: se.sortOrder });
      setPrices(overrides);
      setEditingSe(se.id);
    } else {
      setForm({ subEventId: "", name: "", description: "", defaultSelected: false, maxReels: "", sortOrder: subEvents.length });
      setPrices({});
      setEditingSe(null);
    }
    setAdding(true);
  };

  const saveSe = async () => {
    if (!form.subEventId || !form.name) { toast.error("ID and name required"); return; }
    const overrides: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(prices)) {
      if (!val.min && !val.max) continue;
      const num = { min: Number(val.min) || 0, max: Number(val.max) || 0 };
      if (key === "reel") {
        overrides.reel = num;
      } else if (key.startsWith("coverage.")) {
        const id = key.slice(9);
        if (!overrides.coverage) overrides.coverage = {};
        (overrides.coverage as Record<string, { min: number; max: number }>)[id] = num;
      } else if (key.startsWith("addOn.")) {
        const id = key.slice(6);
        if (!overrides.addOns) overrides.addOns = {};
        (overrides.addOns as Record<string, { min: number; max: number }>)[id] = num;
      }
    }
    await upsertSubEvent({
      id: editingSe ?? undefined,
      subEventId: form.subEventId,
      name: form.name,
      description: form.description,
      defaultSelected: form.defaultSelected,
      maxReels: form.maxReels ? Number(form.maxReels) : null,
      sortOrder: form.sortOrder,
      priceOverrides: overrides,
      templateId,
    });
    toast.success("Sub-event saved");
    setAdding(false);
    setEditingSe(null);
    router.refresh();
  };

  const delSe = async (id: number) => {
    await deleteSubEvent(id);
    toast.success("Deleted");
    router.refresh();
  };

  const setPrice = (key: string, field: "min" | "max", value: string) => {
    setPrices((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  return (
    <div className="border-t pt-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase text-muted-foreground">Sub-events</span>
        <Button variant="ghost" size="xs" onClick={() => startEditSe()}>+ Add</Button>
      </div>

      {adding && (
        <div className="grid gap-2 mb-3 rounded-lg border p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="text-xs">SubEvent ID</Label>
              <Input size={1} value={form.subEventId} onChange={(e) => setForm({ ...form, subEventId: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Name</Label>
              <Input size={1} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Input size={1} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="defaultSelected" checked={form.defaultSelected} onChange={(e) => setForm({ ...form, defaultSelected: e.target.checked })} className="size-4" />
              <Label htmlFor="defaultSelected" className="text-xs">Default selected</Label>
            </div>
            <div>
              <Label className="text-xs">Max Reels (blank = template default)</Label>
              <Input size={1} type="number" value={form.maxReels} onChange={(e) => setForm({ ...form, maxReels: e.target.value })} />
            </div>
          </div>

          <PriceEditor prices={prices} setPrice={setPrice} />

          <div className="flex gap-2">
            <Button size="sm" onClick={saveSe}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground">
            <th className="text-left font-medium p-1">ID</th>
            <th className="text-left font-medium p-1">Name</th>
            <th className="text-left font-medium p-1">Default</th>
            <th className="text-left font-medium p-1">Reels</th>
            <th className="text-right font-medium p-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subEvents.map((se) => (
            <tr key={se.id} className="border-t">
              <td className="p-1 text-muted-foreground">{se.subEventId}</td>
              <td className="p-1">{se.name}</td>
              <td className="p-1">{se.defaultSelected ? "✓" : ""}</td>
              <td className="p-1">{se.maxReels ?? "—"}</td>
              <td className="p-1 text-right">
                <Button variant="ghost" size="xs" onClick={() => startEditSe(se)}>Edit</Button>
                <Button variant="ghost" size="xs" className="text-destructive" onClick={() => delSe(se.id)}>×</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PriceEditor({
  prices,
  setPrice,
}: {
  prices: Record<string, { min: string; max: string }>;
  setPrice: (key: string, field: "min" | "max", value: string) => void;
}) {
  return (
    <div className="border-t pt-2 mt-2">
      <span className="text-xs font-medium uppercase text-muted-foreground block mb-2">Price Overrides (leave blank to use default)</span>

      <div className="grid gap-3">
        <div>
          <span className="text-xs text-muted-foreground block mb-1">Coverage Prices</span>
          <div className="grid gap-1">
            {COVERAGE_IDS.map((cid) => (
              <div key={cid} className="grid grid-cols-[1fr_80px_80px] gap-1 items-center">
                <span className="text-xs">{COVERAGE_LABELS[cid]}</span>
                <Input
                  size={1}
                  placeholder="Min"
                  value={prices[`coverage.${cid}`]?.min ?? ""}
                  onChange={(e) => setPrice(`coverage.${cid}`, "min", e.target.value)}
                  className="h-7 text-xs"
                />
                <Input
                  size={1}
                  placeholder="Max"
                  value={prices[`coverage.${cid}`]?.max ?? ""}
                  onChange={(e) => setPrice(`coverage.${cid}`, "max", e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs text-muted-foreground block mb-1">Add-on Prices</span>
          <div className="grid gap-1">
            {ADDON_IDS.map((aid) => (
              <div key={aid} className="grid grid-cols-[1fr_80px_80px] gap-1 items-center">
                <span className="text-xs">{ADDON_LABELS[aid]}</span>
                <Input
                  size={1}
                  placeholder="Min"
                  value={prices[`addOn.${aid}`]?.min ?? ""}
                  onChange={(e) => setPrice(`addOn.${aid}`, "min", e.target.value)}
                  className="h-7 text-xs"
                />
                <Input
                  size={1}
                  placeholder="Max"
                  value={prices[`addOn.${aid}`]?.max ?? ""}
                  onChange={(e) => setPrice(`addOn.${aid}`, "max", e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_80px_80px] gap-1 items-center">
          <span className="text-xs">Reel Price (per reel)</span>
          <Input
            size={1}
            placeholder="Min"
            value={prices["reel"]?.min ?? ""}
            onChange={(e) => setPrice("reel", "min", e.target.value)}
            className="h-7 text-xs"
          />
          <Input
            size={1}
            placeholder="Max"
            value={prices["reel"]?.max ?? ""}
            onChange={(e) => setPrice("reel", "max", e.target.value)}
            className="h-7 text-xs"
          />
        </div>
      </div>
    </div>
  );
}

function parsePrices(json: string): Record<string, { min: string; max: string }> {
  try {
    const parsed = JSON.parse(json);
    const result: Record<string, { min: string; max: string }> = {};
    if (parsed.coverage) {
      for (const [key, val] of Object.entries(parsed.coverage as Record<string, { min: number; max: number }>)) {
        result[`coverage.${key}`] = { min: String(val.min), max: String(val.max) };
      }
    }
    if (parsed.addOns) {
      for (const [key, val] of Object.entries(parsed.addOns as Record<string, { min: number; max: number }>)) {
        result[`addOn.${key}`] = { min: String(val.min), max: String(val.max) };
      }
    }
    if (parsed.reel) {
      result["reel"] = { min: String(parsed.reel.min), max: String(parsed.reel.max) };
    }
    return result;
  } catch {
    return {};
  }
}
