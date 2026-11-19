"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Emoji } from "@/components/ui/emoji";
import { KeyValueList } from "@/components/ui/section";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { PageTitle } from "@/components/ui/page-title";
import { PlanCard } from "@/components/ui/plan-card";
import { ValueSkeleton } from "@/components/ui/value-skeleton";
import { WebBackButton } from "@/components/ui/back-button";
import { ChoosePlanSkeleton } from "@/components/skeletons/choose-plan";
import { KycRequiredNotice } from "@/components/dashboard/plans/KycRequiredNotice";
import { PLAN_CTA_BAR } from "@/components/dashboard/plans/plan-cta-bar";
import {
  getPlanIconSrc,
  stripFrequencySuffix,
} from "@/components/dashboard/wallet/PlanSummaryCard";
import fetchy, { FetchyError } from "@/lib/fetchy";
import { usePayHereRedirect } from "@/lib/hooks";
import { estimateBuy } from "@/lib/buy";
import { fmtLkrCurrency, fmtSats } from "@/lib/formatters";
import { usePackages } from "@/hooks/query/usePackages";
import { useBuyPrice } from "@/hooks/query/useBuy";
import { useUser } from "@/hooks/useUser";
import { useOffline } from "@/hooks/useOffline";
import { useSession } from "@/hooks/useSession";
import { useKycStatus } from "@/hooks/query/useKyc";
import { haptic, useBackButton } from "@/platform";
import type { SubscriptionPlan } from "@/lib/types";

type PlanDuration = SubscriptionPlan["type"];

const DURATIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

const EMPTY_PLANS: SubscriptionPlan[] = [];

const perLabel = (type: PlanDuration) => (type === "weekly" ? "week" : "month");

/**
 * The plan picker. Rendered inside the dashboard layout, so the tab bar stays
 * visible: either directly as the Plans tab when the user has no plan
 * (`asTab`), or as the pushed /dashboard/plans/choose page (change plan).
 */
