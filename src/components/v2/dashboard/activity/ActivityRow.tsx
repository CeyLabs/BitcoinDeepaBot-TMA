"use client";

import { useState } from "react";
import Image from "next/image";
import { Accordion, Badge } from "@telegram-apps/telegram-ui";
import { CopyField } from "@/components/ui/copy-field";
import { ACTIVITY_ICON, ACTIVITY_TITLE } from "@/lib/activity";
import { fmtActivityTime, fmtLkr, fmtShortDate, formatSatoshis, maskDigits } from "@/lib/formatters";
import type { ActivityItem } from "@/lib/types";

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
    <Accordion expanded={expanded} onChange={setExpanded}>
      <Accordion.Summary
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
          <span className="text-[12px] leading-4 text-[#475569] dark:text-muted-foreground">
            {item.detailLabel ? (
              `${item.detailLabel} at ${time}`
            ) : (
              <>
                {isOutgoing ? "To" : "From"}{" "}
                <span className="text-[#fa7119]">@{item.counterparty}</span> at {time}
              </>
            )}
          </span>
        }
        after={
          <div className="flex flex-col items-end gap-0.5">
            <p
              className={`text-[14px] font-semibold leading-4 ${
                isOutgoing ? "text-[#f13131]" : "text-[#25a761]"
              }`}
            >
              {mask(`${isOutgoing ? "-" : "+"}${fmtLkr(Math.abs(item.sats))} sats`)}
            </p>
            <p className="text-[12px] leading-4 text-[#64748b]">
              {mask(`≈ LKR ${fmtLkr(item.lkr)}`)}
            </p>
          </div>
        }
      >
        <span className="flex items-center gap-1.5 text-[16px] font-semibold leading-5 text-[#1b2027] dark:text-white">
          {ACTIVITY_TITLE[item.type]}
          {item.statusDot && (
            <span
              className={`size-2 rounded-full ${
                item.statusDot === "green" ? "bg-[#22c55e]" : "bg-orange-500"
              }`}
            />
          )}
        </span>
      </Accordion.Summary>

      <Accordion.Content>
        <div className="flex flex-col gap-3 px-4 pb-4 pt-1">
          <div className="flex items-center justify-between">
            <p className="text-[14px] leading-4 text-[#64748b]">Status</p>
            <Badge
              type="number"
              mode="primary"
              className="flex! h-auto! min-w-0! items-center! justify-center! m-0! whitespace-nowrap! rounded-[8px]! px-2.5! py-1! text-[12px]! font-medium! leading-4!"
              style={
                {
                  "--tgui--button_color": "#25a761",
                  "--tgui--button_text_color": "#fff",
                } as React.CSSProperties
              }
            >
              {item.settlement.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[14px] leading-4 text-[#64748b]">Settled on</p>
            <p className="text-[14px] font-semibold leading-4 text-[#1b2027] dark:text-white">
              {fmtShortDate(item.settlement.settledOn)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[14px] leading-4 text-[#64748b]">
              BTC Value {isOutgoing ? "Sent" : "Received"}
            </p>
            <p className="text-[14px] font-semibold leading-4 text-[#1b2027] dark:text-white">
              {formatSatoshis(item.settlement.btcSats)} BTC
            </p>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-[12px] bg-[rgba(37,167,97,0.08)] px-3 py-2.5 dark:bg-white/5">
            <p className="text-[12px] leading-4 text-[#64748b]">BTC price at transaction time</p>
            <p className="text-[14px] font-semibold leading-4">
              <span className="text-[#2563eb]">USD {fmtLkr(item.settlement.btcPriceUsd)}</span>
              <span className="text-[#64748b]"> / BTC · </span>
              <span className="text-[#2563eb]">
                LKR {fmtLkr(item.settlement.btcPriceLkr)}
              </span>
              <span className="text-[#64748b]"> / BTC</span>
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-[14px] leading-4 text-[#64748b]">Transaction ID</p>
            <CopyField value={item.settlement.transactionId} />
          </div>
        </div>
      </Accordion.Content>
    </Accordion>
  );
}
