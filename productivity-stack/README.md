# Productivity Stack (Implemented)

This project implements all requested components:

1. Core agent runtime (Responses API + tool loop + durable state + retries)
2. WebSockets transport
3. Long-running worker with checkpoints/resume primitives
4. Skills registry + routing + guardrails
5. Evals suite (`npm run evals`)
6. Prompt caching key strategy
7. Realtime voice integration scaffold (`src/realtime/voice.ts`)
8. Batch image workflow scaffold (`src/images/batch.ts`)

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

## Endpoints

- `POST /turn` with `{ "conversationId": "abc", "text": "..." }`
- `GET /health`
- WebSocket on `ws://localhost:8787`

## CI Gate

Run evals in CI:

```bash
npm run evals
```

Exit code 1 = fail.

## Notes

- This is a production-oriented scaffold. Add auth, stricter tool schemas, and queue infra for large-scale use.
- For true Batch API usage, replace the image placeholder call with `batches.create` file-driven jobs.
