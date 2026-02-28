# HANDOFF — Resume Here Next Session

**Status:** Chunk 1 complete. Ready to plan and implement Chunk 2.
**Last session:** 2026-02-28

---

## What Was Completed (Chunk 1)

Full Next.js 15 infrastructure is in place and committed to GitHub:

- Next.js 15.5 + TypeScript + App Router + Tailwind v4
- shadcn/ui (New York style, Neutral, CSS variables)
- Prisma 5 ORM with PostgreSQL schema and `src/lib/db.ts` singleton
- Local dev DB: PostgreSQL 16 + PostGIS via `docker-compose.dev.yml`
- Production: multi-stage `Dockerfile` + `docker-compose.prod.yml` + `nginx/nginx.conf`
- GitHub Actions CI: lint + typecheck + build on every push/PR
- All 8 validations passed ✅

---

## Environment Reminders

Before running any npm or npx commands:
```bash
export PATH="/usr/local/opt/node@20/bin:$PATH"
```

Before running Prisma CLI commands, start the DB:
```bash
docker compose -f docker-compose.dev.yml up -d
```

---

## Next Action: Chunk 2 — Database Schema Design

To kick off next session, tell Claude:
> "Start planning Chunk 2 — Database Schema Design."

### What Chunk 2 covers:
Design the full PostgreSQL + PostGIS schema for all core entities, implement it in Prisma, run migrations, and seed foundational reference data (leagues and teams).

**Key entities to design:**
- `User` — auth, profile, preferences
- `Team` — sport, league, logo, colors
- `UserFavoriteTeam` — join table (user ↔ teams)
- `Venue` — name, address, geolocation (PostGIS `Point`), capacity, photos
- `VenueTeam` — which teams a venue regularly shows
- `Game` — sport event (home/away teams, start time, league, season)
- `WatchEvent` — a venue hosting a viewing party for a specific game
- `CheckIn` — user checked into a watch event at a venue
- `Review` — user rating/review of a venue
- `VenueOwnerClaim` — venue owner verification request

**PostGIS considerations:**
- Venues need a `location` field of type `Geography(Point)` for radius search
- Prisma doesn't natively support PostGIS types — will need `Unsupported("geography(Point, 4326)")` + raw SQL for spatial queries

**Reference data to seed:**
- NFL, NBA, MLB, NHL, MLS leagues
- All teams per league (name, abbreviation, city, logo URL from TheSportsDB)

See `PROJECT_PLAN.md` chunk 2 description for full scope.
