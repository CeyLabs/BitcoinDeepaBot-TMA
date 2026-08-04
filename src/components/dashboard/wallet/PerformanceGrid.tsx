"use client";

import Image from "next/image";
import { Card, Badge } from "@telegram-apps/telegram-ui";
import {
  fmtLkrCurrency,
  fmtLkrCurrencyCompact,
  fmtPriceCompact,
  fmtSatsCompact,
  maskDigits,
} from "@/lib/formatters";

const CARD_SURFACE_STYLE = {
  "--tgui--tertiary_bg_color": "var(--color-surface-primary)",
} as React.CSSProperties;

const CARD_SUCCESS_STYLE = {
  "--tgui--tertiary_bg_color": "color-mix(in srgb, var(--color-success) 10%, transparent)",
} as React.CSSProperties;

export interface PerformanceGridProps {
  dcaSpent: number;
  dcaSats: number;
  totalLkr: number;
  avgBtcPrice: number;
  avgBtcPriceUsd?: number;
  currentBtcPrice: number;
  currentBtcPriceUsd?: number;
  visible: boolean;
}

export function PerformanceGrid({
  dcaSpent,
  dcaSats,
  totalLkr,
  avgBtcPrice,
  avgBtcPriceUsd,
  currentBtcPrice,
  currentBtcPriceUsd,
  visible,
}: PerformanceGridProps) {
  const mask = (v: string) => maskDigits(v, visible);
  const profitLkr = totalLkr - dcaSpent;
  const profitPct = dcaSpent > 0 ? (profitLkr / dcaSpent) * 100 : 0;
  const isProfit = profitLkr >= 0;

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[14px] leading-4 font-bold text-[#475569] dark:text-[#94a3b8]">
        Performance
      </p>

      <div className="grid grid-cols-2 gap-2">
        <Card
          type="plain"
          className="flex! flex-col! items-start! gap-2! rounded-2xl! p-3! shadow-none!"
          style={CARD_SURFACE_STYLE}
        >
          <Image src="/emoji/wallet.webp" alt="" width={36} height={36} className="size-9" />
          <p className="text-[14px] leading-4 text-[#1b2027] capitalize dark:text-[#f1f5f9]">
            You Invested
          </p>
          <p className="text-[16px] leading-4 font-semibold text-[#1b2027] dark:text-[#f1f5f9]">
            {mask(fmtLkrCurrency(dcaSpent))}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">
              {mask(`₿ ${(dcaSats / 1e8).toFixed(5)}`)}
            </p>
            <div className="size-0.75 rounded-full bg-[#e2e8f0] dark:bg-[#334155]" />
            <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">
              {mask(`≈ 丰 ${fmtSatsCompact(dcaSats)}`)}
            </p>
          </div>
        </Card>

        <Card
          type="plain"
          className="flex! flex-col! items-start! gap-2! rounded-2xl! p-3! shadow-none!"
          style={CARD_SUCCESS_STYLE}
        >
          <Image src="/emoji/coins.webp" alt="" width={36} height={36} className="size-9" />
          <p className="text-[14px] leading-4 text-[#1b2027] capitalize dark:text-[#f1f5f9]">
            Current Value
          </p>
          <div className="flex flex-col items-start gap-2">
            <p className="text-[16px] leading-4 font-semibold text-[#1b2027] dark:text-[#f1f5f9]">
              {mask(fmtLkrCurrency(totalLkr))}
            </p>
            {dcaSpent > 0 && (
              <Badge
                type="number"
                mode={isProfit ? "primary" : "critical"}
                className="m-0! flex! h-auto! min-w-0! items-center! justify-center! rounded-lg! px-2.5! py-1! text-[12px]! leading-4! font-medium! whitespace-nowrap!"
                style={
                  {
                    "--tgui--button_color": "#158348",
                    "--tgui--destructive_text_color": "rgba(241,49,49,0.62)",
                    "--tgui--button_text_color": "#fff",
                  } as React.CSSProperties
                }
              >
                {mask(
                  `${fmtLkrCurrency(Math.abs(profitLkr))} (${isProfit ? "+" : "-"} ${Math.abs(profitPct).toFixed(0)}%)`
                )}
              </Badge>
            )}
          </div>
        </Card>

        <Card
          type="plain"
          className="flex! flex-col! items-start! gap-2! rounded-2xl! p-3! shadow-none!"
          style={CARD_SURFACE_STYLE}
        >
          <Image src="/emoji/calculator.webp" alt="" width={36} height={36} className="size-9" />
          <p className="text-[14px] leading-4 text-[#1b2027] capitalize dark:text-[#f1f5f9]">
            Avg Price
          </p>
          <div className="flex items-center gap-1">
            <p className="text-[16px] leading-4 font-semibold text-[#1b2027] dark:text-[#f1f5f9]">
              {mask(fmtLkrCurrencyCompact(avgBtcPrice))}
            </p>
            <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">per BTC</p>
          </div>
          {avgBtcPriceUsd !== undefined && (
            <div className="flex items-center gap-1">
              <p className="text-[14px] leading-4 font-semibold text-[#64748b]">
                {mask(`USD ${fmtPriceCompact(avgBtcPriceUsd)}`)}
              </p>
              <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">per BTC</p>
            </div>
          )}
        </Card>

        <Card
          type="plain"
          className="flex! flex-col! items-start! gap-2! rounded-2xl! p-3! shadow-none!"
          style={CARD_SUCCESS_STYLE}
        >
          <Image src="/emoji/graph.webp" alt="" width={36} height={36} className="size-9" />
          <p className="text-[14px] leading-4 text-[#1b2027] capitalize dark:text-[#f1f5f9]">
            Current Price
          </p>
          <div className="flex items-center gap-1">
            <p className="text-[16px] leading-4 font-semibold text-[#1b2027] dark:text-[#f1f5f9]">
              {fmtLkrCurrencyCompact(currentBtcPrice)}
            </p>
            <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">per BTC</p>
          </div>
          {currentBtcPriceUsd !== undefined && (
            <div className="flex items-center gap-1">
              <p className="text-[14px] leading-4 font-semibold text-[#64748b]">
                USD {fmtPriceCompact(currentBtcPriceUsd)}
              </p>
              <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">per BTC</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
