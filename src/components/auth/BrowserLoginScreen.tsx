"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { CellChevron } from "@/components/ui/cell";
import { Emoji } from "@/components/ui/emoji";
import { LandingShell } from "@/components/auth/LandingShell";
import { UserProgress } from "@/components/auth/UserProgress";
import { loginErrorMessage } from "@/lib/auth";
import { TELEGRAM_BOT_URL } from "@/lib/constants";
import TelegramLoginButton from "@/components/auth/TelegramLoginButton";
import { InstallButton } from "@/pwa";

/**
 * Shown when the app is opened outside Telegram (a plain browser tab).
 * "Log In with Telegram" is a redirect through the backend (OIDC), which
 * comes back with a session cookie; useSession then moves the user on. A
 * failed login comes back here with ?login_error=<code>.
 */
export default function BrowserLoginScreen() {
  // Only rendered on the client, once the platform is known
  const [error] = useState(() =>
    typeof window === "undefined"
      ? null
      : loginErrorMessage(new URL(window.location.href).searchParams.get("login_error"))
  );

  // Drop ?login_error= so a reload doesn't show it again
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("login_error")) return;
    url.searchParams.delete("login_error");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, []);

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
        <TelegramLoginButton className="w-full" />
        {error && (
          <p role="alert" className="text-loss text-center text-[13px] font-semibold">
            {error}
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
