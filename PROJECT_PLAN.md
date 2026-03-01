# Rbar — Project Plan

**Application:** rbar.app
**Platform:** Web (launch), Android + iOS (future)
**Goal:** Help sports fans traveling or exploring a new area find bars, restaurants, and venues showing their team's game — and connect with other fans doing the same.

---

## Overview

Rbar solves a real problem: a traveling fan doesn't know where their team's game will be shown. The application combines a curated venue database, real-time game schedules, and a community layer that lets fans plan watch events, check in, and leave feedback. All three platforms (web, Android, iOS) share the same backend and database.

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Web Framework | Next.js (TypeScript) | SSR for SEO, React knowledge carries to React Native for mobile |
| Styling | Tailwind CSS | Rapid UI development, responsive by default |
| Backend API | Next.js API Routes (REST) | Unified deployment initially; designed for mobile clients from day 1 |
| Database | PostgreSQL + PostGIS | Relational data + native geospatial queries for location search |
| ORM | Prisma | TypeScript-native, excellent migration tooling |
| Auth | NextAuth.js (Auth.js v5) | Email/password at launch; social login can be added later |
| Sports Data | TheSportsDB API (free tier) | Covers all major US leagues + NCAA + international; can upgrade |
| Maps & Geocoding | Google Maps API | Places API for venue lookup, Maps JS for display |
| File Storage | Supabase Storage | Venue photos, user avatars |
| Email | Resend | Auth emails, notifications |
| Hosting | Vercel (app) + Supabase (database) | Tight Next.js integration; Supabase provides PostGIS out of the box |
| Future Mobile | React Native (Expo) | Reuses React knowledge; same REST API |

**Sports Coverage:** All major US leagues (NFL, NBA, MLB, NHL, MLS) + NCAA + international soccer
**Geographic Scope:** US only at launch

---

## Work Chunks

Each chunk is a discrete unit of work that will be planned in detail at the start of its own development session.

---

### Chunk 1 — Project Setup & Infrastructure
Stand up the skeleton that every other chunk builds on.

- Initialize Next.js (TypeScript) monorepo
- Configure Tailwind CSS and base component library
- Set up Supabase project (PostgreSQL + PostGIS enabled)
- Connect Prisma ORM to Supabase
- Configure Vercel project and link to rbar.app domain
- Set up GitHub Actions CI pipeline (lint, type-check, test on PR)
- Define environment variable structure (local dev, preview, production)
- Basic project folder structure that supports future mobile code sharing

---

### Chunk 2 — Database Schema Design
Design all core data entities before any feature is built. This is the foundation everything else reads from and writes to.

