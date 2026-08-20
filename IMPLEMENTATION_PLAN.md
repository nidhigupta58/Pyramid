# Pyramid — Implementation Plan

Full-stack rebuild of the **Pyramid** task workspace from the supplied references, pixel-matched to the screenshots.

**Stack (client-specified):** Next.js App Router · Tailwind CSS · NestJS · TypeScript · database of our choice.

**Sources of truth**
- `uploads/*.png` (13 screenshots) — **authoritative for exact visual output**. Rendered at ~0.64 scale of a 1280 px-wide app frame.
- `Pyramid Task App.dc.html` — authoritative for **state inventory, interaction wiring, and copy/data**. Its pixel values are artboard-scaled (1180 px frame) and must not be copied literally; use the mapping table in §3.

**Key finding:** the settings screenshot is labelled `Blocks / Sidebar-02`. The reference is built on **shadcn/ui blocks + Tailwind**, at shadcn defaults (16 rem sidebar, `text-sm` = 14 px body, `--radius: 0.625rem`). Matching the UI "exactly" therefore means *adopting shadcn's defaults*, not hand-porting the artboard's px values.

---

## 1. Versions (verified against npm on 2026-08-20)

### Frontend — `apps/web`
| Package | Version | Note |
|---|---|---|
| `next` | **16.3.1** | App Router, Turbopack, RSC |
| `react` / `react-dom` | **19.2.8** | required peer for Next 16 |
| `tailwindcss` | **4.3.3** | CSS-first config (`@theme`), **no `tailwind.config.js`** |
| `shadcn/ui` | CLI `latest` | new-york style, `neutral` base |
| `lucide-react` | 1.33.0 | icon set used throughout the refs |
| `@tanstack/react-query` | 5.101.4 | mutations, optimistic drag & drop |
| `zustand` | 5.0.15 | **UI-only** state (menus, field visibility, view mode) |
| `@dnd-kit/core` + `sortable` | 6.3.1 | board drag & drop |
| `next-themes` | 0.4.6 | light/dark |
| `date-fns` | 4.4.0 | `12 Sep 2026` / `29 Jul` formatting |
| `geist` | latest | Geist + Geist Mono via `next/font` |

### Backend — `apps/api`
| Package | Version | Note |
|---|---|---|
| `@nestjs/core` / `common` / `platform-express` | **11.2.1** | |
| `@nestjs/cli` | 11.0.24 | |
| `@nestjs/config` | 4.0.4 | env validation |
| `@nestjs/jwt` / `@nestjs/passport` | 11.0.2 / 11.0.5 | |
| `passport-google-oauth20` | 2.0.0 | Google login |
| `@nestjs/swagger` | 11.4.7 | OpenAPI at `/api/docs` |
| `@nestjs/throttler` | 6.5.0 | rate limiting |
| `prisma` / `@prisma/client` | **7.9.1** | see Node warning below |
| `nestjs-zod` | 5.5.0 | shared zod contracts → DTOs |
| `zod` | 4.4.3 | |
| `@nestjs/testing` + `supertest` | 11.2.1 / 7.2.2 | e2e |

### Tooling
`pnpm` 11.22.0 (workspaces) · `turbo` 2.10.11 · TypeScript 5.x strict · Docker Compose for Postgres.

### ⚠ Node version blocker — action required
| Requirement | Version |
|---|---|
| Installed locally | **v20.15.0** |
| Next 16 needs | `>=20.9.0` ✅ |
| NestJS 11 needs | `>=20` ✅ |
| **Prisma 7.9.1 needs** | **`^20.19 \|\| ^22.12 \|\| >=24.0`** ❌ |

Prisma 7 will refuse to install. Pick one before P0:
1. **Recommended — upgrade to Node 22 LTS** (`nvm install 22 && nvm alias default 22`), pin `.nvmrc` = `22`.
2. Bump to Node `20.19.x` (minimum viable).
3. Pin `prisma@6.19.3` (`engines: >=18.18`) and stay on Node 20.15 — costs the Prisma 7 improvements.

---

## 2. Repository layout — pnpm monorepo

