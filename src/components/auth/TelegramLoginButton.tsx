"use client";

import { useEffect, useId, useRef } from "react";
import { TELEGRAM_CLIENT_ID } from "@/lib/constants";
import type { TelegramOidcAuthData } from "@/lib/auth";

/*
  Telegram's login script styles its own `.tg-auth-button` (blue pill). Restyle
  it as our primary button: full width, orange, black text, 12px corners.
*/
export const TG_PRIMARY_BUTTON = [
  "w-full",
  "[&_.tg-auth-button]:press [&_.tg-auth-button]:flex! [&_.tg-auth-button]:h-[50px]! [&_.tg-auth-button]:w-full!",
  "[&_.tg-auth-button]:items-center! [&_.tg-auth-button]:justify-center! [&_.tg-auth-button]:gap-2!",
  "[&_.tg-auth-button]:rounded-xl! [&_.tg-auth-button]:border-0! [&_.tg-auth-button]:px-5!",
  "[&_.tg-auth-button]:bg-primary! [&_.tg-auth-button]:text-primary-foreground!",
  "[&_.tg-auth-button]:font-sans! [&_.tg-auth-button]:text-[16px]! [&_.tg-auth-button]:font-bold!",
  "[&_.tg-auth-button]:shadow-none! [&_.tg-auth-button_svg]:fill-current!",
].join(" ");

interface TelegramLoginButtonProps {
  onAuth: (data: TelegramOidcAuthData) => void;
  className?: string;
}

/**
 * Renders Telegram's Login library (https://core.telegram.org/bots/telegram-login) —
 * the current OIDC-based login, which superseded the legacy iframe widget. The
 * script scans the DOM for a `.tg-auth-button` element and wires a popup-based
 * login flow to it; the onauth callback receives { id_token, user, error }.
 * The id_token is a signed JWT that must be verified server-side (JWKS), not a
 * hash to check against the bot token.
 */
export default function TelegramLoginButton({ onAuth, className }: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const callbackName = `telegramOidcCallback_${rawId}`;
    (window as unknown as Record<string, unknown>)[callbackName] = (data: TelegramOidcAuthData) =>
      onAuth(data);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "tg-auth-button";
    button.textContent = "Sign in with Telegram";

    const script = document.createElement("script");
    script.src = "https://oauth.telegram.org/js/telegram-login.js?5";
    script.async = true;
    script.setAttribute("data-client-id", TELEGRAM_CLIENT_ID);
    script.setAttribute("data-onauth", `${callbackName}(data)`);
    script.setAttribute("data-request-access", "write");

    container.appendChild(button);
    container.appendChild(script);

    return () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      container.innerHTML = "";
    };
  }, [onAuth, rawId]);

  return <div ref={containerRef} className={className} />;
}
