# ElevateOS

Tutoring execution platform for IB students. Connects tutors, students, and parents through a structured workflow — assignments, submissions, feedback, session notes, and progress reports — without the overhead of chat history or scattered documents.

Live at [elevateos.org](https://elevateos.org).

## Roles

| Role | Route | Capabilities |
|------|-------|-------------|
| Tutor | `/tutor-dashboard` | Assign tasks, review submissions, write session notes, generate parent reports |
| Student | `/student-dashboard` | View tasks, submit work, read feedback |
| Parent | `/student-dashboard` | Read-only view of student progress and tutor feedback |
| Admin | `/admin` | User and platform management |

## Stack

- **Next.js 15** — App Router, Server Components
- **PostgreSQL** via Prisma ORM
- **NextAuth.js** — Google OAuth + email/password
- **Tailwind CSS**
- **DigitalOcean App Platform** — push-to-deploy from `main`
- **GitHub Actions** — type check, lint, CodeQL

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full setup. Quick start:

```bash
npm install && cp .env.example .env.local && npm run dev
```

Set `DEMO_MODE=true` to run with mock data — no database required for UI preview.