**Core Entities:**
- **Users** — profile, auth, preferences
- **Teams** — name, league, sport, logo, colors
- **Leagues** — sport category, season structure
- **Games** — teams, date/time, broadcast info (from sports API)
- **Venues** — name, address, coordinates (PostGIS point), contact info, status, photos
- **VenueTeamSupport** — which teams a venue supports (many-to-many with metadata)
- **VenueRecommendations** — user-submitted venue suggestions
- **WatchEvents** — user-created event at a venue for a specific game
- **EventAttendees** — RSVPs and check-ins
- **VenueReviews** — post-game feedback (showed game, # TVs, food, alcohol, cost, rating)
- **UserFavoriteTeams** — user's saved teams
- **Friendships / Follows** — social graph

Schema must include geospatial indexing on Venues for radius search queries.

---

### Chunk 3 — Sports Data Integration
Pull in live data for teams, leagues, and game schedules.

- Evaluate and integrate TheSportsDB API (or equivalent)
- Sync all supported leagues and teams into the database
- Build scheduled job to sync upcoming game schedules (daily refresh)
- Map external API teams to internal Team records
- Design sync architecture so a different sports API can be swapped in later
- Admin tooling to manually correct or override game data

**Leagues to cover at launch:**
NFL, NBA, MLB, NHL, MLS, NCAAF, NCAAB, Premier League, Champions League (expandable)

---

### Chunk 4 — Venue Data Seeding (Research Sub-Project) ✅ COMPLETE
The chicken-and-egg problem: the app has no value without venue data.

**Actual approach (differs from original plan):**
- No admin UI — seed script only (`scripts/seed-venues.ts`)
- Pilot cities: Chicago + NYC (18 venues each)
- Geocoding: Nominatim (OpenStreetMap) — free, no key — instead of Google Geocoding API
- Venue source files: `data/venues/chicago.json`, `data/venues/nyc.json`
- Seed is idempotent (upsert by name+city); add more cities by dropping a new JSON file and re-running
- 36 venues seeded, 119 VenueTeam links, all rows have PostGIS `location` point
- `npm run seed:venues` script added

---

### Chunk 5 — Authentication & User Profiles ✅ COMPLETE (2026-03-01)
Allow users to create accounts and personalize their experience.

**Actual implementation:**
- Email/password registration — `emailVerified` set on signup (no email sending)
- Login, logout, session management via NextAuth.js v5 (JWT strategy)
- Profile page: name, username, bio, homeCity — server actions, pre-filled form
- Route protection middleware (auth-gated pages via Edge middleware)
- Sign-in, sign-up pages with error handling and redirect-if-authed
- No migration needed — schema already had all Auth.js v5 tables

**Deferred to Chunk 5a:**
- Email infrastructure (Resend), email verification, password reset

---

### Chunk 5a — Email Infrastructure (Deferred)
Set up transactional email for auth flows.

- Set up Resend (transactional email provider)
- Email templates: verification, password reset, welcome
- Email verification on signup — send link, require verification before login
- Password reset flow — forgot password page, email link, reset page

---

### Chunk 6 — Favorite Teams & Personalized Dashboard ✅ COMPLETE (2026-03-01)
Give users a home screen that shows them what matters to them.

- UI for browsing and selecting favorite teams (searchable, filterable by sport/league)
- Upcoming games feed for favorite teams (sourced from Chunk 3 data)
- Nearby venues showing each upcoming game (sourced from Chunk 2 + 7 data)
- "Watch tonight" quick-access surface for game day

**Delivered:**
- `/onboarding` — post-signup team picker (skips if favorites already set)
- `/teams` — permanent team browser with sport tabs + search
- `toggleFavoriteAction` — server action with optimistic UI
- `/api/venues/nearby` — PostGIS radius search (25mi default)
- Dashboard `/` — favorites bar, Watch Tonight, Upcoming Games, Nearby Venues widget
- Middleware updated to protect `/onboarding` and `/teams`
- Commit `00b8bb8` pushed to `main` on GitHub (2026-03-01)

---

### Chunk 7 — Venue Search & Discovery ✅ COMPLETE (2026-03-01)
The core search experience — find a bar near me for my team's game.

- Location input (browser geolocation or manual city/zip entry)
- Search by team + game (filter to venues supporting that team)
- Radius-based search using PostGIS
- Results list view with key metadata (distance, rating, supported teams)
- Map view with pins (Google Maps JS)
- Venue detail page:
  - Photos, contact info, address
  - Supported teams list
  - Upcoming games being shown
  - Aggregate review scores
  - Active watch events at this venue
  - Past reviews

**Delivered:**
- `npm install leaflet react-leaflet @types/leaflet` — free OSM maps (no API key)
- `geocodeQuery()` in `src/lib/geocoding.ts` — free-text → lat/lng via Nominatim
- `/api/geocode` — city/zip/address → lat/lng proxy route (no auth required)
- `/api/venues/search` — PostGIS radius search with optional teamId filter; returns lat/lng as float8, teams, avg rating
- `src/components/venue-map.tsx` — react-leaflet map (SSR disabled), marker icons, popup with venue info
- `src/components/venue-search.tsx` — split-screen search UI (list left 40%, map right 60%); geolocation + city input, team filter, radius buttons
- `src/app/search/page.tsx` — auth-guarded server page; passes team list to VenueSearch
- `src/app/venues/[slug]/page.tsx` — public venue detail page; all sections with graceful empty states
- `src/app/layout.tsx` — added global sticky nav header (Rbar, Search, My Teams, Profile)
- Middleware updated to protect `/search`
- `tsc --noEmit` and `npm run lint` both pass with 0 errors
- Commit `0122992` pushed to `main` on GitHub (2026-03-01)

---

### Chunk 8 — Venue Recommendations & Owner Claims ✅ COMPLETE (2026-03-01)
Let users grow the database and let venue owners claim their listing.

**Delivered:**
- `/recommend-venue` — auth-guarded form to submit a new venue (name, address, city, state, optional phone/website/description/teams); creates `VenueRecommendation` + `VenueRecommendationTeam` rows with `status: PENDING`
- `/claim-venue/[venueId]` — auth-guarded form to claim ownership of an existing venue with optional message; creates `VenueOwnerClaim` row with `status: PENDING`; guards against duplicate pending claims and self-claims
- Venue detail page (`/venues/[slug]`) — conditionally shows "Claim this venue" link, "Claim pending review" badge, or "You own this venue" badge based on auth + claim state
- Middleware updated to protect `/recommend-venue` and `/claim-venue`

**Deferred to Chunk 13:**
- Admin review queue for recommendations and claims (approve/reject UI)

**Deferred to a new chunk after Chunk 13:**
- Owner Portal: editing venue info, managing teams/games, uploading photos, marking special events

**Deferred to Chunk 5a:**
- Email domain match verification for owner claims

---

### Chunk 9 — Watch Events & Check-Ins ✅ COMPLETE (2026-03-01)
The social coordination layer — plan to watch together and mark yourself at a venue.

**Delivered:**
- `src/app/watch-events/new/actions.ts` — `createWatchEventAction` (creates event + auto-RSVPs creator as GOING)
- `src/app/watch-events/new/page.tsx` — create form with game picker, optional title/description, visibility toggle
- `src/app/watch-events/[id]/actions.ts` — `rsvpAction` (upsert GOING/INTERESTED/NOT_GOING), `checkInAction` (30-min pre-game to 4-hr post-game window)
- `src/app/watch-events/[id]/page.tsx` — event detail: game/venue/host info, RSVP buttons, check-in, attendee lists with checked-in badges
- `src/middleware.ts` — `/watch-events/new` added to protected paths
- `src/app/venues/[slug]/page.tsx` — watch event list items are now links; "Host a Watch Event" link for logged-in users
- `src/app/page.tsx` — "My Watch Events" dashboard section (events created or RSVP'd GOING/INTERESTED)

**Deferred to Chunk 11:**
- Private event invite system (PRIVATE events visible to creator only until then)

**Deferred to Chunk 10:**
- Post-game review prompt after check-in

**Deferred to Chunk 12:**
- Push notifications for event activity

---

### Chunk 10 — Feedback & Reviews ✅ COMPLETE (2026-03-01)
Close the loop after a watch experience to build venue quality data.

**Delivered:**
- `src/app/review/actions.ts` — `submitReviewAction`: validates inputs, findFirst + create/update pattern (handles nullable gameId in unique constraint), redirects to venue page
- `src/app/review/page.tsx` — review form: overall rating (1–5 required), showedGame (Yes/No), tvCount, soundOn, food/drink/value ratings (1–5 optional), comment; pre-fills if updating existing review
- `src/middleware.ts` — `/review` added to protected paths
- `src/app/watch-events/[id]/page.tsx` — post-game review prompt after windowEnd if user was checked in; shows "Update" link if review already exists
- `src/app/venues/[slug]/page.tsx` — enhanced review cards (showedGame badge, sound badge, TV count, sub-ratings); "Write a Review" link for logged-in users

**Deferred to Chunk 13 (Admin):**
- Flagging venues with low "showed the game" ratings for admin review

---

### Chunk 11 — Social Features & Fan Connections ✅ COMPLETE (2026-03-01)
Let fans find each other and coordinate around shared teams.

**Delivered:**
- `src/app/users/[username]/actions.ts` — `followAction`, `unfollowAction` (upsert/deleteMany on Follow model, bound pattern)
- `src/app/users/[username]/page.tsx` — public profile: name, bio, homeCity, follower/following counts, follow/unfollow button, favorite teams, upcoming watch events, recent check-ins (30 days)
- `src/app/feed/page.tsx` — activity feed: upcoming PUBLIC watch events from followed users; shows who is hosting/going; empty state with CTA
- `src/app/page.tsx` — "Friends' Activity" dashboard section (top 3 upcoming events from followed users, "See all →" link to /feed)
- `src/app/layout.tsx` — "Feed" link added to global nav
- `src/middleware.ts` — `/feed` added to protected paths

**Deferred:**
- Private event invite system (needs `INVITED` added to `RsvpStatus` enum → migration)
- "Who else is watching near me?" (requires browser geolocation)
- Team fan community pages (requires region/geolocation filtering)

---

### Chunk 12 — Notifications & Alerts ✅ COMPLETE (2026-03-01)
Keep users informed without requiring them to open the app.

**Delivered — in-app notification system:**
- `prisma/schema.prisma` — `NotificationType` enum (FOLLOW, WATCH_EVENT_RSVP) + `Notification` model; migration: `20260301000001_add_notification`
- `src/components/notification-bell.tsx` — server component showing unread count badge in nav; returns null for logged-out users
- `src/app/notifications/page.tsx` — notification list, auto-marks all as read on visit, type icons, linked items
- `src/middleware.ts` — `/notifications` added to protected paths
- `src/app/users/[username]/actions.ts` — `followAction` creates FOLLOW notification (dedup: only on new follow)
- `src/app/watch-events/[id]/actions.ts` — `rsvpAction` creates WATCH_EVENT_RSVP notification (dedup: only when first becoming GOING)

**Deferred:**
- Email notifications (needs email provider — Chunk 5a)
- Game day reminders (needs cron/scheduler — Chunk 16)
- Push notifications (Chunk 17 / mobile)
- Check-in proximity prompt (browser geolocation)
- Venue found / Submission status notifications (triggered from admin actions — Chunk 13)

---

### Chunk 13 — Admin Panel (Full)
Internal tooling for operating the platform.

- Venue database management (add, edit, deactivate, merge duplicates)
- Venue submission review queue (approve/reject user recommendations)
- Venue owner verification queue
- User management (search, suspend, delete)
- Sports data management (override game data, manage leagues/teams)
- Review moderation (flag/remove abusive reviews)
- Basic analytics dashboard (active users, searches, check-ins, new venues)

---

### Chunk 14 — In-App Product Feedback
Let users report bugs and request features from within the app.

- Feedback form accessible from all authenticated pages (floating button or nav link)
- Submission types: Bug Report, Feature Request, General Feedback
- Fields: type, title, description, optional screenshot upload
- Submissions stored in DB (`Feedback` table: userId, type, title, body, screenshotUrl, status, createdAt)
- Admin queue in the Admin Panel to view, triage, and close submissions
- Submitter receives confirmation email; optionally notified when status changes (Resolved / Won't Fix)
- Basic dedup: rate-limit to 5 submissions per user per 24 hours

---

### Chunk 15 — Frontend Polish, Onboarding & Marketing Page
Complete the user experience for launch.

- Marketing / landing page at rbar.app (before login)
- User onboarding flow after signup (select favorite teams, set home location)
- Responsive design audit across all screens (mobile web must work well before native apps exist)
- Empty states, loading states, error handling throughout
- Accessibility audit (WCAG 2.1 AA)
- SEO: meta tags, structured data for venue pages

---

### Chunk 16 — Performance, Testing & Launch Prep
Validate and harden before going live.

- End-to-end test suite (Playwright) for critical flows: search, signup, check-in, review
- Load testing for venue search endpoints (PostGIS queries under load)
- Security audit: auth, input validation, rate limiting, CSRF
- Set up monitoring and error tracking (Sentry)
- Database backup and recovery plan
- Analytics setup (PostHog or similar, privacy-respecting)
- Soft launch checklist and go/no-go criteria

---

### Chunk 17 — Mobile Apps (Future Phase)
React Native (Expo) apps for Android and iOS, using the same REST API.

- Expo project setup, shared API client with web
- Core screens: search, venue detail, watch events, check-in, profile
- Native features: push notifications (FCM/APNs), GPS check-in, camera for venue photos
- App Store and Google Play submission process

This phase begins after web launch and real-world usage data shapes priorities.

---

## Implementation Order

```
Phase 1 (Foundation):     Chunk 1 → Chunk 2 → Chunk 3
Phase 2 (Core Data):      Chunk 4 (parallel with Phase 3)
Phase 3 (Users):          Chunk 5 → Chunk 6
Phase 4 (Discovery):      Chunk 7
Phase 5 (Community):      Chunk 8 → Chunk 9 → Chunk 10
Phase 6 (Social):         Chunk 11 → Chunk 12
Phase 7 (Ops):            Chunk 13 → Chunk 14
Phase 8 (Launch):         Chunk 15 → Chunk 16
Phase 9 (Mobile):         Chunk 17
```

Chunk 4 (venue seeding) can run in parallel with Phases 3–4 since it's primarily a research and data-entry effort.

---

## Validation Steps

At project completion, the following must be true:

1. A user can visit rbar.app, create an account, and select favorite teams.
2. A user in any US city can search for venues showing their team's next game and see results on a map.
3. A user can create a watch event at a venue and invite other users.
4. A user can check in at a venue during a game.
5. After a game, checked-in users receive a review prompt and their review appears on the venue page.
6. A user can submit a venue recommendation and an admin can approve it.
7. A venue owner can claim and update their listing.
8. All API endpoints respond correctly when called by a non-browser client (future mobile support).
9. The application passes a basic security audit (no open auth bypasses, no XSS/injection vectors).
10. Page load times for venue search results are under 2 seconds on a standard connection.

---

*Plan created: 2026-02-27*
*Last updated: 2026-03-01*
*Status: Chunk 12 complete — next up: Chunk 13 (Admin Panel)*

---

## Chunk Completion Log

| Chunk | Status | Completed | Notes |
|---|---|---|---|
| 1 — Project Setup & Infrastructure | ✅ Complete | 2026-02-28 | Next.js 15, Tailwind v4, shadcn/ui, Prisma + PostGIS, Docker dev DB |
| 2 — Database Schema Design | ✅ Complete | 2026-02-28 | Full schema, migrations, seed |
| 3 — Sports Data Integration | ✅ Complete | 2026-02-28 | TheSportsDB free tier; 5 leagues, 49 teams with logos |
| 4 — Venue Data Seeding | ✅ Complete | 2026-03-01 | 36 venues (Chicago + NYC), Nominatim geocoding, 119 VenueTeam links |
| 5 — Authentication & User Profiles | ✅ Complete | 2026-03-01 | next-auth@beta, JWT, Credentials, sign-in/up/profile, middleware |
| 6 — Favorite Teams & Dashboard | ✅ Complete | 2026-03-01 | /onboarding, /teams, toggleFavoriteAction, nearby venues widget |
| 7 — Venue Search & Discovery | ✅ Complete | 2026-03-01 | Leaflet/OSM, geocode, /api/venues/search, split-screen UI, /venues/[slug] |
| 8 — Venue Recommendations & Owner Claims | ✅ Complete | 2026-03-01 | /recommend-venue, /claim-venue/[id], claim badge on venue detail |
| 9 — Watch Events & Check-Ins | ✅ Complete | 2026-03-01 | /watch-events/new, /watch-events/[id], RSVP, check-in window, dashboard section |
| 10 — Feedback & Reviews | ✅ Complete | 2026-03-01 | /review form, post-game prompt on watch event page, enhanced review cards on venue page |
| 11 — Social Features & Fan Connections | ✅ Complete | 2026-03-01 | Follow/unfollow, /users/[username] profile, /feed activity feed, dashboard Friends' Activity |
| 12 — Notifications & Alerts | ✅ Complete | 2026-03-01 | Notification model, bell badge in nav, /notifications page, FOLLOW + RSVP triggers |
| 13–16 | Pending | — | — |
