"use client";

import { TotalValueCard } from "@/components/v2/dashboard/TotalValueCard";
import { PlanSummaryCard } from "@/components/v2/dashboard/PlanSummaryCard";
import { PerformanceGrid } from "@/components/v2/dashboard/PerformanceGrid";
import { PortfolioChart } from "@/components/v2/dashboard/PortfolioChart";
import { useWalletSummary } from "@/hooks/query/useWalletSummary";
import { useTransactionHistory } from "@/hooks/query/useTransactionHistory";
import { useUser } from "@/hooks/useUser";
import { useStore } from "@/lib/store";

export default function WalletV2Page() {
  const { balanceVisible } = useStore();
  const { subscription } = useUser();

  const { data: summary, isLoading: isSummaryLoading } = useWalletSummary();
  const { data: transactions } = useTransactionHistory();

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
        currentBtcPrice={currentBtcPrice}
        visible={balanceVisible}
      />

      <PortfolioChart transactions={transactions ?? []} currentBtcPrice={currentBtcPrice} />
    </div>
  );
}
