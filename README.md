# Pyramid

A full-stack task & project workspace — built for the AbleSpace full-stack developer
assessment (Part 1), pixel-matched against the supplied Figma reference.

**Live demo:** https://pyramid-web-eta.vercel.app
**API:** https://pyramid-api-snowy.vercel.app/api/v1
**Design reference:** Figma — `Assessment-Task`

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack, React Server Components) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Backend | NestJS 11 |
| Database | PostgreSQL 16, via Prisma 7 (driver adapter) |
| Auth | Guest JWT (instant, no signup) + Google OAuth, httpOnly cookie sessions |
| Validation | zod schemas shared between frontend and backend (`packages/contracts`) |
| Drag & drop | dnd-kit |
| Data fetching | React Server Components for reads, TanStack Query for optimistic writes |
| Monorepo | pnpm workspaces + Turborepo |
| Visual QA | Playwright — frozen regression baselines + axe-core WCAG AA contrast gate |

## Project structure

```
apps/
  web/            Next.js app (App Router)
    src/app/      routes — (auth)/login, (app)/w/[workspaceSlug]/*, (settings)/settings/*
    src/components/
    qa/            Playwright visual-QA harness (see apps/web/qa/tests/visual.spec.ts)
  api/            NestJS app
    src/           auth, users, workspaces, projects, tasks modules
    prisma/        schema, migrations, seed
packages/
  contracts/       zod schemas + inferred types, imported by both apps
```

## Features

- **Guest login** — one click, no signup, drops you straight into a seeded workspace
- **Google OAuth** — wired end-to-end; requires client credentials to activate (see below)
- **Multi-tenant workspaces** — everything is scoped to `/w/[workspaceSlug]`, with membership
  roles (Owner/Admin/Member), invitations, and query-level tenant isolation
- **Tasks** — board (drag-and-drop, optimistic) and list views, priority, due dates, labels,
  assignees, subtasks, comments, activity feed
- **Projects** — list view, project detail with its own task board
- **Settings** — profile editing, theme, accent color, workspace members/invites, leave workspace
- **Theming** — light/dark mode plus 6 accent colors, persisted via cookie so the correct theme
  paints on the very first server-rendered byte (no flash of unstyled/wrong theme)
- **Responsive** — sidebar collapses to a slide-out sheet, task tables fall back to stacked
  cards, and the board scroll-snaps horizontally below the `md` breakpoint
- **Accessibility** — every interactive control is keyboard-reachable with a visible focus
  ring; icon-only actions carry `aria-label`s; dark mode is verified against WCAG AA contrast
  via an automated axe-core gate (not just eyeballed)

## Getting started

### Prerequisites

- Node.js 22+
- pnpm 11+ (`corepack enable` will pick up the pinned version automatically)
- A local PostgreSQL instance — the included `docker-compose.yml` provides one

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start Postgres

```bash
docker compose up -d
```

### 3. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Fill in `apps/api/.env`:

| Variable | Notes |
|---|---|
| `DATABASE_URL` / `DIRECT_URL` | Defaults match the included `docker-compose.yml` |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Any random string in development |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | Optional — leave blank to disable "Login with Google" (guest login is unaffected) |

### 4. Migrate and seed the database

```bash
cd apps/api
pnpm prisma migrate deploy
cd ../..
pnpm db:seed
```

The seed script reproduces the reference fixtures (a workspace, 3 projects, 21 tasks with
subtasks, comments, and activity) so the app looks like the design on first run.

### 5. Run it

```bash
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:3001/api/v1 (Swagger at `/api/docs`)

Click **Continue as Guest** on the login screen — no credentials needed.

## Deployment

Both apps deploy to Vercel as separate projects from this one monorepo (`apps/web`, `apps/api`
as their respective root directories), with Postgres on Neon (provisioned via Vercel's Neon
marketplace integration).

- **API** — `apps/api/api/index.ts` wraps the NestJS app as a plain Vercel Node function; the
  underlying Express app is created once at module scope and reused across warm invocations.
- **Web** — `next.config.ts` rewrites `/api/*` to the API deployment, so the browser only ever
  sees one origin and the httpOnly JWT cookie stays first-party (no CORS, no cross-site cookie
  gymnastics).
- **Database** — Neon Postgres, connected via `@prisma/adapter-pg` against Neon's pooled
  endpoint (`DATABASE_URL`) for runtime queries and the unpooled endpoint (`DIRECT_URL`) for
  migrations.
- Migrations (`prisma migrate deploy`) and the seed are run once against the production
  database as a manual step, not on every cold start, so concurrent invocations can't race a
  schema change.

## Visual QA

```bash
cd apps/web
pnpm qa           # run the full Playwright suite (both servers must already be running)
pnpm qa:update     # re-freeze baselines after an intentional visual change
```

The suite captures all 13 reference states (login, board, board+fields, list, list+search,
list+fields, task+priority, task+datepicker, projects+theme, projects+colormode,
projects+nested-fields, project→tasks, settings-profile) at 1280×800 @2x against a
deterministic seeded session, freezes them as regression baselines, and re-runs the same 13
states in dark mode through an axe-core WCAG AA contrast check (dark mode has no reference
screenshot to diff against, so contrast is the objective pass/fail gate instead).

## Deviations from the Figma reference

- **Dark mode** is our own design — the Figma export only covers light mode for most screens.
  It was authored alongside light mode (same component pass, not bolted on after), matched to
  the neutral scale, and gated on WCAG AA contrast rather than by-eye judgment alone.
- **Mobile layout** has no dedicated reference — it's a designed extrapolation of the desktop
  layout (sidebar → sheet, task table → stacked cards, board → horizontal scroll-snap), flagged
  here rather than presented as pixel-matched.
- A handful of affordances visible in the design (per-row "···" menus, board's "+ Add" on
  hover, comment attach icon) don't have a backing feature yet — they're real, keyboard-focusable
  buttons that respond with a "coming soon" toast rather than being either dead pixels or a
  fake menu with nothing in it.
- Reference screenshot 04 (list view) carries a stray cursor/tooltip artifact ("Mani") from
  the design tool — treated as a capture artifact, not reproduced.

## Notes on the assessment's Part 2

Part 2 (product-understanding writeup on AbleSpace's Caseload → Take Data workflow) is a
separate deliverable from this codebase and is tracked outside this repository.
