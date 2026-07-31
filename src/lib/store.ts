import { create } from "zustand";
import type { User, Subscription, UserRewards, Referral } from "./types";

export type Store = {
  count: number;
  setCount: (count: number) => void;
  userID: string;
  setUserID: (userID: string) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isExistingUser: boolean;
  setIsExistingUser: (isExisting: boolean) => void;
  subscription: Subscription | null;
  setSubscription: (subscription: Subscription | null) => void;
  rewards: UserRewards;
  setRewards: (rewards: UserRewards) => void;
  addReward: (amount: number, type: "referral" | "story") => void;
  referrals: Referral[];
  setReferrals: (referrals: Referral[]) => void;
  addReferral: (referral: Referral) => void;
  balanceVisible: boolean;
  setBalanceVisible: (visible: boolean) => void;
  toggleBalanceVisible: () => void;
};

const initialRewards: UserRewards = {
  totalEarned: 0,
  withdrawable: 0,
  referralCount: 0,
  storyShares: 0,
  referralEarnings: 0,
  storyEarnings: 0,
};

export const useStore = create<Store>((set, get) => ({
  count: 0,
  setCount: (count: number) => set({ count }),
  userID: "",
  setUserID: (userID: string) => set({ userID }),
  user: null,
  setUser: (user: User | null) => set({ user }),
  isExistingUser: false,
  setIsExistingUser: (isExisting: boolean) => set({ isExistingUser: isExisting }),
  subscription: null,
  setSubscription: (subscription: Subscription | null) => set({ subscription }),
  rewards: initialRewards,
  setRewards: (rewards: UserRewards) => set({ rewards }),
  addReward: (amount: number, type: "referral" | "story") => {
    const currentRewards = get().rewards;
    const newRewards = {
      ...currentRewards,
      totalEarned: currentRewards.totalEarned + amount,
      withdrawable: currentRewards.withdrawable + amount,
      ...(type === "referral"
        ? { referralEarnings: currentRewards.referralEarnings + amount }
        : {
            storyEarnings: currentRewards.storyEarnings + amount,
            storyShares: currentRewards.storyShares + 1,
          }),
    };
    set({ rewards: newRewards });
  },
  referrals: [],
  setReferrals: (referrals: Referral[]) => set({ referrals }),
  addReferral: (referral: Referral) => {
    const currentReferrals = get().referrals;
    set({ referrals: [...currentReferrals, referral] });

    // Update rewards
    const currentRewards = get().rewards;
    set({
      rewards: {
        ...currentRewards,
        referralCount: currentRewards.referralCount + 1,
      },
    });
  },
  balanceVisible: true,
  setBalanceVisible: (visible: boolean) => set({ balanceVisible: visible }),
  toggleBalanceVisible: () => set({ balanceVisible: !get().balanceVisible }),
}));
