# Review walkthrough

Extended guide for trying the live demo. Start with [README.md](../README.md) for the overview.

## What this software does

- **Teaches:** written **Portuguese** (literacy, words, colors, family).
- **Audience:** deaf people who communicate in **LIBRAS**.
- **LIBRAS:** instruction video only — not the subject being assessed.

## Two apps, one flow

| App | What you do there |
| --- | ----------------- |
| Instructor dashboard | Sign up, inspect classes/activities, read the leaderboard |
| Student simulator | Enter name + class code, complete a visual quiz |

Use your **own** instructor account. Demo classes, activities, and sample leaderboard entries appear on first dashboard visit.

## Step by step

| Step | Where | Action |
| ---- | ----- | ------ |
| 1 | Instructor web `/login` | Sign up (new account). |
| 2 | Dashboard | Check **2 classes**, **4 activities**, sample leaderboard. |
| 3 | Dashboard | Open student simulator → copy **Grade 3A — Morning** class code. |
| 4 | Student simulator | Name + code → **Colors in Portuguese**. |
| 5 | Quiz | Instruction video → Portuguese word cards → submit. |
| 6 | Dashboard | Leaderboard shows your name, score, and time. |

## Seeded content

| Class | Activities | Student simulator? |
| ----- | ---------- | ------------------ |
| Grade 3A — Morning | Colors in Portuguese (quiz), Animals (memory) | Quiz only |
| Grade 3B — Afternoon | Numbers 1 to 5 (matching), My family (quiz) | My family quiz only |

## Demo limits

- Memory and matching are dashboard-only.
- Sample instruction videos; production would use teacher recordings.
- VLibras works in the browser deploys, not in Expo Go native.
- Each reviewer gets a unique class code; demo pattern is the same.

## Related docs

- [PRODUCT.md](./PRODUCT.md) — what the product teaches and does not teach
- [DEMO-DATA.md](./DEMO-DATA.md) — what auto-seeds on a new account
- [accessibility-report.md](./accessibility-report.md) — accessibility baseline
