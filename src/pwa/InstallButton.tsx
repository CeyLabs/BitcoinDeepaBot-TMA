"use client";

import { useState } from "react";
import { Download, Share, SquarePlus } from "lucide-react";
import { usePlatform } from "@/platform";
import { cn } from "cn";
import { ListRow } from "@/components/ui/section";
import { Sheet } from "@/components/ui/sheet";
import { promptInstall, useInstallKind } from "./install";

interface InstallButtonProps {
  /** "button": full-width button. "cell": standalone card. "row": a row inside a settings `List`. */
  variant?: "button" | "row" | "cell";
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
      {variant === "row" ? (
        <ListRow
          onClick={handleClick}
          icon={<Download className="text-ink2 size-[18px]" strokeWidth={2.2} aria-hidden />}
          title="Install the app"
          subtitle="Add Bitcoin Deepa to your home screen"
          className={className}
        />
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

      <IosInstallSheet open={showIosSteps} onOpenChange={setShowIosSteps} />
    </>
  );
}

const IOS_STEPS = [
  { Icon: Share, text: "Tap the Share button in your browser" },
  { Icon: SquarePlus, text: "Choose “Add to Home Screen”" },
  { Icon: null, text: "Tap “Add” in the top-right corner" },
];

function IosInstallSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Install Bitcoin Deepa">
      <div className="px-5 pt-2 pb-4">
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
    </Sheet>
  );
}
