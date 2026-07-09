"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBackButton } from "@telegram-apps/sdk-react";
import { getAuthTokenFromStorage } from "@/lib/auth";
import { usePayHereRedirect } from "@/lib/hooks";
import { usePackages } from "@/hooks/query/usePackages";
import { useUser } from "@/hooks/useUser";
import { MOCK_PACKAGES } from "@/components/v2/dashboard/mock-wallet-data";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { TogglePlan, type PlanDuration } from "@/components/ui/toggle-plan";
import { PlanCard } from "@/components/ui/plan-card";
import { getPlanIconSrc } from "@/components/v2/dashboard/wallet/PlanSummaryCard";
import type { SubscriptionPlan } from "@/lib/types";

function fmtLkr(n: number) {
  return `Rs ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function perMonthAmount(plan: SubscriptionPlan) {
  return plan.type === "weekly" ? plan.amount * 4 : plan.amount;
}

const EMPTY_PLANS: SubscriptionPlan[] = [];

export default function ChoosePlanPage() {
  const router = useRouter();
  const backButton = useBackButton();
  const redirectToPayHereViaPage = usePayHereRedirect();
  const authToken = getAuthTokenFromStorage();
  const { subscription } = useUser();

  const [duration, setDuration] = useState<PlanDuration>("weekly");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [payhereLinkLoading, setPayhereLinkLoading] = useState(false);

  const { data: fetchedPackages, isLoading: packagesLoading } = usePackages();
  const usingMock = !packagesLoading && !fetchedPackages;
  const packages = useMemo(
    () => fetchedPackages ?? (usingMock ? MOCK_PACKAGES : EMPTY_PLANS),
    [fetchedPackages, usingMock]
  );

  useEffect(() => {
    backButton.show();
    const handleBackClick = () => router.push("/v2/dashboard/plans");
    backButton.on("click", handleBackClick);
    return () => {
      backButton.off("click", handleBackClick);
      backButton.hide();
    };
  }, [backButton, router]);

  const filteredPlans = useMemo(
    () => packages.filter((p) => p.type === duration),
    [packages, duration]
  );

  // Derived rather than effect-driven: falls back to the first plan of the
  // active duration until the user makes an explicit selection.
  const selectedPlanId = selectedId ?? filteredPlans[0]?.id;

  const handleDurationChange = (d: PlanDuration) => {
    setDuration(d);
    setSelectedId(undefined);
  };

  const isAlreadySubscribed =
    subscription?.isActive && subscription.packageId === selectedPlanId;

  const handleSubscribe = async () => {
    const plan = packages.find((p) => p.id === selectedPlanId);
    if (!plan || !authToken) return;

    try {
      setPayhereLinkLoading(true);
      const res = await fetch("/api/subscription/payhere-link", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
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

      if (result.link) redirectToPayHereViaPage(result.link);
    } catch (err) {
      console.error(err);
    } finally {
      setPayhereLinkLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-5 pb-4">
      <PageTitle title="Choose Your Plan" subtitle="Get your bitcoin දීප membership" />

      <div className="flex justify-center">
        <TogglePlan value={duration} onChange={handleDurationChange} />
      </div>

      {packagesLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[90px] rounded-[12px] bg-[#e2e8f0] animate-pulse" />
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
            const isActivePlan = subscription?.isActive && subscription.packageId === plan.id;
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
                price={fmtLkr(plan.amount)}
                period={`/${plan.type === "weekly" ? "week" : "month"}`}
                description={plan.features?.[0] ?? "Bitcoin membership rewards"}
                perMonth={`Per Month ${fmtLkr(perMonth)}`}
                perYear={`Per Year ${fmtLkr(perYear)}`}
                selected={selectedPlanId === plan.id && !isActivePlan}
                active={isActivePlan}
                mostPopular={plan.popular}
                onSelect={() => setSelectedId(plan.id)}
              />
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          loading={payhereLinkLoading}
          disabled={!selectedPlanId || isAlreadySubscribed || packagesLoading}
          onClick={handleSubscribe}
        >
          {isAlreadySubscribed ? "Already Subscribed" : "Continue with Selected Plan"}
        </Button>

        <p className="px-2 text-center text-[12px] text-[#64748b]">
          Activate your Bitcoin දීප Membership today, grow with the Community, cancel anytime.
        </p>

        <Link
          href="/v2/dashboard"
          className="text-center text-[14px] font-semibold text-[#fa7119]"
        >
          Skip to Wallet
        </Link>
      </div>
    </div>
  );
}
