import {
  deepSnakeToCamelObjKeys,
  init,
  isColorDark,
  on,
  openLink,
  openTelegramLink,
  popup,
  postEvent,
  retrieveLaunchParams,
  retrieveRawInitData,
  shareStory,
  shareURL,
  swipeBehavior,
} from "@tma.js/sdk";
import type { ColorScheme, Platform, TelegramLaunch } from "./types";
import { requestConfirm } from "./confirm";

// "android_x" is Telegram X.
const MOBILE_CLIENTS = ["ios", "android", "android_x"];

// Everything goes through the SDK's Mini Apps bridge — we don't load
// telegram.org's telegram-web-app.js, so plain-browser users never download
// it and window.Telegram is never stubbed.

/** Same rule Telegram uses for colorScheme: derived from the background color. */
const schemeFromBg = (bgColor: string | undefined): ColorScheme | null =>
  bgColor ? (isColorDark(bgColor) ? "dark" : "light") : null;

/**
 * Synchronous hint: launch params only exist when Telegram opened the page
 * (the SDK reads them from the URL hash, then sessionStorage on reload).
 * Null in a plain browser. Not proof on its own — confirm with the async
 * isTMA("complete") check.
 */
export function readLaunch(): TelegramLaunch | null {
  try {
    const params = retrieveLaunchParams();
    const initData = params.tgWebAppData ? deepSnakeToCamelObjKeys(params.tgWebAppData) : undefined;
    const user = initData?.user;
    return {
      initDataRaw: retrieveRawInitData(),
      initData,
      user: user && {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
      },
      clientPlatform: params.tgWebAppPlatform,
      // Same camelCase shape the old SDK produced, so what /api/user stores
      // in Mongo doesn't change.
      raw: {
        initData,
        initDataRaw: retrieveRawInitData(),
        platform: params.tgWebAppPlatform,
        version: params.tgWebAppVersion,
        themeParams: deepSnakeToCamelObjKeys(params.tgWebAppThemeParams),
        startParam: params.tgWebAppStartParam,
        botInline: params.tgWebAppBotInline,
      },
    };
  } catch {
    return null;
  }
}

let initialized = false;

/**
 * One-time native setup once we know we're inside Telegram:
 * - init() the SDK (every SDK feature throws until it's called).
 * - `web_app_ready` drops Telegram's loading placeholder — without it the
 *   placeholder stays up until a fallback timeout (several seconds).
 * - Expand the sheet, and stop a downward scroll from closing the app.
 * Safe to call more than once.
 */
export function setupTelegram() {
  if (!initialized) {
    try {
      init();
      initialized = true;
    } catch {
      // No launch params (not really Telegram) — the raw events below still work.
    }
  }
  for (const event of ["web_app_ready", "web_app_expand"] as const) {
    try {
      postEvent(event);
    } catch {
      // Older clients may not support it — not fatal.
    }
  }
  try {
    if (swipeBehavior.isSupported()) {
      if (!swipeBehavior.isMounted()) swipeBehavior.mount();
      swipeBehavior.disableVertical();
    }
  } catch {
    // Older clients — swiping down closes the app as before.
  }
}

/** Runs an SDK call, falling back when the client doesn't support it. */
function tryOr(fn: () => void, fallback: () => void) {
  try {
    fn();
  } catch {
    fallback();
  }
}

export function createTelegramPlatform(launch: TelegramLaunch | null = readLaunch()): Platform {
  // Launch params carry the theme Telegram opened us with; theme_changed
  // events keep it current.
  let scheme = schemeFromBg(
    (launch?.raw as { themeParams?: { bgColor?: string } } | undefined)?.themeParams?.bgColor
  );

  return {
    kind: "telegram",
    launch,
    isMobileDevice: !!launch?.clientPlatform && MOBILE_CLIENTS.includes(launch.clientPlatform),
    capabilities: { stories: true },
    openLink: (url) =>
      tryOr(
        () => openLink(url),
        () => window.open(url, "_blank", "noopener,noreferrer")
      ),
    openTelegramLink: (url) =>
      tryOr(
        () => openTelegramLink(url),
        () => window.open(url, "_blank", "noopener,noreferrer")
      ),
    shareStory: (mediaUrl, { text, widget_link }) =>
      // Clients without story support (Bot API < 7.8) just do nothing.
      tryOr(
        () => shareStory(mediaUrl, { text, widgetLink: widget_link }),
        () => {}
      ),
    share: async ({ url, text }) => {
      try {
        shareURL(url, text);
        return "shared";
      } catch {
        // Share sheet unsupported on this client — copy the link instead.
        await navigator.clipboard.writeText(text ? `${text}\n${url}` : url);
        return "copied";
      }
    },
    confirm: async (options) => {
      const { title, message, confirmText, cancelText, destructive } = options;
      try {
        const buttonId = await popup.show({
          title,
          message,
          buttons: [
            { id: "confirm", type: destructive ? "destructive" : "default", text: confirmText },
            cancelText
              ? { id: "cancel", type: "default", text: cancelText }
              : { id: "cancel", type: "cancel" },
          ],
        });
        return buttonId === "confirm";
      } catch {
        // Popup API unsupported on this client — fall back to the in-app sheet.
        return requestConfirm(options);
      }
    },
    close: () =>
      tryOr(
        () => postEvent("web_app_close"),
        () => {}
      ),
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
