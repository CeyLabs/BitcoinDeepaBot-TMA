"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { BigEmoji } from "@/components/dashboard/trade/parts";
import TelegramLoginButton, { TG_PRIMARY_BUTTON } from "@/components/auth/TelegramLoginButton";
import {
  authenticateWithTelegramOidc,
  getUserFromToken,
  saveAuthToStorage,
  tokenUserId,
  type TelegramOidcAuthData,
} from "@/lib/auth";
import { queryKeys } from "@/lib/query-keys";
import { usePlatform } from "@/platform";

/**
 * Sending needs a Telegram session/login under 10 minutes old (the bot's
 * rule; it's what proves the user is sending). The Mini App's session is
 * fixed at launch, so it's renewed by reopening the app; on the web, by
 * logging in with Telegram again (the backend keeps the new login), after
 * which the send is retried with the same payment key.
 */
export function FreshCredentialPrompt({
  open,
  onOpenChange,
  onRenewed,
  action = "send",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Web only: called once a fresh login is in place */
  onRenewed: () => void;
  /** What the user is doing, for the copy: "send" or "pay" */
  action?: "send" | "pay";
}) {
  const platform = usePlatform();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Stable: TelegramLoginButton re-injects its script when this changes
  const onAuth = useCallback(
    async (data: TelegramOidcAuthData) => {
      setError(null);
      if (data.error || !data.id_token) {
        setError("Couldn't log you in with Telegram. Please try again.");
        return;
      }
      setBusy(true);
      try {
        const current = getUserFromToken()?.id;
        const result = await authenticateWithTelegramOidc(data.id_token);
        if (!result.token) throw new Error("No token returned");
        // Another Telegram account would make the pending payment its own:
        // keep the current session and don't continue
        if (current && tokenUserId(result.token) !== current) {
          setError(
            "That's a different Telegram account. Log in with the account you're paying from."
          );
          return;
        }
        saveAuthToStorage(result.token);
        await queryClient.invalidateQueries({ queryKey: queryKeys.p2pMe });
        onOpenChange(false);
        onRenewed();
      } catch {
        setError("Couldn't log you in with Telegram. Please try again.");
      } finally {
        setBusy(false);
      }
    },
    [onOpenChange, onRenewed, queryClient]
  );

  const handleAuth = useCallback((data: TelegramOidcAuthData) => void onAuth(data), [onAuth]);

  const inTelegram = platform.kind === "telegram";
  const doing = action === "pay" ? "paying" : "sending";

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={inTelegram ? `Reopen to ${action}` : `Log in to ${action}`}
      footer={
        <div className="flex flex-col gap-2">
          {inTelegram ? (
            <Button onClick={() => platform.close()}>Close the app</Button>
          ) : (
            <TelegramLoginButton
              onAuth={handleAuth}
              className={
                busy ? `${TG_PRIMARY_BUTTON} pointer-events-none opacity-50` : TG_PRIMARY_BUTTON
              }
            />
          )}
          {error && (
            <p role="alert" className="text-loss text-center text-[13px] font-semibold">
              {error}
            </p>
          )}
        </div>
      }
    >
      <div className="flex flex-col items-center gap-2 px-6 pb-4 text-center">
        <BigEmoji src="/emoji/animated/id-card.webp" size={84} />
        <h2 className="text-[22px] leading-7">For your security</h2>
        <p className="text-ink2 text-[14px] leading-5">
          {inTelegram
            ? `${doing[0].toUpperCase()}${doing.slice(1)} needs a fresh Telegram session. Close the app, open it again from the bot, and ${action} again.`
            : `${doing[0].toUpperCase()}${doing.slice(1)} needs a recent Telegram login. Log in again to continue this payment.`}
        </p>
      </div>
    </Sheet>
  );
}
