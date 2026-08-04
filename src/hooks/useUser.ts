"use client";

import { useLaunchParams } from "@telegram-apps/sdk-react";
import { useStore } from "@/lib/store";
import { useSubscriptionCurrent } from "@/hooks/query/useSubscriptionCurrent";
import { useKycStatus } from "@/hooks/query/useKyc";

/**
 * Single source of truth for user-related data: Telegram identity (client-only),
 * registration status (store, synced by useAuthGuard), and server state
 * (subscription, KYC status) — so components don't each re-derive these.
 */
export function useUser() {
  const launchParams = useLaunchParams();
  const telegramUser = launchParams.initData?.user;
  const { isExistingUser } = useStore();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscriptionCurrent();
  const { data: kycData } = useKycStatus();

  const username = telegramUser?.username;
  const displayName = username ?? "User";
  const initials = username?.slice(0, 2).toUpperCase() ?? "BD";

  return {
    id: telegramUser?.id?.toString() ?? "",
    username,
    displayName:
      (telegramUser?.firstName && telegramUser?.lastName
        ? `${telegramUser.firstName} ${telegramUser.lastName}`
        : telegramUser?.firstName) ?? displayName,
    initials,
    photoUrl: telegramUser?.photoUrl,
    isExistingUser,
    subscription: subscription ?? null,
    subscriptionLoading,
    kycStatus: kycData?.status,
  };
}
