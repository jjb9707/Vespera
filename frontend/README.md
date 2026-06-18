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
