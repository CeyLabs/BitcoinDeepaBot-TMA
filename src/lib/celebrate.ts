import { haptic } from "@/platform";

/**
 * Confetti: one short burst (about a second) plus a success haptic.
 * canvas-confetti loads only when this runs, and it skips itself for reduced
 * motion.
 */
export async function celebrate() {
  haptic.notify("success");
  const confetti = (await import("canvas-confetti")).default;
  confetti({
    disableForReducedMotion: true,
    zIndex: 9999,
    particleCount: 70,
    spread: 70,
    startVelocity: 38,
    gravity: 1.2,
    ticks: 110,
    scalar: 0.9,
    origin: { y: 0.6 },
  });
}
