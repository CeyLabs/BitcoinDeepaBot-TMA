"use client";

import { useEffect, useRef, useState } from "react";
import { usePlatform } from "@/platform";
import { authenticateWithTelegram, saveAuthToStorage } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useSession } from "@/hooks/useSession";

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
  const setTelegramReauth = useStore((state) => state.setTelegramReauth);
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
    setTelegramReauth("pending");

    authenticateWithTelegram(initDataRaw)
      .then((result) => {
        if (result.token) {
          saveAuthToStorage(result.token);
          setTelegramReauth("idle");
        } else {
          // Backend answered but rejected this initData.
          rejectedRef.current = true;
          setTelegramReauth("failed");
        }
      })
      .catch((error) => {
        // Network/server error — try again after the interval.
        console.error("Error registering user:", error);
        setTelegramReauth("idle");
        setRetryTick((n) => n + 1);
      });
  }, [initDataRaw, status, retryTick, setTelegramReauth]);
}
