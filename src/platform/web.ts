import type { Platform } from "./types";

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

function openInNewTab(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
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
    confirm: async ({ title, message }) => window.confirm(`${title}\n\n${message}`),
    getColorScheme: () => null,
    onColorSchemeChange: () => null,
  };
}
