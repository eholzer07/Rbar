# Chunk 3: Sports Data Integration

**Status:** ✅ Complete
**Date:** 2026-02-28

---

## Goal
Populate `League.externalId`, `Team.externalId`, `Team.logoUrl`, and seed upcoming `Game` rows by integrating TheSportsDB API.

---

## Files Created

| File | Description |
|---|---|
| `src/lib/sports-db/types.ts` | Raw API response interfaces |
| `src/lib/sports-db/client.ts` | Fetch helpers with error handling |
| `src/lib/sports-db/sync.ts` | Core sync logic: logos + games |
| `src/lib/sports-db/index.ts` | Public re-exports |
| `src/app/api/admin/sync/route.ts` | `POST /api/admin/sync` (bearer auth) |
| `scripts/sync-sports.ts` | Standalone CLI sync script |

---

## API Details

- **Provider:** TheSportsDB (free tier, key `123`)
- **Env:** `SPORTS_DB_BASE_URL`, `SPORTS_DB_API_KEY`
- **Leagues:** NFL (4391), NBA (4387), MLB (4424), NHL (4380), MLS (4346)

---

## Season Logic

| League | Season string | Rule |
|--------|--------------|-------|
| NBA / NHL | `YYYY-YYYY` | month ≤ 6 → previous season |
| NFL | `YYYY` | month ≤ 6 → previous year |
| MLB / MLS | `YYYY` | current year |

---

## Key Decisions

- `Game.externalId` has no `@unique` → `findFirst` + `update`/`create` (no `upsert`)
- Score fields from API are `string | null` → `parseInt()` with null-check
- `strTime` can be `""` → fallback to `"12:00:00+00:00"`
- Relative imports in `sync.ts` (`'../db'`) to work with `ts-node` (no path aliases)
- `db.$disconnect()` in script `finally` block or process hangs
- MLS team matching always filters by `leagueId` first to avoid city collisions
- API returns `null` (not `[]`) for empty arrays → use `?? []`

---

## Admin Auth

Simple bearer token: `Authorization: Bearer {ADMIN_SECRET}`
Will be replaced with proper session auth in Chunk 5.

---

## npm Script

```bash
npm run sync:sports
```
