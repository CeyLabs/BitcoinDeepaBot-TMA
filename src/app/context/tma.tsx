"use client";

import { useEffect } from "react";
import { initMiniApp, postEvent } from "@telegram-apps/sdk-react";
import { useRegisterUser } from "@/hooks/useRegisterUser";
import { useIsTelegramEnv } from "@/hooks/useIsTelegramEnv";

// useRegisterUser calls the Telegram SDK's useLaunchParams(), which throws
// outside Telegram — only mount it once we've confirmed we're in Telegram,
// via a separate component so the hook is never called conditionally.
function RegisterUserGate() {
  useRegisterUser();
  return null;
}

export default function TMASetupProvider({ children }: { children: React.ReactNode }) {
  const isTelegramEnv = useIsTelegramEnv();

  useEffect(() => {
    try {
      const [miniApp] = initMiniApp();
      postEvent("web_app_expand");
    } catch {
      // Not running inside Telegram (e.g. opened directly in a browser during
      // local development) — skip native setup instead of crashing the app.
    }
  }, []);

  return (
    <>
      {isTelegramEnv && <RegisterUserGate />}
      {children}
    </>
  );
}
