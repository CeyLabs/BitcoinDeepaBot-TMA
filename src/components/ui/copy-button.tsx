"use client";

import { useEffect, useRef, useState } from "react";
import { Tooltip } from "@base-ui/react/tooltip";
import { Check, Copy } from "lucide-react";
import { cn } from "cn";
import { useToast } from "@/components/ui/toast";
import { copyText } from "@/lib/clipboard";
import { haptic } from "@/platform";

/**
 * Copy button (same as CeyFi's): the copy icon turns into a green check for a
 * moment, so no toast is needed. Only a failed copy says anything.
 */
export function CopyButton({
  value,
  label,
  className,
  iconSize = 16,
}: {
  value: string;
  /** What's being copied, for the label, e.g. "transaction ID". */
  label?: string;
  className?: string;
  /** Icon size in px; smaller for inline use beside text. */
  iconSize?: number;
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timeout.current && clearTimeout(timeout.current)), []);

  const copy = async () => {
    try {
      await copyText(value);
      haptic.notify("success");
      setCopied(true);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      haptic.notify("error");
      toast({ type: "error", title: "Couldn't copy. Try again." });
    }
  };

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <button
            type="button"
            aria-label={copied ? "Copied" : label ? `Copy ${label}` : "Copy to clipboard"}
            disabled={copied}
            onClick={() => void copy()}
            className={cn(
              "press hit bg-card text-foreground relative flex size-9 shrink-0 items-center justify-center rounded-lg border-0",
              className
            )}
          />
        }
      >
        <span
          className={cn("transition-all", copied ? "scale-100 opacity-100" : "scale-0 opacity-0")}
        >
          <Check size={iconSize} className="text-gain" aria-hidden />
        </span>
        <span
          className={cn(
            "absolute transition-all",
            copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
          )}
        >
          <Copy size={iconSize} aria-hidden />
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={6} className="z-[100]">
          <Tooltip.Popup className="bg-card text-foreground shadow-card rounded-md px-2 py-1 text-[12px]">
            {copied ? "Copied!" : "Copy"}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
