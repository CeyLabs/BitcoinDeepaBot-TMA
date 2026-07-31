"use client";

import { useEffect, useRef } from "react";
import { useBackButton } from "@telegram-apps/sdk-react";

/** Shows the native Telegram back chevron and wires it to `onBack` for the page's lifetime. */
export function useTelegramBackButton(onBack: () => void) {
  const backButton = useBackButton();

  // Callers typically pass an inline arrow function, which is a new reference
  // every render. Routing the call through a ref keeps the effect's dependency
  // array stable so show()/hide() don't fire (and re-render) on every render.
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    backButton.show();
    const handleClick = () => onBackRef.current();
    backButton.on("click", handleClick);
    return () => {
      backButton.off("click", handleClick);
      backButton.hide();
    };
  }, [backButton]);
}
