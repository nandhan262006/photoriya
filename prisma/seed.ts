import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

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
  "ai_gallery",
  "instant_teaser",
];

async function main() {
  const existingTemplates = await prisma.eventTemplate.count();
  if (existingTemplates > 0) {
    console.log("Database already seeded.");
    return;
  }

  await prisma.service.createMany({
    data: [
      { name: "Wedding Photography", description: "Full-day wedding coverage with 2 photographers", duration: 480, price: "75000" },
      { name: "Event Photography", description: "Birthday, anniversary, or special event coverage", duration: 240, price: "35000" },
      { name: "Pre-Wedding Shoot", description: "Creative pre-wedding photoshoot at location of choice", duration: 180, price: "25000" },
      { name: "Corporate Event", description: "Professional coverage for corporate functions", duration: 360, price: "50000" },
      { name: "Portrait Session", description: "Individual or family portrait photography", duration: 120, price: "15000" },
    ],
  });

  await prisma.photographer.create({
    data: {
      name: "Venky",
      email: "venky@photriya.com",
      phone: "+91 98765 43210",
      bio: "Lead photographer with 10+ years of experience",
    },
  });

  const templates = [
    {
      typeId: "wedding",
      name: "Wedding",
      tagline: "Full wedding coverage, from ceremonies to the reception.",
      description: "Build a complete photography & videography package across all your wedding functions.",
      icon: "heart",
      subEvents: [
        { subEventId: "engagement", name: "Engagement", sortOrder: 1 },
        { subEventId: "bonalu", name: "Bonalu", sortOrder: 2 },
        { subEventId: "pre_wedding_rituals", name: "Pre Wedding Rituals", sortOrder: 3 },
        { subEventId: "bridal_ceremony", name: "Bridal Ceremony", sortOrder: 4 },
        { subEventId: "groom_ceremony", name: "Groom Ceremony", sortOrder: 5 },
        { subEventId: "pasupu_bride", name: "Pasupu Ceremony (Bride)", sortOrder: 6 },
        { subEventId: "pasupu_groom", name: "Pasupu Ceremony (Groom)", sortOrder: 7 },
        { subEventId: "lagnapatrika", name: "Lagnapatrika", sortOrder: 8 },
        { subEventId: "sangeet", name: "Sangeet", sortOrder: 9 },
        { subEventId: "haldi_bride", name: "Haldi (Bride)", sortOrder: 10 },
        { subEventId: "haldi_groom", name: "Haldi (Groom)", sortOrder: 11 },
        { subEventId: "haldi_together", name: "Haldi Together", sortOrder: 12 },
        { subEventId: "baraath", name: "Baraath", sortOrder: 13 },
        { subEventId: "wedding", name: "Wedding", defaultSelected: true, sortOrder: 14 },
        { subEventId: "pre_reception", name: "Pre Reception", sortOrder: 15 },
        { subEventId: "reception", name: "Reception", defaultSelected: true, sortOrder: 16 },
        { subEventId: "vratham", name: "Vratham", sortOrder: 17 },
        { subEventId: "cocktail_party", name: "Cocktail Party", sortOrder: 18 },
        { subEventId: "other", name: "Other", sortOrder: 19 },
      ],
    },
    {
      typeId: "birthday",
      name: "Birthday",
      tagline: "Birthdays, milestone parties and surprise celebrations.",
      description: "Capture every smile, cake cut and dance-floor moment.",
      icon: "cake",
      subEvents: [
        { subEventId: "family_party", name: "Family Party / Cocktail Party", defaultSelected: true, sortOrder: 1 },
        { subEventId: "pre_shoot", name: "Pre Shoot / Cake Smash", sortOrder: 2 },
        { subEventId: "main_birthday", name: "Main Birthday Event", sortOrder: 3 },
        { subEventId: "other", name: "Other", sortOrder: 4 },
      ],
    },
    {
      typeId: "half_saree",
      name: "Saree or Dhothi Ceremony",
      tagline: "Traditional ceremonies, rituals and celebrations.",
      description: "Document the traditions, rituals and the celebration around them.",
      icon: "flower",
      subEvents: [
        { subEventId: "haldi", name: "Haldi", defaultSelected: true, sortOrder: 1 },
        { subEventId: "mehendi", name: "Mehendi", sortOrder: 2 },
        { subEventId: "sangeet", name: "Sangeeth", sortOrder: 3 },
        { subEventId: "cocktail_party", name: "Cocktail Party", sortOrder: 4 },
        { subEventId: "main_event", name: "Main Event", sortOrder: 5 },
        { subEventId: "other", name: "Other", sortOrder: 6 },
      ],
    },
    {
      typeId: "baby_shower",
      name: "Baby Shower",
      tagline: "Blessings, games and tender moments with family.",
      description: "A warm, intimate celebration captured end to end.",
      icon: "baby",
      subEvents: [
        { subEventId: "welcome", name: "Welcome", sortOrder: 1 },
        { subEventId: "pooja", name: "Pooja", defaultSelected: true, sortOrder: 2 },
        { subEventId: "blessings", name: "Blessings", sortOrder: 3 },
        { subEventId: "games", name: "Games", sortOrder: 4 },
        { subEventId: "photoshoot", name: "Photoshoot", defaultSelected: true, sortOrder: 5 },
        { subEventId: "other", name: "Other", sortOrder: 6 },
      ],
    },
    {
      typeId: "housewarming",
      name: "Housewarming",
      tagline: "Pooja, homam and family portraits for your new home.",
      description: "Preserve the rituals and the joy of a new beginning.",
      icon: "home",
      subEvents: [
        { subEventId: "house_warming", name: "House Warming", defaultSelected: true, sortOrder: 1 },
        { subEventId: "sathyanarayana_vratham", name: "Sathyanarayana Vratham", sortOrder: 2 },
        { subEventId: "other", name: "Other", sortOrder: 3 },
      ],
    },
    {
      typeId: "anniversary",
      name: "Anniversary",
      tagline: "Renewal of vows, cake cutting and a celebratory party.",
      description: "Celebrate milestones with coverage tailored to the occasion.",
      icon: "gift",
      subEvents: [
        { subEventId: "welcome", name: "Welcome", sortOrder: 1 },
        { subEventId: "cake_cutting", name: "Cake Cutting", defaultSelected: true, sortOrder: 2 },
        { subEventId: "renewal_vows", name: "Renewal of Vows", sortOrder: 3 },
        { subEventId: "party", name: "Party", defaultSelected: true, sortOrder: 4 },
        { subEventId: "photoshoot", name: "Couple Photoshoot", sortOrder: 5 },
        { subEventId: "other", name: "Other", sortOrder: 6 },
      ],
    },
    {
      typeId: "corporate",
      name: "Corporate Event",
      tagline: "Conferences, launches, awards and gala dinners.",
      description: "Polished coverage for brand events and corporate functions.",
      icon: "building",
      subEvents: [
        { subEventId: "inauguration", name: "Inauguration", defaultSelected: true, sortOrder: 1 },
        { subEventId: "speeches", name: "Speeches / Keynote", sortOrder: 2 },
        { subEventId: "panel", name: "Panel / Session", sortOrder: 3 },
        { subEventId: "awards", name: "Awards", defaultSelected: true, sortOrder: 4 },
        { subEventId: "networking", name: "Networking", sortOrder: 5 },
        { subEventId: "gala_dinner", name: "Gala Dinner", sortOrder: 6 },
        { subEventId: "other", name: "Other", sortOrder: 7 },
      ],
    },
  ];

  for (const tmpl of templates) {
    await prisma.eventTemplate.create({
      data: {
        typeId: tmpl.typeId,
        name: tmpl.name,
        tagline: tmpl.tagline,
        description: tmpl.description,
        icon: tmpl.icon,
        coverageOptions: JSON.stringify(COVERAGE_IDS),
        addOnOptions: JSON.stringify(ADDON_IDS),
        defaultPrices: JSON.stringify({
          coverage: {
            traditional_photography: 12000,
            traditional_videography: 16000,
            candid_photography: 35000,
            cinematic_videography: 45000,
            drone: 20000,
          },
          addOns: {
            led_screen: 25000,
            live_streaming: 15000,
            ai_gallery: 25000,
            instant_teaser: 20000,
          },
        }),
        subEvents: {
          create: tmpl.subEvents.map((se) => ({
            subEventId: se.subEventId,
            name: se.name,
            defaultSelected: se.defaultSelected ?? false,
            sortOrder: se.sortOrder,
            priceOverrides: se.priceOverrides ?? "{}",
          })),
        },
      },
    });
  }

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
