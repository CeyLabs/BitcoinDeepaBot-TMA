export interface User {
  id: string
  username: string
  isExisting: boolean
  subscription?: Subscription
  wallet?: Wallet
  rewards?: UserRewards
}

export interface UserRewards {
  totalEarned: number
  withdrawable: number
  referralCount: number
  storyShares: number
  referralEarnings: number
  storyEarnings: number
}

export interface Referral {
  id: string
  username: string
  joinDate: string
  earnings: number
  isActive: boolean
}

export interface Subscription {
  id: string
  planName: string
  planType: "weekly" | "monthly"
  price: number
  currency: string
  startDate: string
  endDate: string
  isActive: boolean
  packageId?: string
  userId?: string
  payhereSubId?: string
}

export interface Transaction {
  id: string
  type: "subscription" | "wallet" | "gift" | "reward" | "referral"
  amount: number
  currency: string
  date: string
  description: string
  status: "completed" | "pending" | "cancelled"
  recipient?: string
  duration?: string
}

export interface ApiTransaction {
  payhere_pay_id: string
  payhere_sub_id?: string
  status: "SUCCESS" | "PENDING" | "CANCELLED" | "FAILED" | "CHARGEBACK"
  btc_price_at_purchase?: number
  satoshis_purchased?: number
  price_currency?: string
  coingecko_timestamp?: string
  created_at: string
  updated_at: string
}

export interface Wallet {
  balance: number
  balanceUSD: number
  change24h: number
  changePercent: number
  assets: CryptoAsset[]
}

export interface CryptoAsset {
  symbol: string
  name: string
  balance: number
  balanceUSD: number
  price: number
  change24h: number
  changePercent: number
  icon: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  type: "weekly" | "monthly"
  amount: number
  currency: string
  features: string[]
  popular?: boolean
}

export interface UserExistsResponse {
  registered: boolean
  error?: string
}
