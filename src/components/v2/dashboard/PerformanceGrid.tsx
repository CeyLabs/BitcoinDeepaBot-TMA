"use client";

import Image from "next/image";
import { Card, Badge } from "@telegram-apps/telegram-ui";
import { fmtLkr, fmtPriceCompact, fmtSatsCompact } from "@/lib/formatters";
import { useTheme } from "@/app/context/theme";

const MASK = "••••••";

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
  const { isDark } = useTheme();
  const mask = (v: string) => (visible ? v : MASK);
  const profitLkr = totalLkr - dcaSpent;
  const profitPct = dcaSpent > 0 ? (profitLkr / dcaSpent) * 100 : 0;
  const isProfit = profitLkr >= 0;
  const surfaceBg = isDark ? "#1b2027" : "#fff";

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[14px] font-bold leading-4 text-[#475569] dark:text-[#94a3b8]">
        Performance
      </p>

      <div className="grid grid-cols-2 gap-2">
        <Card
          type="plain"
          className="flex! flex-col! items-start! gap-2! rounded-[16px]! p-3! shadow-none!"
          style={{ "--tgui--tertiary_bg_color": surfaceBg } as React.CSSProperties}
        >
          <Image src="/emoji/wallet.svg" alt="" width={36} height={36} className="size-9" />
          <p className="text-[14px] capitalize leading-4 text-[#1b2027] dark:text-[#f1f5f9]">
            You Invested
          </p>
          <p className="text-[16px] font-semibold leading-4 text-[#1b2027] dark:text-[#f1f5f9]">
            {mask(`LKR ${fmtLkr(dcaSpent)}`)}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">
              {mask(`₿ ${(dcaSats / 1e8).toFixed(5)}`)}
            </p>
            <div className="size-[3px] rounded-full bg-[#e2e8f0] dark:bg-[#334155]" />
            <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">
              {mask(`丰 ${fmtSatsCompact(dcaSats)}`)}
            </p>
          </div>
        </Card>

        <Card
          type="plain"
          className="flex! flex-col! items-start! gap-2! rounded-[16px]! p-3! shadow-none!"
          style={{ "--tgui--tertiary_bg_color": "rgba(37,167,97,0.1)" } as React.CSSProperties}
        >
          <Image src="/emoji/coins.svg" alt="" width={36} height={36} className="size-9" />
          <p className="text-[14px] capitalize leading-4 text-[#1b2027] dark:text-[#f1f5f9]">
            Current Value
          </p>
          <div className="flex flex-col items-start gap-2">
            <p className="text-[16px] font-semibold leading-4 text-[#1b2027] dark:text-[#f1f5f9]">
              {mask(`LKR ${fmtLkr(totalLkr)}`)}
            </p>
            {dcaSpent > 0 && (
              <Badge
                type="number"
                mode={isProfit ? "primary" : "critical"}
                className="flex! h-auto! min-w-0! items-center! justify-center! m-0! whitespace-nowrap! rounded-[8px]! px-2.5! py-1! text-[12px]! font-medium! leading-4!"
                style={
                  {
                    "--tgui--button_color": "#158348",
                    "--tgui--destructive_text_color": "rgba(241,49,49,0.62)",
                    "--tgui--button_text_color": "#fff",
                  } as React.CSSProperties
                }
              >
                {mask(
                  `LKR ${fmtLkr(Math.abs(profitLkr))} (${isProfit ? "+" : "-"} ${Math.abs(profitPct).toFixed(0)}%)`
                )}
              </Badge>
            )}
          </div>
        </Card>

        <Card
          type="plain"
          className="flex! flex-col! items-start! gap-2! rounded-[16px]! p-3! shadow-none!"
          style={{ "--tgui--tertiary_bg_color": surfaceBg } as React.CSSProperties}
        >
          <Image src="/emoji/calculator.svg" alt="" width={36} height={36} className="size-9" />
          <p className="text-[14px] capitalize leading-4 text-[#1b2027] dark:text-[#f1f5f9]">
            Avg Price
          </p>
          <div className="flex items-center gap-1">
            <p className="text-[16px] font-semibold leading-4 text-[#1b2027] dark:text-[#f1f5f9]">
              LKR {fmtPriceCompact(avgBtcPrice)}
            </p>
            <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">per BTC</p>
          </div>
          {avgBtcPriceUsd !== undefined && (
            <div className="flex items-center gap-1">
              <p className="text-[14px] font-semibold leading-4 text-[#64748b]">
                USD {fmtPriceCompact(avgBtcPriceUsd)}
              </p>
              <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">per BTC</p>
            </div>
          )}
        </Card>

        <Card
          type="plain"
          className="flex! flex-col! items-start! gap-2! rounded-[16px]! p-3! shadow-none!"
          style={{ "--tgui--tertiary_bg_color": "rgba(37,167,97,0.1)" } as React.CSSProperties}
        >
          <Image src="/emoji/graph.svg" alt="" width={36} height={36} className="size-9" />
          <p className="text-[14px] capitalize leading-4 text-[#1b2027] dark:text-[#f1f5f9]">
            Current Price
          </p>
          <div className="flex items-center gap-1">
            <p className="text-[16px] font-semibold leading-4 text-[#1b2027] dark:text-[#f1f5f9]">
              LKR {fmtPriceCompact(currentBtcPrice)}
            </p>
            <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">per BTC</p>
          </div>
          {currentBtcPriceUsd !== undefined && (
            <div className="flex items-center gap-1">
              <p className="text-[14px] font-semibold leading-4 text-[#64748b]">
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
