"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { CellChevron } from "@/components/ui/cell";
import { Emoji } from "@/components/ui/emoji";
import { Spinner } from "@/components/ui/button";
import { LandingShell } from "@/components/auth/LandingShell";
import { UserProgress } from "@/components/auth/UserProgress";
import { authenticateWithTelegramOidc, saveAuthToStorage } from "@/lib/auth";
import type { TelegramOidcAuthData } from "@/lib/auth";
import { TELEGRAM_BOT_URL } from "@/lib/constants";
import TelegramLoginButton, { TG_PRIMARY_BUTTON } from "@/components/auth/TelegramLoginButton";
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
    <LandingShell themeToggle aria-label="Sign in to Bitcoin Deepa">
      <div className="flex flex-col items-center text-center">
        <div className="animate-logo-in relative h-[230px] w-full max-w-[340px]">
          <Logo priority />
        </div>
        <div className="stagger mt-6 flex w-full flex-col items-center gap-2">
          <h1 className="max-w-[330px] text-[26px] leading-8">
            Join Sri Lanka&rsquo;s Fastest Growing Bitcoin Community
          </h1>
          <div className="mt-4 w-full">
            <UserProgress />
          </div>
        </div>
      </div>

      <div className="stagger mt-8 flex w-full flex-col gap-3">
        <TelegramLoginButton onAuth={handleAuth} className={TG_PRIMARY_BUTTON} />
        {(isLoading || error) && (
          <p
            role={error ? "alert" : undefined}
            aria-live="polite"
            className={
              error
                ? "text-loss text-center text-[13px] font-semibold"
                : "text-ink3 flex items-center justify-center gap-2 text-[13px] font-semibold"
            }
          >
            {error ?? (
              <>
                <Spinner /> Signing you in…
              </>
            )}
          </p>
        )}
        <a
          href={TELEGRAM_BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="press bg-card shadow-card flex min-h-16 w-full items-center gap-3 rounded-xl px-4 py-3 text-left"
        >
          <Emoji src="/emoji/wallet.webp" />
          <span className="flex min-w-0 grow flex-col gap-1 pl-0.5">
            <span className="text-[16px] leading-[18px] font-semibold">Prefer Telegram?</span>
            <span className="text-ink3 truncate text-[13px] leading-4">
              Open the mini app in the Telegram app
            </span>
          </span>
          <CellChevron />
        </a>
        <InstallButton variant="cell" />
        <p className="text-ink3 mt-1 text-center text-[13px] font-semibold">@BitcoinDeepaBot</p>
      </div>
    </LandingShell>
  );
}
