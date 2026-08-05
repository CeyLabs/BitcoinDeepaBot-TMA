"use client";

import { useWalletSummary } from "@/hooks/query/useWalletSummary";
import { useTransactionHistory } from "@/hooks/query/useTransactionHistory";

// Single source of truth for wallet numbers derived from the DCA summary +
// transaction history. Both the dashboard and Manage My Plan read this so
// "Current Value" stays identical across the app instead of drifting when
// one screen's calculation is tweaked and the other isn't.
export function useWalletMetrics() {
  const { data: summary, isLoading: isSummaryLoading } = useWalletSummary();
  const { transactions, isLoading: isTransactionsLoading } = useTransactionHistory();

  const totalLkr = summary
    ? Number(
        typeof summary.total_lkr === "string"
          ? summary.total_lkr.replace(/,/g, "")
          : summary.total_lkr
      )
    : 0;
  const totalSats = summary?.total_balance ?? 0;
  const dcaSpent = summary?.dca.spent ?? 0;
  const dcaSats = summary?.dca.balance ?? 0;
  const avgBtcPrice = summary?.dca.avg_btc_price ?? 0;
  const changePercent = summary?.["24_hr_change"] ?? 0;
  const changeLkr = (changePercent / 100) * totalLkr;
  const currentBtcPrice =
    summary?.current_btc_price?.lkr ??
    (transactions?.length
      ? transactions[transactions.length - 1].btc_price_at_purchase
      : avgBtcPrice);
  const currentBtcPriceUsd = summary?.current_btc_price?.usd;
  const avgBtcPriceUsd =
    currentBtcPriceUsd && currentBtcPrice
      ? avgBtcPrice * (currentBtcPriceUsd / currentBtcPrice)
      : undefined;
  const currentValueLkr = (dcaSats / 1e8) * currentBtcPrice;

  return {
    summary,
    transactions,
    isLoading: isSummaryLoading || isTransactionsLoading,
    totalLkr,
    totalSats,
    dcaSpent,
    dcaSats,
    avgBtcPrice,
    avgBtcPriceUsd,
    changePercent,
    changeLkr,
    currentBtcPrice,
    currentBtcPriceUsd,
    currentValueLkr,
  };
}
