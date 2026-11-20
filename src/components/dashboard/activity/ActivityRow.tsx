"use client";

import { useState } from "react";
import { format } from "date-fns";
import { cn } from "cn";
import { CopyButton } from "@/components/ui/copy-button";
import { Emoji } from "@/components/ui/emoji";
import { haptic } from "@/platform";
import { ACTIVITY_ICON, ACTIVITY_TITLE, type ActivityEntry } from "@/lib/activity";
import {
  fmtActivityTime,
  fmtLkrCurrency,
  fmtLkrExact,
  fmtPriceCompact,
  fmtSats,
  formatSatoshis,
  LKR_SYMBOL,
  maskDigits,
} from "@/lib/formatters";

type StatusDot = NonNullable<ActivityEntry["statusDot"]>;

const STATUS_TEXT: Record<StatusDot, string> = {
  green: "text-gain",
  orange: "text-link",
  red: "text-loss",
  gray: "text-ink3",
};

const STATUS_DOT: Record<StatusDot, string> = {
  green: "bg-gain-fill",
  orange: "bg-primary",
  red: "bg-loss-solid",
  gray: "bg-ink3",
};

function DetailCell({
  label,
  wide,
  after,
  children,
}: {
  label: string;
  wide?: boolean;
  after?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-chip flex min-w-0 flex-col gap-0.5 rounded-xl px-3 py-2",
        wide && "col-span-2 flex-row items-center justify-between gap-2"
      )}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-ink2 text-[12px] leading-4">{label}</span>
        <span className="truncate text-[14px] leading-[18px] font-semibold">{children}</span>
      </span>
      {after}
    </div>
  );
}

export interface ActivityRowProps {
  item: ActivityEntry;
  visible: boolean;
}

export function ActivityRow({ item, visible }: ActivityRowProps) {
  const [expanded, setExpanded] = useState(false);
  const isOutgoing = item.sats < 0;
  const mask = (v: string) => maskDigits(v, visible);
  const time = fmtActivityTime(item.timestamp);
  const { settlement } = item;
  const status = item.statusDot ?? "green";
  const panelId = `tx-${item.id}`;

  return (
    <div className="rounded-xl">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => {
          haptic.select();
          setExpanded((v) => !v);
        }}
        className="press active:bg-chip flex w-full items-center gap-3 rounded-xl border-0 bg-transparent py-2.5 pr-1.5 pl-3 text-left active:transform-none!"
      >
        <Emoji src={ACTIVITY_ICON[item.type]} />

        <span className="flex min-w-0 grow flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-[16px] leading-5 font-semibold">
            <span className="truncate">{ACTIVITY_TITLE[item.type]}</span>
            {status !== "green" && (
              <span
                aria-hidden
                className={cn("size-2 shrink-0 rounded-full", STATUS_DOT[status])}
              />
            )}
          </span>
          <span className="text-ink2 truncate text-[12px] leading-4">
            {item.detailLabel ? (
              `${item.detailLabel} at ${time}`
            ) : (
              <>
                {isOutgoing ? "To " : "From "}
                {item.counterparty ? (
                  <span className="text-link font-bold">@{item.counterparty}</span>
                ) : (
                  "a member"
                )}{" "}
                at {time}
              </>
            )}
          </span>
        </span>

        <span className="flex shrink-0 flex-col items-end gap-0.5">
          {item.notCredited ? (
            // Never credited: no sign, struck through, so it can't pass for a reward
            <span className="num text-ink3 text-right text-[14px] leading-4 font-bold whitespace-nowrap line-through">
              {mask(`${fmtSats(Math.abs(item.sats))} sats`)}
            </span>
          ) : item.sats === 0 ? (
            // Paid but not priced yet (sats are worked out when the payment lands): not "+0 sats"
            <span className="text-ink3 text-right text-[14px] leading-4 font-bold whitespace-nowrap">
              {item.settlement?.status ?? "Pending"}
            </span>
          ) : (
            <span
              className={cn(
                "num text-right text-[14px] leading-4 font-bold whitespace-nowrap",
                isOutgoing ? "text-loss" : "text-gain"
              )}
            >
              {mask(`${isOutgoing ? "−" : "+"}${fmtSats(Math.abs(item.sats))} sats`)}
            </span>
          )}
          {item.lkr > 0 && (
            <span className="text-ink2 text-right text-[12px] leading-4 whitespace-nowrap">
              {mask(`≈ ${fmtLkrCurrency(item.lkr)}`)}
            </span>
          )}
        </span>

        <svg
          className={cn(
            "text-ink3 size-4 shrink-0 transition-transform duration-[380ms] ease-(--ease-spring)",
            expanded && "rotate-180"
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        id={panelId}
        inert={!expanded}
        className={cn(
          "grid transition-[grid-template-rows] duration-[380ms] ease-(--ease-out-soft)",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "grid grid-cols-2 gap-2 px-3 pt-0.5 pb-3.5 transition-[opacity,transform] duration-300",
              expanded ? "translate-y-0 opacity-100 delay-75" : "-translate-y-1.5 opacity-0"
            )}
          >
            <DetailCell label="Status">
              <span className={STATUS_TEXT[status]}>{settlement.status}</span>
            </DetailCell>
            <DetailCell label="Date">
              {format(new Date(settlement.settledOn), "d MMM yyyy, h:mm a")}
            </DetailCell>
            <DetailCell label={`BTC value ${isOutgoing ? "sent" : "received"}`}>
              <span className="num">{mask(`${formatSatoshis(settlement.btcSats)} BTC`)}</span>
            </DetailCell>
            {settlement.feeLkr !== undefined ? (
              <DetailCell label="Fee">
                {settlement.feeLkr > 0 ? mask(fmtLkrExact(settlement.feeLkr)) : "No fee"}
              </DetailCell>
            ) : (
              // Keeps the 2-col grid even; an empty half reads as a layout bug
              <span aria-hidden />
            )}

            {settlement.btcPriceLkr !== undefined && settlement.btcPriceLkr > 0 && (
              <DetailCell
                label="BTC price at transaction time"
                wide
                after={
                  settlement.btcPriceUsd !== undefined && (
                    <span className="num text-ink2 shrink-0 text-[13px] font-semibold">
                      USD {settlement.btcPriceUsd.toLocaleString("en-US")} / BTC
                    </span>
                  )
                }
              >
                <span className="num">
                  {LKR_SYMBOL} {fmtPriceCompact(settlement.btcPriceLkr)} / BTC
                </span>
              </DetailCell>
            )}

            {settlement.memo && (
              <DetailCell label="Memo" wide>
                <span className="whitespace-normal">{settlement.memo}</span>
              </DetailCell>
            )}

            <DetailCell
              label="Transaction ID"
              wide
              after={<CopyButton value={settlement.transactionId} label="transaction ID" />}
            >
              <span className="num text-[13px]">{settlement.transactionId}</span>
            </DetailCell>
          </div>
        </div>
      </div>
    </div>
  );
}
