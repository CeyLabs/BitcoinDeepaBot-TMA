"use client";

import { TotalValueCard } from "@/components/v2/dashboard/TotalValueCard";
import { PlanSummaryCard } from "@/components/v2/dashboard/PlanSummaryCard";
import { PerformanceGrid } from "@/components/v2/dashboard/PerformanceGrid";
import { PortfolioChart } from "@/components/v2/dashboard/PortfolioChart";
import { useWalletSummary } from "@/hooks/query/useWalletSummary";
import { useTransactionHistory } from "@/hooks/query/useTransactionHistory";
import { useUser } from "@/hooks/useUser";
import { useStore } from "@/lib/store";
import type { Subscription } from "@/lib/types";

// No backend/auth token wired up in this dev environment yet — fall back to mock
// data (instead of an all-zero layout) so the UI can be reviewed visually. Only
// kicks in once the query has actually settled with nothing, never during loading.
const MOCK_SUMMARY = {
  dca: { balance: 107000, spent: 32000, avg_btc_price: 29500000 },
  total_balance: 107000,
  total_lkr: 40000,
  currency: "LKR",
  "24_hr_change": 2.15,
};
const MOCK_SUBSCRIPTION: Subscription = {
  id: "mock",
  planName: "Shrimp",
  planType: "weekly",
  price: 1000,
  currency: "LKR",
  startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
  endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
  isActive: true,
};
const MOCK_TRANSACTIONS = [
  {
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    satoshis_purchased: 107000,
    btc_price_at_purchase: 29500000,
    package_amount: 32000,
    status: "SUCCESS",
  },
];
const MOCK_LKR_USD_RATE = 453.8; // placeholder — no real FX rate source exists yet

export default function WalletV2Page() {
  const { balanceVisible } = useStore();
  const { subscription: realSubscription } = useUser();

  const { data: rawSummary, isLoading: isSummaryLoading } = useWalletSummary();
  const { data: rawTransactions } = useTransactionHistory();

  const usingMock = !isSummaryLoading && !rawSummary;
  const summary = rawSummary ?? (usingMock ? MOCK_SUMMARY : undefined);
  const subscription = realSubscription ?? (usingMock ? MOCK_SUBSCRIPTION : null);
  const transactions = rawTransactions?.length
    ? rawTransactions
    : usingMock
      ? MOCK_TRANSACTIONS
      : rawTransactions;

  const totalLkr = summary
    ? Number(
        typeof summary.total_lkr === "string" ? summary.total_lkr.replace(/,/g, "") : summary.total_lkr
      )
    : 0;
  const totalSats = summary?.total_balance ?? 0;
  const dcaSpent = summary?.dca.spent ?? 0;
  const dcaSats = summary?.dca.balance ?? 0;
  const avgBtcPrice = summary?.dca.avg_btc_price ?? 0;
  const change24h = summary?.["24_hr_change"] ?? 0;
  const changeLkr = (change24h / 100) * totalLkr;
  const currentBtcPrice = transactions?.length
    ? transactions[transactions.length - 1].btc_price_at_purchase
    : avgBtcPrice;
  const avgBtcPriceUsd = usingMock ? avgBtcPrice / MOCK_LKR_USD_RATE : undefined;
  const currentBtcPriceUsd = usingMock ? currentBtcPrice / MOCK_LKR_USD_RATE : undefined;

  return (
    <div className="flex w-full flex-col gap-5">
      <TotalValueCard
        totalLkr={totalLkr}
        totalSats={totalSats}
        changePercent={change24h}
        changeLkr={changeLkr}
        visible={balanceVisible}
        isLoading={isSummaryLoading}
      />

      <PlanSummaryCard subscription={subscription} />

      <PerformanceGrid
        dcaSpent={dcaSpent}
        dcaSats={dcaSats}
        totalLkr={totalLkr}
        avgBtcPrice={avgBtcPrice}
        avgBtcPriceUsd={avgBtcPriceUsd}
        currentBtcPrice={currentBtcPrice}
        currentBtcPriceUsd={currentBtcPriceUsd}
        visible={balanceVisible}
      />

      <PortfolioChart transactions={transactions ?? []} currentBtcPrice={currentBtcPrice} />
    </div>
  );
}
