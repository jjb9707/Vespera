import Link from "next/link";
import { WalletButton } from "@/components/wallet/wallet-button";

const nav = [
  { href: "/properties", label: "Properties" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/payments", label: "Payments" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-6 w-6 rounded-md bg-brand" />
          Vespera
        </Link>
        <nav className="hidden gap-8 sm:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink-muted hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <WalletButton />
      </div>
    </header>
  );
}
