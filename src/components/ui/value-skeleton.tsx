import { cn } from "cn";

const TONE_STYLES = {
  // Light card surfaces (white/#0B0F14 backgrounds).
  surface: "",
  // Cards rendered over a photo/color background (e.g. hero cards).
  dark: "[--bone:rgb(255_255_255/0.25)] dark:[--bone:rgb(255_255_255/0.15)]",
  // Subtler variant for prominent hero values — a faint tint rather than a solid block.
  translucent: "[--bone:rgb(255_255_255/0.28)]",
};

export interface ValueSkeletonProps {
  className?: string;
  tone?: keyof typeof TONE_STYLES;
}

export function ValueSkeleton({ className, tone = "surface" }: ValueSkeletonProps) {
  return <span className={cn("skeleton inline-block rounded", TONE_STYLES[tone], className)} />;
}
