# Asebili

Demo EdTech platform that teaches **written Portuguese** to **deaf students who communicate in LIBRAS**.

LIBRAS is the **instruction language** (videos and visual support so learners understand the task). The app does **not** teach LIBRAS and does **not** quiz students on signs — only on **Portuguese literacy** (words, colors, vocabulary) with minimal text and strong visuals.

See [docs/PRODUCT.md](docs/PRODUCT.md) for pedagogical positioning.

---

## How to review this demo (~5 minutes)

You only need a **browser** and **two public URLs** (instructor dashboard + student simulator).

| App | URL | Your role |
| --- | ------------- | --------- |
| **Instructor dashboard** | `https://asebili-instructor-dd.vercel.app/` | Sign up, manage classes, read the leaderboard |
| **Student simulator** | `https://asebili-student-dd.vercel.app/` | Enter name + class code, complete a quiz |

Create **your own** instructor account — demo data seeds automatically on first dashboard visit. Your class code will differ from other reviewers; the demo content pattern is the same.

### Step by step

| Step | Where | What to do |
| ---- | ----- | ---------- |
| 1 | Instructor web → `/login` | **Sign up** with your email (new instructor account). |
| 2 | Dashboard | Confirm auto-seeded data: **2 classes**, **4 activities**, sample **leaderboard** entries. |
| 3 | Dashboard | Click **Open student simulator** (or open the student URL). Copy the class code for **Grade 3A — Morning**. |
| 4 | Student simulator | Enter your **name** and the **class code** → open **Colors in Portuguese**. |
| 5 | Quiz | Watch the instruction video → pick written Portuguese words on visual cards → review → submit. |
| 6 | Dashboard | Refresh the leaderboard — your submission should show your **name**, score, and response time. |

### Seeded content (new account)

| Class | Activities | Available in student simulator? |
| ----- | ---------- | ------------------------------- |
| Grade 3A — Morning | Colors in Portuguese (quiz), Animals: Portuguese words (memory) | Quiz only |
| Grade 3B — Afternoon | Numbers 1 to 5 (matching), My family (quiz) | My family quiz only |

Quiz cards show **Portuguese words** (e.g. *vermelho*, *mãe*) — that is what is being taught.

Dashboard badges: **Mobile-ready** = open in the simulator; **Dashboard only** = instructor preview, not in the simulator yet.

### What you do not need

- A shared instructor login or someone else’s class code.
- `pnpm`, Docker, or a local database.
- A native mobile app (the student experience is a **web SPA**).

### Demo limits

- Memory and matching activities are dashboard-only for now.
- Instruction videos are sample clips; production would use teacher-recorded LIBRAS.
- VLibras (floating widget) works in the **browser** on both deploys, not in Expo Go native.

More detail: [docs/EVALUATOR.md](docs/EVALUATOR.md) · [docs/DEMO-DATA.md](docs/DEMO-DATA.md)

---

## Architecture

**Flow:** instructor dashboard → student responds in the simulator → evidence on the leaderboard.

Two Vercel deploys from one monorepo:

| Vercel project | Root directory | Role |
| -------------- | -------------- | ---- |
| `asebili-web` | `apps/web` | Next.js dashboard, auth, API, database |
| `asebili-student` | `apps/mobile` | Expo Router app exported as static web |

The student SPA calls the public API on the web project (`EXPO_PUBLIC_API_URL`). CORS is enabled on `/api/public/*`.

| Workspace | Purpose |
| --------- | ------- |
| `apps/web` | Instructor dashboard, Better Auth, public API |
| `apps/mobile` | Student app (native + web export) |
| `packages/database` | Drizzle schema, quiz models |
| `packages/i18n` | PT / EN UI strings |

### Public API

| Method | Route | Purpose |
| ------ | ----- | ------- |
| `GET` | `/api/public/classes/:code` | Class + activities by code |
| `GET` | `/api/public/activities/:id` | Single activity |
| `POST` | `/api/public/activities/:id/logs` | Submit performance log |

---

## Running from source

```bash
pnpm install
pnpm --filter web dev          # http://localhost:3000
pnpm --filter mobile web       # student UI in the browser
# or: pnpm --filter mobile start  # Expo dev tools + QR (native; no VLibras)
```

`apps/mobile/.env`:

```bash
EXPO_PUBLIC_API_URL="http://YOUR_IP:3000"
```

Deploy and env vars: [docs/deploy.md](docs/deploy.md)

Database setup (hosting only):

```bash
pnpm db:migrate
pnpm db:sync-visual-quizzes   # optional
```

### Validation

```bash
pnpm check-types
pnpm lint
pnpm --filter web build
pnpm --filter mobile build
```

---

## Product summary

| Teaches | Does not teach |
| ------- | -------------- |
| Written Portuguese (literacy, words) | LIBRAS |
| Visual quizzes with Portuguese labels | Sign knowledge |

| Doc | Contents |
| --- | -------- |
| [docs/PRODUCT.md](docs/PRODUCT.md) | Pedagogical positioning |
| [docs/EVALUATOR.md](docs/EVALUATOR.md) | Extended review walkthrough |
| [docs/DEMO-DATA.md](docs/DEMO-DATA.md) | Auto-seeded demo content |
| [docs/deploy.md](docs/deploy.md) | Vercel deploy and env vars |
| [docs/accessibility-report.md](docs/accessibility-report.md) | Accessibility baseline |
