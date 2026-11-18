"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import fetchy, { FetchyError } from "@/lib/fetchy";
import { usePayHereRedirect } from "@/lib/hooks";
import { usePackages } from "@/hooks/query/usePackages";
import { useCancelSubscription } from "@/hooks/query/useCancelSubscription";
import { useUser } from "@/hooks/useUser";
import { useOffline } from "@/hooks/useOffline";
import { useSession } from "@/hooks/useSession";
import { useKycStatus } from "@/hooks/query/useKyc";
import { haptic, useBackButton, usePlatform } from "@/platform";
import { WebBackButton } from "@/components/ui/back-button";
import { ChoosePlanSkeleton } from "@/components/skeletons/choose-plan";
import { KycRequiredNotice } from "@/components/dashboard/plans/KycRequiredNotice";
import { PageTitle } from "@/components/ui/page-title";
import { TogglePlan, type PlanDuration } from "@/components/ui/toggle-plan";
import { PlanCard } from "@/components/ui/plan-card";
import { ValueSkeleton } from "@/components/ui/value-skeleton";
import { getPlanIconSrc } from "@/components/dashboard/wallet/PlanSummaryCard";
import { fmtLkrCurrency } from "@/lib/formatters";
import type { SubscriptionPlan } from "@/lib/types";
import Link from "next/link";

function perMonthAmount(plan: SubscriptionPlan) {
  return plan.type === "weekly" ? plan.amount * 4 : plan.amount;
}

const EMPTY_PLANS: SubscriptionPlan[] = [];

