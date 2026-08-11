import type { ActivityItem, ActivityType } from "@/lib/types";
import type { DcaTransaction, BotTransaction } from "@/hooks/query/useTransactionHistory";
import { fmtActivityTime } from "@/lib/formatters";

type StatusDot = NonNullable<ActivityItem["statusDot"]>;

// PayHere transaction statuses, mapped to a dot color and a display label.
const TRANSACTION_STATUS: Record<string, { dot: StatusDot; label: string }> = {
  SUCCESS: { dot: "green", label: "Settled" },
  PENDING: { dot: "orange", label: "Pending" },
  CANCELLED: { dot: "gray", label: "Cancelled" },
  FAILED: { dot: "red", label: "Failed" },
  CHARGEBACK: { dot: "red", label: "Chargeback" },
};

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
};

export type ActivityCategory = "all" | "transactions" | "plans";

const TRANSACTION_TYPES: ActivityType[] = [
  "sent",
  "received",
  "tipjar_sent",
  "tipjar_received",
  "faucet_sent",
  "faucet_received",
  "gift_sent",
  "gift_received",
];

export function getActivityCategory(type: ActivityType): ActivityCategory {
  if (type === "membership_reward") return "plans";
  if (TRANSACTION_TYPES.includes(type)) return "transactions";
  return "all";
}

// Each DCA purchase attempt — successful, pending, cancelled, failed, or
// charged back — maps 1:1 onto the "membership_reward" activity type.
export function mapDcaTransactionToActivityItem(tx: DcaTransaction): ActivityItem {
  const status = tx.status.toUpperCase();
  const isProcessingSuccess = status === "SUCCESS" && !tx.settled;
  const { dot, label } = isProcessingSuccess
    ? { dot: "orange" as const, label: "Processing" }
    : (TRANSACTION_STATUS[status] ?? { dot: "gray" as const, label: tx.status });

  return {
    id: tx.id,
    type: "membership_reward",
    detailLabel: tx.package_name ? `${tx.package_name} Plan` : "Destributed",
    timestamp: tx.created_at,
    sats: tx.satoshis_purchased,
    lkr: tx.gross_amount,
    statusDot: dot,
    settlement: {
      status: label,
      settledOn: tx.created_at,
      btcSats: tx.satoshis_purchased,
      btcPriceLkr: tx.btc_price_at_purchase,
      transactionId: tx.id,
    },
  };
}

// A bot-relayed sats transfer to/from another Telegram user maps onto the
// "sent"/"received" activity type based on `direction`.
function parseLkr(value: string): number {
  return Number(value.replace(/,/g, "")) || 0;
}

export function mapBotTransactionToActivityItem(tx: BotTransaction): ActivityItem {
  const isOutgoing = tx.direction === "outgoing";
  const counterpartyRaw = isOutgoing ? tx.to_user : tx.from_user;
  const counterparty = counterpartyRaw?.replace(/^@/, "") ?? String(isOutgoing ? tx.to_id : tx.from_id);
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

export function getActivitySubtitle(item: ActivityItem): string {
  const time = fmtActivityTime(item.timestamp);

  if (item.detailLabel) return `${item.detailLabel} at ${time}`;
  if (item.counterparty) {
    const isOutgoing = item.sats < 0;
    return `${isOutgoing ? "To" : "From"} @${item.counterparty} at ${time}`;
  }
  return time;
}
