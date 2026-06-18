const xlm = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 7,
});

export function formatXLM(amount: number): string {
  return `${xlm.format(amount)} XLM`;
}

export function shortAddress(addr: string, head = 6, tail = 4): string {
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}
