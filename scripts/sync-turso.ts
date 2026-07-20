import "dotenv/config";
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  // Drop and recreate tables
  await turso.execute("DROP TABLE IF EXISTS SubEvent");
  await turso.execute("DROP TABLE IF EXISTS EventTemplate");
  await turso.execute("DROP TABLE IF EXISTS Booking");
  await turso.execute("DROP TABLE IF EXISTS Photographer");
  await turso.execute("DROP TABLE IF EXISTS Service");

  await turso.execute(`CREATE TABLE IF NOT EXISTS Service (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT NOT NULL,
    duration INTEGER NOT NULL, price TEXT NOT NULL, image TEXT,
    isActive INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS Photographer (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL,
    phone TEXT, bio TEXT, image TEXT, isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS Booking (
    id INTEGER PRIMARY KEY AUTOINCREMENT, clientName TEXT NOT NULL, clientEmail TEXT NOT NULL,
    clientPhone TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', bookingDate TEXT NOT NULL,
    startTime TEXT NOT NULL, endTime TEXT NOT NULL, totalPrice TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed', createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    serviceId INTEGER NOT NULL, photographerId INTEGER NOT NULL,
    FOREIGN KEY (serviceId) REFERENCES Service(id),
    FOREIGN KEY (photographerId) REFERENCES Photographer(id)
  )`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS EventTemplate (
    id INTEGER PRIMARY KEY AUTOINCREMENT, typeId TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
    tagline TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'heart', isActive INTEGER NOT NULL DEFAULT 1,
    defaultMaxReels INTEGER NOT NULL DEFAULT 3, defaultReelMin INTEGER NOT NULL DEFAULT 4000,
    defaultReelMax INTEGER NOT NULL DEFAULT 8000,
    coverageOptions TEXT NOT NULL DEFAULT '[]', addOnOptions TEXT NOT NULL DEFAULT '[]',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS SubEvent (
    id INTEGER PRIMARY KEY AUTOINCREMENT, subEventId TEXT NOT NULL, name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '', defaultSelected INTEGER NOT NULL DEFAULT 0,
    maxReels INTEGER, sortOrder INTEGER NOT NULL DEFAULT 0,
    priceOverrides TEXT NOT NULL DEFAULT '{}', templateId INTEGER NOT NULL,
    FOREIGN KEY (templateId) REFERENCES EventTemplate(id) ON DELETE CASCADE,
    UNIQUE(subEventId, templateId)
  )`);

  // Seed services
  await turso.execute(`INSERT INTO Service (name, description, duration, price) VALUES
    ('Wedding Photography', 'Full-day wedding coverage with 2 photographers', 480, '75000'),
    ('Event Photography', 'Birthday, anniversary, or special event coverage', 240, '35000'),
    ('Pre-Wedding Shoot', 'Creative pre-wedding photoshoot at location of choice', 180, '25000'),
    ('Corporate Event', 'Professional coverage for corporate functions', 360, '50000'),
    ('Portrait Session', 'Individual or family portrait photography', 120, '15000')
  `);
  await turso.execute(`INSERT INTO Photographer (name, email, phone, bio) VALUES
    ('Venky', 'venky@photriya.com', '+91 98765 43210', 'Lead photographer with 10+ years of experience')
  `);

  // Helper to insert template and return its id
  type PriceRange = { min: number; max: number };

  async function insertTemplate(
    typeId: string, name: string, tagline: string, description: string, icon: string,
    defaultMaxReels: number, defaultReelMin: number, defaultReelMax: number,
    coverageOptions: string[], addOnOptions: string[],
  ): Promise<number> {
    const result = await turso.execute({
      sql: `INSERT INTO EventTemplate (typeId, name, tagline, description, icon, isActive, defaultMaxReels, defaultReelMin, defaultReelMax, coverageOptions, addOnOptions)
            VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?) RETURNING id`,
      args: [typeId, name, tagline, description, icon, defaultMaxReels, defaultReelMin, defaultReelMax, JSON.stringify(coverageOptions), JSON.stringify(addOnOptions)],
    });
    return Number(result.rows[0].id);
  }

  async function insertSubEvent(
    templateId: number, subEventId: string, name: string, description: string,
    defaultSelected: boolean, maxReels: number | null, sortOrder: number,
    coverageOverrides: Record<string, PriceRange> | null,
    addOnOverrides: Record<string, PriceRange> | null,
    reelOverride: PriceRange | null,
  ) {
    const overrides: Record<string, unknown> = {};
    if (coverageOverrides) overrides.coverage = coverageOverrides;
    if (addOnOverrides) overrides.addOns = addOnOverrides;
    if (reelOverride) overrides.reel = reelOverride;

    await turso.execute({
      sql: `INSERT INTO SubEvent (templateId, subEventId, name, description, defaultSelected, maxReels, sortOrder, priceOverrides)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [templateId, subEventId, name, description, defaultSelected ? 1 : 0, maxReels, sortOrder, JSON.stringify(overrides)],
    });
  }

  const ALL_COVERAGE = ["traditional_photography","traditional_videography","candid_photography","cinematic_videography","drone"];
  const WEDDING_ADDONS = ["led_screen","live_streaming","crane","booth_360","instant_prints","photobooth","same_day_edit"];
  const PARTY_ADDONS = ["booth_360","instant_prints","photobooth","same_day_edit","led_screen"];
  const INTIMATE_ADDONS = ["instant_prints","photobooth","booth_360","live_streaming"];

  const MAIN_DAY_COVERAGE: Record<string, PriceRange> = {
    candid_photography: { min: 45000, max: 75000 },
    cinematic_videography: { min: 60000, max: 100000 },
    drone: { min: 20000, max: 35000 },
    traditional_photography: { min: 12000, max: 20000 },
    traditional_videography: { min: 18000, max: 30000 },
  };

  // --- WEDDING ---
  let tid = await insertTemplate("wedding", "Wedding", "Full wedding coverage, from ceremonies to the reception.",
    "Build a complete photography & videography package across all your wedding functions.", "heart", 3, 4000, 8000, ALL_COVERAGE, WEDDING_ADDONS);

  const weddingSubs: [string, string, string, boolean, number | null, number, Record<string, PriceRange> | null, Record<string, PriceRange> | null, PriceRange | null][] = [
    ["engagement", "Engagement", "", false, null, 0, null, null, null],
    ["bonalu", "Bonalu", "", false, null, 1, null, null, null],
    ["pre_wedding_rituals", "Pre Wedding Rituals", "", false, null, 2, null, null, null],
    ["bridal_ceremony", "Bridal Ceremony", "", false, null, 3, null, null, null],
    ["groom_ceremony", "Groom Ceremony", "", false, null, 4, null, null, null],
    ["pasupu_bride", "Pasupu Ceremony (Bride)", "", false, null, 5, null, null, null],
    ["pasupu_groom", "Pasupu Ceremony (Groom)", "", false, null, 6, null, null, null],
    ["lagnapatrika", "Lagnapatrika", "", false, null, 7, null, null, null],
    ["sangeet", "Sangeet", "", false, null, 8, null, null, null],
    ["haldi_bride", "Haldi (Bride)", "", false, null, 9, null, null, null],
    ["haldi_groom", "Haldi (Groom)", "", false, null, 10, null, null, null],
    ["haldi_together", "Haldi Together", "", false, null, 11, null, null, null],
    ["baraath", "Baraath", "", false, null, 12, null, null, null],
    ["wedding", "Wedding", "", true, null, 13, MAIN_DAY_COVERAGE, null, null],
    ["pre_reception", "Pre Reception", "", false, null, 14, null, null, null],
    ["reception", "Reception", "", true, null, 15, MAIN_DAY_COVERAGE, null, null],
    ["vratham", "Vratham", "", false, null, 16, null, null, null],
    ["cocktail_party", "Cocktail Party", "", false, null, 17, null, null, null],
    ["other", "Other", "", false, null, 18, null, null, null],
  ];
  for (const [id, name, desc, def, max, order, cov, add, reel] of weddingSubs) {
    await insertSubEvent(tid, id, name, desc, def, max, order, cov, add, reel);
  }

  // --- BIRTHDAY ---
  tid = await insertTemplate("birthday", "Birthday", "Birthdays, milestone parties and surprise celebrations.",
    "Capture every smile, cake cut and dance-floor moment.", "cake", 3, 4000, 8000, ALL_COVERAGE, PARTY_ADDONS);
  await insertSubEvent(tid, "family_party", "Family Party / Cocktail Party", "", true, null, 0, null, null, null);
  await insertSubEvent(tid, "pre_shoot", "Pre Shoot / Cake Smash", "", false, null, 1, null, null, null);
  await insertSubEvent(tid, "main_birthday", "Main Birthday Event", "", false, null, 2, null, null, null);
  await insertSubEvent(tid, "other", "Other", "", false, null, 3, null, null, null);

  // --- SAREE / DHOTHI ---
  tid = await insertTemplate("half_saree", "Saree or Dhothi Ceremony", "Traditional ceremonies, rituals and celebrations.",
    "Document the traditions, rituals and the celebration around them.", "flower", 3, 4000, 8000, ALL_COVERAGE, PARTY_ADDONS);
  await insertSubEvent(tid, "haldi", "Haldi", "", true, null, 0, null, null, null);
  await insertSubEvent(tid, "mehendi", "Mehendi", "", false, null, 1, null, null, null);
  await insertSubEvent(tid, "sangeet", "Sangeeth", "", false, null, 2, null, null, null);
  await insertSubEvent(tid, "cocktail_party", "Cocktail Party", "", false, null, 3, null, null, null);
  await insertSubEvent(tid, "main_event", "Main Event", "", false, null, 4, null, null, null);
  await insertSubEvent(tid, "other", "Other", "", false, null, 5, null, null, null);

  // --- BABY SHOWER ---
  tid = await insertTemplate("baby_shower", "Baby Shower", "Blessings, games and tender moments with family.",
    "A warm, intimate celebration captured end to end.", "baby", 3, 4000, 8000, ALL_COVERAGE, INTIMATE_ADDONS);
  await insertSubEvent(tid, "welcome", "Welcome", "", false, null, 0, null, null, null);
  await insertSubEvent(tid, "pooja", "Pooja", "", true, null, 1, null, null, null);
  await insertSubEvent(tid, "blessings", "Blessings", "", false, null, 2, null, null, null);
  await insertSubEvent(tid, "games", "Games", "", false, null, 3, null, null, null);
  await insertSubEvent(tid, "photoshoot", "Photoshoot", "", true, null, 4, null, null, null);
  await insertSubEvent(tid, "other", "Other", "", false, null, 5, null, null, null);

  // --- HOUSEWARMING ---
  tid = await insertTemplate("housewarming", "Housewarming", "Pooja, homam and family portraits for your new home.",
    "Preserve the rituals and the joy of a new beginning.", "home", 3, 4000, 8000, ALL_COVERAGE, INTIMATE_ADDONS);
  await insertSubEvent(tid, "house_warming", "House Warming", "", true, null, 0, null, null, null);
  await insertSubEvent(tid, "sathyanarayana_vratham", "Sathyanarayana Vratham", "", false, null, 1, null, null, null);
  await insertSubEvent(tid, "other", "Other", "", false, null, 2, null, null, null);

  // --- ANNIVERSARY ---
  tid = await insertTemplate("anniversary", "Anniversary", "Renewal of vows, cake cutting and a celebratory party.",
    "Celebrate milestones with coverage tailored to the occasion.", "gift", 3, 4000, 8000, ALL_COVERAGE, PARTY_ADDONS);
  await insertSubEvent(tid, "welcome", "Welcome", "", false, null, 0, null, null, null);
  await insertSubEvent(tid, "cake_cutting", "Cake Cutting", "", true, null, 1, null, null, null);
  await insertSubEvent(tid, "renewal_vows", "Renewal of Vows", "", false, null, 2, null, null, null);
  await insertSubEvent(tid, "party", "Party", "", true, null, 3, null, null, null);
  await insertSubEvent(tid, "photoshoot", "Couple Photoshoot", "", false, null, 4, null, null, null);
  await insertSubEvent(tid, "other", "Other", "", false, null, 5, null, null, null);

  console.log("Turso database fully seeded with all event templates and sub-events.");
}

main().catch(console.error);
