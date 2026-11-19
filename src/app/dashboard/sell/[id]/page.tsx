"use client";

import { use, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Bone, BoneCard } from "@/components/ui/bone";
import { useSellOrder, type SellOrder } from "@/hooks/query/useSell";
import { celebrate } from "@/lib/celebrate";
import { fmtActivityDateTime, fmtLkrExact, fmtSats } from "@/lib/formatters";

const STATE: Record<
  SellOrder["status"],
  { title: string; text: (o: SellOrder) => string; emoji?: string; spinner?: boolean }
> = {
  // Shown while a confirm the app lost track of may still be running; it
  // ends as sold, or expires (nothing sold) within about a minute.
  QUOTED: {
    title: "Checking your sale",
    text: () => "We're checking whether this sale went through. This takes up to a minute.",
    spinner: true,
  },
  EXPIRED: {
    title: "Quote expired",
    text: (o) => o.failureReason ?? "Nothing was sold. Get a new quote to sell.",
  },
  COLLECTING: {
    title: "Selling your sats",
    text: () => "Taking the sats from your wallet. This only takes a moment.",
    spinner: true,
  },
  SATS_COLLECTED: {
    title: "Sending LKR to your bank",
    text: () => "Your sats are sold. The bank transfer is on its way.",
    spinner: true,
  },
  PAYOUT_PENDING: {
    title: "Sending LKR to your bank",
    text: () => "Your sats are sold. The bank transfer is on its way.",
    spinner: true,
  },
  COMPLETED: {
    title: "LKR sent",
    text: (o) => `${fmtLkrExact(o.amountLkr)} was sent to your bank account.`,
    emoji: "/emoji/animated/party-popper.webp",
  },
  REFUNDING: {
    title: "Returning your sats",
    text: (o) =>
      `We couldn't send the LKR to your bank, so we're returning your ${fmtSats(o.sats)} sats to your wallet.`,
    spinner: true,
  },
  REFUNDED: {
    title: "Sale cancelled",
    text: (o) =>
      `We couldn't send the LKR to your bank, so your ${fmtSats(o.sats)} sats were returned to your wallet.`,
  },
  NEEDS_REVIEW: {
    title: "We're checking this sale",
    text: () =>
      "Something took longer than expected. Our team is checking it and will contact you. Please don't sell again for now.",
  },
};

// The sats left the wallet for good only in these states
const SOLD_STATUSES: SellOrder["status"][] = ["SATS_COLLECTED", "PAYOUT_PENDING", "COMPLETED"];

// Nothing was sold (quote expired) or everything was returned: no fee taken
const NO_FEE_STATUSES: SellOrder["status"][] = ["EXPIRED", "REFUNDED"];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-[14px]">
      <span className="text-[#64748b] dark:text-[#94a3b8]">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default function SellOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: order, isLoading, isError, error } = useSellOrder(id);

  // Confetti once, when the payout lands while this page is open or on arrival
  const celebrated = useRef(false);
  useEffect(() => {
    if (order?.status === "COMPLETED" && !celebrated.current) {
      celebrated.current = true;
      void celebrate();
    }
  }, [order?.status]);

  const back = () => router.push("/dashboard/sell");

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-5">
        <BackButton onBack={back} />
        <div className="flex flex-col items-center gap-2">
          <Bone className="size-16 rounded-full" />
          <Bone className="h-6 w-48" />
        </div>
        <BoneCard className="h-40" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex w-full flex-col gap-5">
        <BackButton onBack={back} />
        <p className="text-center text-sm text-[#f13131]">
          Couldn&apos;t load this sale{error instanceof Error ? `: ${error.message}` : ""}
        </p>
      </div>
    );
  }

  const state = STATE[order.status];

  return (
    <div className="flex w-full flex-col gap-5">
      <BackButton onBack={back} />

      <div className="flex flex-col items-center gap-2 pt-2 text-center">
        {state.spinner ? (
          <Loader2 size={56} className="text-primary animate-spin" />
        ) : state.emoji ? (
          <Image src={state.emoji} alt="" width={72} height={72} unoptimized />
        ) : null}
        <h1 className="text-[22px] leading-7 font-bold text-[#1b2027] dark:text-white">
          {state.title}
        </h1>
        <p className="max-w-sm text-[14px] text-[#64748b] dark:text-[#94a3b8]">
          {state.text(order)}
        </p>
      </div>

      <div className="bg-card flex flex-col gap-3 rounded-2xl p-5">
        <Row label="Amount" value={fmtLkrExact(order.amountLkr)} />
        <Row
          label={SOLD_STATUSES.includes(order.status) ? "Sats sold" : "Sats"}
          value={`${fmtSats(order.sats)} sats`}
        />
        <Row label="Value" value={fmtLkrExact(order.grossLkr)} />
        {!NO_FEE_STATUSES.includes(order.status) && (
          <Row label="Fee" value={`− ${fmtLkrExact(order.feeLkr)}`} />
        )}
        <Row label="Rate" value={`1 BTC = ${fmtLkrExact(order.btcLkrRate)}`} />
        {order.bankRef && <Row label="Bank reference" value={order.bankRef} />}
        <Row label="Date" value={fmtActivityDateTime(order.createdAt)} />
        <Row label="Reference" value={order.id.slice(0, 8).toUpperCase()} />
      </div>

      <Button size="lg" className="w-full rounded-[12px]" onClick={() => router.push("/dashboard")}>
        Back to wallet
      </Button>
    </div>
  );
}
