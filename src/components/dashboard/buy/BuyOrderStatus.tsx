"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import { PushHeader } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { KeyValueList } from "@/components/ui/section";
import { ResultHero, Timeline, type TimelineState } from "@/components/dashboard/trade/parts";
import { isBuyOrderId, isUnpaidAndExpired, useBuyOrder, type BuyOrder } from "@/hooks/query/useBuy";
import { FetchyError } from "@/lib/fetchy";
import { useSession } from "@/hooks/useSession";
import { celebrate } from "@/lib/celebrate";
import { fmtActivityDateTime, fmtLkrExact, fmtSats } from "@/lib/formatters";
import { queryKeys } from "@/lib/query-keys";

function stateOf(order: BuyOrder | undefined, cancelled: boolean) {
  if (!order) {
    return { title: "Checking your payment", text: "One moment…", spinner: true };
  }
  const amount = fmtLkrExact(order.amount_lkr);
  switch (order.status) {
    case "AWAITING_PAYMENT":
      if (cancelled) {
        return {
          title: "Payment Cancelled",
          text: `Your ${amount} buy was not completed. You can try again anytime.`,
          emoji: "/emoji/animated/cross-mark.webp",
        };
      }
      if (isUnpaidAndExpired(order)) {
        return {
          title: "No payment received",
          text: `We didn't receive a payment for this ${amount} checkout. If you did pay, it will show in Activity once confirmed.`,
          emoji: "/emoji/animated/cross-mark.webp",
        };
      }
      return {
        title: "Waiting for PayHere",
        text: `We're waiting for PayHere to confirm your ${amount} payment. This usually takes a few seconds.`,
        spinner: true,
      };
    case "PENDING":
      return {
        title: "Payment pending",
        text: `PayHere is still processing your ${amount} payment.`,
        spinner: true,
      };
    case "SUCCESS":
      if (order.held && !order.settled) {
        return {
          title: "Payment under review",
          text: `We received your ${amount} payment and our team is checking it before sending your sats. This usually takes a few hours. You can leave this page.`,
          spinner: true,
        };
      }
      return order.settled
        ? {
            title: "Bitcoin received",
            text: `${fmtSats(order.satoshis ?? 0)} sats were added to your wallet.`,
            emoji: "/emoji/animated/party-popper.webp",
          }
        : {
            title: "Payment received",
            text: order.satoshis
              ? `Sending ${fmtSats(order.satoshis)} sats to your wallet…`
              : "Sending your sats to your wallet…",
            spinner: true,
          };
    case "CHARGEBACK":
      return {
        title: "Payment reversed",
        text: "This payment was reversed by your bank. Contact support if this is unexpected.",
        emoji: "/emoji/animated/cross-mark.webp",
      };
    case "FAILED":
      return {
        title: "Payment failed",
        text: `Your ${amount} payment didn't go through. Nothing was charged.`,
        emoji: "/emoji/animated/cross-mark.webp",
      };
    case "CANCELLED":
      return {
        title: "Payment cancelled",
        text: `Your ${amount} payment was cancelled. Nothing was charged.`,
        emoji: "/emoji/animated/cross-mark.webp",
      };
    default:
      // A status this screen doesn't know: don't claim anything about money
      return {
        title: "Payment status unknown",
        text: "We couldn't confirm this payment. Check Activity or contact support.",
        emoji: "/emoji/animated/exclamation-mark.webp",
      };
  }
}

// Shown on every "we don't know yet" screen: paying again buys twice
const DONT_PAY_AGAIN =
  "If you paid, it will show in Activity once confirmed. Please don't pay again.";
// After this long, "a few seconds" is no longer true
const SLOW_AFTER_MS = 60_000;

function useSlow(active: boolean) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [active]);
  return active && slow;
}

/**
 * Return screen for a one-time buy (PayHere success/cancel). Polls the order
 * until the sats are sent, then refreshes the wallet. Never spins forever:
 * a failed lookup, a missing session or a slow confirmation each get their
 * own message.
 */
