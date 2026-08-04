"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Card, Badge, Button, Cell, Navigation } from "@telegram-apps/telegram-ui";
import {
  fmtLkrCurrency,
  fmtSatsCompact,
  fmtShortDate,
  fmtRelativeDays,
  maskDigits,
} from "@/lib/formatters";
import { getPlanIconSrc } from "@/components/dashboard/wallet/PlanSummaryCard";
import { VisibleToggle } from "@/components/ui/visible-toggle";
import { ValueSkeleton } from "@/components/ui/value-skeleton";
import type { Subscription } from "@/lib/types";

export interface PlanHeroCardProps {
  subscription: Subscription | null | undefined;
  investedLkr: number;
  investedSats: number;
  currentValueLkr: number;
  visible: boolean;
  onToggleVisible: () => void;
  subscriptionLoading?: boolean;
  summaryLoading?: boolean;
}

export function PlanHeroCard({
  subscription,
  investedLkr,
  investedSats,
  currentValueLkr,
  visible,
  onToggleVisible,
  subscriptionLoading = false,
  summaryLoading = false,
}: PlanHeroCardProps) {
  const router = useRouter();
  const mask = (v: string) => maskDigits(v, visible);
  const profitLkr = currentValueLkr - investedLkr;
  const profitPct = investedLkr > 0 ? (profitLkr / investedLkr) * 100 : 0;
  const isProfit = profitLkr >= 0;

  if (subscriptionLoading) {
    return (
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm leading-4 font-bold text-[#475569] dark:text-[#94a3b8]">
            Manage My Plan
          </p>
          <VisibleToggle visible={visible} onToggle={onToggleVisible} />
        </div>

        <Card
          type="plain"
          className="relative overflow-hidden rounded-[20px]! p-0! shadow-none!"
          style={{ "--tgui--tertiary_bg_color": "transparent" } as React.CSSProperties}
        >
          <Image src="/bg/star.webp" alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-black/25" />

          <div className="relative flex flex-col gap-4 p-4">
            <div className="flex items-center gap-2">
              <ValueSkeleton tone="dark" className="size-15 shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-col items-start gap-2">
                <ValueSkeleton tone="dark" className="h-5 w-32" />
                <ValueSkeleton tone="dark" className="h-3.5 w-20" />
              </div>
            </div>

            <div className="flex items-stretch">
              <div className="flex flex-1 flex-col gap-1">
                <p className="text-[12px] leading-4 text-white/70">Subscribed Since</p>
                <ValueSkeleton tone="dark" className="h-3.5 w-16" />
              </div>
              <div className="w-px self-stretch bg-white/25" />
              <div className="flex flex-1 flex-col items-end gap-1">
                <p className="text-[12px] leading-4 text-white/70">Next Reward</p>
                <ValueSkeleton tone="dark" className="h-3.5 w-16" />
              </div>
            </div>

            <div className="flex rounded-[12px] bg-white/15 p-3">
              <div className="flex flex-1 flex-col gap-1">
                <p className="text-[12px] leading-4 text-white/70">You Invested</p>
                <ValueSkeleton tone="dark" className="h-4 w-20" />
              </div>
              <div className="w-px self-stretch bg-white/25" />
              <div className="flex flex-1 flex-col items-end gap-1">
                <p className="text-[12px] leading-4 text-white/70">Current Value</p>
                <ValueSkeleton tone="dark" className="h-4 w-20" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm leading-4 font-bold text-[#475569] dark:text-[#94a3b8]">
            Manage My Plan
          </p>
          <VisibleToggle visible={visible} onToggle={onToggleVisible} />
        </div>

        <Cell
          before={
            <Image src="/emoji/notepad.webp" alt="" width={36} height={36} className="size-9" />
          }
          after={<Navigation />}
          style={{ "--tgui--cell--middle--padding": "12px 0" } as React.CSSProperties}
          className="gap-2! rounded-xl border border-transparent bg-white px-4! shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] transition-shadow duration-150 hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.10)] focus-visible:ring-2 focus-visible:ring-[#fa7119]/50 focus-visible:outline-none dark:border-white/6 dark:bg-[#0B0F14] dark:shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)] dark:hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.4)]"
          onClick={() => router.push("/plans/choose")}
        >
          <p className="flex flex-col items-start pl-1 font-semibold text-[#1b2027] dark:text-white">
            No Active Plan
            <span className="dark:text-muted-foreground text-sm font-normal text-[#64748b]">
              Choose a plan to start earning rewards
            </span>
          </p>
        </Cell>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm leading-4 font-bold text-[#475569] dark:text-[#94a3b8]">
          Manage My Plan
        </p>
        <VisibleToggle visible={visible} onToggle={onToggleVisible} />
      </div>

      <Card
        type="plain"
        className="relative overflow-hidden rounded-[20px]! p-0! shadow-none!"
        style={{ "--tgui--tertiary_bg_color": "transparent" } as React.CSSProperties}
      >
        <Image src="/bg/star.webp" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative flex flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Image
                src={getPlanIconSrc(subscription.planName)}
                alt=""
                width={80}
                height={80}
                className="size-15 shrink-0"
              />
              <div className="flex min-w-0 flex-col items-start gap-1">
                <p className="truncate text-[18px] leading-5 font-bold text-white">
                  {subscription.planName}
                </p>
                <div className="flex items-end gap-0.5">
                  <p className="text-[14px] leading-4 font-bold text-white">
                    {fmtLkrCurrency(subscription.price)}
                  </p>
                  <p className="text-[12px] leading-4 text-white/70">
                    /{subscription.planType === "weekly" ? "week" : "month"}
                  </p>
                </div>
                {subscription.isActive && (
                  <Badge
                    type="number"
                    mode="primary"
                    className="m-0! w-fit! rounded-full! px-2.5! py-1! text-xs!"
                    style={
                      {
                        "--tgui--button_color": "#25A761",
                        "--tgui--button_text_color": "#fff",
                      } as React.CSSProperties
                    }
                  >
                    <span className="mr-1 inline-block size-1.5 rounded-full bg-white align-middle" />
                    Active
                  </Badge>
                )}
              </div>
            </div>

            <Button
              mode="gray"
              size="s"
              className="shrink-0 overflow-hidden rounded-full! bg-white/20! px-3!"
              style={
                {
                  "--tgui--plain_background": "rgba(255,255,255,0.2)",
                  "--tgui--plain_foreground": "#fff",
                  "--tgui--bg_color": "rgba(255,255,255,0.3)",
                  "--tgui--button--hovered-opacity": 0.3,
                } as React.CSSProperties
              }
              onClick={() => router.push("/plans/choose")}
            >
              <span className="flex items-center gap-1 text-[12px] font-medium whitespace-nowrap text-white">
                Manage Plan
                <ChevronRight size={14} />
              </span>
            </Button>
          </div>

          <div className="flex items-stretch">
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-[12px] leading-4 text-white/70">Subscribed Since</p>
              <p className="text-[14px] leading-4 font-semibold text-white">
                {fmtShortDate(subscription.startDate)}
              </p>
              <p className="text-[12px] leading-4 text-white/70">
                {fmtRelativeDays(subscription.startDate)}
              </p>
            </div>
            <div className="w-px self-stretch bg-white/25" />
            <div className="flex flex-1 flex-col items-end gap-1">
              <p className="text-[12px] leading-4 text-white/70">Next Reward</p>
              <p className="text-[14px] leading-4 font-semibold text-white">
                {subscription.endDate ? fmtShortDate(subscription.endDate) : "-"}
              </p>
              {subscription.endDate && (
                <p className="text-[12px] leading-4 text-white/70">
                  {fmtRelativeDays(subscription.endDate)}
                </p>
              )}
            </div>
          </div>

          <div className="flex rounded-[12px] bg-white/15 p-3">
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-[12px] leading-4 text-white/70">You Invested</p>
              {summaryLoading ? (
                <ValueSkeleton tone="dark" className="h-4 w-20" />
              ) : (
                <p className="text-[16px] leading-4 font-semibold text-white">
                  {mask(fmtLkrCurrency(investedLkr))}
                </p>
              )}
              {summaryLoading ? (
                <ValueSkeleton tone="dark" className="h-3 w-28" />
              ) : (
                <p className="text-[12px] leading-4 text-white/70">
                  {mask(
                    `₿${(investedSats / 1e8).toFixed(5)} ·  ≈ 丰 ${fmtSatsCompact(investedSats)}`
                  )}
                </p>
              )}
            </div>
            <div className="w-px self-stretch bg-white/25" />
            <div className="flex flex-1 flex-col items-end gap-1">
              <p className="text-[12px] leading-4 text-white/70">Current Value</p>
              {summaryLoading ? (
                <ValueSkeleton tone="dark" className="h-4 w-20" />
              ) : (
                <p className="text-[16px] leading-4 font-bold text-white">
                  {mask(fmtLkrCurrency(currentValueLkr))}
                </p>
              )}
              {summaryLoading ? (
                <ValueSkeleton tone="dark" className="h-4.5 w-24 rounded-lg" />
              ) : (
                investedLkr > 0 && (
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-medium text-white ${
                      isProfit ? "bg-[#25A761]" : "bg-[#F13131]"
                    }`}
                  >
                    {mask(
                      `${isProfit ? "+" : "-"}${Math.abs(profitPct).toFixed(0)}% · ${fmtLkrCurrency(
                        Math.abs(profitLkr)
                      )}`
                    )}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
