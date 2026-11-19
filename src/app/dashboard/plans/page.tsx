"use client";

import { PlanHeroCard } from "@/components/dashboard/plans/PlanHeroCard";
import { ChoosePlanView } from "@/components/dashboard/plans/ChoosePlanView";
import { GiftPlansComingSoon } from "@/components/dashboard/plans/GiftPlansComingSoon";
import { KycRequiredNotice } from "@/components/dashboard/plans/KycRequiredNotice";
import { useToast } from "@/components/ui/toast";
import { useWalletMetrics } from "@/hooks/query/useWalletMetrics";
import { useKycStatus } from "@/hooks/query/useKyc";
import { useSubscriptionCurrent } from "@/hooks/query/useSubscriptionCurrent";
import { useCancelSubscription } from "@/hooks/query/useCancelSubscription";
import { useBalanceVisible } from "@/hooks/useBalanceVisible";
import { useOffline } from "@/hooks/useOffline";
import { haptic, usePlatform } from "@/platform";
import PlansLoading from "./loading";

export default function PlansPage() {
  const platform = usePlatform();
  const toast = useToast();
  const offline = useOffline();
  const { data: kyc, isLoading: kycLoading } = useKycStatus();
  const { visible: balanceVisible, toggle: toggleBalanceVisible } = useBalanceVisible();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscriptionCurrent();
  const cancelSubscription = useCancelSubscription();
  const {
    isLoading: summaryLoading,
    dcaSpent: investedLkr,
    dcaFees: feesLkr,
    dcaSats: investedSats,
    currentValueLkr,
  } = useWalletMetrics();

  const handleCancel = async () => {
    const confirmed = await platform.confirm({
      title: "Cancel Plan",
      message: "Your membership rewards will stop accruing immediately. This can't be undone.",
      confirmText: "Cancel Plan",
      cancelText: "Keep Plan",
      destructive: true,
    });
    if (!confirmed) return;

    haptic.impact("rigid");

    try {
      // Invalidates the current subscription, so this page switches to the plan picker.
      await cancelSubscription.mutateAsync();
      haptic.notify("success");
      toast({
        type: "success",
        title: "Plan Cancelled",
        description: "Your membership has been cancelled successfully.",
      });
    } catch (err) {
      haptic.notify("error");
      toast({
        type: "error",
        title: "Cancellation Failed",
        description: err instanceof Error ? err.message : "Failed to cancel plan",
      });
    }
  };

  if (kycLoading) return <PlansLoading />;
  if (kyc?.status !== "APPROVED") return <KycRequiredNotice />;
  if (subscriptionLoading) return <PlansLoading />;
  // No plan yet (or just cancelled): go straight to the plan picker.
  if (!subscription) return <ChoosePlanView asTab />;

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
        onCancel={handleCancel}
        cancelling={cancelSubscription.isPending}
        offline={offline}
      />

      <GiftPlansComingSoon />
    </div>
  );
}
