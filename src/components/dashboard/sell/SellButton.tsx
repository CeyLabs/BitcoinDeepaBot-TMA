"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { haptic } from "@/platform";

/** "Sell" pill on the wallet's total value card. */
export function SellButton() {
  return (
    <Link
      href="/dashboard/sell"
      onClick={() => haptic.impact("light")}
      className="flex items-center gap-1 rounded-full border border-white/80 bg-white/10 py-1 pr-2.5 pl-3 text-[13px] leading-4 font-semibold text-white backdrop-blur-sm"
    >
      Sell
      <ArrowUpRight size={14} strokeWidth={2.25} />
    </Link>
  );
}
