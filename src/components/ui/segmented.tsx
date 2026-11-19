"use client";

import { cn } from "cn";
import { haptic } from "@/platform";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

interface SegmentedProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** Accessible name for the group. */
  label?: string;
}

/** Pill segmented control with a sliding white thumb (Weekly/Monthly, Buy/Sell, 1M/3M/1Y…). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  label,
}: SegmentedProps<T>) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );
  const n = options.length;

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("bg-chip relative flex rounded-full p-1", className)}
    >
      <span
        aria-hidden
        className="bg-card absolute top-1 left-1 h-[calc(100%-8px)] rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition-transform duration-[420ms] ease-(--ease-spring)"
        style={{ width: `calc((100% - 8px) / ${n})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => {
              if (on) return;
              haptic.select();
              onChange(o.value);
            }}
            className={cn(
              "press relative h-10 flex-1 rounded-full border-0 bg-transparent text-[14px] font-semibold transition-colors duration-200",
              on ? "text-link" : "text-ink3"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
