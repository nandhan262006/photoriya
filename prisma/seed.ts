import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existingServices = await prisma.service.count();
  if (existingServices > 0) {
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

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
