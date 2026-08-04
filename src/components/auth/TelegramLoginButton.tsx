"use client";

import { useEffect, useId, useRef } from "react";
import { TELEGRAM_BOT_USERNAME } from "@/lib/constants";
import type { TelegramWidgetUser } from "@/lib/auth";

interface TelegramLoginButtonProps {
  onAuth: (user: TelegramWidgetUser) => void;
  className?: string;
}

/**
 * Renders Telegram's official Login Widget (https://core.telegram.org/widgets/login).
 * This is a separate auth mechanism from the Mini App SDK's initData — it's the
 * OAuth-style flow meant for regular web pages opened outside Telegram, and requires
 * the bot's domain to be registered via @BotFather (/setdomain).
 */
export default function TelegramLoginButton({ onAuth, className }: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const callbackName = `telegramLoginCallback_${rawId}`;
    (window as unknown as Record<string, unknown>)[callbackName] = (user: TelegramWidgetUser) =>
      onAuth(user);

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", TELEGRAM_BOT_USERNAME);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", `${callbackName}(user)`);
    script.setAttribute("data-request-access", "write");

    container.appendChild(script);

    return () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      container.innerHTML = "";
    };
  }, [onAuth, rawId]);

  return <div ref={containerRef} className={className} />;
}
