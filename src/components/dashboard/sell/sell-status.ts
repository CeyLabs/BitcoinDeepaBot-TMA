import type { SellStatus } from "@/hooks/query/useSell";

export const SELL_STATUS_BADGE: Record<
  SellStatus,
  { label: string; variant: "active" | "pending" | "negative" | "secondary" }
> = {
  QUOTED: { label: "Quoted", variant: "secondary" },
  EXPIRED: { label: "Expired", variant: "secondary" },
  SATS_COLLECTED: { label: "Processing", variant: "pending" },
  PAYOUT_PENDING: { label: "Processing", variant: "pending" },
  COMPLETED: { label: "Paid", variant: "active" },
  REFUNDED: { label: "Refunded", variant: "negative" },
  NEEDS_REVIEW: { label: "Checking", variant: "pending" },
};
