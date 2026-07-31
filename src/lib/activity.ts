import type { ActivityItem, ActivityType } from "@/lib/types";
import type { DcaTransaction } from "@/hooks/query/useTransactionHistory";
import { fmtActivityTime } from "@/lib/formatters";

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
];

export function getActivityCategory(type: ActivityType): ActivityCategory {
  if (type === "tasks_reward") return "tasks";
  if (type === "membership_reward") return "plans";
  if (TRANSACTION_TYPES.includes(type)) return "transactions";
  return "all";
}

// A successful DCA purchase credits the user with sats as their membership
// reward for that period — maps 1:1 onto the "membership_reward" activity type.
export function mapDcaTransactionToActivityItem(tx: DcaTransaction): ActivityItem {
  return {
    id: tx.id,
    type: "membership_reward",
    detailLabel: tx.package_name ? `${tx.package_name} Plan` : "Destributed",
    timestamp: tx.created_at,
    sats: tx.satoshis_purchased,
    lkr: tx.package_amount,
    statusDot: tx.settled ? "green" : "orange",
    settlement: {
      status: tx.settled ? "Settled" : "Pending",
      settledOn: tx.created_at,
      btcSats: tx.satoshis_purchased,
      btcPriceLkr: tx.btc_price_at_purchase,
      transactionId: tx.id,
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
