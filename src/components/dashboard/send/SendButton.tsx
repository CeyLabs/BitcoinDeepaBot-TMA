"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { haptic } from "@/platform";

/** "Send" pill on the wallet's total value card. */
export function SendButton() {
  return (
    <Link
      href="/dashboard/send"
      onClick={() => haptic.impact("light")}
      className="flex items-center gap-1 rounded-full border border-white/80 bg-white/10 py-1 pr-2.5 pl-3 text-[13px] leading-4 font-semibold text-white backdrop-blur-sm"
    >
      Send
      <Send size={13} strokeWidth={2.25} />
    </Link>
  );
}
