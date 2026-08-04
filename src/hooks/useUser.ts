"use client";

import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { useStore } from "@/lib/store";
import { useSubscriptionCurrent } from "@/hooks/query/useSubscriptionCurrent";
import { useKycStatus } from "@/hooks/query/useKyc";
import { getUserFromToken } from "@/lib/auth";

/**
 * Identity from Telegram's initData when available (in Telegram), falling
 * back to the id/username embedded in the stored auth token (outside
 * Telegram, e.g. a browser session signed in via the Login Widget).
 * Uses the plain retrieveLaunchParams() function rather than the
 * useLaunchParams() hook, since the hook throws outside Telegram.
 */
interface CamelCasedTelegramUser {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}

function getIdentity() {
  try {
    // Cast around the same ambient-overload flakiness noted in
    // useIsTelegramEnv.ts — TS sometimes only resolves the 0-arg signature.
    const retrieveCamelCased = retrieveLaunchParams as unknown as (camelCase: true) => {
      initData?: { user?: CamelCasedTelegramUser };
    };
    const telegramUser = retrieveCamelCased(true).initData?.user;
    if (telegramUser) {
      return {
        id: telegramUser.id?.toString() ?? "",
        username: telegramUser.username,
        firstName: telegramUser.firstName,
        lastName: telegramUser.lastName,
        photoUrl: telegramUser.photoUrl,
      };
    }
  } catch {
    // Not running inside Telegram — fall through to the token-based identity.
  }

  const tokenUser = getUserFromToken();
  return {
    id: tokenUser?.id ?? "",
    username: tokenUser?.username,
    firstName: undefined as string | undefined,
    lastName: undefined as string | undefined,
    photoUrl: undefined as string | undefined,
  };
}

/**
 * Single source of truth for user-related data: identity, registration
 * status (store, synced by useAuthGuard), and server state (subscription,
 * KYC status) — so components don't each re-derive these.
 */
export function useUser() {
  const { id, username, firstName, lastName, photoUrl } = getIdentity();
  const { isExistingUser } = useStore();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscriptionCurrent();
  const { data: kycData } = useKycStatus();

  const displayName = username ?? "User";
  const initials = username?.slice(0, 2).toUpperCase() ?? "BD";

  return {
    id,
    username,
    firstName,
    lastName,
    displayName: (firstName && lastName ? `${firstName} ${lastName}` : firstName) ?? displayName,
    initials,
    photoUrl,
    isExistingUser,
    subscription: subscription ?? null,
    subscriptionLoading,
    kycStatus: kycData?.status,
  };
}
