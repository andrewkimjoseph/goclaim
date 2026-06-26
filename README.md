# GoClaim

Your GoodDollar UBI, on autopilot.

GoClaim automatically claims G$ daily on behalf of users who have verified and whitelisted their root wallet. Users connect via SIWE, GoClaim spins up an ERC-4337 smart account, and a daily cron enqueues claims through BullMQ at 12 PM UTC.

## Stack

- **Frontend + API:** Next.js 14 (Vercel)
- **Database:** Postgres + Prisma (Neon)
- **Queue:** BullMQ + Upstash Redis
- **Worker:** Node.js (Railway)
- **On-chain:** Pimlico + permissionless.js on Celo mainnet

## Local development

```bash
cp .env.example .env.local
# Fill in DATABASE_URL, JWT_SECRET, ENCRYPTION_MASTER_KEY, etc.

npm install
npx prisma migrate dev
npm run dev
```

In a second terminal:

```bash
npm run worker
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run worker` | BullMQ claim worker |
| `npm run claim-test` | Manual claim for one user (`USER_ID=...`) |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Generate Prisma client |

## Deployment

### Vercel (Next.js)

Set env vars from `.env.example`. Run migrations via `npx prisma migrate deploy` in build or separately.

### Railway (Worker)

Deploy with `railway.toml`. Required env: `DATABASE_URL`, `UPSTASH_REDIS_URL`, `ENCRYPTION_MASTER_KEY`, `PIMLICO_API_KEY`.

### Railway Cron

Schedule: `0 12 * * *` (UTC)

```bash
curl -X POST https://your-domain/api/internal/trigger-claims \
  -H "Authorization: Bearer $CRON_SECRET"
```

## User flow

1. Connect GoodDollar **root** wallet + SIWE sign-in
2. Agent smart account is created automatically
3. Link smart account in GoodDollar (one-time)
4. Daily claims at 12 PM UTC → G$ forwarded to root wallet

## Key rotation

```bash
OLD_MASTER_KEY=... NEW_MASTER_KEY=... npm run rotate-keys
```
