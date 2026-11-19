"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import TelegramLoginButton from "@/components/auth/TelegramLoginButton";
import {
  authenticateWithTelegramOidc,
  saveAuthToStorage,
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Web only: called once a fresh login is in place */
  onRenewed: () => void;
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
        const result = await authenticateWithTelegramOidc(data.id_token);
        if (!result.token) throw new Error("No token returned");
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

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={inTelegram ? "Reopen to send" : "Log in to send"}
    >
      <div className="flex flex-col gap-4 px-5 pb-6 text-center">
        <p className="text-[14px] text-[#64748b] dark:text-[#94a3b8]">
          {inTelegram
            ? "For your security, sending needs a fresh Telegram session. Close the app, then open it again from the bot and send again."
            : "For your security, sending needs a recent Telegram login. Log in again to continue this payment."}
        </p>
        {inTelegram ? (
          <Button size="lg" className="w-full rounded-[12px]" onClick={() => platform.close()}>
            Close the app
          </Button>
        ) : (
          <TelegramLoginButton
            onAuth={handleAuth}
            className={busy ? "pointer-events-none opacity-50" : "flex justify-center"}
          />
        )}
        {error && <p className="text-[13px] text-[#f13131]">{error}</p>}
      </div>
    </Sheet>
  );
}