```
pyramid/
├─ apps/
│  ├─ web/                  # Next.js 16
│  └─ api/                  # NestJS 11
├─ packages/
│  ├─ contracts/            # zod schemas + inferred TS types  ← single source of truth
│  └─ tsconfig/             # shared tsconfig bases
├─ docker-compose.yml       # postgres:17 + adminer
├─ turbo.json
└─ pnpm-workspace.yaml
```

`packages/contracts` is the spine: one zod schema per entity/DTO. NestJS consumes it via `nestjs-zod`'s `createZodDto` + `ZodValidationPipe`; the web app imports the inferred types directly. **No hand-written duplicate types, no codegen step, no drift.**

```bash
pnpm dlx create-turbo@latest pyramid
pnpm create next-app apps/web --ts --app --tailwind --eslint --src-dir --import-alias "@/*"
pnpm dlx @nestjs/cli new apps/api --strict --package-manager pnpm
cd apps/web && pnpm dlx shadcn@latest init      # new-york, neutral
pnpm dlx shadcn@latest add sidebar button card table badge avatar dropdown-menu \
  popover calendar checkbox input separator tabs tooltip scroll-area \
  breadcrumb collapsible switch label sonner skeleton
```

---

## 3. Design tokens — extraction + scale mapping

Artboard values → real app values. Every literal in `.dc.html` is at **artboard scale ≈ 0.82**; convert, then snap to the nearest Tailwind step.

| Element | Artboard (`.dc.html`) | **Build as** |
|---|---|---|
| Body text | 11.5 px | `text-sm` (14 px) |
| Secondary / muted | 10.5 px | `text-xs` (12 px) |
| Section heading | 14.5 px | `text-base font-semibold` |
| Task detail H1 | 22 px | `text-2xl font-semibold tracking-tight` |
| Settings H1 | 19 px | `text-xl font-semibold` |
| App sidebar | 196 px | `16rem` (shadcn `--sidebar-width`) |
| Settings sidebar | 212 px | `16rem` |
| Top bar height | 44 px | `h-14` (56 px) |
| Toolbar buttons | 28 px | `h-8` (`size="sm"`) |
| Board column | 184 px | `w-72` (288 px) |
| Task detail right rail | 250 px | `w-80` (320 px) |
| Card radius | 9–10 px | `rounded-lg` |
| Popover radius | 11 px | `rounded-xl` |
| Button radius | 8 px | `rounded-lg` |

### 3.1 Colour tokens (`apps/web/src/app/globals.css`, Tailwind v4 `@theme`)

Light palette read off the artboard — these land almost exactly on shadcn `neutral`:

```
--background        #ffffff
--muted / canvas    #f7f7f8
--sidebar           #fbfbfa
--border            #ececea      (rows: #f4f4f2, headers: #f0f0ee, controls: #e8e8e6)
--foreground        #18181b
--muted-foreground  #71717a      (fainter: #8b8b93, placeholder: #b4b4bb)
--primary           #101010      (hover #282828)
--primary-foreground #ffffff
```

Semantic, non-negotiable for match:

```
--priority-urgent / --priority-high  #e5484d
--priority-medium                    #f5a524
--priority-low / --priority-none     #a1a1aa
--status-backlog                     #f5a524
--due-bg #fff1f2  --due-border #fde1e3  --due-fg #e5484d
```

Avatar gradient (used in ~9 places — make it one `<UserAvatar>` component):
`radial-gradient(circle at 30% 25%, #a78bfa, #ec4899 48%, #1e3a8a)`

### 3.2 Colour Mode system

Six accent modes from the refs: **Amber `#f59e0b`, Blue `#7c3aed`, Pink `#ec4899`, Rose `#e11d48`, Emerald `#10b981`, Black `#101010`** (default in refs: **Blue**, checked).
Implement as `data-accent="blue"` on `<html>`, each overriding `--primary` / `--ring` / `--sidebar-accent`. Independent of `next-themes` light/dark (`data-theme`). Both persist to `UserPreference` on the API **and** mirror to a cookie, so the server component renders the correct theme on first paint — no FOUC, no flash of the wrong accent.

### 3.3 Light + dark — both ship in v1

