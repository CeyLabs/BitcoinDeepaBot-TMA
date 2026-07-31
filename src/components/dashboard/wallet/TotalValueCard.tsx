"use client";

import Image from "next/image";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { Card, Badge } from "@telegram-apps/telegram-ui";
import { fmtLkr, fmtSatsCompact, maskDigits } from "@/lib/formatters";

// Card/Badge theme their background/color through --tgui-- CSS variables (same
// convention as --tgui--cell--middle--padding on the homepage Cell) — override those
// via style, and everything else (radius/shadow/padding/display) via `!` classNames.

export interface TotalValueCardProps {
  totalLkr: number;
  totalSats: number;
  changePercent: number;
  changeLkr: number;
  visible: boolean;
}

export function TotalValueCard({
  totalLkr,
  totalSats,
  changePercent,
  changeLkr,
  visible,
}: TotalValueCardProps) {
  const mask = (v: string) => maskDigits(v, visible);
  const isProfit = changePercent >= 0;
  const TrendIcon = isProfit ? TrendingUp : TrendingDown;

  return (
    <Card
      type="plain"
      style={{ "--tgui--tertiary_bg_color": "transparent" } as React.CSSProperties}
    >
      <Image src="/bg/wallet.webp" alt="" fill priority className="object-cover" />
      <div className="relative flex flex-col gap-2 p-4">
        <div className="flex items-end justify-between">
          <p className="text-[14px] leading-3 text-white capitalize">Total Value</p>
          <div className="flex items-center gap-1 rounded-[12px] border border-white py-1 pr-1 pl-2">
            <p className="text-[12px] leading-4 text-white">LKR</p>
            <ChevronDown size={14} strokeWidth={2} className="text-white" />
          </div>
        </div>

        <p className="text-[36px] leading-12 font-bold text-white">
          {mask(`≈ LKR ${fmtLkr(totalLkr)}`)}
        </p>

        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-end gap-0.5 text-[12px] leading-4 text-white">
              <span>{mask(`₿ ${(totalSats / 1e8).toFixed(6)}`)}</span>
              <span>BTC</span>
            </div>
            <div className="size-1 rounded-full bg-white" />
            <div className="flex items-end gap-0.5 text-[12px] leading-4 text-white">
              <span>{mask(`丰 ${fmtSatsCompact(totalSats)}`)}</span>
              <span>SATS</span>
            </div>
          </div>

          <Badge
            type="number"
            mode={isProfit ? "primary" : "critical"}
            className="m-0! h-auto! rounded-[8px]! px-2! py-1!"
            style={
              {
                "--tgui--button_color": "#158348",
                "--tgui--destructive_text_color": "rgba(241,49,49,0.62)",
                "--tgui--button_text_color": "#fff",
              } as React.CSSProperties
            }
          >
            <p className="flex items-center gap-1">
              <TrendIcon size={14} strokeWidth={2} className="text-white" />
              <span>
                {" "}
                {mask(
                  `LKR ${fmtLkr(Math.abs(changeLkr))}  (${isProfit ? "+" : "-"}${Math.abs(changePercent).toFixed(2)}%)`
                )}
                {"  Last 24h"}
              </span>
            </p>
          </Badge>
        </div>
      </div>
    </Card>
  );
}