export default function ChoosePlanPage() {
  const { data: kyc, isLoading: kycLoading } = useKycStatus();
  const router = useRouter();
  const redirectToPayHereViaPage = usePayHereRedirect();
  const platform = usePlatform();
  const { status: sessionStatus } = useSession();
  const { subscription } = useUser();
  const offline = useOffline();
  const cancelSubscription = useCancelSubscription();

  const [duration, setDuration] = useState<PlanDuration>("weekly");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [payhereLinkLoading, setPayhereLinkLoading] = useState(false);
  const toast = useToast();

  const { data: fetchedPackages, isLoading: packagesLoading } = usePackages();
  const packages = fetchedPackages ?? EMPTY_PLANS;

  // Without an active plan, /dashboard/plans immediately redirects back here —
  // going back there would loop, so fall back to the wallet page instead.
  const goBack = () => router.push(subscription?.isActive ? "/dashboard/plans" : "/dashboard");
  // Once, above the early returns, so the native button stays up while loading.
  useBackButton(goBack);

  const currentPlan = useMemo(
    () =>
      subscription?.isActive ? packages.find((p) => p.id === subscription.packageId) : undefined,
    [packages, subscription]
  );

  const filteredPlans = useMemo(
    () => packages.filter((p) => p.type === duration && p.id !== currentPlan?.id),
    [packages, duration, currentPlan]
  );

  // Only set once the user explicitly taps a plan — details stay hidden until then.
  const selectedPlanId = selectedId;

  const handleDurationChange = (d: PlanDuration) => {
    haptic.select();
    setDuration(d);
    setSelectedId(undefined);
  };

  const handleSubscribe = async () => {
    const plan = packages.find((p) => p.id === selectedPlanId);
    if (!plan || sessionStatus !== "authenticated") return;

    haptic.impact("medium");

    try {
      setPayhereLinkLoading(true);
      const result = await fetchy.post<{ link?: string }, { package_id: string }>(
        "/subscription/payhere-link",
        { package_id: plan.id }
      );

      if (!result.link) throw new Error("No payment link in response");
      haptic.notify("success");
      redirectToPayHereViaPage(result.link);
    } catch (err) {
      // Backend's KycVerifiedGuard rejects with 403 until KYC is approved.
      if (err instanceof FetchyError && err.status === 403) {
        router.push("/verification");
        return;
      }
      // Also covers "online but unreachable", which the offline check can't see.
      haptic.notify("error");
      console.error(err);
      toast({
        type: "error",
        title: "Couldn't Start Payment",
        description: "Check your connection and try again.",
      });
    } finally {
      setPayhereLinkLoading(false);
    }
  };

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
      await cancelSubscription.mutateAsync();
      haptic.notify("success");
      toast({
        type: "success",
        title: "Plan Cancelled",
        description: "Your membership has been cancelled successfully.",
      });
      setTimeout(() => router.push("/dashboard/plans"), 1500);
    } catch (err) {
      haptic.notify("error");
      toast({
        type: "error",
        title: "Cancellation Failed",
        description: err instanceof Error ? err.message : "Failed to cancel plan",
      });
    }
  };

  // "loading" session = server render / hydration: KYC hasn't been fetched
  // yet, so don't show "Verification Required" to a verified user.
  if (kycLoading || sessionStatus === "loading") {
    return (
      <div className="bg-background mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-5 pt-5 pb-4">
        <WebBackButton onBack={goBack} />
        <ChoosePlanSkeleton />
      </div>
    );
  }
  if (kyc?.status !== "APPROVED") {
    return (
      <div className="bg-background mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-5 pt-5 pb-4">
        <WebBackButton onBack={goBack} />
        <KycRequiredNotice />
      </div>
    );
  }

  return (
    <div className="bg-background mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-5 pt-5 pb-4">
      <WebBackButton onBack={goBack} />
      {currentPlan ? (
        <PageTitle title="Manage your Plan" subtitle="View or switch to another plan" />
      ) : (
        <PageTitle title="Choose Your Plan" subtitle="Get your bitcoin දීප membership" />
      )}

      {currentPlan && (
        <div className="flex flex-col gap-3">
          <p className="text-[14px] leading-4 font-bold text-[#475569] dark:text-[#94a3b8]">
            Current Plan
          </p>
          <PlanCard
            emoji={
              <Image
                src={getPlanIconSrc(currentPlan.name)}
                alt=""
                width={28}
                height={28}
                className="size-7"
              />
            }
            name={currentPlan.name}
            price={fmtLkrCurrency(currentPlan.amount)}
            period={`/${currentPlan.type === "weekly" ? "week" : "month"}`}
            description={currentPlan.features?.[0] ?? "Bitcoin membership rewards"}
            perYear={`Per Year ${fmtLkrCurrency(perMonthAmount(currentPlan) * 12)}`}
            active
          />
        </div>
      )}

      <p className="text-sm leading-4 font-bold text-[#475569] dark:text-[#94a3b8]">
        {currentPlan ? "Choose a Different Plan" : "Select a Plan"}
      </p>

      <div className="flex justify-center">
        <TogglePlan value={duration} onChange={handleDurationChange} />
      </div>

      {packagesLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <ValueSkeleton key={i} className="h-[62px] w-full rounded-[12px]" />
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-[14px] text-[#64748b]">No {duration} plans available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPlans.map((plan) => {
            const perMonth = perMonthAmount(plan);
            const perYear = perMonth * 12;
            return (
              <PlanCard
                key={plan.id}
                emoji={
                  <Image
                    src={getPlanIconSrc(plan.name)}
                    alt=""
                    width={22}
                    height={22}
                    className="size-[22px]"
                  />
                }
                name={plan.name}
                price={fmtLkrCurrency(plan.amount)}
                period={`/${plan.type === "weekly" ? "week" : "month"}`}
                description={plan.features?.[0] ?? "Bitcoin membership rewards"}
                perMonth={`Per Month ${fmtLkrCurrency(perMonth)}`}
                perYear={`Per Year ${fmtLkrCurrency(perYear)}`}
                selected={selectedPlanId === plan.id}
                mostPopular={plan.popular}
                onSelect={() => setSelectedId(plan.id)}
              />
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button
          className="w-full rounded-[12px]"
          size="lg"
          loading={payhereLinkLoading}
          disabled={!selectedPlanId || packagesLoading || offline}
          onClick={handleSubscribe}
        >
          Continue with Selected Plan
        </Button>

        {currentPlan && (
          <Button
            variant="outline"
            className="w-full rounded-[12px] text-[#F13131] shadow-[0_0_0_1px_#F13131]"
            loading={cancelSubscription.isPending}
            disabled={offline}
            onClick={handleCancel}
          >
            Cancel Current Plan
          </Button>
        )}

        <p className="px-2 text-center text-[12px] text-[#64748b]">
          Activate your Bitcoin දීප Membership today, grow with the Community, cancel anytime.
        </p>

        {!currentPlan && (
          <Link href="/dashboard" className="text-center text-[14px] font-semibold text-[#fa7119]">
            Skip to Wallet
          </Link>
        )}
      </div>
    </div>
  );
}
