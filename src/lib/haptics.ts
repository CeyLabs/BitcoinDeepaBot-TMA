import { initHapticFeedback } from "@telegram-apps/sdk-react";

type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type NotificationType = "success" | "warning" | "error";

function withHaptics(fn: (haptic: ReturnType<typeof initHapticFeedback>) => void) {
  try {
    fn(initHapticFeedback());
  } catch {
    // Not running inside Telegram (e.g. opened directly in a browser during
    // local development) — skip instead of crashing the app.
  }
}

export const haptic = {
  impact: (style: ImpactStyle = "light") => withHaptics((h) => h.impactOccurred(style)),
  notify: (type: NotificationType) => withHaptics((h) => h.notificationOccurred(type)),
  select: () => withHaptics((h) => h.selectionChanged()),
};
