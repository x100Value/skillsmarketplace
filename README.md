# SkillsMarketplace MVP

MVP for Telegram Mini App + Stars billing + LLM task execution.

## Stack
- Node.js 20+
- TypeScript
- Express
- PostgreSQL 15+

## Features in this MVP
- Telegram Mini App auth (`initData` signature verification)
- Session tokens
- Stars payment webhook handling (idempotent)
- Hybrid payments:
  - `stars` as primary rail with platform fee model (`+30%` by default) in Telegram Mini App
  - `ton_usdt` top-up intent flow (manual confirm endpoint for MVP) in external web dashboard (`/pro`)
- Balance ledger with hold/release/debit
- LLM task execution as black-box stub
- Manual withdrawal requests
- Admin endpoints for withdrawal approve/reject
- Structured audit logging
- Skill Check mode (non-chat):
  - `quote` before run (creator sees estimated price)
  - strict JSON-only uniqueness check flow
  - free/paid/hybrid search providers
  - report with uniqueness score, risk level, and sources
- Fintech+AI Mini App UX with bottom tabs:
  - Home
  - Tool
  - History
  - Wallet
  - Settings

## Project structure
```
.
├─ package.json
├─ tsconfig.json
├─ .env.example
├─ db/
│  └─ migrations/
├─ scripts/
│  └─ migrate.ts
├─ src/
│  ├─ server.ts
│  ├─ config.ts
│  ├─ db.ts
│  ├─ types.ts
│  ├─ telegram.ts
│  ├─ middleware/
│  ├─ services/
│  └─ routes/
└─ web/
   ├─ index.html
   ├─ app.js
   └─ styles.css
```

## Quick start
1. Install dependencies:
```bash
npm install
```

2. Copy env file:
```bash
cp .env.example .env
```

3. Configure `.env` values:
- `DATABASE_URL`
- `TELEGRAM_BOT_TOKEN`
- `BILLING_ADMIN_TOKEN`
- `WEBHOOK_SECRET_TOKEN`
- `STARS_PLATFORM_FEE_PERCENT` (default `30`)
- `TON_USDT_WALLET`
- `USDT_TO_STARS_RATE`

4. Run migrations:
```bash
npm run migrate
```

5. Start dev server:
```bash
npm run dev
```

Server URL: `http://localhost:8080`
- Telegram Mini App UI: `http://localhost:8080/`
- External Pro dashboard: `http://localhost:8080/pro`

## Main API
- `GET /health`
- `POST /api/auth/telegram`
- `GET /api/me`
- `GET /api/history`
- `GET /api/pricing/rails`
- `POST /api/pricing/quote`
- `POST /api/tasks/run`
- `POST /api/skill-check/quote`
- `POST /api/skill-check/run`
- `POST /api/payments/telegram/webhook`
- `POST /api/payments/ton-usdt/create-intent`
- `POST /api/payments/ton-usdt/confirm` (admin)
- `POST /api/withdrawals/request`
- `GET /api/admin/withdrawals`
- `POST /api/admin/withdrawals/:id/approve`
- `POST /api/admin/withdrawals/:id/reject`

## Dual-Rail Compliance model
- Inside Telegram Mini App (`x-client-surface: telegram`): `stars` rail only.
- External web dashboard (`/pro`, `x-client-surface: web`): `ton_usdt` rail.
- Backend blocks `ton_usdt` quote/intent/confirm calls from Telegram surface.
- Mini App frontend sends `x-client-surface: telegram`; Pro dashboard sends `x-client-surface: web`.

## Notes
- This is an MVP baseline. LLM call is a stub in `src/services/llm.ts`.
- Task charge in `stars` rail is calculated as `base + STARS_PLATFORM_FEE_PERCENT` (default +30%).
- Skill Check is intentionally not a chatbot endpoint; it accepts only strict check payloads.
- For production: add KYC/compliance, anti-fraud scoring, queues, retries, and secrets manager.
