"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { connectFreighter, getFreighterAddress } from "@/lib/stellar";

export function WalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getFreighterAddress().then(setAddress).catch(() => setAddress(null));
  }, []);

  async function handleConnect() {
    setBusy(true);
    try {
      const addr = await connectFreighter();
      setAddress(addr);
    } finally {
      setBusy(false);
    }
  }

  if (address) {
    return (
      <div className="rounded-full border border-ink/10 px-4 py-2 font-mono text-xs">
        {address.slice(0, 6)}…{address.slice(-4)}
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm text-white hover:bg-brand-600 disabled:opacity-50"
    >
      <Wallet className="h-4 w-4" />
      {busy ? "Connecting…" : "Connect"}
    </button>
  );
}
