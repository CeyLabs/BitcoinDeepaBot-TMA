"use client";

import { useCallback, useSyncExternalStore } from "react";

// The eye toggle that masks balances. Shared by every screen that shows
// amounts, and remembered across launches (in memory if storage is blocked).
const KEY = "bitcoin-deepa-balance-hidden";
const listeners = new Set<() => void>();
let hidden: boolean | null = null;

function readStorage() {
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  // Another tab changed it.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    hidden = readStorage();
    onChange();
  };
  listeners.add(onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  if (hidden === null) hidden = readStorage();
  return !hidden;
}

// Server: balances render visible; the client corrects it on hydration.
const getServerSnapshot = () => true;

export function useBalanceVisible() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    // getSnapshot() is "visible right now", which is exactly the new "hidden".
    hidden = getSnapshot();
    try {
      if (hidden) localStorage.setItem(KEY, "true");
      else localStorage.removeItem(KEY);
    } catch {
      // Storage blocked: keep it for this session only.
    }
    listeners.forEach((notify) => notify());
  }, []);

  return { visible, toggle };
}
