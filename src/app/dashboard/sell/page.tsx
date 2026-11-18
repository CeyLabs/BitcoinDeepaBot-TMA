"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { PageTitle } from "@/components/ui/page-title";
import { KycRequiredNotice } from "@/components/dashboard/plans/KycRequiredNotice";
import { BankAccountRequiredNotice } from "@/components/dashboard/sell/BankAccountRequiredNotice";
import { RecentSales } from "@/components/dashboard/sell/RecentSales";
import { SellAmountForm } from "@/components/dashboard/sell/SellAmountForm";
import { SellQuoteCard } from "@/components/dashboard/sell/SellQuoteCard";
import { useBankAccounts } from "@/hooks/query/useBankAccounts";
import { useKycStatus } from "@/hooks/query/useKyc";
import type { SellOrder } from "@/hooks/query/useSell";
import { SellSkeleton } from "@/components/dashboard/sell/SellSkeleton";

export default function SellPage() {
  const router = useRouter();
  const [quote, setQuote] = useState<SellOrder | null>(null);
  const { data: kyc, isLoading: kycLoading } = useKycStatus();
  const { current, verified, isLoading: bankLoading } = useBankAccounts();

  const back = () => (quote ? setQuote(null) : router.push("/dashboard"));

  let content: React.ReactNode;
  if (kycLoading || bankLoading) {
    content = <SellSkeleton bare />;
  } else if (kyc?.status !== "APPROVED") {
    content = <KycRequiredNotice message="Complete identity verification to sell sats for LKR." />;
  } else if (!verified) {
    content = <BankAccountRequiredNotice account={current} />;
  } else if (quote) {
    content = (
      <SellQuoteCard
        quote={quote}
        account={verified}
        onBack={() => setQuote(null)}
        onConfirmed={(order) => router.push(`/dashboard/sell/${order.id}`)}
      />
    );
  } else {
    content = (
      <>
        <SellAmountForm account={verified} onQuoted={setQuote} />
        <RecentSales />
      </>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <BackButton onBack={back} />
      <PageTitle title="Sell sats" subtitle="Get LKR in your bank account" />
      {content}
    </div>
  );
}
