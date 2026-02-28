# Chunk 2 — Database Schema Design

**Status:** ✅ COMPLETE (2026-02-28)

---

## Summary

Replaced the placeholder `HealthCheck` model with the full production schema. Switched from `prisma db push` to `prisma migrate dev` workflow. Seeded all 5 leagues and 154 teams.

---

## What Was Built

### Prisma Schema (`prisma/schema.prisma`)

**Enums:** `Sport`, `VenueStatus`, `WatchEventVisibility`, `RsvpStatus`, `ClaimStatus`, `RecommendationStatus`, `UserRole`

**Models (18 tables):**

| Model | Purpose |
|---|---|
| `Account` | Auth.js v5 OAuth provider accounts |
| `Session` | Auth.js v5 active sessions |
| `VerificationToken` | Auth.js v5 email verification |
| `User` | App users (email/password + social login ready) |
| `League` | NFL, NBA, MLB, NHL, MLS |
| `Team` | All teams per league |
| `UserFavoriteTeam` | User → Team fan relationships |
| `Venue` | Sports bars/restaurants with PostGIS location |
| `VenuePhoto` | Venue images |
| `VenueTeam` | Which teams a venue shows |
| `Game` | Scheduled and completed games |
| `WatchEvent` | Fan-organized watch parties at a venue |
| `WatchEventAttendee` | RSVPs and check-ins for watch events |
| `Review` | Per-venue reviews (optional game linkage) |
| `VenueRecommendation` | Crowdsourced venue suggestions |
| `VenueRecommendationTeam` | Teams associated with a recommendation |
| `VenueOwnerClaim` | Venue ownership verification requests |
| `Follow` | User → User social follows |

### Migration

- File: `prisma/migrations/20260228000000_init_schema/migration.sql`
- PostGIS extension enabled: `CREATE EXTENSION IF NOT EXISTS postgis;`
- Applied via: `prisma migrate reset --force` (dev DB was fresh from Chunk 1 `db push`)

### Seed Data (`prisma/seed.ts`)

- 5 leagues: NFL, NBA, MLB, NHL, MLS
- 154 teams total: NFL (32), NBA (30), MLB (30), NHL (32), MLS (30)
- Each team seeded with: city, name, abbreviation, primaryColor, secondaryColor
- Notable: Utah Hockey Club (replaced relocated Arizona Coyotes), San Diego FC (MLS 2025 expansion)

---

## Key Design Decisions

1. **Auth.js tables included now** — avoids painful mid-project migration in Chunk 5
2. **PostGIS `geography(Point, 4326)`** on `Venue.location` using `Unsupported()` type; spatial queries use `$queryRaw`
3. **`Venue.lat`/`lng` as Decimal** — kept alongside `location` for simpler non-spatial queries
4. **`Review` unique on `[venueId, userId, gameId]`** — one review per user per game per venue (gameId nullable)
5. **`VenueRecommendationTeam` composite PK** — no surrogate key needed for pure join table
6. **Sport denormalized on Team** — simplifies queries that filter by sport without joining League

---

## Validation Results

| Check | Result |
|---|---|
| `prisma migrate status` | ✅ Up to date |
| Table count (`\dt`) | ✅ 18 domain tables + `_prisma_migrations` + `spatial_ref_sys` |
| PostGIS extension | ✅ Present |
| Leagues seeded | ✅ 5 |
| Teams seeded | ✅ 154 (NFL:32, NBA:30, MLB:30, NHL:32, MLS:30) |
| NFL spot-check query | ✅ Returns Cardinals, Falcons, Ravens |
| Venue status index | ✅ `Venue_status_idx` present |
| `npx tsc --noEmit` | ✅ 0 type errors |
| `npm run lint` | ✅ 0 errors |

---

## Migration Notes

- Chunk 1 used `prisma db push` (no migration files). Switching to `migrate` required `prisma migrate reset --force` on the dev DB. This is a one-time reset; all future schema changes use `prisma migrate dev`.
- The `HealthCheck` placeholder table was dropped by the reset.

---

## Next Chunk

**Chunk 3 — Sports Data Integration:** Integrate TheSportsDB API to sync game schedules and update team logo URLs.
