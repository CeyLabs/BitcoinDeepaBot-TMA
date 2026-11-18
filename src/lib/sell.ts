/** Mirrors the backend's pricing: fee in sats (rounded up), LKR rounded down. */
export function estimateSellLkr(sats: number, feeBasisPoints: number, btcLkrRate: number) {
  if (!(sats > 0) || !(btcLkrRate > 0)) return { feeSats: 0, netSats: 0, amountLkr: 0 };
  const feeSats = Math.ceil((sats * feeBasisPoints) / 10_000);
  const netSats = Math.max(0, sats - feeSats);
  const amountLkr = Math.floor((netSats / 1e8) * btcLkrRate * 100) / 100;
  return { feeSats, netSats, amountLkr };
}
