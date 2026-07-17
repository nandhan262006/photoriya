/**
 * Pure recommendation engine.
 *
 * Evaluates the template's declarative recommendation rules against the current
 * state and returns suggestions that still have something to add. The UI can
 * accept a suggestion with a single action — no hardcoded upsell logic here.
 */
import type {
  ActiveRecommendation,
  EstimatorState,
  EventTemplate,
} from "./types";

export function evaluateRecommendations(
  state: EstimatorState,
  template: EventTemplate,
): ActiveRecommendation[] {
  const selected = new Set(state.selectedSubEvents);
  const result: ActiveRecommendation[] = [];

  for (const rule of template.recommendationRules) {
    if (rule.requiresAnySubEvent) {
      const hasAny = rule.requiresAnySubEvent.some((id) => selected.has(id));
      if (!hasAny) continue;
    }

    if (rule.requiresCoverage) {
      const hasCoverage = state.selectedSubEvents.some((id) => {
        const cfg = state.subEventConfig[id];
        return rule.requiresCoverage!.every((c) => cfg?.coverage.includes(c));
      });
      if (!hasCoverage) continue;
    }

    const candidates = rule.whenSubEvents
      ? state.selectedSubEvents.filter((id) => rule.whenSubEvents!.includes(id))
      : state.selectedSubEvents;

    const targets = candidates.filter((id) => {
      const cfg = state.subEventConfig[id];
      if (!cfg) return false;
      return rule.suggest.type === "coverage"
        ? !cfg.coverage.includes(rule.suggest.id)
        : !cfg.addOns.includes(rule.suggest.id);
    });

    if (targets.length === 0) continue;

    result.push({
      ruleId: rule.id,
      message: rule.message,
      suggest: rule.suggest,
      targetSubEvents: targets,
    });
  }

  return result;
}
