import type { Task } from "@/lib/types";

// Placeholder data until a real /api/tasks endpoint and reward-tracking store exist.

export const MOCK_TASKS: Task[] = [
  {
    id: "task-setup-wallet",
    title: "Setup your Wallet",
    description: "Receive and store your bitcoin securely",
    rewardSats: 100,
    frequency: "one_time",
    icon: "/emoji/wallet.webp",
  },
  {
    id: "task-join-community",
    title: "Join the Community",
    description: "Stay updated and connect with members",
    rewardSats: 200,
    frequency: "one_time",
    icon: "/emoji/community.webp",
  },
  {
    id: "task-share-story",
    title: "Share your Story",
    description: "Inspire others with your bitcoin journey",
    rewardSats: 50,
    frequency: "daily",
    icon: "/emoji/story.webp",
  },
  // {
  //   id: "task-send-gift-plan",
  //   title: "Send a gift plan to a friend",
  //   description: "Send a subscription to grow together",
  //   rewardSats: 100,
  //   frequency: "daily",
  //   icon: "/emoji/gift.webp",
  // },
];
