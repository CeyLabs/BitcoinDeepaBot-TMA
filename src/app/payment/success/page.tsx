"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BuyOrderStatus } from "@/components/dashboard/buy/BuyOrderStatus";
import { StatusScreen, SuccessCheck } from "@/components/auth/StatusScreen";
import { buttonVariants } from "@/components/ui/button";
import { celebrate } from "@/lib/celebrate";
import { haptic } from "@/platform";

function PlanPaymentSuccess() {
  useEffect(() => {
    haptic.notify("success");
    void celebrate();
  }, []);

  return (
    <StatusScreen
      art={<SuccessCheck />}
      title="Payment successful"
      actions={
        <Link href="/dashboard" className={buttonVariants()}>
          Go to my wallet
        </Link>
      }
    >
      Your plan is now active. Head back to your wallet to track your rewards.
    </StatusScreen>
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
