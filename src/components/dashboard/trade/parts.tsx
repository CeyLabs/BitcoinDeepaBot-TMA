"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "cn";
import { Button, Spinner } from "@/components/ui/button";
import { haptic } from "@/platform";

/** Caption, big amount and a small conversion line (review screens). */
export function ReviewHeader({
  caption,
  big,
  small,
}: {
  caption: string;
  big: React.ReactNode;
  small?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center pb-4 text-center">
      <p className="text-ink2 text-[14px] leading-4 font-semibold">{caption}</p>
      <p className="num mt-1 text-[36px] leading-[1.15] font-bold">{big}</p>
      {small && <p className="text-ink2 num text-[14px] font-semibold">{small}</p>}
    </div>
  );
}

const RING = 56.55; // 2πr for r = 9

/** "Rate held for 0:24" with a draining ring; red with Refresh once expired. */
export function LockRow({
  secondsLeft,
  totalSeconds,
  expired,
  refreshing,
  onRefresh,
}: {
  secondsLeft: number;
  totalSeconds: number;
  expired: boolean;
  refreshing?: boolean;
  onRefresh: () => void;
}) {
  const m = Math.floor(secondsLeft / 60);
  const s = String(secondsLeft % 60).padStart(2, "0");
  const offset = expired ? RING : RING * (1 - secondsLeft / Math.max(1, totalSeconds));
  return (
    <div
      aria-live="polite"
      className={cn(
        "mb-3 flex min-h-12 items-center gap-2.5 rounded-xl py-2 pr-2 pl-3.5 text-[14px] font-semibold transition-colors duration-300",
        expired ? "bg-loss-bg text-loss" : "bg-chip"
      )}
    >
      <svg className="shrink-0 -rotate-90" width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <circle cx="11" cy="11" r="9" fill="none" strokeWidth="3" className="stroke-line" />
        <circle
          cx="11"
          cy="11"
          r="9"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-primary transition-[stroke-dashoffset] duration-1000 ease-linear"
          style={{ strokeDasharray: RING, strokeDashoffset: offset }}
        />
      </svg>
      <span className="grow">
        {expired ? "Rate expired. Refresh to continue" : `Rate held for ${m}:${s}`}
      </span>
      {expired && (
        <Button size="sm" variant="secondary" loading={refreshing} onClick={onRefresh}>
          Refresh
        </Button>
      )}
    </div>
  );
}

/** Chip-coloured note row (same shape as the lock row). */
export function InfoRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-chip text-ink2 mb-3 flex min-h-12 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] leading-[18px] font-semibold">
      <svg
        className="size-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

/** Orange caution box: something the member must know before paying. */
export function WarningRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      role="note"
      className="text-foreground mb-3 flex items-start gap-2.5 rounded-xl border border-[rgba(248,147,26,0.45)] bg-[rgba(248,147,26,0.14)] px-3.5 py-3 text-[13px] leading-[18px]"
    >
      <svg
        className="text-link mt-px size-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
      <span className="flex flex-col gap-0.5">
        <b className="text-[14px] leading-[18px] font-bold">{title}</b>
        <span className="text-ink2">{children}</span>
      </span>
    </div>
  );
}

/** Red message row for a failed request. */
export function ErrorRow({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="bg-loss-bg text-loss mb-3 rounded-xl px-3.5 py-3 text-[13px] leading-[18px] font-semibold"
    >
      {children}
    </p>
  );
}

const HOLD_MS = 900;

/**
 * Press-and-hold confirm: an orange fill sweeps left→right over ~0.9s and
 * fires `onConfirm` when it's full; letting go early cancels. Keyboard and
 * assistive-tech activation (a click without a pointer press) confirms
 * straight away.
 */
