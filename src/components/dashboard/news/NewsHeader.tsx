"use client";

import { useRouter } from "next/navigation";
import { useBackButton } from "@/platform";

/**
 * Back from an article: Telegram's native back button only. The web shows no
 * header here; the bottom nav (News tab) is the way back.
 */
export function NewsBack({ backTo }: { backTo: string }) {
  const router = useRouter();
  useBackButton(() => router.push(backTo));
  return null;
}
