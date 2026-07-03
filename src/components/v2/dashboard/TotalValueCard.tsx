"use client";

import Image from "next/image";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { Card, Badge } from "@telegram-apps/telegram-ui";
import { cn } from "@/lib/cn";
import { fmtLkr, fmtSatsCompact } from "@/lib/formatters";

const MASK = "••••••";

export interface TotalValueCardProps {
  totalLkr: number;
  totalSats: number;
  changePercent: number;
  changeLkr: number;
  visible: boolean;
  isLoading?: boolean;
}

export function TotalValueCard({
  totalLkr,
  totalSats,
  changePercent,
  changeLkr,
  visible,
  isLoading,
}: TotalValueCardProps) {
  const mask = (v: string) => (visible ? v : MASK);
  const isProfit = changePercent >= 0;
  const TrendIcon = isProfit ? TrendingUp : TrendingDown;

  return (
    <Card type="plain" className="relative! w-full! overflow-hidden! rounded-[24px]! px-3! py-4! bg-transparent! shadow-none!">
      <Image src="/bg/wallet.webp" alt="" fill priority sizes="400px" className="object-cover" />
      <div className="relative flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <p className="text-[14px] capitalize leading-[14px] text-white">Total Value</p>
          <div className="flex items-center gap-1 rounded-[12px] border border-white py-1 pl-2 pr-1">
            <p className="text-[12px] leading-4 text-white">LKR</p>
            <ChevronDown size={14} strokeWidth={2} className="text-white" />
          </div>
        </div>

        {isLoading ? (
          <div className="h-[48px] w-48 animate-pulse rounded-lg bg-white/20" />
        ) : (
          <p className="text-[36px] font-bold leading-[48px] text-white">
            {mask(`≈ LKR ${fmtLkr(totalLkr)}`)}
          </p>
        )}

        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-end gap-0.5 text-[12px] leading-4 text-white">
              <span>{mask(`₿ ${(totalSats / 1e8).toFixed(6)}`)}</span>
              <span>BTC</span>
            </div>
            <div className="size-[3px] rounded-full bg-white" />
            <div className="flex items-end gap-0.5 text-[12px] leading-4 text-white">
              <span>{mask(`丰 ${fmtSatsCompact(totalSats)}`)}</span>
              <span>SATS</span>
            </div>
          </div>

          <Badge
            type="number"
            mode={isProfit ? "primary" : "critical"}
            className={cn(
              "flex! h-auto! items-center! gap-1! rounded-[8px]! px-2! py-1! text-[12px]! font-semibold! leading-4! text-white!",
              isProfit ? "bg-[#158348]!" : "bg-[rgba(241,49,49,0.62)]!"
            )}
          >
            <TrendIcon size={14} strokeWidth={2} className="text-white" />
            {mask(
              `LKR ${fmtLkr(Math.abs(changeLkr))}  (${isProfit ? "+" : "-"}${Math.abs(changePercent).toFixed(2)}%)`
            )}
            {"  Last 24h"}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
