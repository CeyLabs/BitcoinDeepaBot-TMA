"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/title";
import { useBuyOrder, type BuyOrder } from "@/hooks/query/useBuy";
import { celebrate } from "@/lib/celebrate";
import { fmtLkrExact, fmtSats } from "@/lib/formatters";
import { queryKeys } from "@/lib/query-keys";

function stateOf(order: BuyOrder | undefined, cancelled: boolean) {
  if (!order) {
    return { title: "Checking your payment", text: "One moment…", spinner: true };
  }
  const amount = fmtLkrExact(order.amount_lkr);
  switch (order.status) {
    case "AWAITING_PAYMENT":
      return cancelled
        ? {
            title: "Payment Cancelled",
            text: `Your ${amount} buy was not completed. You can try again anytime.`,
            emoji: "/emoji/animated/cross-mark.webp",
          }
        : {
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
    default:
      return {
        title: "Payment failed",
        text: `Your ${amount} payment didn't go through. Nothing was charged.`,
        emoji: "/emoji/animated/cross-mark.webp",
      };
  }
}

/**
 * Return screen for a one-time buy (PayHere success/cancel). Polls the order
 * until the sats are sent, then refreshes the wallet.
 */
export function BuyOrderStatus({ orderId, cancelled }: { orderId: string; cancelled: boolean }) {
  const queryClient = useQueryClient();
  const { data: order } = useBuyOrder(orderId);
  const state = stateOf(order, cancelled);
  const done = order?.status === "SUCCESS" && order.settled;
  const celebrated = useRef(false);

  useEffect(() => {
    if (!done || celebrated.current) return;
    celebrated.current = true;
    void celebrate();
    void queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary });
    void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    void queryClient.invalidateQueries({ queryKey: ["bot-transactions"] });
  }, [done, queryClient]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center dark:bg-[#1b2027]">
      {state.spinner ? (
        <Loader2 size={64} className="text-primary animate-spin" />
      ) : (
        <Image src={state.emoji!} alt="" width={96} height={96} unoptimized />
      )}

      <Title className="mt-3 max-w-sm leading-snug">{state.title}</Title>

      <p className="text-muted-foreground mt-2 max-w-sm text-[15px] dark:text-[#64748b]">
        {state.text}
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link href="/dashboard" className="block w-full">
          <Button size="lg" className="w-full rounded-[12px]">
            Go to Dashboard
          </Button>
        </Link>
        {!state.spinner && !done && (
          <Link href="/dashboard/buy" className="text-primary text-[15px] font-semibold">
            Buy again
          </Link>
        )}
      </div>
    </main>
  );
}
