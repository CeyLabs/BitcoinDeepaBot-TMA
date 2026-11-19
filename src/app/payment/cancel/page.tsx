"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BuyOrderStatus } from "@/components/dashboard/buy/BuyOrderStatus";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/title";

function PlanPaymentCancelled() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center dark:bg-[#1b2027]">
      <Image
        src="/emoji/animated/cross-mark.webp"
        alt="Cancelled"
        width={96}
        height={96}
        unoptimized
      />

      <Title className="mt-3 max-w-sm leading-snug">Payment Cancelled</Title>

      <p className="text-muted-foreground mt-2 max-w-sm text-[15px] dark:text-[#64748b]">
        Your payment was not completed. You can try again anytime from the plans page.
      </p>

      <Link href="/plans/choose" className="mt-8 block w-full max-w-xs">
        <Button size="lg" className="w-full rounded-[12px]">
          Back to Plans
        </Button>
      </Link>
    </main>
  );
}

/** One-time buys come back with ?buy_order=<id> (set by the backend). */
function Content() {
  const buyOrder = useSearchParams().get("buy_order");
  return buyOrder ? <BuyOrderStatus orderId={buyOrder} cancelled /> : <PlanPaymentCancelled />;
}

export default function PaymentCancelPage() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  );
}
