"use client";

import { PlanHeroCard } from "@/components/v2/dashboard/plans/PlanHeroCard";
// GiftPlanActions holds the real gifting UI (send/manage gift plans). Gifting isn't
// launched yet, so GiftPlansComingSoon renders in its place — swap back in once it's ready.
import { GiftPlansComingSoon } from "@/components/v2/dashboard/plans/GiftPlanActions";
import { ManageGiftsSection } from "@/components/v2/dashboard/plans/ManageGiftsSection";
import { MOCK_GIFTS } from "@/components/v2/dashboard/plans/mock-data";
import { KycRequiredNotice } from "@/components/v2/dashboard/plans/KycRequiredNotice";
import { useWalletSummary } from "@/hooks/query/useWalletSummary";
import { useKycStatus } from "@/hooks/query/useKyc";
import { useUser } from "@/hooks/useUser";
import LoadingPage from "@/components/LoadingPage";
import { useStore } from "@/lib/store";

export default function PlansV2Page() {
  const { data: kyc, isLoading: kycLoading } = useKycStatus();
  const { balanceVisible } = useStore();
  const { subscription } = useUser();
  const { data: summary } = useWalletSummary();

  if (kycLoading) return <LoadingPage fullscreen={false} />;
  if (kyc?.status !== "APPROVED") return <KycRequiredNotice />;

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

      <GiftPlansComingSoon />

      <ManageGiftsSection items={MOCK_GIFTS} visible={balanceVisible} />
    </div>
  );
}
