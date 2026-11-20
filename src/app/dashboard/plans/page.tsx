"use client";

import { PlanHeroCard } from "@/components/dashboard/plans/PlanHeroCard";
import { ChoosePlanView } from "@/components/dashboard/plans/ChoosePlanView";
import { GiftPlansComingSoon } from "@/components/dashboard/plans/GiftPlansComingSoon";
import { KycRequiredNotice } from "@/components/dashboard/plans/KycRequiredNotice";
import { useCancelPlan } from "@/components/dashboard/plans/useCancelPlan";
import { useWalletMetrics } from "@/hooks/query/useWalletMetrics";
import { useKycStatus } from "@/hooks/query/useKyc";
import { useSubscriptionCurrent } from "@/hooks/query/useSubscriptionCurrent";
import { useBalanceVisible } from "@/hooks/useBalanceVisible";
import { useOffline } from "@/hooks/useOffline";
import { stripFrequencySuffix } from "@/components/dashboard/wallet/PlanSummaryCard";
import PlansLoading from "./loading";

export default function PlansPage() {
  const offline = useOffline();
  const { data: kyc, isLoading: kycLoading } = useKycStatus();
  const { visible: balanceVisible, toggle: toggleBalanceVisible } = useBalanceVisible();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscriptionCurrent();
  const { cancel, cancelling } = useCancelPlan();
  const {
    isLoading: summaryLoading,
    dcaSpent: investedLkr,
    dcaFees: feesLkr,
    dcaSats: investedSats,
    currentValueLkr,
  } = useWalletMetrics();

  if (kycLoading) return <PlansLoading />;
  if (kyc?.status !== "APPROVED") return <KycRequiredNotice />;
  if (subscriptionLoading) return <PlansLoading />;
  // No plan yet (or just cancelled): go straight to the plan picker.
  if (!subscription) return <ChoosePlanView asTab />;
  const planName = stripFrequencySuffix(subscription.planName);

  return (
    <div className="stagger flex w-full flex-col gap-5">
      <PlanHeroCard
        subscription={subscription}
        investedLkr={investedLkr}
        feesLkr={feesLkr}
        investedSats={investedSats}
        currentValueLkr={currentValueLkr}
        visible={balanceVisible}
        onToggleVisible={toggleBalanceVisible}
        subscriptionLoading={subscriptionLoading}
        summaryLoading={summaryLoading}
        onCancel={() => void cancel(planName, "cancel")}
        onChangePlan={() => void cancel(planName, "switch")}
        cancelling={cancelling}
        offline={offline}
      />

      <GiftPlansComingSoon />
    </div>
  );
}
