import { cn } from "cn";

interface ProgressProps {
  /** 0–100 */
  value: number;
  className?: string;
  label?: string;
}

/** 8px bar with the brand flame gradient. */
export function Progress({ value, className, label }: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn("bg-chip h-2 overflow-hidden rounded-lg", className)}
    >
      <span
        className="bg-yaka block h-full rounded-lg transition-[width] duration-[1500ms] ease-(--ease-out-soft)"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
