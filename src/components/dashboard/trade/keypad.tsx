"use client";

import { useEffect, useRef } from "react";
import { cn } from "cn";
import { haptic } from "@/platform";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"] as const;
const MAX_DIGITS = 9;

/** The amount after a key press: digits only, no leading zeros, at most 9 digits. */
export function applyKey(value: string, key: string): string {
  if (key === "del") return value.slice(0, -1);
  const next = (value + key).replace(/^0+/, "");
  return next.length > MAX_DIGITS ? value : next;
}

/** 3×4 number pad (1–9, 00, 0, backspace). */
export function Keypad({ onKey }: { onKey: (key: string) => void }) {
  useKeyboardDigits(onKey);

  return (
    <div className="grid grid-cols-3 gap-0.5 pt-2">
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          aria-label={k === "del" ? "Delete" : k}
          onClick={() => {
            haptic.select();
            onKey(k);
          }}
          className="press font-display active:bg-line flex h-[54px] items-center justify-center rounded-xl border-0 bg-transparent text-[25px] font-medium [@media(max-height:720px)]:h-[46px]"
        >
          {k === "del" ? (
            <svg
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 5H8l-6 7 6 7h13a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zM12 9l6 6M18 9l-6 6" />
            </svg>
          ) : (
            k
          )}
        </button>
      ))}
    </div>
  );
}

/** Typing on a physical keyboard (web) drives the pad too. */
function useKeyboardDigits(onKey: (key: string) => void) {
  const onKeyRef = useRef(onKey);
  useEffect(() => {
    onKeyRef.current = onKey;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      if (/^\d$/.test(e.key)) onKeyRef.current(e.key);
      else if (e.key === "Backspace") onKeyRef.current("del");
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

/** Big centered amount with its unit ("රු. 5,000" / "120,000 sats"). */
export function AmountDisplay({
  value,
  prefix,
  suffix,
  invalid,
}: {
  value: string;
  prefix?: string;
  suffix?: string;
  invalid?: boolean;
}) {
  const n = Number(value) || 0;
  return (
    <p
      aria-live="polite"
      className={cn(
        "num inline-flex items-baseline gap-2 text-[44px] leading-[1.1] font-bold tracking-[-0.02em] transition-colors duration-200 [@media(max-height:720px)]:text-[40px]",
        !n && "text-ink3",
        invalid && "text-loss"
      )}
    >
      {prefix && <span className="text-ink3 text-[20px] font-bold">{prefix}</span>}
      <span>{n ? n.toLocaleString("en-US") : "0"}</span>
      {suffix && <span className="text-ink3 text-[20px] font-bold">{suffix}</span>}
    </p>
  );
}

/** Line under the amount: the estimate, the limits, or what's wrong (red). */
export function AmountHint({
  children,
  invalid,
}: {
  children: React.ReactNode;
  invalid?: boolean;
}) {
  return (
    <p
      className={cn(
        "min-h-5 text-[14px] leading-5 font-semibold",
        invalid ? "text-loss" : "text-ink2"
      )}
    >
      {children}
    </p>
  );
}

/** "Enter in rupees" / "Enter in sats" pill. */
export function SwapUnitPill({
  label,
  flipped,
  onClick,
}: {
  label: string;
  flipped: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        haptic.select();
        onClick();
      }}
      className="press hit bg-chip text-foreground mt-1 inline-flex h-8 items-center gap-1.5 rounded-full border-0 px-3 text-[13px] font-bold"
    >
      <svg
        className={cn(
          "size-3.5 transition-transform duration-[450ms] ease-[cubic-bezier(.3,1.4,.5,1)]",
          flipped && "rotate-180"
        )}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M7 4v16M3 8l4-4 4 4M17 20V4M21 16l-4 4-4-4" />
      </svg>
      {label}
    </button>
  );
}

/** Row of quick amounts under the display. */
export function Presets({
  items,
}: {
  items: { label: string; on: boolean; disabled?: boolean; pick: () => void }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-2 pt-2.5">
      {items.map((p) => (
        <button
          key={p.label}
          type="button"
          aria-pressed={p.on}
          disabled={p.disabled}
          onClick={() => {
            haptic.select();
            p.pick();
          }}
          className={cn(
            "press hit h-9 rounded-xl border-0 px-3 text-[13px] font-bold transition-colors disabled:opacity-40",
            p.on ? "bg-inv text-on-inv" : "bg-chip text-foreground"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/** Centered amount block: display, hint, optional unit switch. */
export function AmountBlock({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center gap-1 pt-3 pb-0.5 text-center">{children}</div>;
}

/** Small grey line under the pad ("1 BTC ≈ රු. … · 1.5% fee"). */
export function PriceFooter({ children }: { children: React.ReactNode }) {
  return <p className="text-ink3 num mt-1 text-center text-[12px] font-semibold">{children}</p>;
}
