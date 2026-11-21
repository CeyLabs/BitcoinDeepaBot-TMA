"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { KeyValueList } from "@/components/ui/section";
import { ResultHero, Timeline, type TimelineState } from "@/components/dashboard/trade/parts";
import { useSecondsLeft } from "@/hooks/useSecondsLeft";
import { celebrate } from "@/lib/celebrate";
import { TELEGRAM_BOT_URL } from "@/lib/constants";
import { fmtActivityDateTime, fmtSats, LKR_SYMBOL } from "@/lib/formatters";
import { recipientLabel, type P2pTransfer } from "@/lib/p2p";
import { usePlatform } from "@/platform";

const CROSS = "/emoji/animated/cross-mark.webp";

type View =
  | { kind: "progress"; title: string; text: string; active: number }
  | { kind: "confirm"; title: string; text: string }
  | { kind: "done" }
  | { kind: "ended"; title: string; text: string };

function viewFor(t: P2pTransfer): View {
  switch (t.status) {
    case "completed":
      return { kind: "done" };
    case "awaiting_confirmation":
      return {
        kind: "confirm",
        title: "Confirm in the bot chat",
        text: "We sent you a message in the Bitcoin Deepa bot. Tap Confirm there to send this payment, or Cancel if you didn't start it.",
      };
    case "in_flight":
      return {
        kind: "progress",
        title: "Almost there",
        text: "The payment is on its way. It won't be sent twice.",
        active: 1,
      };
    case "failed":
      return { kind: "ended", title: "Payment failed", text: t.error ?? "Nothing was sent." };
    case "cancelled":
      return {
        kind: "ended",
        title: "Payment cancelled",
        text: t.error ?? "Cancelled in the bot chat. Nothing was sent.",
      };
    case "expired":
      return {
        kind: "ended",
        title: "Not confirmed in time",
        text: t.error ?? "It wasn't confirmed in the bot in time. Nothing was sent.",
      };
    default:
      // "processing", or a status the bot adds later: still going
      return {
        kind: "progress",
        title: "Sending",
        text: "Your payment is on its way. This only takes a moment.",
        active: 0,
      };
  }
}

export const isTransferInProgress = (t: P2pTransfer | undefined) => {
  const kind = t ? viewFor(t).kind : "progress";
  return kind === "progress" || kind === "confirm";
};

export function transferRows(t: P2pTransfer) {
  return [
    { k: "Amount", v: `${fmtSats(t.amount)} sats` },
    // The bot sends a bare number ("1,234.56"): add the currency.
    ...(t.amount_lkr ? [{ k: "Value", v: `≈ ${LKR_SYMBOL} ${t.amount_lkr}` }] : []),
    ...(t.to ? [{ k: "To", v: recipientLabel(t.to) }] : []),
    ...(t.memo ? [{ k: "Note", v: t.memo }] : []),
    { k: "Date", v: fmtActivityDateTime(t.created_at) },
    { k: "Reference", v: t.id.slice(0, 8).toUpperCase() },
  ];
}

/**
 * A send's status: a timeline while it moves, the bot-chat confirm with its
 * countdown, the success screen (confetti once), or why nothing was sent.
 */
export function SendTransferStatus({
  transfer,
  celebrateOnArrival = false,
}: {
  transfer: P2pTransfer;
  /** Also celebrate if it's already completed when first shown (the send flow, right after sending). */
  celebrateOnArrival?: boolean;
}) {
  const platform = usePlatform();
  const view = viewFor(transfer);
  const secondsLeft = useSecondsLeft(view.kind === "confirm" ? transfer.confirm_by : undefined);
  const to = recipientLabel(transfer.to);

  // Confetti once, when it completes while this is open, not when opening a
  // transfer that finished earlier.
  const celebrated = useRef(false);
  const firstStatus = useRef(transfer.status);
  useEffect(() => {
    if (transfer.status !== "completed" || celebrated.current) return;
    if (firstStatus.current === "completed" && !celebrateOnArrival) return;
    celebrated.current = true;
    void celebrate();
  }, [transfer.status, celebrateOnArrival]);

  const at = (i: number, active: number): TimelineState =>
    i < active ? "done" : i === active ? "active" : "todo";

  return (
    <div className="flex flex-col gap-4">
      {view.kind === "done" ? (
        <ResultHero
          visual="party"
          big={`${fmtSats(transfer.amount)} sats`}
          text={to ? `Sent to ${to}` : "Sent"}
        />
      ) : view.kind === "ended" ? (
        <ResultHero visual={{ emoji: CROSS }} title={view.title} text={view.text} />
      ) : (
        <>
          <div className="flex flex-col items-center gap-1 px-2 text-center">
            <h2 className="text-[22px] leading-7">{view.title}</h2>
            <p className="text-ink2 text-[14px] leading-5 font-semibold">{view.text}</p>
          </div>
          {view.kind === "confirm" ? (
            <div className="flex flex-col gap-2">
              {secondsLeft > 0 && (
                <p className="bg-chip text-ink2 num rounded-xl px-3.5 py-3 text-center text-[13px] font-semibold">
                  {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")} left to
                  confirm
                </p>
              )}
              <Button onClick={() => platform.openTelegramLink(TELEGRAM_BOT_URL)}>
                Open the bot chat
              </Button>
            </div>
          ) : (
            <Timeline
              steps={[
                { label: "Payment started", state: at(0, view.active) },
                { label: to ? `Delivered to ${to}` : "Delivered", state: at(1, view.active) },
              ]}
            />
          )}
        </>
      )}
      <KeyValueList rows={transferRows(transfer)} />
    </div>
  );
}
