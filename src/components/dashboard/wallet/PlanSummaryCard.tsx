"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, Badge, Cell, Navigation } from "@telegram-apps/telegram-ui";
import { fmtLkrCurrency, fmtShortDate, fmtRelativeDays } from "@/lib/formatters";
import type { Subscription } from "@/lib/types";

const CARD_SURFACE_STYLE = {
  "--tgui--tertiary_bg_color": "var(--color-surface-primary)",
} as React.CSSProperties;

export const PLAN_ICONS: Record<string, string> = {
  shrimp: "/emoji/shrimp.webp",
  crab: "/emoji/crab.webp",
  shark: "/emoji/shark.webp",
  whale: "/emoji/whale.webp",
  "blue whale": "/emoji/bluewhale.webp",
};

function stripFrequencySuffix(name: string): string {
  return name.replace(/\s*(weekly|monthly)\s*$/i, "").trim();
}

export function getPlanIconSrc(name: string): string {
  const key = stripFrequencySuffix(name).toLowerCase();
  return PLAN_ICONS[key] ?? "/emoji/bitcoin.webp";
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
      <p className="pb-2 text-sm leading-4 text-[#1b2027] capitalize dark:text-[#f1f5f9]">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <Image src={iconSrc} alt="" width={36} height={36} className="size-9" />
        <div className="flex flex-col items-start">
          <p className="text-[16px] leading-4 font-semibold text-[#1b2027] dark:text-[#f1f5f9]">
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
        <p className="text-[14px] leading-4 font-bold text-[#475569] dark:text-[#94a3b8]">
          My Plan
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <Link href="/dashboard/plans" className="block">
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
                <Image src="/emoji/notepad.webp" alt="" width={36} height={36} className="size-9" />
              )
            }
            after={
              <div className="flex shrink-0 items-center gap-1">
                {subscription?.isActive && (
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
            className="gap-2! rounded-xl border border-transparent bg-white px-4! shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] transition-shadow duration-150 hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.10)] focus-visible:ring-2 focus-visible:ring-[#fa7119]/50 focus-visible:outline-none dark:border-white/6 dark:bg-[#0B0F14] dark:shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)] dark:hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.4)]"
          >
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1 pl-1">
              <p className="truncate text-[16px] leading-4 font-semibold text-[#1b2027] dark:text-white">
                {subscription ? subscription.planName : "No Active Plan"}
              </p>
              {subscription ? (
                <div className="flex items-end gap-0.5">
                  <p className="text-[14px] leading-4 font-bold text-[#fa7119]">
                    {fmtLkrCurrency(subscription.price)}
                  </p>
                  <p className="text-[12px] leading-4 text-[#64748b]">
                    /{subscription.planType === "weekly" ? "week" : "month"}
                  </p>
                </div>
              ) : (
                <p className="dark:text-muted-foreground text-sm font-normal text-[#64748b]">
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
              iconSrc="/emoji/calendar1.webp"
            />
            <RewardCard
              label="Next Reward"
              dateStr={subscription.endDate}
              iconSrc="/emoji/calendar2.webp"
            />
          </div>
        )}
      </div>
    </div>
  );
}