export function BuyOrderStatus({
  orderId,
  cancelled,
  embedded = false,
}: {
  orderId: string;
  cancelled: boolean;
  /** Inside the dashboard shell (a pushed page) instead of a full screen. */
  embedded?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status: session } = useSession();
  const validId = isBuyOrderId(orderId);
  const {
    data: order,
    error,
    isError,
    refetch,
    isFetching,
  } = useBuyOrder(validId ? orderId : null);
  const done = order?.status === "SUCCESS" && order.settled;
  // Spinner states: PayHere hasn't confirmed yet, or it has and the sats
  // are being sent. Each gets its own message once it takes a while.
  const confirming =
    order?.status === "PENDING" ||
    (!cancelled && order?.status === "AWAITING_PAYMENT" && !isUnpaidAndExpired(order));
  const sending = order?.status === "SUCCESS" && !order.settled && !order.held;
  const slow = useSlow(confirming || sending);
  const notFound = error instanceof FetchyError && error.status === 404;
  const celebrated = useRef(false);

  useEffect(() => {
    if (!done || celebrated.current) return;
    celebrated.current = true;
    void celebrate();
    void queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary });
    void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    void queryClient.invalidateQueries({ queryKey: ["bot-transactions"] });
  }, [done, queryClient]);

  let state: { title: string; text: string; emoji?: string; spinner?: boolean };
  let retry = false;
  if (!validId || (notFound && !order)) {
    state = {
      title: "Purchase not found",
      text: `We couldn't find this purchase. ${DONT_PAY_AGAIN}`,
      emoji: "/emoji/animated/exclamation-mark.webp",
    };
  } else if (session === "unauthenticated") {
    state = {
      title: "Sign in to see your purchase",
      text: `Your session ended while you were paying. Sign in again to see this purchase. ${DONT_PAY_AGAIN}`,
      emoji: "/emoji/animated/exclamation-mark.webp",
    };
  } else if (isError && !order) {
    state = {
      title: "Couldn't load your purchase",
      text: `Check your connection and try again. ${DONT_PAY_AGAIN}`,
      emoji: "/emoji/animated/exclamation-mark.webp",
    };
    retry = true;
  } else {
    state = stateOf(order, cancelled);
    if (slow && confirming) {
      state = {
        ...state,
        title: "Still confirming your payment",
        text: `PayHere hasn't confirmed it yet. You can leave this page. ${DONT_PAY_AGAIN}`,
      };
    } else if (slow && sending) {
      state = {
        ...state,
        title: "Payment received",
        text: "Your sats are on the way. You can leave this page; they'll show in your wallet.",
      };
    }
  }

  const doneOrder = done ? order : undefined;
  const rows = order
    ? [
        { k: "Amount paid", v: fmtLkrExact(order.amount_lkr) },
        ...(order.satoshis
          ? [{ k: done ? "Sats added" : "Sats", v: `${fmtSats(order.satoshis)} sats` }]
          : []),
        { k: "Paid with", v: "PayHere" },
        { k: "Date", v: fmtActivityDateTime(order.created_at) },
        { k: "Reference", v: order.order_id.slice(0, 8).toUpperCase() },
      ]
    : [];
  const signedOut = session === "unauthenticated";

  const content = (
    <>
      {doneOrder ? (
        <ResultHero
          visual="party"
          big={`+${fmtSats(doneOrder.satoshis ?? 0)} sats`}
          text={`Bought for ${fmtLkrExact(doneOrder.amount_lkr)} and added to your wallet`}
        />
      ) : state.spinner ? (
        <>
          <div className="flex flex-col items-center gap-1 px-2 pt-2 text-center">
            <h2 className="text-[22px] leading-7">{state.title}</h2>
            <p className="text-ink2 text-[14px] leading-5 font-semibold">{state.text}</p>
          </div>
          <Timeline steps={buyTimeline(order)} />
        </>
      ) : (
        <ResultHero visual={{ emoji: state.emoji! }} title={state.title} text={state.text} />
      )}

      {rows.length > 0 && <KeyValueList rows={rows} />}

      <div className="mt-auto flex w-full flex-col gap-1 pt-2">
        {retry && (
          <Button variant="secondary" loading={isFetching} onClick={() => void refetch()}>
            Try again
          </Button>
        )}
        <Button onClick={() => router.push(signedOut ? "/" : "/dashboard")}>
          {signedOut ? "Sign in" : "Go to wallet"}
        </Button>
        {order && !state.spinner && !done && !order.held && order.status !== "CHARGEBACK" && (
          <Button variant="text" size="text" onClick={() => router.push("/dashboard/buy")}>
            Buy again
          </Button>
        )}
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="flex flex-1 flex-col gap-5">
        <PushHeader title="Purchase" onBack={() => router.push("/dashboard")} />
        {content}
      </div>
    );
  }

  return (
    <main
      className={cn(
        "bg-background text-foreground mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4",
        "pt-[calc(24px+env(safe-area-inset-top))] pb-[calc(24px+env(safe-area-inset-bottom))]"
      )}
    >
      <div className="flex flex-1 flex-col justify-center gap-5">{content}</div>
    </main>
  );
}

/**
 * Checkout → PayHere confirms → sats sent (or a person checks a held
 * payment first) → in the wallet.
 */
function buyTimeline(order: BuyOrder | undefined): { label: string; state: TimelineState }[] {
  const paid = order?.status === "SUCCESS";
  const settled = paid && order.settled;
  return [
    { label: "Checkout opened", state: "done" },
    { label: "Payment confirmed by PayHere", state: paid ? "done" : "active" },
    {
      label: order?.held ? "Checked by our team" : "Sending sats to your wallet",
      state: settled ? "done" : paid ? "active" : "todo",
    },
    { label: "Sats added to your wallet", state: settled ? "done" : "todo" },
  ];
}
