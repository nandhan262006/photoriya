import type { EventTemplate } from "../types";
import {
  ALBUM_DEFAULTS,
  DEFAULT_ADDON_PRICES,
  DEFAULT_COVERAGE_PRICES,
  DEFAULT_MAX_REELS,
  DEFAULT_REEL_PRICE,
  commonRecommendations,
  deliverableRulesFor,
} from "./shared";

const ALL_COVERAGE = [
  "traditional_photography",
  "traditional_videography",
  "candid_photography",
  "cinematic_videography",
  "drone",
];

const ALL_ADDONS = [
  "led_screen",
  "live_streaming",
  "crane",
  "booth_360",
  "instant_prints",
  "photobooth",
  "same_day_edit",
];

/** Main-day events command higher coverage prices than ceremonies. */
const MAIN_DAY_COVERAGE = {
  candid_photography: { min: 45000, max: 75000 },
  cinematic_videography: { min: 60000, max: 100000 },
  drone: { min: 20000, max: 35000 },
  traditional_photography: { min: 12000, max: 20000 },
  traditional_videography: { min: 18000, max: 30000 },
};

export const weddingTemplate: EventTemplate = {
  id: "wedding",
  name: "Wedding",
  tagline: "Full wedding coverage, from ceremonies to the reception.",
  description:
    "Build a complete photography & videography package across all your wedding functions.",
  icon: "heart",
  coverageOptions: ALL_COVERAGE,
  addOnOptions: ALL_ADDONS,
  defaultCoveragePrices: DEFAULT_COVERAGE_PRICES,
  defaultAddOnPrices: DEFAULT_ADDON_PRICES,
  defaultReelPrice: DEFAULT_REEL_PRICE,
  defaultMaxReels: DEFAULT_MAX_REELS,
  subEvents: [
    { id: "engagement", name: "Engagement" },
    { id: "bridal_ceremony", name: "Bridal Ceremony" },
    { id: "groom_ceremony", name: "Groom Ceremony" },
    { id: "pasupu_bride", name: "Pasupu Ceremony (Bride)" },
    { id: "pasupu_groom", name: "Pasupu Ceremony (Groom)" },
    { id: "lagnapatrika", name: "Lagnapatrika" },
    { id: "sangeet", name: "Sangeet" },
    { id: "haldi_bride", name: "Haldi (Bride)" },
    { id: "haldi_groom", name: "Haldi (Groom)" },
    { id: "haldi_together", name: "Haldi Together" },
    {
      id: "wedding",
      name: "Wedding",
      defaultSelected: true,
      coverage: MAIN_DAY_COVERAGE,
    },
    {
      id: "reception",
      name: "Reception",
      defaultSelected: true,
      coverage: MAIN_DAY_COVERAGE,
    },
    { id: "vratham", name: "Vratham" },
    { id: "cocktail_party", name: "Cocktail Party" },
    { id: "other", name: "Other" },
  ],
  album: ALBUM_DEFAULTS,
  deliverableRules: deliverableRulesFor(ALL_COVERAGE, ALL_ADDONS),
  recommendationRules: [
    ...commonRecommendations(),
    {
      id: "rec-wedding-cinematic",
      suggest: { type: "coverage", id: "cinematic_videography" },
      message: "Add Cinematic Videography to your Wedding day for a film-grade highlight.",
      whenSubEvents: ["wedding"],
    },
    {
      id: "rec-reception-prints",
      suggest: { type: "addon", id: "instant_prints" },
      message: "Instant Prints at the Reception are a hit with guests.",
      whenSubEvents: ["reception"],
    },
  ],
};
