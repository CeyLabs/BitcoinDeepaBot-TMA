"use client";

import Image from "next/image";
import { BtcSign } from "@/components/ui/btc-sign";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NumberTicker } from "@/components/motion/number-ticker";
import { ValueSkeleton } from "@/components/ui/value-skeleton";
import { cn } from "cn";
import { fmtLkr, fmtLkrCurrency, fmtSatsCompact, maskDigits, LKR_SYMBOL } from "@/lib/formatters";

export interface TotalValueCardProps {
  totalLkr: number;
  totalSats: number;
  /** False when the wallet balance couldn't be fetched: show that instead of a fake 0 */
  balanceAvailable?: boolean;
  changePercent: number;
  changeLkr: number;
  visible: boolean;
  isLoading?: boolean;
  /** Optional action in the top-right corner (e.g. the Sell button). */
  action?: React.ReactNode;
}

export function TotalValueCard({
  totalLkr,
  totalSats,
  balanceAvailable = true,
  changePercent,
  changeLkr,
  visible,
  isLoading = false,
  action,
}: TotalValueCardProps) {
  const mask = (v: string) => maskDigits(v, visible);
  const isProfit = changePercent >= 0;
  const TrendIcon = isProfit ? TrendingUp : TrendingDown;

  return (
    <Card className="bg-transparent">
      <Image
        src="/bg/wallet.webp"
        alt=""
        fill
        priority
        sizes="(max-width: 448px) 100vw, 448px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/18" />
      <div className="relative flex flex-col gap-2 p-4">
        <div className="flex items-end justify-between">
          <p className="text-[14px] leading-3 text-white capitalize">Total Value</p>
          {action}
          <div className="hidden items-center gap-1 rounded-[12px] border border-white py-1 pr-1 pl-2">
            <p className="text-[12px] leading-4 text-white">රු.</p>
            <ChevronDown size={14} strokeWidth={2} className="text-white" />
          </div>
        </div>

        {isLoading ? (
          <ValueSkeleton tone="translucent" className="h-9 w-40" />
        ) : !balanceAvailable ? (
          <div className="flex flex-col gap-1 py-1">
            <p className="text-[22px] leading-8 font-bold text-white">Balance unavailable</p>
            <p className="text-[12px] leading-4 text-white/80">
              Couldn&apos;t reach your wallet. Try again in a few minutes.
            </p>
          </div>
        ) : visible ? (
          <p className="text-[36px] leading-12 font-bold text-white">
            <NumberTicker value={totalLkr} prefix={`≈ ${LKR_SYMBOL} `} format={fmtLkr} />
          </p>
        ) : (
          <p className="text-[36px] leading-12 font-bold text-white">
            {mask(`≈ ${fmtLkrCurrency(totalLkr)}`)}
          </p>
        )}

        <div className={cn("flex flex-col items-start gap-2", isLoading && "invisible")}>
          <div className={cn("flex items-center gap-2", !balanceAvailable && "hidden")}>
            <div className="flex items-end gap-0.5 text-[12px] leading-4 text-white">
              <span>
                <BtcSign /> {mask((totalSats / 1e8).toFixed(6))}
              </span>
              {/* BtcSign already reads "BTC". */}
              <span aria-hidden>BTC</span>
            </div>
            <div className="size-1 rounded-full bg-white" />
            <div className="flex items-end gap-0.5 text-[12px] leading-4 text-white">
              <span>{mask(`丰 ${fmtSatsCompact(totalSats)}`)}</span>
            </div>
          </div>

          {balanceAvailable && (
            <Badge
              variant={isProfit ? "gain" : "loss"}
              className="m-0 h-auto rounded-[8px] px-2 py-1"
            >
              <p className="flex items-center gap-1">
                <TrendIcon size={14} strokeWidth={2} className="text-white" />
                <span>
                  {" "}
                  {mask(fmtLkrCurrency(Math.abs(changeLkr)))}
                  {`  (${isProfit ? "+" : "-"}${Math.abs(changePercent).toFixed(2)}%)`}
                  {"  Last 24h"}
                </span>
              </p>
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