Both modes are in scope. `next-themes` drives `data-theme="light|dark"` on `<html>`; the Change Theme submenu (ref 09) and `/settings/theme` both write it, persisting to `UserPreference.theme` and mirroring to a cookie so SSR paints the right mode immediately.

No screenshot shows dark, so the dark palette is **our design**, derived from the same neutral scale and held to WCAG AA (4.5:1 text, 3:1 UI chrome). Proposed tokens:

```
--background        #0a0a0a
--muted / canvas    #131313
--sidebar           #0f0f0f
--border            #232323      (rows: #1c1c1c, headers: #1a1a1a, controls: #272727)
--foreground        #fafafa
--muted-foreground  #a1a1aa      (fainter: #8b8b93, placeholder: #52525b)
--primary           #fafafa      (hover #e4e4e7)
--primary-foreground #101010
```

Three inversions that are easy to miss and will look broken if skipped:

1. **`--primary` flips.** The black pills — "Continue as Guest", "+ Add Task", the selected date circle, checked Fields checkboxes — become near-white with dark text. A `#101010` button on a `#0a0a0a` background is invisible.
2. **Semantic colours lighten** for contrast on dark: urgent/high `#e5484d → #ff6369`, medium `#f5a524 → #ffb224`, low/none `#a1a1aa → #8b8b93`, backlog dot `#ffb224`.
3. **The due badge goes translucent** instead of tinted: `--due-bg rgba(229,72,77,.12)`, `--due-border rgba(229,72,77,.28)`, `--due-fg #ff6369`. The solid `#fff1f2` fill is a light-mode-only construction.

Each of the six accents also carries a dark variant lightened for AA against `#0a0a0a`. The avatar gradient is unchanged in both modes.

Dark gets a **design sign-off pass before P12** — there is nothing to pixel-diff against, so it's reviewed by eye rather than by script.

---

## 4. Database — PostgreSQL 17 + Prisma

**Choice: PostgreSQL.** The domain is relational to its core — tasks↔projects, self-referencing subtasks, many-to-many labels, members, activity threads, per-user field-visibility prefs. Postgres gives real foreign keys, transactional multi-row reorders on drag, and `ORDER BY position` without app-side joins. MongoDB would need manual referential integrity for exactly the joins this UI performs on every screen. Prisma keeps end-to-end type safety continuous with `packages/contracts`.

Local dev runs `docker compose up -d` (postgres:17 + adminer); production is **Neon** serverless Postgres (§12) — same engine, so the schema and migrations are identical across both. SQLite stays available as a `DATABASE_URL` swap for CI, with the caveat that enums/arrays differ.

### 4.1 Schema (`apps/api/prisma/schema.prisma`)

