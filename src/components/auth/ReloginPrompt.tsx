"use client";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { BigEmoji } from "@/components/dashboard/trade/parts";
import { webLoginUrl } from "@/lib/auth";
import { usePlatform } from "@/platform";

/**
 * The bot hasn't linked this user to our session yet (401 relogin_required),
 * e.g. the first wallet action after this update. A new login links them:
 * in the Mini App by reopening it (fresh launch data), on the web with
 * "Log In with Telegram", which comes back to this page.
 */
export function ReloginPrompt({
  open,
  onOpenChange,
  action = "send",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What the user is doing, for the copy: "send" or "pay" */
  action?: "send" | "pay";
}) {
  const platform = usePlatform();
  const inTelegram = platform.kind === "telegram";
  const returnTo =
    typeof window === "undefined" ? "/" : window.location.pathname + window.location.search;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={inTelegram ? `Reopen to ${action}` : `Log in to ${action}`}
      footer={
        inTelegram ? (
          <Button onClick={() => platform.close()}>Close the app</Button>
        ) : (
          <Button onClick={() => window.location.assign(webLoginUrl(returnTo))}>
            Log in with Telegram
          </Button>
        )
      }
    >
      <div className="flex flex-col items-center gap-2 px-6 pb-4 text-center">
        <BigEmoji src="/emoji/animated/id-card.webp" size={84} />
        <h2 className="text-[22px] leading-7">Connect your wallet</h2>
        <p className="text-ink2 text-[14px] leading-5">
          {inTelegram
            ? `Close the app and open it again from the bot to connect your wallet, then ${action} again.`
            : `Log in with Telegram once more to connect your wallet, then ${action} again.`}
        </p>
      </div>
    </Sheet>
  );
}
