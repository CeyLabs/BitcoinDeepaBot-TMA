"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usePlatform } from "@/platform";
import { loginWithMiniAppInitData, MiniAppLoginError, type MiniAppLoginResponse } from "@/lib/auth";
import { useSession } from "@/hooks/useSession";

/** Mutation key of the Mini App sign-in; useAuthGuard and useBotWalletInit read its result. */
export const TELEGRAM_SIGN_IN_KEY = ["telegram-sign-in"] as const;

/**
 * `rejected`: the backend refused the initData itself (older than its 15 min
 * limit, or invalid) — retrying can't help, the user reopens the app.
 */
export type TelegramSignInResult =
  | { rejected: true }
  | ({ rejected: false } & Pick<MiniAppLoginResponse, "walletLinked" | "canMessage">);

async function signInWithTelegram(initDataRaw: string): Promise<TelegramSignInResult> {
  try {
    const { walletLinked, canMessage } = await loginWithMiniAppInitData(initDataRaw);
    return { rejected: false, walletLinked, canMessage };
  } catch (error) {
    if (error instanceof MiniAppLoginError && error.rejected) return { rejected: true };
    throw error;
  }
}

// At most one sign-in attempt a minute, so a backend that keeps failing
// can't cause a request loop.
const RETRY_INTERVAL_MS = 60_000;

/**
 * Signs the Mini App in the moment it opens, on any route: the raw launch
 * initData (never initDataUnsafe) is exchanged once for a backend session,
 * which also registers the user and links their bot wallet. initData isn't
 * kept after that.
 *
 * If the session ends later (401: expired or revoked) it signs in again from
 * the same initData while that is still young enough for the backend (15
 * min); after that the backend refuses it and useAuthGuard asks the user to
 * reopen the app. No-op outside Telegram.
 */
export function useRegisterUser() {
  const initDataRaw = usePlatform().launch?.initDataRaw;
  const { status } = useSession();
  const { mutateAsync: signIn } = useMutation({
    mutationKey: TELEGRAM_SIGN_IN_KEY,
    mutationFn: signInWithTelegram,
  });
  const lastAttemptRef = useRef(0);
  const rejectedRef = useRef(false);
  // Bumped to re-run the effect when a scheduled retry is due.
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (!initDataRaw || status === "loading" || rejectedRef.current) return;
    const isLaunch = lastAttemptRef.current === 0;
    // A session saved in this tab (a reload) is reused; a 401 ends it
    if (status === "authenticated") return;

    const wait = lastAttemptRef.current + RETRY_INTERVAL_MS - Date.now();
    if (!isLaunch && wait > 0) {
      const timer = setTimeout(() => setRetryTick((n) => n + 1), wait);
      return () => clearTimeout(timer);
    }

    lastAttemptRef.current = Date.now();

    signIn(initDataRaw)
      .then((result) => {
        if (result.rejected) rejectedRef.current = true;
      })
      .catch((error) => {
        console.error("Error signing in:", error);
        setRetryTick((n) => n + 1);
      });
  }, [initDataRaw, status, retryTick, signIn]);
}
