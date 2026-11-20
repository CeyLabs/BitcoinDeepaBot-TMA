"use client";

import { usePlatform, type TelegramUser } from "@/platform";
import { useSubscriptionCurrent } from "@/hooks/query/useSubscriptionCurrent";
import { useKycStatus } from "@/hooks/query/useKyc";
import { useSession } from "@/hooks/useSession";
import { useUserMe } from "@/hooks/query/useUserMe";
import type { SessionUser } from "@/lib/auth";

/**
 * Identity from Telegram's initData when available (in Telegram), falling
 * back to the backend session's user (outside Telegram, e.g. a browser
 * signed in with "Log In with Telegram"). Telegram's @username is never used:
 * the app only shows the member's Bitcoin Deepa @username.
 */
function getIdentity(telegramUser: TelegramUser | undefined, sessionUser: SessionUser | null) {
  if (telegramUser) {
    return {
      id: telegramUser.id?.toString() ?? "",
      firstName: telegramUser.firstName,
      lastName: telegramUser.lastName,
      photoUrl: telegramUser.photoUrl,
    };
  }

  return {
    id: sessionUser?.id ?? "",
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
  const sessionUser = useSession().user;
  const { id, firstName, lastName, photoUrl } = getIdentity(
    usePlatform().launch?.user,
    sessionUser
  );
  const { data: me } = useUserMe();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscriptionCurrent();
  const { data: kycData } = useKycStatus();

  // Our @username (claimed in settings), never Telegram's.
  const username = me?.username ?? sessionUser?.username ?? undefined;
  // Profile name first, then the Telegram first/last name, then a neutral fallback.
  const fullName = (first?: string | null, last?: string | null) =>
    [first, last].filter(Boolean).join(" ") || undefined;
  const displayName =
    fullName(me?.first_name, me?.last_name) ?? fullName(firstName, lastName) ?? "Member";

  return {
    id,
    username,
    firstName,
    lastName,
    displayName,
    photoUrl,
    subscription: subscription ?? null,
    subscriptionLoading,
    kycStatus: kycData?.status,
  };
}
