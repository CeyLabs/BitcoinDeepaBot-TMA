"use client";

import { Card, Avatar } from "@telegram-apps/telegram-ui";

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
      className="relative overflow-hidden rounded-[20px]! p-0! shadow-none!"
      style={{ "--tgui--tertiary_bg_color": "transparent" } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF9900] via-[#FA7119] to-[#F13131]" />

      <div className="relative flex flex-col gap-3 p-4">
        <p className="text-[16px] font-bold leading-5 text-white">
          Orange Pill your friends and get {rewardSats}sats
        </p>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <Avatar size={28} acronym="B" className="border-2 border-white/40" />
            <Avatar size={28} acronym="D" className="border-2 border-white/40" />
          </div>

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
