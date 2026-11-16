"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usePlatform } from "@/platform";
import { authenticateWithTelegram, saveAuthToStorage } from "@/lib/auth";
import { useSession } from "@/hooks/useSession";

/** Mutation key of the Telegram sign-in; useAuthGuard reads its result. */
export const TELEGRAM_SIGN_IN_KEY = ["telegram-sign-in"] as const;

/** `rejected`: the backend refused the initData itself (too old) — retrying can't help. */
export type TelegramSignInResult = { rejected: boolean };

async function signInWithTelegram(initDataRaw: string): Promise<TelegramSignInResult> {
  const result = await authenticateWithTelegram(initDataRaw);
  if (!result.token) return { rejected: true };
  saveAuthToStorage(result.token);
  return { rejected: false };
}

// At most one sign-in attempt a minute, so a backend that keeps rejecting
// fresh tokens can't cause a request loop.
const RETRY_INTERVAL_MS = 60_000;

/**
 * Registers/refreshes the user the moment the TMA opens, regardless of which
 * route it lands on. The backend upserts the user from Telegram initData on
 * every call, so this alone is enough to register them.
 *
 * If the session ends later (token expired or rejected with 401) it signs in
 * again from initData, in place — useAuthGuard waits instead of redirecting.
 * A too-early attempt is scheduled rather than dropped. If the backend
 * rejects the initData itself (older than its 24 h limit), retrying can't
 * help: it reports "failed" and stops. No-op outside Telegram.
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
    if (!isLaunch && status === "authenticated") return;

    const wait = lastAttemptRef.current + RETRY_INTERVAL_MS - Date.now();
    if (!isLaunch && wait > 0) {
      const timer = setTimeout(() => setRetryTick((n) => n + 1), wait);
      return () => clearTimeout(timer);
    }

    lastAttemptRef.current = Date.now();

    signIn(initDataRaw)
      .then(({ rejected }) => {
        if (rejected) rejectedRef.current = true;
      })
      .catch((error) => {
        console.error("Error registering user:", error);
        setRetryTick((n) => n + 1);
      });
  }, [initDataRaw, status, retryTick, signIn]);
}