```prisma
enum Priority { NO_PRIORITY URGENT HIGH MEDIUM LOW }
enum Status   { TODO DOING COMPLETED ON_HOLD BACKLOG }
enum Theme    { LIGHT DARK }
enum Accent   { AMBER BLUE PINK ROSE EMERALD BLACK }

model User {
  id String @id @default(cuid())
  email String @unique
  fullName String?          // Settings → Full name
  title String?             // "Your job title or role"
  username String? @unique  // "One word, like a nickname or first name"
  avatarUrl String?
  isGuest Boolean @default(false)
  googleId String? @unique
  preference UserPreference?
  memberships Membership[]
  @@map("users")
}

model UserPreference {
  id String @id @default(cuid())
  userId String @unique
  theme Theme @default(LIGHT)
  accent Accent @default(BLUE)
  listFields Json      // Fields menu → List tab toggles
  boardFields Json     // Fields menu → Board tab toggles
  defaultView String @default("board")
  activeWorkspaceId String?        // last workspace used → landing redirect
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Role { OWNER ADMIN MEMBER }

model Workspace {
  id String @id @default(cuid())
  name String
  slug String @unique              // URL segment: /w/acme/tasks
  members Membership[] projects Project[] tasks Task[] labels Label[] invitations Invitation[]
}

model Membership {
  id String @id @default(cuid())
  userId String
  workspaceId String
  role Role @default(MEMBER)
  joinedAt DateTime @default(now())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  @@unique([userId, workspaceId])
  @@index([workspaceId])
}

model Invitation {
  id String @id @default(cuid())
  workspaceId String
  email String
  role Role @default(MEMBER)
  token String @unique
  expiresAt DateTime
  acceptedAt DateTime?
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  @@unique([workspaceId, email])
}

model Project {
  id String @id @default(cuid())
  workspaceId String
  name String
  priority Priority @default(NO_PRIORITY)
  leadId String?
  dueDate DateTime?
  position Float
  tasks Task[]
  @@index([workspaceId, position])
}

model Task {
  id String @id @default(cuid())
  workspaceId String
  projectId String?
  parentId String?                    // non-null ⇒ subtask
  title String
  description String?
  status Status @default(TODO)
  priority Priority @default(NO_PRIORITY)
  position Float                      // fractional rank within (status, projectId)
  dueDate DateTime?
  assigneeId String?
  reporterId String?
  team String?
  parent Task?  @relation("Subtasks", fields: [parentId], references: [id], onDelete: Cascade)
  subtasks Task[] @relation("Subtasks")
  members TaskMember[]
  labels TaskLabel[]
  tags String[]                       // board-card chips: Deployment, Testing, …
  comments Comment[]
  activity Activity[]
  @@index([workspaceId, status, position])
  @@index([projectId])
}

model Label      { id String @id @default(cuid()) workspaceId String name String color String? tasks TaskLabel[] @@unique([workspaceId, name]) }
model TaskLabel  { taskId String labelId String @@id([taskId, labelId]) }
model TaskMember { taskId String userId String @@id([taskId, userId]) }
model Comment    { id String @id @default(cuid()) taskId String authorId String body String createdAt DateTime @default(now()) }
model Activity   { id String @id @default(cuid()) taskId String actorId String verb String meta Json createdAt DateTime @default(now()) }
```

**Reordering:** `position` is a float; dropping between neighbours writes the midpoint — one `UPDATE`, no cascade. A rebalance job runs when the gap falls under 1e-6.

### 4.2 Seed (`prisma/seed.ts`) — must reproduce the refs verbatim

Board columns **To Do (3) / Doing (2) / Completed (3) / On Hold (4)** with the exact card titles, `Admin`/`QA Team`/`Designer`/`Security`/`Design Team`/`Dev Team`/`Product`/`Engineering` assignees, `29 Jul`–`08 Aug` due chips, and the `Deployment`/`Testing`/`Passed`/`Audit`/`Scheduled`/`Review`/`Blocked`/`Infra`/`Research`/`Queued`/`Optimise`/`Later` tags. List groups To Do / Doing / Completed each carry **Design Homepage · High · 12 Sep 2026**, **Develop Login Feature · Low · 15 Sep 2026**, **Test Payment Gateway · Medium · 18 Sep 2026**. Task detail seeds *Write API Documentation* with its description, 5 labels, 3 subtasks, the `Ankit Dutta` comment, and both Updates entries.

### 4.3 Multi-tenancy — real, not cosmetic

A user belongs to many workspaces; the sidebar switcher (ref 02's "Dexter ⌃⌄") is functional.

**Isolation model — defence in depth:**
1. **Every tenant-owned table carries `workspaceId`** and is indexed on it. `Project`, `Task`, `Label` already do.
2. **`WorkspaceGuard`** resolves the workspace from the `:workspaceSlug` route param, loads the caller's `Membership`, rejects with 404 (not 403 — don't leak existence) when absent, and attaches `{ workspaceId, role }` to the request.
3. **A Prisma client extension injects `workspaceId` into every `where` and every `create`**, taken from request-scoped context. A service that forgets to scope a query still cannot read another tenant's rows. This is the load-bearing control — guards alone are one forgotten `where` away from a leak.
4. **Roles:** `OWNER` / `ADMIN` / `MEMBER` via a `@Roles()` decorator. Only OWNER/ADMIN invite, rename, or remove members.

**Rules that fall out of the refs:** "Leave Workspace" (ref 13) is refused for the sole OWNER — transfer ownership first. Guest users get a private auto-created workspace seeded with the demo content, so the refs' screens are populated on first login.

**Tenant-scoped e2e test:** two workspaces, two users, assert every §5 route returns 404 across the boundary. This test is the gate on P3b.

