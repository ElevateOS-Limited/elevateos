# ElevateOS

ElevateOS is the merged Next.js App Router codebase for `elevateos.org`.

It now includes the tutoring MVP plus the merged supporting surfaces:
- study planning, notes, worksheets, flashcards, progress, and dashboards
- admissions and internships support
- activity opportunities, password reset, health checks, privacy, and terms
- Stripe billing and webhook flows
- partner dashboard material imported into the canonical app

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth
- Stripe
- OpenAI / Anthropic integrations

## Local setup

1. Copy `.env.example` to `.env` and fill in the required values.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npm run db:generate`
4. Sync schema to your database: `npm run db:push`
5. Start development: `npm run dev`

Minimum required environment variables:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `OPENAI_API_KEY`

## Demo mode

Set `DEMO_MODE=true` and `NEXT_PUBLIC_DEMO_MODE=true` to boot the app without a live login. The app will sign into the demo account defined by `DEMO_USER_EMAIL` and `DEMO_USER_PASSWORD`.

## AI provider setup

`AI_PROVIDER=auto` prefers Gemini / Vertex AI when Google Cloud settings are available, then falls back through the configured providers. This keeps the tutoring MVP runnable while the production provider mix evolves.

For Vertex AI on managed hosts like DigitalOcean App Platform, set:

- `GOOGLE_GENAI_USE_VERTEXAI=true`
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_LOCATION`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON_B64`

`scripts/start-prod.mjs` hydrates the service-account JSON into a temp file before `next start` boots.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm run test:ci`
- `npm run build`

## Deployment

- `npm run start` respects `PORT` and binds on `0.0.0.0`
- Health endpoints:
  - `/healthz`
  - `/api/health`

See `SETUP.md` and `docs/digitalocean-app-platform.md` for deployment details.
