"use client";

import Image from "next/image";
import { Card, Badge } from "@telegram-apps/telegram-ui";
import { cn } from "@/lib/cn";
import { fmtLkr, fmtPriceCompact, fmtSatsCompact } from "@/lib/formatters";

const MASK = "••••••";

export interface PerformanceGridProps {
  dcaSpent: number;
  dcaSats: number;
  totalLkr: number;
  avgBtcPrice: number;
  currentBtcPrice: number;
  visible: boolean;
}

export function PerformanceGrid({
  dcaSpent,
  dcaSats,
  totalLkr,
  avgBtcPrice,
  currentBtcPrice,
  visible,
}: PerformanceGridProps) {
  const mask = (v: string) => (visible ? v : MASK);
  const profitLkr = totalLkr - dcaSpent;
  const profitPct = dcaSpent > 0 ? (profitLkr / dcaSpent) * 100 : 0;
  const isProfit = profitLkr >= 0;

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[14px] font-bold leading-4 text-[#475569]">Performance</p>

      <Card
        type="plain"
        className="flex! w-full! items-stretch! justify-between! gap-3! rounded-[16px]! bg-white! p-3! shadow-none!"
      >
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col items-start gap-2">
            <Image src="/emoji/wallet.svg" alt="" width={36} height={36} className="size-9" />
            <p className="text-[14px] capitalize leading-4 text-[#1b2027]">You Invested</p>
            <p className="text-[16px] font-semibold leading-4 text-[#1b2027]">
              {mask(`LKR ${fmtLkr(dcaSpent)}`)}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-[12px] leading-4 text-[#475569]">
                {mask(`₿ ${(dcaSats / 1e8).toFixed(5)}`)}
              </p>
              <div className="size-[3px] rounded-full bg-[#e2e8f0]" />
              <p className="text-[12px] leading-4 text-[#475569]">
                {mask(`丰 ${fmtSatsCompact(dcaSats)}`)}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-[#e2e8f0]" />

          <div className="flex flex-col items-start gap-2">
            <Image src="/emoji/calculator.svg" alt="" width={36} height={36} className="size-9" />
            <p className="text-[14px] capitalize leading-4 text-[#1b2027]">Avg Price</p>
            <div className="flex items-center gap-1">
              <p className="text-[16px] font-semibold leading-4 text-[#1b2027]">
                LKR {fmtPriceCompact(avgBtcPrice)}
              </p>
              <p className="text-[12px] leading-4 text-[#475569]">per BTC</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Card
            type="plain"
            className="flex! w-[160px]! flex-col! items-start! gap-2! rounded-[16px]! bg-[rgba(37,167,97,0.1)]! px-3! py-2! shadow-none!"
          >
            <Image src="/emoji/coins.svg" alt="" width={36} height={36} className="size-9" />
            <p className="text-[14px] capitalize leading-4 text-[#1b2027]">Current Value</p>
            <div className="flex flex-col items-start gap-2">
              <p className="text-[16px] font-semibold leading-4 text-[#1b2027]">
                {mask(`LKR ${fmtLkr(totalLkr)}`)}
              </p>
              {dcaSpent > 0 && (
                <Badge
                  type="number"
                  mode={isProfit ? "primary" : "critical"}
                  className={cn(
                    "flex! h-auto! items-center! justify-center! rounded-[8px]! px-2.5! py-1! text-[12px]! font-medium! leading-4! text-white!",
                    isProfit ? "bg-[#158348]!" : "bg-[rgba(241,49,49,0.62)]!"
                  )}
                >
                  {mask(
                    `${isProfit ? "+" : "-"} LKR ${fmtLkr(Math.abs(profitLkr))} (${isProfit ? "+" : "-"} ${Math.abs(profitPct).toFixed(0)}%)`
                  )}
                </Badge>
              )}
            </div>
          </Card>

          <Card
            type="plain"
            className="flex! flex-col! items-start! gap-2! rounded-[16px]! bg-[rgba(37,167,97,0.1)]! px-3! py-2! shadow-none!"
          >
            <Image src="/emoji/graph.svg" alt="" width={36} height={36} className="size-9" />
            <p className="text-[14px] capitalize leading-4 text-[#1b2027]">Current Price</p>
            <div className="flex items-center gap-1">
              <p className="text-[16px] font-semibold leading-4 text-[#1b2027]">
                LKR {fmtPriceCompact(currentBtcPrice)}
              </p>
              <p className="text-[12px] leading-4 text-[#475569]">per BTC</p>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}
