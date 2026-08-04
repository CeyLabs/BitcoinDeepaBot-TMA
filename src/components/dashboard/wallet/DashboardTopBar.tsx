"use client";

import { Avatar } from "@telegram-apps/telegram-ui";
import { VisibleToggle } from "@/components/ui/visible-toggle";
import { useUser } from "@/hooks/useUser";
import { useStore } from "@/lib/store";

export function DashboardTopBar() {
  const { initials, displayName, photoUrl } = useUser();
  const { balanceVisible, toggleBalanceVisible } = useStore();

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
      <VisibleToggle
        visible={balanceVisible}
        onToggle={toggleBalanceVisible}
        className="bg-surface-primary!"
      />
    </div>
  );
}