---

## 5. API surface (NestJS, prefix `/api/v1`)

Modules: `AuthModule` · `UsersModule` · `WorkspacesModule` · `ProjectsModule` · `TasksModule` · `CommentsModule` · `LabelsModule` · `PrismaModule` (global).

| Method | Route | Purpose | Ref |
|---|---|---|---|
| `POST` | `/auth/guest` | Continue as Guest → JWT | 01 |
| `GET` | `/auth/google` → `/auth/google/callback` | Google OAuth | 01 |
| `POST` | `/auth/refresh`, `/auth/logout` | rotation | |
| `GET`/`PATCH` | `/me` | profile fields | 13 |
| `GET`/`PATCH` | `/me/preferences` | theme, accent, field visibility | 03,07,10,11 |
| `GET` | `/workspaces` | switcher list | 02 |
| `POST` | `/workspaces` | create workspace | 02 |
| `PATCH` | `/workspaces/:slug` | rename | |
| `GET` | `/workspaces/:slug/members` | member list | |
| `POST` | `/workspaces/:slug/invitations` | invite by email (OWNER/ADMIN) | |
| `POST` | `/invitations/:token/accept` | join | |
| `DELETE` | `/workspaces/:slug/members/:userId` | remove member (OWNER/ADMIN) | |
| `POST` | `/me/active-workspace` | remember last used | 02 |
| `POST` | `/me/leave-workspace` | Leave Workspace (blocked for sole OWNER) | 13 |
| `GET`/`POST` | `/projects` | list + create | 09 |
| `PATCH`/`DELETE` | `/projects/:id` | | 09 |
| `GET` | `/tasks?projectId=&status=&q=&groupBy=status` | board + list + search | 02,04,05,12 |
| `POST` | `/tasks` | Add Task / Add Subtask | 02,04,06 |
| `GET` | `/tasks/:id` | detail incl. subtasks, labels, activity | 06 |
| `PATCH` | `/tasks/:id` | title, priority, dueDate, labels… | 06,08 |
| `PATCH` | `/tasks/:id/move` | `{ status, beforeId, afterId }` → drag & drop | 02 |
| `DELETE` | `/tasks/:id` | | |
| `GET`/`POST` | `/tasks/:id/comments` | activity feed + reply | 06 |
| `GET` | `/labels`, `/members` | chip + member pickers | 06 |

**Cross-cutting:** global `ZodValidationPipe` from `packages/contracts`; `JwtAuthGuard` global with `@Public()` escape; `WorkspaceGuard` + the Prisma scoping extension (§4.3) on every tenant route; `ClassSerializerInterceptor`; global exception filter → RFC-7807 problem+json; `@nestjs/throttler`; Swagger at `/api/docs`; CORS locked to the web origin; `helmet`.

**Auth transport:** JWT in an **httpOnly, SameSite=Lax cookie** — server components can read it during SSR, which a `localStorage` token cannot.

---

## 6. Frontend data layer

- **Reads → React Server Components.** `/tasks`, `/projects`, `/tasks/[id]` fetch server-side with the forwarded auth cookie. No spinner on first paint.
- **Writes → React Query mutations** in client components. Board drag, priority change, field toggles, and checkbox flips all apply optimistically and roll back on error (`sonner` toast).
- **`revalidateTag`** per entity so a mutation refreshes only the affected server tree.
- **zustand holds UI state only** — open menus, search-open, view mode. Nothing that belongs in the database.
- A thin `apiFetch` wrapper in `lib/api.ts` handles base URL, cookie forwarding, and problem+json errors.

---

## 7. Routes (App Router)

```
apps/web/src/app/
  layout.tsx                      # fonts, theme+accent from cookie, QueryProvider, <Toaster/>
  (auth)/login/page.tsx           # ref 01
  invite/[token]/page.tsx         # accept invitation
  page.tsx                        # → redirect to /w/{activeWorkspaceSlug}/tasks
  (app)/w/[workspaceSlug]/layout.tsx   # SidebarProvider + AppSidebar + TopBar; 404s on non-membership
    tasks/page.tsx                # ?view=board|list  → refs 02–07
    tasks/[taskId]/page.tsx       # refs 06, 08
    projects/page.tsx             # refs 09–11
    projects/[projectId]/page.tsx # ref 12 (breadcrumb Projects › Design Homepage)
  (settings)/settings/layout.tsx  # separate sidebar (Back to app / Search / Profile·Theme·Color)
    settings/profile/page.tsx     # ref 13
    settings/theme/page.tsx
    settings/color/page.tsx
  middleware.ts                   # no JWT cookie → redirect /login
```

