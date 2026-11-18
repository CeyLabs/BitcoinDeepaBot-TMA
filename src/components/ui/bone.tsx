import { cn } from "cn";

/** Skeleton placeholder block. Size and shape it to match the real element. */
export function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]", className)} />;
}
