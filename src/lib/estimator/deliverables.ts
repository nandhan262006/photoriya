/**
 * Pure deliverables generator.
 *
 * Deliverables are never chosen by the user — they are derived from the
 * current selection using the template's declarative deliverable rules. This
 * keeps the output consistent with what the team will actually deliver.
 *
 * Two output formats:
 * - `generateDeliverables` — flat groups (Coverage, Add-ons, etc.) for the
 *   legacy estimate panel and pricing display.
 * - `generateSubEventDeliverables` — structured by sub-event with services
 *   listed under each, for the PDF, deliverables step, and admin views.
 */
import type {
  Deliverable,
  DeliverableGroup,
  EstimatorState,
  EventTemplate,
  SubEventDeliverable,
} from "./types";

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/**
 * Group deliverables by sub-event. Each sub-event heading lists the
 * services selected for it. Albums are listed separately since they
 * are not scoped to a sub-event.
 */
export function generateSubEventDeliverables(
  state: EstimatorState,
  template: EventTemplate,
): SubEventDeliverable[] {
  const result: SubEventDeliverable[] = [];
  const seen = new Set<string>();

  for (const subId of state.selectedSubEvents) {
    const cfg = state.subEventConfig[subId];
    if (!cfg) continue;
    const sub = template.subEvents.find((s) => s.id === subId);
    const subName = sub?.name ?? subId;
    const services: { label: string; detail?: string; group: string }[] = [];

    for (const rule of template.deliverableRules) {
      if (rule.when.coverage) {
        for (const coverageId of rule.when.coverage) {
          if (!cfg.coverage.includes(coverageId)) continue;
          const key = `coverage-${subId}-${coverageId}`;
          if (seen.has(key)) continue;
          seen.add(key);
          services.push({
            label: rule.produce.label,
            detail: rule.produce.countPerSubEvent ? "1 sub-event" : undefined,
            group: rule.produce.group,
          });
        }
      }

      if (rule.when.addOns) {
        for (const addOnId of rule.when.addOns) {
          if (!cfg.addOns.includes(addOnId)) continue;
          const key = `addon-${subId}-${addOnId}`;
          if (seen.has(key)) continue;
          seen.add(key);
          services.push({
            label: rule.produce.label,
            detail: rule.produce.countPerSubEvent ? "1 sub-event" : undefined,
            group: rule.produce.group,
          });
        }
      }

      if (rule.when.reels && cfg.reels > 0) {
        const key = `reels-${subId}`;
        if (!seen.has(key)) {
          seen.add(key);
          services.push({
            label: rule.produce.label,
            detail: plural(cfg.reels, "reel"),
            group: rule.produce.group,
          });
        }
      }
    }

    if (services.length > 0) {
      const groupMap = new Map<string, { label: string; detail?: string }[]>();
      const groupOrder: string[] = [];
      for (const svc of services) {
        if (!groupMap.has(svc.group)) {
          groupMap.set(svc.group, []);
          groupOrder.push(svc.group);
        }
        groupMap.get(svc.group)!.push({ label: svc.label, detail: svc.detail });
      }
      result.push({
        subEventId: subId,
        subEventName: subName,
        groups: groupOrder.map((g) => ({ group: g, services: groupMap.get(g)! })),
      });
    }
  }

  const a = state.album;
  if (a.required && a.typeId && a.sizeId) {
    const type = template.album.types.find((t) => t.id === a.typeId);
    const size = template.album.sizes.find((s) => s.id === a.sizeId);
    if (type && size) {
      result.push({
        subEventId: "__album__",
        subEventName: "Albums",
        groups: [
          {
            group: "Albums",
            services: [
              {
                label: `${a.count} \u00d7 ${type.name} (${size.name}, ${a.pages}p)`,
              },
            ],
          },
        ],
      });
    }
  }

  return result;
}

/**
 * Legacy flat-group deliverables (used by the estimate panel sidebar).
 */
export function generateDeliverables(
  state: EstimatorState,
  template: EventTemplate,
): DeliverableGroup[] {
  const groups = new Map<string, Deliverable[]>();
  const groupOrder: string[] = [];

  const ensure = (group: string) => {
    if (!groups.has(group)) {
      groups.set(group, []);
      groupOrder.push(group);
    }
  };

  for (const rule of template.deliverableRules) {
    const { when, produce } = rule;

    if (when.coverage) {
      for (const coverageId of when.coverage) {
        const subsWith = state.selectedSubEvents.filter((id) =>
          state.subEventConfig[id]?.coverage.includes(coverageId),
        );
        if (subsWith.length === 0) continue;
        ensure(produce.group);
        groups.get(produce.group)!.push({
          id: rule.id,
          group: produce.group,
          label: produce.label,
          detail: produce.countPerSubEvent
            ? plural(subsWith.length, "sub-event")
            : undefined,
        });
      }
    }

    if (when.addOns) {
      for (const addOnId of when.addOns) {
        const subsWith = state.selectedSubEvents.filter((id) =>
          state.subEventConfig[id]?.addOns.includes(addOnId),
        );
        if (subsWith.length === 0) continue;
        ensure(produce.group);
        groups.get(produce.group)!.push({
          id: rule.id,
          group: produce.group,
          label: produce.label,
          detail: produce.countPerSubEvent
            ? plural(subsWith.length, "sub-event")
            : undefined,
        });
      }
    }

    if (when.reels) {
      const totalReels = state.selectedSubEvents.reduce(
        (sum, id) => sum + (state.subEventConfig[id]?.reels ?? 0),
        0,
      );
      if (totalReels > 0) {
        ensure(produce.group);
        groups.get(produce.group)!.push({
          id: rule.id,
          group: produce.group,
          label: produce.label,
          detail: plural(totalReels, "reel"),
        });
      }
    }

    if (when.album) {
      const a = state.album;
      if (a.required && a.typeId && a.sizeId) {
        const type = template.album.types.find((t) => t.id === a.typeId);
        const size = template.album.sizes.find((s) => s.id === a.sizeId);
        if (type && size) {
          ensure(produce.group);
          groups.get(produce.group)!.push({
            id: rule.id,
            group: produce.group,
            label: produce.label,
            detail: `${a.count} \u00d7 ${type.name} (${size.name}, ${a.pages}p)`,
          });
        }
      }
    }
  }

  return groupOrder.map((group) => ({ group, items: groups.get(group)! }));
}
