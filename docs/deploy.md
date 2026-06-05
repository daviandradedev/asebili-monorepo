# Deploy

## Vercel (demo)

Two projects from one repo:

1. **`apps/web`** — instructor dashboard + API + auth  
2. **`apps/mobile`** — student experience as static web (`expo export --platform web`)

### Web project env

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.neon.tech/DB?sslmode=require"
DATABASE_POOL_MAX="5"
BETTER_AUTH_SECRET="stable-production-secret"
BETTER_AUTH_URL="https://your-asebili-web.vercel.app"
BETTER_AUTH_TRUSTED_ORIGINS="https://your-asebili-web.vercel.app,https://your-asebili-student.vercel.app"
```

Preview deployments: the app also trusts Vercel preview URLs when `VERCEL_URL` is set.

### Student web project env

```bash
EXPO_PUBLIC_API_URL="https://your-asebili-web.vercel.app"
```

Rebuild the student project when the API URL changes (value is embedded at build time).

### CORS

Public API routes (`/api/public/*`) return `Access-Control-Allow-Origin: *` so the student SPA on a second Vercel domain can call the API from the browser.

## Database (one-time)

Point `DATABASE_URL` at Neon (or any Postgres), then from your machine:

```bash
pnpm db:migrate
pnpm db:sync-visual-quizzes
```

Not required for every deploy — only when creating or resetting the database.

## Native mobile (optional)

For Expo Go on a phone, set `EXPO_PUBLIC_API_URL` to the deployed web URL and run `pnpm --filter mobile start`.
