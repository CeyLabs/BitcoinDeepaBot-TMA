import { haptic } from "@/platform";

/**
 * Confetti: a short burst, then two side streams for ~2.5s, plus a success
 * haptic. canvas-confetti loads only when this runs, and it skips itself for
 * reduced motion. Ported from CeyFi.
 */
export async function celebrate() {
  haptic.notify("success");
  const confetti = (await import("canvas-confetti")).default;
  const base = { disableForReducedMotion: true, zIndex: 9999 };
  confetti({ ...base, particleCount: 100, spread: 70, origin: { y: 0.6 } });
  const end = Date.now() + 2500;
  const side = { ...base, startVelocity: 25, spread: 360, ticks: 50 };
  const between = (a: number, b: number) => Math.random() * (b - a) + a;
  const id = setInterval(() => {
    const left = end - Date.now();
    if (left <= 0) return clearInterval(id);
    const particleCount = 40 * (left / 2500);
    confetti({ ...side, particleCount, origin: { x: between(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...side, particleCount, origin: { x: between(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}
