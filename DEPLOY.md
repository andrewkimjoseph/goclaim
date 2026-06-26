# GoClaim Deployment Checklist

## 1. Neon Postgres

1. Create a Neon project and copy `DATABASE_URL`
2. Run migrations: `npx prisma migrate deploy`

## 2. Upstash Redis

1. Create a Redis database on Upstash
2. Copy `UPSTASH_REDIS_URL` (use the TLS/rediss URL)

## 3. Generate secrets

```bash
openssl rand -hex 32   # ENCRYPTION_MASTER_KEY
openssl rand -base64 32  # JWT_SECRET (32+ chars)
openssl rand -hex 32   # CRON_SECRET
```

## 4. Vercel (Next.js)

Env vars:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL` (e.g. https://goclaim.xyz)
- `CRON_SECRET`
- `ENCRYPTION_MASTER_KEY` (needed for agent create API)
- `PIMLICO_API_KEY` (optional on Vercel if status reads only)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (optional)

Deploy: connect repo, build uses `vercel.json`.

## 5. Railway (Worker)

Env vars:

- `DATABASE_URL`
- `UPSTASH_REDIS_URL`
- `ENCRYPTION_MASTER_KEY`
- `PIMLICO_API_KEY`
- `DRPC_API_KEY` (optional)

Start command: `npm run worker` (via `railway.toml`).

## 6. Railway Cron

Schedule: `0 12 * * *` (UTC)

Command:

```bash
curl -s -X POST "$NEXT_PUBLIC_APP_URL/api/internal/trigger-claims" \
  -H "Authorization: Bearer $CRON_SECRET"
```

## 7. Smoke test

1. Connect verified GoodDollar root wallet on `/`
2. Sign SIWE → agent created → onboarding modal shown
3. Link smart account in GoodDollar
4. Dashboard shows status `active`
5. Manual trigger:

```bash
curl -X POST https://your-domain/api/internal/trigger-claims \
  -H "Authorization: Bearer $CRON_SECRET"
```

6. Verify `ClaimLog` success + G$ in root wallet on Celoscan

## 8. Single-user claim test (Railway/local)

```bash
USER_ID=<cuid> npm run claim-test
```
