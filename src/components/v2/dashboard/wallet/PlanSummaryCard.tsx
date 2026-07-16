"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, Badge } from "@telegram-apps/telegram-ui";
import { fmtLkr, fmtShortDate, fmtRelativeDays } from "@/lib/formatters";
import type { Subscription } from "@/lib/types";

const CARD_SURFACE_STYLE = {
  "--tgui--tertiary_bg_color": "var(--color-surface-primary)",
} as React.CSSProperties;

export const PLAN_ICONS: Record<string, string> = {
  shrimp: "/emoji/shrimp.svg",
  crab: "/emoji/crab.svg",
  shark: "/emoji/shark.svg",
  whale: "/emoji/whale.svg",
  "blue whale": "/emoji/bluewhale.svg",
};

function stripFrequencySuffix(name: string): string {
  return name.replace(/\s*(weekly|monthly)\s*$/i, "").trim();
}

export function getPlanIconSrc(name: string): string {
  const key = stripFrequencySuffix(name).toLowerCase();
  return PLAN_ICONS[key] ?? "/emoji/bitcoin.svg";
}

function ChevronRight() {
  return (
    <svg width="14" height="24" viewBox="0 0 14 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 4L10 12L4 20"
        stroke="#25A761"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RewardCard({
  label,
  dateStr,
  iconSrc,
}: {
  label: string;
  dateStr?: string;
  iconSrc: string;
}) {
  return (
    <Card
      type="plain"
      className="flex flex-1 flex-col rounded-[12px] p-3"
      style={CARD_SURFACE_STYLE}
    >
      <p className="text-sm capitalize leading-4 text-[#1b2027] dark:text-[#f1f5f9] pb-2">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <Image src={iconSrc} alt="" width={36} height={36} className="size-9" />
        <div className="flex flex-col items-start">
          <p className="text-[16px] font-semibold leading-4 text-[#1b2027] dark:text-[#f1f5f9]">
            {dateStr ? fmtShortDate(dateStr) : "-"}
          </p>
          {dateStr && (
            <p className="text-[12px] leading-4 text-[#64748b]">{fmtRelativeDays(dateStr)}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

export interface PlanSummaryCardProps {
  subscription: Subscription | null | undefined;
}

export function PlanSummaryCard({ subscription }: PlanSummaryCardProps) {
  return (
    <div className="flex w-full flex-col items-end gap-3">
      <div className="flex w-full items-center justify-between">
        <p className="text-[14px] font-bold leading-4 text-[#475569] dark:text-[#94a3b8]">
          My Plan
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <Link href="/v2/dashboard/plans" className="block">
          <Card
            type="plain"
            className="flex! w-full items-center justify-between gap-2 p-3"
            style={CARD_SURFACE_STYLE}
          >
            <div className="flex flex-1 items-center gap-2 overflow-hidden">
              <div className="flex size-[50px] shrink-0 items-center justify-center rounded-[8px] bg-[rgba(255,155,62,0.2)]">
                <Image
                  src={subscription ? getPlanIconSrc(subscription.planName) : "/emoji/bitcoin.svg"}
                  alt=""
                  width={36}
                  height={36}
                  className="size-9"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                <p className="truncate text-[16px] font-semibold leading-4 text-[#1b2027] dark:text-[#f1f5f9]">
                  {subscription ? subscription.planName : "No active plan"}
                </p>
                {subscription && (
                  <div className="flex items-end gap-0.5">
                    <p className="text-[14px] font-bold leading-4 text-[#fa7119]">
                      Rs {fmtLkr(subscription.price)}
                    </p>
                    <p className="text-[12px] leading-4 text-[#64748b]">
                      /{subscription.planType === "weekly" ? "week" : "month"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {subscription && (
              <div className="flex shrink-0 items-center gap-1">
                <Badge
                  type="number"
                  mode="primary"
                  style={
                    {
                      "--tgui--button_color": "rgba(37,167,97,0.1)",
                      "--tgui--button_text_color": "#25a761",
                    } as React.CSSProperties
                  }
                >
                  <span className="mr-1 inline-block size-1.5 rounded-full bg-[#25a761] align-middle" />
                  Active
                </Badge>
                <ChevronRight />
              </div>
            )}
          </Card>
        </Link>

        <div className="flex w-full items-start gap-2">
          <RewardCard
            label="Subscribed Since"
            dateStr={subscription?.startDate}
            iconSrc="/emoji/calendar1.svg"
          />
          <RewardCard
            label="Next Reward"
            dateStr={subscription?.endDate}
            iconSrc="/emoji/calendar2.svg"
          />
        </div>
      </div>
    </div>
  );
}
