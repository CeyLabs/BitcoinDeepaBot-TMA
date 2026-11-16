"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { getIsExistingUserFromStorage } from "@/lib/auth";
import { useSession } from "@/hooks/useSession";
import { usePlatform } from "@/platform";

/**
 * Keeps signed-out users out of the dashboard.
 *
 * - Web: redirects to / (sign-in) whenever there's no valid session — on
 *   mount, and later if the token expires or the backend rejects it (401).
 * - Telegram: stays on the page while useRegisterUser signs in again from
 *   initData, so the user keeps their place. If that fails, `sessionExpired`
 *   tells the layout to ask the user to reopen the app.
 */
export function useAuthGuard() {
  const router = useRouter();
  const { status } = useSession();
  const canReauth = !!usePlatform().launch?.initDataRaw;
  const { isExistingUser, setIsExistingUser, telegramReauth } = useStore();

  useEffect(() => {
    if (status === "authenticated") {
      setIsExistingUser(getIsExistingUserFromStorage());
    } else if (status === "unauthenticated" && !canReauth) {
      router.replace("/");
    }
  }, [status, canReauth, router, setIsExistingUser]);

  return {
    isExistingUser,
    sessionExpired: status === "unauthenticated" && canReauth && telegramReauth === "failed",
  };
}
