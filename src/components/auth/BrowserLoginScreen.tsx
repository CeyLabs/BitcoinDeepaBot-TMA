"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/title";
import { authenticateWithTelegramOidc, saveAuthToStorage } from "@/lib/auth";
import type { TelegramOidcAuthData } from "@/lib/auth";
import { TELEGRAM_BOT_URL } from "@/lib/constants";
import TelegramLoginButton from "@/components/auth/TelegramLoginButton";
import { InstallButton } from "@/pwa";

/**
 * Shown when the app is opened outside Telegram (a plain browser tab).
 * Signs the user in via Telegram's Login Widget rather than Mini App
 * initData, since initData only exists inside the Telegram WebView.
 * Saving the token updates useSession, which moves the user on.
 */
export default function BrowserLoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (data: TelegramOidcAuthData) => {
    setError(null);

    if (data.error || !data.id_token) {
      setError("Couldn't sign you in with Telegram. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authenticateWithTelegramOidc(data.id_token);
      if (!result.token) throw new Error("No token returned");
      saveAuthToStorage(result.token);
    } catch (err) {
      console.error(err);
      setError("Couldn't sign you in with Telegram. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center dark:bg-[#1b2027]">
      <div className="relative mb-5 h-[150px] w-[220px]">
        <Logo priority />
      </div>

      <Title className="max-w-sm leading-snug">Sign In With Telegram</Title>

      <p className="text-muted-foreground mt-2 max-w-sm text-[15px] dark:text-[#64748b]">
        Sign in with your Telegram account to continue.
      </p>

      <div className="mt-8">
        <TelegramLoginButton onAuth={handleAuth} />
      </div>

      {isLoading && (
        <p className="text-muted-foreground mt-4 text-[13px] dark:text-[#64748b]">
          Signing you in…
        </p>
      )}
      {error && <p className="mt-4 text-[13px] text-red-500">{error}</p>}

      <InstallButton className="mt-8 max-w-xs" />

      <a
        href={TELEGRAM_BOT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block w-full max-w-xs"
      >
        <Button variant="outline" size="lg" className="w-full rounded-[12px]">
          Open in Telegram Instead
        </Button>
      </a>
    </main>
  );
}
