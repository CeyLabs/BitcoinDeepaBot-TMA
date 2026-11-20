"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutationState } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import { usePlatform } from "@/platform";
import { TELEGRAM_SIGN_IN_KEY, type TelegramSignInResult } from "@/hooks/useRegisterUser";

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
  // Whether the latest Telegram sign-in was refused (initData too old).
  const signInRejected =
    useMutationState({
      filters: { mutationKey: TELEGRAM_SIGN_IN_KEY, status: "success" },
      select: (mutation) => (mutation.state.data as TelegramSignInResult | undefined)?.rejected,
    }).at(-1) === true;

  useEffect(() => {
    if (status === "unauthenticated" && !canReauth) router.replace("/");
  }, [status, canReauth, router]);

  return {
    sessionExpired: status === "unauthenticated" && canReauth && signInRejected,
    // Telegram: no (valid) token yet, but the sign-in from initData is running
    // or will retry. Pages have no data to show until it lands.
    signingIn: status === "unauthenticated" && canReauth && !signInRejected,
  };
}
