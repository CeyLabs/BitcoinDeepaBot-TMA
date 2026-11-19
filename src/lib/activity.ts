import type { ActivityItem, ActivityType, BotTransaction } from "@/lib/types";
import type { DcaTransaction } from "@/hooks/query/useTransactionHistory";
import type { SellOrder } from "@/hooks/query/useSell";
import { SELL_STATUS_BADGE } from "@/components/dashboard/sell/sell-status";

type StatusDot = NonNullable<ActivityItem["statusDot"]>;

// PayHere transaction statuses, mapped to a dot color and a display label.
const TRANSACTION_STATUS: Record<string, { dot: StatusDot; label: string }> = {
  SUCCESS: { dot: "green", label: "Settled" },
  PENDING: { dot: "orange", label: "Pending" },
  CANCELLED: { dot: "gray", label: "Cancelled" },
  FAILED: { dot: "red", label: "Failed" },
  CHARGEBACK: { dot: "red", label: "Chargeback" },
};

// Purchases whose sats were never credited (or were taken back): their amount
// must not read like a reward.
const NOT_CREDITED_STATUSES = new Set(["CANCELLED", "FAILED", "CHARGEBACK"]);

export const ACTIVITY_ICON: Record<ActivityType, string> = {
  sent: "/emoji/sent.webp",
  received: "/emoji/receive.webp",
  tipjar_sent: "/emoji/tipjar_sent.webp",
  tipjar_received: "/emoji/tipjar_Receive.webp",
  faucet_sent: "/emoji/faucet_sent.webp",
  faucet_received: "/emoji/faucet_received.webp",
  gift_sent: "/emoji/gift_sent.webp",
  gift_received: "/emoji/gift_receive.webp",
  tasks_reward: "/emoji/tasks_reward.webp",
  membership_reward: "/emoji/membership_reward.webp",
  bitcoin_purchase: "/emoji/bitcoin.webp",
  bitcoin_sale: "/emoji/coins.webp",
};

export const ACTIVITY_TITLE: Record<ActivityType, string> = {
  sent: "Sent",
  received: "Received",
  tipjar_sent: "Tipjar Sent",
  tipjar_received: "Tipjar Received",
  faucet_sent: "Faucet Sent",
  faucet_received: "Faucet Received",
  gift_sent: "Gift Sent",
  gift_received: "Gift Received",
  tasks_reward: "Tasks Reward",
  membership_reward: "Membership Reward",
  bitcoin_purchase: "Bitcoin Purchase",
  bitcoin_sale: "Bitcoin Sale",
};

/** An activity row plus display-only extras the shared ActivityItem type doesn't carry. */
export type ActivityEntry = ActivityItem & {
  settlement: ActivityItem["settlement"] & {
    /** LKR taken as fees (gross minus the amount that bought BTC); only when the backend sent it */
    feeLkr?: number;
  };
};

export type ActivityCategory = "all" | "transactions" | "tasks" | "plans";

const TRANSACTION_TYPES: ActivityType[] = [
  "sent",
  "received",
  "tipjar_sent",
  "tipjar_received",
  "faucet_sent",
  "faucet_received",
  "gift_sent",
  "gift_received",
  // One-time buys aren't part of a plan
  "bitcoin_purchase",
  "bitcoin_sale",
];

export function getActivityCategory(type: ActivityType): ActivityCategory {
  if (type === "tasks_reward") return "tasks";
  if (type === "membership_reward") return "plans";
  if (TRANSACTION_TYPES.includes(type)) return "transactions";
  return "all";
}

// Each purchase attempt — successful, pending, cancelled, failed, or charged
// back — maps 1:1 onto an activity: "membership_reward" for plan charges,
// "bitcoin_purchase" for one-time buys.
export function mapDcaTransactionToActivityItem(tx: DcaTransaction): ActivityEntry {
  const status = tx.status.toUpperCase();
  const isProcessingSuccess = status === "SUCCESS" && !tx.settled;
  const { dot, label } = isProcessingSuccess
    ? { dot: "orange" as const, label: "Processing" }
    : (TRANSACTION_STATUS[status] ?? { dot: "gray" as const, label: tx.status });

  return {
    id: tx.id,
    type: tx.kind === "ONE_TIME" ? "bitcoin_purchase" : "membership_reward",
    detailLabel:
      tx.kind === "ONE_TIME"
        ? "One-time Buy"
        : tx.package_name
          ? `${tx.package_name} Plan`
          : "Destributed",
    timestamp: tx.created_at,
    sats: tx.satoshis_purchased,
    lkr: tx.gross_amount,
    statusDot: dot,
    notCredited: NOT_CREDITED_STATUSES.has(status),
    settlement: {
      status: label,
      settledOn: tx.created_at,
      btcSats: tx.satoshis_purchased,
      btcPriceLkr: tx.btc_price_at_purchase,
      // net_amount is 0 on older rows: no fee shown rather than a wrong one
      feeLkr:
        tx.net_amount > 0 && tx.gross_amount >= tx.net_amount
          ? tx.gross_amount - tx.net_amount
          : undefined,
      transactionId: tx.id,
    },
  };
}

const SELL_BADGE_DOT: Record<
  (typeof SELL_STATUS_BADGE)[keyof typeof SELL_STATUS_BADGE]["variant"],
  StatusDot
> = {
  active: "green",
  pending: "orange",
  negative: "red",
  soft: "gray",
};

// A sale from the member's history: sats out of the wallet, LKR to their
// bank. A refunded sale's sats came back (that transfer is listed on its own),
// so it reads as not taken.
export function mapSellOrderToActivityItem(order: SellOrder): ActivityItem {
  const { label, variant } = SELL_STATUS_BADGE[order.status] ?? {
    label: order.status,
    variant: "soft" as const,
  };
  return {
    id: `sell-${order.id}`,
    type: "bitcoin_sale",
    detailLabel: "Sold to bank",
    timestamp: order.createdAt,
    sats: -order.sats,
    lkr: order.amountLkr,
    statusDot: SELL_BADGE_DOT[variant],
    notCredited: order.status === "REFUNDED",
    settlement: {
      status: label,
      settledOn: order.completedAt ?? order.createdAt,
      btcSats: order.sats,
      btcPriceLkr: order.btcLkrRate,
      transactionId: order.id,
    },
  };
}

// A bot-relayed sats transfer to/from another Telegram user maps onto the
// "sent"/"received" activity type based on `direction`.
// The bot API's amount_lkr is typed as a formatted string ("1,234.50") but
// may arrive as a number or null — handle all three instead of throwing.
function parseLkr(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return Number(value.replace(/,/g, "")) || 0;
}

export function mapBotTransactionToActivityItem(tx: BotTransaction): ActivityEntry {
  const isOutgoing = tx.direction === "outgoing";
  // Our @username when they have one, else the Telegram username the bot sends
  const counterpartyRaw = tx.counterparty_username ?? (isOutgoing ? tx.to_user : tx.from_user);
  const counterparty =
    counterpartyRaw?.replace(/^@/, "") ?? String(isOutgoing ? tx.to_id : tx.from_id);
  const lkr = parseLkr(tx.amount_lkr);

  return {
    id: String(tx.id),
    type: isOutgoing ? "sent" : "received",
    counterparty,
    timestamp: tx.time,
    sats: isOutgoing ? -tx.amount : tx.amount,
    lkr,
    statusDot: tx.success ? "green" : "red",
    settlement: {
      status: tx.success ? "Completed" : "Failed",
      settledOn: tx.time,
      btcSats: tx.amount,
      memo: tx.memo,
      transactionId: String(tx.id),
    },
  };
}
