import type { ActivityItem, ActivityType } from "@/lib/types";
import { fmtActivityTime } from "@/lib/formatters";

export const ACTIVITY_ICON: Record<ActivityType, string> = {
    sent: "/emoji/sent.svg",
    received: "/emoji/receive.svg",
    tipjar_sent: "/emoji/tipjar_sent.svg",
    tipjar_received: "/emoji/tipjar_Receive.svg",
    faucet_sent: "/emoji/faucet_sent.svg",
    faucet_received: "/emoji/faucet_received.svg",
    gift_sent: "/emoji/gift_sent.svg",
    gift_received: "/emoji/gift_receive.svg",
    tasks_reward: "/emoji/tasks_reward.svg",
    membership_reward: "/emoji/membership_reward.svg",
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

export function getActivitySubtitle(item: ActivityItem): string {
    const time = fmtActivityTime(item.timestamp);

    if (item.detailLabel) return `${item.detailLabel} at ${time}`;
    if (item.counterparty) {
        const isOutgoing = item.sats < 0;
        return `${isOutgoing ? "To" : "From"} @${item.counterparty} at ${time}`;
    }
    return time;
}
