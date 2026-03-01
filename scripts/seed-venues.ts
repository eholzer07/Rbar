import fs from "fs";
import path from "path";
import { db } from "../src/lib/db";
import { geocodeAddress } from "../src/lib/geocoding";

interface VenueRecord {
  name: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  phone?: string;
  website?: string;
  description?: string;
  teams: string[]; // e.g. ["NFL:CHI", "MLB:CHC"]
}

function toSlug(name: string, city: string): string {
  return `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveTeamId(
  key: string
): Promise<string | null> {
  const [leagueShortName, abbreviation] = key.split(":");
  if (!leagueShortName || !abbreviation) {
    console.warn(`  Invalid team key: ${key}`);
    return null;
  }

  const team = await db.team.findFirst({
    where: {
      abbreviation,
      league: { shortName: leagueShortName },
    },
    select: { id: true },
  });

  if (!team) {
    console.warn(`  Team not found for key: ${key}`);
  }
  return team?.id ?? null;
}

async function main() {
  const venuesDir = path.join(__dirname, "../data/venues");
  const files = fs.readdirSync(venuesDir).filter((f) => f.endsWith(".json"));

  let venuesCreated = 0;
  let venuesUpdated = 0;
  let venuesSkipped = 0;
  let teamLinksCreated = 0;

  for (const file of files) {
    const filePath = path.join(venuesDir, file);
    const records: VenueRecord[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(`\nProcessing ${file} — ${records.length} venues`);

    for (const record of records) {
      console.log(`\n  [${record.name}] ${record.city}, ${record.state}`);

      // Geocode with 1100ms delay to respect Nominatim rate limit
      await sleep(1100);
      const coords = await geocodeAddress(record.address, record.city, record.state);

      if (!coords) {
        console.warn(`  SKIP: geocoding failed`);
        venuesSkipped++;
        continue;
      }

      console.log(`  Geocoded: ${coords.lat}, ${coords.lng}`);

      const slug = toSlug(record.name, record.city);

      // Upsert venue by (name, city) — idempotent
      const existing = await db.venue.findFirst({
        where: { name: record.name, city: record.city },
        select: { id: true },
      });

      let venueId: string;

      if (existing) {
        await db.venue.update({
          where: { id: existing.id },
          data: {
            address: record.address,
            state: record.state,
            zip: record.zip,
            phone: record.phone,
            website: record.website,
            description: record.description,
            lat: coords.lat,
            lng: coords.lng,
          },
        });
        venueId = existing.id;
        venuesUpdated++;
        console.log(`  Updated existing venue (id: ${venueId})`);
      } else {
        const created = await db.venue.create({
          data: {
            name: record.name,
            slug,
            address: record.address,
            city: record.city,
            state: record.state,
            zip: record.zip,
            phone: record.phone,
            website: record.website,
            description: record.description,
            lat: coords.lat,
            lng: coords.lng,
          },
        });
        venueId = created.id;
        venuesCreated++;
        console.log(`  Created venue (id: ${venueId})`);
      }

      // Upsert VenueTeam links
      for (const teamKey of record.teams) {
        const teamId = await resolveTeamId(teamKey);
        if (!teamId) continue;

        const existingLink = await db.venueTeam.findUnique({
          where: { venueId_teamId: { venueId, teamId } },
          select: { id: true },
        });

        if (!existingLink) {
          await db.venueTeam.create({
            data: { venueId, teamId, isConfirmed: true },
          });
          teamLinksCreated++;
          console.log(`  Linked team: ${teamKey}`);
        }
      }
    }
  }

  // Populate PostGIS location field for all venues that have lat/lng but no location
  console.log("\nUpdating PostGIS location column...");
  await db.$executeRaw`
    UPDATE "Venue"
    SET location = ST_SetSRID(ST_MakePoint(CAST(lng AS float8), CAST(lat AS float8)), 4326)::geography
    WHERE location IS NULL AND lat IS NOT NULL AND lng IS NOT NULL
  `;

  console.log("\n=== Venue Seeding Complete ===");
  console.log(`  Venues created:      ${venuesCreated}`);
  console.log(`  Venues updated:      ${venuesUpdated}`);
  console.log(`  Venues skipped:      ${venuesSkipped}`);
  console.log(`  Team links created:  ${teamLinksCreated}`);

  await db.$disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
