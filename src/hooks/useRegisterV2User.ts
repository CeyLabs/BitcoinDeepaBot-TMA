"use client";

import { useEffect } from "react";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { authenticateWithTelegram, saveAuthToStorage } from "@/lib/auth";

/**
 * Registers/refreshes the user on the v2 backend the moment the TMA opens,
 * regardless of which route it lands on. The backend upserts the user from
 * Telegram initData on every call, so this alone is enough to register them.
 */
export function useRegisterV2User() {
  const initDataRaw = useLaunchParams()?.initDataRaw;

  useEffect(() => {
    if (!initDataRaw) return;

    authenticateWithTelegram(initDataRaw)
      .then((result) => {
        if (result.token) {
          saveAuthToStorage(result.token);
        }
      })
      .catch((error) => {
        console.error("Error registering user with v2 backend:", error);
      });
  }, [initDataRaw]);
}
