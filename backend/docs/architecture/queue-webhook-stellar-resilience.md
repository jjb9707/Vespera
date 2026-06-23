# Queue, Webhook, and Stellar Resilience Architecture

This guide ties together the backend queue system, webhook ingestion, Stellar
payment paths, and environment variables that operators need to keep Vespera
reliable under retries, partial failures, and provider outages.

## Runtime responsibilities

| Layer | Code or docs | Responsibility |
| --- | --- | --- |
| Bull queues | `backend/docs/queues/BULL_QUEUES_IMPLEMENTATION.md` | Background email, document, blockchain, and data-sync jobs. |
| Blockchain queue | `blockchain` queue | Payment, escrow, NFT, transaction sync, and anchor transaction jobs with longer retry windows. |
| Gateway webhooks | `backend/docs/blockchain/payment-gateway-integration.md` | Ingest payment provider callbacks and reconcile payment state. |
| Stellar auth | `backend/docs/blockchain/stellar-auth.md` | SEP-0010 challenge/verify authentication for Stellar wallets. |
| Payment reconciliation | Payment gateway integration docs | Reconcile rent payments, escrow releases, refunds, and failed-payment retries. |
| Monitoring | Queue monitoring service and backend health checks | Surface queue health, failed jobs, and service readiness. |

## Queue model

Vespera uses four Bull queues:

- `email`: verification, password reset, notification, and alert jobs.
- `documents`: image processing, thumbnails, conversion, and metadata jobs.
- `blockchain`: Stellar payments, escrow operations, NFT minting, transaction
  sync, and anchor transaction processing.
- `data-sync`: profile sync, property sync, agreement/payment status sync,
  cleanup, and search indexing.

The blockchain queue is the resilience boundary for Stellar work. HTTP handlers
should enqueue durable work and return a trackable state instead of blocking on
long network calls when a provider can be slow or temporarily unavailable.

## Webhook lifecycle

Inbound payment or anchor webhooks should follow this order:

1. Receive the webhook on the documented payment or anchor route.
2. Verify the configured webhook secret before trusting the payload.
3. Parse the provider event and map it to the internal payment or escrow id.
4. Ignore unknown payments gracefully and return a processed/ignored result.
5. Persist external status and error metadata for auditability.
6. Enqueue follow-up reconciliation, notification, or data-sync jobs instead of
   doing all side effects inline.

Outbound or internal follow-up jobs should be idempotent. Use provider ids,
payment ids, escrow ids, or transaction hashes as dedupe keys where possible.

## Stellar resilience rules

- Do not blindly resubmit Stellar payments when the original signing material is
  unavailable. Reconcile against chain state first.
- Treat stored transaction hashes as the source for later status checks.
- Keep failed Stellar submissions in payment metadata so operators can
  distinguish network rejection, provider timeout, and application validation
  failures.
- Use the blockchain queue for retries that may need backoff or manual
  inspection.
- Keep tenant, landlord, and agent wallet addresses in typed DTOs and avoid
  copying real wallet data into logs or fixtures.
- For SEP-0010 auth, make the configured network explicit so testnet and
  mainnet challenges are never mixed.

## Environment variables

### Queue and Redis

Use one Redis mode:

```env
# Upstash REST mode
REDIS_URL=https://your-upstash-redis-url.upstash.io
REDIS_TOKEN=your-upstash-token

# Traditional Redis mode
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_USERNAME=default
REDIS_TLS=false
```

### Stellar and wallet auth

```env
STELLAR_SERVER_SECRET_KEY=your-server-secret-key
STELLAR_NETWORK=testnet
```

Use `mainnet` only with production credentials, production URLs, and reviewed
contract addresses.

### Payment webhooks

```env
PAYMENT_WEBHOOK_SECRET=replace-me
```

If set, gateway webhook callers must provide `x-vespera-payment-secret`.
Rotate this secret through the same channel used for other production secrets.

### Core backend

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgres://...
DB_SSL=true
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
```

Keep `.env`, `.env.production`, API keys, webhook secrets, and Stellar secret
keys out of commits.

## Recovery playbooks

| Incident | Operator response |
| --- | --- |
| Redis unavailable | Keep HTTP health visible, pause queue-dependent releases if needed, restore Redis, then inspect failed/delayed jobs before resuming workers. |
| Webhook signature failures | Confirm secret rotation timing, provider header name, and proxy/body parsing. Do not process unsigned payloads manually. |
| Stellar transaction timeout | Check Horizon/Soroban status by transaction hash before retrying. If no hash exists, inspect the queued job and original request. |
| Duplicate provider callback | Treat as idempotent; update metadata only if the external status changed. |
| Blockchain queue backlog | Scale workers horizontally, prioritize payment/escrow jobs, and pause non-critical document/data-sync queues if needed. |
| Failed escrow release/refund | Preserve payment metadata, reconcile chain state, and retry through the queue only after confirming the previous submission outcome. |

## Operator checklist

- Redis credentials are configured for the selected queue mode.
- Queue monitoring endpoints are restricted to admins.
- Webhook secrets are present in production and absent from logs.
- Stellar network, server secret, and contract ids match the deployment environment.
- Payment reconciliation can run independently of webhook delivery timing.
- Failed blockchain jobs are reviewed before manual retry.
- Queue, webhook, and payment tests are run before changing these flows:

  ```bash
  pnpm run test
  pnpm run test:e2e
  ```

## Related docs

- [`../queues/BULL_QUEUES_IMPLEMENTATION.md`](../queues/BULL_QUEUES_IMPLEMENTATION.md)
- [`../blockchain/payment-gateway-integration.md`](../blockchain/payment-gateway-integration.md)
- [`../blockchain/stellar-auth.md`](../blockchain/stellar-auth.md)
- [`scalability-and-performance.md`](./scalability-and-performance.md)
