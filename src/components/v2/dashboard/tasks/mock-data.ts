import type { Task } from "@/lib/types";

// Placeholder data until a real /api/tasks endpoint and reward-tracking store exist.

export const MOCK_TASKS: Task[] = [
  {
    id: "task-setup-wallet",
    title: "Setup your Wallet",
    description: "Receive and store your bitcoin securely",
    rewardSats: 100,
    frequency: "one_time",
    icon: "👛",
    iconBg: "#FDECD1",
  },
  {
    id: "task-join-community",
    title: "Join the Community",
    description: "Stay update and connect with members",
    rewardSats: 200,
    frequency: "one_time",
    icon: "💬",
    iconBg: "#DCE7F5",
  },
  {
    id: "task-share-story",
    title: "Share your Story",
    description: "Inspire others with your bitcoin journey",
    rewardSats: 50,
    frequency: "daily",
    icon: "✍️",
    iconBg: "#FBE4D8",
  },
  {
    id: "task-send-gift-plan",
    title: "Send a gift plan to a friend",
    description: "Send a subscription to grow together",
    rewardSats: 100,
    frequency: "daily",
    icon: "🎁",
    iconBg: "#DCEAF7",
  },
];

export const MOCK_TASK_STATS = {
  completedTotal: 100,
  todayCompleted: 2,
  todayTotal: 5,
  totalEarnedSats: 10000,
  todayEarningsSats: 200,
};

export const MOCK_REFERRAL_PROGRESS = {
  joined: 2,
  target: 5,
  rewardSats: 1000,
};
