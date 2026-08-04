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

export interface Transaction {
  id: string;
  type: "subscription" | "wallet" | "gift" | "reward" | "referral";
  amount: number;
  currency: string;
  date: string;
  description: string;
  status: "completed" | "pending" | "cancelled";
  recipient?: string;
  duration?: string;
}

export interface ApiTransaction {
  payhere_pay_id: string;
  payhere_sub_id?: string;
  status: "SUCCESS" | "PENDING" | "CANCELLED" | "FAILED" | "CHARGEBACK";
  btc_price_at_purchase?: number;
  satoshis_purchased?: number;
  package_amount?: number;
  coingecko_timestamp?: string;
  created_at: string;
  updated_at: string;
  settled?: boolean;
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
  | "membership_reward";

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
  settlement: {
    status: string;
    settledOn: string;
    btcSats: number;
    btcPriceUsd?: number;
    btcPriceLkr: number;
    transactionId: string;
  };
}

export interface Wallet {
  balance: number;
  balanceUSD: number;
  change24h: number;
  changePercent: number;
  assets: CryptoAsset[];
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

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: "weekly" | "monthly";
  amount: number;
  currency: string;
  features: string[];
  popular?: boolean;
}

export interface UserExistsResponse {
  registered: boolean;
  error?: string;
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
    spent: number;
    avg_btc_price: number;
  };
  total_balance: number;
  total_lkr: string;
  currency: string;
  "24_hr_change": number;
  current_btc_price?: {
    usd: number;
    lkr: number;
  };
}
