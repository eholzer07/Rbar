# Chunk 1 — Project Setup & Infrastructure

**Status:** Implemented 2026-02-28
**Session:** Chunk 1 planning (previous session) + implementation (this session)

---

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router, TypeScript) | Latest stable, App Router is the modern pattern |
| Styling | Tailwind CSS v4 + shadcn/ui (New York, Neutral) | Fast UI development with accessible components |
| ORM | Prisma | Type-safe DB access, great DX with PostgreSQL |
| Dev DB | PostgreSQL 16 + PostGIS via Docker | Matches production, spatial queries for venue search |
| Hosting | Hetzner VPS (~$4/mo) + Docker + Coolify | No vendor lock-in, full control, cheap |
| Reverse proxy | Nginx | Standard, battle-tested |
| SSL | Let's Encrypt via Coolify | Free, auto-renewing |
| CI | GitHub Actions | Free for public repos, tight GH integration |

---

## Files Created

| File | Purpose |
|---|---|
| `package.json` | Next.js 15 + all dependencies |
| `next.config.ts` | `output: 'standalone'` for Docker |
| `tsconfig.json` | TypeScript config |
| `postcss.config.mjs` | Tailwind v4 PostCSS plugin |
| `eslint.config.mjs` | ESLint flat config |
| `components.json` | shadcn/ui config (New York, Neutral, CSS vars) |
| `prisma/schema.prisma` | Minimal schema (HealthCheck placeholder model) |
| `src/lib/db.ts` | Prisma client singleton (hot-reload safe) |
| `src/lib/utils.ts` | shadcn utility (cn function) |
| `src/app/layout.tsx` | Root layout with Tailwind |
| `src/app/page.tsx` | Homepage placeholder |
| `src/app/globals.css` | Global styles with shadcn CSS variables |
| `docker-compose.dev.yml` | Local PostgreSQL 16 + PostGIS |
| `docker-compose.prod.yml` | Production stack (app + DB + Nginx) |
| `Dockerfile` | Multi-stage production build |
| `nginx/nginx.conf` | Reverse proxy + HTTPS |
| `.env.example` | All environment variables documented |
| `.env.local` | Dev values (gitignored) |
| `.gitignore` | Excludes .env.local, .next/, node_modules/, etc. |
| `README.md` | Developer quickstart |
| `.github/workflows/ci.yml` | CI: lint + typecheck + build on PR/push |

---

## Manual VPS Setup Steps (one-time)

These steps must be performed manually by the developer after this session:

### 1. Create Hetzner Account
- Go to [hetzner.com](https://hetzner.com) and sign up
- Create a project (e.g., "rbar")

### 2. Provision a Server
- Click "Add Server"
- Location: Choose closest to your users (US East: Ashburn)
- Image: Ubuntu 22.04 LTS
- Type: CX22 (2 vCPU, 4 GB RAM, ~$4.15/mo)
- Add your SSH key
- Click Create

### 3. Install Coolify
SSH into the server and run the Coolify one-liner installer:
```bash
ssh root@YOUR_SERVER_IP
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```
Then open `http://YOUR_SERVER_IP:8000` and complete the setup wizard.

### 4. Connect GitHub Repository
- In Coolify: Settings → Sources → Add GitHub App
- Install the GitHub App on your `eholzer07` account
- Select the `Rbar` repository

### 5. Create Services in Coolify
Create two services:
1. **Next.js App** — select repo, use Dockerfile, expose port 3000
2. **PostgreSQL** — use `postgis/postgis:16-3.4` image

### 6. Set Environment Variables
In Coolify, add all variables from `.env.example` to the app service. Update the DATABASE_URL to point to the Coolify-managed PostgreSQL instance (use the internal Docker network hostname).

### 7. Point Domain to Server
In your domain registrar (wherever rbar.app is registered):
- Add an A record: `rbar.app` → `YOUR_SERVER_IP`
- Add an A record: `www.rbar.app` → `YOUR_SERVER_IP`
- Wait for DNS propagation (5 min – 24 hrs)

### 8. Enable SSL
In Coolify:
- Settings → Domains → Add domain `rbar.app`
- Enable "Force HTTPS"
- Coolify automatically provisions a Let's Encrypt certificate via Certbot

### 9. Deploy
Push to the `main` branch. Coolify auto-deploys on push (webhook trigger). Or click "Deploy" manually in the Coolify UI.

---

## Next Steps (Chunk 2)

- Design and implement the full database schema (users, venues, teams, games, check-ins, reviews, etc.)
- Add PostGIS spatial extension to schema
- Create Prisma migrations
- Seed initial data (teams, leagues)
