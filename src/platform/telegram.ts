import {
  initPopup,
  initUtils,
  isColorDark,
  on,
  postEvent,
  retrieveLaunchParams,
} from "@telegram-apps/sdk-react";
import type { ColorScheme, Platform, TelegramLaunch } from "./types";

const MOBILE_CLIENTS = ["ios", "android"];

// Everything goes through the SDK's Mini Apps bridge — we don't load
// telegram.org's telegram-web-app.js, so plain-browser users never download
// it and window.Telegram is never stubbed.

/** Same rule Telegram uses for colorScheme: derived from the background color. */
const schemeFromBg = (bgColor: string | undefined): ColorScheme | null =>
  bgColor ? (isColorDark(bgColor) ? "dark" : "light") : null;

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
  // Launch params carry the theme Telegram opened us with; theme_changed
  // events keep it current.
  let scheme = schemeFromBg(
    (launch?.raw as { themeParams?: { bgColor?: string } } | undefined)?.themeParams?.bgColor
  );
  const utils = () => initUtils();

  return {
    kind: "telegram",
    launch,
    isMobileDevice: !!launch?.clientPlatform && MOBILE_CLIENTS.includes(launch.clientPlatform),
    capabilities: { stories: true },
    openLink: (url) => utils().openLink(url),
    openTelegramLink: (url) => utils().openTelegramLink(url),
    shareStory: (mediaUrl, { text, widget_link }) =>
      // Not typed in this SDK version (Bot API 7.8+); clients without
      // support ignore it.
      (postEvent as unknown as (method: string, params: unknown) => void)(
        "web_app_share_to_story",
        { media_url: mediaUrl, text, widget_link }
      ),
    share: async ({ url, text }) => {
      utils().shareURL(url, text);
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
    getColorScheme: () => scheme,
    onColorSchemeChange: (onChange) =>
      on("theme_changed", ({ theme_params }) => {
        const next = schemeFromBg(theme_params.bg_color);
        if (next && next !== scheme) {
          scheme = next;
          onChange(next);
        }
      }),
  };
}