export function ChoosePlanView({ asTab = false }: { asTab?: boolean }) {
  const { data: kyc, isLoading: kycLoading } = useKycStatus();
  const router = useRouter();
  const redirectToPayHereViaPage = usePayHereRedirect();
  const { status: sessionStatus } = useSession();
  const { subscription } = useUser();
  const offline = useOffline();

  // null = not picked yet: follow the current plan's frequency (weekly otherwise).
  const [pickedDuration, setPickedDuration] = useState<PlanDuration | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [payhereLinkLoading, setPayhereLinkLoading] = useState(false);
  const toast = useToast();

  const { data: fetchedPackages, isLoading: packagesLoading } = usePackages();
  const packages = fetchedPackages ?? EMPTY_PLANS;
  // Plan charges are priced like buys (same fees, same BTC price): used for the estimate.
  const { data: price } = useBuyPrice();
  const feeBps = price
    ? price.paymentProcessorFeeBasisPoints + price.bitcoindeepaFeeBasisPoints
    : undefined;
  const feeText = feeBps !== undefined ? `${+(feeBps / 100).toFixed(2)}%` : undefined;

  // Without an active plan, /dashboard/plans renders this same picker, so
  // fall back to the wallet page instead.
  const goBack = () => router.push(subscription?.isActive ? "/dashboard/plans" : "/dashboard");
  // Once, above the early returns, so the native button stays up while loading.
  // As the Plans tab root there's nothing to go back to.
  useBackButton(goBack, !asTab);

  const currentPlan = useMemo(
    () =>
      subscription?.isActive ? packages.find((p) => p.id === subscription.packageId) : undefined,
    [packages, subscription]
  );

  const duration: PlanDuration = pickedDuration ?? currentPlan?.type ?? "weekly";

  const filteredPlans = useMemo(
    () => packages.filter((p) => p.type === duration),
    [packages, duration]
  );

  // Only set once the user explicitly taps a plan — details stay hidden until then.
  const selectedPlan = packages.find((p) => p.id === selectedId);
  const isCurrentSelected = !!selectedPlan && selectedPlan.id === currentPlan?.id;

  const estimateText = (plan: SubscriptionPlan) => {
    if (!price || feeBps === undefined) return plan.features?.[0] ?? "Bitcoin membership rewards";
    const { sats } = estimateBuy(
      plan.amount,
      price.paymentProcessorFeeBasisPoints,
      price.bitcoindeepaFeeBasisPoints,
      price.btcLkrPrice
    );
    return `≈ ${fmtSats(sats)} sats every ${perLabel(plan.type)} at today’s rate`;
  };

  const handleDurationChange = (d: PlanDuration) => {
    setPickedDuration(d);
    setSelectedId(undefined);
  };

  const handleContinue = () => {
    if (!selectedPlan || isCurrentSelected) return;
    haptic.impact("light");
    setConfirmOpen(true);
  };

  const handleSubscribe = async () => {
    const plan = selectedPlan;
    if (!plan || plan.id === currentPlan?.id || sessionStatus !== "authenticated") return;

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

  const header = asTab ? null : (
    <div className="relative flex min-h-11 items-center">
      <WebBackButton onBack={goBack} className="-ml-2" />
    </div>
  );

  // "loading" session = server render / hydration: KYC hasn't been fetched
  // yet, so don't show "Verification Required" to a verified user.
  if (kycLoading || sessionStatus === "loading") {
    return (
      <div className="flex flex-col gap-5">
        {header}
        <ChoosePlanSkeleton />
      </div>
    );
  }
  if (kyc?.status !== "APPROVED") {
    return (
      <div className="flex flex-col gap-5">
        {header}
        <KycRequiredNotice />
      </div>
    );
  }

  const ctaLabel = !selectedPlan
    ? "Select a plan"
    : isCurrentSelected
      ? "This is your current plan"
      : `${currentPlan ? "Switch to" : "Activate"} ${stripFrequencySuffix(selectedPlan.name)} · ${fmtLkrCurrency(selectedPlan.amount)}/${perLabel(selectedPlan.type)}`;

  return (
    <div className="flex flex-col gap-5">
      {header}

      <PageTitle
        title={currentPlan ? "Change your plan" : "Choose your plan"}
        subtitle="Activate your Bitcoin දීප membership today, grow with the community, cancel anytime."
      />

      <Segmented
        label="Plan frequency"
        options={DURATIONS}
        value={duration}
        onChange={handleDurationChange}
      />

      {packagesLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <ValueSkeleton key={i} className="h-[76px] w-full rounded-xl" />
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <p className="text-ink3 py-8 text-center text-[14px]">No {duration} plans available</p>
      ) : (
        <div className="stagger flex flex-col gap-3">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              emojiSrc={getPlanIconSrc(plan.name)}
              name={stripFrequencySuffix(plan.name)}
              price={fmtLkrCurrency(plan.amount)}
              period={`/${perLabel(plan.type)}`}
              selected={selectedId === plan.id}
              current={plan.id === currentPlan?.id}
              popular={plan.popular}
              onSelect={() => setSelectedId(plan.id)}
              details={
                <>
                  <span className="text-ink2 text-[14px]">{estimateText(plan)}</span>
                  <span className="text-ink3 text-[12px]">
                    {feeText ? `${feeText} fee per payment` : "Fees apply per payment"} · cancel any
                    time
                  </span>
                </>
              }
            />
          ))}
        </div>
      )}

      <p className="text-ink3 text-center text-[12px]">
        Paid securely through PayHere with your card or bank.
      </p>

      {!currentPlan && !asTab && (
        <Link
          href="/dashboard"
          className="press text-link self-center rounded-xl px-2.5 py-2 text-[14px] font-bold"
        >
          Skip to wallet
        </Link>
      )}

      {/* Room for the CTA bar, which floats above the tab bar. */}
      <div aria-hidden className="h-[62px] shrink-0" />

      <div className={PLAN_CTA_BAR}>
        <Button
          className="animate-rise"
          disabled={!selectedPlan || isCurrentSelected || packagesLoading || offline}
          onClick={handleContinue}
        >
          <span className="truncate">{ctaLabel}</span>
        </Button>
      </div>

      <Sheet
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!payhereLinkLoading) setConfirmOpen(open);
        }}
        title={currentPlan ? "Switch plan" : "Confirm plan"}
        hideClose={payhereLinkLoading}
        footer={
          <Button
            loading={payhereLinkLoading}
            disabled={offline || !selectedPlan}
            onClick={handleSubscribe}
          >
            Continue to PayHere
          </Button>
        }
      >
        {selectedPlan && (
          <div className="flex flex-col gap-4 px-4">
            <div className="flex flex-col items-center gap-1 px-5 text-center">
              <Emoji src={getPlanIconSrc(selectedPlan.name)} size={84} className="animate-pop" />
              <h2 className="mt-1 text-[24px]">{stripFrequencySuffix(selectedPlan.name)}</h2>
              <p className="flex items-baseline gap-0.5">
                <span className="num text-link text-[18px] font-bold">
                  {fmtLkrCurrency(selectedPlan.amount)}
                </span>
                <span className="text-ink3 text-[12px]">/{perLabel(selectedPlan.type)}</span>
              </p>
              <p className="text-ink2 text-[14px]">{estimateText(selectedPlan)}</p>
            </div>
            <KeyValueList
              rows={[
                { k: "Pays with", v: "PayHere · card or bank" },
                { k: "Billed", v: selectedPlan.type === "weekly" ? "Every week" : "Every month" },
                ...(feeText ? [{ k: "Fee", v: `${feeText} of each payment` }] : []),
                { k: "Cancel", v: "Any time, in Plans" },
              ]}
            />
          </div>
        )}
      </Sheet>
    </div>
  );
}
