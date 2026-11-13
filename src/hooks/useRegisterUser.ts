"use client";

import { useEffect } from "react";
import { usePlatform } from "@/platform";
import { authenticateWithTelegram, saveAuthToStorage } from "@/lib/auth";

/**
 * Registers/refreshes the user the moment the TMA opens, regardless of which
 * route it lands on. The backend upserts the user from Telegram initData on
 * every call, so this alone is enough to register them. No-op outside Telegram.
 */
export function useRegisterUser() {
  const initDataRaw = usePlatform().launch?.initDataRaw;

  useEffect(() => {
    if (!initDataRaw) return;

    authenticateWithTelegram(initDataRaw)
      .then((result) => {
        if (result.token) {
          saveAuthToStorage(result.token);
        }
      })
      .catch((error) => {
        console.error("Error registering user:", error);
      });
  }, [initDataRaw]);
}
