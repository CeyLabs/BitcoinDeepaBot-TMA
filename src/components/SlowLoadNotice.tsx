"use client";

import { useEffect, useState } from "react";

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
    <div role="status" className="flex flex-col items-center gap-3">
      <p className="text-[14px] text-[#64748b] dark:text-[#94a3b8]">Taking longer than usual…</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="text-primary text-[15px] font-semibold"
      >
        Retry
      </button>
    </div>
  );
}
