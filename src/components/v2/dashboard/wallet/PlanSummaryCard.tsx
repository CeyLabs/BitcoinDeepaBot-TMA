"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, Badge, Cell, Navigation } from "@telegram-apps/telegram-ui";
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
          <Cell
            before={
              subscription ? (
                <Image
                  src={getPlanIconSrc(subscription.planName)}
                  alt=""
                  width={36}
                  height={36}
                  className="size-9"
                />
              ) : (
                <Image src="/emoji/notepad.svg" alt="" width={36} height={36} className="size-9" />
              )
            }
            after={
              <div className="flex shrink-0 items-center gap-1">
                {subscription && (
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
                )}
                <Navigation />
              </div>
            }
            style={{ "--tgui--cell--middle--padding": "12px 0" } as React.CSSProperties}
            className="gap-2! px-4! rounded-xl border border-transparent bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] transition-shadow duration-150 hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fa7119]/50 dark:border-white/6 dark:bg-[#0B0F14] dark:shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)] dark:hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.4)]"
          >
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1 pl-1">
              <p className="truncate text-[16px] font-semibold leading-4 text-[#1b2027] dark:text-white">
                {subscription ? subscription.planName : "No Active Plan"}
              </p>
              {subscription ? (
                <div className="flex items-end gap-0.5">
                  <p className="text-[14px] font-bold leading-4 text-[#fa7119]">
                    Rs {fmtLkr(subscription.price)}
                  </p>
                  <p className="text-[12px] leading-4 text-[#64748b]">
                    /{subscription.planType === "weekly" ? "week" : "month"}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-normal text-[#64748b] dark:text-muted-foreground">
                  Choose a plan to start earning rewards
                </p>
              )}
            </div>
          </Cell>
        </Link>

        {subscription && (
          <div className="flex w-full items-start gap-2">
            <RewardCard
              label="Subscribed Since"
              dateStr={subscription.startDate}
              iconSrc="/emoji/calendar1.svg"
            />
            <RewardCard
              label="Next Reward"
              dateStr={subscription.endDate}
              iconSrc="/emoji/calendar2.svg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
