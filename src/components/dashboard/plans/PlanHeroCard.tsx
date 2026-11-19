"use client";

import { useRouter } from "next/navigation";
import { cn } from "cn";
import { Badge, BadgeDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cell, CellChevron } from "@/components/ui/cell";
import { Emoji } from "@/components/ui/emoji";
import { Hero, HeroDivider, HeroGlass } from "@/components/ui/hero";
import { Section } from "@/components/ui/section";
import { ValueSkeleton } from "@/components/ui/value-skeleton";
import { EyeIcon } from "@/components/dashboard/wallet/TotalValueCard";
import {
  getPlanIconSrc,
  stripFrequencySuffix,
} from "@/components/dashboard/wallet/PlanSummaryCard";
import {
  fmtLkrCurrency,
  fmtRelativeDays,
  fmtSats,
  fmtShortDate,
  maskDigits,
} from "@/lib/formatters";
import { haptic } from "@/platform";
import type { Subscription } from "@/lib/types";

export interface PlanHeroCardProps {
  subscription: Subscription | null | undefined;
  investedLkr: number;
  /** Fees paid on top of investedLkr */
  feesLkr?: number;
  investedSats: number;
  currentValueLkr: number;
  visible: boolean;
  onToggleVisible: () => void;
  subscriptionLoading?: boolean;
  summaryLoading?: boolean;
  onCancel: () => void;
  cancelling?: boolean;
  offline?: boolean;
}

/** One label / value / sub-line column inside a HeroGlass. */
function GlassStat({
  label,
  value,
  sub,
  align = "start",
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  align?: "start" | "end";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-1",
        align === "end" && "items-end text-right"
      )}
    >
      <span className="text-[12px] leading-4 font-semibold text-white/88">{label}</span>
      <span className="num text-[16px] leading-5 font-bold">{value}</span>
      {sub}
    </div>
  );
}

