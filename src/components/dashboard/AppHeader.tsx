"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { useAvatarSeed } from "@/hooks/query/useUserMe";
import { useUser } from "@/hooks/useUser";
import { Wordmark } from "@/components/ui/wordmark";
import { useSheets } from "./sheets";
import { useSession } from "@/hooks/useSession";
import { haptic } from "@/platform";
import { InstallButton } from "@/pwa";

/** Sticky top bar: wordmark, name + verification line, avatar (opens settings). */
export function AppHeader() {
  const { displayName, kycStatus } = useUser();
  const avatarSeed = useAvatarSeed();
  const { openSettings } = useSheets();
  const verified = kycStatus === "APPROVED";
  // Identity comes from the stored token / Telegram launch data, which the
  // server can't see: render it only once the client knows the session.
  const ready = useSession().status !== "loading";

  return (
    <header className="bg-background sticky top-0 z-35 -mx-4 px-4 pt-3 pb-2 transition-colors duration-300">
      <div className="flex min-h-11 items-center justify-between gap-2.5">
        <Wordmark className="text-foreground relative top-0.5 h-9 w-auto shrink-0" />
        <div className="flex min-w-0 items-center gap-2">
          <InstallButton variant="icon" />
          <div className="ml-1 min-w-0 text-right">
            {ready ? (
              <p className="text-ink2 truncate text-[14px] leading-[18px] font-semibold">
                {displayName}
              </p>
            ) : (
              <span className="skeleton ml-auto block h-3.5 w-20 rounded" />
            )}
            {kycStatus && !verified && (
              <p className="text-ink3 text-[12px] leading-4 whitespace-nowrap">Not verified yet</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Profile and settings"
            onClick={() => {
              haptic.impact("light");
              openSettings();
            }}
            className="press flex size-11 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0"
          >
            <UserAvatar seed={ready ? avatarSeed : null} size={44} />
          </button>
        </div>
      </div>
    </header>
  );
}
