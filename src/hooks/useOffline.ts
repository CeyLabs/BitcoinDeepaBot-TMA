"use client";

import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};

/** True when the browser reports no network. False on the server. */
export function useOffline() {
  return useSyncExternalStore(
    subscribe,
    () => !navigator.onLine,
    () => false
  );
}
