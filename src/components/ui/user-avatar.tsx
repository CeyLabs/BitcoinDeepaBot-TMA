"use client";

/* eslint-disable @next/next/no-img-element -- an inline SVG data URI; next/image adds nothing */

import { cn } from "cn";
import { avatarUri, type AvatarMotion } from "@/lib/avatar";

/**
 * A DiceBear Sprouts avatar from a seed, on a theme circle (black on light,
 * cream on dark). With no seed yet (the session is still loading) it shows the
 * empty circle, so server and client agree.
 */
export function UserAvatar({
  seed,
  size = 44,
  motion,
  className,
}: {
  seed: string | null | undefined;
  size?: number;
  motion?: AvatarMotion;
  className?: string;
}) {
  const src = seed ? avatarUri(seed, motion) : null;
  return (
    <span
      aria-hidden
      className={cn(
        "bg-avatar block shrink-0 overflow-hidden rounded-full shadow-[0_0_0_1px_var(--border)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      {src && <img src={src} alt="" width={size} height={size} className="block size-full" />}
    </span>
  );
}
