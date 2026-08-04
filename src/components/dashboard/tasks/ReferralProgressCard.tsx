"use client";

import { Card, Avatar, AvatarStack } from "@telegram-apps/telegram-ui";
import Image from "next/image";
import { useTMA } from "@/lib/hooks";
import { useStore } from "@/lib/store";

export interface ReferralProgressCardProps {
  joined: number;
  target: number;
  rewardSats: number;
}

export function ReferralProgressCard({ joined, target, rewardSats }: ReferralProgressCardProps) {
  const progress = target > 0 ? Math.min(joined / target, 1) : 0;
  const { openTelegramLink } = useTMA();
  const { userID } = useStore();

  const handleShare = () => {
    const shareText = encodeURIComponent(
      "­­­­­­­­­­­\n🚀 Here's a link to get some Free Satoshis, the bitcoin wallet I was telling you about!"
    );
    openTelegramLink(
      `https://t.me/share/url?url=https://t.me/bitcoindeepabot/private_invite%3Fstartapp%3D${userID}&text=${shareText}`
    );
  };

  return (
    <Card
      type="plain"
      onClick={handleShare}
      className="relative hidden w-full cursor-pointer overflow-hidden rounded-full! p-0! shadow-none!"
      style={{ "--tgui--tertiary_bg_color": "transparent" } as React.CSSProperties}
    >
      <Image src="/bg/pill.webp" alt="" fill className="object-cover" />

      <div className="relative flex flex-col gap-1 p-2">
        <p className="mx-auto max-w-60 text-center text-lg leading-5 font-bold text-white">
          Orange Pill your friends and get {rewardSats} sats
        </p>

        <div className="flex items-center gap-3 px-5">
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

          <p className="text-[13px] font-medium whitespace-nowrap text-white">
            {joined}/{target} joined
          </p>
        </div>
      </div>
    </Card>
  );
}
