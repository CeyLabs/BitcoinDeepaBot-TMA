"use client";

import { useEffect, useId, useRef } from "react";
import { TELEGRAM_CLIENT_ID } from "@/lib/constants";
import type { TelegramOidcAuthData } from "@/lib/auth";

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
    button.textContent = "Sign In with Telegram";

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
