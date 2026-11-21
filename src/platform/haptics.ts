import { hapticFeedback } from "@tma.js/sdk";

type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type NotificationType = "success" | "warning" | "error";

/*
 * One haptic API for every platform (same call sites everywhere):
 * - Telegram Mini App: Telegram's native haptics.
 * - Web / installed PWA on Android: the Vibration API, with CeyFi's patterns.
 *   Off with prefers-reduced-motion (same intent as no animations).
 * - iOS Safari / PWA: no web API can buzz on demand; taps get a real haptic
 *   from the app-wide layer (HapticsLayer, ios-haptics), so these are no-ops.
 */

function telegram(fn: () => void): boolean {
  try {
    if (!hapticFeedback.isSupported()) return false;
    fn();
    return true;
  } catch {
    // Not inside Telegram (a browser), or the SDK isn't initialized yet
    return false;
  }
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers throw without a recent user gesture
  }
}

/** Vibration lengths (ms) per impact style, light → firm (CeyFi: tap 6, confirm 10, warn 18). */
const IMPACT_MS: Record<ImpactStyle, number> = {
  soft: 6,
  light: 6,
  medium: 10,
  rigid: 14,
  heavy: 18,
};

const NOTIFY_PATTERN: Record<NotificationType, number | number[]> = {
  /** Celebratory pulse, pairs with confetti */
  success: [10, 50, 20],
  /** A single firm pulse: softer than error, heavier than a tap */
  warning: 18,
  /** Double buzz, so it reads as wrong, not just a tap */
  error: [8, 40, 8],
};

/**
 * When a screen last gave its own haptic. The app-wide tap haptic
 * (HapticsLayer) skips a tap that already got one, so it never doubles up.
 */
let lastExplicitAt = -Infinity;
export const lastHapticAt = () => lastExplicitAt;

function explicit(run: () => void) {
  lastExplicitAt = performance.now();
  run();
}

export const haptic = {
  impact: (style: ImpactStyle = "medium") =>
    explicit(() => {
      if (!telegram(() => hapticFeedback.impactOccurred(style))) vibrate(IMPACT_MS[style]);
    }),
  notify: (type: NotificationType) =>
    explicit(() => {
      if (!telegram(() => hapticFeedback.notificationOccurred(type))) {
        vibrate(NOTIFY_PATTERN[type]);
      }
    }),
  select: () =>
    explicit(() => {
      if (!telegram(() => hapticFeedback.selectionChanged())) vibrate(6);
    }),
};

/** The light tick every tap gets from HapticsLayer (not counted as a screen's own haptic). */
export function tapHaptic() {
  if (!telegram(() => hapticFeedback.selectionChanged())) vibrate(6);
}
