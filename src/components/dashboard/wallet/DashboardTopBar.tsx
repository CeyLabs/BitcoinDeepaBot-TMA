"use client";

import { useRouter } from "next/navigation";
import { Avatar, IconButton } from "@telegram-apps/telegram-ui";
import { LogOut } from "lucide-react";
import { VisibleToggle } from "@/components/ui/visible-toggle";
import { useUser } from "@/hooks/useUser";
import { useStore } from "@/lib/store";
import { useIsTelegramEnv } from "@/hooks/useIsTelegramEnv";
import { clearAuthFromStorage } from "@/lib/auth";
import { haptic } from "@/lib/haptics";

export function DashboardTopBar() {
  const router = useRouter();
  const { initials, displayName, photoUrl } = useUser();
  const { balanceVisible, toggleBalanceVisible } = useStore();
  const isTelegramEnv = useIsTelegramEnv();

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar
          src={photoUrl}
          acronym={initials}
          size={40}
          className="shrink-0! bg-[#ffb14c]! text-white!"
        />
        <p className="truncate text-[14px] leading-5 font-semibold text-[#475569] capitalize dark:text-[#94a3b8]">
          {displayName}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isTelegramEnv === false && (
          <IconButton
            mode="gray"
            size="m"
            className="bg-surface-primary!"
            onClick={() => {
              haptic.impact("medium");
              clearAuthFromStorage();
              router.replace("/");
            }}
          >
            <LogOut size={18} strokeWidth={1.75} className="text-[#111821] dark:text-[#f1f5f9]" />
          </IconButton>
        )}
        <VisibleToggle
          visible={balanceVisible}
          onToggle={toggleBalanceVisible}
          className="bg-surface-primary!"
        />
      </div>
    </div>
  );
}
