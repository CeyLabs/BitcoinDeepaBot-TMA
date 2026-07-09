"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Card, Badge, Button } from "@telegram-apps/telegram-ui";
import {
  fmtLkr,
  fmtSatsCompact,
  fmtShortDate,
  fmtRelativeDays,
  maskDigits,
} from "@/lib/formatters";
import { getPlanIconSrc } from "@/components/v2/dashboard/wallet/PlanSummaryCard";
import type { Subscription } from "@/lib/types";

export interface PlanHeroCardProps {
  subscription: Subscription | null | undefined;
  investedLkr: number;
  investedSats: number;
  currentValueLkr: number;
  visible: boolean;
}

export function PlanHeroCard({
  subscription,
  investedLkr,
  investedSats,
  currentValueLkr,
  visible,
}: PlanHeroCardProps) {
  const router = useRouter();
  const mask = (v: string) => maskDigits(v, visible);
  const profitLkr = currentValueLkr - investedLkr;
  const profitPct = investedLkr > 0 ? (profitLkr / investedLkr) * 100 : 0;
  const isProfit = profitLkr >= 0;

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[14px] font-bold leading-4 text-[#475569] dark:text-[#94a3b8]">
        Manage My Plan
      </p>

      <Card
        type="plain"
        className="relative overflow-hidden rounded-[20px]! p-0! shadow-none!"
        style={{ "--tgui--tertiary_bg_color": "transparent" } as React.CSSProperties}
      >
        <Image src="/bg/star.webp" alt="" fill priority className="object-cover" />

        <div className="relative flex flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Image
                src={subscription ? getPlanIconSrc(subscription.planName) : "/emoji/bitcoin.svg"}
                alt=""
                width={80}
                height={80}
                className="size-15 shrink-0"
              />
              <div className="flex min-w-0 flex-col items-start gap-1">
                <p className="truncate text-[18px] font-bold leading-5 text-white">
                  {subscription ? subscription.planName : "No active plan"}
                </p>
                {subscription && (
                  <div className="flex items-end gap-0.5">
                    <p className="text-[14px] font-bold leading-4 text-white">
                      Rs {fmtLkr(subscription.price)}
                    </p>
                    <p className="text-[12px] leading-4 text-white/70">
                      /{subscription.planType === "weekly" ? "week" : "month"}
                    </p>
                  </div>
                )}
                {subscription?.isActive && (
                  <Badge
                    type="number"
                    mode="primary"
                    className="w-fit! m-0! rounded-full! px-2.5! py-1! text-xs!"
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
              className="rounded-full! overflow-hidden bg-white/20! px-3! shrink-0"
              style={
                {
                  "--tgui--plain_background": "rgba(255,255,255,0.2)",
                  "--tgui--plain_foreground": "#fff",
                  "--tgui--bg_color": "rgba(255,255,255,0.3)",
                  "--tgui--button--hovered-opacity": 0.3,
                } as React.CSSProperties
              }
              onClick={() => router.push("/v2/dashboard/plans/choose")}
            >
              <span className="flex items-center gap-1 whitespace-nowrap text-[12px] font-medium text-white">
                Change Plan
                <ChevronRight size={14} />
              </span>
            </Button>
          </div>

          <div className="flex items-stretch">
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-[12px] leading-4 text-white/70">Last Reward</p>
              <p className="text-[14px] font-semibold leading-4 text-white">
                {subscription ? fmtShortDate(subscription.startDate) : "-"}
              </p>
              {subscription && (
                <p className="text-[12px] leading-4 text-white/70">
                  {fmtRelativeDays(subscription.startDate)}
                </p>
              )}
            </div>
            <div className="w-px self-stretch bg-white/25" />
            <div className="flex flex-1 flex-col items-end gap-1">
              <p className="text-[12px] leading-4 text-white/70">Next Reward</p>
              <p className="text-[14px] font-semibold leading-4 text-white">
                {subscription ? fmtShortDate(subscription.endDate) : "-"}
              </p>
              {subscription && (
                <p className="text-[12px] leading-4 text-white/70">
                  {fmtRelativeDays(subscription.endDate)}
                </p>
              )}
            </div>
          </div>

          <div className="flex rounded-[12px] bg-white/15 p-3">
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-[12px] leading-4 text-white/70">You Invested</p>
              <p className="text-[16px] font-semibold leading-4 text-white">
                {mask(`LKR ${fmtLkr(investedLkr)}`)}
              </p>
              <p className="text-[12px] leading-4 text-white/70">
                {mask(`₿${(investedSats / 1e8).toFixed(5)} · ≈${fmtSatsCompact(investedSats)} sats`)}
              </p>
            </div>
            <div className="w-px self-stretch bg-white/25" />
            <div className="flex flex-1 flex-col items-end gap-1">
              <p className="text-[12px] leading-4 text-white/70">Current Value</p>
              <p className="text-[16px] font-bold leading-4 text-white">
                {mask(`LKR ${fmtLkr(currentValueLkr)}`)}
              </p>
              {investedLkr > 0 && (
                <span
                  className={`rounded-lg px-2 py-0.5 text-[11px] font-medium text-white ${
                    isProfit ? "bg-[#25A761]" : "bg-[#F13131]"
                  }`}
                >
                  {mask(
                    `${isProfit ? "+" : "-"}${Math.abs(profitPct).toFixed(0)}% · LKR ${fmtLkr(
                      Math.abs(profitLkr)
                    )}`
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
