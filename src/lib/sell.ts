/**
 * Mirrors the backend's pricing: the whole sale in LKR (rounded down), then
 * the fee off it in LKR (rounded up), then the flat bank charge. The fee and
 * net are worked out in whole cents; the gross is float maths floored to
 * cents, which matched exact integer maths in testing.
 */
export function estimateSellLkr(
  sats: number,
  feeBasisPoints: number,
  btcLkrRate: number,
  bankChargeLkr = 0
) {
  if (!(sats > 0) || !(btcLkrRate > 0))
    return { grossLkr: 0, feeLkr: 0, bankChargeLkr: 0, amountLkr: 0 };
  const grossCents = Math.floor((sats / 1e8) * btcLkrRate * 100);
  const feeCents = Math.ceil((grossCents * feeBasisPoints) / 10_000);
  const chargeCents = Math.round(bankChargeLkr * 100);
  return {
    grossLkr: grossCents / 100,
    feeLkr: feeCents / 100,
    bankChargeLkr: chargeCents / 100,
    amountLkr: Math.max(0, grossCents - feeCents - chargeCents) / 100,
  };
}

/**
 * Roughly how many sats to sell to receive `amountLkr` after the fee and the
 * bank charge (the keypad's rupee mode). An estimate: the quote is always for
 * whole sats.
 */
export function satsForLkr(
  amountLkr: number,
  feeBasisPoints: number,
  btcLkrRate: number,
  bankChargeLkr = 0
) {
  if (!(amountLkr > 0) || !(btcLkrRate > 0)) return 0;
  const gross = (amountLkr + bankChargeLkr) / (1 - feeBasisPoints / 10_000);
  return Math.ceil((gross / btcLkrRate) * 1e8);
}
