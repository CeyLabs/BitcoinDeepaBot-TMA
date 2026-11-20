"use client";

import { cn } from "cn";
import { Card } from "@/components/ui/card";
import { Emoji } from "@/components/ui/emoji";
import { Section } from "@/components/ui/section";
import { ValueSkeleton } from "@/components/ui/value-skeleton";
import type { DisplayCurrency } from "@/hooks/useDisplayCurrency";
import {
  fmtBtc,
  fmtLkrCurrency,
  fmtLkrCurrencyCompact,
  fmtPriceCompact,
  fmtSatsCompact,
  fmtUsd,
  maskDigits,
} from "@/lib/formatters";

export interface PerformanceGridProps {
  dcaSpent: number;
  /** Fees paid on top of dcaSpent; shown under You invested */
  dcaFees?: number;
  dcaSats: number;
  totalLkr: number;
  avgBtcPrice: number;
  avgBtcPriceUsd?: number;
  currentBtcPrice: number;
  currentBtcPriceUsd?: number;
  changePercent: number;
  currency: DisplayCurrency;
  usdRate?: number;
  visible: boolean;
  isLoading?: boolean;
}

export function PerformanceGrid({
  dcaSpent,
  dcaFees = 0,
  dcaSats,
  totalLkr,
  avgBtcPrice,
  avgBtcPriceUsd,
  currentBtcPrice,
  currentBtcPriceUsd,
  changePercent,
  currency,
  usdRate,
  visible,
  isLoading = false,
}: PerformanceGridProps) {
  const mask = (v: string) => maskDigits(v, visible);
  const isUsd = currency === "USD" && usdRate !== undefined;
  const fiat = (lkr: number) => (isUsd ? fmtUsd(lkr * usdRate) : fmtLkrCurrency(lkr));
  // Profit is against what the user actually paid, fees included.
  const totalCost = dcaSpent + dcaFees;
  const profitLkr = totalLkr - totalCost;
  const profitPct = totalCost > 0 ? (profitLkr / totalCost) * 100 : 0;
  const isProfit = profitLkr >= 0;
  const hasBuys = dcaSpent > 0 && dcaSats > 0;

  return (
    <Section title="Performance">
      <div className="grid grid-cols-2 gap-2">
        <Tile img="/emoji/wallet.webp" label="You invested" loading={isLoading}>
          <p className="num text-[16px] leading-[18px] font-semibold">
            {dcaSpent > 0 ? mask(fiat(dcaSpent)) : "–"}
          </p>
          <p className="num text-ink3 flex flex-wrap items-center gap-1.5 text-[12px] leading-4">
            {mask(fmtBtc(dcaSats, 5))}
            <Sep />
            {mask(`≈ 丰 ${fmtSatsCompact(dcaSats)}`)}
          </p>
          {dcaFees > 0 && (
            <p className="text-ink3 text-[12px] leading-4">+ {mask(fiat(dcaFees))} fees</p>
          )}
        </Tile>

        <Tile img="/emoji/coins.webp" label="Current value" loading={isLoading}>
          <p className="num text-[16px] leading-[18px] font-semibold">
            {dcaSats > 0 ? mask(fiat(totalLkr)) : "–"}
          </p>
          {totalCost > 0 && (
            <span
              className={cn(
                "inline-flex h-6 items-center self-start rounded-lg px-2.5 text-[12px] font-semibold text-white",
                isProfit ? "bg-gain-fill" : "bg-loss-solid"
              )}
            >
              {mask(
                `${isProfit ? "+" : "−"}${fiat(Math.abs(profitLkr))} (${isProfit ? "+" : "−"}${Math.abs(profitPct).toFixed(0)}%)`
              )}
            </span>
          )}
        </Tile>

        <Tile img="/emoji/calculator.webp" label="Average price" loading={isLoading}>
          <p className="num text-[16px] leading-[18px] font-semibold">
            {hasBuys ? mask(fmtLkrCurrencyCompact(avgBtcPrice)) : "–"}{" "}
            <span className="text-ink2 font-sans text-[12px] font-normal">per BTC</span>
          </p>
          <p className="num text-ink3 text-[12px] leading-4 font-semibold">
            {hasBuys && avgBtcPriceUsd !== undefined
              ? mask(`USD ${fmtPriceCompact(avgBtcPriceUsd)}`)
              : "No buys yet"}
          </p>
        </Tile>

        <Tile
          img="/emoji/bitcoin.webp"
          label={
            <>
              Current price{" "}
              <span
                aria-hidden
                className="animate-pulse-soft text-success ml-0.5 inline-block size-1.5 rounded-full bg-current align-middle"
              />
            </>
          }
          loading={isLoading}
        >
          <p className="num text-[16px] leading-[18px] font-semibold">
            {fmtLkrCurrencyCompact(currentBtcPrice)}{" "}
            <span className="text-ink2 font-sans text-[12px] font-normal">per BTC</span>
          </p>
          <p className="num text-ink3 text-[12px] leading-4">
            <span className={cn("font-bold", changePercent >= 0 ? "text-success" : "text-loss")}>
              {changePercent >= 0 ? "+" : "−"}
              {Math.abs(changePercent).toFixed(2)}%
            </span>{" "}
            today
            {currentBtcPriceUsd !== undefined && (
              <>
                {" · "}USD {fmtPriceCompact(currentBtcPriceUsd)}
              </>
            )}
          </p>
        </Tile>
      </div>
    </Section>
  );
}

function Tile({
  img,
  label,
  loading,
  children,
}: {
  img: string;
  label: React.ReactNode;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card flat className="flex min-w-0 flex-col gap-2 p-3">
      <Emoji src={img} />
      <p className="text-[14px] leading-4">{label}</p>
      {loading ? (
        <>
          <ValueSkeleton className="h-4 w-24" />
          <ValueSkeleton className="h-3 w-28" />
        </>
      ) : (
        children
      )}
    </Card>
  );
}

function Sep() {
  return <span aria-hidden className="size-1 shrink-0 rounded-full bg-current opacity-60" />;
}
