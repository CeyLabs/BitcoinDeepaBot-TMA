"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PushHeader } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Emoji } from "@/components/ui/emoji";
import { useSheets } from "@/components/dashboard/sheets";
import { haptic } from "@/platform";

/** /dashboard/send opens the Send sheet (deep links). */
export default function SendPage() {
  const router = useRouter();
  const { openSend } = useSheets();

  // Arriving here means "I want to send": open the sheet once
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    openSend();
  }, [openSend]);

  return (
    <div className="flex flex-col gap-5">
      <PushHeader title="Send sats" onBack={() => router.push("/dashboard")} />
      <Card className="flex flex-col items-center gap-2 px-5 py-6 text-center">
        <Emoji src="/emoji/sent.webp" size={72} priority />
        <h2 className="text-[22px] leading-7">Send sats</h2>
        <p className="text-ink2 text-[14px] leading-5">
          Send sats from your wallet to another Bitcoin Deepa user by their @username or Telegram
          ID.
        </p>
        <Button
          className="mt-2"
          onClick={() => {
            haptic.impact("light");
            openSend();
          }}
        >
          Send sats
        </Button>
      </Card>
    </div>
  );
}
