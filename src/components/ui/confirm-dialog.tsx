"use client";

import { useEffect, useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import type { ConfirmOptions } from "@/platform/types";

type PendingConfirm = ConfirmOptions & { resolve: (confirmed: boolean) => void };

// platform.confirm() is a plain async function (no React context), so it
// hands requests to the mounted <ConfirmHost /> through this listener.
let showConfirm: ((request: PendingConfirm) => void) | null = null;

/**
 * In-app confirmation sheet. Used on the web and as the fallback when
 * Telegram's native popup isn't available, instead of window.confirm.
 */
export function requestConfirm(options: ConfirmOptions): Promise<boolean> {
  if (!showConfirm) {
    // Host not mounted (shouldn't happen inside Providers) - last resort.
    return Promise.resolve(window.confirm(`${options.title}\n\n${options.message}`));
  }
  const show = showConfirm;
  return new Promise((resolve) => show({ ...options, resolve }));
}

/** Mount once (in Providers) to render requestConfirm() calls. */
export function ConfirmHost() {
  const [request, setRequest] = useState<PendingConfirm | null>(null);

  useEffect(() => {
    showConfirm = (next) =>
      setRequest((current) => {
        current?.resolve(false); // a newer request replaces an unanswered one
        return next;
      });
    return () => {
      showConfirm = null;
    };
  }, []);

  const answer = (confirmed: boolean) => {
    request?.resolve(confirmed);
    setRequest(null);
  };

  return (
    <Sheet
      open={request !== null}
      onOpenChange={(open) => !open && answer(false)}
      title={request?.title ?? ""}
    >
      <div className="flex flex-col gap-5 px-4 pb-6">
        <p className="text-muted-foreground text-center text-[15px] leading-[22px]">
          {request?.message}
        </p>
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className={cn(request?.destructive && "bg-destructive text-white")}
            onClick={() => answer(true)}
          >
            {request?.confirmText}
          </Button>
          <Button size="lg" variant="secondary" onClick={() => answer(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
