"use client";

import { useEffect, useRef } from "react";
import { useBackButtonRaw } from "@telegram-apps/sdk-react";

/**
 * Shows the native Telegram back chevron and wires it to `onBack` for the
 * page's lifetime. Uses the "raw" (non-throwing) resource hook — the plain
 * useBackButton() throws outside Telegram, where there's no such control to
 * show; here we just no-op instead.
 */
export function useTelegramBackButton(onBack: () => void) {
  const backButton = useBackButtonRaw(true)?.result;

  // Callers typically pass an inline arrow function, which is a new reference
  // every render. Routing the call through a ref keeps the effect's dependency
  // array stable so show()/hide() don't fire (and re-render) on every render.
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (!backButton) return;

    backButton.show();
    const handleClick = () => onBackRef.current();
    backButton.on("click", handleClick);
    return () => {
      backButton.off("click", handleClick);
      backButton.hide();
    };
  }, [backButton]);
}
