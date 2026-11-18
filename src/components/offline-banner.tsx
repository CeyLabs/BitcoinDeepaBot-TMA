"use client";

import { useOffline } from "@/hooks/useOffline";

/** Sticks to the top of every screen while the device has no network. */
export function OfflineBanner() {
  const offline = useOffline();
  if (!offline) return null;
  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex items-center justify-center gap-2.5 bg-[#fef3c7] px-4 py-2.5 text-[13px] font-medium text-[#92400e] dark:bg-[#422006] dark:text-[#fcd34d]"
    >
      <span className="size-1.5 flex-none rounded-full bg-current" aria-hidden="true" />
      You’re offline. Showing the last data we had. Payments are paused.
    </div>
  );
}
