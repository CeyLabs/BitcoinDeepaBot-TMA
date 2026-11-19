"use client";

import { useRouter } from "next/navigation";
import { PushHeader } from "@/components/ui/back-button";

/** "‹ Back · News" header for the pushed news pages; also drives Telegram's native back. */
export function NewsHeader({ backTo }: { backTo: string }) {
  const router = useRouter();
  return <PushHeader title="News" onBack={() => router.push(backTo)} />;
}
