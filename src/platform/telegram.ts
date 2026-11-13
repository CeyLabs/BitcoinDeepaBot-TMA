import { initPopup, postEvent, retrieveLaunchParams } from "@telegram-apps/sdk-react";
import type { ColorScheme, Platform, StoryParams, TelegramLaunch } from "./types";

const MOBILE_CLIENTS = ["ios", "android"];

interface TelegramWebApp {
  colorScheme?: ColorScheme;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  shareToStory(mediaUrl: string, params: StoryParams): void;
  onEvent(event: string, handler: () => void): void;
  offEvent?(event: string, handler: () => void): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

function getWebApp(): TelegramWebApp {
  const webApp = window.Telegram?.WebApp;
  if (!webApp) throw new Error("Telegram WebApp is not available");
  return webApp;
}

/**
 * Synchronous hint: launch params only exist when Telegram opened the page
 * (the SDK reads them from the URL hash, then sessionStorage on reload).
 * Throws/null in a plain browser. Not proof on its own — confirm with the
 * async isTMA("complete") check.
 */
export function readLaunch(): TelegramLaunch | null {
  try {
    const raw = retrieveLaunchParams();
    return {
      initDataRaw: raw.initDataRaw,
      initData: raw.initData,
      user: raw.initData?.user,
      clientPlatform: raw.platform,
      raw,
    };
  } catch {
    return null;
  }
}

/** One-time native setup once we know we're inside Telegram. */
export function setupTelegram() {
  try {
    postEvent("web_app_expand");
  } catch {
    // Older clients may not support it — not fatal.
  }
}

export function createTelegramPlatform(launch: TelegramLaunch | null = readLaunch()): Platform {
  return {
    kind: "telegram",
    launch,
    isMobileDevice: !!launch?.clientPlatform && MOBILE_CLIENTS.includes(launch.clientPlatform),
    capabilities: { stories: true },
    openLink: (url) => getWebApp().openLink(url),
    openTelegramLink: (url) => getWebApp().openTelegramLink(url),
    shareStory: (mediaUrl, params) => getWebApp().shareToStory(mediaUrl, params),
    share: async ({ url, text }) => {
      const params = new URLSearchParams({ url });
      if (text) params.set("text", text);
      getWebApp().openTelegramLink(`https://t.me/share/url?${params}`);
      return "shared";
    },
    confirm: async ({ title, message, confirmText, destructive }) => {
      try {
        const buttonId = await initPopup().open({
          title,
          message,
          buttons: [
            { id: "confirm", type: destructive ? "destructive" : "default", text: confirmText },
            { id: "cancel", type: "cancel" },
          ],
        });
        return buttonId === "confirm";
      } catch {
        // Popup API unsupported on this client — fall back to the browser dialog.
        return window.confirm(`${title}\n\n${message}`);
      }
    },
    getColorScheme: () => window.Telegram?.WebApp?.colorScheme ?? null,
    onColorSchemeChange: (onChange) => {
      const webApp = window.Telegram?.WebApp;
      if (!webApp) return null;
      const emit = () => {
        if (webApp.colorScheme) onChange(webApp.colorScheme);
      };
      webApp.onEvent("themeChanged", emit);
      return () => webApp.offEvent?.("themeChanged", emit);
    },
  };
}
