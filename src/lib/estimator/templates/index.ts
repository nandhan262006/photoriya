/**
 * Template loader.
 *
 * For v1 templates are static TypeScript modules — instant, type-safe and
 * version controlled. The signature is async so that a future Template
 * Builder backed by a database or Sanity CMS can replace only this file's
 * implementation without touching the rendering layer or the pricing engine.
 */
import type { EventTemplate, ID } from "../types";
import {
  anniversaryTemplate,
  babyShowerTemplate,
  birthdayTemplate,
  halfSareeTemplate,
  housewarmingTemplate,
} from "./other-events";
import { weddingTemplate } from "./wedding";

const TEMPLATES: EventTemplate[] = [
  weddingTemplate,
  birthdayTemplate,
  halfSareeTemplate,
  babyShowerTemplate,
  housewarmingTemplate,
  anniversaryTemplate,
];

/** Load all available event templates. */
export async function loadTemplates(): Promise<EventTemplate[]> {
  return TEMPLATES;
}

/** Load a single template by id, or null if it does not exist. */
export async function loadTemplate(id: ID | null): Promise<EventTemplate | null> {
  if (!id) return null;
  return TEMPLATES.find((t) => t.id === id) ?? null;
}
