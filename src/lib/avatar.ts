import { Avatar, Style, type StyleDefinition } from "@dicebear/core";
import sprouts from "@dicebear/styles/sprouts.json";

/*
  Profile pictures: DiceBear "Sprouts" (CC0), drawn in the browser from a seed
  the backend keeps on the user (PATCH /user/avatar). The palette is the
  brand's: a Bitcoin-orange pot, a Lanka-teal
  plant and saffron / orange / maroon / flame blooms. DiceBear picks one of
  each list per seed, so a seed always draws the same sprout.
  No background: UserAvatar paints the circle per theme (black on light,
  cream on dark). DiceBear picks each part by its own key, so dropping the
  background leaves every seed's sprout unchanged.
*/
const PALETTE = {
  backgroundColor: [] as string[],
  bloomColor: ["ffbe2b", "ea7400", "8d183a", "e74126"],
  plantColor: ["00544f"],
  potColor: ["f8931a"],
};

/** Sprouts' idle animation (sway, blink). "none" gives a still picture. */
export type AvatarMotion = "none" | "slowest" | "slow" | "medium" | "fast" | "fastest";

/** How fast profile pictures move. The SVG goes still under prefers-reduced-motion. */
export const AVATAR_MOTION: AvatarMotion = "medium";

const cache = new Map<string, string | null>();
let style: Style | undefined;

/**
 * Built on first use, not at import: DiceBear clones its definition with
 * structuredClone, which iOS before 15.4 lacks, and a throw at import would
 * take the app down. The style is plain JSON, so a JSON round-trip stands in.
 */
function getStyle(): Style {
  if (!style) {
    if (typeof globalThis.structuredClone !== "function") {
      globalThis.structuredClone = <T>(v: T): T =>
        v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T);
    }
    style = new Style(sprouts as StyleDefinition);
  }
  return style;
}

/**
 * The avatar for a seed as an SVG data URI, or null if it can't be drawn (the
 * caller falls back). Cached per seed and motion. The circle is clipped inside
 * the SVG and it has an intrinsic size, since iOS Safari neither clips an
 * <img> reliably with border-radius nor sizes a viewBox-only SVG squarely.
 */
export function avatarUri(seed: string, motion: AvatarMotion = AVATAR_MOTION): string | null {
  const key = `${motion}:${seed}`;
  if (cache.has(key)) return cache.get(key) ?? null;
  let uri: string | null = null;
  try {
    uri = new Avatar(getStyle(), {
      seed,
      size: 128,
      borderRadius: 50,
      ...PALETTE,
      animationVariant: motion,
    }).toDataUri();
  } catch (e) {
    console.warn("avatar: could not render", e);
  }
  cache.set(key, uri);
  return uri;
}

/** A fresh seed for the picker; the backend accepts 1–64 of [A-Za-z0-9_-]. */
export function randomSeed(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
