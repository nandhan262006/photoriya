/**
 * Pure deliverables generator.
 *
 * Deliverables are never chosen by the user — they are derived from the
 * current selection using the template's declarative deliverable rules. This
 * keeps the output consistent with what the team will actually deliver.
 */
import type {
  Deliverable,
  DeliverableGroup,
  EstimatorState,
  EventTemplate,
} from "./types";

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

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
