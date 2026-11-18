"use client";

import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { LogOut } from "lucide-react";
import { VisibleToggle } from "@/components/ui/visible-toggle";
import { useUser } from "@/hooks/useUser";
import { useBalanceVisible } from "@/hooks/useBalanceVisible";
import { useSession } from "@/hooks/useSession";
import { InstallButton } from "@/pwa";
import { haptic, usePlatform } from "@/platform";

export function DashboardTopBar() {
  const { logout } = useSession();
  const { initials, displayName, photoUrl } = useUser();
  const { visible: balanceVisible, toggle: toggleBalanceVisible } = useBalanceVisible();
  const { kind } = usePlatform();

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar src={photoUrl} acronym={initials} size={40} className="bg-[#ffb14c] text-white" />
        <p className="truncate text-[14px] leading-5 font-semibold text-[#475569] capitalize dark:text-[#94a3b8]">
          {displayName}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <InstallButton variant="icon" />
        {kind === "web" && (
          <IconButton
            className="bg-card"
            onClick={() => {
              haptic.impact("medium");
              logout();
            }}
          >
            <LogOut size={18} strokeWidth={1.75} className="text-[#111821] dark:text-[#f1f5f9]" />
          </IconButton>
        )}
        <VisibleToggle
          visible={balanceVisible}
          onToggle={toggleBalanceVisible}
          className="bg-card"
        />
      </div>
    </div>
  );
}
