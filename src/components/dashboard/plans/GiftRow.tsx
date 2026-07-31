"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Cell } from "@telegram-apps/telegram-ui";
import { ACTIVITY_ICON } from "@/lib/activity";
import { fmtActivityDateTime, fmtLkr, maskDigits } from "@/lib/formatters";
import type { ActivityItem } from "@/lib/types";

export interface GiftRowProps {
  item: ActivityItem;
  visible: boolean;
}

export function GiftRow({ item, visible }: GiftRowProps) {
  const isOutgoing = item.sats < 0;
  const mask = (v: string) => maskDigits(v, visible);

  return (
    <Cell
      before={
        <div className="flex size-10 shrink-0 items-center justify-center">
          <Image src={ACTIVITY_ICON[item.type]} alt="" width={36} height={36} className="size-9" />
        </div>
      }
      subtitle={
        <span className="flex flex-col text-xs text-[#64748B]">
          <span>
            {isOutgoing ? "To" : "From"} <span className="text-[#FA7119]">@{item.counterparty}</span>
          </span>
          <span>{fmtActivityDateTime(item.timestamp)}</span>
        </span>
      }
      after={
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col items-end gap-0.5">
            <p className={`text-[14px] leading-4 ${isOutgoing ? "text-[#F45A5A]" : "text-[#218A54]"}`}>
              {mask(`${isOutgoing ? "-" : "+"}${fmtLkr(Math.abs(item.sats))} sats`)}
            </p>
            <p className="text-xs leading-4 text-[#475569] dark:text-[#94A3B8]">
              {mask(`≈ LKR ${fmtLkr(item.lkr)}`)}
            </p>
          </div>
          <ChevronRight size={18} strokeWidth={2} className="shrink-0 text-[#64748b]" />
        </div>
      }
      className="px-3! gap-2!"
    >
      <span className="text-base font-semibold leading-5 text-[#1b2027] dark:text-white">
        {isOutgoing ? "Sent" : "Received"}
      </span>
    </Cell>
  );
}
