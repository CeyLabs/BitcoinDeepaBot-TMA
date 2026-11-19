"use client";

import { useRouter } from "next/navigation";
import { Badge, BadgeDot } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Cell, CellChevron } from "@/components/ui/cell";
import { Emoji } from "@/components/ui/emoji";
import { Section } from "@/components/ui/section";
import { ValueSkeleton } from "@/components/ui/value-skeleton";
import { fmtLkrCurrency, fmtShortDate, fmtRelativeDays } from "@/lib/formatters";
import type { Subscription } from "@/lib/types";

export const PLAN_ICONS: Record<string, string> = {
  shrimp: "/emoji/shrimp.webp",
  crab: "/emoji/crab.webp",
  shark: "/emoji/shark.webp",
  whale: "/emoji/whale.webp",
  "blue whale": "/emoji/bluewhale.webp",
};

export function stripFrequencySuffix(name: string): string {
  return name.replace(/\s*(weekly|monthly)\s*$/i, "").trim();
}

export function getPlanIconSrc(name: string): string {
  const key = stripFrequencySuffix(name).toLowerCase();
  return PLAN_ICONS[key] ?? "/emoji/bitcoin.webp";
}

function RewardCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card flat className="flex min-w-0 flex-col gap-2 p-3">
      <p className="text-[14px] leading-4">{label}</p>
      <div className="flex items-center gap-2">
        <Emoji src="/emoji/calendar1.webp" />
        <div className="min-w-0">
          <p className="text-[16px] leading-[18px] font-semibold">{value}</p>
          <p className="text-ink3 text-[12px] leading-4">{sub}</p>
        </div>
      </div>
    </Card>
  );
}

export interface PlanSummaryCardProps {
  subscription: Subscription | null | undefined;
  /** Date of the latest successful plan charge (the last reward). */
  lastRewardAt?: string;
  isLoading?: boolean;
}

export function PlanSummaryCard({
  subscription,
  lastRewardAt,
  isLoading = false,
}: PlanSummaryCardProps) {
  const router = useRouter();

  return (
    <Section title="My plan">
      {isLoading ? (
        <>
          <ValueSkeleton className="h-16 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            <ValueSkeleton className="h-[86px] rounded-xl" />
            <ValueSkeleton className="h-[86px] rounded-xl" />
          </div>
        </>
      ) : (
        <>
          <Cell
            as="button"
            onClick={() => router.push(subscription ? "/dashboard/plans" : "/plans/choose")}
            before={
              <Emoji
                src={subscription ? getPlanIconSrc(subscription.planName) : "/emoji/notepad.webp"}
              />
            }
            after={
              <>
                {subscription && (
                  <Badge variant={subscription.isActive ? "active" : "pending"}>
                    <BadgeDot />
                    {subscription.isActive ? "Active" : "Inactive"}
                  </Badge>
                )}
                <CellChevron />
              </>
            }
            subtitle={
              subscription ? (
                <span className="flex items-baseline gap-0.5">
                  <span className="text-link text-[14px] leading-4 font-bold">
                    {fmtLkrCurrency(subscription.price)}
                  </span>
                  <span className="text-ink3 text-[12px] leading-4">
                    /{subscription.planType === "weekly" ? "week" : "month"}
                  </span>
                </span>
              ) : (
                <span className="text-[14px]">Start a DCA plan to stack sats automatically</span>
              )
            }
          >
            {subscription ? stripFrequencySuffix(subscription.planName) : "No active DCA plan"}
          </Cell>
          {subscription && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <RewardCard
                  label="Last reward"
                  value={lastRewardAt ? fmtShortDate(lastRewardAt) : "–"}
                  sub={lastRewardAt ? fmtRelativeDays(lastRewardAt) : "None yet"}
                />
                <RewardCard
                  label="Next reward"
                  value={fmtShortDate(subscription.endDate)}
                  sub={fmtRelativeDays(subscription.endDate)}
                />
              </div>
            </>
          )}
        </>
      )}
    </Section>
  );
}
