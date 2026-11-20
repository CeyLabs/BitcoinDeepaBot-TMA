"use client";

import { useBackButton, usePlatform } from "@/platform";
import { cn } from "cn";

interface BackButtonProps {
  onBack: () => void;
  className?: string;
}

/**
 * Back navigation for sub-pages. Inside Telegram it drives the native back
 * button and renders nothing; on web it renders an in-page "‹ Back" button,
 * since an installed PWA has no browser back button.
 */
export function BackButton({ onBack, className }: BackButtonProps) {
  useBackButton(onBack);
  return <WebBackButton onBack={onBack} className={className} />;
}

/**
 * Only the in-page (web) button. For pages that call useBackButton once at
 * the top themselves, so Telegram's native button stays shown across their
 * loading/content states instead of hiding and re-showing.
 */
export function WebBackButton({ onBack, className }: BackButtonProps) {
  const { kind } = usePlatform();

  if (kind !== "web") return null;

  return (
    <button
      type="button"
      onClick={onBack}
      className={cn(
        "press text-foreground inline-flex min-h-11 items-center gap-1 self-start rounded-xl border-0 bg-transparent pr-2.5 text-[14px] font-bold",
        className
      )}
    >
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Back
    </button>
  );
}

/**
 * Header for pushed pages (News, an article, Choose plan): "‹ Back" on the
 * left (web only; Telegram shows its native one) and a centered title.
 */
export function PushHeader({
  title,
  onBack,
  className,
}: {
  title?: React.ReactNode;
  onBack: () => void;
  className?: string;
}) {
  useBackButton(onBack);
  return (
    <div className={cn("relative flex min-h-11 items-center justify-center", className)}>
      <WebBackButton onBack={onBack} className="absolute top-0 -left-2" />
      {title && <h1 className="text-[16px] leading-5">{title}</h1>}
    </div>
  );
}
