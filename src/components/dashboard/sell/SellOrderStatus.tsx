"use client";

import { useEffect, useRef } from "react";
import { KeyValueList } from "@/components/ui/section";
import { ResultHero, Timeline, type TimelineState } from "@/components/dashboard/trade/parts";
import type { SellOrder, SellStatus } from "@/hooks/query/useSell";
import { celebrate } from "@/lib/celebrate";
import { collectView, SellApproval } from "./SellApproval";
import { fmtActivityDateTime, fmtLkrExact, fmtSats } from "@/lib/formatters";

const CROSS = "/emoji/animated/cross-mark.webp";
const EXCLAMATION = "/emoji/animated/exclamation-mark.webp";

const STATE: Record<
  SellStatus,
  { title: string; text: (o: SellOrder) => string; emoji?: string; progress?: boolean }
> = {
  // Shown while a confirm the app lost track of may still be running; it
  // ends as sold, or expires (nothing sold) within about a minute.
  QUOTED: {
    title: "Checking your sale",
    text: () => "We're checking whether this sale went through. This takes up to a minute.",
    progress: true,
  },
  EXPIRED: {
    title: "Nothing sold",
    text: (o) => o.failureReason ?? "Nothing was sold. Get a new quote to sell.",
    emoji: CROSS,
  },
  COLLECTING: {
    title: "Selling your sats",
    text: () => "Taking the sats from your wallet. This only takes a moment.",
    progress: true,
  },
  SATS_COLLECTED: {
    title: "Sending LKR to your bank",
    text: () => "Your sats are sold. The bank transfer is on its way.",
    progress: true,
  },
  PAYOUT_PENDING: {
    title: "Sending LKR to your bank",
    text: () => "Your sats are sold. The bank transfer is on its way.",
    progress: true,
  },
  COMPLETED: {
    title: "LKR sent",
    text: (o) => `${fmtLkrExact(o.amountLkr)} was sent to your bank account.`,
  },
  REFUNDING: {
    title: "Returning your sats",
    text: (o) =>
      `We couldn't send the LKR to your bank, so we're returning your ${fmtSats(o.sats)} sats to your wallet.`,
    progress: true,
  },
  REFUNDED: {
    title: "Sale cancelled",
    text: (o) =>
      `We couldn't send the LKR to your bank, so your ${fmtSats(o.sats)} sats were returned to your wallet.`,
    emoji: CROSS,
  },
  NEEDS_REVIEW: {
    title: "We're checking this sale",
    text: () =>
      "Something took longer than expected. Our team is checking it and will contact you. Please don't sell again for now.",
    emoji: EXCLAMATION,
  },
};

// The sats left the wallet for good only in these states
const SOLD_STATUSES: SellStatus[] = ["SATS_COLLECTED", "PAYOUT_PENDING", "COMPLETED"];

// Nothing was sold (quote expired) or everything was returned: no fee taken
const NO_FEE_STATUSES: SellStatus[] = ["EXPIRED", "REFUNDED"];

function sellTimeline(order: SellOrder, bankLabel: string) {
  const { status } = order;
  const at = (i: number, active: number): TimelineState =>
    i < active ? "done" : i === active ? "active" : "todo";
  if (status === "REFUNDING") {
    return [
      { label: "Payment approved", state: "done" as const },
      { label: "Sats moved from your wallet", state: "done" as const },
      { label: `Couldn't send LKR to ${bankLabel}`, state: "done" as const },
      { label: "Returning sats to your wallet", state: "active" as const },
    ];
  }
  // While COLLECTING the user first approves the payment of the sats
  const collect = order.collect?.state;
  const approving =
    status === "QUOTED" ||
    (status === "COLLECTING" &&
      (!collect ||
        collect === "requesting" ||
        collect === "pending" ||
        collect === "awaiting_confirmation"));
  const active =
    status === "COMPLETED"
      ? 4
      : status === "SATS_COLLECTED" || status === "PAYOUT_PENDING"
        ? 3
        : approving
          ? 0
          : 1;
  return [
    { label: active > 0 ? "Payment approved" : "Approve the payment", state: at(0, active) },
    { label: "Sats moved from your wallet", state: at(1, active) },
    { label: "Sold at your locked rate", state: at(2, active) },
    { label: `LKR sent to ${bankLabel}`, state: at(3, active) },
  ];
}

