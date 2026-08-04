"use client";

import { useEffect, useState } from "react";
import { isTMA } from "@telegram-apps/sdk-react";

/**
 * Non-throwing check for whether the app is running inside the Telegram
 * client. Unlike useLaunchParams()/useInitData(), this never throws, so it's
 * safe to call before deciding whether to mount Telegram-SDK-dependent UI.
 *
 * Uses the async, "complete" variant of isTMA() rather than the sync one:
 * root layout loads Telegram's telegram-web-app.js unconditionally, which
 * stubs out window.Telegram.WebApp with empty initData even in a plain
 * browser, so the sync heuristic (which just checks for that object's
 * presence) reports a false positive. The async variant round-trips an
 * actual Mini Apps method call and only resolves true if something answers.
 *
 * Returns null until the check has resolved on the client.
 */
export function useIsTelegramEnv(): boolean | null {
  const [isTelegramEnv, setIsTelegramEnv] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Cast around the ambient overload set here — depending on which of
    // @telegram-apps/sdk's and @telegram-apps/bridge's declarations TS
    // resolves through the re-export chain, it sometimes only "sees" the
    // sync (0-arg) signature and rejects the 'complete' call below.
    const isTMAComplete = isTMA as unknown as (type: "complete") => Promise<boolean>;

    isTMAComplete("complete")
      .then((result) => {
        if (!cancelled) setIsTelegramEnv(result);
      })
      .catch(() => {
        if (!cancelled) setIsTelegramEnv(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return isTelegramEnv;
}
