"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { webLoginUrl } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/constants";

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
  const toast = useToast();
  return (
    <Button
      className={className}
      onClick={() => {
        // A build without NEXT_PUBLIC_API_BASE_URL (e.g. a Vercel preview with
        // no Preview env vars) would send this to a page of our own: a 404.
        if (!API_BASE_URL) {
          toast({
            type: "error",
            title: "Sign-in isn't set up here",
            description: "This build has no backend address (NEXT_PUBLIC_API_BASE_URL).",
          });
          return;
        }
        window.location.assign(webLoginUrl(returnTo ?? "/dashboard?tab=wallet", referralCode));
      }}
    >
      {label}
    </Button>
  );
}
