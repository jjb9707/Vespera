"use client";

import { useState } from "react";
import { signRentPayment } from "@/lib/stellar";

export function PayRentButton({
  propertyId,
  amount,
}: {
  propertyId: string;
  amount: number;
}) {
  const [status, setStatus] = useState<"idle" | "signing" | "ok" | "error">(
    "idle",
  );
  const [tx, setTx] = useState<string | null>(null);

  async function handlePay() {
    setStatus("signing");
    try {
      const xdr = await signRentPayment({ propertyId, amount });
      setTx(xdr);
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handlePay}
        disabled={status === "signing"}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {status === "signing" ? "Signing…" : `Pay rent`}
      </button>
      {status === "ok" && tx && (
        <p className="text-sm text-ink-muted">
          Signed. Tx envelope: <span className="font-mono">{tx.slice(0, 24)}…</span>
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">Signing failed. Check Freighter.</p>
      )}
    </div>
  );
}