`view=board|list` is a **URL search param** (shareable, matches the Fields-menu List/Board tabs which switch the whole surface).

**The workspace lives in the URL** (`/w/acme/tasks`), not just in session state — so links are shareable, a user can hold two workspaces open in two tabs, and the tenant boundary is enforceable in `layout.tsx` before any child renders. No visible change to the refs' chrome.

---

## 8. Component inventory

**Shell** — `AppSidebar` (workspace switcher w/ avatar + `⌃⌄`, "Workspace" collapsible group, Tasks/Projects nav), `AccountMenu` (popover overlaying the sidebar: avatar block, Change Theme ▸, Color Mode ▸, Settings), `TopBar` (panel-toggle icon + optional breadcrumb), `SettingsSidebar`.

**Toolbar** — `PageToolbar` = title + search toggle (collapsed icon ⇄ 290 px input with `⌘F` kbd hint) + `FieldsMenu` + filter icon + primary `+ Add Task` / `+ Add Project`.

**Board** — `BoardView` → `BoardColumn` (grip, name, `+`, `···`, "+ Add Task" footer) → `TaskCard` (title + `···`, avatar + assignee, due badge, tag chips). dnd-kit sortable across columns, committing to `PATCH /tasks/:id/move`; column strip overflows horizontally (ref 02 shows On Hold clipped at the right edge — keep it a scroll container, do not shrink columns).

**List / Table** — `GroupedTable`: collapsible group header (`▾ To Do`), bordered card, header row `Task | Priority | Members | Due Date | Actions` on `#fafafa`, grid `minmax(0,1fr) 7rem 7rem 9rem 5rem`, "+ Add Task" footer row. Projects reuses it with `Projects | Priority | Lead | Due Date | Actions`.

**Task detail** — `TaskHeader`, `PropertiesRow` (Properties / Labels / Resources), `SubtasksTable` (same GroupedTable), `ActivityFeed` + reply composer + "Add a comment…" box, `RightRail` (5 icon actions: lock, `◉ 1` viewers, share, `···`, panel) and `DetailsPanel` (Status/Priority/Members/Dates/Labels/Teams/Reporter).

**Menus** — `PriorityMenu` (No Priority/Urgent/High/Medium/Low, colour-coded, ✓ on Urgent), `FieldsMenu` (List/Board segmented tabs + 7 checkbox rows — the refs genuinely list "Members" twice; reproduce it), `NestedFieldsMenu` (Projects: Status/Priority/Members/Due Date/Teams/Labels/Reporter each ▸, Priority hovered opening the priority submenu to its **left**), `DatePicker` (January 2026, 10 selected as a filled black circle, leading 30–31 and trailing 1–3 muted), `ThemeSubmenu`, `ColorModeSubmenu`.

**Primitives** — `PriorityCell` (bar-chart glyph + coloured label), `DueBadge`, `LabelChip`, `UserAvatar`, `MemberCell` (avatar | `CN` outlined initials | dashed `+`).

---

## 9. Build phases

