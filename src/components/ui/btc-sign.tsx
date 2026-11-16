import { Bitcoin } from "lucide-react";
import { cn } from "cn";

/**
 * Bitcoin sign as an icon, sized to the surrounding text. Use this instead of
 * the "₿" character: that glyph is in Inter's latin-extended range, so
 * rendering it makes the browser download an extra ~83 KB font file.
 */
export function BtcSign({ className }: { className?: string }) {
  return (
    <Bitcoin
      role="img"
      aria-label="BTC"
      strokeWidth={2.25}
      className={cn("inline-block size-[1em] shrink-0 align-[-0.125em]", className)}
    />
  );
}
