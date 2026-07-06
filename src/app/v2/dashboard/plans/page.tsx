"use client";

import { PlanHeroCard } from "@/components/v2/dashboard/plans/PlanHeroCard";
import { GiftPlanActions } from "@/components/v2/dashboard/plans/GiftPlanActions";
import { ManageGiftsSection } from "@/components/v2/dashboard/plans/ManageGiftsSection";
import { MOCK_GIFTS } from "@/components/v2/dashboard/plans/mock-data";
import { useWalletSummary } from "@/hooks/query/useWalletSummary";
import { useUser } from "@/hooks/useUser";
import { useStore } from "@/lib/store";
import { MOCK_WALLET_SUMMARY, MOCK_SUBSCRIPTION } from "@/components/v2/dashboard/mock-wallet-data";

export default function PlansV2Page() {
  const { balanceVisible } = useStore();
  const { subscription: realSubscription } = useUser();
  const { data: rawSummary, isLoading } = useWalletSummary();

  const usingMock = !isLoading && !rawSummary;
  const summary = rawSummary ?? (usingMock ? MOCK_WALLET_SUMMARY : undefined);
  const subscription = realSubscription ?? (usingMock ? MOCK_SUBSCRIPTION : null);

  const currentValueLkr = summary
    ? Number(
        typeof summary.total_lkr === "string" ? summary.total_lkr.replace(/,/g, "") : summary.total_lkr
      )
    : 0;
  const investedLkr = summary?.dca.spent ?? 0;
  const investedSats = summary?.dca.balance ?? 0;

  return (
    <div className="flex w-full flex-col gap-5">
      <PlanHeroCard
        subscription={subscription}
        investedLkr={investedLkr}
        investedSats={investedSats}
        currentValueLkr={currentValueLkr}
        visible={balanceVisible}
      />

      <GiftPlanActions />

      <ManageGiftsSection items={MOCK_GIFTS} visible={balanceVisible} />
    </div>
  );
}
