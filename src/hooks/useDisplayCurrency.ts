"use client";

import { useCallback, useSyncExternalStore } from "react";

export type DisplayCurrency = "LKR" | "USD";

// Wallet values in rupees or US dollars (the hero's currency button).
// Remembered across launches, in memory if storage is blocked.
const KEY = "bitcoin-deepa-display-currency";
const listeners = new Set<() => void>();
let current: DisplayCurrency | null = null;

function readStorage(): DisplayCurrency {
  try {
    return localStorage.getItem(KEY) === "USD" ? "USD" : "LKR";
  } catch {
    return "LKR";
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): DisplayCurrency {
  if (current === null) current = readStorage();
  return current;
}

export function useDisplayCurrency() {
  const currency = useSyncExternalStore(subscribe, getSnapshot, () => "LKR" as const);

  const toggle = useCallback(() => {
    current = getSnapshot() === "LKR" ? "USD" : "LKR";
    try {
      localStorage.setItem(KEY, current);
    } catch {
      // Storage blocked: keep it for this session only.
    }
    listeners.forEach((notify) => notify());
  }, []);

  return { currency, toggle };
}