export function PlanHeroCard({
  subscription,
  investedLkr,
  feesLkr = 0,
  investedSats,
  currentValueLkr,
  visible,
  onToggleVisible,
  subscriptionLoading = false,
  summaryLoading = false,
  onCancel,
  cancelling = false,
  offline = false,
}: PlanHeroCardProps) {
  const router = useRouter();
  const mask = (v: string) => maskDigits(v, visible);
  // Profit is against what the user actually paid, fees included.
  const totalCostLkr = investedLkr + feesLkr;
  const profitLkr = currentValueLkr - totalCostLkr;
  const profitPct = totalCostLkr > 0 ? (profitLkr / totalCostLkr) * 100 : 0;
  const isProfit = profitLkr >= 0;

  const eyeToggle = subscription ? (
    <button
      type="button"
      onClick={() => {
        haptic.impact("medium");
        onToggleVisible();
      }}
      aria-label={visible ? "Hide balances" : "Show balances"}
      aria-pressed={!visible}
      className="press hit text-ink2 flex size-7 items-center justify-center rounded-lg border-0 bg-transparent"
    >
      <EyeIcon off={!visible} />
    </button>
  ) : undefined;

  if (subscriptionLoading) {
    return (
      <Section title="Manage my plan">
        <Hero priority innerClassName="gap-3.5">
          <div className="flex items-center gap-3">
            <ValueSkeleton tone="translucent" className="size-[52px] shrink-0 rounded-full" />
            <div className="flex grow flex-col gap-1.5">
              <ValueSkeleton tone="translucent" className="h-5 w-28" />
              <ValueSkeleton tone="translucent" className="h-3.5 w-20" />
            </div>
          </div>
          <ValueSkeleton tone="translucent" className="h-[68px] w-full rounded-xl" />
          <ValueSkeleton tone="translucent" className="h-[68px] w-full rounded-xl" />
          <div className="flex gap-2">
            <ValueSkeleton tone="translucent" className="h-11 flex-1 rounded-xl" />
            <ValueSkeleton tone="translucent" className="h-11 flex-1 rounded-xl" />
          </div>
        </Hero>
      </Section>
    );
  }

  if (!subscription) {
    return (
      <Section title="Manage my plan">
        <Cell
          as="button"
          onClick={() => {
            haptic.impact("light");
            router.push("/plans/choose");
          }}
          before={<Emoji src="/emoji/notepad.webp" />}
          after={<CellChevron />}
          subtitle={
            <span className="text-[14px]">Start a DCA plan to stack sats automatically</span>
          }
        >
          No active DCA plan
        </Cell>
      </Section>
    );
  }

  const per = subscription.planType === "weekly" ? "week" : "month";

  return (
    <Section title="Manage my plan" action={eyeToggle}>
      <Hero priority innerClassName="gap-3.5">
        <div className="flex items-center gap-3">
          <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-white/60">
            <Emoji src={getPlanIconSrc(subscription.planName)} className="animate-float" priority />
          </span>
          <div className="min-w-0 grow">
            <p className="font-display truncate text-[20px] leading-6 font-bold">
              {stripFrequencySuffix(subscription.planName)}
            </p>
            <p className="num text-[14px] font-bold">
              {fmtLkrCurrency(subscription.price)}{" "}
              <span className="font-sans text-[12px] font-normal">/{per}</span>
            </p>
          </div>
          <Badge variant="dark">
            <BadgeDot />
            {subscription.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <HeroGlass>
          <GlassStat
            label="You invested"
            value={
              summaryLoading ? (
                <ValueSkeleton tone="translucent" className="h-5 w-20" />
              ) : (
                mask(fmtLkrCurrency(investedLkr))
              )
            }
            sub={
              !summaryLoading && (
                <span className="num text-[12px] leading-4 text-white/88">
                  {mask(`${fmtSats(investedSats)} sats`)}
                  {feesLkr > 0 && ` · + ${mask(fmtLkrCurrency(feesLkr))} fees`}
                </span>
              )
            }
          />
          <HeroDivider />
          <GlassStat
            label="Current value"
            align="end"
            value={
              summaryLoading ? (
                <ValueSkeleton tone="translucent" className="h-5 w-20" />
              ) : (
                mask(fmtLkrCurrency(currentValueLkr))
              )
            }
            sub={
              !summaryLoading &&
              investedLkr > 0 && (
                <span
                  className={cn(
                    "num rounded-md px-1.5 py-0.5 text-[11px] leading-4 font-semibold text-white",
                    isProfit ? "bg-gain-fill" : "bg-loss-fill"
                  )}
                >
                  {mask(
                    `${isProfit ? "+" : "−"}${fmtLkrCurrency(Math.abs(profitLkr))} (${Math.abs(
                      profitPct
                    ).toFixed(0)}%)`
                  )}
                </span>
              )
            }
          />
        </HeroGlass>

        <HeroGlass>
          <GlassStat
            label="Next reward"
            value={subscription.endDate ? fmtShortDate(subscription.endDate) : "–"}
            sub={
              subscription.endDate && (
                <span className="text-[12px] leading-4 text-white/88">
                  {fmtRelativeDays(subscription.endDate)}
                </span>
              )
            }
          />
          <HeroDivider />
          <GlassStat
            label="Subscribed since"
            align="end"
            value={fmtShortDate(subscription.startDate)}
            sub={
              <span className="text-[12px] leading-4 text-white/88">
                {fmtRelativeDays(subscription.startDate)}
              </span>
            }
          />
        </HeroGlass>

        <div className="flex gap-2">
          <Button
            variant="inverse"
            className="h-11 flex-1 rounded-xl text-[15px]"
            onClick={() => {
              haptic.impact("light");
              router.push("/plans/choose");
            }}
          >
            Change plan
          </Button>
          <Button
            variant="onBrand"
            className="h-11 flex-1 rounded-xl text-[15px]"
            loading={cancelling}
            disabled={offline}
            onClick={onCancel}
          >
            Cancel plan
          </Button>
        </div>
      </Hero>

      <Cell
        before={
          <span className="bg-inv text-on-inv flex size-9 items-center justify-center rounded-full text-[11px] font-bold">
            PH
          </span>
        }
        subtitle={
          subscription.endDate
            ? `PayHere · card or bank · renews ${fmtShortDate(subscription.endDate)}`
            : "PayHere · card or bank"
        }
      >
        Payment method
      </Cell>
    </Section>
  );
}
