import { cn } from "@/lib/cn";

const TONE_STYLES = {
  // Light card surfaces (white/#0B0F14 backgrounds).
  surface: "bg-[#e2e8f0] dark:bg-[#334155]",
  // Cards rendered over a photo/color background (e.g. hero cards).
  dark: "bg-white/25 dark:bg-white/15",
  // Subtler variant for prominent hero values — a faint tint rather than a solid block.
  translucent: "bg-white/10",
};

export interface ValueSkeletonProps {
  className?: string;
  tone?: keyof typeof TONE_STYLES;
}

export function ValueSkeleton({ className, tone = "surface" }: ValueSkeletonProps) {
  return (
    <span className={cn("inline-block animate-pulse rounded", TONE_STYLES[tone], className)} />
  );
}
