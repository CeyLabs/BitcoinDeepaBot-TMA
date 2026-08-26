"use client";

import { DashboardTopBar } from "@/components/dashboard/wallet/DashboardTopBar";
import { TotalValueCard } from "@/components/dashboard/wallet/TotalValueCard";
import { PlanSummaryCard } from "@/components/dashboard/wallet/PlanSummaryCard";
import { PerformanceGrid } from "@/components/dashboard/wallet/PerformanceGrid";
import { PortfolioChart } from "@/components/dashboard/wallet/PortfolioChart";
import { useWalletMetrics } from "@/hooks/query/useWalletMetrics";
import { useUser } from "@/hooks/useUser";
import { useStore } from "@/lib/store";

export default function WalletPage() {
  const { balanceVisible } = useStore();
  const { subscription, subscriptionLoading } = useUser();

  const {
    transactions,
    isLoading: isSummaryLoading,
    totalLkr,
    totalSats,
    dcaSpent,
    dcaSats,
    avgBtcPrice,
    avgBtcPriceUsd,
    changePercent: change24h,
    changeLkr,
    currentBtcPrice,
    currentBtcPriceUsd,
    currentValueLkr,
  } = useWalletMetrics();

  return (
    <div className="flex w-full flex-col gap-5">
      <DashboardTopBar />

      <TotalValueCard
        totalLkr={totalLkr}
        totalSats={totalSats}
        changePercent={change24h}
        changeLkr={changeLkr}
        visible={balanceVisible}
        isLoading={isSummaryLoading}
      />

      <PlanSummaryCard subscription={subscription} isLoading={subscriptionLoading} />

      <PerformanceGrid
        dcaSpent={dcaSpent}
        dcaSats={dcaSats}
        totalLkr={currentValueLkr}
        avgBtcPrice={avgBtcPrice}
        avgBtcPriceUsd={avgBtcPriceUsd}
        currentBtcPrice={currentBtcPrice}
        currentBtcPriceUsd={currentBtcPriceUsd}
        visible={balanceVisible}
        isLoading={isSummaryLoading}
      />

      <PortfolioChart transactions={transactions ?? []} currentBtcPrice={currentBtcPrice} />
    </div>
  );
}
