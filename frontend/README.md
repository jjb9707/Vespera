# Vespera — Frontend

Next.js 15 app for the Vespera rental payments protocol on Stellar.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS
- TanStack Query
- Freighter wallet + `@stellar/stellar-sdk`

## Run

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```


## Environment Variables

Copy `.env.example` to `.env.local` for local development. The frontend currently reads only the Stellar network variable; the other public variables are documented placeholders for planned chain-read and contract-call work.

| Variable | Purpose | Accepted values | Required? | Current usage |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_STELLAR_NETWORK` | Selects the Stellar network passphrase used by `frontend/lib/stellar.ts` when building transactions for Freighter signing. | `TESTNET` or `PUBLIC` | Optional; defaults to `TESTNET` when unset. | Consumed by `frontend/lib/stellar.ts`. |
| `NEXT_PUBLIC_HORIZON_URL` | Planned Horizon endpoint for future frontend chain reads. | Full Horizon URL, such as `https://horizon-testnet.stellar.org`. | Optional. | Not currently consumed by frontend code. |
| `NEXT_PUBLIC_RENTAL_CONTRACT_ID` | Planned Soroban rental contract ID for real rent-payment signing. | Deployed rental contract ID. | Optional until the payment flow is wired to a deployed contract. | Not currently consumed by frontend code. |

## Layout

```
app/
  layout.tsx        root layout + providers
  page.tsx          landing
  dashboard/        tenant + landlord dashboard
  properties/       listing + detail pages
  payments/         on-chain receipts
  api/health        liveness probe
components/
  layout/           header, footer
  wallet/           connect button, pay-rent button
lib/
  stellar.ts        Freighter + Soroban helpers
  format.ts         display helpers
  mock.ts           seed data for local dev
```

## Stellar integration

`lib/stellar.ts` wraps `@stellar/freighter-api` for wallet connect and
`signTransaction`. Replace `signRentPayment` with a real call into the
Soroban rental contract once `NEXT_PUBLIC_RENTAL_CONTRACT_ID` is set.
