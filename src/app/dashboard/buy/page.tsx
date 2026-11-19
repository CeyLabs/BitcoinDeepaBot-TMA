"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PushHeader } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Emoji } from "@/components/ui/emoji";
import { useSheets } from "@/components/dashboard/sheets";
import { BuyOrderStatus } from "@/components/dashboard/buy/BuyOrderStatus";
import { fmtFeePercent } from "@/components/dashboard/trade/useBuyFlow";
import { useBuyPrice } from "@/hooks/query/useBuy";
import { fmtLkrCurrency } from "@/lib/formatters";
import { haptic } from "@/platform";

/**
 * /dashboard/buy opens the Buy sheet (deep links, "Buy again").
 * /dashboard/buy?buy_order=<id> shows that purchase's status in the shell.
 */
function BuyContent() {
  const params = useSearchParams();
  const orderId = params.get("buy_order");
  if (orderId) {
    return (
      <BuyOrderStatus orderId={orderId} cancelled={params.get("cancelled") === "1"} embedded />
    );
  }
  return <BuyStart />;
}

function BuyStart() {
  const router = useRouter();
  const { openTrade } = useSheets();
  const { data: price } = useBuyPrice();

  // Arriving here means "I want to buy": open the sheet once
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    openTrade("buy");
  }, [openTrade]);

  return (
    <div className="flex flex-col gap-5">
      <PushHeader title="Buy bitcoin" onBack={() => router.push("/dashboard")} />
      <Card className="flex flex-col items-center gap-2 px-5 py-6 text-center">
        <Emoji src="/emoji/coins.webp" size={72} priority />
        <h2 className="text-[22px] leading-7">Buy bitcoin</h2>
        <p className="text-ink2 text-[14px] leading-5">
          A one-time buy, paid with PayHere. Your sats go straight to your Bitcoin Deepa wallet.
        </p>
        {price && (
          <p className="text-ink3 num text-[12px] font-semibold">
            1 BTC ≈ {fmtLkrCurrency(price.btcLkrPrice)} ·{" "}
            {fmtFeePercent(price.paymentProcessorFeeBasisPoints + price.bitcoindeepaFeeBasisPoints)}{" "}
            fee
          </p>
        )}
        <Button
          className="mt-2"
          onClick={() => {
            haptic.impact("light");
            openTrade("buy");
          }}
        >
          Buy bitcoin
        </Button>
      </Card>
    </div>
  );
}

export default function BuyPage() {
  return (
    <Suspense>
      <BuyContent />
    </Suspense>
  );
}
