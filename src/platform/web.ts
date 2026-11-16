import type { Platform, ShareInput, ShareResult } from "./types";

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
  await navigator.clipboard.writeText(text ? `${text}\n${url}` : url);
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
    confirm: async ({ title, message }) => window.confirm(`${title}\n\n${message}`),
    getColorScheme: () => null,
    onColorSchemeChange: () => null,
  };
}
