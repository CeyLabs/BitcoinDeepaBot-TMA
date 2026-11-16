"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ValueSkeleton } from "@/components/ui/value-skeleton";
import {
  fmtLkrCurrency,
  fmtLkrCurrencyCompact,
  fmtPriceCompact,
  fmtSatsCompact,
  maskDigits,
} from "@/lib/formatters";

export interface PerformanceGridProps {
  dcaSpent: number;
  dcaSats: number;
  totalLkr: number;
  avgBtcPrice: number;
  avgBtcPriceUsd?: number;
  currentBtcPrice: number;
  currentBtcPriceUsd?: number;
  visible: boolean;
  isLoading?: boolean;
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
  isLoading = false,
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
        <Card className="bg-card flex flex-col items-start gap-2 rounded-2xl p-3 shadow-none">
          <Image src="/emoji/wallet.webp" alt="" width={36} height={36} className="size-9" />
          <p className="text-[14px] leading-4 text-[#1b2027] capitalize dark:text-[#f1f5f9]">
            You Invested
          </p>
          {isLoading ? (
            <ValueSkeleton className="h-4 w-24" />
          ) : (
            <p className="text-[16px] leading-4 font-semibold text-[#1b2027] dark:text-[#f1f5f9]">
              {mask(fmtLkrCurrency(dcaSpent))}
            </p>
          )}
          {isLoading ? (
            <ValueSkeleton className="h-3 w-32" />
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">
                {mask(`₿ ${(dcaSats / 1e8).toFixed(5)}`)}
              </p>
              <div className="size-0.75 rounded-full bg-[#e2e8f0] dark:bg-[#334155]" />
              <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">
                {mask(`≈ 丰 ${fmtSatsCompact(dcaSats)}`)}
              </p>
            </div>
          )}
        </Card>

        <Card className="bg-card flex flex-col items-start gap-2 rounded-2xl p-3 shadow-none">
          <Image src="/emoji/coins.webp" alt="" width={36} height={36} className="size-9" />
          <p className="text-[14px] leading-4 text-[#1b2027] capitalize dark:text-[#f1f5f9]">
            Current Value
          </p>
          <div className="flex flex-col items-start gap-2">
            {isLoading ? (
              <ValueSkeleton className="h-4 w-24" />
            ) : (
              <p className="text-[16px] leading-4 font-semibold text-[#1b2027] dark:text-[#f1f5f9]">
                {mask(fmtLkrCurrency(totalLkr))}
              </p>
            )}
            {isLoading ? (
              <ValueSkeleton className="h-6 w-28 rounded-lg" />
            ) : (
              dcaSpent > 0 && (
                <Badge
                  variant={isProfit ? "gain" : "loss"}
                  className="m-0 flex h-auto min-w-0 rounded-lg px-2.5 py-1 text-[12px] leading-4 font-medium"
                >
                  {mask(
                    `${fmtLkrCurrency(Math.abs(profitLkr))} (${isProfit ? "+" : "-"} ${Math.abs(profitPct).toFixed(0)}%)`
                  )}
                </Badge>
              )
            )}
          </div>
        </Card>

        <Card className="bg-card flex flex-col items-start gap-2 rounded-2xl p-3 shadow-none">
          <Image src="/emoji/calculator.webp" alt="" width={36} height={36} className="size-9" />
          <p className="text-[14px] leading-4 text-[#1b2027] capitalize dark:text-[#f1f5f9]">
            Avg Price
          </p>
          {isLoading ? (
            <ValueSkeleton className="h-4 w-20" />
          ) : (
            <div className="flex items-center gap-1">
              <p className="text-[16px] leading-4 font-semibold text-[#1b2027] dark:text-[#f1f5f9]">
                {mask(fmtLkrCurrencyCompact(avgBtcPrice))}
              </p>
              <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">per BTC</p>
            </div>
          )}
          {isLoading ? (
            <ValueSkeleton className="h-3.5 w-20" />
          ) : (
            avgBtcPriceUsd !== undefined && (
              <div className="flex items-center gap-1">
                <p className="text-[14px] leading-4 font-semibold text-[#64748b]">
                  {mask(`USD ${fmtPriceCompact(avgBtcPriceUsd)}`)}
                </p>
                <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">per BTC</p>
              </div>
            )
          )}
        </Card>

        <Card className="bg-card flex flex-col items-start gap-2 rounded-2xl p-3 shadow-none">
          <Image src="/emoji/graph.webp" alt="" width={36} height={36} className="size-9" />
          <p className="text-[14px] leading-4 text-[#1b2027] capitalize dark:text-[#f1f5f9]">
            Current Price
          </p>
          {isLoading ? (
            <ValueSkeleton className="h-4 w-20" />
          ) : (
            <div className="flex items-center gap-1">
              <p className="text-[16px] leading-4 font-semibold text-[#1b2027] dark:text-[#f1f5f9]">
                {fmtLkrCurrencyCompact(currentBtcPrice)}
              </p>
              <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">per BTC</p>
            </div>
          )}
          {isLoading ? (
            <ValueSkeleton className="h-3.5 w-20" />
          ) : (
            currentBtcPriceUsd !== undefined && (
              <div className="flex items-center gap-1">
                <p className="text-[14px] leading-4 font-semibold text-[#64748b]">
                  USD {fmtPriceCompact(currentBtcPriceUsd)}
                </p>
                <p className="text-[12px] leading-4 text-[#475569] dark:text-[#94a3b8]">per BTC</p>
              </div>
            )
          )}
        </Card>
      </div>
    </div>
  );
}
