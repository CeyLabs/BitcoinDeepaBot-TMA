"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  logoutSession,
  refreshWebSession,
  resolveSession,
  subscribeSession,
  type SessionStatus,
} from "@/lib/auth";
import { usePlatform } from "@/platform";

export type { SessionStatus };

/**
 * Single source of truth for auth state (see lib/auth.ts). Reactive: updates
 * on login, logout and a 401 from the backend. On the web it asks the backend
 * once the platform is known, and again when the app comes back to the
 * foreground after being signed out elsewhere.
 */
export function useSession() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { kind } = usePlatform();
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot
  );

  useEffect(() => {
    if (kind) resolveSession(kind);
  }, [kind]);

  useEffect(() => {
    if (kind !== "web" || session.status !== "authenticated") return;
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshWebSession();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [kind, session.status]);

  /** Throws when the backend didn't confirm it (the session is still on) */
  const logout = useCallback(
    async (everywhere = false) => {
      await logoutSession(everywhere);
      // Drop every cached query so the next account starts clean.
      queryClient.clear();
      router.replace("/");
    },
    [queryClient, router]
  );

  return {
    status: session.status,
    kind: session.kind,
    user: session.user,
    logout,
  };
}
