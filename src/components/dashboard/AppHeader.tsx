"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { useAvatarSeed } from "@/hooks/query/useUserMe";
import { useUser } from "@/hooks/useUser";
import { Wordmark } from "@/components/ui/wordmark";
import { useSheets } from "./sheets";
import { useSession } from "@/hooks/useSession";
import { haptic } from "@/platform";

/** Sticky top bar: wordmark, name + @username, avatar (opens settings) with a check when verified. */
export function AppHeader() {
  const { displayName, username, kycStatus } = useUser();
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
          <div className="ml-1 min-w-0 text-right">
            {ready ? (
              <p className="text-ink2 truncate text-[14px] leading-[18px] font-semibold">
                {displayName}
              </p>
            ) : (
              <span className="skeleton ml-auto block h-3.5 w-20 rounded" />
            )}
            {username && (
              <p className="text-ink3 mt-0.5 truncate text-[12px] leading-4">@{username}</p>
            )}
          </div>
          <button
            type="button"
            aria-label={verified ? "Profile and settings (verified)" : "Profile and settings"}
            onClick={() => {
              haptic.impact("light");
              openSettings();
            }}
            className="press relative flex size-11 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0"
          >
            <UserAvatar seed={ready ? avatarSeed : null} size={44} />
            {verified && (
              // Verified (KYC approved): a green check on the avatar's corner.
              <span
                aria-hidden
                className="bg-gain-fill border-background absolute -right-0.5 -bottom-0.5 flex size-[18px] items-center justify-center rounded-full border-2 text-white"
              >
                <svg
                  className="size-2.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
