# GoClaim

Your GoodDollar UBI, on autopilot.

GoClaim automatically claims G$ daily on behalf of users who have verified and whitelisted their root wallet on Celo. Users connect via SIWE, GoClaim spins up an ERC-4337 smart account, links it once in GoodDollar, and a daily cron enqueues claims through BullMQ at 12:00 PM UTC. G$ is forwarded to the user's root wallet after each claim.

## Architecture at a glance

```mermaid
flowchart TB
  subgraph client [Browser]
    Landing["/ and /faqs"]
    Dashboard["/dashboard"]
  end

  subgraph vercel [Vercel Next.js]
    API["API routes"]
  end

  subgraph data [Data stores]
    Neon["Neon Postgres"]
    Redis["Upstash Redis"]
  end

  subgraph railway [Railway]
    Worker["BullMQ worker"]
    Cron["Cron 12:00 UTC"]
  end

  subgraph chain [Celo mainnet]
    GD["GoodDollar Identity + UBI Scheme + G$"]
    Pimlico["Pimlico ERC-4337 bundler"]
  end

  Landing --> API
  Dashboard --> API
  API --> Neon
  Cron -->|"POST /api/internal/trigger-claims"| API
  API --> Redis
  Worker --> Redis
  Worker --> Neon
  Worker --> Pimlico
  Pimlico --> GD
  Dashboard -->|"SIWE + link tx"| GD
```

## Runtime components

| Component | Role | Key files |
|-----------|------|-----------|
| **Next.js app (Vercel)** | Landing, dashboard, FAQs, auth + agent APIs | `app/`, `components/` |
| **Postgres (Neon)** | Users, encrypted agent keys, claim/transfer logs, SIWE nonces | `prisma/schema.prisma` |
| **Redis (Upstash)** | BullMQ claim queue only (not used by dashboard/auth) | `lib/queue.ts` |
| **Worker (Railway)** | Consumes queue, runs claims | `worker/index.ts`, `worker/jobs/processClaim.ts` |
| **Cron (Railway)** | Daily trigger at 12:00 UTC | `app/api/internal/trigger-claims/route.ts` |
| **Pimlico + permissionless** | ERC-4337 UserOps for claim + G$ transfer | `lib/onchain/smartAccountClient.ts`, `lib/onchain/claimUbi.ts` |

## User lifecycle

1. **Connect GoodDollar-verified root wallet** — client checks `getWhitelistedRoot` via `lib/hooks/useWalletVerification.ts`; unverified users are sent to GoodDollar face verification.
2. **SIWE sign-in** — JWT session cookie via `app/api/auth/nonce` and `app/api/auth/verify`; server enforces whitelisted root via `lib/requireWhitelistedRoot.ts`.
3. **Smart account created** — random EOA + ERC-4337 simple account (EntryPoint v0.7); private key AES-256-GCM encrypted at rest (`lib/onchain/createAgent.ts`, `lib/crypto.ts`).
4. **One-time link** — user signs GoodDollar identity `connect` from their root wallet (`components/ConnectAgentButton.tsx`, `lib/onchain/connectAgent.ts`).
5. **Daily claims** — cron enqueues all active agents; worker claims UBI and transfers G$ to root in one UserOp (`lib/onchain/claimUbi.ts`: `UBIScheme.claim` + `G$.transfer`).
6. **Dashboard** — status, claim history, and transfer amounts from `ClaimLog` + `TransferLog` (`app/api/agent/status/route.ts`).

## Daily claim pipeline

```mermaid
sequenceDiagram
  participant Cron
  participant API as trigger_claims_API
  participant Redis as BullMQ
  participant Worker
  participant DB as Postgres
  participant Chain as Celo

  Cron->>API: POST Bearer CRON_SECRET
  API->>DB: active AgentWallets
  API->>Redis: enqueue userId jobs in waves
  Worker->>Redis: poll job
  Worker->>DB: decrypt key, load user
  Worker->>Chain: check eligibility
  Worker->>Chain: UserOp claim + transfer
  Worker->>DB: ClaimLog + TransferLog
```

Jobs are enqueued in waves of 50 with a 2s gap between waves (`lib/queue.ts`). The worker supports `WORKER_CONCURRENCY` (default 5) and `WORKER_DRAIN_DELAY_SEC` (default 30) to tune Upstash Redis usage.

