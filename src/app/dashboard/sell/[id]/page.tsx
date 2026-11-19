"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PushHeader } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Bone, BoneCard } from "@/components/ui/bone";
import { SellOrderStatus } from "@/components/dashboard/sell/SellOrderStatus";
import { useSellOrder } from "@/hooks/query/useSell";

export default function SellOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: order, isLoading, isError, error } = useSellOrder(id);

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <>
        <div className="flex flex-col items-center gap-2 pt-2">
          <Bone className="h-7 w-48" />
          <Bone className="h-4 w-64" />
        </div>
        <BoneCard className="bg-chip h-[150px]" />
        <BoneCard className="bg-chip h-[260px]" />
      </>
    );
  } else if (isError || !order) {
    content = (
      <p
        role="alert"
        className="bg-loss-bg text-loss rounded-xl px-3.5 py-3 text-center text-sm font-semibold"
      >
        Couldn&apos;t load this sale{error instanceof Error ? `: ${error.message}` : ""}
      </p>
    );
  } else {
    content = <SellOrderStatus order={order} />;
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <PushHeader title="Sale" onBack={() => router.push("/dashboard/sell")} />
      {content}
      <div className="mt-auto pt-2">
        <Button onClick={() => router.push("/dashboard")}>Back to wallet</Button>
      </div>
    </div>
  );
}
