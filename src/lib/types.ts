export interface User {
  id: string;
  username: string;
  isExisting: boolean;
  subscription?: Subscription;
  wallet?: Wallet;
  rewards?: UserRewards;
  kycStatus?:
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "APPROVED"
    | "DECLINED"
    | "KYC_EXPIRED"
    | "IN_REVIEW"
    | "EXPIRED"
    | "ABANDONED";
}

export interface UserRewards {
  totalEarned: number;
  withdrawable: number;
  referralCount: number;
  storyShares: number;
  referralEarnings: number;
  storyEarnings: number;
}

export interface Referral {
  id: string;
  username: string;
  joinDate: string;
  earnings: number;
  isActive: boolean;
}

export type TaskFrequency = "daily" | "one_time";

export interface Task {
  id: string;
  title: string;
  description: string;
  rewardSats: number;
  frequency: TaskFrequency;
  icon: string;
}

export interface Subscription {
  id: string;
  planName: string;
  planType: "weekly" | "monthly";
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  packageId?: string;
  userId?: string;
  payhereSubId?: string;
}

export type ActivityType =
  | "sent"
  | "received"
  | "tipjar_sent"
  | "tipjar_received"
  | "faucet_sent"
  | "faucet_received"
  | "gift_sent"
  | "gift_received"
  | "tasks_reward"
  | "membership_reward"
  | "bitcoin_purchase";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  /** Username (without "@") for sent/received/tipjar/faucet/gift subtitles */
  counterparty?: string;
  /** Action/plan label for tasks/membership reward subtitles, e.g. "Share story", "Shrimp plan" */
  detailLabel?: string;
  timestamp: string;
  /** Signed sats: negative = outgoing, positive = incoming */
  sats: number;
  /** Absolute approx LKR value shown as "≈ LKR x" */
  lkr: number;
  statusDot?: "green" | "orange" | "red" | "gray";
  /** Set when the sats never reached (or left) the wallet: a failed, cancelled or charged-back purchase */
  notCredited?: boolean;
  settlement: {
    status: string;
    settledOn: string;
    btcSats: number;
    btcPriceUsd?: number;
    /** Omit when there's no real price for this transaction (e.g. bot transfers) — show `memo` instead */
    btcPriceLkr?: number;
    /** Transfer note from the sender, shown in place of the price panel when there's no real price */
    memo?: string;
    transactionId: string;
  };
}

export interface CryptoAsset {
  symbol: string;
  name: string;
  balance: number;
  balanceUSD: number;
  price: number;
  change24h: number;
  changePercent: number;
  icon: string;
}

export interface Wallet {
  balance: number;
  balanceUSD: number;
  change24h: number;
  changePercent: number;
  assets: CryptoAsset[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: "weekly" | "monthly";
  amount: number;
  currency: string;
  features: string[];
  popular?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  category: string;
  readTimeMinutes: number;
  publishedAt: string;
  link: string;
  content: string;
  featured?: boolean;
}

export interface DCSummary {
  dca: {
    balance: number;
    /** LKR that went into BTC, excluding fees */
    spent: number;
    /** Payment processor + platform fees on those purchases (older backends omit it) */
    fees?: number;
    avg_btc_price: number;
  };
  total_balance: number;
  total_lkr: string;
  /** False when the backend couldn't reach the BitcoinDeepa wallet: total_* are 0, not real. Missing on older backends. */
  balance_available?: boolean;
  currency: string;
  "24_hr_change": number;
  current_btc_price?: {
    usd: number;
    lkr: number;
  };
}

// Sats sent/received to other Telegram users via the bot (BitcoinDeepa API).
export interface BotTransaction {
  id: number;
  time: string;
  direction: "incoming" | "outgoing";
  from_id: number;
  to_id: number;
  from_user?: string;
  to_user?: string;
  type: string;
  amount: number;
  amount_lkr: string | number | null;
  memo?: string;
  success: boolean;
}
