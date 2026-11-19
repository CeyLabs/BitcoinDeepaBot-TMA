"use client";

import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { PageTitle } from "@/components/ui/page-title";
import { KycRequiredNotice } from "@/components/dashboard/plans/KycRequiredNotice";
import { BuyAmountForm } from "@/components/dashboard/buy/BuyAmountForm";
import { SellSkeleton } from "@/components/dashboard/sell/SellSkeleton";
import { useKycStatus } from "@/hooks/query/useKyc";

export default function BuyPage() {
  const router = useRouter();
  const { data: kyc, isLoading: kycLoading } = useKycStatus();

  let content: React.ReactNode;
  if (kycLoading) {
    content = <SellSkeleton bare />;
  } else if (kyc?.status !== "APPROVED") {
    content = <KycRequiredNotice message="Complete identity verification to buy bitcoin." />;
  } else {
    content = <BuyAmountForm />;
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <BackButton onBack={() => router.push("/dashboard")} />
      <PageTitle title="Buy bitcoin" subtitle="A one-time buy, paid with PayHere" />
      {content}
    </div>
  );
}
