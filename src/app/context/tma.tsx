"use client";

import { useEffect } from "react";
import { initMiniApp, postEvent } from "@telegram-apps/sdk-react";
import { useRegisterUser } from "@/hooks/useRegisterUser";

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

  useRegisterUser();

  return <>{children}</>;
}
