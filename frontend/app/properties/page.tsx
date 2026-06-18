import Link from "next/link";
import { mockProperties } from "@/lib/mock";
import { formatXLM } from "@/lib/format";

export default function PropertiesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Properties</h1>
          <p className="mt-2 text-ink-muted">
            Listings open for rent. Click a card to view lease terms.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockProperties.map((p) => (
          <Link
            key={p.id}
            href={`/properties/${p.id}`}
            className="rounded-2xl border border-ink/10 p-5 transition hover:border-brand"
          >
            <div className="aspect-[4/3] rounded-xl bg-brand-50" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-ink-muted">{p.location}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-semibold">
                  {formatXLM(p.rentPerMonth)}
                </div>
                <div className="text-xs text-ink-muted">/ month</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
