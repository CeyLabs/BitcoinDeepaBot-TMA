import { hapticFeedback } from "@tma.js/sdk";

type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type NotificationType = "success" | "warning" | "error";

function withHaptics(fn: () => void) {
  try {
    if (hapticFeedback.isSupported()) fn();
  } catch {
    // Not running inside Telegram (e.g. a browser) or the SDK isn't
    // initialized yet — skip instead of crashing the app.
  }
}

export const haptic = {
  impact: (style: ImpactStyle = "medium") =>
    withHaptics(() => hapticFeedback.impactOccurred(style)),
  notify: (type: NotificationType) => withHaptics(() => hapticFeedback.notificationOccurred(type)),
  select: () => withHaptics(() => hapticFeedback.selectionChanged()),
};
