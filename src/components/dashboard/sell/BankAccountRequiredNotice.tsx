"use client";

import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BankAccount } from "@/hooks/query/useBankAccounts";
import { haptic } from "@/platform";

/** Selling needs a verified bank account: explains what's missing. */
export function BankAccountRequiredNotice({ account }: { account: BankAccount | null }) {
  const router = useRouter();
  const inReview = account?.status === "PENDING_REVIEW";

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-10 text-center shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] dark:bg-[#0B0F14] dark:shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)]">
      <Landmark size={44} className="text-hint" />
      <div className="flex flex-col gap-1">
        <p className="text-[16px] font-bold text-[#1b2027] dark:text-white">
          {inReview ? "Bank account in review" : "Add a bank account"}
        </p>
        <p className="dark:text-muted-foreground text-sm font-normal text-[#64748b]">
          {inReview
            ? "We're checking your bank statement. You can sell once it's verified, usually within a few hours."
            : account?.status === "REJECTED"
              ? "Your last bank account couldn't be verified. Add another one to receive LKR."
              : "Add the bank account you want to receive LKR in. We verify it before the first payout."}
        </p>
      </div>
      {!inReview && (
        <Button
          className="mt-1 rounded-full"
          onClick={() => {
            haptic.impact("medium");
            router.push("/dashboard/profile");
          }}
        >
          Add bank account
        </Button>
      )}
    </div>
  );
}
