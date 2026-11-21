"use client";

import { useId, useSyncExternalStore } from "react";
import Image from "next/image";
import { Download, Plus } from "lucide-react";
import { cn } from "cn";

// iPadOS reports itself as a Mac; touch points tell them apart.
const isApple = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1);

const noop = () => () => {};

/** Home-screen icon shape where we are: iOS squircle, else Android's circle. */
function useIconShape(): "squircle" | "circle" {
  return useSyncExternalStore(
    noop,
    () => (isApple() ? "squircle" : "circle"),
    () => "squircle"
  );
}

/** Rounded square close to the iOS app icon mask (22.37% corner radius). */
const SQUIRCLE = "rounded-[22.37%]";

/**
 * Telegram's app icon (blue gradient, white paper plane) in the shape of the
 * home screen it'd be on: a rounded square on iPhone/iPad, a circle on
 * Android and computers.
 */
export function TelegramAppIcon({ size = 40, className }: { size?: number; className?: string }) {
  const shape = useIconShape();
  const id = `tg${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      aria-hidden
      className={cn(
        "shrink-0 shadow-[0_2px_8px_rgb(34_158_217/0.35)]",
        shape === "squircle" ? SQUIRCLE : "rounded-full",
        className
      )}
    >
      <defs>
        <linearGradient id={id} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#2AABEE" />
          <stop offset="1" stopColor="#229ED9" />
        </linearGradient>
      </defs>
      <rect width="240" height="240" fill={`url(#${id})`} />
      <path
        fill="#fff"
        d="M54.3 118.8c35-15.2 58.3-25.3 70-30.2 33.3-13.9 40.3-16.3 44.8-16.4 1 0 3.2.2 4.7 1.4 1.2 1 1.5 2.3 1.7 3.3s.4 3.1.2 4.7c-1.8 19-9.6 65.1-13.6 86.3-1.7 9-5 12-8.2 12.3-7 .6-12.3-4.6-19-9-10.6-6.9-16.5-11.2-26.8-18-11.9-7.8-4.2-12.1 2.6-19.1 1.8-1.8 32.5-29.8 33.1-32.3.1-.3.1-1.5-.6-2.1-.7-.6-1.7-.4-2.5-.2-1.1.2-17.9 11.4-50.6 33.5-4.8 3.3-9.1 4.9-13 4.8-4.3-.1-12.5-2.4-18.7-4.4-7.5-2.4-13.5-3.7-13-7.9.3-2.2 3.3-4.4 8.9-6.7z"
      />
    </svg>
  );
}

/**
 * Our own app icon as it will sit on the home screen, with a small badge for
 * how it gets there: a download arrow (install dialog) or a plus (iOS Add to
 * Home Screen).
 */
export function InstallAppIcon({
  size = 40,
  badge,
  className,
}: {
  size?: number;
  badge: "download" | "add";
  className?: string;
}) {
  const shape = useIconShape();
  const BadgeIcon = badge === "add" ? Plus : Download;
  return (
    <span className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <Image
        src="/icons/icon-192.png"
        alt=""
        width={size}
        height={size}
        className={cn(
          "size-full bg-white object-cover shadow-[0_2px_8px_rgb(248_147_26/0.3)] ring-1 ring-black/5",
          shape === "squircle" ? SQUIRCLE : "rounded-full"
        )}
      />
      <span className="bg-primary text-primary-foreground ring-card absolute -right-1 -bottom-1 flex size-[18px] items-center justify-center rounded-full ring-2">
        <BadgeIcon size={11} strokeWidth={3} aria-hidden />
      </span>
    </span>
  );
}
