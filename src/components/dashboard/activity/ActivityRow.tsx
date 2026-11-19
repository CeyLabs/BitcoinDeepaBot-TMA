"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Collapsible } from "@base-ui/react/collapsible";
import { Badge } from "@/components/ui/badge";
import { Cell } from "@/components/ui/cell";
import { CopyField } from "@/components/ui/copy-field";
import { ACTIVITY_ICON, ACTIVITY_TITLE } from "@/lib/activity";
import {
  fmtActivityTime,
  fmtLkr,
  fmtLkrCurrency,
  fmtPriceCompact,
  fmtShortDate,
  formatSatoshis,
  maskDigits,
} from "@/lib/formatters";
import type { ActivityItem } from "@/lib/types";

const STATUS_COLOR: Record<NonNullable<ActivityItem["statusDot"]>, string> = {
  green: "#25A761",
  orange: "#FA7119",
  red: "#F45A5A",
  gray: "#94A3B8",
};

export interface ActivityRowProps {
  item: ActivityItem;
  visible: boolean;
}

export function ActivityRow({ item, visible }: ActivityRowProps) {
  const [expanded, setExpanded] = useState(false);
  const isOutgoing = item.sats < 0;
  const mask = (v: string) => maskDigits(v, visible);
  const time = fmtActivityTime(item.timestamp);

  return (
    <Collapsible.Root open={expanded} onOpenChange={setExpanded}>
      <Collapsible.Trigger className="mx-1 my-0.5 block w-[calc(100%-0.5rem)] cursor-pointer rounded-xl text-left transition-colors duration-150 hover:bg-[#f1f5f9] dark:hover:bg-[#1B2027]">
        <Cell
          className="gap-2 pr-1.5 pl-3 [--cell-py:12px]"
          before={
            <div className="flex size-10 shrink-0 items-center justify-center">
              <Image
                src={ACTIVITY_ICON[item.type]}
                alt=""
                width={36}
                height={36}
                className="size-9"
              />
            </div>
          }
          subtitle={
            <span className="block text-xs leading-4 text-[#64748B]">
              {item.detailLabel ? (
                `${item.detailLabel} at ${time}`
              ) : (
                <>
                  {isOutgoing ? "To" : "From"}{" "}
                  <span className="text-[#FA7119]">@{item.counterparty}</span> at {time}
                </>
              )}
            </span>
          }
          after={
            <div className="flex items-center gap-0.5">
              <div className="flex flex-col items-end gap-0.5">
                {item.notCredited ? (
                  // Never credited: no sign, struck through, so it can't pass for a reward
                  <p className="text-right text-[14px] leading-4 text-[#94A3B8] line-through">
                    {mask(`${fmtLkr(Math.abs(item.sats))} sats`)}
                  </p>
                ) : (
                  <p
                    className={`text-right text-[14px] leading-4 ${
                      isOutgoing ? "text-[#F45A5A]" : "text-[#218A54]"
                    }`}
                  >
                    {mask(`${isOutgoing ? "-" : "+"}${fmtLkr(Math.abs(item.sats))} sats`)}
                  </p>
                )}
                <p className="text-right text-xs leading-4 text-[#475569] dark:text-[#94A3B8]">
                  {mask(`≈ ${fmtLkrCurrency(item.lkr)}`)}
                </p>
              </div>
              <ChevronDown
                size={16}
                strokeWidth={2}
                className={`shrink-0 text-[#64748b] transition-transform duration-150 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </div>
          }
        >
          <span className="flex items-center gap-1.5 text-base leading-5 font-semibold whitespace-nowrap text-[#1b2027] dark:text-white">
            {ACTIVITY_TITLE[item.type]}
            {item.statusDot && (
              <span
                className="inline-block size-2 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_COLOR[item.statusDot] }}
              />
            )}
          </span>
        </Cell>
      </Collapsible.Trigger>

      <Collapsible.Panel className="bg-card h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-100 ease-in-out data-ending-style:h-0 data-starting-style:h-0">
        <div className="flex flex-col gap-4 px-4 pt-2 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-start">
              <p className="text-xs leading-4 text-[#475569]">Status</p>
              <Badge
                className="m-0 h-auto min-w-0 rounded-[8px] px-2 py-1 text-sm leading-3 text-white"
                style={{
                  backgroundColor: item.statusDot ? STATUS_COLOR[item.statusDot] : "#25A761",
                }}
              >
                {item.settlement.status}
              </Badge>
            </div>

            <div className="flex flex-col items-end text-right">
              <p className="text-xs leading-4 text-[#475569]">Date</p>
              <p className="text-sm leading-5 font-semibold text-[#1b2027] dark:text-white">
                {fmtShortDate(item.settlement.settledOn)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-start gap-3">
            <p className="text-xs leading-4 text-[#475569]">
              BTC Value {isOutgoing ? "Sent" : "Received"}
            </p>
            <p className="text-base leading-5 font-semibold text-[#1b2027] dark:text-white">
              {mask(`${formatSatoshis(item.settlement.btcSats)} BTC`)}
            </p>
          </div>

          {item.settlement.btcPriceLkr !== undefined ? (
            <div className="flex flex-col items-center gap-1 rounded-[12px] bg-[#e8edfc] px-3 py-1 dark:bg-white/5">
              <p className="text-xs leading-4 text-[#475569]">BTC price at transaction time</p>
              <p className="text-sm leading-5">
                {item.settlement.btcPriceUsd !== undefined && (
                  <>
                    <span className="font-bold text-[#0088FF]">USD</span>{" "}
                    <span className="font-bold text-[#1b2027] dark:text-white">
                      {item.settlement.btcPriceUsd.toFixed(2)}
                    </span>
                    <span className="text-[#64748b]"> / BTC · </span>
                  </>
                )}
                <span className="font-bold text-[#0088FF]">රු.</span>{" "}
                <span className="font-bold text-[#1b2027] dark:text-white">
                  {fmtPriceCompact(item.settlement.btcPriceLkr)}
                </span>
                <span className="text-[#64748b]"> / BTC</span>
              </p>
            </div>
          ) : (
            item.settlement.memo && (
              <div className="flex flex-col items-center gap-1 rounded-[12px] bg-[#e8edfc] px-3 py-1 text-center dark:bg-white/5">
                <p className="text-xs leading-4 text-[#475569]">Memo</p>
                <p className="text-sm leading-5 font-semibold text-[#1b2027] dark:text-white">
                  {item.settlement.memo}
                </p>
              </div>
            )
          )}

          <div className="flex flex-col gap-1">
            <p className="text-xs leading-4 text-[#475569]">Transaction ID</p>
            <CopyField value={item.settlement.transactionId} />
          </div>
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
