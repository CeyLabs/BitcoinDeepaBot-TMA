"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { VisibleToggle } from "@/components/ui/visible-toggle";
import { useUser } from "@/hooks/useUser";
import { useBalanceVisible } from "@/hooks/useBalanceVisible";
import { InstallButton } from "@/pwa";
import { haptic } from "@/platform";

export function DashboardTopBar() {
  const { initials, displayName, photoUrl } = useUser();
  const { visible: balanceVisible, toggle: toggleBalanceVisible } = useBalanceVisible();

  return (
    <div className="flex w-full items-center justify-between">
      {/* Profile: details, KYC, bank account (and log out on web). */}
      <Link
        href="/dashboard/profile"
        aria-label="Open profile"
        onClick={() => haptic.impact("light")}
        className="flex min-w-0 items-center gap-2"
      >
        <Avatar src={photoUrl} acronym={initials} size={40} className="bg-[#ffb14c] text-white" />
        <p className="truncate text-[14px] leading-5 font-semibold text-[#475569] capitalize dark:text-[#94a3b8]">
          {displayName}
        </p>
        <ChevronRight size={16} className="shrink-0 text-[#94a3b8]" />
      </Link>
      <div className="flex items-center gap-2">
        <InstallButton variant="icon" />
        <VisibleToggle
          visible={balanceVisible}
          onToggle={toggleBalanceVisible}
          className="bg-card"
        />
      </div>
    </div>
  );
}
