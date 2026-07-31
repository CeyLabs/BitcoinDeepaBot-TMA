"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { IconButton } from "@telegram-apps/telegram-ui";
import { cn } from "@/lib/cn";

interface CopyButtonProps {
  onCopy?: () => void;
  copied?: boolean;
  className?: string;
}

export function CopyButton({ onCopy, copied = false, className }: CopyButtonProps) {
  return (
    <IconButton
      type="button"
      mode="outline"
      size="s"
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      onClick={onCopy}
      className={cn(
        "flex! size-9! shrink-0! items-center! justify-center! rounded-lg! bg-white! dark:bg-[#1b2027]!",
        className
      )}
    >
      <span className="relative flex size-4 items-center justify-center">
        <Check
          size={16}
          strokeWidth={2}
          className={cn(
            "text-success absolute inset-0 transition-all duration-150",
            copied ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}
        />
        <Copy
          size={16}
          strokeWidth={2}
          className={cn(
            "absolute inset-0 text-[#1b2027] transition-all duration-150 dark:text-[#f1f5f9]",
            copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
          )}
        />
      </span>
    </IconButton>
  );
}

interface CopyFieldProps {
  value: string;
  className?: string;
  onCopy?: (value: string) => void;
}

export function CopyField({ value, className, onCopy }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      onCopy?.(value);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-9 flex-1 items-center overflow-hidden rounded-[10px] border border-[#e2e8f0] bg-white px-3 py-2 dark:border-[#334155] dark:bg-[#1b2027]">
        <p className="truncate text-[14px] leading-4 text-[#1b2027] dark:text-[#f1f5f9]">{value}</p>
      </div>
      <CopyButton onCopy={handleCopy} copied={copied} />
    </div>
  );
}
