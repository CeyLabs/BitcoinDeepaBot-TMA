"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Bone } from "@/components/ui/bone";
import { Button } from "@/components/ui/button";
import { Cell } from "@/components/ui/cell";
import { useToast } from "@/components/ui/toast";
import { useKycStatus } from "@/hooks/query/useKyc";
import { useBankAccounts, useRemoveBankAccount } from "@/hooks/query/useBankAccounts";
import { FetchyError } from "@/lib/fetchy";
import { haptic, usePlatform } from "@/platform";
import { AddBankAccountSheet } from "./AddBankAccountSheet";
import { BANK_STATUS_BADGE } from "./bank-status";
import { Section } from "./Section";

const NOTE: Record<string, string> = {
  PENDING_REVIEW:
    "We check your statement against your ID before paying out. This usually takes a few hours.",
  VERIFIED: "Money from selling sats is sent to this account.",
};

export function BankAccountCard() {
  const router = useRouter();
  const platform = usePlatform();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const { data: kyc, isLoading: kycLoading } = useKycStatus();
  const { current, isLoading } = useBankAccounts();
  const remove = useRemoveBankAccount();

  const kycApproved = kyc?.status === "APPROVED";

  const onRemove = async () => {
    if (!current) return;
    const confirmed = await platform.confirm({
      title: "Remove bank account",
      message: `${current.bankName} ${current.accountNumber} will be removed. You can add an account again later.`,
      confirmText: "Remove",
      cancelText: "Keep",
      destructive: true,
    });
    if (!confirmed) return;
    haptic.impact("rigid");
    try {
      await remove.mutateAsync(current.id);
      haptic.notify("success");
      toast({ type: "success", title: "Bank account removed" });
    } catch (err) {
      haptic.notify("error");
      toast({
        type: "error",
        title: "Couldn't remove the account",
        description:
          err instanceof FetchyError && err.status === 409
            ? "A sale to this account is still in progress."
            : err instanceof Error
              ? err.message
              : undefined,
      });
    }
  };

  const addButton = (label: string) => (
    <Button
      className="rounded-full"
      onClick={() => {
        haptic.impact("medium");
        setAdding(true);
      }}
    >
      {label}
    </Button>
  );

  let body: React.ReactNode;
  if (isLoading || kycLoading) {
    body = (
      <div className="flex flex-col gap-3 p-5">
        <Bone className="h-4 w-44" />
        <Bone className="h-4 w-28" />
      </div>
    );
  } else if (!kycApproved) {
    body = (
      <div className="flex flex-col items-center gap-3 px-6 py-6 text-center">
        <p className="text-[14px] text-[#64748b] dark:text-[#94a3b8]">
          Verify your identity first, then add the bank account you want to get paid to.
        </p>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => {
            haptic.impact("light");
            router.push("/verification");
          }}
        >
          Verify identity
        </Button>
      </div>
    );
  } else if (!current) {
    body = (
      <div className="flex flex-col items-center gap-3 px-6 py-6 text-center">
        <Landmark size={28} className="text-hint" />
        <p className="text-[14px] text-[#64748b] dark:text-[#94a3b8]">
          Add a bank account to receive LKR when you sell sats.
        </p>
        {addButton("Add bank account")}
      </div>
    );
  } else {
    const badge = BANK_STATUS_BADGE[current.status];
    body = (
      <>
        <Cell
          before={<Landmark size={22} className="text-hint" />}
          subtitle={`${current.accountNumber} · ${current.accountName}`}
          after={<Badge variant={badge.variant}>{badge.label}</Badge>}
        >
          {current.bankName}
        </Cell>
        <div className="flex flex-col gap-3 px-6 py-4">
          {current.status === "REJECTED" ? (
            <>
              <p className="text-[14px] text-[#f13131]">
                {current.rejectionReason ||
                  "This account couldn't be verified against your identity."}
              </p>
              <div>{addButton("Add another account")}</div>
            </>
          ) : (
            <p className="text-[14px] text-[#64748b] dark:text-[#94a3b8]">{NOTE[current.status]}</p>
          )}
          {current.status !== "REJECTED" && (
            <button
              type="button"
              className="self-start text-[14px] font-semibold text-[#f13131] disabled:opacity-50"
              disabled={remove.isPending}
              onClick={() => void onRemove()}
            >
              Remove account
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Section title="Bank account">{body}</Section>
      <AddBankAccountSheet open={adding} onOpenChange={setAdding} />
    </>
  );
}
