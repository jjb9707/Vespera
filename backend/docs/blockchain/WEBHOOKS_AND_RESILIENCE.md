# Webhooks and Stellar Resilience

This note documents the runtime behavior operators need when configuring queue-backed blockchain work, anchor webhooks, payment webhooks, and Stellar/anchor retries.

## Webhook Authentication

Anchor webhooks use the shared `WebhookSignatureGuard`:

| Endpoint                           | Secret env var                       | Headers                                      |
| ---------------------------------- | ------------------------------------ | -------------------------------------------- |
| `POST /api/v1/anchor/webhook`      | `ANCHOR_WEBHOOK_SECRET`              | `x-webhook-timestamp`, `x-webhook-signature` |
| KYC, screening, and alert webhooks | endpoint-specific `*_WEBHOOK_SECRET` | `x-webhook-timestamp`, `x-webhook-signature` |

The signature is `HMAC-SHA256(secret, "<timestamp>.<raw-body>")`, encoded as hex. Requests are rejected when the timestamp is older than five minutes, missing, malformed, or when the signature comparison fails.

Payment gateway webhooks are different. `POST /payments/webhooks/gateway` uses `PAYMENT_WEBHOOK_SECRET` and expects the shared secret in `x-vespera-payment-secret`. This path does not use the HMAC timestamp guard.

Outbound Vespera webhooks are signed with `WEBHOOK_SIGNATURE_SECRET` using the same HMAC timestamp scheme.

## Anchor Flow

`AnchorService` talks to `ANCHOR_API_URL` with `ANCHOR_API_KEY` and a 30000 ms Axios timeout. Deposit and withdrawal creation call the provider SEP-24 interactive endpoints, then persist the anchor transaction id and provider metadata.

Status can arrive through two paths:

1. `GET /api/v1/anchor/transactions/:id` polls the anchor provider and funnels the result into the same update path as webhooks.
2. `POST /api/v1/anchor/webhook` accepts signed provider callbacks.

Both paths call the same row-locked update routine. It deduplicates processed event ids, refuses terminal-state regressions, records known metadata fields only, and keeps a bounded processed-event window.

## Stellar and Soroban Configuration

The Stellar module reads these settings:

| Env var                                                       | Purpose                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| `STELLAR_NETWORK`                                             | `testnet` or `mainnet`; controls passphrase defaults.         |
| `STELLAR_HORIZON_URL`                                         | Horizon API URL for account and transaction reads.            |
| `STELLAR_BASE_FEE`                                            | Base fee in stroops; defaults to `100`.                       |
| `STELLAR_ENCRYPTION_KEY`                                      | Encrypts stored Stellar secrets.                              |
| `STELLAR_FRIENDBOT_URL`                                       | Testnet funding endpoint.                                     |
| `STELLAR_PLATFORM_PUBLIC_KEY` / `STELLAR_PLATFORM_SECRET_KEY` | Platform account credentials when required.                   |
| `SOROBAN_RPC_URL`                                             | Soroban RPC endpoint used by contract services.               |
| `STELLAR_ADMIN_SECRET_KEY`                                    | Admin signer for Soroban contract services.                   |
| `SERVER_STELLAR_SECRET` / `STELLAR_SERVER_SECRET_KEY`         | Server-side signer for shared Stellar clients and auth flows. |

Contract services additionally read the relevant contract ids such as `CHIOMA_CONTRACT_ID`, `ESCROW_CONTRACT_ID`, `RENT_OBLIGATION_CONTRACT_ID`, `PAYMENT_PROCESSING_CONTRACT_ID`, `PROPERTY_REGISTRY_CONTRACT_ID`, `AGENT_REGISTRY_CONTRACT_ID`, and `DISPUTE_CONTRACT_ID`.

## Retry and Timeout Behavior

Payment gateway calls use `PAYMENT_GATEWAY_TIMEOUT_MS` and retry transient network or timeout errors through `RetryService`.

Anchor provider calls currently use the hardcoded 30000 ms Axios timeout in `AnchorService`; there is no anchor-specific retry env var. Polling failures are logged and return the last persisted transaction state.

Stellar transaction helpers classify 429s, 5xx responses, `tx_too_late`, `tx_internal_error`, network failures, timeouts, connection resets, and fetch failures as transient. User-facing errors are normalized for common Stellar result codes such as `op_underfunded`, `op_no_destination`, and `tx_bad_seq`.
