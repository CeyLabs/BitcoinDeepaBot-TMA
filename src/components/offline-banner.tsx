"use client";

import { useOffline } from "@/hooks/useOffline";

/** Sticks to the top of every screen while the device has no network. */
export function OfflineBanner() {
  const offline = useOffline();
  if (!offline) return null;
  return (
    <div
      role="status"
      className="bg-inv text-on-inv animate-rise sticky top-0 z-50 flex items-center justify-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold"
    >
      <span className="bg-primary size-1.5 flex-none rounded-full" aria-hidden="true" />
      You’re offline. Showing the last data we had. Payments are paused.
    </div>
  );
}
