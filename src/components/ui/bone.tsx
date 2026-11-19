import { cn } from "cn";

/**
 * Skeleton placeholder with a soft shimmer. Size and shape it to match the
 * real element. On colored cards, set the fill with `[--bone:...]`.
 */
export function Bone({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded", className)} />;
}

/** White (dark-mode) card surface that skeleton bones sit on, like the real cards. */
export function BoneCard({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return <div className={cn("bg-card rounded-xl", className)}>{children}</div>;
}
