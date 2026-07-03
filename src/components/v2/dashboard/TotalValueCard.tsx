"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { fmtLkr, fmtSatsCompact } from "@/lib/formatters";

const MASK = "••••••";

function ChevronDown() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 1L5 5L9 1"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendIcon({ isProfit }: { isProfit: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(!isProfit && "rotate-180")}
    >
      <path
        d="M2 9.5L5.5 6L8 8.5L12 4"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 4H12V7.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

  return (
    <div className="relative w-full overflow-hidden rounded-[24px] px-3 py-4">
      <Image src="/bg/wallet.webp" alt="" fill priority sizes="400px" className="object-cover" />
      <div className="relative flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <p className="text-[14px] capitalize leading-[14px] text-white">Total Value</p>
          <div className="flex items-center gap-1 rounded-[12px] border border-white py-1 pl-2 pr-1">
            <p className="text-[12px] leading-4 text-white">LKR</p>
            <ChevronDown />
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

          <div
            className={cn(
              "flex items-center gap-1 rounded-[8px] px-2 py-1",
              isProfit ? "bg-[#158348]" : "bg-[rgba(241,49,49,0.62)]"
            )}
          >
            <TrendIcon isProfit={isProfit} />
            <p className="text-[12px] font-semibold leading-4 text-white">
              {mask(`LKR ${fmtLkr(Math.abs(changeLkr))}  (${isProfit ? "+" : "-"}${Math.abs(changePercent).toFixed(2)}%)`)}
            </p>
            <p className="text-[12px] font-semibold leading-4 text-white">Last 24h</p>
          </div>
        </div>
      </div>
    </div>
  );
}
