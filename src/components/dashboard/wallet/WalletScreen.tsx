"use client";

import { TotalValueCard } from "./TotalValueCard";
import { QuickActions } from "./QuickActions";
import { GetStartedCard } from "./GetStartedCard";
import { PlanSummaryCard } from "./PlanSummaryCard";
import { PerformanceGrid } from "./PerformanceGrid";
import { PortfolioChart } from "./PortfolioChart";
import { useWalletMetrics } from "@/hooks/query/useWalletMetrics";
import { useUser } from "@/hooks/useUser";
import { useBalanceVisible } from "@/hooks/useBalanceVisible";
import { useDisplayCurrency } from "@/hooks/useDisplayCurrency";

/** The Wallet tab. `news` is the server-rendered carousel slot. */
export function WalletScreen({ news }: { news: React.ReactNode }) {
  const { visible, toggle: toggleVisible } = useBalanceVisible();
  const { currency, toggle: toggleCurrency } = useDisplayCurrency();
  const { subscription, subscriptionLoading } = useUser();

  const {
    transactions,
    isLoading,
    totalLkr,
    totalSats,
    balanceAvailable,
    dcaSpent,
    dcaFees,
    dcaSats,
    avgBtcPrice,
    avgBtcPriceUsd,
    changePercent,
    changeLkr,
    currentBtcPrice,
    currentBtcPriceUsd,
    currentValueLkr,
  } = useWalletMetrics({ withTransactions: true });

  const usdRate =
    currentBtcPriceUsd && currentBtcPrice ? currentBtcPriceUsd / currentBtcPrice : undefined;
  const lastReward = transactions
    ?.filter((tx) => tx.kind === "RECURRING" && tx.status.toUpperCase() === "SUCCESS")
    .at(-1)?.created_at;

  return (
    <div className="stagger flex w-full flex-col gap-5">
      <TotalValueCard
        totalLkr={totalLkr}
        totalSats={totalSats}
        balanceAvailable={balanceAvailable}
        changePercent={changePercent}
        changeLkr={changeLkr}
        visible={visible}
        onToggleVisible={toggleVisible}
        currency={currency}
        onToggleCurrency={toggleCurrency}
        usdRate={usdRate}
        isLoading={isLoading}
      />

      <QuickActions />

      {!isLoading && <GetStartedCard hasSats={totalSats > 0} />}

      <PlanSummaryCard
        subscription={subscription}
        lastRewardAt={lastReward}
        isLoading={subscriptionLoading}
      />

      {news}

      <PerformanceGrid
        dcaSpent={dcaSpent}
        dcaFees={dcaFees}
        dcaSats={dcaSats}
        totalLkr={currentValueLkr}
        avgBtcPrice={avgBtcPrice}
        avgBtcPriceUsd={avgBtcPriceUsd}
        currentBtcPrice={currentBtcPrice}
        currentBtcPriceUsd={currentBtcPriceUsd}
        changePercent={changePercent}
        currency={currency}
        usdRate={usdRate}
        visible={visible}
        isLoading={isLoading}
      />

      <PortfolioChart transactions={transactions ?? []} currentBtcPrice={currentBtcPrice} />
    </div>
  );
}
