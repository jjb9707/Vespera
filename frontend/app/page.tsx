import Link from "next/link";
import { ArrowRight, Wallet, Building2, Receipt } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <section className="text-center">
        <p className="text-brand text-sm font-medium uppercase tracking-wide">
          Rental payments on Stellar
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
          Rent paid in seconds. Settled on chain.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-muted">
          Vespera lets landlords accept rent in stablecoins and gives tenants a
          receipt that lives on Stellar. No card processors, no chargebacks, no
          waiting three days for the money to land.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-white shadow-sm hover:bg-brand-600"
          >
            Open dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-6 py-3 hover:border-ink/30"
          >
            Browse properties
          </Link>
        </div>
      </section>

      <section className="mt-24 grid gap-6 sm:grid-cols-3">
        <Feature
          icon={<Wallet className="h-5 w-5" />}
          title="Connect once"
          body="Sign in with Freighter and your wallet handles payment auth. No card on file."
        />
        <Feature
          icon={<Building2 className="h-5 w-5" />}
          title="List a property"
          body="Landlords post listings with rent, deposit, and lease length. Soroban escrows the deposit."
        />
        <Feature
          icon={<Receipt className="h-5 w-5" />}
          title="On-chain receipts"
          body="Every payment writes a receipt to Soroban. Disputes have a single source of truth."
        />
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-ink-muted">{body}</p>
    </div>
  );
}
