"use client";

import { useEffect } from "react";
import { BigEmoji, StatusScreen } from "@/components/auth/StatusScreen";
import { Button, buttonVariants } from "@/components/ui/button";
import { TELEGRAM_MINI_APP_URL } from "@/lib/constants";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // Telegram's launch-params hooks throw this when a page is reached without
  // going through Telegram (e.g. a direct link opened in a plain browser).
  const isLaunchParamsError = /launch param/i.test(error.message);

  return (
    <StatusScreen
      art={<BigEmoji src="/emoji/animated/exclamation-mark.webp" />}
      title={isLaunchParamsError ? "Open this in Telegram" : "Something went wrong"}
      actions={
        isLaunchParamsError ? (
          <a
            href={TELEGRAM_MINI_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants()}
          >
            Open in Telegram
          </a>
        ) : (
          <Button onClick={reset}>Try again</Button>
        )
      }
    >
      {isLaunchParamsError
        ? "Bitcoin Deepa only works inside the Telegram app. Open the bot in Telegram to continue."
        : "An unexpected error occurred. Please try again."}
    </StatusScreen>
  );
}
