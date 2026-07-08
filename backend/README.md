# Golden Bull API

Real backend for the storefront: Express + TypeScript + Prisma + SQLite. Replaces
`mock-server/` (json-server) and the hardcoded arrays that used to live inside the
Angular services.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:push   # creates dev.db from prisma/schema.prisma
npm run seed           # loads the 13 products + 2 test users
npm run dev             # http://localhost:3000
```

Seeded accounts (same credentials as the old mock-server so nothing else changes):

| Email | Password | Role |
|---|---|---|
| test@test.com | 123456 | customer |
| admin@leatherhoard.com | admin123 | admin |

## Endpoints

- `POST /api/auth/register` `{ name, email, password }`
- `POST /api/auth/login` `{ email, password }`
- `GET /api/auth/me` (auth required)
- `PATCH /api/auth/me` (auth required)
- `GET /api/products` `?category=belts`
- `GET /api/products/:id`
- `POST /api/products` / `PUT /api/products/:id` / `DELETE /api/products/:id` (admin only — for the admin CRUD screens in day 9 of the plan)
- `POST /api/orders` (auth required)
- `GET /api/orders/me` (auth required — current user's orders)
- `GET /api/orders` (admin only)
- `PATCH /api/orders/:id/status` (admin only)
- `POST /api/payments/paymob/initiate` `{ orderId }` (auth required — returns `{ iframeUrl }` to redirect the customer to)
- `POST /api/payments/paymob/webhook` (public, HMAC-verified — Paymob calls this, not the frontend)

All protected routes expect `Authorization: Bearer <token>`.

## Paymob (card payments)

Card checkout goes through [Paymob Accept](https://accept.paymob.com). Setup:

1. Create a Paymob merchant account at accept.paymob.com and complete verification (required before you can go live, but test/sandbox keys work immediately for development).
2. In the Paymob dashboard, go to **Developers > API Keys** and copy the API Key into `PAYMOB_API_KEY`.
3. Go to **Developers > Payment Integrations**, add a "Card" integration, and copy its integration ID into `PAYMOB_INTEGRATION_ID_CARD`.
4. Go to **Developers > iFrames**, create an iframe linked to that card integration, and copy the iframe ID into `PAYMOB_IFRAME_ID`.
5. Go to **Settings > Account Info** (or the integration's webhook settings) and copy the **HMAC secret** into `PAYMOB_HMAC_SECRET`. This is what proves a webhook call really came from Paymob — never skip it.
6. In the same webhook settings, set the callback/webhook URL to `https://<your-deployed-api-domain>/api/payments/paymob/webhook`. This only works once the backend is deployed somewhere with a public URL — it can't point at `localhost`. For local testing, tools like `ngrok` can expose your local server temporarily.
7. Restart the backend after editing `.env` so the new variables are picked up.

Without these four variables set, `/api/payments/paymob/initiate` will fail with a clear "Missing required env var" error — other checkout flows (cash on delivery, etc.) are unaffected.

The order's `paymentStatus` field (`unpaid` / `paid` / `failed`) is updated automatically by the webhook once Paymob confirms the transaction — check it via Prisma Studio (`npx prisma studio`) or `GET /api/orders/:id`.

## Why SQLite + Prisma

Zero setup (no DB server to install/run), the schema is version-controlled and
type-safe, and moving to Postgres later is a one-line `datasource` change plus a
`prisma migrate` — you are not locked in for production.

## Production note

`JWT_SECRET` in `.env.example` is a placeholder. Generate a real random secret
before deploying (`openssl rand -base64 48`), and never commit `.env`.
