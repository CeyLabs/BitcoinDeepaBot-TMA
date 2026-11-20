"use client";
// Rolling-digit number (after beui.dev/components/motion/number), built on CSS
// transitions + the Web Animations API instead of framer-motion — same look,
// ~100 KB less JavaScript on the wallet.

import { useEffect, useMemo, useRef, useState } from "react";
import { EASE_OUT_CSS } from "@/lib/ease";
import { cn } from "cn";

export interface NumberTickerProps {
  value: number;
  /** Digits to pad to (left). */
  pad?: number;
  /** Per-digit roll duration in seconds. */
  duration?: number;
  /** Stagger between digits. */
  stagger?: number;
  /** Render only after the element enters the viewport. */
  startOnView?: boolean;
  prefix?: string;
  suffix?: string;
  /** Add a small blur during digit rolls. */
  blur?: boolean;
  className?: string;
  digitClassName?: string;
  /** Insert locale group separators (commas). Server-component safe. */
  locale?: boolean;
  /** Custom formatter. Client-only — server components must use `locale` instead. */
  format?: (value: number) => string;
}

const DIGIT_HEIGHT_EM = 1.1;
const DIGITS = Array.from({ length: 10 }, (_, n) => n);

/** True once at least `amount` of the element has been visible (latches). */
function useInViewOnce(ref: React.RefObject<Element | null>, amount: number, enabled: boolean) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!enabled || inView || !node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: amount }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, amount, enabled, inView]);
  return inView;
}

export function NumberTicker({
  value,
  pad,
  duration = 0.9,
  stagger = 0.04,
  startOnView = true,
  prefix,
  suffix,
  blur = false,
  className,
  digitClassName,
  locale,
  format,
}: NumberTickerProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const inView = useInViewOnce(containerRef, 0.6, startOnView);
  const armed = !startOnView || inView;

  const text = useMemo(() => {
    const rounded = Math.round(value);
    const formatted = format
      ? format(rounded)
      : locale
        ? rounded.toLocaleString()
        : rounded.toString();
    return pad ? formatted.padStart(pad, "0") : formatted;
  }, [value, pad, format, locale]);
  const glyphs = useMemo(() => {
    const chars = text.split("");
    // Key by place value (position from the right): a changing digit keeps its
    // identity and rolls to the new value instead of remounting and replaying
    // from 0. Growing numbers add glyphs on the left without re-keying the
    // ones, tens, hundreds already on screen.
    return chars.map((char, i) => ({ char, id: `g-${chars.length - 1 - i}` }));
  }, [text]);
  const readableText = `${prefix ?? ""}${text}${suffix ?? ""}`;

  // Stagger is an entrance flourish. Once the reveal has played, value
  // changes roll every digit immediately — a per-digit delay on live updates
  // reads as lag.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!armed || entered) return;
    const total = (duration + glyphs.length * stagger) * 1000;
    const t = window.setTimeout(() => setEntered(true), total);
    return () => window.clearTimeout(t);
  }, [armed, entered, duration, stagger, glyphs.length]);

  return (
    <span ref={containerRef} className={cn("inline-flex items-center tabular-nums", className)}>
      <span className="sr-only">{readableText}</span>
      <span aria-hidden="true" className="inline-flex items-center">
        {prefix ? <span>{prefix}</span> : null}
        {glyphs.map(({ char, id }, i) => {
          if (!/\d/.test(char)) {
            return (
              <span key={id} className="inline-block">
                {char}
              </span>
            );
          }
          return (
            <Digit
              key={id}
              digit={armed ? Number(char) : 0}
              delay={entered ? 0 : i * stagger}
              duration={duration}
              blur={blur}
              className={digitClassName}
            />
          );
        })}
        {suffix ? <span>{suffix}</span> : null}
      </span>
    </span>
  );
}

function Digit({
  digit,
  delay,
  duration,
  blur,
  className,
}: {
  digit: number;
  delay: number;
  duration: number;
  blur: boolean;
  className?: string;
}) {
  const columnRef = useRef<HTMLSpanElement>(null);

  // Optional blur-in on each roll (native Web Animations API).
  useEffect(() => {
    const node = columnRef.current;
    if (!blur || !node || typeof node.animate !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = node.animate([{ filter: "blur(10px)" }, { filter: "blur(0px)" }], {
      duration: Math.min(duration * 0.75, 0.32) * 1000,
      delay: delay * 1000,
      easing: EASE_OUT_CSS,
      fill: "backwards",
    });
    return () => animation.cancel();
  }, [blur, delay, digit, duration]);

  return (
    <span
      className={cn("relative inline-block overflow-hidden", className)}
      style={{ height: `${DIGIT_HEIGHT_EM}em`, width: "1ch" }}
    >
      <span
        ref={columnRef}
        // The transition goes through a CSS variable: an inline `transition`
        // would beat motion-reduce:transition-none.
        className="absolute inset-x-0 top-0 flex flex-col items-center will-change-transform [transition:var(--roll)] motion-reduce:transition-none"
        style={
          {
            transform: `translateY(-${digit * DIGIT_HEIGHT_EM}em)`,
            "--roll": `transform ${duration}s ${EASE_OUT_CSS} ${delay}s`,
          } as React.CSSProperties
        }
      >
        {DIGITS.map((n) => (
          <span key={n} className="flex h-[1.1em] items-center justify-center leading-none">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}
