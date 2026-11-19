"use client";

import { Button } from "@/components/ui/button";
import { webLoginUrl } from "@/lib/auth";

/**
 * "Log In with Telegram" for the web: a full-page redirect to the backend's
 * OIDC start (/auth/telegram/start), which sends the browser to
 * Telegram and back with an HttpOnly session cookie. No Telegram script runs
 * on our page, and no token ever reaches JS.
 */
export default function TelegramLoginButton({
  returnTo,
  referralCode,
  label = "Sign in with Telegram",
  className,
}: {
  /** A same-app path to come back to (defaults to the dashboard) */
  returnTo?: string;
  referralCode?: string;
  label?: string;
  className?: string;
}) {
  return (
    <Button
      className={className}
      onClick={() =>
        window.location.assign(webLoginUrl(returnTo ?? "/dashboard?tab=wallet", referralCode))
      }
    >
      {label}
    </Button>
  );
}
