"use client";

import { useEffect } from "react";
import { initMiniApp, postEvent } from "@telegram-apps/sdk-react";
import { useRegisterV2User } from "@/hooks/useRegisterV2User";

export default function TMASetupProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const [miniApp] = initMiniApp();
      postEvent("web_app_expand");
    } catch {
      // Not running inside Telegram (e.g. opened directly in a browser during
      // local development) — skip native setup instead of crashing the app.
    }
  }, []);

  useRegisterV2User();

  return <>{children}</>;
}
