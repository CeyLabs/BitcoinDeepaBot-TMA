"use client";

import { useSearchParams } from "next/navigation";
import { BuyOrderStatus } from "@/components/dashboard/buy/BuyOrderStatus";
import { Suspense, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/title";
import { celebrate } from "@/lib/celebrate";

function PlanPaymentSuccess() {
  useEffect(() => {
    void celebrate();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center dark:bg-[#1b2027]">
      <Image
        src="/emoji/animated/party-popper.webp"
        alt="Success"
        width={96}
        height={96}
        unoptimized
      />

      <Title className="mt-3 max-w-sm leading-snug">Payment Successful</Title>

      <p className="text-muted-foreground mt-2 max-w-sm text-[15px] dark:text-[#64748b]">
        Your subscription is now active. Head back to the dashboard to start tracking your rewards.
      </p>

      <Link href="/dashboard" className="mt-8 block w-full max-w-xs">
        <Button size="lg" className="w-full rounded-[12px]">
          Go to Dashboard
        </Button>
      </Link>
    </main>
  );
}

/** One-time buys come back with ?buy_order=<id> (set by the backend). */
function Content() {
  const buyOrder = useSearchParams().get("buy_order");
  return buyOrder ? (
    <BuyOrderStatus orderId={buyOrder} cancelled={false} />
  ) : (
    <PlanPaymentSuccess />
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  );
}
