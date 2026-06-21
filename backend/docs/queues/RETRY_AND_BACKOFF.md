# Queue Retry and Backoff

The backend registers four Bull queues backed by Redis: `email`, `documents`, `blockchain`, and `data-sync`.

## Defaults

`QueueManagementService` sets retry defaults in code when jobs are enqueued:

| Queue        | Attempts | Backoff                   | Completed jobs       |
| ------------ | -------: | ------------------------- | -------------------- |
| `email`      |        3 | exponential, 2000 ms seed | removed              |
| `documents`  |        3 | exponential, 3000 ms seed | removed              |
| `blockchain` |        5 | exponential, 5000 ms seed | kept for audit trail |
| `data-sync`  |        3 | exponential, 2000 ms seed | removed              |

These values are not read from `BULL_QUEUE_*` environment variables. The sample env file intentionally does not advertise those variables. If a caller needs different behavior for a specific job, pass `QueueJobOptions` to `addEmailJob`, `addDocumentJob`, `addBlockchainJob`, or `addDataSyncJob`.

## Processor Behavior

Processors throw on unknown job types, so Bull can mark the job failed and apply the configured retry policy. The current blockchain processor logs the recognized job types, but several handlers are placeholders rather than full Stellar submissions. Treat successful blockchain queue completion as processor acceptance, not proof of an on-chain transaction, unless the specific handler writes an external transaction id.

## Redis Configuration

Queues use `REDIS_URL` plus `REDIS_TOKEN` for Upstash-style REST Redis when both are set. Otherwise they use `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_USERNAME`, and `REDIS_TLS`.
