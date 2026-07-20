import "dotenv/config";
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  await turso.execute("DROP TABLE IF EXISTS SubEvent");
  await turso.execute("DROP TABLE IF EXISTS EventTemplate");
  await turso.execute("DROP TABLE IF EXISTS Booking");
  await turso.execute("DROP TABLE IF EXISTS Photographer");
  await turso.execute("DROP TABLE IF EXISTS Service");

  await turso.execute(`CREATE TABLE IF NOT EXISTS Service (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    duration INTEGER NOT NULL,
    price TEXT NOT NULL,
    image TEXT,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  await turso.execute(`CREATE TABLE IF NOT EXISTS Photographer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    bio TEXT,
    image TEXT,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  await turso.execute(`CREATE TABLE IF NOT EXISTS Booking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientName TEXT NOT NULL,
    clientEmail TEXT NOT NULL,
    clientPhone TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    bookingDate TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    totalPrice TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    serviceId INTEGER NOT NULL,
    photographerId INTEGER NOT NULL,
    FOREIGN KEY (serviceId) REFERENCES Service(id),
    FOREIGN KEY (photographerId) REFERENCES Photographer(id)
  )`);

  await turso.execute(`CREATE TABLE IF NOT EXISTS EventTemplate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    typeId TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'heart',
    isActive INTEGER NOT NULL DEFAULT 1,
    defaultMaxReels INTEGER NOT NULL DEFAULT 3,
    defaultReelMin INTEGER NOT NULL DEFAULT 4000,
    defaultReelMax INTEGER NOT NULL DEFAULT 8000,
    coverageOptions TEXT NOT NULL DEFAULT '[]',
    addOnOptions TEXT NOT NULL DEFAULT '[]',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  await turso.execute(`CREATE TABLE IF NOT EXISTS SubEvent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subEventId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    defaultSelected INTEGER NOT NULL DEFAULT 0,
    maxReels INTEGER,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    priceOverrides TEXT NOT NULL DEFAULT '{}',
    templateId INTEGER NOT NULL,
    FOREIGN KEY (templateId) REFERENCES EventTemplate(id) ON DELETE CASCADE,
    UNIQUE(subEventId, templateId)
  )`);

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

  console.log("Turso database synced and seeded successfully.");
}

main().catch(console.error);
