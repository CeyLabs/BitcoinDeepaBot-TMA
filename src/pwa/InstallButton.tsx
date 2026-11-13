"use client";

import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { usePlatform } from "@/platform";
import { cn } from "@/lib/cn";
import { promptInstall, useInstallKind } from "./install";

interface InstallButtonProps {
  /** "button": full-width outline button. "icon": round icon button (top bar). */
  variant?: "button" | "icon";
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
            "bg-surface-primary flex size-10 items-center justify-center rounded-full text-[#111821] dark:text-[#f1f5f9]",
            className
          )}
        >
          <Download size={18} strokeWidth={1.75} />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "flex h-12 w-full items-center justify-center gap-2 rounded-[12px] border border-[#e2e8f0] text-[15px] font-semibold text-[#1b2027] dark:border-[#1e293b] dark:text-white",
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
  { Icon: Share, text: "Tap the Share button in Safari's toolbar" },
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
        className="w-full max-w-md rounded-t-[24px] bg-white px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-left dark:bg-[#0b0f14]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="ios-install-title"
            className="text-[18px] font-bold text-[#1b2027] dark:text-white"
          >
            Install Bitcoin Deepa
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569] dark:bg-[#1e293b] dark:text-[#94a3b8]"
          >
            <X size={16} />
          </button>
        </div>

        <ol className="flex flex-col gap-3">
          {IOS_STEPS.map(({ Icon, text }, index) => (
            <li key={text} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#fa7119] text-[12px] font-bold text-white">
                {index + 1}
              </span>
              <span className="flex-1 text-[14px] text-[#475569] dark:text-[#94a3b8]">{text}</span>
              {Icon && <Icon size={18} className="shrink-0 text-[#2e7cf6]" />}
            </li>
          ))}
        </ol>

        <p className="mt-4 text-[12px] text-[#64748b]">
          The installed app has its own storage, so you&apos;ll sign in with Telegram once more
          there.
        </p>
      </div>
    </div>
  );
}
