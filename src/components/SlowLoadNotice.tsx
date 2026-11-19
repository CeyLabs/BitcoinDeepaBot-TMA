"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const SLOW_AFTER_MS = 8000;

/**
 * Shown under the start screen when loading takes unusually long (bad
 * connection, backend down), so people aren't left staring at a logo.
 */
export function SlowLoadNotice() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => window.clearTimeout(t);
  }, []);

  if (!slow) return null;

  return (
    <div role="status" className="animate-rise flex flex-col items-center gap-1">
      <p className="text-ink2 text-[14px] font-semibold">Taking longer than usual…</p>
      <Button variant="text" size="text" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  );
}
