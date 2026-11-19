"use client";

import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Bone, BoneCard } from "@/components/ui/bone";
import { useP2pTransfer } from "@/hooks/query/useP2p";
import { celebrate } from "@/lib/celebrate";
import { TELEGRAM_BOT_URL } from "@/lib/constants";
import { fmtActivityDateTime, fmtSats } from "@/lib/formatters";
import { recipientLabel, type P2pTransfer } from "@/lib/p2p";
import { usePlatform } from "@/platform";

const STATE: Record<
  P2pTransfer["status"],
  { title: string; text: (t: P2pTransfer) => string; emoji?: string; spinner?: boolean }
> = {
  processing: {
    title: "Sending",
    text: () => "Your payment is on its way. This only takes a moment.",
    spinner: true,
  },
  awaiting_confirmation: {
    title: "Confirm in the bot",
    text: () =>
      "We sent you a message in the Bitcoin Deepa bot. Tap Confirm there to send this payment, or Cancel if you didn't start it.",
    spinner: true,
  },
  in_flight: {
    title: "Almost there",
    text: () => "The payment is on its way. You won't be charged twice.",
    spinner: true,
  },
  completed: {
    title: "Sats sent",
    text: (t) => `${fmtSats(t.amount)} sats were sent to ${recipientLabel(t.to)}.`,
    emoji: "/emoji/animated/party-popper.webp",
  },
  failed: {
    title: "Payment failed",
    text: (t) => t.error ?? "Nothing was sent.",
  },
  cancelled: {
    title: "Payment cancelled",
    text: (t) => t.error ?? "Cancelled in the bot chat. Nothing was sent.",
  },
  expired: {
    title: "Not confirmed in time",
    text: (t) => t.error ?? "It wasn't confirmed in the bot in time. Nothing was sent.",
  },
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-[14px]">
      <span className="text-[#64748b] dark:text-[#94a3b8]">{label}</span>
      <span className="text-right font-medium break-all">{value}</span>
    </div>
  );
}

/** "9:41 left" until the confirm deadline */
function useTimeLeft(until: string | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [until]);
  if (!until) return null;
  const seconds = Math.max(0, Math.ceil((new Date(until).getTime() - now) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function SendStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const platform = usePlatform();
  const { data: transfer, isLoading, isError, error } = useP2pTransfer(id);
  const timeLeft = useTimeLeft(
    transfer?.status === "awaiting_confirmation" ? transfer.confirm_by : undefined
  );

  // Confetti once, when it completes while this page is open or on arrival
  const celebrated = useRef(false);
  useEffect(() => {
    if (transfer?.status === "completed" && !celebrated.current) {
      celebrated.current = true;
      void celebrate();
    }
  }, [transfer?.status]);

  const back = () => router.push("/dashboard");

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-5">
        <BackButton onBack={back} />
        <div className="flex flex-col items-center gap-2">
          <Bone className="size-16 rounded-full" />
          <Bone className="h-6 w-48" />
        </div>
        <BoneCard className="h-32" />
      </div>
    );
  }

  if (isError || !transfer) {
    return (
      <div className="flex w-full flex-col gap-5">
        <BackButton onBack={back} />
        <p className="text-center text-sm text-[#f13131]">
          Couldn&apos;t load this payment{error instanceof Error ? `: ${error.message}` : ""}
        </p>
      </div>
    );
  }

  const state = STATE[transfer.status];

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
          {state.text(transfer)}
        </p>
        {timeLeft && (
          <p className="text-[13px] font-semibold text-[#64748b] dark:text-[#94a3b8]">
            {timeLeft} left to confirm
          </p>
        )}
      </div>

      {transfer.status === "awaiting_confirmation" && (
        <Button
          variant="secondary"
          className="w-full rounded-[12px]"
          onClick={() => platform.openTelegramLink(TELEGRAM_BOT_URL)}
        >
          Open the bot
        </Button>
      )}

      <div className="bg-card flex flex-col gap-3 rounded-2xl p-5">
        <Row label="Amount" value={`${fmtSats(transfer.amount)} sats`} />
        {transfer.amount_lkr && <Row label="Value" value={transfer.amount_lkr} />}
        {transfer.to && <Row label="To" value={recipientLabel(transfer.to)} />}
        {transfer.memo && <Row label="Note" value={transfer.memo} />}
        <Row label="Date" value={fmtActivityDateTime(transfer.created_at)} />
        <Row label="Reference" value={transfer.id} />
      </div>

      <Button size="lg" className="w-full rounded-[12px]" onClick={back}>
        Back to wallet
      </Button>
    </div>
  );
}
