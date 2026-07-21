import "dotenv/config";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS EventTemplate (
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
      defaultPrices TEXT NOT NULL DEFAULT '{}',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS SubEvent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subEventId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      defaultSelected INTEGER NOT NULL DEFAULT 0,
      maxReels INTEGER,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      priceOverrides TEXT NOT NULL DEFAULT '{}',
      templateId INTEGER NOT NULL,
      FOREIGN KEY (templateId) REFERENCES EventTemplate(id) ON DELETE CASCADE
    )
  `);

  await client.execute(`CREATE TABLE IF NOT EXISTS Service (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT NOT NULL, duration INTEGER NOT NULL, price TEXT NOT NULL, image TEXT, isActive INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now')))`);
  await client.execute(`CREATE TABLE IF NOT EXISTS Photographer (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, bio TEXT, image TEXT, isActive INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL DEFAULT (datetime('now')))`);
  await client.execute(`CREATE TABLE IF NOT EXISTS Booking (id INTEGER PRIMARY KEY AUTOINCREMENT, clientName TEXT NOT NULL, clientEmail TEXT NOT NULL, clientPhone TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', bookingDate TEXT NOT NULL, startTime TEXT NOT NULL, endTime TEXT NOT NULL, totalPrice TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'confirmed', createdAt TEXT NOT NULL DEFAULT (datetime('now')), serviceId INTEGER NOT NULL, photographerId INTEGER NOT NULL, FOREIGN KEY (serviceId) REFERENCES Service(id), FOREIGN KEY (photographerId) REFERENCES Photographer(id))`);
  await client.execute(`CREATE TABLE IF NOT EXISTS EstimateLead (id INTEGER PRIMARY KEY AUTOINCREMENT, clientName TEXT NOT NULL, clientPhone TEXT NOT NULL, eventType TEXT NOT NULL, eventName TEXT NOT NULL DEFAULT '', estimateData TEXT NOT NULL DEFAULT '{}', createdAt TEXT NOT NULL DEFAULT (datetime('now')))`);

  console.log("Tables created");

  const existing = await client.execute("SELECT COUNT(*) as cnt FROM EventTemplate");
  if ((existing.rows[0] as { cnt: number }).cnt > 0) {
    console.log("Already seeded, skipping");
    return;
  }

  const coverageIds = JSON.stringify(["traditional_photography","traditional_videography","candid_photography","cinematic_videography","drone"]);
  const addonIds = JSON.stringify(["led_screen","live_streaming","ai_gallery","instant_teaser"]);
  const dp = JSON.stringify({coverage:{traditional_photography:12000,traditional_videography:16000,candid_photography:35000,cinematic_videography:45000,drone:20000},addOns:{led_screen:25000,live_streaming:15000,ai_gallery:25000,instant_teaser:20000}});

  const tpls: [string,string,string,string,string,[string,string,number,number][]][] = [
    ["wedding","Wedding","Full wedding coverage, from ceremonies to the reception.","Build a complete photography & videography package across all your wedding functions.","heart",[["engagement","Engagement",0,1],["bonalu","Bonalu",0,2],["pre_wedding_rituals","Pre Wedding Rituals",0,3],["bridal_ceremony","Bridal Ceremony",0,4],["groom_ceremony","Groom Ceremony",0,5],["pasupu_bride","Pasupu Ceremony (Bride)",0,6],["pasupu_groom","Pasupu Ceremony (Groom)",0,7],["lagnapatrika","Lagnapatrika",0,8],["sangeet","Sangeet",0,9],["haldi_bride","Haldi (Bride)",0,10],["haldi_groom","Haldi (Groom)",0,11],["haldi_together","Haldi Together",0,12],["baraath","Baraath",0,13],["wedding","Wedding",1,14],["pre_reception","Pre Reception",0,15],["reception","Reception",1,16],["vratham","Vratham",0,17],["cocktail_party","Cocktail Party",0,18],["other","Other",0,19]]],
    ["birthday","Birthday","Birthdays, milestone parties and surprise celebrations.","Capture every smile, cake cut and dance-floor moment.","cake",[["family_party","Family Party / Cocktail Party",1,1],["pre_shoot","Pre Shoot / Cake Smash",0,2],["main_birthday","Main Birthday Event",0,3],["other","Other",0,4]]],
    ["half_saree","Saree or Dhothi Ceremony","Traditional ceremonies, rituals and celebrations.","Document the traditions, rituals and the celebration around them.","flower",[["haldi","Haldi",1,1],["mehendi","Mehendi",0,2],["sangeet","Sangeeth",0,3],["cocktail_party","Cocktail Party",0,4],["main_event","Main Event",0,5],["other","Other",0,6]]],
    ["baby_shower","Baby Shower","Blessings, games and tender moments with family.","A warm, intimate celebration captured end to end.","baby",[["welcome","Welcome",0,1],["pooja","Pooja",1,2],["blessings","Blessings",0,3],["games","Games",0,4],["photoshoot","Photoshoot",1,5],["other","Other",0,6]]],
    ["housewarming","Housewarming","Pooja, homam and family portraits for your new home.","Preserve the rituals and the joy of a new beginning.","home",[["house_warming","House Warming",1,1],["sathyanarayana_vratham","Sathyanarayana Vratham",0,2],["other","Other",0,3]]],
    ["anniversary","Anniversary","Renewal of vows, cake cutting and a celebratory party.","Celebrate milestones with coverage tailored to the occasion.","gift",[["welcome","Welcome",0,1],["cake_cutting","Cake Cutting",1,2],["renewal_vows","Renewal of Vows",0,3],["party","Party",1,4],["photoshoot","Couple Photoshoot",0,5],["other","Other",0,6]]],
    ["corporate","Corporate Event","Conferences, launches, awards and gala dinners.","Polished coverage for brand events and corporate functions.","building",[["inauguration","Inauguration",1,1],["speeches","Speeches / Keynote",0,2],["panel","Panel / Session",0,3],["awards","Awards",1,4],["networking","Networking",0,5],["gala_dinner","Gala Dinner",0,6],["other","Other",0,7]]]
  ];

  for (const [typeId,name,tagline,desc,icon,se] of tpls) {
    const r = await client.execute({sql:`INSERT INTO EventTemplate (typeId, name, tagline, description, icon, coverageOptions, addOnOptions, defaultPrices) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,args:[typeId,name,tagline,desc,icon,coverageIds,addonIds,dp]});
    const tid = Number(r.lastInsertRowid);
    for (const [sid,sname,sel,ord] of se) {
      await client.execute({sql:`INSERT INTO SubEvent (subEventId, name, defaultSelected, sortOrder, templateId) VALUES (?, ?, ?, ?, ?)`,args:[sid,sname,sel,ord,tid]});
    }
  }

  const es = await client.execute("SELECT COUNT(*) as cnt FROM Service");
  if ((es.rows[0] as {cnt:number}).cnt===0) {
    for (const s of [["Wedding Photography","Full-day wedding coverage with 2 photographers","480","75000"],["Event Photography","Birthday, anniversary, or special event coverage","240","35000"],["Pre-Wedding Shoot","Creative pre-wedding photoshoot at location of choice","180","25000"],["Corporate Event","Professional coverage for corporate functions","360","50000"],["Portrait Session","Individual or family portrait photography","120","15000"]]) {
      await client.execute({sql:`INSERT INTO Service (name, description, duration, price) VALUES (?, ?, ?, ?)`,args:s as [string,string,string,string]});
    }
  }

  const ep = await client.execute("SELECT COUNT(*) as cnt FROM Photographer");
  if ((ep.rows[0] as {cnt:number}).cnt===0) {
    await client.execute({sql:`INSERT INTO Photographer (name, email, phone, bio) VALUES (?, ?, ?, ?)`,args:["Venky","venky@photriya.com","+91 98765 43210","Lead photographer with 10+ years of experience"]});
  }

  console.log("Seeded", tpls.length, "templates, 5 services, 1 photographer");
}

main().catch(console.error);