/**
 * Mirrors the backend's pricing: the whole sale in LKR (rounded down), then
 * the fee off it in LKR (rounded up). Works in cents to avoid float drift.
 */
export function estimateSellLkr(sats: number, feeBasisPoints: number, btcLkrRate: number) {
  if (!(sats > 0) || !(btcLkrRate > 0)) return { grossLkr: 0, feeLkr: 0, amountLkr: 0 };
  const grossCents = Math.floor((sats / 1e8) * btcLkrRate * 100);
  const feeCents = Math.ceil((grossCents * feeBasisPoints) / 10_000);
  return {
    grossLkr: grossCents / 100,
    feeLkr: feeCents / 100,
    amountLkr: (grossCents - feeCents) / 100,
  };
}
