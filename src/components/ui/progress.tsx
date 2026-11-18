import { cn } from "cn";

interface ProgressProps {
  /** 0–100 */
  value: number;
  className?: string;
}

/** Thin progress bar on a faded track. */
export function Progress({ value, className }: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn("relative h-1 overflow-hidden rounded-full", className)}
    >
      <div className="bg-primary absolute inset-0 opacity-40" />
      <div
        className="bg-primary absolute inset-y-0 left-0 rounded-[inherit] transition-[width] duration-200"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
