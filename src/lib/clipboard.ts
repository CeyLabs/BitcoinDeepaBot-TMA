/**
 * Copy text. The Clipboard API only exists in secure contexts (https, localhost)
 * and some in-app webviews block it, so fall back to a hidden textarea +
 * execCommand("copy"). Call from a tap handler. Throws if both fail.
 */
export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Denied (e.g. a webview without permission): try the old way below.
    }
  }
  if (!legacyCopy(text)) throw new Error("Copy failed");
}

function legacyCopy(text: string): boolean {
  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "");
  // Off-screen, and 16px so iOS doesn't zoom in on it.
  el.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0;font-size:16px";
  document.body.appendChild(el);
  const active = document.activeElement as HTMLElement | null;
  el.select();
  el.setSelectionRange(0, text.length); // iOS
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  el.remove();
  active?.focus({ preventScroll: true });
  return ok;
}
