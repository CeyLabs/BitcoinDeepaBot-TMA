"use client";

import { useEffect, useRef } from "react";
import { useMutationState, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { usePlatform } from "@/platform";
import { TELEGRAM_SIGN_IN_KEY, type TelegramSignInResult } from "@/hooks/useRegisterUser";

/**
 * The backend creates the user's bot wallet and links it at every login (the
 * bot's /api/v1/init), so there's no separate call here. This only follows up
 * on a Mini App login that reports the bot can't message the user yet (a new
 * wallet): ask for permission right away, and if refused, `onCantMessage`
 * lets the app point the user to the bot (Confirm buttons, collect prompts
 * and receipts arrive there). Web logins ask for it on Telegram's login page.
 */
export function useBotWalletInit(onCantMessage: () => void) {
  const platform = usePlatform();
  const queryClient = useQueryClient();
  const handled = useRef<TelegramSignInResult | null>(null);
  const latest = useMutationState({
    filters: { mutationKey: TELEGRAM_SIGN_IN_KEY, status: "success" },
    select: (mutation) => mutation.state.data as TelegramSignInResult | undefined,
  }).at(-1);

  useEffect(() => {
    if (!latest || latest.rejected || handled.current === latest) return;
    handled.current = latest;
    if (latest.walletLinked) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary });
      void queryClient.invalidateQueries({ queryKey: queryKeys.p2pMe });
    }
    if (latest.canMessage !== false) return;
    void (async () => {
      if (!(await platform.requestWriteAccess())) onCantMessage();
    })();
  }, [latest, platform, queryClient, onCantMessage]);
}