| # | Phase | Output |
|---|---|---|
| **P0** | **Foundation** | Node upgrade (§1), turbo monorepo, docker-compose Postgres, `packages/contracts` skeleton, shared tsconfig/eslint. `pnpm dev` boots web :3000 + api :3001. |
| **P1** | **Data layer** | Prisma schema, first migration, seed reproducing every reference fixture, PrismaModule. *Gate:* `pnpm db:seed` then verify row counts against the refs. |
| **P2** | **API core** | Tasks + Projects CRUD, `/move` with fractional ranking, guards, validation pipe, problem+json filter, Swagger. *Gate:* supertest e2e green on every §5 route. |
| **P3** | **Auth** | Guest JWT, Google OAuth, cookie session, refresh rotation, `/me`, `/me/preferences`, Next middleware. *Refs:* 01, 13. |
| **P3b** | **Tenancy** | Workspace/Membership/Invitation models, `WorkspaceGuard`, the Prisma scoping extension, roles, invite + accept flow, `/w/[slug]` routing, functional sidebar switcher. *Gate:* the two-tenant isolation e2e (§4.3) passes. |
| **P4** | **Design system** | Tailwind v4 `@theme` tokens for **both** light and dark (§3.1, §3.3), 6 accents × 2 modes, Geist, shadcn install, theme+accent providers reading the cookie, glyph→lucide icon map. *Gate:* every screen legible in dark before P5 proceeds. |
| **P5** | **Shell** | AppSidebar, TopBar, breadcrumb, `(app)` layout, route stubs. *Refs:* 02, 12. |
| **P6** | **Login** | 26 px black `▲` mark + "Pyramid", 330 px card, "Let's get back on track", pill Continue-as-Guest (black) and Login-with-Google (outline, coloured G), 250 px legal text with underlined links. *Ref:* 01. |
| **P7** | **List / Projects** | GroupedTable + cell primitives, wired to RSC reads. *Refs:* 04, 09, 12. |
| **P8** | **Board** | Columns, cards, dnd-kit with optimistic `/move`. *Ref:* 02. |
| **P9** | **Toolbar & menus** | Search expand/collapse + `⌘F` + server-side `q` filtering (ref 05 shows one filtered row under a single "To Do" group); Fields menu toggles persisted to `UserPreference` and actually adding/removing columns; nested Projects menu. *Refs:* 03, 05, 07, 11. |
| **P10** | **Task detail** | Subtasks, activity/comments, right rail, Details panel, priority menu, date picker. *Refs:* 06, 08. |
| **P11** | **Account & settings** | Account popover, theme submenu, colour-mode submenu (6 swatches, ✓ Blue), settings sidebar, Profile page with live `PATCH /me`, workspace switcher + create/invite/members UI, Leave Workspace. *Refs:* 09, 10, 13. |
| **P12** | **Visual QA** | §10 — the acceptance gate. Light pixel-diffs against the refs; dark reviewed by eye + contrast assertions. |
| **P13** | **Hardening + deploy** | Empty states, skeletons, keyboard nav, focus rings, `aria` on icon-only buttons, error boundaries, mobile (sidebar → sheet, board → snap-scroll, table → stacked cards), then ship to Vercel per §12. |

P4–P6 can run in parallel with P2–P3 against a mocked contract, since `packages/contracts` fixes the shape up front.

---

## 10. Pixel-match verification (acceptance gate)

1. Playwright renders every route/state at **1280×800, DPR 2** into `qa/actual/`, against a seeded DB so content is identical run to run.
2. Reference PNGs upscaled ×1.5625 (0.64⁻¹) into `qa/expected/`, aligned on the app frame.
3. Side-by-side + difference composite per state; iterate until spacing, weights, and colours match.
4. Manual checklist per screen: font size/weight, letter-spacing, border colour, radius, icon size/stroke, gap, hover state.
5. Freeze with Playwright `toHaveScreenshot()` so later work can't regress the match.
6. **Dark pass:** same 13 states re-rendered with `data-theme="dark"`. No reference to diff against, so the gate is an automated contrast assertion (axe-core, AA) plus manual review — caught early because P4 gates on it too.
7. Reference 04 carries a stray orange "Mani" cursor artifact over the Completed group; that rectangle is masked in the comparison rather than reproduced.

