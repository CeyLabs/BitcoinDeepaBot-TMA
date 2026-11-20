"use client";

import { cn } from "cn";

/**
 * Horizontally scrolling row of filter chips; bleeds to the screen edge.
 * Sideways only: the padding holds each chip's 6px `hit` area (the negative
 * margin keeps the row's spacing), and overflow-y is hidden so it can't drift
 * up and clip the chips.
 */
export function ChipRow({
  className,
  children,
  label,
}: {
  className?: string;
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "-mx-4 -my-1 flex gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 py-1.5",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Filter chip; orange when selected. */
export function Chip({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "press hit h-9 shrink-0 rounded-xl border-0 px-3.5 text-[12px] whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground font-semibold"
          : "bg-tile text-on-tile font-medium",
        className
      )}
      {...props}
    />
  );
}
