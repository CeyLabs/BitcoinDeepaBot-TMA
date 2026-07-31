"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@telegram-apps/telegram-ui";

export function KycRequiredNotice() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-10 text-center shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] dark:bg-[#0B0F14] dark:shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)]">
      <Image src="/emoji/animated/id-card.webp" alt="" width={56} height={56} />

      <div className="flex flex-col gap-1">
        <p className="text-[16px] font-bold text-[#1b2027] dark:text-white">
          Verification Required
        </p>
        <p className="text-sm font-normal text-[#64748b] dark:text-muted-foreground">
          Complete identity verification to view and manage plans.
        </p>
      </div>

      <Button
        mode="filled"
        size="m"
        className="rounded-full! bg-[#fa7119]! mt-1"
        onClick={() => router.push("/verification")}
      >
        Complete Verification
      </Button>
    </div>
  );
}
