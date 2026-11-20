"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PushHeader } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Bone, BoneCard } from "@/components/ui/bone";
import { SendTransferStatus } from "@/components/dashboard/send/SendTransferStatus";
import { ResultHero } from "@/components/dashboard/trade/parts";
import { useP2pTransfer } from "@/hooks/query/useP2p";

/** A sent payment's status (deep link, "Track this payment"). */
export default function SendStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: transfer, isLoading, isError, error } = useP2pTransfer(id);
  const back = () => router.push("/dashboard");

  return (
    <div className="flex flex-col gap-5">
      <PushHeader title="Payment" onBack={back} />
      {isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <Bone className="size-16 rounded-full" />
          <Bone className="h-6 w-48" />
          <BoneCard className="h-40 w-full" />
        </div>
      ) : isError || !transfer ? (
        <ResultHero
          visual={{ emoji: "/emoji/animated/exclamation-mark.webp" }}
          title="Couldn't load this payment"
          text={error instanceof Error ? error.message : "Try again in a moment."}
        />
      ) : (
        <SendTransferStatus transfer={transfer} />
      )}
      <Button onClick={back}>Back to wallet</Button>
    </div>
  );
}
