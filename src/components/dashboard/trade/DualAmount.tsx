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
  /** Not needed when only rupees can be typed (Buy). */
  toLkr?: (sats: number) => number;
}) {
  const [s, setS] = useState<{ active: Unit; raw: string; flipped: boolean }>({
    active: initial,
    raw: "",
    flipped: false,
  });
  const n = Number(s.raw) || 0;
  const lkr = s.active === "lkr" ? n : n && toLkr ? toLkr(n) : 0;
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
  onSubmit,
  footer,
}: {
  id: string;
  unit: Unit;
  label: string;
  d: DualAmountState;
  invalid?: boolean;
  onSubmit?: () => void;
  /** A line under the amount, inside the box (Buy's sats estimate). */
  footer?: React.ReactNode;
}) {
  const active = d.active === unit && d.hasValue;
  const amountClass = cn(
    "num min-w-0 flex-1 border-0 bg-transparent p-0 text-[30px] leading-[1.2] font-bold tracking-[-0.02em] outline-none",
    active ? "text-foreground" : "text-ink2",
    invalid && "text-loss"
  );
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
          // The keyboard's Go key does what the (hidden behind it) main button does.
          enterKeyHint={onSubmit ? "go" : undefined}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || !onSubmit) return;
            e.preventDefault();
            e.currentTarget.blur();
            onSubmit();
          }}
          className={cn(amountClass, "placeholder:text-ink3")}
        />
        <UnitPill unit={unit} />
      </div>
      {footer}
    </div>
  );
}

/** The conversion, as the box's last line: "You get (estimate)  ≈ 12,345 sats". */
function Estimate({ unit, label, d }: { unit: Unit; label: string; d: DualAmountState }) {
  return (
    <div className="border-line mt-3 flex items-center justify-between gap-3 border-t pt-2.5">
      <span className="text-ink2 text-[13px] font-semibold">{label} (estimate)</span>
      <output
        aria-label={`${label} (estimate)`}
        className={cn("num text-[17px] font-bold", d.hasValue ? "text-foreground" : "text-ink3")}
      >
        ≈ {d.text(unit) || "0"} {unit === "sats" ? "sats" : "LKR"}
      </output>
    </div>
  );
}

/**
 * "You pay" / "You get" boxes. The box not being typed in is the estimate and
 * says so. With `only`, just that unit can be typed (no swap): Buy takes
 * rupees only, since the sats are priced when the payment lands.
 */
export function DualAmount({
  id,
  d,
  top,
  bottom,
  only,
  invalid,
  onSubmit,
}: {
  id: string;
  d: DualAmountState;
  /** The box on top before any swap. */
  top: { unit: Unit; label: string };
  bottom: { unit: Unit; label: string };
  /** The only unit that can be typed in. */
  only?: Unit;
  invalid?: boolean;
  /** Enter / the keyboard's Go key: continue (it should check the amount itself). */
  onSubmit?: () => void;
}) {
  const typed: Unit = only ?? d.active;
  const box = (side: { unit: Unit; label: string }) => (
    <Box
      id={`${id}-${side.unit}`}
      unit={side.unit}
      label={side.unit === typed ? side.label : `${side.label} (estimate)`}
      d={d}
      invalid={invalid}
      onSubmit={onSubmit}
    />
  );
  if (only) {
    // The other side is just the conversion: a line inside the box, not a box
    // of its own, so it doesn't look like it can be typed in.
    const [input, shown] = top.unit === only ? [top, bottom] : [bottom, top];
    return (
      <Box
        id={`${id}-${input.unit}`}
        unit={input.unit}
        label={input.label}
        d={d}
        invalid={invalid}
        onSubmit={onSubmit}
        footer={<Estimate unit={shown.unit} label={shown.label} d={d} />}
      />
    );
  }
  return (
    <div className={cn("relative flex", d.flipped ? "flex-col-reverse" : "flex-col")}>
      {box(top)}
      <button
        type="button"
        aria-label="Swap which amount is on top"
        onClick={() => {
          haptic.select();
          d.toggleFlip();
        }}
        // The ring is the sheet's own colour, so it cuts a notch between the boxes; the
        // thin outline keeps the circle visible against them.
        className="press border-card bg-chip text-foreground relative z-[2] mx-auto -my-3 flex size-[42px] items-center justify-center rounded-full border-4 shadow-[inset_0_0_0_1px_var(--line)]"
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
      {box(bottom)}
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
  className = "mb-3.5",
}: {
  title: string;
  text: string;
  action?: { label: string; onClick: () => void; loading?: boolean; disabled?: boolean };
  className?: string;
}) {
  return (
    <div className={cn("bg-chip flex items-center gap-3 rounded-xl px-3.5 py-3", className)}>
      <p className="text-ink2 min-w-0 flex-1 text-[13px] leading-[18px]">
        <b className="text-foreground">{title}.</b> {text}
      </p>
      {action && (
        <Button
          size="sm"
          className="shrink-0"
          loading={action.loading}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

/** Row of quick amounts under the amount boxes. */
export function Presets({
  items,
}: {
  items: { label: string; on: boolean; disabled?: boolean; pick: () => void }[];
}) {
  if (items.length === 0) return null;
  return (
    // One row on any phone: the chips share the width instead of wrapping.
    <div className="flex justify-center gap-1.5 pt-2.5">
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
            "press hit h-9 max-w-[25%] min-w-0 flex-1 rounded-xl border-0 px-1.5 text-[13px] font-bold whitespace-nowrap transition-colors disabled:opacity-40",
            p.on ? "bg-inv text-on-inv" : "bg-chip text-foreground"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/** Small grey line under the amount ("1 BTC ≈ රු. … · 1.5% fee"). */
export function PriceFooter({ children }: { children: React.ReactNode }) {
  return <p className="text-ink3 num mt-3 text-center text-[12px] font-semibold">{children}</p>;
}
