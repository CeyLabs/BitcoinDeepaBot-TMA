"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Emoji } from "@/components/ui/emoji";
import { haptic } from "@/platform";

export function KycRequiredNotice({
  message = "Complete identity verification to view and manage plans.",
}: {
  message?: string;
}) {
  const router = useRouter();

  return (
    <Card className="flex flex-col items-center gap-2 rounded-2xl px-4 py-6 text-center">
      <Emoji src="/emoji/animated/id-card.webp" size={64} className="animate-float" />
      <h3 className="text-[18px]">Verification required</h3>
      <p className="text-ink3 max-w-[290px] text-[14px]">{message}</p>
      <Button
        size="default"
        className="mt-2 w-full"
        onClick={() => {
          haptic.impact("medium");
          router.push("/verification");
        }}
      >
        Complete verification
      </Button>
    </Card>
  );
}
