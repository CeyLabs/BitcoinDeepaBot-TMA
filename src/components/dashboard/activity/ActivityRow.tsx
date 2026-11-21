"use client";

import { useState } from "react";
import { format } from "date-fns";
import { cn } from "cn";
import { CopyButton } from "@/components/ui/copy-button";
import { Emoji } from "@/components/ui/emoji";
import { KeyValueList } from "@/components/ui/section";
import { Sheet } from "@/components/ui/sheet";
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

/** The activity's emoji, with a bolt on the corner for a Lightning payment. */
function ActivityIcon({ item, size }: { item: ActivityEntry; size?: number }) {
  return (
    <span className="relative shrink-0">
      <Emoji src={ACTIVITY_ICON[item.type]} size={size} />
      {item.lightning && (
        // A Lightning payment: a bolt on the icon's corner, outlined in the
        // card colour so it reads against the emoji behind it
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={cn(
            "fill-primary stroke-card absolute -right-1.5 -bottom-2 overflow-visible [paint-order:stroke]",
            // In step with the icon: list rows 36px, the details sheet 56px
            size && size >= 48 ? "size-7" : "size-5"
          )}
          strokeWidth={3}
          strokeLinejoin="round"
        >
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
        </svg>
      )}
    </span>
  );
}

export interface ActivityRowProps {
  item: ActivityEntry;
  visible: boolean;
}

export function ActivityRow({ item, visible }: ActivityRowProps) {
  const [open, setOpen] = useState(false);
  // The sheet mounts on first open only, not once per row in a long list
  const [mounted, setMounted] = useState(false);
  const isOutgoing = item.sats < 0;
  const mask = (v: string) => maskDigits(v, visible);
  const time = fmtActivityTime(item.timestamp);
  const status = item.statusDot ?? "green";

  const subtitle = item.detailLabel ? (
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
  );

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => {
          haptic.select();
          setMounted(true);
          setOpen(true);
        }}
        className="press active:bg-chip flex w-full items-center gap-3 rounded-xl border-0 bg-transparent py-2.5 pr-3 pl-3 text-left active:transform-none!"
      >
        <ActivityIcon item={item} />

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
          <span className="text-ink2 truncate text-[12px] leading-4">{subtitle}</span>
        </span>

        <span className="flex shrink-0 flex-col items-end gap-0.5">
          <Amount item={item} mask={mask} />
          {item.lkr > 0 && (
            <span className="text-ink2 text-right text-[12px] leading-4 whitespace-nowrap">
              {mask(`≈ ${fmtLkrCurrency(item.lkr)}`)}
            </span>
          )}
        </span>
      </button>

      {mounted && (
        <ActivitySheet
          item={item}
          open={open}
          onOpenChange={setOpen}
          mask={mask}
          subtitle={subtitle}
        />
      )}
    </>
  );
}

type Mask = (v: string) => string;

/** The signed sats, or struck through / "Pending" when nothing moved yet. */
function Amount({ item, mask, big }: { item: ActivityEntry; mask: Mask; big?: boolean }) {
  const isOutgoing = item.sats < 0;
  const size = big ? "text-[34px] leading-[1.15]" : "text-[14px] leading-4";
  if (item.notCredited) {
    // Never credited: no sign, struck through, so it can't pass for a reward
    return (
      <span className={cn("num text-ink3 font-bold whitespace-nowrap line-through", size)}>
        {mask(`${fmtSats(Math.abs(item.sats))} sats`)}
      </span>
    );
  }
  if (item.sats === 0) {
    // Paid but not priced yet (sats are worked out when the payment lands): not "+0 sats"
    return (
      <span className={cn("text-ink3 font-bold whitespace-nowrap", size)}>
        {item.settlement?.status ?? "Pending"}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "num font-bold whitespace-nowrap",
        size,
        isOutgoing ? "text-loss" : "text-gain"
      )}
    >
      {mask(`${isOutgoing ? "−" : "+"}${fmtSats(Math.abs(item.sats))} sats`)}
    </span>
  );
}

/** A transaction's details: what moved, then the facts, like the result screens. */
function ActivitySheet({
  item,
  open,
  onOpenChange,
  mask,
  subtitle,
}: {
  item: ActivityEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mask: Mask;
  subtitle: React.ReactNode;
}) {
  const { settlement } = item;
  const isOutgoing = item.sats < 0;
  const status = item.statusDot ?? "green";

  const rows: { k: React.ReactNode; v: React.ReactNode }[] = [
    { k: "Status", v: <span className={STATUS_TEXT[status]}>{settlement.status}</span> },
    { k: "Date", v: format(new Date(settlement.settledOn), "d MMM yyyy, h:mm a") },
    {
      k: `BTC ${isOutgoing ? "sent" : "received"}`,
      v: mask(`${formatSatoshis(settlement.btcSats)} BTC`),
    },
  ];
  if (settlement.feeLkr !== undefined) {
    rows.push({
      k: "Fee",
      v: settlement.feeLkr > 0 ? mask(fmtLkrExact(settlement.feeLkr)) : "No fee",
    });
  } else if (settlement.feeSats !== undefined) {
    rows.push({ k: "Network fee", v: mask(`${fmtSats(settlement.feeSats)} sats`) });
  }
  if (settlement.btcPriceLkr !== undefined && settlement.btcPriceLkr > 0) {
    rows.push({
      k: "BTC price",
      v: `${LKR_SYMBOL} ${fmtPriceCompact(settlement.btcPriceLkr)}${
        settlement.btcPriceUsd !== undefined
          ? ` · USD ${settlement.btcPriceUsd.toLocaleString("en-US")}`
          : ""
      }`,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={ACTIVITY_TITLE[item.type]}>
      <div className="flex flex-col gap-4 px-4 pb-2">
        <div className="flex flex-col items-center gap-1 pt-1 text-center">
          <ActivityIcon item={item} size={56} />
          <span className="mt-2">
            <Amount item={item} mask={mask} big />
          </span>
          {item.lkr > 0 && (
            <span className="text-ink2 num text-[14px] font-semibold">
              {mask(`≈ ${fmtLkrCurrency(item.lkr)}`)}
            </span>
          )}
          <span className="text-ink2 text-[13px] leading-4">{subtitle}</span>
        </div>

        <KeyValueList rows={rows} />

        {settlement.memo && (
          <div className="bg-chip rounded-xl px-3.5 py-3">
            <p className="text-ink2 text-[12px] leading-4">Memo</p>
            <p className="mt-1 text-[14px] leading-5 font-semibold break-words whitespace-pre-wrap">
              {settlement.memo}
            </p>
          </div>
        )}

        <div className="bg-chip flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5">
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-ink2 text-[12px] leading-4">Transaction ID</span>
            <span className="num truncate text-[13px] font-semibold">
              {settlement.transactionId}
            </span>
          </span>
          <CopyButton value={settlement.transactionId} label="transaction ID" />
        </div>
      </div>
    </Sheet>
  );
}
