"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import { useP2pHeaders } from "@/hooks/query/useP2p";
import fetchy from "@/lib/fetchy";
import type { BotWalletInit } from "@/lib/p2p";
import { queryKeys } from "@/lib/query-keys";
import { usePlatform } from "@/platform";

const READY_KEY = (userId: string) => `bitcoin-deepa-bot-wallet:${userId}`;

function isReady(userId: string): boolean {
  try {
    return localStorage.getItem(READY_KEY(userId)) === "1";
  } catch {
    return false;
  }
}

function markReady(userId: string) {
  try {
    localStorage.setItem(READY_KEY(userId), "1");
  } catch {
    // Private mode etc.: init runs again next open (it's idempotent)
  }
}

/**
 * Makes sure the user has a bot wallet, for users who opened the app (Mini
 * App or PWA) without ever pressing Start in the bot - until then sends,
 * collects and receiving all fail. Runs in the background as soon as there's
 * a session, never blocks the UI, and once it succeeds it's skipped on this
 * device for that user.
 *
 * A new wallet the bot can't message yet: the Mini App asks for permission
 * right away; otherwise `onCantMessage` lets the app point the user to the
 * bot (Confirm buttons, collect prompts and receipts arrive there).
 */
export function useBotWalletInit(onCantMessage: () => void) {
  const { status, user } = useSession();
  const platform = usePlatform();
  const headers = useP2pHeaders();
  const queryClient = useQueryClient();
  const startedFor = useRef<string | null>(null);
  const userId = user?.id;

  useEffect(() => {
    // Wait for platform detection, so the Mini App sends its initData
    if (status !== "authenticated" || !userId || platform.kind === null) return;
    if (startedFor.current === userId || isReady(userId)) return;
    startedFor.current = userId;

    void (async () => {
      let result: BotWalletInit;
      try {
        result = await fetchy.post<BotWalletInit>("/init", {}, { headers });
      } catch {
        // Not fatal: P2P off, bot down, stale web login... retried next open
        return;
      }
      markReady(userId);
      if (!result.created) return;

      void queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary });
      void queryClient.invalidateQueries({ queryKey: queryKeys.p2pMe });
      if (result.can_message === false && !(await platform.requestWriteAccess())) {
        onCantMessage();
      }
    })();
    // Re-runs on new headers/callbacks are no-ops (startedFor)
  }, [status, userId, platform, headers, queryClient, onCantMessage]);
}
