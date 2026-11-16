"use client";

import { useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

// Chrome can fire beforeinstallprompt before any component mounts, so the
// listener lives at module level. This module is imported from the root
// layout (via PwaSetup) so it loads on every page.
let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    // No preventDefault(): keep Chrome's own install UI as well.
    deferred = event as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    installed = true;
    emit();
  });
}

export const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

// iPadOS reports itself as a Mac; touch points tell them apart.
export const isIos = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1);

/**
 * "prompt" — Chromium can show its native install dialog.
 * "ios"    — iOS Safari: show Add to Home Screen instructions.
 * null     — already installed, unsupported, or Chrome hasn't offered yet.
 */
export type InstallKind = "prompt" | "ios" | null;

function getInstallKind(): InstallKind {
  if (installed || isStandalone()) return null;
  if (deferred) return "prompt";
  return isIos() ? "ios" : null;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/** Reactive install state — updates when Chrome offers install late or the app gets installed. */
export function useInstallKind(): InstallKind {
  return useSyncExternalStore(subscribe, getInstallKind, () => null);
}

/** Shows Chrome's install dialog. The event is single-use; Chrome re-fires it if still installable. */
export async function promptInstall() {
  const event = deferred;
  if (!event) return;
  deferred = null;
  emit();
  await event.prompt().catch(() => {});
}
