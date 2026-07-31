"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Title } from "@telegram-apps/telegram-ui";
import { TELEGRAM_BOT_URL } from "@/lib/constants";

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center dark:bg-[#1b2027]">
      <Image
        src="/emoji/animated/exclamation-mark.webp"
        alt="Warning"
        width={96}
        height={96}
        unoptimized
      />

      <Title level="2" weight="2" className="mt-3 max-w-sm leading-snug">
        {isLaunchParamsError ? "Open This In Telegram" : "Something Went Wrong"}
      </Title>

      <p className="text-muted-foreground mt-2 max-w-sm text-[15px] dark:text-[#64748b]">
        {isLaunchParamsError
          ? "Bitcoin Deepa only works inside the Telegram app. Open the bot in Telegram to continue."
          : "An unexpected error occurred. Please try again."}
      </p>

      {isLaunchParamsError ? (
        <Link href={TELEGRAM_BOT_URL} className="mt-8 block w-full max-w-xs">
          <Button mode="filled" size="l" stretched style={{ borderRadius: "12px" }}>
            Open in Telegram
          </Button>
        </Link>
      ) : (
        <Button
          mode="filled"
          size="l"
          stretched
          style={{ borderRadius: "12px" }}
          onClick={reset}
          className="mt-8 w-full max-w-xs"
        >
          Try Again
        </Button>
      )}
    </main>
  );
}
