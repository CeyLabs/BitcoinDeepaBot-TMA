"use client";

import { useState } from "react";
import { cn } from "cn";
import { Hero } from "@/components/ui/hero";
import { ValueSkeleton } from "@/components/ui/value-skeleton";
import { NumberTicker } from "@/components/motion/number-ticker";
import { haptic } from "@/platform";
import type { DisplayCurrency } from "@/hooks/useDisplayCurrency";
import { fmtBtc, fmtLkr, fmtSats, fmtUsd, LKR_SYMBOL, maskDigits } from "@/lib/formatters";

export interface TotalValueCardProps {
  totalLkr: number;
  totalSats: number;
  /** False when the wallet balance couldn't be fetched: show that instead of a fake 0 */
  balanceAvailable?: boolean;
  changePercent: number;
  changeLkr: number;
  visible: boolean;
  onToggleVisible: () => void;
  currency: DisplayCurrency;
  onToggleCurrency: () => void;
  /** LKR → USD multiplier (undefined while the USD price is unknown). */
  usdRate?: number;
  isLoading?: boolean;
}

export function TotalValueCard({
  totalLkr,
  totalSats,
  balanceAvailable = true,
  changePercent,
  changeLkr,
  visible,
  onToggleVisible,
  currency,
  onToggleCurrency,
  usdRate,
  isLoading = false,
}: TotalValueCardProps) {
  // Tap the balance to swap the big number between sats (default) and fiat.
  const [primary, setPrimary] = useState<"fiat" | "sats">("sats");
  const [flipKey, setFlipKey] = useState(0);
  const mask = (v: string) => maskDigits(v, visible);
  const isUsd = currency === "USD" && usdRate !== undefined;
  const fiat = (lkr: number) => (isUsd ? fmtUsd(lkr * usdRate) : `${LKR_SYMBOL} ${fmtLkr(lkr)}`);
  const isProfit = changePercent >= 0;
  const satsText = `${fmtSats(totalSats)} sats`;

  return (
    <Hero priority>
      <div className="flex items-center justify-between">
        <p className="text-[14px] leading-[14px] font-medium">Total value</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              haptic.impact("medium");
              onToggleVisible();
            }}
            aria-label={visible ? "Hide balances" : "Show balances"}
            aria-pressed={!visible}
            className="press hit bg-onbrand-tile text-onbrand-tile-ink flex size-7 items-center justify-center rounded-lg border-0"
          >
            <EyeIcon off={!visible} />
          </button>
          <button
            type="button"
            onClick={() => {
              haptic.select();
              onToggleCurrency();
              // Picking a currency means "show me that": bring fiat to the big number.
              if (primary === "sats") {
                setPrimary("fiat");
                setFlipKey((k) => k + 1);
              }
            }}
            disabled={usdRate === undefined}
            aria-label={`Show values in ${currency === "USD" ? "rupees" : "US dollars"}`}
            className="press hit bg-onbrand-tile text-onbrand-tile-ink inline-flex h-7 items-center gap-1 rounded-lg border-0 pr-1.5 pl-2.5 text-[12px] leading-4 font-bold"
          >
            {currency}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 7L8.84311 11L13 7" />
            </svg>
          </button>
        </div>
      </div>

      {isLoading ? (
        <>
          <ValueSkeleton tone="translucent" className="my-0.5 h-10 w-[200px]" />
          <ValueSkeleton tone="translucent" className="h-3.5 w-[150px]" />
          <ValueSkeleton tone="translucent" className="h-6 w-[180px]" />
        </>
      ) : !balanceAvailable ? (
        <div className="flex flex-col gap-1 py-1">
          <p className="num text-[22px] leading-8 font-bold">Balance unavailable</p>
          <p className="text-[12px] leading-4 text-white/80">
            Couldn&apos;t reach your wallet. Try again in a few minutes.
          </p>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              haptic.select();
              setPrimary((p) => (p === "fiat" ? "sats" : "fiat"));
              setFlipKey((k) => k + 1);
            }}
            aria-label={`Balance ${primary === "fiat" ? fiat(totalLkr) : satsText}. Tap to switch units`}
            className="press self-start rounded-[10px] border-0 bg-transparent p-0 text-left text-inherit [perspective:600px]"
          >
            <span
              key={flipKey}
              // Fixed height: sats, LKR, USD and the masked text all sit on the same 48px line,
              // so the card doesn't grow or shrink when the unit flips.
              className="num flex h-12 animate-[flip_.45s_cubic-bezier(.2,.9,.3,1.2)] items-center overflow-visible text-[36px] leading-12 font-bold tracking-[-0.015em]"
            >
              {visible ? (
                // One ticker for sats, LKR and USD: every switch rolls the digits.
                <NumberTicker
                  {...(primary === "sats"
                    ? { value: totalSats, suffix: "\u00a0sats", format: fmtSats }
                    : fiatTicker(totalLkr, isUsd ? usdRate : undefined))}
                />
              ) : (
                mask(primary === "sats" ? satsText : `≈ ${fiat(totalLkr)}`)
              )}
            </span>
          </button>
          <p className="num flex items-center gap-2 text-[12px] leading-4 uppercase">
            {mask(`${fmtBtc(totalSats)} BTC`)}
            <span aria-hidden className="size-[2.2px] rounded-full bg-current" />
            {mask(primary === "sats" ? `≈ ${fiat(totalLkr)}` : satsText)}
          </p>
          {totalSats > 0 ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 self-start rounded-lg px-2 py-1 text-[12px] leading-4 font-semibold text-white",
                isProfit ? "bg-gain-fill" : "bg-loss-fill"
              )}
            >
              <svg
                className={cn(isProfit && "-scale-y-100")}
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M4 6L7.17977 10.0854L9.64154 6.76567L13.6419 12M11.0776 12H13.6419L14 9.096" />
              </svg>
              {/* Only the amounts are masked: "Last 24h" isn't a balance. */}
              {mask(
                `${fiat(Math.abs(changeLkr))}  (${isProfit ? "+" : "−"}${Math.abs(changePercent).toFixed(2)}%)`
              )}{" "}
              Last 24h
            </span>
          ) : (
            <span className="self-start rounded-lg border border-white px-2 py-1 text-[12px] leading-4 font-semibold">
              Your first sats are one tap away
            </span>
          )}
        </>
      )}
    </Hero>
  );
}

/** Ticker props for a fiat amount. Under $100 it ticks in cents to keep them. */
// The ticker lays its parts out as flex items, which drops plain edge spaces: use NBSPs.
function fiatTicker(lkr: number, usdRate: number | undefined) {
  if (usdRate === undefined) {
    return { value: lkr, prefix: `≈ ${LKR_SYMBOL}\u00a0`, format: fmtLkr };
  }
  const usd = lkr * usdRate;
  return usd < 100
    ? { value: usd * 100, prefix: "≈\u00a0$", format: (c: number) => (c / 100).toFixed(2) }
    : { value: usd, prefix: "≈\u00a0$", format: (n: number) => n.toLocaleString("en-US") };
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {off ? (
        <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.9 8.3 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6" />
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

export { EyeIcon };
