# Evaluator script (5 minutes)

## What this software does

- **Teaches:** written **Portuguese** (literacy, words, colors, family).
- **Audience:** deaf people who communicate in **LIBRAS**.
- **LIBRAS:** instruction video only — not the subject being assessed.

## Before you open

1. Web deploy with database configured (Neon + `pnpm db:migrate` once).
2. `NEXT_PUBLIC_STUDENT_APP_URL` on the **web** project pointing to the student simulator (`apps/mobile`).

## Step by step

| # | Where | Action |
| - | ----- | ------ |
| 1 | Web `/login` | Create an instructor account (or sign in). |
| 2 | Dashboard | Check auto-seeded data: **2 classes**, **4 activities**, **7 submissions** on the leaderboard. |
| 3 | Dashboard hero | **Open student simulator** → copy **Grade 3A — Morning** class code. |
| 4 | Simulator | Paste code → choose **Colors in Portuguese** (quiz). |
| 5 | Quiz | Instruction video → pick written Portuguese words (visual cards) → review → submit. |
| 6 | Dashboard | Leaderboard updates; note **Mobile-ready** vs **Dashboard only** badges. |

## Seeded content (new account)

| Class | Activities | Student simulator? |
| ----- | ---------- | ------------------ |
| Grade 3A — Morning | Colors in Portuguese (quiz), Animals: Portuguese words (memory) | Quiz only |
| Grade 3B — Afternoon | Numbers 1 to 5 (matching), My family (quiz) | My family quiz only |

Quiz cards still show **Portuguese words** (vermelho, mãe, etc.) — that is the learning target.

## Honest demo limits

- Memory and matching are dashboard-only (not in the student app yet).
- Instruction videos are sample clips; production would use teacher recordings.
- Run `pnpm db:sync-visual-quizzes` to refresh English demo titles on an existing database.

## Links

- [PRODUCT.md](./PRODUCT.md) — pedagogical positioning
- [README.md](../README.md) — Vercel deploy (web + simulator)
