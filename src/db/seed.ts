import { db } from ".";
import { users, services, photographers, timeSlots } from "./schema";
import { hash } from "bcryptjs";

async function seed() {
  const hashedPassword = await hash("admin123", 12);

  const [admin] = await db
    .insert(users)
    .values({
      name: "Admin",
      email: "admin@studiobook.com",
      password: hashedPassword,
      role: "admin",
    })
    .returning();

  console.log("Admin created:", admin.email);

  const serviceData = [
    {
      name: "Portrait Session",
      description:
        "Professional portrait photography in studio or outdoors. Perfect for headshots, personal branding, or family portraits.",
      duration: 60,
      price: "150.00",
    },
    {
      name: "Wedding Package",
      description:
        "Full-day wedding coverage with two photographers. Includes engagement shoot, ceremony, reception, and edited gallery.",
      duration: 480,
      price: "2500.00",
    },
    {
      name: "Event Photography",
      description:
        "Coverage for corporate events, parties, and special occasions. Hourly rate with digital delivery within 48 hours.",
      duration: 120,
      price: "300.00",
    },
    {
      name: "Product Photography",
      description:
        "High-quality product shots for e-commerce, catalogs, and marketing materials. Includes white background and lifestyle options.",
      duration: 90,
      price: "200.00",
    },
    {
      name: "Real Estate Shoot",
      description:
        "Professional real estate photography including HDR interiors, exterior shots, and virtual tour options.",
      duration: 60,
      price: "250.00",
    },
    {
      name: "Mini Session",
      description:
        "Quick 30-minute session perfect for maternity, newborn, or pet photos. 10 edited digital images included.",
      duration: 30,
      price: "85.00",
    },
  ];

  for (const s of serviceData) {
    await db.insert(services).values(s).returning();
  }
  console.log("Services seeded:", serviceData.length);

  const photographerData = [
    { name: "Alex Rivera", email: "alex@studiobook.com", phone: "+1-555-0101" },
    {
      name: "Sarah Chen",
      email: "sarah@studiobook.com",
      phone: "+1-555-0102",
    },
    {
      name: "Marcus Johnson",
      email: "marcus@studiobook.com",
      phone: "+1-555-0103",
    },
  ];

  for (const p of photographerData) {
    await db
      .insert(photographers)
      .values({
        ...p,
        bio: `Experienced photographer specializing in various styles.`,
      })
      .returning();
  }
  console.log("Photographers seeded:", photographerData.length);

  const photographers_result = await db.select().from(photographers);
  const slots = [];
  const times = [
    { start: "09:00", end: "12:00" },
    { start: "13:00", end: "17:00" },
  ];

  for (const p of photographers_result) {
    for (let day = 1; day <= 5; day++) {
      for (const t of times) {
        slots.push({
          photographerId: p.id,
          dayOfWeek: day,
          startTime: t.start,
          endTime: t.end,
        });
      }
    }
  }

  for (const slot of slots) {
    await db.insert(timeSlots).values(slot);
  }
  console.log("Time slots seeded:", slots.length);

  console.log("Seed complete!");
}

seed().catch(console.error);
