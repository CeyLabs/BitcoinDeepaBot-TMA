"use client";

import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { usePlatform } from "@/platform";
import { cn } from "cn";
import { promptInstall, useInstallKind } from "./install";

interface InstallButtonProps {
  /** "button": full-width outline button. "icon": round icon button (top bar). */
  variant?: "button" | "icon" | "cell";
  className?: string;
}

/**
 * "Install app" for browser users. Chromium gets its native install dialog,
 * iOS Safari gets Add to Home Screen instructions. Renders nothing inside
 * Telegram, once installed, or where install isn't available.
 */
export function InstallButton({ variant = "button", className }: InstallButtonProps) {
  const { kind } = usePlatform();
  const installKind = useInstallKind();
  const [showIosSteps, setShowIosSteps] = useState(false);

  if (kind !== "web" || !installKind) return null;

  const handleClick = () => {
    if (installKind === "prompt") void promptInstall();
    else setShowIosSteps(true);
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          aria-label="Install app"
          onClick={handleClick}
          className={cn(
            "press bg-card text-foreground shadow-card flex size-10 items-center justify-center rounded-full",
            className
          )}
        >
          <Download size={18} strokeWidth={1.75} />
        </button>
      ) : variant === "cell" ? (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "press bg-card shadow-card flex min-h-16 w-full items-center gap-3 rounded-xl border-0 px-4 py-3 text-left",
            className
          )}
        >
          <span className="bg-chip text-link flex size-9 shrink-0 items-center justify-center rounded-[10px]">
            <Download size={18} strokeWidth={2} />
          </span>
          <span className="flex min-w-0 grow flex-col gap-1 pl-0.5">
            <span className="text-[16px] leading-[18px] font-semibold">Install the app</span>
            <span className="text-ink3 truncate text-[13px] leading-4">
              Add Bitcoin Deepa to your home screen
            </span>
          </span>
          <svg
            className="text-ink3 size-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "press bg-chip text-foreground flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-bold",
            className
          )}
        >
          <Download size={18} strokeWidth={1.75} />
          Install the App
        </button>
      )}

      {showIosSteps && <IosInstallSheet onClose={() => setShowIosSteps(false)} />}
    </>
  );
}

const IOS_STEPS = [
  { Icon: Share, text: "Tap the Share button in your browser" },
  { Icon: SquarePlus, text: "Choose “Add to Home Screen”" },
  { Icon: null, text: "Tap “Add” in the top-right corner" },
];

function IosInstallSheet({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-200 flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
        onClick={(event) => event.stopPropagation()}
        className="bg-card w-full max-w-md rounded-t-[20px] px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-left"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="ios-install-title" className="text-[18px] font-bold">
            Install Bitcoin Deepa
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="bg-chip text-ink2 flex size-8 items-center justify-center rounded-full"
          >
            <X size={16} />
          </button>
        </div>

        <ol className="flex flex-col gap-3">
          {IOS_STEPS.map(({ Icon, text }, index) => (
            <li key={text} className="flex items-center gap-3">
              <span className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold">
                {index + 1}
              </span>
              <span className="text-ink2 flex-1 text-[14px]">{text}</span>
              {Icon && <Icon size={18} className="text-link shrink-0" />}
            </li>
          ))}
        </ol>

        <p className="text-ink3 mt-4 text-[12px]">
          The installed app has its own storage, so you&apos;ll sign in with Telegram once more
          there.
        </p>
      </div>
    </div>
  );
}