**13 states to verify:** login · board · board+fields · list · list+fields · list+search · task+priority · task+datepicker · projects · projects+theme · projects+colormode · projects+nested-fields · project→tasks · settings-profile.

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| **Prisma 7 won't install on Node 20.15** | Resolve §1 before P0 — upgrade to Node 22 LTS |
| Copying artboard px verbatim → everything 20 % too small | Apply §3 mapping; verify at 1280 px, never trust the artboard |
| Type drift between Nest DTOs and Next | `packages/contracts` zod is the only definition; both sides import it |
| Artboard uses text glyphs (`▦ ⌕ ▟ ⠿ ✳`) as icons | Replace with lucide (`LayoutGrid`, `Search`, `SignalHigh`, `GripVertical`, `Sun`); glyph→icon table in `components/icons.tsx` |
| Fonts: refs are Geist; a fallback shifts every metric | `geist` package + `next/font` |
| Tailwind v4 has no JS config — v3 snippets won't apply | All tokens in `@theme` inside `globals.css` |
| Optimistic drag desyncs on concurrent edits | Server returns the canonical row; React Query reconciles on settle |
| Dark mode has no reference to match | Derived from the neutral scale, held to WCAG AA, signed off by eye before P12 (§3.3) |
| Dark mode bolted on late → invisible black-on-black buttons | Both palettes authored together in P4; P4 does not close until every screen is legible in dark |
| Mobile has no reference | Build as a designed extrapolation, flagged as such |
| Nest on Vercel: cold starts + Prisma connection exhaustion | Neon pooled driver adapter (§12); if p95 latency disappoints, the API moves to a container host with no code change |

---

## 12. Deployment — Vercel

**Both apps on Vercel**, two projects from the one monorepo (root directories `apps/web` and `apps/api`), with Turborepo remote caching and `ignoreCommand` so a web-only commit doesn't rebuild the API.

**Nest on Vercel.** `apps/api/api/index.ts` is a single `@vercel/node` (5.10.1) handler wrapping the Nest app with `@vendia/serverless-express` (4.12.6). The `INestApplication` is created once at module scope and reused across warm invocations, so bootstrap cost is paid on cold start only.

**Database — Neon serverless Postgres.** Prisma 7's driver adapter `@prisma/adapter-neon` (7.9.1) + `@neondatabase/serverless` (1.1.0) talk over Neon's pooled endpoint. This matters: a normal TCP Prisma client in a serverless function exhausts Postgres connections under any real concurrency. Two URLs — `DATABASE_URL` (pooled, runtime) and `DIRECT_URL` (unpooled, migrations).

**Same-origin cookies.** The web app rewrites `/api/*` to the API deployment via `next.config.ts`, so the browser only ever sees one origin. That keeps the httpOnly JWT cookie (§5) a first-party cookie with no CORS preflight and no shared-parent-domain gymnastics.

**Migrations** run as a CI step (`prisma migrate deploy`) before promoting the deployment — never at runtime, where concurrent cold starts would race.

**Previews:** every PR gets a Vercel preview plus a Neon branch database seeded from `prisma/seed.ts`, so reviewers see the reference fixtures.

**Environment:** `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `APP_URL`.

**Known limits of this target:** Nest cold starts land around 1–2 s on the first request after idle; Vercel functions can't hold WebSockets (irrelevant now, relevant if live collaboration is ever added); scheduled work needs Vercel Cron. If p95 latency disappoints, the API moves to a container host — the Nest code is unchanged, only the entrypoint differs.

---

## 13. Resolved decisions

| Question | Decision |
|---|---|
| Backend + DB | NestJS 11 + PostgreSQL (Neon) + Prisma 7 |
| Light / dark | **Both ship in v1** (§3.3) — dark is our design, AA-checked, signed off by eye |
| Multi-tenancy | **Real** (§4.3) — workspaces in the URL, membership roles, invitations, query-level isolation |
| Deployment | **Vercel** for web + API, Neon for Postgres (§12) |
| Google OAuth | Client to provide credentials |
| Presence cursor (ref 04) | Not a feature — artifact in the screenshot, masked during QA |

## 14. Inputs needed from you

1. **Google OAuth credentials** — client ID + secret, and confirmation that these redirect URIs are registered:
   - `http://localhost:3000/api/v1/auth/google/callback` (local)
   - `https://<preview>.vercel.app/api/v1/auth/google/callback` (previews — or a stable preview alias)
   - `https://<production-domain>/api/v1/auth/google/callback`
2. **Production domain** for the Vercel project and the OAuth callback above.
3. **Vercel + Neon accounts** — or say the word and I'll scaffold against local Docker Postgres first and wire the hosted target at P13.

Nothing else blocks P0. The only remaining pre-flight item is the Node upgrade in §1.