## Database schema

| Model | Purpose |
|-------|---------|
| **User** | Root wallet address; 1:1 with agent |
| **AgentWallet** | Smart account address, encrypted EOA key, `isActive`, `lastClaimedAt` |
| **ClaimLog** | Per-attempt status (`success` / `skipped` / `failed`), optional tx hash |
| **TransferLog** | 1:1 with successful claim; amount in wei, tx hash, userOp hash |
| **Nonce** | SIWE anti-replay nonces |

See `prisma/schema.prisma` for the full schema.

## API routes

| Route | Auth | Purpose |
|-------|------|---------|
| `GET /api/auth/nonce` | — | Issue SIWE nonce |
| `POST /api/auth/verify` | — | Verify SIWE signature, set session |
| `GET /api/auth/session` | cookie | Current session |
| `POST /api/auth/logout` | cookie | Clear session |
| `POST /api/agent/create` | JWT | Create or return smart account |
| `GET /api/agent/status` | JWT | Dashboard state + claim history |
| `POST /api/internal/trigger-claims` | `CRON_SECRET` | Enqueue daily claim jobs |

## On-chain integration

Celo mainnet contracts (`lib/onchain/constants.ts`):

| Contract | Address | Role |
|----------|---------|------|
| Identity proxy | `0xC361A6E67822a0EDc17D899227dd9FC50BD62F42` | Whitelist / link checks |
| UBI Scheme proxy | `0x43d72Ff17701B2DA814620735C39C620Ce0ea4A1` | `claim`, `hasClaimed`, `checkEntitlement` |
| G$ token | `0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A` | Transfer to root after claim |

Smart accounts use EntryPoint v0.7 simple accounts via `permissionless`. UserOps are submitted through Pimlico. Optional `DRPC_API_KEY` improves RPC reliability. Claim and transfer calldata include a GOCLAIM attribution suffix (`lib/onchain/attribution.ts`).

## Security model

- **Agent private keys** — encrypted with `ENCRYPTION_MASTER_KEY` (AES-256-GCM); only the worker and agent-create API decrypt them.
- **Auth** — HTTP-only JWT cookie; SIWE domain binding; only whitelisted **root** wallets can sign in (linked wallets are rejected).
- **Cron** — `POST /api/internal/trigger-claims` requires `Authorization: Bearer $CRON_SECRET`.
- **Browser** — private keys are never sent to the client after creation.

## Project layout

```
app/           # pages (/, /dashboard, /faqs) + API routes
components/    # UI (ConnectSignIn, dashboard, FAQs)
lib/
  onchain/     # Celo / GoodDollar / ERC-4337
  hooks/       # useSession, useSiweAuth, useWalletVerification
  queue.ts     # BullMQ enqueue + Redis connection
worker/        # Railway claim worker
prisma/        # schema + migrations
scripts/       # claim-test, rotate-keys
```

## Local development

```bash
cp .env.example .env.local
# Fill in DATABASE_URL, JWT_SECRET, ENCRYPTION_MASTER_KEY, etc.

npm install
npx prisma migrate dev
npm run dev
```

Do not run `npm run build` while `npm run dev` is running — it corrupts the `.next` cache. If CSS or chunks 404, stop dev, run `rm -rf .next`, and restart.

For a single-user claim test (preferred over running the worker locally against Upstash):

```bash
USER_ID=<cuid> npm run claim-test
```

To test the full queue locally, run the worker in a second terminal (`npm run worker`). See [DEPLOY.md](./DEPLOY.md) for Upstash tuning guidance.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run worker` | BullMQ claim worker |
| `npm run claim-test` | Manual claim for one user (`USER_ID=...`) |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run rotate-keys` | Re-encrypt agent keys with a new master key |

## Deployment

- **Vercel** — Next.js app (landing, dashboard, APIs).
- **Railway** — always-on BullMQ worker (`npm run worker`).
- **Railway Cron** — `0 12 * * *` UTC hits `/api/internal/trigger-claims`.
- **Neon** — Postgres.
- **Upstash** — Redis for BullMQ only.

Full env var lists, smoke tests, and operational checklists are in [DEPLOY.md](./DEPLOY.md).

## Key rotation

```bash
OLD_MASTER_KEY=... NEW_MASTER_KEY=... npm run rotate-keys
```
