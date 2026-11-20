"use client";

import { useEffect } from "react";
import { hapticTrigger } from "ios-haptics";
import { lastHapticAt, tapHaptic } from "./haptics";
import { usePlatform } from "./PlatformProvider";

/*
 * Haptic feedback for everything tappable, mounted once (CeyFi's
 * providers/haptics.tsx), so sheets, lists and future screens get it without
 * wiring each call site:
 *
 * - Every tap: a light tick (Telegram's selection haptic in the Mini App, a
 *   short vibration on Android web). Skipped when the screen already gave its
 *   own haptic for that tap (haptic.impact/notify/select), so it never doubles.
 * - iOS Safari / installed PWA (not Telegram, which has native haptics):
 *   `hapticTrigger` overlays a transparent label on each target, wired to a
 *   hidden native switch: the only way Safari produces a real tap haptic. A
 *   MutationObserver arms targets as they mount.
 *
 * Links need one extra step on iOS. The haptic is the label's default action
 * (forwarding the click to the switch), and a link's handlers cancel it: Next's
 * <Link> calls preventDefault to navigate on the client. So a tap on a label
 * inside a link is kept away from the link, and the link gets an equivalent
 * click of its own.
 *
 * The label's activation also fires a simulated click on the hidden switch.
 * It's stopped at the window: Base UI watches `click` on the document for taps
 * outside a sheet, and would otherwise close a sheet the first click opened.
 *
 * Opt a target out with `data-no-haptic` (the hold button handles its own).
 */
const TAPPABLE = ["button", '[role="button"]', "a[href]", "summary"];
const SELECTOR = TAPPABLE.map((s) => `${s}:not([data-no-haptic])`).join(", ");

/** A screen's own haptic this recently (ms) means the tap already got one. */
const OWN_HAPTIC_WINDOW_MS = 300;

function arm(node: Node) {
  if (!(node instanceof HTMLElement)) return;
  if (node.matches(SELECTOR)) hapticTrigger(node);
  node.querySelectorAll<HTMLElement>(SELECTOR).forEach(hapticTrigger);
}

function isDisabled(el: Element) {
  return (el as HTMLButtonElement).disabled || el.getAttribute("aria-disabled") === "true";
}

const isTriggerLabel = (t: EventTarget | null): t is HTMLLabelElement =>
  t instanceof HTMLLabelElement && t.hasAttribute("data-haptic-trigger");

/** A tap on a link's overlay: let the label do its thing, and give the link a click of its own. */
function relayLinkTap(e: MouseEvent) {
  if (!isTriggerLabel(e.target) || e.button !== 0) return;
  const link = e.target.closest<HTMLAnchorElement>("a[href]");
  if (!link) return;
  e.stopPropagation();
  link.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      metaKey: e.metaKey,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
    })
  );
}

/** The simulated click on the hidden switch: keep it from everyone else. */
function hideSwitchClick(e: MouseEvent) {
  const t = e.target;
  if (
    t instanceof HTMLInputElement &&
    t.hasAttribute("switch") &&
    t.parentElement?.hasAttribute("data-haptic-trigger")
  ) {
    e.stopImmediatePropagation();
  }
}

export function HapticsLayer() {
  const { kind } = usePlatform();

  // Every platform: a tick for a tap that didn't get a haptic of its own
  useEffect(() => {
    const onTap = (e: MouseEvent) => {
      const t = e.target as Element | null;
      // A tap on a link's overlay is relayed as a click on the link: that one counts
      if (isTriggerLabel(t) && t.closest("a[href]")) return;
      const el = t?.closest?.(SELECTOR);
      if (!el || isDisabled(el)) return;
      // After the tap's own handlers have run
      window.setTimeout(() => {
        if (performance.now() - lastHapticAt() > OWN_HAPTIC_WINDOW_MS) tapHaptic();
      }, 0);
    };
    document.addEventListener("click", onTap, true);
    return () => document.removeEventListener("click", onTap, true);
  }, []);

  // iOS web/PWA only: the hidden-switch overlay (hapticTrigger is a no-op off iOS)
  useEffect(() => {
    if (kind !== "web") return;
    arm(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) m.addedNodes.forEach(arm);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("click", hideSwitchClick, true);
    document.addEventListener("click", relayLinkTap, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("click", hideSwitchClick, true);
      document.removeEventListener("click", relayLinkTap, true);
    };
  }, [kind]);

  return null;
}
