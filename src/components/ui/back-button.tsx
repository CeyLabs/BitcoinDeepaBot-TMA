"use client";

import { ChevronLeft } from "lucide-react";
import { useBackButton, usePlatform } from "@/platform";
import { cn } from "@/lib/cn";

interface BackButtonProps {
  onBack: () => void;
  className?: string;
}

/**
 * Back navigation for sub-pages. Inside Telegram it drives the native back
 * button and renders nothing; on web it renders an in-page button, since an
 * installed PWA has no browser back button.
 */
export function BackButton({ onBack, className }: BackButtonProps) {
  useBackButton(onBack);
  const { kind } = usePlatform();

  if (kind !== "web") return null;

  return (
    <button
      type="button"
      aria-label="Back"
      onClick={onBack}
      className={cn(
        "bg-surface-primary -ml-1 flex size-10 shrink-0 items-center justify-center self-start rounded-full text-[#1b2027] dark:text-white",
        className
      )}
    >
      <ChevronLeft size={22} strokeWidth={2} />
    </button>
  );
}
