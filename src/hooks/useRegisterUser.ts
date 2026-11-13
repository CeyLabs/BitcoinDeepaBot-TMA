"use client";

import { useEffect, useRef } from "react";
import { usePlatform } from "@/platform";
import { authenticateWithTelegram, saveAuthToStorage } from "@/lib/auth";
import { useSession } from "@/hooks/useSession";

// Don't re-authenticate more than once a minute, so a backend that keeps
// rejecting fresh tokens can't cause a request loop.
const RETRY_INTERVAL_MS = 60_000;

/**
 * Registers/refreshes the user the moment the TMA opens, regardless of which
 * route it lands on. The backend upserts the user from Telegram initData on
 * every call, so this alone is enough to register them. If the session ends
 * later (token expired or rejected with 401), it silently signs in again from
 * initData — Telegram users never see a login screen. No-op outside Telegram.
 */
export function useRegisterUser() {
  const initDataRaw = usePlatform().launch?.initDataRaw;
  const { status } = useSession();
  const lastAttemptRef = useRef(0);

  useEffect(() => {
    if (!initDataRaw || status === "loading") return;
    const isLaunch = lastAttemptRef.current === 0;
    if (!isLaunch && status === "authenticated") return;
    if (Date.now() - lastAttemptRef.current < RETRY_INTERVAL_MS) return;
    lastAttemptRef.current = Date.now();

    authenticateWithTelegram(initDataRaw)
      .then((result) => {
        if (result.token) {
          saveAuthToStorage(result.token);
        }
      })
      .catch((error) => {
        console.error("Error registering user:", error);
      });
  }, [initDataRaw, status]);
}
