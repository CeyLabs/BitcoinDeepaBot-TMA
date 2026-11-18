import type { BankAccountStatus } from "@/hooks/query/useBankAccounts";

export const BANK_STATUS_BADGE: Record<
  BankAccountStatus,
  { label: string; variant: "active" | "pending" | "negative" }
> = {
  VERIFIED: { label: "Verified", variant: "active" },
  PENDING_REVIEW: { label: "In review", variant: "pending" },
  REJECTED: { label: "Rejected", variant: "negative" },
};
