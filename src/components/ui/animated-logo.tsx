"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "cn";
import { LOGO_VIEWBOX, MASK_PIECES, WORDMARK_INK, WORDMARK_ORANGE } from "./logo-paths";

/** How long the whole draw-in takes (keep in step with styles/theme.css). */
const DRAW_SECONDS = 3.6;

let hydrated = false;

/**
 * Seconds into the draw-in. The animation starts with the server-rendered
 * HTML, and the landing swaps screens (platform detection, then sign-in or
 * welcome) which mounts a new logo: that one carries on from where the page
 * is (negative delays) instead of starting over. null once it's finished.
 * Put the result on an ancestor as --yaka-t0 (the glow uses it too).
 */
export function useDrawOffset(): number | null {
  const [offset] = useState<number | null>(() => {
    // Server render and hydration: the start (they must match).
    if (typeof window === "undefined" || !hydrated) return 0;
    const paint = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
    const elapsed = (performance.now() - paint) / 1000;
    return elapsed < DRAW_SECONDS ? elapsed : null;
  });
  useEffect(() => {
    hydrated = true;
  }, []);
  return offset;
}

const STOPS: [offset: string, color: string][] = [
  ["0", "#f6921e"],
  [".44", "#f2801f"],
  [".67", "#ee6b21"],
  [".91", "#e94d24"],
  ["1", "#e74126"],
];

const MASK_FILL = MASK_PIECES.map(([d]) => d).join("");

/**
 * The Bitcoin Deepa logo drawn by hand: the Yaka mask's lines start at the
 * eyes and spread outward, then the mask fills in and "bitcoin දීප" rises in
 * underneath. Inline SVG, animated with CSS (styles/theme.css, `.yaka`), so it
 * starts with the server-rendered HTML, before hydration. Fills its
 * (positioned, sized) parent like <Logo>.
 */
export function AnimatedLogo({
  offset,
  className,
}: {
  /** From useDrawOffset(); null shows the finished logo. */
  offset: number | null;
  className?: string;
}) {
  // SVG ids must be unique on the page and plain (useId has colons etc.)
  const id = `yaka${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const draw = offset !== null;

  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      role="img"
      aria-label="Bitcoin Deepa"
      className={cn("yaka absolute inset-0 size-full", draw && "yaka-draw", className)}
    >
      <defs>
        {/* Same gradients as the logo files: left-to-right fill, diagonal stroke */}
        <linearGradient
          id={`${id}f`}
          x1=".5"
          y1="334.41"
          x2="543.34"
          y2="334.41"
          gradientUnits="userSpaceOnUse"
        >
          {STOPS.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
        <linearGradient
          id={`${id}s`}
          x1="41.01"
          y1="610.41"
          x2="502.82"
          y2="148.6"
          gradientUnits="userSpaceOnUse"
        >
          {STOPS.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
      </defs>
      <path
        className="yaka-fill"
        d={MASK_FILL}
        fill={`url(#${id}f)`}
        stroke={`url(#${id}s)`}
        strokeMiterlimit={10}
      />
      {draw && (
        <g className="yaka-lines" fill="none" stroke={`url(#${id}s)`} strokeLinecap="round">
          {MASK_PIECES.map(([d, length, t]) => (
            <path
              key={d}
              d={d}
              style={{
                strokeDasharray: length,
                strokeDashoffset: length,
                // Eyes first, the farthest flames last
                animationDelay: `${(0.3 + t * 1.4 - (offset ?? 0)).toFixed(2)}s`,
              }}
            />
          ))}
        </g>
      )}
      <g className="yaka-word">
        {WORDMARK_INK.map((d) => (
          <path key={d} d={d} className="fill-foreground" />
        ))}
        {WORDMARK_ORANGE.map((d) => (
          <path key={d} d={d} fill="#f8931a" />
        ))}
      </g>
    </svg>
  );
}
