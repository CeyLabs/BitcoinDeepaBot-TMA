"use client";

import { useState } from "react";
import { cn } from "cn";
import { BtcSign } from "@/components/ui/btc-sign";
import { Button } from "@/components/ui/button";
import { haptic } from "@/platform";

export type Unit = "lkr" | "sats";

const MAX_DIGITS = 9;

/** Whole numbers only (sats and rupees are both whole here), no leading zeros, ≤ 9 digits. */
const clean = (v: string) => v.replace(/\D/g, "").replace(/^0+/, "").slice(0, MAX_DIGITS);

const group = (n: number) => (n > 0 ? Math.round(n).toLocaleString("en-US") : "");

/**
 * Two-box amount entry: type in either currency and the other follows. The box
 * typed in is "active" and holds the exact value; the other is the conversion.
 */
export function useDualAmount({
  initial,
  toSats,
  toLkr,
}: {
  /** The box that starts active (and on top). */
  initial: Unit;
  toSats: (lkr: number) => number;
  toLkr: (sats: number) => number;
}) {
  const [s, setS] = useState<{ active: Unit; raw: string; flipped: boolean }>({
    active: initial,
    raw: "",
    flipped: false,
  });
  const n = Number(s.raw) || 0;
  const lkr = s.active === "lkr" ? n : n ? toLkr(n) : 0;
  const sats = s.active === "sats" ? n : n ? toSats(n) : 0;
  const set = (unit: Unit, value: string | number) =>
    setS((p) => ({ ...p, active: unit, raw: clean(String(value)) }));
  return {
    active: s.active,
    hasValue: n > 0,
    lkr,
    sats,
    /** What each box shows: the typed value (grouped) or the conversion. */
    text: (unit: Unit) => group(unit === "lkr" ? lkr : sats),
    set,
    flipped: s.flipped,
    toggleFlip: () => setS((p) => ({ ...p, flipped: !p.flipped })),
  };
}

export type DualAmountState = ReturnType<typeof useDualAmount>;

function UnitPill({ unit }: { unit: Unit }) {
  return (
    <span className="bg-card inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full pr-3 pl-1 text-[14px] font-bold">
      {unit === "sats" ? (
        <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-[15px]">
          <BtcSign />
        </span>
      ) : (
        <span className="bg-inv text-on-inv flex size-7 items-center justify-center rounded-full text-[10px] font-bold">
          රු
        </span>
      )}
      {unit === "sats" ? "sats" : "LKR"}
    </span>
  );
}

function Box({
  id,
  unit,
  label,
  d,
  invalid,
}: {
  id: string;
  unit: Unit;
  label: string;
  d: DualAmountState;
  invalid?: boolean;
}) {
  const active = d.active === unit && d.hasValue;
  return (
    <div
      className={cn(
        "rounded-[20px] px-4 pt-3 pb-3.5 transition-[background-color,box-shadow] duration-200",
        active ? "bg-card" : "bg-chip focus-within:bg-card",
        invalid
          ? "shadow-[0_0_0_2px_var(--destructive)]"
          : active
            ? "shadow-[0_0_0_2px_var(--primary)]"
            : "focus-within:shadow-[0_0_0_2px_var(--primary)]"
      )}
    >
      <label htmlFor={id} className="text-ink2 block text-[12px] font-semibold">
        {label}
      </label>
      <div className="mt-1 flex items-center gap-2.5">
        <input
          id={id}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          placeholder="0"
          value={d.text(unit)}
          onChange={(e) => d.set(unit, e.target.value)}
          className={cn(
            "num placeholder:text-ink3 min-w-0 flex-1 border-0 bg-transparent p-0 text-[30px] leading-[1.2] font-bold tracking-[-0.02em] outline-none",
            active ? "text-foreground" : "text-ink2",
            invalid && "text-loss"
          )}
        />
        <UnitPill unit={unit} />
      </div>
    </div>
  );
}

/** "You pay" / "You get" boxes with a swap button between them. */
export function DualAmount({
  id,
  d,
  top,
  bottom,
  invalid,
}: {
  id: string;
  d: DualAmountState;
  /** The box on top before any swap. */
  top: { unit: Unit; label: string };
  bottom: { unit: Unit; label: string };
  invalid?: boolean;
}) {
  return (
    <div className={cn("relative flex", d.flipped ? "flex-col-reverse" : "flex-col")}>
      <Box id={`${id}-${top.unit}`} unit={top.unit} label={top.label} d={d} invalid={invalid} />
      <button
        type="button"
        aria-label="Swap which amount is on top"
        onClick={() => {
          haptic.select();
          d.toggleFlip();
        }}
        className="press border-background bg-chip text-foreground relative z-[2] mx-auto -my-3 flex size-[42px] items-center justify-center rounded-full border-4"
      >
        <svg
          className={cn(
            "size-[18px] transition-transform duration-[450ms] ease-[cubic-bezier(.3,1.4,.5,1)]",
            d.flipped && "rotate-180"
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
      </button>
      <Box
        id={`${id}-${bottom.unit}`}
        unit={bottom.unit}
        label={bottom.label}
        d={d}
        invalid={invalid}
      />
    </div>
  );
}

/** Line under the boxes: the hint, or what's wrong (red). */
export function DualHint({ children, invalid }: { children: React.ReactNode; invalid?: boolean }) {
  return (
    <p
      className={cn(
        "mx-1 mt-2.5 min-h-[18px] text-[13px] leading-[18px] font-semibold",
        invalid ? "text-loss" : "text-ink2"
      )}
    >
      {children}
    </p>
  );
}

/**
 * Inline "you need to do X first" row on the amount screen (verify identity,
 * add a bank), in place of a separate step. The action button is optional.
 */
export function GateNotice({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="bg-chip mb-3.5 flex items-center gap-3 rounded-xl px-3.5 py-3">
      <p className="text-ink2 min-w-0 flex-1 text-[13px] leading-[18px]">
        <b className="text-foreground">{title}.</b> {text}
      </p>
      {action && (
        <Button size="sm" className="shrink-0" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