export function sellOrderRows(order: SellOrder) {
  return [
    { k: "Amount", v: fmtLkrExact(order.amountLkr) },
    {
      k: SOLD_STATUSES.includes(order.status) ? "Sats sold" : "Sats",
      v: `${fmtSats(order.sats)} sats`,
    },
    { k: "Value", v: fmtLkrExact(order.grossLkr) },
    ...(NO_FEE_STATUSES.includes(order.status)
      ? []
      : [{ k: "Fee", v: `− ${fmtLkrExact(order.feeLkr)}` }]),
    { k: "Rate", v: `${fmtLkrExact(order.btcLkrRate)} / BTC` },
    ...(order.bankRef ? [{ k: "Bank reference", v: order.bankRef }] : []),
    { k: "Date", v: fmtActivityDateTime(order.createdAt) },
    { k: "Reference", v: order.id.slice(0, 8).toUpperCase() },
  ];
}

export const isSellInProgress = (status: SellStatus | undefined) =>
  !status || !!STATE[status]?.progress;

/**
 * A sale's status: a timeline while it moves, the success screen once the
 * LKR is sent (with confetti), or what went wrong. Then the order's details.
 */
export function SellOrderStatus({
  order,
  bankLabel = "your bank",
  showRows = true,
}: {
  order: SellOrder;
  bankLabel?: string;
  showRows?: boolean;
}) {
  // Confetti once, when the payout lands while this is open or on arrival
  const celebrated = useRef(false);
  useEffect(() => {
    if (order.status === "COMPLETED" && !celebrated.current) {
      celebrated.current = true;
      void celebrate();
    }
  }, [order.status]);

  const base = STATE[order.status] ?? {
    title: "Sale status unknown",
    text: () => "We couldn't confirm this sale. Check Activity or contact support.",
    emoji: EXCLAMATION,
  };
  // Replaced by the payment's own state while the user approves it
  const collecting = order.status === "COLLECTING" && !!order.collect;
  const view = collecting ? collectView(order) : null;
  const state = view ? { ...base, title: view.title, text: () => view.text } : base;

  return (
    <div className="flex flex-col gap-4">
      {order.status === "COMPLETED" ? (
        <ResultHero
          visual="party"
          big={fmtLkrExact(order.amountLkr)}
          text={`Sent to ${bankLabel}`}
        />
      ) : state.progress ? (
        <>
          <div className="flex flex-col items-center gap-1 px-2 text-center">
            <h2 className="text-[22px] leading-7">{state.title}</h2>
            <p className="text-ink2 text-[14px] leading-5 font-semibold">{state.text(order)}</p>
          </div>
          <Timeline steps={sellTimeline(order, bankLabel)} />
          {collecting && <SellApproval order={order} />}
        </>
      ) : (
        <ResultHero
          visual={state.emoji ? { emoji: state.emoji } : "check"}
          title={state.title}
          text={state.text(order)}
        />
      )}
      {showRows && <KeyValueList rows={sellOrderRows(order)} />}
    </div>
  );
}

/** Before the order loads (e.g. the confirm lost its answer): the first step running. */
export function SellOrderPending({ bankLabel = "your bank" }: { bankLabel?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-1 px-2 text-center">
        <h2 className="text-[22px] leading-7">{STATE.QUOTED.title}</h2>
        <p className="text-ink2 text-[14px] leading-5 font-semibold">One moment…</p>
      </div>
      <Timeline
        steps={[
          { label: "Approve the payment", state: "active" },
          { label: "Sats moved from your wallet", state: "todo" },
          { label: "Sold at your locked rate", state: "todo" },
          { label: `LKR sent to ${bankLabel}`, state: "todo" },
        ]}
      />
    </div>
  );
}
