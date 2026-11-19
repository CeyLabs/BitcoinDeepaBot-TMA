/**
 * Mirrors the backend's pricing: the whole sale in LKR (rounded down), then
 * the fee off it in LKR (rounded up). The fee and net are worked out in whole
 * cents; the gross is float maths floored to cents, which matched exact
 * integer maths in testing.
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
