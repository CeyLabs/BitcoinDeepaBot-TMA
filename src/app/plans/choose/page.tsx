"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { initPopup } from "@telegram-apps/sdk-react";
import { Button, Snackbar } from "@telegram-apps/telegram-ui";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { getAuthTokenFromStorage } from "@/lib/auth";
import { usePayHereRedirect } from "@/lib/hooks";
import { haptic } from "@/lib/haptics";
import { usePackages } from "@/hooks/query/usePackages";
import { useCancelSubscription } from "@/hooks/query/useCancelSubscription";
import { useUser } from "@/hooks/useUser";
import { useKycStatus } from "@/hooks/query/useKyc";
import { useTelegramBackButton } from "@/hooks/useTgBackButton";
import LoadingPage from "@/components/LoadingPage";
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
  const authToken = getAuthTokenFromStorage();
  const { subscription } = useUser();
  const popup = initPopup();
  const cancelSubscription = useCancelSubscription();

  const [duration, setDuration] = useState<PlanDuration>("weekly");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [payhereLinkLoading, setPayhereLinkLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    tone: "success" | "error";
    title: string;
    description: string;
  } | null>(null);

  const { data: fetchedPackages, isLoading: packagesLoading } = usePackages();
  const packages = fetchedPackages ?? EMPTY_PLANS;

  // Without an active plan, /dashboard/plans immediately redirects back here —
  // going back there would loop, so fall back to the wallet page instead.
  useTelegramBackButton(() =>
    router.push(subscription?.isActive ? "/dashboard/plans" : "/dashboard")
  );

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
    if (!plan || !authToken) return;

    haptic.impact("medium");

    try {
      setPayhereLinkLoading(true);
      const res = await fetch("/api/subscription/payhere-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ package_id: plan.id }),
      });
      const result = await res.json();

      if (!res.ok) {
        if (res.status === 403 && result.redirectTo) {
          router.push(result.redirectTo);
          return;
        }
        throw new Error(result.message || "Failed to generate payment link");
      }

      if (result.link) {
        haptic.notify("success");
        redirectToPayHereViaPage(result.link);
      }
    } catch (err) {
      haptic.notify("error");
      console.error(err);
    } finally {
      setPayhereLinkLoading(false);
    }
  };

  const handleCancel = async () => {
    const buttonId = await popup.open({
      title: "Cancel Plan",
      message: "Your membership rewards will stop accruing immediately. This can't be undone.",
      buttons: [
        { id: "cancel", type: "destructive", text: "Cancel Plan" },
        { id: "keep", type: "cancel" },
      ],
    });
    if (buttonId !== "cancel") return;

    haptic.impact("rigid");

    try {
      await cancelSubscription.mutateAsync();
      haptic.notify("success");
      setSnackbar({
        tone: "success",
        title: "Plan Cancelled",
        description: "Your membership has been cancelled successfully.",
      });
      setTimeout(() => router.push("/dashboard/plans"), 1500);
    } catch (err) {
      haptic.notify("error");
      setSnackbar({
        tone: "error",
        title: "Cancellation Failed",
        description: err instanceof Error ? err.message : "Failed to cancel plan",
      });
    }
  };

  if (kycLoading) return <LoadingPage />;
  if (kyc?.status !== "APPROVED") {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pt-5 pb-4">
        <KycRequiredNotice />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pt-5 pb-4">
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
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <ValueSkeleton key={i} className="h-[90px] w-full rounded-[12px]" />
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
                    width={28}
                    height={28}
                    className="size-7"
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
          mode="filled"
          size="l"
          stretched
          style={{ borderRadius: "12px" }}
          loading={payhereLinkLoading}
          disabled={!selectedPlanId || packagesLoading}
          onClick={handleSubscribe}
        >
          Continue with Selected Plan
        </Button>

        {currentPlan && (
          <Button
            mode="outline"
            stretched
            loading={cancelSubscription.isPending}
            onClick={handleCancel}
            style={
              {
                borderRadius: "12px",
                overflow: "hidden",
                "--tgui--outline": "#F13131",
                "--tgui--plain_foreground": "#F13131",
              } as React.CSSProperties
            }
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

      {snackbar && (
        <Snackbar
          onClose={() => setSnackbar(null)}
          description={snackbar.description}
          style={
            {
              "--tgui--surface_dark": "var(--color-surface-glass)",
              "--tgui--white": "var(--color-tma-text-primary)",
            } as React.CSSProperties
          }
          before={
            snackbar.tone === "success" ? (
              <CheckCircle2 size={20} className="text-success" />
            ) : (
              <AlertCircle size={20} className="text-[#F45A5A]" />
            )
          }
        >
          {snackbar.title}
        </Snackbar>
      )}
    </div>
  );
}
