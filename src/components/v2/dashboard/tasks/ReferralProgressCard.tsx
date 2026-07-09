"use client";

import { Card, Avatar, AvatarStack } from "@telegram-apps/telegram-ui";
import Image from "next/image";

export interface ReferralProgressCardProps {
  joined: number;
  target: number;
  rewardSats: number;
}

export function ReferralProgressCard({ joined, target, rewardSats }: ReferralProgressCardProps) {
  const progress = target > 0 ? Math.min(joined / target, 1) : 0;

  return (
    <Card
      type="plain"
      className="relative overflow-hidden rounded-full! p-0! shadow-none!"
      style={{ "--tgui--tertiary_bg_color": "transparent" } as React.CSSProperties}
    >
      <Image src="/bg/pill.webp" alt="" fill className="object-cover" />

      <div className="relative flex flex-col gap-3 p-4">
        <p className="max-w-15 text-[16px] font-bold leading-5 text-white">
          Orange Pill your friends and get {rewardSats}sats
        </p>

        <div className="flex items-center gap-3">
          <AvatarStack style={{ "--tgui--bg_color": "transparent" } as React.CSSProperties}>
            <Avatar size={28} src="/avatar/boy.png" />
            <Avatar size={28} src="/avatar/girl.png" />
          </AvatarStack>

          <div className="flex flex-1 flex-col gap-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          <p className="whitespace-nowrap text-[13px] font-medium text-white">
            {joined}/{target} joined
          </p>
        </div>
      </div>
    </Card>
  );
}
