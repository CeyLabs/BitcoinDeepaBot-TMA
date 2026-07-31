"use client";

import { DashboardTopBar } from "@/components/dashboard/wallet/DashboardTopBar";
import { TotalValueCard } from "@/components/dashboard/wallet/TotalValueCard";
import { PlanSummaryCard } from "@/components/dashboard/wallet/PlanSummaryCard";
import { PerformanceGrid } from "@/components/dashboard/wallet/PerformanceGrid";
import { PortfolioChart } from "@/components/dashboard/wallet/PortfolioChart";
import { useWalletSummary } from "@/hooks/query/useWalletSummary";
import { useTransactionHistory } from "@/hooks/query/useTransactionHistory";
import { useUser } from "@/hooks/useUser";
import { useStore } from "@/lib/store";

export default function WalletPage() {
  const { balanceVisible } = useStore();
  const { subscription } = useUser();

  const { data: summary } = useWalletSummary();
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
  const currentBtcPrice =
    summary?.current_btc_price?.lkr ??
    (transactions?.length ? transactions[transactions.length - 1].btc_price_at_purchase : avgBtcPrice);
  const currentBtcPriceUsd = summary?.current_btc_price?.usd;

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
        currentBtcPrice={currentBtcPrice}
        currentBtcPriceUsd={currentBtcPriceUsd}
        visible={balanceVisible}
      />

      <PortfolioChart transactions={transactions ?? []} currentBtcPrice={currentBtcPrice} />
    </div>
  );
}
