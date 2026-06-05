# Demo data

New instructor accounts with **no classes and no activities** receive seeded demo content on the **first dashboard visit**.

## What gets created automatically

| Item | Count | Notes |
| ---- | ----- | ----- |
| Classes | 2 | Grade 3A — Morning, Grade 3B — Afternoon — each with a unique access code |
| Activities | 4 | 2 quizzes, 1 memory, 1 matching |
| Leaderboard samples | 7 | Pre-filled submissions so the dashboard is not empty |

- Sample LIBRAS instruction videos (public MP4 URLs).
- Quiz JSON with visual stimuli and Portuguese word options.
- Quiz submissions include answer details for the instructor view.

## Where to find the class code

Dashboard → **Classes** list → copy the code for the class you want to test (e.g. Grade 3A — Morning).

Use that code in the **student simulator** (web), not in the instructor dashboard.

## Per reviewer

- Each new instructor account gets its **own** access codes.
- Demo content pattern is the same; codes differ (`generateAccessCode()`).

## Reset demo seeding

To see auto-seed again: use a **new instructor account**, or delete that instructor’s classes and activities in the database.

## Optional database sync

When working from a source checkout with database access:

```bash
pnpm db:sync-visual-quizzes   # refresh English demo titles on an existing database
```
