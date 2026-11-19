"use client";

import { cn } from "cn";

/** Horizontally scrolling row of filter chips; bleeds to the screen edge. */
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
      className={cn("-mx-4 flex gap-2 overflow-x-auto px-4 py-0.5", className)}
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
