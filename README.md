# Rbar

Sports fan venue finder — help traveling fans find bars/restaurants showing their team's game, and connect with other fans.

## Prerequisites

- [Node.js 20](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local database)

## Local Development Quickstart

### 1. Start the local database

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts a PostgreSQL 16 + PostGIS instance on port 5432.

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

The defaults in `.env.example` point to the local Docker database and are ready to use for development.

### 3. Install dependencies and set up the database

```bash
npm install
npx prisma db push
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (TypeScript, App Router) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| ORM | Prisma |
| Database (dev) | PostgreSQL 16 + PostGIS via Docker |
| Database (prod) | PostgreSQL 16 + PostGIS via Docker on VPS |
| Auth | NextAuth.js (Auth.js v5) |
| Hosting (prod) | Hetzner VPS + Docker + Coolify |
| Reverse proxy | Nginx |
| SSL | Let's Encrypt via Coolify |
| CI | GitHub Actions |

## Production Deployment

Production runs on a Hetzner VPS using Docker + [Coolify](https://coolify.io) for orchestration. See `docs/chunks/chunk-01-infrastructure.md` for full VPS setup instructions.
