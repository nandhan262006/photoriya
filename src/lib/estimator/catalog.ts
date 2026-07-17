/**
 * Shared option vocabulary for coverage and add-on services.
 *
 * Templates reference these by `id` and only carry pricing. Keeping labels,
 * icons and descriptions in one place means a copy change updates every event
 * template at once, and a future CMS template builder only stores ids + prices.
 */
import type { AddOnOption, CoverageOption, ID } from "./types";

export const COVERAGE_OPTIONS: CoverageOption[] = [
  {
    id: "traditional_photography",
    label: "Traditional Photography",
    icon: "camera",
    description: "Classic posed and event-coverage photography.",
  },
  {
    id: "traditional_videography",
    label: "Traditional Videography",
    icon: "video",
    description: "Full event coverage on video in a traditional style.",
  },
  {
    id: "candid_photography",
    label: "Candid Photography",
    icon: "aperture",
    description: "Unposed, documentary-style storytelling photos.",
  },
  {
    id: "cinematic_videography",
    label: "Cinematic Videography",
    icon: "film",
    description: "Film-grade cinematography with a highlight reel.",
  },
  {
    id: "drone",
    label: "Drone",
    icon: "drone",
    description: "Aerial coverage and sweeping venue shots.",
  },
];

export const ADD_ON_OPTIONS: AddOnOption[] = [
  {
    id: "led_screen",
    label: "LED Screen",
    icon: "monitor",
    description: "Large LED wall for live playback and visuals at the venue.",
  },
  {
    id: "live_streaming",
    label: "Live Streaming",
    icon: "radio",
    description: "Broadcast the event live for remote family and friends.",
  },
  {
    id: "crane",
    label: "Crane",
    icon: "crane",
    description: "Cine crane for sweeping, elevated motion shots.",
  },
  {
    id: "booth_360",
    label: "360 Booth",
    icon: "rotate",
    description: "360° video booth experience for guests.",
  },
  {
    id: "instant_prints",
    label: "Instant Prints",
    icon: "printer",
    description: "On-the-spot printed photos for guests to take home.",
  },
  {
    id: "photobooth",
    label: "Photo Booth",
    icon: "smile",
    description: "Classic photo booth with props and prints.",
  },
  {
    id: "same_day_edit",
    label: "Same-Day Edit",
    icon: "wand",
    description: "A quick highlight edit screened at the event itself.",
  },
];

const COVERAGE_BY_ID = new Map(COVERAGE_OPTIONS.map((o) => [o.id, o]));
const ADD_ON_BY_ID = new Map(ADD_ON_OPTIONS.map((o) => [o.id, o]));

export function getCoverageOption(id: ID) {
  return COVERAGE_BY_ID.get(id);
}

export function getAddOnOption(id: ID) {
  return ADD_ON_BY_ID.get(id);
}
