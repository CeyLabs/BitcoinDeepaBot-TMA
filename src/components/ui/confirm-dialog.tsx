"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { onConfirmRequest, type ConfirmRequest } from "@/platform/confirm";

/** Mount once (in Providers) to render platform confirm requests. */
export function ConfirmHost() {
  // `request` outlives `open` so the sheet keeps its text while sliding out.
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const [open, setOpen] = useState(false);
  const pending = useRef<ConfirmRequest | null>(null);

  useEffect(
    () =>
      onConfirmRequest((next) => {
        pending.current?.resolve(false); // a newer request replaces an unanswered one
        pending.current = next;
        setRequest(next);
        setOpen(true);
      }),
    []
  );

  const answer = (confirmed: boolean) => {
    pending.current?.resolve(confirmed);
    pending.current = null;
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && answer(false)} title={request?.title ?? ""}>
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
            {request?.cancelText ?? "Cancel"}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
