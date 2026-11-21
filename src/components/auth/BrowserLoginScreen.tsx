"use client";

import { useEffect, useState } from "react";
import { CellChevron } from "@/components/ui/cell";
import { Emoji } from "@/components/ui/emoji";
import { LandingShell, LogoStage } from "@/components/auth/LandingShell";
import { UserProgress } from "@/components/auth/UserProgress";
import { loginErrorMessage } from "@/lib/auth";
import {
  TELEGRAM_BOT_USERNAME,
  TELEGRAM_MINI_APP_DEEP_LINK,
  TELEGRAM_MINI_APP_URL,
} from "@/lib/constants";
import { usePlatform } from "@/platform";
import TelegramLoginButton from "@/components/auth/TelegramLoginButton";
import { InstallButton } from "@/pwa";

/**
 * Shown when the app is opened outside Telegram (a plain browser tab).
 * "Log In with Telegram" is a redirect through the backend (OIDC), which
 * comes back with a session cookie; useSession then moves the user on. A
 * failed login comes back here with ?login_error=<code>.
 */
/**
 * "Prefer Telegram?" opens the Mini App itself, not the bot chat. On a phone
 * the tg:// link goes straight into the Telegram app (an installed PWA would
 * otherwise bounce through Safari's t.me page); if Telegram isn't installed
 * the page stays visible, so fall back to the t.me link after a moment. On a
 * computer the t.me link opens in a new tab (Telegram Desktop or Web).
 */
function openMiniApp(e: React.MouseEvent<HTMLAnchorElement>, isMobile: boolean) {
  if (!isMobile) return;
  e.preventDefault();
  let left = false;
  const onHide = () => {
    if (document.visibilityState === "hidden") left = true;
  };
  document.addEventListener("visibilitychange", onHide);
  window.location.href = TELEGRAM_MINI_APP_DEEP_LINK;
  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", onHide);
    if (!left && document.visibilityState === "visible") {
      window.location.href = TELEGRAM_MINI_APP_URL;
    }
  }, 1500);
}

export default function BrowserLoginScreen() {
  const { isMobileDevice } = usePlatform();
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
        <LogoStage />
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
          href={TELEGRAM_MINI_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => openMiniApp(e, isMobileDevice)}
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
        <p className="text-ink3 mt-1 text-center text-[13px] font-semibold">
          @{TELEGRAM_BOT_USERNAME}
        </p>
      </div>
    </LandingShell>
  );
}