export function HoldButton({
  label,
  disabled,
  loading,
  onConfirm,
}: {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  onConfirm: () => void;
}) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const pointerPressed = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const start = () => {
    pointerPressed.current = true;
    if (disabled || loading || holding) return;
    haptic.impact("light");
    setHolding(true);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      onConfirm();
    }, HOLD_MS);
  };
  const end = () => {
    window.clearTimeout(timer.current);
    setHolding(false);
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      // A finger that wobbles while holding must not drag the sheet down.
      data-base-ui-swipe-ignore=""
      onPointerDown={start}
      onPointerUp={end}
      onPointerLeave={end}
      onPointerCancel={end}
      onContextMenu={(e) => e.preventDefault()}
      onClick={(e) => {
        // e.detail is 0 for keyboard / programmatic clicks
        if (e.detail === 0 || !pointerPressed.current) onConfirm();
        pointerPressed.current = false;
      }}
      className={cn(
        "press bg-inv text-on-inv relative flex h-[50px] w-full touch-none items-center justify-center overflow-hidden rounded-xl border-0 text-[16px] font-bold select-none [-webkit-touch-callout:none]",
        "disabled:bg-disabled disabled:text-on-disabled"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "bg-primary absolute inset-0 origin-left",
          holding
            ? "scale-x-100 transition-transform duration-900 ease-linear"
            : "scale-x-0 transition-transform duration-250 ease-out"
        )}
      />
      {loading ? (
        <Spinner className="relative" />
      ) : (
        <>
          <span className="relative">{label}</span>
          <span
            aria-hidden
            className={cn(
              "text-primary-foreground pointer-events-none absolute inset-0 flex items-center justify-center",
              holding
                ? "transition-[clip-path] duration-900 ease-linear [clip-path:inset(0_0_0_0)]"
                : "transition-[clip-path] duration-250 ease-out [clip-path:inset(0_100%_0_0)]"
            )}
          >
            {label}
          </span>
        </>
      )}
    </button>
  );
}

export type TimelineState = "done" | "active" | "todo";

const STATE_TEXT: Record<TimelineState, string> = {
  done: "Done",
  active: "In progress",
  todo: "Waiting",
};

/** Vertical progress list: green check (done), spinner (active), dot (to do). */
export function Timeline({ steps }: { steps: { label: string; state: TimelineState }[] }) {
  return (
    <ol aria-live="polite" className="bg-chip flex flex-col rounded-xl p-4">
      {steps.map((st, i) => (
        <li key={st.label} className="relative flex items-start gap-3 pb-[18px] last:pb-0">
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className="bg-line absolute top-[30px] bottom-0.5 left-[13px] w-0.5"
            />
          )}
          <span
            aria-hidden
            className={cn(
              "relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform] duration-300 ease-(--ease-spring)",
              st.state === "done" && "bg-gain-bg text-gain scale-[1.06]",
              st.state === "active" && "text-link bg-[rgba(248,147,26,0.18)]",
              st.state === "todo" && "bg-card text-ink3"
            )}
          >
            {st.state === "done" && (
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            )}
            {st.state === "active" && <Spinner />}
            {st.state === "todo" && <span className="size-1.5 rounded-full bg-current" />}
          </span>
          <span
            className={cn(
              "pt-[3px] text-[15px] leading-5 font-semibold transition-colors duration-300",
              st.state === "todo" && "text-ink3"
            )}
          >
            {st.label}
            <span className="sr-only"> ({STATE_TEXT[st.state]})</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Green circle with a check that draws itself in. */
export function SuccessCheck() {
  return (
    <div className="bg-gain-bg text-gain animate-pop mx-auto mt-2 mb-1 flex size-20 items-center justify-center rounded-full">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path
          d="M5 12.5l4.5 4.5L19 7.5"
          className="animate-draw-check"
          style={{ strokeDasharray: 24, strokeDashoffset: 24 }}
        />
      </svg>
    </div>
  );
}

/** Animated emoji (these are animated webp, so skip image optimisation). */
export function BigEmoji({ src, size = 100, pop }: { src: string; size?: number; pop?: boolean }) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized
      className={cn("mx-auto block shrink-0 object-contain", pop && "animate-pop")}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Result / status header: a visual (party popper, check, emoji or spinner),
 * an optional big amount, a title and a line of text.
 */
export function ResultHero({
  visual,
  big,
  title,
  text,
}: {
  visual: "party" | "check" | "spinner" | { emoji: string };
  big?: React.ReactNode;
  title?: React.ReactNode;
  text?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {visual === "party" ? (
        <BigEmoji src="/emoji/animated/party-popper.webp" size={116} pop />
      ) : visual === "check" ? (
        <SuccessCheck />
      ) : visual === "spinner" ? (
        <span className="text-link flex size-16 items-center justify-center rounded-full bg-[rgba(248,147,26,0.16)]">
          <Spinner className="size-7 border-[3px]" />
        </span>
      ) : (
        <BigEmoji src={visual.emoji} size={88} pop />
      )}
      {big && (
        <p aria-live="polite" className="num mt-1.5 mb-1 text-[36px] leading-[1.15] font-bold">
          {big}
        </p>
      )}
      {title && <h2 className={cn("text-[22px] leading-7", big ? "mt-0" : "mt-3")}>{title}</h2>}
      {text && (
        <p className="text-ink2 mt-1 max-w-sm px-2 text-[14px] leading-5 font-semibold">{text}</p>
      )}
    </div>
  );
}
