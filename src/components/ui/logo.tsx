import Image from "next/image";
import { cn } from "cn";

/**
 * Bitcoin Deepa logo that switches light/dark with CSS (the `dark:` variant
 * follows <html data-theme>), so server-rendered HTML is already correct.
 * Fills its (positioned, sized) parent.
 *
 * Both images stay lazy (no preload): a lazy image that's display:none is
 * never fetched, so only the visible one downloads. `priority` just raises
 * its fetch priority.
 */
export function Logo({ priority, className }: { priority?: boolean; className?: string }) {
  return (
    <>
      <Image
        src="/BDLogo_Black.svg"
        alt="Bitcoin Deepa"
        fill
        fetchPriority={priority ? "high" : undefined}
        sizes="220px"
        className={cn("object-contain dark:hidden", className)}
      />
      <Image
        src="/BDLogo_White.svg"
        alt=""
        fill
        fetchPriority={priority ? "high" : undefined}
        sizes="220px"
        className={cn("hidden object-contain dark:block", className)}
      />
    </>
  );
}
