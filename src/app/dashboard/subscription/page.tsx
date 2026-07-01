"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { getAuthTokenFromStorage } from "@/lib/auth";
import type { SubscriptionPlan, Subscription } from "@/lib/types";
import { cn } from "@/lib/cn";
import { initPopup, initHapticFeedback } from "@telegram-apps/sdk-react";
import { usePayHereRedirect } from "@/lib/hooks";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { TogglePlan, type PlanDuration } from "@/components/ui/toggle-plan";
import { PlanCard } from "@/components/ui/plan-card";
import { formatDate } from "@/lib/formatters";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_EMOJIS: Record<string, string> = {
  shrimp: "🦐",
  crab: "🦀",
  shark: "🦈",
  whale: "🐳",
};

function getPlanEmoji(name: string) {
  return PLAN_EMOJIS[name.toLowerCase()] ?? "₿";
}

function fmtLkr(n: number) {
  return `Rs ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function perMonthLabel(plan: SubscriptionPlan): string {
  const monthly = plan.type === "weekly" ? plan.amount * 4 : plan.amount;
  return `Per Month ${fmtLkr(monthly)}`;
}

function perYearLabel(plan: SubscriptionPlan): string {
  const yearly = plan.type === "weekly" ? plan.amount * 52 : plan.amount * 12;
  return `Per Year ${fmtLkr(yearly)}`;
}

// ─── Tab switcher ─────────────────────────────────────────────────────────────

type Tab = "plans" | "membership";

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex items-start p-1 rounded-full bg-[#e2e8f0]">
      {(["plans", "membership"] as Tab[]).map((tab) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={cn(
              "flex items-center justify-center px-6 py-1.5 rounded-full flex-1",
              "text-[14px] font-semibold leading-[28px] text-center transition-colors",
              isActive ? "bg-white text-[#fa7119]" : "bg-transparent text-[#64748b]"
            )}
          >
            {tab === "plans" ? "Plans" : "My Membership"}
          </button>
        );
      })}
    </div>
  );
}

// ─── Active membership card ───────────────────────────────────────────────────

function ActiveMembershipCard({
  subscription,
  onCancel,
  isCancelling,
  cancelError,
}: {
  subscription: Subscription;
  onCancel: () => void;
  isCancelling: boolean;
  cancelError: string | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Plan summary */}
      <div className="bg-white rounded-[12px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] overflow-hidden">
        {/* Active banner */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#22c55e]/10 border-b border-[#22c55e]/20">
          <div className="size-2 rounded-full bg-[#22c55e]" />
          <p className="text-[13px] font-semibold text-[#22c55e]">Active</p>
        </div>

        <div className="px-4 py-4 flex items-center gap-3">
          <span className="text-[36px] leading-none">
            {getPlanEmoji(subscription.planName)}
          </span>
          <div>
            <p className="text-[18px] font-bold text-[#1b2027]">{subscription.planName}</p>
            <p className="text-[13px] text-[#64748b] capitalize">
              {fmtLkr(subscription.price)}/{subscription.planType === "weekly" ? "week" : "month"}
            </p>
          </div>
        </div>

        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-[#f1f5f9] pt-3">
          {subscription.startDate && (
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-[#64748b]">Started</p>
              <p className="text-[13px] font-medium text-[#1b2027]">
                {formatDate(subscription.startDate)}
              </p>
            </div>
          )}
          {subscription.endDate && (
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-[#64748b]">Next billing</p>
              <p className="text-[13px] font-medium text-[#1b2027]">
                {formatDate(subscription.endDate)}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-[#64748b]">Billing cycle</p>
            <p className="text-[13px] font-medium text-[#1b2027] capitalize">
              {subscription.planType}
            </p>
          </div>
        </div>
      </div>

      {cancelError && (
        <p className="text-[13px] text-red-500 text-center">{cancelError}</p>
      )}

      <Button
        variant="destructive"
        loading={isCancelling}
        onClick={onCancel}
      >
        Cancel Membership
      </Button>
    </div>
  );
}

// ─── Empty membership state ───────────────────────────────────────────────────

function NoMembership({ onViewPlans }: { onViewPlans: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-10 gap-4">
      <div className="size-16 rounded-full bg-[#f1f5f9] flex items-center justify-center">
        <span className="text-[30px]">₿</span>
      </div>
      <div>
        <p className="text-[17px] font-semibold text-[#1b2027]">No Active Membership</p>
        <p className="text-[13px] text-[#64748b] mt-1">
          Choose a plan to start your Bitcoin දීප membership
        </p>
      </div>
      <Button variant="primary" size="auto" className="px-8" onClick={onViewPlans}>
        View Plans
      </Button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("plans");
  const [duration, setDuration] = useState<PlanDuration>("weekly");
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>();
  const [payhereLinkLoading, setPayhereLinkLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { subscription, setSubscription } = useStore();
  const redirectToPayHereViaPage = usePayHereRedirect();
  const popup = initPopup();

  const haptic = initHapticFeedback();
  const vibrateLight = () => {
    try { haptic?.selectionChanged?.(); } catch {}
    try { navigator?.vibrate?.(10); } catch {}
  };

  const authToken = getAuthTokenFromStorage();

  // Fetch packages
  const {
    data: packages = [],
    isLoading: packagesLoading,
    error: packagesError,
    refetch: refetchPackages,
  } = useQuery<SubscriptionPlan[]>({
    queryKey: queryKeys.packages,
    queryFn: async () => {
      const res = await fetch("/api/packages", {
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch packages");
      return Array.isArray(data) ? data : data.packages || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch current subscription
  const calculateEndDate = useCallback((startDate: string, planType: string) => {
    const start = new Date(startDate);
    const daysToAdd = planType === "weekly" ? 7 : 30;
    return new Date(start.getTime() + daysToAdd * 86400000).toISOString();
  }, []);

  useEffect(() => {
    if (!authToken || packages.length === 0) return;
    fetch("/api/subscription/current", {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.subscription) {
          const sub = result.subscription;
          const pkg = packages.find((p) => p.id === sub.package_id);
          setSubscription({
            id: sub.payhere_sub_id,
            planName: pkg?.name ?? "Unknown Plan",
            planType: sub.frequency ?? "monthly",
            price: pkg?.amount ?? 0,
            currency: "Rs",
            startDate: sub.created_at,
            endDate: sub.next_billing_date ?? (pkg ? calculateEndDate(sub.created_at, pkg.type) : sub.updated_at),
            isActive: sub.is_active,
            packageId: sub.package_id,
            userId: sub.user_id,
            payhereSubId: sub.payhere_sub_id,
          });
          setSelectedPlanId(sub.package_id);
        } else {
          setSubscription(null);
        }
      })
      .catch(() => {});
  }, [authToken, packages, setSubscription, calculateEndDate]);

  // Auto-select first plan of current duration
  useEffect(() => {
    if (packages.length === 0) return;
    const filtered = packages.filter((p) => p.type === duration);
    if (filtered.length > 0 && !selectedPlanId) {
      setSelectedPlanId(filtered[0].id);
    }
  }, [packages, duration, selectedPlanId]);

  const handleSubscribe = async () => {
    const plan = packages.find((p) => p.id === selectedPlanId);
    if (!plan || !authToken) return;

    if (subscription?.isActive) {
      popup.open({
        title: "Active Membership",
        message: "Cancel your existing membership before subscribing to another plan.",
        buttons: [{ id: "ok", type: "ok" }],
      });
      return;
    }

    try {
      setPayhereLinkLoading(true);
      const res = await fetch("/api/subscription/payhere-link", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ package_id: plan.id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to generate payment link");
      if (result.link) redirectToPayHereViaPage(result.link);
    } catch (err) {
      console.error(err);
    } finally {
      setPayhereLinkLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!authToken) return;
    try {
      setIsCancelling(true);
      setCancelError(null);
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to cancel membership");
      }
      setSubscription(null);
      setSelectedPlanId(undefined);
      setActiveTab("plans");
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Failed to cancel membership");
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredPlans = packages.filter((p) => p.type === duration);

  const selectedPlan = packages.find((p) => p.id === selectedPlanId);
  const isAlreadySubscribed = subscription?.isActive && subscription.packageId === selectedPlanId;

  // Error state
  if (packagesError && packages.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-[16px] font-semibold text-[#1b2027]">Failed to Load Plans</p>
        <p className="text-[13px] text-[#64748b]">
          {packagesError instanceof Error ? packagesError.message : "Something went wrong"}
        </p>
        <Button variant="secondary" size="auto" className="px-8" onClick={() => refetchPackages()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-8 space-y-5">

      {/* Page title */}
      <PageTitle
        title="Choose Your Plan"
        subtitle="Get your Bitcoin දීප membership"
        className="pt-2"
      />

      {/* Tab switcher */}
      <TabBar
        active={activeTab}
        onChange={(t) => { vibrateLight(); setActiveTab(t); }}
      />

      {/* ── Plans tab ─────────────────────────────────────── */}
      {activeTab === "plans" && (
        <div className="space-y-5">
          {/* Duration toggle */}
          <div className="flex justify-center">
            <TogglePlan
              value={duration}
              onChange={(d) => {
                vibrateLight();
                setDuration(d);
                // Select first plan of new duration
                const first = packages.find((p) => p.type === d);
                if (first) setSelectedPlanId(first.id);
              }}
            />
          </div>

          {/* Plan cards */}
          {packagesLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[90px] rounded-[12px] bg-[#e2e8f0] animate-pulse" />
              ))}
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[14px] text-[#64748b]">
                No {duration} plans available
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  emoji={<span className="text-[28px] leading-none">{getPlanEmoji(plan.name)}</span>}
                  name={plan.name}
                  price={fmtLkr(plan.amount)}
                  period={`/${plan.type === "weekly" ? "week" : "month"}`}
                  description={plan.features?.[0] ?? "Bitcoin membership rewards"}
                  perMonth={perMonthLabel(plan)}
                  perYear={perYearLabel(plan)}
                  selected={selectedPlanId === plan.id && !subscription?.isActive}
                  active={subscription?.isActive && subscription.packageId === plan.id}
                  mostPopular={plan.popular}
                  onSelect={() => setSelectedPlanId(plan.id)}
                />
              ))}
            </div>
          )}

          {/* Subscribe button */}
          <Button
            variant="primary"
            loading={payhereLinkLoading}
            disabled={!selectedPlanId || isAlreadySubscribed || packagesLoading}
            onClick={handleSubscribe}
          >
            {isAlreadySubscribed ? "Already Subscribed" : "Subscribe Now"}
          </Button>

          {isAlreadySubscribed && (
            <p className="text-[12px] text-center text-[#64748b]">
              You&apos;re already on this plan.{" "}
              <button
                className="text-[#fa7119] font-semibold"
                onClick={() => setActiveTab("membership")}
              >
                Manage membership →
              </button>
            </p>
          )}
        </div>
      )}

      {/* ── My Membership tab ─────────────────────────────── */}
      {activeTab === "membership" && (
        <>
          {subscription?.isActive ? (
            <ActiveMembershipCard
              subscription={subscription}
              onCancel={handleCancel}
              isCancelling={isCancelling}
              cancelError={cancelError}
            />
          ) : (
            <NoMembership onViewPlans={() => setActiveTab("plans")} />
          )}
        </>
      )}

    </div>
  );
}
