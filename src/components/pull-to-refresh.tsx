"use client";

import type { ReactNode } from "react";
import { cn } from "cn";
import { RefreshCw } from "lucide-react";
import { PULL_THRESHOLD, usePullToRefresh } from "@/hooks/usePullToRefresh";

const EASE = "transform .32s cubic-bezier(.2,.8,.2,1)";

/**
 * Wraps a screen so pulling down from the top runs `onRefresh`. A spinner drops
 * in over the content as it's pulled (turning with the pull), spins while the
 * refresh runs, and snaps back once it's done. The content itself stays put.
 */
export function PullToRefresh({
  onRefresh,
  className,
  children,
}: {
  onRefresh: () => Promise<unknown>;
  className?: string;
  children: ReactNode;
}) {
  const { ref, pull, dragging, refreshing } = usePullToRefresh<HTMLDivElement>(onRefresh);
  const transition = dragging ? undefined : EASE;
  return (
    <div ref={ref} className={cn("relative", className)}>
      {(pull > 0 || refreshing) && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center"
          style={{
            transform: `translateY(${pull - 44}px)`,
            opacity: Math.min(1, pull / PULL_THRESHOLD),
            transition,
          }}
        >
          <span className="bg-card border-border flex size-9 items-center justify-center rounded-full border shadow-[0_6px_16px_-6px_rgba(0,0,0,.25)]">
            <RefreshCw
              className={cn("text-primary size-[18px]", refreshing && "animate-spin")}
              style={refreshing ? undefined : { transform: `rotate(${pull * 4}deg)` }}
            />
          </span>
        </div>
      )}
      {refreshing && (
        <span role="status" className="sr-only">
          Refreshing
        </span>
      )}
      {children}
    </div>
  );
}
