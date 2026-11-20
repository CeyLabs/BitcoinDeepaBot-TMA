"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BuyOrderStatus } from "@/components/dashboard/buy/BuyOrderStatus";
import { BigEmoji, StatusScreen } from "@/components/auth/StatusScreen";
import { buttonVariants } from "@/components/ui/button";

function PlanPaymentCancelled() {
  return (
    <StatusScreen
      art={<BigEmoji src="/emoji/animated/cross-mark.webp" />}
      title="Payment cancelled"
      actions={
        <>
          <Link href="/dashboard/plans/choose" className={buttonVariants()}>
            Back to plans
          </Link>
          <Link href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
            Go to wallet
          </Link>
        </>
      }
    >
      Your payment wasn&apos;t completed. You can try again anytime from the plans page.
    </StatusScreen>
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
