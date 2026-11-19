"use client";

import { Badge, BadgeDot } from "@/components/ui/badge";
import { Emoji } from "@/components/ui/emoji";
import { List, ListRow } from "@/components/ui/section";
import type { BankAccount } from "@/hooks/query/useBankAccounts";

/** Copy for the "selling needs a verified bank account" step. */
export function bankRequiredCopy(account: BankAccount | null) {
  const inReview = account?.status === "PENDING_REVIEW";
  return {
    inReview,
    title: inReview ? "Bank account in review" : "Add a bank account",
    text: inReview
      ? "We're checking your bank statement. You can sell once it's verified, usually within a few hours."
      : account?.status === "REJECTED"
        ? "Your last bank account couldn't be verified. Add another one to receive LKR."
        : "Add the bank account you want to receive LKR in. We verify it before the first payout.",
  };
}

/**
 * Selling needs a verified bank account: explains what's missing. The action
 * (open settings to add one) is the caller's footer button.
 */
export function BankAccountRequiredNotice({ account }: { account: BankAccount | null }) {
  const copy = bankRequiredCopy(account);

  return (
    <div className="flex flex-col gap-4">
      <div className="stagger flex flex-col items-center gap-2 px-5 text-center">
        <Emoji src="/emoji/wallet.webp" size={100} />
        <h2 className="text-[24px] leading-7">{copy.title}</h2>
        <p className="text-ink2 text-[14px]">{copy.text}</p>
      </div>
      {account && account.status !== "REJECTED" && (
        <List>
          <ListRow
            icon={<Emoji src="/emoji/wallet.webp" size={26} />}
            title={account.bankName}
            subtitle={`${account.accountName} · ${account.accountNumber}`}
            after={
              copy.inReview ? (
                <Badge variant="pending">
                  <BadgeDot />
                  In review
                </Badge>
              ) : undefined
            }
          />
        </List>
      )}
    </div>
  );
}
