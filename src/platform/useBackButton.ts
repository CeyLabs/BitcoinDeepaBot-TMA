"use client";

import { useEffect, useRef } from "react";
import { backButton } from "@tma.js/sdk";
import { usePlatform } from "./PlatformProvider";

/**
 * Shows the native Telegram back chevron and wires it to `onBack` for the
 * page's lifetime. No-op outside Telegram (or on clients without one), where
 * pages render their own back button instead. Pass `enabled: false` to skip it
 * (e.g. a view that is sometimes a tab root, where there's nowhere to go back to).
 */
export function useBackButton(onBack: () => void, enabled = true) {
  const inTelegram = usePlatform().kind === "telegram";

  // Callers typically pass an inline arrow function, which is a new reference
  // every render. Routing the call through a ref keeps the effect's dependency
  // array stable so show()/hide() don't fire (and re-render) on every render.
  const onBackRef = useRef(onBack);
  useEffect(() => {
    onBackRef.current = onBack;
  });

  useEffect(() => {
    if (!inTelegram || !enabled) return;
    try {
      if (!backButton.isSupported()) return;
      if (!backButton.isMounted()) backButton.mount();
      backButton.show();
      const off = backButton.onClick(() => onBackRef.current());
      return () => {
        off();
        backButton.hide();
      };
    } catch {
      // SDK not initialized / unsupported client — no native back button.
    }
  }, [inTelegram, enabled]);
}
