import type { BankAccount } from "@/hooks/query/useBankAccounts";

/** Copy for the "selling needs a verified bank account" notice on the Sell amount screen. */
export function bankRequiredCopy(account: BankAccount | null) {
  const inReview = account?.status === "PENDING_REVIEW";
  return {
    inReview,
    title: inReview ? "Bank account in review" : "Add a bank account",
    short: inReview
      ? "You can sell once it's verified, usually within a few hours."
      : account?.status === "REJECTED"
        ? "Your last one couldn't be verified. Add another to receive LKR."
        : "Where your LKR goes. We verify it before the first payout.",
  };
}
