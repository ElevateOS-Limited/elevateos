# EduTech - AI-Powered Study Platform

A premium AI-powered productivity platform for high school students preparing for IB, AP, SAT, ACT exams and university admissions.

## Features

- 🧠 AI Study Assistant - Upload notes and get summaries, flashcards, study plans
- 📝 Worksheet Generator - AI-generated practice questions for any subject
- ⏱️ Past Paper Simulation - Timed exam practice with scoring
- 🎓 University Admissions Assistant - AI-powered admission analysis
- 💼 Internship Recommender - Curated opportunities
- 💬 AI Chatbot - Available on every page

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **AI**: OpenAI GPT-4o
- **Auth**: NextAuth.js (Email + Google)
- **Payments**: Stripe

## Demo mode (no login required)

Set `DEMO_MODE=true` and `NEXT_PUBLIC_DEMO_MODE=true` in your `.env` (see `.env.example` for the extra demo variables). Visitors are automatically signed in as the demo account defined by `DEMO_USER_EMAIL`/`DEMO_USER_PASSWORD`, and the same credentials are exposed client-side via `NEXT_PUBLIC_DEMO_USER_*` so the auto sign-in flow can request a session. Once enabled, all dashboard tools, AI endpoints, and Stripe checkout routes will accept that session without needing any OAuth configuration.

## Quick Start (Windows)

See SETUP.md for step-by-step Windows setup instructions.
