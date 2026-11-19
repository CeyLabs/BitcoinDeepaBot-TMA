"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Bone } from "@/components/ui/bone";
import { Button } from "@/components/ui/button";
import { List, ListRow, Section } from "@/components/ui/section";
import { useToast } from "@/components/ui/toast";
import { AddBankAccountSheet } from "@/components/dashboard/profile/AddBankAccountSheet";
import { BANK_STATUS_BADGE } from "@/components/dashboard/profile/bank-status";
import { useBankAccounts, useRemoveBankAccount } from "@/hooks/query/useBankAccounts";
import { useKycStatus } from "@/hooks/query/useKyc";
import { FetchyError } from "@/lib/fetchy";
import { haptic } from "@/platform";
import { Icon } from "./icons";

const NOTE = {
  PENDING_REVIEW:
    "We check your statement against your ID before paying out. This usually takes a few hours.",
  VERIFIED: "Rupees from selling sats are sent to this account.",
} as const;

/** How long the "Remove" confirm stays armed before it falls back to the bin icon. */
const ARM_MS = 4000;

/** Where LKR goes when the member sells: the current bank account, its review status, add/remove. */
export function PayoutAccountSection() {
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [armed, setArmed] = useState(false);
  const { data: kyc, isLoading: kycLoading } = useKycStatus();
  const { current, isLoading } = useBankAccounts();
  const remove = useRemoveBankAccount();

  const kycApproved = kyc?.status === "APPROVED";

  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => setArmed(false), ARM_MS);
    return () => window.clearTimeout(t);
  }, [armed]);

  const openAdd = () => {
    haptic.impact("medium");
    setAdding(true);
  };

  const onRemove = async () => {
    if (!current) return;
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
    } finally {
      setArmed(false);
    }
  };

  const addRow = (title: string, subtitle: string) => (
    <ListRow
      onClick={openAdd}
      icon={<Icon name="plus" className="text-link" />}
      title={<span className="text-link">{title}</span>}
      subtitle={subtitle}
    />
  );

  let rows: React.ReactNode;
  let note: React.ReactNode = null;

  if (isLoading || kycLoading) {
    rows = (
      <div className="flex min-h-14 items-center gap-3 px-3.5 py-3">
        <Bone className="size-9 rounded-[10px]" />
        <div className="flex flex-col gap-2">
          <Bone className="h-3.5 w-32" />
          <Bone className="h-3 w-44" />
        </div>
      </div>
    );
  } else if (!kycApproved) {
    rows = (
      <ListRow
        className="opacity-70"
        icon={<Icon name="bank" className="text-ink2" />}
        title="Bank account"
        subtitle="Verify your identity first"
      />
    );
    note = "Once you're verified, add the bank account you want to get paid to.";
  } else if (!current) {
    rows = addRow("Add bank account", "Get LKR when you sell sats");
  } else {
    const badge = BANK_STATUS_BADGE[current.status];
    const canRemove = current.status !== "REJECTED";
    rows = (
      <>
        <ListRow
          icon={<Icon name="bank" className="text-ink2" />}
          title={
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">{current.bankName}</span>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </span>
          }
          subtitle={`${current.accountNumber} · ${current.accountName}`}
          after={
            canRemove &&
            (armed ? (
              <Button
                variant="destructive"
                size="sm"
                className="mr-1"
                loading={remove.isPending}
                aria-label={`Confirm removing ${current.bankName} ${current.accountNumber}`}
                onClick={() => void onRemove()}
              >
                Remove
              </Button>
            ) : (
              <button
                type="button"
                aria-label={`Remove ${current.bankName} ${current.accountNumber}`}
                onClick={() => {
                  haptic.impact("light");
                  setArmed(true);
                }}
                className="press text-ink3 flex size-11 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent"
              >
                <Icon name="trash" />
              </button>
            ))
          }
        />
        {current.status === "REJECTED" && addRow("Add another account", "Upload a new statement")}
      </>
    );
    note =
      current.status === "REJECTED" ? (
        <span className="text-loss">
          {current.rejectionReason || "This account couldn't be verified against your identity."}
        </span>
      ) : (
        NOTE[current.status]
      );
  }

  return (
    <>
      <Section title="Payout account">
        <div className="flex flex-col gap-2">
          <List>{rows}</List>
          {note && <p className="text-ink3 text-[12px] leading-4">{note}</p>}
        </div>
      </Section>
      <AddBankAccountSheet open={adding} onOpenChange={setAdding} />
    </>
  );
}
