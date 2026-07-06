"use client";

import { DashboardTopBar } from "@/components/v2/dashboard/wallet/DashboardTopBar";
import { TotalValueCard } from "@/components/v2/dashboard/wallet/TotalValueCard";
import { PlanSummaryCard } from "@/components/v2/dashboard/wallet/PlanSummaryCard";
import { PerformanceGrid } from "@/components/v2/dashboard/wallet/PerformanceGrid";
import { PortfolioChart } from "@/components/v2/dashboard/wallet/PortfolioChart";
import { useWalletSummary } from "@/hooks/query/useWalletSummary";
import { useTransactionHistory } from "@/hooks/query/useTransactionHistory";
import { useUser } from "@/hooks/useUser";
import { useStore } from "@/lib/store";
import {
  MOCK_WALLET_SUMMARY as MOCK_SUMMARY,
  MOCK_SUBSCRIPTION,
  MOCK_TRANSACTIONS,
  MOCK_LKR_USD_RATE,
} from "@/components/v2/dashboard/mock-wallet-data";

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
      <DashboardTopBar />

      <TotalValueCard
        totalLkr={totalLkr}
        totalSats={totalSats}
        changePercent={change24h}
        changeLkr={changeLkr}
        visible={balanceVisible}
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
