"use client";

import { usePlatform, type TelegramUser } from "@/platform";
import { useSubscriptionCurrent } from "@/hooks/query/useSubscriptionCurrent";
import { useKycStatus } from "@/hooks/query/useKyc";
import { useSession } from "@/hooks/useSession";
import type { SessionUser } from "@/lib/auth";

/**
 * Identity from Telegram's initData when available (in Telegram), falling
 * back to the backend session's user (outside Telegram, e.g. a browser
 * signed in with "Log In with Telegram").
 */
function getIdentity(telegramUser: TelegramUser | undefined, sessionUser: SessionUser | null) {
  if (telegramUser) {
    return {
      id: telegramUser.id?.toString() ?? "",
      username: telegramUser.username,
      firstName: telegramUser.firstName,
      lastName: telegramUser.lastName,
      photoUrl: telegramUser.photoUrl,
    };
  }

  return {
    id: sessionUser?.id ?? "",
    username: sessionUser?.username,
    firstName: undefined as string | undefined,
    lastName: undefined as string | undefined,
    photoUrl: undefined as string | undefined,
  };
}

/**
 * Single source of truth for user-related data: identity, and server state (subscription,
 * KYC status) — so components don't each re-derive these.
 */
export function useUser() {
  const { id, username, firstName, lastName, photoUrl } = getIdentity(
    usePlatform().launch?.user,
    useSession().user
  );
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
    subscription: subscription ?? null,
    subscriptionLoading,
    kycStatus: kycData?.status,
  };
}
