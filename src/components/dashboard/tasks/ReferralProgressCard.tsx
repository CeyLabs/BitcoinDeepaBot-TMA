"use client";

import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import { haptic, usePlatform } from "@/platform";
import { useUser } from "@/hooks/useUser";
import { getInviteUrl } from "@/lib/constants";

/**
 * "Orange pill your friends" invite pill. Sharing the invite link is real;
 * referral counts and rewards aren't tracked yet, so no progress is shown.
 */
export function ReferralProgressCard() {
  const platform = usePlatform();
  const toast = useToast();
  const { id: userId } = useUser();

  const handleShare = () => {
    haptic.impact("medium");
    platform
      .share({
        url: getInviteUrl(userId),
        text: "🚀 Here's a link to get some Free Satoshis, the bitcoin wallet I was telling you about!",
      })
      .then((result) => {
        if (result === "copied") toast({ type: "success", title: "Invite link copied" });
      })
      .catch((error) => console.error("Failed to share invite:", error));
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="press bg-primary relative isolate flex w-full flex-col items-center gap-2.5 overflow-hidden rounded-full border-0 px-[50px] py-2.5 text-center text-white"
    >
      <Image
        src="/bg/invite.webp"
        alt=""
        fill
        sizes="(max-width: 448px) 100vw, 448px"
        className="-z-10 object-cover"
      />
      <span className="text-[16px] leading-4 font-semibold">
        <span className="block">Orange pill your friends</span>
        <span className="block">Share your invite link</span>
      </span>
      <span className="flex items-center gap-2.5">
        <span className="flex shrink-0">
          <Image
            src="/avatar/friend-1.webp"
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-full object-cover"
          />
          <Image
            src="/avatar/friend-2.webp"
            alt=""
            width={32}
            height={32}
            className="-ml-4 size-8 rounded-full object-cover"
          />
        </span>
        <span className="text-[12px] leading-4">Referral rewards coming soon</span>
      </span>
    </button>
  );
}
