# Chunk 4 — Venue Data Seeding (Pilot: Chicago + NYC)

**Completed:** 2026-03-01
**Status:** ✅ COMPLETE

---

## What Was Built

A research-first venue seeding pipeline for 2 pilot cities (Chicago and NYC). The goal was to
populate the `Venue` table with real sports bars to power Chunk 7 venue search testing.

**Final counts:**
- 36 venues seeded (18 Chicago, 18 NYC)
- 119 VenueTeam links created
- All venues have `lat`, `lng`, and PostGIS `location` (geography point)

---

## Files Created

| File | Purpose |
|---|---|
| `data/venues/chicago.json` | 18 Chicago sports bar records |
| `data/venues/nyc.json` | 18 NYC sports bar records |
| `src/lib/geocoding.ts` | Nominatim geocoding helper |
| `scripts/seed-venues.ts` | Venue seed + VenueTeam link script |
| `docs/chunks/chunk-04-venue-seeding.md` | This file |

## Files Modified

| File | Change |
|---|---|
| `package.json` | Added `seed:venues` script |
| `memory/next-session.md` | Updated handoff notes |

---

## npm Script

```bash
npm run seed:venues
```

Runs `scripts/seed-venues.ts` via `ts-node --project tsconfig.scripts.json`.

---

## Venue JSON Schema

Each JSON file is an array of venue objects. Required fields: `name`, `address`, `city`, `state`,
`teams`. Optional: `zip`, `phone`, `website`, `description`.

```json
{
  "name": "Sluggers World Class Sports Bar",
  "address": "3540 N Clark St",
  "city": "Chicago",
  "state": "IL",
  "zip": "60657",
  "phone": "+17732480055",
  "website": "https://www.sluggersbar.com",
  "description": "...",
  "teams": ["MLB:CHC", "NFL:CHI", "NBA:CHI", "NHL:CHI"]
}
```

**Team key format:** `{leagueShortName}:{abbreviation}` (e.g. `NFL:CHI`, `MLB:CHC`).
Teams are looked up by matching `league.shortName` and `team.abbreviation` in the DB.

---

## Geocoding

Uses Nominatim (OpenStreetMap). Free, no API key. 1 req/sec rate limit enforced via 1100ms sleep.

- Query format: `{address}, {city}, {state}, USA`
- Required header: `User-Agent: rbar-seeder/1.0`
- Returns `null` on failure → venue is logged and skipped (not aborted)
- Known issue: Queens-style hyphenated street numbers (e.g. `32-04 Broadway`) fail; use bare
  street name with city + zip instead

---

## Seed Script Flow

1. Load all `.json` files from `data/venues/`
2. For each venue:
   - Sleep 1100ms (rate limit)
   - Call `geocodeAddress()` — skip on failure
   - Generate slug: `name-city` lowercased, non-alphanum stripped, spaces → dashes
   - Upsert by `(name, city)` — idempotent; safe to re-run
   - Resolve each team key → DB lookup → upsert `VenueTeam`
3. Run raw SQL to populate PostGIS `location` column for all venues with lat/lng

**PostGIS update:**
```sql
UPDATE "Venue"
SET location = ST_SetSRID(ST_MakePoint(CAST(lng AS float8), CAST(lat AS float8)), 4326)::geography
WHERE location IS NULL AND lat IS NOT NULL AND lng IS NOT NULL
```

---

## Data Governance

- `data/venues/{city}.json` is the source of truth for seeded venues
- To add more cities: create a new JSON file, re-run `npm run seed:venues`
- To correct a venue: edit the JSON and re-run (idempotent upsert by name+city)
- Future crowdsourced venues enter via `VenueRecommendation` flow (Chunk 8)
- Note: teams not found in the DB are warned and skipped (not aborted). If the DB only has
  10 teams per league (TheSportsDB free tier), some team links may be missing until full team
  data is populated.

---

## Known Limitations

- Only teams already in the DB can be linked. Teams synced via TheSportsDB free tier are the
  alphabetically first 10 per league. Teams outside that set produce `Team not found` warnings
  but don't abort the seed.
- Break Bar & Billiards address uses bare `Broadway` (Astoria, NY) because Nominatim can't
  parse Queens-style hyphenated addresses like `32-04 Broadway`.

---

## Validation Checklist (all passed)

- [x] `tsc --noEmit` — 0 errors
- [x] `npm run lint` — 0 errors
- [x] `npm run seed:venues` exits 0, reports 36 venues + 119 team links
- [x] All 36 rows have non-null `lat`, `lng`, `location`
- [x] `VenueTeam` has 119 rows
- [x] Re-run is idempotent: 0 created, 36 updated, 0 skipped, 0 duplicate links
