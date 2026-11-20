/**
 * Mirrors the backend's buy pricing (same as plan charges): each fee is
 * gross × bps / 10000, net = gross - fees, sats = floor(net / price × 1e8).
 * An estimate: the price is taken again when PayHere confirms the payment.
 */
export function estimateBuy(
  amountLkr: number,
  paymentProcessorFeeBps: number,
  bitcoindeepaFeeBps: number,
  btcLkrPrice: number
) {
  if (!(amountLkr > 0) || !(btcLkrPrice > 0)) return { feeLkr: 0, netLkr: 0, sats: 0 };
  const feeLkr = (amountLkr * (paymentProcessorFeeBps + bitcoindeepaFeeBps)) / 10_000;
  const netLkr = amountLkr - feeLkr;
  return { feeLkr, netLkr, sats: Math.floor((netLkr / btcLkrPrice) * 1e8) };
}
