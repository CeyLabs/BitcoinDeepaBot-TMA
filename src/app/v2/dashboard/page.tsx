"use client";

import { useState } from "react";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { VisibleToggle } from "@/components/ui/visible-toggle";
import { TotalValueCard } from "@/components/v2/dashboard/TotalValueCard";
import { PlanSummaryCard } from "@/components/v2/dashboard/PlanSummaryCard";
import { PerformanceGrid } from "@/components/v2/dashboard/PerformanceGrid";
import { PortfolioChart } from "@/components/v2/dashboard/PortfolioChart";
import { useWalletSummary } from "@/hooks/query/useWalletSummary";
import { useSubscriptionCurrent } from "@/hooks/query/useSubscriptionCurrent";
import { useTransactionHistory } from "@/hooks/query/useTransactionHistory";

export default function WalletV2Page() {
  const launchParams = useLaunchParams();
  const telegramUser = launchParams.initData?.user;
  const initials = telegramUser?.username?.slice(0, 2).toUpperCase() ?? "BD";
  const displayName = telegramUser?.username ?? "User";

  const [balanceVisible, setBalanceVisible] = useState(true);

  const { data: summary, isLoading: isSummaryLoading } = useWalletSummary();
  const { data: subscription } = useSubscriptionCurrent();
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
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ffb14c]">
            <span className="text-[16px] font-extrabold text-white">{initials}</span>
          </div>
          <p className="truncate text-[14px] capitalize leading-[14px] text-[#64748b]">
            {displayName}
          </p>
        </div>
        <VisibleToggle visible={balanceVisible} onToggle={() => setBalanceVisible((v) => !v)} />
      </div>

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
