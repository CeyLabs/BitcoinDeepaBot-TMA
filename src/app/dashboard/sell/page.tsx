"use client";

import { useRouter } from "next/navigation";
import { PushHeader } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Emoji } from "@/components/ui/emoji";
import { useSheets } from "@/components/dashboard/sheets";
import { RecentSales } from "@/components/dashboard/sell/RecentSales";
import { haptic } from "@/platform";

/** Sell: start a sale (the Sell sheet) and see recent sales. */
export default function SellPage() {
  const router = useRouter();
  const { openTrade } = useSheets();

  return (
    <div className="flex flex-col gap-5">
      <PushHeader title="Sell sats" onBack={() => router.push("/dashboard")} />
      <Card className="flex flex-col items-center gap-2 px-5 py-6 text-center">
        <Emoji src="/emoji/sent.webp" size={72} priority />
        <h2 className="text-[22px] leading-7">Sell sats for LKR</h2>
        <p className="text-ink2 text-[14px] leading-5">
          Get a locked rate, then the rupees go to your verified bank account.
        </p>
        <Button
          className="mt-2"
          onClick={() => {
            haptic.impact("light");
            openTrade("sell");
          }}
        >
          Sell sats
        </Button>
      </Card>
      <RecentSales />
    </div>
  );
}
