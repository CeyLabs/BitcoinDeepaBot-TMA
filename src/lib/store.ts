import { create } from "zustand"
import type { User, Subscription, Transaction, Wallet, UserRewards, Referral } from "./types"

export type Store = {
  count: number
  setCount: (count: number) => void
  userID: string
  setUserID: (userID: string) => void
  user: User | null
  setUser: (user: User | null) => void
  isExistingUser: boolean
  setIsExistingUser: (isExisting: boolean) => void
  // Authentication state
  authToken: string | null
  setAuthToken: (token: string | null) => void
  isRegistering: boolean
  setIsRegistering: (isRegistering: boolean) => void
  subscription: Subscription | null
  setSubscription: (subscription: Subscription | null) => void
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  wallet: Wallet
  setWallet: (wallet: Wallet) => void
  rewards: UserRewards
  setRewards: (rewards: UserRewards) => void
  addReward: (amount: number, type: "referral" | "story") => void
  referrals: Referral[]
  setReferrals: (referrals: Referral[]) => void
  addReferral: (referral: Referral) => void
}

const initialRewards: UserRewards = {
  totalEarned: 0,
  withdrawable: 0,
  referralCount: 0,
  storyShares: 0,
  referralEarnings: 0,
  storyEarnings: 0,
}

const initialWallet: Wallet = {
  balance: 0,
  balanceUSD: 0,
  change24h: 0,
  changePercent: 0,
  assets: [],
}

export const useStore = create<Store>((set, get) => ({
  count: 0,
  setCount: (count: number) => set({ count }),
  userID: "",
  setUserID: (userID: string) => set({ userID }),
  user: null,
  setUser: (user: User | null) => set({ user }),
  isExistingUser: false,
  setIsExistingUser: (isExisting: boolean) => set({ isExistingUser: isExisting }),
  // Authentication state
  authToken: null,
  setAuthToken: (token: string | null) => set({ authToken: token }),
  isRegistering: false,
  setIsRegistering: (isRegistering: boolean) => set({ isRegistering }),
  subscription: null,
  setSubscription: (subscription: Subscription | null) => set({ subscription }),
  transactions: [],
  setTransactions: (transactions: Transaction[]) => set({ transactions }),
  addTransaction: (transaction: Transaction) => {
    const currentTransactions = get().transactions
    set({ transactions: [transaction, ...currentTransactions] })
  },
  wallet: initialWallet,
  setWallet: (wallet: Wallet) => set({ wallet }),
  rewards: initialRewards,
  setRewards: (rewards: UserRewards) => set({ rewards }),
  addReward: (amount: number, type: "referral" | "story") => {
    const currentRewards = get().rewards
    const newRewards = {
      ...currentRewards,
      totalEarned: currentRewards.totalEarned + amount,
      withdrawable: currentRewards.withdrawable + amount,
      ...(type === "referral"
        ? { referralEarnings: currentRewards.referralEarnings + amount }
        : { storyEarnings: currentRewards.storyEarnings + amount, storyShares: currentRewards.storyShares + 1 }),
    }
    set({ rewards: newRewards })

    // Add transaction
    get().addTransaction({
      id: Date.now().toString(),
      type: "reward",
      amount,
      currency: "sats",
      date: new Date().toLocaleDateString(),
      description: type === "referral" ? "Referral Reward" : "Story Share Reward",
      status: "completed",
    })
  },
  referrals: [],
  setReferrals: (referrals: Referral[]) => set({ referrals }),
  addReferral: (referral: Referral) => {
    const currentReferrals = get().referrals
    set({ referrals: [...currentReferrals, referral] })

    // Update rewards
    const currentRewards = get().rewards
    set({
      rewards: {
        ...currentRewards,
        referralCount: currentRewards.referralCount + 1,
      },
    })
  },
}))
