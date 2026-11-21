import type { Platform, ShareInput, ShareResult } from "./types";
import { requestConfirm } from "./confirm";
import { copyText } from "@/lib/clipboard";

function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData;
  if (uaData?.mobile) return true;
  // iPadOS reports itself as a Mac; touch points tell them apart.
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1)
  );
}

/**
 * Replaces the light/dark theme-color metas from layout.tsx with one tag in
 * the page's actual colour: the app's Appearance setting can differ from the
 * OS, and some screens (the landing) use another surface.
 */
export function setThemeColorMeta(hex: string) {
  if (typeof document === "undefined") return;
  const metas = document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  metas.forEach((meta, i) => {
    if (i > 0) meta.remove();
  });
  let meta = metas[0];
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.removeAttribute("media");
  meta.content = hex;
}

function openInNewTab(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

async function shareOrCopy({ url, text }: ShareInput): Promise<ShareResult> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ url, text });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "dismissed";
      // Other failures (e.g. not allowed here) — fall back to copying.
    }
  }
  await copyText(text ? `${text}\n${url}` : url);
  return "copied";
}

/** Plain browser / installed PWA. Also used as the fallback while detection runs. */
export function createWebPlatform(kind: Platform["kind"] = "web"): Platform {
  return {
    kind,
    launch: null,
    isMobileDevice: isMobileBrowser(),
    capabilities: { stories: false },
    openLink: openInNewTab,
    openTelegramLink: openInNewTab,
    shareStory: () => {
      throw new Error("Story sharing is only available inside Telegram");
    },
    share: shareOrCopy,
    // In-app sheet rather than the browser's native confirm() box
    confirm: requestConfirm,
    // The web login already asks for it (data-request-access="write")
    requestWriteAccess: async () => false,
    setChromeColor: setThemeColorMeta,
    close: () => {},
    getColorScheme: () => null,
    onColorSchemeChange: () => null,
  };
}
