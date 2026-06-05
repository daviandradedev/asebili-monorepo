# Asebili

Demo EdTech platform that teaches **written Portuguese** to **deaf students who communicate in LIBRAS**.

LIBRAS is the **instruction language** (videos and visual support so learners understand the task). The app does **not** teach LIBRAS and does **not** quiz students on signs — only on **Portuguese literacy** (words, colors, vocabulary) with minimal text and strong visuals.

See [docs/PRODUCT.md](docs/PRODUCT.md) for the full product positioning.

Built as a portfolio project: instructor dashboard → student responds → evidence on the leaderboard.

## Demo On Vercel (recommended)

Deploy **two** Vercel projects from this monorepo. Reviewers can test everything in the browser — no phone or local database setup required on their side.

| Vercel project | Root directory | Role |
| -------------- | -------------- | ---- |
| `asebili-web` | `apps/web` | Instructor dashboard, auth, API, database |
| `asebili-student` | `apps/mobile` | Student app as a **web SPA** (Expo export) |

### 1. Web (instructor + API)

**Root Directory:** `apps/web`

Environment variables:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.neon.tech/DB?sslmode=require"
DATABASE_POOL_MAX="5"
BETTER_AUTH_SECRET="stable-production-secret"
BETTER_AUTH_URL="https://your-asebili-web.vercel.app"
BETTER_AUTH_TRUSTED_ORIGINS="https://your-asebili-web.vercel.app,https://your-asebili-student.vercel.app"
```

`apps/web/vercel.json` already sets the monorepo install command. Default Next.js build applies.

Use a hosted PostgreSQL URL (e.g. Neon). Run migrations once against that database before sharing the link — see [Database (optional)](#database-optional) below.

### 2. Student app (mobile → web)

**Root Directory:** `apps/mobile`

Environment variable (baked in at build time):

```bash
EXPO_PUBLIC_API_URL="https://your-asebili-web.vercel.app"
```

`apps/mobile/vercel.json` exports the Expo Router app as static web (`dist/`) with SPA rewrites.

After deploy you get a URL like `https://asebili-student.vercel.app`. Share that link in your demo script:

> Open the **student simulator** in the browser → enter the class code → complete a visual quiz.

No Expo Go or app store needed for reviewers.

### Demo flow for reviewers

Each evaluator creates their **own** instructor account — demo classes, activities, and leaderboard samples seed on first dashboard visit. You only share the two deploy URLs, not your login.

1. Open **web** → sign up as instructor (demo data seeds automatically).
2. Copy the **class code** from the dashboard (e.g. Grade 3A — Morning).
3. Open **student web** → enter **name** + **class code** → complete a visual quiz.
4. Return to **web** → check the leaderboard (student name appears on submissions).

Full 5-minute script: [docs/EVALUATOR.md](docs/EVALUATOR.md).

## Why two Vercel deploys?

Expo Router exports natively to the web. The student UI is the same codebase as the mobile app, but compiled as a static SPA. It calls the public API on the web project (`EXPO_PUBLIC_API_URL`). CORS is enabled on `/api/public/*` so cross-origin browser requests work.

This is ideal for portfolio demos: professors click a link instead of installing an app.

## Local development

```bash
pnpm install
pnpm --filter web dev          # http://localhost:3000
pnpm --filter mobile web       # student UI in the browser
# or: pnpm --filter mobile start  # Expo dev tools + QR for native
```

`apps/mobile/.env`:

```bash
EXPO_PUBLIC_API_URL="http://127.0.0.1:3000"
```

## React versions

Web and mobile both use **React 19.2** via the root `pnpm` overrides. Shared packages (`@asebili/database`, `@asebili/i18n`) stay on one `@types/react` version across workspaces.

## Apps and packages

| Workspace | Purpose |
| --------- | ------- |
| `apps/web` | Next.js dashboard, Better Auth, public API |
| `apps/mobile` | Expo Router student app (native + web export) |
| `packages/database` | Drizzle schema, quiz models |
| `packages/i18n` | PT / EN strings |

## Public API (student app)

| Method | Route | Purpose |
| ------ | ----- | ------- |
| `GET` | `/api/public/classes/:code` | Class + activities by code |
| `GET` | `/api/public/activities/:id` | Single activity |
| `POST` | `/api/public/activities/:id/logs` | Submit performance log |

## Database (optional)

Only needed when you set up or reset the hosted Postgres behind Vercel — not for reviewers testing the live demo.

```bash
# apps/web/.env.local with DATABASE_URL, then:
pnpm db:migrate               # auth schema, quiz details, student_name on logs
pnpm db:sync-visual-quizzes   # optional: refresh visual quiz JSON on existing DB
```

See [docs/deploy.md](docs/deploy.md) for production notes.

## Validation

```bash
pnpm check-types
pnpm lint
pnpm --filter web build
pnpm --filter mobile build    # Expo web export (same as Vercel student deploy)
```

## Product positioning

| Teaches | Does not teach |
| ------- | -------------- |
| Written Portuguese (literacy, words) | LIBRAS |
| Visual quizzes with Portuguese labels | Sign knowledge / “which sign means…” |

Details: [docs/PRODUCT.md](docs/PRODUCT.md) · Evaluator script: [docs/EVALUATOR.md](docs/EVALUATOR.md)

On the **web** Vercel project, set `NEXT_PUBLIC_STUDENT_APP_URL` to the student simulator URL so the dashboard shows **Open student simulator**.
