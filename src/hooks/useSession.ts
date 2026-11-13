"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  AUTH_CHANGE_EVENT,
  clearAuthFromStorage,
  getAuthTokenFromStorage,
  getUserFromToken,
} from "@/lib/auth";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

function subscribe(onChange: () => void) {
  window.addEventListener(AUTH_CHANGE_EVENT, onChange);
  // Sign-in/out in another tab of the same origin.
  window.addEventListener("storage", onChange);
  // Re-check expiry when the app comes back to the foreground (PWA resume).
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

// No storage on the server — report "loading" until the client takes over.
const getServerSnapshot = () => undefined;

/**
 * Single source of truth for auth state. Reactive: updates when the token is
 * saved or cleared (sign-in, sign-out, a 401 from the backend), changes in
 * another tab, or expires while the app was in the background.
 */
export function useSession() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useSyncExternalStore(subscribe, getAuthTokenFromStorage, getServerSnapshot);

  const status: SessionStatus =
    token === undefined ? "loading" : token ? "authenticated" : "unauthenticated";

  const logout = useCallback(() => {
    clearAuthFromStorage();
    // Drop every cached query so the next account starts clean.
    queryClient.clear();
    router.replace("/");
  }, [queryClient, router]);

  return {
    status,
    token: token ?? null,
    user: token ? getUserFromToken() : null,
    logout,
  };
}
